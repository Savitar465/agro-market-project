import { Coordinates } from "./products";

export type Seller = {
  id: string;
  name: string;
  productIds: string[];
  location?: string;
  coords?: Coordinates;
};

export const sellers: Seller[] = [
  {
    id: 'farm-A1',
    name: 'Orchard Fresh Farms',
    productIds: ['apples-fuji-001'],
    location: 'Yakima, WA',
    coords: { lat: 46.6021, lng: -120.5059 },
  },
  {
    id: 'farm-B2',
    name: 'Sunset Valley Organics',
    productIds: ['carrots-rainbow-002'],
    location: 'Ojai, CA',
    coords: { lat: 34.4481, lng: -119.2429 },
  },
  {
    id: 'farm-C3',
    name: 'Happy Hen Homestead',
    productIds: ['eggs-pasture-003'],
    location: 'Lancaster, PA',
    coords: { lat: 40.0379, lng: -76.3055 },
  },
  {
    id: 'ranch-D4',
    name: 'Green Pastures Ranch',
    productIds: ['beef-ground-004'],
    location: 'Boulder, CO',
    coords: { lat: 40.0150, lng: -105.2705 },
  },
  {
    id: 'bakery-E5',
    name: 'The Daily Rise Bakery',
    productIds: ['bread-sourdough-005'],
    location: 'San Francisco, CA',
    coords: { lat: 37.7749, lng: -122.4194 },
  },
  {
    id: 'apiary-F6',
    name: 'Golden Bee Apiary',
    productIds: ['honey-raw-006'],
    location: 'Asheville, NC',
    coords: { lat: 35.5951, lng: -82.5515 },
  },
  {
    id: 'brewery-G7',
    name: 'Ferment for Good',
    productIds: ['kombucha-ginger-007'],
    location: 'Portland, OR',
    coords: { lat: 45.5152, lng: -122.6784 },
  },
  {
    id: 'maker-H8',
    name: 'Pure Planet Home',
    productIds: ['cleaner-allpurpose-008'],
    location: 'Austin, TX',
    coords: { lat: 30.2672, lng: -97.7431 },
  },
];
