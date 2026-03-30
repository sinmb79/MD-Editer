import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import type { EditorCommandBridge } from './components/Editor';
import type { DocumentFileService } from './lib/documentSession';

const editorBridgeMock: EditorCommandBridge = {
  bold: vi.fn(),
  bulletList: vi.fn(),
  heading: vi.fn(),
  image: vi.fn(),
  insertMermaid: vi.fn(),
  italic: vi.fn(),
  link: vi.fn(),
  orderedList: vi.fn(),
  table: vi.fn(),
};

vi.mock('./components/Editor', () => ({
  EditorSurface: ({
    onReady,
    value,
    onChange,
  }: {
    onReady?: (bridge: EditorCommandBridge) => void;
    value: string;
    onChange: (content: string) => void;
  }) => {
    onReady?.(editorBridgeMock);

    return (
      <textarea
        aria-label="문서 편집기"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  },
}));

function createFileServiceMock(overrides: Partial<DocumentFileService> = {}): DocumentFileService {
  return {
    confirmDiscardChanges: vi.fn().mockResolvedValue(true),
    exportDocument: vi.fn().mockResolvedValue(undefined),
    openFile: vi.fn().mockResolvedValue(null),
    saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/current.md' }),
    ...overrides,
  };
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Korean shell and applies a template from the sidebar', async () => {
    render(<App fileService={createFileServiceMock()} />);

    expect(screen.getByText('MDEditor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새 문서' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '열기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /보고서/ }));

    await waitFor(() =>
      expect((screen.getByLabelText('문서 편집기') as HTMLTextAreaElement).value).toContain('# 보고서 제목'),
    );
    expect(screen.getByText('저장되지 않음')).toBeInTheDocument();
  });

  it('keeps the current content when template discard is canceled', async () => {
    const fileService = createFileServiceMock({
      confirmDiscardChanges: vi.fn().mockResolvedValue(false),
    });

    render(<App fileService={fileService} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '지우지 말아야 할 초안' },
    });
    fireEvent.click(screen.getByRole('button', { name: /보고서/ }));

    await waitFor(() =>
      expect((screen.getByLabelText('문서 편집기') as HTMLTextAreaElement).value).toBe('지우지 말아야 할 초안'),
    );
    expect(screen.getByText('작업을 취소했습니다.')).toBeInTheDocument();
  });

  it('saves the current content through the file service', async () => {
    const fileService = createFileServiceMock();

    render(<App fileService={fileService} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '직접 작성한 문서' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() =>
      expect(fileService.saveFile).toHaveBeenCalledWith('직접 작성한 문서', undefined),
    );
    expect(screen.getAllByText('C:/docs/current.md')).toHaveLength(2);
  });

  it('exports pdf after the current document is saved', async () => {
    const fileService = createFileServiceMock({
      saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/exportable.md' }),
    });

    render(<App fileService={fileService} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '# 내보내기 테스트' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'PDF 내보내기' }));

    await waitFor(() =>
      expect(fileService.exportDocument).toHaveBeenCalledWith('C:/docs/exportable.md', 'pdf'),
    );
  });

  it('opens an existing file into the editor', async () => {
    const fileService = createFileServiceMock({
      openFile: vi.fn().mockResolvedValue({
        content: '# 불러온 문서',
        path: 'C:/docs/opened.md',
      }),
    });

    render(<App fileService={fileService} />);

    fireEvent.click(screen.getByRole('button', { name: '열기' }));

    await waitFor(() =>
      expect((screen.getByLabelText('문서 편집기') as HTMLTextAreaElement).value).toContain('# 불러온 문서'),
    );
    expect(fileService.openFile).toHaveBeenCalledOnce();
  });

  it('supports save as even after a document already has a path', async () => {
    const fileService = createFileServiceMock({
      openFile: vi.fn().mockResolvedValue({
        content: '# 기존 문서',
        path: 'C:/docs/original.md',
      }),
      saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/renamed.md' }),
    });

    render(<App fileService={fileService} />);

    fireEvent.click(screen.getByRole('button', { name: '열기' }));
    await waitFor(() =>
      expect((screen.getByLabelText('문서 편집기') as HTMLTextAreaElement).value).toContain('# 기존 문서'),
    );

    fireEvent.click(screen.getByRole('button', { name: '다른 이름으로 저장' }));

    await waitFor(() => expect(fileService.saveFile).toHaveBeenLastCalledWith('# 기존 문서', undefined));
    expect(screen.getAllByText('C:/docs/renamed.md')).toHaveLength(2);
  });

  it('routes toolbar commands through the editor bridge', async () => {
    render(<App fileService={createFileServiceMock()} />);

    fireEvent.click(screen.getByRole('button', { name: '굵게' }));
    fireEvent.click(screen.getByRole('button', { name: 'H2' }));
    fireEvent.click(screen.getByRole('button', { name: '다이어그램' }));
    fireEvent.click(screen.getByRole('button', { name: '다이어그램 삽입' }));

    expect(editorBridgeMock.bold).toHaveBeenCalledOnce();
    expect(editorBridgeMock.heading).toHaveBeenCalledWith(2);
    expect(editorBridgeMock.insertMermaid).toHaveBeenCalledWith('flowchart');
  });

  it('collects table dimensions before inserting a table', async () => {
    render(<App fileService={createFileServiceMock()} />);

    fireEvent.click(screen.getByRole('button', { name: '표' }));
    fireEvent.change(screen.getByLabelText('행 수'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('열 수'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: '표 삽입' }));

    expect(editorBridgeMock.table).toHaveBeenCalledWith(3, 4);
  });

  it('collects link information before inserting a link', async () => {
    render(<App fileService={createFileServiceMock()} />);

    fireEvent.click(screen.getByRole('button', { name: '링크' }));
    fireEvent.change(screen.getByLabelText('링크 주소'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByLabelText('표시 텍스트'), {
      target: { value: '예시 링크' },
    });
    fireEvent.click(screen.getByRole('button', { name: '링크 삽입' }));

    expect(editorBridgeMock.link).toHaveBeenCalledWith('https://example.com', '예시 링크');
  });

  it('lets the user choose a mermaid diagram type before inserting', async () => {
    render(<App fileService={createFileServiceMock()} />);

    fireEvent.click(screen.getByRole('button', { name: '다이어그램' }));
    fireEvent.change(screen.getByLabelText('다이어그램 종류'), {
      target: { value: 'sequence' },
    });
    fireEvent.click(screen.getByRole('button', { name: '다이어그램 삽입' }));

    expect(editorBridgeMock.insertMermaid).toHaveBeenCalledWith('sequence');
  });

  it('shows an error message when pdf export fails', async () => {
    const fileService = createFileServiceMock({
      exportDocument: vi.fn().mockRejectedValue(new Error('Pandoc failed')),
      saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/exportable.md' }),
    });

    render(<App fileService={fileService} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '# 내보내기 테스트' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'PDF 내보내기' }));

    await waitFor(() => expect(screen.getByText('Pandoc failed')).toBeInTheDocument());
  });

  it('supports common document keyboard shortcuts', async () => {
    const fileService = createFileServiceMock({
      openFile: vi.fn().mockResolvedValue({
        content: '# 단축키로 연 문서',
        path: 'C:/docs/shortcut-open.md',
      }),
      saveFile: vi
        .fn()
        .mockResolvedValueOnce({ path: 'C:/docs/shortcut-save.md' })
        .mockResolvedValueOnce({ path: 'C:/docs/shortcut-save-as.md' }),
    });

    render(<App fileService={fileService} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '# 단축키 테스트' },
    });

    fireEvent.keyDown(window, { ctrlKey: true, key: 's' });
    await waitFor(() =>
      expect(fileService.saveFile).toHaveBeenCalledWith('# 단축키 테스트', undefined),
    );

    fireEvent.keyDown(window, { ctrlKey: true, shiftKey: true, key: 'S' });
    await waitFor(() =>
      expect(fileService.saveFile).toHaveBeenLastCalledWith('# 단축키 테스트', undefined),
    );

    fireEvent.keyDown(window, { ctrlKey: true, key: 'o' });
    await waitFor(() =>
      expect((screen.getByLabelText('문서 편집기') as HTMLTextAreaElement).value).toContain('# 단축키로 연 문서'),
    );

    fireEvent.keyDown(window, { ctrlKey: true, key: 'n' });
    await waitFor(() => expect((screen.getByLabelText('문서 편집기') as HTMLTextAreaElement).value).toBe(''));
  });

  it('keeps the current document when new-document discard is canceled', async () => {
    const fileService = createFileServiceMock({
      confirmDiscardChanges: vi.fn().mockResolvedValue(false),
    });

    render(<App fileService={fileService} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '지키고 싶은 내용' },
    });
    fireEvent.click(screen.getByRole('button', { name: '새 문서' }));

    await waitFor(() =>
      expect((screen.getByLabelText('문서 편집기') as HTMLTextAreaElement).value).toBe('지키고 싶은 내용'),
    );
    expect(screen.getByText('작업을 취소했습니다.')).toBeInTheDocument();
  });

  it('keeps the export modal open when export fails from the modal', async () => {
    const fileService = createFileServiceMock({
      exportDocument: vi.fn().mockRejectedValue(new Error('Pandoc failed')),
      saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/exportable.md' }),
    });

    render(<App fileService={fileService} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '# 내보내기 테스트' },
    });
    fireEvent.click(screen.getByRole('button', { name: '내보내기 옵션' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'PDF 내보내기' }));

    await waitFor(() => expect(screen.getByText('Pandoc failed')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('warns before the window closes when the document has unsaved changes', () => {
    render(<App fileService={createFileServiceMock()} />);

    fireEvent.change(screen.getByLabelText('문서 편집기'), {
      target: { value: '닫기 전에 경고가 필요한 문서' },
    });

    const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
    Object.defineProperty(event, 'returnValue', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(event.returnValue).toBe('');
  });
});
