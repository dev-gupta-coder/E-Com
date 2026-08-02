import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Star, Heart } from 'lucide-react'
import { fetchProductById } from '../features/products/productSlice'

const STOCK_LOW_THRESHOLD = 5

function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { current: product, currentStatus, currentError } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProductById(id))
  }, [dispatch, id])

  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return <p className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-500">Loading product…</p>
  }

  if (currentStatus === 'failed') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{currentError}</div>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Back to products
        </Link>
      </div>
    )
  }

  const image = product.images?.[0]
  const stockLabel =
    product.stock === 0 ? (
      <span className="text-sm font-medium text-red-600">Out of stock</span>
    ) : product.stock <= STOCK_LOW_THRESHOLD ? (
      <span className="text-sm font-medium text-amber-600">Only {product.stock} left</span>
    ) : (
      <span className="text-sm font-medium text-green-600">In stock</span>
    )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
        &larr; Back to products
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">No image</div>
          )}
        </div>

        <div>
          <p className="text-xs capitalize text-gray-500">{product.category}</p>
          <h1 className="text-h1 mt-1 text-gray-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-1" title="No reviews yet">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="text-gray-300" />
            ))}
            <span className="ml-1 text-xs text-gray-400">No reviews yet</span>
          </div>

          <p className="mt-4 text-2xl font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>

          <div className="mt-2">{stockLabel}</div>

          <p className="mt-4 text-base leading-6 text-gray-700">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled
              title="Wishlist — coming soon"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:cursor-not-allowed"
            >
              <Heart size={18} />
            </button>
            <button
              type="button"
              disabled={product.stock === 0}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
