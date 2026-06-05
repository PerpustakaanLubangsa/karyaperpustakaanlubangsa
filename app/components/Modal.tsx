'use client';

import { ElementRef, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<ElementRef<'dialog'>>(null);

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function onDismiss() {
    router.back();
  }

  return (
    <div 
      className="fixed inset-0 w-screen h-screen bg-white z-50 overflow-y-auto left-0 top-0 right-0 bottom-0 flex flex-col" 
      onClick={onDismiss}
    >
      <dialog
        ref={dialogRef}
        /* Tambahkan style inline di bawah untuk menimpa paksa margin/padding bawaan browser pada elemen <dialog>
        */
        style={{ maxWidth: '100vw', maxHeight: '100vh', margin: 0, padding: 0 }}
        className="w-full min-h-screen bg-white outline-none block border-0 shadow-none border-none p-0 m-0"
        onClick={(e) => e.stopPropagation()} 
        onClose={onDismiss}
      >
        {/* Tombol Tutup (X) - Diatur agar posisinya aman dari scrollbar (misal: right-6 atau right-8) */}
        <button 
          onClick={onDismiss}
          className="fixed top-6 right-6 sm:right-8 text-slate-500 hover:text-slate-800 font-bold bg-slate-100 hover:bg-slate-200/80 w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm border border-slate-200/50 z-50 text-lg"
        >
          ✕
        </button>
        
        {/* Konten Utama */}
        <div className="w-full max-w-3xl mx-auto px-6 sm:px-0 pt-20 pb-16">
          {children}
        </div>
      </dialog>
    </div>
  );
}