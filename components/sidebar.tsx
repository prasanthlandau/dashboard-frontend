'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelRightClose,
  AreaChart,
  User,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  subMenu?: NavItem[];
}

const menuItems: NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Users' },
  {
    path: '/reports/classroom',
    icon: AreaChart,
    label: 'Reports',
    subMenu: [
      { path: '/reports/classroom', icon: BookOpen, label: 'Classroom' },
      { path: '/reports/teacher', icon: User, label: 'Teacher' },
      { path: '/reports/student', icon: Users, label: 'Student' },
    ],
  },
  { path: '/watchtime', icon: Clock, label: 'WatchTime' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  {
    path: '/reports/weekly',
    icon: AreaChart,
    label: 'One Click Report',
    subMenu: [
      { path: '/reports/data-point', icon: BookOpen, label: 'Tech' },
      { path: '/reports/user-data', icon: User, label: 'Implementation' },
    ],
  },
  { path: '/zero', icon: AlertTriangle, label: 'User With Zero WT' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ Multiple submenu state
  const [submenuOpen, setSubmenuOpen] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (path: string) => {
    setSubmenuOpen((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col justify-between bg-card text-card-foreground border-r transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div>
          {/* Header with Collapse Button */}
          <div
            className={cn(
              'flex items-center border-b',
              isCollapsed ? 'p-2 justify-center' : 'p-4 justify-between'
            )}
          >
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-primary">Aspire Dashboard</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            <ul className="space-y-2 px-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  {item.subMenu ? (
                    <>
                      <div
                        onClick={() => toggleSubMenu(item.path)}
                        className={cn(
                          'flex items-center p-2 rounded-md cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          pathname.startsWith(item.path) &&
                            'bg-accent text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 flex-1">{item.label}</span>
                        )}
                        {!isCollapsed &&
                          (submenuOpen[item.path] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>

                      {/* Render Submenus if open */}
                      {submenuOpen[item.path] && !isCollapsed && (
                        <ul className="pl-7 mt-2 space-y-2">
                          {item.subMenu.map((subItem) => (
                            <li key={subItem.path}>
                              <Link href={subItem.path}>
                                <div
                                  className={cn(
                                    'flex items-center p-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                    pathname === subItem.path &&
                                      'bg-primary text-primary-foreground'
                                  )}
                                >
                                  <subItem.icon className="h-4 w-4 mr-3" />
                                  <span>{subItem.label}</span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={item.path}>
                          <div
                            className={cn(
                              'flex items-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                              pathname === item.path &&
                                'bg-primary text-primary-foreground',
                              isCollapsed && 'justify-center'
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && <span className="ml-3">{item.label}</span>}
                          </div>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      )}
                    </Tooltip>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
