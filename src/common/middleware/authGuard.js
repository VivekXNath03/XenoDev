const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const prisma = require('../../config/prisma');
const { Unauthorized } = require('../errors');

module.exports = async function authGuard(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return next(Unauthorized('Missing Authorization token'));
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload || !payload.userId) return next(Unauthorized('Invalid token payload'));

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { storeMemberships: true },
    });
    if (!user) return next(Unauthorized('User not found'));

  // Build storeRoles array
  const storeRoles = (user.storeMemberships || []).map(m => ({ storeId: m.storeId, role: m.role }));

  // Determine organization-level admin: check globalRole first, then fallback to any storeMembership with ORGANIZATION_ADMIN
  const isOrgAdmin = (user.globalRole === 'ORGANIZATION_ADMIN') || (user.storeMemberships || []).some(m => m.role === 'ORGANIZATION_ADMIN');

    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      globalRole: user.globalRole,
      storeRoles,
      isOrgAdmin,
    };

    return next();
  } catch (err) {
    return next(Unauthorized('Invalid token'));
  }
};
