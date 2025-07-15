'use client';
import Header from '@/components/header';
import React from 'react';
import DataTableLeaderboard from '@/components/data-table-leaderboard';

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">
        <DataTableLeaderboard />
      </main>
    </div>
  );
};

export default Leaderboard;
