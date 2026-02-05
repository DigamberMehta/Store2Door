/**
 * Extract and parse pagination parameters from request query
 * @param {Object} query - Express request query object
 * @param {Number} defaultLimit - Default limit value (default: 20)
 * @returns {Object} - { page, limit, skip }
 */
export const getPaginationParams = (query, defaultLimit = 20) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || defaultLimit;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create paginated response object
 * @param {Array} data - Result data
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - Response with pagination metadata
 */
export const createPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: totalPages,
      hasMore: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Create pagination metadata only
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: totalPages,
    hasMore: page < totalPages,
    hasPrev: page > 1,
  };
};
