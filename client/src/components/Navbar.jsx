import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser } from '../features/auth/authSlice'
import { fetchCart, resetCart } from '../features/cart/cartSlice'

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, initialized } = useAuth()
  const cartItems = useSelector((state) => state.cart.items)
  const [mobileOpen, setMobileOpen] = useState(false)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Cart is login-gated (PRD.md §5.3), and nothing else fetches it on app
  // load -- only CartPage/CheckoutPage fetch it on their own mount. Without
  // this, the badge would read 0 for a returning logged-in user until they
  // actually visit /cart once.
  useEffect(() => {
    if (initialized && isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [initialized, isAuthenticated, dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    dispatch(resetCart())
    setMobileOpen(false)
    navigate('/')
  }

  const linkClass = 'text-sm font-medium text-gray-600 hover:text-gray-900'

  return (
    <nav className="sticky top-0 z-20 border-b border-white/40 bg-white/70 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          MERN Store
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {isAdmin && (
            <>
              <Link to="/admin/products" className={linkClass}>Manage Products</Link>
              <Link to="/admin/orders" className={linkClass}>All Orders</Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/orders" className={linkClass}>My Orders</Link>
          )}

          <Link to="/cart" className="relative text-gray-600 hover:text-gray-900" aria-label="Cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-medium text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className={linkClass}>Login</Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: cart icon always visible, rest behind a menu toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <Link to="/cart" className="relative text-gray-600" aria-label="Cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-medium text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="text-gray-600"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/40 bg-white/70 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {isAdmin && (
              <>
                <Link to="/admin/products" className="py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
                  Manage Products
                </Link>
                <Link to="/admin/orders" className="py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
                  All Orders
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link to="/orders" className="py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
                My Orders
              </Link>
            )}
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="py-2 text-left text-sm text-gray-700">
                Logout ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" className="py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
