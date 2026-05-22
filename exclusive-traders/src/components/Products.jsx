import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, X, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db as database, ref, get } from '../firebase';
import CheckoutModal from './CheckOutModal';
import { formatProductToCartItem } from '../utils/cartHelper';
import { useCart } from './CartContext';
import AddToCartModal from './AddToCartModal';

// ========== STATIC CURRENCIES ==========
const STATIC_CURRENCIES = {
  USD: { symbol: '$', rateFromUSD: 1, name: 'USD' },
  INR: { symbol: '₹', rateFromUSD: 83.5, name: 'INR' },
  AED: { symbol: 'د.إ', rateFromUSD: 3.67, name: 'AED' },
  AUD: { symbol: 'A$', rateFromUSD: 1.52, name: 'AUD' },
  CAD: { symbol: 'C$', rateFromUSD: 1.35, name: 'CAD' },
  EUR: { symbol: '€', rateFromUSD: 0.92, name: 'EUR' },
  GBP: { symbol: '£', rateFromUSD: 0.79, name: 'GBP' },
  KWD: { symbol: 'KD', rateFromUSD: 0.31, name: 'KWD' },
  MYR: { symbol: 'RM', rateFromUSD: 4.70, name: 'MYR' },
  OMR: { symbol: 'ر.ع.', rateFromUSD: 0.38, name: 'OMR' },
  QAR: { symbol: 'ر.ق', rateFromUSD: 3.64, name: 'QAR' },
  SAR: { symbol: '﷼', rateFromUSD: 3.75, name: 'SAR' },
  SGD: { symbol: 'S$', rateFromUSD: 1.34, name: 'SGD' },
  THB: { symbol: '฿', rateFromUSD: 35.8, name: 'THB' },
  TRY: { symbol: '₺', rateFromUSD: 32.5, name: 'TRY' },
  ZAR: { symbol: 'R', rateFromUSD: 18.9, name: 'ZAR' }
};

