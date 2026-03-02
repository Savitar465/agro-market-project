import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl">Page not found</p>
            <Link href="/store" className="text-indigo-600 hover:underline">
                Go back to the store
            </Link>
        </div>
    )
}
