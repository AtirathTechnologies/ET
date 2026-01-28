// src/components/Contact.jsx
import React, { useState } from 'react';

const Contact = ({ onBackToHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Message sent successfully! We\'ll contact you soon.');
    
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      <div className="container mx-auto px-4 py-8">
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
                  <p className="text-light/70">1st Floor, 8 Quary Wharf, Abbey Road,
                    Barking, London, IG11 7BZ.</p>
                  <p className="text-light/70"></p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-phone text-green-500"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Call Us
                  </h3>
                  <p className="text-light/70">+44 20 1234 5678</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-envelope text-red-500"></i>
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
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-clock text-yellow-500"></i>
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
              Send Us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-secondary to-accent text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
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
    </div>
  );
};

export default Contact;