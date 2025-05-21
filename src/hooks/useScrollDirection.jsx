import { useState, useEffect } from 'react';

const useScrollDirection = (threshold = 10) => {
  const [scrollDir, setScrollDir] = useState('none');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    
    const updateScrollDir = () => {
      const currentScrollY = window.pageYOffset;
      
      // Set scroll position for component use
      setScrollY(currentScrollY);
      
      // Determine scroll direction, but only if we've scrolled beyond threshold
      if (Math.abs(currentScrollY - lastScrollY) < threshold) {
        return;
      }
      
      setScrollDir(currentScrollY > lastScrollY ? 'down' : 'up');
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
    };
    
    const onScroll = () => {
      window.requestAnimationFrame(updateScrollDir);
    };

    window.addEventListener('scroll', onScroll);
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return { scrollDir, scrollY };
};

export default useScrollDirection;