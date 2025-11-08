"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useAuthStore } from "@/store/auth-store";
import client from "@/api/client";

import type { Job } from "@/types/jobs";

const jobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  location_type: z.enum(["remote", "on_site", "hybrid"]),
  employment_type: z.enum([
    "full_time",
    "part_time",
    "contract",
    "freelance",
    "internship",
  ]),
  requirements: z.string().optional(),
  status: z.enum(["active", "draft", "closed", "paused", "archived"]), // Add "archived"
});


type JobFormValues = z.infer<typeof jobSchema>;

interface JobDialogProps {
  job?: Job | null;
  mode?: "add" | "edit";
  onSuccess?: () => void;
}

export function JobDialog({ job, mode = "add", onSuccess }: JobDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Get current company from Zustand
  const currentCompany = useAuthStore((s) => s.currentCompany);
  const user = useAuthStore((s) => s.user);
  const refetchJobs = useAuthStore((s) => s.refetchJobs);
  const addJob = useAuthStore((s) => s.addJob);
  const updateJob = useAuthStore((s) => s.updateJob);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      location_type: "remote",
      employment_type: "full_time",
      requirements: "",
      status: "active",
    },
  });

  // Reset form when dialog opens/closes or job changes
  useEffect(() => {
    if (open && job && mode === "edit") {
      reset({
        title: job.title,
        description: job.description,
        location_type: job.location_type,
        employment_type: job.employment_type,
        requirements: job.requirements || "",
        status: job.status,
      });
    } else if (open && mode === "add") {
      reset({
        title: "",
        description: "",
        location_type: "remote",
        employment_type: "full_time",
        requirements: "",
        status: "active",
      });
    }
  }, [open, job, mode, reset]);

  const onSubmit = async (data: JobFormValues) => {
    if (!currentCompany?.id || !user?.id) return;

    setSaving(true);
    setErrorMsg("");

    try {
      if (mode === "add") {
        const newJob: Omit<Job, "id"> = {
          company_id: currentCompany.id,
          title: data.title,
          description: data.description,
          requirements: data.requirements || "",
          location_type: data.location_type,
          employment_type: data.employment_type,
          skills_required: [],
          status: data.status,
          views_count: 0,
          applications_count: 0,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: insertedJob, error } = await client
          .from("jobs")
          .insert(newJob)
          .select()
          .single();

        if (error) throw error;

        // ✅ Add to store
        if (insertedJob) {
          addJob(insertedJob);
        }
      } else if (mode === "edit" && job) {
        const updatedJob: Job = {
          ...job,
          title: data.title,
          description: data.description,
          requirements: data.requirements || "",
          location_type: data.location_type,
          employment_type: data.employment_type,
          status: data.status,
          updated_at: new Date().toISOString(),
        };

        const { data: resultJob, error } = await client
          .from("jobs")
          .update({
            title: data.title,
            description: data.description,
            requirements: data.requirements,
            location_type: data.location_type,
            employment_type: data.employment_type,
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id)
          .select()
          .single();

        if (error) throw error;

        // ✅ Update store
        if (resultJob) {
          updateJob(resultJob);
        }
      }

      // ✅ Refetch jobs to ensure consistency
      await refetchJobs();

      reset();
      setSaving(false);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error(
        `Error ${mode === "add" ? "adding" : "updating"} job:`,
        error,
      );
      setErrorMsg(
        error.message ||
          `Failed to ${mode === "add" ? "save" : "update"} job. Try again.`,
      );
      setSaving(false);
    }
  };

  const dialogTitle = mode === "add" ? "Add New Job" : "Edit Job";
  const submitButtonText = saving
    ? mode === "add"
      ? "Saving..."
      : "Updating..."
    : mode === "add"
      ? "Save Job"
      : "Update Job";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full flex items-center justify-end ">
            {mode === "add" ? (
              <Button>Add Job</Button>
            ) : (
              <Button variant="outline" size="sm">
                Edit
              </Button>
            )}
        </div>
        
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-500">
              {errorMsg}
            </p>
          )}

          <div>
            <Input placeholder="Job Title" {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Description"
              {...register("description")}
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Requirements (optional)"
              {...register("requirements")}
              rows={3}
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-500">
                {errors.requirements.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Location Type
              </label>
              <select
                {...register("location_type")}
                className="w-full rounded-md border p-2 text-sm"
              >
                <option value="remote">Remote</option>
                <option value="on_site">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Employment Type
              </label>
              <select
                {...register("employment_type")}
                className="w-full rounded-md border p-2 text-sm"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              {...register("status")}
              className="w-full rounded-md border p-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="submit" disabled={saving}>
              {submitButtonText}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
