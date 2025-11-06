// app/dashboard/jobs/page.tsx
"use client";

import JobsView from "@/components/jobs/jobs-view";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs Management</h1>
        <p className="text-muted-foreground">
          Create and manage job postings for your company
        </p>
      </div>
      <JobsView />
    </div>
  );
}
