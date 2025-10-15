--
--
-- Copyright (c) 2025 Alexander Orlov.
-- 34 Middletown Ave Atlantic Highlands NJ 07716
-- 
-- THIS SOFTWARE IS THE CONFIDENTIAL AND PROPRIETARY INFORMATION OF
-- Alexander Orlov. ("CONFIDENTIAL INFORMATION"). YOU SHALL NOT DISCLOSE
-- SUCH CONFIDENTIAL INFORMATION AND SHALL USE IT ONLY IN ACCORDANCE
-- WITH THE TERMS OF THE LICENSE AGREEMENT YOU ENTERED INTO WITH
-- Alexander Orlov.
-- 
--  Author: Alexander Orlov
-- 
-- 

-- =====================================================
-- USEFUL SQL QUERIES FOR EXPERIENCES PLATFORM
-- =====================================================

-- =====================================================
-- 1. EXPERIENCE QUERIES
-- =====================================================

-- Get all published experiences with full details
SELECT 
    e.id,
    e.title,
    e.slug,
    e.description,
    e.location,
    e.city,
    e.country,
    e.start_date,
    e.end_date,
    e.featured_image_url,
    e.base_price_cents,
    e.total_capacity,
    e.spots_taken,
    (e.total_capacity - e.spots_taken) as spots_available,
    u.name as host_name,
    u.id as host_id,
    c.name as category,
    c.color as category_color,
    ARRAY_AGG(DISTINCT t.name) as tags
FROM experiences e
JOIN users u ON e.host_id = u.id
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN experience_tags et ON e.id = et.experience_id
LEFT JOIN tags t ON et.tag_id = t.id
WHERE e.status = 'published'
  AND e.start_date >= CURRENT_DATE
GROUP BY e.id, u.id, u.name, c.name, c.color
ORDER BY e.start_date ASC;

-- Search experiences by keyword (full-text search)
SELECT 
    e.id,
    e.title,
    e.location,
    e.start_date,
    e.base_price_cents,
    ts_rank(e.search_vector, plainto_tsquery('english', 'yoga')) as relevance
FROM experiences e
WHERE e.search_vector @@ plainto_tsquery('english', 'yoga')
  AND e.status = 'published'
ORDER BY relevance DESC, e.start_date ASC
LIMIT 20;

