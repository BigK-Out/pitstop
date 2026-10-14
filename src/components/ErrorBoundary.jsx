import { Component } from "react";

// Renders `fallback` (may be null) if anything below throws, so a failure stays local.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
