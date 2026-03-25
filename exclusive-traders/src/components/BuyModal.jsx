// src/components/BuyModal.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { riceData } from "../data/products";
import ThankYouPopup from "../components/ThankYouPopup";
import { ref, push, set, get } from "firebase/database";
import { quoteDatabase } from "../firebase";

// Transport mode costs (USD per unit)
const TRANSPORT_COSTS = {
  road: 1.90,
  air: 5.00,
  ocean: 2.50
};

// Currency options
const currencyOptions = [
  { code: "USD", symbol: "$", rate: 1.00, flag: "🇺🇸" },
  { code: "AED", symbol: "د.إ", rate: 3.67, flag: "🇦🇪" },
  { code: "AUD", symbol: "A$", rate: 1.52, flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", rate: 1.36, flag: "🇨🇦" },
  { code: "EUR", symbol: "€", rate: 0.92, flag: "🇪🇺" },
  { code: "GBP", symbol: "£", rate: 0.79, flag: "🇬🇧" },
  { code: "INR", symbol: "₹", rate: 83.50, flag: "🇮🇳" },
  { code: "KWD", symbol: "ك.د", rate: 0.31, flag: "🇰🇼" },
  { code: "MYR", symbol: "RM", rate: 4.70, flag: "🇲🇾" },
  { code: "OMR", symbol: "ر.ع.", rate: 0.38, flag: "🇴🇲" },
  { code: "QAR", symbol: "ر.ق", rate: 3.64, flag: "🇶🇦" },
  { code: "SAR", symbol: "ر.س", rate: 3.75, flag: "🇸🇦" },
  { code: "SGD", symbol: "S$", rate: 1.35, flag: "🇸🇬" },
  { code: "THB", symbol: "฿", rate: 35.80, flag: "🇹🇭" },
  { code: "TRY", symbol: "₺", rate: 32.50, flag: "🇹🇷" },
  { code: "ZAR", symbol: "R", rate: 18.90, flag: "🇿🇦" }
];

// --- CONFIGURABLE BASE URL FOR IMAGES ---
const IMAGE_BASE_URL = ""; // e.g., "https://your-cdn.com"

const BuyModal = ({ isOpen, onClose, product, productId, profile, industry }) => {
  // --- State for product recovery (refresh resilience) ---
  const [recoveredId, setRecoveredId] = useState(null);
  const [displayProduct, setDisplayProduct] = useState(product || null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productError, setProductError] = useState("");

  // --- Form state ---
  const [packing, setPacking] = useState("");
  const [quantity, setQuantity] = useState("");
  const [customQuantity, setCustomQuantity] = useState("");
  const [port, setPort] = useState("");
  const [grade, setGrade] = useState("");
  const [cifRequired, setCifRequired] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [grades, setGrades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantityOptions, setQuantityOptions] = useState([]);
  const [packingOptions, setPackingOptions] = useState([]);
  const [portPrice, setPortPrice] = useState(0.00);
  const [packingPrice, setPackingPrice] = useState(0.00);
  
  // --- User contact details from signup ---
  const [userCountry, setUserCountry] = useState("");
  const [userState, setUserState] = useState("");
  const [userCity, setUserCity] = useState("");
  const [userPincode, setUserPincode] = useState("");
  
  // --- Manual destination inputs ---
  const [destinationCountry, setDestinationCountry] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  
  // --- Auto-fill flag ---
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // --- Image fetching state ---
  const [fetchedImage, setFetchedImage] = useState(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // --- Currency state ---
  const [displayCurrency, setDisplayCurrency] = useState(currencyOptions[0]);

  // --- Units per carton (only for non‑rice) ---
  const [unitsPerCarton, setUnitsPerCarton] = useState(27);

  // --- Transport details state ---
  const [transportType, setTransportType] = useState("");
  const [pickupLocation, setPickupLocation] = useState({ city: "", state: "", country: "" });
  const [deliveryLocation, setDeliveryLocation] = useState({ city: "", state: "", country: "" });
  const [vehicleType, setVehicleType] = useState("");
  const [airportOfLoading, setAirportOfLoading] = useState({ country: "", airportName: "" });
  const [airportOfDestination, setAirportOfDestination] = useState({ country: "", airportName: "" });
  const [portOfLoading, setPortOfLoading] = useState({ country: "", state: "", portName: "" });
  const [portOfDestination, setPortOfDestination] = useState({ country: "", state: "", portName: "" });

  // --- Refs ---
  const modalRef = useRef(null);
  const formContainerRef = useRef(null);
  const estimateContainerRef = useRef(null);
  const countrySelectRef = useRef(null);

  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10 },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10 },
    { value: "+44", flag: "🇬🇧", name: "UK", length: 10 },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9 },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9 },
    { value: "+98", flag: "🇮🇷", name: "Iran", length: 10 },
    { value: "+90", flag: "🇹🇷", name: "Turkey", length: 10 },
    { value: "+66", flag: "🇹🇭", name: "Thailand", length: 9 },
    { value: "+65", flag: "🇸🇬", name: "Singapore", length: 8 },
    { value: "+81", flag: "🇯🇵", name: "Japan", length: 10 },
    { value: "+86", flag: "🇨🇳", name: "China", length: 11 }
  ];

  const transportOptions = [
    { value: "road", label: "Road Transport", cost: TRANSPORT_COSTS.road },
    { value: "air", label: "Air Freight", cost: TRANSPORT_COSTS.air },
    { value: "ocean", label: "Ocean Freight", cost: TRANSPORT_COSTS.ocean }
  ];

  const vehicleOptions = [
    { value: "truck", label: "Truck" },
    { value: "container_truck", label: "Container Truck" },
    { value: "mini_truck", label: "Mini Truck" }
  ];

  // --- Try to recover ID from localStorage/URL if no product or productId provided ---
  useEffect(() => {
    if (!product && !productId && isOpen) {
      const storedId = localStorage.getItem('lastViewedProductId');
      if (storedId) {
        setRecoveredId(storedId);
        return;
      }
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && !isNaN(lastSegment)) {
        setRecoveredId(lastSegment);
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('id') || urlParams.get('productId');
      if (queryId) {
        setRecoveredId(queryId);
        return;
      }
    } else {
      setRecoveredId(null);
    }
  }, [isOpen, product, productId]);

  const effectiveProductId = productId || recoveredId;

  // --- Fetch product if not provided ---
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isOpen) return;
      if (product) {
        setDisplayProduct(product);
        setProductError("");
        return;
      }
      if (effectiveProductId) {
        setIsLoadingProduct(true);
        setProductError("");
        try {
          const productRef = ref(quoteDatabase, `products/${effectiveProductId}`);
          const snapshot = await get(productRef);
          if (snapshot.exists()) {
            const fetched = { id: effectiveProductId, ...snapshot.val() };
            setDisplayProduct(fetched);
            localStorage.setItem('lastViewedProductId', effectiveProductId);
          } else {
            setProductError("Product not found.");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setProductError("Failed to load product.");
        } finally {
          setIsLoadingProduct(false);
        }
      } else {
        setProductError("No product information available.");
      }
    };
    fetchProduct();
  }, [isOpen, product, effectiveProductId]);

  useEffect(() => {
    if (!isOpen) {
      setDisplayProduct(null);
      setProductError("");
    }
  }, [isOpen]);

  // --- Image fetching functions (unchanged) ---
  const checkImageExists = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error('Image load timeout'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };
      img.onerror = (err) => {
        clearTimeout(timeout);
        reject(err);
      };
      img.src = url;
    });
  };

  const deepSearchForImage = async (rootPath, identifiers) => {
    try {
      const rootRef = ref(quoteDatabase, rootPath);
      const snapshot = await get(rootRef);
      if (!snapshot.exists()) return null;

      const data = snapshot.val();

      const traverse = (obj, depth = 0) => {
        if (depth > 10) return null;
        if (!obj || typeof obj !== 'object') return null;

        if (Array.isArray(obj)) {
          for (const item of obj) {
            const result = traverse(item, depth + 1);
            if (result) return result;
          }
          return null;
        }

        for (const [key, value] of Object.entries(obj)) {
          if (identifiers.some(id => id && key.toLowerCase().includes(id.toLowerCase()))) {
            if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/') || value.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i))) {
              return value;
            }
          }
          const result = traverse(value, depth + 1);
          if (result) return result;
        }

        for (const value of Object.values(obj)) {
          if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/') || value.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i))) {
            return value;
          }
          if (typeof value === 'object') {
            const result = traverse(value, depth + 1);
            if (result) return result;
          }
        }
        return null;
      };

      return traverse(data);
    } catch (err) {
      console.error(`Error deep searching ${rootPath}:`, err);
      return null;
    }
  };

  const buildAbsoluteUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = IMAGE_BASE_URL || window.location.origin;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return base + cleanPath;
  };

  const fetchImage = async () => {
    if (!isOpen) return;
    setImageError("");
    if (!displayProduct) return;

    const directCandidates = [
      displayProduct.image,
      displayProduct.images && displayProduct.images[0],
      displayProduct.picture,
      displayProduct.img,
      displayProduct.imageUrl,
      displayProduct.image_url,
      displayProduct.imageurl,
      displayProduct.photo,
      displayProduct.photo_url,
      displayProduct.thumbnail,
      displayProduct.img_url,
      displayProduct.img_src,
      displayProduct.url,
      displayProduct.src
    ].filter(field => field && typeof field === 'string');

    for (const candidate of directCandidates) {
      const url = buildAbsoluteUrl(candidate);
      try {
        await checkImageExists(url);
        setFetchedImage(url);
        setIsFetchingImage(false);
        return;
      } catch (err) {}
    }

    setIsFetchingImage(true);
    const possibleIdFields = [
      displayProduct.id,
      displayProduct.productId,
      displayProduct.sku,
      displayProduct._id,
      displayProduct.name ? displayProduct.name.replace(/\s+/g, '_').toLowerCase() : null,
      displayProduct.slug,
      displayProduct.key,
      displayProduct.code,
      displayProduct.reference
    ].filter(Boolean);

    for (const identifier of possibleIdFields) {
      const pathsToTry = [
        `products/${identifier}`,
        `productImages/${identifier}`,
        `images/${identifier}`,
        `productData/${identifier}`,
        `items/${identifier}`,
        `catalog/${identifier}`,
        `allProducts/${identifier}`,
        `productsList/${identifier}`,
        `productCatalog/${identifier}`,
        `store/products/${identifier}`,
        `inventory/products/${identifier}`,
        `products/${identifier}/image`,
        `products/${identifier}/images/0`,
        `productImages/${identifier}/url`,
        `productImages/${identifier}/src`,
        `productImages/${identifier}/image`,
        `productImages/${identifier}/imageUrl`,
        `productImages/${identifier}/image_url`,
        `productImages/${identifier}/img`,
        `images/${identifier}/url`,
        `images/${identifier}/src`,
        `images/${identifier}/image`,
        `images/${identifier}/imageUrl`,
        `images/${identifier}/image_url`,
        `productData/${identifier}/image`,
        `productData/${identifier}/images/0`,
        `items/${identifier}/image`,
        `catalog/${identifier}/image`,
        `products/${identifier}/media/image`,
        `products/${identifier}/media/0`,
        `productImages/${identifier}/media/0`,
        `images/${identifier}/media/0`,
        `product_images/${identifier}`,
        `products/${identifier}/images`,
        `productImages/${identifier}/images`,
        `images/${identifier}/images`,
        `products/${identifier}/picture`,
        `productImages/${identifier}/picture`,
        `images/${identifier}/picture`,
        `products/${identifier}/photo`,
        `productImages/${identifier}/photo`,
        `images/${identifier}/photo`,
        `products/${identifier}/thumbnail`,
        `productImages/${identifier}/thumbnail`,
        `images/${identifier}/thumbnail`,
        `products/${identifier}/img`,
        `productImages/${identifier}/img`,
        `images/${identifier}/img`,
        `productInfo/${identifier}/image`,
        `productInfo/${identifier}/images/0`,
        `productDetails/${identifier}/image`,
        `productDetails/${identifier}/images/0`,
        `productAssets/${identifier}/image`,
        `productAssets/${identifier}/images/0`,
        `productMedia/${identifier}/image`,
        `productMedia/${identifier}/images/0`,
        `productGallery/${identifier}/0`,
        `productPhotos/${identifier}/0`,
      ];

      for (const path of pathsToTry) {
        try {
          const imageRef = ref(quoteDatabase, path);
          const snapshot = await get(imageRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            const findImageInData = (obj) => {
              if (!obj) return null;
              if (typeof obj === 'string') {
                if (obj.startsWith('http') || obj.startsWith('/') || obj.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i)) {
                  return obj;
                }
                return null;
              }
              if (Array.isArray(obj)) {
                for (const item of obj) {
                  const result = findImageInData(item);
                  if (result) return result;
                }
                return null;
              }
              if (typeof obj === 'object') {
                for (const key in obj) {
                  const result = findImageInData(obj[key]);
                  if (result) return result;
                }
              }
              return null;
            };
            let possibleImage = findImageInData(data);
            if (possibleImage) {
              const finalImage = buildAbsoluteUrl(possibleImage);
              try {
                await checkImageExists(finalImage);
                setFetchedImage(finalImage);
                setIsFetchingImage(false);
                return;
              } catch (err) {}
            }
          }
        } catch (err) {}
      }
    }

    const rootsToDeepSearch = [
      'products', 'productImages', 'images', 'productData', 'items', 'catalog',
      'allProducts', 'store', 'inventory', 'productInfo', 'productDetails',
      'productAssets', 'productMedia', 'productGallery', 'productPhotos'
    ];

    for (const root of rootsToDeepSearch) {
      const found = await deepSearchForImage(root, possibleIdFields);
      if (found) {
        const finalImage = buildAbsoluteUrl(found);
        try {
          await checkImageExists(finalImage);
          setFetchedImage(finalImage);
          setIsFetchingImage(false);
          return;
        } catch (err) {}
      }
    }

    setImageError("No image could be loaded for this product.");
    setIsFetchingImage(false);
  };

  useEffect(() => {
    fetchImage();
  }, [isOpen, displayProduct, retryCount]);

  // --- Default packing list (exact from your first image) ---
  const defaultRicePackingOptions = [
    { value: "PP Bags", price: "10" },
    { value: "Non-Woven Bags", price: "15" },
    { value: "Jute Bags", price: "20" },
    { value: "BOPP Bags", price: "16" },
    { value: "LDPE Bags", price: "12" },
    { value: "HDPE Bags", price: "11" },
    { value: "Vacuum Packed", price: "24" },
    { value: "Paper Bags", price: "9" },
    { value: "Bulk Packaging", price: "6" },
    { value: "Custom Packaging", price: "30" }
  ];

  // --- Get packing options from product data (synchronous) ---
  const getPackingOptionsFromProduct = () => {
    if (!displayProduct) return [];
    const options = [];
    if (displayProduct.packaging) {
      if (typeof displayProduct.packaging === 'object') {
        if (displayProduct.packaging.type) {
          options.push({ value: displayProduct.packaging.type, price: "10" });
        }
      } else if (typeof displayProduct.packaging === 'string') {
        options.push({ value: displayProduct.packaging, price: "10" });
      }
    }
    if (displayProduct.pack_type) {
      options.push({ value: displayProduct.pack_type, price: "12" });
    }
    const unique = [...new Map(options.map(item => [item.value, item])).values()];
    return unique;
  };

  // --- Fetch packing options (from Firebase, fallback to default) ---
  useEffect(() => {
    if (!isOpen || !displayProduct) return;

    const productOptions = getPackingOptionsFromProduct();
    if (productOptions.length > 0) {
      console.log("Using product-specific packing options:", productOptions);
      setPackingOptions(productOptions);
      return;
    }

    const fetchPackaging = async () => {
      if (!industry) {
        setPackingOptions(defaultRicePackingOptions);
        return;
      }

      const isRice = industry.toLowerCase() === 'rice' || displayProduct.categoryId === 'rice';
      let fetched = [];

      try {
        // Try industry-specific path first
        const specRef = ref(quoteDatabase, `packagingOptions/${industry}`);
        console.log(`Fetching from: packagingOptions/${industry}`);
        let snapshot = await get(specRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Data from spec path:", data);
          if (Array.isArray(data)) {
            fetched = data;
          } else if (typeof data === 'object') {
            fetched = Object.values(data);
          }
        }

        // If still empty and it's rice, try root packagingOptions
        if (fetched.length === 0 && isRice) {
          const rootRef = ref(quoteDatabase, 'packagingOptions');
          console.log("Fetching from root: packagingOptions");
          snapshot = await get(rootRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Data from root path:", data);
            if (typeof data === 'object') {
              // Convert object like { "PP Bags": 10, ... } into array
              fetched = Object.entries(data).map(([value, price]) => ({
                value,
                price: price.toString()
              }));
            }
          }
        }

        // Validate each option has value and price
        const valid = fetched.filter(opt => opt.value && opt.price !== undefined);
        if (valid.length > 0) {
          console.log("Using Firebase packing options:", valid);
          setPackingOptions(valid);
          return;
        }
      } catch (err) {
        console.error("Error fetching packaging options:", err);
      }

      // Fallback to default list
      console.log("Using default rice packing options:", defaultRicePackingOptions);
      setPackingOptions(defaultRicePackingOptions);
    };

    fetchPackaging();
  }, [isOpen, displayProduct, industry]);

  // --- Get grades from product data ---
  const getGradesFromProduct = () => {
    if (!displayProduct) return [];
    const gradesList = [];
    
    if (displayProduct.grades && Array.isArray(displayProduct.grades)) {
      displayProduct.grades.forEach(grade => {
        gradesList.push({
          value: grade.grade || grade.name || "Standard",
          price: grade.price || (grade.price_inr ? (grade.price_inr / 83).toFixed(2) : "1.00")
        });
      });
    }
    
    if (displayProduct.grade) {
      gradesList.push({
        value: displayProduct.grade,
        price: "1.00"
      });
    }
    
    const isRice = industry?.toLowerCase() === 'rice' || displayProduct.categoryId === 'rice';
    if (isRice && displayProduct.variety) {
      const variety = displayProduct.variety;
      const varietyEntries = riceData.filter((e) => {
        const dataVariety = e.variety?.trim().toLowerCase() || '';
        const searchVariety = variety.trim().toLowerCase();
        return dataVariety.includes(searchVariety) || searchVariety.includes(dataVariety);
      });
      
      const uniqueGrades = [...new Set(varietyEntries
        .map((e) => ({
          value: e.grade,
          price: (e.price_inr / 83).toFixed(2)
        }))
        .filter(grade => grade.value && grade.value.trim() !== '')
      )];
      
      gradesList.push(...uniqueGrades);
    }
    
    return gradesList;
  };

  // --- Effects for grades and units per carton ---
  useEffect(() => {
    if (isOpen && displayProduct) {
      const gradesList = getGradesFromProduct();
      setGrades(gradesList);
      if (gradesList.length === 1) {
        setGrade(gradesList[0].value);
      } else {
        setGrade("");
      }

      const isRice = industry?.toLowerCase() === 'rice' || displayProduct.categoryId === 'rice';
      if (!isRice) {
        const getUnitsPerCarton = () => {
          if (displayProduct.units_per_carton) return displayProduct.units_per_carton;
          if (displayProduct.packaging?.units_per_carton) return displayProduct.packaging.units_per_carton;
          return 27;
        };
        setUnitsPerCarton(getUnitsPerCarton());
      } else {
        setUnitsPerCarton(1);
      }
    } else {
      setGrades([]);
      setGrade("");
    }
  }, [isOpen, displayProduct, industry]);

  // --- Fetch quantity options ---
  useEffect(() => {
    if (!isOpen || !displayProduct) return;

    const isRice = industry?.toLowerCase() === 'rice' || displayProduct.categoryId === 'rice';
    console.log("Industry:", industry, "categoryId:", displayProduct?.categoryId, "isRice:", isRice);

    // ✅ For rice, always use the kg list – never fetch from Firebase
    if (isRice) {
      const kgOptions = [1, 5, 10, 25, 50, 100, 500, 1000];
      const options = kgOptions.map(kg => {
        let label = `${kg} kg`;
        if (kg === 100) label = "100 kg (1 Quintal)";
        if (kg === 500) label = "500 kg (5 Quintals)";
        if (kg === 1000) label = "1000 kg (1 Ton)";
        return { value: `${kg} kg`, label };
      });
      options.push({ value: "Custom Quantity", label: "Custom Quantity" });
      setQuantityOptions(options);
      // Reset quantity if needed
      const currentIndex = options.findIndex(opt => opt.value === quantity);
      if (currentIndex === -1 && options.length > 0 && options[0].value !== "Custom Quantity") {
        setQuantity(options[0].value);
      } else if (currentIndex === -1) {
        setQuantity("");
      }
      console.log("✅ Rice quantity options set (kg):", options);
      return;
    }

    // For non‑rice: fetch from Firebase or generate carton options
    const fetchQuantityOptions = async () => {
      if (industry) {
        try {
          const qtyRef = ref(quoteDatabase, `quantityOptions/${industry}`);
          const snapshot = await get(qtyRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            let fetched = [];
            if (Array.isArray(data)) {
              fetched = data;
            } else if (typeof data === 'object') {
              fetched = Object.values(data);
            }
            const valid = fetched.filter(opt => opt.value && opt.label);
            if (valid.length > 0) {
              setQuantityOptions(valid);
              const currentIndex = valid.findIndex(opt => opt.value === quantity);
              if (currentIndex === -1 && valid.length > 0 && valid[0].value !== "Custom Quantity") {
                setQuantity(valid[0].value);
              } else if (currentIndex === -1) {
                setQuantity("");
              }
              return;
            }
          }
        } catch (err) {
          console.error("Error fetching quantity options:", err);
        }
      }

      // Fallback to generated carton options
      const units = unitsPerCarton;
      const cartonMultipliers = [1, 5, 10, 20, 50];
      const options = cartonMultipliers.map(mult => {
        const totalUnits = mult * units;
        return {
          value: `${mult} Carton${mult > 1 ? 's' : ''}`,
          label: `${mult} Carton${mult > 1 ? 's' : ''} (${totalUnits} units)`
        };
      });
      options.push({ value: "Custom Quantity", label: "Custom Quantity" });
      setQuantityOptions(options);
      const currentIndex = options.findIndex(opt => opt.value === quantity);
      if (currentIndex === -1 && options.length > 0 && options[0].value !== "Custom Quantity") {
        setQuantity(options[0].value);
      } else if (currentIndex === -1) {
        setQuantity("");
      }
    };

    fetchQuantityOptions();
  }, [industry, unitsPerCarton, displayProduct, isOpen, quantity]);

  // --- Update packing price when packing changes ---
  useEffect(() => {
    if (packing) {
      const selectedPacking = packingOptions.find(option => option.value === packing);
      setPackingPrice(selectedPacking ? parseFloat(selectedPacking.price) : 0.00);
    } else {
      setPackingPrice(0.00);
    }
  }, [packing, packingOptions]);

  // --- Auto-fill user details ---
  useEffect(() => {
    if (isOpen && !hasAutoFilled) {
      const possibleKeys = ['current_user', 'user', 'profile', 'authUser'];
      let userData = {};
      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            userData = JSON.parse(stored);
            break;
          } catch (e) {}
        }
      }
      const getNested = (obj, path) => path.split('.').reduce((current, key) => current && current[key], obj);
      const nameValue = profile?.fullName || profile?.displayName || profile?.name || userData.fullName || userData.displayName || userData.name || "";
      setFullName(nameValue);
      const emailValue = profile?.email || "";
      setEmail(emailValue);
      const countryValue = getNested(userData, 'address.country') || userData.country || "India";
      const stateValue = getNested(userData, 'address.state') || userData.state || "";
      const cityValue = getNested(userData, 'address.city') || userData.city || "";
      const pincodeValue = getNested(userData, 'address.pincode') || userData.pincode || getNested(userData, 'address.zip') || userData.zip || "";
      setUserCountry(countryValue);
      setUserState(stateValue);
      setUserCity(cityValue);
      setUserPincode(pincodeValue);
      let phoneData = profile?.phone || userData.phone || userData.phoneNumber || "";
      if (phoneData) {
        const phoneStr = String(phoneData).trim();
        if (phoneStr.includes(" ")) {
          const phoneParts = phoneStr.split(" ");
          const possibleCode = phoneParts[0];
          const matchedCode = countryOptions.find(opt => opt.value === possibleCode);
          if (matchedCode) {
            setCountryCode(matchedCode.value);
            setPhoneNumber(phoneParts.slice(1).join("").replace(/\D/g, ""));
          } else {
            setCountryCode("+91");
            setPhoneNumber(phoneStr.replace(/\D/g, ""));
          }
        } else if (phoneStr.startsWith("+")) {
          const matchedCode = countryOptions.find(opt => phoneStr.startsWith(opt.value));
          if (matchedCode) {
            setCountryCode(matchedCode.value);
            const numberPart = phoneStr.substring(matchedCode.value.length);
            setPhoneNumber(numberPart.replace(/\D/g, ""));
          } else {
            setCountryCode("+91");
            setPhoneNumber(phoneStr.replace(/\D/g, "").substring(1));
          }
        } else {
          setCountryCode("+91");
          setPhoneNumber(phoneStr.replace(/\D/g, ""));
        }
      }
      setHasAutoFilled(true);
    }
  }, [isOpen, profile]);

  // --- Click outside to close ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // --- Validation functions ---
  const validatePhoneNumber = (number, code) => {
    const selectedCountry = countryOptions.find((opt) => opt.value === code);
    const expectedLength = selectedCountry?.length || 10;
    if (!number) {
      setPhoneError("Phone number is required");
      return false;
    } else if (number.length !== expectedLength) {
      setPhoneError(`Phone number must be ${expectedLength} digits`);
      return false;
    } else if (!/^\d+$/.test(number)) {
      setPhoneError("Phone number must contain only digits");
      return false;
    } else {
      setPhoneError("");
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // --- Input handlers ---
  const handlePhoneCountryChange = (e) => {
    e.preventDefault();
    const newCode = e.target.value;
    setCountryCode(newCode);
    setPhoneNumber("");
    setPhoneError("");
  };

  const handlePhoneChange = (e) => {
    e.preventDefault();
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
    validatePhoneNumber(value, countryCode);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleFullNameChange = (e) => setFullName(e.target.value);
  const handleUserCountryChange = (e) => setUserCountry(e.target.value);
  const handleUserStateChange = (e) => setUserState(e.target.value);
  const handleUserCityChange = (e) => setUserCity(e.target.value);
  const handleUserPincodeChange = (e) => setUserPincode(e.target.value);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (value !== "Custom Quantity") {
      setCustomQuantity("");
    }
  };

  const handlePackingChange = (e) => setPacking(e.target.value);

  const handleCurrencyChange = (e) => {
    const selectedCode = e.target.value;
    const currency = currencyOptions.find(c => c.code === selectedCode);
    if (currency) setDisplayCurrency(currency);
  };

  // --- Transport handlers ---
  const handleTransportTypeChange = (e) => setTransportType(e.target.value);

  const handlePickupLocationChange = (field, value) => {
    setPickupLocation(prev => ({ ...prev, [field]: value }));
  };
  const handleDeliveryLocationChange = (field, value) => {
    setDeliveryLocation(prev => ({ ...prev, [field]: value }));
  };
  const handleAirportLoadingChange = (field, value) => {
    setAirportOfLoading(prev => ({ ...prev, [field]: value }));
  };
  const handleAirportDestinationChange = (field, value) => {
    setAirportOfDestination(prev => ({ ...prev, [field]: value }));
  };
  const handlePortOfLoadingChange = (field, value) => {
    setPortOfLoading(prev => ({ ...prev, [field]: value }));
  };
  const handlePortOfDestinationChange = (field, value) => {
    setPortOfDestination(prev => ({ ...prev, [field]: value }));
  };

  // --- Helper functions for quantity buttons ---
  const isRice = useMemo(() => {
    return industry?.toLowerCase() === 'rice' || displayProduct?.categoryId === 'rice';
  }, [industry, displayProduct]);

  // For non‑rice: carton options (from quantityOptions, filtered)
  const cartonOptions = useMemo(() => {
    if (isRice) return [];
    return quantityOptions
      .filter(opt => opt.value !== "Custom Quantity")
      .map(opt => {
        const match = opt.value.match(/^(\d+)\s+Carton/);
        const count = match ? parseInt(match[1], 10) : null;
        return count !== null ? { count, value: opt.value } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.count - b.count);
  }, [quantityOptions, isRice]);

  // For rice: kg values (numeric)
  const kgValues = useMemo(() => [1, 5, 10, 25, 50, 100, 500, 1000], []);

  const currentKgValue = useMemo(() => {
    if (!isRice) return null;
    const match = quantity?.match(/^(\d+)\s+kg/);
    return match ? parseInt(match[1], 10) : null;
  }, [quantity, isRice]);

  const currentCartonCount = useMemo(() => {
    if (isRice) return null;
    const match = quantity?.match(/^(\d+)\s+Carton/);
    return match ? parseInt(match[1], 10) : null;
  }, [quantity, isRice]);

  const handleIncrease = () => {
    if (isSubmitting) return;
    if (quantity === "Custom Quantity") {
      // If currently on custom, jump to first option
      if (isRice && kgValues.length) {
        setQuantity(`${kgValues[0]} kg`);
      } else if (!isRice && cartonOptions.length) {
        setQuantity(cartonOptions[0].value);
      }
      return;
    }

    if (isRice) {
      if (currentKgValue === null) return;
      const currentIndex = kgValues.indexOf(currentKgValue);
      if (currentIndex !== -1 && currentIndex < kgValues.length - 1) {
        const nextKg = kgValues[currentIndex + 1];
        setQuantity(`${nextKg} kg`);
      }
    } else {
      if (currentCartonCount === null) return;
      const currentIndex = cartonOptions.findIndex(opt => opt.count === currentCartonCount);
      if (currentIndex !== -1 && currentIndex < cartonOptions.length - 1) {
        const nextOption = cartonOptions[currentIndex + 1];
        setQuantity(nextOption.value);
      }
    }
  };

  const handleDecrease = () => {
    if (isSubmitting) return;
    if (quantity === "Custom Quantity") return; // no decrease from custom

    if (isRice) {
      if (currentKgValue === null) return;
      const currentIndex = kgValues.indexOf(currentKgValue);
      if (currentIndex > 0) {
        const prevKg = kgValues[currentIndex - 1];
        setQuantity(`${prevKg} kg`);
      }
    } else {
      if (currentCartonCount === null) return;
      const currentIndex = cartonOptions.findIndex(opt => opt.count === currentCartonCount);
      if (currentIndex > 0) {
        const prevOption = cartonOptions[currentIndex - 1];
        setQuantity(prevOption.value);
      }
    }
  };

  // --- Conversion helpers ---
  const convert = (usdValue) => {
    const num = parseFloat(usdValue);
    if (isNaN(num)) return "0.00";
    return (num * displayCurrency.rate).toFixed(2);
  };

  const convertToBaseUnit = (quantityStr) => {
    if (!quantityStr) return { value: 0, unit: 'kg' };
    const match = quantityStr.match(/^(\d+\.?\d*)\s*(kg|g|ton|liter|ml|l|piece|dozen|bouquet|carton)s?$/i);
    if (match) {
      let value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      switch(unit) {
        case 'g': value = value / 1000; break;
        case 'ton': value = value * 1000; break;
        case 'ml': value = value / 1000; break;
        case 'dozen': value = value * 12; break;
        default: break;
      }
      return { value, unit: ['g','kg','ton'].includes(unit) ? 'kg' : 
                        ['ml','liter','l'].includes(unit) ? 'liter' : 'piece' };
    }
    return { value: 0, unit: 'kg' };
  };

  const getQuantityUnit = () => {
    if (isRice) return 'kg';
    const industryKey = industry?.toLowerCase() || 'default';
    if (industryKey === 'oil' || industryKey === 'beverages' || industryKey === 'perfumes') return 'liters';
    else if (industryKey === 'flowers' || industryKey === 'clothes' || industryKey === 'electronics') return 'pieces';
    else return 'kg';
  };

  const getBasePrice = () => {
    if (!displayProduct) return 0;
    if (displayProduct.price_usd_per_carton !== undefined) return displayProduct.price_usd_per_carton;
    if (displayProduct.fob_price_usd !== undefined) return displayProduct.fob_price_usd;
    if (displayProduct["Ex-Mill_usd"] !== undefined) return displayProduct["Ex-Mill_usd"];
    if (displayProduct.price && typeof displayProduct.price === 'object') {
      if (displayProduct.price.min !== undefined && displayProduct.price.max !== undefined) {
        return (displayProduct.price.min + displayProduct.price.max) / 2;
      }
    }
    if (typeof displayProduct.price === 'number') return displayProduct.price;
    return 0;
  };

  // --- Calculate estimated bill (USD) ---
  const calculateEstimatedBillUSD = () => {
    let basePrice = getBasePrice();
    let quantityInBaseUnit = 0;
    let quantityPrice = 0;
    let transportCostNum = 0;
    let shippingCostNum = 0;
    let insuranceCostNum = 0;
    let freightCostNum = 0;

    if (grade) {
      const selectedGrade = grades.find((g) => g.value === grade);
      if (selectedGrade && selectedGrade.price) basePrice = parseFloat(selectedGrade.price);
    }

    const finalQuantityToUse = quantity === "Custom Quantity" ? customQuantity : quantity;
    const { value: quantityValue } = convertToBaseUnit(finalQuantityToUse);
    quantityInBaseUnit = quantityValue;

    if (basePrice > 0 && quantityInBaseUnit > 0) quantityPrice = basePrice * quantityInBaseUnit;

    if (transportType) {
      const costPerUnit = TRANSPORT_COSTS[transportType];
      transportCostNum = costPerUnit * quantityInBaseUnit;
    }

    if (cifRequired === "Yes") {
      // Add shipping, insurance, freight costs (using the same rates as in your original code)
      shippingCostNum = 2.00 * quantityInBaseUnit;  // example rate, adjust as needed
      insuranceCostNum = 0.50 * quantityInBaseUnit;
      freightCostNum = 1.00 * quantityInBaseUnit;
    }

    const total = (quantityPrice || 0) + (packingPrice || 0) + (portPrice || 0) + 
                  transportCostNum + shippingCostNum + insuranceCostNum + freightCostNum;

    return {
      basePrice,
      quantity: quantityInBaseUnit,
      quantityPrice,
      packingCost: packingPrice,
      portPrice,
      transportCost: transportCostNum,
      shippingCost: shippingCostNum,
      insuranceCost: insuranceCostNum,
      freightCost: freightCostNum,
      total,
      quantityDisplay: quantity === "Custom Quantity" ? customQuantity : quantity,
      transportModeLabel: transportType ? transportOptions.find(opt => opt.value === transportType)?.label : "",
      transportCostPerUnit: transportType ? TRANSPORT_COSTS[transportType] : 0
    };
  };

  const estimatedBillUSD = calculateEstimatedBillUSD();

  const convertedBill = {
    basePrice: convert(estimatedBillUSD.basePrice),
    quantityPrice: convert(estimatedBillUSD.quantityPrice),
    packingCost: convert(estimatedBillUSD.packingCost),
    portPrice: convert(estimatedBillUSD.portPrice),
    transportCost: convert(estimatedBillUSD.transportCost),
    shippingCost: convert(estimatedBillUSD.shippingCost),
    insuranceCost: convert(estimatedBillUSD.insuranceCost),
    freightCost: convert(estimatedBillUSD.freightCost),
    total: convert(estimatedBillUSD.total),
  };

  const extractUnits = (quantityStr) => {
    if (!quantityStr) return 0;
    const match = quantityStr.match(/\((\d+)\s*units\)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // --- Format quantity display for total line ---
  const formatQuantityDisplay = () => {
    if (!estimatedBillUSD.quantityDisplay) return isRice ? "1 kg" : `1 Carton (${unitsPerCarton} units)`;
    return estimatedBillUSD.quantityDisplay;
  };

  const quantityDisplayForTotal = formatQuantityDisplay();

  // --- Compute price range for rice ---
  const priceRange = useMemo(() => {
    if (!isRice || grades.length === 0) return null;
    const prices = grades.map(g => parseFloat(g.price)).filter(p => !isNaN(p));
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max };
  }, [grades, isRice]);

  // --- Save to Firebase ---
  const saveQuoteToFirebase = async (quoteData) => {
    try {
      const quotesRef = ref(quoteDatabase, 'quotes');
      const newQuoteRef = push(quotesRef);
      const quoteDataWithId = {
        ...quoteData,
        id: newQuoteRef.key,
        createdAt: new Date().toISOString(),
        status: 'new',
        storedIn: 'firebasegetquote-database'
      };
      await set(newQuoteRef, quoteDataWithId);
      return newQuoteRef.key;
    } catch (error) {
      console.error('Error saving quote:', error);
      throw error;
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    let finalQuantity = "";
    if (quantity === "Custom Quantity") {
      if (!customQuantity.trim()) {
        alert("Please enter your custom quantity.");
        return;
      }
      finalQuantity = customQuantity;
    } else if (!quantity) {
      alert("Please select a quantity.");
      return;
    } else {
      finalQuantity = quantity;
    }

    if (!packing || !port || !fullName || !destinationCountry || !destinationPort) {
      alert("Please fill all required fields (Packing, Port of Loading, Full Name, Destination Country, Destination Port).");
      return;
    }

    if (!transportType) {
      alert("Please select a transport type.");
      return;
    }

    if (!cifRequired) {
      alert("Please select CIF Required (Yes/No).");
      return;
    }

    // Validate transport fields
    if (transportType === 'road') {
      if (!pickupLocation.city || !pickupLocation.state || !pickupLocation.country ||
          !deliveryLocation.city || !deliveryLocation.state || !deliveryLocation.country) {
        alert("Please fill all pickup and delivery location fields for road transport.");
        return;
      }
    } else if (transportType === 'air') {
      if (!airportOfLoading.country || !airportOfLoading.airportName ||
          !airportOfDestination.country || !airportOfDestination.airportName) {
        alert("Please fill all airport loading and destination fields for air freight.");
        return;
      }
    } else if (transportType === 'ocean') {
      if (!portOfLoading.country || !portOfLoading.state || !portOfLoading.portName ||
          !portOfDestination.country || !portOfDestination.state || !portOfDestination.portName) {
        alert("Please fill all port loading and destination fields for ocean freight.");
        return;
      }
    }

    const isPhoneValid = validatePhoneNumber(phoneNumber, countryCode);
    const isEmailValid = validateEmail(email);
    if (!isPhoneValid || !isEmailValid) {
      if (!isPhoneValid) alert("Please enter a valid phone number.");
      if (!isEmailValid) alert("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    const fullPhoneNumber = `${countryCode} ${phoneNumber}`;
    const selectedGradeData = grades.find(g => g.value === grade);
    const gradePrice = selectedGradeData?.price || '';

    // Build transport details object
    let transportDetails = {};
    if (transportType === 'road') {
      transportDetails = {
        transportType: 'road',
        pickupLocation,
        deliveryLocation,
        vehicleType: vehicleType || ""
      };
    } else if (transportType === 'air') {
      transportDetails = {
        transportType: 'air',
        airportOfLoading,
        airportOfDestination
      };
    } else if (transportType === 'ocean') {
      transportDetails = {
        transportType: 'ocean',
        portOfLoading,
        portOfDestination
      };
    }

    const quoteData = {
      contactInfo: {
        fullName,
        email,
        phone: fullPhoneNumber,
        countryCode,
        country: userCountry,
        state: userState,
        city: userCity,
        pincode: userPincode,
        address: {
          country: userCountry,
          state: userState,
          city: userCity,
          pincode: userPincode
        }
      },
      productInfo: {
        productId: displayProduct?.id || "",
        industry: industry,
        category: displayProduct?.brand || displayProduct?.category || "",
        productName: displayProduct?.name || "",
        variety: displayProduct?.variety || "",
        grade: grade || "Standard",
        gradePrice: gradePrice,
        packing,
        packingPrice: packingPrice.toFixed(2),
        quantity: finalQuantity,
        port,
        transport: {
          ...transportDetails,
          cost: estimatedBillUSD.transportCost.toFixed(2)
        },
        cifRequired: cifRequired,
        additionalInfo,
        destinationCountry,
        destinationPort,
        displayCurrency: displayCurrency.code
      },
      estimatedBill: {
        basePrice: estimatedBillUSD.basePrice.toFixed(2),
        quantity: finalQuantity,
        quantityPrice: estimatedBillUSD.quantityPrice.toFixed(2),
        packingCost: estimatedBillUSD.packingCost.toFixed(2),
        portPrice: estimatedBillUSD.portPrice.toFixed(2),
        transportCost: estimatedBillUSD.transportCost.toFixed(2),
        shippingCost: estimatedBillUSD.shippingCost.toFixed(2),
        insuranceCost: estimatedBillUSD.insuranceCost.toFixed(2),
        freightCost: estimatedBillUSD.freightCost.toFixed(2),
        total: estimatedBillUSD.total.toFixed(2),
        destinationCountry,
        destinationPort
      },
      timestamp: new Date().toISOString(),
      source: 'website',
      database: 'firebasegetquote',
      userId: profile?.uid || "guest",
      userEmail: profile?.email || email,
      readableDate: new Date().toLocaleString(),
      status: "new",
      hasAutoFilled
    };

    try {
      const quoteId = await saveQuoteToFirebase(quoteData);
      let transportMessage = "";
      if (transportType === 'road') {
        transportMessage = `- Transport: Road
- Pickup: ${pickupLocation.city}, ${pickupLocation.state}, ${pickupLocation.country}
- Delivery: ${deliveryLocation.city}, ${deliveryLocation.state}, ${deliveryLocation.country}
${vehicleType ? `- Vehicle: ${vehicleType}` : ''}`;
      } else if (transportType === 'air') {
        transportMessage = `- Transport: Air Freight
- Airport of Loading: ${airportOfLoading.airportName}, ${airportOfLoading.country}
- Airport of Destination: ${airportOfDestination.airportName}, ${airportOfDestination.country}`;
      } else if (transportType === 'ocean') {
        transportMessage = `- Transport: Ocean Freight
- Port of Loading: ${portOfLoading.portName}, ${portOfLoading.state}, ${portOfLoading.country}
- Port of Destination: ${portOfDestination.portName}, ${portOfDestination.state}, ${portOfDestination.country}`;
      }

      const cifMessage = cifRequired === "Yes" 
        ? `- CIF Required: Yes
- Shipping Cost: $${estimatedBillUSD.shippingCost.toFixed(2)}
- Insurance Cost: $${estimatedBillUSD.insuranceCost.toFixed(2)}
- Freight Cost: $${estimatedBillUSD.freightCost.toFixed(2)}`
        : "- CIF Required: No";

      const message = `Hello! I want a quote for:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Address: ${userCity}, ${userState}, ${userCountry} - ${userPincode}
- Industry: ${industry}
- Product: ${displayProduct?.name || ""}
- Grade: ${grade}${gradePrice ? ` (Price: $${gradePrice})` : ''}
- Packing: ${packing} ($${packingPrice.toFixed(2)})
- Quantity: ${finalQuantity}
- Port of Loading: ${port}
- Destination Country: ${destinationCountry}
- Destination Port: ${destinationPort}
${transportMessage}
- Transport Cost: $${estimatedBillUSD.transportCost.toFixed(2)}
${cifMessage}
- Packing Cost: $${estimatedBillUSD.packingCost.toFixed(2)}
- Estimated Total: $${estimatedBillUSD.total.toFixed(2)}
- Quote ID: ${quoteId}
- Database: firebasegetquote
${additionalInfo ? `\n- Additional Info: ${additionalInfo}` : ""}
Thank you!`;
      window.open(`https://wa.me/+919703744571?text=${encodeURIComponent(message)}`, "_blank");
      setShowThankYou(true);
    } catch (error) {
      const fallbackMessage = `Hello! I want a quote for:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Address: ${userCity}, ${userState}, ${userCountry} - ${userPincode}
- Industry: ${industry}
- Product: ${displayProduct?.name || ""}
- Grade: ${grade}${gradePrice ? ` (Price: $${gradePrice})` : ''}
- Packing: ${packing} ($${packingPrice.toFixed(2)})
- Quantity: ${finalQuantity}
- Port of Loading: ${port}
- Destination Country: ${destinationCountry}
- Destination Port: ${destinationPort}
${transportMessage}
- Transport Cost: $${estimatedBillUSD.transportCost.toFixed(2)}
${cifMessage}
- Packing Cost: $${estimatedBillUSD.packingCost.toFixed(2)}
- Estimated Total: $${estimatedBillUSD.total.toFixed(2)}
- Database: firebasegetquote (save failed)
${additionalInfo ? `\n- Additional Info: ${additionalInfo}` : ""}
Thank you!`;
      window.open(`https://wa.me/+919703744571?text=${encodeURIComponent(fallbackMessage)}`, "_blank");
      setShowThankYou(true);
      alert("Quote submitted to WhatsApp! There was an issue saving to firebasegetquote database, but your request has been sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Close and reset ---
  const handleClose = () => {
    setPacking("");
    setQuantity("");
    setCustomQuantity("");
    setPort("");
    setGrade("");
    setCifRequired("");
    setTransportType("");
    setPickupLocation({ city: "", state: "", country: "" });
    setDeliveryLocation({ city: "", state: "", country: "" });
    setVehicleType("");
    setAirportOfLoading({ country: "", airportName: "" });
    setAirportOfDestination({ country: "", airportName: "" });
    setPortOfLoading({ country: "", state: "", portName: "" });
    setPortOfDestination({ country: "", state: "", portName: "" });
    setAdditionalInfo("");
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setCountryCode("+91");
    setPhoneError("");
    setEmailError("");
    setShowThankYou(false);
    setIsSubmitting(false);
    setPortPrice(0.00);
    setPackingPrice(0.00);
    setUserCountry("");
    setUserState("");
    setUserCity("");
    setUserPincode("");
    setDestinationCountry("");
    setDestinationPort("");
    setHasAutoFilled(false);
    setFetchedImage(null);
    setImageError("");
    setDisplayCurrency(currencyOptions[0]);
    setRecoveredId(null);
    onClose();
  };

  const getCurrentCountry = () => countryOptions.find((opt) => opt.value === countryCode);

  if (!isOpen) return null;

  if (isLoadingProduct) {
    return (
      <div className="buy-modal-overlay">
        <div className="buy-modal-container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <div className="loading-spinner">Loading product...</div>
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="buy-modal-overlay">
        <div className="buy-modal-container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <div className="error-message" style={{ color: 'red', marginBottom: '20px' }}>{productError}</div>
          <button onClick={handleClose} className="cancel-btn">Close</button>
        </div>
      </div>
    );
  }

  if (!displayProduct) return null;

  const quantityUnit = getQuantityUnit();
  const orderUnits = isRice 
    ? estimatedBillUSD.quantity 
    : (estimatedBillUSD.quantityDisplay && estimatedBillUSD.quantityDisplay.includes('Carton') 
        ? extractUnits(estimatedBillUSD.quantityDisplay) 
        : estimatedBillUSD.quantity);

  const productImageSrc = fetchedImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='10' y='55' fill='%23aaa' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

  const heritageDisplay = grade || industry || "Premium";
  const originDisplay = displayProduct?.origin || "India";

  let brandPart1 = displayProduct?.brand || displayProduct?.companyId ? (displayProduct.companyId === 'siea' ? "Sai Import Export Agro" : "Heritage / NUT WALKER") : "Heritage / NUT WALKER";
  let brandPart2 = null;

  if (displayProduct?.brand?.includes('/')) {
    const parts = displayProduct.brand.split('/').map(s => s.trim());
    brandPart1 = parts[0];
    brandPart2 = parts[1];
  } else if (displayProduct?.subBrand) {
    brandPart1 = displayProduct.brand;
    brandPart2 = displayProduct.subBrand;
  } else {
    if (isRice && displayProduct.companyId === 'siea') {
      brandPart1 = "Sai Import Export Agro";
    }
  }

  // Determine display text for the quantity buttons (for rice)
  const quantityDisplayText = isRice && currentKgValue ? `${currentKgValue} kg` : (quantity !== "Custom Quantity" ? quantity : "Custom");

  return (
    <>
      <div className="buy-modal-overlay">
        <div className="buy-modal-container" ref={modalRef}>
          <button className="buy-modal-close-btn" onClick={handleClose} disabled={isSubmitting}>&times;</button>
          
          <div className="buy-modal-header">
            <h2 className="buy-modal-title">Get Quote - {industry || displayProduct?.category || "Product"}</h2>
            <p className="buy-modal-subtitle">Fill out the form below and we'll get back to you shortly</p>
          </div>
          
          <div className="buy-modal-body">
            <div className="modal-layout">
              <div className="form-section-container" ref={formContainerRef}>
                <div className="currency-selector" style={{ padding: '20px 25px 0' }}>
                  <label htmlFor="currencySelect" className="currency-label">Display Currency:</label>
                  <select id="currencySelect" value={displayCurrency.code} onChange={handleCurrencyChange} className="currency-select" disabled={isSubmitting}>
                    {currencyOptions.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                </div>

                <section className="form-section product-summary">
                  <h3 className="section-title">Product Details</h3>
                  <div className="product-summary-content">
                    <div className="product-image-wrapper">
                      <img src={productImageSrc} alt={displayProduct?.name || "Product"} className="product-summary-image" onError={(e) => {
                        setImageError(`Failed to load image: ${e.target.src}`);
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='10' y='55' fill='%23aaa' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }} />
                      {/* Quantity buttons (shown for both rice and non‑rice) */}
                      <div className="quantity-button-group">
                        <button
                          className="qty-btn"
                          onClick={handleDecrease}
                          disabled={isSubmitting || quantity === "Custom Quantity" || (isRice && currentKgValue === kgValues[0]) || (!isRice && currentCartonCount === cartonOptions[0]?.count)}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="qty-display">
                          {quantity === "Custom Quantity" ? "Custom" : quantityDisplayText}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={handleIncrease}
                          disabled={isSubmitting || quantity === "Custom Quantity" || (isRice && currentKgValue === kgValues[kgValues.length-1]) || (!isRice && currentCartonCount === cartonOptions[cartonOptions.length-1]?.count)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                    </div>
                    {imageError && (
                      <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', textAlign: 'center', gridColumn: '1 / -1' }}>
                        {imageError}
                        <button onClick={() => setRetryCount(prev => prev + 1)} style={{ marginLeft: '10px', padding: '2px 8px', background: '#00F5C8', color: '#0f172a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
                      </div>
                    )}
                    <div className="summary-grid">
                      <div className="summary-item heritage">{heritageDisplay}</div>
                      <div className="summary-item product-name"><strong>{displayProduct?.name || "Butter Toffee Macadamias"}</strong></div>
                      <div className="summary-item brand-part">{brandPart1}</div>
                      {brandPart2 && <div className="summary-item brand-part">{brandPart2}</div>}
                      <div className="price-total-row">
                        {isRice && priceRange ? (
                          <span className="price-label">{displayCurrency.symbol}{convert(priceRange.min)} - {displayCurrency.symbol}{convert(priceRange.max)} / {quantityUnit} each</span>
                        ) : (
                          <span className="price-label">{displayCurrency.symbol}{convertedBill.basePrice} EX-MILL / {isRice ? quantityUnit : 'carton'} each</span>
                        )}
                        <span className="total-label">Total (1 x {quantityDisplayForTotal}): {displayCurrency.symbol}{convertedBill.quantityPrice}</span>
                      </div>
                      {grades.length > 0 && (
                        <div className="summary-item grade">
                          <strong>Grade:</strong> 
                          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="grade-select" disabled={isSubmitting} style={{ marginLeft: '10px', background: 'rgba(30,41,59,0.8)', color: '#f1f5f9', border: '1px solid rgba(0,245,200,0.3)', borderRadius: '4px', padding: '4px', flex: 1 }}>
                            <option value="">Select Grade</option>
                            {grades.map((gradeOption, i) => (
                              <option key={i} value={gradeOption.value}>{gradeOption.value} ({displayCurrency.symbol}{convert(gradeOption.price)}/{quantityUnit})</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="summary-item packing">
                        <strong>Packing:</strong> 
                        <select value={packing} onChange={handlePackingChange} className="packing-select" disabled={isSubmitting} style={{ marginLeft: '10px', background: 'rgba(30,41,59,0.8)', color: '#f1f5f9', border: '1px solid rgba(0,245,200,0.3)', borderRadius: '4px', padding: '4px', flex: 1 }}>
                          <option value="">Select Packing</option>
                          {packingOptions.map((option, index) => {
                            const displayPrice = isRice ? `₹${option.price}` : `${displayCurrency.symbol}${convert(option.price)}`;
                            return (
                              <option key={index} value={option.value}>
                                {option.value} ({displayPrice})
                              </option>
                            );
                          })}
                        </select>
                        {packing && (
                          <span style={{ marginLeft: '8px', color: '#10b981' }}>
                            ({isRice ? `₹${packingPrice}` : `${displayCurrency.symbol}${convert(packingPrice)}`})
                          </span>
                        )}
                      </div>
                      <div className="summary-item quantity">
                        <strong>Quantity:</strong> 
                        <select value={quantity} onChange={handleQuantityChange} className="quantity-select" disabled={isSubmitting} style={{ marginLeft: '10px', background: 'rgba(30,41,59,0.8)', color: '#f1f5f9', border: '1px solid rgba(0,245,200,0.3)', borderRadius: '4px', padding: '4px', flex: 1 }}>
                          <option value="">Select Quantity</option>
                          {quantityOptions.map((option, index) => (
                            <option key={index} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="summary-details-row">
                        <span className="detail-item"><strong>Origin:</strong> {originDisplay}</span>
                        <span className="detail-item"><strong>Selected Qty:</strong> {quantityDisplayForTotal}</span>
                        <span className="detail-item"><strong>Order Qty:</strong> {orderUnits} {isRice ? quantityUnit : 'units'}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <section className="form-section">
                    <h3 className="section-title">Contact Information</h3>
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="required-star">*</span></label>
                      <input type="text" placeholder="Enter your full name" value={fullName} onChange={handleFullNameChange} required className="form-input" disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address <span className="required-star">*</span></label>
                      <input type="email" placeholder="your.email@example.com" value={email} onChange={handleEmailChange} required className="form-input" disabled={isSubmitting} />
                      {emailError && <div className="error-message">{emailError}</div>}
                    </div>
                    <div className="form-row grid-2">
                      <div className="form-group">
                        <label className="form-label">Country <span className="required-star">*</span></label>
                        <input type="text" value={userCountry} onChange={handleUserCountryChange} placeholder="Enter your country" className="form-input" disabled={isSubmitting} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State/Province <span className="required-star">*</span></label>
                        <input type="text" value={userState} onChange={handleUserStateChange} placeholder="Enter your state/province" className="form-input" disabled={isSubmitting} required />
                      </div>
                    </div>
                    <div className="form-row grid-2">
                      <div className="form-group">
                        <label className="form-label">City/Town <span className="required-star">*</span></label>
                        <input type="text" value={userCity} onChange={handleUserCityChange} placeholder="Enter your city/town" className="form-input" disabled={isSubmitting} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pincode/ZIP <span className="required-star">*</span></label>
                        <input type="text" value={userPincode} onChange={handleUserPincodeChange} placeholder="Enter your pincode/ZIP" className="form-input" disabled={isSubmitting} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number <span className="required-star">*</span></label>
                      <div className="phone-input-group">
                        <select ref={countrySelectRef} value={countryCode} onChange={handlePhoneCountryChange} className="country-code-select" disabled={isSubmitting}>
                          {countryOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.flag} {option.value}</option>
                          ))}
                        </select>
                        <input type="tel" placeholder={`Phone number (${getCurrentCountry()?.length || 10} digits)`} value={phoneNumber} onChange={handlePhoneChange} maxLength={getCurrentCountry()?.length || 10} required className="form-input phone-input" disabled={isSubmitting} />
                      </div>
                      {phoneError && <div className="error-message">{phoneError}</div>}
                    </div>
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Destination & Shipping Details</h3>
                    <div className="form-group">
                      <label className="form-label">Destination Country <span className="required-star">*</span></label>
                      <input type="text" placeholder="Enter destination country" value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} required className="form-input" disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Destination Port <span className="required-star">*</span></label>
                      <input type="text" placeholder="Enter destination port" value={destinationPort} onChange={(e) => setDestinationPort(e.target.value)} required className="form-input" disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Port of Loading <span className="required-star">*</span></label>
                      <input type="text" placeholder="Enter port of loading" value={port} onChange={(e) => setPort(e.target.value)} required className="form-input" disabled={isSubmitting} />
                    </div>
                    
                    {/* Transport Details Section */}
                    <div className="form-group">
                      <label className="form-label">Transport Details</label>
                      <label className="form-label" style={{ marginTop: '8px', fontSize: '0.85rem' }}>Select Transport Type *</label>
                      <select
                        value={transportType}
                        onChange={handleTransportTypeChange}
                        className="form-select"
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Select Transport Type</option>
                        {transportOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="field-info" style={{ marginTop: '5px' }}>
                        <small>Transport cost: ${TRANSPORT_COSTS[transportType] || '0'} per {isRice ? 'kg' : 'carton'}</small>
                      </div>
                    </div>

                    {transportType === 'road' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Pickup Location *</label>
                          <div className="transport-location-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="City"
                              value={pickupLocation.city}
                              onChange={(e) => handlePickupLocationChange('city', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={pickupLocation.state}
                              onChange={(e) => handlePickupLocationChange('state', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={pickupLocation.country}
                              onChange={(e) => handlePickupLocationChange('country', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Delivery Location *</label>
                          <div className="transport-location-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="City"
                              value={deliveryLocation.city}
                              onChange={(e) => handleDeliveryLocationChange('city', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={deliveryLocation.state}
                              onChange={(e) => handleDeliveryLocationChange('state', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={deliveryLocation.country}
                              onChange={(e) => handleDeliveryLocationChange('country', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Vehicle Type (Optional)</label>
                          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="form-select">
                            <option value="">Select Vehicle Type</option>
                            {vehicleOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {transportType === 'air' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Airport of Loading *</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                              type="text"
                              placeholder="Country"
                              value={airportOfLoading.country}
                              onChange={(e) => handleAirportLoadingChange('country', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Airport Name"
                              value={airportOfLoading.airportName}
                              onChange={(e) => handleAirportLoadingChange('airportName', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Airport of Destination *</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                              type="text"
                              placeholder="Country"
                              value={airportOfDestination.country}
                              onChange={(e) => handleAirportDestinationChange('country', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Airport Name"
                              value={airportOfDestination.airportName}
                              onChange={(e) => handleAirportDestinationChange('airportName', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {transportType === 'ocean' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Port of Loading *</label>
                          <div className="port-fields" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="Country"
                              value={portOfLoading.country}
                              onChange={(e) => handlePortOfLoadingChange('country', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={portOfLoading.state}
                              onChange={(e) => handlePortOfLoadingChange('state', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Port Name"
                              value={portOfLoading.portName}
                              onChange={(e) => handlePortOfLoadingChange('portName', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Port of Destination *</label>
                          <div className="port-fields" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="Country"
                              value={portOfDestination.country}
                              onChange={(e) => handlePortOfDestinationChange('country', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={portOfDestination.state}
                              onChange={(e) => handlePortOfDestinationChange('state', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Port Name"
                              value={portOfDestination.portName}
                              onChange={(e) => handlePortOfDestinationChange('portName', e.target.value)}
                              className="form-input"
                              style={{ flex: 1 }}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Order Requirements / CIF Section (Dropdown) */}
                    <div className="form-group">
                      <label className="form-label">CIF Required? <span className="required-star">*</span></label>
                      <select value={cifRequired} onChange={(e) => setCifRequired(e.target.value)} required className="form-select" disabled={isSubmitting}>
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="field-info">
                        <small>CIF (Cost, Insurance, and Freight) includes shipping and insurance costs to your destination</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Additional Information</label>
                      <textarea placeholder="Any additional details or requirements" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className="form-textarea" rows="4" disabled={isSubmitting} />
                    </div>
                  </section>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? <span className="btn-loading"><span className="btn-spinner"></span> Submitting...</span> : "Get Quote"}
                    </button>
                    <button type="button" onClick={handleClose} className="cancel-btn" disabled={isSubmitting}>Cancel</button>
                  </div>
                </form>
              </div>
              
              <div className="estimate-section-container" ref={estimateContainerRef}>
                <div className="price-breakdown-section">
                  <h4 className="price-breakdown-title">Estimated Bill Breakdown ({displayCurrency.code})</h4>
                  <div className="estimate-note"><small>This is an estimated bill. Final pricing may vary based on actual costs and market conditions.</small></div>
                  <div className="price-breakdown-grid">
                    <div className="price-item"><span className="price-label">Grade Price:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.basePrice} per {quantityUnit}</span></div>
                    <div className="price-item"><span className="price-label">Packing Price:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.packingCost}</span></div>
                    <div className="price-item"><span className="price-label">Quantity Price:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.quantityPrice}</span></div>
                    {transportType && (
                      <>
                        <div className="price-item"><span className="price-label">Transport Price:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.transportCost}</span></div>
                        <div className="price-item transport-costs"><span className="price-label">Transport Mode:</span><span className="price-value">{estimatedBillUSD.transportModeLabel}</span></div>
                      </>
                    )}
                    {cifRequired === "Yes" && (
                      <>
                        <div className="price-item"><span className="price-label">Shipping Cost:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.shippingCost}</span></div>
                        <div className="price-item"><span className="price-label">Insurance Cost:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.insuranceCost}</span></div>
                        <div className="price-item"><span className="price-label">Freight Cost:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.freightCost}</span></div>
                      </>
                    )}
                    <div className="price-item final-total"><span className="price-label">Total Price:</span><span className="price-value">{displayCurrency.symbol}{convertedBill.total}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ThankYouPopup isOpen={showThankYou} onClose={() => { setShowThankYou(false); onClose(); }} />

      <style jsx>{`
        /* all the CSS from the previous version (unchanged) */
        .buy-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 10px;
          backdrop-filter: blur(8px);
        }

        .buy-modal-container {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(0, 245, 200, 0.2);
          border-radius: 16px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 1200px;
          max-height: 95vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .buy-modal-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(0, 245, 200, 0.4);
          border-radius: 50%;
          width: 35px;
          height: 35px;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.3s ease;
          color: #f1f5f9;
          backdrop-filter: blur(8px);
        }

        .buy-modal-close-btn:hover {
          background: #00F5C8;
          color: #0f172a;
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 0 15px rgba(0, 245, 200, 0.4);
        }

        .buy-modal-close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .buy-modal-header {
          padding: 25px 25px 15px;
          border-bottom: 1px solid rgba(0, 245, 200, 0.2);
          background: rgba(15, 23, 42, 0.8);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .buy-modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00F5C8, #4fd1c5, #00F5C8);
        }

        .buy-modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #00F5C8;
          text-shadow: 0 2px 10px rgba(0, 245, 200, 0.3);
        }

        .buy-modal-subtitle {
          margin: 8px 0 0;
          opacity: 0.8;
          font-size: 0.9rem;
          color: #f1f5f9;
          line-height: 1.4;
        }

        .buy-modal-body {
          flex: 1;
          overflow: hidden;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .modal-layout {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          flex-direction: row;
        }

        .form-section-container {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          border-right: 1px solid rgba(0, 245, 200, 0.2);
          display: flex;
          flex-direction: column;
        }

        .estimate-section-container {
          flex: 0 0 350px;
          background: rgba(15, 23, 42, 0.6);
          border-left: 1px solid rgba(0, 245, 200, 0.2);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .form-section {
          padding: 20px 25px;
          border-bottom: 1px solid rgba(0, 245, 200, 0.2);
          flex-shrink: 0;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .product-summary {
          background: rgba(0, 245, 200, 0.05);
          border-left: 4px solid #00F5C8;
        }

        .currency-selector {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .currency-label {
          color: #f1f5f9;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .currency-select {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(0, 245, 200, 0.3);
          border-radius: 6px;
          padding: 8px 12px;
          color: #f1f5f9;
          font-size: 0.9rem;
          cursor: pointer;
          outline: none;
        }

        .currency-select option {
          background: #1e293b;
        }

        .product-summary-content {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .product-image-wrapper {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .product-summary-image {
          width: 100px;
          height: 100px;
          object-fit: contain;
          object-position: center;
          display: block;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0, 245, 200, 0.3);
          background: #1e293b;
        }

        .quantity-button-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .qty-btn {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(0, 245, 200, 0.3);
          border-radius: 4px;
          width: 32px;
          height: 32px;
          font-size: 1.2rem;
          font-weight: bold;
          color: #00F5C8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: #00F5C8;
          color: #0f172a;
          border-color: #00F5C8;
        }

        .qty-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .qty-display {
          font-size: 0.8rem;
          color: #f1f5f9;
          min-width: 60px;
          text-align: center;
        }

        .image-loading {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .summary-grid {
          flex: 1;
          min-width: 250px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.9rem;
        }

        .summary-item {
          color: #f1f5f9;
        }
        .summary-item.heritage {
          font-size: 1.1rem;
          font-weight: bold;
          color: #00F5C8;
        }
        .summary-item.product-name {
          font-size: 1.2rem;
          font-weight: bold;
        }
        .summary-item.brand-part {
          font-size: 1rem;
          color: #f1f5f9;
        }
        .price-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .price-label {
          color: #10b981;
          font-weight: 600;
        }
        .total-label {
          color: #10b981;
          font-weight: 600;
        }
        .summary-item.grade,
        .summary-item.packing,
        .summary-item.quantity {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .summary-details-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(0, 245, 200, 0.2);
          color: #94a3b8;
        }
        .detail-item {
          font-size: 0.9rem;
        }
        .detail-item strong {
          color: #00F5C8;
          font-weight: 600;
        }

        .section-title {
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #00F5C8;
          display: flex;
          align-items: center;
          position: relative;
        }

        .section-title::before {
          content: "";
          width: 4px;
          height: 18px;
          background: linear-gradient(135deg, #00F5C8, #4fd1c5);
          margin-right: 10px;
          border-radius: 2px;
        }

        .sub-section-title {
          margin: 10px 0 15px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #4fd1c5;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #f1f5f9;
          font-size: 0.9rem;
        }

        .required-star {
          color: #fc8181;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 14px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(0, 245, 200, 0.3);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          color: #f1f5f9;
          backdrop-filter: blur(10px);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: rgba(241, 245, 249, 0.5);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #00F5C8;
          background: rgba(30, 41, 59, 1);
          box-shadow: 0 0 0 3px rgba(0, 245, 200, 0.2);
          transform: translateY(-1px);
        }

        .form-input:read-only,
        .form-input:disabled {
          background-color: rgba(30, 41, 59, 0.5);
          color: rgba(241, 245, 249, 0.6);
          cursor: not-allowed;
          border-color: rgba(0, 245, 200, 0.2);
        }

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2300F5C8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 14px;
          padding-right: 40px;
          cursor: pointer;
        }

        .form-select option {
          background: #1e293b;
          color: #f1f5f9;
          padding: 10px 14px;
          border: none;
          font-size: 0.95rem;
        }

        .form-select:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
          line-height: 1.5;
        }

        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 0;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .phone-input-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .country-code-select {
          flex: 0 0 auto;
          width: 120px;
          padding: 12px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(0, 245, 200, 0.3);
          border-radius: 8px;
          color: #f1f5f9;
          font-size: 0.95rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2300F5C8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 14px;
          padding-right: 30px;
          cursor: pointer;
        }

        .country-code-select option {
          background: #1e293b;
          color: #f1f5f9;
        }

        .phone-input {
          flex: 1;
        }

        .error-message {
          color: #fc8181;
          font-size: 0.8rem;
          margin-top: 5px;
        }

        .field-info {
          margin-top: 5px;
          color: rgba(241, 245, 249, 0.6);
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .custom-quantity-input {
          margin-top: 10px;
        }

        .price-breakdown-section {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .price-breakdown-title {
          margin: 0 0 12px 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #00F5C8;
          text-align: center;
          line-height: 1.3;
        }

        .estimate-note {
          text-align: center;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(0, 245, 200, 0.1);
          border-radius: 6px;
          border-left: 3px solid #00F5C8;
        }

        .estimate-note small {
          color: #94a3b8;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .price-breakdown-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          min-height: 0;
        }

        .price-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 245, 200, 0.2);
          flex-shrink: 0;
        }

        .price-item:last-child {
          border-bottom: none;
        }

        .price-item.transport-costs {
          color: #10b981;
          border-left: 3px solid #10b981;
          padding-left: 8px;
          background: rgba(16, 185, 129, 0.05);
          margin: 3px -8px;
          padding: 8px;
        }

        .price-item.final-total {
          border-top: 2px solid #00F5C8;
          border-bottom: none;
          padding-top: 12px;
          margin-top: 8px;
          font-weight: 700;
          background: rgba(0, 245, 200, 0.1);
          margin: 12px -8px -8px -8px;
          padding: 12px 8px;
          border-radius: 6px;
        }

        .price-label {
          color: #94a3b8;
          font-size: 0.9rem;
          flex: 1;
          padding-right: 10px;
        }

        .price-value {
          color: #10b981;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: right;
          white-space: nowrap;
        }

        .price-item.final-total .price-value {
          color: #00F5C8;
          font-size: 1.1rem;
        }

        .form-actions {
          padding: 20px 25px;
          background: rgba(15, 23, 42, 0.8);
          border-top: 1px solid rgba(0, 245, 200, 0.2);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          align-items: center;
          flex-shrink: 0;
        }

        .submit-btn {
          background: linear-gradient(135deg, #00F5C8, #4fd1c5);
          color: #0f172a;
          border: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 245, 200, 0.3);
          flex: 1;
          max-width: 120px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 245, 200, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-loading {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top: 2px solid #0f172a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .cancel-btn {
          background: rgba(30, 41, 59, 0.5);
          color: #f1f5f9;
          border: 1px solid rgba(0, 245, 200, 0.3);
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          flex: 1;
          max-width: 120px;
        }

        .cancel-btn:hover:not(:disabled) {
          background: rgba(30, 41, 59, 0.8);
          border-color: #00F5C8;
        }

        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-section-container::-webkit-scrollbar,
        .estimate-section-container::-webkit-scrollbar {
          width: 5px;
        }

        .form-section-container::-webkit-scrollbar-track,
        .estimate-section-container::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }

        .form-section-container::-webkit-scrollbar-thumb,
        .estimate-section-container::-webkit-scrollbar-thumb {
          background: rgba(0, 245, 200, 0.5);
          border-radius: 3px;
        }

        .form-section-container::-webkit-scrollbar-thumb:hover,
        .estimate-section-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 245, 200, 0.7);
        }

        @media (max-width: 768px) {
          .buy-modal-overlay {
            padding: 5px;
          }

          .buy-modal-container {
            max-height: 98vh;
            max-width: 100vw;
            border-radius: 12px;
          }

          .modal-layout {
            flex-direction: column;
          }

          .form-section-container {
            border-right: none;
            border-bottom: 1px solid rgba(0, 245, 200, 0.2);
            flex: 1;
            min-height: 0;
            max-height: 60vh;
          }

          .estimate-section-container {
            flex: 0 0 auto;
            border-left: none;
            border-top: 1px solid rgba(0, 245, 200, 0.2);
            max-height: 35vh;
            min-height: 250px;
          }

          .form-section {
            padding: 15px 20px;
          }

          .grid-2 {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .product-summary-content {
            flex-direction: column;
            align-items: center;
          }

          .product-image-wrapper {
            width: 100%;
            justify-content: center;
            margin-bottom: 10px;
          }

          .summary-grid {
            width: 100%;
          }

          .form-actions {
            padding: 15px 20px;
            flex-direction: column;
            gap: 10px;
          }

          .submit-btn,
          .cancel-btn {
            width: 100%;
            max-width: none;
          }

          .phone-input-group {
            flex-direction: column;
            gap: 8px;
          }

          .country-code-select {
            width: 100%;
          }

          .price-breakdown-section {
            padding: 15px;
          }

          .price-breakdown-title {
            font-size: 1.1rem;
          }

          .price-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .price-value {
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .buy-modal-header {
            padding: 20px 20px 12px;
          }

          .buy-modal-title {
            font-size: 1.3rem;
          }

          .buy-modal-subtitle {
            font-size: 0.85rem;
          }

          .form-section {
            padding: 12px 15px;
          }

          .section-title {
            font-size: 1rem;
            margin-bottom: 15px;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-input,
          .form-select,
          .form-textarea {
            padding: 10px 12px;
            font-size: 0.9rem;
          }

          .price-breakdown-section {
            padding: 12px;
          }

          .form-actions {
            padding: 12px 15px;
          }

          .submit-btn,
          .cancel-btn {
            padding: 10px 15px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 360px) {
          .buy-modal-header {
            padding: 15px 15px 10px;
          }

          .form-section {
            padding: 10px 12px;
          }

          .price-breakdown-section {
            padding: 10px;
          }

          .price-item {
            padding: 8px 0;
          }

          .price-label,
          .price-value {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};

export default BuyModal;