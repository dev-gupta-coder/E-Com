import { Component } from 'react'
import { Link } from 'react-router-dom'

// Error boundaries have no hook equivalent yet -- this must be a class
// component; it's the only way React lets you catch a render error in a
// child subtree instead of unmounting the entire app (see the CartPage
// incident this was added in response to).
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-h2 text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-500">
            This page hit an unexpected error. Try reloading, or head back home.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Reload
            </button>
            <Link
              to="/"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
