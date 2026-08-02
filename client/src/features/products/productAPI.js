import axiosInstance from '../../api/axiosInstance'

export const fetchProductsRequest = (params) => axiosInstance.get('/products', { params })
export const fetchProductByIdRequest = (id) => axiosInstance.get(`/products/${id}`)
