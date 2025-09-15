import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "" }) => {
  return (
    <Link 
      to="/" 
      className={`text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer ${className}`}
    >
      Playground
    </Link>
  );
};