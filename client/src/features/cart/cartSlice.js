import { createSlice } from '@reduxjs/toolkit'
// Step 14 (BUILD-STEPS.md): real cart slice (add/update/remove thunks)

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {},
})

export default cartSlice.reducer
