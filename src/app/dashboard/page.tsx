// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CompanySwitcher from "@/components/company/switcher";
import { Building, Users, Calendar, Briefcase } from "lucide-react";
import CompanyInfoCard from "@/components/company/CompanyInfoCard";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import NoCompaniesCard from "@/components/company/NoCompaniesCard";
import { JobsTable } from "@/components/jobs/jobs-table";
import JobsView from "@/components/jobs/jobs-view";
import CompaniesView from "@/components/company/CompaniesView";

export default function DashboardPage() {
  const { currentCompany, companies } = useCompany();
  const { profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Reset to overview when company changes
  useEffect(() => {
    setActiveTab("overview");
  }, [currentCompany?.id]);

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CompanyInfoCard company={currentCompany} />
              {/* Add other overview cards here */}
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <JobsView />
          </TabsContent>

          <TabsContent value="companies">
            <CompaniesView/>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>
                  Manage your company settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground py-8 text-center">
                  <Building className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Settings content coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
