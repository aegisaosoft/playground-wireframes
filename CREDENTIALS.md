# Database & Application Credentials

## 🗄️ PostgreSQL Database

### Database Connection
```
Host: localhost
Port: 5432
Database: experiences_platform
```

### Database Admin User
```
Username: playground_admin
Password: Kis@1963
```

**Connection String for .NET:**
```
Host=localhost;Port=5432;Database=experiences_platform;Username=playground_admin;Password=Kis@1963
```

---

## 👤 Application Admin User

### Initial Admin Login
```
Email: joannaorlova@gmail.com
Password: Ohana1994
Role: admin
Status: Email verified, Active
```

**Features:**
- ✅ Full admin access
- ✅ Email verified
- ✅ Can manage all experiences
- ✅ Can manage all users
- ✅ Can approve applications

---

## 🔐 Security Notes

### ⚠️ IMPORTANT - For Development Only

These credentials are for **development and testing only**. 

**Before going to production:**

1. **Change the database user password:**
```sql
ALTER USER playground_admin WITH PASSWORD 'your_new_secure_password';
```

2. **Change the admin user password:**
```sql
UPDATE users 
SET password_hash = crypt('new_secure_password', gen_salt('bf', 10))
WHERE email = 'joannaorlova@gmail.com';
```

3. **Update your .NET appsettings.json** with the new credentials

4. **Use environment variables** instead of hardcoded credentials:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=${DB_HOST};Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}"
  }
}
```

---

## 📝 Credential Management Best Practices

### For Production:

1. **Use Azure Key Vault / AWS Secrets Manager**
2. **Enable SSL/TLS for database connections**
3. **Use strong, randomly generated passwords**
4. **Enable PostgreSQL SSL mode:** `sslmode=require`
5. **Restrict database user to specific IP addresses**
6. **Enable audit logging**
7. **Rotate passwords regularly**

### Example Production Connection String:
```
Host=your-db.postgres.database.azure.com;Database=experiences_platform;Username=playground_admin@your-db;Password=<strong-password>;SSL Mode=Require
```

---

## 🧪 Testing Accounts

You can create additional test users through the application or SQL:

```sql
-- Create a test host user
INSERT INTO users (email, password_hash, name, role, is_email_verified) 
VALUES (
    'testhost@example.com',
    crypt('TestPass123', gen_salt('bf', 10)),
    'Test Host',
    'host',
    true
);

-- Create a test regular user
INSERT INTO users (email, password_hash, name, role, is_email_verified) 
VALUES (
    'testuser@example.com',
    crypt('TestPass123', gen_salt('bf', 10)),
    'Test User',
    'user',
    true
);
```

---

**Keep this file secure and never commit it to public repositories!**

Add to `.gitignore`:
```
CREDENTIALS.md
.env
*.env
appsettings.Development.json
```

