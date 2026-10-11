'use client';
import { useEffect } from 'react';

let lockCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalBodyOverscroll = '';
let originalHtmlOverscroll = '';

/**
 * Safely lock background scrolling on document and body across
 * Mobile (iOS Safari & Android Chrome), Tablet, and Desktop.
 */
export function lockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (lockCount === 0) {
    originalBodyOverflow = document.body.style.overflow || '';
    originalHtmlOverflow = document.documentElement.style.overflow || '';
    originalBodyOverscroll = document.body.style.overscrollBehavior || '';
    originalHtmlOverscroll = document.documentElement.style.overscrollBehavior || '';

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'contain';
    document.body.style.overscrollBehavior = 'contain';

    document.documentElement.classList.add('modal-open-scroll-locked');
    document.body.classList.add('modal-open-scroll-locked');
  }
  lockCount++;
}

/**
 * Restore background scrolling once all modals are closed.
 */
export function unlockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
    document.body.style.overscrollBehavior = originalBodyOverscroll;

    document.documentElement.classList.remove('modal-open-scroll-locked');
    document.body.classList.remove('modal-open-scroll-locked');
  }
}

/**
 * Hook to lock background scrolling while a modal or dialog is open.
 * Automatically cleans up on unmount or when isOpen becomes false.
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isOpen]);
}

export default useBodyScrollLock;
