/**
 * Utility functions for string operations
 */

/**
 * Splits a string by the project includes delimiter (~!@#$%^&)
 * @param includes - The includes string to split
 * @returns Array of trimmed strings, filtered to remove empty strings
 */
export function splitIncludes(includes?: string | null): string[] {
  if (!includes) return [];
  
  const delimiter = '~!@#$%^&';
  
  return includes
    .split(delimiter)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Joins an array of strings using the project includes delimiter (~!@#$%^&)
 * @param items - Array of strings to join
 * @returns Joined string with delimiter
 */
export function joinIncludes(items: string[]): string {
  if (!items || items.length === 0) return '';
  
  const delimiter = '~!@#$%^&';
  return items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(delimiter);
}

