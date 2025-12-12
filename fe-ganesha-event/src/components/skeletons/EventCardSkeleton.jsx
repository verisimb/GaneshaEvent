import React from 'react';

export const EventCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-[380px] flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200"></div>

      <div className="p-5 flex flex-col flex-1">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        
        {/* Date Row Skeleton */}
        <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Location Row Skeleton */}
        <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
           <div className="h-4 bg-gray-200 rounded w-1/4"></div>
           <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};
