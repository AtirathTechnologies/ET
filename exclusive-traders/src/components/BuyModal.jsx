import React, { useState, useEffect, useRef } from "react";
import { riceData } from "../data/products";
import ThankYouPopup from "../components/ThankYouPopup";
import { ref, push, set } from "firebase/database";
import { quoteDatabase } from "../firebasegetquote";

// Industry-specific grade data
const industryGrades = {
  oil: [
    { value: "Extra Virgin", price: "3.00" }, { value: "Virgin", price: "2.50" },
    { value: "Pure", price: "2.00" }, { value: "Refined", price: "1.80" },
    { value: "Cold Pressed", price: "3.20" }, { value: "Organic", price: "3.50" }
  ],
  construction: [
    { value: "Grade A", price: "150.00" }, { value: "Grade B", price: "120.00" },
    { value: "Industrial Grade", price: "100.00" }, { value: "Commercial Grade", price: "130.00" },
    { value: "Premium Quality", price: "180.00" }, { value: "Standard Quality", price: "110.00" }
  ],
  fruits: [
    { value: "Grade A", price: "2.50" }, { value: "Grade B", price: "1.80" },
    { value: "Export Quality", price: "3.00" }, { value: "Premium", price: "2.80" },
    { value: "Standard", price: "1.50" }, { value: "Organic", price: "3.50" }
  ],
  vegetables: [
    { value: "Grade A", price: "1.20" }, { value: "Grade B", price: "0.80" },
    { value: "Fresh", price: "1.50" }, { value: "Organic", price: "2.00" },
    { value: "Premium", price: "1.80" }, { value: "Standard", price: "0.70" }
  ],
  pulses: [
    { value: "Premium Grade", price: "1.80" }, { value: "Standard Grade", price: "1.20" },
    { value: "Export Quality", price: "2.00" }, { value: "First Quality", price: "1.60" },
    { value: "Commercial Grade", price: "1.00" }, { value: "Top Quality", price: "1.90" },
    { value: "Superior Quality", price: "1.70" }, { value: "Regular Quality", price: "0.90" }
  ],
  spices: [
    { value: "Premium Grade", price: "4.00" }, { value: "Standard Grade", price: "2.50" },
    { value: "Export Quality", price: "5.00" }, { value: "First Quality", price: "3.50" },
    { value: "Commercial Grade", price: "2.00" }, { value: "A Grade", price: "3.80" },
    { value: "B Grade", price: "2.20" }, { value: "C Grade", price: "1.50" },
    { value: "Top Quality", price: "4.20" }, { value: "Superior Quality", price: "3.20" },
    { value: "Regular Quality", price: "1.80" }
  ],
  tea: [
    { value: "Premium Grade", price: "8.00" }, { value: "First Flush", price: "12.00" },
    { value: "Second Flush", price: "10.00" }, { value: "Orthodox", price: "15.00" },
    { value: "CTC", price: "6.00" }, { value: "Green Tea", price: "9.00" },
    { value: "White Tea", price: "18.00" }, { value: "Oolong Tea", price: "14.00" },
    { value: "Darjeeling Tea", price: "20.00" }, { value: "Assam Tea", price: "7.00" },
    { value: "Organic Tea", price: "11.00" }, { value: "Commercial Grade", price: "5.00" }
  ],
  clothes: [
    { value: "Premium Quality", price: "25.00" }, { value: "Export Quality", price: "20.00" },
    { value: "First Quality", price: "18.00" }, { value: "Commercial Grade", price: "12.00" },
    { value: "Standard Quality", price: "15.00" }, { value: "Luxury Grade", price: "35.00" },
    { value: "Boutique Quality", price: "28.00" }, { value: "Mass Market", price: "10.00" },
    { value: "Designer Grade", price: "45.00" }, { value: "Economy Grade", price: "8.00" }
  ],
  chocolate: [
    { value: "Premium Grade", price: "12.00" }, { value: "Belgian Chocolate", price: "15.00" },
    { value: "Swiss Chocolate", price: "14.00" }, { value: "Dark Chocolate", price: "10.00" },
    { value: "Milk Chocolate", price: "8.00" }, { value: "White Chocolate", price: "9.00" },
    { value: "Organic Chocolate", price: "13.00" }, { value: "Sugar-Free", price: "11.00" },
    { value: "Commercial Grade", price: "6.00" }, { value: "Artisanal", price: "18.00" },
    { value: "Couverture", price: "16.00" }, { value: "Compound", price: "5.00" }
  ],
  beverages: [
    { value: "Premium Grade", price: "3.50" }, { value: "Natural", price: "4.00" },
    { value: "Organic", price: "5.00" }, { value: "Sugar-Free", price: "3.80" },
    { value: "Concentrate", price: "2.50" }, { value: "Ready-to-Drink", price: "4.50" },
    { value: "Commercial Grade", price: "2.00" }, { value: "Export Quality", price: "4.20" },
    { value: "First Quality", price: "3.20" }, { value: "Standard Quality", price: "2.80" }
  ],
  perfumes: [
    { value: "Premium Grade", price: "50.00" }, { value: "Luxury", price: "80.00" },
    { value: "Designer", price: "65.00" }, { value: "Niche", price: "95.00" },
    { value: "Export Quality", price: "45.00" }, { value: "Commercial Grade", price: "25.00" },
    { value: "First Quality", price: "40.00" }, { value: "Standard Quality", price: "30.00" },
    { value: "Organic", price: "55.00" }, { value: "Natural", price: "60.00" }
  ],
  flowers: [
    { value: "Premium Grade", price: "2.50" }, { value: "Export Quality", price: "3.00" },
    { value: "First Quality", price: "2.20" }, { value: "Commercial Grade", price: "1.50" },
    { value: "Standard Quality", price: "1.80" }, { value: "Luxury Grade", price: "4.00" },
    { value: "Organic", price: "2.80" }, { value: "Fresh Cut", price: "2.00" },
    { value: "Bouquet Quality", price: "3.20" }, { value: "Event Grade", price: "1.20" }
  ],
  'dry fruits': [
    { value: "Premium Grade", price: "8.00" }, { value: "Export Quality", price: "9.00" },
    { value: "First Quality", price: "7.50" }, { value: "Commercial Grade", price: "5.00" },
    { value: "Standard Quality", price: "6.00" }, { value: "Organic", price: "10.00" },
    { value: "Natural", price: "8.50" }, { value: "Roasted", price: "7.00" },
    { value: "Raw", price: "6.50" }, { value: "Salted", price: "7.20" },
    { value: "Unsalted", price: "7.50" }, { value: "Blanched", price: "8.20" }
  ],
  electronics: [
    { value: "Premium Grade", price: "100.00" }, { value: "Brand New", price: "120.00" },
    { value: "Refurbished", price: "80.00" }, { value: "Original", price: "110.00" },
    { value: "Standard Quality", price: "90.00" }
  ],
  default: [
    { value: "Premium Grade", price: "2.00" }, { value: "Standard Grade", price: "1.50" },
    { value: "Export Quality", price: "2.50" }, { value: "First Quality", price: "1.80" },
    { value: "Commercial Grade", price: "1.20" }
  ]
};

