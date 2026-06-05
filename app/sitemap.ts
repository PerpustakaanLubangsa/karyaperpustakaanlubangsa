import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://curly-journey-v65wjg4v6v9rcrj9-3000.app.github.dev'; // Ganti dengan domain production nanti jika sudah di-deploy

  // 1. Ambil semua slug karya dari Supabase untuk didaftarkan ke Google
  const { data: karyaList } = await supabase
    .from('karya')
    .select('slug, dibuat_pada');

  const karyaUrls = (karyaList || []).map((karya) => ({
    url: `${baseUrl}/karya/${karya.slug}`,
    lastModified: new Date(karya.dibuat_pada),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 2. Gabungkan dengan halaman utama (Beranda)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...karyaUrls,
  ];
}