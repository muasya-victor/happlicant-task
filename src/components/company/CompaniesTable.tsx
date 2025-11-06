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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { Building, MapPin, Users, Calendar, Globe, Edit } from "lucide-react";
import { CompanyDialog } from "./CompanyDialog";
import { DeleteCompanyDialog } from "./DeleteCompanyDialog";
import type { Location, Industry, CEO } from "@/types/company";
import TableEmpty from "../states/table-empty";
import TableSkeleton from "../states/table-loading";

// Safe utility functions
const formatEmployeeCount = (count?: number): string => {
  if (!count) return "Not specified";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
  return count.toString();
};

const getLocationDisplay = (location?: Location): string => {
  if (!location) return "Not specified";
  if (typeof location === "string") return location;

  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.country) parts.push(location.country);
  return (
    parts.join(", ") ||
    (location.address ? "Address specified" : "Not specified")
  );
};

const getIndustryDisplay = (industry?: Industry): string => {
  if (!industry) return "Not specified";
  if (typeof industry === "string") return industry;
  return industry.primary || "Not specified";
};

const getCEODisplay = (ceo?: CEO): string => {
  if (!ceo) return "Not specified";
  if (typeof ceo === "string") return ceo;
  return ceo.name || "Not specified";
};

const formatWebsite = (website?: string): string => {
  if (!website) return "No website";
  return website.replace(/^https?:\/\//, "");
};

const getDisplayDate = (dateString?: string): string => {
  if (!dateString) return "Unknown";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Invalid date";
  }
};

export const CompaniesTable = memo(() => {
  const [view, setView] = useState<"table" | "grid">("table");
  const companies = useAuthStore((s) => s.companies);
  const loading = useAuthStore((s) => s.loading.companies);
  const refetchCompanies = useAuthStore((s) => s.refetchCompanies);

  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  const handleSuccess = () => {
    console.log("Operation completed successfully");
  };

  if (loading) return <TableSkeleton />;
  if (!companies.length) return <TableEmpty />;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Your Companies
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage all your companies and their details
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
            className="flex items-center gap-2"
          >
            Table View
          </Button>
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
            className="flex items-center gap-2"
          >
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
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Industry</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Employees</TableHead>
                  <TableHead className="font-semibold">Founded</TableHead>
                  <TableHead className="font-semibold">CEO</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="border-b transition-colors hover:bg-gray-50/30"
                  >
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="h-10 w-10 rounded-md object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {company.name || "Unnamed Company"}
                          </div>
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <Globe className="h-3 w-3" />
                              {formatWebsite(company.website)}
                            </a>
                          )}
                          {company.description && (
                            <div className="mt-1 line-clamp-2 text-sm text-gray-500">
                              {company.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getIndustryDisplay(company.industry)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {getLocationDisplay(company.location)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        {formatEmployeeCount(company.employee_count)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {company.founded || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {getCEODisplay(company.ceo)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <CompanyDialog
                          company={company}
                          mode="edit"
                          onSuccess={handleSuccess}
                        />
                        <DeleteCompanyDialog
                          company={company}
                          onSuccess={handleSuccess}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="border shadow-none transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="h-12 w-12 rounded-md object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
                        <Building className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg leading-6 font-semibold">
                        {company.name || "Unnamed Company"}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {getIndustryDisplay(company.industry)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {company.description && (
                  <p className="line-clamp-3 text-sm text-gray-600">
                    {company.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {getLocationDisplay(company.location)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatEmployeeCount(company.employee_count)} employees
                    </span>
                  </div>

                  {company.founded && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Founded {company.founded}
                      </span>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {formatWebsite(company.website)}
                      </a>
                    </div>
                  )}

                  {company.ceo && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">CEO: </span>
                      <span className="text-gray-900">
                        {getCEODisplay(company.ceo)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-xs text-gray-500">
                    Updated{" "}
                    {getDisplayDate(company.updated_at || company.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CompanyDialog
                      company={company}
                      mode="edit"
                      onSuccess={handleSuccess}
                    />
                    <DeleteCompanyDialog
                      company={company}
                      onSuccess={handleSuccess}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
