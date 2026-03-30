import { describe, expect, it, vi } from 'vitest';

import { createEditorCommandBridge, type EditorRuntime } from './editorCommands';

function createRuntime(): EditorRuntime {
  return {
    exec: vi.fn(),
    focus: vi.fn(),
    insertText: vi.fn(),
  };
}

describe('editor command bridge', () => {
  it('maps formatting actions to TOAST UI commands', () => {
    const runtime = createRuntime();
    const bridge = createEditorCommandBridge(runtime);

    bridge.bold();
    bridge.italic();
    bridge.heading(2);
    bridge.bulletList();
    bridge.orderedList();

    expect(runtime.exec).toHaveBeenNthCalledWith(1, 'bold');
    expect(runtime.exec).toHaveBeenNthCalledWith(2, 'italic');
    expect(runtime.exec).toHaveBeenNthCalledWith(3, 'heading', { level: 2 });
    expect(runtime.exec).toHaveBeenNthCalledWith(4, 'bulletList');
    expect(runtime.exec).toHaveBeenNthCalledWith(5, 'orderedList');
  });

  it('inserts template text for mermaid diagrams', () => {
    const runtime = createRuntime();
    const bridge = createEditorCommandBridge(runtime);

    bridge.insertMermaid('flowchart');

    expect(runtime.insertText).toHaveBeenCalledWith(expect.stringContaining('flowchart TD'));
    expect(runtime.focus).toHaveBeenCalledOnce();
  });

  it('passes structured payloads for table, link, and image insertion', () => {
    const runtime = createRuntime();
    const bridge = createEditorCommandBridge(runtime);

    bridge.table(3, 4);
    bridge.link('https://example.com', '예시 링크');
    bridge.image('https://example.com/image.png', '예시 이미지');

    expect(runtime.exec).toHaveBeenNthCalledWith(1, 'addTable', {
      columnCount: 4,
      rowCount: 3,
    });
    expect(runtime.exec).toHaveBeenNthCalledWith(2, 'addLink', {
      linkText: '예시 링크',
      linkUrl: 'https://example.com',
    });
    expect(runtime.exec).toHaveBeenNthCalledWith(3, 'addImage', {
      altText: '예시 이미지',
      imageUrl: 'https://example.com/image.png',
    });
  });
});
