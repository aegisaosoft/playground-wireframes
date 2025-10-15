# PostgreSQL Database Setup Guide

## 📦 Database Schema Overview

The database schema supports a complete experiences/retreats platform with:
- ✅ User authentication & profiles
- ✅ Experiences/retreats management
- ✅ Ticket tiers & pricing
- ✅ Applications & purchases
- ✅ Reviews & ratings
- ✅ Favorites & following
- ✅ Stripe payment integration
- ✅ Full-text search
- ✅ Categories & tags

## 🚀 Quick Setup

### Option A: Fresh Installation

```bash
# Create database
createdb -U postgres experiences_platform

# Run schema
psql -U postgres -d experiences_platform -f database_schema.sql
```

### Option B: Reset Existing Database

If the database already exists and you want to start fresh:

```bash
# Drop and recreate database (WARNING: Deletes all data!)
psql -U postgres -d postgres -f reset_database.sql

# Then run schema
psql -U postgres -d experiences_platform -f database_schema.sql
```

### Option C: Manual Steps

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE experiences_platform;

# Connect to the database
\c experiences_platform

# Run schema
\i database_schema.sql
```

### Step 3: Verify Installation

```sql
-- List all tables
\dt

-- Check categories
SELECT * FROM categories;

-- Verify table counts
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY tablename;
```

## 📊 Database Tables

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User authentication (email, password, role) |
| `user_profiles` | Extended user info (bio, images, social, Stripe) |
| `experiences` | Main experiences/retreats data |
| `ticket_tiers` | Pricing tiers for experiences |
| `applications` | User applications (for approval-required events) |
| `ticket_purchases` | Completed purchases & payments |
| `categories` | Experience categories (Tech, Wellness, etc.) |
| `tags` | Flexible tagging system |
| `reviews` | User reviews & ratings |
| `favorites` | Saved/favorited experiences |
| `follows` | User following hosts |

### Junction Tables

| Table | Description |
|-------|-------------|
| `experience_tags` | Many-to-many: experiences ↔ tags |
| `experience_images` | Additional images for experiences |

## 🔧 Connection String for .NET

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=experiences_platform;Username=playground_admin;Password=Kis@1963"
  }
}
```

**Note:** The database user `playground_admin` has full privileges on the database.

### Install NuGet Package

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

### Program.cs Setup

```csharp
using Npgsql;
using Microsoft.EntityFrameworkCore;

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

## 📝 Common Queries

### 1. Get All Published Experiences

```sql
SELECT 
    e.id,
    e.title,
    e.slug,
    e.description,
    e.location,
    e.start_date,
    e.end_date,
    e.featured_image_url,
    e.base_price_cents,
    u.name as host_name,
    c.name as category_name,
    c.color as category_color,
    (e.total_capacity - e.spots_taken) as spots_available
FROM experiences e
JOIN users u ON e.host_id = u.id
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.status = 'published'
  AND e.start_date >= CURRENT_DATE
ORDER BY e.start_date ASC;
```

### 2. Search Experiences

```sql
SELECT 
    e.id,
    e.title,
    e.location,
    e.start_date,
    ts_rank(e.search_vector, plainto_tsquery('english', 'yoga wellness')) as rank
FROM experiences e
WHERE e.search_vector @@ plainto_tsquery('english', 'yoga wellness')
  AND e.status = 'published'
