'use client'

import {useStore} from '@/lib/store'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {categories} from '@/data/products'
import {calculateDistance} from '@/lib/geo'
import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/map/Map'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
})

export default function Page() {
    const {products, userCoords, setUserCoords} = useStore()
    const searchParams = useSearchParams()
    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const [sortByProximity, setSortByProximity] = useState(false)
    const [showMap, setShowMap] = useState(false)

    useEffect(() => {
        if (sortByProximity && !userCoords) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (error) => {
                    console.error("Error getting location", error)
                    alert("Unable to retrieve your location")
                    setSortByProximity(false)
                }
            )
        }
    }, [sortByProximity, userCoords, setUserCoords])

    const filteredProducts = products.filter(p => {
        if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
        return !(category && p.category !== category);
    })

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortByProximity && userCoords && a.seller?.coords && b.seller?.coords) {
            const distA = calculateDistance(userCoords, a.seller.coords)
            const distB = calculateDistance(userCoords, b.seller.coords)
            return distA - distB
        }
        return 0
    })

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Products</h1>
                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={() => setShowMap(!showMap)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-md border ${showMap ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-500 hover:text-gray-900'}`}
                    >
                        {showMap ? 'Show List' : 'Show Map'}
                    </button>
                    <button
                        onClick={() => setSortByProximity(!sortByProximity)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-md border ${sortByProximity ? 'bg-indigo-100 border-indigo-600 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:text-gray-900'}`}
                    >
                        {sortByProximity ? 'Sorted by Proximity' : 'Sort by Proximity'}
                    </button>
                    <Link href="/store" className={`text-sm font-medium ${!category ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>All</Link>
                    {categories.map(c => (
                        <Link key={c} href={`/store?category=${c}`} className={`text-sm font-medium ${category === c ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>{c}</Link>
                    ))}
                    <Link
                        href="/sell"
                        className="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add Product
                    </Link>
                </div>
            </div>

            {showMap ? (
                <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200">
                    <Map 
                        center={userCoords ? [userCoords.lat, userCoords.lng] : [39.8283, -98.5795]} 
                        zoom={userCoords ? 10 : 4}
                        markers={sortedProducts
                            .filter(p => p.seller?.coords)
                            .map(p => ({
                                position: [p.seller!.coords!.lat, p.seller!.coords!.lng] as [number, number],
                                label: `${p.name} - $${p.price.toFixed(2)} - ${p.seller!.name}`,
                                id: p.id
                            }))}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {sortedProducts.map((product) => {
                        const distance = userCoords && product.seller?.coords 
                            ? calculateDistance(userCoords, product.seller.coords)
                            : null

                        return (
                            <Link key={product.id} href={`/products/${product.id}`} className="group">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                                    <img
                                        src={product.image}
                                        alt={product.description}
                                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                                    />
                                </div>
                                <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                                <div className="flex justify-between items-center mt-1">
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                                        {distance !== null && (
                                            <p className="text-xs text-gray-500">{distance.toFixed(1)} km away</p>
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
                    })}
                </div>
            )}
        </div>
    )
}
