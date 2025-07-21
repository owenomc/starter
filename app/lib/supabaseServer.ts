import { createClient } from '@supabase/supabase-js';

// Create a base client (anon key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Extract cookie value by name
function getCookie(cookieString: string, name: string) {
  const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Get authenticated user from a Request object (App Router API)
export async function getUserFromSupabase(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const accessToken = getCookie(cookie, 'sb-access-token');

  if (!accessToken) return null;

  const supabaseWithAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  const { data, error } = await supabaseWithAuth.auth.getUser();
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email };
}
