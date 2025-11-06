import React from "react";
import { AddCompanyDialog } from "./AddCompanyDialog";
import { CompaniesTable } from "./CompaniesTable";

export default function CompaniesView(){
    return(
        <div className="flex flex-col gap-4">
            <AddCompanyDialog/>
            <CompaniesTable/>
        </div>
    )
}