'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

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

export default function DetailKarya() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

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
        .eq('id', id)
        .single();

      if (error) throw error;
      setKarya(data as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetailKarya();
    }
  }, [id, fetchDetailKarya]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl animate-pulse space-y-6">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-10 bg-slate-200 rounded w-3/4" />
          <div className="h-64 bg-slate-200 rounded-2xl w-full" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !karya) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 max-w-md shadow-sm">
          <p className="text-sm font-medium mb-4">
            Karya tidak ditemukan atau gagal memuat data.
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-xs bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* HEADER MINIMALIS */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center px-6 sm:px-12 z-50 justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
        >
          <span>←</span> Kembali
        </button>
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Detail Karya
        </span>
      </header>

      {/* AREA KONTEN UTAMA */}
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <article className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          
          {/* FOTO/SAMPUL KARYA JIKA ADA */}
          {karya.foto_url && (
            <div className="w-full h-80 sm:h-[400px] bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src={karya.foto_url}
                alt={karya.judul}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* ISI KARYA */}
          <div className="p-6 sm:p-10">
            {/* META DATA (KATEGORI & RANK) */}
            <div className="flex flex-wrap gap-2 items-center mb-6">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md uppercase tracking-wider">
                {karya.kategori}
              </span>
              {karya.anggota?.rank && (
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2.5 py-1 rounded-md">
                  {karya.anggota.rank}
                </span>
              )}
            </div>

            {/* JUDUL UTAMA */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              {karya.judul}
            </h1>

            {/* INFORMASI PENULIS (TANPA GAMBAR AVATAR) */}
            <div className="pb-6 mb-8 border-b border-slate-100 text-xs text-slate-400">
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

            {/* BADAN TEKS UTAMA */}
            <div className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal tracking-normal space-y-4">
              {karya.isi}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}