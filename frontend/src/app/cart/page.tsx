'use client'

import {useStore} from '@/lib/store'
import Link from 'next/link'

export default function Page() {
    const {cart, products, setQty, removeFromCart} = useStore()

    const cartProducts = cart.map(item => {
        const product = products.find(p => p.id === item.id)
        return {...item, product}
    })

    const total = cartProducts.reduce((sum, item) => sum + (item.product?.price || 0) * item.qty, 0)

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-8">Shopping Cart</h1>

            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {cartProducts.map(({id, qty, product}) => (
                                <li key={id} className="flex py-6">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <img
                                            src={product?.image}
                                            alt={product?.description}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>

                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3>
                                                    <Link href={`/products/${product?.id}`}>{product?.name}</Link>
                                                </h3>
                                                <p className="ml-4">${(product?.price || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <div className="flex items-center">
                                                <label htmlFor={`quantity-${id}`} className="mr-2">Quantity</label>
                                                <input
                                                    type="number"
                                                    id={`quantity-${id}`}
                                                    name={`quantity-${id}`}
                                                    min="1"
                                                    value={qty}
                                                    onChange={(e) => setQty(id, parseInt(e.target.value))}
                                                    className="w-16 rounded border-gray-300 px-2 py-1"
                                                />
                                            </div>

                                            <div className="flex">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(id)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-8 md:border-t-0 md:pt-0">
                        <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">Subtotal</p>
                                <p className="text-sm font-medium text-gray-900">${total.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">Shipping</p>
                                <p className="text-sm font-medium text-gray-900">$0.00</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <p className="text-base font-medium text-gray-900">Order total</p>
                                <p className="text-base font-medium text-gray-900">${total.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link
                                href="/checkout"
                                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}