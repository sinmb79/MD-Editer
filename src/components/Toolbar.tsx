import { useState } from 'react';

import type { EditorCommandBridge } from './Editor';
import type { MermaidDiagramType } from '../lib/editorCommands';

type InsertPanel = 'diagram' | 'image' | 'link' | 'table' | null;

interface ToolbarProps {
  canSave: boolean;
  onExportPdf(): void;
  onNew(): void;
  onOpen(): void;
  onSave(): void;
  onSaveAs(): void;
  editorBridge: EditorCommandBridge | null;
}

export function Toolbar({
  canSave,
  editorBridge,
  onExportPdf,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
}: ToolbarProps) {
  const editorDisabled = !editorBridge;
  const [activePanel, setActivePanel] = useState<InsertPanel>(null);
  const [tableRows, setTableRows] = useState('2');
  const [tableColumns, setTableColumns] = useState('2');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [diagramType, setDiagramType] = useState<MermaidDiagramType>('flowchart');

  function closePanel() {
    setActivePanel(null);
  }

  return (
    <header className="toolbar">
      <div className="toolbar__row">
        <div className="toolbar__group">
          <button onClick={onNew} type="button">
            새 문서
          </button>
          <button onClick={onOpen} type="button">
            열기
          </button>
          <button disabled={!canSave} onClick={onSave} type="button">
            저장
          </button>
          <button disabled={!canSave} onClick={onSaveAs} type="button">
            다른 이름으로 저장
          </button>
          <button onClick={onExportPdf} type="button">
            PDF 내보내기
          </button>
        </div>

        <div className="toolbar__group">
          <button disabled={editorDisabled} onClick={() => editorBridge?.bold()} type="button">
            굵게
          </button>
          <button disabled={editorDisabled} onClick={() => editorBridge?.italic()} type="button">
            기울임
          </button>
          <button disabled={editorDisabled} onClick={() => editorBridge?.heading(1)} type="button">
            H1
          </button>
          <button disabled={editorDisabled} onClick={() => editorBridge?.heading(2)} type="button">
            H2
          </button>
          <button disabled={editorDisabled} onClick={() => editorBridge?.heading(3)} type="button">
            H3
          </button>
          <button disabled={editorDisabled} onClick={() => editorBridge?.bulletList()} type="button">
            목록
          </button>
          <button disabled={editorDisabled} onClick={() => editorBridge?.orderedList()} type="button">
            번호목록
          </button>
          <button disabled={editorDisabled} onClick={() => setActivePanel('table')} type="button">
            표
          </button>
          <button disabled={editorDisabled} onClick={() => setActivePanel('image')} type="button">
            이미지
          </button>
          <button disabled={editorDisabled} onClick={() => setActivePanel('link')} type="button">
            링크
          </button>
          <button disabled={editorDisabled} onClick={() => setActivePanel('diagram')} type="button">
            다이어그램
          </button>
        </div>
      </div>

      {activePanel === 'diagram' ? (
        <div className="toolbar__panel">
          <label>
            다이어그램 종류
            <select onChange={(event) => setDiagramType(event.target.value as MermaidDiagramType)} value={diagramType}>
              <option value="flowchart">순서도</option>
              <option value="sequence">시퀀스</option>
              <option value="gantt">간트</option>
              <option value="er">ER</option>
              <option value="pie">파이</option>
            </select>
          </label>
          <button
            onClick={() => {
              editorBridge?.insertMermaid(diagramType);
              closePanel();
            }}
            type="button"
          >
            다이어그램 삽입
          </button>
          <button onClick={closePanel} type="button">
            취소
          </button>
        </div>
      ) : null}

      {activePanel === 'table' ? (
        <div className="toolbar__panel">
          <label>
            행 수
            <input
              min="1"
              onChange={(event) => setTableRows(event.target.value)}
              type="number"
              value={tableRows}
            />
          </label>
          <label>
            열 수
            <input
              min="1"
              onChange={(event) => setTableColumns(event.target.value)}
              type="number"
              value={tableColumns}
            />
          </label>
          <button
            onClick={() => {
              editorBridge?.table(Number(tableRows), Number(tableColumns));
              closePanel();
            }}
            type="button"
          >
            표 삽입
          </button>
          <button onClick={closePanel} type="button">
            취소
          </button>
        </div>
      ) : null}

      {activePanel === 'link' ? (
        <div className="toolbar__panel">
          <label>
            링크 주소
            <input onChange={(event) => setLinkUrl(event.target.value)} type="url" value={linkUrl} />
          </label>
          <label>
            표시 텍스트
            <input onChange={(event) => setLinkText(event.target.value)} type="text" value={linkText} />
          </label>
          <button
            onClick={() => {
              editorBridge?.link(linkUrl, linkText);
              closePanel();
            }}
            type="button"
          >
            링크 삽입
          </button>
          <button onClick={closePanel} type="button">
            취소
          </button>
        </div>
      ) : null}

      {activePanel === 'image' ? (
        <div className="toolbar__panel">
          <label>
            이미지 주소
            <input onChange={(event) => setImageUrl(event.target.value)} type="url" value={imageUrl} />
          </label>
          <label>
            대체 텍스트
            <input onChange={(event) => setImageAltText(event.target.value)} type="text" value={imageAltText} />
          </label>
          <button
            onClick={() => {
              editorBridge?.image(imageUrl, imageAltText || 'image');
              closePanel();
            }}
            type="button"
          >
            이미지 삽입
          </button>
          <button onClick={closePanel} type="button">
            취소
          </button>
        </div>
      ) : null}
    </header>
  );
}
