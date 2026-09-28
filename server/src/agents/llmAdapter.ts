import { CONFIG } from '../config';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
}

export class LLMAdapter {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = CONFIG.OPENAI_API_KEY;
    this.model = CONFIG.OPENAI_MODEL;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async complete(messages: LLMMessage[], options: LLMRequestOptions = {}): Promise<string> {
    if (!this.isConfigured()) {
      return '';
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 2000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error('[LLMAdapter] Error querying OpenAI:', err.message);
      throw err;
    }
  }
}

export const llmAdapter = new LLMAdapter();
