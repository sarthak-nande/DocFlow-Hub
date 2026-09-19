import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, LayoutDashboard, LogOut, Upload, UserRound, Zap, UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/register-user', label: 'Register User', icon: UserPlus },
  { to: '/profile', label: 'Profile', icon: UserRound }
   // New Nav Item
];

export default function Sidebar({ collapsed, onToggle, mobileMenuOpen, setMobileMenuOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = useSelector((state) => state.auth?.username);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 ${collapsed ? 'md:w-[76px]' : 'w-64'}`}
    >
      <div className={`flex h-20 items-center border-b border-slate-100 ${collapsed ? 'md:justify-center px-4 md:px-3' : 'justify-between px-5'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.24)]">
            <Zap className="size-5" />
          </span>
          {(!collapsed || mobileMenuOpen) && (
            <div className="whitespace-nowrap">
              <p className="text-lg font-bold tracking-tight text-slate-950">folio<span className="text-orange-500">.</span></p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
            </div>
          )}
        </div>
        
        {/* Desktop Collapse Button */}
        {!collapsed && (
          <button type="button" onClick={onToggle} aria-label="Collapse sidebar" className="hidden md:block rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700">
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>

      <div className={`border-b border-slate-100 py-4 ${collapsed ? 'md:flex md:justify-center px-4 md:px-3' : 'px-4'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center' : ''}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {(username || 'U').charAt(0).toUpperCase()}
          </span>
          {(!collapsed || mobileMenuOpen) && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">{username || 'Workspace member'}</p>
              <p className="text-xs text-slate-400">Signed in</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Main navigation">
        {(!collapsed || mobileMenuOpen) && <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
        <div className="flex flex-col gap-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink 
              key={to} 
              to={to} 
              onClick={() => setMobileMenuOpen(false)} // Closes sidebar on mobile when a link is clicked
              title={collapsed ? label : undefined} 
              className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${collapsed ? 'md:justify-center' : ''} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Icon className="size-[18px] shrink-0" />
              {(!collapsed || mobileMenuOpen) && <span className="flex-1">{label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-3">
        {collapsed && (
          <button type="button" onClick={onToggle} aria-label="Expand sidebar" className="hidden mb-2 md:flex w-full justify-center rounded-xl p-3 text-slate-400 hover:bg-blue-50 hover:text-blue-700">
            <ChevronRight className="size-4" />
          </button>
        )}
        <button 
          type="button" 
          onClick={handleLogout} 
          title={collapsed ? 'Log out' : undefined} 
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 ${collapsed ? 'md:justify-center' : ''}`}
        >
          <LogOut className="size-[18px] shrink-0" />
          {(!collapsed || mobileMenuOpen) && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}