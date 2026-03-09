import { NextResponse } from "next/server";
import type { Product } from "@/data/products";
import productsRepository from "@/lib/server/products-repository";

type ProductPayload = Omit<Product, "id"> & { id?: string };

function isValidProductPayload(payload: unknown): payload is ProductPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const product = payload as Partial<ProductPayload>;

  return (
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    typeof product.image === "string" &&
    typeof product.category === "string" &&
    typeof product.price === "number" &&
    Number.isFinite(product.price)
  );
}

export async function GET() {
  return NextResponse.json(productsRepository.list());
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();

    if (!isValidProductPayload(payload)) {
      return NextResponse.json(
        { error: "Invalid product payload" },
        { status: 400 },
      );
    }

    const created = productsRepository.create(payload);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
