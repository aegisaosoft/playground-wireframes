# Simple Google OAuth Setup (No Supabase)

## Problem
Your Supabase instance is not accessible. We'll use Google OAuth directly instead.

## Solution: Google Sign-In JavaScript Library

### Step 1: Add Google Script to HTML

Add to `playground-wireframes/index.html` before `</head>`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 2: Update AuthModal to Use Google Sign-In

Replace the Google button in AuthModal with this simple implementation:

```tsx
// In AuthModal.tsx, replace handleGoogleLogin with:

const handleGoogleLogin = (response: any) => {
  console.log('🔵 Google Sign-In response:', response);
  
  if (response.credential) {
    // We have the Google ID token!
    const idToken = response.credential;
    
    // Exchange it with backend
    authService.googleLogin(idToken)
      .then(backendAuth => {
        console.log('✅ Backend JWT received!', backendAuth);
        onLogin({ name: backendAuth.user.name, email: backendAuth.user.email }, false);
        onClose();
        navigate('/account');
      })
      .catch(error => {
        console.error('❌ Error:', error);
        toast({
          title: "Login Failed",
          description: "Google login failed. Please try again.",
          variant: "destructive"
        });
      });
  }
};

// And replace the Google button with:
<div 
  id="g_id_onload"
  data-client_id="532971884629-3g95fgdehbaep0hf8jf8cc577d40mmp9.apps.googleusercontent.com"
  data-callback="handleGoogleLogin"
></div>

<div 
  className="g_id_signin"
  data-type="standard"
  data-size="large"
  data-theme="outline"
  data-text="sign_in_with"
  data-shape="rectangular"
  data-logo_alignment="left"
></div>
```

## OR Even Simpler: Just Use Email/Password Login

Since Supabase is not working, the **easiest solution** is to:

1. **Remove Supabase** completely
2. **Use only backend authentication**
3. **Email/Password login works perfectly** ✅

Want me to:
- A) Set up direct Google OAuth (requires adding script to HTML)
- B) Just use email/password authentication (works now, no changes needed)

Which do you prefer?

