import logo from '../assets/logo.png'

const Footer = ({ navigateToSection }) => {
  return (
    <footer className="bg-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="footer-content grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="footer-section">
            <div className="footer-logo mb-4">
              <div className="logo flex items-center gap-4">
                <img 
                  src={logo} 
                  alt="Exclusive Traders Logo" 
                  className="h-10 w-auto object-contain"
                />
                <span className="logo-text text-xl font-bold">
                  Exclusive <span className="text-secondary">Traders</span>
                </span>
              </div>
            </div>
            <p className="mb-4">Innovating logistics with AI and blockchain since 2010.</p>
            
            {/* UPDATED SOCIAL MEDIA SECTION WITH ACTUAL LINKS */}
            <div className="social-icons flex gap-4 mt-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61583972735457"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="https://x.com/exclusive52584"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a 
                href="https://www.linkedin.com/company/110183309"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a 
                href="https://www.instagram.com/exclusive_trader_london/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:shadow-neon"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="text-secondary text-xl font-semibold mb-6 text-shadow-neon">Quick Links</h3>
            <ul className="list-none">
              <li className="mb-3"><a href="#" onClick={() => navigateToSection('hero')} className="text-white no-underline transition-colors duration-300 hover:text-secondary">Home</a></li>
              <li className="mb-3"><a href="#" onClick={() => navigateToSection('services')} className="text-white no-underline transition-colors duration-300 hover:text-secondary">Services</a></li>
              <li className="mb-3"><a href="#" onClick={() => navigateToSection('industries')} className="text-white no-underline transition-colors duration-300 hover:text-secondary">Industries</a></li>
              <li className="mb-3"><a href="#" onClick={() => navigateToSection('about')} className="text-white no-underline transition-colors duration-300 hover:text-secondary">About Us</a></li>
              <li className="mb-3"><a href="#" onClick={() => navigateToSection('quote-request')} className="text-white no-underline transition-colors duration-300 hover:text-secondary">Feedback</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="text-secondary text-xl font-semibold mb-6 text-shadow-neon">Services</h3>
            <ul className="list-none">
              <li className="mb-3"><a href="#" className="text-white no-underline transition-colors duration-300 hover:text-secondary">AI-Optimized Shipping</a></li>
              <li className="mb-3"><a href="#" className="text-white no-underline transition-colors duration-300 hover:text-secondary">Smart Warehousing</a></li>
              <li className="mb-3"><a href="#" className="text-white no-underline transition-colors duration-300 hover:text-secondary">Blockchain Inventory</a></li>
              <li className="mb-3"><a href="#" className="text-white no-underline transition-colors duration-300 hover:text-secondary">Automated Customs</a></li>
              <li className="mb-3"><a href="#" className="text-white no-underline transition-colors duration-300 hover:text-secondary">Supply Chain AI</a></li>
            </ul>
          </div>
          
          {/* Contact Section with ID for header navigation */}
          <div id="contact" className="footer-section">
            <h3 className="text-secondary text-xl font-semibold mb-6 text-shadow-neon">Contact Us</h3>
            <ul className="list-none">
              <li className="mb-3 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-secondary"></i> 
                1st Floor, 8 Quary Wharf, Abbey Road, Barking, London, IG11 7BZ.
              </li>
              <li className="mb-3 flex items-center gap-2">
                <i className="fas fa-phone text-secondary"></i> 
                +44 20 1234 5678,7396007479
              </li>
              <li className="mb-3 flex items-center gap-2">
                <i className="fas fa-envelope text-secondary"></i> 
               Fmcg@exclusivetrader.co.uk
              </li>
              <li className="mb-3 flex items-center gap-2">
                <i className="fas fa-clock text-secondary"></i> 
                Mon - Fri: 9:00 AM - 6:00 PM
              </li>
            </ul>
          </div>
        </div>
        
        <div className="copyright text-center pt-8 border-t border-white/10">
          <p>&copy; 2025 Exclusive Traders. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;