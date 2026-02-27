export type Coordinates = {
  lat: number;
  lng: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  unit?: string;
  image: string;
  images?: string[];
  description: string;
  category: string;
  stock?: number;
  rating?: number;
  seller?: {
    id: string;
    name: string;
    location?: string;
    coords?: Coordinates;
  };
};

export const categories = [
  'Fruits',
  'Vegetables',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Bakery',
  'Pantry',
  'Beverages',
  'Eco Household',
] as const;

export const products: Product[] = [
  {
    id: 'apples-fuji-001',
    name: 'Organic Fuji Apples',
    price: 3.99,
    unit: 'per lb',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Apfel-Fuji.jpg/1200px-Apfel-Fuji.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Apfel-Fuji.jpg/1200px-Apfel-Fuji.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Apfel-Fuji.jpg/1200px-Apfel-Fuji.jpg',
    ],
    description:
      'Crisp and sweet Fuji apples, grown organically without any pesticides. Perfect for a healthy snack.',
    category: 'Fruits',
    stock: 150,
    rating: 4.8,
    seller: { id: 'farm-A1', name: 'Orchard Fresh Farms', location: 'Yakima, WA', coords: { lat: 46.6021, lng: -120.5059 } },
  },
  {
    id: 'carrots-rainbow-002',
    name: 'Rainbow Carrots',
    price: 2.49,
    unit: 'bunch',
    image:
      'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?q=80&w=800&auto=format&fit=crop',
    description:
      'A colorful mix of purple, yellow, and orange carrots. Packed with vitamins and a sweet, earthy flavor.',
    category: 'Vegetables',
    stock: 80,
    rating: 4.6,
    seller: { id: 'farm-B2', name: 'Sunset Valley Organics', location: 'Ojai, CA', coords: { lat: 34.4481, lng: -119.2429 } },
  },
  {
    id: 'eggs-pasture-003',
    name: 'Pasture-Raised Eggs',
    price: 7.50,
    unit: 'dozen',
    image:
      'https://media.post.rvohealth.io/wp-content/uploads/2020/09/health-benefits-of-eggs-732x549-thumbnail-732x549.jpg',
    description:
      'From hens that roam freely on green pastures. These eggs have rich, deep orange yolks and superior flavor.',
    category: 'Dairy & Eggs',
    stock: 50,
    rating: 4.9,
    seller: { id: 'farm-C3', name: 'Happy Hen Homestead', location: 'Lancaster, PA', coords: { lat: 40.0379, lng: -76.3055 } },
  },
  {
    id: 'beef-ground-004',
    name: 'Grass-Fed Ground Beef',
    price: 10.99,
    unit: 'per lb',
    image:
      'https://d2ht9oj9id87jp.cloudfront.net/v1/images/5724/thumb/w1900_h750/grass-fed-organic-ground-beef-product-blackboxmeats.jpeg',
    description:
      'Lean and flavorful ground beef from 100% grass-fed cattle. No hormones or antibiotics.',
    category: 'Meat & Poultry',
    stock: 30,
    rating: 4.9,
    seller: { id: 'ranch-D4', name: 'Green Pastures Ranch', location: 'Boulder, CO', coords: { lat: 40.0150, lng: -105.2705 } },
  },
  {
    id: 'bread-sourdough-005',
    name: 'Artisan Sourdough Loaf',
    price: 6.00,
    unit: 'each',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1_FHCO8-v1jOkGOVyK71lPcexLaCk1eQnKQ&s',
    description:
      'Handmade sourdough with a crispy crust and a soft, chewy interior. Made with organic flour and a natural starter.',
    category: 'Bakery',
    stock: 40,
    rating: 4.7,
    seller: { id: 'bakery-E5', name: 'The Daily Rise Bakery', location: 'San Francisco, CA', coords: { lat: 37.7749, lng: -122.4194 } },
  },
  {
    id: 'honey-raw-006',
    name: 'Raw Wildflower Honey',
    price: 12.00,
    unit: '16 oz jar',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkqOyuth_exmwMV4nPvj6axuxFvM1RQnfUoA&s',
    description:
      'Unfiltered and unheated honey from a variety of wildflowers. Full of natural enzymes and pollen.',
    category: 'Pantry',
    stock: 100,
    rating: 4.8,
    seller: { id: 'apiary-F6', name: 'Golden Bee Apiary', location: 'Asheville, NC', coords: { lat: 35.5951, lng: -82.5515 } },
  },
  {
    id: 'kombucha-ginger-007',
    name: 'Ginger-Turmeric Kombucha',
    price: 4.50,
    unit: '16 fl oz',
    image:
      'https://www.kombuchakamp.com/wp-content/uploads/2012/06/tumeric_0706.jpg',
    description:
      'A bubbly and probiotic-rich kombucha, brewed with organic ginger and turmeric for a spicy kick.',
    category: 'Beverages',
    stock: 60,
    rating: 4.6,
    seller: { id: 'brewery-G7', name: 'Ferment for Good', location: 'Portland, OR', coords: { lat: 45.5152, lng: -122.6784 } },
  },
  {
    id: 'oranges-allpurpose-008',
    name: 'Oranges',
    price: 9.99,
    unit: 'per lb',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/4/43/Ambersweet_oranges.jpg',
    description:
      'The orange, also called sweet orange to distinguish it from the bitter orange (Citrus × aurantium), is the fruit of a tree in the family Rutaceae.',
    category: 'Fruits',
    stock: 200,
    rating: 4.7,
    seller: { id: 'maker-H8', name: 'Pure Planet Home', location: 'Austin, TX', coords: { lat: 30.2672, lng: -97.7431 } },
  },
];
