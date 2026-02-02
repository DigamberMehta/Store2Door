import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Mail,
  Phone,
  MessageCircle,
  HelpCircle,
  Package,
  CreditCard,
  MapPin,
  Clock,
} from "lucide-react";

const HelpSupportPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      value: "support@store2doordelivery.co.za",
      action: "mailto:support@store2doordelivery.co.za",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate help",
      value: "+27 (0)21 123 4567",
      action: "tel:+27211234567",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat with us on WhatsApp",
      value: "+27 82 123 4567",
      action: "https://wa.me/27821234567",
    },
  ];

  const faqCategories = [
    {
      icon: Package,
      title: "Orders & Delivery",
      questions: [
        {
          q: "How long does delivery take?",
          a: "Most deliveries are completed within 30-60 minutes, depending on your location and the store you order from.",
        },
        {
          q: "How can I track my order?",
          a: "You can track your order in real-time from the Orders page. You'll receive notifications at each step of the delivery process.",
        },
        {
          q: "What if an item is out of stock?",
          a: "Our team will contact you if any items are unavailable and suggest alternatives or process a refund for those items.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept credit/debit cards, instant EFT, and cash on delivery for eligible orders.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, we use industry-standard encryption and secure payment gateways to protect your financial information.",
        },
        {
          q: "How do refunds work?",
          a: "Refunds are processed within 5-7 business days to your original payment method.",
        },
      ],
    },
    {
      icon: MapPin,
      title: "Delivery Areas",
      questions: [
        {
          q: "Do you deliver to my area?",
          a: "Enter your address in the app to check if we deliver to your location. We're constantly expanding our coverage.",
        },
        {
          q: "What are the delivery fees?",
          a: "Delivery fees vary based on distance and order value. You'll see the exact fee before placing your order.",
        },
      ],
    },
    {
      icon: Clock,
      title: "Account & Settings",
      questions: [
        {
          q: "How do I update my profile?",
          a: "Go to Profile > Profile Details to update your personal information, addresses, and preferences.",
        },
        {
          q: "Can I save multiple addresses?",
          a: "Yes, you can add and manage multiple delivery addresses in the Addresses section of your profile.",
        },
      ],
    },
  ];

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
          <h1 className="text-sm font-semibold tracking-tight">
            Help & Support
          </h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Contact Us Button */}
        <section className="mb-6">
          <button
            onClick={() => navigate("/contact")}
            className="w-full bg-green-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl active:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Submit a Support Ticket
          </button>
        </section>

        {/* Contact Methods */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 px-2 text-white">Contact Us</h2>
          <div className="space-y-3">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="block bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4 active:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/5 rounded-lg">
                    <method.icon className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm mb-0.5">
                      {method.title}
                    </h3>
                    <p className="text-white/50 text-xs mb-1">
                      {method.description}
                    </p>
                    <p className="text-white/70 text-sm font-medium">
                      {method.value}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4 px-2 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <category.icon className="w-4 h-4 text-white/60" />
                  <h3 className="text-white/80 font-semibold text-sm">
                    {category.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {category.questions.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <HelpCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <h4 className="text-white font-medium text-sm">
                          {faq.q}
                        </h4>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed pl-6">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Business Hours */}
        <section className="mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  Support Hours
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Monday - Friday: 8:00 AM - 8:00 PM
                  <br />
                  Saturday: 9:00 AM - 6:00 PM
                  <br />
                  Sunday: 10:00 AM - 4:00 PM
                </p>
              </div>
            </div>
            <p className="text-white/50 text-xs">
              We aim to respond to all inquiries within 24 hours during business
              hours.
            </p>
          </div>
        </section>

        {/* Still Need Help */}
        <section>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-5 text-center">
            <h3 className="text-white font-semibold text-base mb-2">
              Still need help?
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Our support team is here to assist you with any questions or
              concerns.
            </p>
            <a
              href="mailto:support@store2doordelivery.co.za"
              className="inline-block bg-green-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg active:bg-green-600 transition-all"
            >
              Email Support Team
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpSupportPage;
