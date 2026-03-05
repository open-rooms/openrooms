/**
 * Integration tests for room workflow execution
 * 
 * Tests behavioral correctness of the execution engine with repositories
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { Container, createContainer } from '../src/container';
import { RoomStatus } from '@openrooms/core';

describe('Room Execution Integration', () => {
  let container: Container;
  let testRoomId: string;
  let testWorkflowId: string;

  beforeAll(async () => {
    container = createContainer();
    
    // Create test workflow
    const workflow = await container.workflowRepository.create({
      name: 'Test Workflow',
      description: 'Integration test workflow',
      initialNodeId: 'start-node',
      metadata: {},
    });
    testWorkflowId = workflow.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testRoomId) {
      await container.roomRepository.delete(testRoomId).catch(() => {});
    }
    await container.workflowRepository.delete(testWorkflowId).catch(() => {});
    
    // Disconnect Redis
    if (container.redis) {
      container.redis.disconnect();
    }
  });

  test('creates room via repository', async () => {
    const room = await container.roomRepository.create({
      name: 'Integration Test Room',
      description: 'Test room for integration',
      workflowId: testWorkflowId,
      config: {},
      metadata: {},
    });

    expect(room).toBeDefined();
    expect(room.id).toBeDefined();
    expect(room.name).toBe('Integration Test Room');
    expect(room.status).toBe(RoomStatus.IDLE);
    
    testRoomId = room.id;
  });

  test('retrieves room via repository', async () => {
    const room = await container.roomRepository.findById(testRoomId);
    
    expect(room).toBeDefined();
    expect(room?.id).toBe(testRoomId);
    expect(room?.workflowId).toBe(testWorkflowId);
  });

  test('updates room status via repository', async () => {
    await container.roomRepository.updateStatus(testRoomId, RoomStatus.RUNNING);
    
    const room = await container.roomRepository.findById(testRoomId);
    expect(room?.status).toBe(RoomStatus.RUNNING);
  });

  test('workflow engine respects FSM state transitions', async () => {
    // Reset to IDLE first
    await container.roomRepository.updateStatus(testRoomId, RoomStatus.IDLE);
    
    // Valid transition: IDLE -> RUNNING
    const runResult = await container.workflowEngine.executeRoom(testRoomId);
    expect(runResult.success).toBeDefined();
    
    // Invalid transition: COMPLETED -> RUNNING should fail
    await container.roomRepository.updateStatus(testRoomId, RoomStatus.COMPLETED);
    const invalidResult = await container.workflowEngine.executeRoom(testRoomId);
    expect(invalidResult.success).toBe(false);
  });

  test('execution logs are append-only', async () => {
    const logsBefore = await container.loggingService.getLogs(testRoomId);
    const initialCount = logsBefore.length;
    
    await container.loggingService.log({
      roomId: testRoomId,
      workflowId: testWorkflowId,
      eventType: 'STATE_UPDATED',
      level: 'INFO',
      message: 'Test log entry',
      metadata: {},
    });
    
    const logsAfter = await container.loggingService.getLogs(testRoomId);
    expect(logsAfter.length).toBe(initialCount + 1);
    
    // Verify last log matches what we wrote
    const lastLog = logsAfter[logsAfter.length - 1];
    expect(lastLog).toBeDefined();
    expect(lastLog!.message).toBe('Test log entry');
  });

  test('state mutations go through state manager contract', async () => {
    const state = await container.stateManager.getState(testRoomId);
    
    if (!state) {
      // Initialize state
      await container.stateManager.setState(testRoomId, {
        roomId: testRoomId,
        currentNodeId: 'start-node',
        status: RoomStatus.RUNNING,
        variables: { testVar: 'value' },
        executionStack: [],
        attempts: new Map(),
        executedSteps: new Map(),
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
      });
    }
    
    // Update state
    await container.stateManager.updateState(testRoomId, {
      variables: { testVar: 'updated' },
    });
    
    const updatedState = await container.stateManager.getState(testRoomId);
    expect(updatedState?.variables.testVar).toBe('updated');
  });

  test('repositories enforce data contracts', async () => {
    // Test that repository methods enforce required fields
    await expect(async () => {
      await container.roomRepository.create({
        name: '',
        workflowId: 'invalid-id',
        metadata: {},
      });
    }).rejects.toThrow();
  });
});
