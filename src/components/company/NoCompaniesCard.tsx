"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NoCompaniesCard() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>No Companies Found</CardTitle>
        <CardDescription>
          You don't have access to any companies yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => router.push("/dashboard/companies")}>
          <Building className="mr-2 h-4 w-4" />
          Create Your First Company
        </Button>
      </CardContent>
    </Card>
  );
}
