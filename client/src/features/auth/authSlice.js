import { createSlice } from '@reduxjs/toolkit'
// Step 12 (BUILD-STEPS.md): real auth slice (login/register/logout thunks, user state)

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false },
  reducers: {},
})

export default authSlice.reducer
