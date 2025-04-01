import { useState, useRef, useEffect } from "react";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ChevronDown, Send, Sparkles } from "lucide-react";
import ChatBubble from "./ChatBubble";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatInterface = () => {
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
  const [isTyping, setIsTyping] = useState(false);
  
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
  
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="p-6 text-center">
          <p>Please log in to use the AI Assistant.</p>
        </CardContent>
      </Card>
    );
  }
  
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
      
      <ScrollArea className="h-[400px] p-4">
        <CardContent className="p-4">
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
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="p-4 border-t">
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
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;