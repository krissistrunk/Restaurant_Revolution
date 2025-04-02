import { useState, useEffect } from "react";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { useAuth } from "@/hooks/useAuth";
import ChatInterface from "./ChatInterface";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

const AiAssistantDrawer = () => {
  const { isAuthenticated } = useAuth();
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
      {/* Fixed tab on right side of the screen */}
      <div 
        className={`fixed right-0 top-1/3 z-50 transition-transform duration-300 ${open ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <Button 
          variant="default"
          className="h-24 rounded-l-xl rounded-r-none py-2 px-1 shadow-xl flex flex-col justify-center items-center gap-1 border-r-0 border-2"
          onClick={() => setOpen(true)}
        >
          <Sparkles className="h-4 w-4" />
          <span className="rotate-90 whitespace-nowrap text-xs font-medium">Assistant</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Drawer with chat interface */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="right" 
          className="sm:max-w-[180px] md:max-w-[200px] w-[80vw] p-0 flex flex-col h-[60vh] mt-[20vh]"
        >
          <SheetHeader className="px-4 py-3 border-b flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Restaurant Assistant
            </SheetTitle>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8" 
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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