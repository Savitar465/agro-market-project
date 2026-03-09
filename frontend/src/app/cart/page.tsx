"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { cart, cartLoading, updateCartQty, removeFromCart } = useStore();

  if (isAuthLoading || cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-4">
          Shopping Cart
        </h1>
        <p className="text-gray-600 mb-6">Please login to view your cart.</p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
        >
          Login
        </Link>
      </div>
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-8">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">Your cart is empty.</p>
          <Link
            href="/store"
            className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ul role="list" className="-my-6 divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.itemId} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product?.image}
                      alt={item.product?.description}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          <Link href={`/products/${item.productId}`}>
                            {item.product?.name}
                          </Link>
                        </h3>
                        <p className="ml-4">
                          ${(item.product?.price || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center">
                        <label
                          htmlFor={`quantity-${item.itemId}`}
                          className="mr-2"
                        >
                          Quantity
                        </label>
                        <input
                          type="number"
                          id={`quantity-${item.itemId}`}
                          name={`quantity-${item.itemId}`}
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQty(
                              item.itemId,
                              Number.parseInt(e.target.value, 10),
                            )
                          }
                          className="w-16 rounded border-gray-300 px-2 py-1"
                        />
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.itemId)}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-8 md:border-t-0 md:pt-0">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">
                  ${total}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Shipping</p>
                <p className="text-sm font-medium text-gray-900">$0.00</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-medium text-gray-900">
                  Order total
                </p>
                <p className="text-base font-medium text-gray-900">
                  ${total}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
