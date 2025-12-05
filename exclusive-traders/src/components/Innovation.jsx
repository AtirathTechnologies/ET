// src/components/Innovation.jsx
import { useEffect, useRef } from 'react';

const Innovation = ({ onBackToHome }) => {
  const sectionRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="innovation" ref={sectionRef} className="py-20 bg-dark overflow-hidden min-h-screen">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-secondary hover:text-accent transition-colors duration-300 font-inter font-semibold"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>
        </div>

        {/* Company Vision & Innovation Message */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-6 text-shadow-neon font-inter">
            Vision & Innovation
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-light mb-6 leading-relaxed font-inter">
              At <span className="text-secondary font-semibold">Exclusive Traders</span>, innovation drives everything we do.
              From sourcing premium-quality products to adopting modern trading practices, we constantly evolve to meet global standards.
            </p>
            <p className="text-xl text-light mb-8 leading-relaxed font-inter">
              Our mission is to make import and export smarter, faster, and more sustainable through technology, transparency, and trust.
              Discover how we combine tradition with innovation to bring excellence to every deal we make.
            </p>
          </div>
        </div>

        {/* Technological Edge */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-accent mb-12 font-inter">
            Our Technological Edge
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "fas fa-satellite",
                title: "Digital Tracking",
                description: "Real-time shipment updates with complete visibility across the supply chain"
              },
              {
                icon: "fas fa-robot",
                title: "Smart Logistics",
                description: "AI-based route and cost optimization for maximum efficiency"
              },
              {
                icon: "fas fa-award",
                title: "Quality Assurance",
                description: "Advanced testing and rigorous sourcing standards"
              },
              {
                icon: "fas fa-leaf",
                title: "Sustainability",
                description: "Eco-friendly packaging and ethical sourcing practices"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="innovation-card group text-center p-6 rounded-lg transition-all duration-500 hover:transform hover:scale-105"
              >
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent transition-colors duration-300">
                  <i className={`${feature.icon} text-dark text-2xl`}></i>
                </div>
                <h4 className="text-xl font-bold text-secondary mb-3 group-hover:text-accent transition-colors duration-300 font-inter">
                  {feature.title}
                </h4>
                <p className="text-light leading-relaxed font-inter">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Storytelling Section */}
        <div className="bg-white/5 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-secondary mb-6 font-inter">
              From Source to Destination
            </h3>
            <p className="text-lg text-light mb-6 leading-relaxed font-inter">
              From the farms and factories to your hands — our journey is powered by innovation.
              At <span className="text-secondary font-semibold">Exclusive Traders</span>, we blend heritage with modern thinking.
            </p>
            <p className="text-lg text-light mb-8 leading-relaxed font-inter">
              Whether it's exporting the finest rice or importing cutting-edge gadgets, our goal is the same:
              To deliver quality through creativity, ensuring every transaction reflects our commitment to excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                "Blockchain Verification",
                "AI-Powered Analytics",
                "Smart Contracts",
                "Real-time Monitoring"
              ].map((tech, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-medium border border-secondary/30 font-inter"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Innovation Process */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center text-accent mb-12 font-inter">
            Our Innovation Process
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Research & Development",
                description: "Continuous exploration of emerging technologies and market trends"
              },
              {
                step: "02",
                title: "Implementation",
                description: "Strategic integration of innovative solutions into our operations"
              },
              {
                step: "03",
                title: "Optimization",
                description: "Constant refinement and improvement based on performance data"
              }
            ].map((process, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-lg bg-white/5 border border-white/10 hover:border-secondary/50 transition-all duration-300"
              >
                <div className="text-4xl font-bold text-secondary mb-4 opacity-60 font-inter">
                  {process.step}
                </div>
                <h4 className="text-xl font-bold text-light mb-3 font-inter">
                  {process.title}
                </h4>
                <p className="text-light leading-relaxed font-inter">
                  {process.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Innovation;