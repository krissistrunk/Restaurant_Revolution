import { useEffect } from "react";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import ChatInterface from "@/components/ai/ChatInterface";
import { MessageSquare, PlusCircle, Clock, History } from "lucide-react";
import { format } from "date-fns";

const AiAssistantPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    startNewConversation, 
    loadConversation, 
    isLoading 
  } = useAiAssistant();
  
  useEffect(() => {
    // If authenticated and no current conversation, start a new one
    if (isAuthenticated && !currentConversation && !isLoading) {
      startNewConversation();
    }
  }, [isAuthenticated, currentConversation, startNewConversation, isLoading]);
  
  if (!isAuthenticated) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Please log in to use the AI Assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/login"}
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with conversation history */}
        <div className="md:w-1/3 shrink-0">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button
                onClick={() => startNewConversation()}
                className="w-full mt-2"
                variant="outline"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No conversation history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((convo) => (
                    <div
                      key={convo.id}
                      onClick={() => loadConversation(convo.id)}
                      className={`p-3 rounded-md cursor-pointer hover:bg-accent flex items-start ${
                        currentConversation?.id === convo.id
                          ? "bg-accent"
                          : ""
                      }`}
                    >
                      <MessageSquare className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                      <div className="truncate">
                        <div className="font-medium truncate">
                          {convo.messages[0]?.content.substring(0, 30)}...
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(convo.updatedAt), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main chat interface */}
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
};

export default AiAssistantPage;