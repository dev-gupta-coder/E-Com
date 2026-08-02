import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2 } from 'lucide-react'
import { placeOrder, resetPlaceOrderState } from '../features/orders/orderSlice'
import { fetchCart } from '../features/cart/cartSlice'

const INITIAL_ADDRESS = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
}

function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: cartItems, status: cartStatus } = useSelector((state) => state.cart)
  const { placeStatus, placeError } = useSelector((state) => state.orders)
  const [address, setAddress] = useState(INITIAL_ADDRESS)

  useEffect(() => {
    dispatch(resetPlaceOrderState())
    // Cannot assume some other page already populated Redux's cart state --
    // a user arriving via a direct URL, bookmark, or refresh would otherwise
    // see a false "cart is empty" even with a real cart on the server. Same
    // self-sufficient pattern already used by CartPage/HomePage/ProductDetailPage.
    dispatch(fetchCart())
  }, [dispatch])

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const isSubmitting = placeStatus === 'loading'

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(placeOrder(address))
    if (placeOrder.fulfilled.match(result)) {
      dispatch(fetchCart())
    }
  }

  // Must be checked BEFORE the empty-cart case below: a successful order
  // triggers a cart refetch above, which will make cartItems.length === 0 --
  // without this ordering, success would incorrectly fall through to the
  // "your cart is empty" branch instead of showing the confirmation.
  if (placeStatus === 'succeeded') {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={40} />
          <h1 className="text-h2 mt-4 text-gray-900">Order placed successfully</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your order has been confirmed and will be delivered via Cash on Delivery.
          </p>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            View Order History
          </button>
        </div>
      </div>
    )
  }

  // Gated on a CONFIRMED fetch, not just array length: right after mount,
  // cartItems is still [] from the fresh store while fetchCart() is in
  // flight -- checking length alone would flash "cart is empty" for a user
  // who actually has a full cart, every single time, not just occasionally.
  if (cartStatus === 'idle' || cartStatus === 'loading') {
    return <p className="mx-auto max-w-xl px-4 py-8 text-sm text-gray-500">Loading your cart…</p>
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Your cart is empty — add something before checking out.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-h1 text-gray-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 md:col-span-2">
          {placeError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{placeError}</div>}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-900">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              value={address.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              value={address.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-900">
              Address line 1
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              required
              autoComplete="address-line1"
              value={address.addressLine1}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-900">
              Address line 2 <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              autoComplete="address-line2"
              value={address.addressLine2}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-900">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                autoComplete="address-level2"
                value={address.city}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-900">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                autoComplete="address-level1"
                value={address.state}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-900">
              Pincode
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              required
              autoComplete="postal-code"
              value={address.pincode}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Placing order…' : 'Place Order'}
          </button>
        </form>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>
          <ul className="mt-3 space-y-2">
            {cartItems.map((item) => (
              <li key={item.product._id} className="flex justify-between text-sm text-gray-600">
                <span className="truncate pr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="flex-shrink-0">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">Payment: Cash on Delivery</p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
