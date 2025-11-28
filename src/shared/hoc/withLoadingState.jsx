import React from "react";

/**
 * Higher Order Component for loading state management
 * @param {React.Component} ComponentToWrap - Component to wrap
 * @param {React.Component} LoadingComponent - Custom loading component (optional)
 * @returns {React.Component} - Component with loading state
 */
export function withLoadingState(ComponentToWrap, LoadingComponent = null) {
  return function LoadingWrapper({ isLoading, ...props }) {
    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500 text-lg">Loading...</div>
        </div>
      );
    }

    return <ComponentToWrap {...props} />;
  };
}

