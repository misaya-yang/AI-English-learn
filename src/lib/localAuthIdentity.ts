export const LOCAL_AUTH_USER_ID_PREFIX = '00000000-0000-4000-8000-';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeSeed = (value: string): string => value.trim().toLowerCase() || 'local-user';

const hashToTwelveHex = (seed: string): string => {
  let primary = 0x811c9dc5;
  let secondary = 0x9e3779b9;

  for (let index = 0; index < seed.length; index += 1) {
    const code = seed.charCodeAt(index);
    primary ^= code;
    primary = Math.imul(primary, 0x01000193);
    secondary ^= code + index;
    secondary = Math.imul(secondary, 0x85ebca6b);
  }

  return `${(primary >>> 0).toString(16).padStart(8, '0')}${(secondary >>> 0)
    .toString(16)
    .padStart(8, '0')}`.slice(0, 12);
};

export function buildLocalAuthUserId(email: string): string {
  return `${LOCAL_AUTH_USER_ID_PREFIX}${hashToTwelveHex(normalizeSeed(email))}`;
}

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function isLocalAuthUserId(userId: string): boolean {
  return userId.startsWith(LOCAL_AUTH_USER_ID_PREFIX) && isUuid(userId);
}
