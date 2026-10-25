import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
  console.log('🔄 Detected PostgreSQL database connection.');
  console.log('🔄 Synchronizing schema with Prisma (prisma db push)...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✔ Schema synchronized successfully.');

    console.log('🌱 Seeding initial catalog, settings, and categories...');
    execSync('node scripts/seed.mjs', { stdio: 'inherit' });

    console.log('🔐 Bootstrapping Owner admin passcode...');
    execSync('node scripts/bootstrap-owner.mjs', { stdio: 'inherit' });

    console.log('✔ Database fully initialized and ready for production!');
  } catch (err) {
    console.error('⚠️ Notice during database auto-deployment:', err.message);
  }
} else {
  console.log('ℹ Skipping postgres sync: No postgres DATABASE_URL detected.');
}
