"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { Plus, Edit } from "lucide-react";
import client from "@/api/client";
import type { Company, Location, Industry, CEO } from "@/types/company";

interface CompanyDialogProps {
  company?: Company | null;
  mode?: "add" | "edit";
  onSuccess?: () => void;
}

// Safe accessor functions
const getLocationField = (
  location: Location | undefined,
  field: string,
): string => {
  if (!location) return "";
  if (typeof location === "string") return field === "address" ? location : "";
  return (location as any)[field] || "";
};

const getIndustryField = (
  industry: Industry | undefined,
  field: string,
): string => {
  if (!industry) return "";
  if (typeof industry === "string") return field === "primary" ? industry : "";
  if (field === "primary") return (industry as any).primary || "";
  if (field === "sectors") return (industry as any).sectors?.join(", ") || "";
  return "";
};

const getCEOField = (ceo: CEO | undefined, field: string): string => {
  if (!ceo) return "";
  if (typeof ceo === "string") return field === "name" ? ceo : "";
  return (ceo as any)[field] || "";
};

export function CompanyDialog({
  company,
  mode = "add",
  onSuccess,
}: CompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form fields with safe defaults
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [employeeCount, setEmployeeCount] = useState<number | "">("");
  const [founded, setFounded] = useState<number | "">("");

  // Location fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  // Industry fields
  const [primaryIndustry, setPrimaryIndustry] = useState("");
  const [sectors, setSectors] = useState("");

  // CEO fields
  const [ceoName, setCeoName] = useState("");
  const [ceoSince, setCeoSince] = useState<number | "">("");
  const [ceoBio, setCeoBio] = useState("");

  const refetchCompanies = useAuthStore((s) => s.refetchCompanies);
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany);
  const user = useAuthStore((s) => s.user);

  // Reset form when dialog opens/closes or company changes
  useEffect(() => {
    if (open && company && mode === "edit") {
      // Safe population of form fields
      setName(company.name || "");
      setDescription(company.description || "");
      setWebsite(company.website || "");
      setLogoUrl(company.logo_url || "");
      setEmployeeCount(company.employee_count || "");
      setFounded(company.founded || "");

      // Safe location parsing
      setAddress(getLocationField(company.location, "address"));
      setCity(getLocationField(company.location, "city"));
      setZipCode(getLocationField(company.location, "zip_code"));
      setCountry(getLocationField(company.location, "country"));

      // Safe industry parsing
      setPrimaryIndustry(getIndustryField(company.industry, "primary"));
      setSectors(getIndustryField(company.industry, "sectors"));

      // Safe CEO parsing
      setCeoName(getCEOField(company.ceo, "name"));
      setCeoSince(getCEOField(company.ceo, "since") || "");
      setCeoBio(getCEOField(company.ceo, "bio"));
    } else if (open && mode === "add") {
      // Reset all fields for add mode
      setName("");
      setDescription("");
      setWebsite("");
      setLogoUrl("");
      setEmployeeCount("");
      setFounded("");
      setAddress("");
      setCity("");
      setZipCode("");
      setCountry("");
      setPrimaryIndustry("");
      setSectors("");
      setCeoName("");
      setCeoSince("");
      setCeoBio("");
    }
  }, [open, company, mode]);

  const prepareCompanyData = () => {
    // Build location object only if we have relevant data
    const location: Location | undefined =
      address || city || zipCode || country
        ? {
            ...(address && { address }),
            ...(city && { city }),
            ...(zipCode && { zip_code: zipCode }),
            ...(country && { country }),
          }
        : undefined;

    // Build industry object only if we have relevant data
    const industry: Industry | undefined =
      primaryIndustry || sectors
        ? {
            ...(primaryIndustry && { primary: primaryIndustry }),
            ...(sectors && {
              sectors: sectors
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }),
          }
        : undefined;

    // Build CEO object only if we have relevant data
    const ceo: CEO | undefined =
      ceoName || ceoSince || ceoBio
        ? {
            ...(ceoName && { name: ceoName }),
            ...(ceoSince && { since: Number(ceoSince) }),
            ...(ceoBio && { bio: ceoBio }),
          }
        : undefined;

    return {
      name: name.trim(),
      ...(description.trim() && { description: description.trim() }),
      ...(website.trim() && { website: website.trim() }),
      ...(logoUrl.trim() && { logo_url: logoUrl.trim() }),
      ...(employeeCount && { employee_count: Number(employeeCount) }),
      ...(founded && { founded: Number(founded) }),
      ...(location && Object.keys(location).length > 0 && { location }),
      ...(industry && Object.keys(industry).length > 0 && { industry }),
      ...(ceo && Object.keys(ceo).length > 0 && { ceo }),
    };
  };

  const onSave = async () => {
    if (!name.trim() || !user) {
      setErrorMsg("Company name is required");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const companyData = prepareCompanyData();

      if (mode === "add") {
        // Create new company
        const { data: newCompany, error: companyError } = await client
          .from("companies")
          .insert(companyData)
          .select()
          .single();

        if (companyError) throw companyError;
        if (!newCompany) throw new Error("Failed to create company");

        // Assign current user as company admin
        const { error: adminError } = await client
          .from("company_admins")
          .insert({
            user_id: user.id,
            company_id: newCompany.id,
            role: "owner",
          });

        if (adminError) throw adminError;

        // Set as current company
        setCurrentCompany(newCompany);
      } else if (mode === "edit" && company) {
        // Update existing company
        const { error: companyError } = await client
          .from("companies")
          .update(companyData)
          .eq("id", company.id);

        if (companyError) throw companyError;
      }

      // Refetch companies
      await refetchCompanies();

      // Reset and close
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      console.error(`Failed to ${mode} company:`, err);
      setErrorMsg(
        err.message || `Failed to ${mode} company. Please try again.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const dialogTitle = mode === "add" ? "Add Company" : "Edit Company";
  const submitButtonText = saving
    ? mode === "add"
      ? "Creating..."
      : "Updating..."
    : mode === "add"
      ? "Create Company"
      : "Update Company";

  const TriggerButton =
    mode === "add" ? (
      <Button variant="outline" className="flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add Company
      </Button>
    ) : (
      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <Edit className="h-4 w-4" /> Edit
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex w-full justify-end">{TriggerButton}</div>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {errorMsg && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={!name.trim() ? "border-red-300" : ""}
              />
              {!name.trim() && (
                <p className="mt-1 text-sm text-red-500">
                  Company name is required
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <Textarea
                placeholder="Company description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Website
                </label>
                <Input
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Logo URL
                </label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Employee Count
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={employeeCount}
                  onChange={(e) =>
                    setEmployeeCount(
                      e.target.value ? parseInt(e.target.value) : "",
                    )
                  }
                  min="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Founded Year
                </label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={founded}
                  onChange={(e) =>
                    setFounded(e.target.value ? parseInt(e.target.value) : "")
                  }
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-lg font-medium">Location Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>
                  <Input
                    placeholder="Street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">City</label>
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    ZIP Code
                  </label>
                  <Input
                    placeholder="ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Country
                  </label>
                  <Input
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Industry Section */}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-lg font-medium">Industry Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Primary Industry
                  </label>
                  <Input
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={primaryIndustry}
                    onChange={(e) => setPrimaryIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Sectors (comma separated)
                  </label>
                  <Input
                    placeholder="SaaS, Cloud, AI, FinTech"
                    value={sectors}
                    onChange={(e) => setSectors(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* CEO Section */}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-lg font-medium">CEO Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    CEO Name
                  </label>
                  <Input
                    placeholder="CEO name"
                    value={ceoName}
                    onChange={(e) => setCeoName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    CEO Since
                  </label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={ceoSince}
                    onChange={(e) =>
                      setCeoSince(
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    CEO Bio
                  </label>
                  <Textarea
                    placeholder="CEO biography"
                    value={ceoBio}
                    onChange={(e) => setCeoBio(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onSave} disabled={saving || !name.trim()}>
              {submitButtonText}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export AddCompanyDialog for backward compatibility
export function AddCompanyDialog() {
  return <CompanyDialog mode="add" />;
}
