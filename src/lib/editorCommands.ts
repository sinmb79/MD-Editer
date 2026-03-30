export type MermaidDiagramType = 'flowchart' | 'sequence' | 'gantt' | 'er' | 'pie';

export interface EditorRuntime {
  exec(command: string, payload?: Record<string, unknown>): void;
  focus(): void;
  insertText(text: string): void;
}

function mermaidTemplate(type: MermaidDiagramType): string {
  switch (type) {
    case 'sequence':
      return ['```mermaid', 'sequenceDiagram', 'Alice->>Bob: 안녕하세요', '```', ''].join('\n');
    case 'gantt':
      return [
        '```mermaid',
        'gantt',
        'title 일정표',
        'dateFormat  YYYY-MM-DD',
        'section 작업',
        '초안 작성 :done, a1, 2026-03-30, 2d',
        '검토 :a2, after a1, 2d',
        '```',
        '',
      ].join('\n');
    case 'er':
      return [
        '```mermaid',
        'erDiagram',
        'DOCUMENT ||--o{ TEMPLATE : uses',
        'DOCUMENT {',
        '  string title',
        '}',
        '```',
        '',
      ].join('\n');
    case 'pie':
      return [
        '```mermaid',
        'pie title 문서 구성',
        '"본문" : 70',
        '"표" : 20',
        '"그림" : 10',
        '```',
        '',
      ].join('\n');
    case 'flowchart':
    default:
      return [
        '```mermaid',
        'flowchart TD',
        'A[작성 시작] --> B[검토]',
        'B --> C[배포]',
        '```',
        '',
      ].join('\n');
  }
}

export function createEditorCommandBridge(runtime: EditorRuntime) {
  return {
    bold() {
      runtime.exec('bold');
    },
    italic() {
      runtime.exec('italic');
    },
    heading(level: 1 | 2 | 3) {
      runtime.exec('heading', { level });
    },
    bulletList() {
      runtime.exec('bulletList');
    },
    orderedList() {
      runtime.exec('orderedList');
    },
    table(rowCount: number, columnCount: number) {
      runtime.exec('addTable', { rowCount, columnCount });
    },
    image(imageUrl: string, altText: string) {
      runtime.exec('addImage', { imageUrl, altText });
    },
    link(linkUrl: string, linkText: string) {
      runtime.exec('addLink', { linkUrl, linkText });
    },
    insertMermaid(type: MermaidDiagramType) {
      runtime.insertText(mermaidTemplate(type));
      runtime.focus();
    },
  };
}
