/**
 * escapeRegex – sanitize user input for safe use in MongoDB $regex queries.
 * Prevents ReDoS (Regular Expression Denial of Service) attacks.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
