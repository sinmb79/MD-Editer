interface ExportModalProps {
  isOpen: boolean;
  onClose(): void;
  onExportPdf(): void;
}

export function ExportModal({ isOpen, onClose, onExportPdf }: ExportModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div aria-modal="true" className="modal" role="dialog">
        <h2>내보내기</h2>
        <p>Phase 0에서는 PDF 내보내기만 지원합니다.</p>
        <div className="modal__actions">
          <button onClick={onExportPdf} type="button">
            PDF 내보내기
          </button>
          <button onClick={onClose} type="button">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