// Industry-specific quantity options with appropriate units
const industryQuantityOptions = {
  rice: [
    "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg", "500 Kg", 
    "1 Ton", "5 Tons", "10 Tons", "Custom Quantity"
  ],
  pulses: [
    "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg", "500 Kg", 
    "1 Ton", "5 Tons", "10 Tons", "Custom Quantity"
  ],
  spices: [
    "100 g", "250 g", "500 g", "1 Kg", "2 Kg", "5 Kg", 
    "10 Kg", "25 Kg", "50 Kg", "Custom Quantity"
  ],
  'dry fruits': [
    "250 g", "500 g", "1 Kg", "2 Kg", "5 Kg", "10 Kg", 
    "25 Kg", "50 Kg", "100 Kg", "Custom Quantity"
  ],
  tea: [
    "100 g", "250 g", "500 g", "1 Kg", "2 Kg", "5 Kg", 
    "10 Kg", "25 Kg", "50 Kg", "Custom Quantity"
  ],
  chocolate: [
    "100 g", "250 g", "500 g", "1 Kg", "2 Kg", "5 Kg", 
    "10 Kg", "25 Kg", "50 Kg", "Custom Quantity"
  ],
  coffee: [
    "100 g", "250 g", "500 g", "1 Kg", "2 Kg", "5 Kg",
    "10 Kg", "25 Kg", "Custom Quantity"
  ],
  sugar: [
    "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg",
    "500 Kg", "1 Ton", "Custom Quantity"
  ],
  salt: [
    "500 g", "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg",
    "100 Kg", "Custom Quantity"
  ],
  flour: [
    "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg",
    "Custom Quantity"
  ],
  fruits: [
    "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg", 
    "500 Kg", "1 Ton", "5 Tons", "Custom Quantity"
  ],
  vegetables: [
    "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg", 
    "500 Kg", "1 Ton", "5 Tons", "Custom Quantity"
  ],
  oil: [
    "250 ml", "500 ml", "1 Liter", "5 Liters", "10 Liters", "25 Liters", 
    "50 Liters", "100 Liters", "500 Liters", "1000 Liters", "Custom Quantity"
  ],
  beverages: [
    "250 ml", "500 ml", "1 Liter", "2 Liters", "5 Liters", "10 Liters", 
    "25 Liters", "50 Liters", "100 Liters", "Custom Quantity"
  ],
  perfumes: [
    "30 ml", "50 ml", "100 ml", "250 ml", "500 ml", "1 Liter", 
    "5 Liters", "10 Liters", "Custom Quantity"
  ],
  flowers: [
    "1 Piece", "1 Dozen", "2 Dozen", "5 Dozen", "10 Dozen",
    "50 Pieces", "100 Pieces", "1 Bouquet", "5 Bouquets", "Custom Quantity"
  ],
  clothes: [
    "1 Piece", "10 Pieces", "50 Pieces", "100 Pieces", 
    "500 Pieces", "1000 Pieces", "Custom Quantity"
  ],
  electronics: [
    "1 Piece", "5 Pieces", "10 Pieces", "50 Pieces", 
    "100 Pieces", "Custom Quantity"
  ],
  construction: [
    "1 Ton", "5 Tons", "10 Tons", "25 Tons", "50 Tons", "100 Tons",
    "Custom Quantity"
  ],
  dairy: [
    "500 ml", "1 Liter", "5 Liters", "10 Liters", "25 Liters",
    "50 Liters", "100 Liters", "Custom Quantity"
  ],
  seafood: [
    "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg",
    "Custom Quantity"
  ],
  meat: [
    "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg",
    "Custom Quantity"
  ],
  bakery: [
    "1 Piece", "1 Dozen", "2 Dozen", "5 Dozen", "10 Dozen",
    "Custom Quantity"
  ],
  default: [
    "1 Kg", "5 Kg", "10 Kg", "25 Kg", "50 Kg", "100 Kg", 
    "500 Kg", "1 Ton", "5 Tons", "10 Tons", "Custom Quantity"
  ]
};

