'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, Users, BookOpen, Clock, AlertTriangle } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart2 },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/classroom', label: 'Classroom', icon: BookOpen },
  { href: '/watchtime', label: 'WatchTime', icon: Clock },
  { href: '/user-with-zero-wt', label: 'User With Zero WT', icon: AlertTriangle },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Executive Dashboard</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div
                  className={`flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    pathname === item.href ? 'bg-blue-100 dark:bg-blue-900/50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
