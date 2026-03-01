import { jsonResponse } from './cors.ts';

interface AuthSuccess {
  ok: true;
  userId: string;
}

interface AuthFailure {
  ok: false;
  response: Response;
}

export type AuthResult = AuthSuccess | AuthFailure;

const unauthorized = (message = 'Invalid or missing auth token'): AuthFailure => ({
  ok: false,
  response: jsonResponse({ error: 'unauthorized', message }, 401),
});

export const requireAuthenticatedUser = async (req: Request): Promise<AuthResult> => {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized();
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return unauthorized();
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    return unauthorized('Supabase auth environment is not configured');
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return unauthorized();
    }

    const user = await response.json();
    const userId = typeof user?.id === 'string' ? user.id : '';
    if (!userId) {
      return unauthorized();
    }

    return {
      ok: true,
      userId,
    };
  } catch {
    return unauthorized('Unable to validate auth token');
  }
};
