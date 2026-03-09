import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1772850633596 implements MigrationInterface {
    name = 'Init1772850633596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "name" character varying(200) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "price" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "unit" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "image" character varying(200) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "images" character varying(200) array`);
        await queryRunner.query(`ALTER TABLE "product" ADD "description" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "category" character varying(200) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "stock" numeric`);
        await queryRunner.query(`ALTER TABLE "product" ADD "rating" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "images"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "name"`);
    }

}
