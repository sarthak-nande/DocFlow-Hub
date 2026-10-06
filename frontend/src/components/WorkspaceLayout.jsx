import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function WorkspaceLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 flex">
      {/* Mobile Overlay Background (Darkens screen when sidebar is open on mobile) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed((value) => !value)} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Main Content Area */}
      <div 
        className={`flex-1 min-h-screen min-w-0 transition-[margin] duration-300 
        ${collapsed ? 'md:ml-[76px]' : 'md:ml-64'}`}
      >
        {/* Pass onMenuToggle to Navbar so the hamburger button works */}
        <Navbar 
          title={title} 
          onMenuToggle={() => setMobileMenuOpen(true)} 
        />
        
        {children}
      </div>
    </div>
  );
}