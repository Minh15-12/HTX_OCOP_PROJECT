import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 py-5 max-w-[1400px] w-full min-w-0 mx-auto">
          <Breadcrumb />
          <div className="mt-3">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
