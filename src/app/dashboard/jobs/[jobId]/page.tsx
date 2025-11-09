"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Download,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  appliedAt: string;
  status: ApplicationStatus;
  currentStage: string;
  notes?: string;
}

type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

interface ApplicationStage {
  name: string;
  count: number;
  color: string;
  description: string;
}

// Dummy data
const generateDummyApplicants = (jobId: string): Applicant[] => [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    resumeUrl: "/resumes/sarah.pdf",
    appliedAt: "2024-01-15T10:30:00Z",
    status: "interview",
    currentStage: "Technical Interview",
    notes: "Strong technical background, good cultural fit",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    resumeUrl: "/resumes/michael.pdf",
    appliedAt: "2024-01-14T14:20:00Z",
    status: "screening",
    currentStage: "Phone Screen",
    notes: "Excellent communication skills",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 345-6789",
    resumeUrl: "/resumes/emily.pdf",
    appliedAt: "2024-01-16T09:15:00Z",
    status: "applied",
    currentStage: "Application Review",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1 (555) 456-7890",
    resumeUrl: "/resumes/david.pdf",
    appliedAt: "2024-01-13T16:45:00Z",
    status: "offer",
    currentStage: "Offer Extended",
    notes: "Pending background check",
  },
  {
    id: "5",
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@email.com",
    phone: "+1 (555) 567-8901",
    resumeUrl: "/resumes/lisa.pdf",
    appliedAt: "2024-01-17T11:20:00Z",
    status: "rejected",
    currentStage: "Rejected",
    notes: "Lacks required experience",
  },
];

