import { storage } from '../services/storage.js';
import { theme } from '../ui/theme.js';
import { text, select } from '@clack/prompts';
import { CheatsheetItem } from '@glint/shared';

export async function manageVault(): Promise<void> {
  const action = await select({
    message: theme.cyanBold('Personal Vault Manager:'),
    options: [
      { value: 'list', label: '📋 List custom snippets' },
      { value: 'add', label: '➕ Add new command to vault' },
      { value: 'delete', label: '🗑 Delete a custom command' },
    ],
  });

  if (action === 'list') {
    const items = storage.getCustomVault();
    if (!items.length) {
      console.log(`\n${theme.slate('Your personal vault is currently empty.')}\n`);
      return;
    }
    console.log(`\n${theme.cyanBold(`Personal Vault (${items.length} commands):`)}`);
    for (const item of items) {
      console.log(`  • ${theme.cyanBold(item.command)} - ${theme.white(item.description)}`);
    }
    console.log();
  } else if (action === 'add') {
    await addVaultItem();
  }
}

export async function addVaultItem(): Promise<void> {
  const cmd = await text({ message: 'Enter command or template (e.g. docker run {{port}}):' });
  if (typeof cmd === 'symbol' || !cmd.trim()) return;

  const desc = await text({ message: 'Enter description:' });
  if (typeof desc === 'symbol' || !desc.trim()) return;

  const cat = await text({ message: 'Enter category (default: custom):', initialValue: 'custom' });
  if (typeof cat === 'symbol') return;

  const newItem: CheatsheetItem = {
    id: `custom-${Date.now()}`,
    command: cmd.trim(),
    template: cmd.trim(),
    description: desc.trim(),
    category: (cat as string).trim() || 'custom',
    tags: ['custom'],
    variables: [],
    platform: 'all',
    dangerLevel: 'safe',
  };

  storage.addCustomItem(newItem);
  console.log(`\n${theme.green('✔ Command saved to your personal vault!')}\n`);
}