ORDER BY rank DESC
LIMIT 20;
```

### 3. Get Experience with Details

```sql
SELECT 
    e.*,
    u.name as host_name,
    u.email as host_email,
    up.bio as host_bio,
    up.profile_image_url as host_image,
    c.name as category_name,
    ARRAY_AGG(DISTINCT t.name) as tags,
    COUNT(DISTINCT r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as average_rating
FROM experiences e
JOIN users u ON e.host_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN experience_tags et ON e.id = et.experience_id
LEFT JOIN tags t ON et.tag_id = t.id
LEFT JOIN reviews r ON e.id = r.experience_id
WHERE e.slug = 'bali-wellness-retreat-2024'
GROUP BY e.id, u.id, up.id, c.id;
```

### 4. Get Ticket Tiers for Experience

```sql
SELECT 
    id,
    name,
    description,
    price_cents,
    capacity,
    spots_taken,
    (capacity - spots_taken) as spots_available,
    benefits,
    is_popular
FROM ticket_tiers
WHERE experience_id = '22222222-2222-2222-2222-222222222222'
  AND is_available = true
ORDER BY price_cents ASC;
```

### 5. Get User's Purchases

```sql
SELECT 
    tp.id,
    e.title as experience_title,
    e.start_date,
    e.location,
    tt.name as tier_name,
    tp.amount_cents,
    tp.payment_status,
    tp.attendance_status,
    tp.purchased_at
FROM ticket_purchases tp
JOIN experiences e ON tp.experience_id = e.id
JOIN ticket_tiers tt ON tp.ticket_tier_id = tt.id
WHERE tp.user_id = 'user-id-here'
ORDER BY tp.purchased_at DESC;
```

### 6. Get Host's Experiences with Stats

```sql
SELECT 
    e.id,
    e.title,
    e.status,
    e.start_date,
    e.total_capacity,
    e.spots_taken,
    COUNT(DISTINCT a.id) as application_count,
    COUNT(DISTINCT tp.id) as purchase_count,
    SUM(tp.amount_cents) FILTER (WHERE tp.payment_status = 'succeeded') as total_revenue
FROM experiences e
LEFT JOIN applications a ON e.id = a.experience_id
LEFT JOIN ticket_purchases tp ON e.id = tp.experience_id
WHERE e.host_id = 'host-id-here'
GROUP BY e.id
ORDER BY e.start_date DESC;
```

## 🔐 Security Best Practices

### 1. Application User Already Created

The database schema automatically creates a user named `playground_admin` with full privileges:

```sql
-- User credentials (already created by schema)
Username: playground_admin
Password: Kis@1963

-- This user has:
✅ Full access to all tables
✅ Full access to all sequences
✅ Permission to create new tables
✅ Permission to modify data
```

**For production:** Change the password after initial setup:
```sql
ALTER USER playground_admin WITH PASSWORD 'your_new_secure_password';
```

### 2. Row-Level Security (Optional)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY user_profile_select ON user_profiles
    FOR SELECT
    USING (user_id = current_setting('app.user_id')::uuid);

-- Policy: Users can only update their own profile
CREATE POLICY user_profile_update ON user_profiles
    FOR UPDATE
    USING (user_id = current_setting('app.user_id')::uuid);
```

## 🎯 .NET Entity Framework Models

### Example Entity Models

```csharp
public class Experience
{
    public Guid Id { get; set; }
    public Guid HostId { get; set; }
    public Guid? CategoryId { get; set; }
    
    public string Title { get; set; }
    public string Slug { get; set; }
    public string Description { get; set; }
    public string ShortDescription { get; set; }
    
    public string Location { get; set; }
    public string Country { get; set; }
    public string City { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public string FeaturedImageUrl { get; set; }
    public int? BasePriceCents { get; set; }
    public string Currency { get; set; } = "USD";
    
    public int TotalCapacity { get; set; }
    public int SpotsTaken { get; set; }
    
    public string Status { get; set; } = "draft";
    public bool IsFeatured { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public User Host { get; set; }
    public Category Category { get; set; }
    public ICollection<TicketTier> TicketTiers { get; set; }
    public ICollection<Application> Applications { get; set; }
    public ICollection<ExperienceTag> ExperienceTags { get; set; }
}

public class TicketTier
{
    public Guid Id { get; set; }
    public Guid ExperienceId { get; set; }
    
    public string Name { get; set; }
    public string Description { get; set; }
    public int PriceCents { get; set; }
    public string Currency { get; set; } = "USD";
    
    public int Capacity { get; set; }
    public int SpotsTaken { get; set; }
    
    public string[] Benefits { get; set; }
    public bool IsPopular { get; set; }
    public bool IsAvailable { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public Experience Experience { get; set; }
}
```

### ApplicationDbContext

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Experience> Experiences { get; set; }
    public DbSet<TicketTier> TicketTiers { get; set; }
    public DbSet<Application> Applications { get; set; }
    public DbSet<TicketPurchase> TicketPurchases { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Tag> Tags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Experience>()
            .HasOne(e => e.Host)
            .WithMany()
            .HasForeignKey(e => e.HostId);

        modelBuilder.Entity<Experience>()
            .HasOne(e => e.Category)
            .WithMany()
            .HasForeignKey(e => e.CategoryId);

        // Configure array types for PostgreSQL
        modelBuilder.Entity<TicketTier>()
            .Property(t => t.Benefits)
            .HasColumnType("text[]");
    }
}
```

## 📈 Performance Optimization

### Indexes

The schema includes indexes for:
- ✅ Foreign keys
- ✅ Common search fields (email, slug, status)
- ✅ Date ranges
- ✅ Full-text search
- ✅ Composite queries

### Monitoring

```sql
-- Find slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔄 Migrations

### Backup

```bash
# Backup entire database
pg_dump -U postgres experiences_platform > backup.sql

# Backup schema only
pg_dump -U postgres -s experiences_platform > schema_only.sql

# Backup data only
pg_dump -U postgres -a experiences_platform > data_only.sql
```

### Restore

```bash
psql -U postgres experiences_platform < backup.sql
```

## 🧪 Initial Data

The schema includes:
- **6 default categories** (Tech, Wellness, Business, Adventure, Culinary, Creative)
- **1 admin user** for initial access

### Initial Admin User

```
Email: joannaorlova@gmail.com
Password: Ohana1994
Role: admin
Status: Email verified, Active
```

**Important:** Change this password immediately after first login for security!

```sql
-- To change the admin password:
UPDATE users 
SET password_hash = crypt('new_secure_password', gen_salt('bf', 10))
WHERE email = 'joannaorlova@gmail.com';
```

This gives you a ready-to-use admin account to set up the platform!

## 📚 Additional Features

### Full-Text Search
- Uses PostgreSQL's `tsvector` for efficient search
- Automatically updates search index on insert/update
- Weighted search (title > description > location)

### Triggers
- Auto-update `updated_at` timestamps
- Auto-update spot counts on purchases
- Auto-update tag usage counts

### Views
- `experiences_with_host` - Experiences with host details
- `experiences_with_stats` - Experiences with aggregated stats

### Constraints
- Email uniqueness
- Slug uniqueness
- Spot capacity checks
- Valid enum values
- Self-referential follow prevention

---

**Your database is ready!** Next step: Connect it to your .NET API and start building! 🚀

