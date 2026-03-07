# **🔥 COMPLETE AUTHENTICATION IMPLEMENTATION GUIDE**

I'll guide you through implementing **full end-to-end authentication** from signup to seeing user data on the profile page.

---

## **📋 Overview: What We're Building**

```
User Journey:
1. Visit /signup → Fill form → POST to backend → Get JWT token
2. Backend creates user in DB → Returns user + accessToken
3. Frontend stores token → Redirects to /profile
4. Profile page calls /auth/me → Backend verifies token → Returns user data
5. User sees their real profile ✅

Flow:
Frontend (SignUp) → Backend (register) → Database → Backend (JWT) → Frontend (token stored)
Frontend (Profile) → Backend (/auth/me) → Database → Backend (user data) → Frontend (display)
```

---

## **STEP 1: BACKEND CHANGES** 

### ✅ Your backend is already perfect! Just one small fix:

Your login expects `identifier` but your schema might be different. Let me check the auth controller...

Looking at your auth controller (line 99), it expects:
```typescript
{ identifier, password } // identifier = email OR username
```

But your register expects:
```typescript
{ name, username, email, password }
```

**This is already correct!** No backend changes needed. 🎉

---

## **STEP 2: FRONTEND IMPLEMENTATION**

### **File 1: Create API Client**

Create `camply-frontend/src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    details?: any[];
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('accessToken');

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      credentials: 'include', // Important: sends cookies for refresh token
    });

    const body = await res.json();

    if (!res.ok) {
      throw new ApiError(
        body?.error?.message || 'Request failed',
        res.status,
        body?.error?.details
      );
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error. Please check your connection.');
  }
}
```

---

### **File 2: Create Auth Service**

Create `camply-frontend/src/services/auth.ts`:

```typescript
import { apiFetch } from '@/lib/api';

export type TrustLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  college?: string;
  skills?: string[];
  trustLevel: TrustLevel;
  trustScore: number;
  createdAt: string;
  _count?: {
    posts: number;
    teamMembers: number;
  };
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

// Register new user
export async function register(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data!;
}

// Login existing user
export async function login(data: { identifier: string; password: string }) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data!;
}

// Get current user profile
export async function getMe() {
  const response = await apiFetch<{ user: User }>('/api/v1/auth/me');
  return response.data!;
}

// Logout
export async function logout() {
  await apiFetch('/api/v1/auth/logout', { method: 'POST' });
  localStorage.removeItem('accessToken');
}

// Refresh access token
export async function refreshToken() {
  const response = await apiFetch<{ accessToken: string }>('/api/v1/auth/refresh', {
    method: 'POST',
  });
  return response.data!;
}
```

---

### **File 3: Create Auth Context**

Create `camply-frontend/src/contexts/AuthContext.tsx`:

```typescript
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { User, getMe, logout as logoutService } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const data = await getMe();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setAccessToken = useCallback((token: string) => {
    localStorage.setItem('accessToken', token);
  }, []);

  const refreshUser = useCallback(async () => {
    if (localStorage.getItem('accessToken')) {
      await loadUser();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    setAccessToken,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### **File 4: Update App.tsx**

Update `camply-frontend/src/App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

---

### **File 5: Update SignUp Component**

Replace `camply-frontend/src/components/SignUp.tsx`:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface SignUpProps {
  onSwitchToLogin?: () => void;
}

export function SignUp({ onSwitchToLogin }: SignUpProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { name, username, email, password } = formData;
      const data = await register({ name, username, email, password });

      // Store token and user
      setAccessToken(data.accessToken);
      setUser(data.user);

      toast({
        title: "Success!",
        description: "Account created successfully",
      });

      // Redirect to profile
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join Camply and connect with your campus community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin || (() => navigate("/login"))}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Log in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### **File 6: Update Login Component**

Replace `camply-frontend/src/components/Login.tsx`:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface LoginProps {
  onSwitchToSignUp?: () => void;
}

export function Login({ onSwitchToSignUp }: LoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await login({ identifier, password });

      // Store token and user
      setAccessToken(data.accessToken);
      setUser(data.user);

      toast({
        title: "Welcome back!",
        description: "Logged in successfully",
      });

      // Redirect to profile
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to your Camply account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                placeholder="johndoe or john@college.edu"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp || (() => navigate("/signup"))}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### **File 7: Update Profile Component**

