import blankTemplate from '../templates/blank.md?raw';
import minutesTemplate from '../templates/minutes.md?raw';
import proposalTemplate from '../templates/proposal.md?raw';
import reportTemplate from '../templates/report.md?raw';
import officialCivilResponseTemplate from '../../templates/official-docs/06-민원회신문.md?raw';
import officialCooperationRequestTemplate from '../../templates/official-docs/03-업무협조전.md?raw';
import officialExternalDispatchTemplate from '../../templates/official-docs/02-기안문-대외시행문.md?raw';
import officialInternalDraftTemplate from '../../templates/official-docs/01-기안문-내부결재.md?raw';
import officialMinutesTemplate from '../../templates/official-docs/04-회의록-행정공식.md?raw';
import officialPublicNoticeTemplate from '../../templates/official-docs/07-공고문.md?raw';
import officialReviewReportTemplate from '../../templates/official-docs/05-검토보고서.md?raw';

export type TemplateId =
  | 'blank'
  | 'report'
  | 'minutes'
  | 'proposal'
  | 'official-internal-draft'
  | 'official-external-dispatch'
  | 'official-cooperation-request'
  | 'official-minutes'
  | 'official-review-report'
  | 'official-civil-response'
  | 'official-public-notice';

export type TemplateCategory = 'general' | 'official-docs';

export interface DocumentTemplate {
  id: TemplateId;
  category: TemplateCategory;
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
    category: 'general',
    label: '빈 문서',
    description: '아무 내용 없는 새 문서로 시작합니다.',
    content: normalizeTemplateContent(blankTemplate),
  },
  {
    id: 'report',
    category: 'general',
    label: '보고서',
    description: '기본 보고서 제목과 개요가 포함됩니다.',
    content: normalizeTemplateContent(reportTemplate),
  },
  {
    id: 'minutes',
    category: 'general',
    label: '회의록',
    description: '회의 일시와 안건을 빠르게 정리합니다.',
    content: normalizeTemplateContent(minutesTemplate),
  },
  {
    id: 'proposal',
    category: 'general',
    label: '기안서',
    description: '검토 배경과 기대 효과를 정리하는 기안서 양식입니다.',
    content: normalizeTemplateContent(proposalTemplate),
  },
  {
    id: 'official-internal-draft',
    category: 'official-docs',
    label: '기안문 (내부결재)',
    description: '대외발송 없이 내부 승인만 필요한 기안문입니다.',
    content: normalizeTemplateContent(officialInternalDraftTemplate),
  },
  {
    id: 'official-external-dispatch',
    category: 'official-docs',
    label: '기안문 (대외시행문)',
    description: '외부 기관에 발송하는 시행 공문 양식입니다.',
    content: normalizeTemplateContent(officialExternalDispatchTemplate),
  },
  {
    id: 'official-cooperation-request',
    category: 'official-docs',
    label: '업무협조전',
    description: '부서 간 협조 요청과 회신기한을 정리하는 양식입니다.',
    content: normalizeTemplateContent(officialCooperationRequestTemplate),
  },
  {
    id: 'official-minutes',
    category: 'official-docs',
    label: '회의록 (행정공식)',
    description: '공식 행정회의 안건과 결정사항을 남기는 회의록입니다.',
    content: normalizeTemplateContent(officialMinutesTemplate),
  },
  {
    id: 'official-review-report',
    category: 'official-docs',
    label: '검토보고서',
    description: '결재권자 판단을 위한 분석과 대안 비교 양식입니다.',
    content: normalizeTemplateContent(officialReviewReportTemplate),
  },
  {
    id: 'official-civil-response',
    category: 'official-docs',
    label: '민원 회신문',
    description: '민원 요지, 회신 결과, 이의신청 안내를 담는 양식입니다.',
    content: normalizeTemplateContent(officialCivilResponseTemplate),
  },
  {
    id: 'official-public-notice',
    category: 'official-docs',
    label: '공고문',
    description: '공고 사유, 기간, 의견제출 방법을 담는 공고문입니다.',
    content: normalizeTemplateContent(officialPublicNoticeTemplate),
  },
];

export function getTemplateById(id: TemplateId): DocumentTemplate {
  const template = DOCUMENT_TEMPLATES.find((item) => item.id === id);

  if (!template) {
    throw new Error(`Unknown template: ${id}`);
  }

  return template;
}
