import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/schemas',
  migrations: {
    path: 'src/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
