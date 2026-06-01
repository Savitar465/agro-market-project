import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductStatusAndSellerUser1780300000000
  implements MigrationInterface
{
  name = 'ProductStatusAndSellerUser1780300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Product publication status -----------------------------------------
    await queryRunner.query(
      `CREATE TYPE "public"."product_status_enum" AS ENUM('PUBLISHED', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "status" "public"."product_status_enum" NOT NULL DEFAULT 'PUBLISHED'`,
    );

    // --- Widen image columns to fit object-storage URLs ---------------------
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "image" TYPE character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "images" TYPE character varying(500)[]`,
    );

    // --- Link seller profile to its owning user -----------------------------
    await queryRunner.query(`ALTER TABLE "seller" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "seller" ADD CONSTRAINT "UQ_seller_userId" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "seller" ADD CONSTRAINT "FK_seller_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seller" DROP CONSTRAINT "FK_seller_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seller" DROP CONSTRAINT "UQ_seller_userId"`,
    );
    await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "userId"`);

    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "images" TYPE character varying(200)[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "image" TYPE character varying(200)`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
  }
}
