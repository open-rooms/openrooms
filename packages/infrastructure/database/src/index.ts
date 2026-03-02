/**
 * Infrastructure Database Package
 * 
 * Exports concrete repository implementations
 */

export { getDb, disconnect } from './kysely/db';
export { Database } from './kysely/types';

export { KyselyRoomRepository } from './repositories/room-repository';
export { KyselyWorkflowRepository } from './repositories/workflow-repository';
export { KyselyExecutionLogRepository } from './repositories/execution-log-repository';

// Factory function for creating repositories
import { Kysely } from 'kysely';
import { Database } from './kysely/types';
import { KyselyRoomRepository } from './repositories/room-repository';
import { KyselyWorkflowRepository } from './repositories/workflow-repository';
import { KyselyExecutionLogRepository } from './repositories/execution-log-repository';

export interface Repositories {
  rooms: KyselyRoomRepository;
  workflows: KyselyWorkflowRepository;
  executionLogs: KyselyExecutionLogRepository;
}

export function createRepositories(db: Kysely<Database>): Repositories {
  return {
    rooms: new KyselyRoomRepository(db),
    workflows: new KyselyWorkflowRepository(db),
    executionLogs: new KyselyExecutionLogRepository(db),
  };
}
