// components/jobs/JobsGrid.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreHorizontal,
  Edit,
  Users,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
} from "lucide-react";
import type { Job } from "@/types/jobs";

interface JobsGridProps {
  jobs: Job[];
  onRefresh: () => void;
}

export default function JobsGrid({ jobs, onRefresh }: JobsGridProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string, length: number) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <Briefcase className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>No jobs found. Create your first job posting to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {truncateText(job.description, 100)}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-3">
            {/* Job Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-muted-foreground h-4 w-4" />
                  <span className="capitalize">
                    {job.employment_type?.replace("_", " ") || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <span>
                    {job.location_type === "remote"
                      ? "Remote"
                      : job.location?.city || "On-site"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>{job.applications_count || 0} applications</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span>{formatDate(job.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.skills_required.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.skills_required.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-2">
              <Badge
                variant={getStatusVariant(job.status)}
                className="capitalize"
              >
                {job.status}
              </Badge>

              <Button variant="outline" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
