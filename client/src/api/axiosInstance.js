import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// A 401 from these endpoints is either meaningless to "refresh" (the refresh
// call failing on itself) or a normal business-logic response (wrong password
// on login) -- not "your session expired". Silent refresh must not run for these.
const REFRESH_EXEMPT_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'])

// /auth/me is called on every app load, for every visitor, logged in or not --
// it's the routine "am I logged in" check. It SHOULD still attempt a silent
// refresh (a legitimately logged-in user with just an expired access token
// must get the invisible-refresh treatment). But if refresh ALSO fails, that
// almost always just means "this visitor was never logged in" -- a completely
// normal state for a guest browsing public pages, not a reason to force a
// redirect. Force-redirecting here would bounce every anonymous visitor to
// /login on every page load, and since the redirect re-mounts the app (which
// calls /auth/me again), it would loop forever.
const SILENT_FAILURE_PATHS = new Set(['/auth/me'])

// Shared in-flight refresh promise. If multiple requests 401 at nearly the same
// moment, they all await this SAME promise instead of each firing their own
// POST /auth/refresh. Reset to null once it settles, so the next genuine
// expiry (30 minutes later) triggers a fresh refresh instead of reusing a
// long-stale resolved promise.

let refreshPromise = null
// These routes should not try to refresh the access token if they return 401.
const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axiosInstance.post('/auth/refresh').finally(() => {
      refreshPromise = null  //Resets refreshPromise after completion.
    })
  }
  return refreshPromise
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      !error.response ||
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      REFRESH_EXEMPT_PATHS.has(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await refreshAccessToken()
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      if (!SILENT_FAILURE_PATHS.has(originalRequest.url)) {
        window.location.href = '/login'
      }
      return Promise.reject(refreshError)
    }
  }
)

export default axiosInstance
