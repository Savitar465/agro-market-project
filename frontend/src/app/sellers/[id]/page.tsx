'use client'

import {useStore} from '@/lib/store'
import Link from "next/link";
import {use} from "react";

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const {sellers, products} = useStore()
    const seller = sellers.find(s => s.id === id)
    const sellerProducts = products.filter(p => p.seller?.id === id)

    if (!seller) {
        return <div>Seller not found</div>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{seller.name}</h1>
            {seller.location && <p className="mt-1 text-sm text-gray-500">{seller.location}</p>}

            <h2 className="text-lg font-medium text-gray-900 mt-8 mb-4">Products</h2>
            {sellerProducts.length === 0 ? (
                <p className="text-sm text-gray-500">This seller has no published products yet.</p>
            ) : (
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
            )}
        </div>
    )
}
