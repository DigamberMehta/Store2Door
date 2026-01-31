import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Clock, Shield, Leaf, ChevronLeft } from "lucide-react";

const AboutUsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <h1 className="text-sm font-semibold tracking-tight">About Us</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Mission Section */}
        <section className="mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-6">
            <h2 className="text-xl font-bold mb-3 text-white">Our Mission</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-3">
              Store2Door is dedicated to making grocery shopping and essentials
              delivery convenient, affordable, and accessible to everyone in
              South Africa. We connect customers with local stores, providing
              fast and reliable delivery services right to their doorstep.
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              Our vision is to become the most trusted online grocery platform,
              supporting local businesses while empowering customers with choice
              and convenience.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4 px-2 text-white">
            Why Choose Store2Door?
          </h2>
          <div className="space-y-3">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-white">
                    Fast Delivery
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Quick and reliable delivery service with real-time tracking
                    so you always know where your order is.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-white">
                    24/7 Availability
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Shop anytime, anywhere. Our platform is available round the
                    clock for your convenience.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-white">
                    Secure & Safe
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Your data is protected with advanced encryption. Safe
                    payment options and verified merchants.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-white">
                    Supporting Local
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    We partner with local businesses and communities to
                    strengthen the South African economy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Our Story</h2>
            <div className="space-y-3 text-white/70 text-sm leading-relaxed">
              <p>
                Store2Door was founded with a simple idea: make online grocery
                shopping accessible and convenient for all South Africans. We
                recognized the need for a reliable platform that connects
                customers with trusted local stores.
              </p>
              <p>
                Starting small, we've grown to serve thousands of customers
                across South Africa, partnering with local grocery stores,
                convenience shops, and specialty retailers. Our team is
                committed to delivering excellence in every order.
              </p>
              <p>
                Today, Store2Door continues to innovate and expand, bringing the
                latest technology and customer service standards to the online
                grocery space.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4 px-2 text-white">Our Values</h2>
          <div className="space-y-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
              <h3 className="text-sm font-semibold mb-2 text-green-500">
                Reliability
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                We keep our promises. When you order with Store2Door, you can
                count on us to deliver on time, every time.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
              <h3 className="text-sm font-semibold mb-2 text-green-500">
                Customer First
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Your satisfaction is our priority. We listen to feedback and
                continuously improve our service.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
              <h3 className="text-sm font-semibold mb-2 text-green-500">
                Innovation
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                We embrace technology to make shopping better. Constantly
                evolving to meet your needs.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-6 text-center">
          <h2 className="text-lg font-bold mb-3 text-white">
            Ready to Experience Store2Door?
          </h2>
          <p className="text-sm mb-4 text-white/70">
            Start shopping with us today and discover the convenience of online
            grocery delivery.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold active:bg-green-700 transition"
          >
            Start Shopping
          </button>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
