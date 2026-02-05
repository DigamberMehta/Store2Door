import mongoose from "mongoose";
import { ApiError } from "./responseHelpers.js";

/**
 * Convert string to MongoDB ObjectId
 * @param {String} id - ID string
 * @returns {ObjectId}
 */
export const toObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * Check if string is valid MongoDB ObjectId
 * @param {String} id - ID string to validate
 * @returns {Boolean}
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate ObjectId and throw error if invalid
 * @param {String} id - ID to validate
 * @param {String} fieldName - Name of field for error message
 * @returns {ObjectId}
 * @throws {ApiError} If ID is invalid
 */
export const validateObjectId = (id, fieldName = "ID") => {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
  return toObjectId(id);
};

/**
 * Convert multiple IDs to ObjectIds
 * @param {Array<String>} ids - Array of ID strings
 * @returns {Array<ObjectId>}
 */
export const toObjectIds = (ids) => {
  return ids.map((id) => toObjectId(id));
};

/**
 * Validate multiple ObjectIds
 * @param {Array<String>} ids - Array of IDs to validate
 * @param {String} fieldName - Name of field for error message
 * @returns {Array<ObjectId>}
 * @throws {ApiError} If any ID is invalid
 */
export const validateObjectIds = (ids, fieldName = "IDs") => {
  const invalidIds = ids.filter((id) => !isValidObjectId(id));

  if (invalidIds.length > 0) {
    throw new ApiError(400, `Invalid ${fieldName}: ${invalidIds.join(", ")}`);
  }

  return toObjectIds(ids);
};
