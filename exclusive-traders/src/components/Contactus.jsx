// src/components/Contact.jsx
import React, { useState } from 'react';

const Contact = ({ onBackToHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Visit Our Office',
      details: ['123 Trade Center', 'Mumbai, Maharashtra 400001', 'India'],
      color: 'text-blue-400'
    },
    {
      icon: 'fas fa-phone',
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 98765 43211'],
      color: 'text-green-400'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email Us',
      details: ['info@exclusivetraders.com', 'support@exclusivetraders.com'],
      color: 'text-red-400'
    },
    {
      icon: 'fas fa-clock',
      title: 'Business Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM'],
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={onBackToHome}
            className="mb-6 flex items-center gap-2 text-secondary hover:text-accent transition-colors mx-auto"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>
          
          <h1 className="text-5xl font-bold text-secondary mb-4">
            Get In Touch
          </h1>
          <p className="text-light text-xl max-w-2xl mx-auto">
            Ready to start your agricultural export journey? Contact us today for personalized solutions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-secondary mb-8">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-info-card">
                  <div className="flex items-start gap-4">
                    <div className={`text-2xl ${info.color}`}>
                      <i className={info.icon}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-secondary mb-2">
                        {info.title}
                      </h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-light mb-1">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="contact-info-card mt-8">
              <h3 className="text-xl font-semibold text-secondary mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: 'fab fa-linkedin', color: 'hover:text-blue-400', label: 'LinkedIn' },
                  { icon: 'fab fa-twitter', color: 'hover:text-blue-300', label: 'Twitter' },
                  { icon: 'fab fa-facebook', color: 'hover:text-blue-600', label: 'Facebook' },
                  { icon: 'fab fa-instagram', color: 'hover:text-pink-500', label: 'Instagram' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`text-2xl text-light ${social.color} transition-colors duration-300`}
                    title={social.label}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="contact-form">
              <h2 className="text-3xl font-bold text-secondary mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-light mb-2 font-semibold">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-light mb-2 font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-light mb-2 font-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-light mb-2 font-semibold">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-light mb-2 font-semibold">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light focus:outline-none focus:border-secondary transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="export-inquiry">Export Inquiry</option>
                    <option value="product-information">Product Information</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="support">Customer Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-light mb-2 font-semibold">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-light placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors resize-none"
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full btn bg-secondary text-dark hover:bg-accent py-4 text-lg font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="contact-info-card">
            <h3 className="text-2xl font-bold text-secondary mb-6 text-center">Find Us Here</h3>
            <div className="bg-gray-800 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-map-marked-alt text-4xl text-secondary mb-4"></i>
                <p className="text-light">Interactive Map Would Be Displayed Here</p>
                <p className="text-gray-400 text-sm mt-2">Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;