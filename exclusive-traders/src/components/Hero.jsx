// src/components/Hero.jsx
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const Hero = ({ navigateToSection, showInnovation }) => {
  const canvasRef = useRef();
  const labelRef = useRef();
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const animationRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true, 
      alpha: true 
    });
    
    const updateRendererSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    updateRendererSize();
    
    // Create globe with blue color
    const geometry = new THREE.SphereGeometry(2.5, 64, 64);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x0000FFFF,
      wireframe: true, 
      transparent: true, 
      opacity: 0.5 
    });
    
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    
    // Create particles with neon green color
    const particleGeo = new THREE.BufferGeometry();
    const particleMat = new THREE.PointsMaterial({ 
      color: 0x39ff14,
      size: 0.02 
    });
    
    const particles = new Float32Array(5000 * 3);
    
    for (let i = 0; i < particles.length; i += 3) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * Math.PI;
      const r = 3;
      particles[i] = r * Math.sin(phi) * Math.cos(theta);
      particles[i+1] = r * Math.sin(phi) * Math.sin(theta);
      particles[i+2] = r * Math.cos(phi);
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    
    // Add light with a slight green tint to enhance the neon effect
    const light = new THREE.PointLight(0x39ff14, 2.5);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    // Add ambient light to make the globe more visible
    const ambientLight = new THREE.AmbientLight(0x0000FFFF, 0.3);
    scene.add(ambientLight);
    
    camera.position.z = 5;
    
    // Add country markers with neon green color
    const countries = [
      { lat: 51.5, lon: -0.1, name: "United Kingdom" },
      { lat: 40.7, lon: -74.0, name: "United States" },
      { lat: 28.6, lon: 77.2, name: "India" },
      { lat: 25.2, lon: 55.3, name: "UAE" },
      { lat: 1.3, lon: 103.8, name: "Singapore" },
      { lat: 35.6, lon: 139.7, name: "Japan" },
      { lat: -33.9, lon: 151.2, name: "Australia" }
    ];
    
    const markers = [];
    countries.forEach(c => {
      const phi = (90 - c.lat) * (Math.PI / 180);
      const theta = (c.lon + 180) * (Math.PI / 180);
      const radius = 2.6;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      const markerGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ 
        color: 0x39ff14,
      });
      
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      marker.userData = { name: c.name };
      scene.add(marker);
      markers.push(marker);
    });
    
    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      particleSystem.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    
    animate();
    setIsGlobeReady(true);
    
    // Handle resize
    const handleResize = () => {
      updateRendererSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mouse interaction
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
        labelRef.current.style.display = "block";
        labelRef.current.style.left = event.clientX + 10 + "px";
        labelRef.current.style.top = event.clientY + 10 + "px";
        labelRef.current.textContent = intersects[0].object.userData.name;
      } else {
        labelRef.current.style.display = "none";
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      markers.forEach(marker => {
        marker.geometry.dispose();
        marker.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  const handleDiscoverInnovations = (e) => {
    e.preventDefault();
    showInnovation();
  };

  return (
    <section className="hero relative overflow-hidden text-white py-24 text-center h-screen flex items-center justify-center">
      <video 
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-global-logistics-network-abstract-45878-small.mp4" type="video/mp4" />
      </video>
      
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-10 opacity-70"
      ></canvas>
      
      <div className="hero-overlay absolute top-0 left-0 w-full h-full bg-gradient-to-br from-dark/70 to-secondary/30 z-20"></div>
      
      <div ref={labelRef} className="label absolute text-secondary text-base font-bold pointer-events-none hidden z-30 text-shadow-neon"></div>
      
      <div className="container relative z-30 hero-content">
        <h1 className="text-5xl font-bold mb-4 text-shadow-neon font-inter">
          Revolutionizing Global Supply Chains with Futuristic Solutions
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-8 font-inter">
          Exclusive Traders delivers cutting-edge import/export and warehousing services, powered by AI and blockchain for unparalleled efficiency and transparency across the UK and globally.
        </p>
        <a 
          href="#innovation" 
          onClick={handleDiscoverInnovations}
          className="btn font-inter font-semibold"
        >
          Discover Our Innovations
        </a>
      </div>
    </section>
  );
};

export default Hero;