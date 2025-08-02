import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  SparklesIcon,
  BellIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import NotificationMenu from './NotificationMenu';
import logoFinea from '../../assets/images/logo_finea.png';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Utilisateurs', href: '/users', icon: UsersIcon },
    { name: 'Concours', href: '/contests', icon: TrophyIcon },
    { name: 'Newsletter', href: '/newsletter', icon: EnvelopeIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Statistiques', href: '/stats', icon: ChartBarIcon },
    { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                 <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
           <div className="flex h-16 items-center justify-between px-4">
             <div className="flex items-center">
               <img 
                 src={logoFinea} 
                 alt="Finéa Académie" 
                 className="h-8 w-auto"
               />
             </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
               <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
           <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
             <div className="flex h-16 items-center px-4 border-b border-gray-200">
               <div className="flex items-center">
                 <img 
                   src={logoFinea} 
                   alt="Finéa Académie" 
                   className="h-8 w-auto"
                 />
               </div>
             </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600">
                <SparklesIcon className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium">Finéa Académie Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Menu Notifications */}
              <NotificationMenu />
              
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
                             <div className="flex items-center gap-x-4">
                 <div className="flex items-center space-x-2">
                   <img 
                     src={logoFinea} 
                     alt="Finéa Académie" 
                     className="h-6 w-auto"
                   />
                   <span className="text-sm font-semibold text-gray-700">Admin Dashboard</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;