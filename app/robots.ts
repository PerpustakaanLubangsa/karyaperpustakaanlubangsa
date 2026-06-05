import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://curly-journey-v65wjg4v6v9rcrj9-3000.app.github.dev'; // Sesuaikan dengan domain kamu
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Sembunyikan folder sensitif jika ada
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}