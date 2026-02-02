import axios from "axios";

class YocoService {
  constructor() {
    this.secretKey = process.env.YOCO_SECRET_KEY;
    this.publicKey = process.env.YOCO_PUBLIC_KEY;
    this.apiUrl = "https://payments.yoco.com/api";
    this.webhookSecret = process.env.YOCO_WEBHOOK_SECRET;

    if (!this.secretKey) {
      console.warn("⚠️ YOCO_SECRET_KEY is missing in environment variables!");
    } else {
      
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
   * Create a checkout session for payment (NEW API)
   */
  async createCheckout(checkoutData) {
    try {
      const payload = {
        amount: Math.round(checkoutData.amount * 100),
        currency: checkoutData.currency || "ZAR",
        successUrl: checkoutData.successUrl,
        cancelUrl: checkoutData.cancelUrl,
        failureUrl: checkoutData.failureUrl,
      };

      if (checkoutData.metadata) {
        payload.metadata = checkoutData.metadata;
      }

      const response = await this.api.post("/checkouts", payload);

      return {
        success: true,
        checkoutId: response.data.id,
        redirectUrl: response.data.redirectUrl,
        status: response.data.status,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Yoco create checkout error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Get checkout status (NEW API)
   */
  async getCheckout(checkoutId) {
    try {
      const response = await this.api.get(`/checkouts/${checkoutId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Yoco get checkout error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(checkoutId, refundData) {
    try {
      const response = await this.api.post(
        `/checkouts/${checkoutId}/refund`,
        {
          amount: Math.round(refundData.amount * 100),
          reason: refundData.reason || "Customer refund request",
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Yoco create refund error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Get refund details
   */
  async getRefund(chargeId, refundId) {
    try {
      const response = await this.api.get(
        `/charges/${chargeId}/refunds/${refundId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Yoco get refund error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * List all refunds for a charge
   */
  async listRefunds(chargeId) {
    try {
      const response = await this.api.get(`/charges/${chargeId}/refunds`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Yoco list refunds error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || { message: error.message },
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const crypto = require("crypto");

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payload)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  formatAmount(amount) {
    return Math.round(amount * 100);
  }

  parseAmount(amountInCents) {
    return amountInCents / 100;
  }
}

// Singleton instance
const yocoService = new YocoService();
export default yocoService;
