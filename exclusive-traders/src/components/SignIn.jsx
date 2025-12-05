// src/components/SignIn.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const SignIn = ({ navigateToPage, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in successfully:", userCredential.user);
      
      // Call onAuthSuccess to close any modals
      onAuthSuccess();
      
      // Navigate to home page - the auth state listener in App.jsx will update currentUser
      navigateToPage("home");
      
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen pt-24 px-4 bg-dark">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-4 text-shadow-neon">
            Sign In
          </h1>
          <p className="text-light">Welcome back to Exclusive Traders</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary/50 p-8 rounded-lg border border-secondary shadow-neon" autoComplete="off">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-light mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors"
              placeholder="Enter your email"
              required
              autoComplete="new-email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-light mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors"
              placeholder="Enter your password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-dark font-bold py-3 px-4 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center mt-4">
            <p className="text-light">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigateToPage("signup")}
                className="text-secondary hover:text-accent transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigateToPage("home")}
              className="text-light hover:text-secondary transition-colors"
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;