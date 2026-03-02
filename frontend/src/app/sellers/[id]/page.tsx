'use client'

import {useStore} from '@/lib/store'
import {useRouter} from 'next/navigation'
import {categories, Product} from '@/data/products'
import {useForm} from "react-hook-form";
import Link from "next/link";
import {use} from "react";

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const {sellers, products, addProduct} = useStore()
    const seller = sellers.find(s => s.id === id)
    const sellerProducts = products.filter(p => seller?.productIds.includes(p.id))
    const router = useRouter()
    const {register, handleSubmit} = useForm<Product>()

    if (!seller) {
        return <div>Seller not found</div>
    }

    const onSubmit = (data: Product) => {
        addProduct(data, seller.id)
        router.refresh()
    }

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-8">{seller.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Products</h2>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                        {sellerProducts.map((product) => (
                            <Link key={product.id} href={`/products/${product.id}`} className="group">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                                    <img
                                        src={product.image}
                                        alt={product.description}
                                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                                    />
                                </div>
                                <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                                <p className="mt-1 text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add a new product</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Product name
                            </label>
                            <div className="mt-2">
                                <div
                                    className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                <input
                                    {...register('name', {required: true})}
                                    type="text"
                                    id="name"
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                                />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <div className="mt-2">
                                <div
                                    className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                <textarea
                                    {...register('description', {required: true})}
                                    id="description"
                                    rows={3}
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                                />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                Price
                            </label>
                            <div className="mt-2">
                                <div
                                    className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                <input
                                    {...register('price', {required: true, valueAsNumber: true})}
                                    type="number"
                                    id="price"
                                    step="0.01"
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                                />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <div className="mt-2">
                                <div
                                    className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                <select
                                    {...register('category', {required: true})}
                                    id="category"
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                                >
                                    {categories.map(c => <option key={c}>{c}</option>)
                                    }
                                </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                Image URL
                            </label>
                            <div className="mt-2">
                                <div
                                    className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                <input
                                    {...register('image', {required: true})}
                                    type="url"
                                    id="image"
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                                />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Add Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
