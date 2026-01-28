// src/App.jsx
import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Industries from './components/Industries';
import Innovation from './components/Innovation';
import Feedback from './components/Feedback';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import useAnimation from './hooks/useAnimation';
import Products from './components/Products';
import AllProductsPage from './components/AllProductsPage';
import BasmatiRSSFeed from './components/BasmatiRSSFed';
import JoinUs from './components/JoinUs';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Leadership from './components/Leadership';
import Contactus from './components/Contactus';
import BuyModal from './components/BuyModal';

// ---------- Admin Components ----------
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProducts from './components/Admin/AdminProducts';
import AdminOrders from './components/Admin/AdminOrders';
import AdminUsers from './components/Admin/AdminUsers';
import AdminHistory from './components/Admin/AdminHistory';
import AdminLayout from './components/Admin/Adminlayout';
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';

// ---------- Placeholder pages ----------
const Dashboard = () => (
  <div className="p-8 min-h-screen">
    <h1 className="text-3xl text-secondary">Dashboard</h1>
  </div>
);
const Orders = () => (
  <div className="p-8 min-h-screen">
    <h1 className="text-3xl text-secondary">My Orders</h1>
  </div>
);
const Settings = () => (
  <div className="p-8 min-h-screen">
    <h1 className="text-3xl text-secondary">Settings</h1>
  </div>
);

