import axiosInstance from '../../api/axiosInstance'

export const fetchCartRequest = () => axiosInstance.get('/cart')
export const addCartItemRequest = (productId, quantity) => axiosInstance.post('/cart/items', { productId, quantity })
export const updateCartItemRequest = (productId, quantity) =>
  axiosInstance.patch(`/cart/items/${productId}`, { quantity })
export const removeCartItemRequest = (productId) => axiosInstance.delete(`/cart/items/${productId}`)
