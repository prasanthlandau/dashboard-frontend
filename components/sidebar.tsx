'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Sidebar = () => {
  const pathname = usePathname();
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: <DashboardCustomizeIcon />, label: 'Dashboard' },
    { path: '/users', icon: <PeopleAltIcon />, label: 'Users' },
    {
      path: '/reports',
      icon: <AssessmentIcon />,
      label: 'Classroom',
      subMenu: [
        { path: '/reports/classroom', icon: <SchoolIcon />, label: 'Classroom' },
        { path: '/reports/teacher', icon: <PersonIcon />, label: 'Teacher' },
        { path: '/reports/student', icon: <PeopleAltIcon />, label: 'Student' }
      ]
    },
    { path: '/watchtime', icon: <TimelineIcon />, label: 'WatchTime' },
    { path: '/zero', icon: <PeopleAltIcon />, label: 'User With Zero WT' }
  ];

  return (
    <div className="flex flex-col bg-dark w-[310px] rounded-10 p-30 min-h-[calc(100%-100px)]">
      <h1 className='font-inter text-white uppercase font-semibold'>
        Executive Dashboard
      </h1>
      <hr className='my-10' />
      
      <ul className='text-white font-inter'>
        {menuItems.map((item) => (
          <li key={item.path}>
            {item.subMenu ? (
              <div>
                <div 
                  onClick={() => setIsClassroomOpen(!isClassroomOpen)}
                  className={`py-10 text-15 hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-colors duration-200 cursor-pointer flex items-center justify-between px-4 ${
                    pathname.startsWith('/reports') ? 'bg-[rgba(255,255,255,0.1)]' : ''
                  }`}
                >
                  <div className="flex gap-10 items-center">
                    <span className={pathname.startsWith('/reports') ? 'text-[#0066cc]' : ''}>
                      {item.icon}
                    </span>
                    <span className={pathname.startsWith('/reports') ? 'text-[#0066cc]' : ''}>
                      {item.label}
                    </span>
                  </div>
                  {isClassroomOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </div>
                
                {isClassroomOpen && (
                  <ul className="ml-8">
                    {item.subMenu.map((subItem) => (
                      <li 
                        key={subItem.path}
                        className={`py-8 text-14 hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-colors duration-200 ${
                          pathname === subItem.path ? 'bg-[rgba(255,255,255,0.1)]' : ''
                        }`}
                      >
                        <Link 
                          href={subItem.path}
                          className={`flex gap-10 items-center px-4 ${
                            pathname === subItem.path ? 'text-[#0066cc]' : 'text-white'
                          }`}
                        >
                          <span className={pathname === subItem.path ? 'text-[#0066cc]' : ''}>
                            {subItem.icon}
                          </span>
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link 
                href={item.path}
                className={`flex gap-10 items-center px-4 py-10 text-15 hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-colors duration-200 ${
                  pathname === item.path ? 'bg-[rgba(255,255,255,0.1)] text-[#0066cc]' : 'text-white'
                }`}
              >
                <span className={pathname === item.path ? 'text-[#0066cc]' : ''}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
