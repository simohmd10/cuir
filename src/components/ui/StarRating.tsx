import React from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 'md',
}) => {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const displayRating = hovered !== null ? hovered : rating;

  const getStarType = (index: number): 'full' | 'half' | 'empty' => {
    const starValue = index + 1;
    if (displayRating >= starValue) return 'full';
    if (displayRating >= starValue - 0.5) return 'half';
    return 'empty';
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) setHovered(index + 1);
  };

  const handleMouseLeave = () => {
    if (interactive) setHovered(null);
  };

  return (
    <div
      className="flex items-center gap-0.5"
      dir="ltr"
      role={interactive ? 'radiogroup' : undefined}
      aria-label={`Rating: ${rating} out of ${maxStars}`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const type = getStarType(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={[
              sizeClasses[size],
              'relative flex-shrink-0',
              interactive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-sm' : 'cursor-default',
            ].join(' ')}
            aria-label={interactive ? `Rate ${i + 1} stars` : undefined}
          >
            {type === 'full' && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="text-gold-500 w-full h-full">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            {type === 'half' && (
              <svg viewBox="0 0 20 20" className="w-full h-full">
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="#C9A84C" />
                    <stop offset="50%" stopColor="#D1D5DB" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            )}
            {type === 'empty' && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="text-gray-300 w-full h-full">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
