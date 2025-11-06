"use client";

import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/hooks/useAuth";
import CompanyInfoCard from "@/components/company/CompanyInfoCard";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import NoCompaniesCard from "@/components/company/NoCompaniesCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Users, Briefcase, Eye } from "lucide-react";

export default function DashboardPage() {
  const { currentCompany, companies, loading: companyLoading } = useCompany();
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (companyLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-muted-foreground">Loading companies...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCompany) {
    return <NoCompaniesCard />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your company dashboard
        </p>
      </div>

      <div className="grid gap-6">
        <CompanyInfoCard company={currentCompany} />

        {/* Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-muted-foreground text-xs">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-muted-foreground text-xs">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
