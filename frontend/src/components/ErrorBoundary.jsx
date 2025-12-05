import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('UI ErrorBoundary caught:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white border border-red-300 rounded-lg shadow p-6">
            <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-700 mb-4">An unexpected error occurred while rendering this page.</p>
            <pre className="text-xs bg-red-50 text-red-800 p-3 rounded overflow-auto">
              {String(this.state.error)}
            </pre>
            {this.state.info && (
              <details className="mt-3 text-xs text-gray-600">
                <summary className="cursor-pointer">Stack trace</summary>
                <pre className="mt-2 bg-gray-50 p-3 rounded overflow-auto">{this.state.info.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
