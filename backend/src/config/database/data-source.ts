import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { configService } from '../config.service';

// Export default for TypeORM CLI (-d) compatibility
export default new DataSource({
  ...(configService.getTypeOrmConfig() as any),
});
