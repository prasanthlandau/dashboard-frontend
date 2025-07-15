'use client';
import Header from '@/components/header';
import React from 'react';
import DataTableLeaderboard from '@/components/data-table-leaderboard';

const Leaderboard = () => {
  return (

    <div className="flex flex-wrap w-full">
      <div className="w-full mt-30 overflow-x-scroll">
        <DataTableLeaderboard />
      </div>
    </div>
  );
};

export default Leaderboard;
