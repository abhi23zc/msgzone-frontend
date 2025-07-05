"use client";
import React, { useState } from "react";
import {
  Search,
  MessageCircle,
  Users,
  Settings,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

interface Category {
  value: string;
  label: string;
}

type SubmitStatus = "success" | "error" | null;

const MsgZoneHelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const faqs: FAQ[] = [
    {
      id: 1,
      question: "How do I set up MsgZone for the first time?",
      answer:
        "To set up MsgZone, first create the account and you can activate your free tier. Connect your WhatsApp account by scanning the QR code, then import your contact lists. You'll be ready to send messages within minutes.",
    },
    {
      id: 2,
      question: "What are the message limits for bulk sending?",
      answer:
        "MsgZone respects WhatsApp's terms of service. We recommend sending bulk messages with some delay to avoid account restrictions. Premium users can access advanced scheduling features.",
    },
    {
      id: 3,
      question: "How do I import contacts from Excel files?",
      answer:
        "Go to Send > Upload Contacts > Select XLSX file. Ensure your XLSX has column 'Mobile No'. The system will automatically format phone numbers.",
    },
    {
      id: 4,
      question: "Can I schedule messages for later?",
      answer:
        "Yes! Premium users can schedule messages up to 30 days in advance. Simply select your contacts, compose your message, and choose the desired date and time.",
    },
    {
      id: 5,
      question: "Is my data secure with MsgZone?",
      answer:
        "Absolutely. We use end-to-end encryption for all data transmission. Your contact lists and messages are stored locally on your device and never uploaded to our servers.",
    },
    {
      id: 6,
      question: "How do I upgrade to Premium?",
      answer:
        "Click on the 'Plans' button in the platform, choose your preferred plan, and complete the payment. Premium features will be activated immediately.",
    },
  ];

  const categories: Category[] = [
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "features", label: "Feature Requests" },
    { value: "bug", label: "Bug Reports" },
    { value: "general", label: "General Inquiry" },
  ];

  const sendMail = async () => {
    const res = await fetch("/api/sendEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    return data;
  };

  const handleSubmit = async (): Promise<void> => {
    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.category ||
      !formData.message
    ) {
      alert("Please fill in all required fields");
      return;
    }
    sendMail();
    setIsSubmitting(true);

    try {
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      console.error("Error opening email client:", error);
      setSubmitStatus("error");
      alert("There was an error opening your email client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleFaqToggle = (faqId: number): void => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How can we help you today?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Find answers to common questions or get in touch with our support
            team
          </p>

          {/* Search Bar
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div> */}
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Watch Video
            </h3>
            <p className="text-gray-600 mb-4">
              Learn how to set up MsgZone and send your first bulk message in
              minutes.
            </p>
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Watch Video →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Management
            </h3>
            <p className="text-gray-600 mb-4">
              Organize your contacts, import from Excel or Text, and manage your
              devices effectively.
            </p>
            <a
              href="#"
              className="text-purple-600 hover:text-purple-700 font-medium"
            ></a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Safety Guidelines
            </h3>
            <p className="text-gray-600 mb-4">
              Learn best practices and security measures to protect your account
              and optimize message delivery.
            </p>
            <a
              href="#"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Watch Video →
            </a>
          </div>
        </div>
      </section>

 

      {/* Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-xl text-gray-600">
              Send us a message and we'll get back to you within 24 hours
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-green-800">
                  Your message has been sent successfully! We'll get back to you
                  soon.
                </span>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-red-800">
                  There was an error sending your message. Please try again.
                </span>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Please describe your issue or question in detail..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

           {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Quick answers to common questions about MsgZone
          </p>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => handleFaqToggle(faq.id)}
                type="button"
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>
                {expandedFaq === faq.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      

      {/* Contact Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Other ways to reach us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email Support
              </h3>
              <p className="text-gray-600">webifyit.in@gmail.com</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Phone Support
              </h3>
              <p className="text-gray-600">+91 94736 34215 </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Support Hours
              </h3>
              <p className="text-gray-600">24x7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">MsgZone</h3>
              </div>
              <p className="text-gray-400">
                The ultimate WhatsApp bulk messaging solution for businesses and
                marketers.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MsgZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MsgZoneHelpCenter;
