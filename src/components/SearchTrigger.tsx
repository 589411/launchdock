import { useState, useEffect, useCallback } from 'react';
import SearchModal from './SearchModal';

/**
 * Global search trigger — renders the search button & modal,
 * and listens for Cmd/Ctrl+K keyboard shortcut.
 */
export default function SearchTrigger() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  // Global keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  return (
    <>
      <button
        className="search-trigger-btn"
        onClick={handleOpen}
        aria-label="搜尋文章"
        title={`搜尋文章 (${isMac ? '⌘' : 'Ctrl+'}K)`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="search-trigger-text">搜尋</span>
        <kbd className="search-trigger-kbd">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>

      <SearchModal open={open} onClose={handleClose} />
    </>
  );
}
