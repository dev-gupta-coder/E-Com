import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import productReducer from '../features/products/productSlice'
// Step 14+ (BUILD-STEPS.md): import cartReducer, orderReducer here as each
// slice gets built

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    // cart: cartReducer,
    // orders: orderReducer,
  },
})
