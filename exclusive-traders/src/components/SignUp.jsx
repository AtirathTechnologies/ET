// src/components/SignUp.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase";

const SignUp = ({ navigateToPage, onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+91",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Country options
  const countryOptions = [
    { value: "+91", flag: "🇮🇳", code: "+91", name: "India" },
    { value: "+1", flag: "🇺🇸", code: "+1", name: "USA" },
    { value: "+44", flag: "🇬🇧", code: "+44", name: "UK" },
    { value: "+971", flag: "🇦🇪", code: "+971", name: "UAE" },
    { value: "+61", flag: "🇦🇺", code: "+61", name: "Australia" },
    { value: "+98", flag: "🇮🇷", code: "+98", name: "Iran" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        [name]: digitsOnly
      });
      setPhoneError("");
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCountryCodeChange = (e) => {
    setFormData({
      ...formData,
      countryCode: e.target.value,
      phoneNumber: ""
    });
    setPhoneError("");
  };

  const validatePhoneNumber = () => {
    const { countryCode, phoneNumber } = formData;
    
    if (!phoneNumber.trim()) {
      setPhoneError("Phone number is required");
      return false;
    }
    
    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError("Phone number must contain only digits");
      return false;
    }
    
    let expectedLength;
    switch(countryCode) {
      case "+91": // India
      case "+1":  // USA
      case "+44": // UK
        expectedLength = 10;
        break;
      case "+971": // UAE
      case "+61":  // Australia
      case "+98":  // Iran
        expectedLength = 9;
        break;
      default:
        expectedLength = 10;
    }
    
    if (phoneNumber.length !== expectedLength) {
      const selectedCountry = countryOptions.find(opt => opt.value === countryCode);
      setPhoneError(`Phone number must be exactly ${expectedLength} digits for ${selectedCountry?.name}`);
      return false;
    }
    
    setPhoneError("");
    return true;
  };

  // Function to save user data to Firebase Realtime Database (et-reg project)
  const saveUserToDatabase = async (userId, userData) => {
    try {
      console.log("📤 Saving to et-reg database...");
      console.log("🌐 Database URL:", db.app.options.databaseURL);
      
      // Create a reference to the user's data in et-reg database
      const userRef = ref(db, 'users/' + userId);
      
      // Prepare the user data object - Store phone number ONLY ONCE
      const userDataToStore = {
        uid: userId,
        fullName: userData.fullName,
        displayName: userData.displayName,
        email: userData.email,
        phoneNumber: `${userData.countryCode}${userData.phoneNumber}`, // Store only once with country code
        countryCode: userData.countryCode, // Keep separate if needed for other logic
        createdAt: userData.createdAt,
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        accountType: "free",
        status: "active",
        profilePhoto: "",
        tradingExperience: "beginner"
      };
      
      console.log("📝 Data to save:", userDataToStore);
      
      // Save data to et-reg Firebase
      await set(userRef, userDataToStore);
      console.log("✅ User data saved to et-reg database successfully!");
      return true;
    } catch (error) {
      console.error("❌ Error saving user to et-reg database:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPhoneError("");

    console.log("🚀 Signup to et-reg database...");

    // Validation
    if (!formData.displayName.trim() || !formData.email.trim() || !formData.password || !formData.phoneNumber.trim()) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber()) {
      setLoading(false);
      return;
    }

    try {
      // 1. Create user in Firebase Authentication (et-reg)
      console.log("Creating user in et-reg Firebase Authentication...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      console.log("User created in et-reg Auth:", user.uid);

      // 2. Update profile with display name
      if (formData.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
        console.log("Profile updated with display name");
      }

      // 3. Prepare user data for et-reg Database
      const userData = {
        fullName: formData.displayName,
        displayName: formData.displayName,
        email: formData.email,
        countryCode: formData.countryCode,
        phoneNumber: formData.phoneNumber, // Just the digits
        createdAt: new Date().toISOString()
      };

      // 4. Save user data to et-reg Realtime Database
      console.log("Saving user data to et-reg Database...");
      await saveUserToDatabase(user.uid, userData);
      console.log("✅ User data saved successfully to et-reg Database!");

      // 5. Show success message
      alert("🎉 Account created successfully! Data saved to et-reg database.");
      
      // 6. Call onAuthSuccess to close any modals
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      
      // 7. Navigate to home page
      if (navigateToPage) {
        navigateToPage("home");
      }
      
    } catch (err) {
      console.error("Signup error:", err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/password accounts are not enabled. Please contact support.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "An error occurred during signup.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getMaxLength = () => {
    switch(formData.countryCode) {
      case "+971": // UAE
      case "+61":  // Australia
      case "+98":  // Iran
        return 9;
      default:
        return 10;
    }
  };

  const getPhonePlaceholder = () => {
    const length = getMaxLength();
    return `Enter ${length} digit phone number`;
  };

  const getFormatExample = () => {
    const length = getMaxLength();
    const xDigits = 'X'.repeat(length);
    // Show with + for clarity
    return `${formData.countryCode}${xDigits}`;
  };

  return (
    <section className="min-h-screen pt-24 px-4 bg-dark">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Sign Up
          </h1>
          <p className="text-light">Join Exclusive Traders today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary/50 p-6 sm:p-8 rounded-lg border border-secondary">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-light mb-2">Full Name *</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-light mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="mb-4">
            <label className="block text-light mb-2">Phone Number *</label>
            
            <div className="flex items-center bg-dark border border-gray-600 rounded-lg overflow-hidden focus-within:border-secondary">
              {/* Country Code Selector */}
              <div className="relative flex-shrink-0 border-r border-gray-600">
                <select
                  value={formData.countryCode}
                  onChange={handleCountryCodeChange}
                  className="appearance-none bg-transparent text-light px-4 py-3 pr-8 focus:outline-none cursor-pointer"
                  style={{ minWidth: "100px" }}
                  required
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.flag} {option.code}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-light">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              
              {/* Phone Number Input */}
              <div className="flex-1">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent text-light focus:outline-none border-0"
                  placeholder={getPhonePlaceholder()}
                  maxLength={getMaxLength()}
                  required
                />
              </div>
            </div>
            
            {/* Format Hint */}
            <div className="mt-2">
              <p className="text-gray-400 text-sm">
                Format: {getFormatExample()} (enter digits only)
              </p>
            </div>
            
            {/* Phone Error */}
            {phoneError && (
              <div className="text-red-400 text-sm mt-2">
                {phoneError}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-light mb-2">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none"
              placeholder="Create a password (min. 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div className="mb-6">
            <label className="block text-light mb-2">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-dark font-bold py-3 px-4 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center mt-6">
            <p className="text-light">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigateToPage("signin")}
                className="text-secondary hover:text-accent font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigateToPage("home")}
              className="text-light hover:text-secondary"
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;