import { createContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiConversation {
  id: number;
  userId: number;
  restaurantId: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  context?: any;
  resolved: boolean;
}

interface AiAssistantContextType {
  conversations: AiConversation[];
  currentConversation: AiConversation | null;
  isLoading: boolean;
  isSending: boolean;
  startNewConversation: () => Promise<AiConversation>;
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (id: number) => Promise<void>;
  resolveConversation: () => Promise<void>;
  getRecommendations: (type: "menu" | "reservation" | "order") => Promise<void>;
}

export const AiAssistantContext = createContext<AiAssistantContextType | null>(null);

interface AiAssistantProviderProps {
  children: ReactNode;
}

export const AiAssistantProvider = ({ children }: AiAssistantProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AiConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET", 
        `/api/ai-conversations?userId=${user.id}`,
        undefined
      );
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        throw new Error("Failed to load conversations");
      }
    } catch (error) {
      console.error("Error loading AI conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = async (): Promise<AiConversation> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const response = await apiRequest(
        "POST",
        "/api/ai-conversations",
        {
          userId: user.id,
          restaurantId: 1, // Default restaurant ID
          messages: [
            {
              role: "assistant",
              content: "Hello! I'm your restaurant assistant. How can I help you today? I can help with menu recommendations, reservations, or placing orders.",
              timestamp: new Date()
            }
          ]
        }
      );
      
      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
        await queryClient.invalidateQueries({ queryKey: ['/api/ai-conversations'] });
        return newConversation;
      } else {
        throw new Error("Failed to create new conversation");
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start a new conversation. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!user || !currentConversation) throw new Error("No active conversation");
    
    setIsSending(true);
    try {
      // Optimistically update UI
      const userMessage: Message = {
        role: "user",
        content,
        timestamp: new Date()
      };
      
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, userMessage]
        };
      });
      
      // Send to server
      const response = await apiRequest(
        "POST",
        `/api/ai-conversations/${currentConversation.id}/messages`,
        userMessage
      );
      
      if (response.ok) {
        // Get updated conversation with AI response
        const updatedConversation = await response.json();
        setCurrentConversation(updatedConversation);
        
        // Update conversations list
        setConversations(prev => 
          prev.map(convo => 
            convo.id === updatedConversation.id ? updatedConversation : convo
          )
        );
        
        await queryClient.invalidateQueries({ queryKey: ['/api/ai-conversations'] });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
      
      // Revert optimistic update
      loadConversation(currentConversation.id);
    } finally {
      setIsSending(false);
    }
  };

  const loadConversation = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/ai-conversations/${id}`,
        undefined
      );
      
      if (response.ok) {
        const conversation = await response.json();
        setCurrentConversation(conversation);
      } else {
        throw new Error("Failed to load conversation");
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resolveConversation = async (): Promise<void> => {
    if (!currentConversation) return;
    
    try {
      const response = await apiRequest(
        "POST",
        `/api/ai-conversations/${currentConversation.id}/resolve`,
        {}
      );
      
      if (response.ok) {
        const resolvedConversation = await response.json();
        setCurrentConversation(resolvedConversation);
        
        // Update conversations list
        setConversations(prev => 
          prev.map(convo => 
            convo.id === resolvedConversation.id ? resolvedConversation : convo
          )
        );
        
        toast({
          title: "Success",
          description: "Conversation resolved successfully.",
        });
        
        await queryClient.invalidateQueries({ queryKey: ['/api/ai-conversations'] });
      } else {
        throw new Error("Failed to resolve conversation");
      }
    } catch (error) {
      console.error("Error resolving conversation:", error);
      toast({
        title: "Error",
        description: "Failed to resolve conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRecommendations = async (type: "menu" | "reservation" | "order"): Promise<void> => {
    if (!user || !currentConversation) return;

    let message = "";
    switch (type) {
      case "menu":
        message = "Can you recommend some menu items for me?";
        break;
      case "reservation":
        message = "I'd like to make a reservation. What times do you have available?";
        break;
      case "order":
        message = "I'd like to place an order for pickup. Can you help me?";
        break;
    }

    await sendMessage(message);
  };

  return (
    <AiAssistantContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        isSending,
        startNewConversation,
        sendMessage,
        loadConversation,
        resolveConversation,
        getRecommendations
      }}
    >
      {children}
    </AiAssistantContext.Provider>
  );
};