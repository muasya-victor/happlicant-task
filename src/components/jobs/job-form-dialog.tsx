"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Briefcase } from "lucide-react";
import type { Job } from "@/types/jobs";
import client from "@/api/client";

interface JobFormProps {
  job?: Job | null;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function JobForm({
  job,
  onSuccess,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
}: JobFormProps) {
  const isEditing = !!job;
  const { user, currentCompany, setLoading, loading, createJob } =
    useAuthStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location_type: "remote" as Job["location_type"],
    city: "",
    state: "",
    country: "",
    employment_type: "full_time" as Job["employment_type"],
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    salary_period: "yearly" as "yearly" | "monthly" | "hourly",
    experience_level: "mid" as Job["experience_level"],
    skills_required: "",
    status: "draft" as Job["status"],
    application_deadline: "",
    application_url: "",
  });

  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  // Initialize form data when job changes or dialog opens
  useEffect(() => {
    if (job && open) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        location_type: job.location_type || "remote",
        city: job.location?.city || "",
        state: job.location?.state || "",
        country: job.location?.country || "",
        employment_type: job.employment_type || "full_time",
        salary_min: job.salary_range?.min?.toString() || "",
        salary_max: job.salary_range?.max?.toString() || "",
        salary_currency: job.salary_range?.currency || "USD",
        salary_period: job.salary_range?.period || "yearly",
        experience_level: job.experience_level || "mid",
        skills_required: job.skills_required?.join(", ") || "",
        status: job.status || "draft",
        application_deadline: job.application_deadline || "",
        application_url: job.application_url || "",
      });
    } else if (!isEditing && open) {
      // Reset form for new job
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location_type: "remote",
        city: "",
        state: "",
        country: "",
        employment_type: "full_time",
        salary_min: "",
        salary_max: "",
        salary_currency: "USD",
        salary_period: "yearly",
        experience_level: "mid",
        skills_required: "",
        status: "draft",
        application_deadline: "",
        application_url: "",
      });
    }
  }, [job, open, isEditing]);

  const isLoading = loading.jobs;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !currentCompany?.id || !formData.title.trim()) return;

    setLoading("jobs", true);

    try {
      const location =
        formData.location_type !== "remote" &&
        (formData.city || formData.country)
          ? {
              ...(formData.city && { city: formData.city }),
              ...(formData.state && { state: formData.state }),
              ...(formData.country && { country: formData.country }),
            }
          : undefined;

      const salary_range =
        formData.salary_min && formData.salary_max
          ? {
              min: parseInt(formData.salary_min),
              max: parseInt(formData.salary_max),
              currency: formData.salary_currency,
              period: formData.salary_period,
            }
          : undefined;

      const skills_required = formData.skills_required
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const jobPayload: Partial<Job> = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location_type: formData.location_type,
        location,
        employment_type: formData.employment_type,
        salary_range,
        experience_level: formData.experience_level,
        skills_required,
        status: formData.status,
        application_deadline: formData.application_deadline || undefined,
        application_url: formData.application_url || undefined,
      };

      if (isEditing && job?.id) {
        const { error } = await client
          .from("jobs")
          .update(jobPayload)
          .eq("id", job.id);

        if (error) throw error;
      } else {
        await createJob(jobPayload);
      }

      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error saving job:", err);
      alert("Failed to save job. Please try again.");
    } finally {
      setLoading("jobs", false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!externalOpen && trigger && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Job Posting" : "Create New Job"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the job posting details below."
              : "Fill out the form to create a new job posting."}
            {currentCompany && (
              <span className="mt-1 block font-medium">
                Company: {currentCompany.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value: Job["employment_type"]) =>
                    handleSelectChange("employment_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value: Job["experience_level"]) =>
                    handleSelectChange("experience_level", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the job role, responsibilities, and what you're looking for..."
                rows={4}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Required qualifications, skills, and experience..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Location & Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="location_type">Location Type</Label>
                <Select
                  value={formData.location_type}
                  onValueChange={(value: Job["location_type"]) =>
                    handleSelectChange("location_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="on_site">On Site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Job Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Job["status"]) =>
                    handleSelectChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.location_type !== "remote" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Nairobi"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Nairobi County"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. Kenya"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Salary Information</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="salary_min">Min Salary</Label>
                <Input
                  id="salary_min"
                  name="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salary_max">Max Salary</Label>
                <Input
                  id="salary_max"
                  name="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={handleChange}
                  placeholder="e.g. 80000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salary_currency">Currency</Label>
                <Select
                  value={formData.salary_currency}
                  onValueChange={(value) =>
                    handleSelectChange("salary_currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salary_period">Period</Label>
                <Select
                  value={formData.salary_period}
                  onValueChange={(value) =>
                    handleSelectChange("salary_period", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Skills & Application */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skills & Application</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="skills_required">Required Skills</Label>
              <Input
                id="skills_required"
                name="skills_required"
                value={formData.skills_required}
                onChange={handleChange}
                placeholder="e.g. React, TypeScript, Node.js (comma separated)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="application_deadline">
                  Application Deadline
                </Label>
                <Input
                  id="application_deadline"
                  name="application_deadline"
                  type="datetime-local"
                  value={formData.application_deadline}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="application_url">Application URL</Label>
                <Input
                  id="application_url"
                  name="application_url"
                  type="url"
                  value={formData.application_url}
                  onChange={handleChange}
                  placeholder="https://company.com/apply"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Job"
              ) : (
                "Create Job"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
