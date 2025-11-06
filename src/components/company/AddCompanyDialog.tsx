"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { Plus } from "lucide-react";
import client from "@/api/client";

export function AddCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const refetchCompanies = useAuthStore((s) => s.refetchCompanies);
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany);
  const user = useAuthStore((s) => s.user);

  const onSave = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);

    try {
      // 1️⃣ Create the company
      const { data: company, error: companyError } = await client
        .from("companies")
        .insert({ name })
        .select()
        .single();

      if (companyError) throw companyError;
      if (!company) throw new Error("Failed to create company");

      // 2️⃣ Assign the current user as company admin (owner)
      const { error: adminError } = await client.from("company_admins").insert({
        user_id: user.id,
        company_id: company.id,
        role: "owner",
      });

      if (adminError) throw adminError;

      // 3️⃣ Update current company in the store
      setCurrentCompany(company);

      // 4️⃣ Refetch all companies to update UI
      await refetchCompanies();

      // 5️⃣ Reset dialog
      setName("");
      setOpen(false);
    } catch (err) {
      console.error("Failed to create company:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Company Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

