import React from 'react';

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex gap-4">
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-full hidden md:block"></div>
             <div className="h-4 bg-gray-200 rounded w-full hidden md:block"></div>
             <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
        
        {/* Rows */}
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-100 flex gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0"></div>
                    <div className="space-y-2 w-full">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="hidden md:flex items-center w-full">
                     <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="hidden md:flex items-center w-full">
                     <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-end w-full gap-2">
                     <div className="h-8 w-8 bg-gray-200 rounded"></div>
                     <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
            </div>
        ))}
    </div>
  );
};
