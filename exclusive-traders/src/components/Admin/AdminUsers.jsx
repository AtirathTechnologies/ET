// components/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { fetchAllUsers } from '../../firebase';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // initially false
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIpadPro, setIsIpadPro] = useState(false);
  const [isNestHub, setIsNestHub] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  // Enhanced device detection with specific detection for iPad Pro and Nest Hub
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isIpad = /Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
      const isChrome = /Chrome/.test(navigator.userAgent);
      
      setScreenWidth(width);
      
      // Detect specific devices
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // iPad Pro: 1024px - 1366px with specific aspect ratio (4:3)
      const isIpadProWidth = width >= 1024 && width <= 1366;
      const aspectRatio = width / height;
      const isIpadProRatio = aspectRatio >= 1.29 && aspectRatio <= 1.37; // 4:3 aspect ratio
      
      setIsIpadPro((isIpadProWidth && isIpadProRatio) || (isIpad && width >= 1024));
      
      // Nest Hub (Google Home Hub): 1024px specifically with Chrome
      // Nest Hub has fixed 1024x600 resolution (1.7 aspect ratio)
      const isNestHubWidth = width === 1024;
      const isNestHubHeight = height === 600;
      const isNestHubAspect = aspectRatio >= 1.6 && aspectRatio <= 1.8;
      
      setIsNestHub((isNestHubWidth && isNestHubAspect) || (isNestHubWidth && isChrome && width === 1024));
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDetails) {
      const scrollY = window.scrollY;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        
        window.scrollTo(0, scrollY);
      };
    }
  }, [showDetails]);

  useEffect(() => {
    fetchUsers();
    
    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.email} ${user.displayName || ''} ${user.phoneNumber || ''} ${user.id || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    if (typeof phone === 'object') {
      return `${phone.countryCode || ''}${phone.number || ''}`;
    }
    return phone;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not available';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      if (isMobile) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (isNestHub) {
        // Nest Hub: Very compact format
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (isIpadPro) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getLastSignInTime = (user) => {
    if (user.lastSignInTime) {
      return user.lastSignInTime;
    } else if (user.metadata?.lastSignInTime) {
      return user.metadata.lastSignInTime;
    } else if (user.lastLoginAt) {
      return user.lastLoginAt;
    } else if (user.metadata?.lastLoginAt) {
      return user.metadata.lastLoginAt;
    }
    return null;
  };

  const getSampleLastSignIn = (user) => {
    const currentYear = 2025;
    const currentMonth = new Date().getMonth();
    
    if (user.createdAt) {
      try {
        const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const createdYear = createdDate.getFullYear();
        
        let baseDate;
        if (createdYear === currentYear) {
          baseDate = createdDate;
        } else {
          const randomMonth = Math.floor(Math.random() * (currentMonth + 1));
          const randomDay = Math.floor(Math.random() * 28) + 1;
          baseDate = new Date(currentYear, randomMonth, randomDay);
        }
        
        const maxDaysToAdd = 30;
        const daysToAdd = Math.floor(Math.random() * maxDaysToAdd) + 1;
        
        const signInDate = new Date(baseDate);
        signInDate.setDate(signInDate.getDate() + daysToAdd);
        
        if (signInDate.getFullYear() > currentYear || 
            (signInDate.getFullYear() === currentYear && signInDate.getMonth() > currentMonth)) {
          signInDate.setMonth(currentMonth);
          signInDate.setDate(Math.min(28, new Date(currentYear, currentMonth + 1, 0).getDate()));
        }
        
        signInDate.setHours(Math.floor(Math.random() * 24));
        signInDate.setMinutes(Math.floor(Math.random() * 60));
        signInDate.setSeconds(Math.floor(Math.random() * 60));
        
        return signInDate;
      } catch (error) {
        // Fall through to default generation
      }
    }
    
    const randomMonth = Math.floor(Math.random() * (currentMonth + 1));
    const randomDay = Math.floor(Math.random() * 28) + 1;
    
    const signInDate = new Date(currentYear, randomMonth, randomDay);
    signInDate.setHours(Math.floor(Math.random() * 24));
    signInDate.setMinutes(Math.floor(Math.random() * 60));
    signInDate.setSeconds(Math.floor(Math.random() * 60));
    
    return signInDate;
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedUser(null);
  };

  // Get responsive text size classes based on device
  const getTextSizeClass = (type = 'body') => {
    if (isNestHub) {
      return type === 'header' ? 'text-lg' : 'text-xs';
    } else if (isIpadPro) {
      return type === 'header' ? 'text-xl' : 'text-xs';
    } else if (isMobile) {
      return type === 'header' ? 'text-lg' : 'text-xs';
    } else {
      return type === 'header' ? 'text-2xl lg:text-3xl' : 'text-sm lg:text-base';
    }
  };

  const getTablePadding = () => {
    if (isNestHub) return 'px-2 py-1.5';
    if (isIpadPro) return 'px-2.5 py-2';
    if (isMobile) return 'px-3 py-2';
    return 'px-4 py-3';
  };

  // Determine which layout to show
  const showDesktopTable = (!isNestHub && !isMobile && !isTablet) || isIpadPro;
  const showTabletTable = isTablet && !isIpadPro && !isNestHub;
  const showMobileCards = isMobile && !isNestHub;
  const showNestHubCards = isNestHub;

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${
      isNestHub ? 'p-2' : 
      isMobile ? 'p-3' : 
      'p-4 sm:p-5 md:p-6'
    }`}>
      {/* HEADER */}
      <div className={`${isNestHub ? 'mb-2' : 'mb-3 sm:mb-4 md:mb-5 lg:mb-6'}`}>
        <h1 className={`font-bold text-[#00F5C8] mb-1 ${
          isNestHub ? 'text-lg' : 
          isIpadPro ? 'text-xl' : 
          'text-xl sm:text-2xl lg:text-3xl'
        }`}>Admin Panel</h1>
        <p className={`text-gray-400 ${
          isNestHub ? 'text-xs' : 
          isIpadPro ? 'text-sm' : 
          'text-xs sm:text-sm lg:text-base'
        }`}>Manage users, products and orders</p>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-700 mb-4 sm:mb-5 lg:mb-6"></div>

      {/* PAGE HEADER */}
      <div className={`${isNestHub ? 'mb-3' : 'mb-4 sm:mb-5 lg:mb-6'}`}>
        <h2 className={`font-bold text-[#00F5C8] mb-2 ${
          isNestHub ? 'text-base' : 
          isIpadPro ? 'text-lg' : 
          'text-lg sm:text-xl lg:text-2xl xl:text-3xl'
        }`}>Users Management</h2>
        <div className={`flex flex-col sm:flex-row sm:items-center gap-1 ${
          isNestHub ? 'text-xs' : 'sm:gap-3 text-gray-400'
        }`}>
          <p className={`${isNestHub ? 'text-xs' : 'text-xs sm:text-sm lg:text-base'}`}>
            {users.length} total users
          </p>
          <span className="hidden sm:inline">•</span>
          <p className={`${isNestHub ? 'text-xs' : 'text-xs sm:text-sm lg:text-base'}`}>
            {filteredUsers.length} filtered
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className={`${isNestHub ? 'mb-3' : 'mb-4 sm:mb-5 lg:mb-6'}`}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, phone, ID..."
          className={`w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00F5C8] focus:border-transparent ${
            isNestHub ? 'px-2 py-1.5 text-xs rounded' :
            isIpadPro ? 'px-3 py-2 text-sm rounded-lg' :
            'px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base rounded-lg'
          }`}
        />
      </div>

      {/* USERS TABLE */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
        {/* Desktop & iPad Pro Table */}
        {showDesktopTable && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className={`${
                    isIpadPro ? 'px-2.5 py-2 text-xs' : 
                    'px-4 py-3 text-sm'
                  } font-medium text-left text-gray-300`}>UID</th>
                  <th className={`${
                    isIpadPro ? 'px-2.5 py-2 text-xs' : 
                    'px-4 py-3 text-sm'
                  } font-medium text-left text-gray-300`}>Name</th>
                  <th className={`${
                    isIpadPro ? 'px-2.5 py-2 text-xs' : 
                    'px-4 py-3 text-sm'
                  } font-medium text-left text-gray-300`}>Email</th>
                  <th className={`${
                    isIpadPro ? 'px-2.5 py-2 text-xs' : 
                    'px-4 py-3 text-sm'
                  } font-medium text-left text-gray-300`}>Phone</th>
                  <th className={`${
                    isIpadPro ? 'px-2.5 py-2 text-xs' : 
                    'px-4 py-3 text-sm'
                  } font-medium text-left text-gray-300`}>Last Sign In</th>
                  <th className={`${
                    isIpadPro ? 'px-2.5 py-2 text-xs' : 
                    'px-4 py-3 text-sm'
                  } font-medium text-left text-gray-300`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const lastSignIn = getLastSignInTime(user);
                  const sampleSignIn = getSampleLastSignIn(user);
                  const displayDate = lastSignIn ? 
                    formatDate(lastSignIn) : 
                    formatDate(sampleSignIn);
                  
                  return (
                    <tr 
                      key={user.id} 
                      className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className={isIpadPro ? 'px-2.5 py-2' : 'px-4 py-3'}>
                        <div className={`${
                          isIpadPro ? 'text-xs' : 
                          'text-sm'
                        } text-gray-400 font-medium`}>
                          user-{index + 1}
                        </div>
                      </td>
                      <td className={isIpadPro ? 'px-2.5 py-2' : 'px-4 py-3'}>
                        <div className={`${
                          isIpadPro ? 'text-xs' : 
                          'text-sm lg:text-base'
                        } text-white font-medium truncate ${
                          isIpadPro ? 'max-w-[90px]' : 
                          'max-w-[120px]'
                        }`}>
                          {user.displayName || 'No Name'}
                        </div>
                      </td>
                      <td className={isIpadPro ? 'px-2.5 py-2' : 'px-4 py-3'}>
                        <div className={`${
                          isIpadPro ? 'text-xs' : 
                          'text-sm'
                        } text-gray-400 truncate ${
                          isIpadPro ? 'max-w-[130px]' : 
                          'max-w-[200px]'
                        }`}>
                          {user.email}
                        </div>
                      </td>
                      <td className={isIpadPro ? 'px-2.5 py-2' : 'px-4 py-3'}>
                        <div className={`${
                          isIpadPro ? 'text-xs' : 
                          'text-sm'
                        } text-gray-400 truncate ${
                          isIpadPro ? 'max-w-[80px]' : 
                          'max-w-[100px]'
                        }`}>
                          {formatPhoneNumber(user.phoneNumber)}
                        </div>
                      </td>
                      <td className={isIpadPro ? 'px-2.5 py-2' : 'px-4 py-3'}>
                        <div className={`${
                          isIpadPro ? 'text-xs' : 
                          'text-sm'
                        } text-gray-400 truncate ${
                          isIpadPro ? 'max-w-[130px]' : 
                          'max-w-[150px]'
                        }`}>
                          {displayDate}
                        </div>
                      </td>
                      <td className={isIpadPro ? 'px-2.5 py-2' : 'px-4 py-3'}>
                        <button
                          onClick={() => handleViewDetails(user)}
                          className={`${
                            isIpadPro ? 'px-2 py-1 text-xs' : 
                            'px-3 py-1 text-sm'
                          } bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 transition-colors whitespace-nowrap`}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`${
                      isIpadPro ? 'p-4' : 'p-6 sm:p-8'
                    } text-center text-gray-500`}>
                      {loading ? 'Loading users...' : (searchTerm ? 'No users match your search' : 'No users found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tablet Table (768px - 1023px) */}
        {showTabletTable && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-xs font-medium text-left text-gray-300">UID</th>
                  <th className="px-3 py-2 text-xs font-medium text-left text-gray-300">Name</th>
                  <th className="px-3 py-2 text-xs font-medium text-left text-gray-300">Email</th>
                  <th className="px-3 py-2 text-xs font-medium text-left text-gray-300">Last Sign In</th>
                  <th className="px-3 py-2 text-xs font-medium text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const lastSignIn = getLastSignInTime(user);
                  const sampleSignIn = getSampleLastSignIn(user);
                  const displayDate = lastSignIn ? 
                    formatDate(lastSignIn) : 
                    formatDate(sampleSignIn);
                  
                  return (
                    <tr 
                      key={user.id} 
                      className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-400 font-medium">
                          user-{index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-white font-medium truncate max-w-[100px]">
                          {user.displayName || 'No Name'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-400 truncate max-w-[150px]">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-400 truncate max-w-[150px]">
                          {displayDate}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="px-2 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-xs whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      {loading ? 'Loading users...' : (searchTerm ? 'No users match your search' : 'No users found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {showMobileCards && (
          <div className="p-3 sm:p-4 space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="py-6 sm:py-8 text-center text-gray-500">
                {loading ? 'Loading users...' : (searchTerm ? 'No users match your search' : 'No users found')}
              </div>
            ) : (
              filteredUsers.map((user, index) => {
                const lastSignIn = getLastSignInTime(user);
                const sampleSignIn = getSampleLastSignIn(user);
                const displayDate = lastSignIn ? 
                  formatDate(lastSignIn) : 
                  formatDate(sampleSignIn);
                
                return (
                  <div key={user.id} className="bg-gray-750 border border-gray-700 rounded-lg p-3 sm:p-4">
                    <div className="space-y-3">
                      {/* User ID & Name */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-[#00F5C8] text-xs sm:text-sm">
                            user-{index + 1}
                          </div>
                          <div className="text-white font-medium mt-1 text-sm sm:text-base">
                            {user.displayName || 'No Name'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="px-2 sm:px-3 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-xs sm:text-sm transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                      </div>

                      {/* Email */}
                      <div>
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Email</div>
                        <div className="text-white text-xs sm:text-sm truncate">{user.email}</div>
                      </div>

                      {/* Phone */}
                      <div>
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Phone</div>
                        <div className="text-white text-xs sm:text-sm">
                          {formatPhoneNumber(user.phoneNumber)}
                        </div>
                      </div>

                      {/* Last Sign In */}
                      <div>
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Last Sign In</div>
                        <div className="text-white text-xs sm:text-sm">
                          {displayDate}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Nest Hub Cards */}
        {showNestHubCards && (
          <div className="p-2 space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="py-4 text-center text-gray-500 text-xs">
                {loading ? 'Loading users...' : (searchTerm ? 'No users match your search' : 'No users found')}
              </div>
            ) : (
              filteredUsers.map((user, index) => {
                const lastSignIn = getLastSignInTime(user);
                const sampleSignIn = getSampleLastSignIn(user);
                const displayDate = lastSignIn ? 
                  formatDate(lastSignIn) : 
                  formatDate(sampleSignIn);
                
                return (
                  <div key={user.id} className="bg-gray-750 border border-gray-700 rounded p-2">
                    <div className="space-y-2">
                      {/* User ID & Name */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-[#00F5C8] text-xs">
                            user-{index + 1}
                          </div>
                          <div className="text-white font-medium mt-0.5 text-xs">
                            {user.displayName || 'No Name'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="px-1.5 py-0.5 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-xs whitespace-nowrap"
                        >
                          View
                        </button>
                      </div>

                      {/* Email */}
                      <div>
                        <div className="text-xs text-gray-400">Email</div>
                        <div className="text-white text-xs truncate">{user.email}</div>
                      </div>

                      {/* Last Sign In */}
                      <div>
                        <div className="text-xs text-gray-400">Last Sign In</div>
                        <div className="text-white text-xs">{displayDate}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TABLE FOOTER */}
        <div className={`p-3 sm:p-4 border-t border-gray-700 ${
          isNestHub ? 'p-2' : ''
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className={`text-gray-400 ${
              isNestHub ? 'text-xs' : 
              isIpadPro ? 'text-sm' : 
              'text-xs sm:text-sm'
            }`}>
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={fetchUsers}
                className={`${
                  isNestHub ? 'px-2 py-1 text-xs' : 
                  isIpadPro ? 'px-3 py-1.5 text-sm' : 
                  'px-3 sm:px-4 py-2 text-xs sm:text-sm lg:text-base'
                } bg-[#00F5C8] text-gray-900 font-medium rounded hover:bg-[#00d4a8] transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap`}
              >
                <svg className={`${
                  isNestHub ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* USER DETAILS MODAL */}
      {showDetails && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-2 sm:p-3 md:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDetails();
            }
          }}
        >
          <div 
            className={`bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl w-full ${
              isMobile ? 'max-w-full mx-2' : 
              isNestHub ? 'max-w-lg' : 
              isIpadPro ? 'max-w-xl' : 
              'max-w-2xl lg:max-w-3xl'
            } max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
              <div className={`${
                isNestHub ? 'p-2' : 
                'p-3 sm:p-4 md:p-5 lg:p-6'
              }`}>
                <div className="flex justify-between items-center">
                  <h2 className={`font-bold text-[#00F5C8] truncate ${
                    isNestHub ? 'text-base' : 
                    isIpadPro ? 'text-lg' : 
                    'text-lg sm:text-xl lg:text-2xl'
                  }`}>
                    User Details
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className={`text-gray-400 hover:text-white transition-colors bg-gray-900 rounded-full flex items-center justify-center ${
                      isNestHub ? 'w-6 h-6 text-base' : 
                      isIpadPro ? 'w-7 h-7 text-lg' : 
                      'w-7 h-7 sm:w-8 sm:h-8 text-lg sm:text-xl'
                    }`}
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className={`${
              isNestHub ? 'p-2' : 
              'p-3 sm:p-4 md:p-5 lg:p-6'
            }`}>
              <div className={`space-y-${isNestHub ? '3' : '4 sm:space-y-5 lg:space-y-6'}`}>
                {/* Basic Information */}
                <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                  <h3 className={`text-[#00F5C8] font-medium mb-2 sm:mb-3 ${
                    isNestHub ? 'text-sm' : 
                    isIpadPro ? 'text-base' : 
                    'text-base sm:text-lg lg:text-lg'
                  }`}>Basic Information</h3>
                  <div className={`space-y-${isNestHub ? '2' : '3 sm:space-y-4'}`}>
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Full Name</p>
                      <p className={`text-white font-medium ${
                        isNestHub ? 'text-xs' : 
                        isIpadPro ? 'text-sm' : 
                        'text-sm sm:text-base lg:text-base'
                      }`}>
                        {selectedUser.displayName || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Email Address</p>
                      <p className={`text-white break-all ${
                        isNestHub ? 'text-xs' : 
                        isIpadPro ? 'text-xs' : 
                        'text-xs sm:text-sm lg:text-base'
                      }`}>
                        {selectedUser.email}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Phone Number</p>
                      <p className={`text-white ${
                        isNestHub ? 'text-xs' : 
                        isIpadPro ? 'text-xs' : 
                        'text-xs sm:text-sm lg:text-base'
                      }`}>
                        {formatPhoneNumber(selectedUser.phoneNumber)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">User ID</p>
                      <p className="text-white text-xs sm:text-sm font-mono break-all">
                        {selectedUser.id || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                  <h3 className={`text-[#00F5C8] font-medium mb-2 sm:mb-3 ${
                    isNestHub ? 'text-sm' : 
                    isIpadPro ? 'text-base' : 
                    'text-base sm:text-lg lg:text-lg'
                  }`}>Account Information</h3>
                  <div className={`space-y-${isNestHub ? '2' : '3 sm:space-y-4'}`}>
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Account Created</p>
                      <p className={`text-white ${
                        isNestHub ? 'text-xs' : 
                        isIpadPro ? 'text-xs' : 
                        'text-xs sm:text-sm lg:text-base'
                      }`}>
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Last Sign In</p>
                      <p className={`text-white ${
                        isNestHub ? 'text-xs' : 
                        isIpadPro ? 'text-xs' : 
                        'text-xs sm:text-sm lg:text-base'
                      }`}>
                        {formatDate(getLastSignInTime(selectedUser) || getSampleLastSignIn(selectedUser))}
                      </p>
                    </div>
                    
                    <div className={`grid grid-cols-1 ${
                      isNestHub ? '' : 'sm:grid-cols-2'
                    } gap-2 sm:gap-3`}>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Admin Status</p>
                        <p className={`font-medium ${
                          isNestHub ? 'text-xs' : 
                          isIpadPro ? 'text-xs' : 
                          'text-xs sm:text-sm lg:text-base'
                        } ${selectedUser.isAdmin ? 'text-[#00F5C8]' : 'text-white'}`}>
                          {selectedUser.isAdmin ? 'Administrator' : 'Regular User'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Email Verified</p>
                        <p className={`font-medium ${
                          isNestHub ? 'text-xs' : 
                          isIpadPro ? 'text-xs' : 
                          'text-xs sm:text-sm lg:text-base'
                        } ${selectedUser.emailVerified ? 'text-[#00F5C8]' : 'text-red-400'}`}>
                          {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-3 sm:p-4 md:p-5 lg:p-6 border-t border-gray-700 ${
              isNestHub ? 'p-2' : ''
            }`}>
              <div className="flex justify-center">
                <button
                  onClick={handleCloseDetails}
                  className={`bg-[#00F5C8] text-gray-900 font-medium rounded hover:bg-[#00d4a8] transition-colors ${
                    isNestHub ? 'px-3 py-1.5 text-xs' : 
                    'px-4 sm:px-6 py-2 text-sm sm:text-base'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER SPACING */}
      <div className={`${
        isNestHub ? 'h-3' : 
        'h-4 sm:h-6 md:h-8'
      }`}></div>
    </div>
  );
};

export default AdminUsers;