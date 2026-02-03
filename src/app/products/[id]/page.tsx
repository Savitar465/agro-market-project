'use client'

import {useStore} from '@/lib/store'
import {useRouter} from 'next/navigation'
import {useState, use} from 'react'

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const {products, addToCart} = useStore()
    const product = products.find(p => p.id === id)
    const router = useRouter()
    const [qty, setQty] = useState(1)

    if (!product) {
        return <div>Product not found</div>
    }

    const handleAddToCart = () => {
        addToCart(product.id, qty)
        router.push('/cart')
    }

    return (
        <div className="bg-white">
            <div className="pt-6">
                {/* Image gallery */}
                <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
                    <div className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block">
                        <img
                            src={product.images?.[0] || product.image}
                            alt={product.description}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                    <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
                        <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                            <img
                                src={product.images?.[1] || product.image}
                                alt={product.description}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                        <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                            <img
                                src={product.images?.[2] || product.image}
                                alt={product.description}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                    </div>
                    <div className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg">
                        <img
                            src={product.image}
                            alt={product.description}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                </div>

                {/* Product info */}
                <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
                    <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>
                    </div>

                    {/* Options */}
                    <div className="mt-4 lg:row-span-3 lg:mt-0">
                        <h2 className="sr-only">Product information</h2>
                        <div className="flex items-center justify-between">
                            <p className="text-3xl tracking-tight text-gray-900">${product.price.toFixed(2)}</p>
                            {product.stock !== undefined && (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            )}
                        </div>

                        <div className="mt-10">
                            <div className="flex items-center">
                                <label htmlFor="quantity" className="mr-4 text-gray-900">Quantity</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => setQty(parseInt(e.target.value))}
                                    max={product.stock ?? 999}
                                    className="w-20 rounded border-gray-300 px-3 py-1.5 text-gray-900"
                                />
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`mt-10 flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {product.stock === 0 ? 'Out of stock' : 'Add to bag'}
                            </button>
                        </div>
                    </div>

                    <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
                        {/* Description and details */}
                        <div>
                            <h3 className="sr-only">Description</h3>

                            <div className="space-y-6">
                                <p className="text-base text-gray-900">{product.description}</p>
                            </div>
                        </div>

                        {product.seller && (
                            <div className="mt-10">
                                <h3 className="text-sm font-medium text-gray-900">Seller</h3>

                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">{product.seller.name}</p>
                                    <p className="text-sm text-gray-600">{product.seller.location}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}