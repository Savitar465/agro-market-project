import {BaseEntity} from "../../common/base/base.entity";
import {Entity} from "typeorm";

// @Entity()
export class Product extends BaseEntity {
  name: string;
  price: number;
  description?: string;
}
