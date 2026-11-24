import { storage } from './storage.js';
import { theme } from '../ui/theme.js';

export interface AISuggestion {
  command: string;
  template: string;
  description: string;
  dangerLevel: 'safe' | 'caution' | 'dangerous';
  explanation: string;
}

export class AIService {
  async ask(prompt: string, onToken?: (token: string) => void): Promise<AISuggestion | null> {
    const config = storage.getConfig();
    const provider = config.activeProvider;

    const systemPrompt = `You are Glint, an expert terminal AI co-pilot.
Translate developer requests into the exact, safe terminal command.
Return a clean JSON object with this exact shape:
{
  "command": "the exact shell command or template with {{param:default}} placeholders",
  "template": "template with {{param:default}}",
  "description": "brief 1-sentence description of what this command accomplishes",
  "dangerLevel": "safe" | "caution" | "dangerous",
  "explanation": "concise explanation of flags and arguments"
}
ONLY return the JSON object, no preamble or markdown ticks.`;

    try {
      if (provider === 'groq' && config.groqKey) {
        return await this.callGroq(prompt, systemPrompt, config.groqKey, config.groqModel, onToken);
      }
      if (provider === 'gemini' && config.geminiKey) {
        return await this.callGemini(prompt, systemPrompt, config.geminiKey, config.geminiModel, onToken);
      }
      if (provider === 'ollama') {
        return await this.callOllama(prompt, systemPrompt, config.ollamaHost, config.ollamaModel, onToken);
      }
      if (provider === 'openai' && config.openaiKey) {
        return await this.callOpenAI(prompt, systemPrompt, config.openaiKey, config.openaiModel, onToken);
      }
    } catch (err: any) {
      if (onToken) onToken(`\n${theme.coral(`[AI Error: ${err.message}]`)}`);
      return null;
    }

    return null;
  }

  private async callGroq(
    prompt: string,
    systemPrompt: string,
    apiKey: string,
    model: string,
    onToken?: (token: string) => void
  ): Promise<AISuggestion | null> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.statusText}`);
    }

    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  }

  private async callGemini(
    prompt: string,
    systemPrompt: string,
    apiKey: string,
    model: string,
    _onToken?: (token: string) => void
  ): Promise<AISuggestion | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-flash-lite-latest'}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nRequest: ${prompt}` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data: any = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  }

  private async callOllama(
    prompt: string,
    systemPrompt: string,
    host: string,
    model: string,
    _onToken?: (token: string) => void
  ): Promise<AISuggestion | null> {
    const res = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
        format: 'json',
      }),
    });

    if (!res.ok) throw new Error(`Ollama API error: ${res.statusText}`);
    const data: any = await res.json();
    const text = data.message?.content;
    if (!text) return null;
    return JSON.parse(text);
  }

  private async callOpenAI(
    prompt: string,
    systemPrompt: string,
    apiKey: string,
    model: string,
    _onToken?: (token: string) => void
  ): Promise<AISuggestion | null> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text);
  }
}

export const ai = new AIService();
