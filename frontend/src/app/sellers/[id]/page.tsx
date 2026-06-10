'use client'

import {useStore} from '@/lib/store'
import {use} from "react";
import dynamic from 'next/dynamic'
import ProductCard from '@/components/products/ProductCard'
import {calculateDistance, formatDistance} from '@/lib/geo'

const Map = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa…</div>
})

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const {sellers, products, userCoords} = useStore()
    const sellerProducts = products.filter(p => p.seller?.id === id)

    // Prefer the registered seller profile, but fall back to the seller info
    // carried on the products so storefronts work even when the seller
    // directory has not loaded.
    const seller = sellers.find(s => s.id === id) ?? sellerProducts[0]?.seller

    if (!seller) {
        return <div>Seller not found</div>
    }

    const distance = userCoords && seller.coords
        ? calculateDistance(userCoords, seller.coords)
        : null

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{seller.name}</h1>
            {seller.location && <p className="mt-1 text-sm text-gray-500">{seller.location}</p>}
            {distance !== null && (
                <p className="mt-1 text-sm font-medium text-indigo-600">📍 a {formatDistance(distance)} de tu ubicación</p>
            )}

            {seller.coords && (
                <div className="mt-4 h-64 w-full rounded-lg overflow-hidden border border-gray-200">
                    <Map
                        center={[seller.coords.lat, seller.coords.lng]}
                        zoom={12}
                        markers={[{
                            position: [seller.coords.lat, seller.coords.lng],
                            label: seller.name
                        }]}
                        userPosition={userCoords ? [userCoords.lat, userCoords.lng] : null}
                        fitToMarkers={Boolean(userCoords)}
                    />
                </div>
            )}

            <h2 className="text-lg font-medium text-gray-900 mt-8 mb-4">
                Products {sellerProducts.length > 0 && <span className="text-sm font-normal text-gray-500">({sellerProducts.length})</span>}
            </h2>
            {sellerProducts.length === 0 ? (
                <p className="text-sm text-gray-500">This seller has no published products yet.</p>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {sellerProducts.map((product) => (
                        <ProductCard key={product.id} product={product} userCoords={userCoords} />
                    ))}
                </div>
            )}
        </div>
    )
}
