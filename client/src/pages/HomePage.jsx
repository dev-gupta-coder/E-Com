import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../features/products/productSlice'
import ProductCard from '../components/ProductCard'

function HomePage() {
  const dispatch = useDispatch()
  const { items, status, error, page, pages } = useSelector((state) => state.products)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit: 12 }))
  }, [dispatch, currentPage])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-h1 text-gray-900">Products</h1>

      {status === 'loading' && <p className="mt-6 text-sm text-gray-500">Loading products…</p>}

      {status === 'failed' && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {status === 'succeeded' && items.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">No products found.</p>
      )}

      {status === 'succeeded' && items.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pages))}
                disabled={page >= pages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
