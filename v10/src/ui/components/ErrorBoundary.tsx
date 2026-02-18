"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

const DEFAULT_FALLBACK = (
  <section
    role="alert"
    className="rounded border border-[var(--theme-border-strong)] bg-[var(--theme-danger-soft)] px-2 py-1 text-xs text-[var(--theme-text)]"
  >
    Something went wrong while rendering this section.
  </section>
);

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Reserved for follow-up logging/reporting integration.
    void error;
    void errorInfo;
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? DEFAULT_FALLBACK;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
