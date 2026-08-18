export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const isPlaceholder =
    !secret ||
    secret === 'luminastudio-dev-secret' ||
    secret === 'replace-me-in-production';

  if (process.env.NODE_ENV === 'production' && isPlaceholder) {
    throw new Error('JWT_SECRET must be set to a strong value in production');
  }

  return secret || 'luminastudio-dev-secret';
}
