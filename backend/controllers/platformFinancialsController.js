import PlatformFinancials from "../models/PlatformFinancials.js";

/**
 * Get platform financials
 * @route GET /api/platform/financials
 */
export const getPlatformFinancials = async (req, res) => {
  try {
    const financials = await PlatformFinancials.getActive();

    res.json({
      success: true,
      data: financials,
    });
  } catch (error) {
    console.error("Get platform financials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve platform financials",
      error: error.message,
    });
  }
};

/**
 * Get platform financials summary
 * @route GET /api/platform/financials/summary
 */
export const getFinancialsSummary = async (req, res) => {
  try {
    const financials = await PlatformFinancials.getActive();

    const summary = {
      revenue: {
        total: financials.totalRevenue,
        commission: financials.totalCommission,
        storePayouts: financials.totalStorePayouts,
        deliveryFees: financials.totalDeliveryFees,
        tips: financials.totalTips,
      },
      orders: {
        total: financials.completedOrders + financials.cancelledOrders,
        completed: financials.completedOrders,
        cancelled: financials.cancelledOrders,
        completionRate: financials.completionRate,
      },
      metrics: {
        averageOrderValue: financials.averageOrderValue,
        netProfit: financials.netProfit,
        totalDiscounts: financials.totalDiscounts,
      },
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get financials summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve financials summary",
      error: error.message,
    });
  }
};

/**
 * Reset platform financials (Admin only - use with caution)
 * @route POST /api/platform/financials/reset
 */
export const resetPlatformFinancials = async (req, res) => {
  try {
    const financials = await PlatformFinancials.getActive();

    // Reset all counters to 0
    financials.totalOrders = 0;
    financials.completedOrders = 0;
    financials.cancelledOrders = 0;
    financials.totalRevenue = 0;
    financials.totalCommission = 0;
    financials.totalStorePayouts = 0;
    financials.totalDeliveryFees = 0;
    financials.totalTips = 0;
    financials.totalDiscounts = 0;

    await financials.save();

    res.json({
      success: true,
      message: "Platform financials reset successfully",
      data: financials,
    });
  } catch (error) {
    console.error("Reset platform financials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset platform financials",
      error: error.message,
    });
  }
};
