import axiosInstance from '../../api/axiosInstance'

export const registerRequest = (data) => axiosInstance.post('/auth/register', data)
export const loginRequest = (data) => axiosInstance.post('/auth/login', data)
export const logoutRequest = () => axiosInstance.post('/auth/logout')
export const meRequest = () => axiosInstance.get('/auth/me')
