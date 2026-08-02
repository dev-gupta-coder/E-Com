import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowUpDown } from 'lucide-react'
import { fetchAllOrders } from '../../features/orders/orderSlice'

function AdminOrdersPage() {
  const dispatch = useDispatch()
  const { adminItems, adminStatus, adminError, adminPage, adminPages } = useSelector((state) => state.orders)

  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    dispatch(fetchAllOrders({ page: 1, limit: 12 }))
  }, [dispatch])

  // Same honesty as AdminProductsPage: GET /api/orders only supports
  // page/limit -- no status filter, no sort param. Both operate on the
  // current page's already-loaded rows only, not the full order history.
  const visibleRows = useMemo(() => {
    let rows = adminItems
    if (statusFilter) {
      rows = rows.filter((o) => o.status === statusFilter)
    }
    rows = [...rows].sort((a, b) => {
      const diff = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0
      return sortDir === 'asc' ? diff : -diff
    })
    return rows
  }, [adminItems, statusFilter, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const goToPage = (p) => dispatch(fetchAllOrders({ page: p, limit: 12 }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-h1 text-gray-900">All Orders</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All statuses</option>
          <option value="placed">Placed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {adminStatus === 'loading' && <p className="mt-6 text-sm text-gray-500">Loading orders…</p>}
      {adminError && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{adminError}</div>}

      {adminStatus === 'succeeded' && (
        <div className="mt-6 max-h-[600px] overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                {[
                  ['createdAt', 'Date'],
                  ['totalAmount', 'Total'],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 text-left font-medium text-gray-500">
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      {label}
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {visibleRows.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">#{order._id.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.user?.name || 'Unknown'}
                    <div className="text-xs text-gray-400">{order.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No orders match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {adminPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goToPage(adminPage - 1)}
            disabled={adminPage <= 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {adminPage} of {adminPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(adminPage + 1)}
            disabled={adminPage >= adminPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
