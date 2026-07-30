import { createSlice } from '@reduxjs/toolkit'
// Step 13 (BUILD-STEPS.md): real product slice (list/detail fetch thunks)

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false },
  reducers: {},
})

export default productSlice.reducer
