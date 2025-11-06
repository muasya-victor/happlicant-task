"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import client from "@/api/client";
import { Trash2 } from "lucide-react";
import type { Company } from "@/types/company";

interface DeleteCompanyDialogProps {
  company: Company;
  onSuccess?: () => void;
}

export function DeleteCompanyDialog({
  company,
  onSuccess,
}: DeleteCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const refetchCompanies = useAuthStore((s) => s.refetchCompanies);
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany);
  const companies = useAuthStore((s) => s.companies);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMsg("");

    try {
      // First delete company admins (foreign key constraint)
      await client.from("company_admins").delete().eq("company_id", company.id);

      // Then delete the company
      const { error } = await client
        .from("companies")
        .delete()
        .eq("id", company.id);

      if (error) throw error;

      // Update current company if needed
      if (companies.length > 1) {
        const remainingCompanies = companies.filter((c) => c.id !== company.id);
        setCurrentCompany(remainingCompanies[0] || null);
      } else {
        setCurrentCompany(null);
      }

      // Refetch companies
      await refetchCompanies();

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error deleting company:", error);
      setErrorMsg(error.message || "Failed to delete company. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Company</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{company.name}"? This action cannot
            be undone and all associated data (jobs, admins, etc.) will be
            permanently removed.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-500">
            {errorMsg}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Company"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
