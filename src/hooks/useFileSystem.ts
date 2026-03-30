import { invoke, isTauri } from '@tauri-apps/api/core';
import { confirm, message, open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

import type { DocumentFileService, OpenResult, SaveResult } from '../lib/documentSession';

function canUseTauriApis(): boolean {
  return typeof window !== 'undefined' && isTauri();
}

async function browserSaveFallback(content: string, suggestedName = 'document.md'): Promise<SaveResult> {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = href;
  anchor.download = suggestedName;
  anchor.click();

  URL.revokeObjectURL(href);

  return { path: suggestedName };
}

export function createDocumentFileService(): DocumentFileService {
  return {
    async confirmDiscardChanges(): Promise<boolean> {
      if (!canUseTauriApis()) {
        return window.confirm('저장하지 않은 변경 사항이 있습니다. 계속 진행할까요?');
      }

      return confirm('저장하지 않은 변경 사항이 있습니다. 계속 진행할까요?', {
        title: 'MDEditor',
        kind: 'warning',
      });
    },

    async openFile(): Promise<OpenResult | null> {
      if (!canUseTauriApis()) {
        window.alert('브라우저 미리보기에서는 파일 열기를 지원하지 않습니다.');
        return null;
      }

      const selected = await open({
        directory: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        multiple: false,
      });

      if (!selected || Array.isArray(selected)) {
        return null;
      }

      const content = await readTextFile(selected);
      return { path: String(selected), content };
    },

    async saveFile(content: string, path?: string): Promise<SaveResult | null> {
      if (!canUseTauriApis()) {
        return browserSaveFallback(content, path ?? 'document.md');
      }

      const targetPath =
        path ??
        (await save({
          defaultPath: 'document.md',
          filters: [{ name: 'Markdown', extensions: ['md'] }],
        }));

      if (!targetPath) {
        return null;
      }

      await writeTextFile(targetPath, content);
      return { path: String(targetPath) };
    },

    async exportDocument(inputPath: string, format: 'pdf' | 'docx' | 'hwp'): Promise<void> {
      if (format !== 'pdf') {
        throw new Error('Phase 0 only supports PDF export.');
      }

      const outputPath = inputPath.replace(/\.md$/i, '.pdf');

      if (!canUseTauriApis()) {
        throw new Error('PDF export is only available in the Tauri desktop app.');
      }

      await invoke('export_pdf', { inputPath, outputPath });

      await message(`PDF로 내보냈습니다.\n${outputPath}`, {
        title: 'MDEditor',
        kind: 'info',
      });
    },
  };
}
