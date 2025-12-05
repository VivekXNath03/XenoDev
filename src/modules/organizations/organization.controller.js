const { asyncHandler, sendSuccess } = require('../../common/http');
const orgService = require('./organization.service');

async function me(req, res) {
  const org = await orgService.getOrganization(req.organizationId);
  return sendSuccess(res, org);
}

module.exports = {
  me: asyncHandler(me),
};
