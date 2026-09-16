import * as dotenv from 'dotenv';
import { defineConfig } from '@prisma/config';

dotenv.config();

export default defineConfig({
  schema: 'src/schemas',
  migrations: {
    path: 'src/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
