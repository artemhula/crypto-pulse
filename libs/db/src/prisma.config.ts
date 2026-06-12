import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'libs/db/schema.prisma',
  migrations: {
    path: 'libs/db/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
