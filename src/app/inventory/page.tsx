'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import Link from 'next/link'

export default function InventoryPage() {
  const { products, updateStock, deleteProduct } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempStock, setTempStock] = useState<number>(0)

  const handleEditStock = (id: string, currentStock: number) => {
    setEditingId(id)
    setTempStock(currentStock)
  }

  const handleSaveStock = (id: string) => {
    updateStock(id, tempStock)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products in your store including their name, category, and current stock levels.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add product
          </Link>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Product
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stock
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-gray-500">{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {editingId === product.id ? (
                          <input
                            type="number"
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={tempStock}
                            onChange={(e) => setTempStock(parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          <span className={product.stock && product.stock < 10 ? "text-red-600 font-bold" : ""}>
                            {product.stock ?? 0}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.stock && product.stock > 0 ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {editingId === product.id ? (
                          <button
                            onClick={() => handleSaveStock(product.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Save
                          </button>
                        ) : (
                          <>
                            <Link
                                href={`/inventory/edit/${product.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleEditStock(product.id, product.stock ?? 0)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                                Stock
                            </button>
                            <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900"
                            >
                                Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
