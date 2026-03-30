import { DOCUMENT_TEMPLATES, type TemplateId } from '../lib/templates';

interface SidebarProps {
  currentPath: string | null;
  onSelectTemplate(templateId: TemplateId): void;
}

export function Sidebar({ currentPath, onSelectTemplate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <section className="sidebar__section">
        <h2>문서 서식</h2>
        <div className="template-list">
          {DOCUMENT_TEMPLATES.map((template) => (
            <button
              className="template-list__item"
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              type="button"
            >
              <strong>{template.label}</strong>
              <span>{template.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sidebar__section">
        <h2>현재 문서</h2>
        <p>{currentPath ?? '새 문서'}</p>
      </section>
    </aside>
  );
}
