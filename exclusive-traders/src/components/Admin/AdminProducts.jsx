import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, remove } from "firebase/database";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaBox,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIpadPro, setIsIpadPro] = useState(false);
  const [isNestHub, setIsNestHub] = useState(false);

  // Device detection (unchanged)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isIpad = /Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
      const isChrome = /Chrome/.test(navigator.userAgent);
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      const isIpadProWidth = width >= 1024 && width <= 1366;
      const aspectRatio = width / height;
      const isIpadProRatio = aspectRatio >= 1.29 && aspectRatio <= 1.37;
      setIsIpadPro((isIpadProWidth && isIpadProRatio) || (isIpad && width >= 1024));
      
      const isNestHubWidth = width === 1024;
      const isNestHubAspect = aspectRatio >= 1.6 && aspectRatio <= 1.8;
      setIsNestHub((isNestHubWidth && isNestHubAspect) || (isNestHubWidth && isChrome && width === 1024));
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  // ---------- Image and data helpers (copied from Products.jsx) ----------
  const getCorrectImagePath = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    let cleanPath = imagePath.replace(/^\/+/, '');
    if (cleanPath.startsWith('img/')) {
      cleanPath = cleanPath.replace('img/', 'ProductsImg/');
    }
    if (!cleanPath.startsWith('ProductsImg/')) {
      cleanPath = `ProductsImg/${cleanPath}`;
    }
    return `/${cleanPath}`;
  };

  const getProductImageUrl = (productData) => {
    if (!productData) return null;
    const possibleImageFields = ['image', 'product_image', 'main_image'];
    for (const field of possibleImageFields) {
      if (productData[field]) {
        return getCorrectImagePath(productData[field]);
      }
    }
    return null;
  };

  const getFallbackImage = (categoryId) => {
    const fallbackImages = {
      rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
      dry_fruits: 'https://images.unsplash.com/photo-1541636410410-0c5c8a9e6a8f?w=500&auto=format&fit=crop&q=60',
      dried_fruits: 'https://images.unsplash.com/photo-1541636410410-0c5c8a9e6a8f?w=500&auto=format&fit=crop&q=60',
      lentils: 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2016/2/15/0/HE_dried-legumes-istock-2_s4x3.jpg.rend.hgtvcom.1280.1280.85.suffix/1455572939649.webp',
      popcorn: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60',
      tea: 'https://images.unsplash.com/photo-1571934811396-0ff49ca3a8a7?w=500&auto=format&fit=crop&q=60',
      beverages: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&auto=format&fit=crop&q=60',
      default: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60'
    };
    return fallbackImages[categoryId] || fallbackImages.default;
  };

  // Helper to get price as a readable string
  const formatPrice = (product) => {
    if (product["Ex-Mill_usd"] !== undefined) {
      return `$${product["Ex-Mill_usd"].toFixed(2)} EX-MILL`;
    }
    if (product.price_usd_per_carton !== undefined) {
      return `$${product.price_usd_per_carton.toFixed(2)} / carton`;
    }
    if (product.fob_price_usd !== undefined) {
      return `$${product.fob_price_usd.toFixed(2)} FOB`;
    }
    if (product.price?.min !== undefined && product.price?.max !== undefined) {
      const min = product.price.min;
      const max = product.price.max;
      const unit = product.price.unit ? ` / ${product.price.unit}` : '';
      return `$${min} - $${max}${unit}`;
    }
    if (product.price !== undefined && typeof product.price === 'number') {
      return `$${product.price.toFixed(2)}`;
    }
    return 'Contact for Price';
  };

  // ---------- Fetch all data ----------
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const db = getDatabase();
      const [categoriesSnap, companiesSnap, productsSnap] = await Promise.all([
        get(ref(db, 'categories')),
        get(ref(db, 'companies')),
        get(ref(db, 'products'))
      ]);

      const fetchedCategories = categoriesSnap.exists() ? categoriesSnap.val() : {};
      const fetchedCompanies = companiesSnap.exists() ? companiesSnap.val() : {};
      const fetchedProducts = productsSnap.exists() ? productsSnap.val() : {};

      setCategories(fetchedCategories);
      setCompanies(fetchedCompanies);

      // Build product list with normalized fields
      const productList = Object.entries(fetchedProducts).map(([id, product]) => {
        // Resolve category name
        let categoryName = 'Uncategorized';
        if (product.categoryId) {
          const cat = fetchedCategories[product.categoryId];
          if (cat && cat.name) categoryName = cat.name;
        } else if (product.category) {
          categoryName = product.category;
        }

        // Resolve company name
        let companyName = null;
        if (product.companyId) {
          const comp = fetchedCompanies[product.companyId];
          if (comp && comp.name) companyName = comp.name;
        }

        // Get image URL
        const imageUrl = getProductImageUrl(product) || getFallbackImage(product.categoryId);

        // Get stock (handle object or number)
        let stock = product.stock;
        if (typeof stock === 'object' && stock !== null) {
          stock = stock.quantity || stock.value || 0;
        }
        if (stock === undefined || stock === null) stock = 0;

        // Get status
        let status = product.status;
        if (status === undefined || status === null) {
          status = 'active'; // default
        }

        return {
          id,
          ...product,
          category: categoryName,
          companyName,
          imageUrl,
          stock,
          status,
          priceDisplay: formatPrice(product)
        };
      });

      setProducts(productList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const db = getDatabase();
      await remove(ref(db, `products/${id}`));
      fetchAllData(); // refresh
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const categoriesList = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Responsive helpers (unchanged)
  const getTextSize = (type = 'body') => {
    if (isNestHub) {
      return type === 'header' ? 'text-xs' : 'text-[10px]';
    } else if (isMobile) {
      return type === 'header' ? 'text-sm' : 'text-xs';
    } else if (isIpadPro) {
      return type === 'header' ? 'text-base' : 'text-xs';
    } else {
      return type === 'header' ? 'text-base' : 'text-sm';
    }
  };

  const getPadding = (type = 'card') => {
    if (isNestHub) {
      return type === 'card' ? 'p-1.5' : type === 'table' ? 'px-1 py-1.5' : 'p-2';
    } else if (isMobile) {
      return type === 'card' ? 'p-3' : type === 'table' ? 'px-2 py-2' : 'p-3';
    } else if (isIpadPro) {
      return type === 'card' ? 'p-3' : type === 'table' ? 'px-2.5 py-2' : 'p-3';
    } else {
      return type === 'card' ? 'p-4' : type === 'table' ? 'px-4 py-3' : 'p-4';
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    e.target.parentNode.querySelector('.fallback-icon')?.classList.remove('hidden');
  };

  return (
    <div className={`min-h-screen bg-[#050B14] text-white ${
      isNestHub ? 'p-2' : 
      isMobile ? 'p-3' : 
      'p-4 sm:p-5 md:p-6'
    }`}>
      {/* HEADER */}
      <div className={`${isNestHub ? 'mb-3' : 'mb-4 sm:mb-5 lg:mb-6'}`}>
        <h1 className={`font-bold text-[#00F5C8] mb-1 ${
          isNestHub ? 'text-base' : 
          isIpadPro ? 'text-xl' : 
          'text-xl sm:text-2xl lg:text-3xl'
        }`}>Product Management</h1>
        <p className={`text-gray-400 ${
          isNestHub ? 'text-xs' : 
          isIpadPro ? 'text-sm' : 
          'text-xs sm:text-sm lg:text-base'
        }`}>Manage your products and inventory</p>
      </div>

      <div className="border-t border-[#00F5C8]/20 mb-4 sm:mb-5 lg:mb-6"></div>

      {/* HEADER ACTION BAR */}
      <div className={`flex flex-col ${isMobile ? 'gap-3' : 'sm:flex-row sm:items-center justify-between gap-4'} ${
        isNestHub ? 'mb-3' : 'mb-4 sm:mb-5 lg:mb-6'
      }`}>
        <div>
          <h2 className={`font-bold text-[#00F5C8] mb-2 ${
            isNestHub ? 'text-sm' : 
            isIpadPro ? 'text-lg' : 
            'text-lg sm:text-xl lg:text-2xl'
          }`}>Products List</h2>
          <p className={`text-gray-400 ${
            isNestHub ? 'text-xs' : 
            isIpadPro ? 'text-sm' : 
            'text-xs sm:text-sm lg:text-base'
          }`}>
            {products.length} total • {filteredProducts.length} filtered
          </p>
        </div>

        <button className={`flex items-center justify-center bg-[#00F5C8] text-[#050B14] ${
          isNestHub ? 'px-2 py-1.5 text-xs' : 
          isMobile ? 'px-3 py-2 text-sm' : 
          'px-4 py-2.5 text-base'
        } rounded-lg font-medium hover:opacity-90 w-full sm:w-auto whitespace-nowrap`}>
          <FaPlus className={`${isNestHub ? 'mr-1 text-xs' : 'mr-2'}`} />
          {isNestHub ? 'Add' : isMobile ? 'Add Product' : 'Add New Product'}
        </button>
      </div>

      {/* FILTERS SECTION */}
      <div className={`bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl ${
        isNestHub ? 'p-2 mb-3' : 
        isMobile ? 'p-3 mb-4' : 
        'p-4 mb-5'
      } shadow-lg`}>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-6 lg:col-span-7 relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${
              isNestHub ? 'text-xs' : ''
            }`} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-[#050B14] border border-[#00F5C8]/30 rounded-lg pl-9 pr-3 ${
                isNestHub ? 'py-1.5 text-xs' : 
                isMobile ? 'py-2 text-xs' : 
                'py-2.5 text-sm'
              } focus:outline-none focus:ring-1 focus:ring-[#00F5C8]`}
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4 lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full bg-[#050B14] border border-[#00F5C8]/30 rounded-lg px-3 ${
                isNestHub ? 'py-1.5 text-xs' : 
                isMobile ? 'py-2 text-xs' : 
                'py-2.5 text-sm'
              } focus:outline-none focus:ring-1 focus:ring-[#00F5C8]`}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat} className="bg-[#050B14]">
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Button */}
          <div className="sm:col-span-2">
            <button className={`w-full flex items-center justify-center ${
              isNestHub ? 'px-2 py-1.5 text-xs' : 
              isMobile ? 'px-3 py-2 text-xs' : 
              'px-3 py-2.5 text-sm'
            } border border-[#00F5C8]/30 rounded-lg hover:bg-[#00F5C8]/10`}>
              <FaFilter className={`${isNestHub ? 'mr-1 text-xs' : 'mr-2'} text-[#00F5C8]`} />
              <span className={`${isMobile || isNestHub ? 'hidden sm:inline' : ''}`}>
                {isNestHub ? 'Filter' : 'Filters'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {loading ? (
        <div className={`bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl ${
          isNestHub ? 'p-8' : 'p-10 sm:p-12'
        } text-center text-[#00F5C8]`}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00F5C8] mx-auto mb-3"></div>
          Loading products...
        </div>
      ) : (
        <div className="space-y-4">
          {/* DESKTOP & TABLET TABLE */}
          {!isMobile && (
            <div className="bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#00F5C8]/10">
                  <thead className="bg-[#050B14]">
                    <tr>
                      {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((header) => (
                        <th 
                          key={header} 
                          className={`${
                            isNestHub ? 'px-2 py-2' : 
                            isIpadPro ? 'px-3 py-2.5' : 
                            'px-4 py-3'
                          } text-left font-medium text-gray-400 uppercase tracking-wider ${
                            isNestHub ? 'text-[10px]' : 'text-xs sm:text-sm'
                          }`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#00F5C8]/10">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={`${
                          isNestHub ? 'p-6' : 'p-8 sm:p-10'
                        } text-center text-gray-400`}>
                          No products found
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#00F5C8]/5 transition-colors duration-150">
                          {/* Product Column */}
                          <td className={`${getPadding('table')}`}>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="relative flex-shrink-0">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className={`${
                                      isNestHub ? 'h-8 w-8' : 
                                      isIpadPro ? 'h-9 w-9' : 
                                      'h-10 w-10'
                                    } rounded object-cover`}
                                    onError={handleImageError}
                                  />
                                ) : null}
                                <div className={`${
                                  isNestHub ? 'h-8 w-8' : 
                                  isIpadPro ? 'h-9 w-9' : 
                                  'h-10 w-10'
                                } bg-[#050B14] rounded flex items-center justify-center ${p.imageUrl ? 'hidden' : ''} fallback-icon`}>
                                  <FaBox className={`${
                                    isNestHub ? 'text-xs' : 'text-sm'
                                  } text-gray-500`} />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium truncate ${
                                  isNestHub ? 'text-xs' : 
                                  isIpadPro ? 'text-sm' : 
                                  'text-sm sm:text-base'
                                }`}>
                                  {p.name}
                                </p>
                                <p className={`text-gray-400 truncate ${
                                  isNestHub ? 'text-[10px]' : 'text-xs'
                                }`}>
                                  {p.companyName || p.brand || "No brand"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className={`${getPadding('table')}`}>
                            <span className={`inline-flex px-2 py-0.5 rounded-full bg-[#00F5C8]/10 text-[#00F5C8] ${
                              isNestHub ? 'text-[10px]' : 'text-xs'
                            } whitespace-nowrap`}>
                              {p.category}
                            </span>
                          </td>

                          {/* Price Column */}
                          <td className={`${getPadding('table')} whitespace-nowrap`}>
                            <span className={`font-medium ${
                              isNestHub ? 'text-xs' : 'text-sm'
                            }`}>
                              {p.priceDisplay}
                            </span>
                          </td>

                          {/* Stock Column */}
                          <td className={`${getPadding('table')}`}>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full ${
                                isNestHub ? 'text-[10px]' : 'text-xs'
                              } whitespace-nowrap ${
                                p.stock > 10
                                  ? "bg-green-500/20 text-green-400"
                                  : p.stock > 0
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {p.stock}
                            </span>
                          </td>

                          {/* Status Column */}
                          <td className={`${getPadding('table')}`}>
                            <span className={`inline-flex px-2 py-0.5 rounded-full ${
                              p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            } ${isNestHub ? 'text-[10px]' : 'text-xs'} whitespace-nowrap`}>
                              {p.status}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className={`${getPadding('table')}`}>
                            <div className="flex gap-1 sm:gap-2">
                              <button 
                                className={`${
                                  isNestHub ? 'p-1' : 'p-1.5'
                                } text-[#00F5C8] hover:bg-[#00F5C8]/10 rounded transition-colors duration-200`}
                                title="Edit"
                              >
                                <FaEdit className={`${
                                  isNestHub ? 'text-xs' : 'text-sm'
                                }`} />
                              </button>
                              <button
                                className={`${
                                  isNestHub ? 'p-1' : 'p-1.5'
                                } text-red-400 hover:bg-red-400/10 rounded transition-colors duration-200`}
                                onClick={() => handleDelete(p.id)}
                                title="Delete"
                              >
                                <FaTrash className={`${
                                  isNestHub ? 'text-xs' : 'text-sm'
                                }`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              {filteredProducts.length > 0 && (
                <div className={`${getPadding()} bg-[#050B14] border-t border-[#00F5C8]/10`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className={`text-gray-400 ${
                      isNestHub ? 'text-[10px]' : 'text-xs sm:text-sm'
                    }`}>
                      Showing {filteredProducts.length} of {products.length} products
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
                      <button className={`flex items-center justify-center ${
                        isNestHub ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'
                      } border border-[#00F5C8]/30 rounded text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap`}>
                        <FaChevronLeft className={`${isNestHub ? 'text-xs' : ''}`} />
                        {!isNestHub && <span className="ml-1">Previous</span>}
                      </button>
                      <button className={`${
                        isNestHub ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'
                      } border border-[#00F5C8] bg-[#00F5C8]/20 rounded text-[#00F5C8] whitespace-nowrap`}>
                        1
                      </button>
                      <button className={`${
                        isNestHub ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'
                      } border border-[#00F5C8]/30 rounded text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap`}>
                        2
                      </button>
                      <button className={`${
                        isNestHub ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'
                      } border border-[#00F5C8]/30 rounded text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap`}>
                        3
                      </button>
                      <button className={`flex items-center justify-center ${
                        isNestHub ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'
                      } border border-[#00F5C8]/30 rounded text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap`}>
                        {!isNestHub && <span className="mr-1">Next</span>}
                        <FaChevronRight className={`${isNestHub ? 'text-xs' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MOBILE CARDS VIEW */}
          {isMobile && (
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl p-8 text-center text-gray-400">
                  No products found
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div key={p.id} className="bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl p-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-12 w-12 rounded object-cover"
                              onError={handleImageError}
                            />
                          ) : null}
                          <div className={`h-12 w-12 bg-[#050B14] rounded flex items-center justify-center ${p.imageUrl ? 'hidden' : ''} fallback-icon`}>
                            <FaBox className="text-gray-500" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-white text-sm truncate">{p.name}</h3>
                          <p className="text-gray-400 text-xs truncate">{p.companyName || p.brand || "No brand"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="p-1.5 text-[#00F5C8] hover:bg-[#00F5C8]/10 rounded"
                          title="Edit"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"
                          onClick={() => handleDelete(p.id)}
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Category</p>
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-[#00F5C8]/10 text-[#00F5C8] text-xs">
                          {p.category}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Price</p>
                        <p className="text-white font-medium text-sm">{p.priceDisplay}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Stock</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                          p.stock > 10
                            ? "bg-green-500/20 text-green-400"
                            : p.stock > 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {p.stock}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                          p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUMMARY SECTION */}
          <div className={`bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl ${
            isNestHub ? 'p-2' : 'p-4'
          }`}>
            <div className={`flex justify-between items-center ${
              isNestHub ? 'mb-2' : 'mb-4'
            }`}>
              <h3 className={`text-[#00F5C8] font-medium ${
                isNestHub ? 'text-xs' : 'text-sm'
              }`}>Inventory Summary</h3>
              <span className={`text-gray-400 ${
                isNestHub ? 'text-[10px]' : 'text-xs'
              }`}>
                {filteredProducts.length} products
              </span>
            </div>
            <div className={`grid ${
              isNestHub ? 'grid-cols-2 gap-2' : 
              isMobile ? 'grid-cols-2 gap-3' : 
              'grid-cols-2 sm:grid-cols-4 gap-4'
            }`}>
              <div className="bg-[#050B14] rounded-lg p-3">
                <p className={`text-gray-400 ${
                  isNestHub ? 'text-[10px]' : 'text-xs'
                }`}>Total Products</p>
                <p className={`font-bold text-white ${
                  isNestHub ? 'text-sm' : 'text-lg'
                }`}>{products.length}</p>
              </div>
              <div className="bg-[#050B14] rounded-lg p-3">
                <p className={`text-gray-400 ${
                  isNestHub ? 'text-[10px]' : 'text-xs'
                }`}>Active</p>
                <p className={`font-bold text-green-400 ${
                  isNestHub ? 'text-sm' : 'text-lg'
                }`}>
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="bg-[#050B14] rounded-lg p-3">
                <p className={`text-gray-400 ${
                  isNestHub ? 'text-[10px]' : 'text-xs'
                }`}>Low Stock</p>
                <p className={`font-bold text-yellow-400 ${
                  isNestHub ? 'text-sm' : 'text-lg'
                }`}>
                  {products.filter(p => p.stock > 0 && p.stock < 10).length}
                </p>
              </div>
              <div className="bg-[#050B14] rounded-lg p-3">
                <p className={`text-gray-400 ${
                  isNestHub ? 'text-[10px]' : 'text-xs'
                }`}>Out of Stock</p>
                <p className={`font-bold text-red-400 ${
                  isNestHub ? 'text-sm' : 'text-lg'
                }`}>
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER NOTE */}
      <div className={`text-center pt-4 ${
        isNestHub ? 'mt-3' : 'mt-4'
      }`}>
        <p className={`text-gray-500 ${
          isNestHub ? 'text-[10px]' : 'text-xs sm:text-sm'
        }`}>
          Products are automatically synced from your database.
          Changes may take a few moments to reflect.
        </p>
      </div>

      <div className={`${
        isNestHub ? 'h-3' : 'h-4 sm:h-6 md:h-8'
      }`}></div>
    </div>
  );
};

export default AdminProducts;