'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Modal } from '../../../components/Modal'; // Pastikan path ini sesuai dengan tempat Anda membuat file Modal.tsx

interface Anggota {
  nama: string;
  rank: string;
}

interface Karya {
  id: string;
  kategori: string;
  judul: string;
  isi: string;
  foto_url: string | null;
  dibuat_pada: string;
  anggota: Anggota | null;
}

export default function DetailKaryaModal() {
  const params = useParams();
  const slug = params?.slug as string;

  const [karya, setKarya] = useState<Karya | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetailKarya = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('karya')
        .select(`
          id,
          kategori,
          judul,
          isi,
          foto_url,
          dibuat_pada,
          anggota (
            nama,
            rank
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setKarya(data as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchDetailKarya();
    }
  }, [slug, fetchDetailKarya]);

  return (
    <Modal>
      {loading ? (
        <div className="p-6 sm:p-10 animate-pulse space-y-6">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-48 sm:h-64 bg-slate-200 rounded-2xl w-full" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-full" />
          </div>
        </div>
      ) : error || !karya ? (
        <div className="p-10 text-center text-slate-500 text-sm font-medium">
          Karya tidak ditemukan atau gagal memuat data.
        </div>
      ) : (
        <article className="bg-white overflow-hidden">
          {karya.foto_url && (
            <div className="w-full h-64 sm:h-96 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src={karya.foto_url}
                alt={karya.judul}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md uppercase tracking-wider">
                {karya.kategori}
              </span>
              {karya.anggota?.rank && (
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2.5 py-1 rounded-md">
                  {karya.anggota.rank}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              {karya.judul}
            </h1>

            <div className="pb-4 mb-6 border-b border-slate-100 text-xs text-slate-400">
              <p className="text-slate-700 font-semibold mb-1">
                Oleh: {karya.anggota?.nama || 'Anonim'}
              </p>
              <p className="text-[10px]">
                Diterbitkan pada:{' '}
                {new Date(karya.dibuat_pada).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* PERUBAHAN UTAMA:
              - Menghapus dangerouslySetInnerHTML karena isi database murni teks.
              - Menggunakan `whitespace-pre-line` agar browser mendeteksi \n, \n\n, \n\n\n secara presisi.
              - Menambahkan `break-words` untuk mencegah teks panjang merusak layout.
            */}
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line break-words">
              {karya.isi}
            </div>
          </div>
        </article>
      )}
    </Modal>
  );
}