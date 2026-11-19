import React, { useEffect, useMemo, useState } from 'react';
import {
  AlignLeft,
  Armchair,
  Bold,
  Briefcase,
  Check,
  Eye,
  Italic,
  List,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Underline,
  X,
} from 'lucide-react';
import type { EmailTemplate, FlightOption, Lead } from '../types/crm';
import { AVIATION_BANNER_IMAGE } from '../data/seedData';
import { formatCurrency, getSelectedFlightOption, interpolateEmailTemplate } from '../utils/crmLogic';
import { AirlineBadge, StaraviaLogo } from './BrandLogo';

interface EmailTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  initialLead?: Lead;
  initialFlight?: FlightOption;
  templates: EmailTemplate[];
  onCreateTemplate: (template: Omit<EmailTemplate, 'id'>) => EmailTemplate;
  onSendEmail: (payload: {
    leadId?: string;
    recipientEmail: string;
    subject: string;
    bodySummary: string;
    isDraft: boolean;
    templateName: string;
  }) => void;
}

export const EmailTemplatesModal: React.FC<EmailTemplatesModalProps> = ({
  isOpen,
  onClose,
  leads,
  initialLead,
  initialFlight,
  templates,
  onCreateTemplate,
  onSendEmail,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.id ?? leads[0]?.id ?? '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.find((t) => t.id === 'tpl-flight-offer')?.id ?? templates[0]?.id ?? ''
  );
  const [recipientEmail, setRecipientEmail] = useState<string>(initialLead?.email ?? leads[0]?.email ?? '');
  const [selectedFlightId, setSelectedFlightId] = useState<string>(initialFlight?.id ?? '');
  const [subject, setSubject] = useState('');
  const [greeting, setGreeting] = useState('');
  const [introBody, setIntroBody] = useState('');
  const [closingBody, setClosingBody] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [textFormat, setTextFormat] = useState<{ bold: boolean; italic: boolean; underline: boolean }>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Create new template form state
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplSubject, setNewTplSubject] = useState('Flight Update: {{origin}} → {{destination}} | StarAviaTravel');
  const [newTplIntro, setNewTplIntro] = useState(
    'Thank you for choosing StarAviaTravel. Here is an update regarding your itinerary:'
  );
  const [newTplIncludeFlight, setNewTplIncludeFlight] = useState(true);

  const activeLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) ?? initialLead,
    [leads, selectedLeadId, initialLead]
  );

  const activeFlight = useMemo(() => {
    if (activeLead) {
      return (
        activeLead.flightOptions.find((f) => f.id === selectedFlightId) ??
        initialFlight ??
        getSelectedFlightOption(activeLead)
      );
    }
    return initialFlight;
  }, [activeLead, selectedFlightId, initialFlight]);

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? templates[0],
    [templates, selectedTemplateId]
  );

  useEffect(() => {
    if (!isOpen) return;
    const lead = initialLead ?? leads[0];
    if (lead) {
      setSelectedLeadId(lead.id);
      setRecipientEmail(lead.email);
      setSelectedFlightId(initialFlight?.id ?? getSelectedFlightOption(lead)?.id ?? '');
    }
    setIsPreviewMode(false);
    setCreatingTemplate(false);
    setValidationError(null);
  }, [isOpen, initialLead, initialFlight, leads]);

  useEffect(() => {
    if (!isOpen || !activeTemplate) return;
    const interpolated = interpolateEmailTemplate(activeTemplate, activeLead, activeFlight);
    setSubject(interpolated.subject);
    setGreeting(interpolated.greeting);
    setIntroBody(interpolated.introBody);
    setClosingBody(interpolated.closingBody);
  }, [isOpen, activeTemplate, activeLead, activeFlight]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLeadSwitch = (leadId: string) => {
    setSelectedLeadId(leadId);
    const nextLead = leads.find((l) => l.id === leadId);
    if (nextLead) {
      setRecipientEmail(nextLead.email);
      setSelectedFlightId(getSelectedFlightOption(nextLead)?.id ?? '');
    }
  };

  const handleCreateTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim() || !newTplSubject.trim()) return;
    const created = onCreateTemplate({
      name: newTplName.trim(),
      category: 'Sales',
      subject: newTplSubject.trim(),
      greeting: 'Dear {{clientName}},',
      introBody: newTplIntro.trim(),
      closingBody: 'Please reply directly to this message for immediate assistance.\n\nBest regards,\nStarAviaTravel Team',
      includeFlightCard: newTplIncludeFlight,
    });
    setSelectedTemplateId(created.id);
    setCreatingTemplate(false);
    setNewTplName('');
  };

  const handleDispatch = (isDraft: boolean) => {
    if (!recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      setValidationError('Enter a valid recipient email address.');
      return;
    }
    if (!subject.trim()) {
      setValidationError('Subject line cannot be empty.');
      return;
    }
    setValidationError(null);
    onSendEmail({
      leadId: activeLead?.id,
      recipientEmail: recipientEmail.trim(),
      subject: subject.trim(),
      bodySummary: `${activeTemplate?.name ?? 'Custom Email'} — ${introBody.slice(0, 110)}`,
      isDraft,
      templateName: activeTemplate?.name ?? 'Custom',
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F2418]/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl border border-[#D4E6DB] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5F1E9] flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </span>
            <h2 id="email-modal-title" className="text-lg font-bold text-[#14261C]">
              Send Email to Client
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Send Email dialog"
            className="w-9 h-9 rounded-xl text-[#567261] hover:bg-[#F1FAF4] hover:text-[#14261C] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Templates Sidebar + Right Email Composer */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Templates List */}
          <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[#E6F1EA] bg-[#FAFDFA] p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-[#14261C] mb-3">Email Templates</h3>

            <div className="space-y-1.5">
              {templates.map((tpl) => {
                const isSelected = tpl.id === activeTemplate?.id && !creatingTemplate;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setCreatingTemplate(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-[#E1F5E8] border-[#B4E0C5] text-[#145531] font-semibold'
                        : 'bg-white border-[#E4EFE8] text-[#274032] hover:bg-[#F2FAF5]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Mail
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#23804E]' : 'text-[#668272]'
                        }`}
                      />
                      <span className="truncate">{tpl.name}</span>
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#23804E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCreatingTemplate((v) => !v)}
              className="mt-3 w-full h-10 px-3 rounded-xl border border-[#CFE4D7] bg-white hover:bg-[#EFF9F2] text-sm font-semibold text-[#1D7344] inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>

            {creatingTemplate && (
              <form
                onSubmit={handleCreateTemplateSubmit}
                className="mt-3 p-3 rounded-xl bg-white border border-[#CBE4D5] space-y-2.5"
              >
                <p className="text-xs font-bold text-[#14261C]">New Reusable Template</p>
                <input
                  type="text"
                  value={newTplName}
                  onChange={(e) => setNewTplName(e.target.value)}
                  placeholder="Template name (e.g., VIP Upgrade)"
                  required
                  className="w-full h-9 px-2.5 rounded-lg border border-[#DCECE2] text-xs focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                />
                <input
                  type="text"
                  value={newTplSubject}
                  onChange={(e) => setNewTplSubject(e.target.value)}
                  placeholder="Subject line..."
                  required
                  className="w-full h-9 px-2.5 rounded-lg border border-[#DCECE2] text-xs focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                />
                <textarea
                  rows={2}
                  value={newTplIntro}
                  onChange={(e) => setNewTplIntro(e.target.value)}
                  placeholder="Intro message..."
                  className="w-full p-2 rounded-lg border border-[#DCECE2] text-xs focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                />
                <label className="flex items-center gap-2 text-xs text-[#385343]">
                  <input
                    type="checkbox"
                    checked={newTplIncludeFlight}
                    onChange={(e) => setNewTplIncludeFlight(e.target.checked)}
                    className="accent-[#23804E]"
                  />
                  <span>Include flight offer box</span>
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="submit"
                    className="flex-1 h-8 rounded-lg bg-[#23804E] text-white text-xs font-semibold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatingTemplate(false)}
                    className="px-2.5 h-8 rounded-lg border border-[#DCECE2] text-xs text-[#4A6354]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </aside>

          {/* Right Email Composer */}
          <div className="flex-1 min-w-0 p-4 overflow-y-auto space-y-2.5 bg-white">
            {/* Recipient & Lead Context */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <label htmlFor="email-recipient-input" className="w-16 text-sm font-medium text-[#5A7464]">
                  To:
                </label>
                <div className="flex-1 min-w-[220px] flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2FAF5] border border-[#D4E7DC] text-sm font-medium text-[#14261C]">
                    <input
                      id="email-recipient-input"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="bg-transparent text-sm font-medium text-[#14261C] focus:outline-none w-52 sm:w-60"
                    />
                  </div>
                  <select
                    aria-label="Select lead context"
                    value={selectedLeadId}
                    onChange={(e) => handleLeadSwitch(e.target.value)}
                    className="h-9 px-2.5 rounded-xl border border-[#DCECE2] bg-white text-xs font-medium text-[#2A4535] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id} — {l.clientName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <label htmlFor="email-subject-input" className="w-16 text-sm font-medium text-[#5A7464]">
                  Subject:
                </label>
                <input
                  id="email-subject-input"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-[#DCECE2] text-sm font-semibold text-[#14261C] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                />
              </div>

              {activeLead && activeLead.flightOptions.length > 1 && activeTemplate?.includeFlightCard && (
                <div className="flex items-center gap-2.5">
                  <label htmlFor="email-flight-select" className="w-16 text-sm font-medium text-[#5A7464]">
                    Flight:
                  </label>
                  <select
                    id="email-flight-select"
                    value={activeFlight?.id ?? ''}
                    onChange={(e) => setSelectedFlightId(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-[#DCECE2] bg-[#F8FCF9] text-xs font-semibold text-[#1E3B2B] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                  >
                    {activeLead.flightOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.airlineName} ({opt.outbound.flightNumber}) — {formatCurrency(opt.pricePerPassenger)}/pax
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {validationError && (
              <p role="alert" className="text-xs font-semibold text-[#B53737] bg-[#FDF2F2] border border-[#F2CECE] px-3 py-2 rounded-xl">
                {validationError}
              </p>
            )}

            {/* Editor Surface with Toolbar + Branded Email Canvas (Image 3) */}
            <div className="rounded-2xl border border-[#DCECE2] overflow-hidden bg-white">
              {/* Formatting Toolbar */}
              {!isPreviewMode && (
                <div className="px-3.5 py-2 border-b border-[#E8F2EC] bg-[#FAFDFA] flex flex-wrap items-center gap-1.5 text-[#3B5746]">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#DCECE2] text-xs font-medium text-[#1F3A2B] mr-1">
                    Paragraph
                  </span>
                  <button
                    type="button"
                    aria-label="Toggle bold text"
                    onClick={() => setTextFormat((f) => ({ ...f, bold: !f.bold }))}
                    className={`p-1.5 rounded-lg transition-colors ${
                      textFormat.bold ? 'bg-[#E1F5E8] text-[#18683C]' : 'hover:bg-[#EEF7F1]'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Toggle italic text"
                    onClick={() => setTextFormat((f) => ({ ...f, italic: !f.italic }))}
                    className={`p-1.5 rounded-lg transition-colors ${
                      textFormat.italic ? 'bg-[#E1F5E8] text-[#18683C]' : 'hover:bg-[#EEF7F1]'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Toggle underline text"
                    onClick={() => setTextFormat((f) => ({ ...f, underline: !f.underline }))}
                    className={`p-1.5 rounded-lg transition-colors ${
                      textFormat.underline ? 'bg-[#E1F5E8] text-[#18683C]' : 'hover:bg-[#EEF7F1]'
                    }`}
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <span className="h-4 w-px bg-[#DCECE2] mx-1" aria-hidden="true" />
                  <button
                    type="button"
                    aria-label="Insert bullet point"
                    onClick={() => setIntroBody((prev) => `${prev}\n• `)}
                    className="p-1.5 rounded-lg hover:bg-[#EEF7F1]"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Reset template wording"
                    onClick={() => {
                      if (!activeTemplate) return;
                      const reset = interpolateEmailTemplate(activeTemplate, activeLead, activeFlight);
                      setGreeting(reset.greeting);
                      setIntroBody(reset.introBody);
                      setClosingBody(reset.closingBody);
                    }}
                    className="ml-auto px-2.5 py-1 rounded-lg text-xs font-medium text-[#23804E] hover:bg-[#EAF7EF] inline-flex items-center gap-1"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Reset copy</span>
                  </button>
                </div>
              )}

              {/* Branded Email Canvas */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* Branded Aviation Wing Header */}
                <div className="relative h-20 rounded-xl overflow-hidden border border-[#E4EFE8] bg-[#EEF8F2]">
                  <img
                    src={AVIATION_BANNER_IMAGE}
                    alt="Staraviatravel aviation wing banner"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-right"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-[#F6FCF8] via-[#F6FCF8]/75 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="relative h-full px-6 flex items-center">
                    <StaraviaLogo size="lg" />
                  </div>
                </div>

                {/* Greeting & Editable Intro */}
                {isPreviewMode ? (
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-[#14261C]">{greeting}</p>
                    <p
                      className={`text-sm text-[#2A4234] whitespace-pre-line leading-relaxed ${
                        textFormat.bold ? 'font-semibold' : ''
                      } ${textFormat.italic ? 'italic' : ''} ${textFormat.underline ? 'underline' : ''}`}
                    >
                      {introBody}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      aria-label="Email greeting"
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      className="w-full text-lg font-bold text-[#14261C] bg-transparent border-b border-transparent hover:border-[#DCECE2] focus:border-[#23804E] focus:outline-none py-0.5"
                    />
                    <textarea
                      rows={2}
                      aria-label="Email opening message"
                      value={introBody}
                      onChange={(e) => setIntroBody(e.target.value)}
                      className={`w-full text-sm text-[#2A4234] leading-relaxed bg-[#FAFDFB] border border-[#E7F2EB] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                        textFormat.bold ? 'font-semibold' : ''
                      } ${textFormat.italic ? 'italic' : ''} ${textFormat.underline ? 'underline' : ''}`}
                    />
                  </div>
                )}

                {/* Embedded Flight Offer Card (Image 3) */}
                {activeTemplate?.includeFlightCard && activeFlight && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#EDF8F1] border border-[#D4ECDD] p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-[130px]">
                        <AirlineBadge code={activeFlight.airlineCode} size="sm" />
                        <span className="text-sm font-bold text-[#14261C]">
                          {activeFlight.airlineName}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div>
                          <p className="font-bold text-[#14261C] tabular-nums">
                            {activeFlight.outbound.fromCode} → {activeFlight.outbound.toCode}
                          </p>
                          <p className="text-xs text-[#4C6858] tabular-nums">
                            {activeFlight.outbound.dateLabel}, {activeFlight.outbound.departTime} –{' '}
                            {activeFlight.outbound.arriveTime}
                          </p>
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-[#CBE5D6]" aria-hidden="true" />
                        <div>
                          <p className="font-bold text-[#14261C] tabular-nums">
                            {activeFlight.returnLeg.fromCode} → {activeFlight.returnLeg.toCode}
                          </p>
                          <p className="text-xs text-[#4C6858] tabular-nums">
                            {activeFlight.returnLeg.dateLabel}, {activeFlight.returnLeg.departTime} –{' '}
                            {activeFlight.returnLeg.arriveTime}
                          </p>
                        </div>
                      </div>

                      <div className="text-right ml-auto">
                        <p className="text-xl font-bold text-[#14261C] tabular-nums leading-none">
                          {formatCurrency(activeFlight.pricePerPassenger)}
                        </p>
                        <p className="mt-1 text-xs text-[#546F5F]">per passenger</p>
                      </div>
                    </div>

                    {/* 4 Feature Columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5F0E9] border-b border-[#E8F2EC] pb-3">
                      <div className="flex flex-col items-center justify-center py-1.5 px-3 text-center">
                        <Briefcase className="w-5 h-5 text-[#23804E] mb-1" />
                        <span className="text-xs font-semibold text-[#14261C]">Baggage</span>
                        <span className="text-xs text-[#4C6858] tabular-nums">{activeFlight.baggage}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-1.5 px-3 text-center">
                        <Armchair className="w-5 h-5 text-[#23804E] mb-1" />
                        <span className="text-xs font-semibold text-[#14261C]">
                          {activeFlight.cabinClass}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-1.5 px-3 text-center">
                        <RefreshCw className="w-5 h-5 text-[#23804E] mb-1" />
                        <span className="text-xs font-semibold text-[#14261C]">
                          {activeFlight.changeable ? 'Changeable' : 'Fixed Dates'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-1.5 px-3 text-center">
                        <ShieldCheck className="w-5 h-5 text-[#23804E] mb-1" />
                        <span className="text-xs font-semibold text-[#14261C]">
                          {activeFlight.refundable ? 'Refundable' : 'Non-refundable'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Closing Copy */}
                {isPreviewMode ? (
                  <p className="text-sm text-[#2A4234] whitespace-pre-line leading-relaxed">
                    {closingBody}
                  </p>
                ) : (
                  <textarea
                    rows={3}
                    aria-label="Email closing message"
                    value={closingBody}
                    onChange={(e) => setClosingBody(e.target.value)}
                    className="w-full text-sm text-[#2A4234] leading-relaxed bg-[#FAFDFB] border border-[#E7F2EB] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                  />
                )}

                <div className="h-0.5 w-full bg-[#23804E]/50 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions (Image 3) */}
        <div className="px-5 py-3.5 border-t border-[#E5F1E9] bg-[#FAFDFA] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewMode((prev) => !prev)}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-semibold transition-colors ${
              isPreviewMode
                ? 'bg-[#E2F5E9] border-[#A9DCBD] text-[#155E36]'
                : 'bg-white border-[#D4E6DB] text-[#1F3A2B] hover:bg-[#F2FAF5]'
            }`}
          >
            <Eye className="w-4 h-4 text-[#23804E]" />
            <span>{isPreviewMode ? 'Edit Email' : 'Preview'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-[#D4E6DB] bg-white hover:bg-[#F3FAF6] text-sm font-semibold text-[#314C3C]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDispatch(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[#D4E6DB] bg-white hover:bg-[#F3FAF6] text-sm font-semibold text-[#1F3A2B]"
            >
              <Save className="w-4 h-4 text-[#23804E]" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleDispatch(false)}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