// Helper: format pack_type (array or string) into a readable string
const formatPackType = (packType) => {
  if (!packType) return '';
  if (Array.isArray(packType)) {
    return packType
      .map(item => item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .join(', ');
  }
  return packType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const ProductPage = ({ profile, globalSearchQuery = '', onGlobalSearchClear, isAuthenticated = false, onNewOrderSubmitted }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartCount } = useCart();
  const [toast, setToast] = useState({ show: false, message: '', subMessage: '', count: 0 });

  // ==================== ORIGINAL STATES ====================
  const [categoryData, setCategoryData] = useState(null);
  const [allCompanies, setAllCompanies] = useState({});
  const [allBrands, setAllBrands] = useState({});
  const [allProducts, setAllProducts] = useState({});
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('companies');
  const [isLoading, setIsLoading] = useState(true);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // ==================== ADD TO CART MODAL STATE ====================
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [cartProduct, setCartProduct] = useState(null);

  // ==================== CURRENCY STATES ====================
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);

  useEffect(() => {
    const currencies = Object.keys(STATIC_CURRENCIES).map(code => ({
      code,
      symbol: STATIC_CURRENCIES[code].symbol,
      rate: STATIC_CURRENCIES[code].rateFromUSD
    }));
    setAvailableCurrencies(currencies);
  }, []);

  useEffect(() => {
    if (!categoryData) return;
    setSelectedCurrency('USD');
  }, [categoryData, categoryId]);

  useEffect(() => {
    if (categoryData) {
      document.title = `${categoryData.name || 'Products'} - Exclusive Traders`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Source high quality wholesale ${categoryData.name || 'products'} including detailed pricing, specifications, and branding options from Exclusive Traders.`);
      }
    }
  }, [categoryData]);

  // ==================== MOBILE DETECTION ====================
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== FETCH ALL DATA ====================
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
        let brandIds = [];

        // For rice category, brands come from "type" field; otherwise from brandId
        if (categoryId === 'rice') {
          const types = [...new Set(companyProducts.map(p => p.type).filter(Boolean))];
          brandIds = types;
        } else {
          brandIds = [...new Set(companyProducts.map(p => p.brandId).filter(Boolean))];
        }

        return {
          ...company,
          productCount: companyProducts.length,
          brandCount: brandIds.length,
          hasBrands: brandIds.length > 0
        };
      });

      filteredCompanies.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      setCompanies(filteredCompanies);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  // ==================== SEARCH FILTERS ====================
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
        (product.pack_type && (Array.isArray(product.pack_type)
          ? product.pack_type.some(t => t.toLowerCase().includes(searchLower))
          : product.pack_type.toLowerCase().includes(searchLower))) ||
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
        (product.pack_type && (Array.isArray(product.pack_type)
          ? product.pack_type.some(t => t.toLowerCase().includes(searchLower))
          : product.pack_type.toLowerCase().includes(searchLower)))
      ));
    }
    setFilteredProducts(filtered);
  }, [globalSearchQuery, products, productSearchQuery]);

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

  // ==================== CURRENCY HELPERS ====================
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount && amount !== 0) return 0;
    if (fromCurrency === toCurrency) return amount;
    const fromRate = STATIC_CURRENCIES[fromCurrency]?.rateFromUSD;
    const toRate = STATIC_CURRENCIES[toCurrency]?.rateFromUSD;
    if (!fromRate || !toRate) return amount;
    const amountInUSD = fromCurrency === 'USD' ? amount : amount / fromRate;
    return amountInUSD * toRate;
  };

  // Helper: parse pack size from key like "5kg" => { kg: 5, price: value }
  const parsePackSize = (key, price) => {
    const match = key.match(/^(\d+(?:\.\d+)?)\s*kg$/i);
    if (match) {
      return { kg: parseFloat(match[1]), price: parseFloat(price) };
    }
    return null;
  };

  const getBasePrice = (product) => {
    if (!product) return { value: 0, currency: 'USD', unit: 'unit' };

    // NEW: Rice category with quantity object (pack sizes)
    const isRiceCategory = categoryId === 'rice' || (categoryData?.name?.toLowerCase().includes('rice'));
    if (isRiceCategory && product.quantity && typeof product.quantity === 'object') {
      const packEntries = Object.entries(product.quantity);
      if (packEntries.length > 0) {
        const packs = packEntries
          .map(([key, price]) => parsePackSize(key, price))
          .filter(p => p !== null);

        if (packs.length > 0) {
          // Find min and max kg and corresponding prices
          let minKg = Infinity, maxKg = -Infinity;
          let minPrice = Infinity, maxPrice = -Infinity;
          packs.forEach(pack => {
            if (pack.kg < minKg) {
              minKg = pack.kg;
              minPrice = pack.price;
            }
            if (pack.kg > maxKg) {
              maxKg = pack.kg;
              maxPrice = pack.price;
            }
          });
          return {
            type: 'rice_pack_range',
            minPrice: minPrice,
            maxPrice: maxPrice,
            minKg: minKg,
            maxKg: maxKg,
            currency: 'INR',
            unit: 'pack',
            packCount: packs.length
          };
        }
      }
    }

    // Fallback to existing logic for other products or rice without quantity
    if (product["Ex-Mill_usd"] !== undefined) {
      return { value: product["Ex-Mill_usd"], currency: 'USD', unit: 'carton', type: 'EX-MILL' };
    }
    if (product.price_usd_per_carton !== undefined) {
      return { value: product.price_usd_per_carton, currency: 'USD', unit: 'carton', type: 'carton' };
    }
    if (product.fob_price_usd !== undefined) {
      return { value: product.fob_price_usd, currency: 'USD', unit: 'carton', type: 'FOB' };
    }
    if (product.price?.min !== undefined && product.price?.max !== undefined) {
      const minPerKg = product.price.min / 100;
      const maxPerKg = product.price.max / 100;
      return {
        min: minPerKg,
        max: maxPerKg,
        value: (minPerKg + maxPerKg) / 2,
        currency: 'INR',
        unit: 'kg',
        type: 'rice'
      };
    }
    if (product.grades && Array.isArray(product.grades) && product.grades.length > 0) {
      const firstGrade = product.grades[0];
      if (firstGrade.price_inr) {
        return { value: parseFloat(firstGrade.price_inr), currency: 'INR', unit: 'kg', type: 'rice' };
      }
    }
    if (product.price && typeof product.price === 'object') {
      if (product.price.currency && product.price.value !== undefined) {
        return {
          value: product.price.value,
          currency: product.price.currency,
          unit: product.price.unit || 'unit',
          type: 'fixed'
        };
      }
    }
    if (typeof product.price === 'number') {
      const isRice = categoryId === 'rice' || categoryData?.name?.toLowerCase().includes('rice');
      if (isRice) {
        return { value: product.price, currency: 'INR', unit: 'kg', type: 'rice' };
      }
      return { value: product.price, currency: 'USD', unit: 'unit', type: 'fixed' };
    }
    return { value: 0, currency: 'USD', unit: 'unit', type: 'unknown' };
  };

  const getProductPrice = (product) => {
    if (!product) return 'Contact for Price';
    const base = getBasePrice(product);
    const targetCurrency = selectedCurrency;
    const symbol = STATIC_CURRENCIES[targetCurrency]?.symbol || targetCurrency;

    // Handle new rice pack range
    if (base.type === 'rice_pack_range') {
      const minConverted = convertCurrency(base.minPrice, base.currency, targetCurrency);
      const maxConverted = convertCurrency(base.maxPrice, base.currency, targetCurrency);
      const minKg = base.minKg;
      const maxKg = base.maxKg;

      if (base.packCount === 1) {
        return `${symbol}${minConverted.toFixed(2)} / pack (${minKg}kg)`;
      } else {
        return `${symbol}${minConverted.toFixed(2)} - ${symbol}${maxConverted.toFixed(2)} / pack (${minKg}kg-${maxKg}kg)`;
      }
    }

    if (base.type === 'rice' && base.min !== undefined && base.max !== undefined) {
      const minConv = convertCurrency(base.min, base.currency, targetCurrency);
      const maxConv = convertCurrency(base.max, base.currency, targetCurrency);
      return `${symbol}${minConv.toFixed(2)} - ${symbol}${maxConv.toFixed(2)} / ${base.unit}`;
    }
    if (base.type === 'rice' && base.value) {
      const valueConv = convertCurrency(base.value, base.currency, targetCurrency);
      return `${symbol}${valueConv.toFixed(2)} / ${base.unit}`;
    }
    let valueConv = convertCurrency(base.value, base.currency, targetCurrency);
    if (base.type === 'EX-MILL') return `${symbol}${valueConv.toFixed(2)} EX-MILL / ${base.unit}`;
    if (base.type === 'FOB') return `${symbol}${valueConv.toFixed(2)} FOB / ${base.unit}`;
    if (base.type === 'carton') return `${symbol}${valueConv.toFixed(2)} / ${base.unit}`;
    return `${symbol}${valueConv.toFixed(2)} / ${base.unit}`;
  };

  const getPerUnitPrice = (product) => {
    const base = getBasePrice(product);
    // Skip for rice pack range to avoid confusion
    if (base.type === 'rice_pack_range') return null;

    if ((base.type === 'carton' || base.type === 'EX-MILL' || base.type === 'FOB') && product.packaging?.units_per_carton) {
      const perUnitBase = base.value / product.packaging.units_per_carton;
      const perUnitConverted = convertCurrency(perUnitBase, base.currency, selectedCurrency);
      const symbol = STATIC_CURRENCIES[selectedCurrency]?.symbol || selectedCurrency;
      const perUnitText = `${symbol}${perUnitConverted.toFixed(2)} per unit`;
      let perGramText = null;
      if (product.packaging.unit_weight_g) {
        const perGramBase = perUnitBase / product.packaging.unit_weight_g;
        const perGramConv = convertCurrency(perGramBase, base.currency, selectedCurrency);
        perGramText = `${symbol}${perGramConv.toFixed(4)}/g`;
      }
      return { perUnit: perUnitText, perGram: perGramText };
    }
    return null;
  };

  // ==================== LOAD BRANDS & PRODUCTS ====================
  useEffect(() => {
    if (selectedCompany && allBrands && allProducts) {
      loadCompanyBrands();
    }
  }, [selectedCompany, allBrands, allProducts]);

  const loadCompanyBrands = () => {
    if (!selectedCompany || !allProducts) return;
    try {
      const companyProducts = Object.entries(allProducts)
        .filter(([_, productData]) =>
          productData.categoryId === categoryId &&
          productData.companyId === selectedCompany.id
        )
        .map(([id, data]) => ({ id, ...data }));

      // SPECIAL HANDLING FOR RICE CATEGORY: use "type" field as brand
      if (categoryId === 'rice') {
        const typeGroups = new Map(); // type -> { count, exampleProduct }
        companyProducts.forEach(product => {
          const type = product.type;
          if (type) {
            if (!typeGroups.has(type)) {
              typeGroups.set(type, { count: 0, product: product });
            }
            typeGroups.get(type).count++;
          }
        });

        const brandList = Array.from(typeGroups.entries()).map(([type, { count, product }]) => {
          // Format display name
          let displayName = type === 'basmati' ? 'Basmati Rice' :
            (type === 'non-basmati' ? 'Non-Basmati Rice' :
              type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

          // Derive the brand key in allBrands: 'basmati' → 'basmati_rice', 'non-basmati' → 'non_basmati_rice'
          const brandKey = type.replace(/-/g, '_') + '_rice';
          const brandData = allBrands[brandKey] || allBrands[type] || null;

          // Resolve image path – brand images live in public/img/Brands/ so keep that prefix as-is
          const resolveImagePath = (p) => {
            if (!p) return null;
            if (p.startsWith('http')) return p;
            // Ensure leading slash and return directly (public/img/ served at /img/)
            return p.startsWith('/') ? p : `/${p}`;
          };

          let imageUrl = null;
          if (brandData) {
            imageUrl = resolveImagePath(brandData.image || brandData.logo || brandData.brand_logo || null);
          }

          return {
            id: type,
            name: displayName,
            companyId: selectedCompany.id,
            companyName: selectedCompany.name,
            productCount: count,
            imageUrl,
            isRiceType: true
          };
        });

        brandList.sort((a, b) => a.name.localeCompare(b.name));
        setBrands(brandList);
        setViewMode('brands');
        return;
      }

      // Normal flow for other categories
      const brandedProducts = companyProducts.filter(p => p.brandId);
      const unbrandedProducts = companyProducts.filter(p => !p.brandId);

        const brandIds = [...new Set(brandedProducts.map(p => p.brandId))];
        let brandList = brandIds
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

        brandList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (brandList.length > 0) {
          setBrands(brandList);
          setViewMode('brands');
          return;
        }

        // No brands: show unbranded products directly
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

    useEffect(() => {
      if (selectedBrand && allProducts) {
        loadBrandProducts();
      }
    }, [selectedBrand, allProducts]);

    const loadBrandProducts = () => {
      if (!selectedBrand || !allProducts) return;
      try {
        let productsList;

        // For rice category, filter by product.type
        if (categoryId === 'rice' && selectedBrand.isRiceType) {
          productsList = Object.entries(allProducts)
            .filter(([_, productData]) =>
              productData.categoryId === categoryId &&
              productData.companyId === selectedBrand.companyId &&
              productData.type === selectedBrand.id
            )
            .map(([id, data]) => ({
              id,
              ...data,
              companyId: selectedBrand.companyId,
              companyName: selectedBrand.companyName,
              brandName: selectedBrand.name,
              imageUrl: getProductImageUrl(data)
            }));
        } else {
          // Normal flow: filter by brandId
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
        }

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

    // ==================== IMAGE HANDLING ====================
    const getCorrectImagePath = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) return imagePath;
      let cleanPath = imagePath.replace(/^\/+/, '');
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
      if (brandData.logo) return getCorrectImagePath(brandData.logo);
      if (brandData.image) return getCorrectImagePath(brandData.image);
      if (brandData.brand_logo) return getCorrectImagePath(brandData.brand_logo);
      return null;
    };

    const getCompanyLogo = (company) => {
      if (!company) return null;
      if (company.image) return getCorrectImagePath(company.image);
      if (company.logo) return getCorrectImagePath(company.logo);
      if (company.company_logo) return getCorrectImagePath(company.company_logo);
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

    // ==================== ADD TO CART HANDLER ====================
    const handleAddToCartClick = (product) => {
      setCartProduct(product);
      setShowAddToCartModal(true);
    };

    const handleAddToCartConfirm = (cartItem) => {
      addToCart(cartItem);
      
      const isRice = cartItem.isRice;
      const symbol = STATIC_CURRENCIES[selectedCurrency]?.symbol || selectedCurrency;
      const subMessage = isRice && cartItem.packingPrice > 0 
        ? `Packing Cost: ₹${cartItem.packingPrice}` 
        : '';
        
      setToast({
        show: true,
        message: `${cartItem.name} added to cart!`,
        subMessage: subMessage,
        count: getCartCount() + (cartItem.quantity || 1)
      });

      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      setShowAddToCartModal(false);
    };

    // ==================== NAVIGATION HANDLERS ====================
    const handleCompanySelect = (company) => {
      setSelectedCompany(company);
      setSelectedBrand(null);
      setBrandSearchQuery('');
    };

    const handleBrandSelect = (brand) => {
      setSelectedBrand(brand);
    };

    const handleBackToBrands = () => {
      setSelectedBrand(null);
      setProducts([]);
      setFilteredProducts([]);
      setViewMode('brands');
      setProductSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToCompanies = () => {
      setSelectedCompany(null);
      setSelectedBrand(null);
      setBrands([]);
      setProducts([]);
      setFilteredProducts([]);
      setViewMode('companies');
      setBrandSearchQuery('');
      setProductSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToAllProducts = () => {
      navigate('/all-products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ==================== ORDER ====================
    const handleOrderNow = (product) => {
      const cartItem = formatProductToCartItem(
        product,
        categoryId,
        categoryData?.name || categoryId
      );
      setCheckoutItems([cartItem]);
      setIsCheckoutOpen(true);
    };

    const handleViewDetails = (product) => {
      setDetailedProduct(product);
      setShowDetailsModal(true);
    };

    // ==================== LOADING STATE ====================
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

    // ==================== PRODUCTS COMPONENT ====================
    const Products = ({
      filteredProducts,
      selectedCompany,
      selectedBrand,
      getProductPrice,
      handleViewDetails,
      handleOrderNow,
      getPerUnitPrice,
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

          {/* Currency Selector */}
          <div className="currency-selector-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <div className="currency-dropdown-container">
              <select
                className="form-select currency-dropdown"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(0, 245, 200, 0.3)',
                  color: '#f1f5f9',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: 'auto',
                  minWidth: '120px'
                }}
              >
                {availableCurrencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
            </div>
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
                const priceDisplay = getProductPrice(product);
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-image-container">
                      <img
                        src={product.imageUrl || getFallbackImage()}
                        alt={product.name}
                        className="product-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getFallbackImage();
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

                    <div className="product-price">{priceDisplay}</div>

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
                      {/* UPDATED: pack_type as array or string */}
                      {product.pack_type && (
                        <li>
                          <strong>Pack Type:</strong> {formatPackType(product.pack_type)}
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
                      <div className="product-action-buttons">
                        <button
                          className="btn-cart"
                          onClick={() => handleAddToCartClick(product)}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="btn-order"
                          onClick={() => handleOrderNow(product)}
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Toast Notification */}
          <div className={`toast-notification ${toast.show ? 'show' : ''}`}>
            <div className="toast-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="toast-content">
              <p className="toast-title">{toast.message}</p>
              {toast.subMessage && <p className="toast-sub">{toast.subMessage}</p>}
              <p className="toast-sub">{toast.count} item(s) in cart</p>
            </div>
          </div>

          <style>{`
          .toast-notification {
            position: fixed;
            top: 90px;
            right: 20px;
            background: #00b84f;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            transform: translateX(150%);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-width: 350px;
          }
          .toast-notification.show {
            transform: translateX(0);
          }
          .toast-icon {
            margin-top: 2px;
            flex-shrink: 0;
          }
          .toast-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .toast-title {
            font-weight: 700;
            font-size: 0.95rem;
            margin: 0;
            line-height: 1.3;
          }
          .toast-sub {
            font-size: 0.85rem;
            opacity: 0.9;
            margin: 0;
            line-height: 1.2;
          }
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
            flex-direction: column;
            gap: 8px;
            margin-top: auto;
          }
          .product-action-buttons {
            display: flex;
            gap: 8px;
            width: 100%;
          }
          .btn-view {
            width: 100%;
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
          .btn-cart {
            flex: 1;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 0;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: 0.2s;
          }
          .btn-cart:hover {
            background: #2563eb;
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

    // ==================== COMPANIES GRID ====================
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
                          if (originalUrl && originalUrl !== transformedUrl) {
                            e.target.src = originalUrl;
                            e.target.onerror = () => {
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

    // ==================== BRANDS GRID ====================
    const renderBrands = () => {
      const sortedBrands = [...brands].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      return (
        <div className="brands-grid-section" style={{ marginTop: '2rem' }}>
          <div className="mb-3">
            <h3 className="h5 mb-1">{selectedCompany.name}</h3>
            <p className="text-sm text-muted mb-0">Select a brand to view products</p>
          </div>

          {sortedBrands.length === 0 ? (
            <div className="no-products-message text-center py-5">
              <p className="h5 text-muted">No brands available</p>
              <p className="text-sm opacity-80 mt-2">
                This company doesn't have any brands in this category.
              </p>
            </div>
          ) : (
            <div className="brands-grid">
              {sortedBrands.map(brand => {
                const brandLogo = brand.imageUrl;
                const originalPath = brand.logo || brand.image || brand.brand_logo;
                const originalUrl = originalPath ? (originalPath.startsWith('http') ? originalPath : `/${originalPath.replace(/^\/+/, '')}`) : null;
                return (
                  <div
                    key={brand.id}
                    className="brand-grid-item"
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
                            if (originalUrl && originalUrl !== brandLogo) {
                              e.target.src = originalUrl;
                              e.target.onerror = () => {
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
          .brands-grid-section {
            width: 100%;
            padding: 0 0 20px 0;
          }
          .brands-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
            max-width: 1000px;
            margin: 0 auto;
          }
          .brand-grid-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transition: transform 0.2s;
          }
          .brand-grid-item:hover {
            transform: translateY(-5px);
          }
          .brand-logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
            min-height: 80px;
          }
          .brand-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
          }
          .brand-logo-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #2d3748;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a0aec0;
          }
          .brand-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: white;
            margin-bottom: 8px;
            line-height: 1.3;
            word-break: break-word;
          }
          .brand-product-count {
            font-size: 0.9rem;
            color: #9ca3af;
          }

          @media (max-width: 992px) {
            .brands-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 25px;
            }
          }

          @media (max-width: 768px) {
            .brands-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .brand-logo {
              width: 70px;
              height: 70px;
            }
            .brand-logo-placeholder {
              width: 70px;
              height: 70px;
            }
            .brand-name {
              font-size: 1rem;
            }
          }

          @media (max-width: 480px) {
            .brands-grid {
              grid-template-columns: 1fr;
              max-width: 280px;
            }
          }
        `}</style>
        </div>
      );
    };

    // ==================== MAIN RENDER ====================
    return (
      <div className="product-page">
        <div className="product-main-content">
          <button
            className="back-button"
            style={{ top: isMobile ? '145px' : '120px', left: isMobile ? '15px' : '20px' }}   // mobile: top 145px, left 15px
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
              getPerUnitPrice={getPerUnitPrice}
            />
          )}
        </div>

        {/* Checkout Modal for Order Now */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutItems([]);
            if (onNewOrderSubmitted) {
              onNewOrderSubmitted();
            }
          }}
          cartItems={checkoutItems}
          profile={profile || null}
          currencyRates={Object.fromEntries(
            Object.entries(STATIC_CURRENCIES).map(([code, data]) => [code, data.rateFromUSD])
          )}
          currencySymbols={Object.fromEntries(
            Object.entries(STATIC_CURRENCIES).map(([code, data]) => [code, data.symbol])
          )}
          selectedCurrency={selectedCurrency}
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
                      <span className="modal-spec-value">
                        {STATIC_CURRENCIES[selectedCurrency]?.symbol || '$'}{convertCurrency(detailedProduct["Ex-Mill_usd"], 'USD', selectedCurrency).toFixed(2)} {selectedCurrency}
                      </span>
                    </div>
                  )}

                  {detailedProduct["Ex-Mill_usd"] === undefined && detailedProduct.fob_price_usd !== undefined && (
                    <div className="modal-spec-item">
                      <span className="modal-spec-label">FOB Price</span>
                      <span className="modal-spec-value">
                        {STATIC_CURRENCIES[selectedCurrency]?.symbol || '$'}{convertCurrency(detailedProduct.fob_price_usd, 'USD', selectedCurrency).toFixed(2)} {selectedCurrency}
                      </span>
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
                      <span className="modal-spec-value">{formatPackType(detailedProduct.pack_type)}</span>
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

        {/* Add to Cart Modal */}
        {showAddToCartModal && cartProduct && (
          <AddToCartModal
            isOpen={showAddToCartModal}
            onClose={() => setShowAddToCartModal(false)}
            product={cartProduct}
            onAddToCart={handleAddToCartConfirm}
            industry={categoryData?.name || categoryId}
          />
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
          /* top and left are set inline */
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
          /* No back-button positioning here – inline style now handles it */
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