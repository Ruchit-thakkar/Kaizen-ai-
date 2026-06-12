/**
 * Custom light-weight cookie parser for Socket.IO handshake headers.
 * Avoids bringing in external parsing packages in performance-sensitive contexts.
 * @param {string} cookieString - Raw cookie header string
 * @returns {Object} Parsed cookie key-value pairs
 */
export const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  
  return cookieString
    .split(';')
    .reduce((cookies, item) => {
      const parts = item.split('=');
      const name = parts[0].trim();
      if (name) {
        // Handle values containing '='
        cookies[name] = parts.slice(1).join('=').trim();
      }
      return cookies;
    }, {});
};
