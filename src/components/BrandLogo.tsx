import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "" }) => {
  return (
    <Link 
      to="/" 
      className={`text-2xl font-bold text-neon-pink hover:opacity-80 transition-opacity cursor-pointer ${className}`}
    >
      playground
    </Link>
  );
};