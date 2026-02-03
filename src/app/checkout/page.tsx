'use client'

import {useStore} from '@/lib/store'
import {useRouter} from 'next/navigation'

export default function Page() {
    const {cart, products, checkout} = useStore()
    const router = useRouter()

    const cartProducts = cart.map(item => {
        const product = products.find(p => p.id === item.id)
        return {...item, product}
    })

    const total = cartProducts.reduce((sum, item) => sum + (item.product?.price || 0) * item.qty, 0)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        alert('Checkout successful!')
        checkout()
        router.push('/store')
    }

    return (
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Contact information</h2>

                <div className="mt-4">
                    <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                            type="email"
                            id="email-address"
                            name="email-address"
                            autoComplete="email"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-10 lg:mt-0">
                <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>

                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                            First name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="first-name"
                                name="first-name"
                                autoComplete="given-name"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                            Last name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="last-name"
                                name="last-name"
                                autoComplete="family-name"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="address"
                                id="address"
                                autoComplete="street-address"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="city"
                                id="city"
                                autoComplete="address-level2"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
                            Postal code
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="postal-code"
                                id="postal-code"
                                autoComplete="postal-code"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">Payment</h2>

                    <fieldset className="mt-4">
                        <legend className="sr-only">Payment type</legend>
                        <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                            <div className="flex items-center">
                                <input
                                    id="credit-card"
                                    name="payment-type"
                                    type="radio"
                                    defaultChecked
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                                    Credit card
                                </label>
                            </div>
                        </div>
                    </fieldset>

                    <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
                        <div className="col-span-4">
                            <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                                Card number
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="card-number"
                                    name="card-number"
                                    autoComplete="cc-number"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="col-span-4">
                            <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700">
                                Name on card
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="name-on-card"
                                    name="name-on-card"
                                    autoComplete="cc-name"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="col-span-3">
                            <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
                                Expiration date (MM/YY)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="expiration-date"
                                    id="expiration-date"
                                    autoComplete="cc-exp"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                                CVC
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="cvc"
                                    id="cvc"
                                    autoComplete="csc"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                    <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <h3 className="sr-only">Items in your cart</h3>
                        <ul role="list" className="divide-y divide-gray-200">
                            {cartProducts.map(({id, qty, product}) => (
                                <li key={id} className="flex px-4 py-6 sm:px-6">
                                    <div className="flex-shrink-0">
                                        <img src={product?.image} alt={product?.description} className="w-20 rounded-md" />
                                    </div>

                                    <div className="ml-6 flex flex-1 flex-col">
                                        <div className="flex">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm">
                                                    <a href={`/products/${product?.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                        {product?.name}
                                                    </a>
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-500">Qty: {qty}</p>
                                            </div>

                                            <div className="ml-4 flow-root flex-shrink-0">
                                                <p className="mt-1 text-sm font-medium text-gray-900">${(product?.price || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm">Subtotal</dt>
                                <dd className="text-sm font-medium text-gray-900">${total.toFixed(2)}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-sm">Shipping</dt>
                                <dd className="text-sm font-medium text-gray-900">$0.00</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                                <dt className="text-base font-medium">Total</dt>
                                <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
                            </div>
                        </dl>

                        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                            <form onSubmit={handleSubmit}>
                                <button
                                    type="submit"
                                    className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                >
                                    Confirm order
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}