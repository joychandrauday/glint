import { AICommandSuggestion, extractVariablesFromTemplate } from '@glint/shared';

const SYSTEM_PROMPT = `You are Glint, an expert system engineer and command-line AI assistant.
Your job is to convert natural language queries into exact, production-grade terminal commands.

Rules:
1. Return 1 to 3 command suggestions.
2. If parameters can vary, format them as template placeholders: \`{{variable_name:default_value}}\`. For example: \`docker run -d -p {{host_port:8080}}:{{container_port:80}} {{image:nginx:latest}}\`.
3. Provide a clear, concise 1-sentence description and a 1-sentence explanation of what the command does.
4. Set dangerLevel to "safe" (read-only/standard), "caution" (changes state/overwrites), or "dangerous" (destructive, e.g. rm -rf, drop table, kill -9).
5. Output ONLY valid JSON with this format:
{
  "suggestions": [
    {
      "command": "string",
      "template": "string with {{placeholders}}",
      "description": "string",
      "dangerLevel": "safe" | "caution" | "dangerous",
      "explanation": "string"
    }
  ]
}`;

export interface ProviderResult {
  suggestions: AICommandSuggestion[];
  latencyMs: number;
}

/**
 * Call Groq Cloud API
 */
export async function callGroq(
  query: string,
  apiKey: string,
  context?: Record<string, unknown>
): Promise<ProviderResult> {
  const start = Date.now();
  const contextStr = context ? `\nSystem context: ${JSON.stringify(context)}` : '';

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Query: ${query}${contextStr}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errorText}`);
  }

  const json: any = await res.json();
  const rawContent = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(rawContent);

  const suggestions = formatSuggestions(parsed.suggestions || []);
  return { suggestions, latencyMs: Date.now() - start };
}

/**
 * Call Google Gemini API
 */
export async function callGemini(
  query: string,
  apiKey: string,
  context?: Record<string, unknown>
): Promise<ProviderResult> {
  const start = Date.now();
  const contextStr = context ? `\nSystem context: ${JSON.stringify(context)}` : '';

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `Query: ${query}${contextStr}` },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const json: any = await res.json();
  const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(rawContent);

  const suggestions = formatSuggestions(parsed.suggestions || []);
  return { suggestions, latencyMs: Date.now() - start };
}

/**
 * Intelligent heuristic fallback when cloud API keys are omitted in development/offline demo
 */
export async function callLocalHeuristic(query: string): Promise<ProviderResult> {
  const start = Date.now();
  const q = query.toLowerCase();

  let rawSuggestions: any[] = [];

  if (q.includes('port') || q.includes('kill') || q.includes('process')) {
    rawSuggestions = [
      {
        command: 'lsof -ti :3000 | xargs kill -9',
        template: 'lsof -ti :{{port:3000}} | xargs kill -9',
        description: 'Terminate the process listening on a specific TCP port',
        dangerLevel: 'caution',
        explanation: 'Uses lsof in terse PID mode and pipes the resulting PID directly to kill -9.',
      },
      {
        command: 'ss -tulpn | grep :3000',
        template: 'ss -tulpn | grep :{{port:3000}}',
        description: 'Check active listening sockets and process details for a port',
        dangerLevel: 'safe',
        explanation: 'Displays socket statistics without modifying or terminating running processes.',
      },
    ];
  } else if (q.includes('docker') || q.includes('container')) {
    rawSuggestions = [
      {
        command: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
        template: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
        description: 'List all running and exited containers with formatted columns',
        dangerLevel: 'safe',
        explanation: 'Queries Docker daemon and displays a clean tabular overview of container health.',
      },
      {
        command: 'docker exec -it my-container /bin/sh',
        template: 'docker exec -it {{container_name:my-container}} {{shell:/bin/bash}}',
        description: 'Open an interactive terminal shell inside a running container',
        dangerLevel: 'safe',
        explanation: 'Attaches an interactive TTY session to the designated container namespace.',
      },
    ];
  } else if (q.includes('git') || q.includes('commit') || q.includes('branch')) {
    rawSuggestions = [
      {
        command: 'git log --oneline --graph --decorate -n 10',
        template: 'git log --oneline --graph --decorate -n {{limit:10}}',
        description: 'Display graphical commit history in single-line format',
        dangerLevel: 'safe',
        explanation: 'Visualizes recent commit graph, tags, and branch heads clearly.',
      },
      {
        command: 'git checkout -b feature/my-branch',
        template: 'git checkout -b {{branch_name:feature/my-branch}}',
        description: 'Create and switch to a new local Git branch',
        dangerLevel: 'safe',
        explanation: 'Creates a pointer to current HEAD and switches your active working tree.',
      },
    ];
  } else {
    // Default smart fallback
    rawSuggestions = [
      {
        command: `find . -type f -name "*${query.trim()}*"`,
        template: `find {{dir:.}} -type f -name "*{{pattern:${query.trim()}}}*"`,
        description: `Search current directory tree for files matching "${query}"`,
        dangerLevel: 'safe',
        explanation: 'Performs a recursive search in directory hierarchy for matching filename pattern.',
      },
      {
        command: `grep -rnI "${query}" .`,
        template: `grep -rnI "{{pattern:${query}}}" {{search_path:.}}`,
        description: `Search file contents for occurrences of text`,
        dangerLevel: 'safe',
        explanation: 'Recursively searches text files while ignoring binary data.',
      },
    ];
  }

  const suggestions = formatSuggestions(rawSuggestions);
  return { suggestions, latencyMs: Math.max(12, Date.now() - start) };
}

function formatSuggestions(rawList: any[]): AICommandSuggestion[] {
  return rawList.map((item) => {
    const template = item.template || item.command;
    const variables = extractVariablesFromTemplate(template);
    return {
      command: item.command || template,
      template,
      description: item.description || 'Terminal command',
      dangerLevel: ['safe', 'caution', 'dangerous'].includes(item.dangerLevel)
        ? item.dangerLevel
        : 'safe',
      explanation: item.explanation || item.description || '',
      variables: variables.map((v) => ({
        name: v.name,
        defaultValue: v.defaultValue,
        description: v.description,
      })),
    };
  });
}
