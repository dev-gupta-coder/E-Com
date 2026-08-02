import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchCartRequest,
  addCartItemRequest,
  updateCartItemRequest,
  removeCartItemRequest,
} from './cartAPI'

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.'

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchCartRequest()
    return res.data.cart
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const addCartItem = createAsyncThunk(
  'cart/addCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await addCartItemRequest(productId, quantity)
      return res.data.cart
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await updateCartItemRequest(productId, quantity)
      return res.data.cart
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (productId, { rejectWithValue }) => {
  try {
    const res = await removeCartItemRequest(productId)
    return res.data.cart
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    // Which single product currently has a mutation in flight -- lets the UI
    // show a loading state on just that row/card, not the whole cart/page.
    mutatingProductId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // action.meta.arg is the exact argument the thunk was called with --
      // Redux Toolkit attaches it automatically to every pending/fulfilled/
      // rejected action, which is how the productId being mutated is known
      // here without any extra plumbing.
      .addCase(addCartItem.pending, (state, action) => {
        state.mutatingProductId = action.meta.arg.productId
        state.error = null
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.mutatingProductId = null
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.error = action.payload
        state.mutatingProductId = null
      })

      .addCase(updateCartItem.pending, (state, action) => {
        state.mutatingProductId = action.meta.arg.productId
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.mutatingProductId = null
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload
        state.mutatingProductId = null
      })

      .addCase(removeCartItem.pending, (state, action) => {
        state.mutatingProductId = action.meta.arg
        state.error = null
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.mutatingProductId = null
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload
        state.mutatingProductId = null
      })
  },
})

export default cartSlice.reducer
