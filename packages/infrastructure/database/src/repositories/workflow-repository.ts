/**
 * Workflow Repository Implementation with Kysely
 */

import { Kysely } from 'kysely';
import {
  WorkflowRepository,
  CreateWorkflowData,
  UpdateWorkflowData,
  CreateWorkflowNodeData,
  Workflow,
  WorkflowNode,
  UUID,
} from '@openrooms/core';
import { Database } from '../kysely/types';

export class KyselyWorkflowRepository implements WorkflowRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: CreateWorkflowData): Promise<Workflow> {
    const result = await this.db
      .insertInto('workflows')
      .values({
        name: data.name,
        description: data.description || null,
        version: data.version,
        initialNodeId: data.initialNodeId,
        metadata: JSON.stringify(data.metadata || {}),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToWorkflow(result);
  }

  async findById(id: UUID): Promise<Workflow | null> {
    const result = await this.db
      .selectFrom('workflows')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToWorkflow(result) : null;
  }

  async findAll(): Promise<Workflow[]> {
    const results = await this.db
      .selectFrom('workflows')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(r => this.mapToWorkflow(r));
  }

  async update(id: UUID, data: UpdateWorkflowData): Promise<Workflow> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.metadata !== undefined) updateData.metadata = JSON.stringify(data.metadata);

    const result = await this.db
      .updateTable('workflows')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToWorkflow(result);
  }

  async delete(id: UUID): Promise<void> {
    await this.db
      .deleteFrom('workflows')
      .where('id', '=', id)
      .execute();
  }

  // Node operations

  async createNode(data: CreateWorkflowNodeData): Promise<WorkflowNode> {
    const nodeId = data.nodeId || crypto.randomUUID();
    
    const result = await this.db
      .insertInto('workflow_nodes')
      .values({
        workflowId: data.workflowId,
        nodeId: nodeId,
        type: data.type,
        name: data.name,
        description: data.description || null,
        config: JSON.stringify({
          ...data.config,
          transitions: data.transitions,
          timeout: data.timeout,
        }),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToNode(result);
  }

  async getNodes(workflowId: UUID): Promise<WorkflowNode[]> {
    const results = await this.db
      .selectFrom('workflow_nodes')
      .selectAll()
      .where('workflowId', '=', workflowId)
      .orderBy('createdAt', 'asc')
      .execute();

    return results.map(r => this.mapToNode(r));
  }

  async getNode(nodeId: UUID): Promise<WorkflowNode | null> {
    const result = await this.db
      .selectFrom('workflow_nodes')
      .selectAll()
      .where('nodeId', '=', nodeId)
      .executeTakeFirst();

    return result ? this.mapToNode(result) : null;
  }

  async updateNode(nodeId: UUID, data: Partial<WorkflowNode>): Promise<WorkflowNode> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.config !== undefined) updateData.config = JSON.stringify(data.config);

    const result = await this.db
      .updateTable('workflow_nodes')
      .set(updateData)
      .where('nodeId', '=', nodeId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToNode(result);
  }

  async deleteNode(nodeId: UUID): Promise<void> {
    await this.db
      .deleteFrom('workflow_nodes')
      .where('nodeId', '=', nodeId)
      .execute();
  }

  private mapToWorkflow(row: any): Workflow {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      version: row.version,
      status: row.status,
      initialNodeId: row.initialNodeId,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }

  private mapToNode(row: any): WorkflowNode {
    const config = typeof row.config === 'string' ? JSON.parse(row.config) : row.config;
    const { transitions, timeout, ...restConfig } = config;

    return {
      id: row.id,
      workflowId: row.workflowId,
      type: row.type,
      name: row.name,
      description: row.description || undefined,
      config: restConfig,
      transitions: transitions || [],
      timeout,
      metadata: {},
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }
}
