import axios from "axios";

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.apiUrl = "https://api.paystack.co";

    if (!this.secretKey) {
      console.warn("⚠️ PAYSTACK_SECRET_KEY is missing in environment variables!");
    } else {
      console.log("✅ Paystack Service initialized");
    }

    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Initialize a transaction
   * @param {Object} transactionData - Transaction details
   * @returns {Promise<Object>} - Transaction response
   */
  async initializeTransaction(transactionData) {
    try {
      const payload = {
        email: transactionData.email,
        amount: Math.round(transactionData.amount * 100), // Convert to kobo (smallest currency unit)
        currency: transactionData.currency || "ZAR",
        reference: transactionData.reference || this.generateReference(),
        callback_url: transactionData.callback_url,
        metadata: transactionData.metadata || {},
        channels: ["card"], // Only allow card payments to skip method selection page
      };

      const response = await this.api.post("/transaction/initialize", payload);

      return {
        success: true,
        reference: response.data.data.reference,
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "Paystack initialize transaction error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Verify a transaction
   * @param {String} reference - Transaction reference
   * @returns {Promise<Object>} - Verification response
   */
  async verifyTransaction(reference) {
    try {
      const response = await this.api.get(`/transaction/verify/${reference}`);

      return {
        success: true,
        status: response.data.data.status,
        amount: response.data.data.amount / 100, // Convert from kobo to main currency
        currency: response.data.data.currency,
        reference: response.data.data.reference,
        paid_at: response.data.data.paid_at,
        channel: response.data.data.channel,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "Paystack verify transaction error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Create a refund for a transaction
   * @param {String} reference - Transaction reference
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} - Refund response
   */
  async createRefund(reference, refundData = {}) {
    try {
      const payload = {
        transaction: reference,
        amount: refundData.amount ? Math.round(refundData.amount * 100) : undefined, // Partial refund if amount specified
        currency: refundData.currency || "ZAR",
        customer_note: refundData.reason || "Refund requested by customer",
        merchant_note: refundData.merchantNote || "Refund processed",
      };

      const response = await this.api.post("/refund", payload);

      return {
        success: true,
        refundId: response.data.data.id,
        status: response.data.data.status,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "Paystack create refund error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Get transaction details
   * @param {String} transactionId - Transaction ID
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransaction(transactionId) {
    try {
      const response = await this.api.get(`/transaction/${transactionId}`);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "Paystack get transaction error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * List all transactions
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Transactions list
   */
  async listTransactions(options = {}) {
    try {
      const params = {
        perPage: options.perPage || 50,
        page: options.page || 1,
        status: options.status,
        customer: options.customer,
        from: options.from,
        to: options.to,
      };

      const response = await this.api.get("/transaction", { params });

      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error(
        "Paystack list transactions error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Charge authorization (for recurring payments)
   * @param {Object} chargeData - Charge details
   * @returns {Promise<Object>} - Charge response
   */
  async chargeAuthorization(chargeData) {
    try {
      const payload = {
        email: chargeData.email,
        amount: Math.round(chargeData.amount * 100),
        authorization_code: chargeData.authorization_code,
        reference: chargeData.reference || this.generateReference(),
        currency: chargeData.currency || "ZAR",
        metadata: chargeData.metadata || {},
      };

      const response = await this.api.post("/transaction/charge_authorization", payload);

      return {
        success: true,
        reference: response.data.data.reference,
        status: response.data.data.status,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "Paystack charge authorization error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Generate a unique reference for transactions
   * @returns {String} - Unique reference
   */
  generateReference() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Verify webhook signature
   * @param {Object} payload - Webhook payload
   * @param {String} signature - Webhook signature from headers
   * @returns {Boolean} - True if signature is valid
   */
  verifyWebhookSignature(payload, signature) {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(JSON.stringify(payload))
      .digest("hex");
    return hash === signature;
  }
}

// Export singleton instance
const paystackService = new PaystackService();
export default paystackService;
