//src/features/orders/orderAPI.js
import axiosInstance from '../../api/axiosInstance'

export const placeOrderRequest = (shippingAddress) => axiosInstance.post('/orders', { shippingAddress })
export const fetchMyOrdersRequest = () => axiosInstance.get('/orders/my')
export const fetchAllOrdersRequest = (params) => axiosInstance.get('/orders', { params })
