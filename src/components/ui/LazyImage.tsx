import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  sizes?: string;
  priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = '', fallback, sizes, priority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => setLoaded(true);
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const showFallback = error || !src;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton loader */}
      {!loaded && (
        <div className="absolute inset-0 bg-leather-100 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-leather-300 opacity-40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        </div>
      )}

      {/* Fallback placeholder */}
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

      {/* Actual image */}
      {(inView || priority) && !showFallback && (
        <img
          src={src}
          srcSet={srcSet}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          sizes={sizes}
          className={[
            'w-full h-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      )}
    </div>
  );
};

export default LazyImage;
