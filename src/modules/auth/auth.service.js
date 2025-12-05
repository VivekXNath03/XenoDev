const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const { BadRequest, Unauthorized } = require('../../common/errors');

async function signup({ organizationName, organizationSlug, email, password, fullName, initialStoreName, initialShopDomain }) {
  if (!organizationName || !email || !password) throw BadRequest('organizationName, email and password are required');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw BadRequest('Email already registered');

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  const orgData = {
    name: organizationName,
    slug: organizationSlug || organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    users: {
      create: [{ email, passwordHash, fullName, globalRole: 'ORGANIZATION_ADMIN' }],
    },
  };

  if (initialStoreName && initialShopDomain) {
    orgData.stores = {
      create: [
        {
          name: initialStoreName,
          shopDomain: initialShopDomain,
        },
      ],
    };
  }

  const organization = await prisma.organization.create({ data: orgData, include: { users: true, stores: true } });

  const user = organization.users[0];

  if (env.isDevDirectMode && organization.stores && organization.stores.length > 0) {
    const store = organization.stores[0];
    try {
      await prisma.shopifyStoreConfig.create({
        data: {
          storeId: store.id,
          accessToken: env.devShopAdminAccessToken,
          scope: env.shopifyScopes.join(','),
          apiVersion: env.shopifyApiVersion,
        },
      });
    } catch (e) {}
  }

  const token = jwt.sign({ userId: user.id, organizationId: organization.id }, env.jwtSecret, { expiresIn: '7d' });

  return { token, user: { id: user.id, email: user.email, organizationId: organization.id } };
}

async function login({ email, password }) {
  if (!email || !password) throw BadRequest('email and password required');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw Unauthorized('Invalid credentials');

  const token = jwt.sign({ userId: user.id, organizationId: user.organizationId }, env.jwtSecret, { expiresIn: '7d' });

  return { token, user: { id: user.id, email: user.email, organizationId: user.organizationId } };
}

module.exports = { signup, login };
