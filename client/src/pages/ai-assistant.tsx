import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Bot, User, Sparkles, ShoppingBag, Heart, Search } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

interface AssistantResponse {
  success: boolean;
  message: string;
  suggestions?: string[];
  relatedProducts?: any[];
  conversationId: string;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your BazaarLive shopping assistant. I'm here to help you find great products, get styling advice, and navigate our marketplace. What can I help you with today?",
      suggestions: ['Browse categories', 'Find trending items', 'Get styling tips', 'Help me sell'],
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Health check query
  const { data: healthData } = useQuery({
    queryKey: ['/api/ai-assistant/health'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<AssistantResponse> => {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          suggestions: data.suggestions,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsTyping(false);
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Send to AI assistant
    chatMutation.mutate(userMessage.content);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Bot className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-2">AI Shopping Assistant</h2>
            <p className="text-gray-600 mb-4">
              Please sign in to chat with your personal shopping assistant.
            </p>
            <Button className="w-full" data-testid="button-signin" onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" data-testid="page-ai-assistant">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-ai-assistant">
              AI Shopping Assistant
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto" data-testid="text-description">
            Get personalized shopping advice, product recommendations, and marketplace guidance from your AI assistant.
          </p>
          
          {/* Status indicator */}
          {healthData && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${(healthData as any).service?.hasApiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-500" data-testid="status-indicator">
                {(healthData as any).service?.hasApiKey ? 'AI Powered' : 'Limited Mode'}
              </span>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col" data-testid="card-chat-interface">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat with Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-6" data-testid="scroll-messages">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white ml-auto'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed" data-testid={`text-message-content-${message.id}`}>
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => handleSuggestionClick(suggestion)}
                              data-testid={`button-suggestion-${index}`}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 justify-start" data-testid="typing-indicator">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <Separator />
            
            {/* Input Area */}
            <div className="p-6">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about shopping, products, or the marketplace..."
                  className="flex-1"
                  disabled={isTyping}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-6"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("What's trending right now?")}
                  data-testid="button-quick-trending"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  What's trending?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("Help me find something to buy")}
                  data-testid="button-quick-find"
                >
                  <Search className="w-3 h-3 mr-1" />
                  Find products
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("How do I sell on BazaarLive?")}
                  data-testid="button-quick-sell"
                >
                  <ShoppingBag className="w-3 h-3 mr-1" />
                  How to sell
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}