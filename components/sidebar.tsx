"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  subMenu?: NavItem[];
}

// Updated menuItems with the correct paths prefixed with /dashboard
const menuItems: NavItem[] = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/dashboard/users", icon: Users, label: "Users" },
  {
    path: "/dashboard/reports/classroom", // Unique key for this menu group
    icon: AreaChart,
    label: "Classroom Reports",
    subMenu: [
      {
        path: "/dashboard/reports/classroom",
        icon: BookOpen,
        label: "Classroom",
      },
      { path: "/dashboard/reports/teacher", icon: User, label: "Teacher" },
      { path: "/dashboard/reports/student", icon: Users, label: "Student" },
    ],
  },
  { path: "/dashboard/watchtime", icon: Clock, label: "WatchTime" },
  { path: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
  {
    path: "/dashboard/reports/weekly", // Unique key for this menu group
    icon: AreaChart,
    label: "One Click Report",
    subMenu: [
      { path: "/dashboard/reports/data-point", icon: BookOpen, label: "Tech" },
      {
        path: "/dashboard/reports/user-data",
        icon: User,
        label: "Implementation",
      },
    ],
  },
  { path: "/dashboard/zero", icon: AlertTriangle, label: "User With Zero WT" },
  /*{ path: "/dashboard/chat", icon: Bot, label: "AI Chat" },*/
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<Record<string, boolean>>({});

  // Effect to open the relevant submenu on page load
  useEffect(() => {
    const openSubmenu = () => {
      for (const item of menuItems) {
        if (
          item.subMenu?.some((subItem) => pathname.startsWith(subItem.path))
        ) {
          setSubmenuOpen((prev) => ({ ...prev, [item.path]: true }));
          return;
        }
      }
    };
    openSubmenu();
  }, [pathname]);

  const toggleSubMenu = (path: string) => {
    setSubmenuOpen((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col bg-card text-card-foreground border-r transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with Collapse Button */}
          <div
            className={cn(
              "flex items-center border-b",
              isCollapsed ? "p-2 justify-center" : "p-4 justify-between"
            )}
          >
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-primary">
                Aspire Dashboard
              </h1>
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
          <nav className="mt-6 flex-grow">
            <ul className="space-y-2 px-2">
              {menuItems.map((item) => {
                const isActiveGroup = item.subMenu?.some((sub) =>
                  pathname.startsWith(sub.path)
                );
                return (
                  <li key={item.path}>
                    {item.subMenu ? (
                      <>
                        <div
                          onClick={() => toggleSubMenu(item.path)}
                          className={cn(
                            "flex items-center p-2 rounded-md cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            isActiveGroup && "bg-accent text-accent-foreground"
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

                        {submenuOpen[item.path] && !isCollapsed && (
                          <ul className="pl-7 mt-2 space-y-2">
                            {item.subMenu.map((subItem) => (
                              <li key={subItem.path}>
                                <Link href={subItem.path}>
                                  <div
                                    className={cn(
                                      "flex items-center p-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                      pathname === subItem.path &&
                                        "bg-primary text-primary-foreground"
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
                                "flex items-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                pathname === item.path &&
                                  "bg-primary text-primary-foreground",
                                isCollapsed && "justify-center"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              {!isCollapsed && (
                                <span className="ml-3">{item.label}</span>
                              )}
                            </div>
                          </Link>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      isCollapsed && "justify-center w-full"
                    )}
                  >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3">Logout</span>}
                  </div>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
