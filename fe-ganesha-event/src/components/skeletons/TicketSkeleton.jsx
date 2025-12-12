import React from 'react';

export const TicketSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 animate-pulse">
        <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-gray-200 rounded-lg shrink-0"></div>
        
        <div className="flex-1 flex flex-col justify-between space-y-4 sm:space-y-0">
            <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>

            <div className="mt-4 sm:mt-0 flex justify-end">
                <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>
        </div>
    </div>
  );
};
