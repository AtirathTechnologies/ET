// ForgotPassword.jsx
import { useState, useEffect, useRef } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const ForgotPassword = ({ navigateToPage }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeField, setActiveField] = useState("email");
  const [redirectTimer, setRedirectTimer] = useState(null);

  const emailRef = useRef(null);
  const formRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [redirectTimer]);

  useEffect(() => {
    // Focus on email field
    setTimeout(() => {
      if (emailRef.current) {
        emailRef.current.focus();
        setActiveField("email");
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
          behavior: "smooth",
        });
      }
    }, 150);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (email.trim() && !loading && !message) {
        handleSubmit(e);
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
    setMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      // Success message as shown in the image
      setMessage("Password reset email sent! Redirecting to login...");

      // Clear any existing timer
      if (redirectTimer) clearTimeout(redirectTimer);

      // Set a timer to redirect to signin after 3 seconds
      const timer = setTimeout(() => {
        navigateToPage("signin");
      }, 3000);
      setRedirectTimer(timer);
    } catch (err) {
      console.error("Password reset error:", err.code || err.message);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset email. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // If a redirect is pending, clear it
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    navigateToPage("signin");
  };

  return (
    <section className="min-h-screen pt-16 pb-8 px-4 bg-dark" ref={formRef}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl text-secondary mb-4 text-shadow-black">
            Forgot Password
          </h1>
          <p className="text-light text-sm">
            Enter your registered email to receive a reset link
          </p>
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

          {message && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-sm"></i>
                <span className="font-medium text-sm">{message}</span>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="mb-6">
            <label className="block text-light mb-2 font-medium text-sm" htmlFor="forgot-email">
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => handleFocus("email")}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light placeholder-gray-400 focus:outline-none transition-colors text-sm ${
                activeField === "email" ? "border-secondary" : "border-gray-600"
              }`}
              placeholder="Enter your registered email"
              required
              autoComplete="off"
              id="forgot-email"
              name="email"
              disabled={!!message} // Disable input after success
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to send reset link</span>
              <span>{email.trim() ? "✓" : ""}</span>
            </div>
          </div>

          {/* Send Reset Link Button */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !!message}
            className={`w-full bg-secondary text-dark font-bold py-2 rounded-lg transition-all duration-300 text-sm ${
              loading || !email.trim() || message
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin text-sm"></i>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-light text-sm">
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-secondary hover:text-accent transition-colors font-medium"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;