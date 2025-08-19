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
  DevicePhoneMobileIcon,
  TrophyIcon,
  CalendarIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import NotificationMenu from './NotificationMenu';
import logoFinea from '../assets/images/logo_finea.png';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Utilisateurs', href: '/users', icon: UsersIcon },
    { name: 'Concours', href: '/contests', icon: TrophyIcon },
    { name: 'Concours Hebdomadaire', href: '/weekly-contest', icon: CalendarIcon },
    { name: 'Newsletter', href: '/newsletter', icon: EnvelopeIcon },
    { name: 'Favoris', href: '/admin-favorites', icon: HeartIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Push Notifications', href: '/push-notifications', icon: DevicePhoneMobileIcon },
    { name: 'Statistiques', href: '/stats', icon: ChartBarIcon },
    { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col sidebar-glass shadow-2xl animate-slideInLeft">
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
            <div className="flex items-center">
              <img 
                src={logoFinea} 
                alt="Finéa Académie" 
                className="h-8 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
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
        <div className="flex flex-col flex-grow sidebar-glass shadow-xl border-r border-white/20">
          <div className="flex h-16 items-center px-4 border-b border-white/10 relative">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <img 
                  src={logoFinea} 
                  alt="Finéa Académie" 
                  className="h-6 w-auto"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Finéa Admin</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
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
          <div className="border-t border-white/10 p-4 mt-auto">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <SparklesIcon className="h-5 w-5 text-primary-600 animate-float" />
                <span className="text-sm font-medium">Finéa Académie</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 navbar-glass border-b border-white/20 px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden rounded-xl hover:bg-white/20 transition-all duration-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Menu Notifications */}
              <NotificationMenu />
              
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/20" />
              <div className="flex items-center gap-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <img 
                    src={logoFinea} 
                    alt="Finéa Académie" 
                    className="h-6 w-auto"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Admin Dashboard</span>
                    <div className="text-xs text-gray-500">v2.0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 min-h-screen relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="animate-fadeInUp">
              {children}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
        </main>
      </div>
    </div>
  );
};

export default Layout;