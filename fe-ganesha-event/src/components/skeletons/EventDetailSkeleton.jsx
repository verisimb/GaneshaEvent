import React from 'react';

export const EventDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
        {/* Back Button Skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded"></div>

        {/* Hero Image Skeleton */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-64 md:h-96 bg-gray-200"></div>
          
          <div className="p-4 md:p-8 flex flex-col gap-8 md:gap-10">
             {/* Header Skeleton */}
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="space-y-4 w-full">
                   <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                   <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded shrink-0"></div>
             </div>

             {/* Content Skeleton */}
             <div className="space-y-6">
                <div className="space-y-3">
                   <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-4 bg-gray-200 rounded w-full"></div>
                   <div className="h-4 bg-gray-200 rounded w-full"></div>
                   <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>

                {/* Info Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl h-24"></div>
                    <div className="bg-gray-50 p-4 rounded-xl h-24"></div>
                </div>
             </div>
          </div>
        </div>
    </div>
  );
};
