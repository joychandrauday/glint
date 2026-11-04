import { AICommandSuggestion, LLMProvider } from '@glint/shared';
import { callGroq, callGemini, callLocalHeuristic, ProviderResult } from './providers';
import { runtimeConfig } from '../config';

export interface PipelineExecutionResult {
  suggestions: AICommandSuggestion[];
  providerUsed: LLMProvider;
  latencyMs: number;
}

export class LLMPipeline {
  public static async execute(
    query: string,
    context?: Record<string, unknown>,
    preferredProvider?: LLMProvider
  ): Promise<PipelineExecutionResult> {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Determine sequence of providers to try
    const primary = preferredProvider || runtimeConfig.primaryProvider;
    const providerSequence: LLMProvider[] = [primary];

    for (const p of runtimeConfig.allowedProviders) {
      if (!providerSequence.includes(p)) {
        providerSequence.push(p);
      }
    }

    let lastError: Error | null = null;

    for (const provider of providerSequence) {
      try {
        if (provider === 'groq' && groqKey) {
          const result = await this.withTimeout<ProviderResult>(callGroq(query, groqKey, context), 4500);
          return {
            suggestions: result.suggestions,
            providerUsed: 'groq',
            latencyMs: result.latencyMs,
          };
        }

        if (provider === 'gemini' && geminiKey) {
          const result = await this.withTimeout<ProviderResult>(callGemini(query, geminiKey, context), 4500);
          return {
            suggestions: result.suggestions,
            providerUsed: 'gemini',
            latencyMs: result.latencyMs,
          };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[LLMPipeline] Provider ${provider} failed: ${err.message}. Cascading to next provider...`);
      }
    }

    // Heuristic fallback if cloud API keys not configured or calls failed
    console.info(`[LLMPipeline] Falling back to intelligent heuristic engine for query: "${query}"`);
    const fallback = await callLocalHeuristic(query);
    return {
      suggestions: fallback.suggestions,
      providerUsed: 'groq',
      latencyMs: fallback.latencyMs,
    };
  }

  private static withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);

      promise
        .then((val) => {
          clearTimeout(timer);
          resolve(val);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}
