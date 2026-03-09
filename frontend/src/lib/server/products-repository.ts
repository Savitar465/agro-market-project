import type { Product } from "@/data/products";

let productsDb: Product[] = [];

function clone<T>(value: T): T {
  return structuredClone(value);
}

type ProductPayload = Omit<Product, "id"> & { id?: string };

const productsRepository = {
  list(): Product[] {
    return clone(productsDb);
  },

  findById(id: string): Product | null {
    const product = productsDb.find((item) => item.id === id);
    return product ? clone(product) : null;
  },

  create(payload: ProductPayload): Product {
    const newProduct: Product = {
      ...payload,
      id: payload.id?.trim() || `product-${Date.now()}`,
    };

    productsDb = [newProduct, ...productsDb];
    return clone(newProduct);
  },

  update(id: string, payload: ProductPayload): Product | null {
    const index = productsDb.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }

    const updatedProduct: Product = {
      ...payload,
      id,
    };

    productsDb[index] = updatedProduct;
    return clone(updatedProduct);
  },

  updateStock(id: string, stock: number): Product | null {
    const index = productsDb.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }

    const updatedProduct: Product = {
      ...productsDb[index],
      stock,
    };

    productsDb[index] = updatedProduct;
    return clone(updatedProduct);
  },

  remove(id: string): boolean {
    const sizeBefore = productsDb.length;
    productsDb = productsDb.filter((item) => item.id !== id);
    return productsDb.length !== sizeBefore;
  },
};

export { productsRepository };
export default productsRepository;
