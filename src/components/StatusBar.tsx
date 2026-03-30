import type { ThemeMode } from '../lib/documentSession';

interface StatusBarProps {
  currentPath: string | null;
  isDirty: boolean;
  notice: string | null;
  onToggleTheme(): void;
  theme: ThemeMode;
}

export function StatusBar({ currentPath, isDirty, notice, onToggleTheme, theme }: StatusBarProps) {
  return (
    <footer className="status-bar">
      <span>{currentPath ?? '새 문서'}</span>
      <span>{isDirty ? '저장되지 않음' : '저장 완료'}</span>
      <span className="status-bar__notice">{notice ?? '준비됨'}</span>
      <button onClick={onToggleTheme} type="button">
        {theme === 'light' ? '다크 모드' : '라이트 모드'}
      </button>
    </footer>
  );
}
