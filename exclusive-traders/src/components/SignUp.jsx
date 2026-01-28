// SignUp.jsx - Saves user data to users collection, no Firebase Auth account creation
import { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { ref, set } from "firebase/database";

const SignUp = ({ navigateToPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("displayName"); // Track which field is active

  // Refs for each input field
  const displayNameRef = useRef(null);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const pincodeRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const formRef = useRef(null);

  // Country options
  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10 },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10 },
    { value: "+44", flag: "🇬🇧", name: "UK", length: 10 },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9 },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9 },
    { value: "+98", flag: "🇮🇷", name: "Iran", length: 10 },
  ];

  // Country dropdown options from the image
  const countryDropdownOptions = [
    "India",
    "Oman",
    "United Kingdom",
    "United States",
    "UAE",
    "Australia",
    "Canada",
    "Germany",
    "France",
    "Singapore",
    "Japan",
    "China",
    "Other"
  ];

  useEffect(() => {
    // Scroll form into view with header offset
    setTimeout(() => {
      if (formRef.current) {
        const headerHeight = 64; // h-16 = 4rem = 64px
        const elementPosition = formRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  }, []);

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

  // Handle pincode change
  const handlePincodeChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPincode(value);
    }
  };

  // Handle country change and update country code
  const handleCountryChange = (selectedCountry) => {
    setCountry(selectedCountry);
    
    // Auto-select country code based on country name
    if (selectedCountry === "India") setCountryCode("+91");
    else if (selectedCountry === "United States") setCountryCode("+1");
    else if (selectedCountry === "United Kingdom") setCountryCode("+44");
    else if (selectedCountry === "UAE") setCountryCode("+971");
    else if (selectedCountry === "Australia") setCountryCode("+61");
    else if (selectedCountry === "Canada") setCountryCode("+1");
    else if (selectedCountry === "Oman") setCountryCode("+968");
    else if (selectedCountry === "Germany") setCountryCode("+49");
    else if (selectedCountry === "France") setCountryCode("+33");
    else if (selectedCountry === "Singapore") setCountryCode("+65");
    else if (selectedCountry === "Japan") setCountryCode("+81");
    else if (selectedCountry === "China") setCountryCode("+86");
    else if (selectedCountry === "Other") setCountryCode("+1"); // Default for "Other"
  };

  // Handle Enter key press to move to next field
  const handleKeyDown = (e, nextField) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (nextField === 'country') {
        countryRef.current.focus();
        setActiveField('country');
      } else if (nextField === 'state') {
        stateRef.current.focus();
        setActiveField('state');
      } else if (nextField === 'city') {
        cityRef.current.focus();
        setActiveField('city');
      } else if (nextField === 'pincode') {
        pincodeRef.current.focus();
        setActiveField('pincode');
      } else if (nextField === 'phoneNumber') {
        phoneNumberRef.current.focus();
        setActiveField('phoneNumber');
      } else if (nextField === 'email') {
        emailRef.current.focus();
        setActiveField('email');
      } else if (nextField === 'password') {
        passwordRef.current.focus();
        setActiveField('password');
      } else if (nextField === 'confirmPassword') {
        confirmPasswordRef.current.focus();
        setActiveField('confirmPassword');
      } else if (nextField === 'submit') {
        // If Enter is pressed on confirm password, submit the form
        if (isFormValid() && !loading) {
          handleSubmit(e);
        }
      }
    }
  };

  // Handle field focus
  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
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

      // Validate password length
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Validate country selection
      if (!country || country === "Select Country") {
        throw new Error("Please select your country");
      }

      // Validate state/province
      if (!state.trim()) {
        throw new Error("Please enter your state or province");
      }

      // Validate city/town
      if (!city.trim()) {
        throw new Error("Please enter your city or town");
      }

      // Validate pincode/ZIP code
      if (!pincode.trim()) {
        throw new Error("Please enter your pincode or ZIP code");
      }

      // Validate pincode length (4-10 digits)
      if (pincode.length < 4 || pincode.length > 10) {
        throw new Error("Pincode/ZIP code must be 4-10 digits");
      }

      // Get current country's required length
      const requiredLength = getCurrentCountryLength();
      
      // Validate phone number
      if (phoneNumber.length !== requiredLength) {
        const country = countryOptions.find(opt => opt.value === countryCode);
        throw new Error(`Phone number must be exactly ${requiredLength} digits for ${country?.name || 'selected country'}`);
      }

      // Validate email
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
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

      // Generate a unique temporary ID for the user data
      const tempUserId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store phone number in a format that's easy to parse in BuyModal
      const fullPhone = `${countryCode} ${phoneNumber}`;
      
      // Store user data in users collection with pending status
      const userRef = ref(db, `users/${tempUserId}`);
      await set(userRef, {
        email: normalizedEmail,
        password: password, // Store password for verification on signin
        displayName: displayName.trim(),
        fullName: displayName.trim(), // Add fullName field for BuyModal
        country: country,
        state: state.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        phone: fullPhone, // Store as string for BuyModal compatibility
        phoneNumber: {
          countryCode,
          number: phoneNumber,
          fullNumber: fullPhone
        },
        address: {
          country,
          state: state.trim(),
          city: city.trim(),
          pincode: pincode.trim()
        },
        role: "user",
        isAdmin: false,
        isVerified: false,
        isActive: true,
        accountStatus: "pending", // Account not created in Firebase Auth yet
        createdAt: new Date().toISOString(),
        tempUserId: tempUserId // Store the temp ID for reference
      });

      console.log("✅ User data saved to users collection with pending status");

      // Store email and tempUserId in localStorage for signin page
      localStorage.setItem('pending_user_email', normalizedEmail);
      localStorage.setItem('pending_user_id', tempUserId);
      
      // Also store user data in localStorage for immediate access
      localStorage.setItem('current_user', JSON.stringify({
        email: normalizedEmail,
        displayName: displayName.trim(),
        fullName: displayName.trim(),
        country: country,
        state: state.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        phone: fullPhone,
        isGuest: false
      }));
      
      // Auto-redirect to signin page immediately
      navigateToPage("signin");

    } catch (err) {
      console.error("❌ Sign up error:", err);
      setError(err.message || "Failed to save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get placeholder text
  const getPhonePlaceholder = () => {
    const country = countryOptions.find(opt => opt.value === countryCode);
    const length = country ? country.length : 10;
    return `${length}-digit phone number`;
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      displayName.trim() &&
      country &&
      country !== "Select Country" &&
      state.trim() &&
      city.trim() &&
      pincode.trim() &&
      pincode.length >= 4 &&
      pincode.length <= 10 &&
      email &&
      email.includes("@") &&
      password.length >= 6 &&
      password === confirmPassword &&
      phoneNumber.length === getCurrentCountryLength()
    );
  };

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
            <label className="block text-light mb-1 font-medium text-sm">Full Name</label>
            <input
              ref={displayNameRef}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'country')}
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
              <span>Press Enter to go to next field</span>
              <span>{displayName.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Country *</label>
            <div className="relative">
              <select
                ref={countryRef}
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'state')}
                onFocus={() => handleFocus('country')}
                className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none appearance-none cursor-pointer text-sm ${
                  activeField === 'country' ? 'border-secondary' : 'border-gray-600'
                }`}
                required
                disabled={loading}
              >
                <option value="Select Country" className="bg-dark text-gray-500">
                  Select Country
                </option>
                {countryDropdownOptions.map((countryOption) => (
                  <option 
                    key={countryOption} 
                    value={countryOption} 
                    className="bg-dark text-light"
                  >
                    {countryOption}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
              </div>
            </div>
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Select your country from the list</span>
              <span>{country && country !== "Select Country" ? '✓' : ''}</span>
            </div>
          </div>

          {/* State/Province */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">State/Province *</label>
            <input
              ref={stateRef}
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'city')}
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
              <span>Current: {state.trim() ? state : 'Not set'}</span>
              <span>{state.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* City/Town */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">City/Town *</label>
            <input
              ref={cityRef}
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'pincode')}
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
              <span>Current: {city.trim() ? city : 'Not set'}</span>
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
              onKeyDown={(e) => handleKeyDown(e, 'phoneNumber')}
              onFocus={() => handleFocus('pincode')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'pincode' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your pincode or ZIP code"
              required
              minLength={4}
              maxLength={10}
              disabled={loading}
              autoComplete="postal-code"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Must be 4-10 digits. Current: {pincode.trim() ? pincode : 'Not set'}</span>
              <span>{pincode.length >= 4 && pincode.length <= 10 ? '✓' : ''}</span>
            </div>
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Phone Number</label>
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
                  onKeyDown={(e) => handleKeyDown(e, 'email')}
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
              <span>{phoneNumber.length}/{getCurrentCountryLength()} digits</span>
              <span>{phoneNumber.length === getCurrentCountryLength() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Email Address</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'password')}
              onFocus={() => handleFocus('email')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'email' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your email"
              required
              disabled={loading}
              autoComplete="email"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to next field</span>
              <span>{email.includes("@") ? '✓' : ''}</span>
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Password</label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'confirmPassword')}
              onFocus={() => handleFocus('password')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'password' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Create a password (min. 6 characters)"
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>{password.length}/6 characters minimum</span>
              <span>{password.length >= 6 ? '✓' : ''}</span>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-light mb-1 font-medium text-sm">Confirm Password</label>
            <input
              ref={confirmPasswordRef}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'submit')}
              onFocus={() => handleFocus('confirmPassword')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-500 focus:border-red-500'
                  : activeField === 'confirmPassword'
                  ? 'border-secondary'
                  : 'border-gray-600'
              }`}
              placeholder="Confirm your password"
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to submit form</span>
              <span>{password && password === confirmPassword && password.length >= 6 ? '✓' : ''}</span>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <i className="fas fa-exclamation-triangle mr-1 text-xs"></i>
                Passwords do not match
              </p>
            )}
            {confirmPassword && password === confirmPassword && password.length >= 6 && (
              <p className="text-green-400 text-xs mt-1 flex items-center">
                <i className="fas fa-check-circle mr-1 text-xs"></i>
                Passwords match
              </p>
            )}
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
                Signing Up...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-4 pt-4 border-t border-gray-700">
            <p className="text-light text-sm">
              Already saved details?{" "}
              <button
                type="button"
                onClick={() => navigateToPage("signin")}
                className="text-secondary font-medium hover:text-accent transition-colors"
                disabled={loading}
              >
                Go to Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;