/**
 * Node Executors - Implementations for different node types
 */

import {
  NodeExecutor,
  NodeExecutionContext,
} from './workflow-engine';
import {
  Result,
  NodeType,
} from '@openrooms/core';

export class StartNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // START node simply passes through
    return { success: true, data: undefined };
  }
}

export class EndNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // END node marks completion
    return { success: true, data: undefined };
  }
}

export class WaitNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    const config = context.node.config as { duration?: number };
    const duration = config.duration ?? 1000;

    await new Promise((resolve) => setTimeout(resolve, duration));
    
    return { success: true, data: undefined };
  }
}

// Placeholder executors for complex node types
// These will be implemented with full agent/tool integration

export class AgentTaskNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // TODO: Implement with LLM service integration
    console.log(`Executing AGENT_TASK node: ${context.node.name}`);
    return { success: true, data: undefined };
  }
}

export class ToolExecutionNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // TODO: Implement with Tool Registry
    console.log(`Executing TOOL_EXECUTION node: ${context.node.name}`);
    return { success: true, data: undefined };
  }
}

export class DecisionNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // TODO: Implement decision logic based on state
    console.log(`Executing DECISION node: ${context.node.name}`);
    return { success: true, data: undefined };
  }
}

export class ParallelNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // TODO: Implement parallel execution
    console.log(`Executing PARALLEL node: ${context.node.name}`);
    return { success: true, data: undefined };
  }
}

export function createDefaultNodeExecutors(): Map<NodeType, NodeExecutor> {
  const executors = new Map<NodeType, NodeExecutor>();
  
  executors.set(NodeType.START, new StartNodeExecutor());
  executors.set(NodeType.END, new EndNodeExecutor());
  executors.set(NodeType.WAIT, new WaitNodeExecutor());
  executors.set(NodeType.AGENT_TASK, new AgentTaskNodeExecutor());
  executors.set(NodeType.TOOL_EXECUTION, new ToolExecutionNodeExecutor());
  executors.set(NodeType.DECISION, new DecisionNodeExecutor());
  executors.set(NodeType.PARALLEL, new ParallelNodeExecutor());
  
  return executors;
}
