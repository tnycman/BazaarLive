/**
 * AI Assistant Service
 * Enterprise-grade AI-powered shopping assistant using OpenAI GPT models
 */

import { Result } from '../error/Result';
import { DomainError } from '../error/DomainError';

// Service configuration
interface AIServiceConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Chat message types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Assistant context for personalized responses
interface AssistantContext {
  userId: string;
  currentCategory?: string;
  userPreferences?: any;
  recentActivity?: any;
}

// Assistant response structure
interface AssistantResponse {
  message: string;
  suggestions?: string[];
  relatedProducts?: any[];
  conversationId: string;
}

// Health check response
interface HealthCheckResult {
  hasApiKey: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  capabilities: string[];
  lastChecked: Date;
}

/**
 * Enterprise AI Assistant Service
 * Provides AI-powered shopping assistance with OpenAI integration
 */
export class AIAssistantService {
  private config: AIServiceConfig;
  private baseSystemPrompt: string;

  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      maxTokens: 500,
      temperature: 0.7
    };

    this.baseSystemPrompt = `You are a helpful shopping assistant for BazaarLive, a social marketplace platform similar to Poshmark. 

Your role is to:
- Help users find products across categories: fashion, jobs, real estate, cars, boats, and services
- Provide styling advice and fashion recommendations
- Assist with buying and selling guidance
- Answer questions about marketplace features
- Suggest trending items and popular brands

Platform features you can reference:
- Multi-category marketplace (fashion, jobs, real estate, cars, boats, services)
- Social features (following, likes, comments)
- Live selling capabilities
- User profiles and verification
- Brand-focused shopping
- Personalized feed system

Keep responses helpful, friendly, and concise. Focus on actionable advice and specific product recommendations when possible.`;
  }

  /**
   * Health check for AI assistant service
   */
  async healthCheck(): Promise<Result<HealthCheckResult, DomainError>> {
    try {
      const capabilities = [];
      const hasApiKey = !!this.config.apiKey;
      
      if (hasApiKey) {
        capabilities.push('AI-powered responses', 'Personalized recommendations', 'Product search assistance');
      } else {
        capabilities.push('Basic responses', 'General guidance');
      }

      const result: HealthCheckResult = {
        hasApiKey,
        status: hasApiKey ? 'healthy' : 'degraded',
        capabilities,
        lastChecked: new Date()
      };

      return Result.success(result);
    } catch (error) {
      console.error('[AI-ASSISTANT] Health check failed:', error);
      return Result.failure(new DomainError(
        'AI_HEALTH_CHECK_FAILED',
        'Failed to perform health check',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      ));
    }
  }

  /**
   * Generate AI response to user message
   */
  async generateResponse(
    messages: ChatMessage[],
    context: AssistantContext
  ): Promise<Result<AssistantResponse, DomainError>> {
    try {
      // If no API key, provide fallback response
      if (!this.config.apiKey) {
        return this.generateFallbackResponse(messages, context);
      }

      // Build conversation context
      const systemMessage: ChatMessage = {
        role: 'system',
        content: this.buildContextualPrompt(context)
      };

      const conversationMessages = [systemMessage, ...messages];

      // Call OpenAI API
      const response = await this.callOpenAI(conversationMessages);
      
      if (response.isError()) {
        // Fallback to basic response on API failure
        console.warn('[AI-ASSISTANT] OpenAI API failed, using fallback:', response.error);
        return this.generateFallbackResponse(messages, context);
      }

      const assistantMessage = response.value;
      const conversationId = `conv_${context.userId}_${Date.now()}`;

      // Generate suggestions based on the response
      const suggestions = this.generateSuggestions(assistantMessage, context);

      return Result.success({
        message: assistantMessage,
        suggestions,
        relatedProducts: [], // TODO: Implement product recommendations
        conversationId
      });

    } catch (error) {
      console.error('[AI-ASSISTANT] Response generation failed:', error);
      return Result.failure(new DomainError(
        'AI_RESPONSE_GENERATION_FAILED',
        'Failed to generate AI response',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      ));
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(messages: ChatMessage[]): Promise<Result<string, DomainError>> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Result.failure(new DomainError(
          'OPENAI_API_ERROR',
          `OpenAI API request failed: ${response.status}`,
          { status: response.status, error: errorText }
        ));
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content;

      if (!message) {
        return Result.failure(new DomainError(
          'OPENAI_NO_RESPONSE',
          'No response received from OpenAI API',
          { data }
        ));
      }

      return Result.success(message.trim());

    } catch (error) {
      return Result.failure(new DomainError(
        'OPENAI_API_CALL_FAILED',
        'Failed to call OpenAI API',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      ));
    }
  }

  /**
   * Generate fallback response when AI is unavailable
   */
  private async generateFallbackResponse(
    messages: ChatMessage[],
    context: AssistantContext
  ): Promise<Result<AssistantResponse, DomainError>> {
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let response = '';
    let suggestions: string[] = [];

    // Simple keyword-based responses
    if (userMessage.includes('trending') || userMessage.includes('popular')) {
      response = "I'd love to help you find trending items! While I'm in limited mode right now, you can check out our Fashion section for the latest styles, or browse by categories like Women, Men, and Kids to see what's popular.";
      suggestions = ['Browse Fashion', 'Check Women\'s section', 'View trending brands'];
    } else if (userMessage.includes('sell') || userMessage.includes('listing')) {
      response = "Great question about selling! On BazaarLive, you can easily create listings for items across all our categories. Just click 'List Item' in the header to get started. Make sure to add clear photos and detailed descriptions!";
      suggestions = ['Create a listing', 'Photography tips', 'Pricing guidance'];
    } else if (userMessage.includes('find') || userMessage.includes('search')) {
      response = "I can help you navigate our marketplace! Use the search bar at the top to look for specific items, or browse by categories like Fashion, Jobs, Real Estate, Cars, Boats, and Services. Each category has detailed filters to help you find exactly what you need.";
      suggestions = ['Browse categories', 'Use advanced filters', 'Check saved searches'];
    } else {
      response = "Hello! I'm your BazaarLive shopping assistant. I'm currently in limited mode, but I can still help you navigate our marketplace. What would you like to explore today?";
      suggestions = ['Browse marketplace', 'Find trending items', 'Learn about selling'];
    }

    const conversationId = `conv_${context.userId}_${Date.now()}`;

    return Result.success({
      message: response,
      suggestions,
      relatedProducts: [],
      conversationId
    });
  }

  /**
   * Build contextual system prompt
   */
  private buildContextualPrompt(context: AssistantContext): string {
    let prompt = this.baseSystemPrompt;

    if (context.currentCategory) {
      prompt += `\n\nThe user is currently browsing the ${context.currentCategory} category. Focus your recommendations on this area unless they ask about something else.`;
    }

    if (context.userPreferences) {
      prompt += `\n\nUser preferences: ${JSON.stringify(context.userPreferences)}`;
    }

    return prompt;
  }

  /**
   * Generate contextual suggestions
   */
  private generateSuggestions(message: string, context: AssistantContext): string[] {
    const suggestions: string[] = [];
    const messageLower = message.toLowerCase();

    // Category-based suggestions
    if (messageLower.includes('fashion') || messageLower.includes('clothing')) {
      suggestions.push('Browse Women\'s Fashion', 'Check Men\'s Styles', 'View Kids\' Clothing');
    }

    if (messageLower.includes('brand') || messageLower.includes('designer')) {
      suggestions.push('Shop by Brand', 'View Designer Items', 'Find Luxury Goods');
    }

    if (messageLower.includes('trend') || messageLower.includes('popular')) {
      suggestions.push('What\'s trending now?', 'Show popular items', 'Find best sellers');
    }

    // Action-based suggestions
    if (messageLower.includes('sell') || messageLower.includes('list')) {
      suggestions.push('Create a listing', 'Pricing tips', 'Photography guide');
    }

    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push('Browse categories', 'Find trending items', 'Get styling tips');
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
}

// Export singleton instance
export const aiAssistantService = new AIAssistantService();