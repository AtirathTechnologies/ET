// src/components/Hero.jsx
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Partner images
import img1 from '../assets/partners/Atirath_Industries.png';
import img2 from '../assets/partners/Atirath.png';
import img3 from '../assets/partners/Dubai.png';
import img4 from '../assets/partners/Oman.png';
import img5 from '../assets/partners/Royalone.png';
import img6 from '../assets/partners/Siea.png';
import img7 from '../assets/partners/Tyago.png';
import img8 from '../assets/partners/metas.jpg';
import img9 from '../assets/partners/Sugana.png';

// Certification images (only for modal content, not for homepage)
import img10 from '../assets/Fssai.png';
import img11 from '../assets/IAF.png';
import img12 from '../assets/KAB.png';
import img13 from '../assets/MSME.jpeg';
import img14 from '../assets/UCS.png';

const Hero = ({ showInnovation }) => {
  const canvasRef = useRef();
  const labelRef = useRef();
  const animationRef = useRef();
  const scrollContainerRef = useRef();
  const scrollContentRef = useRef();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isScrollingPaused, setIsScrollingPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const scrollAnimationRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    setIsClient(true);
    
    // Check device type on mount and window resize
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Partner data with certification images (for modal only)
  const partners = [
    {
      id: 1,
      name: "Atirath Industries",
      logo: img1,
      description: "Leading manufacturer of industrial machinery and equipment with over 30 years of experience in heavy engineering.",
      services: "Heavy Machinery Manufacturing, Industrial Automation, Plant Setup",
      location: "Mumbai, India",
      established: "1992",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ], 
    },
    {
      id: 2,
      name: "Atirath Group",
      logo: img2,
      description: "Global conglomerate with diversified interests in infrastructure, energy, and technology sectors.",
      services: "Infrastructure Development, Renewable Energy Projects, Technology Solutions",
      location: "Dubai, UAE & Mumbai, India",
      established: "1985",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
    {
      id: 3,
      name: "Dubai Trading Hub",
      logo: img3,
      description: "Premier trading and logistics company specializing in Middle East and Asian markets.",
      services: "Commodity Trading, Logistics Solutions, Import/Export Services",
      location: "Dubai, UAE",
      established: "2005",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
    {
      id: 4,
      name: "Oman Global Solutions",
      logo: img4,
      description: "Strategic partner for industrial projects and energy solutions in the Middle East region.",
      services: "Oil & Gas Support, Industrial Solutions, Project Management",
      location: "Muscat, Oman",
      established: "2010",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
    {
      id: 5,
      name: "Royal One",
      logo: img5,
      description: "Basmati Prices & Export — Pure, Fresh, Trusted Rice From India.",
      services: "Importing & Exporting Basmati & Non-Basmati rice",
      location: "Office no.302/A third floor rail vihar near DPS public school Indrapuram Ghaziabad NCR Delhi Uttar Pradesh-201014",
      established: "2015",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
    {
      id: 6,
      name: "SIEA Group",
      logo: img6,
      description: "Basmati Prices & Export — Pure, Fresh, Trusted Rice From India.",
      services: "Importing & Exporting Basmati & Non-Basmati Rice",
      location: "Office no.302/A third floor rail vihar near DPS public school Indrapuram, Ghaziabad NCR Delhi Uttar Pradesh-201014",
      established: "2014",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
    {
      id: 7,
      name: "Tyago Industries",
      logo: img7,
      description: "Global leader in precision engineering and advanced manufacturing technologies.",
      services: "Precision Engineering, Aerospace Components, Automotive Parts",
      location: "Tokyo, Japan & Detroit, USA",
      established: "1975",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
    {
      id: 8,
      name: "Metas Corporation",
      logo: img8,
      description: "Technology innovator providing digital transformation solutions for industrial sectors.",
      services: "Digital Transformation, IoT Solutions, AI Integration",
      location: "Silicon Valley, USA",
      established: "2012",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
    {
      id: 9,
      name: "Sugana Foods",
      logo: img9,
      description: "Milk Gro - Premium dairy and food products manufacturer with focus on quality and nutrition.",
      services: "Dairy Products, Food Processing, Quality Assurance",
      location: "Chennai, Tamil Nadu, India",
      established: "2000",
      certifications: [
        { img: img10, name: "FSSAI Certified" },
        { img: img11, name: "IAF Accredited" },
        { img: img12, name: "KAB Certified" },
        { img: img13, name: "MSME Registered" },
        { img: img14, name: "UCS Certified" }
      ],
    },
  ];

  // Scrolling images array - ONLY PARTNER LOGOS (9 images), NO certification logos
  const scrollImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

  // Three.js effect
  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });

    const updateRendererSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    updateRendererSize();

    // Adjust globe size based on device
    const globeSize = isMobile ? 1.8 : (isTablet ? 2.2 : 2.5);
    
    // Globe
    const geometry = new THREE.SphereGeometry(globeSize, isMobile ? 32 : 64, isMobile ? 32 : 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0000ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Particles - reduce count on mobile for performance
    const particleCount = isMobile ? 1500 : (isTablet ? 3000 : 5000);
    const particleGeo = new THREE.BufferGeometry();
    const particleMat = new THREE.PointsMaterial({ 
      color: 0x39ff14, 
      size: isMobile ? 0.015 : 0.02 
    });
    const particles = new Float32Array(particleCount * 3);
    for (let i = 0; i < particles.length; i += 3) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * Math.PI;
      const r = isMobile ? 2.2 : (isTablet ? 2.6 : 3);
      particles[i] = r * Math.sin(phi) * Math.cos(theta);
      particles[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particles[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Lights
    const light = new THREE.PointLight(0x39ff14, isMobile ? 1.5 : 2.5);
    light.position.set(5, 5, 5);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x0000ffff, isMobile ? 0.4 : 0.3);
    scene.add(ambientLight);

    camera.position.z = isMobile ? 4 : (isTablet ? 4.5 : 5);

    // Country markers - reduce size on mobile
    const countries = [
      { lat: 51.5, lon: -0.1, name: "United Kingdom" },
      { lat: 40.7, lon: -74.0, name: "United States" },
      { lat: 28.6, lon: 77.2, name: "India" },
      { lat: 25.2, lon: 55.3, name: "UAE" },
      { lat: 1.3, lon: 103.8, name: "Singapore" },
      { lat: 35.6, lon: 139.7, name: "Japan" },
      { lat: -33.9, lon: 151.2, name: "Australia" },
    ];

    const markers = [];
    countries.forEach((c) => {
      const phi = (90 - c.lat) * (Math.PI / 180);
      const theta = (c.lon + 180) * (Math.PI / 180);
      const radius = isMobile ? 2 : (isTablet ? 2.3 : 2.6);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const markerSize = isMobile ? 0.03 : 0.05;
      const markerGeo = new THREE.SphereGeometry(markerSize, 6, 6);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      marker.userData = { name: c.name };
      scene.add(marker);
      markers.push(marker);
    });

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      globe.rotation.y += isMobile ? 0.001 : 0.002;
      particleSystem.rotation.y += isMobile ? 0.0005 : 0.001;
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', updateRendererSize);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      if (!canvasRef.current || !labelRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers);

      if (intersects.length > 0) {
        labelRef.current.style.display = 'block';
        labelRef.current.style.left = event.clientX + 15 + 'px';
        labelRef.current.style.top = event.clientY - 10 + 'px';
        labelRef.current.textContent = intersects[0].object.userData.name;
      } else {
        labelRef.current.style.display = 'none';
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', updateRendererSize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationRef.current);
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      markers.forEach(m => { 
        if (m.geometry) m.geometry.dispose(); 
        if (m.material) m.material.dispose(); 
      });
      renderer.dispose();
    };
  }, [isClient, isMobile, isTablet]);

  // Handle mouse enter on scrolling container
  const handleMouseEnter = () => {
    setIsScrollingPaused(true);
  };

  // Handle mouse leave from scrolling container
  const handleMouseLeave = () => {
    setIsScrollingPaused(false);
  };

  // Smooth scrolling animation - FIXED VERSION
  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = 0;
    const scrollSpeed = isMobile ? 0.8 : (isTablet ? 1.0 : 1.2); // Slower, smoother speed
    
    const animateScroll = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      
      // Only update at ~60fps for smoother animation
      if (deltaTime >= 16) {
        if (!isScrollingPaused && scrollContentRef.current) {
          setScrollPosition(prev => {
            let newPosition = prev - scrollSpeed;
            
            // Calculate total content width
            const contentWidth = scrollContentRef.current?.scrollWidth || 0;
            const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
            
            // Reset position when scrolled beyond half of the duplicated content
            // We duplicate content 4 times, so reset after scrolling through 1/4 of total width
            if (Math.abs(newPosition) >= contentWidth / 4) {
              return 0;
            }
            
            return newPosition;
          });
        }
        lastTimestamp = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(animateScroll);
    };
    
    animationFrameId = requestAnimationFrame(animateScroll);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScrollingPaused, isMobile, isTablet]);

  const handleDiscoverInnovations = (e) => {
    e.preventDefault();
    showInnovation();
  };

  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
    setShowPartnerModal(true);
    setIsScrollingPaused(true); // Pause scrolling when modal opens
  };

  const closePartnerModal = () => {
    setShowPartnerModal(false);
    setSelectedPartner(null);
    setIsScrollingPaused(false); // Resume scrolling when modal closes
  };

  return (
    <section className="relative overflow-hidden text-white text-center min-h-screen flex flex-col justify-center bg-black/30">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source 
          src="https://assets.mixkit.co/videos/preview/mixkit-global-logistics-network-abstract-45878-small.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* 3D Globe Canvas */}
      {isClient && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70 -z-5" />}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60 -z-4"></div>

      {/* Tooltip */}
      <div 
        ref={labelRef} 
        className="absolute hidden z-50 bg-black/70 text-secondary px-3 py-1.5 rounded-lg border border-secondary text-shadow-neon pointer-events-none text-xs sm:text-sm"
      ></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-20 sm:pb-24 md:pb-32">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 text-shadow-black leading-tight">
          Revolutionizing Global Supply Chains<br />
          <span className="text-secondary text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl">with Futuristic Solutions</span>
        </h1>
        <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 text-white/90 font-light px-2 sm:px-0">
          Exclusive Trader delivers cutting-edge import/export and warehousing services, powered by AI and blockchain for unparalleled efficiency and transparency across the UK and globally.
        </p>
        <button
          onClick={handleDiscoverInnovations}
          className="px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 bg-secondary text-dark text-base sm:text-lg md:text-xl font-bold rounded-full hover:bg-accent transition-all duration-300 shadow-neon transform hover:scale-105 active:scale-95"
          style={{ minWidth: isMobile ? '200px' : 'auto' }}
        >
          Discover Our Innovations
        </button>
      </div>
      
      {/* TRUSTED PARTNERS (Only partner logos, no certifications on homepage) */}
      <div className="relative z-10 w-full bg-black/40 backdrop-blur-sm py-8 sm:py-10 md:py-12 border-t border-white/10">
        <h3 className="text-center text-white/80 text-xs sm:text-sm md:text-base lg:text-lg font-semibold mb-6 sm:mb-8 tracking-widest px-2">
          TRUSTED PARTNERS
        </h3>
        <div 
          className="overflow-hidden max-w-full mx-auto px-0"
          ref={scrollContainerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12"
            ref={scrollContentRef}
            style={{
              transform: `translateX(${scrollPosition}px)`,
              willChange: 'transform', // Optimize for smooth animations
              transition: isScrollingPaused ? 'transform 0.3s ease-out' : 'none', // Smooth stop/start
            }}
          >
            {[...scrollImages, ...scrollImages, ...scrollImages, ...scrollImages].map((img, i) => {
              // Find the partner for this image
              const originalIndex = i % 9; // Only 9 partners for scrolling
              const partnerIndex = originalIndex % partners.length;
              const partner = partners[partnerIndex];
              
              return (
                <div
                  key={i}
                  className="flex-shrink-0 px-1 sm:px-2 md:px-3 lg:px-4 group relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => handlePartnerClick(partner)}
                    aria-label={`View ${partner.name} details`}
                    className="cursor-pointer hover:scale-110 transition-transform duration-300 bg-transparent border-none p-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
                  >
                    <div className="relative">
                      <img
                        src={img}
                        alt={`${partner.name} logo`}
                        className={`${
                          isMobile ? 'h-10 sm:h-12' : 
                          isTablet ? 'h-14 md:h-16' : 
                          'h-16 lg:h-20 xl:h-24'
                        } w-auto object-contain drop-shadow-2xl brightness-90 group-hover:brightness-110 transition-all duration-300`}
                        loading="lazy"
                        onError={(e) => {
                          console.error(`Failed to load image: ${img}`);
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="${
                              isMobile ? 'h-10 sm:h-12' : 
                              isTablet ? 'h-14 md:h-16' : 
                              'h-16 lg:h-20 xl:h-24'
                            } w-20 sm:w-24 md:w-28 bg-gray-800 rounded-lg flex items-center justify-center">
                              <span class="text-xs sm:text-sm text-gray-400 text-center px-1">${partner.name}</span>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 sm:mb-2 px-2 sm:px-3 py-1 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20">
                        {partner.name}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Partner Information Modal */}
      {showPartnerModal && selectedPartner && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4"
          onClick={closePartnerModal}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div 
            className="relative rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-modal-appear"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #0a0f29 0%, #1a1f3c 50%, #0a0f29 100%)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.2), 0 0 60px rgba(0, 10, 255, 0.2)'
            }}
          >
            {/* Top Right Close Button */}
            <button
              onClick={closePartnerModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-white hover:text-white text-base sm:text-lg rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-90 group"
              style={{ 
                width: isMobile ? '32px' : '36px',
                height: isMobile ? '32px' : '36px',
                background: 'rgba(10, 15, 41, 0.9)',
                border: '2px solid rgba(34, 197, 94, 0.6)',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 'bold'
              }}
              aria-label="Close modal"
            >
              ✕
              <span className="absolute -top-1 -right-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#22c55e' }}>
                ✓
              </span>
            </button>
            
            {/* Modal Content */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Partner Logo and Name */}
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                <div 
                  className="mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl"
                  style={{
                    background: 'rgba(10, 15, 41, 0.7)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)'
                  }}
                >
                  <img
                    src={selectedPartner.logo}
                    alt={`${selectedPartner.name} logo`}
                    className={`${
                      isMobile ? 'h-20' : 
                      isTablet ? 'h-24' : 
                      'h-28'
                    } w-auto object-contain max-w-full`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="${
                          isMobile ? 'h-20' : 
                          isTablet ? 'h-24' : 
                          'h-28'
                        } w-40 sm:w-48 bg-gray-800 rounded-lg flex items-center justify-center">
                          <span class="text-base sm:text-lg text-white font-semibold text-center px-2">${selectedPartner.name}</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-center px-2" style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.3)' }}>
                  {selectedPartner.name}
                </h2>
              </div>

              {/* Partner Details */}
              <div className="space-y-4 sm:space-y-6">
                {/* Description */}
                <div>
                  <h3 
                    className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 pb-2"
                    style={{ 
                      borderBottom: '2px solid rgba(34, 197, 94, 0.5)',
                      textShadow: '0 0 5px rgba(34,197,94,0.3)'
                    }}
                  >
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg mb-3 sm:mb-4">{selectedPartner.description}</p>
                </div>

                {/* Services */}
                <div>
                  <h3 
                    className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 pb-2"
                    style={{ 
                      borderBottom: '2px solid rgba(34, 197, 94, 0.5)',
                      textShadow: '0 0 5px rgba(34,197,94,0.3)'
                    }}
                  >
                    Core Services
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg">{selectedPartner.services}</p>
                </div>

                {/* Certifications Section - Show only if partner has certifications */}
                {selectedPartner.certifications && selectedPartner.certifications.length > 0 && (
                  <div>
                    <h3 
                      className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 pb-2"
                      style={{ 
                        borderBottom: '2px solid rgba(34, 197, 94, 0.5)',
                        textShadow: '0 0 5px rgba(34,197,94,0.3)'
                      }}
                    >
                      Certifications & Accreditations
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                      {selectedPartner.certifications.map((cert, index) => (
                        <div 
                          key={index}
                          className="p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center"
                          style={{
                            background: 'rgba(10, 15, 41, 0.7)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            minHeight: isMobile ? '90px' : '120px'
                          }}
                        >
                          <img
                            src={cert.img}
                            alt={cert.name}
                            className={`${
                              isMobile ? 'h-8 sm:h-10' : 'h-10 sm:h-12'
                            } w-auto object-contain mb-1 sm:mb-2`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="h-8 sm:h-10 w-full flex items-center justify-center">
                                  <span class="text-xs text-white text-center px-1">${cert.name}</span>
                                </div>
                              `;
                            }}
                          />
                          <p className="text-white text-xs text-center mt-1">{cert.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div 
                    className="p-3 sm:p-4 rounded-lg"
                    style={{
                      background: 'rgba(10, 15, 41, 0.7)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}
                  >
                    <h4 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Location</h4>
                    <p className="text-white text-sm sm:text-base md:text-lg">{selectedPartner.location}</p>
                  </div>
                  <div 
                    className="p-3 sm:p-4 rounded-lg"
                    style={{
                      background: 'rgba(10, 15, 41, 0.7)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}
                  >
                    <h4 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Established</h4>
                    <p className="text-white text-sm sm:text-base md:text-lg">{selectedPartner.established}</p>
                  </div>
                </div>

                {/* Partnership Benefits */}
                <div 
                  className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-lg border"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.1)'
                  }}
                >
                  <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4" style={{ textShadow: '0 0 5px rgba(34,197,94,0.3)' }}>
                    Partnership Benefits
                  </h4>
                  <ul className="space-y-2 sm:space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-secondary mr-2 sm:mr-3 mt-1 text-lg sm:text-xl">✓</span>
                      <span className="text-sm sm:text-base md:text-lg">Strategic collaboration in global markets</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-2 sm:mr-3 mt-1 text-lg sm:text-xl">✓</span>
                      <span className="text-sm sm:text-base md:text-lg">Shared technology and innovation resources</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-2 sm:mr-3 mt-1 text-lg sm:text-xl">✓</span>
                      <span className="text-sm sm:text-base md:text-lg">Joint ventures in emerging markets</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-2 sm:mr-3 mt-1 text-lg sm:text-xl">✓</span>
                      <span className="text-sm sm:text-base md:text-lg">Cross-border logistics optimization</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Close Button */}
              <div className="flex mt-6 sm:mt-8 pt-4 sm:pt-6 border-t" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                <button
                  onClick={closePartnerModal}
                  className="mx-auto py-2 sm:py-3 px-4 sm:px-6 rounded-full font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 group relative overflow-hidden"
                  style={{
                    background: 'rgba(10, 15, 41, 0.9)',
                    color: 'white',
                    border: '2px solid rgba(34, 197, 94, 0.6)',
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    minWidth: isMobile ? '140px' : '160px'
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                    style={{
                      background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)'
                    }}
                  ></div>
                  
                  <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Close Details
                    <span className="text-xs group-hover:scale-150 transition-transform duration-300" style={{ color: '#22c55e' }}>✓</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes modal-appear {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .text-shadow-black {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        
        .shadow-neon {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.5),
                      0 0 40px rgba(34, 197, 94, 0.3),
                      0 0 60px rgba(34, 197, 94, 0.1);
        }
        
        .text-shadow-neon {
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.8),
                       0 0 20px rgba(34, 197, 94, 0.6);
        }
        
        /* Ensure smooth scrolling */
        .overflow-hidden {
          overflow: hidden;
        }
        
        /* Improve image rendering */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        
        /* Mobile touch improvements */
        @media (max-width: 640px) {
          button, 
          [role="button"] {
            -webkit-tap-highlight-color: transparent;
          }
          
          button:active {
            transform: scale(0.98);
          }
        }
        
        /* Extra small devices */
        @media (min-width: 375px) and (max-width: 639px) {
          .xs\\:text-3xl {
            font-size: 1.875rem !important;
            line-height: 2.25rem !important;
          }
          .xs\\:text-4xl {
            font-size: 2.25rem !important;
            line-height: 2.5rem !important;
          }
          .xs\\:text-base {
            font-size: 1rem !important;
            line-height: 1.5rem !important;
          }
        }
        
        /* Smooth scrolling container styles */
        .scrolling-container {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Prevent layout shift during animation */
        .flex-shrink-0 {
          flex-shrink: 0;
        }
      `}</style>
    </section>
  );
};

export default Hero;