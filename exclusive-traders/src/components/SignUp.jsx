// SignUp.jsx - Saves user data to users collection with pending status
import { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { ref, set, get } from "firebase/database";

const SignUp = ({ navigateToPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  // Manual text fields for location (no dropdowns)
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("displayName");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength indicators
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Refs for each input field
  const displayNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const pincodeRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const formRef = useRef(null);

  // Country options for phone code (unchanged)
  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10 },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10 },
    { value: "+44", flag: "🇬🇧", name: "UK", length: 10 },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9 },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9 },
    { value: "+98", flag: "🇮🇷", name: "Iran", length: 10 },
    { value: "+968", flag: "🇴🇲", name: "Oman", length: 8 },
    { value: "+49", flag: "🇩🇪", name: "Germany", length: 10 },
    { value: "+33", flag: "🇫🇷", name: "France", length: 9 },
    { value: "+65", flag: "🇸🇬", name: "Singapore", length: 8 },
    { value: "+81", flag: "🇯🇵", name: "Japan", length: 10 },
    { value: "+86", flag: "🇨🇳", name: "China", length: 11 },
    { value: "+1", flag: "🇨🇦", name: "Canada", length: 10 }
  ];

  useEffect(() => {
    // Scroll form into view with header offset
    setTimeout(() => {
      if (formRef.current) {
        const headerHeight = 64;
        const elementPosition = formRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  }, []);

  // Check password strength
  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [password]);

  // Get current country's phone number length
  const getCurrentCountryLength = () => {
    const country = countryOptions.find(opt => opt.value === countryCode);
    return country ? country.length : 10;
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const maxLength = getCurrentCountryLength();
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      setPhoneNumber(value);
    }
  };

  // Generic pincode validation (no country‑specific rules)
  const getPincodeRequirements = () => {
    return {
      min: 2,
      max: 10,
      pattern: /^[A-Z0-9\s-]{2,10}$/i,
      placeholder: "Postal code / Pincode"
    };
  };

  const pincodeReq = getPincodeRequirements();

  const isValidPincode = (code) => {
    if (!code) return false;
    const trimmed = code.trim();
    return pincodeReq.pattern.test(trimmed) && trimmed.length >= pincodeReq.min && trimmed.length <= pincodeReq.max;
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    setPincode(value);
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle Enter key press to move to next field
  const handleKeyDown = (e, nextField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextFieldMap = {
        'displayName': () => {
          if (emailRef.current) {
            emailRef.current.focus();
            setActiveField('email');
          }
        },
        'email': () => {
          if (phoneNumberRef.current) {
            phoneNumberRef.current.focus();
            setActiveField('phoneNumber');
          }
        },
        'phoneNumber': () => {
          if (countryRef.current) {
            countryRef.current.focus();
            setActiveField('country');
          }
        },
        'country': () => {
          if (stateRef.current) {
            stateRef.current.focus();
            setActiveField('state');
          }
        },
        'state': () => {
          if (cityRef.current) {
            cityRef.current.focus();
            setActiveField('city');
          }
        },
        'city': () => {
          if (pincodeRef.current) {
            pincodeRef.current.focus();
            setActiveField('pincode');
          }
        },
        'pincode': () => {
          if (passwordRef.current) {
            passwordRef.current.focus();
            setActiveField('password');
          }
        },
        'password': () => {
          if (confirmPasswordRef.current) {
            confirmPasswordRef.current.focus();
            setActiveField('confirmPassword');
          }
        },
        'confirmPassword': () => {
          if (isFormValid() && !loading) {
            handleSubmit(e);
          }
        }
      };
      if (nextFieldMap[nextField]) {
        nextFieldMap[nextField]();
      }
    }
  };

  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  // Check if password is strong enough
  const isPasswordStrong = () => {
    return (
      password.length >= 8 &&
      passwordChecks.uppercase &&
      passwordChecks.lowercase &&
      passwordChecks.number &&
      passwordChecks.special
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate password match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      if (!isPasswordStrong()) {
        throw new Error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
      }

      // Validate manual location fields
      if (!country.trim()) {
        throw new Error("Please enter your country");
      }
      if (!state.trim()) {
        throw new Error("Please enter your state or province");
      }
      if (!city.trim()) {
        throw new Error("Please enter your city or town");
      }
      if (!pincode.trim()) {
        throw new Error("Please enter your pincode or ZIP code");
      }
      if (!isValidPincode(pincode)) {
        throw new Error(`Invalid format. ${pincodeReq.placeholder} must be 2–10 characters (letters, numbers, spaces, hyphens).`);
      }

      // Validate phone number
      const requiredLength = getCurrentCountryLength();
      if (phoneNumber.length !== requiredLength) {
        const country = countryOptions.find(opt => opt.value === countryCode);
        throw new Error(`Phone number must be exactly ${requiredLength} digits for ${country?.name || 'selected country'}`);
      }

      // Validate email format
      if (!email) {
        throw new Error("Please enter your email address");
      }
      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address (e.g., name@domain.com)");
      }

      // Validate display name
      if (!displayName.trim()) {
        throw new Error("Please enter your full name");
      }

      // BLOCK admin email
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail === "admin@exclusivetrader.com") {
        throw new Error("This email is reserved for system administrators.");
      }

      // Check if email already exists in users collection
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const existingUser = Object.values(users).find(user => 
          user.email && user.email.toLowerCase() === normalizedEmail
        );
        if (existingUser) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }
      }

      // Generate a unique sequential user ID
      const allUsersRef = ref(db, 'users');
      const allUsersSnapshot = await get(allUsersRef);
      let nextNum = 1;
      if (allUsersSnapshot.exists()) {
        const usersObj = allUsersSnapshot.val();
        const keys = Object.keys(usersObj);
        let maxNum = 0;
        keys.forEach(k => {
          if (k.startsWith('user-')) {
            const num = parseInt(k.substring(5), 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
        nextNum = maxNum + 1;
      }
      const tempUserId = `user-${nextNum}`;
      const fullPhone = `${countryCode} ${phoneNumber}`;

      // Store user data in users collection with pending status
      const userRef = ref(db, `users/${tempUserId}`);
      await set(userRef, {
        id: tempUserId,
        email: normalizedEmail,
        password: password,
        displayName: displayName.trim(),
        fullName: displayName.trim(),
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        phone: fullPhone,
        phoneNumber: {
          countryCode,
          number: phoneNumber,
          fullNumber: fullPhone
        },
        address: {
          country: country.trim(),
          state: state.trim(),
          city: city.trim(),
          pincode: pincode.trim()
        },
        role: "user",
        isAdmin: false,
        isVerified: false,
        isActive: true,
        accountStatus: "pending",
        createdAt: new Date().toISOString(),
        tempUserId: tempUserId
      });

      console.log("✅ User data saved with pending status – Firebase Auth will be created after first sign-in");

      // Clear any existing remembered credentials
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');

      // Redirect to signin page
      setError("");
      setTimeout(() => {
        navigateToPage("signin");
      }, 500);

    } catch (err) {
      console.error("❌ Sign up error:", err);
      setError(err.message || "Failed to save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get placeholder text for phone
  const getPhonePlaceholder = () => {
    const country = countryOptions.find(opt => opt.value === countryCode);
    const length = country ? country.length : 10;
    return `${length}-digit phone number`;
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      displayName.trim() &&
      email &&
      isValidEmail(email) &&
      phoneNumber.length === getCurrentCountryLength() &&
      country.trim() &&
      state.trim() &&
      city.trim() &&
      isValidPincode(pincode) &&
      isPasswordStrong() &&
      password === confirmPassword
    );
  };

  // Calculate password strength percentage
  const getPasswordStrength = () => {
    const checks = Object.values(passwordChecks);
    const passedCount = checks.filter(check => check).length;
    return (passedCount / checks.length) * 100;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <section className="min-h-screen pt-16 pb-8 px-4 bg-dark" ref={formRef}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl text-secondary mb-4 text-shadow-black">
            Create Account
          </h1>
          <p className="text-light text-sm">Join Exclusive Trader community</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-dark/80 p-6 rounded-lg border border-secondary shadow-neon backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2 text-sm"></i>
                <span className="font-medium text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Full Name *</label>
            <input
              ref={displayNameRef}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'displayName')}
              onFocus={() => handleFocus('displayName')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'displayName' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your full name"
              required
              disabled={loading}
              autoComplete="name"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to email</span>
              <span>{displayName.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Email Address *</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'email')}
              onFocus={() => handleFocus('email')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'email' ? 'border-secondary' : 'border-gray-600'
              } ${email && isValidEmail(email) ? 'border-green-500' : ''}`}
              placeholder="Enter your email (e.g., name@domain.com)"
              required
              disabled={loading}
              autoComplete="email"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to phone number</span>
              <span className={email && isValidEmail(email) ? 'text-green-400' : ''}>
                {email && isValidEmail(email) ? '✓' : ''}
              </span>
            </div>
            {email && !isValidEmail(email) && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <i className="fas fa-exclamation-triangle mr-1 text-xs"></i>
                Please enter a valid email
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Phone Number *</label>
            <div className="flex gap-2">
              <div className="relative w-32">
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setPhoneNumber("");
                  }}
                  onFocus={() => handleFocus('countryCode')}
                  className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none appearance-none cursor-pointer text-sm ${
                    activeField === 'countryCode' ? 'border-secondary' : 'border-gray-600'
                  }`}
                  disabled={loading}
                >
                  {countryOptions.map((country) => (
                    <option key={country.value} value={country.value} className="bg-dark">
                      {country.flag} {country.value}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                </div>
              </div>
              <div className="flex-1">
                <input
                  ref={phoneNumberRef}
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onKeyDown={(e) => handleKeyDown(e, 'phoneNumber')}
                  onFocus={() => handleFocus('phoneNumber')}
                  className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                    activeField === 'phoneNumber' ? 'border-secondary' : 'border-gray-600'
                  }`}
                  placeholder={getPhonePlaceholder()}
                  required
                  maxLength={getCurrentCountryLength()}
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to country</span>
              <span>{phoneNumber.length === getCurrentCountryLength() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Country (manual text input) */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Country *</label>
            <input
              ref={countryRef}
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'country')}
              onFocus={() => handleFocus('country')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'country' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your country"
              required
              disabled={loading}
              autoComplete="country"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to state</span>
              <span>{country.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* State/Province (manual text input) */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">State/Province *</label>
            <input
              ref={stateRef}
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'state')}
              onFocus={() => handleFocus('state')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'state' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your state or province"
              required
              disabled={loading}
              autoComplete="address-level1"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to city</span>
              <span>{state.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* City/Town (manual text input) */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">City/Town *</label>
            <input
              ref={cityRef}
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'city')}
              onFocus={() => handleFocus('city')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'city' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your city or town"
              required
              disabled={loading}
              autoComplete="address-level2"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to pincode</span>
              <span>{city.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Pincode/ZIP Code */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Pincode/ZIP Code *</label>
            <input
              ref={pincodeRef}
              type="text"
              value={pincode}
              onChange={handlePincodeChange}
              onKeyDown={(e) => handleKeyDown(e, 'pincode')}
              onFocus={() => handleFocus('pincode')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'pincode' ? 'border-secondary' : 'border-gray-600'
              } ${isValidPincode(pincode) ? 'border-green-500' : ''}`}
              placeholder={pincodeReq.placeholder}
              required
              maxLength={pincodeReq.max}
              disabled={loading}
              autoComplete="postal-code"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to password</span>
              <span className={isValidPincode(pincode) ? 'text-green-400' : ''}>
                {isValidPincode(pincode) ? '✓' : ''}
              </span>
            </div>
            {pincode && !isValidPincode(pincode) && (
              <p className="text-yellow-400 text-xs mt-1 flex items-center">
                <i className="fas fa-info-circle mr-1 text-xs"></i>
                {pincodeReq.placeholder} (2–10 characters, letters/numbers/spaces/hyphens)
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Password *</label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'password')}
                onFocus={() => handleFocus('password')}
                className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm pr-10 ${
                  activeField === 'password' ? 'border-secondary' : 'border-gray-600'
                } ${isPasswordStrong() ? 'border-green-500' : ''}`}
                placeholder="Enter password (min. 8 characters)"
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary focus:outline-none"
                tabIndex="-1"
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} text-sm`}></i>
              </button>
            </div>
            
            {password && !isPasswordStrong() && (
              <p className="text-yellow-400 text-xs mt-1 flex items-center">
                <i className="fas fa-info-circle mr-1 text-xs"></i>
                Password needs to be stronger
              </p>
            )}

            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-light/70">Password strength:</span>
                  <span className="text-xs font-medium">
                    {passwordStrength < 40 ? 'Weak' : passwordStrength < 80 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>
                {password.length === 0 
                  ? "8+ characters required" 
                  : `${password.length} characters`}
              </span>
              <span>{isPasswordStrong() ? '✓' : ''}</span>
            </div>
            {password && !isPasswordStrong() && (
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center ${passwordChecks.length ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.length ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.uppercase ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Uppercase</span>
                </div>
                <div className={`flex items-center ${passwordChecks.lowercase ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.lowercase ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Lowercase</span>
                </div>
                <div className={`flex items-center ${passwordChecks.number ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.number ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Number</span>
                </div>
                <div className={`flex items-center ${passwordChecks.special ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.special ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Special char</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-light mb-1 font-medium text-sm">Confirm Password *</label>
            <div className="relative">
              <input
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'confirmPassword')}
                onFocus={() => handleFocus('confirmPassword')}
                className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm pr-10 ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : activeField === 'confirmPassword'
                    ? 'border-secondary'
                    : 'border-gray-600'
                } ${confirmPassword && password === confirmPassword && isPasswordStrong() ? 'border-green-500' : ''}`}
                placeholder="Confirm your password"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to submit form</span>
              <span>{confirmPassword && password === confirmPassword && isPasswordStrong() ? '✓' : ''}</span>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <i className="fas fa-exclamation-triangle mr-1 text-xs"></i>
                Passwords do not match
              </p>
            )}
          </div>

          {/* Info Message */}
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg text-xs">
            <div className="flex items-start">
              <i className="fas fa-info-circle mr-2 mt-0.5 text-sm"></i>
              <span>
                After signing up, you'll need to sign in with your credentials to activate your account.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`w-full bg-secondary text-dark font-bold py-2 rounded-lg transition-all duration-300 text-sm ${
              loading || !isFormValid()
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-accent hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin text-sm"></i>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-4 pt-4 border-t border-gray-700">
            <p className="text-light text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigateToPage("signin")}
                className="text-secondary font-medium hover:text-accent transition-colors"
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;