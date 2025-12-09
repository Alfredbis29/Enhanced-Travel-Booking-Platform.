import OpenAI from 'openai';
import { SearchParams, AIQueryResult } from '../types/index.js';

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async parseNaturalLanguageQuery(query: string): Promise<AIQueryResult> {
    // If OpenAI is not configured, use fallback parsing
    if (!this.openai) {
      return this.fallbackParsing(query);
    }

    try {
      const today = new Date();
      const systemPrompt = `You are a travel booking assistant. Parse user queries about bus/travel bookings into structured search parameters.

Current date: ${today.toISOString().split('T')[0]}

Extract the following information if present:
- origin: The departure city/location
- destination: The arrival city/location
- date: The travel date (in YYYY-MM-DD format)
- min_price: Minimum price in KES
- max_price: Maximum price in KES
- sort_by: How to sort results (price, departure_time, duration, rating)
- sort_order: Sort order (asc, desc)

For relative dates like "next weekend", "tomorrow", "next Friday", calculate the actual date.
For "cheapest" queries, set sort_by to "price" and sort_order to "asc".
For "fastest" queries, set sort_by to "duration" and sort_order to "asc".
For "best rated" queries, set sort_by to "rating" and sort_order to "desc".

Common Kenyan destinations include: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Malindi, Nyeri, Thika, Machakos, Kitale.

Respond in JSON format:
{
  "parsed_params": {
    "origin": string or null,
    "destination": string or null,
    "date": string or null,
    "min_price": number or null,
    "max_price": number or null,
    "sort_by": string or null,
    "sort_order": string or null
  },
  "explanation": "Brief explanation of how you interpreted the query",
  "suggestions": ["Array of helpful suggestions if the query is ambiguous"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      const searchParams: SearchParams = {};

      if (parsed.parsed_params.origin) searchParams.origin = parsed.parsed_params.origin;
      if (parsed.parsed_params.destination) searchParams.destination = parsed.parsed_params.destination;
      if (parsed.parsed_params.date) searchParams.date = parsed.parsed_params.date;
      if (parsed.parsed_params.min_price) searchParams.min_price = parsed.parsed_params.min_price;
      if (parsed.parsed_params.max_price) searchParams.max_price = parsed.parsed_params.max_price;
      if (parsed.parsed_params.sort_by) searchParams.sort_by = parsed.parsed_params.sort_by;
      if (parsed.parsed_params.sort_order) searchParams.sort_order = parsed.parsed_params.sort_order;

      return {
        original_query: query,
        parsed_params: searchParams,
        explanation: parsed.explanation || 'Query parsed successfully',
        suggestions: parsed.suggestions || []
      };

    } catch (error) {
      console.error('OpenAI parsing error:', error);
      return this.fallbackParsing(query);
    }
  }

  private fallbackParsing(query: string): AIQueryResult {
    const lowerQuery = query.toLowerCase();
    const searchParams: SearchParams = {};
    const suggestions: string[] = [];

    // Parse destinations
    const destinations = ['mombasa', 'kisumu', 'nakuru', 'eldoret', 'malindi', 'nairobi', 'nyeri', 'thika'];
    for (const dest of destinations) {
      if (lowerQuery.includes(dest)) {
        if (lowerQuery.includes('to ' + dest) || lowerQuery.includes('going to ' + dest)) {
          searchParams.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        } else if (lowerQuery.includes('from ' + dest)) {
          searchParams.origin = dest.charAt(0).toUpperCase() + dest.slice(1);
        } else {
          // Default to destination if direction not specified
          searchParams.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        }
      }
    }

    // Parse price preferences
    if (lowerQuery.includes('cheap') || lowerQuery.includes('budget') || lowerQuery.includes('affordable')) {
      searchParams.sort_by = 'price';
      searchParams.sort_order = 'asc';
      searchParams.max_price = 1500;
    }

    if (lowerQuery.includes('fastest') || lowerQuery.includes('quick')) {
      searchParams.sort_by = 'duration';
      searchParams.sort_order = 'asc';
    }

    if (lowerQuery.includes('best') || lowerQuery.includes('top rated')) {
      searchParams.sort_by = 'rating';
      searchParams.sort_order = 'desc';
    }

    // Parse dates
    const today = new Date();
    if (lowerQuery.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      searchParams.date = tomorrow.toISOString().split('T')[0];
    } else if (lowerQuery.includes('today')) {
      searchParams.date = today.toISOString().split('T')[0];
    } else if (lowerQuery.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      searchParams.date = nextWeek.toISOString().split('T')[0];
    } else if (lowerQuery.includes('weekend') || lowerQuery.includes('saturday')) {
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
      const saturday = new Date(today);
      saturday.setDate(saturday.getDate() + daysUntilSaturday);
      searchParams.date = saturday.toISOString().split('T')[0];
    }

    // Price range parsing
    const priceMatch = lowerQuery.match(/under\s*(\d+)/);
    if (priceMatch) {
      searchParams.max_price = parseInt(priceMatch[1]);
    }

    const minPriceMatch = lowerQuery.match(/above\s*(\d+)/);
    if (minPriceMatch) {
      searchParams.min_price = parseInt(minPriceMatch[1]);
    }

    // Generate helpful suggestions
    if (!searchParams.destination) {
      suggestions.push('Try specifying a destination like "bus to Mombasa"');
    }
    if (!searchParams.date) {
      suggestions.push('You can specify a date like "tomorrow" or "next weekend"');
    }

    return {
      original_query: query,
      parsed_params: searchParams,
      explanation: 'Query parsed using pattern matching (OpenAI not configured)',
      suggestions
    };
  }

  async generateTripSuggestions(preferences: Record<string, unknown>): Promise<string[]> {
    if (!this.openai) {
      return [
        'Explore the beautiful beaches of Mombasa',
        'Visit the scenic lakes of Nakuru',
        'Experience the nightlife in Nairobi',
        'Discover the wildlife in Maasai Mara'
      ];
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Kenyan travel expert. Generate 4 brief, enticing travel suggestions based on user preferences. Focus on Kenyan destinations.'
          },
          {
            role: 'user',
            content: `User preferences: ${JSON.stringify(preferences)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return content.split('\n').filter(line => line.trim()).slice(0, 4);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }

    return [
      'Explore the beautiful beaches of Mombasa',
      'Visit the scenic lakes of Nakuru'
    ];
  }
}

export const aiService = new AIService();

