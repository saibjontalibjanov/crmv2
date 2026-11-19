import React, { useEffect, useState } from 'react';
import { Plane, X } from 'lucide-react';
import type {
  Agent,
  CabinClass,
  CountryCode,
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
} from '../types/crm';
import { AIRPORT_CITIES } from '../data/seedData';
import { formatShortDateRange, validateNewLead } from '../utils/crmLogic';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  editingLead?: Lead;
  onSaveLead: (data: {
    id?: string;
    clientName: string;
    countryCode: CountryCode;
    email: string;
    phone: string;
    telegramHandle?: string;
    whatsappPhone?: string;
    originCode: string;
    originCity: string;
    destinationCode: string;
    destinationCity: string;
    departIso: string;
    returnIso: string;
    travelDatesLabel: string;
    cabinClass: CabinClass;
    pax: number;
    source: LeadSource;
    status: LeadStatus;
    priority: LeadPriority;
    assignedAgentId: string;
    tags: string[];
  }) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  agents,
  editingLead,
  onSaveLead,
}) => {
  const [clientName, setClientName] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('UZ');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [originCode, setOriginCode] = useState('TAS');
  const [destinationCode, setDestinationCode] = useState('DXB');
  const [departIso, setDepartIso] = useState('2026-12-10');
  const [returnIso, setReturnIso] = useState('2026-12-17');
  const [cabinClass, setCabinClass] = useState<CabinClass>('Business Class');
  const [pax, setPax] = useState(1);
  const [source, setSource] = useState<LeadSource>('WhatsApp');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [priority, setPriority] = useState<LeadPriority>('High');
  const [assignedAgentId, setAssignedAgentId] = useState(agents[0]?.id ?? 'agent-st');
  const [tagsText, setTagsText] = useState('Corporate');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingLead) {
      setClientName(editingLead.clientName);
      setCountryCode(editingLead.countryCode);
      setEmail(editingLead.email);
      setPhone(editingLead.phone);
      setTelegramHandle(editingLead.telegramHandle ?? '');
      setOriginCode(editingLead.originCode);
      setDestinationCode(editingLead.destinationCode);
      setDepartIso(editingLead.departIso);
      setReturnIso(editingLead.returnIso);
      setCabinClass(editingLead.cabinClass);
      setPax(editingLead.pax);
      setSource(editingLead.source);
      setStatus(editingLead.status);
      setPriority(editingLead.priority);
      setAssignedAgentId(editingLead.assignedAgentId);
      setTagsText(editingLead.tags.join(', '));
    } else {
      setClientName('');
      setCountryCode('UZ');
      setEmail('');
      setPhone('');
      setTelegramHandle('');
      setOriginCode('TAS');
      setDestinationCode('DXB');
      setDepartIso('2026-12-14');
      setReturnIso('2026-12-21');
      setCabinClass('Business Class');
      setPax(1);
      setSource('WhatsApp');
      setStatus('New');
      setPriority('Medium');
      setAssignedAgentId(agents[0]?.id ?? 'agent-st');
      setTagsText('Corporate');
    }
    setErrors({});
  }, [isOpen, editingLead, agents]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateNewLead({
      clientName,
      email,
      phone,
      originCode,
      destinationCode,
      pax,
      departIso,
      returnIso,
      source,
      priority,
      status,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const cleanOrigin = originCode.trim().toUpperCase();
    const cleanDest = destinationCode.trim().toUpperCase();
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSaveLead({
      id: editingLead?.id,
      clientName: clientName.trim(),
      countryCode,
      email: email.trim(),
      phone: phone.trim(),
      telegramHandle: telegramHandle.trim() || undefined,
      whatsappPhone: phone.trim(),
      originCode: cleanOrigin,
      originCity: AIRPORT_CITIES[cleanOrigin] ?? `${cleanOrigin} Airport`,
      destinationCode: cleanDest,
      destinationCity: AIRPORT_CITIES[cleanDest] ?? `${cleanDest} Airport`,
      departIso,
      returnIso,
      travelDatesLabel: formatShortDateRange(departIso, returnIso),
      cabinClass,
      pax,
      source,
      status,
      priority,
      assignedAgentId,
      tags,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F2418]/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl border border-[#D4E6DB] shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5F1E9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </span>
            <h2 id="lead-form-title" className="text-lg font-bold text-[#14261C]">
              {editingLead ? `Edit Lead ${editingLead.id}` : 'Create New Lead'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lead form"
            className="w-9 h-9 rounded-xl text-[#567261] hover:bg-[#F1FAF4] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lf-client" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Client Full Name *
              </label>
              <input
                id="lf-client"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Jasur Toshmatov"
                className={`w-full h-10 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                  errors.clientName ? 'border-[#D94242]' : 'border-[#D7E8DD]'
                }`}
              />
              {errors.clientName && (
                <p className="mt-1 text-xs text-[#C23434]">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lf-country" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Nationality / Region
              </label>
              <select
                id="lf-country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value as CountryCode)}
                className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
              >
                <option value="UZ">Uzbekistan (UZ)</option>
                <option value="RU">Russia (RU)</option>
                <option value="KZ">Kazakhstan (KZ)</option>
                <option value="AE">UAE (AE)</option>
                <option value="TR">Turkey (TR)</option>
                <option value="AT">Austria (AT)</option>
                <option value="SG">Singapore (SG)</option>
                <option value="GB">United Kingdom (GB)</option>
              </select>
            </div>

            <div>
              <label htmlFor="lf-email" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Email Address *
              </label>
              <input
                id="lf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className={`w-full h-10 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                  errors.email ? 'border-[#D94242]' : 'border-[#D7E8DD]'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-[#C23434]">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="lf-phone" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Phone Number *
              </label>
              <input
                id="lf-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className={`w-full h-10 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                  errors.phone ? 'border-[#D94242]' : 'border-[#D7E8DD]'
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-[#C23434]">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="lf-origin" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Origin IATA *
              </label>
              <input
                id="lf-origin"
                type="text"
                maxLength={3}
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value.toUpperCase())}
                className={`w-full h-10 px-3.5 rounded-xl border text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                  errors.originCode ? 'border-[#D94242]' : 'border-[#D7E8DD]'
                }`}
              />
              {errors.originCode && (
                <p className="mt-1 text-xs text-[#C23434]">{errors.originCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="lf-dest" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Destination IATA *
              </label>
              <input
                id="lf-dest"
                type="text"
                maxLength={3}
                value={destinationCode}
                onChange={(e) => setDestinationCode(e.target.value.toUpperCase())}
                className={`w-full h-10 px-3.5 rounded-xl border text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                  errors.destinationCode ? 'border-[#D94242]' : 'border-[#D7E8DD]'
                }`}
              />
              {errors.destinationCode && (
                <p className="mt-1 text-xs text-[#C23434]">{errors.destinationCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="lf-depart" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Departure Date *
              </label>
              <input
                id="lf-depart"
                type="date"
                value={departIso}
                onChange={(e) => setDepartIso(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                  errors.departIso ? 'border-[#D94242]' : 'border-[#D7E8DD]'
                }`}
              />
              {errors.departIso && (
                <p className="mt-1 text-xs text-[#C23434]">{errors.departIso}</p>
              )}
            </div>

            <div>
              <label htmlFor="lf-return" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Return Date *
              </label>
              <input
                id="lf-return"
                type="date"
                value={returnIso}
                onChange={(e) => setReturnIso(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E] ${
                  errors.returnIso ? 'border-[#D94242]' : 'border-[#D7E8DD]'
                }`}
              />
              {errors.returnIso && (
                <p className="mt-1 text-xs text-[#C23434]">{errors.returnIso}</p>
              )}
            </div>

            <div>
              <label htmlFor="lf-pax" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Passengers *
              </label>
              <input
                id="lf-pax"
                type="number"
                min={1}
                max={20}
                value={pax}
                onChange={(e) => setPax(parseInt(e.target.value, 10) || 1)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#D7E8DD] text-sm tabular-nums"
              />
              {errors.pax && <p className="mt-1 text-xs text-[#C23434]">{errors.pax}</p>}
            </div>

            <div>
              <label htmlFor="lf-cabin" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Cabin Class
              </label>
              <select
                id="lf-cabin"
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business Class">Business Class</option>
                <option value="First Class">First Class</option>
              </select>
            </div>

            <div>
              <label htmlFor="lf-source" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Source
              </label>
              <select
                id="lf-source"
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
              >
                <option value="Telegram">Telegram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website">Website</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
              </select>
            </div>

            <div>
              <label htmlFor="lf-agent" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Assigned Agent
              </label>
              <select
                id="lf-agent"
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lf-priority" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Priority
              </label>
              <select
                id="lf-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="lf-tags" className="block text-xs font-semibold text-[#3C5848] mb-1">
                Tags (comma separated)
              </label>
              <input
                id="lf-tags"
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Corporate, Urgent"
                className="w-full h-10 px-3.5 rounded-xl border border-[#D7E8DD] text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6F1EA] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-[#D4E6DB] text-sm font-semibold text-[#314C3C] hover:bg-[#F3FAF6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold"
            >
              {editingLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
