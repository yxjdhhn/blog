import { getSearchItems } from '@/utils/search';

export const prerender = true;

export async function GET() {
  const items = await getSearchItems('en');

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
