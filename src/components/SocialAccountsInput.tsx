import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Linkedin, Instagram, Twitter } from 'lucide-react';

export interface SocialAccounts {
  linkedinUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
}

interface SocialAccountsInputProps {
  value: SocialAccounts;
  onChange: (value: SocialAccounts) => void;
  className?: string;
}

const normalizeUrl = (input: string, platform: 'linkedin' | 'instagram' | 'twitter'): string => {
  if (!input.trim()) return '';
  
  const trimmed = input.trim();
  
  // If it's already a full URL, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Remove @ symbol if present
  const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  
  // Generate full URL based on platform
  switch (platform) {
    case 'linkedin':
      if (handle.includes('linkedin.com')) {
        return `https://www.${handle}`;
      }
      return `https://www.linkedin.com/in/${handle}`;
    case 'instagram':
      if (handle.includes('instagram.com')) {
        return `https://www.${handle}`;
      }
      return `https://www.instagram.com/${handle}`;
    case 'twitter':
      if (handle.includes('twitter.com') || handle.includes('x.com')) {
        return handle.includes('x.com') ? `https://www.${handle}` : `https://www.${handle}`;
      }
      return `https://twitter.com/${handle}`;
    default:
      return trimmed;
  }
};

const validateUrl = (input: string, platform: 'linkedin' | 'instagram' | 'twitter'): boolean => {
  if (!input.trim()) return true; // Empty is valid (optional field)
  
  const normalized = normalizeUrl(input, platform);
  
  try {
    const url = new URL(normalized);
    switch (platform) {
      case 'linkedin':
        return url.hostname.includes('linkedin.com');
      case 'instagram':
        return url.hostname.includes('instagram.com');
      case 'twitter':
        return url.hostname.includes('twitter.com') || url.hostname.includes('x.com');
      default:
        return false;
    }
  } catch {
    return false;
  }
};

export const SocialAccountsInput: React.FC<SocialAccountsInputProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focused, setFocused] = useState<string | null>(null);

  const handleInputChange = (platform: 'linkedin' | 'instagram' | 'twitter', input: string) => {
    const urlKey = `${platform}Url` as keyof SocialAccounts;
    
    // Update value immediately for typing
    onChange({
      ...value,
      [urlKey]: input
    });

    // Clear error when user starts typing
    if (errors[platform]) {
      setErrors(prev => ({ ...prev, [platform]: '' }));
    }
  };

  const handleInputBlur = (platform: 'linkedin' | 'instagram' | 'twitter') => {
    const urlKey = `${platform}Url` as keyof SocialAccounts;
    const input = value[urlKey] || '';
    
    setFocused(null);

    if (input.trim()) {
      if (validateUrl(input, platform)) {
        // Normalize the URL
        const normalized = normalizeUrl(input, platform);
        onChange({
          ...value,
          [urlKey]: normalized
        });
        setErrors(prev => ({ ...prev, [platform]: '' }));
      } else {
        setErrors(prev => ({
          ...prev,
          [platform]: `Enter a valid ${platform.charAt(0).toUpperCase() + platform.slice(1)} URL or handle`
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, [platform]: '' }));
    }
  };

  const handleTestLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderInput = (
    platform: 'linkedin' | 'instagram' | 'twitter',
    icon: React.ReactNode,
    placeholder: string,
    label: string
  ) => {
    const urlKey = `${platform}Url` as keyof SocialAccounts;
    const inputValue = value[urlKey] || '';
    const hasError = !!errors[platform];
    const showTestButton = inputValue && !hasError && validateUrl(inputValue, platform);

    return (
      <div className="space-y-2">
        <Label htmlFor={platform} className="text-sm font-medium text-foreground flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <div className="relative">
          <Input
            id={platform}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(platform, e.target.value)}
            onFocus={() => setFocused(platform)}
            onBlur={() => handleInputBlur(platform)}
            placeholder={placeholder}
            className={`h-12 text-base bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground pr-12 ${
              hasError ? 'border-red-400' : ''
            } ${inputValue ? 'truncate' : ''}`}
            title={inputValue ? inputValue : undefined}
            aria-label={`${label} URL or handle`}
          />
          {showTestButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTestLink(inputValue)}
              className="absolute right-1 top-1 h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
              aria-label={`Test ${label} link`}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
        {hasError && (
          <p className="text-xs text-red-400">{errors[platform]}</p>
        )}
      </div>
    );
  };

  return (
    <Card className={`bg-white/5 border-white/10 rounded-xl ${className}`}>
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium text-foreground">Social Accounts</h4>
          <p className="text-xs text-neutral-400">
            Optional. We'll display these on your public profile.
          </p>
        </div>

        <div className="space-y-4">
          {renderInput(
            'linkedin',
            <Linkedin className="w-4 h-4 text-blue-400" />,
            'https://www.linkedin.com/in/username',
            'LinkedIn'
          )}

          {renderInput(
            'instagram',
            <Instagram className="w-4 h-4 text-pink-400" />,
            'https://www.instagram.com/username',
            'Instagram'
          )}

          {renderInput(
            'twitter',
            <Twitter className="w-4 h-4 text-blue-400" />,
            'https://twitter.com/username',
            'Twitter / X'
          )}
        </div>
      </CardContent>
    </Card>
  );
};