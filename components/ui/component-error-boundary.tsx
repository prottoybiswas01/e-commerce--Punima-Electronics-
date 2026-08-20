"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  componentName?: string;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: null };
  }

  componentDidCatch(error: Error) {
    // Send telemetry without blocking the UI
    try {
      fetch("/api/monitoring/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          route: typeof window !== "undefined" ? window.location.pathname : "/",
          component: this.props.componentName || "UnknownComponent",
          severity: "LOW",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.errorId) {
            this.setState({ errorId: data.errorId });
          }
        })
        .catch(() => {});
    } catch (_) {}
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center space-y-3 my-4">
          <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">
            {this.props.fallbackTitle || "Section Temporarily Unavailable"}
          </h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            {this.props.fallbackMessage ||
              "This component could not be displayed, but the rest of the page remains fully functional."}
          </p>
          {this.state.errorId && (
            <div className="text-[10px] text-slate-400 font-mono">
              Ref: {this.state.errorId}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleRetry}
            className="h-7 text-xs font-semibold text-slate-700"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Retry Section
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
