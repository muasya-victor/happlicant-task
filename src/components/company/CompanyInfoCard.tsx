import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building,Globe, MapPin } from "lucide-react";


export default function CompanyInfoCard({ company }: { company: any }) {
  const renderLocation = (location: any) => {
    if (typeof location === "string") return location;
    if (location?.address) {
      return `${location.address}, ${location.city || ""} ${location.zip_code || ""}`.trim();
    }
    return "No location specified";
  };

  const renderIndustry = (industry: any) => {
    if (typeof industry === "string") return industry;
    return industry?.primary || "Not specified";
  };

  return (
    <Card className="md:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Basic details about your company</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Building className="text-muted-foreground h-5 w-5" />
          <div>
            <p className="font-medium">Name</p>
            <p className="text-muted-foreground text-sm">{company.name}</p>
          </div>
        </div>

        {company.description && (
          <div>
            <p className="font-medium">Description</p>
            <p className="text-muted-foreground text-sm">
              {company.description}
            </p>
          </div>
        )}

        {company.industry && (
          <div>
            <p className="font-medium">Industry</p>
            <p className="text-muted-foreground text-sm">
              {renderIndustry(company.industry)}
            </p>
          </div>
        )}

        {company.location && (
          <div className="flex items-center gap-3">
            <MapPin className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-muted-foreground text-sm">
                {renderLocation(company.location)}
              </p>
            </div>
          </div>
        )}

        {company.website && (
          <div className="flex items-center gap-3">
            <Globe className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="font-medium">Website</p>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline"
              >
                {company.website}
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}