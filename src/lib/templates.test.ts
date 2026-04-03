import { describe, expect, it } from 'vitest';

import { DEFAULT_TEMPLATE_ID, DOCUMENT_TEMPLATES, getTemplateById } from './templates';

describe('template registry', () => {
  it('keeps the report template as the default', () => {
    expect(DEFAULT_TEMPLATE_ID).toBe('report');
  });

  it('includes the Korean official document templates in the shared registry', () => {
    const officialTemplates = DOCUMENT_TEMPLATES.filter((template) => template.category === 'official-docs');

    expect(officialTemplates).toHaveLength(7);
    expect(officialTemplates.map((template) => template.id)).toEqual([
      'official-internal-draft',
      'official-external-dispatch',
      'official-cooperation-request',
      'official-minutes',
      'official-review-report',
      'official-civil-response',
      'official-public-notice',
    ]);
  });

  it('loads official templates with markdown frontmatter and guide comments', () => {
    const template = getTemplateById('official-internal-draft');

    expect(template.content.startsWith('---')).toBe(true);
    expect(template.content).toContain('category: "official-docs"');
    expect(template.content).toContain('<!-- GUIDE:');
  });
});
