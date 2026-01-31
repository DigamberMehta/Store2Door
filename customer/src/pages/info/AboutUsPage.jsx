import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Clock, Shield, Leaf } from "lucide-react";
import Header from "../../components/Header";

const AboutUsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Store2Door
          </h1>
          <p className="text-xl text-green-100">
            Revolutionizing grocery and essentials delivery in South Africa
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission Section */}
        <section className="mb-12">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-3xl font-bold mb-4 text-green-500">
              Our Mission
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              Store2Door is dedicated to making grocery shopping and essentials
              delivery convenient, affordable, and accessible to everyone in
              South Africa. We connect customers with local stores, providing
              fast and reliable delivery services right to their doorstep.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Our vision is to become the most trusted online grocery platform,
              supporting local businesses while empowering customers with choice
              and convenience.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Why Choose Store2Door?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-500 transition">
              <div className="flex items-start gap-4">
                <Truck className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-gray-400">
                    Quick and reliable delivery service with real-time tracking
                    so you always know where your order is.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-500 transition">
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    24/7 Availability
                  </h3>
                  <p className="text-gray-400">
                    Shop anytime, anywhere. Our platform is available round the
                    clock for your convenience.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-500 transition">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
                  <p className="text-gray-400">
                    Your data is protected with advanced encryption. Safe
                    payment options and verified merchants.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-500 transition">
              <div className="flex items-start gap-4">
                <Leaf className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Supporting Local
                  </h3>
                  <p className="text-gray-400">
                    We partner with local businesses and communities to
                    strengthen the South African economy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-12">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-green-500">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
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
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-green-500">
                Reliability
              </h3>
              <p className="text-gray-400">
                We keep our promises. When you order with Store2Door, you can
                count on us to deliver on time, every time.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-green-500">
                Customer First
              </h3>
              <p className="text-gray-400">
                Your satisfaction is our priority. We listen to feedback and
                continuously improve our service.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-green-500">
                Innovation
              </h3>
              <p className="text-gray-400">
                We embrace technology to make shopping better. Constantly
                evolving to meet your needs.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience Store2Door?
          </h2>
          <p className="text-lg mb-6 text-white">
            Start shopping with us today and discover the convenience of online
            grocery delivery.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Shopping
          </button>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
