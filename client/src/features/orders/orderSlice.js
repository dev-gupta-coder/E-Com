import { createSlice } from '@reduxjs/toolkit'
// Step 15 (BUILD-STEPS.md): real order slice (checkout, order history thunks)

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [] },
  reducers: {},
})

export default orderSlice.reducer
