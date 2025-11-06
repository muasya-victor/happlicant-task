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
import type { Job } from "@/types/jobs";

interface DeleteJobDialogProps {
  job: Job;
  onSuccess?: () => void;
}

export function DeleteJobDialog({ job, onSuccess }: DeleteJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const removeJob = useAuthStore((s) => s.removeJob);
  const refetchJobs = useAuthStore((s) => s.refetchJobs);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMsg("");

    try {
      const { error } = await client.from("jobs").delete().eq("id", job.id);

      if (error) throw error;

      // ✅ Remove from store
      removeJob(job.id);

      // ✅ Refetch jobs to ensure consistency
      await refetchJobs();

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error deleting job:", error);
      setErrorMsg(error.message || "Failed to delete job. Try again.");
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
          <DialogTitle className="text-red-600">Delete Job</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the job "{job.title}"? This action
            cannot be undone and all applications for this job will be lost.
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
            {deleting ? "Deleting..." : "Delete Job"}
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
