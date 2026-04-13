import React from "react";
import TestAccountsTable from "@/components/data-table-test-accounts";

const TestAccountsPage = () => {
  return (
    <div className="flex flex-wrap w-full">
      <div className="w-full mt-30 overflow-x-scroll">
        <TestAccountsTable />
      </div>
    </div>
  );
};

export default TestAccountsPage;
