import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search,
  Network, 
  Wallet, 
  ShieldAlert, 
  Bell, 
  Sparkles, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Activity,
  Cpu
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Alerts Center', path: '/alerts', icon: Bell, badge: 'LIVE' },
    { label: 'Live Trace', path: '/live-trace', icon: Activity },
    { label: 'Investigate', path: '/investigate', icon: Search },
    { label: 'Transaction Graph', path: '/graph', icon: Network },
    { label: 'Wallet Intelligence', path: '/wallets', icon: Wallet },
    { label: 'Pattern Detection', path: '/patterns', icon: ShieldAlert },
    { label: 'AI Forensic Copilot', path: '/copilot', icon: Sparkles },
    { label: 'Forensic Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside
      className={cn(
        'bg-background border-r border-terminal-muted flex flex-col justify-between transition-all duration-300 z-40 shrink-0 h-screen sticky top-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top: Logo & Branding */}
      <div>
        <div className={cn("h-16 flex items-center border-b border-terminal-muted", isCollapsed ? "justify-center" : "justify-between px-4")}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Terminal Logo Mark */}
              <div className="w-10 h-10 bg-terminal-primary flex items-center justify-center text-background font-bold shrink-0 rounded-none">
                <Shield className="w-5 h-5 text-background" strokeWidth={1.5} />
              </div>

              <div className="flex flex-col truncate uppercase">
                <span className="font-bold tracking-tight text-terminal-primary flex items-center gap-1">
                  TRACE[FORGE]
                </span>
                <span className="text-[9px] text-terminal-muted tracking-wider">
                  CRYPTO FORENSICS SOC
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onToggle}
            aria-label="Toggle Sidebar"
            className="hidden md:flex p-1.5 rounded-none border border-transparent hover:border-terminal-primary text-terminal-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-190px)] uppercase">
          {!isCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[9px] font-mono font-bold text-terminal-primary tracking-wider uppercase opacity-90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-terminal-primary inline-block" />
              FORENSIC ENGINES (LIVE)
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2 rounded-none text-xs font-medium transition-none group relative border border-transparent',
                    isActive
                      ? 'bg-terminal-primary text-background font-bold'
                      : 'text-terminal-muted hover:border-terminal-primary hover:text-terminal-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        strokeWidth={1.5}
                        className={cn(
                          'w-4 h-4 shrink-0 transition-none',
                          isActive
                            ? 'text-background'
                            : 'text-terminal-muted group-hover:text-terminal-primary'
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{isActive ? `> ${item.label}` : item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && 'badge' in item && (
                      <span className={cn(
                        "text-[9px] font-mono px-1 py-0.2 border shrink-0",
                        isActive
                          ? "border-background text-background font-bold"
                          : "border-red-500/50 bg-red-950/40 text-red-400 animate-pulse"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Investigator Profile & Node Status */}
      <div className="p-3 border-t border-terminal-muted bg-background space-y-2 uppercase">
        {/* Node Status */}
        <div
          className={cn(
            'flex items-center gap-2 p-2 rounded-none border border-terminal-muted text-[11px] text-terminal-primary',
            isCollapsed && 'justify-center p-2'
          )}
        >
          <div className="w-2 h-2 rounded-none bg-terminal-primary animate-pulse shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold">RPC NODE: CONNECTED</span>
              <span className="text-[9px] text-terminal-muted truncate">
                ETHEREUM MAINNET
              </span>
            </div>
          )}
        </div>

        {/* User Card */}
        <div
          className={cn(
            'flex items-center gap-2.5 p-2 rounded-none bg-background border border-terminal-muted hover:border-terminal-primary transition-colors cursor-pointer',
            isCollapsed && 'justify-center p-2'
          )}
        >
          <div className="w-8 h-8 rounded-none bg-terminal-primary/20 border border-terminal-primary flex items-center justify-center text-terminal-primary font-bold text-xs shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-terminal-primary truncate">
                SOC-ANALYST-01
              </span>
              <span className="text-[9px] text-terminal-muted truncate">
                CLEARANCE LEVEL 4
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
