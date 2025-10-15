# Backend Integration Setup Guide

## Overview

This React application has been configured to connect to your .NET backend API running at **`https://localhost:7183`**.

## 🚀 Quick Start

### 1. Start Your Backend
Ensure your .NET API is running:
```bash
cd path/to/your/dotnet/api
dotnet run
```

Your API should be accessible at: `https://localhost:7183/swagger/index.html`

### 2. Start the Frontend
```bash
npm run dev
```

The frontend will run on: `http://localhost:3000`

### 3. Test the Connection
The Vite proxy will automatically forward requests from `/api/*` to `https://localhost:7183/api/*`.

## 📁 Files Created

### Core API Integration
- **`src/lib/api-client.ts`** - Main HTTP client for making API requests
- **`vite.config.ts`** - Updated with proxy configuration

### Service Layer
- **`src/services/auth.service.ts`** - Authentication endpoints
- **`src/services/experiences.service.ts`** - Experience/retreat CRUD operations
- **`src/services/payments.service.ts`** - Stripe Connect and checkout

### Example Components
- **`src/components/AuthModal.example.tsx`** - Login/signup with real API
- **`src/components/PaymentsCard.example.tsx`** - Stripe Connect integration
- **`src/components/TicketTierDisplay.example.tsx`** - Ticket purchase flow

### Documentation
- **`API_INTEGRATION.md`** - Detailed API integration guide
- **`BACKEND_SETUP_GUIDE.md`** - This file

## 🔧 Configuration

### Environment Variables

The API base URL can be configured using environment variables. Create a `.env` file:

```env
VITE_API_BASE_URL=https://localhost:7183
```

> **Note**: `.env` files may be gitignored. The default URL is set in `vite.config.ts`.

### Vite Proxy Configuration

The proxy is configured in `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'https://localhost:7183',
    changeOrigin: true,
    secure: false, // Allows self-signed certificates
  },
}
```

## 🎯 Using the API Client

### Basic Usage

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const experiences = await apiClient.get('/api/experiences');

// POST request
const newExperience = await apiClient.post('/api/experiences', {
  title: 'My Retreat',
  location: 'Bali',
  // ... other fields
});

// File upload
const formData = new FormData();
formData.append('image', file);
const result = await apiClient.upload('/api/experiences/123/image', formData);
```

### Using Services

Services provide a clean interface to API endpoints:

```typescript
import { authService } from '@/services/auth.service';
import { experiencesService } from '@/services/experiences.service';
import { paymentsService } from '@/services/payments.service';

// Authentication
const response = await authService.login({ email, password });

// Get experiences
const experiences = await experiencesService.getAll();

// Stripe Connect
const status = await paymentsService.getStripeStatus();
```

## 🔄 Migrating from Mock to Real API

### Step 1: Identify Mock API Calls

Look for patterns like:
```typescript
// Mock API call
await new Promise(resolve => setTimeout(resolve, 1000));
const mockData = { ... };
```

### Step 2: Replace with Service Call

```typescript
// Real API call
import { experiencesService } from '@/services/experiences.service';

try {
  const data = await experiencesService.getAll();
  // Use data
} catch (error) {
  // Handle error
  console.error('API error:', error);
}
```

### Step 3: Use Example Components

Example files show how to update existing components:
- **`AuthModal.example.tsx`** → Replace `AuthModal.tsx`
- **`PaymentsCard.example.tsx`** → Replace `PaymentsCard.tsx`
- **`TicketTierDisplay.example.tsx`** → Replace `TicketTierDisplay.tsx`

To use an example:
```bash
# Backup original
mv src/components/AuthModal.tsx src/components/AuthModal.old.tsx

# Use the example
mv src/components/AuthModal.example.tsx src/components/AuthModal.tsx
```

## 🛠️ Backend API Requirements

Your .NET backend should implement these endpoints:

### Authentication
```
POST   /api/auth/login
POST   /api/auth/signup
GET    /api/auth/user
```

### Experiences
```
GET    /api/experiences
GET    /api/experiences/{id}
GET    /api/experiences/search?q={query}
POST   /api/experiences
PUT    /api/experiences/{id}
DELETE /api/experiences/{id}
POST   /api/experiences/{id}/image
```

### Payments (Stripe)
```
GET    /api/connect/status
POST   /api/connect/account-link
POST   /api/checkout/session
GET    /api/checkout/verify/{sessionId}
```

### Response Format

Your API should return JSON responses:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success"
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "errors": { ... }
}
```

## 🔐 Authentication

### Token Storage

The API client automatically includes JWT tokens in requests:

```typescript
// Token is stored after login
localStorage.setItem('auth_token', token);

// Automatically included in all subsequent requests
// Authorization: Bearer {token}
```

### Implementing in Backend

Your .NET API should:

1. **Accept Bearer tokens:**
```csharp
[Authorize]
[HttpGet("experiences")]
public async Task<IActionResult> GetExperiences() { ... }
```

2. **Return tokens on login:**
```csharp
return Ok(new {
    token = jwtToken,
    user = new { id, email, name }
});
```

## 🌐 CORS Configuration

Your .NET backend **must** allow requests from the frontend. Add to `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Important: Add CORS middleware before other middleware
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
```

## 🔒 HTTPS Certificates

### Trust Development Certificate

If you see certificate errors:

```bash
# Trust the .NET development certificate
dotnet dev-certs https --trust
```

### Verify Certificate

Visit `https://localhost:7183/swagger/index.html` in your browser. You should see the Swagger UI without certificate warnings.

## 🐛 Troubleshooting

### Issue: API requests fail with CORS errors

**Solution:**
1. Verify CORS is configured in your .NET backend
2. Ensure the frontend origin (`http://localhost:8080`) is allowed
3. Check that `UseCors()` is called before `UseAuthentication()`

### Issue: 404 errors for API endpoints

**Solution:**
1. Verify your .NET API is running on `https://localhost:7183`
2. Check endpoint paths in Swagger UI
3. Ensure routes match those called in the services

### Issue: Certificate errors (NET::ERR_CERT_AUTHORITY_INVALID)

**Solution:**
1. Trust the development certificate: `dotnet dev-certs https --trust`
2. Restart your browser
3. Vite proxy is configured with `secure: false` for development

### Issue: Authentication fails (401 Unauthorized)

**Solution:**
1. Check that token is being stored: `localStorage.getItem('auth_token')`
2. Verify the token format in request headers (Network tab)
3. Ensure backend JWT validation is working

### Issue: Can't see API requests in Network tab

**Solution:**
1. Check that requests are going to `/api/...` paths
2. Verify the proxy is working in Vite DevTools
3. Look at the terminal running `npm run dev` for proxy logs

## 📚 Next Steps

1. **Review** `API_INTEGRATION.md` for detailed API client documentation
2. **Implement** your .NET backend endpoints according to the required API structure
3. **Update** components to use real API calls instead of mocks
4. **Test** the integration by running both frontend and backend

## 💡 Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during API calls
3. **Type Safety**: Define TypeScript interfaces for API responses
4. **Service Layer**: Keep API logic in service files, not components
5. **Environment Variables**: Use `.env` for different environments

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Review .NET backend logs
4. Verify all configurations in this guide

---

**Ready to integrate?** Start by implementing the authentication endpoints in your .NET backend, then update `AuthModal.tsx` using the example file!

