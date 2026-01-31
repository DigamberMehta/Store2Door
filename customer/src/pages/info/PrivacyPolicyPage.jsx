import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Shield, Lock } from "lucide-react";
import Header from "../../components/Header";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Introduction",
      content:
        "Store2Door ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process your personal information when you use our website, mobile application, and related services (collectively, the "Services").",
    },
    {
      title: "2. Information We Collect",
      content: "We collect information you provide directly to us and information collected automatically:",
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
        'If you have questions or concerns about our privacy practices, or if you wish to exercise your privacy rights, please contact us at support@store2doordelivery.co.za or write to us at our registered office address.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-green-100">
            Last updated: January 2026
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Intro Section with Security Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-bold text-green-500">Your Privacy Matters</h3>
            </div>
            <p className="text-gray-300">
              We take your privacy seriously and are committed to being transparent about how 
              we collect and use your information. Your trust is important to us.
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-bold text-green-500">Data Protection</h3>
            </div>
            <p className="text-gray-300">
              We implement industry-leading security measures to protect your personal 
              information from unauthorized access and misuse.
            </p>
          </div>
        </div>

        {/* Main Policy Content */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-green-500 transition">
              <h2 className="text-2xl font-bold text-green-500 mb-4 flex items-start gap-2">
                <ChevronRight className="w-6 h-6 flex-shrink-0 mt-1" />
                {section.title}
              </h2>
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                {section.content}
              </p>
              {section.subPoints && (
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  {section.subPoints.map((point, i) => (
                    <li key={i} className="text-base">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Summary of Rights */}
        <div className="mt-12 bg-gray-900 rounded-lg border border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-green-500 mb-6">Summary of Your Rights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-white">Right to Know</p>
                <p className="text-sm text-gray-400">What data we collect about you</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-white">Right to Delete</p>
                <p className="text-sm text-gray-400">Request deletion of your data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-white">Right to Correct</p>
                <p className="text-sm text-gray-400">Update inaccurate information</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-white">Right to Opt-Out</p>
                <p className="text-sm text-gray-400">Control promotional communications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
          <p className="text-lg mb-6 text-white">
            We're here to help. Contact our Privacy Team with any questions or to exercise 
            your privacy rights.
          </p>
          <a
            href="mailto:privacy@store2doordelivery.co.za"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Contact Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
