/**
 * Logging Service Implementation
 */

import {
  LoggingService,
  ExecutionLogRepository,
  CreateLogData,
  ExecutionLog,
  LogQueryOptions,
  UUID,
} from '@openrooms/core';

export class DefaultLoggingService implements LoggingService {
  constructor(
    private readonly logRepository: ExecutionLogRepository
  ) {}

  async log(data: CreateLogData): Promise<void> {
    await this.logRepository.create(data);
  }

  async getLogs(roomId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]> {
    return this.logRepository.findByRoomId(roomId, options);
  }

  async getNodeLogs(nodeId: UUID): Promise<ExecutionLog[]> {
    return this.logRepository.findByNodeId(nodeId);
  }
}
