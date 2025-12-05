const orgRepo = require('./organization.repository');

async function getOrganization(organizationId) {
  return orgRepo.findById(organizationId);
}

module.exports = { getOrganization };
