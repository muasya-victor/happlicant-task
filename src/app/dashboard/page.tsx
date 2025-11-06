// app/dashboard/page.tsx
"use client";

import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CompanySwitcher from "@/components/company/switcher";
import { Building, Users, Calendar, Globe, MapPin } from "lucide-react";
import CompanyInfoCard from "@/components/company/CompanyInfoCard"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import NoCompaniesCard from "@/components/company/NoCompaniesCard";


export default function DashboardPage() {
  const { currentCompany, companies } = useCompany();
  const { profile, loading: authLoading } = useAuth();

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentCompany ? `${currentCompany.name} Dashboard` : "Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="capitalize">
            {profile?.user_type?.replace("_", " ")}
          </Badge>
          <CompanySwitcher />
        </div>
      </div>

      {!currentCompany ? (
        <NoCompaniesCard />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Company Info Card */}
          <CompanyInfoCard company={currentCompany} />

          {/* Actions Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your company and team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Team
                </Button>
                <Button variant="outline">
                  <Building className="mr-2 h-4 w-4" />
                  Company Settings
                </Button>
                <Button variant="outline">View Analytics</Button>
              </div>
            </CardContent>
          </Card>

          {/* Companies List Card (for admins with multiple companies) */}
          {companies.length > 1 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Your Companies</CardTitle>
                <CardDescription>
                  All companies you have access to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        company.id === currentCompany.id
                          ? "bg-primary/5 border-primary"
                          : "bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {company.employee_count
                              ? `${company.employee_count} employees`
                              : "No employee count"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          company.id === currentCompany.id
                            ? "default"
                            : "secondary"
                        }
                      >
                        {company.id === currentCompany.id
                          ? "Current"
                          : "Switch"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}




