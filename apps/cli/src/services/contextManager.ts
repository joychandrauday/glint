export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  cached?: boolean;
}

export class ContextManager {
  private messages: ChatMessage[] = [];
  private maxTokens: number;
  private sessionTokensUsed = 0;

  constructor(maxTokens = 4096) {
    this.maxTokens = maxTokens;
  }

  setMaxTokens(tokens: number): void {
    this.maxTokens = tokens;
  }

  addMessage(msg: ChatMessage): void {
    this.messages.push(msg);
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  recordUsage(tokens: number): void {
    this.sessionTokensUsed += tokens;
  }

  getSessionTokens(): number {
    return this.sessionTokensUsed;
  }

  clear(): void {
    this.messages = [];
  }

  estimateTokens(text: string): number {
    if (!text) return 0;
    // Fast estimation: roughly 3.8 characters per token in English code & terminal text
    return Math.ceil(text.length / 3.8);
  }

  getTotalTokens(): number {
    return this.messages.reduce((sum, m) => sum + this.estimateTokens(m.content), 0);
  }

  truncateOutput(content: string, maxLines = 50, maxChars = 2500): string {
    const lines = content.split('\n');
    if (lines.length > maxLines) {
      const head = lines.slice(0, 25).join('\n');
      const tail = lines.slice(-25).join('\n');
      return `${head}\n\n... [${lines.length - 50} lines truncated by Glint Token Optimizer] ...\n\n${tail}`;
    }
    if (content.length > maxChars) {
      return content.slice(0, maxChars) + '\n... [truncated by Glint Token Optimizer]';
    }
    return content;
  }

  /**
   * Compaction flow:
   * When context approaches maxTokens, compact older conversation turns into
   * a high-density executive summary while keeping the system prompt and
   * the most recent turns intact.
   */
  async compact(summarizeFn?: (text: string) => Promise<string>): Promise<boolean> {
    const total = this.getTotalTokens();
    if (total < this.maxTokens || this.messages.length <= 4) {
      return false;
    }

    const systemMsg = this.messages.find((m) => m.role === 'system');
    const nonSystem = this.messages.filter((m) => m.role !== 'system');

    // Keep the last 4 messages intact
    const recentMessages = nonSystem.slice(-4);
    const olderMessages = nonSystem.slice(0, -4);

    if (olderMessages.length === 0) return false;

    let summaryText = '';
    const olderTranscript = olderMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 200)}`)
      .join('\n');

    if (summarizeFn) {
      try {
        summaryText = await summarizeFn(olderTranscript);
      } catch {
        summaryText = this.createDeterministicSummary(olderMessages);
      }
    } else {
      summaryText = this.createDeterministicSummary(olderMessages);
    }

    const summaryMessage: ChatMessage = {
      role: 'system',
      content: `[Previous conversation summary (${olderMessages.length} turns compacted to save tokens):\n${summaryText}]`,
    };

    this.messages = [];
    if (systemMsg) this.messages.push(systemMsg);
    this.messages.push(summaryMessage);
    this.messages.push(...recentMessages);

    return true;
  }

  private createDeterministicSummary(messages: ChatMessage[]): string {
    const points: string[] = [];
    for (const m of messages) {
      if (m.role === 'user') {
        points.push(`User asked: "${m.content.slice(0, 100)}"`);
      } else if (m.role === 'assistant') {
        const firstLine = m.content.split('\n')[0].slice(0, 100);
        points.push(`Glint: "${firstLine}"`);
      }
    }
    return points.slice(-6).join('\n');
  }
}

export const contextManager = new ContextManager();
