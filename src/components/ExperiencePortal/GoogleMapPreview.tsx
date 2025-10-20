import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleMapPreviewProps {
  address: string;
  className?: string;
}

export const GoogleMapPreview = ({ address, className = '' }: GoogleMapPreviewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address || !mapRef.current) {
      console.log('🗺️ GoogleMapPreview: No address or mapRef:', { address, mapRef: !!mapRef.current });
      return;
    }

    console.log('🗺️ GoogleMapPreview: Rendering map for address:', address);

    // Create Google Maps embed URL
    const encodedAddress = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgUfOzuBvE8'}&q=${encodedAddress}`;

    // Create iframe for Google Maps embed
    const iframe = document.createElement('iframe');
    iframe.src = mapUrl;
    iframe.width = '100%';
    iframe.height = '200';
    iframe.frameBorder = '0';
    iframe.style.border = '0';
    iframe.style.borderRadius = '8px';
    iframe.allowFullScreen = true;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.title = `Map of ${address}`;

    // Clear previous content and add iframe
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(iframe);

    // Add error handling
    iframe.onerror = () => {
      console.log('🗺️ GoogleMapPreview: Map failed to load, showing fallback');
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="flex items-center justify-center h-48 bg-gray-800 rounded-lg border border-gray-700">
            <div class="text-center">
              <p class="text-sm text-gray-400 mb-2">Map preview unavailable</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=${encodedAddress}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                Open in Google Maps
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>
        `;
      }
    };

    // Add load event to confirm map loaded successfully
    iframe.onload = () => {
      console.log('🗺️ GoogleMapPreview: Map loaded successfully');
    };
  }, [address]);

  const openInGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Location Preview</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={openInGoogleMaps}
          className="h-7 px-2 text-xs border-white/20 hover:border-neon-cyan/50 hover:text-neon-cyan"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Open in Maps
        </Button>
      </div>
      
      <div 
        ref={mapRef}
        className="w-full h-48 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
      >
        {/* Loading placeholder */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-cyan mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
