// src/components/JoinUs.jsx
import React, { useState } from 'react';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    interestType: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // WhatsApp phone number (replace with your actual business number)
  const whatsappNumber = ' 97037 44571'; // Replace with your actual WhatsApp business number
  const whatsappCountryCode = '91'; // Replace with your country code

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.interestType) {
      newErrors.interestType = 'Please select your interest type';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters long';
    }
    
    return newErrors;
  };

  const sendToWhatsApp = () => {
    // Format the message for WhatsApp
    const message = `New Join Us Application\n\n` +
                   `Name: ${formData.fullName}\n` +
                   `Email: ${formData.email}\n` +
                   `Company: ${formData.companyName || 'Not provided'}\n` +
                   `Interest: ${formData.interestType}\n` +
                   `Message: ${formData.message}\n\n` +
                   `Application submitted on: ${new Date().toLocaleString()}`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${whatsappCountryCode}${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      
      return;
    }
    
    // If validation passes, proceed with submission
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      console.log('Form submitted:', formData);
      
      // Send to WhatsApp
      sendToWhatsApp();
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        companyName: '',
        interestType: '',
        message: ''
      });
      setErrors({});
      setIsSubmitting(false);
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Auto-close popup after 10 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 10000);
    }, 1000);
  };

  const isFormComplete = () => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      formData.interestType &&
      formData.message.trim()
    );
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <div className="min-h-screen bg-dark text-light py-8 px-4 professional-section relative">
      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-green-700/50 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl animate-slide-up">
            <div className="text-center">
              {/* Success Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-4xl text-green-400"></i>
                  </div>
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping"></div>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-green-300 mb-3">
                Application Submitted!
              </h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-light text-lg">
                  Thank you for your interest in joining Exclusive Trader!
                </p>
                
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-clock text-green-400 mt-1"></i>
                    <div className="text-left">
                      <h4 className="font-semibold text-green-300">Response Time</h4>
                      <p className="text-green-200 text-sm">
                        Our team will contact you within <span className="font-bold">24 hours</span> via email or WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fab fa-whatsapp text-green-400 mt-1 text-xl"></i>
                    <div className="text-left">
                      <h4 className="font-semibold text-blue-300">WhatsApp Notification</h4>
                      <p className="text-blue-200 text-sm">
                        Your application details have been sent to our WhatsApp business number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closePopup}
                  className="flex-1 px-6 py-3 bg-secondary text-dark font-semibold rounded-lg hover:bg-accent transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => {
                    closePopup();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 text-light font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Back to Top
                </button>
              </div>
              
              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="professional-heading text-secondary text-shadow-black">
            Join Our Global Trading Network
          </h1>
          <p className="professional-body max-w-3xl mx-auto mt-4">
            Become part of Exclusive Trader's worldwide network of suppliers, buyers, 
            and trade professionals. Together, we're shaping the future of global commerce.
          </p>
        </div>

        {/* Partnership & Buyer Cards - Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Supplier Partnerships */}
          <div className="innovation-feature-card animate-fade-in-up flex flex-col h-full">
            <div className="text-center mb-6">
              <i className="fas fa-handshake text-5xl text-secondary mb-4"></i>
              <h2 className="text-2xl font-bold text-light mb-4">Supplier Partnerships</h2>
            </div>
            
            <div className="space-y-4 flex-grow">
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Quality Assurance</h3>
                  <p className="text-gray-300 text-sm">Join our network of verified suppliers with proven quality standards</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Global Reach</h3>
                  <p className="text-gray-300 text-sm">Access international markets through our established distribution channels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Fair Pricing</h3>
                  <p className="text-gray-300 text-sm">Competitive pricing models that benefit both suppliers and buyers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Logistics Support</h3>
                  <p className="text-gray-300 text-sm">Comprehensive shipping and customs clearance assistance</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center pt-4">
              <button className="text-2xl text-secondary mb-2 text-shadow-black">
                Apply as Supplier
              </button>
            </div>
          </div>

          {/* Buyer Network */}
          <div className="innovation-feature-card animate-fade-in-up flex flex-col h-full">
            <div className="text-center mb-6">
              <i className="fas fa-shopping-cart text-5xl text-secondary mb-4"></i>
              <h2 className="text-2xl font-bold text-light mb-4">Buyer Network</h2>
            </div>
            
            <div className="space-y-4 flex-grow">
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Verified Products</h3>
                  <p className="text-gray-300 text-sm">Access certified products from trusted suppliers worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Bulk Discounts</h3>
                  <p className="text-gray-300 text-sm">Special pricing for volume purchases and long-term contracts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Quality Guarantee</h3>
                  <p className="text-gray-300 text-sm">Product quality assurance and satisfaction guarantees</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check text-secondary mt-1 flex-shrink-0"></i>
                <div>
                  <h3 className="font-semibold text-light">Supply Chain Management</h3>
                  <p className="text-gray-300 text-sm">End-to-end supply chain visibility and management</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center pt-4">
              <button className="text-2xl text-secondary mb-4 text-shadow-black">
                Join as Buyer
              </button>
            </div>
          </div>
        </div>
        {/* Contact Form */}
        <div className="innovation-feature-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary mb-4">Get In Touch</h2>
            <p className="text-gray-300">
              Ready to join our network? Contact us to discuss partnership opportunities
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-light mb-2 text-sm md:text-base font-medium">
                  Full Name *
                </label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-light focus:outline-none transition-colors placeholder-gray-400 placeholder-opacity-80 placeholder:text-base md:placeholder:text-sm ${
                    errors.fullName ? 'border-red-500' : 'border-white/20 focus:border-secondary'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-light mb-2 text-sm md:text-base font-medium">
                  Email Address *
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-light focus:outline-none transition-colors placeholder-gray-400 placeholder-opacity-80 placeholder:text-base md:placeholder:text-sm ${
                    errors.email ? 'border-red-500' : 'border-white/20 focus:border-secondary'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-light mb-2 text-sm md:text-base font-medium">
                  Company Name
                </label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors placeholder-gray-400 placeholder-opacity-80 placeholder:text-base md:placeholder:text-sm"
                  placeholder="Enter your company name"
                />
              </div>
              <div>
                <label className="block text-light mb-2 text-sm md:text-base font-medium">
                  Interest Type *
                </label>
                <select 
                  name="interestType"
                  value={formData.interestType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-light focus:outline-none transition-colors appearance-none ${
                    errors.interestType ? 'border-red-500' : 'border-white/20 focus:border-secondary'
                  }`}
                  required
                  defaultValue=""
                >
                  <option value="" disabled className="text-gray-400 bg-dark">Select your interest</option>
                  <option value="supplier" className="text-light bg-dark">Supplier Partnership</option>
                  <option value="buyer" className="text-light bg-dark">Buyer Network</option>
                  <option value="career" className="text-light bg-dark">Career Opportunity</option>
                  <option value="other" className="text-light bg-dark">Other</option>
                </select>
                {errors.interestType && (
                  <p className="mt-1 text-sm text-red-400">{errors.interestType}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-light mb-2 text-sm md:text-base font-medium">
                Message *
              </label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-light focus:outline-none transition-colors resize-vertical placeholder-gray-400 placeholder-opacity-80 placeholder:text-base md:placeholder:text-sm ${
                  errors.message ? 'border-red-500' : 'border-white/20 focus:border-secondary'
                }`}
                placeholder="Tell us about your requirements or interests..."
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-400">{errors.message}</p>
              )}
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">
                  Minimum 10 characters
                </span>
                <span className={`text-xs ${
                  formData.message.length >= 10 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {formData.message.length}/10
                </span>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <button 
                type="submit"
                disabled={isSubmitting || !isFormComplete()}
                className={`btn px-8 py-3 w-full max-w-xs mx-auto text-base font-semibold transition-all duration-300 ${
                  isSubmitting || !isFormComplete()
                    ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                    : 'bg-secondary text-dark hover:bg-accent hover:scale-105 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
              
              {!isFormComplete() && !isSubmitting && (
                <p className="mt-3 text-sm text-yellow-400">
                  Please fill all required fields (*) to submit the form
                </p>
              )}
            </div>
            
            {/* WhatsApp Info */}
            <div className="text-center pt-6 border-t border-gray-700">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <i className="fab fa-whatsapp text-green-400"></i>
                <span>Form submission will also send notification to our WhatsApp business account</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Global CSS for placeholder styling */}
      <style jsx global>{`
        /* Make placeholders clearly visible on all devices */
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af !important; /* gray-400 - Light and visible */
          opacity: 0.8 !important;
        }
        
        /* Firefox */
        input::-moz-placeholder,
        textarea::-moz-placeholder {
          color: #9ca3af !important;
          opacity: 0.8 !important;
        }
        
        /* Internet Explorer 10-11 */
        input:-ms-input-placeholder,
        textarea:-ms-input-placeholder {
          color: #9ca3af !important;
          opacity: 0.8 !important;
        }
        
        /* Microsoft Edge */
        input::-ms-input-placeholder,
        textarea::-ms-input-placeholder {
          color: #9ca3af !important;
          opacity: 0.8 !important;
        }
        
        /* Safari and Chrome */
        input::-webkit-input-placeholder,
        textarea::-webkit-input-placeholder {
          color: #9ca3af !important;
          opacity: 0.8 !important;
        }
        
        /* iOS Safari - Prevent zoom and ensure visibility */
        @media (max-width: 768px) {
          input, textarea, select {
            font-size: 16px !important; /* Prevents auto-zoom on iOS */
          }
          
          input::placeholder,
          textarea::placeholder,
          select:invalid {
            font-size: 16px !important;
            color: #9ca3af !important;
          }
        }
        
        /* Make form inputs more touch-friendly on mobile */
        @media (max-width: 640px) {
          .innovation-feature-card {
            padding: 1.5rem !important;
          }
          
          input, textarea, select {
            padding: 0.75rem 1rem !important;
            min-height: 48px !important; /* Better touch target */
          }
          
          textarea {
            min-height: 120px !important;
          }
        }
        
        /* Select dropdown styling */
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem !important;
        }
        
        /* Dark mode select options */
        select option {
          background-color: #1f2937; /* dark */
          color: #f3f4f6; /* light */
        }
        
        select option:disabled {
          color: #9ca3af; /* gray-400 */
        }
        
        /* Ensure all text is visible in inputs */
        input, textarea, select {
          color: #f3f4f6 !important; /* light text */
        }
        
        /* Focus states */
        input:focus, textarea:focus, select:focus {
          border-color: #16a34a !important; /* secondary color */
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1) !important;
          outline: none !important;
        }
        
        /* Error states */
        input.error, textarea.error, select.error {
          border-color: #ef4444 !important; /* red-500 */
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        /* Animation classes */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default JoinUs;