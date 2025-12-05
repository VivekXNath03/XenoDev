const prisma = require('../../config/prisma');
const ingestionService = require('./ingestion.service');
const logger = require('../../config/logger');

async function scheduleAllStoresSync() {
  const stores = await prisma.store.findMany();
  for (const s of stores) {
    try {
      ingestionService.syncStore(s.id).catch(err => logger.error({ err, storeId: s.id }, 'Scheduled sync failed'));
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      logger.error({ err }, 'Error scheduling store sync');
    }
  }
}

module.exports = { scheduleAllStoresSync };
