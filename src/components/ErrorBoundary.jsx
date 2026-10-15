import { Component } from "react";

// Renders `fallback` (may be null) and calls `onError` if anything below throws, so a failure stays local.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error, info) {
    this.props.onError?.(error, info);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
