import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProductsRequest, fetchProductByIdRequest } from './productAPI'

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.'

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const res = await fetchProductsRequest(params)
    return res.data
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const res = await fetchProductByIdRequest(id)
    return res.data.product
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

const productSlice = createSlice({
  name: 'products',
  // List state (items/status/error) and single-product state (current/currentStatus/
  // currentError) are kept separate -- Home and Detail are independent views, and
  // sharing one status field would make navigating between them flip state neither
  // page owns.
  initialState: {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    status: 'idle',
    error: null,
    current: null,
    currentStatus: 'idle',
    currentError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.products
        state.total = action.payload.total
        state.page = action.payload.page
        state.pages = action.payload.pages
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchProductById.pending, (state) => {
        state.currentStatus = 'loading'
        state.currentError = null
        state.current = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.currentError = action.payload
      })
  },
})

export default productSlice.reducer
