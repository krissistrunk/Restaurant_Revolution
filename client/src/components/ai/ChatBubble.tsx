import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ChatBubbleProps {
  message: {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  };
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === "user";
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);
  
  return (
    <div
      className={cn(
        "flex w-full mt-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex items-start gap-2 max-w-[80%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Avatar className="h-8 w-8">
          {isUser ? (
            <>
              <AvatarFallback>U</AvatarFallback>
              <AvatarImage src="/user-avatar.png" />
            </>
          ) : (
            <>
              <AvatarFallback>AI</AvatarFallback>
              <AvatarImage src="/assistant-avatar.png" />
            </>
          )}
        </Avatar>
        
        <div
          className={cn(
            "px-4 py-3 rounded-lg",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <div className="text-sm whitespace-pre-wrap">
            {message.content}
          </div>
          <div className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {format(timestamp, "h:mm a")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;