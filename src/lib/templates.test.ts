import { describe, expect, it } from 'vitest';

import {
  DEFAULT_TEMPLATE_ID,
  DOCUMENT_TEMPLATES,
  TEMPLATE_GROUPS,
  getTemplateById,
} from './templates';

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

  it('exposes grouped template metadata for the sidebar', () => {
    expect(TEMPLATE_GROUPS).toEqual([
      {
        category: 'general',
        description: '보고서, 회의록, 기안서처럼 자주 쓰는 일반 문서 서식입니다.',
        label: '기본 서식',
        templates: DOCUMENT_TEMPLATES.filter((template) => template.category === 'general'),
      },
      {
        category: 'official-docs',
        description: '행정기관 공문서 형식을 참고한 공식 문서 서식 7종입니다.',
        label: '공문서 양식',
        templates: DOCUMENT_TEMPLATES.filter((template) => template.category === 'official-docs'),
      },
    ]);
  });
});
