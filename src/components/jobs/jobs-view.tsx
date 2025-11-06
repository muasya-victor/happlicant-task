import React from "react";
import { AddJobDialog } from "./AddJobDialog";
import { JobsTable } from "./jobs-table";

export default function JobsView (){
  return (
    <div className="flex flex-col gap-4">
      <AddJobDialog />
      <JobsTable />
    </div>
  );
}