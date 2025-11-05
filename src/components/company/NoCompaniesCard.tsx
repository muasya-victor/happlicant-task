"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Building, } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function NoCompaniesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Companies Found</CardTitle>
        <CardDescription>
          You don't have access to any companies yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button>
          <Building className="mr-2 h-4 w-4" />
          Create Your First Company
        </Button>
      </CardContent>
    </Card>
  );
}
