import React, { useState, useEffect, useContext } from 'react';
import { ArrowLeft, Building2, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db as database, ref, get } from '../firebase';
import { CURRENCIES } from '../data/Currency';
import BuyModal from './BuyModal';
import { useCart } from './CartContext';

const ProductPage = ({ profile, globalSearchQuery = '', onGlobalSearchClear, isAuthenticated = false, onNewOrderSubmitted }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // States
  const [categoryData, setCategoryData] = useState(null);
  const [allCompanies, setAllCompanies] = useState({});
  const [allBrands, setAllBrands] = useState({});
  const [allProducts, setAllProducts] = useState({});
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [currency, setCurrency] = useState('AUTO');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('companies');
  const [isLoading, setIsLoading] = useState(true);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all data from Firebase
  useEffect(() => {
    fetchAllData();
  }, [categoryId]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [categoriesSnap, companiesSnap, brandsSnap, productsSnap] = await Promise.all([
        get(ref(database, 'categories')),
        get(ref(database, 'companies')),
        get(ref(database, 'brands')),
        get(ref(database, 'products'))
      ]);

      const fetchedCategories = categoriesSnap.exists() ? categoriesSnap.val() : {};
      const fetchedCompanies = companiesSnap.exists() ? companiesSnap.val() : {};
      const fetchedBrands = brandsSnap.exists() ? brandsSnap.val() : {};
      const fetchedProducts = productsSnap.exists() ? productsSnap.val() : {};

      const normalCategoryId = categoryId ? categoryId.replace(/-/g, '_') : null;
      const categoryDataFound = categoryId ? (fetchedCategories[categoryId] || fetchedCategories[normalCategoryId]) : null;

      setCategoryData(categoryDataFound);
      setAllCompanies(fetchedCompanies);
      setAllBrands(fetchedBrands);
      setAllProducts(fetchedProducts);

      const categoryProducts = Object.entries(fetchedProducts)
        .filter(([productId, productData]) =>
          productData.categoryId === categoryId ||
          (normalCategoryId && productData.categoryId === normalCategoryId)
        )
        .map(([productId, productData]) => ({
          id: productId,
          ...productData
        }));

      const uniqueCompanyIds = [...new Set(categoryProducts.map(p => p.companyId))];
      let filteredCompanies = [];

      if (uniqueCompanyIds.length > 0) {
        filteredCompanies = uniqueCompanyIds.map(companyId => ({
          id: companyId,
          ...fetchedCompanies[companyId]
        })).filter(c => c && c.id);
      } else {
        filteredCompanies = Object.entries(fetchedCompanies).map(([companyId, companyData]) => ({
          id: companyId,
          ...companyData
        }));
      }

      filteredCompanies = filteredCompanies.map(company => {
        const companyProducts = categoryProducts.filter(p => p.companyId === company.id);
        const brandIds = [...new Set(companyProducts.map(p => p.brandId).filter(Boolean))];
        return {
          ...company,
          productCount: companyProducts.length,
          brandCount: brandIds.length,
          hasBrands: brandIds.length > 0
        };
      });

      setCompanies(filteredCompanies);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  // Filter products based on search query
  useEffect(() => {
    let filtered = products;

    if (globalSearchQuery.trim() !== '') {
      const searchLower = globalSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => (
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.product_description && product.product_description.toLowerCase().includes(searchLower)) ||
        (product.companyName && product.companyName.toLowerCase().includes(searchLower)) ||
        (product.brandName && product.brandName.toLowerCase().includes(searchLower)) ||
        (product.origin && product.origin.toLowerCase().includes(searchLower)) ||
        (product.pack_type && product.pack_type.toLowerCase().includes(searchLower)) ||
        (product.shelf_life && product.shelf_life.toLowerCase().includes(searchLower)) ||
        (product.grades && product.grades.some(grade =>
          grade.grade && grade.grade.toLowerCase().includes(searchLower)
        ))
      ));
    }

    if (productSearchQuery.trim() !== '') {
      const searchLower = productSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => (
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.product_description && product.product_description.toLowerCase().includes(searchLower)) ||
        (product.origin && product.origin.toLowerCase().includes(searchLower)) ||
        (product.pack_type && product.pack_type.toLowerCase().includes(searchLower))
      ));
    }

    setFilteredProducts(filtered);
  }, [globalSearchQuery, products, productSearchQuery]);

  // Filter brands based on search query
  useEffect(() => {
    if (brandSearchQuery.trim() !== '' && brands.length > 0) {
      const searchLower = brandSearchQuery.toLowerCase().trim();
      const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchLower)
      );
      setBrands(filteredBrands);
    } else {
      if (selectedCompany && allBrands && allProducts) {
        loadCompanyBrands();
      }
    }
  }, [brandSearchQuery]);

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!CURRENCIES[fromCurrency] || !CURRENCIES[toCurrency]) return amount;
    if (fromCurrency === toCurrency) return amount;
    let amountInUSD =
      fromCurrency === 'USD'
        ? amount
        : amount / CURRENCIES[fromCurrency].rateFromUSD;
    return amountInUSD * CURRENCIES[toCurrency].rateFromUSD;
  };

  // Load brands when company is selected
  useEffect(() => {
    if (selectedCompany && allBrands && allProducts) {
      loadCompanyBrands();
    }
  }, [selectedCompany, allBrands, allProducts]);

  const loadCompanyBrands = () => {
    if (!selectedCompany || !allBrands || !allProducts) return;
    try {
      const companyProducts = Object.entries(allProducts)
        .filter(([_, productData]) =>
          productData.categoryId === categoryId &&
          productData.companyId === selectedCompany.id
        )
        .map(([id, data]) => ({ id, ...data }));

      const brandedProducts = companyProducts.filter(p => p.brandId);
      const unbrandedProducts = companyProducts.filter(p => !p.brandId);

      const brandIds = [...new Set(brandedProducts.map(p => p.brandId))];
      const brandList = brandIds
        .map(brandId => {
          const brandData = allBrands[brandId];
          if (!brandData) return null;
          return {
            id: brandId,
            ...brandData,
            companyId: selectedCompany.id,
            companyName: selectedCompany.name,
            productCount: brandedProducts.filter(p => p.brandId === brandId).length,
            imageUrl: getBrandImage(brandData)
          };
        })
        .filter(Boolean);

      if (brandList.length > 0) {
        setBrands(brandList);
        setViewMode('brands');
        return;
      }

      const productsList = unbrandedProducts.map(p => ({
        ...p,
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        brandName: null,
        imageUrl: getProductImageUrl(p)
      }));
      setProducts(productsList);
      setFilteredProducts(productsList);
      setSelectedBrand(null);
      setViewMode('products');
    } catch (error) {
      console.error('Error loading company brands:', error);
      setBrands([]);
    }
  };

  // Load products when brand is selected
  useEffect(() => {
    if (selectedBrand && allProducts) {
      loadBrandProducts();
    }
  }, [selectedBrand, allProducts]);

  const loadBrandProducts = () => {
    if (!selectedBrand || !allProducts) return;
    try {
      let productsList;
      productsList = Object.entries(allProducts)
        .filter(([_, productData]) =>
          productData.categoryId === categoryId &&
          productData.companyId === selectedBrand.companyId &&
          productData.brandId === selectedBrand.id
        )
        .map(([id, data]) => ({
          id,
          ...data,
          companyId: selectedBrand.companyId,
          companyName: selectedBrand.companyName,
          brandName: selectedBrand.name,
          imageUrl: getProductImageUrl(data)
        }));
      setProducts(productsList);
      setFilteredProducts(productsList);
      setViewMode('products');
      setProductSearchQuery('');
    } catch (error) {
      console.error('Error loading brand products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  // ==================== IMAGE PATH HANDLING ====================
  const getCorrectImagePath = (imagePath) => {
    if (!imagePath) return null;

    // If already full URL → return directly
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Remove leading slashes
    let cleanPath = imagePath.replace(/^\/+/, '');

    // ONLY modify if needed
    if (cleanPath.startsWith('img/')) {
      cleanPath = cleanPath.replace('img/', 'ProductsImg/');
    }

    return `/${cleanPath}`;
  };

  const getProductImageUrl = (productData) => {
    if (!productData) return getFallbackImage();
    const possibleImageFields = ['image', 'product_image', 'main_image'];
    for (const field of possibleImageFields) {
      if (productData[field]) {
        return getCorrectImagePath(productData[field]);
      }
    }
    return getFallbackImage();
  };

  const getBrandImage = (brandData) => {
    if (!brandData) return null;
    if (brandData.logo) {
      return getCorrectImagePath(brandData.logo);
    }
    if (brandData.image) {
      return getCorrectImagePath(brandData.image);
    }
    if (brandData.brand_logo) {
      return getCorrectImagePath(brandData.brand_logo);
    }
    return null;
  };

  const getCompanyLogo = (company) => {
    if (!company) return null;
    if (company.image) {
      return getCorrectImagePath(company.image);
    }
    if (company.logo) {
      return getCorrectImagePath(company.logo);
    }
    if (company.company_logo) {
      return getCorrectImagePath(company.company_logo);
    }
    return null;
  };

  const getFallbackImage = () => {
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

  // Dynamic price display based on product type
  const getProductPrice = (product) => {
    const resolveCurrency = (baseCurrency) => {
      return currency === 'AUTO' ? baseCurrency : currency;
    };

    if (product["Ex-Mill_usd"] !== undefined) {
      const base = 'USD';
      const target = resolveCurrency(base);
      const value = convertCurrency(product["Ex-Mill_usd"], base, target);
      return `${CURRENCIES[target].symbol}${value.toFixed(2)} EX-MILL`;
    }

    if (product.price_usd_per_carton !== undefined) {
      const base = 'USD';
      const target = resolveCurrency(base);
      const value = convertCurrency(product.price_usd_per_carton, base, target);
      return `${CURRENCIES[target].symbol}${value.toFixed(2)} / carton`;
    }

    if (product.fob_price_usd !== undefined) {
      const base = 'USD';
      const target = resolveCurrency(base);
      const value = convertCurrency(product.fob_price_usd, base, target);
      return `${CURRENCIES[target].symbol}${value.toFixed(2)} FOB`;
    }

    if (product.price?.min !== undefined && product.price?.max !== undefined) {
      const base = 'INR';
      const target = resolveCurrency(base);
      const min = convertCurrency(product.price.min, base, target);
      const max = convertCurrency(product.price.max, base, target);
      return `${CURRENCIES[target].symbol}${min.toFixed(0)} - ${CURRENCIES[target].symbol}${max.toFixed(0)} / ${product.price.unit}`;
    }

    if (product.price !== undefined && typeof product.price === 'number') {
      const base = 'USD';
      const target = resolveCurrency(base);
      const value = convertCurrency(product.price, base, target);
      return `${CURRENCIES[target].symbol}${value.toFixed(2)}`;
    }

    return 'Contact for Price';
  };

  // Calculate per unit price for USD products
  const getPerUnitPrice = (product) => {
    if (product.price_usd_per_carton && product.packaging?.units_per_carton) {
      const perUnitUSD = product.price_usd_per_carton / product.packaging.units_per_carton;
      const perGramUSD = product.packaging.unit_weight_g
        ? (perUnitUSD / product.packaging.unit_weight_g)
        : null;
      return {
        perUnit: `$${perUnitUSD.toFixed(2)} per unit`,
        perGram: perGramUSD ? `$${perGramUSD.toFixed(4)}/g` : null
      };
    }

    if (product.fob_price_usd && product.packaging?.units_per_carton) {
      const perUnitUSD = product.fob_price_usd / product.packaging.units_per_carton;
      const perGramUSD = product.packaging.unit_weight_g
        ? (perUnitUSD / product.packaging.unit_weight_g)
        : null;
      return {
        perUnit: `$${perUnitUSD.toFixed(2)} per unit`,
        perGram: perGramUSD ? `$${perGramUSD.toFixed(4)}/g` : null
      };
    }
    return null;
  };

  // Handle company selection
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedBrand(null);
    setBrandSearchQuery('');
  };

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
  };

  // Handle back to brands
  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setProducts([]);
    setFilteredProducts([]);
    setViewMode('brands');
    setProductSearchQuery('');
  };

  // Handle back to companies
  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setSelectedBrand(null);
    setBrands([]);
    setProducts([]);
    setFilteredProducts([]);
    setViewMode('companies');
    setBrandSearchQuery('');
    setProductSearchQuery('');
  };

  // Handle back to all products (used when category not found or no companies)
  const handleBackToAllProducts = () => {
    navigate('/all-products');
  };

  // Handle order now
  const handleOrderNow = (product) => {
    setSelectedProduct({
      ...product,
      quantity: 1,
      category: categoryData?.name || categoryId,
      company: product.companyName,
      brand: product.brandName || 'General'
    });
    setIsBuyModalOpen(true);
  };

  // Handle view details
  const handleViewDetails = (product) => {
    setDetailedProduct(product);
    setShowDetailsModal(true);
  };

  // Handle Add to Cart
  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: getProductPrice(product).replace(/[^0-9.]/g, ''),
      image: product.imageUrl || getFallbackImage(),
      companyName: product.companyName,
      brandName: product.brandName || 'General',
      category: categoryData?.name || categoryId
    };
    addToCart(cartItem);
    alert(`${product.name} added to cart successfully!`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="product-page">
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Category not found
  if (!categoryData) {
    return (
      <div className="product-page">
        <div className="container py-5">
          <div className="text-center">
            <p className="h5 text-muted">Category not found: {categoryId}</p>
            <button className="btn btn-primary mt-3" onClick={handleBackToAllProducts}>
              Back to All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------- Rich Products Component (Integrated) -------------------
  const Products = ({
    filteredProducts,
    selectedCompany,
    selectedBrand,
    getProductPrice,
    handleViewDetails,
    handleOrderNow,
  }) => {
    const getPackagingText = (product) => {
      if (!product.packaging) return '';
      if (typeof product.packaging === 'object') {
        const units = product.packaging.units_per_carton;
        const weight = product.packaging.unit_weight_g || product.packaging.unit_weight_ml;
        const unit = product.packaging.unit_weight_g ? 'g' : (product.packaging.unit_weight_ml ? 'ml' : '');
        if (units && weight) return `${units} x ${weight} ${unit}`;
      }
      return '';
    };

    return (
      <div className="products-wrapper">
        {selectedCompany && (
          <div className="company-header text-center mb-4">
            <h2>{selectedCompany.name}</h2>
            {selectedCompany.tagline && <p className="text-muted">{selectedCompany.tagline}</p>}
            <hr />
          </div>
        )}

        <div className="brand-title mb-4">
          <h3>{selectedBrand ? `${selectedBrand.name} Products` : 'Products'}</h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No products available</h5>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const perUnitPrice = getPerUnitPrice(product);
              const packagingText = getPackagingText(product);

              return (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'}
                      alt={product.name}
                      className="product-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                      }}
                    />
                  </div>

                  <div className="product-brand">
                    {product.brandName && product.brandName !== 'General'
                      ? product.brandName
                      : product.companyName}
                  </div>

                  <h4 className="product-name">{product.name}</h4>

                  {product.product_description && (
                    <p className="product-description line-clamp-2">
                      {product.product_description}
                    </p>
                  )}

                  <div className="product-price">{getProductPrice(product)}</div>

                  {perUnitPrice && (
                    <div className="product-unit-price">
                      {perUnitPrice.perUnit} {perUnitPrice.perGram && `(${perUnitPrice.perGram})`}
                    </div>
                  )}

                  <ul className="product-specs">
                    {packagingText && (
                      <li>
                        <strong>Packaging:</strong> {packagingText}
                      </li>
                    )}
                    {product.origin && (
                      <li>
                        <strong>Origin:</strong> {product.origin}
                      </li>
                    )}
                    {product.shelf_life && (
                      <li>
                        <strong>Shelf Life:</strong> {product.shelf_life}
                      </li>
                    )}
                    {product.pack_type && (
                      <li>
                        <strong>Pack Type:</strong> {product.pack_type}
                      </li>
                    )}
                  </ul>

                  <div className="product-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(product)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn-order"
                      onClick={() => handleOrderNow(product)}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          .products-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          .company-header h2 {
            font-size: 1.8rem;
            font-weight: 700;
            color: white;
          }
          .company-header hr {
            border-top: 2px solid #00F5C8;
            width: 100%;
          }
          .brand-title h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #f1f5f9;
          }
          .products-grid {
            display: grid;
            gap: 24px;
            grid-template-columns: repeat(4, 1fr);
          }
          @media (max-width: 1024px) {
            .products-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          @media (max-width: 768px) {
            .products-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
          }
          @media (max-width: 480px) {
            .products-grid {
              grid-template-columns: 1fr;
            }
          }
          .product-card {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
          }
          .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            border-color: #00F5C8;
          }
          .product-image-container {
            background: #ffffff;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 160px;
            margin-bottom: 15px;
            min-height: 160px;
          }
          .product-img {
            max-width: 100%;
            max-height: 130px;
            object-fit: contain;
            display: block;
          }
          .product-brand {
            font-size: 0.9rem;
            color: #94a3b8;
            margin-bottom: 5px;
          }
          .product-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .product-description {
            font-size: 0.9rem;
            color: #cbd5e1;
            margin-bottom: 12px;
            line-height: 1.5;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .product-price {
            font-size: 1.3rem;
            font-weight: 700;
            color: #00F5C8;
            margin-bottom: 5px;
          }
          .product-unit-price {
            font-size: 0.9rem;
            color: #10b981;
            margin-bottom: 12px;
          }
          .product-specs {
            list-style-type: disc;
            padding-left: 20px;
            margin: 0 0 20px 0;
            flex-grow: 1;
          }
          .product-specs li {
            font-size: 0.9rem;
            color: #9ca3af;
            margin-bottom: 4px;
          }
          .product-specs li strong {
            color: #94a3b8;
            font-weight: 600;
            margin-right: 5px;
          }
          .product-buttons {
            display: flex;
            gap: 10px;
            margin-top: auto;
          }
          .btn-view {
            flex: 1;
            background: transparent;
            color: #3b82f6;
            border: 1px solid #3b82f6;
            padding: 8px 0;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: 0.2s;
          }
          .btn-view:hover {
            background: #3b82f6;
            color: white;
          }
          .btn-order {
            flex: 1;
            background: #10b981;
            color: white;
            border: none;
            padding: 8px 0;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: 0.2s;
          }
          .btn-order:hover {
            background: #059669;
          }
          @media (max-width: 640px) {
            .product-card {
              padding: 12px;
            }
            .product-image-container {
              height: 120px;
              min-height: 120px;
              padding: 10px;
            }
          }
        `}</style>
      </div>
    );
  };
  // ----------------------------------------------------------------------

  // ========== COMPANIES GRID (box removed, only brand count shown) ==========
  const renderCompanies = () => (
    <div className="companies-grid-section" style={{ marginTop: '2rem' }}>
      {companies.length === 0 ? (
        <div className="no-products-message text-center py-5">
          <p className="h5 text-muted">No companies available</p>
          <p className="text-sm opacity-80 mt-2">
            No companies offer products in this category yet.
          </p>
          <button
            className="btn btn-outline-accent btn-sm mt-3"
            onClick={handleBackToAllProducts}
          >
            Back to All Products
          </button>
        </div>
      ) : (
        <div className="companies-grid">
          {companies.map((company) => {
            const transformedUrl = getCompanyLogo(company);
            const originalPath = company.image || company.logo || company.company_logo;
            const originalUrl = originalPath ? (originalPath.startsWith('http') ? originalPath : `/${originalPath.replace(/^\/+/, '')}`) : null;

            return (
              <div
                key={company.id}
                className="company-grid-item"
                onClick={() => handleCompanySelect(company)}
                style={{ cursor: 'pointer' }}
              >
                <div className="company-logo-container-grid">
                  {transformedUrl ? (
                    <img
                      src={transformedUrl}
                      alt={company.name}
                      className="company-logo-grid"
                      onError={(e) => {
                        console.error('Transformed URL failed:', transformedUrl);
                        if (originalUrl && originalUrl !== transformedUrl) {
                          console.log('Trying original URL:', originalUrl);
                          e.target.src = originalUrl;
                          e.target.onerror = (err) => {
                            console.error('Original URL also failed:', originalUrl);
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<div class="company-logo-placeholder-grid"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-4.5L15 4H9L8.5 7H4v2h16V7z"/><rect x="4" y="9" width="16" height="10" rx="1"/></svg></div>`;
                          };
                        } else {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<div class="company-logo-placeholder-grid"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-4.5L15 4H9L8.5 7H4v2h16V7z"/><rect x="4" y="9" width="16" height="10" rx="1"/></svg></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="company-logo-placeholder-grid">
                      <Building2 size={32} />
                    </div>
                  )}
                </div>
                <div className="company-name-grid">{company.name}</div>
                <div className="company-brands-count-grid">
                  {company.brandCount} brand{company.brandCount !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .companies-grid-section {
          width: 100%;
          padding: 0 0 20px 0;
        }
        .companies-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(4, 1fr);
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .companies-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .companies-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 480px) {
          .companies-grid {
            grid-template-columns: 1fr;
          }
        }
        .company-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.2s;
        }
        .company-grid-item:hover {
          transform: translateY(-5px);
        }
        .company-logo-container-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
          min-height: 80px;
        }
        .company-logo-grid {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }
        .company-logo-placeholder-grid {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #2d3748;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a0aec0;
        }
        .company-name-grid {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .company-brands-count-grid {
          font-size: 0.9rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
  // ====================================================

  // ========== HORIZONTAL BRANDS SECTION ==========
  const renderBrands = () => (
    <div className="brands-horizontal-section" style={{ marginTop: '2rem' }}>
      <div className="mb-3">
        <h3 className="h5 mb-1">{selectedCompany.name}</h3>
        <p className="text-sm text-muted mb-0">Select a brand to view products</p>
      </div>

      {brands.length === 0 ? (
        <div className="no-products-message text-center py-5">
          <p className="h5 text-muted">No brands available</p>
          <p className="text-sm opacity-80 mt-2">
            This company doesn't have any brands in this category.
          </p>
        </div>
      ) : (
        <div className="brands-horizontal-scroll">
          {brands.map(brand => {
            const brandLogo = brand.imageUrl;
            const originalPath = brand.logo || brand.image || brand.brand_logo;
            const originalUrl = originalPath ? (originalPath.startsWith('http') ? originalPath : `/${originalPath.replace(/^\/+/, '')}`) : null;
            return (
              <div
                key={brand.id}
                className="brand-horizontal-item"
                onClick={() => handleBrandSelect(brand)}
                style={{ cursor: 'pointer' }}
              >
                <div className="brand-logo-container">
                  {brandLogo ? (
                    <img
                      src={brandLogo}
                      alt={brand.name}
                      className="brand-logo"
                      onError={(e) => {
                        console.error('Transformed brand URL failed:', brandLogo);
                        if (originalUrl && originalUrl !== brandLogo) {
                          console.log('Trying original brand URL:', originalUrl);
                          e.target.src = originalUrl;
                          e.target.onerror = (err) => {
                            console.error('Original brand URL also failed:', originalUrl);
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<div class="brand-logo-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-4.5L15 4H9L8.5 7H4v2h16V7z"/><rect x="4" y="9" width="16" height="10" rx="1"/></svg></div>`;
                          };
                        } else {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<div class="brand-logo-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-4.5L15 4H9L8.5 7H4v2h16V7z"/><rect x="4" y="9" width="16" height="10" rx="1"/></svg></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="brand-logo-placeholder">
                      <Building2 size={28} />
                    </div>
                  )}
                </div>
                <div className="brand-name">{brand.name}</div>
                <div className="brand-product-count">
                  {brand.productCount} product{brand.productCount !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .brands-horizontal-section {
          width: 100%;
          padding: 0 0 20px 0;
        }
        .brands-horizontal-scroll {
          display: flex;
          flex-direction: row;
          gap: 20px;
          padding: 10px 0;
          overflow-x: auto;
          justify-content: flex-start;
        }
        .brand-horizontal-item {
          flex: 0 0 auto;
          width: 220px;
          text-align: center;
          padding: 0 5px;
        }
        .brand-logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 8px;
          min-height: 60px;
        }
        .brand-logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        .brand-logo-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #2d3748;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a0aec0;
        }
        .brand-name {
          font-size: 1.1rem;
          font-weight: 500;
          color: white;
          margin-bottom: 4px;
          white-space: normal;
          word-wrap: break-word;
          word-break: break-word;
          line-height: 1.3;
        }
        .brand-product-count {
          font-size: 0.8rem;
          color: #9ca3af;
        }
        @media (max-width: 768px) {
          .brand-horizontal-item {
            width: 160px;
            padding: 0 3px;
          }
          .brand-logo {
            width: 50px;
            height: 50px;
          }
          .brand-logo-placeholder {
            width: 50px;
            height: 50px;
          }
          .brand-name {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
  // ==================================================

  return (
    <div className="product-page">
      <div className="product-main-content">
        <button
          className="back-button"
          style={{ top: isMobile ? '60px' : '120px' }}
          onClick={
            viewMode === 'products'
              ? (selectedBrand ? handleBackToBrands : handleBackToCompanies)
              : viewMode === 'brands'
                ? handleBackToCompanies
                : () => navigate(-1)
          }
          title={
            viewMode === 'products' ? 'Back to Brands' :
              viewMode === 'brands' ? 'Back to Companies' :
                'Back'
          }
        >
          <ArrowLeft size={24} />
        </button>

        <div className="product-header" style={{ marginTop: 0 }}>
          <h1 className="h2 fw-bold text-center accent" style={{ marginBottom: '0.25rem' }}>
            {categoryData?.name || categoryId}
          </h1>
          {categoryData?.description && (
            <p className="lead text-center px-3" style={{ color: '#00F5C8', marginBottom: '2rem' }}>
              {categoryData.description}
            </p>
          )}
        </div>

        {viewMode === 'companies' && renderCompanies()}
        {viewMode === 'brands' && renderBrands()}
        {viewMode === 'products' && (
          <Products
            filteredProducts={filteredProducts}
            selectedCompany={selectedCompany}
            selectedBrand={selectedBrand}
            getProductPrice={getProductPrice}
            handleViewDetails={handleViewDetails}
            handleOrderNow={handleOrderNow}
          />
        )}
      </div>

      <BuyModal
        isOpen={isBuyModalOpen}
        onClose={() => {
          setIsBuyModalOpen(false);
          setSelectedProduct(null);
          if (onNewOrderSubmitted) {
            onNewOrderSubmitted();
          }
        }}
        product={selectedProduct}
        profile={profile || null}
      />

      {/* Product Details Modal */}
      {showDetailsModal && detailedProduct && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content product-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-top" onClick={() => setShowDetailsModal(false)}>
              <X size={20} />
            </button>
            <div className="modal-body">
              <div className="modal-image-container">
                <img
                  src={detailedProduct.imageUrl || getFallbackImage()}
                  alt={detailedProduct.name}
                  className="modal-product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getFallbackImage();
                  }}
                />
              </div>

              <h2 className="modal-product-title">{detailedProduct.name}</h2>
              <div className="modal-product-brand">
                {detailedProduct.brandName && detailedProduct.brandName !== 'General'
                  ? `${detailedProduct.brandName} • ${detailedProduct.companyName}`
                  : detailedProduct.companyName}
              </div>

              {detailedProduct.product_description && (
                <p className="modal-product-description">
                  {detailedProduct.product_description}
                </p>
              )}

              <div className="modal-product-price">
                {getProductPrice(detailedProduct)}
              </div>

              <h3 className="modal-specs-title">Product Specifications</h3>

              <div className="modal-specs-list">
                {detailedProduct.packaging?.units_per_carton && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">Units per Carton</span>
                    <span className="modal-spec-value">{detailedProduct.packaging.units_per_carton}</span>
                  </div>
                )}

                {detailedProduct.packaging?.unit_weight_ml && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">Unit Volume</span>
                    <span className="modal-spec-value">{detailedProduct.packaging.unit_weight_ml} ml</span>
                  </div>
                )}

                {detailedProduct.packaging?.unit_weight_g && !detailedProduct.packaging?.unit_weight_ml && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">Unit Weight</span>
                    <span className="modal-spec-value">{detailedProduct.packaging.unit_weight_g} g</span>
                  </div>
                )}

                {detailedProduct["Ex-Mill_usd"] !== undefined && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">EXW Price</span>
                    <span className="modal-spec-value">$${detailedProduct["Ex-Mill_usd"].toFixed(2)} USD</span>
                  </div>
                )}

                {detailedProduct["Ex-Mill_usd"] === undefined && detailedProduct.fob_price_usd !== undefined && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">FOB Price</span>
                    <span className="modal-spec-value">$${detailedProduct.fob_price_usd.toFixed(2)} USD</span>
                  </div>
                )}

                {detailedProduct.origin && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">Origin</span>
                    <span className="modal-spec-value">{detailedProduct.origin}</span>
                  </div>
                )}

                {detailedProduct.hsn_code && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">HSN Code</span>
                    <span className="modal-spec-value">{detailedProduct.hsn_code}</span>
                  </div>
                )}

                {detailedProduct.shelf_life && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">Shelf Life</span>
                    <span className="modal-spec-value">{detailedProduct.shelf_life}</span>
                  </div>
                )}

                {detailedProduct.pack_type && (
                  <div className="modal-spec-item">
                    <span className="modal-spec-label">Pack Type</span>
                    <span className="modal-spec-value">{detailedProduct.pack_type}</span>
                  </div>
                )}
              </div>

              <div className="modal-buttons">
                <button className="btn-close-modal" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
                <button
                  className="btn-order-modal"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOrderNow(detailedProduct);
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global styles */}
      <style>{`
        .product-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          padding-bottom: 50px;
        }
     
        .product-main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px 20px 20px;
        }
     
        .back-button {
          position: fixed;
          left: 20px;
          top: 100px;
          z-index: 100;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 245, 200, 0.4);
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #f1f5f9;
        }
     
        .back-button:hover {
          background: #00F5C8;
          color: #0f172a;
          transform: translateX(-5px);
          box-shadow: 0 0 15px rgba(0, 245, 200, 0.4);
        }
     
        .accent {
          color: #00F5C8;
          text-shadow: 0 0 20px rgba(0, 245, 200, 0.2);
        }
     
        .currency-dropdown {
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1px solid rgba(0, 245, 200, 0.3) !important;
          color: #f1f5f9 !important;
          padding: 10px 15px !important;
          border-radius: 10px !important;
          font-weight: 500 !important;
        }

        .glass {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }

        .product-details-modal {
          background: #0f172a;
          border: 1px solid rgba(0, 245, 200, 0.3);
          border-radius: 16px;
          max-width: 550px;
          width: 90%;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-close-top {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(0, 245, 200, 0.5);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f1f5f9;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s;
        }

        .modal-close-top:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 30px;
        }

        .modal-image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          min-height: 200px;
        }
        .modal-product-image {
          max-width: 100%;
          max-height: 180px;
          object-fit: contain;
        }

        .modal-product-title {
          font-size: 1.6rem;
          font-weight: bold;
          margin: 0 0 5px 0;
          color: #ffffff;
          padding-right: 40px;
        }

        .modal-product-brand {
          font-size: 0.95rem;
          color: #94a3b8;
          margin-bottom: 15px;
        }

        .modal-product-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 20px;
        }

        .modal-product-price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #00F5C8;
          margin-bottom: 20px;
        }

        .modal-specs-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }

        .modal-specs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 25px;
        }

        .modal-spec-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .modal-spec-item:last-child {
          border-bottom: none;
        }

        .modal-spec-label {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .modal-spec-value {
          color: #f1f5f9;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-close-modal {
          flex: 1;
          background: transparent;
          color: #f1f5f9;
          border: 1px solid #4b5563;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-close-modal:hover {
          background: #374151;
        }

        .btn-order-modal {
          flex: 1;
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-order-modal:hover {
          background: #059669;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .back-button {
            top: 80px;
            left: 10px;
            width: 40px;
            height: 40px;
          }
          .product-main-content {
            padding: 0 10px 10px 10px;
          }
          
          .modal-buttons {
            flex-direction: column;
          }
          
          .modal-spec-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductPage;