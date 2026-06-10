'use client'

import Link from 'next/link'
import type {Coordinates, Product} from '@/data/products'
import {calculateDistance, formatDistance} from '@/lib/geo'

type ProductCardProps = {
    product: Product
    userCoords?: Coordinates | null
}

export default function ProductCard({product, userCoords}: ProductCardProps) {
    // Prefer the backend-computed distance; fall back to a local calculation
    // when the product came from an endpoint without coordinates.
    const distance = product.distanceKm
        ?? (userCoords && product.seller?.coords
            ? calculateDistance(userCoords, product.seller.coords)
            : null)

    return (
        <Link href={`/products/${product.id}`} className="group">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                <img
                    src={product.image}
                    alt={product.description}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
                <h3 className="text-sm text-gray-700">{product.name}</h3>
                {typeof product.rating === 'number' && (
                    <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-amber-600">
                        <span aria-hidden="true">★</span>
                        {product.rating.toFixed(1)}
                    </span>
                )}
            </div>
            {product.seller && (
                <p className="mt-0.5 text-xs text-gray-500">{product.seller.name}</p>
            )}
            <div className="mt-1 flex items-end justify-between">
                <div>
                    <p className="text-lg font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                        {product.unit && <span className="ml-1 text-xs font-normal text-gray-500">{product.unit}</span>}
                    </p>
                    {distance !== null && (
                        <p className="text-xs text-gray-500">📍 a {formatDistance(distance)}</p>
                    )}
                </div>
                {product.stock !== undefined && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                )}
            </div>
        </Link>
    )
}
