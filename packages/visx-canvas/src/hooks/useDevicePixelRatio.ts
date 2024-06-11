import { useCallback, useEffect, useState } from 'react';

const useDevicePixelRatio = () => {
  const [ratio, setRatio] = useState<number>(window.devicePixelRatio ?? 1);

  // Keep ratio updated as a state
  const updateRatio = useCallback(() => {
    setRatio(window.devicePixelRatio);
  }, []);
  useEffect(() => {
    const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
    const media = matchMedia(mqString);
    media.addEventListener('change', updateRatio);
    return () => {
      media.removeEventListener('change', updateRatio);
    };
  }, [updateRatio]);

  return ratio;
};

export default useDevicePixelRatio;