Replace `camply-frontend/src/components/Profile.tsx`:

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { Loader2, LogOut, Mail, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your profile</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  // Convert BRONZE -> bronze for TrustBadge component
  const trustLevel = user.trustLevel.toLowerCase() as "bronze" | "silver" | "gold" | "platinum";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6 md:p-8">
        {/* Header with Avatar */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <TrustBadge level={trustLevel} />
            </div>
            <p className="text-lg text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>

          {user.college && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>🎓 {user.college}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-muted-foreground">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {user._count?.posts || 0}
            </div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{user.trustScore}</div>
            <div className="text-sm text-muted-foreground">Trust Score</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1">
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

### **File 8: Create Environment File**

Create `camply-frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## **STEP 3: TESTING LOCALLY**

### **1. Start Backend**

```bash
cd camply-backend

# Make sure you have .env with:
# DATABASE_URL=postgresql://...
# JWT_ACCESS_SECRET=<your-secret>
# JWT_REFRESH_SECRET=<your-secret>

npm install
npm run db:push
npm run dev

# Should see: "🚀 Camply API running on port 5000"
```

### **2. Start Frontend**

```bash
cd camply-frontend

# Create .env.local if you haven't
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local

npm install
npm run dev

# Opens on http://localhost:8080
```

### **3. Test the Flow**

1. **Go to http://localhost:8080/signup**
2. **Fill out the form:**
   ```
   Name: Test User
   Username: testuser
   Email: test@example.com
   Password: password123
   Confirm: password123
   ```
3. **Click "Sign Up"**
4. **You should:**
   - See a success toast
   - Be redirected to `/profile`
   - See your real user data (name, email, username, trust badge)

5. **Click "Logout"**
6. **Go to `/login`**
7. **Log in with:**
   ```
   Username or Email: testuser
   Password: password123
   ```
8. **You should be back at `/profile` with your data**

---

## **STEP 4: HOW IT WORKS BEHIND THE SCENES**

### **Registration Flow:**

```
1. User fills signup form → clicks "Sign Up"
   ↓
2. Frontend: SignUp.tsx calls register(data)
   ↓
3. auth.ts sends POST /api/v1/auth/register
   {
     name: "Test User",
     username: "testuser",
     email: "test@example.com",
     password: "password123"
   }
   ↓
4. Backend: auth.controller.ts register()
   - Checks if username/email exists
   - Hashes password with bcrypt
   - Creates user in database
   - Generates JWT accessToken (15 min)
   - Generates JWT refreshToken (7 days, httpOnly cookie)
   - Stores refreshToken in database
   ↓
5. Backend responds:
   {
     "success": true,
     "data": {
       "user": { id, name, username, email, trustLevel... },
       "accessToken": "eyJhbGciOiJIUzI1NiIs..."
     }
   }
   + Set-Cookie: refreshToken=...; HttpOnly; Secure
   ↓
6. Frontend: auth.ts receives response
   ↓
7. AuthContext stores:
   - localStorage.setItem('accessToken', token)
   - setUser(user)
   ↓
8. Navigate to /profile
   ↓
9. Profile component:
   - useAuth() gets user from context
   - Displays user data ✅
```

### **Profile Load Flow:**

```
1. User visits /profile (with accessToken in localStorage)
   ↓
2. Profile.tsx renders
   ↓
3. useAuth() hook:
   - Checks isLoading (true initially)
   - Shows spinner
   ↓
4. AuthContext useEffect runs on mount:
   - Sees accessToken in localStorage
   - Calls getMe()
   ↓
5. auth.ts sends GET /api/v1/auth/me
   Headers: Authorization: Bearer eyJhbGci...
   ↓
6. Backend: auth.middleware.ts authenticate()
   - Extracts token from Authorization header
   - Verifies token with JWT_ACCESS_SECRET
   - Decodes payload: { userId, username }
   - Attaches to req.user
   ↓
7. Backend: auth.controller.ts me()
   - Queries database: prisma.user.findUnique({ where: { id: req.user.userId } })
   - Returns user data
   ↓
8. Frontend: auth.ts receives response
   ↓
9. AuthContext:
   - setUser(data.user)
   - setIsLoading(false)
   ↓
10. Profile.tsx re-renders with user data ✅
```

### **Logout Flow:**

```
1. User clicks "Logout" button
   ↓
2. Profile.tsx calls logout()
   ↓
3. AuthContext.logout():
   - Calls logoutService() → POST /api/v1/auth/logout
   ↓
4. Backend: auth.controller.ts logout()
   - Deletes refreshToken from database
   - Clears refreshToken cookie
   ↓
5. Frontend:
   - localStorage.removeItem('accessToken')
   - setUser(null)
   - navigate('/login')
   ↓
6. User is logged out ✅
```

---

## **STEP 5: DEPLOY TO PRODUCTION**

### **1. Deploy Backend to Railway**

```bash
# Already covered earlier, but quick recap:

1. Push backend to GitHub
2. Railway.app → New Project → GitHub repo
3. Add PostgreSQL database
4. Add environment variables (JWT secrets, Cloudinary, etc.)
5. Deploy
6. Copy your Railway URL: https://camply-backend-production.up.railway.app
```

### **2. Update Frontend Environment**

In Vercel dashboard:
```
Settings → Environment Variables → Add

Name: VITE_API_BASE_URL
Value: https://camply-backend-production.up.railway.app
```

### **3. Redeploy Frontend**

```bash
git add .
git commit -m "Add authentication"
git push

# Vercel auto-deploys
```

### **4. Test Production**

1. Go to https://camply.live/signup
2. Create account
3. Should work exactly like local! ✅

---

## **COMMON ISSUES & FIXES**

### **Issue 1: CORS Error**

**Error:**
```
Access to fetch at 'http://localhost:5000/api/v1/auth/register' 
has been blocked by CORS policy
```

**Fix:**
In `camply-backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:8080,https://camply.live,https://camply-frontend.vercel.app
```

---

### **Issue 2: 401 Unauthorized on /auth/me**

**Error:**
```
GET /api/v1/auth/me → 401 Unauthorized
```

**Fix:**
Check if token is being sent:
1. Open DevTools → Network tab
2. Click on `/auth/me` request
3. Check Headers → Should see: `Authorization: Bearer <token>`

If missing, check:
```typescript
// In api.ts, make sure:
const token = localStorage.getItem('accessToken');
headers: {
  ...(token && { Authorization: `Bearer ${token}` }),
}
```

---

### **Issue 3: Token Expired**

**Error:**
```
Access token expired
```

**Solution:**
Implement token refresh (advanced):

```typescript
// In api.ts, add:
export async function apiFetchWithRetry<T>(path: string, options?: RequestInit) {
  try {
    return await apiFetch<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      // Try to refresh token
      try {
        const { accessToken } = await refreshToken();
        localStorage.setItem('accessToken', accessToken);
        // Retry original request
        return await apiFetch<T>(path, options);
      } catch {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw error;
      }
    }
    throw error;
  }
}
```

---

## **✅ CHECKLIST**

### **Backend**
- [ ] `.env` has DATABASE_URL
- [ ] `.env` has JWT_ACCESS_SECRET
- [ ] `.env` has JWT_REFRESH_SECRET
- [ ] `npm run db:push` successful
- [ ] `npm run dev` runs on port 5000
- [ ] `curl http://localhost:5000/health` works

### **Frontend**
- [ ] `src/lib/api.ts` created
- [ ] `src/services/auth.ts` created
- [ ] `src/contexts/AuthContext.tsx` created
- [ ] `App.tsx` wrapped with AuthProvider
- [ ] `Login.tsx` updated
- [ ] `SignUp.tsx` updated
- [ ] `Profile.tsx` updated
- [ ] `.env.local` has VITE_API_BASE_URL
- [ ] `npm run dev` runs on port 8080

### **Testing**
- [ ] Can sign up new user
- [ ] Redirected to /profile after signup
- [ ] See real user data on profile
- [ ] Can logout
- [ ] Can login with username
- [ ] Can login with email
- [ ] Profile loads user data

---

**That's it!** You now have full end-to-end authentication working. Let me know if you hit any errors and I'll help debug! 🚀