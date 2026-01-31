import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../../components/Header";

const TermsOfServicePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using Store2Door, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      title: "2. Use License",
      content:
        "Permission is granted to temporarily download one copy of the materials (information or software) on Store2Door for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:",
      subPoints: [
        "Modify or copy the materials",
        "Use the materials for any commercial purpose or for any public display",
        "Attempt to decompile or reverse engineer any software contained on Store2Door",
        "Remove any copyright or other proprietary notations from the materials",
        "Transfer the materials to another person or 'mirror' the materials on any other server",
      ],
    },
    {
      title: "3. Disclaimer",
      content:
        "The materials on Store2Door are provided on an 'as is' basis. Store2Door makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
    },
    {
      title: "4. Limitations",
      content:
        "In no event shall Store2Door or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Store2Door, even if Store2Door or an authorized representative has been notified orally or in writing of the possibility of such damage.",
    },
    {
      title: "5. Accuracy of Materials",
      content:
        "The materials appearing on Store2Door could include technical, typographical, or photographic errors. Store2Door does not warrant that any of the materials on its website are accurate, complete, or current. Store2Door may make changes to the materials contained on its website at any time without notice.",
    },
    {
      title: "6. Links",
      content:
        "Store2Door has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Store2Door of the site. Use of any such linked website is at the user's own risk.",
    },
    {
      title: "7. Modifications",
      content:
        "Store2Door may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
    },
    {
      title: "8. Governing Law",
      content:
        "These terms and conditions are governed by and construed in accordance with the laws of South Africa, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
    },
    {
      title: "9. User Accounts",
      content:
        "If you create an account on Store2Door, you are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.",
    },
    {
      title: "10. Product Information",
      content:
        "We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content of any Store2Door store or materials available through Store2Door are accurate, complete, reliable, current, or error-free. If a product offered by Store2Door is not as described, your sole remedy is to return it in unused condition.",
    },
    {
      title: "11. Payment Terms",
      content:
        "All payments must be completed through our secure payment system. By providing payment information, you represent and warrant that you are authorized to make such payment. Store2Door is not responsible for any unauthorized charges made to your account.",
    },
    {
      title: "12. Delivery Terms",
      content:
        "Delivery times are estimates only. Store2Door is not liable for delays in delivery caused by circumstances beyond our reasonable control. Customers are responsible for ensuring someone is available to receive deliveries.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-green-100">Last updated: January 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8">
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Welcome to Store2Door. These Terms of Service ("Terms") govern your
            use of our website, mobile application, and services. Please read
            them carefully before using our platform.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            If you have any questions about these terms, please contact us at
            <span className="text-green-500 font-semibold">
              {" "}
              support@store2doordelivery.co.za
            </span>
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-green-500 transition"
            >
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

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-lg mb-6 text-white">
            If you have any questions or concerns about these Terms of Service,
            please don't hesitate to reach out to us.
          </p>
          <a
            href="mailto:support@store2doordelivery.co.za"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
