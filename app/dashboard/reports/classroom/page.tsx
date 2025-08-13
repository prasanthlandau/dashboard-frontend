import React from "react";
import DataTableClassroomComponent from "@/components/data-table-classroom";

const Reports = () => {
  return (
    <div className="flex flex-wrap w-full">
      <div className="w-full mt-30 overflow-x-scroll">
        <DataTableClassroomComponent />
      </div>
    </div>
  );
};

export default Reports;
