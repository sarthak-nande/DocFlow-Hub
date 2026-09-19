import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Badge } from '../components/ui/badge';
import {
  FileText,
  Upload,
  Shield,
  User,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const stats = [
  { label: 'Total Documents', value: '—', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  { label: 'Pending Approval', value: '—', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { label: 'Approved', value: '—', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  { label: 'Rejected', value: '—', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
];

const quickActions = [
  {
    to: '/upload',
    icon: Upload,
    label: 'Upload Document',
    description: 'Upload a new PDF, image or DOCX file',
    color: 'from-violet-600 to-indigo-600',
  },
  {
    to: '/documents',
    icon: FileText,
    label: 'View Documents',
    description: 'Browse and manage all documents',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    to: '/admin',
    icon: Shield,
    label: 'Admin Panel',
    description: 'Register org users and manage access',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    to: '/profile',
    icon: User,
    label: 'My Profile',
    description: 'View and update your account details',
    color: 'from-rose-600 to-pink-600',
  },
];

export default function DashboardPage() {
  const { username } = useSelector((state) => state.auth);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZIMzB2LTZoNnptMC0zMHY2SDMwVjRoNnptMzAgMzB2Nkg2MHYtNmg2ek0wIDM0djZILTZ2LTZINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative p-8 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">{greeting()},</p>
              <h2 className="text-3xl font-bold text-white mb-2">
                {username || 'User'} 👋
              </h2>
              <p className="text-white/60 text-sm max-w-md">
                Manage your documents, track approvals, and collaborate with your team — all from one place.
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm">
              <Activity className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className={`glass rounded-xl p-5 border card-hover ${bg}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map(({ to, icon: Icon, label, description, color }) => (
              <Link
                key={to}
                to={to}
                className="group glass rounded-xl p-5 border border-border hover:border-primary/30 transition-all duration-300 card-hover flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="glass rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">System Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Backend</p>
              <p className="font-medium text-foreground">Spring Boot 3 · Port 5000</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Database</p>
              <p className="font-medium text-foreground">MongoDB Atlas</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Auth</p>
              <p className="font-medium text-foreground">JWT + CSRF Protection</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">File Limit</p>
              <p className="font-medium text-foreground">15 MB max upload</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Allowed Types</p>
              <p className="font-medium text-foreground">PDF, JPEG, PNG, DOCX</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">API Version</p>
              <p className="font-medium text-foreground">v1</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
