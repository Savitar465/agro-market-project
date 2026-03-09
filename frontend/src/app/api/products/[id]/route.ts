import { NextResponse } from "next/server";
import type { Product } from "@/data/products";
import productsRepository from "@/lib/server/products-repository";

type ProductPayload = Omit<Product, "id"> & { id?: string };

type StockPayload = {
  stock: number;
};

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

function isValidStockPayload(payload: unknown): payload is StockPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const body = payload as Partial<StockPayload>;
  return typeof body.stock === "number" && Number.isFinite(body.stock);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = productsRepository.findById(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const payload: unknown = await request.json();
    if (!isValidProductPayload(payload)) {
      return NextResponse.json(
        { error: "Invalid product payload" },
        { status: 400 },
      );
    }

    const updated = productsRepository.update(id, payload);
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const payload: unknown = await request.json();
    if (!isValidStockPayload(payload)) {
      return NextResponse.json(
        { error: "Invalid stock payload" },
        { status: 400 },
      );
    }

    const updated = productsRepository.updateStock(id, payload.stock);
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = productsRepository.remove(id);

  if (!removed) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
