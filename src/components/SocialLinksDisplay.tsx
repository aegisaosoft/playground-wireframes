import React from 'react';
import { Button } from '@/components/ui/button';
import { Linkedin, Instagram } from 'lucide-react';
import { SocialAccounts } from './SocialAccountsInput';
import { XIcon } from '@/components/ui/icons';

interface SocialLinksDisplayProps {
  socialAccounts: SocialAccounts;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SocialLinksDisplay: React.FC<SocialLinksDisplayProps> = ({
  socialAccounts,
  className = '',
  size = 'md'
}) => {
  const links = [
    {
      url: socialAccounts.linkedinUrl,
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'text-blue-400 hover:text-blue-300'
    },
    {
      url: socialAccounts.instagramUrl,
      icon: Instagram,
      label: 'Instagram',
      color: 'text-pink-400 hover:text-pink-300'
    },
    {
      url: socialAccounts.xUrl,
      icon: XIcon,
      label: 'X',
      color: 'text-foreground hover:text-muted-foreground'
    }
  ].filter(link => link.url && link.url.trim() !== '');

  if (links.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.label}
            variant="ghost"
            size="sm"
            className={`${sizeClasses[size]} rounded-full bg-white/5 border border-white/10 hover:bg-white/10 ${link.color} p-0`}
            onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            aria-label={`Open ${link.label}`}
            title={`Open ${link.label}`}
          >
            <Icon className={iconSizes[size]} />
          </Button>
        );
      })}
    </div>
  );
};