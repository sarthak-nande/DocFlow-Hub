import { useSelector } from 'react-redux';
import { Bell, Search } from 'lucide-react';
import { Badge } from './ui/badge';

export default function Navbar({ title = 'Dashboard' }) {
  const { username } = useSelector((state) => state.auth);

  return (
    <header className="h-16 glass border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">DocFlow Hub</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search hint */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground text-xs">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-1 px-1.5 py-0.5 rounded text-xs bg-background border border-border">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
            2
          </span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
            {username ? username[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">{username || 'User'}</p>
            <Badge variant="success" className="text-[10px] px-1.5 py-0">Online</Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
