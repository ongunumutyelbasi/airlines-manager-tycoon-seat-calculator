import React from 'react';
// Import any icons you want to use from lucide-react (or another library)
import { Plane, LayoutDashboard, Database, Settings } from 'lucide-react'; 

// A helper component for consistent link styling
const SidebarLink: React.FC<{ href: string; icon: React.ReactNode; text: string }> = ({ href, icon, text }) => (
  <a
    href={href} // Or use <Link href={href}> if you are inside a Next.js environment
    className="flex items-center gap-3 p-3 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
  >
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </a>
);

// The main Sidebar component
const Sidebar: React.FC = () => {
  return (
    // Tailwind classes for fixed width, sticky positioning, and dark background
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 p-4 sticky top-0 h-screen">
      <div className="flex items-center gap-3 p-2 mb-8 border-b border-gray-800/50 pb-4">
        <Plane className="w-8 h-8 text-indigo-400" />
        <h1 className="text-xl font-bold text-white tracking-wider">Airlines Tycoon</h1>
      </div>
      <nav className="flex-1 space-y-2">
        <SidebarLink
          href="/"
          icon={<LayoutDashboard className="w-5 h-5" />}
          text="Calculator"
        />
        <SidebarLink
          href="/database"
          icon={<Database className="w-5 h-5" />}
          text="Aircraft Database"
        />
        <SidebarLink
          href="/settings"
          icon={<Settings className="w-5 h-5" />}
          text="Settings"
        />
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-800/50">
        <p className="text-xs text-gray-500">v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