-- Get experience by slug with all details
SELECT 
    e.*,
    u.name as host_name,
    u.email as host_email,
    up.bio as host_bio,
    up.profile_image_url as host_image,
    up.website as host_website,
    up.instagram as host_instagram,
    c.name as category_name,
    c.slug as category_slug,
    COUNT(DISTINCT r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(DISTINCT f.user_id) as favorite_count
FROM experiences e
JOIN users u ON e.host_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN reviews r ON e.id = r.experience_id
LEFT JOIN favorites f ON e.id = f.experience_id
WHERE e.slug = 'your-experience-slug'
GROUP BY e.id, u.id, up.id, c.id;

-- Get featured experiences
SELECT 
    e.id,
    e.title,
    e.location,
    e.start_date,
    e.featured_image_url,
    u.name as host_name
FROM experiences e
JOIN users u ON e.host_id = u.id
WHERE e.is_featured = true
  AND e.status = 'published'
  AND e.start_date >= CURRENT_DATE
ORDER BY e.start_date ASC
LIMIT 6;

-- Get experiences by category
SELECT 
    e.id,
    e.title,
    e.location,
    e.start_date,
    e.base_price_cents
FROM experiences e
JOIN categories c ON e.category_id = c.id
WHERE c.slug = 'wellness'
  AND e.status = 'published'
  AND e.start_date >= CURRENT_DATE
ORDER BY e.start_date ASC;

-- =====================================================
-- 2. TICKET TIER QUERIES
-- =====================================================

-- Get ticket tiers for an experience
SELECT 
    id,
    name,
    description,
    price_cents,
    capacity,
    spots_taken,
    (capacity - spots_taken) as spots_available,
    benefits,
    is_popular,
    is_available
FROM ticket_tiers
WHERE experience_id = 'experience-uuid-here'
  AND is_available = true
ORDER BY price_cents ASC;

-- Check ticket availability
SELECT 
    tt.id,
    tt.name,
    tt.capacity,
    tt.spots_taken,
    CASE 
        WHEN tt.spots_taken >= tt.capacity THEN 'Sold Out'
        WHEN tt.spots_taken >= (tt.capacity * 0.9) THEN 'Almost Full'
        ELSE 'Available'
    END as availability_status
FROM ticket_tiers tt
WHERE tt.experience_id = 'experience-uuid-here';

-- =====================================================
-- 3. USER QUERIES
-- =====================================================

-- Get user with profile
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.created_at,
    up.bio,
    up.profile_image_url,
    up.location,
    up.website,
    up.instagram,
    up.twitter,
    up.linkedin,
    up.stripe_payouts_enabled
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'user@example.com';

-- Get host with stats
SELECT 
    u.id,
    u.name,
    up.bio,
    up.profile_image_url,
    COUNT(DISTINCT e.id) as experience_count,
    COUNT(DISTINCT tp.id) as total_bookings,
    COUNT(DISTINCT f.follower_id) as follower_count,
    COALESCE(AVG(r.rating), 0) as average_rating
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN experiences e ON u.id = e.host_id AND e.status = 'published'
LEFT JOIN ticket_purchases tp ON e.id = tp.experience_id
LEFT JOIN follows f ON u.id = f.following_id
LEFT JOIN reviews r ON e.id = r.experience_id
WHERE u.id = 'host-uuid-here'
GROUP BY u.id, up.id;

-- =====================================================
-- 4. PURCHASE & APPLICATION QUERIES
-- =====================================================

-- Get user's purchases
SELECT 
    tp.id,
    e.title,
    e.start_date,
    e.end_date,
    e.location,
    tt.name as tier_name,
    tp.amount_cents,
    tp.currency,
    tp.payment_status,
    tp.attendance_status,
    tp.purchased_at
FROM ticket_purchases tp
JOIN experiences e ON tp.experience_id = e.id
JOIN ticket_tiers tt ON tp.ticket_tier_id = tt.id
WHERE tp.user_id = 'user-uuid-here'
ORDER BY tp.purchased_at DESC;

-- Get host's revenue summary
SELECT 
    e.id,
    e.title,
    COUNT(tp.id) as purchase_count,
    SUM(tp.amount_cents) FILTER (WHERE tp.payment_status = 'succeeded') as total_revenue_cents,
    SUM(tp.amount_cents) FILTER (WHERE tp.payment_status = 'refunded') as refunded_amount_cents
FROM experiences e
LEFT JOIN ticket_purchases tp ON e.id = tp.experience_id
WHERE e.host_id = 'host-uuid-here'
GROUP BY e.id
ORDER BY total_revenue_cents DESC NULLS LAST;

-- Get applications for an experience
SELECT 
    a.id,
    u.name,
    u.email,
    a.status,
    a.applied_at,
    a.responses,
    tt.name as tier_name
FROM applications a
JOIN users u ON a.user_id = u.id
LEFT JOIN ticket_tiers tt ON a.ticket_tier_id = tt.id
WHERE a.experience_id = 'experience-uuid-here'
ORDER BY a.applied_at DESC;

-- =====================================================
-- 5. REVIEW QUERIES
-- =====================================================

-- Get reviews for an experience
SELECT 
    r.id,
    r.rating,
    r.title,
    r.comment,
    r.is_verified_attendee,
    r.created_at,
    u.name as reviewer_name,
    up.profile_image_url as reviewer_image
FROM reviews r
JOIN users u ON r.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE r.experience_id = 'experience-uuid-here'
  AND r.is_approved = true
ORDER BY r.created_at DESC;

-- Get rating distribution
SELECT 
    rating,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM reviews
WHERE experience_id = 'experience-uuid-here'
GROUP BY rating
ORDER BY rating DESC;

-- =====================================================
-- 6. ANALYTICS QUERIES
-- =====================================================

-- Dashboard stats for host
SELECT 
    COUNT(DISTINCT e.id) as total_experiences,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'published') as published_experiences,
    COUNT(DISTINCT tp.id) FILTER (WHERE tp.payment_status = 'succeeded') as total_bookings,
    SUM(tp.amount_cents) FILTER (WHERE tp.payment_status = 'succeeded') as total_revenue_cents,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'pending') as pending_applications,
    COUNT(DISTINCT f.follower_id) as follower_count
FROM users u
LEFT JOIN experiences e ON u.id = e.host_id
LEFT JOIN ticket_purchases tp ON e.id = tp.experience_id
LEFT JOIN applications a ON e.id = a.experience_id
LEFT JOIN follows f ON u.id = f.following_id
WHERE u.id = 'host-uuid-here';

