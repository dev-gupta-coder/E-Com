import { configureStore } from '@reduxjs/toolkit'
// Step 12+ (BUILD-STEPS.md): import authReducer, productReducer, cartReducer,
// orderReducer here as each slice gets built

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // products: productReducer,
    // cart: cartReducer,
    // orders: orderReducer,
  },
})
