"use client";

import React from "react";
import Header from "@/components/header";
import DataUser from "@/components/data-user";

const Reports = () => {
  const handleRefresh = () => {
    console.log("Refresh triggered");
  };

  return (
    <>
      <Header onRefresh={handleRefresh} />
      <div className="w-full px-1 md:px-4 pt-2">
        <div className="w-full min-w-[320px] mt-4 overflow-x-auto">
          <DataUser />
        </div>
      </div>
    </>
  );
};

export default Reports;
