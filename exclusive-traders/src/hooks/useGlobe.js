import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const useGlobe = (canvasRef) => {
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const globeRef = useRef();
  const particleSystemRef = useRef();
  const markersRef = useRef([]);
  const animationRef = useRef();
  const geometriesRef = useRef([]);
  const materialsRef = useRef([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true, 
      alpha: true 
    });
    rendererRef.current = renderer;
    
    const updateRendererSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    updateRendererSize();
    
    // Create globe
    const geometry = new THREE.SphereGeometry(2.5, 64, 64);
    geometriesRef.current.push(geometry);
    
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x00ffcc, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.5 
    });
    materialsRef.current.push(material);
    
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;
    
    // Create particles
    const particleGeo = new THREE.BufferGeometry();
    geometriesRef.current.push(particleGeo);
    
    const particleMat = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.02 });
    materialsRef.current.push(particleMat);
    
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
    particleSystemRef.current = particleSystem;
    
    // Add light
    const light = new THREE.PointLight(0xffffff, 2.5);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    camera.position.z = 5;
    
    // Add country markers
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
      geometriesRef.current.push(markerGeo);
      
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
      materialsRef.current.push(markerMat);
      
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      marker.userData = { name: c.name };
      scene.add(marker);
      markers.push(marker);
    });
    
    markersRef.current = markers;
    
    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.002;
      }
      
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y += 0.001;
      }
      
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate();
    
    // Handle resize
    const handleResize = () => {
      updateRendererSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Dispose of Three.js objects
      geometriesRef.current.forEach(geometry => {
        if (geometry && geometry.dispose) {
          geometry.dispose();
        }
      });
      
      materialsRef.current.forEach(material => {
        if (material && material.dispose) {
          material.dispose();
        }
      });
      
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [canvasRef]);

  return { sceneRef, cameraRef, rendererRef, markersRef };
};

export default useGlobe;