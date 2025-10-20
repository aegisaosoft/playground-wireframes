/**
 * Date formatting utilities for experience cards
 */

/**
 * Format date range for experience cards
 * Examples:
 * - Jan 1 - 10, 2025 (same month)
 * - Jan 20 - Feb 2, 2024 (different months, same year)
 * - Dec 25, 2024 - Jan 3, 2025 (different years)
 */
export function formatExperienceDates(startDate?: string, endDate?: string, fallbackDate?: string): string {
  // If we have both start and end dates, format them properly
  if (startDate && endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return fallbackDate || 'TBD';
      }
      
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
      const startDay = start.getDate();
      const startYear = start.getFullYear();
      
      const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
      const endDay = end.getDate();
      const endYear = end.getFullYear();
      
      // Same year
      if (startYear === endYear) {
        // Same month
        if (startMonth === endMonth) {
          return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
        }
        // Different months, same year
        else {
          return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
        }
      }
      // Different years
      else {
        return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
      }
    } catch (error) {
      console.error('Error formatting dates:', error);
      return fallbackDate || 'TBD';
    }
  }
  
  // If we only have start date
  if (startDate) {
    try {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting start date:', error);
    }
  }
  
  // If we only have end date
  if (endDate) {
    try {
      const date = new Date(endDate);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting end date:', error);
    }
  }
  
  // Fallback to provided fallback or default
  return fallbackDate || 'TBD';
}

/**
 * Format a single date for display
 */
export function formatSingleDate(dateString?: string): string {
  if (!dateString) return 'TBD';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'TBD';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'TBD';
  }
}
