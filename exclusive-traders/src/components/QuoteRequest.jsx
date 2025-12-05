// src/components/QuoteRequest.jsx
import { useState } from 'react';

const QuoteRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    requirements: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    alert('Thank you! Your request has been sent.');
    setFormData({ name: '', email: '', industry: '', requirements: '' });
  };

  return (
    <section id="quote-request" className="py-20 bg-gradient-to-b from-white to-cyan-50">
      <div className="container mx-auto px-6 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Get a Custom Quote
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         text-black placeholder-gray-500 bg-white"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         text-black placeholder-gray-500 bg-white"
              placeholder="abc@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         text-black placeholder-gray-500 bg-white"
              placeholder="e.g., Electronics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={5}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         text-black placeholder-gray-500 bg-white resize-none"
              placeholder="Describe your needs..."
            />
          </div>

          <div className="text-center pt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-emerald-400 
                         text-black font-bold text-lg rounded-full shadow-lg 
                         hover:shadow-xl hover:scale-105 transition"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default QuoteRequest;