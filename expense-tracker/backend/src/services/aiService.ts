import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { AIProcessingRequest, ExpenseExtractionResult } from '../../../shared/types.js';
import { createError } from '../middleware/errorHandler.js';

class AIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processExpenseTranscript(request: AIProcessingRequest): Promise<ExpenseExtractionResult> {
    try {
      logger.info('Processing expense transcript with AI', {
        transcriptLength: request.transcript.length,
        hasContext: !!request.userContext
      });

      const prompt = this.buildCategorizationPrompt(request);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw createError('AI service returned empty response', 503);
      }

      const result = JSON.parse(content) as ExpenseExtractionResult;

      // Validate the result
      this.validateExtractionResult(result);

      logger.info('Successfully processed expense transcript', {
        amount: result.amount,
        category: result.category,
        confidence: result.confidence
      });

      return result;

    } catch (error: any) {
      logger.error('AI processing failed', {
        error: error.message,
        stack: error.stack
      });

      if (error.status === 401) {
        throw createError('Invalid OpenAI API key', 401);
      }

      if (error.status === 429) {
        throw createError('AI service rate limit exceeded', 429);
      }

      if (error.status >= 500) {
        throw createError('AI service temporarily unavailable', 503);
      }

      // If parsing failed
      if (error instanceof SyntaxError) {
        throw createError('AI service returned invalid data', 503);
      }

      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are an intelligent expense categorization assistant. Your task is to extract and categorize expense information from natural language descriptions.

Instructions:
1. Extract the monetary amount (parse various formats: $25, 25 dollars, 25.00, etc.)
2. Identify the merchant or service provider
3. Create a concise description of the expense
4. Assign to the most appropriate category from the standard list
5. Provide a confidence score (0-1) indicating how certain you are about the extraction
6. Parse the date (use today if not specified, or relative references like "yesterday", "last week")

Standard Categories:
- Food & Drink (Coffee, Restaurants, Groceries, Alcohol)
- Transportation (Gas, Public Transit, Ride Share, Parking)
- Shopping (Clothing, Electronics, Home Goods)
- Entertainment (Movies, Games, Events, Subscriptions)
- Health & Wellness (Doctor, Pharmacy, Fitness, Insurance)
- Bills & Utilities (Rent, Electricity, Internet, Phone)
- Travel (Flights, Hotels, Car Rental)
- Education (Courses, Books, Supplies)
- Personal Care (Haircut, Toiletries, Cosmetics)
- Other (for expenses that don't fit elsewhere)

Respond with valid JSON only using this exact format:
{
  "amount": number,
  "currency": "USD",
  "merchant": "string",
  "description": "string",
  "category": "string",
  "subcategory": "string",
  "date": "YYYY-MM-DD",
  "confidence": number,
  "extractedEntities": {
    "amount": "string",
    "merchant": "string",
    "location": "string",
    "time": "string"
  }
}`;
  }

  private buildCategorizationPrompt(request: AIProcessingRequest): string {
    const { transcript, userContext } = request;

    let prompt = `Expense Description: "${transcript}"\n\n`;

    if (userContext) {
      prompt += `User Context:\n`;

      if (userContext.recentCategories?.length > 0) {
        prompt += `- Recent categories: ${userContext.recentCategories.join(', ')}\n`;
      }

      if (userContext.spendingPatterns && Object.keys(userContext.spendingPatterns).length > 0) {
        prompt += `- Recent spending patterns: ${JSON.stringify(userContext.spendingPatterns)}\n`;
      }

      prompt += `- User preferences: ${JSON.stringify(userContext.preferences)}\n`;
    }

    prompt += `\nCurrent date: ${new Date().toISOString().split('T')[0]}\n\n`;
    prompt += `Extract the expense information and categorize it appropriately.`;

    return prompt;
  }

  private validateExtractionResult(result: any): asserts result is ExpenseExtractionResult {
    const required = ['amount', 'currency', 'merchant', 'description', 'category', 'date', 'confidence'];

    for (const field of required) {
      if (!(field in result)) {
        throw createError(`AI response missing required field: ${field}`, 503);
      }
    }

    if (typeof result.amount !== 'number' || result.amount <= 0) {
      throw createError('AI returned invalid amount', 503);
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      throw createError('AI returned invalid confidence score', 503);
    }

    const validCategories = [
      'Food & Drink', 'Transportation', 'Shopping', 'Entertainment',
      'Health & Wellness', 'Bills & Utilities', 'Travel', 'Education',
      'Personal Care', 'Other'
    ];

    if (!validCategories.includes(result.category)) {
      logger.warn('AI returned unusual category', { category: result.category });
      // Don't throw error, just warn and allow it
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.openai.models.list();
      return response.data.length > 0;
    } catch (error) {
      logger.error('OpenAI connection test failed', { error });
      return false;
    }
  }
}

export const aiService = new AIService();