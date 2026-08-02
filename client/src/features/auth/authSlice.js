import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registerRequest, loginRequest, logoutRequest, meRequest } from './authAPI'

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.'

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await registerRequest(data)
    return res.data.user
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await loginRequest(data)
    return res.data.user
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutRequest()
  } catch (error) {
    // Best-effort: the user's intent is to end up logged out locally
    // regardless of whether the server call itself succeeds.
  }
})

// Called once on app load. A rejection here just means "not logged in" --
// not an error worth showing the user, so nothing is stored in `error`.
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const res = await meRequest()
    return res.data.user
  } catch (error) {
    return rejectWithValue(null)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
    initialized: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.initialized = true
      })
  },
})

export default authSlice.reducer
