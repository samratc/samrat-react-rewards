import React from "react";

/**
 * Higher Order Component for error boundary functionality
 * @param {React.Component} ComponentToWrap - Component to wrap
 * @returns {React.Component} - Component with error boundary
 */
// eslint-disable-next-line no-unused-vars
export function withErrorBoundary(ComponentToWrap) {
  return class ErrorBoundaryWrapper extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-red-800 font-semibold mb-2">Something went wrong</h2>
            <p className="text-red-600 text-sm">{this.state.error?.message}</p>
          </div>
        );
      }

      return <ComponentToWrap {...this.props} />;
    }
  };
}

