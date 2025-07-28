/**
 * Enterprise Domain Safety Service
 * Type-safe domain operations with null/undefined protection
 * Implements enterprise validation patterns for data integrity
 */

export class DomainSafetyService {
  /**
   * Safely performs operations on string arrays with null/undefined protection
   * @param array - Potentially unsafe array
   * @param operation - Operation to perform on each valid string
   * @param defaultValue - Default return value if array is invalid
   * @returns Array of operation results
   */
  static safeStringArrayOperation<T>(
    array: unknown, 
    operation: (item: string) => T,
    defaultValue: T[] = []
  ): T[] {
    if (!Array.isArray(array)) {
      return defaultValue;
    }
    
    return array
      .filter((item): item is string => typeof item === 'string' && item != null && item.trim().length > 0)
      .map(operation);
  }

  /**
   * Safely checks if a string includes a search term
   * @param str - Potentially unsafe string
   * @param searchTerm - Term to search for
   * @returns Boolean indicating if string contains search term
   */
  static safeStringIncludes(str: unknown, searchTerm: string): boolean {
    if (typeof str !== 'string' || str == null) {
      return false;
    }
    return str.toLowerCase().includes(searchTerm.toLowerCase());
  }

  /**
   * Safely accesses nested object properties with fallback
   * @param obj - Object to access
   * @param path - Property path (e.g., 'domainSpecificData.styleClassification')
   * @param fallback - Fallback value if path doesn't exist
   * @returns Property value or fallback
   */
  static safePropertyAccess<T>(obj: any, path: string, fallback: T): T {
    if (!obj || typeof obj !== 'object') {
      return fallback;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null || typeof current !== 'object' || !(key in current)) {
        return fallback;
      }
      current = current[key];
    }

    return current ?? fallback;
  }

  /**
   * Validates and sanitizes style classification arrays
   * @param styles - Potentially unsafe style array
   * @returns Sanitized string array
   */
  static sanitizeStyleClassification(styles: unknown): string[] {
    if (!Array.isArray(styles)) {
      return [];
    }
    
    return styles
      .filter((style): style is string => 
        typeof style === 'string' && 
        style != null && 
        style.trim().length > 0
      )
      .map(style => style.trim());
  }

  /**
   * Enterprise-grade array filtering with safety checks
   * @param array - Array to filter
   * @param predicate - Filter predicate function
   * @returns Safely filtered array
   */
  static safeArrayFilter<T>(array: unknown, predicate: (item: T) => boolean): T[] {
    if (!Array.isArray(array)) {
      return [];
    }
    
    return array.filter((item): item is T => {
      try {
        return item != null && predicate(item);
      } catch (error) {
        console.warn('Safe array filter predicate error:', error);
        return false;
      }
    });
  }
}