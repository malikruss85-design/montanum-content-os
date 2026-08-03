import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { FileRepository } from './repositories.js';
import { ProductionService } from './services/production-service.js';

export function createApp(env = process.env) { const config = loadConfig(env); const repository = new FileRepository(config.dataDir); const logger = createLogger(config.logDir); const productionService = new ProductionService({ config, repository, logger }); return { config, repository, logger, productionService }; }
