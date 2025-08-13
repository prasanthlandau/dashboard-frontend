import React from "react";
import DataTableReportComponent from "@/components/data-table-watchtime";

const Reports = () => {
  return (
    <div className="flex flex-wrap w-full">
      <div className="w-full mt-30 overflow-x-scroll">
        <DataTableReportComponent />
      </div>
    </div>
  );
};

export default Reports;
