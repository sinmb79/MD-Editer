import '@toast-ui/editor/dist/i18n/ko-kr';
import '@toast-ui/editor/dist/toastui-editor.css';
import 'katex/dist/katex.min.css';

import { useEffect, useMemo, useRef } from 'react';

import chart from '@toast-ui/editor-plugin-chart';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
import uml from '@toast-ui/editor-plugin-uml';
import { Editor as ToastUiReactEditor } from '@toast-ui/react-editor';

import { createEditorCommandBridge, type MermaidDiagramType } from '../lib/editorCommands';

type ToastEditorHandle = InstanceType<typeof ToastUiReactEditor>;

export interface EditorCommandBridge {
  bold(): void;
  italic(): void;
  heading(level: 1 | 2 | 3): void;
  bulletList(): void;
  orderedList(): void;
  table(rowCount: number, columnCount: number): void;
  image(imageUrl: string, altText: string): void;
  link(linkUrl: string, linkText: string): void;
  insertMermaid(type: MermaidDiagramType): void;
}

interface EditorSurfaceProps {
  value: string;
  onChange(content: string): void;
  onReady?(bridge: EditorCommandBridge): void;
}

export function EditorSurface({ value, onChange, onReady }: EditorSurfaceProps) {
  const editorRef = useRef<ToastEditorHandle | null>(null);
  const lastValueRef = useRef(value);
  const plugins = useMemo(() => [chart, colorSyntax, tableMergedCell, uml], []);

  useEffect(() => {
    const instance = editorRef.current?.getInstance();

    if (!instance) {
      return;
    }

    onReady?.(
      createEditorCommandBridge({
        exec: (command, payload) => instance.exec(command, payload),
        focus: () => instance.focus(),
        insertText: (text) => instance.insertText(text),
      }),
    );
  }, [onReady]);

  useEffect(() => {
    const instance = editorRef.current?.getInstance();

    if (!instance || value === lastValueRef.current) {
      return;
    }

    instance.setMarkdown(value, false);
    lastValueRef.current = value;
  }, [value]);

  return (
    <div className="editor-surface">
      <ToastUiReactEditor
        autofocus
        height="100%"
        hideModeSwitch
        initialEditType="wysiwyg"
        initialValue={value}
        language="ko-KR"
        plugins={plugins}
        previewStyle="vertical"
        ref={editorRef}
        usageStatistics={false}
        onChange={() => {
          const nextValue = editorRef.current?.getInstance().getMarkdown() ?? '';
          lastValueRef.current = nextValue;
          onChange(nextValue);
        }}
      />
    </div>
  );
}
