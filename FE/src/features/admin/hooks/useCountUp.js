import { useEffect, useState } from 'react';

export const useCountUp = (targetValue, duration = 1200) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId;
    const start = performance.now();
    const target = Number(targetValue) || 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [duration, targetValue]);

  return value;
};
