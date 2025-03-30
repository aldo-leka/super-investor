import { useEffect, useState } from 'react';

export function useGoogleInit() {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    const checkGoogle = () => {
      if (window.google?.accounts) {
        setIsGoogleLoaded(true);
      } else {
        setTimeout(checkGoogle, 100);
      }
    };

    checkGoogle();
  }, []);

  return isGoogleLoaded;
} 