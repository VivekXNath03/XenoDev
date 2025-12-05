const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

// Use Prisma Accelerate when DATABASE_URL is an accelerate URL (prisma://)
// Do not override with DIRECT_URL unless you explicitly opt out of Accelerate.

function createPlainClient() {
  return new PrismaClient();
}

function isAccelerateEnabled() {
  const url = process.env.DATABASE_URL || '';
  // Enable Accelerate automatically when prisma:// is used (or via explicit flag)
  return url.startsWith('prisma://') || process.env.PRISMA_ACCELERATE === 'true';
}

let prisma;
if (isAccelerateEnabled()) {
  try {
    const { withAccelerate } = require('@prisma/extension-accelerate');
    prisma = globalForPrisma.prisma || createPlainClient().$extends(withAccelerate());
  } catch (e) {
    // Extension not available or misconfigured: fall back to plain client
    prisma = globalForPrisma.prisma || createPlainClient();
  }
} else {
  prisma = globalForPrisma.prisma || createPlainClient();
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
