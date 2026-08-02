import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { placeOrderRequest, fetchMyOrdersRequest, fetchAllOrdersRequest } from './orderAPI'

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.'

export const placeOrder = createAsyncThunk('orders/placeOrder', async (shippingAddress, { rejectWithValue }) => {
  try {
    const res = await placeOrderRequest(shippingAddress)
    return res.data.order
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchMyOrdersRequest()
    return res.data.orders
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const fetchAllOrders = createAsyncThunk('orders/fetchAllOrders', async (params, { rejectWithValue }) => {
  try {
    const res = await fetchAllOrdersRequest(params)
    return res.data
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    // Separate from `status`/`error` above (the order-history list) --
    // placing an order and viewing history are independent concerns, same
    // separation used for products/cart in earlier steps.
    placeStatus: 'idle',
    placeError: null,
    // A THIRD independent concern: the admin's view of every customer's
    // orders. Kept fully separate from the customer's own `items` above --
    // an admin viewing all orders must never overwrite their own order
    // history state, and vice versa.
    adminItems: [],
    adminTotal: 0,
    adminPage: 1,
    adminPages: 1,
    adminStatus: 'idle',
    adminError: null,
  },
  reducers: {
    // Redux state survives across route navigation (unlike component-local
    // useState), so without this, revisiting /checkout after a previous
    // attempt would show that attempt's stale success/error state.
    resetPlaceOrderState: (state) => {
      state.placeStatus = 'idle'
      state.placeError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(placeOrder.pending, (state) => {
        state.placeStatus = 'loading'
        state.placeError = null
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.placeStatus = 'succeeded'
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placeStatus = 'failed'
        state.placeError = action.payload
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.adminStatus = 'loading'
        state.adminError = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.adminStatus = 'succeeded'
        state.adminItems = action.payload.orders
        state.adminTotal = action.payload.total
        state.adminPage = action.payload.page
        state.adminPages = action.payload.pages
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.adminStatus = 'failed'
        state.adminError = action.payload
      })
  },
})

export const { resetPlaceOrderState } = orderSlice.actions
export default orderSlice.reducer
