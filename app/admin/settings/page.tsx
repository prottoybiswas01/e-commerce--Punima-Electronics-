import React from "react";
import { getStoreSettings } from "@/lib/services/settings.service";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Store Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure shop contact info, delivery charge matrix, Pathao integration parameters, and warranty policies.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
