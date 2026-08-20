import React from "react";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact & Customer Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Have a question regarding product availability, corporate orders, or warranty claims? Reach out anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-xl font-bold text-white">Store Information</h2>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Retail Outlet:</strong>
                Shop #12, Level 3, Multiplan Center, New Elephant Road, Dhaka-1205, Bangladesh
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Customer Helpline:</strong>
                +880 1712-345678, +880 1812-987654 (10 AM - 9 PM)
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Email Inquiries:</strong>
                support@purnimaelectronics.com
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Opening Hours:</strong>
                Saturday - Thursday: 10:00 AM - 8:30 PM (Friday Closed)
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" /> Send a Message
          </h2>

          <form className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label htmlFor="cName">Your Name</Label>
              <Input id="cName" placeholder="Enter your full name" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cPhone">Mobile Phone</Label>
              <Input id="cPhone" placeholder="017XXXXXXXX" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cMsg">Message / Inquiry</Label>
              <Textarea id="cMsg" rows={4} placeholder="How can we assist you today?" />
            </div>

            <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-10">
              Submit Inquiry
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
