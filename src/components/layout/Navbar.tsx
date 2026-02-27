'use client'
import {useStore} from '@/lib/store'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
} from '@headlessui/react'
import {Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon} from '@heroicons/react/24/outline'
import {categories} from "@/data/products";
import {Fragment, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function Navbar({children}: Readonly<{ children: React.ReactNode; }>) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const {cart, products, sellers} = useStore()
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)
    const navigation = {
        categories: categories.map((c) => ({
            id: c,
            name: c,
            featured: products.filter((p) => p.category === c).slice(0, 2).map((p) => ({
                name: p.name,
                href: `/products/${p.id}`,
                imageSrc: p.image,
                imageAlt: p.description,
            })),
            sections: [
                {
                    id: 'all',
                    name: `All ${c}`,
                    items: products.filter((p) => p.category === c).map((p) => ({
                        name: p.name,
                        href: `/products/${p.id}`,
                    })),
                },
            ],
        })),
    }

    return (
        <div className="bg-white h-dvh">
            {/* Mobile menu */}
            <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                />
                <div className="fixed inset-0 z-40 flex">
                    <DialogPanel
                        transition
                        className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
                    >
                        <div className="flex px-4 pt-5 pb-2">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                            >
                                <span className="absolute -inset-0.5"/>
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon aria-hidden="true" className="size-6"/>
                            </button>
                        </div>

                        {/* Links */}
                        <TabGroup className="mt-2">
                            <div className="border-b border-gray-200">
                                <TabList className="-mb-px flex space-x-8 px-4">
                                    {navigation.categories.map((category) => (
                                        <Tab
                                            key={category.name}
                                            className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 data-selected:border-indigo-600 data-selected:text-indigo-600"
                                        >
                                            {category.name}
                                        </Tab>
                                    ))}
                                </TabList>
                            </div>
                            <TabPanels as={Fragment}>
                                {navigation.categories.map((category) => (
                                    <TabPanel key={category.name} className="space-y-10 px-4 pt-10 pb-8">
                                        <div className="grid grid-cols-2 gap-x-4">
                                            {category.featured.map((item) => (
                                                <div key={item.name} className="group relative text-sm">
                                                    <img
                                                        alt={item.imageAlt}
                                                        src={item.imageSrc}
                                                        className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                                    />
                                                    <a href={item.href}
                                                       className="mt-6 block font-medium text-gray-900">
                                                        <span aria-hidden="true" className="absolute inset-0 z-10"/>
                                                        {item.name}
                                                    </a>
                                                    <p aria-hidden="true" className="mt-1">
                                                        Shop now
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {category.sections.map((section) => (
                                            <div key={section.name}>
                                                <p id={`${category.id}-${section.id}-heading-mobile`}
                                                   className="font-medium text-gray-900">
                                                    {section.name}
                                                </p>
                                                <ul
                                                    role="list"
                                                    aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                                                    className="mt-6 flex flex-col space-y-6"
                                                >
                                                    {section.items.map((item) => (
                                                        <li key={item.name} className="flow-root">
                                                            <a href={item.href}
                                                               className="-m-2 block p-2 text-gray-500">
                                                                {item.name}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </TabGroup>

                        {/*<div className="space-y-6 border-t border-gray-200 px-4 py-6">*/}
                        {/*    <div className="flow-root">*/}
                        {/*        <a href="#" className="-m-2 block p-2 font-medium text-gray-900">*/}
                        {/*            Sign in*/}
                        {/*        </a>*/}
                        {/*    </div>*/}
                        {/*    <div className="flow-root">*/}
                        {/*        <a href="#" className="-m-2 block p-2 font-medium text-gray-900">*/}
                        {/*            Create account*/}
                        {/*        </a>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        <div className="border-t border-gray-200 px-4 py-6">
                            <a href="#" className="-m-2 flex items-center p-2">
                                <img
                                    alt=""
                                    src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                                    className="block h-auto w-5 shrink-0"
                                />
                                <span className="ml-3 block text-base font-medium text-gray-900">CAD</span>
                                <span className="sr-only">, change currency</span>
                            </a>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            <header className="relative bg-white">
                <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
                    Get free delivery on orders over $100
                </p>

                <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-200">
                        <div className="flex h-16 items-center">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
                            >
                                <span className="absolute -inset-0.5"/>
                                <span className="sr-only">Open menu</span>
                                <Bars3Icon aria-hidden="true" className="size-6"/>
                            </button>

                            {/* Logo */}
                            <div className="ml-4 flex lg:ml-0">
                                <Link href="/store">
                                    <span className="sr-only">AgroMarket</span>
                                    <img
                                        alt="AgroMarket"
                                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=emerald&shade=600"
                                        className="h-8 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Flyout menus */}
                            <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                                <div className="flex h-full space-x-8">
                                    {navigation.categories.map((category) => (
                                        <Popover key={category.name} className="flex">
                                            <div className="relative flex">
                                                <PopoverButton
                                                    className="group relative flex items-center justify-center text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-open:text-indigo-600">
                                                    {category.name}
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 ease-out group-data-open:bg-indigo-600"
                                                    />
                                                </PopoverButton>
                                            </div>
                                            <PopoverPanel
                                                transition
                                                className="absolute inset-x-0 top-full z-20 w-full bg-white text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                                            >
                                                {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                                <div aria-hidden="true"
                                                     className="absolute inset-0 top-1/2 bg-white shadow-sm"/>
                                                <div className="relative bg-white">
                                                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                                                            <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                                                {category.featured.map((item) => (
                                                                    <div key={item.name}
                                                                         className="group relative text-base sm:text-sm">
                                                                        <img
                                                                            alt={item.imageAlt}
                                                                            src={item.imageSrc}
                                                                            className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                                                        />
                                                                        <a href={item.href}
                                                                           className="mt-6 block font-medium text-gray-900">
                                                                            <span aria-hidden="true"
                                                                                  className="absolute inset-0 z-10"/>
                                                                            {item.name}
                                                                        </a>
                                                                        <p aria-hidden="true" className="mt-1">
                                                                            Shop now
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div
                                                                className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                                                {category.sections.map((section) => (
                                                                    <div key={section.name}>
                                                                        <p id={`${section.name}-heading`}
                                                                           className="font-medium text-gray-900">
                                                                            {section.name}
                                                                        </p>
                                                                        <ul
                                                                            role="list"
                                                                            aria-labelledby={`${section.name}-heading`}
                                                                            className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                                                        >
                                                                            {section.items.map((item) => (
                                                                                <li key={item.name} className="flex">
                                                                                    <a href={item.href}
                                                                                       className="hover:text-gray-800">
                                                                                        {item.name}
                                                                                    </a>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverPanel>
                                        </Popover>
                                    ))}
                                    <Popover className="flex">
                                        <div className="relative flex">
                                            <PopoverButton
                                                className="group relative flex items-center justify-center text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-open:text-indigo-600">
                                                Sellers
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 ease-out group-data-open:bg-indigo-600"
                                                />
                                            </PopoverButton>
                                        </div>
                                        <PopoverPanel
                                            transition
                                            className="absolute inset-x-0 top-full z-20 w-full bg-white text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                                        >
                                            <div aria-hidden="true"
                                                 className="absolute inset-0 top-1/2 bg-white shadow-sm"/>
                                            <div className="relative bg-white">
                                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                    <div className="grid grid-cols-1 gap-y-10 py-16">
                                                        <ul>
                                                            {sellers.map((seller) => (
                                                                <li key={seller.id}>
                                                                    <a href={`/sellers/${seller.id}`}
                                                                          className="font-medium text-gray-900 hover:text-gray-700">
                                                                        {seller.name}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                            <li>
                                                                <a href="/sellers/create"
                                                                      className="font-medium text-indigo-600 hover:text-indigo-500">
                                                                    Create a Seller
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverPanel>
                                    </Popover>
                                </div>
                            </PopoverGroup>
                            <div className="ml-auto flex items-center">
                                {/*<div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">*/}
                                {/*    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">*/}
                                {/*        Sign in*/}
                                {/*    </a>*/}
                                {/*    <span aria-hidden="true" className="h-6 w-px bg-gray-200"/>*/}
                                {/*    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">*/}
                                {/*        Create account*/}
                                {/*    </a>*/}
                                {/*</div>*/}

                                {/* Search */}
                                <form onSubmit={(e)=>{e.preventDefault(); const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement); router.push(`/store?q=${encodeURIComponent(input.value)}`)}} className="hidden lg:flex lg:ml-6 items-center gap-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                    <input name="q" placeholder="Search products" className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" />
                                    </div>
                                    <button className="p-2 text-indigo-600 hover:text-indigo-500" aria-label="Search">
                                        <MagnifyingGlassIcon aria-hidden="true" className="size-5"/>
                                    </button>
                                </form>

                                {/* Cart & Sell */}
                                <div className="ml-4 flex items-center gap-4 lg:ml-6">
                                    <Link href="/inventory" className="text-sm font-medium text-gray-700 hover:text-indigo-500">Inventory</Link>
                                    <Link href="/sell" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Sell</Link>
                                    <Link href="/cart" className="group -m-2 flex items-center p-2">
                                        <ShoppingBagIcon
                                            aria-hidden="true"
                                            className="size-6 shrink-0 text-indigo-600 group-hover:text-indigo-500"
                                        />
                                        <span
                                            className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">{cartCount}</span>
                                        <span className="sr-only">items in cart, view bag</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <div className="bg-white">
                <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                    {children}
                </div>
            </div>
        </div>

    )
}