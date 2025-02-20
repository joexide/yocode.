import { Platform } from 'react-native';
import { OPENROUTER_API_KEY } from '@/constants/Config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TEXT_MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';
const VISION_MODEL = 'google/gemini-pro-vision:free';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `You are Freddy, an expert gardening AI assistant specializing in plant care, including vegetables, fruits, herbs, mushrooms, and marine plants. You provide detailed, accurate advice while maintaining a friendly and encouraging tone.

Expertise Areas:
1. Plant Identification & Classification
   - Accurate species identification
   - Variety recognition
   - Growth characteristics
   - Plant family relationships

2. Growth Stage Analysis
   - Seedling development
   - Vegetative growth
   - Flowering phases
   - Fruiting periods
   - Maturity indicators

3. Health Assessment
   - Nutrient deficiency signs
   - Disease symptoms
   - Pest damage patterns
   - Environmental stress indicators
   - Root health evaluation

4. Care Requirements
   - Watering needs (frequency, amount, method)
   - Light requirements (intensity, duration, placement)
   - Soil preferences (type, pH, drainage)
   - Temperature ranges (optimal, minimum, maximum)
   - Humidity requirements

5. Growth Management
   - Pruning techniques
   - Training methods
   - Support requirements
   - Spacing guidelines
   - Companion planting

6. Problem Resolution
   - Disease treatment
   - Pest control methods
   - Environmental stress solutions
   - Recovery strategies
   - Prevention techniques

7. Harvesting & Maintenance
   - Optimal harvest timing
   - Collection methods
   - Post-harvest care
   - Storage requirements
   - Propagation techniques

For scheduling:
1. Growth Timeline Planning
   - Germination period
   - Growth phases duration
   - Expected harvest dates
   - Maintenance schedules
   - Seasonal considerations

2. Care Schedule Management
   - Watering frequency
   - Fertilization timing
   - Pruning schedules
   - Pest monitoring intervals
   - Growth phase transitions

Response Guidelines:
1. Structure & Clarity
   - Organize information logically
   - Use clear headings
   - Provide step-by-step instructions
   - Include specific measurements
   - Add relevant timelines

2. Practical Application
   - Give actionable advice
   - Suggest alternatives when needed
   - Include preventive measures
   - Explain the reasoning
   - Provide success indicators

3. Adaptability
   - Consider climate variations
   - Account for growing conditions
   - Adjust for skill levels
   - Provide indoor/outdoor options
   - Factor in seasonal changes

Response Format:
- General Queries: Clear, structured responses with relevant sections
- Plant Analysis: Detailed breakdown of observations and recommendations
- Scheduling: JSON format with precise numeric values
- Problem Solving: Step-by-step solutions with alternatives
- Care Instructions: Specific, measurable guidelines

CRITICAL: When asked for JSON data, respond ONLY with valid JSON. No additional text or explanations.`;

async function handleOpenRouterResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('OpenRouter error:', errorData);
    throw new Error(
      errorData?.error?.message || 
      `API request failed with status ${response.status}`
    );
  }
  
  try {
    const data = await response.json();
    
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure from AI service');
    }

    const firstChoice = data.choices[0];
    
    
    if (firstChoice.message?.content) {
      return firstChoice.message.content.trim();
    }
    
    if (firstChoice.content) {
      return firstChoice.content.trim();
    }
    
    if (firstChoice.text) {
      return firstChoice.text.trim();
    }
    
    if (typeof firstChoice === 'string') {
      return firstChoice.trim();
    }
    
    console.error('Unexpected response format:', data);
    throw new Error('Unexpected response format from AI service');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON response from AI service');
    }
    throw error;
  }
}

export async function chatWithFreddy(messages: Message[]) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': `inplanted-app/${Platform.OS}`,
        'X-Title': 'InPlanted Garden Companion',
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }),
    });

    return await handleOpenRouterResponse(response);
  } catch (error) {
    console.error('AI chat error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with AI service');
  }
}

export async function analyzeImage(image: string, prompt: string) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': `inplanted-app/${Platform.OS}`,
        'X-Title': 'InPlanted Garden Companion',
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are Freddy, an expert gardening AI assistant. When analyzing plant images, provide a detailed analysis in this format:

1. Plant Identification
   - Scientific name & common names
   - Variety/cultivar if identifiable
   - Plant family characteristics
   - Distinguishing features
   - Growth habit & mature size

2. Growth Stage & Health
   - Current life cycle stage
   - Development indicators
   - Overall vigor assessment
   - Leaf health & coloration
   - Stem/structure condition
   - Root system indicators (if visible)
   - Flowering/fruiting status
   - Signs of stress or disease

3. Care Recommendations
   - Watering frequency & method
   - Light intensity & duration
   - Soil type & amendments
   - Fertilization schedule
   - Temperature range
   - Humidity levels
   - Air circulation needs
   - Container requirements

4. Growth Tips
   - Pruning techniques
   - Training methods
   - Support structures
   - Companion plants
   - Spacing requirements
   - Growth timeline
   - Propagation methods
   - Seasonal care adjustments

5. Common Issues & Prevention
   - Visible problems
   - Potential risks
   - Prevention strategies
   - Early warning signs
   - Treatment options
   - Recovery indicators
   - Long-term management
   - Pest & disease resistance

6. Success Indicators
   - Healthy growth signs
   - Progress markers
   - Expected developments
   - Optimal conditions
   - Performance metrics

Maintain a friendly, encouraging tone while providing specific, actionable advice. Focus on practical solutions and preventive measures.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt || 'Please analyze this plant image and provide detailed care instructions.'
              },
              {
                type: 'image_url',
                image_url: image
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }),
    });

    return await handleOpenRouterResponse(response);
  } catch (error) {
    console.error('Image analysis error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze image');
  }
} 

export async function generatePlantSchedule(
  plantName: string,
  plantingDate: Date
): Promise<{
  harvestDate: Date;
  wateringSchedule: {
    frequency: number;
    nextDate: Date;
  };
}> {
  try {
    const prompt = `Generate a watering and harvest schedule for:
      Plant: ${plantName}
      Planting Date: ${plantingDate.toISOString().split('T')[0]}

      Return ONLY a JSON object with:
      {
        "daysUntilHarvest": number (typical days from planting to harvest),
        "wateringFrequency": number (days between waterings),
        "daysUntilNextWatering": number (days until first watering)
      }`;

    const response = await chatWithFreddy([
      { role: 'user', content: prompt }
    ]);

    try {
      const jsonStr = response.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, '$1');
      const schedule = JSON.parse(jsonStr);
      
      if (
        typeof schedule.daysUntilHarvest !== 'number' ||
        typeof schedule.wateringFrequency !== 'number' ||
        typeof schedule.daysUntilNextWatering !== 'number' ||
        schedule.daysUntilHarvest < 0 ||
        schedule.wateringFrequency <= 0 ||
        schedule.daysUntilNextWatering < 0
      ) {
        throw new Error('Invalid schedule values');
      }

      const today = new Date();

      return {
        harvestDate: new Date(today.getTime() + schedule.daysUntilHarvest * 24 * 60 * 60 * 1000),
        wateringSchedule: {
          frequency: schedule.wateringFrequency,
          nextDate: new Date(today.getTime() + schedule.daysUntilNextWatering * 24 * 60 * 60 * 1000)
        }
      };
    } catch (error) {
      console.error('Failed to parse schedule:', error, 'Response:', response);
      throw new Error('Invalid schedule format from AI service');
    }
  } catch (error) {
    console.error('Failed to generate schedule:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate plant schedule');
  }
}