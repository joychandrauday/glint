import React from 'react';

interface BrandSparkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  noShadow?: boolean;
}

export const BrandSpark: React.FC<BrandSparkProps> = ({
  size = 'md',
  className = '',
  animate = false,
  noShadow = false,
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 select-none ${sizeMap[size]} ${
        animate ? 'animate-bounce' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 640 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${noShadow ? '' : 'drop-shadow-sm'}`}
        role="img"
        aria-label="Glint Spark Mascot"
      >
        <defs>
          <path
            id="spark-star"
            d="M320 100 L380 220 H420 V260 L540 320 L420 380 V420 H380 L320 540 L260 420 H220 V380 L100 320 L220 260 V220 H260 Z"
          />
          <clipPath id="spark-star-clip">
            <use href="#spark-star" />
          </clipPath>
        </defs>
        <g transform="translate(-13 -16)">
          {/* 3D Violet Extrusion */}
          <use
            href="#spark-star"
            x="28"
            y="34"
            fill="#7D23D9"
            stroke="#110939"
            strokeWidth="9"
            strokeLinejoin="round"
          />
          {/* Deep Void Outline */}
          <use
            href="#spark-star"
            fill="#110939"
            stroke="#110939"
            strokeWidth="13"
            strokeLinejoin="round"
          />
          {/* Electric Lime Face */}
          <use href="#spark-star" fill="#BDFB03" />

          {/* Facets: Cyan, Magenta, Warm Yellow */}
          <g clipPath="url(#spark-star-clip)">
            <path
              d="M248 220 220 220 220 260 100 320 220 380 220 420 248 420 Z"
              fill="#0DE4F3"
            />
            <path
              d="M320 100 380 220 420 220 420 248 320 248 Z"
              fill="#CB4BF7"
            />
            <path
              d="M320 540 380 420 420 420 420 392 320 392 Z"
              fill="#FED02A"
            />
          </g>

          {/* Eyes */}
          <rect x="268" y="252" width="34" height="44" rx="8" fill="#110939" />
          <rect x="338" y="252" width="34" height="44" rx="8" fill="#110939" />
          {/* Eye Highlights */}
          <rect x="278" y="261" width="10" height="10" rx="2" fill="#FFFFFF" />
          <rect x="348" y="261" width="10" height="10" rx="2" fill="#FFFFFF" />

          {/* Coral Blush Cheeks */}
          <rect x="246" y="314" width="28" height="14" rx="7" fill="#F57265" />
          <rect x="366" y="314" width="28" height="14" rx="7" fill="#F57265" />

          {/* Happy Mouth */}
          <path
            d="M300 324 L310 343 H330 L340 324"
            fill="none"
            stroke="#110939"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
