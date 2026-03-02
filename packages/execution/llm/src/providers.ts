/**
 * OpenAI-compatible LLM Provider Abstraction
 */

import OpenAI from 'openai';
import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  AgentProvider,
  AgentConfig,
  ConversationMessage,
  ToolCall,
  LLMProviderError,
} from '@openrooms/core';

export interface OpenAICompatibleConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = 'OpenAI';
  readonly type = AgentProvider.OPENAI;
  private readonly client: OpenAI;

  constructor(config: OpenAICompatibleConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
    });
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    try {
      const messages = request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        tool_calls: msg.toolCalls?.map((tc) => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.toolName,
            arguments: JSON.stringify(tc.arguments),
          },
        })),
      }));

      const tools = request.tools?.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties: Object.fromEntries(
              tool.parameters.map((p) => [
                p.name,
                {
                  type: p.type,
                  description: p.description,
                  enum: p.enum,
                },
              ])
            ),
            required: tool.parameters.filter((p) => p.required).map((p) => p.name),
          },
        },
      }));

      const completion = await this.client.chat.completions.create({
        model: request.model,
        messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        tools,
        tool_choice: request.toolChoice as OpenAI.ChatCompletionToolChoiceOption,
        stream: false,
      });

      const choice = completion.choices[0];
      if (!choice) {
        throw new Error('No response from OpenAI');
      }

      const message: ConversationMessage = {
        role: 'assistant',
        content: choice.message.content ?? '',
        toolCalls: choice.message.tool_calls?.map((tc) => ({
          id: tc.id,
          toolId: tc.function.name,
          toolName: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
          timestamp: new Date().toISOString(),
        })) as ToolCall[],
        timestamp: new Date().toISOString(),
      };

      return {
        id: completion.id,
        model: completion.model,
        message,
        usage: {
          promptTokens: completion.usage?.prompt_tokens ?? 0,
          completionTokens: completion.usage?.completion_tokens ?? 0,
          totalTokens: completion.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as LLMResponse['finishReason'],
      };
    } catch (error) {
      throw new LLMProviderError(
        this.name,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  validateConfig(config: AgentConfig): boolean {
    return (
      config.provider === AgentProvider.OPENAI &&
      typeof config.model === 'string' &&
      config.model.length > 0
    );
  }
}

/**
 * Anthropic Provider (OpenAI-compatible interface)
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = 'Anthropic';
  readonly type = AgentProvider.ANTHROPIC;
  private readonly client: OpenAI;

  constructor(config: OpenAICompatibleConfig) {
    // Anthropic can be accessed via OpenAI-compatible API with proper base URL
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL ?? 'https://api.anthropic.com/v1',
    });
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    // Similar implementation to OpenAI but with Anthropic specifics
    // For now, delegate to OpenAI-compatible implementation
    const provider = new OpenAIProvider({
      apiKey: this.client.apiKey,
      baseURL: this.client.baseURL,
    });
    return provider.chat(request);
  }

  validateConfig(config: AgentConfig): boolean {
    return (
      config.provider === AgentProvider.ANTHROPIC &&
      typeof config.model === 'string' &&
      config.model.length > 0
    );
  }
}

/**
 * LLM Service - Unified interface for all providers
 */
export class LLMService {
  private readonly providers: Map<AgentProvider, LLMProvider> = new Map();

  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.type, provider);
  }

  async chat(request: LLMRequest, providerType: AgentProvider): Promise<LLMResponse> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      throw new LLMProviderError(
        providerType,
        `No provider registered for type: ${providerType}`
      );
    }

    return provider.chat(request);
  }

  getProvider(type: AgentProvider): LLMProvider | undefined {
    return this.providers.get(type);
  }
}
