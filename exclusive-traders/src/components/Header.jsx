// src/components/Header.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = ({
  navigateToPage,
  currentUser,
  onSignOut,
  isMobileMenuOpen,
  toggleMobileMenu,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();

  // Get current page from URL path
  const getCurrentPageFromPath = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/home') return 'home';
    if (path === '/services') return 'services';
    if (path === '/about') return 'about';
    if (path === '/industries') return 'industries';
    if (path === '/quote-request') return 'quote-request';
    if (path === '/blog') return 'blog';
    if (path === '/join-us') return 'join-us';
    if (path === '/contact') return 'contact';
    if (path === '/leadership') return 'leadership';
    if (path === '/signin') return 'signin';
    if (path === '/signup') return 'signup';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/orders') return 'orders';
    if (path === '/settings') return 'settings';
    return 'home'; // default
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileDropdown && !e.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Improved scroll detection to update active section
  useEffect(() => {
    const handleScroll = () => {
      // If we're specifically on home page and near top, force home active
      if (location.pathname === '/' || location.pathname === '/home') {
        const scrollPosition = window.scrollY;
        if (scrollPosition < 100) {
          setActiveSection('home');
          return;
        }
      }

      const sections = [
        { id: 'home', element: document.getElementById('home') },
        { id: 'services', element: document.getElementById('services') },
        { id: 'about', element: document.getElementById('about') },
        { id: 'industries', element: document.getElementById('industries') },
        { id: 'leadership', element: document.getElementById('leadership') },
        { id: 'quote-request', element: document.getElementById('quote-request') },
        { id: 'blog', element: document.getElementById('blog') },
        { id: 'join-us', element: document.getElementById('join-us') },
        { id: 'contact', element: document.getElementById('contact') }
      ].filter(section => section.element !== null);

      // If no sections found with IDs, use URL-based highlighting
      if (sections.length === 0) {
        setActiveSection(getCurrentPageFromPath());
        return;
      }

      const scrollPosition = window.scrollY + 100;
      let currentActive = activeSection;
      let minDistance = Infinity;

      // Find which section is closest to the top of viewport
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          // Calculate distance from top of viewport
          const distanceFromTop = Math.abs(elementTop - scrollPosition);

          // Check if element is in viewport and closer than previous sections
          if (distanceFromTop < minDistance) {
            minDistance = distanceFromTop;
            currentActive = section.id;
          }
        }
      }

      // Update only if changed
      if (currentActive !== activeSection) {
        setActiveSection(currentActive);
      }
    };

    // Throttled scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Initial check
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [activeSection, location.pathname]);

  // Set active section based on URL when location changes
  useEffect(() => {
    const currentPage = getCurrentPageFromPath();

    // If we're navigating to home, always set active section to home immediately
    if (currentPage === 'home') {
      setActiveSection('home');
      // Scroll to top when navigating to home
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentPage !== activeSection) {
      setActiveSection(currentPage);
    }
  }, [location.pathname]);

  // ---------- USER PROFILE HANDLERS ----------
  const handleSignOutClick = (e) => {
    e.preventDefault();
    onSignOut();
    setShowProfileDropdown(false);
    toggleMobileMenu(false);
  };

  const handleProfileDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Handle navigation with auto-scroll
  const handleNavClick = (page, e) => {
    if (e) e.preventDefault();

    // Always set active section immediately when clicking a nav item
    setActiveSection(page);

    // If clicking home and we're already on home, scroll to top
    if (page === 'home' && (location.pathname === '/' || location.pathname === '/home')) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      navigateToPage(page);

      // Auto-scroll to section after a small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(page);
        if (element) {
          const headerHeight = 80; // Adjust based on your header height
          const elementPosition = element.offsetTop - headerHeight;

          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        } else {
          // If section not found, scroll to top
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  // ---------- ACTIVE STYLE HELPERS ----------
  const isActivePage = (page) =>
    activeSection === page
      ? "text-secondary text-shadow-neon font-bold scale-105 transition-all duration-200"
      : "text-light hover:text-secondary hover:text-shadow-neon transition-all duration-200";

  const isMobileActivePage = (page) =>
    activeSection === page
      ? "bg-secondary/20 text-secondary font-bold border-l-4 border-secondary"
      : "text-light hover:bg-primary/50 hover:text-secondary";

  // ---------- USER INFO ----------
  const getUserInitials = () => {
    if (!currentUser) return "US";
    if (currentUser.displayName) {
      return currentUser.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser.email?.substring(0, 2).toUpperCase() || "US";
  };

  const getUserDisplayName = () => {
    if (!currentUser) return "";
    return currentUser.displayName || currentUser.email?.split('@')[0] || "User";
  };

  return (
    <header className="bg-primary/90 text-light py-4 sticky top-0 z-50 shadow-neon backdrop-blur-sm w-full">
      <div className="w-full flex justify-between items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-4">
          <img
            src={logo}
            alt="Logo"
            className="h-10 md:h-12 w-auto object-contain drop-shadow-neon cursor-pointer"
            onClick={(e) => handleNavClick("home", e)}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150?text=ET';
            }}
          />
          <span
            className="text-xl md:text-3xl font-bold cursor-pointer"
            onClick={(e) => handleNavClick("home", e)}
          >
            Exclusive <span className="text-secondary text-shadow-neon">Trader</span>
          </span>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => toggleMobileMenu()}
          className="md:hidden text-light hover:text-secondary transition-colors z-50"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center pr-4">
          <ul className="flex gap-6 items-center text-sm lg:text-base">
            <li>
              <Link
                to="/home"
                className={`font-medium ${isActivePage("home")}`}
                onClick={(e) => handleNavClick("home", e)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`font-medium ${isActivePage("about")}`}
                onClick={(e) => handleNavClick("about", e)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className={`font-medium ${isActivePage("services")}`}
                onClick={(e) => handleNavClick("services", e)}
              >
                Services
              </Link>
            </li>

            <li>
              <Link
                to="/industries"
                className={`font-medium ${isActivePage("industries")}`}
                onClick={(e) => handleNavClick("industries", e)}
              >
                Industries
              </Link>
            </li>
            <li>
              <Link
                to="/leadership"
                className={`font-medium ${isActivePage("leadership")}`}
                onClick={(e) => handleNavClick("leadership", e)}
              >
                Leadership
              </Link>
            </li>
           
            <li>
              <Link
                to="/blog"
                className={`font-medium ${isActivePage("blog")}`}
                onClick={(e) => handleNavClick("blog", e)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/join-us"
                className={`font-medium ${isActivePage("join-us")}`}
                onClick={(e) => handleNavClick("join-us", e)}
              >
                Join Us
              </Link>
            </li>
            
             <li>
              <Link
                to="/quote-request"
                className={`font-medium ${isActivePage("quote-request")}`}
                onClick={(e) => handleNavClick("quote-request", e)}
              >
                Feedback
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className={`font-medium ${isActivePage("contact")}`}
                onClick={(e) => handleNavClick("contact", e)}
              >
                Contact
              </Link>
            </li>

            {/* Authentication */}
            {!currentUser ? (
              <>
                <li><Link to="/signin" className="font-medium hover:text-secondary transition-colors px-3 py-2 rounded-lg hover:bg-primary/50">Sign In</Link></li>
                <li><Link to="/signup" className="font-medium bg-secondary text-dark px-4 py-2 rounded-lg hover:bg-accent transition-colors">Sign Up</Link></li>
              </>
            ) : (
              <li className="relative profile-dropdown">
                <div
                  className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-primary/50 transition-colors"
                  onClick={handleProfileDropdown}
                >
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-sm">
                    {getUserInitials()}
                  </div>
                  <span className="font-medium max-w-32 truncate">{getUserDisplayName()}</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}></i>
                </div>

                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-primary/95 backdrop-blur-sm border border-secondary rounded-lg shadow-neon z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-600">
                        <p className="font-medium text-light truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-300 truncate">{currentUser.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-tachometer-alt w-5 text-center"></i>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-shopping-bag w-5 text-center"></i>
                        <span>My Orders</span></Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-cog w-5 text-center"></i>
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-gray-600 my-1"></div>
                      <a
                        href="#signout"
                        onClick={handleSignOutClick}
                        className="flex items-center gap-3 px-4 py-2 text-light hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt w-5 text-center"></i>
                        <span>Sign Out</span>
                      </a>
                    </div>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => toggleMobileMenu(false)}
          ></div>
          <nav className="absolute top-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-secondary shadow-neon max-h-[75vh] overflow-y-auto">
            <ul className="flex flex-col items-center gap-0 px-4 py-2">
              <li className="w-full">
                <Link
                  to="/home"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("home")}`}
                  onClick={(e) => { handleNavClick("home", e); toggleMobileMenu(false); }}
                >
                  Home
                </Link>
              </li>
              <li className="w-full">
                <Link
                  to="/about"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("about")}`}
                  onClick={(e) => { handleNavClick("about", e); toggleMobileMenu(false); }}
                >
                  About
                </Link>
              </li>
              <li className="w-full">
                <Link
                  to="/services"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("services")}`}
                  onClick={(e) => { handleNavClick("services", e); toggleMobileMenu(false); }}
                >
                  Services
                </Link>
              </li>
              <li className="w-full">
                <Link
                  to="/industries"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("industries")}`}
                  onClick={(e) => { handleNavClick("industries", e); toggleMobileMenu(false); }}
                >
                  Industries
                </Link>
              </li>
              <li className="w-full">
                <Link
                  to="/leadership"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("leadership")}`}
                  onClick={(e) => { handleNavClick("leadership", e); toggleMobileMenu(false); }}
                >
                  Leadership
                </Link>
              </li>
              <li className="w-full">
                <Link
                  to="/quote-request"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("quote-request")}`}
                  onClick={(e) => { handleNavClick("quote-request", e); toggleMobileMenu(false); }}
                >
                  Feedback
                </Link>
              </li>
              
              <li className="w-full">
                <Link
                  to="/blog"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("blog")}`}
                  onClick={(e) => { handleNavClick("blog", e); toggleMobileMenu(false); }}
                >
                  Blog
                </Link>
              </li>
              <li className="w-full">
                <Link
                  to="/join-us"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("join-us")}`}
                  onClick={(e) => { handleNavClick("join-us", e); toggleMobileMenu(false); }}
                >
                  Join Us
                </Link>
              </li>
              <li className="w-full">
                <Link
                  to="/contact"
                  className={`font-medium block py-4 px-4 rounded-lg transition-all duration-200 ${isMobileActivePage("contact")}`}
                  onClick={(e) => { handleNavClick("contact", e); toggleMobileMenu(false); }}
                >
                  Contact
                </Link>
              </li>

              {/* Mobile Auth */}
              {!currentUser ? (
                <>
                  <li className="w-full pt-4">
                    <div className="flex flex-col gap-3">
                      <Link to="/signin" className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border-2 border-secondary hover:bg-secondary/10 transition-all duration-200">Sign In</Link>
                      <Link to="/signup" className="font-medium bg-secondary text-dark block py-3 px-4 rounded-lg hover:bg-accent transition-colors text-center transition-all duration-200">Sign Up</Link>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="w-full pt-4 border-t border-gray-600">
                    <div className="flex items-center justify-center gap-3 py-4 px-4 bg-primary/50 rounded-lg mb-3">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-base">
                        {getUserInitials()}
                      </div>
                      <div className="text-center flex-1">
                        <p className="font-medium text-light text-base">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-300 truncate max-w-[140px]">{currentUser.email}</p>
                      </div>
                    </div>
                  </li>
                  <li className="w-full"><Link to="/dashboard" className="font-medium text-light hover:text-secondary transition-colors flex items-center justify-center gap-3 py-4 px-4 hover:bg-primary/50 rounded-lg text-center transition-all duration-200"><i className="fas fa-tachometer-alt w-5 text-center"></i><span className="text-base">Dashboard</span></Link></li>
                  <li className="w-full"><Link to="/orders" className="font-medium text-light hover:text-secondary transition-colors flex items-center justify-center gap-3 py-4 px-4 hover:bg-primary/50 rounded-lg text-center transition-all duration-200"><i className="fas fa-shopping-bag w-5 text-center"></i><span className="text-base">My Orders</span></Link></li>
                  <li className="w-full"><Link to="/settings" className="font-medium text-light hover:text-secondary transition-colors flex items-center justify-center gap-3 py-4 px-4 hover:bg-primary/50 rounded-lg text-center transition-all duration-200"><i className="fas fa-cog w-5 text-center"></i><span className="text-base">Settings</span></Link></li>
                  <li className="w-full pb-2"><a href="#signout" onClick={handleSignOutClick} className="font-medium text-light hover:text-red-400 transition-colors flex items-center justify-center gap-3 py-4 px-4 hover:bg-red-500/20 rounded-lg text-center border-2 border-red-500/30 mt-2 transition-all duration-200"><i className="fas fa-sign-out-alt w-5 text-center"></i><span className="text-base">Sign Out</span></a></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;