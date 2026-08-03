import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { fetchCart, updateCartItem, removeCartItem } from '../features/cart/cartSlice'

function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, status, error, mutatingProductId } = useSelector((state) => state.cart)

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  // A cart item's `product` comes back null when the referenced product has
  // since been deleted (Mongoose populate() can't resolve a dangling ref) --
  // rendering item.product.price unguarded crashes the whole app (see
  // ErrorBoundary in App.jsx for what that costs). Orphaned items are hidden
  // rather than shown broken; the notice below tells the user why the count
  // might look lower than expected.
  const validItems = items.filter((item) => item.product)
  const orphanedCount = items.length - validItems.length
  const total = validItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-h1 text-gray-900">Your Cart</h1>

      {status === 'loading' && <p className="mt-6 text-sm text-gray-500">Loading cart…</p>}

      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {status === 'succeeded' && orphanedCount > 0 && (
        <div className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {orphanedCount} item{orphanedCount > 1 ? 's' : ''} in your cart{' '}
          {orphanedCount > 1 ? 'are' : 'is'} no longer available and{' '}
          {orphanedCount > 1 ? 'were' : 'was'} removed from view.
        </div>
      )}

      {status === 'succeeded' && validItems.length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Your cart is empty.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Browse products
          </Link>
        </div>
      )}

      {validItems.length > 0 && (
        <>
          <ul className="mt-6 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {validItems.map((item) => {
              const isMutating = mutatingProductId === item.product._id
              return (
                <li key={item.product._id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">₹{item.product.price.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(updateCartItem({ productId: item.product._id, quantity: item.quantity - 1 }))
                      }
                      disabled={isMutating || item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.product.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm text-gray-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(updateCartItem({ productId: item.product._id, quantity: item.quantity + 1 }))
                      }
                      disabled={isMutating || item.quantity >= item.product.stock}
                      aria-label={`Increase quantity of ${item.product.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="w-20 flex-shrink-0 text-right text-sm font-semibold text-gray-900">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </p>

                  <button
                    type="button"
                    onClick={() => dispatch(removeCartItem(item.product._id))}
                    disabled={isMutating}
                    aria-label={`Remove ${item.product.name} from cart`}
                    className="text-gray-400 hover:text-red-600 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
            <span className="text-sm font-medium text-gray-500">Total</span>
            <span className="text-xl font-semibold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  )
}

export default CartPage
