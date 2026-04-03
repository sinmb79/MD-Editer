import { TEMPLATE_GROUPS, type TemplateId } from '../lib/templates';

interface SidebarProps {
  currentPath: string | null;
  onSelectTemplate(templateId: TemplateId): void;
}

export function Sidebar({ currentPath, onSelectTemplate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <section className="sidebar__section">
        <h2>문서 서식</h2>
        {TEMPLATE_GROUPS.map((group) => (
          <section className="template-group" key={group.category}>
            <div className="template-group__header">
              <h3>{group.label}</h3>
              <span>{group.templates.length}개</span>
            </div>
            <p>{group.description}</p>
            <div className="template-list">
              {group.templates.map((template) => (
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
        ))}
      </section>

      <section className="sidebar__section">
        <h2>현재 문서</h2>
        <p>{currentPath ?? '새 문서'}</p>
      </section>
    </aside>
  );
}