-- Popular categories
SELECT 
    c.name,
    c.slug,
    COUNT(e.id) as experience_count,
    COUNT(DISTINCT tp.id) as total_bookings
FROM categories c
LEFT JOIN experiences e ON c.id = e.category_id AND e.status = 'published'
LEFT JOIN ticket_purchases tp ON e.id = tp.experience_id
GROUP BY c.id
ORDER BY experience_count DESC;

-- Trending experiences (most favorited recently)
SELECT 
    e.id,
    e.title,
    e.start_date,
    COUNT(f.user_id) as favorites_last_30_days
FROM experiences e
JOIN favorites f ON e.id = f.experience_id
WHERE f.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND e.status = 'published'
GROUP BY e.id
ORDER BY favorites_last_30_days DESC
LIMIT 10;

-- =====================================================
-- 7. ADMINISTRATIVE QUERIES
-- =====================================================

-- Get all users with role
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.created_at,
    COUNT(DISTINCT e.id) as hosted_experiences,
    COUNT(DISTINCT tp.id) as purchases
FROM users u
LEFT JOIN experiences e ON u.id = e.host_id
LEFT JOIN ticket_purchases tp ON u.id = tp.user_id
GROUP BY u.id
ORDER BY u.created_at DESC;

-- Pending applications requiring review
SELECT 
    a.id,
    e.title as experience_title,
    u.name as applicant_name,
    u.email as applicant_email,
    a.applied_at,
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - a.applied_at) as days_pending
FROM applications a
JOIN experiences e ON a.experience_id = e.id
JOIN users u ON a.user_id = u.id
WHERE a.status = 'pending'
ORDER BY a.applied_at ASC;

-- Experiences starting soon
SELECT 
    e.title,
    e.start_date,
    u.name as host_name,
    u.email as host_email,
    e.total_capacity,
    e.spots_taken,
    (e.total_capacity - e.spots_taken) as spots_remaining,
    EXTRACT(DAY FROM e.start_date - CURRENT_DATE) as days_until_start
FROM experiences e
JOIN users u ON e.host_id = u.id
WHERE e.status = 'published'
  AND e.start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '14 days'
ORDER BY e.start_date ASC;

-- =====================================================
-- 8. DATA CLEANUP QUERIES
-- =====================================================

-- Find experiences with no ticket tiers
SELECT 
    e.id,
    e.title,
    e.host_id
FROM experiences e
LEFT JOIN ticket_tiers tt ON e.id = tt.experience_id
WHERE tt.id IS NULL;

-- Find orphaned tags (not used by any experience)
SELECT 
    t.id,
    t.name,
    t.usage_count
FROM tags t
WHERE t.usage_count = 0
  AND t.created_at < CURRENT_DATE - INTERVAL '90 days';

-- Find inactive users (no login in 6 months, no purchases, no hosted experiences)
SELECT 
    u.id,
    u.email,
    u.last_login_at
FROM users u
LEFT JOIN experiences e ON u.id = e.host_id
LEFT JOIN ticket_purchases tp ON u.id = tp.user_id
WHERE u.last_login_at < CURRENT_DATE - INTERVAL '6 months'
  AND e.id IS NULL
  AND tp.id IS NULL;

-- =====================================================
-- 9. EXPORT QUERIES
-- =====================================================

-- Export attendee list for an experience
SELECT 
    u.name,
    u.email,
    tt.name as ticket_tier,
    tp.purchased_at,
    tp.payment_status,
    tp.attendance_status
FROM ticket_purchases tp
JOIN users u ON tp.user_id = u.id
JOIN ticket_tiers tt ON tp.ticket_tier_id = tt.id
WHERE tp.experience_id = 'experience-uuid-here'
  AND tp.payment_status = 'succeeded'
ORDER BY tt.name, u.name;

-- Export all experiences to CSV format
COPY (
    SELECT 
        e.id,
        e.title,
        e.location,
        e.start_date,
        e.end_date,
        e.base_price_cents,
        u.name as host_name,
        c.name as category,
        e.total_capacity,
        e.spots_taken,
        e.status
    FROM experiences e
    JOIN users u ON e.host_id = u.id
    LEFT JOIN categories c ON e.category_id = c.id
    ORDER BY e.start_date DESC
) TO '/tmp/experiences_export.csv' WITH CSV HEADER;

-- =====================================================
-- END OF QUERIES
-- =====================================================

