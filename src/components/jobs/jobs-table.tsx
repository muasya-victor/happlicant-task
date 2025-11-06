"use client";

import { memo, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import {
  Eye,
  LayoutGrid,
  LayoutList,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";

// Utility function to format employment type
const formatEmploymentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
  };
  return typeMap[type] || type.replace("_", " ");
};

// Utility function to format status with proper casing
const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Utility function to format location type
const formatLocationType = (type: string): string => {
  const typeMap: Record<string, string> = {
    remote: "Remote",
    on_site: "On Site",
    hybrid: "Hybrid",
  };
  return typeMap[type] || type;
};

const JobsTableComponent = () => {
  const [view, setView] = useState<"table" | "grid">("table");

  // Zustand state selectors
  const jobs = useAuthStore((state) => state.jobs);
  const loading = useAuthStore((state) => state.loading.jobs);
  const currentCompany = useAuthStore((state) => state.currentCompany);
  const refetchJobs = useAuthStore((state) => state.refetchJobs);

  // Fetch jobs on company change
  useEffect(() => {
    if (currentCompany?.id) {
      refetchJobs();
    }
  }, [currentCompany?.id, refetchJobs]);

  if (loading) return <div className="py-10 text-center">Loading jobs...</div>;
  if (!jobs.length)
    return <div className="py-10 text-center">No jobs available</div>;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Job Postings
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage and view all job positions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
            className="flex items-center gap-2"
          >
            <LayoutList className="h-4 w-4" />
            Table View
          </Button>
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Grid View
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <Card className="rounded-md border shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Position</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Applications</TableHead>
                  <TableHead className="font-semibold">Posted</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="border-b transition-colors hover:bg-gray-50/30"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {job.title}
                        </div>
                        {job.experience_level && (
                          <div className="text-sm text-gray-500 capitalize">
                            {job.experience_level} Level
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit text-xs">
                          {formatEmploymentType(job.employment_type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {formatLocationType(job.location_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "active"
                            ? "default"
                            : job.status === "draft"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {formatStatus(job.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {job.applications_count} applications
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(job.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="border shadow-none transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-6 font-semibold">
                    {job.title}
                  </CardTitle>
                  <Badge
                    variant={
                      job.status === "active"
                        ? "default"
                        : job.status === "draft"
                          ? "secondary"
                          : "outline"
                    }
                    className="ml-2 shrink-0 capitalize"
                  >
                    {formatStatus(job.status)}
                  </Badge>
                </div>
                {job.experience_level && (
                  <p className="text-sm text-gray-600 capitalize">
                    {job.experience_level} Level
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {formatEmploymentType(job.employment_type)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs"
                  >
                    <MapPin className="h-3 w-3" />
                    {formatLocationType(job.location_type)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Posted</span>
                    </div>
                    <div className="text-gray-900">
                      {new Date(job.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-medium text-gray-600">
                      Applications
                    </div>
                    <div className="text-gray-900">
                      {job.applications_count}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">
                    {job.views_count} views
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const JobsTable = memo(JobsTableComponent);
