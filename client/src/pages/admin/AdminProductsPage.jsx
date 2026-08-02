import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowUpDown, Pencil, Trash2, X } from 'lucide-react'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  resetMutationState,
} from '../../features/products/productSlice'

// No endpoint exposes the valid category list -- this must match the
// backend's Product.CATEGORIES exactly (DATABASE.md §3). Two places to keep
// in sync, unavoidable without a dedicated endpoint.
const CATEGORIES = ['electronics', 'clothing', 'home', 'books', 'other']

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  imageUrl: '',
}

function AdminProductsPage() {
  const dispatch = useDispatch()
  const { items, status, error, page, pages, mutationStatus, mutationError, deletingId } = useSelector(
    (state) => state.products
  )

  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 12, category: categoryFilter || undefined }))
  }, [dispatch, categoryFilter])

  // Search and sort operate ONLY on the current page's already-loaded rows --
  // the backend has no text-search or sort param (only category/minPrice/
  // maxPrice/page/limit), so this is a real, honest limitation, not a full
  // catalog search. Category filtering above, by contrast, re-queries the
  // server for real.
  const visibleRows = useMemo(() => {
    let rows = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const diff = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0
        return sortDir === 'asc' ? diff : -diff
      })
    }
    return rows
  }, [items, search, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    dispatch(resetMutationState())
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      imageUrl: product.images?.[0] || '',
    })
    dispatch(resetMutationState())
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const refetchCurrentPage = () => {
    dispatch(fetchProducts({ page, limit: 12, category: categoryFilter || undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      images: form.imageUrl ? [form.imageUrl] : [],
    }

    const action = editingId ? updateProduct({ id: editingId, data }) : createProduct(data)
    const result = await dispatch(action)

    if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      setModalOpen(false)
      refetchCurrentPage()
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return
    }
    const result = await dispatch(deleteProduct(product._id))
    if (deleteProduct.fulfilled.match(result)) {
      refetchCurrentPage()
    }
  }

  const isSubmitting = mutationStatus === 'loading'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-gray-900">Products</h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Add Product
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search this page by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p className="mt-6 text-sm text-gray-500">Loading products…</p>}
      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {status === 'succeeded' && (
        <div className="mt-6 max-h-[600px] overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Image</th>
                {[
                  ['name', 'Name'],
                  ['category', 'Category'],
                  ['price', 'Price'],
                  ['stock', 'Stock'],
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
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {visibleRows.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                          None
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-gray-600">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        aria-label={`Edit ${product.name}`}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-indigo-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product._id}
                        aria-label={`Delete ${product.name}`}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No products match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => dispatch(fetchProducts({ page: page - 1, limit: 12, category: categoryFilter || undefined }))}
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
            onClick={() => dispatch(fetchProducts({ page: page + 1, limit: 12, category: categoryFilter || undefined }))}
            disabled={page >= pages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-gray-900">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={closeModal} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {mutationError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{mutationError}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={form.description}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-900">
                    Price (₹)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-900">
                    Stock
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={form.category}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-900">
                  Image URL <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="text"
                  value={form.imageUrl}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Saving…' : editingId ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
