'use client'

import {useStore} from '@/lib/store'
import {useAuth} from '@/lib/auth/auth-context'
import {useRouter} from 'next/navigation'
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import dynamic from 'next/dynamic'
import {
    createSeller,
    getSellerByUserId,
    updateSeller,
    type SellerProfile,
} from "@/lib/services/sellers-http";

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa…</div>
})

type SellerFormValues = {
    name: string
    location?: string
}

export default function Page() {
    const {user} = useAuth()
    const {refreshSellers, requestUserLocation, locationLoading, locationError} = useStore()
    const router = useRouter()
    const {register, handleSubmit, reset, formState: {isSubmitting}} = useForm<SellerFormValues>()

    const [loading, setLoading] = useState(true)
    const [existing, setExisting] = useState<SellerProfile | null>(null)
    const [coords, setCoords] = useState<{lat: number; lng: number} | undefined>(undefined)
    const [formError, setFormError] = useState<string | null>(null)

    // Load the current user's seller profile (if any) so this page edits it.
    useEffect(() => {
        let active = true
        if (!user) return
        ;(async () => {
            try {
                const profile = await getSellerByUserId(user.id)
                if (!active) return
                if (profile) {
                    setExisting(profile)
                    setCoords(profile.coords)
                    reset({name: profile.name, location: profile.location})
                } else {
                    reset({name: user.name})
                }
            } catch (err) {
                if (active) setFormError(err instanceof Error ? err.message : 'No se pudo cargar el perfil')
            } finally {
                if (active) setLoading(false)
            }
        })()
        return () => {
            active = false
        }
    }, [user, reset])

    const useMyLocation = async () => {
        const location = await requestUserLocation()
        if (location) setCoords(location)
    }

    const onSubmit = async (data: SellerFormValues) => {
        setFormError(null)
        const payload = {name: data.name, location: data.location, coords}

        try {
            if (existing) {
                await updateSeller(existing.id, payload)
            } else {
                await createSeller(payload)
            }
            await refreshSellers()
            router.push('/profile')
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'No se pudo guardar el perfil')
        }
    }

    if (loading) {
        return <div className="text-sm text-gray-500">Cargando perfil…</div>
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {existing ? 'Mi perfil de vendedor' : 'Crear perfil de vendedor'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Esta información se mostrará públicamente en tu tienda de productor.
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre de la tienda
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

                        <div className="sm:col-span-4">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                Ubicación
                            </label>
                            <div className="mt-2">
                                <div
                                    className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                    <input
                                        {...register('location')}
                                        type="text"
                                        id="location"
                                        placeholder="Ciudad, Provincia"
                                        className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Ubicación en el mapa</label>
                            <p className="mt-1 text-sm text-gray-500">
                                Hacé clic en el mapa o arrastrá el marcador para fijar dónde están tus productos.
                                Los compradores verán la distancia hasta vos.
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={useMyLocation}
                                    disabled={locationLoading}
                                    className="rounded-md border border-gray-300 bg-white py-1.5 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {locationLoading ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}
                                </button>
                                <span className="text-sm text-gray-500">
                                    {coords
                                        ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                                        : 'Sin coordenadas (opcional, permite mostrar distancias y el mapa de tu tienda)'}
                                </span>
                            </div>
                            {locationError && <p className="mt-1 text-sm text-red-600">{locationError}</p>}
                            <div className="mt-3 h-72 w-full overflow-hidden rounded-lg border border-gray-200">
                                <LocationPicker value={coords} onChange={setCoords} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {formError && <p className="pt-4 text-sm text-red-600">{formError}</p>}

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando…' : existing ? 'Guardar cambios' : 'Crear perfil'}
                    </button>
                </div>
            </div>
        </form>
    )
}
