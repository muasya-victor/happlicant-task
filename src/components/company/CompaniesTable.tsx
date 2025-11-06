"use client";

import { memo, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  const onSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      const { data, error } = await client
        .from("companies")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      await refetchCompanies();
      setName("");
      setOpen(false);
    } catch (err) {
      console.error(err);
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

export const CompaniesTable = memo(() => {
  const companies = useAuthStore((s) => s.companies);
  const loading = useAuthStore((s) => s.loading.companies);
  const refetchCompanies = useAuthStore((s) => s.refetchCompanies);

  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  if (loading)
    return <div className="py-10 text-center">Loading companies...</div>;
  if (!companies.length)
    return <div className="py-10 text-center">No companies available</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Companies</h2>
        <AddCompanyDialog />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card
            key={company.id}
            className="border shadow-none transition-all hover:shadow-md"
          >
            <CardHeader>
              <CardTitle className="text-lg">{company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {company.description && (
                <p className="text-sm text-gray-600">{company.description}</p>
              )}
              {company.website && (
                <a
                  href={company.website}
                  className="text-sm text-blue-600"
                  target="_blank"
                >
                  {company.website}
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});
