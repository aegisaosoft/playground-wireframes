/**
 * Utility functions for masking sensitive account information
 */

/**
 * Mask a Stripe account ID with asterisks
 * Shows first 4 and last 4 characters, masks the middle with 8 asterisks
 * @param accountId - The Stripe account ID to mask
 * @returns Masked account ID string
 */
export function maskStripeAccountId(accountId: string): string {
  if (!accountId || accountId.length < 8) {
    return '********'; // Return 8 asterisks if account ID is too short
  }

  if (accountId.length <= 16) {
    // For shorter IDs, show first 2 and last 2 characters
    const first = accountId.substring(0, 2);
    const last = accountId.substring(accountId.length - 2);
    return `${first}********${last}`;
  }

  // For longer IDs, show first 4 and last 4 characters
  const first = accountId.substring(0, 4);
  const last = accountId.substring(accountId.length - 4);
  return `${first}********${last}`;
}

/**
 * Check if a string is a masked account ID
 * @param str - String to check
 * @returns True if the string appears to be masked
 */
export function isMaskedAccountId(str: string): boolean {
  return str.includes('********');
}

/**
 * Get the display format for a Stripe account ID
 * If the account ID is already masked, return it as-is
 * Otherwise, mask it
 * @param accountId - The account ID to display
 * @returns Properly formatted account ID for display
 */
export function getDisplayAccountId(accountId: string): string {
  if (!accountId) {
    return '';
  }

  if (isMaskedAccountId(accountId)) {
    return accountId;
  }

  return maskStripeAccountId(accountId);
}
