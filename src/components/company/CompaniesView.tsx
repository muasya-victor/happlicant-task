import React from "react";
import { CompanyDialog } from "./CompanyDialog";
import { CompaniesTable } from "./CompaniesTable";

export default function CompaniesView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <CompanyDialog />
      </div>
      <CompaniesTable />
    </div>
  );
}
