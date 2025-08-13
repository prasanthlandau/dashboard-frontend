import React from "react";
import DataTableZeroComponent from "@/components/data-table-zero";

const Users = () => {
  return (
    <div className="flex flex-wrap w-full">
      <div className="w-full mt-30 overflow-x-scroll">
        <DataTableZeroComponent />
      </div>
    </div>
  );
};

export default Users;
