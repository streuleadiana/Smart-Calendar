import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full h-full min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading data...</p>
        </div>
    );
};
