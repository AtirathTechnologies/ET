// SignIn.jsx - Creates Firebase Auth account on first sign-in and updates existing user data
import { useState, useEffect, useRef } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, DEFAULT_ADMIN } from "../firebase";
import { ref, get, set, remove } from "firebase/database";

const SignIn = ({ navigateToPage, onAuthSuccess, location }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState("email");

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    // Clear any existing credentials on load
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');

    // Focus on email field
    setTimeout(() => {
      if (emailRef.current) {
        emailRef.current.focus();
        setActiveField('email');
      }
    }, 100);

    // Scroll form into view
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
  }, []); // No location dependency – no pre‑filling

  // Check if the entered email belongs to a pending user (to show info message)
  useEffect(() => {
    const checkIfPendingUser = async () => {
      if (email.trim()) {
        try {
          const usersRef = ref(db, 'users');
          const snapshot = await get(usersRef);
          if (snapshot.exists()) {
            const users = snapshot.val();
            const foundUser = Object.entries(users).find(([userId, userData]) =>
              userData.email &&
              userData.email.toLowerCase() === email.toLowerCase().trim() &&
              userData.accountStatus === "pending"
            );
            setIsPendingUser(!!foundUser);
          } else {
            setIsPendingUser(false);
          }
        } catch (error) {
          console.error("Error checking users:", error);
          setIsPendingUser(false);
        }
      } else {
        setIsPendingUser(false);
      }
    };

    const timeoutId = setTimeout(checkIfPendingUser, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Helper to store user data in localStorage after successful sign‑in
  const storeUserDataInLocalStorage = async (uid, email) => {
    try {
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('current_user', JSON.stringify({
          fullName: userData.displayName || userData.fullName || "",
          displayName: userData.displayName || "",
          email: userData.email || email,
          phone: userData.phone || "",
          phoneNumber: userData.phoneNumber || {},
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          pincode: userData.pincode || "",
          address: userData.address || {}
        }));
      } else {
        localStorage.setItem('current_user', JSON.stringify({ email }));
      }
    } catch (err) {
      console.warn("Could not store user data in localStorage", err);
    }
  };

  const handleKeyDown = (e, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentField === 'email') {
        if (passwordRef.current) {
          passwordRef.current.focus();
          setActiveField('password');
        }
      } else if (currentField === 'password') {
        if (email.trim() && password.trim() && !loading) {
          handleSubmit(e);
        }
      }
    }
  };

  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Please enter email address");
      setLoading(false);
      return;
    }

    if (!trimmedPassword) {
      setError("Please enter password");
      setLoading(false);
      return;
    }

    try {
      // First, try to sign in (existing Firebase Auth user)
      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        const user = userCredential.user;

        console.log("✅ Existing user signed in:", user.email);

        // Update last login
        try {
          const userRef = ref(db, `users/${user.uid}`);
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            await set(ref(db, `users/${user.uid}/lastLogin`), new Date().toISOString());
          }
        } catch (dbError) {
          console.warn("Could not update last login:", dbError);
        }

        // Store user data in localStorage
        await storeUserDataInLocalStorage(user.uid, trimmedEmail);
        localStorage.removeItem('pending_user_email'); // just in case

        const isAdmin = user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase();
        if (onAuthSuccess) onAuthSuccess();
        navigateToPage(isAdmin ? "admin" : "home");
        return;

      } catch (signInError) {
        // If sign in fails, check for pending user
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          let pendingUserData = null;
          let pendingUserId = null;

          try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
              const users = snapshot.val();
              for (const [userId, userData] of Object.entries(users)) {
                if (userData.email && userData.email.toLowerCase() === trimmedEmail && userData.accountStatus === "pending") {
                  pendingUserId = userId;
                  pendingUserData = userData;
                  break;
                }
              }
            }
          } catch (dbError) {
            console.error("Error checking users:", dbError);
          }

          if (pendingUserData && pendingUserId) {
            // Verify password (plain text – consider hashing in production)
            if (pendingUserData.password !== trimmedPassword) {
              throw new Error("Incorrect password. Please use the password you set during signup.");
            }

            // Create Firebase Auth account for pending user
            console.log("🔄 Creating Firebase Auth account for pending user...");
            const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
            const firebaseUser = userCredential.user;

            // Update display name
            if (pendingUserData.displayName) {
              await updateProfile(firebaseUser, { displayName: pendingUserData.displayName });
            }

            // Move user data to permanent location
            const newUserRef = ref(db, `users/${firebaseUser.uid}`);
            await set(newUserRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: pendingUserData.displayName || "",
              fullName: pendingUserData.fullName || "",
              country: pendingUserData.country || "",
              state: pendingUserData.state || "",
              city: pendingUserData.city || "",
              pincode: pendingUserData.pincode || "",
              phone: pendingUserData.phone || "",
              phoneNumber: pendingUserData.phoneNumber || {},
              address: pendingUserData.address || {},
              role: "user",
              isAdmin: false,
              isVerified: false,
              isActive: true,
              accountStatus: "active",
              createdAt: pendingUserData.createdAt || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              signupCompleted: true,
              createdFromPending: true
            });

            // Remove old pending data
            await remove(ref(db, `users/${pendingUserId}`));

            // Store user data in localStorage
            await storeUserDataInLocalStorage(firebaseUser.uid, trimmedEmail);
            localStorage.removeItem('pending_user_email');

            if (onAuthSuccess) onAuthSuccess();
            navigateToPage("home");
            return;
          } else {
            // Check if user exists but not pending
            try {
              const usersRef = ref(db, 'users');
              const snapshot = await get(usersRef);
              if (snapshot.exists()) {
                const users = snapshot.val();
                const existingUser = Object.entries(users).find(([userId, userData]) =>
                  userData.email && userData.email.toLowerCase() === trimmedEmail
                );
                if (existingUser) {
                  throw new Error("This account has already been activated. Please sign in with your credentials.");
                }
              }
            } catch (checkError) {
              if (checkError.message.includes("already been activated")) throw checkError;
            }
            throw new Error("No account found. Please sign up first.");
          }
        } else if (signInError.code === 'auth/wrong-password') {
          throw new Error("Incorrect password. Please try again.");
        } else {
          throw signInError;
        }
      }
    } catch (err) {
      console.error("❌ Authentication error:", err.code || err.message);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigateToPage("forgot-password");
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setRememberMe(false);
    setError("");
    setIsPendingUser(false);
  };

  return (
    <section className="min-h-screen pt-16 pb-8 px-4 bg-dark" ref={formRef}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl text-secondary mb-4 text-shadow-black">
            Sign In
          </h1>
          <p className="text-light text-sm">Welcome to Exclusive Trader</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-dark/80 p-6 rounded-lg border border-secondary shadow-neon backdrop-blur-sm"
          autoComplete="off"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2 text-sm"></i>
                <span className="font-medium text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-light mb-2 font-medium text-sm" htmlFor="signin-email">
              Email Address
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'email')}
              onFocus={() => handleFocus('email')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light placeholder-gray-400 focus:outline-none transition-colors text-sm ${
                activeField === 'email' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your email"
              required
              autoComplete="off"
              id="signin-email"
              name="email"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to password</span>
              <span>{email.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div className="mb-4">
            <label className="block text-light mb-2 font-medium text-sm" htmlFor="signin-password">
              Password
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'password')}
                onFocus={() => handleFocus('password')}
                className={`w-full px-3 py-2 bg-dark border rounded-lg text-light placeholder-gray-400 focus:outline-none transition-colors text-sm pr-10 ${
                  activeField === 'password' ? 'border-secondary' : 'border-gray-600'
                }`}
                placeholder="Enter your password"
                required
                autoComplete="new-password"
                id="signin-password"
                name="new-password"
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
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to sign in</span>
              <span>{password.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-secondary bg-dark border-gray-600 rounded focus:ring-secondary focus:ring-2"
              />
              <label htmlFor="remember-me" className="ml-2 text-light text-xs cursor-pointer">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-secondary hover:text-accent text-xs transition-colors"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          {/* Info message for pending users */}
          {isPendingUser && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-xs">
              <div className="flex items-start">
                <i className="fas fa-info-circle mr-2 mt-0.5 text-sm"></i>
                <span>
                  This is your first time signing in. Your account will be activated after successful sign-in.
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className={`w-full bg-secondary text-dark font-bold py-2 rounded-lg transition-all duration-300 text-sm ${
              loading || !email.trim() || !password.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-accent hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin text-sm"></i>
                {isPendingUser ? "Activating Account..." : "Signing In..."}
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-center mb-3">
              <p className="text-light text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    navigateToPage("signup");
                  }}
                  className="text-secondary hover:text-accent transition-colors font-medium"
                  disabled={loading}
                >
                  Sign Up
                </button>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  clearForm();
                  navigateToPage("home");
                }}
                className="text-light hover:text-secondary transition-colors flex items-center justify-center gap-2 mx-auto text-xs"
                disabled={loading}
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Back to Homepage
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;