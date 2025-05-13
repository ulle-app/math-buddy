
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { MessageProps } from './ChatMessage';
import { Send } from 'lucide-react';
import { generateMathResponse } from '../services/ollamaService';
import { Input } from './ui/input';

interface ChatWindowProps {
  isMathjaxLoaded: boolean;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const initialMessages: MessageProps[] = [
  { 
    text: "Hi! I'm your math tutor. What problem are you working on today?", 
    isUser: false 
  }
];

// Function to properly convert mathematical expressions to LaTeX
const convertToLatex = (text: string): string => {
  // Check if this is a math-specific command
  if (/^(solve|calculate|find|evaluate|simplify)\b/i.test(text)) {
    const command = text.match(/^(solve|calculate|find|evaluate|simplify)\s+/i)?.[0] || '';
    const equation = text.substring(command.length);
    
    // Process the equation for proper LaTeX
    const processedEquation = processLatexEquation(equation);
    
    // Return with proper LaTeX delimiters
    return `${command}\\(${processedEquation}\\)`;
  }
  
  // For regular text, scan for math expressions
  return processInlineLatex(text);
};

// Process a full equation for LaTeX
const processLatexEquation = (equation: string): string => {
  let processed = equation;

  // Process fractions correctly with proper LaTeX \frac{}{} notation
  // This pattern looks for number/number patterns
  processed = processed.replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");
  
  // Pattern for variable fractions like x/2, a/b
  processed = processed.replace(/([a-zA-Z])\/(\d+)/g, "\\frac{$1}{$2}");
  processed = processed.replace(/(\d+)\/([a-zA-Z])/g, "\\frac{$1}{$2}");
  processed = processed.replace(/([a-zA-Z])\/([a-zA-Z])/g, "\\frac{$1}{$2}");
  
  // Process exponents with proper formatting
  processed = processed.replace(/([a-zA-Z0-9])(\^)(\d+)/g, "$1^{$3}");
  processed = processed.replace(/([a-zA-Z0-9])\^(\w+)/g, "$1^{$2}");
  
  // Ensure multiplication is properly formatted
  processed = processed.replace(/\*/g, "\\cdot ");
  
  // Handle square roots
  processed = processed.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}");
  
  // Handle common mathematical functions
  processed = processed.replace(/\bsin\(/g, "\\sin(");
  processed = processed.replace(/\bcos\(/g, "\\cos(");
  processed = processed.replace(/\btan\(/g, "\\tan(");
  processed = processed.replace(/\blog\(/g, "\\log(");
  processed = processed.replace(/\bln\(/g, "\\ln(");
  
  // Process pi symbol
  processed = processed.replace(/\bpi\b/g, "\\pi ");

  return processed;
};

// Process a text string that might contain inline math
const processInlineLatex = (text: string): string => {
  // Define patterns to look for
  const patterns = [
    // Pre-formatted fractions with improved detection
    { 
      regex: /(\d+)\/(\d+)/g, 
      replace: " \\(\\frac{$1}{$2}\\) " 
    },
    
    // Variable fractions like x/2, a/b
    {
      regex: /([a-zA-Z])\/(\d+)/g,
      replace: " \\(\\frac{$1}{$2}\\) "
    },
    {
      regex: /(\d+)\/([a-zA-Z])/g,
      replace: " \\(\\frac{$1}{$2}\\) "
    },
    {
      regex: /([a-zA-Z])\/([a-zA-Z])/g,
      replace: " \\(\\frac{$1}{$2}\\) "
    },
    
    // Exponents (like x^2, a^3)
    { 
      regex: /([a-zA-Z0-9])\^(\d+)/g, 
      replace: " \\($1^{$2}\\) " 
    },
    
    // Exponents with variables (like x^y)
    {
      regex: /([a-zA-Z0-9])\^([a-zA-Z])/g,
      replace: " \\($1^{$2}\\) "
    },
    
    // Quadratic equations
    { 
      regex: /(\d*[a-zA-Z])\^2([\+\-]\d*[a-zA-Z][\+\-]\d+)=(\d+)/g, 
      replace: " \\($1^{2}$2=$3\\) " 
    },
    
    // Linear equations
    { 
      regex: /(\d*[a-zA-Z][\+\-]\d+)=(\d+)/g, 
      replace: " \\($1=$2\\) " 
    },
    
    // Inequalities
    { 
      regex: /(\d*[a-zA-Z][\+\-]\d*)\s*(>|<|>=|<=)\s*(\d+)/g, 
      replace: " \\($1 $2 $3\\) " 
    }
  ];
  
  // Apply each pattern
  let result = text;
  patterns.forEach(pattern => {
    result = result.replace(pattern.regex, pattern.replace);
  });
  
  return result;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ isMathjaxLoaded }) => {
  const [messages, setMessages] = useState<MessageProps[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      
      // Convert potential mathematical expressions to LaTeX format
      const formattedText = convertToLatex(input);
      
      // Add user message with the formatted text
      setMessages(prev => [...prev, { text: formattedText, isUser: true }]);
      
      // Update conversation history with the new user message
      const userMessage: Message = { role: 'user', content: input };
      const updatedHistory = [...conversationHistory, userMessage];
      setConversationHistory(updatedHistory);
      
      setInput('');
      
      try {
        // Call Ollama API
        const response = await generateMathResponse(updatedHistory);
        
        // Format the response with LaTeX
        const formattedResponse = convertToLatex(response);
        
        // Add the assistant's response
        setMessages(prev => [...prev, { 
          text: formattedResponse, 
          isUser: false 
        }]);
        
        // Update conversation history with the assistant's response
        setConversationHistory([...updatedHistory, { role: 'assistant', content: response }]);
      } catch (error) {
        console.error('Error generating response:', error);
        setMessages(prev => [...prev, { 
          text: "I'm having trouble connecting to the math engine. Please ensure Ollama is running locally with the qwen3 model installed.", 
          isUser: false 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 message-container">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            text={msg.text} 
            isUser={msg.isUser} 
            isMathjaxLoaded={isMathjaxLoaded}
          />
        ))}
        {isLoading && (
          <div className="flex mb-4 justify-start">
            <div className="bg-mathBuddy-teal text-gray-50 p-3 rounded-lg animate-pulse shadow-lg">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        className="p-4 border-t border-mathBuddy-cardBg/30 flex gap-2"
        onSubmit={handleSubmit}
      >
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask your math question..."
          className="flex-1 bg-mathBuddy-cardBg/80 backdrop-blur-sm text-gray-100 p-3 rounded-lg shadow-inner focus:outline-none focus:ring-1 focus:ring-mathBuddy-tealLight"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className={`bg-mathBuddy-teal text-gray-50 rounded-lg px-4 py-2 transition-all duration-200 flex items-center justify-center shadow-lg ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-mathBuddy-tealLight'
          }`}
          disabled={isLoading}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
