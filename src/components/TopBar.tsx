import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  FileText,
  LifeBuoy,
  Mail,
  Plane,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { ActiveView, NotificationItem, UserRole } from '../types/crm';
import { getRolePermissions, getVisibleNavItems } from '../utils/crmLogic';
import { StaraviaLogo } from './BrandLogo';

interface TopBarProps {
  activeView: ActiveView;
  activeLeadId?: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (view: ActiveView, leadId?: string) => void;
  onOpenTicketSearch: () => void;
  onOpenEmailTemplates: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNotificationClick: (item: NotificationItem) => void;
  openTicketsCount: number;
}

const VIEW_LABELS: Record<ActiveView, string> = {
  leads: 'Leads',
  lead_detail: 'Lead Details',
  bookings: 'Bookings',
  clients: 'Clients',
  tickets: 'Support Tickets',
  analytics: 'Analytics',
  calendar: 'Calendar',
  tasks: 'Tasks',
  team_management: 'Team & Permissions',
  agency_settings: 'Agency Settings',
};

const NAV_ICONS: Record<ActiveView, React.ComponentType<{ className?: string }>> = {
  leads: Plane,
  lead_detail: Plane,
  bookings: Briefcase,
  clients: Users,
  tickets: LifeBuoy,
  analytics: BarChart3,
  calendar: Calendar,
  tasks: CheckSquare,
  team_management: ShieldCheck,
  agency_settings: Settings,
};

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  activeLeadId,
  currentRole,
  onRoleChange,
  onNavigate,
  onOpenTicketSearch,
  onOpenEmailTemplates,
  notifications,
  onMarkAllRead,
  onNotificationClick,
  openTicketsCount,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const permissions = getRolePermissions(currentRole);
  const visibleNavItems = getVisibleNavItems(currentRole);
  const workspaceItems = visibleNavItems.filter((item) => item.section === 'workspace');
  const managementItems = visibleNavItems.filter((item) => item.section === 'management');
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 h-16 w-full bg-white/95 backdrop-blur-sm border-b border-[#DDECE2]">
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Official Staraviatravel Brand Mark */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate('leads')}
            aria-label="Staraviatravel Home — Go to Leads"
            className="flex items-center rounded-lg px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23804E] transition-opacity hover:opacity-85 shrink-0"
          >
            <StaraviaLogo size="md" />
          </button>

          {activeView !== 'leads' && activeView !== 'lead_detail' && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#5B7465] pl-3 border-l border-[#DDECE2] truncate">
              <button
                type="button"
                onClick={() => onNavigate('leads')}
                className="hover:text-[#14261C] transition-colors whitespace-nowrap"
              >
                Leads
              </button>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[#14261C] truncate">
                {VIEW_LABELS[activeView]}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Pop-up Launchers, Notifications, and Profile Navigation Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenTicketSearch}
            aria-label="Open Ticket Search"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#2A4535] bg-[#F2FAF5] border border-[#D8EAE0] hover:bg-[#E5F5EB] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23804E]"
          >
            <Search className="w-4 h-4 text-[#23804E]" />
            <span className="hidden md:inline">Ticket Search</span>
          </button>

          <button
            type="button"
            onClick={onOpenEmailTemplates}
            aria-label="Open Email Templates"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#2A4535] bg-white border border-[#DCECE2] hover:bg-[#F2FAF5] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23804E]"
          >
            <Mail className="w-4 h-4 text-[#23804E]" />
            <span className="hidden lg:inline">Templates</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              aria-label={`Notifications (${unreadCount} unread)`}
              aria-expanded={notifOpen}
              className="relative w-10 h-10 rounded-xl border border-[#DCECE2] bg-white hover:bg-[#F2FAF5] flex items-center justify-center text-[#365442] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23804E]"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D94242] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                role="region"
                aria-label="Notifications panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#D7E8DD] shadow-lg overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-[#E6F1EA] flex items-center justify-between bg-[#F7FBF8]">
                  <span className="text-sm font-semibold text-[#14261C]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-xs font-medium text-[#23804E] hover:text-[#19613A]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#EEF5F0]">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-[#6E8577]">
                      All caught up. No new alerts.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNotificationClick(item);
                          setNotifOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-[#F3FAF6] transition-colors ${
                          item.read ? 'bg-white' : 'bg-[#EFF9F2]/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[#14261C] leading-snug">
                            {item.title}
                          </p>
                          <span className="text-[11px] text-[#6E8577] whitespace-nowrap shrink-0 tabular-nums">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#4A6354] leading-relaxed">
                          {item.description}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown — Hosts All CRM Navigation & Role-Based Management Access */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              aria-label="Open profile and navigation menu"
              aria-expanded={profileOpen}
              className="inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border border-[#DCECE2] bg-white hover:bg-[#F2FAF5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23804E]"
            >
              <span className="w-8 h-8 rounded-full bg-[#23804E] text-white text-xs font-bold flex items-center justify-center shrink-0">
                ST
              </span>
              <span className="hidden sm:flex flex-col items-start text-left leading-tight">
                <span className="text-sm font-semibold text-[#14261C] whitespace-nowrap">
                  Saibjon T.
                </span>
                <span className="text-[11px] text-[#5E7868] whitespace-nowrap">
                  {permissions.label}
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#5E7868] transition-transform duration-150 ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                aria-label="Workspace navigation and role access"
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#D7E8DD] shadow-xl overflow-hidden z-50"
              >
                {/* Profile Summary + Role Switcher */}
                <div className="p-4 bg-[#F5FBF7] border-b border-[#E3F0E8]">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#23804E] text-white text-sm font-bold flex items-center justify-center shrink-0">
                      ST
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#14261C] truncate">
                        Saibjon Talibjanov
                      </p>
                      <p className="text-xs text-[#5A7464] truncate">saibjon@staraviatravel.uz</p>
                    </div>
                  </div>

                  {/* Role-Based Access Switcher */}
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-[#5A7464] mb-1.5">
                      Active Access Role
                    </p>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-[#E7F4EC] rounded-lg">
                      {(
                        [
                          { id: 'sales_agent', label: 'Agent' },
                          { id: 'manager', label: 'Manager' },
                          { id: 'admin', label: 'Admin' },
                        ] as const
                      ).map((roleOption) => {
                        const isActive = currentRole === roleOption.id;
                        return (
                          <button
                            key={roleOption.id}
                            type="button"
                            onClick={() => onRoleChange(roleOption.id)}
                            className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                              isActive
                                ? 'bg-white text-[#14261C] shadow-xs'
                                : 'text-[#4B6857] hover:text-[#14261C]'
                            }`}
                          >
                            {roleOption.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Primary CRM Navigation */}
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                  <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold text-[#6A8474]">
                    CRM Navigation
                  </p>
                  <div className="space-y-0.5">
                    {workspaceItems.map((item) => {
                      const Icon = NAV_ICONS[item.id];
                      const isSelected =
                        activeView === item.id ||
                        (item.id === 'leads' && activeView === 'lead_detail');
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onNavigate(item.id);
                            setProfileOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                            isSelected
                              ? 'bg-[#E5F6EC] text-[#175B36] font-semibold'
                              : 'text-[#233A2D] hover:bg-[#F3FAF6]'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-[#23804E]' : 'text-[#5A7665]'
                              }`}
                            />
                            <span className="text-sm truncate">{item.label}</span>
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {item.id === 'tickets' && openTicketsCount > 0 && (
                              <span className="text-xs font-semibold text-[#23804E] tabular-nums">
                                {openTicketsCount}
                              </span>
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#23804E]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Pop-up Tools */}
                  <div className="my-2 border-t border-[#E8F2EC]" />
                  <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold text-[#6A8474]">
                    Quick Tools (Pop-ups)
                  </p>
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        onOpenTicketSearch();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-[#233A2D] hover:bg-[#F3FAF6] transition-colors"
                    >
                      <Search className="w-4 h-4 text-[#23804E]" />
                      <span>Ticket Search</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        onOpenEmailTemplates();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-[#233A2D] hover:bg-[#F3FAF6] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#23804E]" />
                      <span>Email Templates</span>
                    </button>
                  </div>

                  {/* Role-Based Management Section */}
                  {managementItems.length > 0 && (
                    <>
                      <div className="my-2 border-t border-[#E8F2EC]" />
                      <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold text-[#6A8474]">
                        Management ({permissions.label})
                      </p>
                      <div className="space-y-0.5">
                        {managementItems.map((item) => {
                          const Icon = NAV_ICONS[item.id];
                          const isSelected = activeView === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                onNavigate(item.id);
                                setProfileOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                                isSelected
                                  ? 'bg-[#E5F6EC] text-[#175B36] font-semibold'
                                  : 'text-[#233A2D] hover:bg-[#F3FAF6]'
                              }`}
                            >
                              <span className="flex items-center gap-2.5 min-w-0">
                                <Icon className="w-4 h-4 text-[#23804E] shrink-0" />
                                <span className="text-sm truncate">{item.label}</span>
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#23804E]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
