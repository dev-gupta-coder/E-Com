import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchProductsRequest,
  fetchProductByIdRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
} from './productAPI'

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

export const createProduct = createAsyncThunk('products/createProduct', async (data, { rejectWithValue }) => {
  try {
    const res = await createProductRequest(data)
    return res.data.product
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await updateProductRequest(id, data)
    return res.data.product
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await deleteProductRequest(id)
    return id
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

const productSlice = createSlice({
  name: 'products',
  // List state (items/status/error) and single-product state (current/currentStatus/
  // currentError) are kept separate -- Home and Detail are independent views, and
  // sharing one status field would make navigating between them flip state neither
  // page owns. mutationStatus/mutationError belong to the admin create/edit form --
  // create and update share one field since only one form is ever open at a time.
  // deletingId is separate: delete is a direct per-row action with no form, so it
  // needs to disable just the one row being deleted, not the whole table.
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
    mutationStatus: 'idle',
    mutationError: null,
    deletingId: null,
  },
  reducers: {
    resetMutationState: (state) => {
      state.mutationStatus = 'idle'
      state.mutationError = null
    },
  },
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
      .addCase(createProduct.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = null
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded'
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = null
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded'
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload
      })
      .addCase(deleteProduct.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload)
        state.deletingId = null
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload
        state.deletingId = null
      })
  },
})

export const { resetMutationState } = productSlice.actions
export default productSlice.reducer
