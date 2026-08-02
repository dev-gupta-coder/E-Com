import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders } from '../features/orders/orderSlice'

function OrderHistoryPage() {
  const dispatch = useDispatch()
  const { items: orders, status, error } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-h1 text-gray-900">Order History</h1>

      {status === 'loading' && <p className="mt-6 text-sm text-gray-500">Loading orders…</p>}

      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {status === 'succeeded' && orders.length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">You haven&apos;t placed any orders yet.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Browse products
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order._id.slice(-8)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                {order.items.map((item) => (
                  <li key={item.product} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate pr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">Payment: {order.paymentMethod}</span>
                <span className="text-sm font-semibold text-gray-900">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default OrderHistoryPage
