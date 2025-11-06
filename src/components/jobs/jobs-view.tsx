import React from "react";
import { JobDialog } from "./JobDialog";
import { JobsTable } from "./jobs-table";

export default function JobsView (){
  return (
    <div className="flex flex-col gap-4">
      <JobDialog />
      <JobsTable />
    </div>
  );
}