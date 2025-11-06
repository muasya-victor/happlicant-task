"use client";

import { useState } from "react";
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
  title: z.string().min(3, "Job title is required"),
  description: z.string().min(5, "Description is required"),
  location_type: z.enum(["remote", "on_site", "hybrid"]),
  employment_type: z.enum([
    "full_time",
    "part_time",
    "contract",
    "freelance",
    "internship",
  ]),
});

type JobFormValues = z.infer<typeof jobSchema>;

export function AddJobDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Get current company from Zustand
  const currentCompany = useAuthStore((s) => s.currentCompany);
  const user = useAuthStore((s) => s.user);
  const refetchJobs = useAuthStore((s) => s.refetchJobs);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobFormValues) => {
    if (!currentCompany?.id || !user?.id) return;

    setSaving(true);
    setErrorMsg("");

    const newJob: Omit<Job, "id"> = {
      company_id: currentCompany.id,
      title: data.title,
      description: data.description,
      requirements: "",
      location_type: data.location_type,
      employment_type: data.employment_type,
      skills_required: [],
      status: "active",
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

    if (error) {
      console.error("Error adding job:", error);
      setErrorMsg("Failed to save job. Try again.");
      setSaving(false);
      return;
    }

    // ✅ Refetch jobs after adding
    await refetchJobs();

    reset();
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Job</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <Input placeholder="Job Title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}

          <Textarea placeholder="Description" {...register("description")} />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}

          <select
            {...register("location_type")}
            className="w-full rounded-md border p-2"
          >
            <option value="remote">Remote</option>
            <option value="on_site">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <select
            {...register("employment_type")}
            className="w-full rounded-md border p-2"
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Job"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
