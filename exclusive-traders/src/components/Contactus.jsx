// src/components/Contact.jsx
import React, { useState } from 'react';

const Contact = ({ onBackToHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // WhatsApp number (without + or spaces)
  const whatsAppNumber = "919703744571"; // Format: country code + number without +

  // Predefined message templates for different subjects
  const getWhatsAppTemplate = (subject) => {
    const templates = {
      'export-inquiry': "Hello! I'm interested in learning more about your export services. Could you please provide information about your export process and requirements?",
      'product-info': "Hello! I'd like to know more about your products. Could you please share your product catalog and pricing information?",
      'partnership': "Hello! I'm interested in exploring business partnership opportunities with Exclusive Trader. I'd like to discuss potential collaboration.",
      'support': "Hello! I need assistance with your services. Could you please help me with my query?",
      'default': "Hello! I'd like to connect with Exclusive Trader regarding your services."
    };
    return templates[subject] || templates.default;
  };

  // Handle WhatsApp chat
  const handleWhatsAppChat = (subject = 'default') => {
    const defaultMessage = getWhatsAppTemplate(subject);
    setWhatsAppMessage(defaultMessage);
    setShowWhatsAppModal(true);
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = (customMessage = null) => {
    const message = customMessage || whatsAppMessage;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, '_blank');
    setShowWhatsAppModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      <div className="container mx-auto px-4 pt-2 pb-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-secondary mb-3">
            Contact Us
          </h1>
          <p className="text-light/80 max-w-xl mx-auto">
            Get in touch for personalized agricultural export solutions
          </p>
        </div>

        {/* Main Content Grid - Equal Height Sections */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information - Same height as form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold text-secondary mb-6">
              Contact Information
            </h2>
            
            <div className="space-y-6 flex-grow">
              {/* Office Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-map-marker-alt text-blue-500"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Our Office
                  </h3>
                  <p className="text-light/70">1st Floor, 8 Quary Wharf, Abbey Road,</p>
                  <p className="text-light/70">Barking, London, IG11 7BZ.</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-phone text-secondary"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Call Us
                  </h3>
                  <p className="text-light/70">+44 20 1234 5678</p>
                  {/* WhatsApp Click to Chat - Website Theme */}
                  <button
                    onClick={() => handleWhatsAppChat()}
                    className="mt-2 text-secondary hover:text-accent text-sm flex items-center gap-2 transition-colors"
                  >
                    <i className="fab fa-whatsapp"></i>
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-envelope text-secondary"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Email
                  </h3>
                  <p className="text-light/70">fmcg@exclusivetrader.co.uk</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-clock text-secondary"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Business Hours
                  </h3>
                  <p className="text-light/70 mb-1">Mon-Fri: 6:00 AM - 8:00 PM</p>
                  <p className="text-light/70">Saturday: 9:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-light/50 text-sm">
                <i className="fas fa-info-circle text-secondary mr-2"></i>
                We typically respond within 24 hours
              </p>
            </div>
          </div>

          {/* Contact Form - Same height as contact info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold text-secondary mb-6">
              Send Us a Message on WhatsApp
            </h2>
            
            <div className="space-y-5 flex-grow">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-light font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-all"
                    placeholder="Your full name"
                  />
                </div>
                
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-light font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label className="text-light font-medium">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light focus:outline-none focus:border-secondary transition-all"
                >
                  <option value="">Select a subject</option>
                  <option value="export-inquiry">Export Inquiry</option>
                  <option value="product-info">Product Information</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>

              {/* Message Field */}
              <div className="space-y-2 flex-grow flex flex-col">
                <label className="text-light font-medium">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-all resize-none flex-grow"
                  placeholder="How can we help you?"
                  rows="5"
                />
              </div>

              {/* WhatsApp Action Button - Website Theme */}
              <button
                type="button"
                onClick={() => {
                  const subject = formData.subject || 'default';
                  const message = `*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Subject:* ${formData.subject}\n\n${formData.message || getWhatsAppTemplate(subject)}`;
                  sendWhatsAppMessage(message);
                }}
                disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
                className="w-full py-3 bg-secondary text-dark font-bold rounded-lg hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <i className="fab fa-whatsapp"></i>
                <span>Send via WhatsApp</span>
              </button>

              <p className="text-light/50 text-xs text-center mt-2">
                Your message will be sent directly to our WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="max-w-3xl mx-auto mt-10 pt-6 border-t border-white/10">
          <p className="text-center text-light/60 text-sm">
            <i className="fas fa-shield-alt text-secondary mr-2"></i>
            Your information is secure and confidential
          </p>
        </div>
      </div>

      {/* WhatsApp Message Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark border border-secondary rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
              <i className="fab fa-whatsapp text-green-500"></i>
              <span>WhatsApp Message</span>
            </h3>
            
            <p className="text-light/80 mb-4 text-sm">
              Edit your message below before sending:
            </p>
            
            <textarea
              value={whatsAppMessage}
              onChange={(e) => setWhatsAppMessage(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-light focus:outline-none focus:border-secondary mb-4"
              rows="5"
              placeholder="Type your message here..."
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => sendWhatsAppMessage()}
                className="flex-1 bg-secondary text-dark font-bold py-2 rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <i className="fab fa-whatsapp"></i>
                <span>Send</span>
              </button>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1 bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;