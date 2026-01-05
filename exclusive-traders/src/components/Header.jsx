// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
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
  const [isMobileView, setIsMobileView] = useState(false);
  const [mainWebsiteUser, setMainWebsiteUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimeoutRef = useRef(null);

  // Separate main website user from admin user
  useEffect(() => {
    // Check if we're on main website (not admin pages)
    const isMainWebsite = !location.pathname.startsWith('/admin');
    
    if (isMainWebsite && currentUser) {
      // Only store user if they logged in through main website (not admin panel)
      // Check if it's a regular user (not admin)
      const email = currentUser.email?.toLowerCase() || "";
      const displayName = currentUser.displayName?.toLowerCase() || "";
      
      // If it looks like an admin user (has admin@exclusivetrader.com), don't show in main website
      if (email.includes('admin@exclusivetrader.com') || 
          displayName.includes('system administrator') ||
          displayName.includes('admin')) {
        // This is an admin user, don't show in main website
        setMainWebsiteUser(null);
      } else {
        // This is a regular main website user
        setMainWebsiteUser(currentUser);
      }
    } else {
      setMainWebsiteUser(null);
    }
  }, [currentUser, location.pathname]);

  // Check if user is logged in to MAIN WEBSITE (not admin panel)
  const isMainWebsiteLoggedIn = !!mainWebsiteUser;

  // Check viewport for responsive behavior
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      const isNestHubMax = width === 1280 && height === 800;
      const isTabletSize = width <= 1280 && height <= 900;
      const isMobileAspectRatio = aspectRatio < 1.7;
      
      const shouldUseToggle = width < 1280 || isNestHubMax || (isTabletSize && isMobileAspectRatio);
      
      setIsMobileView(shouldUseToggle);
      
      if (!shouldUseToggle && isMobileMenuOpen) {
        toggleMobileMenu(false);
      }
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    
    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, [isMobileMenuOpen, toggleMobileMenu]);

  // Get current page from URL path
  const getCurrentPageFromPath = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
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
    if (path === '/orders') return 'orders';
    if (path === '/settings') return 'settings';
    if (path === '/account') return 'account';
    return 'home';
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

  // Set active section based on URL path when location changes
  useEffect(() => {
    const currentPage = getCurrentPageFromPath();
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    setActiveSection(currentPage);
  }, [location.pathname]);

  // Handle scroll detection ONLY on home page
  useEffect(() => {
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    
    if (!isHomePage) {
      return;
    }

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const headerHeight = 100;
        
        const possibleSectionIds = [
          'home',
          'services',
          'about',
          'industries',
          'leadership',
          'blog',
          'join-us',
          'quote-request',
          'contact'
        ];
        
        const existingSections = possibleSectionIds
          .map(id => ({ id, element: document.getElementById(id) }))
          .filter(s => s.element !== null)
          .map(s => ({
            id: s.id,
            element: s.element,
            top: s.element.offsetTop - headerHeight,
            bottom: s.element.offsetTop + s.element.offsetHeight - headerHeight
          }));
        
        if (existingSections.length === 0) {
          setActiveSection('home');
          return;
        }
        
        existingSections.sort((a, b) => a.top - b.top);
        
        let currentSection = 'home';
        
        if (scrollPosition < 50) {
          currentSection = 'home';
        } else {
          let maxVisibleArea = 0;
          let mostVisibleSection = 'home';
          
          for (const section of existingSections) {
            const visibleTop = Math.max(0, scrollPosition - section.top);
            const visibleBottom = Math.min(
              section.bottom,
              scrollPosition + windowHeight
            ) - Math.max(section.top, scrollPosition);
            
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            
            if (visibleHeight > maxVisibleArea) {
              maxVisibleArea = visibleHeight;
              mostVisibleSection = section.id;
            }
          }
          
          if (maxVisibleArea < windowHeight * 0.1) {
            let closestDistance = Infinity;
            let closestSection = 'home';
            
            for (const section of existingSections) {
              const distanceToTop = Math.abs(section.top - scrollPosition);
              const distanceToCenter = Math.abs((section.top + section.bottom) / 2 - scrollPosition);
              const minDistance = Math.min(distanceToTop, distanceToCenter);
              
              if (minDistance < closestDistance) {
                closestDistance = minDistance;
                closestSection = section.id;
              }
            }
            
            currentSection = closestSection;
          } else {
            currentSection = mostVisibleSection;
          }
        }
        
        if (currentSection !== activeSection) {
          setActiveSection(currentSection);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    setTimeout(() => {
      handleScroll();
    }, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [location.pathname, activeSection]);

  // Handlers
  const handleSignOutClick = (e) => {
    e.preventDefault();
    onSignOut();
    setShowProfileDropdown(false);
    toggleMobileMenu(false);
    // Also clear main website user
    setMainWebsiteUser(null);
    // Redirect to home after sign out
    navigate('/');
  };

  const handleProfileDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileDropdown(prev => !prev);
  };

  const handleNavClick = (page, e) => {
    if (e) e.preventDefault();
    
    const currentPage = getCurrentPageFromPath();
    
    setActiveSection(page);
    
    if (page === 'home' && currentPage === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toggleMobileMenu(false);
      return;
    }
    
    if (currentPage === 'home' && (location.pathname === '/' || location.pathname === '/home')) {
      const sectionElement = document.getElementById(page);
      
      if (sectionElement) {
        const headerHeight = 100;
        window.scrollTo({
          top: sectionElement.offsetTop - headerHeight,
          behavior: 'smooth'
        });
        toggleMobileMenu(false);
        return;
      }
    }
    
    if (currentPage !== page || !document.getElementById(page)) {
      navigateToPage(page);
      toggleMobileMenu(false);
    }
  };

  const isActivePage = (page) => {
    const currentPage = getCurrentPageFromPath();
    const isHomePage = currentPage === 'home' && (location.pathname === '/' || location.pathname === '/home');
    
    if (isHomePage) {
      return activeSection === page
        ? "text-secondary text-shadow-neon font-bold"
        : "text-light hover:text-secondary hover:text-shadow-neon transition-all duration-200";
    }
    
    return currentPage === page
      ? "text-secondary text-shadow-neon font-bold"
      : "text-light hover:text-secondary hover:text-shadow-neon transition-all duration-200";
  };

  const isMobileActivePage = (page) => {
    const currentPage = getCurrentPageFromPath();
    const isHomePage = currentPage === 'home' && (location.pathname === '/' || location.pathname === '/home');
    
    if (isHomePage) {
      return activeSection === page
        ? "bg-secondary/20 text-secondary font-bold border-l-4 border-secondary"
        : "text-light hover:bg-primary/50 hover:text-secondary";
    }
    
    return currentPage === page
      ? "bg-secondary/20 text-secondary font-bold border-l-4 border-secondary"
      : "text-light hover:bg-primary/50 hover:text-secondary";
  };

  const getUserInitials = () => {
    if (!mainWebsiteUser) return "US";
    if (mainWebsiteUser.displayName) {
      return mainWebsiteUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return mainWebsiteUser.email?.substring(0, 2).toUpperCase() || "US";
  };

  const getUserDisplayName = () => {
    if (!mainWebsiteUser) return "";
    return mainWebsiteUser.displayName || mainWebsiteUser.email?.split('@')[0] || "User";
  };

  // Get user role - only for main website users
  const getUserRole = () => {
    if (!mainWebsiteUser) return "Guest";
    
    if (mainWebsiteUser.role) {
      // Never show "System Administrator" or "Admin" on main website
      const role = mainWebsiteUser.role.toLowerCase();
      if (role.includes('admin') || role.includes('system administrator')) {
        return "Member"; // Force to Member for admin users on main website
      }
      return mainWebsiteUser.role;
    }
    
    return "Member";
  };

  return (
    <header className="bg-primary/90 text-light py-3 sticky top-0 z-50 shadow-neon backdrop-blur-sm w-full">
      <div className="w-full flex justify-between items-center px-4 sm:px-6 md:px-8">
        {/* Logo + Brand */}
        <div className="flex items-center flex-shrink min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={logo}
              alt="Logo"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-neon cursor-pointer flex-shrink-0"
              onClick={(e) => handleNavClick("home", e)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150?text=ET';
              }}
            />
            <div className="flex flex-col leading-tight min-w-0 flex-shrink">
              <div 
                className="cursor-pointer font-serif"
                onClick={(e) => handleNavClick("home", e)}
              >
                <span className="text-lg sm:text-xl md:text-2xl font-bold">
                  Exclusive Trader
                </span>
              </div>
              <span className="text-xs sm:text-sm md:text-base text-light/80 font-serif tracking-wider truncate">
                Your Partner in Commerce
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Navigation + Profile/Auth */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
          {/* DESKTOP NAVIGATION - Only visible on true desktop screens */}
          <nav className="hidden lg:flex items-center gap-2">
            {!isMobileView && (
              <>
                <Link 
                  to="/home" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("home")}`} 
                  onClick={(e) => handleNavClick("home", e)}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("about")}`} 
                  onClick={(e) => handleNavClick("about", e)}
                >
                  About
                </Link>
                <Link 
                  to="/services" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("services")}`} 
                  onClick={(e) => handleNavClick("services", e)}
                >
                  Services
                </Link>
                <Link 
                  to="/industries" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("industries")}`} 
                  onClick={(e) => handleNavClick("industries", e)}
                >
                  Industries
                </Link>
                <Link 
                  to="/leadership" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("leadership")}`} 
                  onClick={(e) => handleNavClick("leadership", e)}
                >
                  Leadership
                </Link>
                <Link 
                  to="/blog" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("blog")}`} 
                  onClick={(e) => handleNavClick("blog", e)}
                >
                  Blog
                </Link>
                <Link 
                  to="/join-us" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("join-us")}`} 
                  onClick={(e) => handleNavClick("join-us", e)}
                >
                  Join Us
                </Link>
                <Link 
                  to="/quote-request" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("quote-request")}`} 
                  onClick={(e) => handleNavClick("quote-request", e)}
                >
                  Feedback
                </Link>
                <Link 
                  to="/contact" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("contact")}`} 
                  onClick={(e) => handleNavClick("contact", e)}
                >
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* Show profile avatar when logged in to MAIN WEBSITE */}
          {isMainWebsiteLoggedIn && !isMobileView && (
            <div className="profile-dropdown">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-sm cursor-pointer flex-shrink-0"
                onClick={handleProfileDropdown}
              >
                {getUserInitials()}
              </div>
            </div>
          )}

          {/* Show Sign In/Sign Up buttons when NOT logged in to MAIN WEBSITE */}
          {!isMainWebsiteLoggedIn && !isMobileView && (
            <div className="hidden lg:flex items-center gap-2">
              <Link 
                to="/signin" 
                className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("signin")} hover:bg-primary/50`}
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="font-medium bg-secondary text-dark px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle - Visible when isMobileView is true */}
          {isMobileView && (
            <button
              onClick={() => toggleMobileMenu()}
              className="text-light hover:text-secondary transition-colors z-50 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg 
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - For all mobile/tablet views */}
      {isMobileView && isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 sm:top-18 md:top-20 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => toggleMobileMenu(false)}></div>
          <nav className="absolute top-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-secondary shadow-neon max-h-[85vh] overflow-y-auto">
            <ul className="flex flex-col items-center gap-0 px-4 py-4">
              <li className="w-full">
                <Link 
                  to="/home" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("home")}`} 
                  onClick={(e) => { handleNavClick("home", e); toggleMobileMenu(false); }}
                >
                  Home
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/about" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("about")}`} 
                  onClick={(e) => { handleNavClick("about", e); toggleMobileMenu(false); }}
                >
                  About
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/services" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("services")}`} 
                  onClick={(e) => { handleNavClick("services", e); toggleMobileMenu(false); }}
                >
                  Services
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/industries" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("industries")}`} 
                  onClick={(e) => { handleNavClick("industries", e); toggleMobileMenu(false); }}
                >
                  Industries
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/leadership" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("leadership")}`} 
                  onClick={(e) => { handleNavClick("leadership", e); toggleMobileMenu(false); }}
                >
                  Leadership
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/blog" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("blog")}`} 
                  onClick={(e) => { handleNavClick("blog", e); toggleMobileMenu(false); }}
                >
                  Blog
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/join-us" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("join-us")}`} 
                  onClick={(e) => { handleNavClick("join-us", e); toggleMobileMenu(false); }}
                >
                  Join Us
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/quote-request" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("quote-request")}`} 
                  onClick={(e) => { handleNavClick("quote-request", e); toggleMobileMenu(false); }}
                >
                  Feedback
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/contact" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("contact")}`} 
                  onClick={(e) => { handleNavClick("contact", e); toggleMobileMenu(false); }}
                >
                  Contact
                </Link>
              </li>

              {/* Profile section for MAIN WEBSITE users only */}
              {isMainWebsiteLoggedIn && (
                <li className="w-full pt-5 mt-4 border-t border-gray-700">
                  <div className="px-4 py-4 bg-secondary/10 rounded-lg mb-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-lg">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-secondary text-base truncate">
                          {getUserRole()}
                        </p>
                        <p className="text-sm text-gray-300 truncate mt-1">
                          {mainWebsiteUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/account" 
                      className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      My Account
                    </Link>
                    <Link 
                      to="/orders" 
                      className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      My Orders
                    </Link>
                    <Link 
                      to="/settings" 
                      className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      Settings
                    </Link>
                    <a 
                      href="#signout" 
                      onClick={handleSignOutClick} 
                      className="font-medium hover:text-red-400 transition-colors block py-3 px-4 rounded-lg text-center border border-red-500 hover:bg-red-500/10 transition-all duration-200 text-base"
                    >
                      Sign Out
                    </a>
                  </div>
                </li>
              )}

              {/* Show Sign In/Sign Up when NOT logged in to MAIN WEBSITE */}
              {!isMainWebsiteLoggedIn && (
                <li className="w-full pt-5 mt-4 border-t border-gray-700">
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/signin" 
                      className={`font-medium block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base ${isMobileActivePage("signin")}`}
                      onClick={() => toggleMobileMenu(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="font-medium bg-secondary text-dark block py-3 px-4 rounded-lg hover:bg-accent transition-colors text-center transition-all duration-200 text-base"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      {/* Profile dropdown for MAIN WEBSITE users on desktop */}
      {isMainWebsiteLoggedIn && showProfileDropdown && !isMobileView && (
        <div className="fixed top-16 sm:top-18 md:top-20 right-4 sm:right-6 md:right-8 z-50 profile-dropdown">
          <div className="w-56 sm:w-64 md:w-72 bg-primary/95 backdrop-blur-sm border border-secondary rounded-lg shadow-neon">
            <div className="py-1">
              <div className="px-4 py-3 border-b border-secondary bg-secondary/10">
                <p className="font-bold text-secondary text-sm truncate">
                  {getUserRole()}
                </p>
                <p className="text-xs text-gray-300 truncate mt-1">
                  {mainWebsiteUser.email}
                </p>
              </div>
              
              <Link 
                to="/account" 
                className="flex items-center gap-3 px-4 py-3 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-user-circle w-5 text-center"></i>
                <span className="font-medium">My Account</span>
              </Link>
              
              <Link 
                to="/orders" 
                className="flex items-center gap-3 px-4 py-3 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-shopping-bag w-5 text-center"></i>
                <span className="font-medium">My Orders</span>
              </Link>
              
              <Link 
                to="/settings" 
                className="flex items-center gap-3 px-4 py-3 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-cog w-5 text-center"></i>
                <span className="font-medium">Settings</span>
              </Link>
              
              <div className="border-t border-gray-700 my-2"></div>
              
              <a 
                href="#signout" 
                onClick={handleSignOutClick} 
                className="flex items-center gap-3 px-4 py-3 text-light hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm"
              >
                <i className="fas fa-sign-out-alt w-5 text-center"></i>
                <span className="font-medium">Sign Out</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;