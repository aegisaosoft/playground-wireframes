# How to Run This Application

## ⚠️ Important: Don't Use IIS for the React Frontend

This React application **should NOT be run through IIS**. It's a Node.js application that runs with Vite.

## Two Separate Applications

This project consists of **two separate applications** that run simultaneously:

### 1. Frontend (React + Vite) - Port 3000
- **Technology**: React, TypeScript, Vite
- **Runs with**: Node.js
- **Port**: 3000
- **URL**: http://localhost:3000

### 2. Backend (.NET API) - Port 7183
- **Technology**: ASP.NET Core
- **Runs with**: IIS Express or Kestrel
- **Port**: 7183
- **URL**: https://localhost:7183

## 🚀 Step-by-Step: How to Run

### Step 1: Install Frontend Dependencies

Open a terminal in this project folder:

```bash
npm install
```

### Step 2: Start the Frontend

In the same terminal:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ **Frontend is now running!** Keep this terminal open.

### Step 3: Start the Backend

Open a **NEW** terminal window and navigate to your .NET API project:

```bash
cd C:\path\to\your\dotnet\api
dotnet run
```

You should see:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7183
```

✅ **Backend is now running!** Keep this terminal open too.

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 🎯 Architecture

```
┌──────────────────────────────────────────────┐
│  Browser: http://localhost:3000              │
└────────────────┬─────────────────────────────┘
                 │
                 │ (User interacts with React app)
                 ↓
┌──────────────────────────────────────────────┐
│  Frontend (Vite Dev Server)                  │
│  Port: 3000                                  │
│  Terminal 1: npm run dev                     │
└────────────────┬─────────────────────────────┘
                 │
                 │ API Requests: /api/*
                 │ (Vite proxies these)
                 ↓
┌──────────────────────────────────────────────┐
│  Backend (.NET API)                          │
│  Port: 7183                                  │
│  Terminal 2: dotnet run                      │
└──────────────────────────────────────────────┘
```

## ❌ Common Mistakes

### Mistake 1: Trying to Open in IIS
**Don't do this:**
- Opening the project folder in IIS Manager
- Setting up application pools
- Creating web.config files for the React app

**Why:** The React frontend is a Node.js application, not an IIS application.

### Mistake 2: Only Running One Application
**Both must be running:**
- ✅ Frontend: `npm run dev` on port 3000
- ✅ Backend: `dotnet run` on port 7183

### Mistake 3: Port Conflicts
If you get "Port 3000 is already in use":
```bash
# On Windows, find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## 🔧 Troubleshooting

### Problem: "Cannot read configuration file" (IIS Error)

**Cause:** You're trying to access the app through IIS.

**Solution:** 
1. Close any IIS windows
2. Open a terminal
3. Run `npm run dev`
4. Access via `http://localhost:3000`

### Problem: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Problem: "This site can't be reached" at localhost:3000

**Cause:** Frontend not running.

**Solution:**
```bash
npm run dev
```

### Problem: API calls return 404

**Cause:** Backend not running.

**Solution:**
```bash
cd path\to\your\dotnet\api
dotnet run
```

### Problem: CORS errors in browser console

**Cause:** Backend not configured to accept requests from frontend.

**Solution:** Add CORS to your .NET `Program.cs`:
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
app.UseCors("AllowFrontend");
```

## 📋 Checklist

Before asking for help, verify:

- [ ] Node.js is installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend is running (`npm run dev` in Terminal 1)
- [ ] Backend is running (`dotnet run` in Terminal 2)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend Swagger UI at https://localhost:7183/swagger/index.html
- [ ] CORS configured in .NET backend
- [ ] No IIS applications running on ports 3000 or 7183

## 🎓 For Production

For production deployment:

### Frontend Build
```bash
npm run build
```
This creates a `dist` folder with static files that **can** be served by IIS, nginx, or any web server.

### Backend Deployment
Deploy your .NET API to IIS or Azure App Service as usual.

### Production Architecture
```
Frontend (Static Files) → Served by IIS/nginx
                       ↓
                  API Server (.NET)
```

## 💡 Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start frontend dev server | `npm run dev` |
| Build frontend for production | `npm run build` |
| Preview production build | `npm run preview` |
| Lint code | `npm run lint` |

## 🆘 Still Having Issues?

1. Make sure you're in the correct directory (where package.json is)
2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Check that no other applications are using ports 3000 or 7183
4. Ensure your .NET backend is running and accessible

---

**Remember:** The frontend is a Node.js app. Run it with `npm run dev`, not IIS!

