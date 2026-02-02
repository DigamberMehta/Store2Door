import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { uploadImage } from "../../services/upload";

const ContactUsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [issue, setIssue] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/support/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issue.trim()) {
      setError("Please describe your issue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = null;

      // Upload image if selected
      if (image) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(image);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          setError("Failed to upload image. Submitting without image...");
          // Continue anyway
        }
        setUploadingImage(false);
      }

      // Get selected order and product details
      const order = orders.find((o) => o._id === selectedOrder);
      const productName = selectedProduct
        ? order?.items.find((item) => item.name === selectedProduct)?.name
        : null;

      // Submit support ticket
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/support/ticket`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: selectedOrder || null,
            productName,
            issue: issue.trim(),
            imageUrl,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Reset form
        setSelectedOrder("");
        setSelectedProduct("");
        setIssue("");
        setImage(null);
        setImagePreview(null);

        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setError(data.message || "Failed to submit ticket");
      }
    } catch (err) {
      console.error("Error submitting ticket:", err);
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedOrderData = orders.find((o) => o._id === selectedOrder);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">Contact Us</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-4 mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <div>
            <p className="text-green-500 font-medium text-sm">
              Ticket submitted successfully!
            </p>
            <p className="text-green-500/70 text-xs mt-0.5">
              We'll get back to you soon.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Info Box */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <p className="text-white/70 text-sm leading-relaxed">
            Having an issue with your order or need help? Fill out the form
            below and our support team will get back to you as soon as possible.
          </p>
        </div>

        {/* Order Selection */}
        <div className="relative">
          <label className="block text-white/90 font-medium text-sm mb-2">
            Select Order (Optional)
          </label>
          {ordersLoading ? (
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white/50" />
            </div>
          ) : (
            <>
              {/* Selected Order Display / Trigger */}
              <button
                type="button"
                onClick={() => setOrderDropdownOpen(!orderDropdownOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors flex items-center justify-between"
              >
                {selectedOrder ? (
                  <div className="flex items-center gap-3 flex-1">
                    {orders.find((o) => o._id === selectedOrder)?.items[0]
                      ?.image?.url ? (
                      <img
                        src={
                          orders.find((o) => o._id === selectedOrder)?.items[0]
                            ?.image?.url
                        }
                        alt="Order"
                        className="w-10 h-10 object-cover rounded-lg border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-white font-medium text-sm">
                        #
                        {
                          orders.find((o) => o._id === selectedOrder)
                            ?.orderNumber
                        }
                      </div>
                      <p className="text-white/60 text-xs truncate">
                        {
                          orders.find((o) => o._id === selectedOrder)?.items[0]
                            ?.name
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-white/50">No specific order</span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-white/50 transition-transform shrink-0 ml-2 ${
                    orderDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Options */}
              {orderDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder("");
                      setSelectedProduct("");
                      setOrderDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-white text-sm hover:bg-white/5 transition-colors border-b border-white/5 ${
                      selectedOrder === "" ? "bg-white/5" : ""
                    }`}
                  >
                    No specific order
                  </button>
                  {orders.map((order) => (
                    <button
                      key={order._id}
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order._id);
                        setSelectedProduct("");
                        setOrderDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${
                        selectedOrder === order._id ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {order.items[0]?.image?.url ? (
                          <img
                            src={order.items[0].image.url}
                            alt={order.items[0].name}
                            className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                            <ImageIcon className="w-6 h-6 text-white/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-sm">
                              #{order.orderNumber}
                            </span>
                            <span className="text-white/50 text-xs">
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-white/60 text-xs truncate">
                            {order.items[0]?.name}
                            {order.items.length > 1 &&
                              ` +${order.items.length - 1} more`}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Product Selection */}
        {selectedOrder && selectedOrderData && (
          <div>
            <label className="block text-white/90 font-medium text-sm mb-2">
              Select Product (Optional)
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors"
            >
              <option value="">General order issue</option>
              {selectedOrderData.items.map((item, idx) => (
                <option key={idx} value={item.name}>
                  {item.name} (x{item.quantity})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Issue Description */}
        <div>
          <label className="block text-white/90 font-medium text-sm mb-2">
            Describe Your Issue <span className="text-red-500">*</span>
          </label>
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Please describe the problem you're experiencing..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors resize-none"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-white/90 font-medium text-sm mb-2">
            Attach Image (Optional)
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl border border-white/10"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full active:bg-black/80 transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <ImageIcon className="w-8 h-8 text-white/50 mb-2" />
              <span className="text-white/50 text-sm">Tap to upload image</span>
              <span className="text-white/30 text-xs mt-1">Max size: 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploadingImage || !issue.trim()}
          className="w-full bg-green-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl active:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading || uploadingImage ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadingImage ? "Uploading image..." : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactUsPage;
