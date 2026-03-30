import { useEffect, useMemo, useState } from 'react';

import { EditorSurface, type EditorCommandBridge } from './components/Editor';
import { ExportModal } from './components/ExportModal';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { createDocumentFileService } from './hooks/useFileSystem';
import {
  createDocumentController,
  createEmptySession,
  type DocumentFileService,
  type DocumentSession,
} from './lib/documentSession';
import type { TemplateId } from './lib/templates';

interface AppProps {
  fileService?: DocumentFileService;
}

export default function App({ fileService = createDocumentFileService() }: AppProps) {
  const [session, setSession] = useState<DocumentSession>(() => createEmptySession());
  const [editorBridge, setEditorBridge] = useState<EditorCommandBridge | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const controller = useMemo(() => createDocumentController(fileService), [fileService]);

  async function updateSession(
    action: Promise<DocumentSession>,
    options?: { cancelNotice?: string; successNotice?: string },
  ): Promise<boolean> {
    try {
      const nextSession = await action;
      setSession(nextSession);
      if (nextSession === session && options?.cancelNotice) {
        setNotice(options.cancelNotice);
      } else {
        setNotice(options?.successNotice ?? null);
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setNotice(message);
      return false;
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 's' && event.shiftKey) {
        event.preventDefault();
        void updateSession(controller.saveAs(session), {
          cancelNotice: '작업을 취소했습니다.',
          successNotice: '다른 이름으로 저장했습니다.',
        });
        return;
      }

      if (key === 's') {
        event.preventDefault();
        void updateSession(controller.save(session), {
          cancelNotice: '작업을 취소했습니다.',
          successNotice: '문서를 저장했습니다.',
        });
        return;
      }

      if (key === 'o') {
        event.preventDefault();
        void updateSession(controller.open(session), {
          cancelNotice: '작업을 취소했습니다.',
          successNotice: '문서를 불러왔습니다.',
        });
        return;
      }

      if (key === 'n') {
        event.preventDefault();
        void updateSession(controller.createNew(session), {
          cancelNotice: '작업을 취소했습니다.',
          successNotice: '새 문서를 준비했습니다.',
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controller, session]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!session.isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session.isDirty]);

  return (
    <div className={`app app--${session.theme}`}>
      <Toolbar
        canSave={session.isDirty || session.currentPath !== null}
        editorBridge={editorBridge}
        onExportPdf={() => updateSession(controller.exportPdf(session), { successNotice: 'PDF 내보내기 완료' })}
        onNew={() =>
          updateSession(controller.createNew(session), {
            cancelNotice: '작업을 취소했습니다.',
            successNotice: '새 문서를 준비했습니다.',
          })
        }
        onOpen={() =>
          updateSession(controller.open(session), {
            cancelNotice: '작업을 취소했습니다.',
            successNotice: '문서를 불러왔습니다.',
          })
        }
        onSave={() =>
          updateSession(controller.save(session), {
            cancelNotice: '작업을 취소했습니다.',
            successNotice: '문서를 저장했습니다.',
          })
        }
        onSaveAs={() =>
          updateSession(controller.saveAs(session), {
            cancelNotice: '작업을 취소했습니다.',
            successNotice: '다른 이름으로 저장했습니다.',
          })
        }
      />

      <main className="app__body">
        <Sidebar
          currentPath={session.currentPath}
          onSelectTemplate={(templateId: TemplateId) =>
            updateSession(controller.applyTemplate(session, templateId), {
              cancelNotice: '작업을 취소했습니다.',
              successNotice: '서식을 적용했습니다.',
            })
          }
        />

        <section className="workspace">
          <div className="workspace__header">
            <div>
              <h1>MDEditor</h1>
              <p>공공 문서를 위한 오프라인 WYSIWYG Markdown 편집기</p>
            </div>

            <button onClick={() => setIsExportOpen(true)} type="button">
              내보내기 옵션
            </button>
          </div>

          <EditorSurface
            onChange={(content) =>
              setSession((currentSession) => ({
                ...currentSession,
                content,
                isDirty: content !== currentSession.content || currentSession.isDirty,
              }))
            }
            onReady={setEditorBridge}
            value={session.content}
          />
        </section>
      </main>

      <StatusBar
        currentPath={session.currentPath}
        isDirty={session.isDirty}
        notice={notice}
        onToggleTheme={() =>
          setSession((currentSession) => ({
            ...currentSession,
            theme: currentSession.theme === 'light' ? 'dark' : 'light',
          }))
        }
        theme={session.theme}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportPdf={async () => {
          const succeeded = await updateSession(controller.exportPdf(session), {
            successNotice: 'PDF 내보내기 완료',
          });

          if (succeeded) {
            setIsExportOpen(false);
          }
        }}
      />
    </div>
  );
}
