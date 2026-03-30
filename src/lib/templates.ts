import blankTemplate from '../templates/blank.md?raw';
import minutesTemplate from '../templates/minutes.md?raw';
import proposalTemplate from '../templates/proposal.md?raw';
import reportTemplate from '../templates/report.md?raw';

export type TemplateId = 'blank' | 'report' | 'minutes' | 'proposal';

export interface DocumentTemplate {
  id: TemplateId;
  label: string;
  description: string;
  content: string;
}

export const DEFAULT_TEMPLATE_ID: TemplateId = 'report';

function normalizeTemplateContent(content: string): string {
  return content.replace(/\r\n/g, '\n').trim();
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    label: '빈 문서',
    description: '아무 내용 없는 새 문서로 시작합니다.',
    content: normalizeTemplateContent(blankTemplate),
  },
  {
    id: 'report',
    label: '보고서',
    description: '기본 보고서 제목과 개요가 포함됩니다.',
    content: normalizeTemplateContent(reportTemplate),
  },
  {
    id: 'minutes',
    label: '회의록',
    description: '회의 일시와 안건을 빠르게 정리합니다.',
    content: normalizeTemplateContent(minutesTemplate),
  },
  {
    id: 'proposal',
    label: '기안서',
    description: '검토 배경과 기대 효과 중심의 기안서 양식입니다.',
    content: normalizeTemplateContent(proposalTemplate),
  },
];

export function getTemplateById(id: TemplateId): DocumentTemplate {
  const template = DOCUMENT_TEMPLATES.find((item) => item.id === id);

  if (!template) {
    throw new Error(`Unknown template: ${id}`);
  }

  return template;
}
