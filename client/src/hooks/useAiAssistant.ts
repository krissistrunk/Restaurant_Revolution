import { useContext } from "react";
import { AiAssistantContext } from "@/context/AiAssistantContext";

export const useAiAssistant = () => {
  const context = useContext(AiAssistantContext);
  
  if (!context) {
    throw new Error("useAiAssistant must be used within an AiAssistantProvider");
  }
  
  return context;
};