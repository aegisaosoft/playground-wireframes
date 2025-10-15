# API Integration Guide

This project is configured to use a .NET backend API running at `https://localhost:7183`.

## Configuration

### Backend URL

The API base URL is configured in `vite.config.ts` and defaults to `https://localhost:7183`.

You can override this by creating a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://localhost:7183
```

### HTTPS and Self-Signed Certificates

The Vite proxy is configured to accept self-signed certificates in development mode (`secure: false`). This is necessary for local .NET development servers.

## API Client

The main API client is located at `src/lib/api-client.ts`. It provides a type-safe wrapper around the Fetch API with the following features:

- Automatic authentication token handling
- Type-safe request/response handling
- Error handling
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- File upload support

### Usage Example

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const data = await apiClient.get<MyType>('/api/endpoint');

// POST request
const result = await apiClient.post<ResponseType>('/api/endpoint', {
  field: 'value'
});

// File upload
const formData = new FormData();
formData.append('file', file);
const uploadResult = await apiClient.upload<UploadResponse>('/api/upload', formData);
```

## Service Layer

API calls are organized into service modules in `src/services/`:

### Authentication Service (`auth.service.ts`)
- `login(credentials)` - User login
- `signUp(data)` - User registration
- `logout()` - Clear user session
- `getCurrentUser()` - Get current user from localStorage
- `isAuthenticated()` - Check if user is logged in

### Experiences Service (`experiences.service.ts`)
- `getAll()` - Get all experiences
- `getById(id)` - Get single experience
- `search(query)` - Search experiences
- `create(data)` - Create new experience
- `update(id, data)` - Update experience
- `delete(id)` - Delete experience
- `uploadImage(id, file)` - Upload experience image

### Payments Service (`payments.service.ts`)
- `getStripeStatus()` - Get Stripe Connect status
- `createAccountLink()` - Create Stripe onboarding link
- `createCheckoutSession(data)` - Create checkout for ticket purchase
- `verifyCheckoutSession(sessionId)` - Verify payment completion

## Proxy Configuration

The Vite development server is configured to proxy API requests to avoid CORS issues:

```typescript
proxy: {
  '/api': {
    target: 'https://localhost:7183',
    changeOrigin: true,
    secure: false,
  },
}
```

This means:
- Frontend runs on `http://localhost:8080`
- API requests to `/api/*` are proxied to `https://localhost:7183/api/*`
- No CORS configuration needed in development

## Backend Requirements

Your .NET backend should expose the following endpoints (or similar):

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Experiences
- `GET /api/experiences` - List all experiences
- `GET /api/experiences/{id}` - Get single experience
- `GET /api/experiences/search?q={query}` - Search experiences
- `POST /api/experiences` - Create experience
- `PUT /api/experiences/{id}` - Update experience
- `DELETE /api/experiences/{id}` - Delete experience
- `POST /api/experiences/{id}/image` - Upload image

### Payments (Stripe)
- `GET /api/connect/status` - Get Stripe account status
- `POST /api/connect/account-link` - Create onboarding link
- `POST /api/checkout/session` - Create checkout session
- `GET /api/checkout/verify/{sessionId}` - Verify payment

## CORS Configuration (Backend)

Your .NET backend needs to allow CORS from your frontend. Add this to your `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// After building the app
app.UseCors("AllowFrontend");
```

## Example: Replacing Mock API Calls

To replace existing mock API calls with real backend calls:

**Before (Mock):**
```typescript
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 1000));
const mockData = { ... };
```

**After (Real API):**
```typescript
import { authService } from '@/services/auth.service';

try {
  const response = await authService.login({ email, password });
  // Handle response
} catch (error) {
  // Handle error
}
```

## Development Workflow

1. Start your .NET backend: `dotnet run` (should run on https://localhost:7183)
2. Start the frontend: `npm run dev` (runs on http://localhost:8080)
3. Frontend API calls will be proxied to your backend automatically

## Troubleshooting

### HTTPS Certificate Errors
If you encounter certificate errors, ensure your .NET app uses a trusted development certificate:
```bash
dotnet dev-certs https --trust
```

### CORS Errors
If you see CORS errors, verify:
1. CORS is properly configured in your .NET backend
2. The frontend origin (`http://localhost:8080`) is allowed
3. `AllowCredentials()` is set if using cookies/tokens

### API Not Responding
Check that:
1. Your .NET backend is running on `https://localhost:7183`
2. The Swagger UI is accessible at `https://localhost:7183/swagger/index.html`
3. The proxy configuration in `vite.config.ts` matches your backend URL