// Industry-specific packing options with prices (but display without prices)
const packingOptionsByType = {
  oil: [
    { value: "PET Bottles", price: "8" },
    { value: "Glass Bottles", price: "12" },
    { value: "Plastic Cans", price: "10" },
    { value: "Tin Cans", price: "15" },
    { value: "Flexi Pouches", price: "6" },
    { value: "Drum Packaging", price: "25" },
    { value: "Bulk Tankers", price: "5" },
    { value: "Aseptic Packaging", price: "18" }
  ],
  
  rice: [
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
  ],
  
  pulses: [
    { value: "PP Bags", price: "8" },
    { value: "Jute Bags", price: "18" },
    { value: "LDPE Bags", price: "10" },
    { value: "HDPE Bags", price: "9" },
    { value: "Vacuum Packed", price: "22" },
    { value: "Paper Bags", price: "7" },
    { value: "Bulk Packaging", price: "5" },
    { value: "Retail Pouches", price: "12" }
  ],
  
  spices: [
    { value: "PP Pouches", price: "6" },
    { value: "Aluminum Pouches", price: "15" },
    { value: "Glass Jars", price: "18" },
    { value: "Plastic Jars", price: "12" },
    { value: "Vacuum Packed", price: "20" },
    { value: "Stand-up Pouches", price: "10" },
    { value: "Bulk Bags", price: "8" },
    { value: "Retail Boxes", price: "14" }
  ],
  
  'dry fruits': [
    { value: "Vacuum Packed", price: "22" },
    { value: "PP Pouches", price: "8" },
    { value: "Aluminum Foil Bags", price: "16" },
    { value: "Glass Jars", price: "20" },
    { value: "Tin Cans", price: "18" },
    { value: "Stand-up Pouches", price: "12" },
    { value: "Bulk Bags", price: "10" },
    { value: "Gift Boxes", price: "25" }
  ],
  
  tea: [
    { value: "Tea Bags", price: "15" },
    { value: "Aluminum Pouches", price: "12" },
    { value: "Paper Bags", price: "8" },
    { value: "Tin Cans", price: "20" },
    { value: "Glass Jars", price: "18" },
    { value: "Vacuum Packed", price: "16" },
    { value: "Gift Boxes", price: "22" },
    { value: "Bulk Packaging", price: "6" }
  ],
  
  chocolate: [
    { value: "Foil Wrapping", price: "8" },
    { value: "Paper Boxes", price: "12" },
    { value: "Plastic Boxes", price: "10" },
    { value: "Gift Boxes", price: "18" },
    { value: "Bulk Packaging", price: "6" },
    { value: "Retail Bars", price: "9" },
    { value: "Truffle Boxes", price: "22" },
    { value: "Seasonal Packaging", price: "25" }
  ],
  
  default: [
    { value: "Standard Packaging", price: "10" },
    { value: "Bulk Packaging", price: "6" },
    { value: "Custom Packaging", price: "25" },
    { value: "Retail Packaging", price: "12" },
    { value: "Export Packaging", price: "18" }
  ]
};

