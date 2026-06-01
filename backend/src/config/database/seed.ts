import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import { User } from '../../users/entities/user.entity';
import { Seller } from '../../sellers/entities/seller.entity';
import { Product } from '../../products/entities/product.entity';
import { Role } from '../../auth/rbac/role.enum';

const AUDIT = 'seed';

/** Read a required seed password from the environment. */
function requirePassword(envVar: string): string {
  const value = process.env[envVar];
  if (!value) {
    throw new Error(
      `Missing required env var ${envVar}. Set it in your .env file before seeding.`,
    );
  }
  return value;
}

async function seed() {
  await dataSource.initialize();
  console.log('DataSource initialized — seeding data...');

  const userRepo = dataSource.getRepository(User);
  const sellerRepo = dataSource.getRepository(Seller);
  const productRepo = dataSource.getRepository(Product);

  // ---- Users ----------------------------------------------------------------
  const usersSeed: Array<{
    name: string;
    username: string;
    email: string;
    password: string;
    roles: Role[];
  }> = [
    {
      name: 'Admin',
      username: 'admin',
      email: 'admin@agromarket.com',
      password: requirePassword('SEED_ADMIN_PASSWORD'),
      roles: [Role.Admin],
    },
    {
      name: 'Granja El Sol',
      username: 'granja_sol',
      email: 'ventas@granjaelsol.com',
      password: requirePassword('SEED_SELLER_PASSWORD'),
      roles: [Role.Seller],
    },
    {
      name: 'Juan Comprador',
      username: 'juan',
      email: 'juan@example.com',
      password: requirePassword('SEED_USER_PASSWORD'),
      roles: [Role.User],
    },
  ];

  for (const u of usersSeed) {
    const existing = await userRepo.findOne({
      where: { username: u.username },
    });
    if (existing) {
      console.log(`  user "${u.username}" already exists — skipping`);
      continue;
    }
    const password = await bcrypt.hash(u.password, await bcrypt.genSalt());
    await userRepo.save(
      userRepo.create({
        ...u,
        password,
        createdBy: AUDIT,
        lastChangedBy: AUDIT,
      }),
    );
    console.log(`  created user "${u.username}"`);
  }

  // ---- Sellers --------------------------------------------------------------
  // Link the seller storefront to its owning user so the productor can manage
  // its own inventory once logged in.
  const sellerUser = await userRepo.findOne({
    where: { username: 'granja_sol' },
  });

  const sellersSeed: Array<{
    name: string;
    location: string;
    coords: { lat: number; lng: number };
    ownerUserId?: string;
  }> = [
    {
      name: 'Granja El Sol',
      location: 'Mendoza, Argentina',
      coords: { lat: -32.8895, lng: -68.8458 },
      ownerUserId: sellerUser?.id,
    },
    {
      name: 'Huerta Orgánica La Esperanza',
      location: 'Córdoba, Argentina',
      coords: { lat: -31.4201, lng: -64.1888 },
    },
    {
      name: 'Finca Los Andes',
      location: 'San Juan, Argentina',
      coords: { lat: -31.5375, lng: -68.5364 },
    },
  ];

  const sellers: Record<string, Seller> = {};
  for (const s of sellersSeed) {
    const { ownerUserId, ...sellerData } = s;
    let seller = await sellerRepo.findOne({ where: { name: s.name } });
    if (seller) {
      // Backfill the owner link for sellers seeded before user association.
      if (ownerUserId && !seller.userId) {
        seller.userId = ownerUserId;
        seller = await sellerRepo.save(seller);
        console.log(`  linked seller "${s.name}" to its owning user`);
      } else {
        console.log(`  seller "${s.name}" already exists — skipping`);
      }
    } else {
      seller = await sellerRepo.save(
        sellerRepo.create({
          ...sellerData,
          userId: ownerUserId,
          createdBy: AUDIT,
          lastChangedBy: AUDIT,
        }),
      );
      console.log(`  created seller "${s.name}"`);
    }
    sellers[s.name] = seller;
  }

  // ---- Products -------------------------------------------------------------
  const productsSeed: Array<{
    name: string;
    price: number;
    unit: string;
    image: string;
    description: string;
    category: string;
    stock: number;
    rating: number;
    sellerName: string;
  }> = [
    {
      name: 'Tomates Frescos',
      price: 850,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1546470427-5c4f6e8c4e3f',
      description: 'Tomates rojos maduros cosechados a mano.',
      category: 'Verduras',
      stock: 120,
      rating: 4.6,
      sellerName: 'Granja El Sol',
    },
    {
      name: 'Lechuga Criolla',
      price: 400,
      unit: 'unidad',
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1',
      description: 'Lechuga fresca de hoja verde, ideal para ensaladas.',
      category: 'Verduras',
      stock: 80,
      rating: 4.3,
      sellerName: 'Huerta Orgánica La Esperanza',
    },
    {
      name: 'Manzanas Rojas',
      price: 1200,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce',
      description: 'Manzanas dulces y crujientes de cosecha reciente.',
      category: 'Frutas',
      stock: 200,
      rating: 4.8,
      sellerName: 'Finca Los Andes',
    },
    {
      name: 'Miel Pura',
      price: 3500,
      unit: 'frasco 500g',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38',
      description: 'Miel orgánica producida por colmenas locales.',
      category: 'Almacén',
      stock: 45,
      rating: 5,
      sellerName: 'Granja El Sol',
    },
    {
      name: 'Zanahorias',
      price: 600,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37',
      description: 'Zanahorias frescas y crocantes ricas en betacaroteno.',
      category: 'Verduras',
      stock: 150,
      rating: 4.4,
      sellerName: 'Huerta Orgánica La Esperanza',
    },
    {
      name: 'Uvas Malbec',
      price: 1800,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1599819177626-b50f9d34a8b1',
      description: 'Uvas de variedad Malbec, dulces y jugosas.',
      category: 'Frutas',
      stock: 90,
      rating: 4.7,
      sellerName: 'Finca Los Andes',
    },
  ];

  for (const p of productsSeed) {
    const existing = await productRepo.findOne({ where: { name: p.name } });
    if (existing) {
      console.log(`  product "${p.name}" already exists — skipping`);
      continue;
    }
    const { sellerName, ...rest } = p;
    await productRepo.save(
      productRepo.create({
        ...rest,
        seller: sellers[sellerName],
        createdBy: AUDIT,
        lastChangedBy: AUDIT,
      }),
    );
    console.log(`  created product "${p.name}"`);
  }

  await dataSource.destroy();
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
