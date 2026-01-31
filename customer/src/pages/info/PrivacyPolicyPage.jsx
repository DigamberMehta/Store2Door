import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Shield, Lock, ChevronLeft } from "lucide-react";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Introduction",
      content: `Store2Door ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process your personal information when you use our website, mobile application, and related services (collectively, the "Services").`,
    },
    {
      title: "2. Information We Collect",
      content:
        "We collect information you provide directly to us and information collected automatically:",
      subPoints: [
        "Account Information: Name, email address, phone number, delivery address, payment information",
        "Order Information: Purchase history, items ordered, delivery preferences, special instructions",
        "Location Data: GPS location for delivery purposes and service optimization",
        "Device Information: Device type, operating system, unique device identifiers, IP address",
        "Usage Data: Pages visited, time spent, actions taken, referring URL, browser type",
        "Communication Data: Messages, feedback, complaints, and customer service interactions",
      ],
    },
    {
      title: "3. How We Use Your Information",
      content: "We use collected information for various purposes:",
      subPoints: [
        "Processing orders and delivering products and services",
        "Communicating with you about orders, updates, and customer support",
        "Personalizing your experience and recommending products",
        "Preventing fraud and enhancing security",
        "Analyzing trends and user behavior to improve our Services",
        "Marketing and promotional communications (with your consent)",
        "Complying with legal obligations and resolving disputes",
      ],
    },
    {
      title: "4. Data Security",
      content:
        "We implement appropriate technical and organizational measures designed to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use encryption, secure servers, and regular security audits. However, no security system is impenetrable, and we cannot guarantee absolute security of your data.",
    },
    {
      title: "5. Data Sharing and Disclosure",
      content:
        "We may share your information with third parties only in the following circumstances:",
      subPoints: [
        "Service Providers: Payment processors, delivery partners, analytics providers",
        "Legal Requirements: When required by law or to protect our legal rights",
        "Business Transfers: In case of merger, acquisition, or sale of assets",
        "With Your Consent: When you explicitly authorize us to share your information",
        "Local Stores: We share necessary information with stores to fulfill your orders",
      ],
    },
    {
      title: "6. Cookies and Tracking Technologies",
      content:
        "We use cookies, web beacons, and similar tracking technologies to enhance your user experience, analyze usage patterns, and enable certain features. You can control cookie preferences through your browser settings, but disabling cookies may limit some functionality.",
    },
    {
      title: "7. Your Privacy Rights",
      content:
        "Depending on your location, you may have certain rights regarding your personal information:",
      subPoints: [
        "Right to Access: Request a copy of your personal data",
        "Right to Rectification: Correct inaccurate information",
        "Right to Erasure: Request deletion of your data (subject to legal requirements)",
        "Right to Object: Object to processing of your information for certain purposes",
        "Right to Data Portability: Receive your data in a structured, portable format",
      ],
    },
    {
      title: "8. Children's Privacy",
      content:
        "Store2Door Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will delete such information immediately.",
    },
    {
      title: "9. Third-Party Links",
      content:
        "Our Services may contain links to third-party websites and applications. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.",
    },
    {
      title: "10. Data Retention",
      content:
        "We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. The retention period may vary depending on the context and our legal obligations.",
    },
    {
      title: "11. International Data Transfers",
      content:
        "Your information may be transferred to, stored in, and processed in South Africa and other countries where our servers are located. These countries may have different data protection laws than your home country. By using Store2Door, you consent to the transfer of your information to these locations.",
    },
    {
      title: "12. Changes to This Privacy Policy",
      content:
        "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website with an updated 'Last Updated' date. Your continued use of the Services following the posting of revisions constitutes your acceptance of the changes.",
    },
    {
      title: "13. Contact Us",
      content:
        "If you have questions or concerns about our privacy practices, or if you wish to exercise your privacy rights, please contact us at support@store2doordelivery.co.za or write to us at our registered office address.",
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
            Privacy Policy
          </h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Intro Section */}
        <div className="space-y-3 mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-bold text-white">
                Your Privacy Matters
              </h3>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">
              We take your privacy seriously and are committed to being
              transparent about how we collect and use your information.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <Lock className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-bold text-white">Data Protection</h3>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">
              We implement industry-standard security measures to protect your
              personal information.
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4"
            >
              <h2 className="text-sm font-bold text-white mb-2 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {section.title}
              </h2>

              <p className="text-white/70 text-xs leading-relaxed mb-3">
                {section.content}
              </p>

              {section.subPoints && (
                <ul className="list-disc list-inside space-y-1 text-white/60 ml-3">
                  {section.subPoints.map((point, i) => (
                    <li key={i} className="text-xs">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
