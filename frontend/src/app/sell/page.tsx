'use client'

import {useStore} from '@/lib/store'
import {useRouter} from 'next/navigation'
import {categories, Product} from '@/data/products'
import {useForm} from "react-hook-form";
import {useEffect} from 'react'

export default function Page() {
    const {addProduct, userCoords, setUserCoords} = useStore()
    const router = useRouter()
    const {register, handleSubmit} = useForm<Product>()

    useEffect(() => {
        if (!userCoords) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (error) => {
                    console.error("Error getting location", error)
                }
            )
        }
    }, [userCoords, setUserCoords])

    const onSubmit = async (data: Product) => {
        const productWithCoords = {
            ...data,
            seller: {
                ...data.seller,
                id: 'default', // Using default for now
                name: 'Current User',
                coords: userCoords || undefined
            }
        }

        try {
            await addProduct(productWithCoords, 'default')
            router.push('/inventory')
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to create product')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Add a new product</h3>
                        <p className="mt-1 text-sm text-gray-500">This information will be displayed publicly so be
                            careful what you share.</p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
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

                        <div className="sm:col-span-6">
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
                            <p className="mt-2 text-sm text-gray-500">Write a few sentences about the product.</p>
                        </div>

                        <div className="sm:col-span-3">
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

                        <div className="sm:col-span-3">
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

                        <div className="sm:col-span-3">
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                                Initial Stock
                            </label>
                            <div className="mt-2">
                                <div
                                    className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                <input
                                    {...register('stock', {required: true, valueAsNumber: true})}
                                    type="number"
                                    id="stock"
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                                />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
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
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Save
                    </button>
                </div>
            </div>
        </form>
    )
}