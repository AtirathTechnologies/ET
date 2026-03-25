// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, update } from "firebase/database";
import logo from "../assets/ExclusiveTraderLogo.svg";

const Header = ({
  navigateToPage,
  currentUser,
  onSignOut,
  isMobileMenuOpen,
  toggleMobileMenu,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileView, setIsMobileView] = useState(false);
  const [mainWebsiteUser, setMainWebsiteUser] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false); // NEW: prevents flicker

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Form fields for editing
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCountry, setEditCountry] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const moreDropdownRef = useRef(null);
  const isMountedRef = useRef(true);

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
        const foundId = Object.keys(usersData).find(key => {
          const user = usersData[key];
          return user.email && user.email.toLowerCase() === userEmail.toLowerCase();
        });

        if (foundId) {
          const userData = usersData[foundId];
          console.log("✅ Found user data:", userData);
          if (isMountedRef.current) {
            setUserId(foundId);
            setUserProfileData(userData);
            setEditName(userData.fullName || userData.displayName || userData.name || "");
            setEditEmail(userData.email || "");
            setEditPhone(userData.phone || userData.phoneNumber || "");
            setEditCountry(userData.country || userData.address?.country || "");
          }
          return userData;
        } else {
          console.log("❌ User not found in Firebase");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      if (isMountedRef.current) setIsLoadingProfile(false);
    }
    return null;
  };

  // Separate main website user from admin user and fetch profile
  useEffect(() => {
    isMountedRef.current = true;
    let isActive = true;

    const processCurrentUser = async () => {
      setIsAuthInitialized(false); // start loading
      const isMainWebsite = !location.pathname.startsWith('/admin');

      if (isMainWebsite && currentUser && currentUser.email) {
        const email = currentUser.email.toLowerCase();
        const displayName = currentUser.displayName?.toLowerCase() || "";

        if (email.includes('admin@exclusivetrader.com') ||
            displayName.includes('system administrator') ||
            displayName.includes('admin')) {
          if (isActive) {
            setMainWebsiteUser(null);
            setUserProfileData(null);
          }
        } else {
          if (isActive) setMainWebsiteUser(currentUser);
          const profileData = await fetchUserProfileData(email);

          if (profileData) {
            console.log("✅ Profile data loaded:", profileData);
          } else {
            const storedUser = localStorage.getItem('current_user');
            if (storedUser && isActive) {
              try {
                const parsedUser = JSON.parse(storedUser);
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
                setUserProfileData(mergedUser);
                setEditName(mergedUser.fullName || "");
                setEditEmail(mergedUser.email || "");
                setEditPhone(mergedUser.phone || "");
                setEditCountry(mergedUser.country || "");
              } catch (e) {
                console.error("Error parsing stored user:", e);
              }
            }
          }
        }
      } else {
        if (isActive) {
          setMainWebsiteUser(null);
          setUserProfileData(null);
          setUserId(null);
        }

        const storedUser = localStorage.getItem('current_user');
        if (storedUser && !currentUser && isActive) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && !parsedUser.isGuest) {
              if (parsedUser.email) {
                const profileData = await fetchUserProfileData(parsedUser.email);
                if (profileData && isActive) {
                  setMainWebsiteUser(profileData);
                  setUserProfileData(profileData);
                }
              }
            }
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
      }

      if (isActive) setIsAuthInitialized(true);
    };

    processCurrentUser();

    return () => {
      isActive = false;
      isMountedRef.current = false;
    };
  }, [currentUser, location.pathname]);

  // Also fetch profile when location changes (user already logged in)
  useEffect(() => {
    if (mainWebsiteUser && mainWebsiteUser.email && !userProfileData) {
      fetchUserProfileData(mainWebsiteUser.email).then(profileData => {
        if (profileData) setUserProfileData(profileData);
      });
    }
  }, [location.pathname, mainWebsiteUser]);

  // Check if user is logged in to MAIN WEBSITE
  const isMainWebsiteLoggedIn = !!mainWebsiteUser;

  // Viewport detection
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      const shouldUseToggle = width < 1024;
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
    const path = location.pathname.replace(/\/$/, '');

    const pageMap = {
      '/': 'home',
      '/home': 'home',
      '/services': 'services',
      '/about': 'about',
      '/industries': 'industries',
      '/Feedback': 'Feedback',
      '/blog': 'blog',
      '/join-us': 'join-us',
      '/contact': 'contact',
      '/leadership': 'leadership',
      '/transport': 'transport',  // <-- ADDED
      '/signin': 'signin',
      '/signup': 'signup',
    };

    if (pageMap[path]) {
      return pageMap[path];
    }

    return 'industries';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
        setIsEditing(false);
      }
      if (showMoreDropdown && moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown, showMoreDropdown]);

  // Set active section based on URL path
  useEffect(() => {
    const currentPage = getCurrentPageFromPath();

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    setActiveSection(currentPage);
  }, [location.pathname]);

  // Handle scroll detection on home page
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
    setIsEditing(false);
    toggleMobileMenu(false);
    setMainWebsiteUser(null);
    setUserProfileData(null);
    setUserId(null);
    localStorage.removeItem('current_user');
    navigate('/');
  };

  const handleProfileDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileDropdown(prev => !prev);
    setIsEditing(false);
  };

  const handleMoreDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMoreDropdown(prev => !prev);
  };

  const handleNavClick = (page, e) => {
    if (e) e.preventDefault();
    toggleMobileMenu(false);
    setShowMoreDropdown(false);
    navigate(`/${page}`);
  };

  // Edit functions
  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (userProfileData) {
      setEditName(userProfileData.fullName || userProfileData.displayName || userProfileData.name || "");
      setEditEmail(userProfileData.email || "");
      setEditPhone(userProfileData.phone || userProfileData.phoneNumber || "");
      setEditCountry(userProfileData.country || userProfileData.address?.country || "");
    }
    setEditError("");
    setEditSuccess("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setEditError("User ID not found. Please reload.");
      return;
    }

    setIsSaving(true);
    setEditError("");
    setEditSuccess("");

    try {
      const updates = {};
      if (editName !== (userProfileData.fullName || userProfileData.displayName || userProfileData.name)) {
        updates.fullName = editName;
      }
      if (editEmail !== (userProfileData.email || "")) {
        updates.email = editEmail;
      }
      if (editPhone !== (userProfileData.phone || userProfileData.phoneNumber || "")) {
        updates.phone = editPhone;
      }
      if (editCountry !== (userProfileData.country || userProfileData.address?.country || "")) {
        updates.country = editCountry;
      }

      if (Object.keys(updates).length === 0) {
        setEditSuccess("No changes to save.");
        setTimeout(() => {
          setIsEditing(false);
          setEditSuccess("");
        }, 1500);
        setIsSaving(false);
        return;
      }

      await update(ref(db, `users/${userId}`), updates);

      const updatedData = { ...userProfileData, ...updates };
      setUserProfileData(updatedData);

      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem('current_user', JSON.stringify({ ...parsed, ...updates }));
      }

      setEditSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Error saving profile:", err);
      setEditError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to check if any page inside "More" dropdown is active
  const isMoreDropdownActive = () => {
    const currentPage = getCurrentPageFromPath();
    const dropdownPages = ['services', 'leadership', 'blog', 'join-us', 'Feedback', 'transport']; // <-- ADDED 'transport'
    return dropdownPages.includes(currentPage);
  };

  const isActivePage = (page) => {
    const currentPage = getCurrentPageFromPath();
    const isHomePage = currentPage === 'home' && (location.pathname === '/' || location.pathname === '/home');

    if (isHomePage) {
      return activeSection === page
        ? "text-secondary text-shadow-neon font-bold"
        : "text-light hover:text-secondary hover:text-shadow-neon transition-all duration-200";
    }

    if (page === 'more') {
      return isMoreDropdownActive()
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
    if (!mainWebsiteUser && !userProfileData) return "US";

    const userData = userProfileData || mainWebsiteUser;

    const fullName = getMainUserFullName(userData);
    if (fullName && fullName.trim()) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    return userData?.email?.substring(0, 2).toUpperCase() || "US";
  };

  const getUserDisplayName = () => {
    if (!mainWebsiteUser && !userProfileData) return "";

    const userData = userProfileData || mainWebsiteUser;

    const fullName = getMainUserFullName(userData);
    if (fullName && fullName.trim()) {
      return fullName;
    }

    return userData?.email?.split('@')[0] || "User";
  };

  const getMainUserFullName = (userData = null) => {
    const data = userData || userProfileData || mainWebsiteUser;
    if (!data) return "";
    return data.fullName || data.displayName || data.name || "";
  };

  const getMainUserEmail = (userData = null) => {
    const data = userData || userProfileData || mainWebsiteUser;
    if (!data) return "";
    return data.email || "";
  };

  const getMainUserPhone = (userData = null) => {
    const data = userData || userProfileData || mainWebsiteUser;
    if (!data) return "";

    if (data.phone) return data.phone;
    if (data.phoneNumber) {
      if (typeof data.phoneNumber === 'string') return data.phoneNumber;
      if (data.phoneNumber.fullNumber) return data.phoneNumber.fullNumber;
      if (data.phoneNumber.number) {
        const countryCode = data.phoneNumber.countryCode || '+91';
        return `${countryCode} ${data.phoneNumber.number}`;
      }
    }
    if (data.address) {
      if (data.address.phone) return data.address.phone;
      if (data.address.phoneNumber) return data.address.phoneNumber;
    }
    return "Not provided";
  };

  const getMainUserCountry = (userData = null) => {
    const data = userData || userProfileData || mainWebsiteUser;
    if (!data) return "";

    if (data.country) return data.country;
    if (data.address && data.address.country) return data.address.country;

    if (data.phoneNumber && data.phoneNumber.countryCode) {
      const countryCode = data.phoneNumber.countryCode;
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
      const mappedCountry = countryMap[countryCode] || "";
      if (mappedCountry) return mappedCountry;
    }

    return "Not provided";
  };

  const getUserRole = () => {
    const data = userProfileData || mainWebsiteUser;
    if (!data) return "Guest";

    if (data.role) {
      const role = data.role.toLowerCase();
      if (role.includes('admin') || role.includes('system administrator')) {
        return "Member";
      }
      return data.role;
    }

    return "Member";
  };

  const getUserFullName = () => {
    const data = userProfileData || mainWebsiteUser;
    const fullName = getMainUserFullName(data);
    return fullName || "Not provided";
  };

  const getUserEmail = () => {
    const data = userProfileData || mainWebsiteUser;
    const email = getMainUserEmail(data);
    return email || "Not provided";
  };

  const getUserPhone = () => {
    const data = userProfileData || mainWebsiteUser;
    const phone = getMainUserPhone(data);
    return phone || "Not provided";
  };

  const getUserCountry = () => {
    const data = userProfileData || mainWebsiteUser;
    const country = getMainUserCountry(data);
    return country || "Not provided";
  };

  return (
    <header className="bg-primary/90 text-light py-3 sticky top-0 z-50 shadow-neon backdrop-blur-sm w-full">
      <div className="w-full flex justify-between items-center px-2 sm:px-4 md:px-6">
        {/* Logo + Brand - stays on left */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={logo}
              alt="Logo"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-neon cursor-pointer flex-shrink-0"
              onClick={(e) => handleNavClick("home", e)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150?text=ET';
              }}
            />
            <div className="flex flex-col leading-tight">
              <div
                className="cursor-pointer font-serif"
                onClick={(e) => handleNavClick("home", e)}
              >
                <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight">
                  Exclusive Trader
                </span>
              </div>
              <span className="text-xs sm:text-xs md:text-sm text-light/80 font-serif tracking-wider truncate">
                Your Partner in Commerce
              </span>
            </div>
          </div>
        </div>

        {/* Centered Navigation - hidden on mobile */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden lg:flex items-center gap-2">
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
              to="/industries"
              className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("industries")}`}
              onClick={(e) => handleNavClick("industries", e)}
            >
              Industries
            </Link>
            <Link
              to="/contact"
              className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActivePage("contact")}`}
              onClick={(e) => handleNavClick("contact", e)}
            >
              Contact
            </Link>

            {/* More Dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={handleMoreDropdown}
                className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sm mr-2 ${isActivePage("more")}`}
              >
                More
              </button>
              {showMoreDropdown && (
                <div className="absolute top-10 right-0 w-48 bg-primary border border-secondary rounded-lg shadow-neon z-[100]">
                  <Link
                    to="/services"
                    className="block px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm"
                    onClick={(e) => handleNavClick("services", e)}
                  >
                    Services
                  </Link>
                  <Link
                    to="/leadership"
                    className="block px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm"
                    onClick={(e) => handleNavClick("leadership", e)}
                  >
                    Leadership
                  </Link>
                  <Link
                    to="/blog"
                    className="block px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm"
                    onClick={(e) => handleNavClick("blog", e)}
                  >
                    Blog
                  </Link>
                  <Link
                    to="/join-us"
                    className="block px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm"
                    onClick={(e) => handleNavClick("join-us", e)}
                  >
                    Join Us
                  </Link>
                  <Link
                    to="/Feedback"
                    className="block px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm"
                    onClick={(e) => handleNavClick("Feedback", e)}
                  >
                    Feedback
                  </Link>
                  {/* NEW: Transport link */}
                  <Link
                    to="/transport"
                    className="block px-4 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm"
                    onClick={(e) => handleNavClick("transport", e)}
                  >
                    Transport
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right side: Auth / Profile */}
        <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4 md:gap-5">
          {!isAuthInitialized ? (
            // Show loading spinner while determining auth status
            <div className="hidden lg:block w-8 h-8 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-secondary text-sm"></i>
            </div>
          ) : (
            <>
              {/* Profile avatar when logged in */}
              {isMainWebsiteLoggedIn && (
                <div className="hidden lg:block profile-dropdown" ref={dropdownRef}>
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-sm cursor-pointer flex-shrink-0"
                    onClick={handleProfileDropdown}
                  >
                    {getUserInitials()}
                  </div>
                  {showProfileDropdown && (
                    <div className="absolute top-14 right-4 w-72 bg-primary border border-secondary rounded-lg shadow-neon z-[100]">
                      {isEditing ? (
                        <div className="p-4">
                          <h3 className="text-secondary font-bold text-lg mb-3">Edit Profile</h3>
                          {editError && <div className="mb-3 p-2 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">{editError}</div>}
                          {editSuccess && <div className="mb-3 p-2 bg-green-500/20 border border-green-500 rounded text-green-400 text-sm">{editSuccess}</div>}
                          <form onSubmit={handleEditSubmit} className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            <div>
                              <label className="block text-xs text-gray-400">Full Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-1.5 text-sm text-light focus:outline-none focus:border-secondary"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400">Email</label>
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-1.5 text-sm text-light focus:outline-none focus:border-secondary"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400">Phone</label>
                              <input
                                type="tel"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-1.5 text-sm text-light focus:outline-none focus:border-secondary"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400">Country</label>
                              <input
                                type="text"
                                value={editCountry}
                                onChange={(e) => setEditCountry(e.target.value)}
                                className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-1.5 text-sm text-light focus:outline-none focus:border-secondary"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 bg-secondary text-dark text-sm font-medium py-2 rounded hover:bg-accent transition-colors disabled:opacity-50"
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="flex-1 border border-gray-600 text-light text-sm font-medium py-2 rounded hover:bg-primary/80 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b border-secondary bg-secondary/10">
                            <p className="font-bold text-secondary text-sm truncate">
                              {getUserRole()}
                            </p>
                            <p className="text-xs text-gray-300 truncate mt-1">
                              {getUserEmail() || "No email"}
                            </p>
                          </div>

                          <div className="px-4 py-4 border-b border-gray-700">
                            <h3 className="text-secondary font-bold text-sm mb-3">ACCOUNT INFORMATION</h3>
                            <div className="space-y-3">
                              <div className="flex items-start">
                                <span className="text-xs text-gray-400 min-w-20">Full Name:</span>
                                <span className="text-light font-medium text-sm ml-2 break-words flex-1">
                                  {getUserFullName()}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-xs text-gray-400 min-w-20">Email:</span>
                                <span className="text-light font-medium text-sm ml-2 break-words flex-1">
                                  {getUserEmail()}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-xs text-gray-400 min-w-20">Phone:</span>
                                <span className="text-light font-medium text-sm ml-2 break-words flex-1">
                                  {getUserPhone()}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-xs text-gray-400 min-w-20">Country:</span>
                                <span className="text-light font-medium text-sm ml-2 break-words flex-1">
                                  {getUserCountry()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={startEditing}
                            className="flex items-center gap-3 px-4 py-3 text-light hover:bg-blue-600/20 hover:text-blue-400 transition-colors text-sm w-full text-left border-b border-gray-700"
                          >
                            <i className="fas fa-pencil-alt w-5 text-center text-blue-400"></i>
                            <span className="font-medium">Edit Profile</span>
                          </button>

                          <a
                            href="#signout"
                            onClick={handleSignOutClick}
                            className="flex items-center gap-3 px-4 py-3 text-light hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm"
                          >
                            <i className="fas fa-sign-out-alt w-5 text-center"></i>
                            <span className="font-medium">Sign Out</span>
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sign In/Sign Up buttons when not logged in */}
              {!isMainWebsiteLoggedIn && (
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
            </>
          )}

          {/* Mobile Menu Toggle - shown only when isMobileView true */}
          {isMobileView && (
            <button
              onClick={() => toggleMobileMenu()}
              className="text-light hover:text-secondary transition-colors z-50 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
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

      {/* Mobile Menu - appears when isMobileView true and menu open */}
      {isMobileView && isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 sm:top-16 md:top-18 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => toggleMobileMenu(false)}></div>
          <nav className="absolute top-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-secondary shadow-neon max-h-[85vh] overflow-y-auto">
            <ul className="flex flex-col items-center gap-0 px-4 py-4">
              {/* Mobile nav links - all items shown */}
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
              {/* NEW: Transport link in mobile menu */}
              <li className="w-full">
                <Link
                  to="/transport"
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base ${isMobileActivePage("transport")}`}
                  onClick={(e) => { handleNavClick("transport", e); toggleMobileMenu(false); }}
                >
                  Transport
                </Link>
              </li>

              {/* Mobile auth section */}
              {!isAuthInitialized ? (
                <li className="w-full pt-5 mt-4 border-t border-gray-700">
                  <div className="flex justify-center py-4">
                    <i className="fas fa-spinner fa-spin text-secondary text-lg"></i>
                  </div>
                </li>
              ) : (
                isMainWebsiteLoggedIn ? (
                  <li className="w-full pt-5 mt-4 border-t border-gray-700">
                    {isLoadingProfile ? (
                      <div className="px-4 py-4 flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-secondary text-lg mr-2"></i>
                        <span className="text-light">Loading profile...</span>
                      </div>
                    ) : (
                      <div className="px-4 py-4 bg-primary/80 rounded-lg">
                        {isEditing ? (
                          <>
                            <h3 className="text-secondary font-bold text-lg mb-3">Edit Profile</h3>
                            {editError && <div className="mb-3 p-2 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">{editError}</div>}
                            {editSuccess && <div className="mb-3 p-2 bg-green-500/20 border border-green-500 rounded text-green-400 text-sm">{editSuccess}</div>}
                            <form onSubmit={handleEditSubmit} className="space-y-3">
                              <div>
                                <label className="block text-xs text-gray-400">Full Name</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-secondary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400">Email</label>
                                <input
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-secondary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400">Phone</label>
                                <input
                                  type="tel"
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                  className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-secondary"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400">Country</label>
                                <input
                                  type="text"
                                  value={editCountry}
                                  onChange={(e) => setEditCountry(e.target.value)}
                                  className="w-full bg-primary/80 border border-gray-600 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-secondary"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  type="submit"
                                  disabled={isSaving}
                                  className="flex-1 bg-secondary text-dark text-sm font-medium py-2 rounded hover:bg-accent transition-colors disabled:opacity-50"
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="flex-1 border border-gray-600 text-light text-sm font-medium py-2 rounded hover:bg-primary/80 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 mb-4">
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

                            <div className="border-t border-gray-700 pt-4">
                              <h3 className="text-secondary font-bold text-sm mb-3">ACCOUNT INFORMATION</h3>
                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <span className="text-xs text-gray-400 min-w-24">Full Name:</span>
                                  <span className="text-light text-sm ml-2 break-words flex-1">
                                    {getUserFullName()}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="text-xs text-gray-400 min-w-24">Email:</span>
                                  <span className="text-light text-sm ml-2 break-words flex-1">
                                    {getUserEmail()}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="text-xs text-gray-400 min-w-24">Phone:</span>
                                  <span className="text-light text-sm ml-2 break-words flex-1">
                                    {getUserPhone()}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="text-xs text-gray-400 min-w-24">Country:</span>
                                  <span className="text-light text-sm ml-2 break-words flex-1">
                                    {getUserCountry()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={startEditing}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500 rounded-lg text-light transition-all duration-200 text-base"
                            >
                              <i className="fas fa-pencil-alt text-blue-400"></i>
                              <span className="font-medium">Edit Profile</span>
                            </button>

                            <a
                              href="#signout"
                              onClick={handleSignOutClick}
                              className="font-medium hover:text-red-400 transition-colors block py-3 px-4 rounded-lg text-center border border-red-500 hover:bg-red-500/10 transition-all duration-200 text-base mt-3"
                            >
                              Sign Out
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                ) : (
                  /* Show Sign In/Sign Up when NOT logged in (mobile) */
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
                )
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;