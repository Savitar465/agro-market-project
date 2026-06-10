'use client'

import {useStore} from '@/lib/store'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {categories, type Product} from '@/data/products'
import {calculateDistance} from '@/lib/geo'
import {searchProducts} from '@/lib/services/products-http'
import {useEffect, useMemo, useState} from 'react'
import dynamic from 'next/dynamic'
import ProductCard from '@/components/products/ProductCard'

// Radius options (km) for the "within X km" filter.
const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 250]
// The "Cerca de ti" rail only shows products within this many km.
const NEARBY_RADIUS_KM = 100

const Map = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
})

export default function Page() {
    const {products, productsLoading, productsError, userCoords, requestUserLocation, locationLoading, locationError} = useStore()
    const searchParams = useSearchParams()

    // Filters are kept in local state so they combine and update instantly
    // without a network round-trip. They are seeded from the URL so deep links
    // (navbar search, seller storefronts, category links) still work.
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('')
    const [sellerId, setSellerId] = useState('')
    const [sortByProximity, setSortByProximity] = useState(false)
    const [maxDistanceKm, setMaxDistanceKm] = useState<number | ''>('')
    const [showMap, setShowMap] = useState(false)
    const [nearbyProducts, setNearbyProducts] = useState<Product[]>([])

    useEffect(() => {
        setQuery(searchParams.get('q') ?? '')
        setCategory(searchParams.get('category') ?? '')
        setSellerId(searchParams.get('seller') ?? '')
    }, [searchParams])

    const toggleProximity = async () => {
        if (sortByProximity) {
            setSortByProximity(false)
            return
        }
        const coords = userCoords ?? await requestUserLocation()
        if (coords) setSortByProximity(true)
    }

    // "Cerca de ti": distance is computed server-side (Haversine in SQL) and
    // comes back as distanceKm on each product, sorted nearest-first.
    useEffect(() => {
        if (!userCoords) {
            setNearbyProducts([])
            return
        }
        let active = true
        searchProducts({
            lat: userCoords.lat,
            lng: userCoords.lng,
            maxDistanceKm: NEARBY_RADIUS_KM,
            sortBy: 'distance',
            sortOrder: 'ASC',
            limit: 4,
        })
            .then((items) => {
                if (active) setNearbyProducts(items)
            })
            .catch(() => {
                if (active) setNearbyProducts([])
            })
        return () => {
            active = false
        }
    }, [userCoords])

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
        if (userCoords && maxDistanceKm !== '') {
            if (!p.seller?.coords) return false
            if (calculateDistance(userCoords, p.seller.coords) > maxDistanceKm) return false
        }
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

    // One marker per producer (products share their seller's coords, so
    // per-product markers would stack on the same point).
    const sellerMapMarkers = useMemo(() => {
        // Plain object instead of Map: the Map identifier is shadowed by the
        // dynamically imported map component in this module.
        const bySeller: Record<string, {position: [number, number]; name: string; count: number}> = {}
        for (const p of sortedProducts) {
            if (!p.seller?.coords) continue
            const existing = bySeller[p.seller.id]
            if (existing) {
                existing.count += 1
            } else {
                bySeller[p.seller.id] = {
                    position: [p.seller.coords.lat, p.seller.coords.lng],
                    name: p.seller.name,
                    count: 1,
                }
            }
        }
        return Object.entries(bySeller).map(([id, s]) => ({
            id,
            position: s.position,
            label: `${s.name} — ${s.count} producto${s.count === 1 ? '' : 's'}`,
            href: `/sellers/${id}`,
        }))
    }, [sortedProducts])

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
                        onClick={toggleProximity}
                        disabled={locationLoading}
                        className={`text-sm font-medium px-3 py-1.5 rounded-md border disabled:opacity-50 ${sortByProximity ? 'bg-indigo-100 border-indigo-600 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:text-gray-900'}`}
                    >
                        {locationLoading ? 'Obteniendo ubicación…' : sortByProximity ? '✓ Ordenado por cercanía' : 'Ordenar por cercanía'}
                    </button>
                    {userCoords && (
                        <select
                            value={maxDistanceKm}
                            onChange={(e) => setMaxDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                            className="text-sm font-medium px-3 py-1.5 rounded-md border bg-white border-gray-300 text-gray-500 focus:border-indigo-500 focus:outline-none"
                            aria-label="Filtrar por distancia máxima"
                        >
                            <option value="">Cualquier distancia</option>
                            {RADIUS_OPTIONS.map((km) => (
                                <option key={km} value={km}>Hasta {km} km</option>
                            ))}
                        </select>
                    )}
                    <Link
                        href="/sell"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add Product
                    </Link>
                </div>
            </div>

            {locationError && (
                <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{locationError}</p>
            )}

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
                        markers={sellerMapMarkers}
                        userPosition={userCoords ? [userCoords.lat, userCoords.lng] : null}
                        fitToMarkers={sellerMapMarkers.length > 0}
                    />
                </div>
            ) : (
                <>
                    {/* Nearby products — distance computed by the backend */}
                    {!hasActiveFilters && nearbyProducts.length > 0 && (
                        <section className="mb-12">
                            <div className="flex items-baseline justify-between mb-4">
                                <h2 className="text-xl font-bold tracking-tight text-gray-900">Cerca de ti</h2>
                                <span className="text-sm text-gray-500">A menos de {NEARBY_RADIUS_KM} km</span>
                            </div>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                                {nearbyProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} userCoords={userCoords} />
                                ))}
                            </div>
                        </section>
                    )}

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
