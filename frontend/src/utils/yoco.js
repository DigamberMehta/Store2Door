/**
 * Load Yoco Inline SDK script
 */
export const loadYocoSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.YocoSDK) {
      resolve(window.YocoSDK);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = "https://js.yoco.com/sdk/v1/yoco-sdk-web.js";
    script.async = true;

    script.onload = () => {
      if (window.YocoSDK) {
        resolve(window.YocoSDK);
      } else {
        reject(new Error("Yoco SDK failed to load"));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Yoco SDK script"));
    };

    document.head.appendChild(script);
  });
};

/**
 * Initialize Yoco SDK
 */
export const initializeYoco = async (publicKey) => {
  try {
    const YocoSDK = await loadYocoSDK();
    const yoco = new YocoSDK({
      publicKey: publicKey || import.meta.env.VITE_YOCO_PUBLIC_KEY,
    });
    return yoco;
  } catch (error) {
    console.error("Failed to initialize Yoco:", error);
    throw error;
  }
};

/**
 * Create payment popup for card payment
 */
export const createYocoPopup = async (
  amount,
  currency = "ZAR",
  metadata = {},
) => {
  try {
    const yoco = await initializeYoco();

    return new Promise((resolve, reject) => {
      yoco.showPopup({
        amountInCents: Math.round(amount * 100),
        currency,
        name: "Store2Door",
        description: metadata.description || "Order Payment",
        metadata,
        callback: function (result) {
          if (result.error) {
            const errorMessage = result.error.message || "Payment failed";
            reject(new Error(errorMessage));
          } else {
            resolve(result);
          }
        },
      });
    });
  } catch (error) {
    console.error("Yoco popup error:", error);
    throw error;
  }
};

/**
 * Create inline payment form
 */
export const createInlinePayment = async (containerId, options = {}) => {
  try {
    const yoco = await initializeYoco();

    const paymentOptions = {
      currency: options.currency || "ZAR",
      ...options,
    };

    yoco.inline({
      target: `#${containerId}`,
      ...paymentOptions,
    });

    return yoco;
  } catch (error) {
    console.error("Yoco inline payment error:", error);
    throw error;
  }
};

/**
 * Format amount to cents
 */
export const formatAmountToCents = (amount) => {
  return Math.round(amount * 100);
};

/**
 * Format amount from cents
 */
export const formatAmountFromCents = (amountInCents) => {
  return amountInCents / 100;
};
