// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
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
  const [userProfileData, setUserProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimeoutRef = useRef(null);

  // Fetch complete user profile from Firebase
  const fetchUserProfileData = async (userEmail) => {
    if (!userEmail) return null;
    
    try {
      setIsLoadingProfile(true);
      console.log("🔍 Fetching profile for:", userEmail);
      
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        
        // Find user by email (case-insensitive)
        const userId = Object.keys(usersData).find(key => {
          const user = usersData[key];
          return user.email && user.email.toLowerCase() === userEmail.toLowerCase();
        });
        
        if (userId) {
          const userData = usersData[userId];
          console.log("✅ Found user data:", userData);
          setUserProfileData(userData);
          return userData;
        } else {
          console.log("❌ User not found in Firebase");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
    return null;
  };

  // Separate main website user from admin user and fetch profile
  useEffect(() => {
    const processCurrentUser = async () => {
      // Check if we're on main website (not admin pages)
      const isMainWebsite = !location.pathname.startsWith('/admin');
      
      if (isMainWebsite && currentUser && currentUser.email) {
        // Only store user if they logged in through main website (not admin panel)
        const email = currentUser.email.toLowerCase();
        const displayName = currentUser.displayName?.toLowerCase() || "";
        
        // If it looks like an admin user, don't show in main website
        if (email.includes('admin@exclusivetrader.com') || 
            displayName.includes('system administrator') ||
            displayName.includes('admin')) {
          setMainWebsiteUser(null);
          setUserProfileData(null);
        } else {
          // This is a regular main website user - fetch complete profile
          setMainWebsiteUser(currentUser);
          
          // Fetch detailed profile from Firebase
          const profileData = await fetchUserProfileData(email);
          
          if (!profileData) {
            // If no profile found in Firebase, use currentUser data
            // Try to get additional data from localStorage
            const storedUser = localStorage.getItem('current_user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                // Merge currentUser with stored data
                const mergedUser = {
                  ...currentUser,
                  phone: parsedUser.phone || currentUser.phoneNumber,
                  phoneNumber: parsedUser.phoneNumber || currentUser.phoneNumber,
                  country: parsedUser.country || currentUser.country,
                  state: parsedUser.state || currentUser.state,
                  city: parsedUser.city || currentUser.city,
                  pincode: parsedUser.pincode || currentUser.pincode,
                  fullName: parsedUser.fullName || currentUser.displayName
                };
                setMainWebsiteUser(mergedUser);
              } catch (e) {
                console.error("Error parsing stored user:", e);
              }
            }
          }
        }
      } else {
        setMainWebsiteUser(null);
        setUserProfileData(null);
        
        // Check localStorage for guest user data
        const storedUser = localStorage.getItem('current_user');
        if (storedUser && !currentUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && !parsedUser.isGuest) {
              // This is a signed up user - fetch their profile
              if (parsedUser.email) {
                const profileData = await fetchUserProfileData(parsedUser.email);
                if (profileData) {
                  setMainWebsiteUser(profileData);
                }
              }
            }
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
      }
    };

    processCurrentUser();
  }, [currentUser, location.pathname]);

  // Also fetch profile when location changes (user might have just signed up)
  useEffect(() => {
    if (mainWebsiteUser && mainWebsiteUser.email && !userProfileData) {
      fetchUserProfileData(mainWebsiteUser.email);
    }
  }, [location.pathname, mainWebsiteUser]);

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
    if (path === '/Feedback') return 'Feedback';
    if (path === '/blog') return 'blog';
    if (path === '/join-us') return 'join-us';
    if (path === '/contact') return 'contact';
    if (path === '/leadership') return 'leadership';
    if (path === '/signin') return 'signin';
    if (path === '/signup') return 'signup';
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

  // Handle scroll detection ONLY on home page - WITHOUT BLOG AND JOIN US
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
        
        // Only sections that exist in home page
        const possibleSectionIds = [
          'home',
          'about',
          'services',
          'industries',
          'leadership',
          'Feedback',
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
    // Also clear main website user and profile data
    setMainWebsiteUser(null);
    setUserProfileData(null);
    // Clear localStorage for current_user
    localStorage.removeItem('current_user');
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

    toggleMobileMenu(false);

    // Always navigate
    navigate(`/${page}`);
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
    
    // Try multiple sources for name
    const fullName = getMainUserFullName();
    if (fullName && fullName.trim()) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    return mainWebsiteUser.email?.substring(0, 2).toUpperCase() || "US";
  };

  const getUserDisplayName = () => {
    if (!mainWebsiteUser) return "";
    
    // Try multiple sources for name
    const fullName = getMainUserFullName();
    if (fullName && fullName.trim()) {
      return fullName;
    }
    
    return mainWebsiteUser.email?.split('@')[0] || "User";
  };

  // Get full name from multiple possible sources
  const getMainUserFullName = () => {
    if (!mainWebsiteUser) return "";
    
    // Check multiple possible fields
    return mainWebsiteUser.fullName || 
           mainWebsiteUser.displayName || 
           mainWebsiteUser.name || 
           "";
  };

  // Get email from multiple possible sources
  const getMainUserEmail = () => {
    if (!mainWebsiteUser) return "";
    return mainWebsiteUser.email || "";
  };

  // Get phone from multiple possible sources
  const getMainUserPhone = () => {
    if (!mainWebsiteUser) return "";
    
    // Check multiple phone number fields
    if (mainWebsiteUser.phone) {
      return mainWebsiteUser.phone;
    }
    
    if (mainWebsiteUser.phoneNumber) {
      if (typeof mainWebsiteUser.phoneNumber === 'string') {
        return mainWebsiteUser.phoneNumber;
      } else if (mainWebsiteUser.phoneNumber.fullNumber) {
        return mainWebsiteUser.phoneNumber.fullNumber;
      } else if (mainWebsiteUser.phoneNumber.number) {
        const countryCode = mainWebsiteUser.phoneNumber.countryCode || '+91';
        return `${countryCode} ${mainWebsiteUser.phoneNumber.number}`;
      }
    }
    
    // Check in address or other fields
    if (mainWebsiteUser.address && mainWebsiteUser.address.phone) {
      return mainWebsiteUser.address.phone;
    }
    
    return "";
  };

  // Get country from multiple possible sources
  const getMainUserCountry = () => {
    if (!mainWebsiteUser) return "";
    
    // Check multiple country fields
    if (mainWebsiteUser.country) {
      return mainWebsiteUser.country;
    }
    
    if (mainWebsiteUser.address && mainWebsiteUser.address.country) {
      return mainWebsiteUser.address.country;
    }
    
    // Check if we have a country code that we can map
    if (mainWebsiteUser.phoneNumber && mainWebsiteUser.phoneNumber.countryCode) {
      const countryCode = mainWebsiteUser.phoneNumber.countryCode;
      const countryMap = {
        '+91': 'India',
        '+1': 'United States',
        '+44': 'United Kingdom',
        '+971': 'UAE',
        '+61': 'Australia',
        '+968': 'Oman',
        '+49': 'Germany',
        '+33': 'France',
        '+65': 'Singapore',
        '+81': 'Japan',
        '+86': 'China'
      };
      return countryMap[countryCode] || "";
    }
    
    return "";
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

  // Get user details for display
  const getUserFullName = () => {
    const fullName = getMainUserFullName();
    return fullName || "Not provided";
  };

  const getUserEmail = () => {
    const email = getMainUserEmail();
    return email || "Not provided";
  };

  const getUserPhone = () => {
    const phone = getMainUserPhone();
    return phone || "Not provided";
  };

  const getUserCountry = () => {
    const country = getMainUserCountry();
    return country || "Not provided";
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
                {/* YOUR REQUESTED ORDER: Home, About, Services, Industries, Leadership, Blog, Join Us, Feedback, Contact */}
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
                  to="/Feedback" 
                  className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("Feedback")}`} 
                  onClick={(e) => handleNavClick("Feedback", e)}
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

          {/* Show loading spinner when fetching profile */}
          {isLoadingProfile && !isMobileView && (
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-secondary text-sm"></i>
            </div>
          )}

          {/* Show profile avatar when logged in to MAIN WEBSITE */}
          {isMainWebsiteLoggedIn && !isMobileView && !isLoadingProfile && (
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
              {/* YOUR REQUESTED ORDER: Home, About, Services, Industries, Leadership, Blog, Join Us, Feedback, Contact */}
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
                  to="/Feedback" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("Feedback")}`} 
                  onClick={(e) => { handleNavClick("Feedback", e); toggleMobileMenu(false); }}
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
              {isMainWebsiteLoggedIn ? (
                <li className="w-full pt-5 mt-4 border-t border-gray-700">
                  {isLoadingProfile ? (
                    <div className="px-4 py-4 flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-secondary text-lg mr-2"></i>
                      <span className="text-light">Loading profile...</span>
                    </div>
                  ) : (
                    <>
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
                              {getUserEmail() || "No email"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* ACCOUNT INFORMATION Section */}
                      <div className="mb-4 px-2">
                        <div className="bg-primary/50 border border-secondary/30 rounded-lg p-4">
                          <h3 className="text-secondary font-bold text-base mb-4">ACCOUNT INFORMATION</h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <span className="text-sm text-gray-400 min-w-24">Full Name:</span>
                              <span className="text-light font-medium ml-2">
                                {getUserFullName()}
                              </span>
                            </div>
                            
                            <div className="flex items-start">
                              <span className="text-sm text-gray-400 min-w-24">Email:</span>
                              <span className="text-light font-medium ml-2">
                                {getUserEmail()}
                              </span>
                            </div>
                            
                            <div className="flex items-start">
                              <span className="text-sm text-gray-400 min-w-24">Phone:</span>
                              <span className="text-light font-medium ml-2">
                                {getUserPhone()}
                              </span>
                            </div>
                            
                            <div className="flex items-start">
                              <span className="text-sm text-gray-400 min-w-24">Country:</span>
                              <span className="text-light font-medium ml-2">
                                {getUserCountry()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sign Out Button */}
                      <a 
                        href="#signout" 
                        onClick={handleSignOutClick} 
                        className="font-medium hover:text-red-400 transition-colors block py-3 px-4 rounded-lg text-center border border-red-500 hover:bg-red-500/10 transition-all duration-200 text-base"
                      >
                        Sign Out
                      </a>
                    </>
                  )}
                </li>
              ) : (
                /* Show Sign In/Sign Up when NOT logged in to MAIN WEBSITE */
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
      {isMainWebsiteLoggedIn && showProfileDropdown && !isMobileView && !isLoadingProfile && (
        <div className="fixed top-16 sm:top-18 md:top-20 right-4 sm:right-6 md:right-8 z-50 profile-dropdown">
          <div className="w-56 sm:w-64 md:w-72 bg-primary/95 backdrop-blur-sm border border-secondary rounded-lg shadow-neon">
            <div className="py-1">
              <div className="px-4 py-3 border-b border-secondary bg-secondary/10">
                <p className="font-bold text-secondary text-sm truncate">
                  {getUserRole()}
                </p>
                <p className="text-xs text-gray-300 truncate mt-1">
                  {getUserEmail() || "No email"}
                </p>
              </div>
              
              {/* ACCOUNT INFORMATION Section */}
              <div className="px-4 py-4 border-b border-gray-700">
                <h3 className="text-secondary font-bold text-sm mb-3">ACCOUNT INFORMATION</h3>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-xs text-gray-400 min-w-20">Full Name:</span>
                    <span className="text-light font-medium text-sm ml-2">
                      {getUserFullName()}
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-xs text-gray-400 min-w-20">Email:</span>
                    <span className="text-light font-medium text-sm ml-2">
                      {getUserEmail()}
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-xs text-gray-400 min-w-20">Phone:</span>
                    <span className="text-light font-medium text-sm ml-2">
                      {getUserPhone()}
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-xs text-gray-400 min-w-20">Country:</span>
                    <span className="text-light font-medium text-sm ml-2">
                      {getUserCountry()}
                    </span>
                  </div>
                </div>
              </div>
              
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