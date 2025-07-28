/**
 * AI Assistant API Routes
 * Provides endpoints for AI-powered shopping assistance
 */

import { Request, Response, Application } from 'express';
import { z } from 'zod';
import { AIAssistantService } from '../services/AIAssistantService';
import { insertAiConversationSchema, insertAiMessageSchema } from '../../shared/schema';

// Request validation schemas
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

const conversationRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

/**
 * Register AI Assistant routes with authentication middleware
 */
export function registerAiAssistantRoutes(app: Application, isAuthenticated: any) {
  const aiService = new AIAssistantService();

  // Health check endpoint
  app.get('/api/ai-assistant/health', async (req: Request, res: Response) => {
    try {
      const healthResult = await aiService.healthCheck();
      
      if (healthResult.isSuccess()) {
        res.json({
          status: 'healthy',
          service: healthResult.value
        });
      } else {
        res.status(500).json({
          status: 'unhealthy',
          error: healthResult.error.message
        });
      }
    } catch (error) {
      console.error('AI Assistant health check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed'
      });
    }
  });

  // Chat with AI assistant
  app.post('/api/ai-assistant/chat', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { message, conversationId } = chatRequestSchema.parse(req.body);

      // Build context for the AI assistant
      const context = {
        userId,
        currentCategory: req.body.category,
        userPreferences: req.body.preferences,
        recentActivity: req.body.recentActivity
      };

      // Build chat history (simplified for now)
      const messages = [
        { role: 'user' as const, content: message }
      ];

      // Generate AI response
      const result = await aiService.generateResponse(messages, context);

      if (result.isSuccess()) {
        const response = result.value;
        
        res.json({
          success: true,
          message: response.message,
          suggestions: response.suggestions,
          relatedProducts: response.relatedProducts,
          conversationId: response.conversationId
        });
      } else {
        console.error('AI Assistant error:', result.error.message);
        res.status(500).json({
          success: false,
          message: 'Failed to generate AI response',
          error: result.error.message
        });
      }
    } catch (error) {
      console.error('Chat endpoint error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get user's conversations
  app.get('/api/ai-assistant/conversations', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      
      // TODO: Implement database storage for conversations
      // For now, return empty array
      res.json({
        success: true,
        conversations: []
      });
    } catch (error) {
      console.error('Conversations endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations'
      });
    }
  });

  // Get conversation messages
  app.get('/api/ai-assistant/conversations/:conversationId/messages', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { conversationId } = req.params;

      // TODO: Implement database storage for messages
      // For now, return empty array
      res.json({
        success: true,
        messages: []
      });
    } catch (error) {
      console.error('Messages endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }
  });

  // Create new conversation
  app.post('/api/ai-assistant/conversations', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { title } = conversationRequestSchema.parse(req.body);

      // TODO: Implement database storage for conversations
      const conversationId = `conv_${userId}_${Date.now()}`;
      
      res.json({
        success: true,
        conversation: {
          id: conversationId,
          title: title || 'New Conversation',
          userId,
          messageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Create conversation endpoint error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation'
      });
    }
  });

  // Delete conversation
  app.delete('/api/ai-assistant/conversations/:conversationId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { conversationId } = req.params;

      // TODO: Implement database storage for conversations
      
      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('Delete conversation endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete conversation'
      });
    }
  });

  console.log('[AI-ASSISTANT] Routes registered successfully');
}