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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Building2,
  LayoutGrid,
  Rows3,
  Plus,
  Edit,
  MapPin,
  Users,
  Calendar,
  Globe,
  User,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Company } from "@/types/company";
import CompanyForm from "@/components/company/company-form-dialog";

type ViewMode = "table" | "grid";

const formatLocation = (location: Company["location"]): string => {
  if (!location) return "—";
  if (typeof location === "string") return location;
  const { address, city, country } = location;
  return [city, country].filter(Boolean).join(", ") || "—";
};

const formatIndustry = (industry: Company["industry"]): string => {
  if (!industry) return "—";
  if (typeof industry === "string") return industry;
  return industry.primary || "—";
};

const formatCEO = (ceo: Company["ceo"]): string => {
  if (!ceo) return "—";
  if (typeof ceo === "string") return ceo;
  return ceo.name || "—";
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function CompaniesView() {
  const {
    companies,
    currentCompany,
    refetchCompanies,
    setCurrentCompany,
    loading,
  } = useAuthStore();

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  const handleCompanySelect = (id: string) => {
    const selected = companies.find((c) => c.id === id) || null;
    setCurrentCompany(selected);
  };

  const handleSuccess = () => {
    setEditingCompany(null);
    setCreateOpen(false);
  };

  const isLoading = loading.companies;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Building2 className="text-primary h-6 w-6" />
            </div>
            Companies
          </h1>
          <p className="text-muted-foreground text-base">
            Manage and view your associated companies
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

          <Button onClick={() => setCreateOpen(true)} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            New Company
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
            <p className="text-muted-foreground mt-4 text-lg">
              Loading companies...
            </p>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <Card className="border-none text-center shadow-none">
          <CardContent className="p-12">
            <Building2 className="text-muted-foreground mx-auto h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold">No companies found</h3>
            <p className="text-muted-foreground mt-2">
              Get started by creating your first company profile.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Company
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
                            Company
                          </TableHead>
                          <TableHead className="min-w-[150px]">
                            Industry
                          </TableHead>
                          <TableHead className="min-w-[150px]">
                            Location
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            Founded
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            Employees
                          </TableHead>
                          <TableHead className="min-w-[150px]">CEO</TableHead>
                          <TableHead className="min-w-[100px]">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[100px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies.map((company) => (
                          <TableRow
                            key={company.id}
                            className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                              currentCompany?.id === company.id
                                ? "bg-muted"
                                : ""
                            }`}
                            onClick={() => handleCompanySelect(company.id)}
                          >
                            {/* Fixed First Column */}
                            <TableCell className="bg-background sticky left-0 z-10 border-r font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border">
                                  <AvatarImage src={company.logo_url || ""} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {getInitials(company.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">
                                    {company.name}
                                  </p>
                                  {company.website && (
                                    <div className="mt-1 flex items-center gap-1">
                                      <Globe className="text-muted-foreground h-3 w-3" />
                                      <p className="text-muted-foreground truncate text-xs">
                                        {company.website.replace(
                                          /^https?:\/\//,
                                          "",
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Scrollable Columns */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Briefcase className="text-muted-foreground h-4 w-4" />
                                <span>{formatIndustry(company.industry)}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="text-muted-foreground h-4 w-4" />
                                <span>{formatLocation(company.location)}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              {company.founded ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="text-muted-foreground h-4 w-4" />
                                  <span>{company.founded}</span>
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>

                            <TableCell>
                              {company.employee_count ? (
                                <div className="flex items-center gap-2">
                                  <Users className="text-muted-foreground h-4 w-4" />
                                  <span>
                                    {company.employee_count.toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="text-muted-foreground h-4 w-4" />
                                <span>{formatCEO(company.ceo)}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={
                                  currentCompany?.id === company.id
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  currentCompany?.id === company.id
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                                    : ""
                                }
                              >
                                {currentCompany?.id === company.id
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCompany(company);
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
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className={`group flex h-fit cursor-pointer flex-col gap-4 p-2 transition-all duration-200 hover:shadow-lg ${
                      currentCompany?.id === company.id
                        ? "rounded-md border border-gray-200 shadow-none"
                        : "border-border"
                    }`}
                    onClick={() => handleCompanySelect(company.id)}
                  >
                    <div className="h-fit">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2">
                            <AvatarImage src={company.logo_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(company.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="truncate text-lg leading-tight">
                              {company.name}
                            </CardTitle>
                            {company.website && (
                              <CardDescription className="truncate text-xs">
                                {company.website.replace(/^https?:\/\//, "")}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            currentCompany?.id === company.id
                              ? "default"
                              : "outline"
                          }
                          className={
                            currentCompany?.id === company.id
                              ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                              : ""
                          }
                        >
                          {currentCompany?.id === company.id
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex h-fit flex-col gap-4">
                      {/* Description */}
                      {company.description && (
                        <div>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {company.description}
                          </p>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Briefcase className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-medium">
                              Industry
                            </span>
                          </div>
                          <p className="text-muted-foreground truncate text-xs">
                            {formatIndustry(company.industry)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-medium">
                              Location
                            </span>
                          </div>
                          <p className="text-muted-foreground truncate text-xs">
                            {formatLocation(company.location)}
                          </p>
                        </div>

                        {company.founded && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="text-muted-foreground h-3 w-3" />
                              <span className="text-xs font-medium">
                                Founded
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {company.founded}
                            </p>
                          </div>
                        )}

                        {company.employee_count && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="text-muted-foreground h-3 w-3" />
                              <span className="text-xs font-medium">
                                Employees
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {company.employee_count.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* CEO */}
                      <div className="h-fit">
                        <div className="flex items-center gap-2">
                          <User className="text-muted-foreground h-3 w-3" />
                          <span className="text-xs font-medium">CEO</span>
                        </div>
                        <p className="text-muted-foreground truncate text-xs">
                          {formatCEO(company.ceo)}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full transition-opacity group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCompany(company);
                          }}
                        >
                          <Edit className="mr-2 h-3 w-3" /> Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Controlled Dialogs - Fixed Props */}
      <CompanyForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />

      <CompanyForm
        company={editingCompany}
        open={!!editingCompany}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingCompany(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
