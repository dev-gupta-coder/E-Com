// Step 12 (BUILD-STEPS.md): real auth hook (reads Redux auth state) gets built here
export function useAuth() {
  return { user: null, isAuthenticated: false }
}
