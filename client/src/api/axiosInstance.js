import axios from 'axios'

// Step 11 (BUILD-STEPS.md): base config + interceptors (401 -> refresh -> retry)
// get built here
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export default axiosInstance