const applicationStages: ApplicationStage[] = [
  {
    name: "Applied",
    count: 12,
    color: "bg-blue-600",
    description: "Initial applications received",
  },
  {
    name: "Screening",
    count: 8,
    color: "bg-teal-600",
    description: "Phone screening phase",
  },
  {
    name: "Interview",
    count: 4,
    color: "bg-indigo-600",
    description: "Technical and cultural interviews",
  },
  {
    name: "Offer",
    count: 1,
    color: "bg-purple-600",
    description: "Offers extended",
  },
  {
    name: "Hired",
    count: 0,
    color: "bg-green-600",
    description: "Successful hires",
  },
];

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { jobs, currentCompany } = useAuthStore();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<
    ApplicationStatus | "all"
  >("all");
  const [isMobile, setIsMobile] = useState(false);

  const jobId = params.jobId as string;
  const job = jobs.find((j) => j.id === jobId);

  useEffect(() => {
    if (jobId) {
      setApplicants(generateDummyApplicants(jobId));
    }

    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [jobId]);

  if (!job) {
    return (
      <div className="flex flex-wrap items-center justify-center py-20">
        <Card className="text-center">
          <CardContent className="p-12">
            <Briefcase className="text-muted-foreground mx-auto h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold">Job Not Found</h3>
            <p className="text-muted-foreground mt-2">
              The job you're looking for doesn't exist or you don't have access
              to it.
            </p>
            <Button
              onClick={() => router.push("/dashboard/jobs")}
              className="mt-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredApplicants =
    selectedStatus === "all"
      ? applicants
      : applicants.filter((app) => app.status === selectedStatus);

  const totalApplications = applicants.length;
  const totalFunnelCount = applicationStages[0]?.count || 0;

  const conversionRate =
    totalApplications > 0
      ? (
          (applicants.filter(
            (app) => app.status === "offer" || app.status === "hired",
          ).length /
            totalApplications) *
          100
        ).toFixed(1)
      : "0";

  function formatSalary(job: any): string {
    if (!job.salary_range) return "—";
    const { min, max, currency, period } = job.salary_range;
    const periodText =
      period === "yearly" ? "yr" : period === "monthly" ? "mo" : "hr";
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${periodText}`;
  }

  const FunnelTree = () => {
    const totalCandidates = totalFunnelCount;

    return (
      <div className="relative mx-auto w-full space-y-3 pt-4">
        {applicationStages.map((stage, index) => {
          const widthPercent = isMobile ? 90 : 100 - index * 10;
          const prevCount =
            index > 0 ? applicationStages[index - 1]?.count : totalCandidates;
          const dropOffRate =
            prevCount && prevCount > 0
              ? (100 - (stage.count / prevCount) * 100).toFixed(1)
              : "0";
          const isLast = index === applicationStages.length - 1;

          return (
            <div key={stage.name} className="relative">
              <div
                className={`mx-auto flex items-center justify-between p-3 font-semibold text-white sm:p-4 ${stage.color} rounded-sm transition-all duration-500`}
                style={{
                  width: `${widthPercent}%`,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  margin: "0 auto",
                }}
              >
                <div className="flex flex-col text-left">
                  <span className="text-sm tracking-wider uppercase sm:text-base">
                    {stage.name}
                  </span>
                  <span className="hidden text-xs font-normal opacity-90 sm:block">
                    {stage.description}
                  </span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-xl leading-none font-extrabold sm:text-2xl">
                    {stage.count}
                  </span>
                  <span className="text-xs font-normal opacity-90">
                    Candidates
                  </span>
                </div>
              </div>

              {!isLast && stage.count > 0 && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 transform text-center"
                  style={{
                    top: "100%",
                    marginTop: "4px",
                    marginBottom: "4px",
                    width: isMobile ? "120px" : "192px",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-px bg-gray-300 sm:h-6"></div>
                    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium whitespace-nowrap text-gray-700 shadow-sm">
                      {dropOffRate}% Drop-off
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const MobileApplicantCard = ({ applicant }: { applicant: Applicant }) => (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <Users className="text-primary h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{applicant.name}</p>
            <p className="text-muted-foreground text-xs">
              Applied {new Date(applicant.appliedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Mail className="h-3 w-3" />
          <span className="text-muted-foreground truncate">
            {applicant.email}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Phone className="h-3 w-3" />
          <span className="text-muted-foreground">{applicant.phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Badge variant="secondary" className="text-xs capitalize">
          {applicant.currentStage}
        </Badge>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" title="Download Resume">
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" title="View Profile">
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const DesktopApplicantCard = ({ applicant }: { applicant: Applicant }) => (
    <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
          <Users className="text-primary h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{applicant.name}</p>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {applicant.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {applicant.phone}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            Applied {new Date(applicant.appliedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="capitalize">
          {applicant.currentStage}
        </Badge>
        <Button variant="outline" size="sm" title="Download Resume">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" title="View Profile">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/jobs")}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
            {job.title}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {currentCompany?.name} • Posted{" "}
            {new Date(job.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Job Overview & Skills */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-muted-foreground text-sm">
                    {job.location_type === "remote"
                      ? "Remote"
                      : job.location_type === "hybrid"
                        ? "Hybrid"
                        : job.location?.city
                          ? `${job.location.city}, ${job.location.country}`
                          : "On-site"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-sm font-medium">Employment Type</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    {job.employment_type.replace("_", " ")}
                  </p>
                </div>
              </div>

              {job.salary_range && (
                <div className="flex items-center gap-3">
                  <DollarSign className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                  <div>
                    <p className="text-sm font-medium">Salary Range</p>
                    <p className="text-muted-foreground text-sm">
                      {formatSalary(job)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-sm font-medium">Experience Level</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    {job.experience_level || "Not specified"}
                  </p>
                </div>
              </div>

              {job.application_deadline && (
                <div className="flex items-center gap-3">
                  <Clock className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                  <div>
                    <p className="text-sm font-medium">Application Deadline</p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(job.application_deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">
                Skills Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs sm:text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Funnel & Applicants */}
        <div className="space-y-6 lg:col-span-2">
          {/* Funnel Card with Professional Design */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold sm:text-xl">
                Application Funnel
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Track candidate progress and conversion rates through the hiring
                pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <FunnelTree />
            </CardContent>
          </Card>

          {/* Applicants Card */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Applicants</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                <span className="font-semibold">{totalApplications}</span> total
                applications •{" "}
                <span className="text-primary font-semibold">
                  {conversionRate}%
                </span>{" "}
                conversion rate
              </CardDescription>
              <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
                <Button
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("all")}
                  className="text-xs whitespace-nowrap sm:text-sm"
                >
                  All ({totalApplications})
                </Button>
                {applicationStages.map((stage) => (
                  <Button
                    key={stage.name}
                    variant={
                      selectedStatus ===
                      (stage.name.toLowerCase() as ApplicationStatus)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setSelectedStatus(
                        stage.name.toLowerCase() as ApplicationStatus,
                      )
                    }
                    className="text-xs whitespace-nowrap sm:text-sm"
                  >
                    {stage.name} ({stage.count})
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {filteredApplicants.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    No applicants found for the selected filter.
                  </div>
                ) : (
                  filteredApplicants.map((applicant) =>
                    isMobile ? (
                      <MobileApplicantCard
                        key={applicant.id}
                        applicant={applicant}
                      />
                    ) : (
                      <DesktopApplicantCard
                        key={applicant.id}
                        applicant={applicant}
                      />
                    ),
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
