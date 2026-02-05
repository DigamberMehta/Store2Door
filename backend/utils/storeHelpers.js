import Store from "../models/Store.js";

/**
 * Get store by manager ID
 * @param {String} managerId - Manager's user ID
 * @param {String} selectFields - Fields to select (optional)
 * @returns {Promise<Store|null>}
 */
export const getManagerStore = async (managerId, selectFields = null) => {
  const query = Store.findOne({ managerId });
  if (selectFields) {
    query.select(selectFields);
  }
  return await query;
};

/**
 * Get store by manager ID or throw 404 error
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} selectFields - Fields to select (optional)
 * @returns {Promise<Store>}
 * @throws Will return 404 response if store not found
 */
export const getManagerStoreOrFail = async (req, res, selectFields = null) => {
  const store = await getManagerStore(req.user._id, selectFields);

  if (!store) {
    res.status(404).json({
      success: false,
      message: "Store not found for this manager",
    });
    return null;
  }

  return store;
};

/**
 * Middleware to attach store to request object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const attachManagerStore = async (req, res, next) => {
  try {
    const store = await Store.findOne({ managerId: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found for this manager",
      });
    }

    req.store = store;
    req.storeId = store._id;
    next();
  } catch (error) {
    next(error);
  }
};
