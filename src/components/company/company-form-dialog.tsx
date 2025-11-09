"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Edit } from "lucide-react";
import client from "@/api/client";
import type { Company } from "@/types/company";

interface CompanyFormProps {
  company?: Company | null;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function CompanyForm({
  company,
  onSuccess,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
}: CompanyFormProps) {
  const isEditing = !!company;
  const { user, refetchCompanies, setLoading, loading } = useAuthStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    founded: "",
    employee_count: "",
    ceoName: "",
    ceoSince: "",
    ceoBio: "",
    industryPrimary: "",
    industrySectors: "",
    address: "",
    city: "",
    zip_code: "",
    country: "",
    logo_url: "",
  });

  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  // Initialize form data when company changes or dialog opens
  useEffect(() => {
    if (company && open) {
      // Parse location
      let address = "",
        city = "",
        zip_code = "",
        country = "";
      if (company.location) {
        if (typeof company.location === "string") {
          city = company.location;
        } else {
          address = company.location.address || "";
          city = company.location.city || "";
          zip_code = company.location.zip_code || "";
          country = company.location.country || "";
        }
      }

      // Parse industry
      let industryPrimary = "",
        industrySectors = "";
      if (company.industry) {
        if (typeof company.industry === "string") {
          industryPrimary = company.industry;
        } else {
          industryPrimary = company.industry.primary || "";
          industrySectors = company.industry.sectors?.join(", ") || "";
        }
      }

      // Parse CEO
      let ceoName = "",
        ceoSince = "",
        ceoBio = "";
      if (company.ceo) {
        if (typeof company.ceo === "string") {
          ceoName = company.ceo;
        } else {
          ceoName = company.ceo.name || "";
          ceoSince = company.ceo.since?.toString() || "";
          ceoBio = company.ceo.bio || "";
        }
      }

      setFormData({
        name: company.name || "",
        description: company.description || "",
        website: company.website || "",
        founded: company.founded?.toString() || "",
        employee_count: company.employee_count?.toString() || "",
        ceoName,
        ceoSince,
        ceoBio,
        industryPrimary,
        industrySectors,
        address,
        city,
        zip_code,
        country,
        logo_url: company.logo_url || "",
      });
    } else if (!isEditing && open) {
      // Reset form for new company
      setFormData({
        name: "",
        description: "",
        website: "",
        founded: "",
        employee_count: "",
        ceoName: "",
        ceoSince: "",
        ceoBio: "",
        industryPrimary: "",
        industrySectors: "",
        address: "",
        city: "",
        zip_code: "",
        country: "",
        logo_url: "",
      });
    }
  }, [company, open, isEditing]);

  const isLoading = loading.companies;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !formData.name.trim()) return;

    setLoading("companies", true);

    try {
      // Prepare location object
      const location =
        formData.city || formData.country
          ? {
              ...(formData.address && { address: formData.address }),
              ...(formData.city && { city: formData.city }),
              ...(formData.zip_code && { zip_code: formData.zip_code }),
              ...(formData.country && { country: formData.country }),
            }
          : null;

      // Prepare industry object
      const industry = formData.industryPrimary
        ? {
            primary: formData.industryPrimary,
            ...(formData.industrySectors && {
              sectors: formData.industrySectors
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }),
          }
        : null;

      // Prepare CEO object
      const ceo = formData.ceoName
        ? {
            name: formData.ceoName,
            ...(formData.ceoSince && { since: parseInt(formData.ceoSince) }),
            ...(formData.ceoBio && { bio: formData.ceoBio }),
          }
        : null;

      if (isEditing && company?.id) {
        const { error } = await client
          .from("companies")
          .update({
            name: formData.name,
            description: formData.description,
            website: formData.website,
            logo_url: formData.logo_url,
            founded: formData.founded ? parseInt(formData.founded) : null,
            employee_count: formData.employee_count
              ? parseInt(formData.employee_count)
              : null,
            ceo,
            industry,
            location,
          })
          .eq("id", company.id);

        if (error) throw error;
      } else {
        const { error: rpcError } = await client.rpc(
          "create_company_admin_profile",
          {
            user_id: user.id,
            user_email: user.email,
            company_name: formData.name,
            company_description: formData.description,
            company_website: formData.website,
            company_logo_url: formData.logo_url,
            company_founded: formData.founded
              ? parseInt(formData.founded)
              : null,
            company_employee_count: formData.employee_count
              ? parseInt(formData.employee_count)
              : null,
            company_ceo: ceo,
            company_industry: industry,
            company_location: location,
          },
        );

        if (rpcError) throw rpcError;
      }

      await refetchCompanies();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error saving company:", err);
    } finally {
      setLoading("companies", false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger if no external control and trigger is provided */}
      {!externalOpen && trigger && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Company Details" : "Create New Company"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your company information below."
              : "Fill out the form to create a new company profile."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Kilele Tech Ltd"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Short description of your company..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  name="founded"
                  type="number"
                  value={formData.founded}
                  onChange={handleChange}
                  placeholder="e.g. 2020"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="employee_count">Employee Count</Label>
                <Input
                  id="employee_count"
                  name="employee_count"
                  type="number"
                  value={formData.employee_count}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="industryPrimary">Primary Industry</Label>
                <Input
                  id="industryPrimary"
                  name="industryPrimary"
                  value={formData.industryPrimary}
                  onChange={handleChange}
                  placeholder="e.g. Software Development"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="industrySectors">Industry Sectors</Label>
                <Input
                  id="industrySectors"
                  name="industrySectors"
                  value={formData.industrySectors}
                  onChange={handleChange}
                  placeholder="e.g. Tech, SaaS, AI (comma separated)"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Nairobi"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  placeholder="e.g. 00100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. Kenya"
                />
              </div>
            </div>
          </div>

          {/* CEO Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">CEO Information</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ceoName">CEO Name</Label>
              <Input
                id="ceoName"
                name="ceoName"
                value={formData.ceoName}
                onChange={handleChange}
                placeholder="e.g. Victor Mwendwa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ceoSince">CEO Since</Label>
                <Input
                  id="ceoSince"
                  name="ceoSince"
                  type="number"
                  value={formData.ceoSince}
                  onChange={handleChange}
                  placeholder="e.g. 2020"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ceoBio">CEO Bio</Label>
              <Textarea
                id="ceoBio"
                name="ceoBio"
                value={formData.ceoBio}
                onChange={handleChange}
                placeholder="Short biography of the CEO..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Company"
              ) : (
                "Create Company"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
