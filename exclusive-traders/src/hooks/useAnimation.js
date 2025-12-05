import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const useAnimation = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero content animation
    gsap.from(".hero-content", { 
      duration: 1.5, 
      y: 50, 
      opacity: 0, 
      ease: "power3.out" 
    });
    
    // Service cards animation
    gsap.utils.toArray(".service-card").forEach((card, index) => {
      gsap.from(card, { 
        duration: 1, 
        y: 50, 
        opacity: 0, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        delay: index * 0.2
      });
    });

    // Industry items animation
    gsap.utils.toArray(".industry-item").forEach((item, index) => {
      gsap.from(item, { 
        duration: 1, 
        y: 30, 
        opacity: 0, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        delay: index * 0.1
      });
    });

    // Clean up ScrollTrigger when component unmounts
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
};

export default useAnimation;