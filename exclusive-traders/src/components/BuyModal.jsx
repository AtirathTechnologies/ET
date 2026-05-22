// src/components/BuyModal.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { riceData } from "../data/products";
import ThankYouPopup from "../components/ThankYouPopup";
import { ref, push, set, get } from "firebase/database";
import { db as mainDatabase, quoteDatabase } from "../firebase";
import '../styles/BuyModal.css';

// Transport mode costs (USD per kg)
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

// Default packing costs for rice (INR per kg)
const DEFAULT_RICE_PACKING_COST_INR = {
  "pp bags": 2,
  "non-woven bags": 3,
  "jute bags": 5,
  "bopp bags": 2.5,
  "ldpe bags": 2,
  "hdpe bags": 2,
  "vacuum packed": 4,
  "paper bags": 3,
  "bulk packaging": 1,
  "custom packaging": 6,
  "non": 4,
  "non woven": 3,
};

const IMAGE_BASE_URL = "";

const BuyModal = ({ isOpen, onClose, product, productId, profile, industry }) => {
  // --- State for product recovery ---
  const [displayProduct, setDisplayProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productError, setProductError] = useState("");

  // --- Form state ---
  const [packing, setPacking] = useState("");
  const [quantity, setQuantity] = useState("");
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

  const [brandRequired, setBrandRequired] = useState("No");
  const brandCharge = brandRequired === "Yes" ? 35 : 0;

  const [userCountry, setUserCountry] = useState("");
  const [userState, setUserState] = useState("");
  const [userCity, setUserCity] = useState("");
  const [userPincode, setUserPincode] = useState("");
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // --- Image fetching state ---
  const [fetchedImage, setFetchedImage] = useState(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [displayCurrency, setDisplayCurrency] = useState(currencyOptions[0]);
  const [unitsPerCarton, setUnitsPerCarton] = useState(27);
  const [unitWeight, setUnitWeight] = useState(0);
  const [unitWeightUnit, setUnitWeightUnit] = useState("g");

  // --- Transport details ---
  const [transportType, setTransportType] = useState("");
  const [pickupLocation, setPickupLocation] = useState({ city: "", state: "", country: "" });
  const [deliveryLocation, setDeliveryLocation] = useState({ city: "", state: "", country: "" });
  const [vehicleType, setVehicleType] = useState("");
  const [airportOfLoading, setAirportOfLoading] = useState({ country: "", airportName: "" });
  const [airportOfDestination, setAirportOfDestination] = useState({ country: "", airportName: "" });
  const [portOfLoading, setPortOfLoading] = useState({ country: "", state: "", portName: "" });
  const [portOfDestination, setPortOfDestination] = useState({ country: "", state: "", portName: "" });

  const modalRef = useRef(null);
  const formContainerRef = useRef(null);
  const estimateContainerRef = useRef(null);
  const countrySelectRef = useRef(null);
  const defaultCurrencySet = useRef(false);

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

  // ==================== DETECT RICE CATEGORY ====================
  const isRice = useMemo(() => {
    const industryLower = industry?.toLowerCase() || '';
    const categoryIdLower = displayProduct?.categoryId?.toLowerCase() || '';
    return industryLower === 'rice' || categoryIdLower === 'rice' || industryLower.includes('rice');
  }, [industry, displayProduct]);

  // ==================== SET DEFAULT CURRENCY FOR RICE ====================
  useEffect(() => {
    if (!isOpen || !displayProduct) return;
    if (isRice && !defaultCurrencySet.current) {
      const inrOption = currencyOptions.find(opt => opt.code === "INR");
      if (inrOption) {
        setDisplayCurrency(inrOption);
        defaultCurrencySet.current = true;
      }
    }
  }, [isOpen, displayProduct, isRice]);

  // ==================== FETCH PRODUCT ====================
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isOpen) return;
      if (product && product.id) {
        setDisplayProduct(product);
        setProductError("");
        return;
      }

      let effectiveId = productId;
      if (!effectiveId) {
        const storedId = localStorage.getItem('lastViewedProductId');
        if (storedId) effectiveId = storedId;
      }
      if (!effectiveId) {
        setProductError("No product ID provided.");
        return;
      }

      setIsLoadingProduct(true);
      setProductError("");
      try {
        const productRef = ref(mainDatabase, `products/${effectiveId}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          const fetched = { id: effectiveId, ...snapshot.val() };
          setDisplayProduct(fetched);
          localStorage.setItem('lastViewedProductId', effectiveId);
        } else {
          setProductError("Product not found in database.");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProductError("Failed to load product.");
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [isOpen, product, productId]);

  // ==================== IMAGE FETCHING ====================
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
      const rootRef = ref(mainDatabase, rootPath);
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
    if (!isOpen || !displayProduct) return;
    setImageError("");

    const directCandidates = [
      displayProduct.image, displayProduct.images && displayProduct.images[0],
      displayProduct.picture, displayProduct.img, displayProduct.imageUrl,
      displayProduct.image_url, displayProduct.imageurl, displayProduct.photo,
      displayProduct.photo_url, displayProduct.thumbnail, displayProduct.img_url,
      displayProduct.img_src, displayProduct.url, displayProduct.src
    ].filter(field => field && typeof field === 'string');

    for (const candidate of directCandidates) {
      const url = buildAbsoluteUrl(candidate);
      try {
        await checkImageExists(url);
        setFetchedImage(url);
        setIsFetchingImage(false);
        return;
      } catch (err) { }
    }

    setIsFetchingImage(true);
    const possibleIdFields = [
      displayProduct.id, displayProduct.productId, displayProduct.sku, displayProduct._id,
      displayProduct.name ? displayProduct.name.replace(/\s+/g, '_').toLowerCase() : null,
      displayProduct.slug, displayProduct.key, displayProduct.code, displayProduct.reference
    ].filter(Boolean);

    for (const identifier of possibleIdFields) {
      const pathsToTry = [
        `products/${identifier}`, `productImages/${identifier}`, `images/${identifier}`,
        `productData/${identifier}`, `items/${identifier}`, `catalog/${identifier}`,
        `allProducts/${identifier}`, `productsList/${identifier}`, `productCatalog/${identifier}`,
        `store/products/${identifier}`, `inventory/products/${identifier}`,
        `products/${identifier}/image`, `products/${identifier}/images/0`,
        `productImages/${identifier}/url`, `productImages/${identifier}/src`,
        `productImages/${identifier}/image`, `productImages/${identifier}/imageUrl`,
        `productImages/${identifier}/image_url`, `productImages/${identifier}/img`,
        `images/${identifier}/url`, `images/${identifier}/src`, `images/${identifier}/image`,
        `images/${identifier}/imageUrl`, `images/${identifier}/image_url`,
        `productData/${identifier}/image`, `productData/${identifier}/images/0`,
        `items/${identifier}/image`, `catalog/${identifier}/image`,
        `products/${identifier}/media/image`, `products/${identifier}/media/0`,
        `productImages/${identifier}/media/0`, `images/${identifier}/media/0`,
        `product_images/${identifier}`, `products/${identifier}/images`,
        `productImages/${identifier}/images`, `images/${identifier}/images`,
        `products/${identifier}/picture`, `productImages/${identifier}/picture`,
        `images/${identifier}/picture`, `products/${identifier}/photo`,
        `productImages/${identifier}/photo`, `images/${identifier}/photo`,
        `products/${identifier}/thumbnail`, `productImages/${identifier}/thumbnail`,
        `images/${identifier}/thumbnail`, `products/${identifier}/img`,
        `productImages/${identifier}/img`, `images/${identifier}/img`,
        `productInfo/${identifier}/image`, `productInfo/${identifier}/images/0`,
        `productDetails/${identifier}/image`, `productDetails/${identifier}/images/0`,
        `productAssets/${identifier}/image`, `productAssets/${identifier}/images/0`,
        `productMedia/${identifier}/image`, `productMedia/${identifier}/images/0`,
        `productGallery/${identifier}/0`, `productPhotos/${identifier}/0`,
      ];
      for (const path of pathsToTry) {
        try {
          const imageRef = ref(mainDatabase, path);
          const snapshot = await get(imageRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            const findImageInData = (obj) => {
              if (!obj) return null;
              if (typeof obj === 'string') {
                if (obj.startsWith('http') || obj.startsWith('/') || obj.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i)) return obj;
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
              } catch (err) { }
            }
          }
        } catch (err) { }
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
        } catch (err) { }
      }
    }
    setImageError("No image could be loaded for this product.");
    setIsFetchingImage(false);
  };

  useEffect(() => {
    fetchImage();
  }, [isOpen, displayProduct, retryCount]);

  // ==================== PACKING OPTIONS ====================
  const getPackingOptionsFromProduct = () => {
    if (!displayProduct) return [];
    const options = [];

    if (isRice && displayProduct.pack_type && Array.isArray(displayProduct.pack_type)) {
      displayProduct.pack_type.forEach(packType => {
        let displayName = packType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        options.push({ value: displayName, price: "0" });
      });
      return options;
    }

    if (displayProduct.packaging) {
      if (typeof displayProduct.packaging === 'object') {
        if (displayProduct.packaging.type) {
          options.push({ value: displayProduct.packaging.type, price: "0" });
        }
      } else if (typeof displayProduct.packaging === 'string') {
        options.push({ value: displayProduct.packaging, price: "0" });
      }
    }
    if (displayProduct.pack_type && typeof displayProduct.pack_type === 'string') {
      options.push({ value: displayProduct.pack_type, price: "0" });
    }
    const unique = [...new Map(options.map(item => [item.value, item])).values()];
    return unique;
  };

  const defaultRicePackingOptions = [
    { value: "PP Bags", price: "0" }, { value: "Non-Woven Bags", price: "0" },
    { value: "Jute Bags", price: "0" }, { value: "BOPP Bags", price: "0" },
    { value: "LDPE Bags", price: "0" }, { value: "HDPE Bags", price: "0" },
    { value: "Vacuum Packed", price: "0" }, { value: "Paper Bags", price: "0" },
    { value: "Bulk Packaging", price: "0" }, { value: "Custom Packaging", price: "0" },
    { value: "Non", price: "0" }
  ];

  // ==================== QUANTITY OPTIONS ====================
  useEffect(() => {
    if (!isOpen || !displayProduct) return;

    if (isRice) {
      let options = [];
      if (displayProduct.quantity && typeof displayProduct.quantity === 'object') {
        const quantityKeys = Object.keys(displayProduct.quantity);
        options = quantityKeys.map(key => ({ value: key, label: key }));
      } else {
        options = ["5kg", "10kg", "25kg", "50kg"].map(pack => ({ value: pack, label: pack }));
      }
      const finalOptions = [{ value: "", label: "Select Quantity", disabled: true }, ...options];
      setQuantityOptions(finalOptions);
      if (!quantity || quantity === "") setQuantity("");
      return;
    }

    const packaging = displayProduct?.packaging;
    if (packaging && packaging.units_per_carton && (packaging.unit_weight_g || packaging.unit_weight_ml)) {
      const units = packaging.units_per_carton;
      const weight = packaging.unit_weight_g || packaging.unit_weight_ml;
      const unitLabel = packaging.unit_weight_g ? 'g' : 'ml';
      setUnitsPerCarton(units);
      setUnitWeight(weight);
      setUnitWeightUnit(unitLabel);
      
      const packagingSpec = `${units} × ${weight} ${unitLabel} / carton`;
      const realOptions = [{ value: "1", label: packagingSpec }];
      const finalOptions = [{ value: "", label: "Select Quantity", disabled: true }, ...realOptions];
      setQuantityOptions(finalOptions);
      if (!quantity || quantity === "") setQuantity("1");
      return;
    }

    const fallbackOptions = [{ value: "", label: "Select Quantity", disabled: true }];
    setQuantityOptions(fallbackOptions);
    setQuantity("");
    setUnitsPerCarton(1);
    setUnitWeight(0);
    setUnitWeightUnit("g");
  }, [isRice, displayProduct, isOpen]);

  // ==================== GRADES ====================
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
      gradesList.push({ value: displayProduct.grade, price: "1.00" });
    }
    if (isRice && displayProduct.variety) {
      const variety = displayProduct.variety;
      const varietyEntries = riceData.filter((e) => {
        const dataVariety = e.variety?.trim().toLowerCase() || '';
        const searchVariety = variety.trim().toLowerCase();
        return dataVariety.includes(searchVariety) || searchVariety.includes(dataVariety);
      });
      const uniqueGrades = [...new Set(varietyEntries
        .map((e) => ({ value: e.grade, price: (e.price_inr / 83).toFixed(2) }))
        .filter(grade => grade.value && grade.value.trim() !== '')
      )];
      gradesList.push(...uniqueGrades);
    }
    return gradesList;
  };

  useEffect(() => {
    if (!isOpen || !displayProduct) return;
    const gradesList = getGradesFromProduct();
    setGrades(gradesList);
    if (gradesList.length > 0 && !grade) {
      setGrade(gradesList[0].value);
    }
  }, [displayProduct, isRice, isOpen]);

  // Additional rice quantity filter by packing
  useEffect(() => {
    if (!isOpen || !displayProduct) return;
    if (!isRice) return;
    if (!displayProduct.quantity || typeof displayProduct.quantity !== 'object') return;

    let quantityKeys = Object.keys(displayProduct.quantity);
    if (packing) {
      const packingKey = packing.toLowerCase().replace(/\s+/g, "_");
      const allowedQuantities = displayProduct.packing_cost?.[packingKey];
      if (allowedQuantities) {
        quantityKeys = Object.keys(allowedQuantities);
      }
    }
    const options = quantityKeys.map(key => ({ value: key, label: key }));
    const finalOptions = [{ value: "", label: "Select Quantity", disabled: true }, ...options];
    setQuantityOptions(finalOptions);
    if (!quantity || quantity === "") setQuantity("");
  }, [isRice, displayProduct, isOpen, packing]);

  // --- Update packing price ---
  useEffect(() => {
    if (packing) {
      const selectedPacking = packingOptions.find(option => option.value === packing);
      setPackingPrice(selectedPacking ? parseFloat(selectedPacking.price) : 0.00);
    } else {
      setPackingPrice(0.00);
    }
  }, [packing, packingOptions]);

  useEffect(() => {
    if (!isOpen || !displayProduct) return;
    const options = getPackingOptionsFromProduct();
    if (options.length > 0) {
      setPackingOptions(options);
      if (!packing) setPacking(options[0].value);
    } else {
      if (isRice) {
        setPackingOptions(defaultRicePackingOptions);
        if (!packing) setPacking(defaultRicePackingOptions[0].value);
      } else {
        setPackingOptions([]);
        setPacking("");
      }
    }
  }, [displayProduct, isRice, isOpen]);

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
          } catch (e) { }
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
    setQuantity(e.target.value);
  };

  const handlePackingChange = (e) => setPacking(e.target.value);
  const handleCurrencyChange = (e) => {
    const selectedCode = e.target.value;
    const currency = currencyOptions.find(c => c.code === selectedCode);
    if (currency) setDisplayCurrency(currency);
  };

  // --- Transport handlers ---
  const handleTransportTypeChange = (e) => setTransportType(e.target.value);
  const handlePickupLocationChange = (field, value) => setPickupLocation(prev => ({ ...prev, [field]: value }));
  const handleDeliveryLocationChange = (field, value) => setDeliveryLocation(prev => ({ ...prev, [field]: value }));
  const handleAirportLoadingChange = (field, value) => setAirportOfLoading(prev => ({ ...prev, [field]: value }));
  const handleAirportDestinationChange = (field, value) => setAirportOfDestination(prev => ({ ...prev, [field]: value }));
  const handlePortOfLoadingChange = (field, value) => setPortOfLoading(prev => ({ ...prev, [field]: value }));
  const handlePortOfDestinationChange = (field, value) => setPortOfDestination(prev => ({ ...prev, [field]: value }));

  // No +/- buttons
  const handleIncrease = () => {};
  const handleDecrease = () => {};

  // ==================== HELPER FUNCTIONS ====================
  const getQuantityUnit = () => {
    if (isRice) return 'kg';
    return 'carton';
  };

  const convert = (usdValue) => {
    const num = parseFloat(usdValue);
    if (isNaN(num)) return "0.00";
    return (num * displayCurrency.rate).toFixed(2);
  };

  const getPricePerCartonUSD = () => {
    if (!displayProduct) return 0;
    const priceFields = [
      displayProduct.price_usd_per_carton,
      displayProduct.fob_price_usd,
      displayProduct["Ex-Mill_usd"],
      displayProduct.price,
      displayProduct.price?.value
    ];
    for (let field of priceFields) {
      if (field !== undefined && field !== null && !isNaN(parseFloat(field))) {
        return parseFloat(field);
      }
    }
    return 0;
  };

  const getBasePricePerKgRice = () => {
    if (!isRice || !displayProduct?.quantity || !quantity) return 0;
    const priceInr = displayProduct.quantity[quantity];
    if (!priceInr) return 0;
    const match = quantity.match(/(\d+)/);
    const kg = match ? parseInt(match[1], 10) : 1;
    const perKgPriceInr = priceInr / kg;
    return perKgPriceInr / 83.5;
  };

  const getGradePrice = () => {
    if (!isRice) return getPricePerCartonUSD();
    if (grade) {
      const selectedGrade = grades.find(g => g.value === grade);
      if (selectedGrade && selectedGrade.price) return parseFloat(selectedGrade.price);
    }
    return getBasePricePerKgRice();
  };

  // ================ IMPROVED RICE PACKING COST LOGIC ================
  const extractQuantityKg = (qtyStr) => {
    if (!qtyStr) return 0;
    const match = qtyStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const normalizePackingName = (name) => {
    if (!name) return "";
    return name.toLowerCase().trim();
  };

  const getRicePackingPerKg = () => {
    if (!isRice) return 0;
    const kg = extractQuantityKg(quantity);
    if (kg === 0) return 0;

    if (displayProduct?.packing_cost) {
      const packingKey = packing?.toLowerCase().replace(/\s+/g, "_");
      const quantityKey = quantity?.toLowerCase().replace(/\s+/g, "");
      let perKgInr = displayProduct.packing_cost?.[packingKey]?.[quantityKey];
      
      if (!perKgInr && displayProduct.packing_cost?.[packingKey]) {
        const numericKg = kg.toString();
        perKgInr = displayProduct.packing_cost[packingKey][numericKg];
      }
      
      if (perKgInr) {
        return parseFloat(perKgInr) / 83.5;
      }
    }

    const normalizedPacking = normalizePackingName(packing);
    let defaultInr = 0;
    for (const [key, cost] of Object.entries(DEFAULT_RICE_PACKING_COST_INR)) {
      if (normalizedPacking.includes(key) || key.includes(normalizedPacking)) {
        defaultInr = cost;
        break;
      }
    }
    if (defaultInr === 0 && packing) defaultInr = 2;
    
    return defaultInr / 83.5;
  };

  const getRicePackingTotal = () => {
    if (!isRice) return 0;
    const perKgUsd = getRicePackingPerKg();
    const kg = extractQuantityKg(quantity);
    return perKgUsd * kg;
  };
  // ================================================================

  const getTotalWeightKg = () => {
    if (isRice) {
      return extractQuantityKg(quantity);
    } else {
      const cartons = parseInt(quantity, 10);
      if (isNaN(cartons)) return 0;
      const weightPerCartonKg = (unitsPerCarton * unitWeight) / 1000;
      return cartons * weightPerCartonKg;
    }
  };

  // --- Calculate estimated bill ---
  const calculateEstimatedBillUSD = () => {
    let basePrice = getGradePrice();
    let quantityPrice = 0;
    let transportCostNum = 0;
    let shippingCostNum = 0;
    let insuranceCostNum = 0;
    let freightCostNum = 0;
    let totalWeight = 0;

    if (isRice) {
      const kg = extractQuantityKg(quantity);
      quantityPrice = basePrice * kg;
      totalWeight = kg;
    } else {
      const cartons = parseInt(quantity, 10);
      if (!isNaN(cartons)) {
        quantityPrice = basePrice * cartons;
        totalWeight = getTotalWeightKg();
      }
    }

    if (transportType && TRANSPORT_COSTS[transportType]) {
      transportCostNum = TRANSPORT_COSTS[transportType] * totalWeight;
    }

    if (cifRequired === "Yes") {
      shippingCostNum = 2.00 * totalWeight;
      insuranceCostNum = 0.50 * totalWeight;
      freightCostNum = 1.00 * totalWeight;
    }

    const packingCostFinal = isRice ? getRicePackingTotal() : 0;

    const total = quantityPrice + packingCostFinal + portPrice + transportCostNum +
                  shippingCostNum + insuranceCostNum + freightCostNum + brandCharge;

    return {
      basePrice,
      quantity: isRice ? totalWeight : parseInt(quantity, 10),
      quantityPrice,
      packingCost: packingCostFinal,
      portPrice,
      transportCost: transportCostNum,
      shippingCost: shippingCostNum,
      insuranceCost: insuranceCostNum,
      freightCost: freightCostNum,
      brandCharge,
      total,
      quantityDisplay: quantity,
      transportModeLabel: transportType ? transportOptions.find(opt => opt.value === transportType)?.label : "",
      transportCostPerUnit: transportType ? TRANSPORT_COSTS[transportType] : 0,
      totalWeightKg: totalWeight
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
    brandCharge: convert(estimatedBillUSD.brandCharge),
    total: convert(estimatedBillUSD.total),
  };

  const getPackagingSpec = () => {
    if (isRice) return null;
    const packaging = displayProduct?.packaging;
    if (packaging && packaging.units_per_carton) {
      const units = packaging.units_per_carton;
      let weight = null;
      let unitLabel = null;
      if (packaging.unit_weight_g) {
        weight = packaging.unit_weight_g;
        unitLabel = "g";
      } else if (packaging.unit_weight_ml) {
        weight = packaging.unit_weight_ml;
        unitLabel = "ml";
      }
      if (units && weight) return `${units} × ${weight} ${unitLabel} / carton`;
    }
    return `${unitsPerCarton} × ${unitWeight} ${unitWeightUnit} / carton`;
  };

  const formatQuantityDisplay = () => {
    if (!quantity) return "Not selected";
    if (isRice) {
      const matchedOption = quantityOptions.find(opt => opt.value === quantity);
      return matchedOption ? matchedOption.label : quantity;
    } else {
      const cartons = parseInt(quantity, 10);
      if (!isNaN(cartons)) {
        const totalUnits = cartons * unitsPerCarton;
        return `${totalUnits} × ${unitWeight} ${unitWeightUnit} / carton`;
      }
      return quantity;
    }
  };

  const quantityDisplayForTotal = formatQuantityDisplay();
  const quantityUnit = getQuantityUnit();
  const orderUnits = estimatedBillUSD.quantity;

  // --- Save to Firebase ---
  const saveQuoteToFirebase = async (quoteData) => {
    const cleanUndefined = (obj) => {
      if (obj === undefined) return null;
      if (obj === null) return null;
      if (Array.isArray(obj)) {
        return obj.map(item => cleanUndefined(item));
      }
      if (typeof obj === 'object') {
        const cleaned = {};
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (val !== undefined) {
            cleaned[key] = cleanUndefined(val);
          }
        }
        return cleaned;
      }
      return obj;
    };

    try {
      const quotesRef = ref(quoteDatabase, 'quotes');
      const snapshot = await get(quotesRef);
      
      let nextNum = 1;
      if (snapshot.exists()) {
        const quotesObj = snapshot.val();
        const keys = Object.keys(quotesObj);
        let maxNum = 0;
        keys.forEach(k => {
          if (k.startsWith('quote-')) {
            const num = parseInt(k.substring(6), 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
        nextNum = maxNum + 1;
      }
      
      const quoteKey = `quote-${nextNum}`;
      const specificQuoteRef = ref(quoteDatabase, `quotes/${quoteKey}`);
      
      const quoteDataWithId = cleanUndefined({
        ...quoteData,
        id: quoteKey,
        createdAt: new Date().toISOString(),
        status: 'new',
        storedIn: 'firebasegetquote-database'
      });
      await set(specificQuoteRef, quoteDataWithId);
      return quoteKey;
    } catch (error) {
      console.error('Error saving quote:', error);
      throw error;
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!quantity) {
      alert("Please select a quantity.");
      return;
    }

    if (!packing || !fullName) {
      alert("Please fill all required fields (Packing, Full Name).");
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

    let transportDetails = {};
    if (transportType === 'road') {
      transportDetails = { transportType: 'road', pickupLocation, deliveryLocation, vehicleType: vehicleType || "" };
    } else if (transportType === 'air') {
      transportDetails = { transportType: 'air', airportOfLoading, airportOfDestination };
    } else if (transportType === 'ocean') {
      transportDetails = { transportType: 'ocean', portOfLoading, portOfDestination };
    }

    const quoteData = {
      contactInfo: {
        fullName, email, phone: fullPhoneNumber, countryCode,
        country: userCountry, state: userState, city: userCity, pincode: userPincode,
        address: { country: userCountry, state: userState, city: userCity, pincode: userPincode }
      },
      productInfo: {
        productId: displayProduct?.id || "", industry,
        category: displayProduct?.brand || displayProduct?.category || "",
        productName: displayProduct?.name || "", variety: displayProduct?.variety || "",
        grade: grade || "Standard", gradePrice,
        packing, packingPrice: packingPrice.toFixed(2),
        quantity: quantity,
        transport: { ...transportDetails, cost: estimatedBillUSD.transportCost.toFixed(2) },
        cifRequired, additionalInfo, brandRequired,
        brandCharge: brandCharge.toFixed(2),
        displayCurrency: displayCurrency.code
      },
      estimatedBill: {
        basePrice: estimatedBillUSD.basePrice.toFixed(2),
        quantity: quantity,
        quantityPrice: estimatedBillUSD.quantityPrice.toFixed(2),
        packingCost: estimatedBillUSD.packingCost.toFixed(2),
        portPrice: estimatedBillUSD.portPrice.toFixed(2),
        transportCost: estimatedBillUSD.transportCost.toFixed(2),
        shippingCost: estimatedBillUSD.shippingCost.toFixed(2),
        insuranceCost: estimatedBillUSD.insuranceCost.toFixed(2),
        freightCost: estimatedBillUSD.freightCost.toFixed(2),
        brandCharge: estimatedBillUSD.brandCharge.toFixed(2),
        total: estimatedBillUSD.total.toFixed(2)
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
        transportMessage = `- Transport: Road\n- Pickup: ${pickupLocation.city}, ${pickupLocation.state}, ${pickupLocation.country}\n- Delivery: ${deliveryLocation.city}, ${deliveryLocation.state}, ${deliveryLocation.country}\n${vehicleType ? `- Vehicle: ${vehicleType}` : ''}`;
      } else if (transportType === 'air') {
        transportMessage = `- Transport: Air Freight\n- Airport of Loading: ${airportOfLoading.airportName}, ${airportOfLoading.country}\n- Airport of Destination: ${airportOfDestination.airportName}, ${airportOfDestination.country}`;
      } else if (transportType === 'ocean') {
        transportMessage = `- Transport: Ocean Freight\n- Port of Loading: ${portOfLoading.portName}, ${portOfLoading.state}, ${portOfLoading.country}\n- Port of Destination: ${portOfDestination.portName}, ${portOfDestination.state}, ${portOfDestination.country}`;
      }

      const cifMessage = cifRequired === "Yes"
        ? `- CIF Required: Yes\n- Shipping Cost: $${estimatedBillUSD.shippingCost.toFixed(2)}\n- Insurance Cost: $${estimatedBillUSD.insuranceCost.toFixed(2)}\n- Freight Cost: $${estimatedBillUSD.freightCost.toFixed(2)}`
        : "- CIF Required: No";

      const brandingMessage = brandRequired === "Yes"
        ? `- Branding Required: Yes (+$${brandCharge.toFixed(2)} branding charge)`
        : "- Branding Required: No";

      const message = `Hello! I want a quote for:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Address: ${userCity}, ${userState}, ${userCountry} - ${userPincode}
- Industry: ${industry}
- Product: ${displayProduct?.name || ""}
- Grade: ${grade}${gradePrice ? ` (Price: $${gradePrice})` : ''}
- Packing: ${packing} ($${packingPrice.toFixed(2)})
- Quantity: ${quantityDisplayForTotal}
${transportMessage}
- Transport Cost: $${estimatedBillUSD.transportCost.toFixed(2)}
${cifMessage}
- Packing Cost: $${estimatedBillUSD.packingCost.toFixed(2)}
${brandingMessage}
- Estimated Total: $${estimatedBillUSD.total.toFixed(2)}
- Quote ID: ${quoteId}
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
- Quantity: ${quantityDisplayForTotal}
${transportMessage}
- Transport Cost: $${estimatedBillUSD.transportCost.toFixed(2)}
${cifMessage}
- Packing Cost: $${estimatedBillUSD.packingCost.toFixed(2)}
${brandingMessage}
- Estimated Total: $${estimatedBillUSD.total.toFixed(2)}
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
    setHasAutoFilled(false);
    setFetchedImage(null);
    setImageError("");
    setDisplayCurrency(currencyOptions[0]);
    defaultCurrencySet.current = false;
    setBrandRequired("No");
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

  // ========== RENDER ==========
  return (
    <>
      <div className="buy-modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'auto', padding: '20px'
      }}>
        <div ref={modalRef} className="buy-modal-container" style={{
          backgroundColor: '#0f172a', borderRadius: '28px', border: '1px solid rgba(0,245,200,0.4)',
          width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
        }}>
          <button className="buy-modal-close-btn" onClick={handleClose} disabled={isSubmitting} style={{
            position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '24px',
            cursor: 'pointer', color: '#f1f5f9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10, transition: 'all 0.2s'
          }}>&times;</button>

          <div className="buy-modal-header" style={{ padding: '20px 30px 10px', borderBottom: '1px solid rgba(0,245,200,0.2)' }}>
            <h2 className="buy-modal-title" style={{ fontSize: '1.8rem', fontWeight: '700', color: '#00F5C8', marginBottom: '8px' }}>Get Quote - {industry || displayProduct?.category || "Product"}</h2>
            <p className="buy-modal-subtitle" style={{ color: '#94a3b8' }}>Fill out the form below and we'll get back to you shortly</p>
          </div>

          <div className="buy-modal-body" style={{ flex: 1, overflow: 'auto', padding: '0' }}>
            <div className="modal-layout" style={{ display: 'flex', flexDirection: 'row', gap: '20px', padding: '20px', minHeight: 'calc(100% - 40px)' }}>
              <div className="form-section-container" ref={formContainerRef} style={{ flex: 1.5, minWidth: 0 }}>
                <div className="currency-selector" style={{ padding: '20px 25px 0' }}>
                  <label htmlFor="currencySelect" className="currency-label" style={{ color: '#cbd5e1', marginRight: '10px' }}>Display Currency:</label>
                  <select id="currencySelect" value={displayCurrency.code} onChange={handleCurrencyChange} className="currency-select" disabled={isSubmitting} style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(0,245,200,0.3)', borderRadius: '8px', padding: '6px 12px' }}>
                    {currencyOptions.map(currency => (
                      <option key={currency.code} value={currency.code}>{currency.flag} {currency.symbol} {currency.code}</option>
                    ))}
                  </select>
                </div>

                <section className="form-section product-summary" style={{ padding: '0 25px' }}>
                  <h3 className="section-title" style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '15px', borderBottom: '2px solid #00F5C8', display: 'inline-block' }}>Product Details</h3>
                  <div className="product-summary-content" style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                    <div className="product-image-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      <img src={productImageSrc} alt={displayProduct?.name || "Product"} className="product-summary-image" style={{ width: '120px', height: '120px', objectFit: 'contain', background: '#fff', borderRadius: '12px', padding: '8px' }} onError={(e) => {
                        setImageError(`Failed to load image: ${e.target.src}`);
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='10' y='55' fill='%23aaa' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }} />
                    </div>
                    {imageError && (
                      <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', textAlign: 'center', gridColumn: '1 / -1' }}>
                        {imageError}
                        <button onClick={() => setRetryCount(prev => prev + 1)} style={{ marginLeft: '10px', padding: '2px 8px', background: '#00F5C8', color: '#0f172a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
                      </div>
                    )}
                    <div className="summary-grid" style={{ display: 'grid', gap: '12px' }}>
                      <div className="summary-item heritage" style={{ fontSize: '1rem', color: '#00F5C8', fontWeight: '500' }}>{heritageDisplay}</div>
                      <div className="summary-item product-name" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}><strong>{displayProduct?.name || "Product"}</strong></div>
                      <div className="summary-item brand-part" style={{ color: '#94a3b8' }}>{brandPart1}</div>
                      {brandPart2 && <div className="summary-item brand-part" style={{ color: '#94a3b8' }}>{brandPart2}</div>}

                      {grades.length > 0 && (
                        <div className="summary-item grade" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#cbd5e1' }}>Grade:</strong>
                          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="grade-select" disabled={isSubmitting} style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(0,245,200,0.3)', borderRadius: '8px', padding: '6px', flex: 1 }}>
                            <option value="">Select Grade</option>
                            {grades.map((gradeOption, i) => (
                              <option key={i} value={gradeOption.value}>{gradeOption.value} ({displayCurrency.symbol}{convert(gradeOption.price)}/{isRice ? 'kg' : 'carton'})</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="summary-item packing" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#cbd5e1' }}>Packing:</strong>
                        <select value={packing} onChange={handlePackingChange} className="packing-select" disabled={isSubmitting} style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(0,245,200,0.3)', borderRadius: '8px', padding: '6px', flex: 1 }}>
                          <option value="">Select Packing</option>
                          {packingOptions.map((option, index) => (
                            <option key={index} value={option.value}>{option.value}</option>
                          ))}
                        </select>
                      </div>
                      <div className="summary-item quantity" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#cbd5e1' }}>Quantity:</strong>
                        <select value={quantity} onChange={handleQuantityChange} className="quantity-select" disabled={isSubmitting} style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(0,245,200,0.3)', borderRadius: '8px', padding: '6px', flex: 1 }}>
                          {quantityOptions.map((option, index) => (
                            <option key={index} value={option.value} disabled={option.disabled}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="summary-details-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', paddingTop: '8px' }}>
                        <span className="detail-item" style={{ color: '#94a3b8' }}><strong>Origin:</strong> {originDisplay}</span>
                        <span className="detail-item" style={{ color: '#94a3b8' }}><strong>Selected Qty:</strong> {quantityDisplayForTotal}</span>
                        <span className="detail-item" style={{ color: '#94a3b8' }}><strong>Order Qty:</strong> {orderUnits} {isRice ? quantityUnit : 'units'}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {/* CONTACT & TRANSPORT SECTION (unchanged) */}
                  <section className="form-section" style={{ padding: '0 25px' }}>
                    <h3 className="section-title" style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '15px', borderBottom: '2px solid #00F5C8', display: 'inline-block' }}>Contact Information</h3>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Full Name <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                      <input type="text" placeholder="Enter your full name" value={fullName} onChange={handleFullNameChange} required className="form-input" disabled={isSubmitting} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Email Address <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                      <input type="email" placeholder="your.email@example.com" value={email} onChange={handleEmailChange} required className="form-input" disabled={isSubmitting} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      {emailError && <div className="error-message" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{emailError}</div>}
                    </div>
                    <div className="form-row grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Country <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={userCountry} onChange={handleUserCountryChange} placeholder="Enter your country" className="form-input" disabled={isSubmitting} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>State/Province <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={userState} onChange={handleUserStateChange} placeholder="Enter your state/province" className="form-input" disabled={isSubmitting} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      </div>
                    </div>
                    <div className="form-row grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>City/Town <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={userCity} onChange={handleUserCityChange} placeholder="Enter your city/town" className="form-input" disabled={isSubmitting} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Pincode/ZIP <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={userPincode} onChange={handleUserPincodeChange} placeholder="Enter your pincode/ZIP" className="form-input" disabled={isSubmitting} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Phone Number <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                      <div className="phone-input-group" style={{ display: 'flex', gap: '10px' }}>
                        <select ref={countrySelectRef} value={countryCode} onChange={handlePhoneCountryChange} className="country-code-select" disabled={isSubmitting} style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }}>
                          {countryOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.flag} {option.value}</option>
                          ))}
                        </select>
                        <input type="tel" placeholder={`Phone number (${getCurrentCountry()?.length || 10} digits)`} value={phoneNumber} onChange={handlePhoneChange} maxLength={getCurrentCountry()?.length || 10} required className="form-input phone-input" disabled={isSubmitting} style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      </div>
                      {phoneError && <div className="error-message" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{phoneError}</div>}
                    </div>

                    {/* Transport Details Section (unchanged) */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Transport Details</label>
                      <label className="form-label" style={{ marginTop: '8px', fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Select Transport Type *</label>
                      <select value={transportType} onChange={handleTransportTypeChange} className="form-select" disabled={isSubmitting} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}>
                        <option value="">Select Transport Type</option>
                        {transportOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <div className="field-info" style={{ marginTop: '5px' }}>
                        <small style={{ color: '#94a3b8' }}>Transport cost: ${TRANSPORT_COSTS[transportType] || '0'} per kg</small>
                      </div>
                    </div>

                    {transportType === 'road' && (
                      <>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Pickup Location *</label>
                          <div className="transport-location-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="City" value={pickupLocation.city} onChange={(e) => handlePickupLocationChange('city', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="State" value={pickupLocation.state} onChange={(e) => handlePickupLocationChange('state', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="Country" value={pickupLocation.country} onChange={(e) => handlePickupLocationChange('country', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Delivery Location *</label>
                          <div className="transport-location-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="City" value={deliveryLocation.city} onChange={(e) => handleDeliveryLocationChange('city', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="State" value={deliveryLocation.state} onChange={(e) => handleDeliveryLocationChange('state', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="Country" value={deliveryLocation.country} onChange={(e) => handleDeliveryLocationChange('country', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Vehicle Type (Optional)</label>
                          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="form-select" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}>
                            <option value="">Select Vehicle Type</option>
                            {vehicleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {transportType === 'air' && (
                      <>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Airport of Loading *</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Country" value={airportOfLoading.country} onChange={(e) => handleAirportLoadingChange('country', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="Airport Name" value={airportOfLoading.airportName} onChange={(e) => handleAirportLoadingChange('airportName', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Airport of Destination *</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Country" value={airportOfDestination.country} onChange={(e) => handleAirportDestinationChange('country', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="Airport Name" value={airportOfDestination.airportName} onChange={(e) => handleAirportDestinationChange('airportName', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                          </div>
                        </div>
                      </>
                    )}

                    {transportType === 'ocean' && (
                      <>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Port of Loading *</label>
                          <div className="port-fields" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="Country" value={portOfLoading.country} onChange={(e) => handlePortOfLoadingChange('country', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="State" value={portOfLoading.state} onChange={(e) => handlePortOfLoadingChange('state', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="Port Name" value={portOfLoading.portName} onChange={(e) => handlePortOfLoadingChange('portName', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Port of Destination *</label>
                          <div className="port-fields" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="Country" value={portOfDestination.country} onChange={(e) => handlePortOfDestinationChange('country', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="State" value={portOfDestination.state} onChange={(e) => handlePortOfDestinationChange('state', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                            <input type="text" placeholder="Port Name" value={portOfDestination.portName} onChange={(e) => handlePortOfDestinationChange('portName', e.target.value)} className="form-input" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} required />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>CIF Required? <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                      <select value={cifRequired} onChange={(e) => setCifRequired(e.target.value)} required className="form-select" disabled={isSubmitting} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}>
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="field-info" style={{ marginTop: '5px' }}>
                        <small style={{ color: '#94a3b8' }}>CIF (Cost, Insurance, and Freight) includes shipping and insurance costs to your destination</small>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Brand Required (If Any) <span className="required-star" style={{ color: '#ef4444' }}>*</span></label>
                      <select value={brandRequired} onChange={(e) => setBrandRequired(e.target.value)} className="form-select" disabled={isSubmitting} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      {brandRequired === "Yes" && (
                        <div className="field-info" style={{ marginTop: '8px', background: 'rgba(0,245,200,0.1)', padding: '8px', borderRadius: '6px', color: '#cbd5e1' }}>
                          Add your logo/branding to the packaging - Additional charge: {displayCurrency.symbol}{convert(35)} per order
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Additional Information</label>
                      <textarea placeholder="Any additional details or requirements" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className="form-textarea" rows="4" disabled={isSubmitting} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                    </div>
                  </section>

                  <div className="form-actions" style={{ display: 'flex', gap: '15px', padding: '20px 25px 30px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(0,245,200,0.2)' }}>
                    <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00F5C8, #0ea5e9)', border: 'none', borderRadius: '40px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', color: '#0f172a' }}>
                      {isSubmitting ? <span className="btn-loading"><span className="btn-spinner"></span> Submitting...</span> : "Get Quote"}
                    </button>
                    <button type="button" onClick={handleClose} className="cancel-btn" disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: 'rgba(30,41,59,0.9)', border: '1px solid #475569', borderRadius: '40px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', color: '#f1f5f9' }}>Cancel</button>
                  </div>
                </form>
              </div>

              {/* ========== ESTIMATE SECTION WITH SCROLL FOR RICE ONLY ========== */}
              <div 
                className="estimate-section-container" 
                ref={estimateContainerRef} 
                style={{
                  flex: 1,
                  background: 'rgba(30,41,59,0.4)',
                  borderRadius: '20px',
                  padding: '20px',
                  height: isRice ? 'auto' : 'fit-content',
                  maxHeight: isRice ? 'calc(100vh - 200px)' : 'none',
                  overflowY: isRice ? 'auto' : 'visible',
                  position: 'sticky',
                  top: '20px'
                }}
              >
                <div className="price-breakdown-section">
                  <h4 className="price-breakdown-title" style={{ fontSize: '1.2rem', fontWeight: '600', color: '#00F5C8', marginBottom: '12px' }}>Estimated Bill Breakdown ({displayCurrency.code})</h4>
                  <div className="estimate-note" style={{ marginBottom: '15px', fontSize: '0.8rem', color: '#94a3b8' }}><small>This is an estimated bill. Final pricing may vary based on actual costs and market conditions.</small></div>
                  
                  {isRice ? (
                    // Rice breakdown exactly matching the image
                    <div className="price-breakdown-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Packing:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{packing || "N/A"}</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Packing Cost per kg:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{displayCurrency.symbol}{convert(getRicePackingPerKg())}/kg</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Total Packing Cost:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{displayCurrency.symbol}{convertedBill.packingCost}</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Quantity:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{quantityDisplayForTotal}</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Order Quantity:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>1 unit</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Quantity Price:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{displayCurrency.symbol}{convertedBill.quantityPrice}</span>
                      </div>
                      <div className="price-item final-total" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '8px', borderTop: '2px solid #00F5C8' }}>
                        <span className="price-label" style={{ fontWeight: '700', color: '#00F5C8' }}>Final Total:</span>
                        <span className="price-value" style={{ fontWeight: '700', color: '#00F5C8', fontSize: '1.2rem' }}>{displayCurrency.symbol}{convertedBill.total}</span>
                      </div>
                    </div>
                  ) : (
                    // Non-rice breakdown
                    <div className="price-breakdown-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Packing:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{packing || "N/A"}</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Quantity:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{quantityDisplayForTotal}</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Order Quantity:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>1 unit</span>
                      </div>
                      <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="price-label" style={{ color: '#94a3b8' }}>Quantity Price:</span>
                        <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{displayCurrency.symbol}{convertedBill.quantityPrice}</span>
                      </div>
                      <div className="price-item final-total" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '8px', borderTop: '2px solid #00F5C8' }}>
                        <span className="price-label" style={{ fontWeight: '700', color: '#00F5C8' }}>Total Price:</span>
                        <span className="price-value" style={{ fontWeight: '700', color: '#00F5C8', fontSize: '1.2rem' }}>{displayCurrency.symbol}{convertedBill.total}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ThankYouPopup isOpen={showThankYou} onClose={() => { setShowThankYou(false); onClose(); }} />

      {/* ========== MOBILE‑ONLY OVERRIDES (do not affect desktop) ========== */}
      <style>{`
        @media (max-width: 768px) {
          .buy-modal-overlay {
            padding: 8px !important;
          }
          .buy-modal-container {
            border-radius: 20px !important;
            max-width: 100% !important;
          }
          .buy-modal-close-btn {
            width: 32px !important;
            height: 32px !important;
            font-size: 20px !important;
            top: 12px !important;
            right: 12px !important;
          }
          .buy-modal-header {
            padding: 12px 16px 8px !important;
          }
          .buy-modal-title {
            font-size: 1.2rem !important;
          }
          .buy-modal-subtitle {
            font-size: 0.75rem !important;
          }
          .modal-layout {
            flex-direction: column !important;
            gap: 15px !important;
            padding: 12px !important;
          }
          .form-section-container {
            flex: auto !important;
          }
          /* Make estimate section scrollable on mobile */
          .estimate-section-container {
            position: relative !important;
            top: auto !important;
            margin-top: 15px !important;
            padding: 15px !important;
            max-height: 40vh !important;
            overflow-y: auto !important;
          }
          .currency-selector {
            padding: 0 15px 15px !important;
            justify-content: flex-start !important;
          }
          .form-section {
            padding: 0 15px !important;
          }
          .product-summary-content {
            padding: 12px !important;
          }
          .product-summary-image {
            width: 80px !important;
            height: 80px !important;
          }
          .summary-item.product-name {
            font-size: 1rem !important;
          }
          .summary-item.grade,
          .summary-item.packing,
          .summary-item.quantity {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .grade-select,
          .packing-select,
          .quantity-select {
            width: 100% !important;
          }
          .form-row.grid-2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .phone-input-group {
            flex-direction: column !important;
          }
          .country-code-select {
            width: 100% !important;
          }
          .transport-location-group {
            flex-direction: column !important;
          }
          .transport-location-group .form-input {
            width: 100% !important;
          }
          .form-actions {
            flex-direction: column !important;
            padding: 15px !important;
            gap: 10px !important;
          }
          .submit-btn, .cancel-btn {
            font-size: 0.9rem !important;
            padding: 10px !important;
          }
          .price-breakdown-title {
            font-size: 1rem !important;
          }
          .price-item {
            font-size: 0.85rem !important;
          }
          .price-item.final-total .price-label,
          .price-item.final-total .price-value {
            font-size: 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .buy-modal-overlay {
            padding: 4px !important;
          }
          .buy-modal-container {
            border-radius: 16px !important;
          }
          .buy-modal-close-btn {
            width: 28px !important;
            height: 28px !important;
            font-size: 16px !important;
            top: 8px !important;
            right: 8px !important;
          }
          .buy-modal-header {
            padding: 8px 12px 6px !important;
          }
          .buy-modal-title {
            font-size: 1rem !important;
          }
          .buy-modal-subtitle {
            font-size: 0.7rem !important;
          }
          .modal-layout {
            gap: 10px !important;
            padding: 8px !important;
          }
          .estimate-section-container {
            max-height: 35vh !important;
            padding: 10px !important;
          }
          .product-summary-image {
            width: 60px !important;
            height: 60px !important;
          }
          .form-input, .form-select, .form-textarea, .country-code-select {
            font-size: 0.85rem !important;
            padding: 6px !important;
          }
          .price-item {
            font-size: 0.75rem !important;
          }
          .price-item.final-total .price-label,
          .price-item.final-total .price-value {
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default BuyModal;