// Define port prices
const portPrices = {
  "Mundra": 10.00,
  "Kandla": 12.00,
  "Nhava Sheva": 15.00,
  "Chennai": 18.00,
  "Vizag": 14.00,
  "Kolkata": 16.00,
  "Other": 20.00
};

const BuyModal = ({ isOpen, onClose, product, profile, industry }) => {
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
  const canvasRef = useRef(null);
  const countrySelectRef = useRef(null);

  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10 },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10 },
    { value: "+44", flag: "🇬🇧", name: "UK", length: 10 },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9 },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9 },
    { value: "+98", flag: "🇮🇷", name: "Iran", length: 10 },
  ];

  const cifOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
  ];

  // CIF default costs
  const CIF_DEFAULT_COSTS = {
    transport: 1.90,
    insurance: 0.11,
    freight: 0.50
  };

  // Load quantity options based on industry - NO DEFAULT SETTING
  useEffect(() => {
    if (isOpen && industry) {
      const industryKey = industry.toLowerCase();
      const options = industryQuantityOptions[industryKey] || industryQuantityOptions.default;
      setQuantityOptions(options);
      // Quantity remains empty by default - no default selection
    }
  }, [isOpen, industry]);

  // Load packing options based on industry - NO DEFAULT SETTING
  useEffect(() => {
    if (isOpen && industry) {
      const industryKey = industry.toLowerCase();
      const options = packingOptionsByType[industryKey] || packingOptionsByType.default;
      setPackingOptions(options);
      // Packing remains empty by default - no default selection
    }
  }, [isOpen, industry]);

  // Load grades based on industry and product
  useEffect(() => {
    if (isOpen && product && industry) {
      let industryGradesList = [];
      
      if (industry === 'Rice') {
        const variety = product.variety || product.name || '';
        if (variety) {
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
          )].sort((a, b) => a.value.localeCompare(b.value));
          
          industryGradesList = uniqueGrades;
        }
      } else {
        const industryKey = industry.toLowerCase();
        industryGradesList = industryGrades[industryKey] || industryGrades.default;
      }
      
      setGrades(industryGradesList);
      
      if (industryGradesList.length === 1) {
        setGrade(industryGradesList[0].value);
      } else {
        setGrade("");
      }
    } else {
      setGrades([]);
      setGrade("");
    }
  }, [isOpen, product, industry]);

  // Update packing price when packing changes
  useEffect(() => {
    if (packing) {
      const selectedPacking = packingOptions.find(option => option.value === packing);
      setPackingPrice(selectedPacking ? parseFloat(selectedPacking.price) : 0.00);
    } else {
      setPackingPrice(0.00);
    }
  }, [packing, packingOptions]);

  // Prefill form fields with profile data
  useEffect(() => {
    if (isOpen && profile) {
      const nameValue = profile.fullName || profile.displayName || profile.name || "";
      setFullName(nameValue);
      setEmail(profile.email || "");
      if (profile.phone) {
        const phoneParts = profile.phone.split(" ");
        if (phoneParts.length > 1) {
          setCountryCode(phoneParts[0]);
          setPhoneNumber(phoneParts.slice(1).join(" ").replace(/\D/g, ""));
        } else {
          setCountryCode("+91");
          setPhoneNumber(profile.phone.replace(/\D/g, ""));
        }
      }
    }
  }, [isOpen, profile]);

  // Ensure country select is focusable
  useEffect(() => {
    if (isOpen && !profile && countrySelectRef.current) {
      countrySelectRef.current.focus();
    }
  }, [isOpen, profile]);

  // Update port price when port changes
  useEffect(() => {
    setPortPrice(port ? portPrices[port] || 0.00 : 0.00);
  }, [port]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const handleCountryChange = (e) => {
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

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    
    if (value !== "Custom Quantity") {
      setCustomQuantity("");
    }
  };

  const handlePackingChange = (e) => {
    setPacking(e.target.value);
  };

  // Helper function to convert all quantities to base units
  const convertToBaseUnit = (quantityStr) => {
    if (!quantityStr) return { value: 0, unit: 'kg' };
    
    const match = quantityStr.match(/^(\d+\.?\d*)\s*(kg|g|ton|liter|ml|l|piece|dozen|bouquet)s?$/i);
    if (match) {
      let value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      switch(unit) {
        case 'g':
          value = value / 1000;
          break;
        case 'ton':
          value = value * 1000;
          break;
        case 'ml':
          value = value / 1000;
          break;
        case 'dozen':
          value = value * 12;
          break;
        default:
          break;
      }
      
      return { value, unit: ['g', 'kg', 'ton'].includes(unit) ? 'kg' : 
                        ['ml', 'liter', 'l'].includes(unit) ? 'liter' : 'piece' };
    }
    
    return { value: 0, unit: 'kg' };
  };

  // Calculate estimated bill
  const calculateEstimatedBill = () => {
    let basePrice = 0;
    let quantityInBaseUnit = 0;
    let quantityPrice = 0;
    let transportCostNum = 0;
    let insuranceCostNum = 0;
    let freightCostNum = 0;

    if (industry === 'Rice' && product && grade) {
      const productData = riceData.find(
        (item) => item.variety === product.variety && item.grade === grade
      );
      if (productData) {
        basePrice = parseFloat((productData.price_inr / 83).toFixed(2));
      }
    } else if (grade) {
      const selectedGrade = grades.find((g) => g.value === grade);
      basePrice = selectedGrade ? parseFloat(selectedGrade.price) : 0;
    }

    let finalQuantityToUse = quantity === "Custom Quantity" ? customQuantity : quantity;
    const { value: quantityValue, unit: quantityUnit } = convertToBaseUnit(finalQuantityToUse);
    quantityInBaseUnit = quantityValue;

    if (basePrice > 0 && quantityInBaseUnit > 0) {
      quantityPrice = (basePrice * quantityInBaseUnit).toFixed(2);
    }

    if (cifRequired === "yes") {
      transportCostNum = CIF_DEFAULT_COSTS.transport;
      insuranceCostNum = CIF_DEFAULT_COSTS.insurance;
      freightCostNum = CIF_DEFAULT_COSTS.freight;
    }
    
    const totalTransportPrice = transportCostNum;
    
    const total = (
      parseFloat(quantityPrice || 0) +
      parseFloat(packingPrice || 0) +
      parseFloat(portPrice || 0) +
      (cifRequired === "yes" ? transportCostNum + insuranceCostNum + freightCostNum : 0)
    ).toFixed(2);

    return {
      basePrice: basePrice.toFixed(2),
      quantity: quantityInBaseUnit,
      quantityUnit,
      quantityPrice,
      packingCost: packingPrice.toFixed(2),
      portPrice: portPrice.toFixed(2),
      transportCost: transportCostNum.toFixed(2),
      insuranceCost: insuranceCostNum.toFixed(2),
      freightCost: freightCostNum.toFixed(2),
      totalTransportPrice: totalTransportPrice.toFixed(2),
      cifRequired: cifRequired === "yes",
      total
    };
  };

  const estimatedBill = calculateEstimatedBill();

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
      console.error('Error saving quote to firebasegetquote database:', error);
      throw error;
    }
  };

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

    if (!packing || !port || !fullName || !cifRequired || !grade) {
      alert("Please fill all required fields.");
      return;
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

    const quoteData = {
      contactInfo: {
        fullName,
        email,
        phone: fullPhoneNumber,
        countryCode
      },
      productInfo: {
        industry: industry,
        category: product?.brand || "",
        productName: product?.name || "",
        variety: product?.variety || product?.name || "",
        grade: grade,
        gradePrice: gradePrice,
        packing,
        packingPrice: packingPrice.toFixed(2),
        quantity: finalQuantity,
        port,
        cifRequired: cifRequired === "yes",
        transportCost: cifRequired === "yes" ? CIF_DEFAULT_COSTS.transport.toFixed(2) : "0.00",
        insuranceCost: cifRequired === "yes" ? CIF_DEFAULT_COSTS.insurance.toFixed(2) : "0.00",
        freightCost: cifRequired === "yes" ? CIF_DEFAULT_COSTS.freight.toFixed(2) : "0.00",
        additionalInfo
      },
      estimatedBill: {
        basePrice: estimatedBill.basePrice,
        quantity: finalQuantity,
        quantityPrice: estimatedBill.quantityPrice,
        packingCost: estimatedBill.packingCost,
        portPrice: estimatedBill.portPrice,
        transportCost: estimatedBill.transportCost,
        insuranceCost: estimatedBill.insuranceCost,
        freightCost: estimatedBill.freightCost,
        totalTransportPrice: estimatedBill.totalTransportPrice,
        total: estimatedBill.total
      },
      timestamp: new Date().toISOString(),
      source: 'website',
      database: 'firebasegetquote'
    };

    try {
      const quoteId = await saveQuoteToFirebase(quoteData);
      const message = `Hello! I want a quote for:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Industry: ${industry}
- Product: ${product?.name || ""}
- Grade: ${grade}${gradePrice ? ` (Price: $${gradePrice})` : ''}
- Packing: ${packing} ($${packingPrice.toFixed(2)})
- Quantity: ${finalQuantity}
- Port: ${port}
- Port Cost: $${estimatedBill.portPrice}
- CIF Required: ${cifRequired === "yes" ? "Yes" : "No"}
${cifRequired === "yes" ? `- Transport Cost: $${estimatedBill.transportCost}` : ""}
${cifRequired === "yes" ? `- Insurance Cost: $${estimatedBill.insuranceCost}` : ""}
${cifRequired === "yes" ? `- Freight Cost: $${estimatedBill.freightCost}` : ""}
- Packing Cost: $${estimatedBill.packingCost}
- Estimated Total: $${estimatedBill.total}${cifRequired === "yes" ? " (CIF)" : ""}
- Quote ID: ${quoteId}
- Database: firebasegetquote
${additionalInfo ? `\n- Additional Info: ${additionalInfo}` : ""}
Thank you!`;
      
      window.open(
        `https://wa.me/+919703744571?text=${encodeURIComponent(message)}`,
        "_blank"
      );
      
      setShowThankYou(true);
    } catch (error) {
      const fallbackMessage = `Hello! I want a quote for:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Industry: ${industry}
- Product: ${product?.name || ""}
- Grade: ${grade}${gradePrice ? ` (Price: $${gradePrice})` : ''}
- Packing: ${packing} ($${packingPrice.toFixed(2)})
- Quantity: ${finalQuantity}
- Port: ${port}
- CIF Required: ${cifRequired === "yes" ? "Yes" : "No"}
${cifRequired === "yes" ? `- Transport Cost: $${estimatedBill.transportCost}` : ""}
${cifRequired === "yes" ? `- Insurance Cost: $${estimatedBill.insuranceCost}` : ""}
${cifRequired === "yes" ? `- Freight Cost: $${estimatedBill.freightCost}` : ""}
- Packing Cost: $${estimatedBill.packingCost}
- Estimated Total: $${estimatedBill.total}${cifRequired === "yes" ? " (CIF)" : ""}
- Database: firebasegetquote (save failed)
${additionalInfo ? `\n- Additional Info: ${additionalInfo}` : ""}
Thank you!`;
      
      window.open(
        `https://wa.me/+919703744571?text=${encodeURIComponent(fallbackMessage)}`,
        "_blank"
      );
      
      setShowThankYou(true);
      alert("Quote submitted to WhatsApp! There was an issue saving to firebasegetquote database, but your request has been sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPacking("");
    setQuantity("");
    setCustomQuantity("");
    setPort("");
    setGrade("");
    setCifRequired("");
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
    onClose();
  };

  const getCurrentCountry = () =>
    countryOptions.find((opt) => opt.value === countryCode);

  if (!isOpen) return null;

  return (
    <div className="buy-modal-overlay">
      <div className="buy-modal-container">
        <canvas ref={canvasRef} className="buy-modal-canvas" />
        <button
          className="buy-modal-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          &times;
        </button>
        <div className="buy-modal-header">
          <h2 className="buy-modal-title">Get Quote - {industry}</h2>
        </div>
        <div className="buy-modal-content flex">
          {/* Scrollable Form Section */}
          <div className="buy-modal-form-section w-1/2 pr-4 overflow-y-auto">
            <div className="buy-modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <section className="form-section">
                  <h3>Contact Information</h3>
                  <label>
                    Full Name *
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={handleFullNameChange}
                      required
                      className="input-field"
                      readOnly={!!profile}
                      disabled={isSubmitting}
                    />
                  </label>
                  <label>
                    Email Address *
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      className="input-field"
                      readOnly={!!profile}
                      disabled={isSubmitting}
                    />
                    {emailError && <div className="error-text">{emailError}</div>}
                  </label>
                  <label>
                    Phone Number *
                    <div className="phone-input-group flex w-full gap-2">
                      <select
                        ref={countrySelectRef}
                        value={countryCode}
                        onChange={handleCountryChange}
                        className="country-code-select flex-1 basis-1/4 min-w-[80px] input-field"
                        style={{ zIndex: 1002, position: 'relative' }}
                        disabled={isSubmitting}
                      >
                        {countryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.flag} {option.value}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder={`Enter phone number (${getCurrentCountry()?.length || 10} digits)`}
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        maxLength={getCurrentCountry()?.length || 10}
                        required
                        className="input-field flex-1 basis-3/4"
                        disabled={isSubmitting}
                      />
                    </div>
                    {phoneError && <div className="error-text">{phoneError}</div>}
                  </label>
                </section>
                <section className="form-section">
                  <h3>Product Information</h3>
                  <label>
                    Industry
                    <input
                      type="text"
                      value={industry || ""}
                      readOnly
                      className="input-field"
                    />
                  </label>
                  <label>
                    Category
                    <input
                      type="text"
                      value={product?.brand || ""}
                      readOnly
                      className="input-field"
                    />
                  </label>
                  <label>
                    Product
                    <input
                      type="text"
                      value={product?.name || ""}
                      readOnly
                      className="input-field"
                    />
                  </label>
                  <label>
                    Grade *
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="select-field"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Grade</option>
                      {grades.length > 0 ? (
                        grades.map((gradeOption, i) => (
                          <option key={i} value={gradeOption.value}>
                            {gradeOption.value}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading grades...</option>
                      )}
                    </select>
                    <small className="text-gray-400">
                      {industry === 'Rice' ? 'Specific rice grades based on variety' : 'Industry standard grades'}
                    </small>
                  </label>
                  <label>
                    Packing *
                    <select
                      value={packing}
                      onChange={handlePackingChange}
                      required
                      className="select-field"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Packing</option>
                      {packingOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Quantity *
                    <select
                      value={quantity}
                      onChange={handleQuantityChange}
                      required
                      className="select-field"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Quantity</option>
                      {quantityOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {quantity === "Custom Quantity" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Enter your custom quantity (e.g., 150 g, 3 kg, 10 pieces)"
                          value={customQuantity}
                          onChange={(e) => setCustomQuantity(e.target.value)}
                          className="input-field w-full"
                          disabled={isSubmitting}
                        />
                        <small className="text-gray-400">Enter quantity with unit (g, kg, liter, pieces, etc.)</small>
                      </div>
                    )}
                  </label>
                  <label>
                    Port of Loading *
                    <select
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      required
                      className="select-field"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Port</option>
                      <option value="Mundra">Mundra</option>
                      <option value="Kandla">Kandla</option>
                      <option value="Nhava Sheva">Nhava Sheva</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Vizag">Vizag</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Other">Other (Specify in Additional Info)</option>
                    </select>
                  </label>
                  <label>
                    CIF Required? *
                    <select
                      value={cifRequired}
                      onChange={(e) => setCifRequired(e.target.value)}
                      required
                      className="select-field"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Option</option>
                      {cifOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <small className="text-gray-400">
                      CIF includes shipping and insurance costs to your destination port
                    </small>
                  </label>
                  <label>
                    Additional Information
                    <textarea
                      placeholder="Any additional details or requirements"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="textarea-field"
                      disabled={isSubmitting}
                    />
                  </label>
                </section>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Get Quote"}
                </button>
              </form>
            </div>
          </div>
          {/* Fixed Estimated Bill Section */}
          <div className="buy-modal-bill-section w-1/2 pl-4 bg-white/5 rounded-lg">
            <div className="cost-breakdown-section p-6">
              <h4 className="text-lg font-semibold text-secondary mb-4">
                {cifRequired === "yes" ? "Estimated Bill (CIF)" : "Estimated Cost Breakdown"}
              </h4>
              
              {cifRequired === "yes" ? (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span>Grade Price:</span>
                      <span>${estimatedBill.basePrice} per unit</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Transport Price:</span>
                      <span>${estimatedBill.transportCost}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Packing Price:</span>
                      <span>${estimatedBill.packingCost}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Quantity Price:</span>
                      <span>${estimatedBill.quantityPrice}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Insurance Price:</span>
                      <span>${estimatedBill.insuranceCost}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Freight Price:</span>
                      <span>${estimatedBill.freightCost}</span>
                    </div>
                    
                    <div className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                      <span className="font-medium">Total Transport Price:</span>
                      <span className="font-medium">${estimatedBill.totalTransportPrice}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between font-bold mt-4 pt-4 border-t-2 border-gray-600">
                    <span>Total Price:</span>
                    <span className="text-lg">${estimatedBill.total} (CIF)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between mb-2">
                    <span>Product:</span>
                    <span>{product?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Grade:</span>
                    <span>{grade || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Quantity Price:</span>
                    <span>${estimatedBill.quantityPrice || '0.00'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Packing Price:</span>
                    <span>${estimatedBill.packingCost || '0.00'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Port Price:</span>
                    <span>${estimatedBill.portPrice || '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-4 pt-2 border-t border-gray-600">
                    <span>Total Estimated Cost:</span>
                    <span>${estimatedBill.total || '0.00'}</span>
                  </div>
                </>
              )}
              
              <p className="text-sm text-gray-400 mt-4">
                Note: This is an estimated cost. Actual costs may vary based on additional requirements and market conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ThankYouPopup
        isOpen={showThankYou}
        onClose={() => {
          setShowThankYou(false);
          onClose();
        }}
      />

      {/* Mobile Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .buy-modal-container {
            width: 100%;
            max-height: 100vh;
            border-radius: 0;
            margin: 0;
          }
          
          .buy-modal-content {
            flex-direction: column;
            height: calc(100vh - 120px);
            overflow: hidden;
          }
          
          .buy-modal-form-section {
            width: 100%;
            padding-right: 0;
            max-height: 60vh;
            overflow-y: auto;
          }
          
          .buy-modal-bill-section {
            width: 100%;
            padding-left: 0;
            padding-top: 16px;
            max-height: 40vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default BuyModal;