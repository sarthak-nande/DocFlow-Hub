import { Bell, Search, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Navbar({ title = 'Profile', onMenuToggle }) {
  const username = useSelector((state) => state.auth?.username);
  
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button - Shows ONLY on mobile devices */}
        <button 
          onClick={onMenuToggle} 
          className="md:hidden flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-7 h-7" />
        </button>
        
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-950">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">Folio workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 lg:flex">
          <Search className="size-4" /> Search <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </div>
        <button type="button" aria-label="Notifications" className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700 sm:p-2.5">
          <Bell className="size-5 sm:size-[18px]" />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">2</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
            {(username || 'U').charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:block text-sm font-semibold text-slate-700">{username || 'Member'}</span>
        </div>
      </div>
    </header>
  );
}