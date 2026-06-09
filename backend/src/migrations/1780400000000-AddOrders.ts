import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrders1780400000000 implements MigrationInterface {
  name = 'AddOrders1780400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED')`,
    );

    await queryRunner.query(
      `CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300) NOT NULL, "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300) NOT NULL, "internalComment" character varying(300), "userId" uuid NOT NULL, "cartId" uuid NOT NULL, "paymentId" uuid, "orderNumber" character varying(40) NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'PENDING_PAYMENT', "subtotal" numeric NOT NULL DEFAULT '0', "total" numeric NOT NULL DEFAULT '0', "currency" character varying(10) NOT NULL DEFAULT 'usd', "itemCount" integer NOT NULL DEFAULT 0, "shipping" jsonb, "paidAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_order_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300) NOT NULL, "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300) NOT NULL, "internalComment" character varying(300), "orderId" uuid NOT NULL, "productId" uuid, "sellerId" uuid, "productName" character varying(200) NOT NULL, "unit" character varying(200), "image" character varying(500), "unitPrice" numeric NOT NULL, "quantity" integer NOT NULL, "totalPrice" numeric NOT NULL, CONSTRAINT "PK_order_item_id" PRIMARY KEY ("id"))`,
    );

    // Link the payment to the order it settles.
    await queryRunner.query(`ALTER TABLE "payment" ADD "orderId" uuid`);

    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_cart" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_payment" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_order_item_order" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_order_item_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_order_item_seller" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_order" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_order_item_seller"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_order_item_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_order_item_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_payment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_cart"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_user"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "orderId"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
  }
}
