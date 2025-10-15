# API Integration Summary

## ✅ What's Been Configured

Your React application is now set up to connect to your .NET backend API at **`https://localhost:7183`**.

## 📦 Files Created

### Core Integration
| File | Description |
|------|-------------|
| `src/lib/api-client.ts` | HTTP client for making API requests |
| `src/services/auth.service.ts` | Authentication service (login/signup) |
| `src/services/experiences.service.ts` | Experiences/retreats CRUD operations |
| `src/services/payments.service.ts` | Stripe Connect and checkout |
| `vite.config.ts` | **Updated** with API proxy configuration |

### Example Components (Ready to Use)
| File | Purpose |
|------|---------|
| `src/components/AuthModal.example.tsx` | Real authentication instead of mocks |
| `src/components/PaymentsCard.example.tsx` | Stripe Connect integration |
| `src/components/TicketTierDisplay.example.tsx` | Real ticket purchases |

### Documentation
| File | Description |
|------|-------------|
| `API_INTEGRATION.md` | Detailed API client usage guide |
| `BACKEND_SETUP_GUIDE.md` | Complete setup instructions |
| `DOTNET_API_REFERENCE.md` | .NET backend code examples |
| `README_API_INTEGRATION.md` | This quick reference |

## 🚀 Quick Start

### 1. Start Your .NET Backend
```bash
cd path/to/your/dotnet/api
dotnet run
```
✅ Verify it's running: `https://localhost:7183/swagger/index.html`

### 2. Start React Frontend
```bash
npm run dev
```
✅ Opens on: `http://localhost:3000`

### 3. Test Integration
All API requests to `/api/*` are automatically proxied to your backend!

## 🔧 How It Works

### Request Flow
```
React App (localhost:3000)
    ↓
    GET /api/experiences
    ↓
Vite Proxy (configured in vite.config.ts)
    ↓
    Forwards to: https://localhost:7183/api/experiences
    ↓
Your .NET Backend
    ↓
    Returns JSON response
    ↓
React App receives data
```

### Proxy Configuration (Already Done)
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'https://localhost:7183',
    changeOrigin: true,
    secure: false, // Accepts self-signed certificates
  },
}
```

## 💻 Using the API Client

### Example 1: Authentication
```typescript
import { authService } from '@/services/auth.service';

// Login
const response = await authService.login({ email, password });
// Token is automatically stored and included in future requests

// Sign up
const newUser = await authService.signUp({ email, password, name });

// Check if logged in
const isLoggedIn = authService.isAuthenticated();
```

### Example 2: Fetching Data
```typescript
import { experiencesService } from '@/services/experiences.service';

// Get all experiences
const experiences = await experiencesService.getAll();

// Get specific experience
const experience = await experiencesService.getById('123');

// Search
const results = await experiencesService.search('yoga retreat');
```

### Example 3: Creating Data
```typescript
import { experiencesService } from '@/services/experiences.service';

const newExperience = await experiencesService.create({
  title: 'Bali Wellness Retreat',
  description: 'Amazing retreat...',
  location: 'Bali, Indonesia',
  date: '2024-06-15',
  price: 150000, // in cents
});
```

### Example 4: Uploading Files
```typescript
import { experiencesService } from '@/services/experiences.service';

const file = event.target.files[0];
const result = await experiencesService.uploadImage('experience-123', file);
console.log('Uploaded to:', result.imageUrl);
```

### Example 5: Payments
```typescript
import { paymentsService } from '@/services/payments.service';

// Check Stripe status
const status = await paymentsService.getStripeStatus();

// Create checkout session
const { url } = await paymentsService.createCheckoutSession({
  experienceId: '123',
  tierId: 'tier-456'
});
window.location.href = url; // Redirect to Stripe
```

## 🔄 Replacing Mock Components

To use real API instead of mocks:

```bash
# Example: Update AuthModal
mv src/components/AuthModal.tsx src/components/AuthModal.old.tsx
mv src/components/AuthModal.example.tsx src/components/AuthModal.tsx
```

Repeat for:
- `PaymentsCard.tsx`
- `TicketTierDisplay.tsx`

## ⚙️ Backend Requirements

Your .NET API needs these endpoints:

### Auth
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/signup` - User registration

### Experiences
- ✅ `GET /api/experiences` - List all
- ✅ `GET /api/experiences/{id}` - Get one
- ✅ `GET /api/experiences/search?q={query}` - Search
- ✅ `POST /api/experiences` - Create
- ✅ `PUT /api/experiences/{id}` - Update
- ✅ `DELETE /api/experiences/{id}` - Delete
- ✅ `POST /api/experiences/{id}/image` - Upload image

### Payments
- ✅ `GET /api/connect/status` - Stripe status
- ✅ `POST /api/connect/account-link` - Onboarding link
- ✅ `POST /api/checkout/session` - Create checkout
- ✅ `GET /api/checkout/verify/{sessionId}` - Verify payment

**See `DOTNET_API_REFERENCE.md` for complete C# code examples!**

## 🔐 Important: CORS Configuration

Your .NET backend **must** have CORS enabled. Add to `Program.cs`:

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

// After var app = builder.Build();
app.UseCors("AllowFrontend"); // BEFORE UseAuthentication()
```

## 🛠️ Troubleshooting

### Problem: CORS errors in browser console
**Solution:** Add CORS policy to your .NET backend (see above)

### Problem: 404 Not Found for API calls
**Solution:** Verify your .NET app is running on `https://localhost:7183`

### Problem: Certificate errors
**Solution:** Trust the development certificate:
```bash
dotnet dev-certs https --trust
```

### Problem: API calls not working
**Solution:** Check these:
1. ✅ .NET backend is running
2. ✅ Swagger UI is accessible at `https://localhost:7183/swagger`
3. ✅ CORS is configured in .NET
4. ✅ Frontend is running on `http://localhost:3000`

## 📚 Documentation

- **API Integration Guide**: `API_INTEGRATION.md` - Detailed API client docs
- **Backend Setup**: `BACKEND_SETUP_GUIDE.md` - Complete setup guide
- **.NET Reference**: `DOTNET_API_REFERENCE.md` - C# code examples

## 🎯 Next Steps

1. ✅ **Verify** your .NET backend is running with Swagger
2. ✅ **Implement** required API endpoints (use DOTNET_API_REFERENCE.md)
3. ✅ **Test** authentication by updating AuthModal component
4. ✅ **Replace** other mock components with real API calls
5. ✅ **Build** out your database and business logic

## 💡 Tips

- **Use Services**: Import from `@/services/*` instead of calling `apiClient` directly
- **Error Handling**: Always wrap API calls in try-catch blocks
- **Loading States**: Use `useState` for loading indicators
- **Type Safety**: Define TypeScript interfaces for your responses
- **Console Logging**: Check browser console and Network tab when debugging

## 🎉 You're Ready!

Your frontend is fully configured to work with your .NET backend. Start implementing your API endpoints and watch the integration come to life!

Need help? Check the documentation files or review the example components.

---

**Happy coding! 🚀**

