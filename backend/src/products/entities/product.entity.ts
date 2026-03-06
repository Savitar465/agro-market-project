import {BaseEntity} from "../../common/base/base.entity";
import {Entity} from "typeorm";

// @Entity()
export class Product extends BaseEntity {
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
}

export type Coordinates = {
  lat: number;
  lng: number;
};