import Store from "../../models/Store.js";
import { getManagerStoreOrFail } from "../../utils/storeHelpers.js";
import { sendSuccess, sendError } from "../../utils/responseHelpers.js";

/**
 * Get store operations data (status, suspension info, etc.)
 */
export const getStoreOperations = async (req, res) => {
  try {
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return;

    // Return relevant operational data
    const operationsData = {
      _id: store._id,
      name: store.name,
      isActive: store.isActive,
      isApproved: store.isApproved,
      isTemporarilyClosed: store.isTemporarilyClosed,
      temporaryCloseReason: store.temporaryCloseReason,
      isSuspended: store.isSuspended,
      suspendedAt: store.suspendedAt,
      suspendedBy: store.suspendedBy,
      suspensionReason: store.suspensionReason,
      operatingHours: store.operatingHours,
      deliverySettings: {
        minimumOrder: store.deliverySettings?.minimumOrder,
        averagePreparationTime: store.deliverySettings?.averagePreparationTime,
      },
    };

    sendSuccess(res, operationsData, "Store operations data retrieved");
  } catch (error) {
    console.error("Error fetching store operations:", error);
    sendError(res, "Failed to fetch store operations", 500, error);
  }
};

/**
 * Update temporary closure status
 */
export const updateTemporaryClosure = async (req, res) => {
  try {
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return;

    const { isTemporarilyClosed, temporaryCloseReason } = req.body;

    // Validate inputs
    if (typeof isTemporarilyClosed !== "boolean") {
      return sendError(res, "isTemporarilyClosed must be a boolean", 400);
    }

    if (isTemporarilyClosed && !temporaryCloseReason?.trim()) {
      return sendError(
        res,
        "temporaryCloseReason is required when closing the store",
        400,
      );
    }

    if (temporaryCloseReason && temporaryCloseReason.length > 300) {
      return sendError(
        res,
        "Temporary close reason cannot exceed 300 characters",
        400,
      );
    }

    // Update store
    store.isTemporarilyClosed = isTemporarilyClosed;
    store.temporaryCloseReason = isTemporarilyClosed
      ? temporaryCloseReason
      : null;

    await store.save();

    // Return updated data
    const operationsData = {
      _id: store._id,
      name: store.name,
      isActive: store.isActive,
      isApproved: store.isApproved,
      isTemporarilyClosed: store.isTemporarilyClosed,
      temporaryCloseReason: store.temporaryCloseReason,
      isSuspended: store.isSuspended,
      suspendedAt: store.suspendedAt,
      suspendedBy: store.suspendedBy,
      suspensionReason: store.suspensionReason,
      operatingHours: store.operatingHours,
      deliverySettings: {
        minimumOrder: store.deliverySettings?.minimumOrder,
        averagePreparationTime: store.deliverySettings?.averagePreparationTime,
      },
    };

    sendSuccess(
      res,
      operationsData,
      `Store ${isTemporarilyClosed ? "temporarily closed" : "reopened"} successfully`,
    );
  } catch (error) {
    console.error("Error updating temporary closure:", error);
    sendError(res, "Failed to update temporary closure status", 500, error);
  }
};
