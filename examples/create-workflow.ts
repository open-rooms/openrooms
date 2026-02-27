/**
 * Example: Create a simple workflow programmatically
 */

import { prisma } from '@openrooms/database';
import { NodeType, TransitionCondition, WorkflowStatus } from '@openrooms/core';

async function main() {
  console.log('Creating workflow...');

  // Create workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Hello World Workflow',
      description: 'A simple demonstration workflow: Start → Wait → End',
      status: WorkflowStatus.ACTIVE,
      initialNodeId: 'temp', // Will be updated
    },
  });

  console.log(`✓ Workflow created: ${workflow.id}`);

  // Create START node
  const startNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.START,
      name: 'Start',
      config: {},
      transitions: [],
    },
  });

  console.log(`✓ START node created: ${startNode.id}`);

  // Create WAIT node
  const waitNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.WAIT,
      name: 'Wait 3 seconds',
      config: { duration: 3000 },
      transitions: [],
    },
  });

  console.log(`✓ WAIT node created: ${waitNode.id}`);

  // Create END node
  const endNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.END,
      name: 'Complete',
      config: {},
      transitions: [],
    },
  });

  console.log(`✓ END node created: ${endNode.id}`);

  // Update transitions
  await prisma.workflowNode.update({
    where: { id: startNode.id },
    data: {
      transitions: [
        {
          condition: TransitionCondition.ALWAYS,
          targetNodeId: waitNode.id,
        },
      ],
    },
  });

  await prisma.workflowNode.update({
    where: { id: waitNode.id },
    data: {
      transitions: [
        {
          condition: TransitionCondition.SUCCESS,
          targetNodeId: endNode.id,
        },
      ],
    },
  });

  console.log('✓ Transitions configured');

  // Update workflow with initial node
  await prisma.workflow.update({
    where: { id: workflow.id },
    data: { initialNodeId: startNode.id },
  });

  console.log('✓ Workflow configured');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Workflow created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nWorkflow ID: ${workflow.id}`);
  console.log(`\nNext steps:`);
  console.log(`1. Visit the dashboard: http://localhost:3000/workflows`);
  console.log(`2. Create a room with this workflow ID`);
  console.log(`3. Run the room and watch execution logs!\n`);

  console.log(`Or use the API:`);
  console.log(`\ncurl -X POST http://localhost:3001/api/rooms \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"name": "Test Room", "workflowId": "${workflow.id}"}'\n`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
