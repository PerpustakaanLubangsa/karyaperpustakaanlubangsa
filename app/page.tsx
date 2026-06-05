'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface Anggota {
  nama: string;
  rank: string;
}

interface Karya {
  id: string;
  anggota_id: string;
  kategori: string;
  judul: string;
  slug: string;
  foto_url: string | null;
  dibuat_pada: string;
  anggota: Anggota | null;
}

const LIMIT = 35;
const SHORT_MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const formatTanggal = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getUTCDate()} ${SHORT_MONTHS_ID[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

export default function Home() {
  const [karyaList, setKaryaList] = useState<Karya[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchKarya = useCallback(async (pageTarget: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const from = pageTarget * LIMIT;
      const textTo = from + LIMIT - 1;

      const { data, error } = await supabase
        .from('karya')
        .select(`
          id,
          anggota_id,
          kategori,
          judul,
          slug,
          foto_url,
          dibuat_pada,
          anggota (
            nama,
            rank
          )
        `)
        .order('dibuat_pada', { ascending: false })
        .range(from, textTo);

      if (error) throw error;

      const newKarya = (data as any) || [];
      
      setKaryaList((prev) => (isInitial ? newKarya : [...prev, ...newKarya]));

      if (newKarya.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Inisialisasi data awal sekali saja saat aplikasi terbuka
  useEffect(() => {
    fetchKarya(0, true);
  }, [fetchKarya]);

  // Handler klik di luar area dropdown kategori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Intersection Observer untuk Infinite Scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchKarya(nextPage, false);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [page, hasMore, loading, loadingMore, fetchKarya]);

  const daftarKategori = ['Semua', ...Array.from(new Set(karyaList.map((k) => k.kategori)))];

  const filteredKarya = karyaList.filter((karya) => {
    const matchesSearch =
      karya.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      karya.anggota?.nama.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKategori = selectedKategori === 'Semua' || karya.kategori === selectedKategori;

    return matchesSearch && matchesKategori;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pt-16">
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-50 flex items-center justify-between px-3 sm:px-12 gap-3">
        <div className="flex items-center flex-shrink-0">
          <img 
            src="/image/logo/logo.png" 
            alt="Perpustakaan Lubangsa Logo" 
            className="h-8 w-8 object-contain rounded-lg block"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className="flex-grow max-w-full">
          <input
            type="text"
            placeholder="Cari karya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border-0 rounded-full outline-none bg-slate-100 focus:bg-slate-200/80 text-sm placeholder:text-slate-400 transition"
          />
        </div>
        
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-full text-xs font-semibold text-slate-700 transition min-w-[75px] sm:min-w-[100px]"
          >
            <span className="truncate max-w-[45px] sm:max-w-[80px]">{selectedKategori}</span>
            <span className={`text-[8px] text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Pilih Kategori
              </div>
              <div className="max-h-60 overflow-y-auto no-scrollbar">
                {daftarKategori.map((kat) => (
                  <button
                    key={kat}
                    onClick={() => {
                      setSelectedKategori(kat);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                      selectedKategori === kat
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="relative w-full overflow-hidden">
        <img 
          src="/image/hero/hero.png" 
          alt="Hero Banner" 
          className="w-full h-auto object-contain block"
        />
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-12 py-6 sm:py-12">

        {loading && (
          <div className="columns-2 lg:columns-3 gap-3 sm:gap-8 items-start">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="break-inside-avoid mb-3 sm:mb-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 h-64 border border-slate-200 animate-pulse flex flex-col justify-between">
                <div>
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-5 sm:h-6 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-full mb-2" />
                </div>
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center max-w-xl mx-auto border border-rose-100 shadow-sm text-sm font-medium">
            Gagal memuat data: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredKarya.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm font-medium text-sm">
                Tidak ada karya publik yang cocok dengan pencarian Anda.
              </div>
            ) : (
              <div className="columns-2 lg:columns-3 gap-3 sm:gap-8 items-start">
                {filteredKarya.map((karya) => (
                  <Link 
                    key={karya.id} 
                    href={`/karya/${karya.slug}`}
                    className="block group break-inside-avoid mb-3 sm:mb-8"
                  >
                    <article className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-xl hover:border-slate-300/80 transition-all duration-300 flex flex-col">
                      <div className="flex flex-col">
                        {karya.foto_url && (
                          <div className="relative h-36 sm:h-64 w-full bg-slate-100 overflow-hidden flex-shrink-0">
                            <img
                              src={karya.foto_url} 
                              alt={karya.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="p-3 sm:p-6 flex flex-col">
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md uppercase tracking-wider">
                              {karya.kategori}
                            </span>
                            {karya.anggota?.rank && (
                              <span className="text-[9px] sm:text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm">
                                {karya.anggota.rank}
                              </span>
                            )}
                          </div>
                          
                          <h2 className="text-sm sm:text-lg font-bold text-slate-900 line-clamp-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                            {karya.judul}
                          </h2>
                        </div>
                      </div>
                      
                      <div className="px-3 sm:px-6 pb-3 sm:pb-5 pt-2 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-0.5 sm:gap-0 justify-between items-start sm:items-center text-[10px] sm:text-xs text-slate-400 bg-slate-50/50 flex-shrink-0">
                        <span className="truncate w-full sm:max-w-[150px]">
                          Oleh: <strong className="text-slate-700 font-semibold">{karya.anggota?.nama || 'Anonim'}</strong>
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {formatTanggal(karya.dibuat_pada)}
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        <div ref={observerTarget} className="mt-8 sm:mt-12 flex justify-center items-center min-h-[60px]">
          {loadingMore && (
            <div className="text-xs sm:text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200/60 animate-pulse">
              Memuat karya lainnya...
            </div>
          )}
          
          {!hasMore && karyaList.length > 0 && (
            <div className="text-center text-[10px] sm:text-xs font-bold tracking-wide text-slate-400 bg-slate-200/40 px-5 sm:px-6 py-2 rounded-full border border-slate-200">
              Semua karya telah dimuat.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}