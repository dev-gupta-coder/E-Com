import axiosInstance from '../../api/axiosInstance'

export const fetchProductsRequest = (params) => axiosInstance.get('/products', { params })
export const fetchProductByIdRequest = (id) => axiosInstance.get(`/products/${id}`)
export const createProductRequest = (data) => axiosInstance.post('/products', data)
export const updateProductRequest = (id, data) => axiosInstance.put(`/products/${id}`, data)
export const deleteProductRequest = (id) => axiosInstance.delete(`/products/${id}`)
