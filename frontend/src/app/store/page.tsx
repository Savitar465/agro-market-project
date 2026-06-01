'use client'

import {useStore} from '@/lib/store'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {categories} from '@/data/products'
import {calculateDistance} from '@/lib/geo'
import {useEffect, useMemo, useState} from 'react'
import dynamic from 'next/dynamic'
import ProductCard from '@/components/products/ProductCard'

const Map = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
})

export default function Page() {
    const {products, productsLoading, productsError, userCoords, setUserCoords} = useStore()
    const searchParams = useSearchParams()

    // Filters are kept in local state so they combine and update instantly
    // without a network round-trip. They are seeded from the URL so deep links
    // (navbar search, seller storefronts, category links) still work.
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('')
    const [sellerId, setSellerId] = useState('')
    const [sortByProximity, setSortByProximity] = useState(false)
    const [showMap, setShowMap] = useState(false)

    useEffect(() => {
        setQuery(searchParams.get('q') ?? '')
        setCategory(searchParams.get('category') ?? '')
        setSellerId(searchParams.get('seller') ?? '')
    }, [searchParams])

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

    // The producer list is derived from the catalog so every option yields
    // at least one product.
    const sellerOptions = useMemo(() => {
        const byId: Record<string, string> = {}
        products.forEach((p) => {
            if (p.seller) byId[p.seller.id] = p.seller.name
        })
        return Object.entries(byId)
            .map(([id, name]) => ({id, name}))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [products])

    const hasActiveFilters = Boolean(query || category || sellerId)

    // Featured = highest-rated products, shown only on the unfiltered feed.
    const featuredProducts = useMemo(() => {
        return [...products]
            .filter((p) => typeof p.rating === 'number')
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 4)
    }, [products])

    const normalizedQuery = query.trim().toLowerCase()
    const filteredProducts = products.filter((p) => {
        if (normalizedQuery) {
            const haystack = `${p.name} ${p.description} ${p.category}`.toLowerCase()
            if (!haystack.includes(normalizedQuery)) return false
        }
        if (category && p.category !== category) return false
        return !(sellerId && p.seller?.id !== sellerId)
    })

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortByProximity && userCoords && a.seller?.coords && b.seller?.coords) {
            const distA = calculateDistance(userCoords, a.seller.coords)
            const distB = calculateDistance(userCoords, b.seller.coords)
            return distA - distB
        }
        return 0
    })

    const clearFilters = () => {
        setQuery('')
        setCategory('')
        setSellerId('')
    }

    if (productsLoading) {
        return <div>Loading products...</div>
    }

    if (productsError) {
        return <div className="text-red-600">{productsError}</div>
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Products</h1>
                <div className="flex flex-wrap gap-3 items-center">
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
                    <Link
                        href="/sell"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Search + producer filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
                <div className="relative flex-1">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products by name, description or category"
                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <select
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">All producers</option>
                    {sellerOptions.map((seller) => (
                        <option key={seller.id} value={seller.id}>{seller.name}</option>
                    ))}
                </select>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center mb-8">
                <button
                    onClick={() => setCategory('')}
                    className={`text-sm font-medium ${!category ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    All
                </button>
                {categories.map((c) => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`text-sm font-medium ${category === c ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {c}
                    </button>
                ))}
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
                <>
                    {/* Featured products — only on the unfiltered feed */}
                    {!hasActiveFilters && featuredProducts.length > 0 && (
                        <section className="mb-12">
                            <div className="flex items-baseline justify-between mb-4">
                                <h2 className="text-xl font-bold tracking-tight text-gray-900">Productos destacados</h2>
                                <span className="text-sm text-gray-500">Top rated</span>
                            </div>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                                {featuredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} userCoords={userCoords} />
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">
                            {hasActiveFilters ? 'Results' : 'All products'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {sortedProducts.length} product{sortedProducts.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    {sortedProducts.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
                            <p className="text-sm text-gray-500">No products match your filters.</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                            {sortedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} userCoords={userCoords} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
