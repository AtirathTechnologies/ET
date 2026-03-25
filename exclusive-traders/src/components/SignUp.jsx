// SignUp.jsx - Saves user data to users collection with pending status
import { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { ref, set, get } from "firebase/database";

const SignUp = ({ navigateToPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  // Country starts empty (no default)
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("displayName");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength indicators
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Refs for each input field
  const displayNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const pincodeRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const formRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);

  // Country options for phone code
  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10 },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10 },
    { value: "+44", flag: "🇬🇧", name: "UK", length: 10 },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9 },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9 },
    { value: "+98", flag: "🇮🇷", name: "Iran", length: 10 },
    { value: "+968", flag: "🇴🇲", name: "Oman", length: 8 },
    { value: "+49", flag: "🇩🇪", name: "Germany", length: 10 },
    { value: "+33", flag: "🇫🇷", name: "France", length: 9 },
    { value: "+65", flag: "🇸🇬", name: "Singapore", length: 8 },
    { value: "+81", flag: "🇯🇵", name: "Japan", length: 10 },
    { value: "+86", flag: "🇨🇳", name: "China", length: 11 },
    { value: "+1", flag: "🇨🇦", name: "Canada", length: 10 }
  ];

  // Comprehensive country, state, and city data (keep your existing huge object)
  const locationData = {
    "India": {
      states: {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur", "Solapur", "Amravati", "Nanded"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
        "Karnataka": ["Bengaluru", "Mysore", "Mangalore", "Hubli", "Belgaum", "Gulbarga", "Davanagere", "Bellary"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Noida", "Ghaziabad", "Meerut"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Jaisalmer"],
        "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Darjeeling"],
        "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
        "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur"],
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
        "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
        "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Nainital"],
        "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu", "Mandi", "Solan"],
        "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Pulwama"],
        "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"],
        "Other": ["Other"]
      }
    },
    "United Kingdom": {
      states: {
        "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", "Bristol", "Newcastle", "Nottingham", "Southampton", "Oxford", "Cambridge"],
        "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Stirling", "Perth"],
        "Wales": ["Cardiff", "Swansea", "Newport", "Bangor", "Wrexham", "St Davids"],
        "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Armagh", "Enniskillen"],
        "Other": ["Other"]
      }
    },
    "United States": {
      states: {
        "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover"],
        "Alaska": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla"],
        "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale"],
        "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "Conway"],
        "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno", "Long Beach", "Oakland", "Bakersfield", "Anaheim"],
        "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder", "Pueblo"],
        "Connecticut": ["Bridgeport", "New Haven", "Stamford", "Hartford", "Waterbury", "Danbury"],
        "Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford"],
        "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale", "St. Petersburg", "Hialeah"],
        "Georgia": ["Atlanta", "Augusta", "Savannah", "Athens", "Macon", "Columbus"],
        "Hawaii": ["Honolulu", "Hilo", "Kailua", "Pearl City", "Waipahu", "Kaneohe"],
        "Idaho": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell"],
        "Illinois": ["Chicago", "Aurora", "Naperville", "Springfield", "Peoria", "Rockford"],
        "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Bloomington"],
        "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo"],
        "Kansas": ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe", "Lawrence"],
        "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Frankfort"],
        "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner"],
        "Maine": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Brunswick"],
        "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Annapolis"],
        "Massachusetts": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton"],
        "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing"],
        "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Bloomington", "Duluth", "Brooklyn Park"],
        "Mississippi": ["Jackson", "Gulfport", "Southaven", "Biloxi", "Hattiesburg", "Meridian"],
        "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit"],
        "Montana": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena"],
        "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont"],
        "Nevada": ["Las Vegas", "Reno", "Henderson", "Carson City", "Sparks", "North Las Vegas"],
        "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Dover", "Rochester"],
        "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Trenton"],
        "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces", "Rio Rancho", "Roswell", "Farmington"],
        "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Yonkers"],
        "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville"],
        "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston"],
        "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"],
        "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond"],
        "Oregon": ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Bend"],
        "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton"],
        "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "Woonsocket"],
        "South Carolina": ["Charleston", "Columbia", "Greenville", "Spartanburg", "Rock Hill", "Mount Pleasant"],
        "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell"],
        "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro"],
        "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi"],
        "Utah": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy"],
        "Vermont": ["Burlington", "Essex", "South Burlington", "Colchester", "Rutland", "Bennington"],
        "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria"],
        "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent"],
        "West Virginia": ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling", "Weirton"],
        "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton"],
        "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan"],
        "Other": ["Other"]
      }
    },
    "UAE": {
      states: {
        "Dubai": ["Dubai City", "Jebel Ali", "Hatta", "Deira", "Bur Dubai", "Al Barsha"],
        "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Madinat Zayed", "Ruwais", "Liwa", "Al Dhafra"],
        "Sharjah": ["Sharjah City", "Khor Fakkan", "Kalba", "Dibba Al-Hisn", "Al Hamriyah", "Al Dhaid"],
        "Ajman": ["Ajman City", "Masfout", "Al Manama", "Al Hamidiyah", "Al Rumailah"],
        "Ras Al Khaimah": ["Ras Al Khaimah City", "Al Jazirah Al Hamra", "Khatt", "Masafi", "Dibba Al-Hisn"],
        "Fujairah": ["Fujairah City", "Dibba Al-Fujairah", "Masafi", "Al Badiyah", "Mirbah"],
        "Umm Al Quwain": ["Umm Al Quwain City", "Al Salamah", "Al Laba", "Al Rafaah", "Falaj Al Mualla"],
        "Other": ["Other"]
      }
    },
    "Australia": {
      states: {
        "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Coffs Harbour", "Wagga Wagga"],
        "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Mildura"],
        "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville", "Toowoomba", "Mackay"],
        "Western Australia": ["Perth", "Fremantle", "Bunbury", "Geraldton", "Kalgoorlie", "Albany"],
        "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Lincoln", "Port Augusta"],
        "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone", "Kingston"],
        "Australian Capital Territory": ["Canberra", "Belconnen", "Tuggeranong", "Gungahlin", "Weston Creek", "Woden Valley"],
        "Northern Territory": ["Darwin", "Palmerston", "Alice Springs", "Katherine", "Nhulunbuy", "Tennant Creek"],
        "Other": ["Other"]
      }
    },
    "Canada": {
      states: {
        "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London", "Windsor", "Kitchener", "Brampton"],
        "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Trois-Rivières"],
        "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Kelowna", "Abbotsford"],
        "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grand Prairie"],
        "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Portage la Prairie", "Thompson", "Winkler"],
        "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current", "Yorkton"],
        "Nova Scotia": ["Halifax", "Dartmouth", "Sydney", "Truro", "New Glasgow", "Glace Bay"],
        "New Brunswick": ["Moncton", "Saint John", "Fredericton", "Dieppe", "Miramichi", "Edmundston"],
        "Newfoundland and Labrador": ["St. John's", "Mount Pearl", "Corner Brook", "Grand Falls-Windsor", "Gander"],
        "Prince Edward Island": ["Charlottetown", "Summerside", "Stratford", "Cornwall", "Montague"],
        "Northwest Territories": ["Yellowknife", "Hay River", "Inuvik", "Fort Smith", "Behchoko"],
        "Yukon": ["Whitehorse", "Dawson City", "Watson Lake", "Haines Junction", "Carmacks"],
        "Nunavut": ["Iqaluit", "Rankin Inlet", "Arviat", "Baker Lake", "Cambridge Bay"],
        "Other": ["Other"]
      }
    },
    "Germany": {
      states: {
        "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Würzburg", "Ingolstadt", "Fürth"],
        "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Bonn", "Duisburg", "Bochum"],
        "Baden-Württemberg": ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg", "Ulm"],
        "Berlin": ["Berlin", "Mitte", "Charlottenburg", "Kreuzberg", "Pankow"],
        "Hamburg": ["Hamburg", "Altona", "Eimsbüttel", "Harburg", "Wandsbek"],
        "Hesse": ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach", "Hanau"],
        "Saxony": ["Leipzig", "Dresden", "Chemnitz", "Zwickau", "Plauen", "Görlitz"],
        "Lower Saxony": ["Hanover", "Braunschweig", "Osnabrück", "Oldenburg", "Göttingen", "Wolfsburg"],
        "Other": ["Other"]
      }
    },
    "France": {
      states: {
        "Île-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Montreuil", "Argenteuil", "Versailles"],
        "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Villeurbanne", "Valence"],
        "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes"],
        "Occitanie": ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Narbonne"],
        "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle", "Angoulême"],
        "Hauts-de-France": ["Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkerque", "Calais"],
        "Grand Est": ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy", "Colmar"],
        "Other": ["Other"]
      }
    },
    "Singapore": {
      states: {
        "Central Region": ["Downtown Core", "Orchard", "Outram", "River Valley", "Singapore River", "Marina Bay"],
        "East Region": ["Bedok", "Tampines", "Pasir Ris", "Changi", "Simei", "Eunos"],
        "North Region": ["Woodlands", "Sembawang", "Yishun", "Mandai", "Simpang", "Admiralty"],
        "North-East Region": ["Ang Mo Kio", "Hougang", "Serangoon", "Punggol", "Sengkang", "Bishan"],
        "West Region": ["Jurong East", "Jurong West", "Bukit Batok", "Bukit Panjang", "Choa Chu Kang", "Clementi"],
        "Other": ["Other"]
      }
    },
    "Japan": {
      states: {
        "Tokyo": ["Shinjuku", "Shibuya", "Chiyoda", "Minato", "Shinagawa", "Taito", "Sumida"],
        "Osaka": ["Osaka City", "Sakai", "Higashiosaka", "Hirakata", "Toyonaka", "Takatsuki"],
        "Kanagawa": ["Yokohama", "Kawasaki", "Sagamihara", "Fujisawa", "Yokosuka", "Kamakura"],
        "Aichi": ["Nagoya", "Toyota", "Okazaki", "Ichinomiya", "Kasugai", "Toyohashi"],
        "Hokkaido": ["Sapporo", "Hakodate", "Asahikawa", "Obihiro", "Kushiro", "Otaru"],
        "Fukuoka": ["Fukuoka City", "Kitakyushu", "Kurume", "Omuta", "Kasuga", "Chikushino"],
        "Kyoto": ["Kyoto City", "Uji", "Kameoka", "Nagaokakyo", "Muko", "Joyo"],
        "Other": ["Other"]
      }
    },
    "China": {
      states: {
        "Beijing": ["Beijing City", "Chaoyang", "Haidian", "Fengtai", "Daxing", "Tongzhou"],
        "Shanghai": ["Shanghai City", "Pudong", "Minhang", "Baoshan", "Jiading", "Songjiang"],
        "Guangdong": ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhongshan", "Zhuhai"],
        "Zhejiang": ["Hangzhou", "Ningbo", "Wenzhou", "Shaoxing", "Jiaxing", "Jinhua"],
        "Jiangsu": ["Nanjing", "Suzhou", "Wuxi", "Changzhou", "Nantong", "Yangzhou"],
        "Sichuan": ["Chengdu", "Mianyang", "Deyang", "Nanchong", "Yibin", "Luzhou"],
        "Other": ["Other"]
      }
    },
    "Oman": {
      states: {
        "Muscat": ["Muscat City", "Seeb", "Muttrah", "Bawshar", "Amerat", "Qurum"],
        "Dhofar": ["Salalah", "Mirbat", "Taqah", "Raysut", "Mughsayl", "Thumrait"],
        "North Batinah": ["Sohar", "Shinas", "Saham", "Liwa", "Khaburah", "Suwaiq"],
        "South Batinah": ["Rustaq", "Barka", "Nakhal", "Musannah", "Wadi Al Maawil", "Awabi"],
        "North Sharqiyah": ["Ibra", "Bidiyah", "Al Mudhaibi", "Al Qabil", "Wadi Bani Khalid", "Dima"],
        "South Sharqiyah": ["Sur", "Jaalan Bani Bu Ali", "Jaalan Bani Bu Hassan", "Al Kamil Wal Wafi", "Bani Bu Hasan"],
        "Other": ["Other"]
      }
    },
    "Other": {
      states: {
        "Other": ["Other"]
      }
    }
  };

  const countryDropdownOptions = Object.keys(locationData);

  useEffect(() => {
    // Scroll form into view with header offset
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
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setIsStateDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setIsCityDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get states for selected country
  const getStatesForCountry = () => {
    if (!country || country === "Select Country") return [];
    const countryData = locationData[country];
    return countryData ? Object.keys(countryData.states) : [];
  };

  // Get cities for selected state
  const getCitiesForState = () => {
    if (!country || country === "Select Country" || !state) return [];
    const countryData = locationData[country];
    if (countryData && countryData.states[state]) {
      return countryData.states[state];
    }
    return [];
  };

  // Reset state and city when country changes
  useEffect(() => {
    setState("");
    setCity("");
    setIsStateDropdownOpen(false);
    setIsCityDropdownOpen(false);
  }, [country]);

  // Reset city when state changes
  useEffect(() => {
    setCity("");
    setIsCityDropdownOpen(false);
  }, [state]);

  // Check password strength - minimum 8 characters with required elements
  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [password]);

  // Get current country's phone number length
  const getCurrentCountryLength = () => {
    const country = countryOptions.find(opt => opt.value === countryCode);
    return country ? country.length : 10;
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const maxLength = getCurrentCountryLength();
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      setPhoneNumber(value);
    }
  };

  // --- Pincode requirements per country ---
  const getPincodeRequirements = (selectedCountry) => {
    if (!selectedCountry || selectedCountry === "Select Country") {
      return { min: 4, max: 10, pattern: /^[A-Z0-9\s-]{4,10}$/i, placeholder: "Postal code" };
    }
    switch (selectedCountry) {
      case "India":
        return { min: 6, max: 6, pattern: /^\d{6}$/, placeholder: "6-digit pincode" };
      case "United States":
        return { min: 5, max: 5, pattern: /^\d{5}$/, placeholder: "5-digit ZIP code" };
      case "United Kingdom":
        return { min: 5, max: 7, pattern: /^[A-Z0-9\s]{5,7}$/i, placeholder: "e.g., SW1A 1AA" };
      case "Canada":
        return { min: 6, max: 6, pattern: /^[A-Z0-9\s]{6}$/i, placeholder: "A1A 1A1" };
      case "Australia":
        return { min: 4, max: 4, pattern: /^\d{4}$/, placeholder: "4-digit postcode" };
      default:
        return { min: 4, max: 10, pattern: /^[A-Z0-9\s-]{4,10}$/i, placeholder: "Postal code" };
    }
  };

  const pincodeReq = getPincodeRequirements(country);

  const isValidPincode = (code) => {
    if (!code) return false;
    const trimmed = code.trim();
    return pincodeReq.pattern.test(trimmed) && trimmed.length >= pincodeReq.min && trimmed.length <= pincodeReq.max;
  };

  // Reset pincode when country changes
  useEffect(() => {
    setPincode("");
  }, [country]);

  // Handle pincode change
  const handlePincodeChange = (e) => {
    const value = e.target.value;
    setPincode(value);
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle country change and update country code
  const handleCountryChange = (selectedCountry) => {
    setCountry(selectedCountry);
    setIsCountryDropdownOpen(false);
    if (selectedCountry === "India") setCountryCode("+91");
    else if (selectedCountry === "United States") setCountryCode("+1");
    else if (selectedCountry === "United Kingdom") setCountryCode("+44");
    else if (selectedCountry === "UAE") setCountryCode("+971");
    else if (selectedCountry === "Australia") setCountryCode("+61");
    else if (selectedCountry === "Canada") setCountryCode("+1");
    else if (selectedCountry === "Oman") setCountryCode("+968");
    else if (selectedCountry === "Germany") setCountryCode("+49");
    else if (selectedCountry === "France") setCountryCode("+33");
    else if (selectedCountry === "Singapore") setCountryCode("+65");
    else if (selectedCountry === "Japan") setCountryCode("+81");
    else if (selectedCountry === "China") setCountryCode("+86");
    else setCountryCode("+1");
  };

  // Handle Enter key press to move to next field
  const handleKeyDown = (e, nextField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextFieldMap = {
        'displayName': () => {
          if (emailRef.current) {
            emailRef.current.focus();
            setActiveField('email');
          }
        },
        'email': () => {
          if (phoneNumberRef.current) {
            phoneNumberRef.current.focus();
            setActiveField('phoneNumber');
          }
        },
        'phoneNumber': () => {
          setIsCountryDropdownOpen(true);
          setActiveField('country');
        },
        'country': () => {
          if (getStatesForCountry().length > 0) {
            setIsStateDropdownOpen(true);
            setActiveField('state');
          }
        },
        'state': () => {
          if (getCitiesForState().length > 0) {
            setIsCityDropdownOpen(true);
            setActiveField('city');
          }
        },
        'city': () => {
          if (pincodeRef.current) {
            pincodeRef.current.focus();
            setActiveField('pincode');
          }
        },
        'pincode': () => {
          if (passwordRef.current) {
            passwordRef.current.focus();
            setActiveField('password');
          }
        },
        'password': () => {
          if (confirmPasswordRef.current) {
            confirmPasswordRef.current.focus();
            setActiveField('confirmPassword');
          }
        },
        'confirmPassword': () => {
          if (isFormValid() && !loading) {
            handleSubmit(e);
          }
        }
      };
      if (nextFieldMap[nextField]) {
        nextFieldMap[nextField]();
      }
    }
  };

  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  // Check if password is strong enough
  const isPasswordStrong = () => {
    return (
      password.length >= 8 &&
      passwordChecks.uppercase &&
      passwordChecks.lowercase &&
      passwordChecks.number &&
      passwordChecks.special
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate password match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      if (!isPasswordStrong()) {
        throw new Error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
      }

      // Validate country selection
      if (!country || country === "Select Country") {
        throw new Error("Please select your country");
      }

      // Validate state/province
      if (!state) {
        throw new Error("Please select your state or province");
      }

      // Validate city/town
      if (!city) {
        throw new Error("Please select your city or town");
      }

      // Validate pincode with country rules
      if (!pincode.trim()) {
        throw new Error("Please enter your pincode or ZIP code");
      }
      if (!isValidPincode(pincode)) {
        throw new Error(`Invalid format for ${country}. ${pincodeReq.placeholder} required.`);
      }

      // Validate phone number
      const requiredLength = getCurrentCountryLength();
      if (phoneNumber.length !== requiredLength) {
        const country = countryOptions.find(opt => opt.value === countryCode);
        throw new Error(`Phone number must be exactly ${requiredLength} digits for ${country?.name || 'selected country'}`);
      }

      // Validate email format
      if (!email) {
        throw new Error("Please enter your email address");
      }
      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address (e.g., name@domain.com)");
      }

      // Validate display name
      if (!displayName.trim()) {
        throw new Error("Please enter your full name");
      }

      // BLOCK admin email
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail === "admin@exclusivetrader.com") {
        throw new Error("This email is reserved for system administrators.");
      }

      // Check if email already exists in users collection
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const existingUser = Object.values(users).find(user => 
          user.email && user.email.toLowerCase() === normalizedEmail
        );
        if (existingUser) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }
      }

      // Generate a unique temporary ID for the user data (pending status)
      const tempUserId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullPhone = `${countryCode} ${phoneNumber}`;

      // Store user data in users collection with pending status
      const userRef = ref(db, `users/${tempUserId}`);
      await set(userRef, {
        email: normalizedEmail,
        password: password, // stored temporarily for verification on signin
        displayName: displayName.trim(),
        fullName: displayName.trim(),
        country: country,
        state: state,
        city: city,
        pincode: pincode.trim(),
        phone: fullPhone,
        phoneNumber: {
          countryCode,
          number: phoneNumber,
          fullNumber: fullPhone
        },
        address: {
          country,
          state: state,
          city: city,
          pincode: pincode.trim()
        },
        role: "user",
        isAdmin: false,
        isVerified: false,
        isActive: true,
        accountStatus: "pending", // Pending – Firebase Auth not created yet
        createdAt: new Date().toISOString(),
        tempUserId: tempUserId
      });

      console.log("✅ User data saved with pending status – Firebase Auth will be created after first sign-in");

      // Clear any existing remembered credentials
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');

      // Redirect to signin page with NO pre-filled data
      setError("");
      setTimeout(() => {
        navigateToPage("signin"); // no email passed
      }, 500);

    } catch (err) {
      console.error("❌ Sign up error:", err);
      setError(err.message || "Failed to save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get placeholder text for phone
  const getPhonePlaceholder = () => {
    const country = countryOptions.find(opt => opt.value === countryCode);
    const length = country ? country.length : 10;
    return `${length}-digit phone number`;
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const states = getStatesForCountry();
    const cities = getCitiesForState();
    return (
      displayName.trim() &&
      email &&
      isValidEmail(email) &&
      phoneNumber.length === getCurrentCountryLength() &&
      country &&
      country !== "Select Country" &&
      state &&
      states.includes(state) &&
      city &&
      cities.includes(city) &&
      isValidPincode(pincode) &&
      isPasswordStrong() &&
      password === confirmPassword
    );
  };

  const states = getStatesForCountry();
  const cities = getCitiesForState();

  // Calculate password strength percentage
  const getPasswordStrength = () => {
    const checks = Object.values(passwordChecks);
    const passedCount = checks.filter(check => check).length;
    return (passedCount / checks.length) * 100;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <section className="min-h-screen pt-16 pb-8 px-4 bg-dark" ref={formRef}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl text-secondary mb-4 text-shadow-black">
            Create Account
          </h1>
          <p className="text-light text-sm">Join Exclusive Trader community</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-dark/80 p-6 rounded-lg border border-secondary shadow-neon backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2 text-sm"></i>
                <span className="font-medium text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Full Name *</label>
            <input
              ref={displayNameRef}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'displayName')}
              onFocus={() => handleFocus('displayName')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'displayName' ? 'border-secondary' : 'border-gray-600'
              }`}
              placeholder="Enter your full name"
              required
              disabled={loading}
              autoComplete="name"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to email</span>
              <span>{displayName.trim() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Email Address *</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'email')}
              onFocus={() => handleFocus('email')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'email' ? 'border-secondary' : 'border-gray-600'
              } ${email && isValidEmail(email) ? 'border-green-500' : ''}`}
              placeholder="Enter your email (e.g., name@domain.com)"
              required
              disabled={loading}
              autoComplete="email"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to phone number</span>
              <span className={email && isValidEmail(email) ? 'text-green-400' : ''}>
                {email && isValidEmail(email) ? '✓' : ''}
              </span>
            </div>
            {email && !isValidEmail(email) && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <i className="fas fa-exclamation-triangle mr-1 text-xs"></i>
                Please enter a valid email
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Phone Number *</label>
            <div className="flex gap-2">
              <div className="relative w-32">
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setPhoneNumber("");
                  }}
                  onFocus={() => handleFocus('countryCode')}
                  className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none appearance-none cursor-pointer text-sm ${
                    activeField === 'countryCode' ? 'border-secondary' : 'border-gray-600'
                  }`}
                  disabled={loading}
                >
                  {countryOptions.map((country) => (
                    <option key={country.value} value={country.value} className="bg-dark">
                      {country.flag} {country.value}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                </div>
              </div>
              <div className="flex-1">
                <input
                  ref={phoneNumberRef}
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onKeyDown={(e) => handleKeyDown(e, 'phoneNumber')}
                  onFocus={() => handleFocus('phoneNumber')}
                  className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                    activeField === 'phoneNumber' ? 'border-secondary' : 'border-gray-600'
                  }`}
                  placeholder={getPhonePlaceholder()}
                  required
                  maxLength={getCurrentCountryLength()}
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to country</span>
              <span>{phoneNumber.length === getCurrentCountryLength() ? '✓' : ''}</span>
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="mb-3 relative" ref={countryDropdownRef}>
            <label className="block text-light mb-1 font-medium text-sm">Country *</label>
            <div
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light cursor-pointer flex justify-between items-center text-sm ${
                activeField === 'country' ? 'border-secondary' : 'border-gray-600'
              }`}
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              onKeyDown={(e) => handleKeyDown(e, 'country')}
              onFocus={() => handleFocus('country')}
              tabIndex={0}
              role="button"
            >
              <span className={!country ? "text-gray-500" : "text-light"}>
                {country || "Select Country"}
              </span>
              <i className={`fas fa-chevron-${isCountryDropdownOpen ? 'up' : 'down'} text-gray-400 text-xs transition-transform`}></i>
            </div>
            {isCountryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-dark border border-secondary rounded-lg max-h-60 overflow-y-auto shadow-lg">
                {countryDropdownOptions.map((countryOption) => (
                  <div
                    key={countryOption}
                    className={`px-3 py-2 cursor-pointer hover:bg-secondary/20 text-light text-sm ${
                      country === countryOption ? 'bg-secondary/30' : ''
                    }`}
                    onClick={() => handleCountryChange(countryOption)}
                  >
                    {countryOption}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to state</span>
              <span>{country ? '✓' : ''}</span>
            </div>
          </div>

          {/* State/Province Dropdown */}
          <div className="mb-3 relative" ref={stateDropdownRef}>
            <label className="block text-light mb-1 font-medium text-sm">State/Province *</label>
            <div
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light cursor-pointer flex justify-between items-center text-sm ${
                !country 
                  ? 'opacity-50 cursor-not-allowed border-gray-600' 
                  : activeField === 'state' ? 'border-secondary' : 'border-gray-600'
              }`}
              onClick={() => {
                if (country && states.length > 0) {
                  setIsStateDropdownOpen(!isStateDropdownOpen);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, 'state')}
              onFocus={() => handleFocus('state')}
              tabIndex={country ? 0 : -1}
              role="button"
            >
              <span className={!state ? "text-gray-500" : "text-light"}>
                {!country 
                  ? "Select a country first" 
                  : state || "Select State/Province"}
              </span>
              {country && states.length > 0 && (
                <i className={`fas fa-chevron-${isStateDropdownOpen ? 'up' : 'down'} text-gray-400 text-xs transition-transform`}></i>
              )}
            </div>
            {isStateDropdownOpen && states.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-dark border border-secondary rounded-lg max-h-60 overflow-y-auto shadow-lg">
                {states.map((stateOption) => (
                  <div
                    key={stateOption}
                    className={`px-3 py-2 cursor-pointer hover:bg-secondary/20 text-light text-sm ${
                      state === stateOption ? 'bg-secondary/30' : ''
                    }`}
                    onClick={() => {
                      setState(stateOption);
                      setIsStateDropdownOpen(false);
                    }}
                  >
                    {stateOption}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to city</span>
              <span>{state ? '✓' : ''}</span>
            </div>
          </div>

          {/* City/Town Dropdown */}
          <div className="mb-3 relative" ref={cityDropdownRef}>
            <label className="block text-light mb-1 font-medium text-sm">City/Town *</label>
            <div
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light cursor-pointer flex justify-between items-center text-sm ${
                !state 
                  ? 'opacity-50 cursor-not-allowed border-gray-600' 
                  : activeField === 'city' ? 'border-secondary' : 'border-gray-600'
              }`}
              onClick={() => {
                if (state && cities.length > 0) {
                  setIsCityDropdownOpen(!isCityDropdownOpen);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, 'city')}
              onFocus={() => handleFocus('city')}
              tabIndex={state ? 0 : -1}
              role="button"
            >
              <span className={!city ? "text-gray-500" : "text-light"}>
                {!state 
                  ? "Select a state first" 
                  : city || "Select City/Town"}
              </span>
              {state && cities.length > 0 && (
                <i className={`fas fa-chevron-${isCityDropdownOpen ? 'up' : 'down'} text-gray-400 text-xs transition-transform`}></i>
              )}
            </div>
            {isCityDropdownOpen && cities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-dark border border-secondary rounded-lg max-h-60 overflow-y-auto shadow-lg">
                {cities.map((cityOption) => (
                  <div
                    key={cityOption}
                    className={`px-3 py-2 cursor-pointer hover:bg-secondary/20 text-light text-sm ${
                      city === cityOption ? 'bg-secondary/30' : ''
                    }`}
                    onClick={() => {
                      setCity(cityOption);
                      setIsCityDropdownOpen(false);
                    }}
                  >
                    {cityOption}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to pincode</span>
              <span>{city ? '✓' : ''}</span>
            </div>
          </div>

          {/* Pincode/ZIP Code with country rules */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Pincode/ZIP Code *</label>
            <input
              ref={pincodeRef}
              type="text"
              value={pincode}
              onChange={handlePincodeChange}
              onKeyDown={(e) => handleKeyDown(e, 'pincode')}
              onFocus={() => handleFocus('pincode')}
              className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm ${
                activeField === 'pincode' ? 'border-secondary' : 'border-gray-600'
              } ${isValidPincode(pincode) ? 'border-green-500' : ''}`}
              placeholder={pincodeReq.placeholder}
              required
              maxLength={pincodeReq.max}
              disabled={loading}
              autoComplete="postal-code"
            />
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>Press Enter to go to password</span>
              <span className={isValidPincode(pincode) ? 'text-green-400' : ''}>
                {isValidPincode(pincode) ? '✓' : ''}
              </span>
            </div>
            {pincode && !isValidPincode(pincode) && (
              <p className="text-yellow-400 text-xs mt-1 flex items-center">
                <i className="fas fa-info-circle mr-1 text-xs"></i>
                {pincodeReq.placeholder}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-light mb-1 font-medium text-sm">Password *</label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'password')}
                onFocus={() => handleFocus('password')}
                className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm pr-10 ${
                  activeField === 'password' ? 'border-secondary' : 'border-gray-600'
                } ${isPasswordStrong() ? 'border-green-500' : ''}`}
                placeholder="Enter password (min. 8 characters)"
                required
                disabled={loading}
                autoComplete="new-password"
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
            
  {/* Password strength alert (MOVED HERE) */}
  {password && !isPasswordStrong() && (
    <p className="text-yellow-400 text-xs mt-1 flex items-center">
      <i className="fas fa-info-circle mr-1 text-xs"></i>
      Password needs to be stronger
    </p>
  )}

  {password && (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-light/70">Password strength:</span>
        <span className="text-xs font-medium">
          {passwordStrength < 40 ? 'Weak' : passwordStrength < 80 ? 'Medium' : 'Strong'}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 80 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${passwordStrength}%` }}
        ></div>
      </div>
    </div>
  )}
            <div className="mt-1 text-xs text-light/70 flex justify-between">
              <span>
                {password.length === 0 
                  ? "8+ characters required" 
                  : `${password.length} characters`}
              </span>
              <span>{isPasswordStrong() ? '✓' : ''}</span>
            </div>
            {password && !isPasswordStrong() && (
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center ${passwordChecks.length ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.length ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.uppercase ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Uppercase</span>
                </div>
                <div className={`flex items-center ${passwordChecks.lowercase ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.lowercase ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Lowercase</span>
                </div>
                <div className={`flex items-center ${passwordChecks.number ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.number ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Number</span>
                </div>
                <div className={`flex items-center ${passwordChecks.special ? 'text-green-400' : 'text-gray-400'}`}>
                  <i className={`fas fa-${passwordChecks.special ? 'check-circle' : 'circle'} mr-1 text-xs`}></i>
                  <span>Special char</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-light mb-1 font-medium text-sm">Confirm Password *</label>
            <div className="relative">
              <input
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'confirmPassword')}
                onFocus={() => handleFocus('confirmPassword')}
                className={`w-full px-3 py-2 bg-dark border rounded-lg text-light focus:outline-none transition-colors text-sm pr-10 ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : activeField === 'confirmPassword'
                    ? 'border-secondary'
                    : 'border-gray-600'
                } ${confirmPassword && password === confirmPassword && isPasswordStrong() ? 'border-green-500' : ''}`}
                placeholder="Confirm your password"
                required
                disabled={loading}
                autoComplete="new-password"
              />
               </div>

              <div className="mt-1 text-xs text-light/70 flex justify-between">
             <span>Press Enter to submit form</span>
            <span>{confirmPassword && password === confirmPassword && isPasswordStrong() ? '✓' : ''}</span>
            </div>

            {confirmPassword && password !== confirmPassword && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
             <i className="fas fa-exclamation-triangle mr-1 text-xs"></i>
            Passwords do not match
            </p>
               )}

          </div>

          {/* Info Message */}
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg text-xs">
            <div className="flex items-start">
              <i className="fas fa-info-circle mr-2 mt-0.5 text-sm"></i>
              <span>
                After signing up, you'll need to sign in with your credentials to activate your account.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`w-full bg-secondary text-dark font-bold py-2 rounded-lg transition-all duration-300 text-sm ${
              loading || !isFormValid()
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-accent hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin text-sm"></i>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-4 pt-4 border-t border-gray-700">
            <p className="text-light text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigateToPage("signin")}
                className="text-secondary font-medium hover:text-accent transition-colors"
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;