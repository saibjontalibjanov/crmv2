import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Clock,
  Copy,
  Edit3,
  Eye,
  FileText,
  History,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Send,
  Tag,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react';
import type {
  Agent,
  FlightOption,
  Lead,
  LeadDocument,
  LeadStatus,
  UserRole,
} from '../types/crm';
import { AVIATION_BANNER_IMAGE } from '../data/seedData';
import {
  formatCurrency,
  getInitials,
  getRolePermissions,
  getSelectedFlightOption,
} from '../utils/crmLogic';
import { AirlineBadge, StaraviaLogo } from './BrandLogo';

interface LeadDetailsPageProps {
  lead: Lead;
  agents: Agent[];
  currentRole: UserRole;
  onBack: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onAssignAgent: (leadId: string, agentId: string) => void;
  onSelectFlight: (leadId: string, flightId: string) => void;
  onToggleBookmark: (leadId: string, flightId: string) => void;
  onPreviewFlight: (lead: Lead, flight: FlightOption) => void;
  onOpenEmailModal: (lead: Lead, flight?: FlightOption) => void;
  onOpenTicketSearch: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onAddNote: (leadId: string, content: string) => void;
  onAddTag: (leadId: string, tag: string) => void;
  onRemoveTag: (leadId: string, tag: string) => void;
  onLogCall: (leadId: string, summary: string) => void;
  onAddDocument: (leadId: string, doc: Omit<LeadDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  onCreateTask: (title: string, leadId: string, clientName: string, dueDate: string) => void;
  onDeleteLead: (leadId: string) => void;
}

type DetailTab = 'flights' | 'notes' | 'history' | 'documents' | 'communication';

export const LeadDetailsPage: React.FC<LeadDetailsPageProps> = ({
  lead,
  agents,
  currentRole,
  onBack,
  onUpdateStatus,
  onAssignAgent,
  onSelectFlight,
  onToggleBookmark,
  onPreviewFlight,
  onOpenEmailModal,
  onOpenTicketSearch,
  onEditLead,
  onAddNote,
  onAddTag,
  onRemoveTag,
  onLogCall,
  onAddDocument,
  onCreateTask,
  onDeleteLead,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('flights');
  const [noteInput, setNoteInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Lightweight inline dialogs for Call Log, Quick Task, and Document Upload
  const [showCallForm, setShowCallForm] = useState(false);
  const [callSummary, setCallSummary] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('Tomorrow, 10:00');
  const [showDocForm, setShowDocForm] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<LeadDocument['category']>('Passport');

  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const permissions = getRolePermissions(currentRole);
  const selectedFlight = useMemo(() => getSelectedFlightOption(lead), [lead]);

  const copyToClipboard = (value: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedContact(label);
    setTimeout(() => setCopiedContact(null), 1800);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(lead.id, noteInput.trim());
    setNoteInput('');
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    onAddTag(lead.id, newTagInput.trim());
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callSummary.trim()) return;
    onLogCall(lead.id, callSummary.trim());
    setCallSummary('');
    setShowCallForm(false);
    setActiveTab('communication');
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onCreateTask(taskTitle.trim(), lead.id, lead.clientName, taskDue);
    setTaskTitle('');
    setShowTaskForm(false);
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    const normalized = docName.trim().endsWith('.pdf') ? docName.trim() : `${docName.trim()}.pdf`;
    onAddDocument(lead.id, {
      name: normalized,
      category: docCategory,
      size: '840 KB',
    });
    setDocName('');
    setShowDocForm(false);
    setActiveTab('documents');
  };

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-4">
      <div className="w-full max-w-[1540px] mx-auto space-y-3.5">
        {/* Breadcrumb & Contextual Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#365442] hover:bg-[#E7F5EC] hover:text-[#14261C] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leads</span>
            </button>
            <span className="text-[#9AB5A4]" aria-hidden="true">
              /
            </span>
            <span className="font-semibold text-[#14261C] font-mono text-[13px]">
              Lead: {lead.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEmailModal(lead, selectedFlight)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D8EAE0] hover:bg-[#F1FAF4] text-sm font-medium text-[#1D3527] transition-colors whitespace-nowrap"
            >
              <Mail className="w-4 h-4 text-[#23804E]" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('notes');
                setTimeout(() => noteInputRef.current?.focus(), 60);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D8EAE0] hover:bg-[#F1FAF4] text-sm font-medium text-[#1D3527] transition-colors whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 text-[#23804E]" />
              <span>Note</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTaskForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D8EAE0] hover:bg-[#F1FAF4] text-sm font-medium text-[#1D3527] transition-colors whitespace-nowrap"
            >
              <CheckSquare className="w-4 h-4 text-[#23804E]" />
              <span>Task</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCallForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D8EAE0] hover:bg-[#F1FAF4] text-sm font-medium text-[#1D3527] transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-[#23804E]" />
              <span>Call</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreMenuOpen((v) => !v)}
                aria-label="More lead actions"
                aria-expanded={moreMenuOpen}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-[#D8EAE0] hover:bg-[#F1FAF4] text-sm font-medium text-[#1D3527] transition-colors whitespace-nowrap"
              >
                <span>More</span>
                <ChevronDown className="w-4 h-4 text-[#5A7464]" />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-[#D7E8DD] shadow-lg py-1.5 z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onEditLead(lead);
                    }}
                    className="w-full px-3.5 py-2 text-left text-sm text-[#1E3527] hover:bg-[#F2FAF5] flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-[#23804E]" />
                    <span>Edit Lead Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onOpenTicketSearch(lead);
                    }}
                    className="w-full px-3.5 py-2 text-left text-sm text-[#1E3527] hover:bg-[#F2FAF5] flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-[#23804E]" />
                    <span>Search Flights</span>
                  </button>
                  {permissions.canDeleteLeads && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onDeleteLead(lead.id);
                      }}
                      className="w-full px-3.5 py-2 text-left text-sm text-[#A63535] hover:bg-[#FDF4F4] flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Lead</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inline Quick Action Forms (Call / Task / Upload Doc) */}
        {showCallForm && (
          <form
            onSubmit={handleCallSubmit}
            className="p-4 rounded-2xl bg-white border border-[#CBE6D6] flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <Phone className="w-4 h-4 text-[#23804E] shrink-0 hidden sm:block" />
            <input
              type="text"
              value={callSummary}
              onChange={(e) => setCallSummary(e.target.value)}
              placeholder={`Log call notes with ${lead.clientName}...`}
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#DCECE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 h-10 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold"
              >
                Save Call Log
              </button>
              <button
                type="button"
                onClick={() => setShowCallForm(false)}
                className="px-3 h-10 rounded-xl border border-[#DCECE2] text-sm text-[#4A6354] hover:bg-[#F4FAF6]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {showTaskForm && (
          <form
            onSubmit={handleTaskSubmit}
            className="p-4 rounded-2xl bg-white border border-[#CBE6D6] flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <CheckSquare className="w-4 h-4 text-[#23804E] shrink-0 hidden sm:block" />
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder={`Follow-up task for ${lead.clientName}...`}
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#DCECE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              required
            />
            <input
              type="text"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
              aria-label="Task due time"
              className="w-full sm:w-44 h-10 px-3 rounded-xl border border-[#DCECE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E]"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 h-10 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold whitespace-nowrap"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="px-3 h-10 rounded-xl border border-[#DCECE2] text-sm text-[#4A6354] hover:bg-[#F4FAF6]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {showDocForm && (
          <form
            onSubmit={handleDocSubmit}
            className="p-4 rounded-2xl bg-white border border-[#CBE6D6] flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <Upload className="w-4 h-4 text-[#23804E] shrink-0 hidden sm:block" />
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Document filename (e.g., Passport_Copy.pdf)"
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#DCECE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              required
            />
            <select
              aria-label="Document category"
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as LeadDocument['category'])}
              className="h-10 px-3 rounded-xl border border-[#DCECE2] bg-white text-sm text-[#1D3427]"
            >
              <option value="Passport">Passport</option>
              <option value="Visa">Visa</option>
              <option value="Itinerary">Itinerary</option>
              <option value="Invoice">Invoice</option>
              <option value="E-Ticket">E-Ticket</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 h-10 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold whitespace-nowrap"
              >
                Attach File
              </button>
              <button
                type="button"
                onClick={() => setShowDocForm(false)}
                className="px-3 h-10 rounded-xl border border-[#DCECE2] text-sm text-[#4A6354] hover:bg-[#F4FAF6]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Main 2-Column Workspace Layout (Image 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Client Profile, Travel Details, Lead Information */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Client Card */}
            <section className="rounded-2xl bg-white border border-[#DCECE2] p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#E3F5EA] text-[#1D6D41] font-bold text-base flex items-center justify-center shrink-0">
                    {getInitials(lead.clientName)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[#14261C] truncate">
                      {lead.clientName}
                    </h2>
                    <p className="text-xs text-[#607A6B]">Client</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onEditLead(lead)}
                  aria-label="Edit client profile"
                  className="p-1.5 rounded-lg text-[#5E7868] hover:bg-[#F2FAF5] hover:text-[#14261C]"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EEF5F0] space-y-2.5 text-sm">
                <button
                  type="button"
                  onClick={() => copyToClipboard(lead.phone, 'phone')}
                  className="w-full flex items-center justify-between gap-2 text-left text-[#243E2F] hover:text-[#23804E] group"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-[#5A7867] shrink-0" />
                    <span className="truncate tabular-nums">{lead.phone}</span>
                  </span>
                  <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#23804E] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEmailModal(lead, selectedFlight)}
                  className="w-full flex items-center justify-between gap-2 text-left text-[#243E2F] hover:text-[#23804E] group"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-[#5A7867] shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </span>
                </button>

                {lead.telegramHandle && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(lead.telegramHandle!, 'telegram')}
                    className="w-full flex items-center justify-between gap-2 text-left text-[#243E2F] hover:text-[#23804E] group"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Send className="w-4 h-4 text-[#2B8AC6] shrink-0" />
                      <span className="truncate">{lead.telegramHandle}</span>
                    </span>
                    <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#23804E] shrink-0" />
                  </button>
                )}

                {lead.whatsappPhone && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(lead.whatsappPhone!, 'whatsapp')}
                    className="w-full flex items-center justify-between gap-2 text-left text-[#243E2F] hover:text-[#23804E] group"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare className="w-4 h-4 text-[#23804E] shrink-0" />
                      <span className="truncate tabular-nums">{lead.whatsappPhone}</span>
                    </span>
                    <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#23804E] shrink-0" />
                  </button>
                )}

                {copiedContact && (
                  <p className="text-xs font-medium text-[#23804E] pt-1">
                    Copied {copiedContact} to clipboard.
                  </p>
                )}
              </div>
            </section>

            {/* Travel Details Card */}
            <section className="rounded-2xl bg-white border border-[#DCECE2] p-5">
              <h3 className="text-[15px] font-bold text-[#14261C]">Travel Details</h3>

              <div className="mt-4 space-y-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-[#EFF8F2] text-[#23804E] flex items-center justify-center shrink-0">
                    <Plane className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#14261C] flex items-center gap-1.5">
                      <span>{lead.originCode}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#23804E]" />
                      <span>{lead.destinationCode}</span>
                    </p>
                    <p className="text-xs text-[#5E7868] tabular-nums">{lead.departDateLabel}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-[#EFF8F2] text-[#23804E] flex items-center justify-center shrink-0">
                    <Plane className="w-4 h-4 rotate-180" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#14261C] flex items-center gap-1.5">
                      <span>{lead.destinationCode}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#23804E]" />
                      <span>{lead.originCode}</span>
                    </p>
                    <p className="text-xs text-[#5E7868] tabular-nums">{lead.returnDateLabel}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EEF5F0] space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#5E7868]">Class</span>
                  <span className="font-semibold text-[#14261C]">{lead.cabinClass}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="lead-status-select" className="text-[#5E7868]">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="lead-status-select"
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-[#E4F6EB] text-[#18683C] text-xs font-semibold border border-[#C6E8D3] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Quoted">Quoted</option>
                      <option value="Booked">Booked</option>
                      <option value="Lost">Lost</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#18683C] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

            {/* Lead Information Card */}
            <section className="rounded-2xl bg-white border border-[#DCECE2] p-5">
              <h3 className="text-[15px] font-bold text-[#14261C]">Lead Information</h3>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-2 text-[#5E7868]">
                    <Calendar className="w-4 h-4 text-[#73907E]" />
                    <span>Created</span>
                  </dt>
                  <dd className="font-medium text-[#14261C] tabular-nums">{lead.createdAt}</dd>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-2 text-[#5E7868]">
                    <User className="w-4 h-4 text-[#73907E]" />
                    <span>Assigned to</span>
                  </dt>
                  <dd>
                    {permissions.canReassignAgents ? (
                      <select
                        aria-label="Reassign agent"
                        value={lead.assignedAgentId}
                        onChange={(e) => onAssignAgent(lead.id, e.target.value)}
                        className="text-sm font-medium text-[#14261C] bg-[#F4FAF6] border border-[#DCECE2] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                      >
                        {agents.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.shortName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-medium text-[#14261C]">{lead.assignedName}</span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-2 text-[#5E7868]">
                    <Briefcase className="w-4 h-4 text-[#73907E]" />
                    <span>Source</span>
                  </dt>
                  <dd className="font-medium text-[#14261C]">{lead.source}</dd>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-2 text-[#5E7868]">
                    <Tag className="w-4 h-4 text-[#73907E]" />
                    <span>Priority</span>
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        lead.priority === 'High'
                          ? 'bg-[#E2F5E9] text-[#1D7344]'
                          : lead.priority === 'Medium'
                            ? 'bg-[#EEF4F0] text-[#3E5C4A]'
                            : 'bg-[#F4F6F5] text-[#647B6E]'
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </dd>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#5E7868] text-xs font-medium">Tags</span>
                    <button
                      type="button"
                      onClick={() => setShowTagInput((v) => !v)}
                      className="text-xs font-semibold text-[#23804E] hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F1F8F3] border border-[#DCECE2] text-xs font-medium text-[#2A4736]"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          aria-label={`Remove tag ${tag}`}
                          onClick={() => onRemoveTag(lead.id, tag)}
                          className="text-[#6F8B7B] hover:text-[#14261C]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {showTagInput && (
                    <form onSubmit={handleTagSubmit} className="mt-2 flex gap-1.5">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="New tag..."
                        className="flex-1 h-8 px-2.5 rounded-lg border border-[#DCECE2] text-xs focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                      />
                      <button
                        type="submit"
                        className="px-2.5 h-8 rounded-lg bg-[#23804E] text-white text-xs font-semibold"
                      >
                        Add
                      </button>
                    </form>
                  )}
                </div>
              </dl>

              <button
                type="button"
                onClick={() => onEditLead(lead)}
                className="mt-5 w-full h-10 rounded-xl bg-[#F4FAF6] hover:bg-[#E7F5EC] border border-[#D4E7DC] text-sm font-semibold text-[#19402B] inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-[#23804E]" />
                <span>Edit Lead</span>
              </button>
            </section>
          </aside>

          {/* Right Main Workspace Column */}
          <div className="lg:col-span-9 space-y-4 min-w-0">
            {/* Hero Lead Banner + Workspace Tabs Card */}
            <section className="rounded-2xl bg-white border border-[#DCECE2] overflow-hidden">
              {/* Aviation Sky/Wing Hero Banner */}
              <div className="relative h-24 sm:h-[104px] w-full overflow-hidden border-b border-[#E3F0E8] bg-[#ECF7F0]">
                <img
                  src={AVIATION_BANNER_IMAGE}
                  alt="Commercial aircraft wing flying above sunlit clouds"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-right"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#EFF9F3] via-[#EFF9F3]/85 to-transparent"
                  aria-hidden="true"
                />
                <div className="relative h-full px-6 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-[26px] font-bold text-[#14261C] tracking-tight tabular-nums">
                      Lead: {lead.id}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#DCF4E5] border border-[#BFE6CE] text-xs font-semibold text-[#18683C]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lead.status}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-sm font-medium text-[#2A4736] tabular-nums">
                    <span className="font-semibold text-[#14261C]">
                      {lead.originCode} → {lead.destinationCode} → {lead.originCode}
                    </span>
                    <span aria-hidden="true" className="text-[#9AB5A4]">
                      |
                    </span>
                    <span>{lead.travelDatesLabel} 2026</span>
                    <span aria-hidden="true" className="text-[#9AB5A4]">
                      |
                    </span>
                    <span>
                      {lead.pax} Passenger{lead.pax > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workspace Tabs */}
              <div
                role="tablist"
                aria-label="Lead workspace sections"
                className="flex items-center gap-1 px-4 sm:px-6 border-b border-[#E6F1EA] overflow-x-auto bg-white"
              >
                {(
                  [
                    {
                      id: 'flights',
                      label: `Flight Options (${lead.flightOptions.length})`,
                      icon: Plane,
                    },
                    {
                      id: 'notes',
                      label: `Client Notes (${lead.notes.length})`,
                      icon: MessageSquare,
                    },
                    {
                      id: 'history',
                      label: 'History',
                      icon: History,
                    },
                    {
                      id: 'documents',
                      label: `Documents (${lead.documents.length})`,
                      icon: FileText,
                    },
                    {
                      id: 'communication',
                      label: `Communication (${lead.communications.length})`,
                      icon: Mail,
                    },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'border-[#23804E] text-[#16663B]'
                          : 'border-transparent text-[#5A7464] hover:text-[#14261C]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Area */}
              <div className="p-4 sm:p-5">
                {/* TAB 1: FLIGHT OPTIONS */}
                {activeTab === 'flights' && (
                  <div className="space-y-3">
                    {lead.flightOptions.length === 0 ? (
                      <div className="py-12 px-6 text-center rounded-xl border border-dashed border-[#CBE3D4] bg-[#F9FDFA]">
                        <Plane className="w-8 h-8 text-[#23804E] mx-auto mb-2.5" />
                        <p className="text-base font-semibold text-[#14261C]">
                          No flight options added yet
                        </p>
                        <p className="mt-1 text-sm text-[#5E7868]">
                          Search live inventory and attach flight options to compare and preview itineraries.
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenTicketSearch(lead)}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold"
                        >
                          <Search className="w-4 h-4" />
                          <span>Search Flights</span>
                        </button>
                      </div>
                    ) : (
                      lead.flightOptions.map((option) => (
                        <article
                          key={option.id}
                          className={`rounded-2xl border p-3.5 sm:px-5 sm:py-3.5 transition-colors ${
                            option.selected
                              ? 'bg-[#F5FBF7] border-[#8CCCA7]'
                              : 'bg-white border-[#E1EFE6] hover:border-[#BFDDC9]'
                          }`}
                        >
                          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                            {/* Airline Column */}
                            <div className="flex items-center gap-3.5 xl:w-44 shrink-0">
                              <AirlineBadge code={option.airlineCode} />
                              <div className="min-w-0">
                                <h3 className="text-base font-bold text-[#14261C] leading-snug truncate">
                                  {option.airlineName}
                                </h3>
                                <span className="mt-1 inline-block px-2.5 py-0.5 rounded-md bg-[#E3F5EA] text-[#1D7344] text-xs font-semibold whitespace-nowrap">
                                  {option.cabinClass}
                                </span>
                              </div>
                            </div>

                            {/* Outbound & Return Flight Schedule */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-11 items-center gap-3">
                              {/* Outbound */}
                              <div className="sm:col-span-4">
                                <p className="text-sm font-bold text-[#14261C] tabular-nums">
                                  {option.outbound.fromCode} → {option.outbound.toCode}
                                </p>
                                <p className="text-xs text-[#546F5F] mt-0.5">
                                  {option.outbound.dateLabel}
                                </p>
                                <p className="text-sm font-semibold text-[#14261C] tabular-nums">
                                  {option.outbound.departTime} – {option.outbound.arriveTime}
                                  {option.outbound.nextDay && (
                                    <span className="ml-1 text-xs font-bold text-[#C8433B]">+1</span>
                                  )}
                                </p>
                                <p className="text-xs font-mono text-[#6A8374]">
                                  {option.outbound.flightNumber}
                                </p>
                              </div>

                              {/* Duration Center Connector */}
                              <div className="sm:col-span-3 flex sm:flex-col items-center justify-start sm:justify-center gap-1.5">
                                <Plane className="w-4 h-4 text-[#4B6B58]" />
                                <span className="px-2.5 py-0.5 rounded-md bg-[#EEF8F2] text-xs font-semibold text-[#2E523D] tabular-nums whitespace-nowrap">
                                  {option.outbound.duration}
                                </span>
                              </div>

                              {/* Return */}
                              <div className="sm:col-span-4">
                                <p className="text-sm font-bold text-[#14261C] tabular-nums">
                                  {option.returnLeg.fromCode} → {option.returnLeg.toCode}
                                </p>
                                <p className="text-xs text-[#546F5F] mt-0.5">
                                  {option.returnLeg.dateLabel}
                                </p>
                                <p className="text-sm font-semibold text-[#14261C] tabular-nums">
                                  {option.returnLeg.departTime} – {option.returnLeg.arriveTime}
                                  {option.returnLeg.nextDay && (
                                    <span className="ml-1 text-xs font-bold text-[#C8433B]">+1</span>
                                  )}
                                </p>
                                <p className="text-xs font-mono text-[#6A8374]">
                                  {option.returnLeg.flightNumber}
                                </p>
                              </div>
                            </div>

                            {/* Baggage & Fare Rules */}
                            <div className="flex sm:flex-col gap-3 sm:gap-1.5 xl:w-32 shrink-0 text-xs text-[#3C5848]">
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <Briefcase className="w-3.5 h-3.5 text-[#23804E] shrink-0" />
                                <span className="tabular-nums">{option.baggage}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <RefreshCw className="w-3.5 h-3.5 text-[#23804E] shrink-0" />
                                <span>{option.fareCondition}</span>
                              </span>
                            </div>

                            {/* Price & Per-Option Preview / Select Controls */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-4 pt-3 xl:pt-0 border-t xl:border-t-0 border-[#EAF3ED]">
                              <div className="text-left xl:text-right min-w-[92px]">
                                <p className="text-xl font-bold text-[#14261C] leading-none tabular-nums">
                                  {formatCurrency(option.pricePerPassenger)}
                                </p>
                                <p className="mt-1 text-xs text-[#607A6B] whitespace-nowrap">
                                  per passenger
                                </p>
                              </div>

                              <div className="flex items-start gap-2">
                                <div className="flex flex-col gap-1.5 w-28">
                                  {/* Dedicated Per-Flight Preview Button */}
                                  <button
                                    type="button"
                                    onClick={() => onPreviewFlight(lead, option)}
                                    aria-label={`Preview ${option.airlineName} itinerary`}
                                    className="w-full h-9 px-3 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Preview</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onSelectFlight(lead.id, option.id)}
                                    aria-label={
                                      option.selected
                                        ? `${option.airlineName} selected`
                                        : `Select ${option.airlineName}`
                                    }
                                    className={`w-full h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 border transition-colors whitespace-nowrap ${
                                      option.selected
                                        ? 'bg-[#DFF5E8] border-[#7EC59C] text-[#145832]'
                                        : 'bg-white border-[#D3E5DA] text-[#1F3A2B] hover:bg-[#F3FAF6]'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{option.selected ? 'Selected' : 'Select'}</span>
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onToggleBookmark(lead.id, option.id)}
                                  aria-label={
                                    option.bookmarked
                                      ? `Remove ${option.airlineName} bookmark`
                                      : `Bookmark ${option.airlineName}`
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    option.bookmarked
                                      ? 'text-[#23804E] bg-[#E5F6EC]'
                                      : 'text-[#6A8474] hover:bg-[#F3FAF6] hover:text-[#14261C]'
                                  }`}
                                >
                                  <Bookmark
                                    className={`w-4 h-4 ${option.bookmarked ? 'fill-current' : ''}`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      <p className="text-xs text-[#607A6B]">
                        Tip: Click <span className="font-semibold text-[#1E3B2B]">Preview</span> on any flight option to inspect its client-ready itinerary.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenTicketSearch(lead)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23804E] hover:text-[#186039]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Flight Option</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: CLIENT NOTES */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <form onSubmit={handleNoteSubmit} className="space-y-2.5">
                      <label htmlFor="lead-note-textarea" className="sr-only">
                        Add a client note
                      </label>
                      <textarea
                        ref={noteInputRef}
                        id="lead-note-textarea"
                        rows={3}
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Add an internal note regarding seat preferences, billing approvals, or passport details..."
                        className="w-full p-3.5 rounded-xl border border-[#DCECE2] bg-[#FAFDFB] text-sm text-[#14261C] placeholder:text-[#7D9586] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold"
                        >
                          Save Note
                        </button>
                      </div>
                    </form>

                    {lead.notes.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#607A6B]">
                        No notes recorded for {lead.clientName} yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {lead.notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-4 rounded-xl bg-[#F8FCF9] border border-[#E3F0E8]"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-[#14261C]">{note.author}</span>
                              <span className="text-[#698273] tabular-nums">{note.createdAt}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-[#2A4234] leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: HISTORY */}
                {activeTab === 'history' && (
                  <div className="space-y-3">
                    {lead.history.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#607A6B]">
                        No activity events recorded yet.
                      </p>
                    ) : (
                      lead.history.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#FAFDFB] border border-[#E7F2EB]"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#14261C]">
                              {event.action}{' '}
                              <span className="font-normal text-[#5A7464]">· {event.actor}</span>
                            </p>
                            <p className="mt-0.5 text-xs text-[#4C6858]">{event.detail}</p>
                          </div>
                          <span className="text-xs text-[#6E8577] whitespace-nowrap tabular-nums">
                            {event.timestamp}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 4: DOCUMENTS */}
                {activeTab === 'documents' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#4C6858]">
                        Passports, e-tickets, visa letters, and invoices
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowDocForm(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-xs font-semibold"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Document</span>
                      </button>
                    </div>

                    {lead.documents.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#607A6B]">
                        No documents uploaded for this lead yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#ECF5EF] rounded-xl border border-[#E3F0E8]">
                        {lead.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3.5 flex items-center justify-between gap-3 bg-white first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-9 h-9 rounded-lg bg-[#EBF7F0] text-[#23804E] flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#14261C] truncate">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-[#647E6E]">
                                  {doc.category} · {doc.size} · Uploaded {doc.uploadedAt} by{' '}
                                  {doc.uploadedBy}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#23804E] shrink-0">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: COMMUNICATION */}
                {activeTab === 'communication' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#4C6858]">
                        Client emails and phone call logs
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenEmailModal(lead, selectedFlight)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-xs font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Compose Email</span>
                      </button>
                    </div>

                    {lead.communications.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#607A6B]">
                        No emails or calls logged yet. Send an offer email to get started.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {lead.communications.map((comm) => (
                          <div
                            key={comm.id}
                            className="p-4 rounded-xl bg-[#FAFDFB] border border-[#E3F0E8]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-[#14261C]">
                                {comm.subject}
                              </span>
                              <span className="text-xs font-medium text-[#23804E]">
                                {comm.channel} · {comm.status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[#4C6858] leading-relaxed">
                              {comm.summary}
                            </p>
                            <p className="mt-2 text-[11px] text-[#738D7D] tabular-nums">
                              {comm.timestamp} · {comm.agentName}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Bottom 2-Panel Row: Quick Actions + Itinerary Preview Card (Image 2) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Quick Actions */}
              <section className="xl:col-span-7 rounded-2xl bg-white border border-[#DCECE2] p-5">
                <h2 className="text-[15px] font-bold text-[#14261C] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#23804E]" />
                  <span>Quick Actions</span>
                </h2>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenTicketSearch(lead)}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#EBF7F0] hover:bg-[#DCF2E4] border border-[#D4ECDD] text-center transition-colors"
                  >
                    <Search className="w-5 h-5 text-[#1F7546]" />
                    <span className="text-xs font-semibold text-[#193A27] leading-tight">
                      Search Flights
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenEmailModal(lead, selectedFlight)}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#F4FAF6] hover:bg-[#E7F5EC] border border-[#E2F0E7] text-center transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#1F7546]" />
                    <span className="text-xs font-semibold text-[#193A27] leading-tight">
                      Send Email
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFlight) onPreviewFlight(lead, selectedFlight);
                      else onOpenTicketSearch(lead);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#F4FAF6] hover:bg-[#E7F5EC] border border-[#E2F0E7] text-center transition-colors"
                  >
                    <FileText className="w-5 h-5 text-[#1F7546]" />
                    <span className="text-xs font-semibold text-[#193A27] leading-tight">
                      Create Itinerary
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('notes');
                      setTimeout(() => noteInputRef.current?.focus(), 60);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#F4FAF6] hover:bg-[#E7F5EC] border border-[#E2F0E7] text-center transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-[#1F7546]" />
                    <span className="text-xs font-semibold text-[#193A27] leading-tight">
                      Add Note
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTaskForm(true)}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#F4FAF6] hover:bg-[#E7F5EC] border border-[#E2F0E7] text-center transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#1F7546]" />
                    <span className="text-xs font-semibold text-[#193A27] leading-tight">
                      Create Task
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDocForm(true)}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#F4FAF6] hover:bg-[#E7F5EC] border border-[#E2F0E7] text-center transition-colors"
                  >
                    <Upload className="w-5 h-5 text-[#1F7546]" />
                    <span className="text-xs font-semibold text-[#193A27] leading-tight">
                      Upload Document
                    </span>
                  </button>
                </div>
              </section>

              {/* Itinerary Preview Summary Card */}
              <section className="xl:col-span-5 rounded-2xl bg-white border border-[#DCECE2] p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-[#14261C] flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#23804E]" />
                    <span>Itinerary Preview</span>
                  </h2>
                  <p className="mt-1.5 text-xs text-[#546F5F] leading-relaxed">
                    Client-ready travel itinerary with flight details, prices and your brand design.
                  </p>
                  <button
                    type="button"
                    disabled={!selectedFlight}
                    onClick={() => selectedFlight && onPreviewFlight(lead, selectedFlight)}
                    className="mt-4 w-full h-10 px-4 rounded-xl bg-[#23804E] hover:bg-[#1B693F] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Preview</span>
                  </button>
                </div>

                {/* Crisp Branded Mini Preview Card */}
                <div className="hidden sm:flex flex-col justify-between w-36 h-32 rounded-xl border border-[#D8EAE0] bg-[#F7FBF8] p-2.5 shrink-0 select-none">
                  <div className="rounded-lg bg-gradient-to-r from-[#EAF7EF] to-[#D2ECDD] px-2 py-1.5 flex items-center justify-between">
                    <StaraviaLogo size="sm" className="scale-[0.65] origin-left" />
                  </div>
                  <div className="space-y-1 px-1">
                    <p className="text-[10px] font-bold text-[#14261C] truncate">
                      {selectedFlight?.airlineName ?? 'Flight Offer'}
                    </p>
                    <p className="text-[9px] text-[#5B7566] tabular-nums">
                      {lead.originCode} → {lead.destinationCode}
                    </p>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-1 border-t border-[#E3EFE8]">
                    <span className="text-[9px] text-[#6A8374]">Total</span>
                    <span className="text-[11px] font-bold text-[#1F7546] tabular-nums">
                      {selectedFlight ? formatCurrency(selectedFlight.pricePerPassenger) : '—'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
