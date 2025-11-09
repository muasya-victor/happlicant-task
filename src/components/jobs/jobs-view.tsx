"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Briefcase,
  LayoutGrid,
  Rows3,
  Plus,
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Job } from "@/types/jobs";
import JobForm from "@/components/jobs/job-form-dialog";

type ViewMode = "table" | "grid";

const formatLocation = (job: Job): string => {
  if (job.location_type === "remote") return "Remote";
  if (job.location_type === "hybrid") return "Hybrid";
  if (job.location && typeof job.location === "object") {
    const { city, country } = job.location;
    return [city, country].filter(Boolean).join(", ") || "On Site";
  }
  return "On Site";
};

const formatSalary = (job: Job): string => {
  if (!job.salary_range) return "—";
  const { min, max, currency, period } = job.salary_range;
  const periodText =
    period === "yearly" ? "yr" : period === "monthly" ? "mo" : "hr";
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${periodText}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusVariant = (status: Job["status"]) => {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "paused":
      return "outline";
    case "closed":
      return "destructive";
    case "archived":
      return "secondary";
    default:
      return "outline";
  }
};

const getStatusColor = (status: Job["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300";
    case "draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300";
    case "paused":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "closed":
      return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "";
  }
};

export default function JobsView() {
  const { jobs, currentCompany, refetchJobs, loading } = useAuthStore();

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (currentCompany?.id) {
      console.log("Refetching jobs for company:", currentCompany.id);
      refetchJobs();
    }
  }, [currentCompany?.id]);

  const handleSuccess = () => {
    console.log("Job form success - closing dialogs");
    setEditingJob(null);
    setCreateOpen(false);
  };

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    refetchJobs();
  };

  const isLoading = loading.jobs;

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="text-center">
          <CardContent className="p-12">
            <Briefcase className="text-muted-foreground mx-auto h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold">No Company Selected</h3>
            <p className="text-muted-foreground mt-2">
              Please select a company to view and manage jobs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Briefcase className="text-primary h-6 w-6" />
            </div>
            Jobs
            {currentCompany && (
              <Badge variant="outline" className="ml-2 text-sm font-normal">
                {currentCompany.name}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-base">
            Manage job postings for {currentCompany.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="border-border bg-background flex rounded-lg border p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-9 px-3"
            >
              <Rows3 className="mr-2 h-4 w-4" /> Table
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-9 px-3"
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Grid
            </Button>
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="h-9"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            onClick={() => setCreateOpen(true)}
            className="h-10 gap-2"
            disabled={!currentCompany}
          >
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {jobs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Jobs
                  </p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Active Jobs
                  </p>
                  <p className="text-2xl font-bold">
                    {jobs.filter((j) => j.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Draft Jobs
                  </p>
                  <p className="text-2xl font-bold">
                    {jobs.filter((j) => j.status === "draft").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Applications
                  </p>
                  <p className="text-2xl font-bold">
                    {jobs.reduce(
                      (sum, job) => sum + (job.applications_count || 0),
                      0,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
            <p className="text-muted-foreground mt-4 text-lg">
              Loading jobs...
            </p>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <Card className="border-none text-center shadow-none">
          <CardContent className="p-12">
            <Briefcase className="text-muted-foreground mx-auto h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold">No jobs found</h3>
            <p className="text-muted-foreground mt-2">
              Get started by creating your first job posting for{" "}
              {currentCompany.name}.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "table" ? (
            <motion.div
              key="table-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="rounded-md border shadow-none">
                <div className="relative">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="bg-background sticky left-0 z-10 w-[300px] min-w-[300px] border-r">
                            Job Title
                          </TableHead>
                          <TableHead className="min-w-[120px]">Type</TableHead>
                          <TableHead className="min-w-[120px]">
                            Location
                          </TableHead>
                          <TableHead className="min-w-[150px]">
                            Salary
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            Experience
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            Applications
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            Posted
                          </TableHead>
                          <TableHead className="min-w-[100px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow
                            key={job.id}
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            {/* Fixed First Column */}
                            <TableCell className="bg-background sticky left-0 z-10 border-r font-medium">
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold">{job.title}</p>
                                <p className="text-muted-foreground line-clamp-2 text-sm">
                                  {job.description}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {job.employment_type.replace("_", " ")}
                                  </Badge>
                                  {job.experience_level && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {job.experience_level}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Scrollable Columns */}
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {job.employment_type.replace("_", " ")}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="text-muted-foreground h-4 w-4" />
                                <span>{formatLocation(job)}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              {job.salary_range ? (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="text-muted-foreground h-4 w-4" />
                                  <span className="text-sm">
                                    {formatSalary(job)}
                                  </span>
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {job.experience_level || "Not specified"}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={getStatusVariant(job.status)}
                                className={getStatusColor(job.status)}
                              >
                                {job.status.charAt(0).toUpperCase() +
                                  job.status.slice(1)}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="text-muted-foreground h-4 w-4" />
                                <span>{job.applications_count || 0}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm">
                                  {formatDate(job.created_at)}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingJob(job);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {job.title}
                        </CardTitle>
                        <Badge
                          variant={getStatusVariant(job.status)}
                          className={getStatusColor(job.status)}
                        >
                          {job.status.charAt(0).toUpperCase() +
                            job.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {job.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Job Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-medium">
                              Location
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {formatLocation(job)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Briefcase className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-medium">Type</span>
                          </div>
                          <p className="text-muted-foreground text-xs capitalize">
                            {job.employment_type.replace("_", " ")}
                          </p>
                        </div>

                        {job.salary_range && (
                          <div className="col-span-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="text-muted-foreground h-3 w-3" />
                              <span className="text-xs font-medium">
                                Salary
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {formatSalary(job)}
                            </p>
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-medium">
                              Applications
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {job.applications_count || 0}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-medium">Posted</span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(job.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.skills_required.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium">Skills Required</p>
                          <div className="flex flex-wrap gap-1">
                            {job.skills_required
                              .slice(0, 3)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {job.skills_required.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills_required.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingJob(job);
                          }}
                        >
                          <Edit className="mr-2 h-3 w-3" /> Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Controlled Dialogs */}
      <JobForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />

      <JobForm
        job={editingJob}
        open={!!editingJob}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingJob(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
