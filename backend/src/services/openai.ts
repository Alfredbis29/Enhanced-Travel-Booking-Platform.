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
      const systemPrompt = `You are an intelligent East African travel booking assistant. Parse ANY user query about travel bookings into structured search parameters.

Current date: ${today.toISOString().split('T')[0]}

IMPORTANT: You must understand natural language in ANY form and extract travel intent. Handle queries like:
- "I want to fly to Zanzibar" → travel_mode: flight, destination: Zanzibar
- "book a bus to Kampala" → travel_mode: bus, destination: Kampala
- "cheapest way to Mombasa" → destination: Mombasa, sort_by: price
- "ferry to Zanzibar" → travel_mode: ferry, destination: Zanzibar
- "train to Mombasa" → travel_mode: train, destination: Mombasa
- "shuttle to Arusha" → travel_mode: shuttle, destination: Arusha
- "I need transport from Nairobi to Kigali" → origin: Nairobi, destination: Kigali
- "going to see gorillas in Rwanda" → destination: Musanze or Kigali
- "beach vacation" → destination: Mombasa, Zanzibar, or Malindi
- "safari trip" → destination: Serengeti, Masai Mara, or Arusha

Extract the following information:
- origin: Departure city (default to Nairobi if not specified)
- destination: Arrival city/location
- date: Travel date (YYYY-MM-DD format)
- travel_mode: One of: bus, flight, train, ferry, shuttle (infer from context)
- min_price: Minimum price
- max_price: Maximum price
- sort_by: price, departure_time, duration, rating
- sort_order: asc, desc

EAST AFRICAN CITIES:
Kenya: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Malindi, Lamu, Naivasha, Masai Mara
Uganda: Kampala, Entebbe, Jinja, Mbarara, Fort Portal, Gulu
Rwanda: Kigali, Butare, Gisenyi, Musanze
Tanzania: Dar es Salaam, Arusha, Mwanza, Zanzibar, Moshi, Kilimanjaro, Serengeti, Dodoma
DRC: Goma, Bukavu, Kinshasa
Burundi: Bujumbura, Gitega

INFERENCE RULES:
- "fly/flight/plane/air" → travel_mode: flight
- "bus/coach/matatu" → travel_mode: bus
- "train/railway/SGR/Madaraka" → travel_mode: train
- "ferry/boat/ship" → travel_mode: ferry
- "shuttle/van/transfer" → travel_mode: shuttle
- "cheapest/budget/affordable" → sort_by: price, sort_order: asc
- "fastest/quick" → sort_by: duration, sort_order: asc
- "best/top rated/recommended" → sort_by: rating, sort_order: desc
- "beach/coast/ocean" → suggest Mombasa, Zanzibar, Malindi
- "safari/wildlife/animals" → suggest Masai Mara, Serengeti, Arusha
- "gorillas/primates" → suggest Musanze, Fort Portal
- "adventure/water sports" → suggest Jinja

Respond in JSON:
{
  "parsed_params": {
    "origin": string or null,
    "destination": string or null,
    "date": string or null,
    "travel_mode": string or null,
    "min_price": number or null,
    "max_price": number or null,
    "sort_by": string or null,
    "sort_order": string or null
  },
  "explanation": "Friendly explanation of what you understood and what you're searching for",
  "suggestions": ["Helpful suggestions or alternatives"]
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
      if (parsed.parsed_params.travel_mode) searchParams.travel_mode = parsed.parsed_params.travel_mode;
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
    let explanation = '';

    // Parse travel mode
    if (lowerQuery.includes('fly') || lowerQuery.includes('flight') || lowerQuery.includes('plane') || lowerQuery.includes('air')) {
      searchParams.travel_mode = 'flight';
      explanation = 'Looking for flights';
    } else if (lowerQuery.includes('train') || lowerQuery.includes('railway') || lowerQuery.includes('sgr') || lowerQuery.includes('madaraka')) {
      searchParams.travel_mode = 'train';
      explanation = 'Looking for train services';
    } else if (lowerQuery.includes('ferry') || lowerQuery.includes('boat') || lowerQuery.includes('ship')) {
      searchParams.travel_mode = 'ferry';
      explanation = 'Looking for ferry services';
    } else if (lowerQuery.includes('shuttle') || lowerQuery.includes('van') || lowerQuery.includes('transfer') || lowerQuery.includes('airport')) {
      searchParams.travel_mode = 'shuttle';
      explanation = 'Looking for shuttle services';
    } else if (lowerQuery.includes('bus') || lowerQuery.includes('coach')) {
      searchParams.travel_mode = 'bus';
      explanation = 'Looking for bus services';
    }

    // Parse all East African destinations
    const destinations: Record<string, string[]> = {
      // Kenya
      'nairobi': ['nairobi'],
      'mombasa': ['mombasa', 'coast', 'beach'],
      'kisumu': ['kisumu', 'lake victoria'],
      'nakuru': ['nakuru', 'lake nakuru'],
      'eldoret': ['eldoret'],
      'malindi': ['malindi'],
      'lamu': ['lamu'],
      'naivasha': ['naivasha'],
      'masai mara': ['masai mara', 'maasai mara', 'mara', 'safari', 'wildlife'],
      // Uganda
      'kampala': ['kampala', 'uganda'],
      'entebbe': ['entebbe'],
      'jinja': ['jinja', 'rafting', 'source of nile', 'adventure'],
      'mbarara': ['mbarara'],
      'fort portal': ['fort portal', 'gorilla'],
      'gulu': ['gulu'],
      // Rwanda
      'kigali': ['kigali', 'rwanda'],
      'butare': ['butare', 'huye'],
      'gisenyi': ['gisenyi', 'rubavu', 'lake kivu'],
      'musanze': ['musanze', 'gorilla', 'volcanoes'],
      // Tanzania
      'dar es salaam': ['dar es salaam', 'dar', 'tanzania'],
      'arusha': ['arusha', 'kilimanjaro base'],
      'mwanza': ['mwanza'],
      'zanzibar': ['zanzibar', 'stone town', 'spice island'],
      'moshi': ['moshi', 'kilimanjaro'],
      'kilimanjaro': ['kilimanjaro', 'kili'],
      'serengeti': ['serengeti', 'safari'],
      'dodoma': ['dodoma'],
      // DRC
      'goma': ['goma', 'drc', 'congo'],
      'bukavu': ['bukavu'],
      // Burundi
      'bujumbura': ['bujumbura', 'burundi'],
      'gitega': ['gitega'],
    };

    // Check for destinations
    for (const [city, keywords] of Object.entries(destinations)) {
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          const cityName = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          if (lowerQuery.includes('from ' + keyword) || lowerQuery.includes('leaving ' + keyword)) {
            searchParams.origin = cityName;
          } else if (lowerQuery.includes('to ' + keyword) || lowerQuery.includes('going ' + keyword) || !searchParams.destination) {
            searchParams.destination = cityName;
          }
          break;
        }
      }
    }

    // Theme-based suggestions
    if (lowerQuery.includes('beach') || lowerQuery.includes('ocean') || lowerQuery.includes('coast') || lowerQuery.includes('relax')) {
      if (!searchParams.destination) {
        suggestions.push('Try Mombasa, Zanzibar, or Malindi for beach destinations');
        searchParams.destination = 'Mombasa';
      }
      explanation += ' to a beach destination';
    }

    if (lowerQuery.includes('safari') || lowerQuery.includes('wildlife') || lowerQuery.includes('animals') || lowerQuery.includes('game drive')) {
      if (!searchParams.destination) {
        suggestions.push('Try Masai Mara, Serengeti, or Arusha for safari destinations');
        searchParams.destination = 'Masai Mara';
      }
      explanation += ' for a safari adventure';
    }

    if (lowerQuery.includes('gorilla') || lowerQuery.includes('primate') || lowerQuery.includes('chimp')) {
      if (!searchParams.destination) {
        suggestions.push('Try Musanze (Rwanda) or Fort Portal (Uganda) for gorilla trekking');
        searchParams.destination = 'Musanze';
      }
      explanation += ' for gorilla trekking';
    }

    if (lowerQuery.includes('adventure') || lowerQuery.includes('rafting') || lowerQuery.includes('bungee')) {
      if (!searchParams.destination) {
        suggestions.push('Try Jinja for adventure activities like white water rafting');
        searchParams.destination = 'Jinja';
      }
      explanation += ' for adventure activities';
    }

    // Parse price preferences
    if (lowerQuery.includes('cheap') || lowerQuery.includes('budget') || lowerQuery.includes('affordable') || lowerQuery.includes('low cost')) {
      searchParams.sort_by = 'price';
      searchParams.sort_order = 'asc';
      explanation += ' - showing cheapest options first';
    }

    if (lowerQuery.includes('fastest') || lowerQuery.includes('quick') || lowerQuery.includes('shortest')) {
      searchParams.sort_by = 'duration';
      searchParams.sort_order = 'asc';
      explanation += ' - showing fastest options first';
    }

    if (lowerQuery.includes('best') || lowerQuery.includes('top rated') || lowerQuery.includes('recommended') || lowerQuery.includes('popular')) {
      searchParams.sort_by = 'rating';
      searchParams.sort_order = 'desc';
      explanation += ' - showing best rated options first';
    }

    if (lowerQuery.includes('luxury') || lowerQuery.includes('vip') || lowerQuery.includes('premium') || lowerQuery.includes('business class')) {
      searchParams.sort_by = 'price';
      searchParams.sort_order = 'desc';
      explanation += ' - showing premium options';
    }

    // Parse dates
    const today = new Date();
    if (lowerQuery.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      searchParams.date = tomorrow.toISOString().split('T')[0];
      explanation += ` for tomorrow (${searchParams.date})`;
    } else if (lowerQuery.includes('today') || lowerQuery.includes('now') || lowerQuery.includes('asap')) {
      searchParams.date = today.toISOString().split('T')[0];
      explanation += ` for today (${searchParams.date})`;
    } else if (lowerQuery.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      searchParams.date = nextWeek.toISOString().split('T')[0];
      explanation += ` for next week`;
    } else if (lowerQuery.includes('weekend') || lowerQuery.includes('saturday')) {
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
      const saturday = new Date(today);
      saturday.setDate(saturday.getDate() + daysUntilSaturday);
      searchParams.date = saturday.toISOString().split('T')[0];
      explanation += ` for this weekend`;
    } else if (lowerQuery.includes('next month')) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      searchParams.date = nextMonth.toISOString().split('T')[0];
      explanation += ` for next month`;
    }

    // Price range parsing
    const priceMatch = lowerQuery.match(/under\s*(\d+)/);
    if (priceMatch) {
      searchParams.max_price = parseInt(priceMatch[1]);
    }

    const minPriceMatch = lowerQuery.match(/above\s*(\d+)|over\s*(\d+)|more than\s*(\d+)/);
    if (minPriceMatch) {
      searchParams.min_price = parseInt(minPriceMatch[1] || minPriceMatch[2] || minPriceMatch[3]);
    }

    // Default origin if destination is set but origin is not
    if (searchParams.destination && !searchParams.origin) {
      searchParams.origin = 'Nairobi';
    }

    // Generate helpful suggestions
    if (!searchParams.destination && !searchParams.travel_mode) {
      suggestions.push('Try "flights to Zanzibar", "bus to Kampala", or "ferry to Zanzibar"');
      suggestions.push('You can also search by theme: "beach vacation", "safari trip", "gorilla trekking"');
    }
    
    if (!searchParams.date) {
      suggestions.push('Add a date like "tomorrow", "this weekend", or "next week"');
    }

    if (!explanation) {
      explanation = 'Searching for available trips across East Africa';
    }

    return {
      original_query: query,
      parsed_params: searchParams,
      explanation: explanation.trim(),
      suggestions
    };
  }

  async generateTripSuggestions(preferences: Record<string, unknown>): Promise<string[]> {
    if (!this.openai) {
      return [
        '✈️ Fly to Zanzibar for pristine beaches and rich culture',
        '🚂 Take the SGR train from Nairobi to Mombasa coast',
        '🦁 Safari adventure to Serengeti or Masai Mara',
        '🦍 Gorilla trekking in Rwanda or Uganda',
        '⛴️ Ferry across Lake Victoria or to Zanzibar',
        '🏔️ Visit Mount Kilimanjaro from Arusha or Moshi'
      ];
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an East African travel expert. Generate 6 brief, enticing travel suggestions covering Kenya, Uganda, Rwanda, Tanzania, and beyond. Include different transport modes (flights, buses, trains, ferries, shuttles). Use emojis.'
          },
          {
            role: 'user',
            content: `User preferences: ${JSON.stringify(preferences)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return content.split('\n').filter(line => line.trim()).slice(0, 6);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }

    return [
      '✈️ Fly to Zanzibar for pristine beaches',
      '🚂 SGR train to Mombasa',
      '🦁 Safari to Masai Mara',
      '🦍 Gorilla trekking in Rwanda'
    ];
  }
}

export const aiService = new AIService();
