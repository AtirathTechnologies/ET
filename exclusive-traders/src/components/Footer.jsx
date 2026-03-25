// Footer.jsx
import { useNavigate } from 'react-router-dom';
import logo from '../assets/ExclusiveTraderLogo.svg';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Small delay to ensure scroll happens before navigation
    setTimeout(() => {
      if (path === 'home') {
        navigate('/');
      } else {
        navigate(`/${path}`);
      }
    }, 10);
  };

  return (
    <footer className="bg-primary text-white py-8 md:py-10 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="footer-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Logo & Description Section */}
          <div className="footer-section">
            <div className="footer-logo mb-3">
              <div className="logo flex items-center gap-2">
                <img 
                  src={logo} 
                  alt="Exclusive Traders Logo" 
                  className="h-7 sm:h-8 w-auto object-contain"
                />
                <span className="logo-text text-base sm:text-lg font-bold font-serif">
                  Exclusive <span className="text-secondary font-serif">Trader</span>
                </span>
              </div>
            </div>
            <p className="mb-3 text-xs sm:text-sm break-words">
              Innovating logistics with AI and blockchain since 2025.
            </p>
            
            {/* Social Media Icons */}
            <div className="social-icons flex gap-2 mt-3 flex-wrap">
              <a 
                href="https://www.facebook.com/profile.php?id=61583972735457"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon flex-shrink-0"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-xs"></i>
              </a>
              <a 
                href="https://x.com/exclusive52584"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon flex-shrink-0"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-xs"></i>
              </a>
              <a 
                href="https://www.linkedin.com/company/exclusive-trader/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon flex-shrink-0"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in text-xs"></i>
              </a>
              <a 
                href="https://www.instagram.com/exclusive_trader_london/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon flex-shrink-0"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-xs"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links Section */}
          <div className="footer-section">
            <h3 className="text-secondary text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-shadow-black">
              Quick Links
            </h3>
            <ul className="list-none space-y-1 sm:space-y-2">
              {[
                { label: 'Home', path: 'home' },
                { label: 'Services', path: 'services' },
                { label: 'Industries', path: 'industries' },
                { label: 'About ', path: 'about' },
                { label: 'Feedback', path: 'feedback' },
                { label: 'Contactus', path: 'contact' },
              ].map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className="text-white text-xs sm:text-sm transition-colors duration-300 hover:text-secondary text-left w-full py-1"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services Section */}
          <div className="footer-section">
            <h3 className="text-secondary text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-shadow-black">
              Services
            </h3>
            <ul className="list-none space-y-1 sm:space-y-2">
              {[
                'AI-Optimized Shipping',
                'Smart Warehousing',
                'Blockchain Inventory',
                'Automated Customs',
                'Supply Chain AI'
              ].map((service) => (
                <li key={service}>
                  <span className="text-white text-xs sm:text-sm transition-colors duration-300 hover:text-secondary cursor-default block py-1">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Section - FIXED TEXT OVERFLOW */}
          <div id="contact" className="footer-section">
            <h3 className="text-secondary text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-shadow-black">
              Contact Us
            </h3>
            <ul className="list-none space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt text-secondary mt-0.5 flex-shrink-0 text-xs"></i> 
                <span className="text-white text-xs sm:text-sm break-words leading-relaxed">
                  1st Floor, 8 Quary Wharf, Abbey Road,<br className="hidden sm:block" />
                  Barking, London, IG11 7BZ.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone text-secondary flex-shrink-0 text-xs"></i> 
                <span className="text-white text-xs sm:text-sm break-all">
                  +44 20 1234 5678 
                </span>
              </li>
              
              <li className="flex items-start gap-2">
                <i className="fas fa-envelope text-secondary mt-0.5 flex-shrink-0 text-xs"></i> 
                <span className="text-white text-xs sm:text-sm break-all">
                  fmcg@exclusivetrader.co.uk
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="copyright text-center pt-4 md:pt-5 border-t border-white/10 mt-6">
          <p className="text-xs text-white/80">
            &copy; 2025 Exclusive Traders. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;