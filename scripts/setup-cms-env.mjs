import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const secret = () => randomBytes(32).toString('base64');
const target = new URL('../cms/.env', import.meta.url);
const content = [
  'HOST=127.0.0.1',
  'PORT=1337',
  `APP_KEYS=${secret()},${secret()},${secret()},${secret()}`,
  ...['API_TOKEN_SALT', 'ADMIN_JWT_SECRET', 'TRANSFER_TOKEN_SALT', 'JWT_SECRET', 'ENCRYPTION_KEY'].map(key => `${key}=${secret()}`),
  'DATABASE_CLIENT=sqlite',
  'DATABASE_FILENAME=.tmp/data.db',
  'STRAPI_TELEMETRY_DISABLED=true',
  '',
].join('\n');
try {
  writeFileSync(target, content, { flag: 'wx', mode: 0o600 });
  console.log('Created cms/.env with local secrets.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('cms/.env already exists; kept existing configuration.');
}
