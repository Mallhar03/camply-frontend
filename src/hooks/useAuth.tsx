// Re-export shim — keeps backward compat with any import from '@/hooks/useAuth'
// Source of truth is now '@/contexts/AuthContext' (upstream pattern)
export { useAuth, AuthProvider } from '@/contexts/AuthContext';
export type { } from '@/contexts/AuthContext';
