import React from 'react';

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="h-48 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Cart Item Skeleton
export const CartItemSkeleton: React.FC = () => (
  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-gray-200 animate-pulse">
    <div className="col-span-6 flex items-center gap-4">
      <div className="w-20 h-20 bg-gray-200 rounded"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="col-span-2">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="col-span-2">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="col-span-2">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

// Product Detail Skeleton
export const ProductDetailSkeleton: React.FC = () => (
  <div className="pb-12">
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 rounded"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6 animate-pulse">
            <div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            {/* Specs Table Skeleton */}
            <div className="border border-gray-200 rounded">
              <div className="h-10 bg-gray-200 rounded-t"></div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 border-t border-gray-200">
                  <div className="h-4 bg-gray-200 rounded m-3 w-1/3"></div>
                </div>
              ))}
            </div>

            {/* Actions Skeleton */}
            <div className="flex gap-4 pt-8 border-t border-gray-200">
              <div className="h-14 bg-gray-200 rounded w-32"></div>
              <div className="h-14 bg-gray-200 rounded flex-1"></div>
              <div className="h-14 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Category Filter Skeleton
export const CategoryFilterSkeleton: React.FC = () => (
  <div className="space-y-2 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
      </div>
    ))}
  </div>
);

// Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-industrial-accent rounded-full animate-spin`}></div>
  );
};

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-12 space-y-8">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
