import { useState, useRef, useEffect } from "react";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, PlusCircle, Send, Sparkles } from "lucide-react";
import ChatBubble from "./ChatBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  embedded?: boolean;
}

const ChatInterface = ({ embedded = false }: ChatInterfaceProps) => {
  const { isAuthenticated } = useAuth();
  const { 
    currentConversation, 
    startNewConversation, 
    sendMessage, 
    isSending,
    getRecommendations
  } = useAiAssistant();
  
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Start a new conversation if none exists
    if (isAuthenticated && !currentConversation) {
      startNewConversation();
    }
  }, [isAuthenticated, currentConversation, startNewConversation]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    try {
      await sendMessage(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleGetRecommendations = async (type: "menu" | "reservation" | "order") => {
    await getRecommendations(type);
  };
  
  // Content when user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className={cn(
        "flex flex-col justify-center items-center h-full",
        embedded ? "p-4" : "w-full max-w-xl mx-auto"
      )}>
        <p className="text-center text-muted-foreground py-8">
          Please log in to use the AI Assistant.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.href = "/login"}
        >
          Log In
        </Button>
      </div>
    );
  }
  
  // Chat content wrapper
  const ChatContent = () => (
    <>
      <div className={embedded ? "p-2" : "p-4"}>
        {currentConversation?.messages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
        
        {isSending && (
          <div className="flex justify-start mt-4">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </>
  );
  
  // Chat input form
  const ChatInputForm = () => (
    <form onSubmit={handleSubmit} className="w-full flex gap-2">
      <Input
        className="flex-1"
        placeholder="Type your message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isSending}
      />
      <Button type="submit" disabled={isSending || !inputValue.trim()}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
  
  // When embedded in drawer, use a different layout
  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Quick Actions <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleGetRecommendations("menu")}>
                Menu Recommendations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGetRecommendations("reservation")}>
                Make a Reservation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGetRecommendations("order")}>
                Place an Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {currentConversation && (
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => startNewConversation()}
              className="text-xs"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              New Chat
            </Button>
          )}
        </div>
        
        <ScrollArea className="flex-1">
          <ChatContent />
        </ScrollArea>
        
        <div className="p-3 border-t">
          <ChatInputForm />
        </div>
      </div>
    );
  }
  
  // Standalone mode (for the dedicated page)
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Restaurant Assistant</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Get Help <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleGetRecommendations("menu")}>
                Menu Recommendations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGetRecommendations("reservation")}>
                Make a Reservation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGetRecommendations("order")}>
                Place an Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="h-[400px]">
        <CardContent>
          <ChatContent />
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="p-4 border-t">
        <ChatInputForm />
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;