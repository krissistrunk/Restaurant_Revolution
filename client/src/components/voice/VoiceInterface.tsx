import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useMenuStore } from '@/stores/menuStore';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Bot,
  User,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';

interface VoiceCommand {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  confidence?: number;
  intent?: string;
  response?: string;
}

interface VoiceInterfaceProps {
  className?: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { menuItems } = useMenuStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [conversation, setConversation] = useState<VoiceCommand[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voice: 'female',
    speed: 1.0,
    volume: 0.8
  });

  // Mock speech recognition and synthesis
  const speechRecognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<any>(null);

  useEffect(() => {
    // Initialize mock speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // Real implementation would use actual Speech Recognition API
      console.log('Speech Recognition available');
    }
    
    // Add welcome message
    if (conversation.length === 0) {
      setConversation([
        {
          id: '1',
          text: "Hi! I'm your AI dining assistant. You can ask me about our menu, make reservations, or get personalized recommendations. Try saying something like 'What are your specials today?' or 'I want something spicy'.",
          type: 'assistant',
          timestamp: new Date(),
          confidence: 100,
          intent: 'welcome'
        }
      ]);
    }
  }, []);

  const startListening = () => {
    setIsListening(true);
    setCurrentTranscript('');
    
    // Mock listening simulation
    setTimeout(() => {
      const mockPhrases = [
        "What are your vegetarian options?",
        "I'd like to make a reservation for two",
        "What do you recommend for someone who likes spicy food?",
        "Can you tell me about today's specials?",
        "I'm allergic to nuts, what can I eat?",
        "Add the truffle pasta to my order",
        "How long will my order take?",
        "What wine pairs well with salmon?"
      ];
      
      const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      simulateTranscription(randomPhrase);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    if (currentTranscript) {
      processVoiceCommand(currentTranscript);
    }
  };

  const simulateTranscription = (text: string) => {
    setCurrentTranscript('');
    let index = 0;
    
    const typeText = () => {
      if (index < text.length) {
        setCurrentTranscript(text.substring(0, index + 1));
        index++;
        setTimeout(typeText, 50);
      } else {
        setTimeout(() => {
          setIsListening(false);
          processVoiceCommand(text);
        }, 500);
      }
    };
    
    typeText();
  };

  const processVoiceCommand = (text: string) => {
    const userCommand: VoiceCommand = {
      id: Date.now().toString(),
      text,
      type: 'user',
      timestamp: new Date(),
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99% confidence
      intent: detectIntent(text)
    };

    setConversation(prev => [...prev, userCommand]);
    setCurrentTranscript('');

    // Generate AI response
    setTimeout(() => {
      const response = generateAIResponse(text, userCommand.intent);
      const assistantResponse: VoiceCommand = {
        id: (Date.now() + 1).toString(),
        text: response,
        type: 'assistant',
        timestamp: new Date(),
        confidence: 95,
        intent: 'response'
      };

      setConversation(prev => [...prev, assistantResponse]);
      
      // Simulate text-to-speech
      if (isEnabled) {
        speakText(response);
      }
    }, 1000);
  };

  const detectIntent = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('reservation') || lowerText.includes('book') || lowerText.includes('table')) {
      return 'reservation';
    }
    if (lowerText.includes('vegetarian') || lowerText.includes('vegan') || lowerText.includes('allerg')) {
      return 'dietary';
    }
    if (lowerText.includes('special') || lowerText.includes('recommend') || lowerText.includes('suggest')) {
      return 'recommendation';
    }
    if (lowerText.includes('order') || lowerText.includes('add') || lowerText.includes('cart')) {
      return 'order';
    }
    if (lowerText.includes('wine') || lowerText.includes('drink') || lowerText.includes('beverage')) {
      return 'beverage';
    }
    if (lowerText.includes('spicy') || lowerText.includes('mild') || lowerText.includes('hot')) {
      return 'spice_preference';
    }
    
    return 'general';
  };

  const generateAIResponse = (text: string, intent?: string): string => {
    const responses = {
      reservation: [
        "I'd be happy to help you with a reservation! For how many people and what time would you prefer? Our available slots today are 6:00 PM, 7:30 PM, and 9:00 PM.",
        "Perfect! Let me check our availability. We have tables available this evening. Would you prefer indoor or outdoor seating?"
      ],
      dietary: [
        "Great question! We have several excellent vegetarian options including our roasted vegetable quinoa bowl, mushroom risotto, and our famous margherita pizza with house-made mozzarella.",
        "For our guests with dietary restrictions, we offer detailed allergen information for every dish. Our gluten-free pasta and dairy-free desserts are very popular!"
      ],
      recommendation: [
        `Based on your preferences, I recommend our chef's special tonight: pan-seared salmon with lemon herb butter. It's getting rave reviews! ${user?.name ? `${user.name}, I` : 'I'} also think you'd love our truffle pasta.`,
        "Today's specials include our dry-aged ribeye with roasted vegetables and our seasonal seafood risotto. Both are perfect for sharing!"
      ],
      order: [
        "Excellent choice! I've noted that you'd like to add the truffle pasta. Would you like to add any appetizers or drinks to your order?",
        "Added to your order! Your current total is $32.50. Would you like to continue browsing or proceed to checkout?"
      ],
      beverage: [
        "For wine pairings, I recommend our house Sauvignon Blanc with the salmon, or our Pinot Noir with red meat dishes. We also have craft cocktails and local beer.",
        "Our sommelier suggests the 2019 Chardonnay with seafood dishes. For non-alcoholic options, try our house-made lavender lemonade!"
      ],
      spice_preference: [
        "Perfect! For spicy food lovers, try our Nashville hot chicken sandwich, Thai curry noodles, or our signature jalapeño mac and cheese. How spicy do you like it on a scale of 1-5?",
        "I love that you enjoy bold flavors! Our chef's spiciest creation is the ghost pepper wings, but if you want something milder with a kick, the Korean BBQ tacos are amazing."
      ],
      general: [
        "I'm here to help with anything menu-related! Feel free to ask about ingredients, preparation methods, or let me know your preferences for personalized recommendations.",
        "Is there anything specific you'd like to know about our menu, restaurant, or dining experience today?"
      ]
    };

    const intentResponses = responses[intent as keyof typeof responses] || responses.general;
    return intentResponses[Math.floor(Math.random() * intentResponses.length)];
  };

  const speakText = (text: string) => {
    setIsSpeaking(true);
    
    // Mock text-to-speech timing
    const words = text.split(' ').length;
    const estimatedTime = (words / 3) * 1000; // ~3 words per second
    
    setTimeout(() => {
      setIsSpeaking(false);
    }, Math.min(estimatedTime, 8000)); // Max 8 seconds
  };

  const clearConversation = () => {
    setConversation([
      {
        id: '1',
        text: "Conversation cleared! How can I help you today?",
        type: 'assistant',
        timestamp: new Date(),
        confidence: 100,
        intent: 'welcome'
      }
    ]);
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'reservation': return '📅';
      case 'dietary': return '🥗';
      case 'recommendation': return '⭐';
      case 'order': return '🛒';
      case 'beverage': return '🍷';
      case 'spice_preference': return '🌶️';
      default: return '💬';
    }
  };

  return (
    <Card className={`${className} max-w-2xl mx-auto`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI Voice Assistant
          <Badge variant="secondary" className="ml-auto">
            Beta
          </Badge>
        </CardTitle>
        <CardDescription>
          Speak naturally to get menu recommendations, make orders, and more
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <div className="flex items-center gap-3">
            <Button
              onClick={isListening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={isSpeaking}
            >
              {isListening ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>
            
            <div>
              <div className="font-medium">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready to listen'}
              </div>
              <div className="text-sm text-gray-600">
                {isListening ? 'Tap to stop' : 'Tap to start talking'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEnabled(!isEnabled)}
            >
              {isEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Transcript */}
        {(isListening || currentTranscript) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">You're saying:</span>
                {isListening && (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-primary animate-pulse"></div>
                    <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
              <p className="text-gray-700">
                {currentTranscript || 'Start speaking...'}
                {isListening && <span className="animate-pulse">|</span>}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Conversation History */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {conversation.map((command) => (
            <div
              key={command.id}
              className={`flex gap-3 ${
                command.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  command.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {command.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {command.type === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  {command.intent && (
                    <span className="text-xs">
                      {getIntentIcon(command.intent)}
                    </span>
                  )}
                  {command.confidence && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        command.type === 'user' ? 'bg-white/20' : ''
                      }`}
                    >
                      {command.confidence}%
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{command.text}</p>
                <div className="text-xs opacity-60 mt-1">
                  {command.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Voice Commands
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              "What's your special today?",
              "I want something vegetarian",
              "Make a reservation",
              "Wine recommendations"
            ].map((command, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 justify-start"
                onClick={() => processVoiceCommand(command)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                {command}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Features Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <Brain className="h-3 w-3" />
          <span>Powered by AI</span>
          <Sparkles className="h-3 w-3" />
          <span>Natural Language Processing</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceInterface;