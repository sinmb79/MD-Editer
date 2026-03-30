import { describe, expect, it, vi } from 'vitest';

import {
  createDocumentController,
  createEmptySession,
  type DocumentFileService,
  type DocumentSession,
} from './documentSession';
import { DEFAULT_TEMPLATE_ID, getTemplateById } from './templates';

function createServiceMock(overrides: Partial<DocumentFileService> = {}): DocumentFileService {
  return {
    confirmDiscardChanges: vi.fn().mockResolvedValue(true),
    exportDocument: vi.fn().mockResolvedValue(undefined),
    openFile: vi.fn().mockResolvedValue(null),
    saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/saved.md' }),
    ...overrides,
  };
}

describe('document session', () => {
  it('creates an empty untitled session', () => {
    expect(createEmptySession()).toEqual<DocumentSession>({
      content: '',
      currentPath: null,
      isDirty: false,
      theme: 'light',
    });
  });

  it('applies the default template and marks the document as dirty', async () => {
    const service = createServiceMock();
    const controller = createDocumentController(service);

    const nextSession = await controller.applyTemplate(createEmptySession(), DEFAULT_TEMPLATE_ID);

    expect(nextSession.content).toBe(getTemplateById(DEFAULT_TEMPLATE_ID).content);
    expect(nextSession.currentPath).toBeNull();
    expect(nextSession.isDirty).toBe(true);
  });

  it('asks before discarding unsaved changes when applying a template', async () => {
    const service = createServiceMock({
      confirmDiscardChanges: vi.fn().mockResolvedValue(false),
    });
    const controller = createDocumentController(service);
    const session: DocumentSession = {
      content: 'Unsaved draft',
      currentPath: null,
      isDirty: true,
      theme: 'light',
    };

    const nextSession = await controller.applyTemplate(session, DEFAULT_TEMPLATE_ID);

    expect(service.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(nextSession).toBe(session);
  });

  it('opens a file and resets the dirty state', async () => {
    const service = createServiceMock({
      openFile: vi.fn().mockResolvedValue({
        content: '# Existing file',
        path: 'C:/docs/existing.md',
      }),
    });
    const controller = createDocumentController(service);

    const nextSession = await controller.open(createEmptySession());

    expect(service.openFile).toHaveBeenCalledOnce();
    expect(nextSession).toEqual<DocumentSession>({
      content: '# Existing file',
      currentPath: 'C:/docs/existing.md',
      isDirty: false,
      theme: 'light',
    });
  });

  it('saves to the current path without changing the clean content', async () => {
    const service = createServiceMock({
      saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/draft.md' }),
    });
    const controller = createDocumentController(service);
    const session: DocumentSession = {
      content: '# Draft',
      currentPath: 'C:/docs/draft.md',
      isDirty: true,
      theme: 'dark',
    };

    const nextSession = await controller.save(session);

    expect(service.saveFile).toHaveBeenCalledWith('# Draft', 'C:/docs/draft.md');
    expect(nextSession).toEqual<DocumentSession>({
      content: '# Draft',
      currentPath: 'C:/docs/draft.md',
      isDirty: false,
      theme: 'dark',
    });
  });

  it('supports save as by ignoring the existing path', async () => {
    const service = createServiceMock({
      saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/renamed.md' }),
    });
    const controller = createDocumentController(service);
    const session: DocumentSession = {
      content: '# Draft',
      currentPath: 'C:/docs/original.md',
      isDirty: true,
      theme: 'dark',
    };

    const nextSession = await controller.saveAs(session);

    expect(service.saveFile).toHaveBeenCalledWith('# Draft', undefined);
    expect(nextSession).toEqual<DocumentSession>({
      content: '# Draft',
      currentPath: 'C:/docs/renamed.md',
      isDirty: false,
      theme: 'dark',
    });
  });

  it('asks before discarding unsaved changes when creating a new file', async () => {
    const service = createServiceMock({
      confirmDiscardChanges: vi.fn().mockResolvedValue(false),
    });
    const controller = createDocumentController(service);
    const session: DocumentSession = {
      content: 'Unsaved',
      currentPath: null,
      isDirty: true,
      theme: 'light',
    };

    const nextSession = await controller.createNew(session);

    expect(service.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(nextSession).toBe(session);
  });

  it('exports pdf by saving untitled content first', async () => {
    const service = createServiceMock({
      saveFile: vi.fn().mockResolvedValue({ path: 'C:/docs/export-target.md' }),
    });
    const controller = createDocumentController(service);
    const session: DocumentSession = {
      content: '# Export me',
      currentPath: null,
      isDirty: true,
      theme: 'light',
    };

    const nextSession = await controller.exportPdf(session);

    expect(service.saveFile).toHaveBeenCalledWith('# Export me', undefined);
    expect(service.exportDocument).toHaveBeenCalledWith('C:/docs/export-target.md', 'pdf');
    expect(nextSession.currentPath).toBe('C:/docs/export-target.md');
    expect(nextSession.isDirty).toBe(false);
  });
});
