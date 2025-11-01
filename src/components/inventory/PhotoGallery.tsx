import React, { useState } from 'react';

interface PhotoGalleryProps {
  photos: string[];
  onDelete?: (index: number) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!photos || photos.length === 0) {
    return <p className="text-slate-400 text-center py-8">No photos yet</p>;
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleSwipe = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startX = touch.clientX;
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endX = endEvent.changedTouches[0].clientX;
      if (startX - endX > 50) nextPhoto();
      if (endX - startX > 50) prevPhoto();
      document.removeEventListener('touchend', handleTouchEnd);
    };
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <>
      <div className="relative">
        <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden" onTouchStart={handleSwipe}>
          <img 
            src={photos[currentIndex]} 
            alt={`Photo ${currentIndex + 1}`} 
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => setFullscreen(true)}
          />
        </div>
        
        {photos.length > 1 && (
          <>
            <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">‹</button>
            <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">›</button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </>
        )}
        
        {onDelete && (
          <button onClick={() => onDelete(currentIndex)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
            🗑️
          </button>
        )}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <img src={photos[currentIndex]} alt="Fullscreen" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-4 right-4 text-white text-3xl">×</button>
        </div>
      )}
    </>
  );
};
