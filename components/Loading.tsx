import React from 'react';

interface LoadingProps {
  isLoading?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading = false }) => {
  if (!isLoading) return null;

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        
        <div className="relative h-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-20 h-20"
            >
              <source src="/assets/loading.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
            <p className="mt-3 text-white text-base">Loading...</p>
          </div>
        </div>
      </div>
      
    
      <style jsx global>{`
        body {
          pointer-events: ${isLoading ? 'none' : 'auto'};
          user-select: ${isLoading ? 'none' : 'auto'};
        }
        
        #__next {
          opacity: ${isLoading ? '0.3' : '1'};
          transition: opacity 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Loading;
