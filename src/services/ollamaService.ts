
interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Helper function to clean up model responses
function cleanModelResponse(response: string): string {
  // Remove <think> and </think> blocks and their contents
  response = response.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  // Remove any remaining think tags
  response = response.replace(/<\/?think>/g, '');
  
  // Remove any internal reasoning markers
  response = response.replace(/^(Thinking:|I need to:|Let me think:|Hmm,|Okay,|Let's see,|Now,)/gmi, '');
  
  // Handle bold formatting - convert **text** to <strong>text</strong>
  response = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic formatting - convert *text* to <em>text</em> (avoiding asterisks inside LaTeX)
  response = response.replace(/(?<!\$[^$]*)\*(?!\*)(.*?)(?<!\*)\*(?!\$[^$]*)/g, '<em>$1</em>');
  
  // Replace $ symbols with proper LaTeX delimiters when used as math delimiters
  response = response.replace(/\$\s*([^$]+?)\s*\$/g, '\\($1\\)');
  
  // Ensure matrices are properly formatted
  response = response.replace(/\\begin\{pmatrix\}/g, '\\begin{pmatrix} ');
  response = response.replace(/\\end\{pmatrix\}/g, ' \\end{pmatrix}');
  
  // Add line breaks after key explanations for better readability
  response = response.replace(/(\\To|To) (multiply|add|subtract|compute|solve|find|calculate) ([^\.]+\.)/gi, '$1 $2 $3<br/>');
  response = response.replace(/(For instance,|For example,|Let's try|Let's calculate)/gi, '<br/>$1');
  
  // Clean up any double spaces or line breaks that might result from removals
  response = response.replace(/\s+/g, ' ').trim();
  
  // Check if we need to add a reward emoji
  if (/correct|right|exactly|perfect|well done|good job/i.test(response)) {
    response += " 🎉";
  } else if (/progress|getting there|close|almost/i.test(response)) {
    response += " 🌟";
  } else if (/try again|incorrect|not quite|wrong/i.test(response)) {
    response += " 🤔";
  }
  
  // Ensure proper capitalization of first sentence if needed
  if (response.length > 0) {
    response = response.charAt(0).toUpperCase() + response.slice(1);
  }
  
  return response;
}

export async function generateMathResponse(messages: Message[]): Promise<string> {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful and patient math tutor. Instead of providing complete solutions, ask questions to understand where the student is stuck. Then provide incremental hints that guide them toward discovering the answer themselves. Format all math using LaTeX notation surrounded by $ symbols like $x^2$. Use **bold** for emphasis and *italics* for important terms. Keep your responses brief and focused on the specific obstacle the student is facing. Never solve the entire problem for them. If they seem to be making progress, acknowledge it with encouraging words and ask what their next step would be. If a student gives a correct answer, congratulate them. IMPORTANT: Never include your thinking process in <think> tags or show any meta-commentary about your approach. Just respond naturally as a tutor would.'
          },
          ...messages
        ],
        stream: false,
        options: {
          temperature: 0.5, // Balanced between creativity and focus
          top_p: 0.9
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return cleanModelResponse(data.message.content);
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    return "I'm having trouble connecting to the math engine. Please ensure Ollama is running locally with the qwen3 model installed.";
  }
}

// Function to check if text contains equations that can be plotted
export function canPlotEquation(text: string): boolean {
  // Check for various types of equations that can be plotted
  const patterns = [
    // Linear equations (standard form)
    /\d*x\s*[\+\-]\s*\d*y\s*=\s*\d+/i,
    
    // Matrix representation
    /\\begin\{pmatrix\}|\\begin\{bmatrix\}|\\begin\{matrix\}/i,
    
    // Vectors, coordinates or points
    /vector\s+[A-Za-z]\s*=\s*\(\s*-?\d+\s*,\s*-?\d+\s*\)/i,
    
    // Vector addition problems
    /vector\s+[A-Za-z]\s*\+\s*vector\s+[A-Za-z]/i,
    
    // Explicit plotting requests
    /plot|draw|graph|visualize/i
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

// Function to extract equations, vectors or points from text
export function extractEquations(text: string): string[] {
  const patterns = [
    // Match linear equations in the form of ax + by = c
    /(\d*x\s*[\+\-]\s*\d*y\s*=\s*\d+)/g,
    
    // Match vector definitions like "Vector A = (1, 2)"
    /vector\s+([A-Za-z])\s*=\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/gi
  ];
  
  let matches: string[] = [];
  
  patterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) {
      matches = [...matches, ...found];
    }
  });
  
  return matches;
}

// Function to parse vector coordinates from text
export function parseVectors(text: string): { [key: string]: {x: number, y: number} } {
  const vectors: { [key: string]: {x: number, y: number} } = {};
  const vectorPattern = /vector\s+([A-Za-z])\s*=\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/gi;
  
  let match;
  while ((match = vectorPattern.exec(text)) !== null) {
    const [_, name, xStr, yStr] = match;
    vectors[name.toUpperCase()] = {
      x: parseInt(xStr, 10),
      y: parseInt(yStr, 10)
    };
  }
  
  return vectors;
}

// Function to convert an equation like "2x + 3y = 6" to slope-intercept form (y = mx + b)
export function convertToSlopeIntercept(equation: string): { slope: number; intercept: number } {
  try {
    // Remove spaces
    equation = equation.replace(/\s+/g, '');
    
    // Regular expression to match coefficients
    const pattern = /(-?\d*)x([+-]\d*)y=(-?\d+)/i;
    const match = equation.match(pattern);
    
    if (!match) return { slope: 0, intercept: 0 };
    
    let a = match[1] === "-" ? -1 : match[1] === "" ? 1 : parseInt(match[1]);
    let b = match[2] === "+" ? 1 : match[2] === "-" ? -1 : parseInt(match[2].replace(/[+-]/g, '')) * (match[2].includes('-') ? -1 : 1);
    let c = parseInt(match[3]);
    
    // y = (-a/b)x + (c/b)
    const slope = -a / b;
    const intercept = c / b;
    
    return { slope, intercept };
  } catch (error) {
    console.error("Error converting equation:", error);
    return { slope: 0, intercept: 0 };
  }
}
