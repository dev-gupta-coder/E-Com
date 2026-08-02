import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Star, Heart } from 'lucide-react'
import { addCartItem } from '../features/cart/cartSlice'
import { useAuth } from '../hooks/useAuth'

// Not specified anywhere in DATABASE.md -- a reasonable, easily-changed default
// for when "low stock" warning styling kicks in.
const STOCK_LOW_THRESHOLD = 5

function StockStatus({ stock }) {
  if (stock === 0) {
    return <span className="text-sm font-medium text-red-600">Out of stock</span>
  }
  if (stock <= STOCK_LOW_THRESHOLD) {
    return <span className="text-sm font-medium text-amber-600">Only {stock} left</span>
  }
  return <span className="text-sm font-medium text-green-600">In stock</span>
}

function ProductCard({ product }) {
  const image = product.images?.[0]
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const mutatingProductId = useSelector((state) => state.cart.mutatingProductId)
  const isAdding = mutatingProductId === product._id

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    dispatch(addCartItem({ productId: product._id, quantity: 1 }))
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* 1. Image */}
      <Link to={`/products/${product._id}`}>
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">No image</div>
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-1">
        {/* 2. Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-indigo-600">{product.name}</h3>
        </Link>

        {/* 3. Category */}
        <p className="text-xs capitalize text-gray-500">{product.category}</p>

        {/* 4. Price */}
        <p className="text-base font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>

        {/* 5. Rating -- no reviews feature exists yet (PRD.md non-goal); shown
            honestly as empty rather than a fabricated number. */}
        <div className="flex items-center gap-1" title="No reviews yet">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className="text-gray-300" />
          ))}
          <span className="ml-1 text-xs text-gray-400">No reviews yet</span>
        </div>

        {/* 6. Stock status */}
        <StockStatus stock={product.stock} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {/* 7. Wishlist -- no wishlist feature exists yet (PRD.md non-goal);
            present but disabled rather than silently non-functional. The
            "Soon" label is always visible (not hover-only) per
            DESIGN-SYSTEM.md §14 -- title alone would fail on touch devices. */}
        <button
          type="button"
          disabled
          title="Wishlist — coming soon"
          aria-label="Wishlist — coming soon"
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-gray-400 disabled:cursor-not-allowed"
        >
          <Heart size={16} />
          <span className="text-xs">Soon</span>
        </button>

        {/* 8. Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAdding ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
