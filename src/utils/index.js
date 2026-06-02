/**
 * Creates a consistent URL for a given page name
 * @param {string} pageName - The name of the page to create URL for
 * @returns {string} The formatted URL for the page
 */
export const createPageUrl = (pageName) => {
  // Convert page name to lowercase and replace spaces with hyphens
  const formattedName = pageName.toLowerCase().replace(/\s+/g, '-');
  return `/${formattedName}`;
};

/**
 * Utility function to merge class names
 * @param {...string} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export function isAppointmentWithin30Minutes(appointment) {
  const diffMs = new Date(`${appointment.date}T${appointment.time}`) - new Date();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes <= 30;
}