function App() {
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const [showSignOutSuccess, setShowSignOutSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInnovationPage, setShowInnovationPage] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // ADD: Loading state

  // States for Buy Modal
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useAnimation();

  // Mobile menu / sidebar toggle
  const toggleMobileMenu = (open) =>
    setIsMobileMenuOpen(open !== undefined ? open : !isMobileMenuOpen);
  const toggleSidebar = (open) =>
    setIsSidebarOpen(open !== undefined ? open : !isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth listener with loading state
  useEffect(() => {
    setIsMounted(true);
    setAuthLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          })
        );
      } else {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
      setAuthLoading(false); // Auth check complete
    });

    return () => unsubscribe();
  }, []);

  // Reset search when not on product pages
  useEffect(() => {
    const path = location.pathname;
    if (!path.startsWith('/products') && !path.startsWith('/admin')) {
      setSearchTerm('');
      setIsMobileMenuOpen(false);
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Navigation helpers
  const navigateToPage = (page) => {
    navigate(`/${page}`);
    if (page !== 'innovation') setShowInnovationPage(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
    setIsSidebarOpen(false);
  };

  const showInnovation = () => {
    navigate('/innovation');
    setShowInnovationPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
    setIsSidebarOpen(false);
  };

  const showIndustryProducts = (industry) => {
    const industrySlug = industry.toLowerCase().replace(/\s+/g, '-');
    navigate(`/products/${industrySlug}`);
    setShowInnovationPage(false);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const showAllProducts = () => {
    navigate('/all-products');
    setShowInnovationPage(false);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const goBackToAllProducts = () => {
    navigate('/all-products');
    setShowInnovationPage(false);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSidebarOpen(false);
  };

  const goBackToIndustries = () => {
    navigate('/industries');
    setShowInnovationPage(false);
    setSearchTerm('');
    setIsMobileMenuOpen(false);
    setIsSidebarOpen(false);
  };

  const handleSearchChange = (term) => setSearchTerm(term);

  // Buy Modal Handlers
  const openBuyModal = (product, industry) => {
    setSelectedProduct(product);
    setSelectedIndustry(industry);
    setIsBuyModalOpen(true);
  };

  const closeBuyModal = () => {
    setIsBuyModalOpen(false);
    setSelectedProduct(null);
    setSelectedIndustry('');
  };

  // Sign-out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setShowSignOutSuccess(true);
      setTimeout(() => setShowSignOutSuccess(false), 3000);
      navigate('/home');
    } catch (err) {
      console.error('Sign-out error:', err);
      alert('Error signing out. Please try again.');
    }
  };

  // Auth-required actions
  const handleAuthRequired = (action) => {
    if (!currentUser) {
      setAuthAction(action);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (authAction === 'addToCart')
      alert('Product added to cart successfully!');
    else if (authAction === 'orderNow')
      alert('Order placed successfully!');
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthAction('');
  };
  const closeSignOutSuccess = () => setShowSignOutSuccess(false);

  // Render
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-2xl font-inter">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App font-inter">
      {/* Header - Don't show on admin pages */}
      {!location.pathname.startsWith('/admin') && (
        <Header
          navigateToPage={navigateToPage}
          currentPage={location.pathname.slice(1) || 'home'}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
      )}

      {/* ---- ALL ROUTES ---- */}
      <main className={location.pathname.startsWith('/admin') ? '' : 'pt-4'}>
        <Routes>
          {/* HOME – ALL SECTIONS WITH SCROLL - WITHOUT BLOG AND JOIN US */}
          <Route
            path="/home"
            element={
              <>
                {/* HERO FIRST – NO STICKY RSS ON TOP */}
                <div id="hero">
                  <Hero showInnovation={showInnovation} />
                </div>

                {/* RSS FEED AFTER HERO – NORMAL FLOW, NO STICKY */}
                <div className="relative z-20 bg-black/80">
                  <BasmatiRSSFeed />
                </div>

                {/* Rest of your sections */}
                <div id="about"><About /></div>
                <div id="services"><Services /></div>
                <div id="industries">
                  <Industries
                    showIndustryProducts={showIndustryProducts}
                    currentUser={currentUser}
                    onViewAllProducts={showAllProducts}
                  />
                </div>
                <div id="leadership"><Leadership /></div>
                {/* ADDED: Feedback section in home page */}
                <div id="Feedback"><Feedback /></div>
                {/* ADDED: Contact section in home page */}
                <div id="contact"><Contactus /></div>

              </>
            }
          />

          {/* Individual full-page routes (for direct navigation) */}
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/industries"
            element={
              <Industries
                showIndustryProducts={showIndustryProducts}
                currentUser={currentUser}
                onViewAllProducts={showAllProducts}
              />
            }
          />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/Feedback" element={<Feedback />} />
          <Route path="/contact" element={<Contactus />} />
          
          {/* Blog and Join Us as separate pages only (NOT in home page) */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/join-us" element={<JoinUs />} />

          {/* Full-page routes */}
          <Route
            path="/innovation"
            element={<Innovation onBackToHome={() => navigate('/home')} />}
          />
          {/* Updated Products route with parameter */}
          <Route
            path="/products/:industry"
            element={
              <Products
                goBackToProducts={goBackToAllProducts}
                searchTerm={searchTerm}
                currentUser={currentUser}
                onAuthRequired={handleAuthRequired}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                onBuyClick={openBuyModal}
              />
            }
          />
          <Route
            path="/all-products"
            element={
              <AllProductsPage
                showIndustryProducts={showIndustryProducts}
                currentUser={currentUser}
                onBackToIndustries={goBackToIndustries}
                onBuyClick={openBuyModal}
              />
            }
          />
          <Route
            path="/signin"
            element={<SignIn navigateToPage={navigateToPage} onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/signup"
            element={<SignUp navigateToPage={navigateToPage} onAuthSuccess={handleAuthSuccess} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />

          {/* ========== ADMIN ROUTES ========== */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute currentUser={currentUser} authLoading={authLoading}>
                <AdminLayout
                  currentUser={currentUser}
                  onSignOut={handleSignOut}
                  toggleMobileMenu={toggleMobileMenu}
                />
              </ProtectedAdminRoute>
            }
          >
            {/* The Outlet in AdminLayout will render these child routes */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="history" element={<AdminHistory />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* Single Footer instance - Don't show on admin pages */}
      {!location.pathname.startsWith('/admin') && <Footer />}

      {/* Buy Modal Component */}
      <BuyModal
        isOpen={isBuyModalOpen}
        onClose={closeBuyModal}
        product={selectedProduct}
        profile={currentUser}
        industry={selectedIndustry}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4">
          <div className="bg-dark border border-secondary rounded-lg p-6 max-w-md w-full mx-auto">
            <div className="text-center">
              <h3 className="text-2xl text-secondary mb-4 text-shadow-neon font-inter">
                Authentication Required
              </h3>
              <p className="text-light mb-6 font-inter">
                Please sign in or create an account to{' '}
                {authAction === 'addToCart' ? 'add items to your cart' : 'place an order'}.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    closeAuthModal();
                    navigateToPage('signin');
                  }}
                  className="btn bg-secondary text-dark hover:bg-accent hover:text-dark py-3 text-lg font-inter font-semibold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    closeAuthModal();
                    navigateToPage('signup');
                  }}
                  className="btn bg-accent text-dark hover:bg-secondary hover:text-dark py-3 text-lg font-inter font-semibold"
                >
                  Create Account
                </button>
                <button
                  onClick={closeAuthModal}
                  className="btn bg-gray-500 text-light hover:bg-gray-600 py-3 text-lg font-inter font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign-out toast */}
      {showSignOutSuccess && (
        <div className="fixed top-4 right-4 z-[1000] animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm border border-secondary rounded-lg p-4 shadow-neon max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-dark text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-light font-inter">
                  Signed Out Successfully!
                </p>
                <p className="text-gray-100 text-sm opacity-90 font-inter">
                  You have been logged out of your account.
                </p>
              </div>
              <button
                onClick={closeSignOutSuccess}
                className="text-light hover:text-secondary transition-colors flex-shrink-0"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;