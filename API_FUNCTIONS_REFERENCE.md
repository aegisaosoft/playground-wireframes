# API Functions Reference - Get Experiences

## 📋 Quick Reference

### Frontend Service Layer

**File:** `src/services/experiences.service.ts`

```typescript
import { experiencesService } from '@/services/experiences.service';
```

## 🔹 Available Functions

### 1. **Get All Experiences**

```typescript
// Function call
const experiences = await experiencesService.getAll();

// Returns array of:
[
  {
    id: "1",
    title: "Experience Title",
    description: "Description text",
    location: "City, Country",
    date: "2024-03-15",
    image: "https://...",
    hostName: "Host Name",
    price: 89900,  // in cents
    category: "Tech",
    tags: ["tag1", "tag2"]
  }
]
```

**Backend Endpoint:**
```
GET /api/experiences
```

---

### 2. **Get Single Experience by ID**

```typescript
// Function call
const experience = await experiencesService.getById('experience-id-123');

// Returns single object:
{
  id: "experience-id-123",
  title: "Experience Title",
  description: "...",
  // ... other fields
}
```

**Backend Endpoint:**
```
GET /api/experiences/{id}
```

---

### 3. **Search Experiences**

```typescript
// Function call
const results = await experiencesService.search('yoga');

// Returns filtered array of experiences
```

**Backend Endpoint:**
```
GET /api/experiences/search?q={query}
```

---

### 4. **Create New Experience**

```typescript
// Function call
const newExperience = await experiencesService.create({
  title: "My Amazing Retreat",
  description: "Full description here",
  location: "Bali, Indonesia",
  date: "2024-06-15",
  price: 150000,  // $1500 in cents
  category: "Wellness",
  tags: ["yoga", "meditation"]
});

// Returns created experience with ID
```

**Backend Endpoint:**
```
POST /api/experiences
```

---

### 5. **Update Existing Experience**

```typescript
// Function call
const updated = await experiencesService.update('experience-id', {
  title: "Updated Title",
  price: 120000
});
```

**Backend Endpoint:**
```
PUT /api/experiences/{id}
```

---

### 6. **Delete Experience**

```typescript
// Function call
await experiencesService.delete('experience-id');
```

**Backend Endpoint:**
```
DELETE /api/experiences/{id}
```

---

### 7. **Upload Experience Image**

```typescript
// Function call
const file = event.target.files[0];
const result = await experiencesService.uploadImage('experience-id', file);

// Returns:
{ imageUrl: "https://..." }
```

**Backend Endpoint:**
```
POST /api/experiences/{id}/image
```

---

## 💡 Usage Examples

### Example 1: Load Experiences in a Component

```typescript
import { useState, useEffect } from 'react';
import { experiencesService } from '@/services/experiences.service';

function MyComponent() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperiences() {
      try {
        const data = await experiencesService.getAll();
        setExperiences(data);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadExperiences();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        experiences.map(exp => (
          <div key={exp.id}>{exp.title}</div>
        ))
      )}
    </div>
  );
}
```

---

### Example 2: Search on Button Click

```typescript
import { experiencesService } from '@/services/experiences.service';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const data = await experiencesService.search(query);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      <button onClick={handleSearch}>Search</button>
      
      {results.map(exp => (
        <div key={exp.id}>{exp.title}</div>
      ))}
    </div>
  );
}
```

---

### Example 3: Create Experience with Form

```typescript
import { experiencesService } from '@/services/experiences.service';

function CreateExperienceForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    price: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newExperience = await experiencesService.create({
        ...formData,
        price: formData.price * 100 // Convert dollars to cents
      });
      
      alert('Experience created! ID: ' + newExperience.id);
    } catch (error) {
      alert('Failed to create: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
      {/* More fields... */}
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## 🔧 .NET Backend Implementation

### Minimal Controller for Testing

```csharp
using Microsoft.AspNetCore.Mvc;

