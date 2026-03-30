import { DEFAULT_TEMPLATE_ID, getTemplateById, type TemplateId } from './templates';

export type ThemeMode = 'light' | 'dark';

export interface DocumentSession {
  content: string;
  currentPath: string | null;
  isDirty: boolean;
  theme: ThemeMode;
}

export interface SaveResult {
  path: string;
}

export interface OpenResult {
  path: string;
  content: string;
}

export interface DocumentFileService {
  confirmDiscardChanges(): Promise<boolean>;
  openFile(): Promise<OpenResult | null>;
  saveFile(content: string, path?: string): Promise<SaveResult | null>;
  exportDocument(inputPath: string, format: 'pdf' | 'docx' | 'hwp'): Promise<void>;
}

export function createEmptySession(theme: ThemeMode = 'light'): DocumentSession {
  return {
    content: '',
    currentPath: null,
    isDirty: false,
    theme,
  };
}

function markSaved(session: DocumentSession, path: string): DocumentSession {
  return {
    ...session,
    currentPath: path,
    isDirty: false,
  };
}

async function ensureDiscardAllowed(
  service: DocumentFileService,
  session: DocumentSession,
): Promise<boolean> {
  if (!session.isDirty) {
    return true;
  }

  return service.confirmDiscardChanges();
}

export function createDocumentController(service: DocumentFileService) {
  return {
    async applyTemplate(
      session: DocumentSession,
      templateId: TemplateId = DEFAULT_TEMPLATE_ID,
    ): Promise<DocumentSession> {
      const canDiscard = await ensureDiscardAllowed(service, session);

      if (!canDiscard) {
        return session;
      }

      const template = getTemplateById(templateId);

      return {
        ...session,
        content: template.content,
        currentPath: null,
        isDirty: template.content.length > 0,
      };
    },

    async createNew(session: DocumentSession): Promise<DocumentSession> {
      const canDiscard = await ensureDiscardAllowed(service, session);

      if (!canDiscard) {
        return session;
      }

      return createEmptySession(session.theme);
    },

    async open(session: DocumentSession): Promise<DocumentSession> {
      const canDiscard = await ensureDiscardAllowed(service, session);

      if (!canDiscard) {
        return session;
      }

      const nextFile = await service.openFile();

      if (!nextFile) {
        return session;
      }

      return {
        content: nextFile.content,
        currentPath: nextFile.path,
        isDirty: false,
        theme: session.theme,
      };
    },

    async save(session: DocumentSession): Promise<DocumentSession> {
      const result = await service.saveFile(session.content, session.currentPath ?? undefined);

      if (!result) {
        return session;
      }

      return markSaved(session, result.path);
    },

    async saveAs(session: DocumentSession): Promise<DocumentSession> {
      const result = await service.saveFile(session.content, undefined);

      if (!result) {
        return session;
      }

      return markSaved(session, result.path);
    },

    async exportPdf(session: DocumentSession): Promise<DocumentSession> {
      const savedSession = session.currentPath ? await this.save(session) : await this.save(session);

      if (!savedSession.currentPath) {
        return session;
      }

      await service.exportDocument(savedSession.currentPath, 'pdf');
      return savedSession;
    },
  };
}
