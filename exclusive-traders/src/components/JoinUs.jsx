// src/components/JoinUs.jsx
import React from 'react';

const JoinUs = () => {
  return (
    <div className="min-h-screen bg-dark text-light py-8 px-4 professional-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="professional-heading text-secondary text-shadow-neon">
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
              <button className="btn bg-secondary text-dark hover:bg-accent w-full max-w-xs mx-auto">
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
              <button className="btn bg-secondary text-dark hover:bg-accent w-full max-w-xs mx-auto">
                Join as Buyer
              </button>
            </div>
          </div>
        </div>

        {/* Career Opportunities - Equal Height Cards */}
        <div className="innovation-feature-card p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary mb-4">Career Opportunities</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Join our team of international trade experts and grow your career in global commerce
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trade Specialists */}
            <div className="bg-white/5 rounded-lg p-6 text-center flex flex-col h-full">
              <i className="fas fa-chart-line text-3xl text-secondary mb-4"></i>
              <h3 className="text-xl font-semibold text-light mb-3">Trade Specialists</h3>
              <p className="text-gray-300 text-sm mb-4 flex-grow">
                Experts in international trade regulations, customs, and market analysis
              </p>
              <div className="mt-auto pt-4">
                <button className="text-secondary hover:text-accent text-sm font-medium">
                  View Positions →
                </button>
              </div>
            </div>
            
            {/* Logistics Coordinators */}
            <div className="bg-white/5 rounded-lg p-6 text-center flex flex-col h-full">
              <i className="fas fa-globe text-3xl text-secondary mb-4"></i>
              <h3 className="text-xl font-semibold text-light mb-3">Logistics Coordinators</h3>
              <p className="text-gray-300 text-sm mb-4 flex-grow">
                Manage global shipping, customs clearance, and supply chain operations
              </p>
              <div className="mt-auto pt-4">
                <button className="text-secondary hover:text-accent text-sm font-medium">
                  View Positions →
                </button>
              </div>
            </div>
            
            {/* Client Relations */}
            <div className="bg-white/5 rounded-lg p-6 text-center flex flex-col h-full">
              <i className="fas fa-users text-3xl text-secondary mb-4"></i>
              <h3 className="text-xl font-semibold text-light mb-3">Client Relations</h3>
              <p className="text-gray-300 text-sm mb-4 flex-grow">
                Build and maintain relationships with international clients and partners
              </p>
              <div className="mt-auto pt-4">
                <button className="text-secondary hover:text-accent text-sm font-medium">
                  View Positions →
                </button>
              </div>
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
          
          <form className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-light mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-light mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-light mb-2">Company Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-light mb-2">Interest Type</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors">
                  <option value="">Select your interest</option>
                  <option value="supplier">Supplier Partnership</option>
                  <option value="buyer">Buyer Network</option>
                  <option value="career">Career Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-light mb-2">Message</label>
              <textarea 
                rows="4"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors resize-vertical"
                placeholder="Tell us about your requirements or interests..."
              ></textarea>
            </div>
            
            <div className="text-center pt-4">
              <button type="submit" className="btn bg-secondary text-dark hover:bg-accent px-8 py-3 w-full max-w-xs mx-auto">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinUs;