import React, { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  sizes?: string;
  srcSet?: string;
  priority?: boolean;
}

const EAGER_MARGIN = '320px';

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  sizes,
  srcSet,
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || shouldLoad) return;
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: EAGER_MARGIN, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  const handleLoad = () => setLoaded(true);
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const showFallback = error || !src;

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-leather-100">
          <div className="absolute inset-0 bg-gradient-to-r from-leather-100 via-cream-100 to-leather-100 animate-pulse" />
        </div>
      )}

      {showFallback && loaded && (
        <div className="absolute inset-0 bg-leather-100 flex items-center justify-center">
          {fallback ? (
            <img src={fallback} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-leather-400">
              <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
              <span className="text-xs font-medium opacity-60">Cuir</span>
            </div>
          )}
        </div>
      )}

      {!showFallback && shouldLoad && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={[
            'w-full h-full object-cover transition duration-500',
            loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-[8px] scale-[1.02]',
          ].join(' ')}
        />
      )}
    </div>
  );
};

export default React.memo(LazyImage);
