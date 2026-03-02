export interface AdminQueryOptions {
  select?: string;
  eq?: Record<string, string | number | boolean>;
  lt?: Record<string, string | number | boolean>;
  lte?: Record<string, string | number | boolean>;
  gt?: Record<string, string | number | boolean>;
  gte?: Record<string, string | number | boolean>;
  in?: Record<string, string[]>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
}

const buildQueryString = (options: AdminQueryOptions = {}): string => {
  const params = new URLSearchParams();

  if (options.select) {
    params.set('select', options.select);
  }

  if (options.eq) {
    Object.entries(options.eq).forEach(([key, value]) => {
      params.set(key, `eq.${String(value)}`);
    });
  }

  if (options.lt) {
    Object.entries(options.lt).forEach(([key, value]) => {
      params.set(key, `lt.${String(value)}`);
    });
  }

  if (options.lte) {
    Object.entries(options.lte).forEach(([key, value]) => {
      params.set(key, `lte.${String(value)}`);
    });
  }

  if (options.gt) {
    Object.entries(options.gt).forEach(([key, value]) => {
      params.set(key, `gt.${String(value)}`);
    });
  }

  if (options.gte) {
    Object.entries(options.gte).forEach(([key, value]) => {
      params.set(key, `gte.${String(value)}`);
    });
  }

  if (options.in) {
    Object.entries(options.in).forEach(([key, values]) => {
      const escaped = values.map((value) => value.replace(/,/g, '')).join(',');
      params.set(key, `in.(${escaped})`);
    });
  }

  if (options.order) {
    params.set('order', `${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}`);
  }

  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

const getAdminHeaders = (): HeadersInit => {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
};

const getRestBaseUrl = (): string => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is missing');
  }

  return `${supabaseUrl}/rest/v1`;
};

export const adminSelect = async <T>(table: string, options: AdminQueryOptions = {}): Promise<T[]> => {
  const response = await fetch(`${getRestBaseUrl()}/${table}${buildQueryString(options)}`, {
    method: 'GET',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`adminSelect ${table} failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as T[];
};

export const adminInsert = async <T>(table: string, payload: Record<string, unknown>): Promise<T[]> => {
  const response = await fetch(`${getRestBaseUrl()}/${table}`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`adminInsert ${table} failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as T[];
};

export const adminUpsert = async <T>(
  table: string,
  payload: Record<string, unknown>,
  onConflict?: string,
): Promise<T[]> => {
  const headers: HeadersInit = {
    ...getAdminHeaders(),
    Prefer: 'resolution=merge-duplicates,return=representation',
  };

  const url = `${getRestBaseUrl()}/${table}${onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`adminUpsert ${table} failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as T[];
};

export const adminPatch = async <T>(
  table: string,
  payload: Record<string, unknown>,
  options: Pick<AdminQueryOptions, 'eq'>,
): Promise<T[]> => {
  const response = await fetch(`${getRestBaseUrl()}/${table}${buildQueryString({ eq: options.eq })}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`adminPatch ${table} failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as T[];
};

export const adminDelete = async <T>(
  table: string,
  options: Pick<AdminQueryOptions, 'eq' | 'in'>,
): Promise<T[]> => {
  const response = await fetch(
    `${getRestBaseUrl()}/${table}${buildQueryString({ eq: options.eq, in: options.in })}`,
    {
      method: 'DELETE',
      headers: getAdminHeaders(),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`adminDelete ${table} failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as T[];
};

export const adminRpc = async <T>(fn: string, payload: Record<string, unknown>): Promise<T[]> => {
  const response = await fetch(`${getRestBaseUrl()}/rpc/${fn}`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`adminRpc ${fn} failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as T[];
};