namespace YourApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExperiencesController : ControllerBase
    {
        // 1. GET ALL
        [HttpGet]
        public IActionResult GetAll()
        {
            var experiences = new[]
            {
                new
                {
                    id = "1",
                    title = "Bali Retreat",
                    description = "Amazing retreat in Bali",
                    location = "Ubud, Bali",
                    date = "2024-06-15",
                    hostName = "Wellness Co",
                    hostId = "wellness-co",
                    image = "https://picsum.photos/400/300",
                    category = "Wellness",
                    price = 150000,
                    tags = new[] { "yoga", "meditation" }
                },
                new
                {
                    id = "2",
                    title = "Tech Bootcamp",
                    description = "Intensive coding bootcamp",
                    location = "San Francisco, USA",
                    date = "2024-07-01",
                    hostName = "Code Academy",
                    hostId = "code-academy",
                    image = "https://picsum.photos/400/301",
                    category = "Tech",
                    price = 200000,
                    tags = new[] { "coding", "tech" }
                }
            };

            return Ok(experiences);
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            return Ok(new
            {
                id = id,
                title = "Experience " + id,
                description = "Detailed description",
                location = "Test Location",
                date = "2024-08-01",
                hostName = "Test Host",
                hostId = "test-host",
                image = "https://picsum.photos/400/302",
                category = "Adventure",
                price = 100000,
                tags = new[] { "adventure", "outdoor" }
            });
        }

        // 3. SEARCH
        [HttpGet("search")]
        public IActionResult Search([FromQuery] string q)
        {
            // In real app, query database
            return Ok(new[]
            {
                new
                {
                    id = "search-1",
                    title = "Found: " + q,
                    description = "Search result for " + q,
                    location = "Various",
                    date = "2024-09-01",
                    hostName = "Search Host",
                    hostId = "search-host",
                    image = "https://picsum.photos/400/303",
                    category = "Various",
                    price = 50000,
                    tags = new[] { q }
                }
            });
        }

        // 4. CREATE
        [HttpPost]
        public IActionResult Create([FromBody] ExperienceDto dto)
        {
            return CreatedAtAction(nameof(GetById), new { id = "new-123" }, new
            {
                id = "new-123",
                title = dto.Title,
                description = dto.Description,
                location = dto.Location,
                date = dto.Date,
                price = dto.Price
            });
        }

        // 5. UPDATE
        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] ExperienceDto dto)
        {
            return Ok(new { message = "Updated", id = id });
        }

        // 6. DELETE
        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            return NoContent();
        }

        // 7. UPLOAD IMAGE
        [HttpPost("{id}/image")]
        public IActionResult UploadImage(string id, IFormFile image)
        {
            // In real app, save to storage
            return Ok(new { imageUrl = "https://picsum.photos/400/305" });
        }
    }

    public class ExperienceDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public string Date { get; set; }
        public int? Price { get; set; }
        public string Category { get; set; }
        public string[] Tags { get; set; }
    }
}
```

---

## ✅ Testing Checklist

To test if everything works:

1. **Add the controller above to your .NET project**
2. **Start your .NET backend** (port 7183)
3. **Visit in browser:** http://localhost:3000/experiences
4. **Check browser console** (F12) for API calls
5. **Look for toast notification:** "Experiences Loaded"

---

## 🎯 Direct API Testing

### Using Browser Console

```javascript
// Open DevTools Console (F12) on http://localhost:3000

// Test 1: Get all experiences
fetch('/api/experiences')
  .then(r => r.json())
  .then(data => console.log('Experiences:', data));

// Test 2: Search
fetch('/api/experiences/search?q=yoga')
  .then(r => r.json())
  .then(data => console.log('Search results:', data));

// Test 3: Get by ID
fetch('/api/experiences/1')
  .then(r => r.json())
  .then(data => console.log('Single experience:', data));
```

### Using Swagger UI

1. Visit: https://localhost:7183/swagger/index.html
2. Try the `GET /api/experiences` endpoint
3. Click "Execute"
4. See the response

---

## 📞 Summary

**To get experiences in your React app:**

```typescript
import { experiencesService } from '@/services/experiences.service';

// In your component:
const experiences = await experiencesService.getAll();
```

**Backend must have:**
```csharp
[HttpGet]
public IActionResult GetAll() { ... }
```

**That's it!** The proxy handles routing `/api/*` to your backend automatically.

---

Need help? Check browser console and .NET logs for errors!

