"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquareWarning, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ReportProblemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  errorId?: string | null;
}

export function ReportProblemModal({
  isOpen,
  onOpenChange,
  errorId,
}: ReportProblemModalProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<
    "BUG_REPORT" | "USABILITY" | "FEATURE_REQUEST" | "PERFORMANCE" | "OTHER"
  >("BUG_REPORT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please describe what went wrong");
      return;
    }

    setIsSubmitting(true);
    try {
      const deviceInfo = typeof navigator !== "undefined" ? `${navigator.userAgent} (${window.innerWidth}x${window.innerHeight})` : "Unknown";
      const currentRoute = typeof window !== "undefined" ? window.location.pathname : "/";

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorId: errorId || null,
          message,
          category,
          route: currentRoute,
          userEmail: email.trim() || null,
          deviceInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      setIsSuccess(true);
      toast.success("Thank you! Your feedback has been forwarded to our engineering team.");
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("");
        onOpenChange(false);
      }, 1800);
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <MessageSquareWarning className="h-5 w-5 text-blue-600" />
            Report an Issue / Send Feedback
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Feedback Received</h4>
            <p className="text-xs text-slate-500">
              Our automated engineering pipeline and support team have logged your report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
            {errorId && (
              <div className="bg-slate-50 p-2.5 rounded-lg border text-[11px] flex justify-between items-center text-slate-600">
                <span>Associated Error Reference:</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {errorId}
                </span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="feedCategory" className="text-xs font-semibold">
                Category
              </Label>
              <select
                id="feedCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="BUG_REPORT">Bug / Functionality Not Working</option>
                <option value="PERFORMANCE">Slow Page / Loading Issue</option>
                <option value="USABILITY">Confusing Checkout / Navigation</option>
                <option value="FEATURE_REQUEST">Feature Suggestion</option>
                <option value="OTHER">Other Inquiry</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="feedMessage" className="text-xs font-semibold">
                What happened? What were you trying to do? *
              </Label>
              <Textarea
                id="feedMessage"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. When I clicked the checkout button, nothing happened..."
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="feedEmail" className="text-xs font-semibold">
                Your Email (Optional, if you'd like a reply)
              </Label>
              <Input
                id="feedEmail"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Safe metadata (URL, browser info) will be automatically attached without passwords.</span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
