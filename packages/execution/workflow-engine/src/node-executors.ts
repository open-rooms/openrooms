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

// Complex node type executors with dependencies injected

export class AgentTaskNodeExecutor implements NodeExecutor {
  constructor(
    private readonly llmService: any, // LLMService from @openrooms/core
    private readonly memoryRepository: any // MemoryRepository from @openrooms/core
  ) {}

  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    try {
      const config = context.node.config as {
        prompt?: string;
        model?: string;
        temperature?: number;
        maxTokens?: number;
      };

      if (!config.prompt) {
        return {
          success: false,
          error: new Error('Agent task requires a prompt in config'),
        };
      }

      // Get conversation history from memory
      const memory = await this.memoryRepository.findByRoomId(context.roomId);
      const conversationHistory = memory?.conversationHistory || [];

      // Call LLM
      const response = await this.llmService.chat({
        model: config.model || 'gpt-4',
        messages: [
          ...conversationHistory,
          {
            role: 'user',
            content: config.prompt,
            timestamp: new Date().toISOString(),
          },
        ],
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      // Store response in memory
      if (memory) {
        await this.memoryRepository.update(memory.id, {
          conversationHistory: [
            ...conversationHistory,
            {
              role: 'user',
              content: config.prompt,
              timestamp: new Date().toISOString(),
            },
            response.message,
          ],
        });
      }

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
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
  constructor(private readonly stateManager: any) {} // StateManager from @openrooms/core

  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    try {
      const config = context.node.config as {
        condition?: string;
        variable?: string;
        operator?: '===' | '!==' | '>' | '<' | '>=' | '<=' | 'includes' | 'exists';
        value?: any;
      };

      if (!config.condition && !config.variable) {
        return {
          success: false,
          error: new Error('Decision node requires condition or variable in config'),
        };
      }

      // Get current state
      const state = await this.stateManager.getState(context.roomId);
      if (!state) {
        return {
          success: false,
          error: new Error(`State not found for room ${context.roomId}`),
        };
      }

      let conditionMet = false;

      if (config.condition) {
        // Evaluate custom condition expression
        try {
          const fn = new Function('state', `return ${config.condition}`);
          conditionMet = Boolean(fn(state.variables));
        } catch (error) {
          return {
            success: false,
            error: new Error(`Failed to evaluate condition: ${config.condition}`),
          };
        }
      } else if (config.variable && config.operator) {
        // Evaluate simple variable comparison
        const variableValue = state.variables[config.variable];

        switch (config.operator) {
          case '===':
            conditionMet = variableValue === config.value;
            break;
          case '!==':
            conditionMet = variableValue !== config.value;
            break;
          case '>':
            conditionMet = variableValue > config.value;
            break;
          case '<':
            conditionMet = variableValue < config.value;
            break;
          case '>=':
            conditionMet = variableValue >= config.value;
            break;
          case '<=':
            conditionMet = variableValue <= config.value;
            break;
          case 'includes':
            conditionMet = Array.isArray(variableValue) && variableValue.includes(config.value);
            break;
          case 'exists':
            conditionMet = variableValue !== undefined && variableValue !== null;
            break;
        }
      }

      // Store result in state for transition evaluation
      await this.stateManager.updateState(context.roomId, {
        variables: {
          ...state.variables,
          [`__decision_${context.node.id}`]: conditionMet,
        },
      });

      return { success: conditionMet, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export class ParallelNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // TODO: Implement parallel execution
    console.log(`Executing PARALLEL node: ${context.node.name}`);
    return { success: true, data: undefined };
  }
}

export interface NodeExecutorDependencies {
  llmService: any;
  toolRegistry: any;
  memoryRepository: any;
  stateManager: any;
  workflowEngine: any;
}

export function createDefaultNodeExecutors(
  deps: NodeExecutorDependencies
): Map<NodeType, NodeExecutor> {
  const executors = new Map<NodeType, NodeExecutor>();
  
  executors.set(NodeType.START, new StartNodeExecutor());
  executors.set(NodeType.END, new EndNodeExecutor());
  executors.set(NodeType.WAIT, new WaitNodeExecutor());
  executors.set(NodeType.AGENT_TASK, new AgentTaskNodeExecutor(deps.llmService, deps.memoryRepository));
  executors.set(NodeType.TOOL_EXECUTION, new ToolExecutionNodeExecutor(deps.toolRegistry, deps.memoryRepository));
  executors.set(NodeType.DECISION, new DecisionNodeExecutor(deps.stateManager));
  executors.set(NodeType.PARALLEL, new ParallelNodeExecutor(deps.workflowEngine));
  
  return executors;
}
