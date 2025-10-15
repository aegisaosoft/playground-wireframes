# API Testing Guide

## ✅ What's Been Implemented

The **Experiences page** (`/experiences`) is now connected to your .NET API and will:

1. **Fetch all experiences** from `GET /api/experiences`
2. **Search experiences** via `GET /api/experiences/search?q={query}`
3. **Show loading states** while fetching
4. **Handle errors gracefully** - falls back to mock data if API is unavailable
5. **Transform API data** to match the UI format

## 🧪 Testing the Integration

### Step 1: Visit the Experiences Page

Open in your browser:
```
http://localhost:3000/experiences
```

### Step 2: Check What Happens

You'll see one of these scenarios:

#### ✅ **Success** - API Connected
- Loading spinner appears briefly
- Toast notification: "Experiences Loaded - Loaded X experiences from API"
- Experiences cards display data from your API

#### ⚠️ **Fallback** - API Not Ready
- Toast notification: "Using Mock Data - Could not connect to API"
- Mock data displays (6 sample experiences)
- Red error banner shows "API Connection Issue"

### Step 3: Check Browser Console

Open Developer Tools (F12) → Console tab:

**If API call succeeds:**
```
✅ API Response logged (if backend is working)
```

**If API call fails:**
```
❌ Failed to fetch experiences: [error details]
```

## 🔧 What Your .NET API Should Return

### GET `/api/experiences`

**Expected Response Format:**
```json
[
  {
    "id": "1",
    "title": "Hacker House Bali",
    "description": "7-day intensive coding retreat",
    "location": "Ubud, Bali",
    "date": "2024-03-15",
    "hostName": "TechCorp",
    "hostId": "techcorp-123",
    "image": "https://example.com/image.jpg",
    "category": "Tech",
    "price": 89900,
    "tags": ["coding", "tech", "bali"]
  }
]
```

**Field Details:**
- `id` (string) - Unique identifier
- `title` (string) - Experience title
- `description` (string) - Description text
- `location` (string) - Location name
- `date` (string) - ISO date or formatted date string
- `hostName` (string) - Name of the host/organizer
- `hostId` (string, optional) - Host identifier
- `image` (string, optional) - Image URL
- `category` (string, optional) - Category (Tech, Wellness, Business, Adventure, Culinary)
- `price` (number) - Price in cents (e.g., 89900 = $899)
- `tags` (array, optional) - Array of tag strings

### GET `/api/experiences/search?q={query}`

Same format as above, but filtered by search query.

## 🎯 Quick Test Endpoint (C#)

Add this to your .NET API for quick testing:

```csharp
[ApiController]
[Route("api/[controller]")]
public class ExperiencesController : ControllerBase
{
    // GET api/experiences
    [HttpGet]
    public IActionResult GetAll()
    {
        var experiences = new[]
        {
            new
            {
                id = "1",
                title = "Hacker House Bali",
                description = "7-day intensive coding retreat in tropical paradise",
                location = "Ubud, Bali",
                date = "2024-03-15",
                hostName = "TechCorp",
                hostId = "techcorp",
                image = "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
                category = "Tech",
                price = 89900,
                tags = new[] { "coding", "tech", "networking" }
            },
            new
            {
                id = "2",
                title = "Yoga & Meditation Retreat",
                description = "Ancient wisdom meets modern wellness",
                location = "Rishikesh, India",
                date = "2024-04-10",
                hostName = "Mindful Journey",
                hostId = "mindful",
                image = "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
                category = "Wellness",
                price = 59900,
                tags = new[] { "yoga", "meditation", "wellness" }
            },
            new
            {
                id = "3",
                title = "Digital Nomad Mastermind",
                description = "Level up your remote business",
                location = "Lisbon, Portugal",
                date = "2024-05-05",
                hostName = "Remote Collective",
                hostId = "remote-collective",
                image = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
                category = "Business",
                price = 75000,
                tags = new[] { "business", "remote", "networking" }
            }
        };

        return Ok(experiences);
    }

    // GET api/experiences/search?q={query}
    [HttpGet("search")]
    public IActionResult Search([FromQuery] string q)
    {
        // Simple mock search - replace with actual database query
        var allExperiences = GetAll() as OkObjectResult;
        
        if (string.IsNullOrWhiteSpace(q))
        {
            return allExperiences;
        }

        // In real implementation, query your database
        return Ok(new[] 
        {
            new
            {
                id = "1",
                title = "Search Result: " + q,
                description = "This is a search result",
                location = "Various",
                date = "2024-06-01",
                hostName = "Test Host",
                hostId = "test",
                image = "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
                category = "Tech",
                price = 50000,
                tags = new[] { q }
            }
        });
    }

    // GET api/experiences/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        return Ok(new
        {
            id = id,
            title = "Experience " + id,
            description = "Detailed description",
            location = "Test Location",
            date = "2024-07-01",
            hostName = "Test Host",
            hostId = "test",
            image = "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
            category = "Tech",
            price = 100000,
            tags = new[] { "test" }
        });
    }
}
```

## 📊 Testing Checklist

- [ ] .NET backend running on https://localhost:7183
- [ ] React frontend running on http://localhost:3000
- [ ] CORS configured in .NET (AllowOrigin from http://localhost:3000)
- [ ] Visit http://localhost:3000/experiences
- [ ] Check for "Experiences Loaded" toast notification
- [ ] See experience cards displayed
- [ ] Open browser DevTools → Network tab
- [ ] Verify request to `/api/experiences` shows status 200
- [ ] Try search functionality
- [ ] Verify request to `/api/experiences/search?q=test`

## 🔍 Debugging

### Check Network Requests

1. Open DevTools (F12) → **Network** tab
2. Reload the Experiences page
3. Look for request to `experiences`
4. Click on it to see:
   - Request URL (should proxy to https://localhost:7183/api/experiences)
   - Status code (200 = success)
   - Response data (JSON)

### Check Backend Logs

In your .NET terminal, you should see:
```
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting GET /api/experiences
```

### Common Issues

**Issue: CORS error**
```
Access to fetch at 'https://localhost:7183/api/experiences' has been blocked by CORS policy
```

**Fix:** Add CORS to your .NET `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors("AllowAll");
```

**Issue: 404 Not Found**
```
GET https://localhost:7183/api/experiences 404 (Not Found)
```

**Fix:** Implement the `/api/experiences` endpoint in your .NET API (see example above)

**Issue: Connection refused**
```
Failed to fetch: net::ERR_CONNECTION_REFUSED
```

**Fix:** Ensure your .NET backend is running on port 7183

## ✨ Success Indicators

You'll know it's working when:

1. ✅ Toast shows "Experiences Loaded"
2. ✅ Network tab shows 200 OK for `/api/experiences`
3. ✅ Experience cards display on the page
4. ✅ No red error banner visible
5. ✅ Console shows no errors

## 🎉 Next Steps

Once this is working:

1. **Add real database** - Replace mock data with actual DB queries
2. **Implement search** - Real search functionality in your backend
3. **Add authentication** - Protect certain endpoints
4. **Implement other pages** - Apply same pattern to other components

---

**Need help?** Check the browser console and .NET logs for detailed error messages!

