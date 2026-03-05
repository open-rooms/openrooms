/**
 * Policy Enforcer - Tool Permission Validation
 * 
 * Validates agent tool calls against:
 * - Allowed tools list
 * - Policy configuration constraints
 * - Resource limits
 * 
 * Logs all violations for audit trail.
 */

import type {
  Agent,
  AgentPolicy,
  PolicyViolation,
  ToolDefinition,
  UUID,
  JSONObject,
} from '@openrooms/core';

export interface PolicyCheckParams {
  agentId: UUID;
  roomId: UUID;
  toolName: string;
  allowedTools: string[];
  policyConfig: AgentPolicy;
  currentIteration?: number;
  currentTokenUsage?: number;
  currentCost?: number;
}

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  violationType?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class PolicyEnforcerImpl {
  constructor(
    private readonly violationLogger: PolicyViolationLogger
  ) {}

  /**
   * Validate tool call against agent policy
   */
  async validateToolCall(params: PolicyCheckParams): Promise<PolicyCheckResult> {
    // 1. Check explicit allowlist
    if (!this.isToolAllowed(params.toolName, params.allowedTools)) {
      await this.logViolation({
        agentId: params.agentId,
        roomId: params.roomId,
        violationType: 'TOOL_NOT_ALLOWED',
        attemptedTool: params.toolName,
        policyRule: 'allowedTools',
        denialReason: `Tool "${params.toolName}" not in allowedTools list`,
        severity: 'HIGH',
      });

      return {
        allowed: false,
        reason: `Tool "${params.toolName}" not in allowedTools list`,
        violationType: 'TOOL_NOT_ALLOWED',
        severity: 'HIGH',
      };
    }

    // 2. Check explicit denylist
    if (this.isToolDenied(params.toolName, params.policyConfig)) {
      await this.logViolation({
        agentId: params.agentId,
        roomId: params.roomId,
        violationType: 'TOOL_EXPLICITLY_DENIED',
        attemptedTool: params.toolName,
        policyRule: 'deniedTools',
        denialReason: `Tool "${params.toolName}" in deniedTools list`,
        severity: 'CRITICAL',
      });

      return {
        allowed: false,
        reason: `Tool "${params.toolName}" is explicitly denied`,
        violationType: 'TOOL_EXPLICITLY_DENIED',
        severity: 'CRITICAL',
      };
    }

    // 3. Check iteration limit
    if (params.currentIteration !== undefined && params.policyConfig.maxLoopIterations) {
      if (params.currentIteration >= params.policyConfig.maxLoopIterations) {
        await this.logViolation({
          agentId: params.agentId,
          roomId: params.roomId,
          violationType: 'MAX_ITERATIONS_EXCEEDED',
          attemptedTool: params.toolName,
          policyRule: 'maxLoopIterations',
          denialReason: `Iteration ${params.currentIteration} exceeds limit of ${params.policyConfig.maxLoopIterations}`,
          severity: 'MEDIUM',
        });

        return {
          allowed: false,
          reason: `Max iterations (${params.policyConfig.maxLoopIterations}) exceeded`,
          violationType: 'MAX_ITERATIONS_EXCEEDED',
          severity: 'MEDIUM',
        };
      }
    }

    // 4. Check token limit
    if (params.currentTokenUsage !== undefined && params.policyConfig.maxTokensPerRequest) {
      if (params.currentTokenUsage >= params.policyConfig.maxTokensPerRequest) {
        await this.logViolation({
          agentId: params.agentId,
          roomId: params.roomId,
          violationType: 'TOKEN_LIMIT_EXCEEDED',
          attemptedTool: params.toolName,
          policyRule: 'maxTokensPerRequest',
          denialReason: `Token usage ${params.currentTokenUsage} exceeds limit of ${params.policyConfig.maxTokensPerRequest}`,
          severity: 'MEDIUM',
        });

        return {
          allowed: false,
          reason: `Token limit (${params.policyConfig.maxTokensPerRequest}) exceeded`,
          violationType: 'TOKEN_LIMIT_EXCEEDED',
          severity: 'MEDIUM',
        };
      }
    }

    // 5. Check cost limit
    if (params.currentCost !== undefined && params.policyConfig.maxCostPerExecution) {
      if (params.currentCost >= params.policyConfig.maxCostPerExecution) {
        await this.logViolation({
          agentId: params.agentId,
          roomId: params.roomId,
          violationType: 'COST_LIMIT_EXCEEDED',
          attemptedTool: params.toolName,
          policyRule: 'maxCostPerExecution',
          denialReason: `Cost $${params.currentCost} exceeds limit of $${params.policyConfig.maxCostPerExecution}`,
          severity: 'HIGH',
        });

        return {
          allowed: false,
          reason: `Cost limit ($${params.policyConfig.maxCostPerExecution}) exceeded`,
          violationType: 'COST_LIMIT_EXCEEDED',
          severity: 'HIGH',
        };
      }
    }

    // 6. Check if tool requires approval (future implementation)
    if (this.requiresApproval(params.toolName, params.policyConfig)) {
      // For now, deny tools requiring approval
      // Future: implement approval workflow
      await this.logViolation({
        agentId: params.agentId,
        roomId: params.roomId,
        violationType: 'APPROVAL_REQUIRED',
        attemptedTool: params.toolName,
        policyRule: 'requireApprovalFor',
        denialReason: `Tool "${params.toolName}" requires human approval`,
        severity: 'LOW',
      });

      return {
        allowed: false,
        reason: `Tool "${params.toolName}" requires human approval (not yet implemented)`,
        violationType: 'APPROVAL_REQUIRED',
        severity: 'LOW',
      };
    }

    // All checks passed
    return { allowed: true };
  }

  /**
   * Check if tool is in allowlist
   */
  private isToolAllowed(toolName: string, allowedTools: string[]): boolean {
    // Empty allowlist means all tools allowed (open policy)
    if (allowedTools.length === 0) {
      return true;
    }

    // Check exact match
    if (allowedTools.includes(toolName)) {
      return true;
    }

    // Check wildcard match (e.g., "search_*")
    return allowedTools.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(toolName);
      }
      return false;
    });
  }

  /**
   * Check if tool is explicitly denied
   */
  private isToolDenied(toolName: string, policy: AgentPolicy): boolean {
    if (!policy.deniedTools || policy.deniedTools.length === 0) {
      return false;
    }

    return policy.deniedTools.some(denied => {
      if (denied.includes('*')) {
        const regex = new RegExp('^' + denied.replace(/\*/g, '.*') + '$');
        return regex.test(toolName);
      }
      return denied === toolName;
    });
  }

  /**
   * Check if tool requires approval
   */
  private requiresApproval(toolName: string, policy: AgentPolicy): boolean {
    if (!policy.requireApprovalFor || policy.requireApprovalFor.length === 0) {
      return false;
    }

    return policy.requireApprovalFor.includes(toolName);
  }

  /**
   * Log policy violation
   */
  private async logViolation(violation: Omit<PolicyViolation, 'id' | 'timestamp' | 'metadata'>): Promise<void> {
    await this.violationLogger.log({
      ...violation,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: 'agent-runtime-loop',
        source: 'policy-enforcer',
      },
    });
  }
}

/**
 * Policy Violation Logger Interface
 */
export interface PolicyViolationLogger {
  log(violation: PolicyViolation): Promise<void>;
}

/**
 * PostgreSQL Policy Violation Logger
 */
export class PostgreSQLPolicyViolationLogger implements PolicyViolationLogger {
  constructor(private readonly db: any) {} // Kysely DB instance

  async log(violation: PolicyViolation): Promise<void> {
    await this.db
      .insertInto('policy_violations')
      .values({
        id: violation.id,
        agentId: violation.agentId,
        roomId: violation.roomId,
        violationType: violation.violationType,
        attemptedTool: violation.attemptedTool,
        policyRule: violation.policyRule,
        denialReason: violation.denialReason,
        severity: violation.severity,
        timestamp: violation.timestamp,
        metadata: JSON.stringify(violation.metadata),
      })
      .execute();
  }
}
