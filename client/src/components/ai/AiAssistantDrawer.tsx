import { useState, useEffect } from "react";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { useAuth } from "@/hooks/useAuth";
import ChatInterface from "./ChatInterface";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { MessageSquareIcon, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AiAssistantDrawer = () => {
  const { isAuthenticated, user } = useAuth();
  const { currentConversation, startNewConversation } = useAiAssistant();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    // If the user is authenticated and the drawer is opened but no conversation exists, start one
    if (isAuthenticated && open && !currentConversation) {
      startNewConversation();
    }
  }, [isAuthenticated, open, currentConversation, startNewConversation]);
  
  return (
    <>
      {/* Fixed button in bottom right corner without SheetTrigger */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <MessageSquareIcon className="h-6 w-6" />
        </Button>
        
        {isAuthenticated && (
          <Badge variant="outline" className="bg-background">
            <Sparkles className="h-3 w-3 text-primary mr-1" />
            <span className="text-xs">AI Assistant</span>
          </Badge>
        )}
      </div>
      
      {/* Drawer with chat interface */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="right" 
          className="sm:max-w-md md:max-w-lg w-[90vw] p-0 flex flex-col h-full"
        >
          <SheetHeader className="px-4 py-3 border-b flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Restaurant Assistant
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <ChatInterface embedded />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AiAssistantDrawer;