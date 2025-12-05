const { Forbidden } = require('../errors');
const prisma = require('../../config/prisma');

module.exports = async function storeContext(req, res, next) {
  const storeId = req.params.storeId || req.query.storeId;
  if (!storeId) return res.status(400).json({ success: false, error: { message: 'storeId required', code: 'BAD_REQUEST' } });

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return res.status(404).json({ success: false, error: { message: 'Store not found', code: 'NOT_FOUND' } });
  if (!req.user || req.user.organizationId !== store.organizationId) {
    return next(Forbidden('Access to store denied'));
  }

  if (req.user.isOrgAdmin) {
    req.storeId = storeId;
    return next();
  }

  const hasRole = (req.user.storeRoles || []).some(r => r.storeId === storeId);
  if (!hasRole) return next(Forbidden('User does not have role for this store'));

  req.storeId = storeId;
  return next();
};
