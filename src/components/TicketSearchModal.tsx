import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Check,
  Eye,
  Plane,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { FlightOption, FlightSearchQuery, Lead } from '../types/crm';
import { formatCurrency, searchFlights } from '../utils/crmLogic';
import { AirlineBadge } from './BrandLogo';

interface TicketSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: FlightOption[];
  leads: Lead[];
  targetLead?: Lead;
  onAddFlightToLead: (leadId: string, flight: FlightOption) => void;
  onPreviewFlight: (lead: Lead | undefined, flight: FlightOption) => void;
}

export const TicketSearchModal: React.FC<TicketSearchModalProps> = ({
  isOpen,
  onClose,
  catalog,
  leads,
  targetLead,
  onAddFlightToLead,
  onPreviewFlight,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(targetLead?.id ?? leads[0]?.id ?? '');
  const [query, setQuery] = useState<FlightSearchQuery>({
    origin: targetLead?.originCode ?? 'TAS',
    destination: targetLead?.destinationCode ?? '',
    cabinClass: 'All',
    stops: 'all',
    airline: 'All',
    sortBy: 'price_asc',
  });
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (targetLead) {
      setSelectedLeadId(targetLead.id);
      setQuery((prev) => ({
        ...prev,
        origin: targetLead.originCode,
        destination: targetLead.destinationCode,
      }));
    } else {
      setQuery((prev) => ({
        ...prev,
        origin: 'TAS',
        destination: '',
      }));
    }
    setRecentlyAddedIds([]);
  }, [isOpen, targetLead]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const airlines = useMemo(
    () => Array.from(new Set(catalog.map((f) => f.airlineName))).sort(),
    [catalog]
  );

  const results = useMemo(() => searchFlights(catalog, query), [catalog, query]);
  const activeLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId),
    [leads, selectedLeadId]
  );

  if (!isOpen) return null;

  const isAlreadyInLead = (flight: FlightOption): boolean => {
    if (!activeLead) return false;
    return activeLead.flightOptions.some(
      (f) =>
        f.outbound.flightNumber === flight.outbound.flightNumber &&
        f.returnLeg.flightNumber === flight.returnLeg.flightNumber &&
        f.cabinClass === flight.cabinClass
    );
  };

  const handleAttach = (flight: FlightOption) => {
    if (!selectedLeadId) return;
    onAddFlightToLead(selectedLeadId, flight);
    setRecentlyAddedIds((prev) => [...prev, flight.id]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-search-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F2418]/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl border border-[#D4E6DB] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5F1E9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </span>
            <div>
              <h2 id="ticket-search-title" className="text-lg font-bold text-[#14261C]">
                Ticket Search
              </h2>
              <p className="text-xs text-[#5E7868]">
                Compare carrier availability, preview client itineraries, and attach options to a lead
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Ticket Search dialog"
            className="w-9 h-9 rounded-xl text-[#567261] hover:bg-[#F1FAF4] hover:text-[#14261C] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filters Toolbar */}
        <div className="p-5 bg-[#F6FBF8] border-b border-[#E5F1E9] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            <div>
              <label htmlFor="ts-origin" className="block text-[11px] font-semibold text-[#5A7464] mb-1">
                Origin (IATA / City)
              </label>
              <input
                id="ts-origin"
                type="text"
                value={query.origin}
                onChange={(e) => setQuery((q) => ({ ...q, origin: e.target.value }))}
                placeholder="TAS"
                className="w-full h-10 px-3 rounded-xl bg-white border border-[#D7E8DD] text-sm font-semibold text-[#14261C] uppercase focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              />
            </div>

            <div>
              <label htmlFor="ts-destination" className="block text-[11px] font-semibold text-[#5A7464] mb-1">
                Destination
              </label>
              <input
                id="ts-destination"
                type="text"
                value={query.destination}
                onChange={(e) => setQuery((q) => ({ ...q, destination: e.target.value }))}
                placeholder="DXB, IST, ZRH..."
                className="w-full h-10 px-3 rounded-xl bg-white border border-[#D7E8DD] text-sm font-semibold text-[#14261C] uppercase focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              />
            </div>

            <div>
              <label htmlFor="ts-cabin" className="block text-[11px] font-semibold text-[#5A7464] mb-1">
                Cabin Class
              </label>
              <select
                id="ts-cabin"
                value={query.cabinClass}
                onChange={(e) => setQuery((q) => ({ ...q, cabinClass: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-white border border-[#D7E8DD] text-sm font-medium text-[#14261C] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              >
                <option value="All">All Cabins</option>
                <option value="Economy">Economy</option>
                <option value="Business Class">Business Class</option>
              </select>
            </div>

            <div>
              <label htmlFor="ts-stops" className="block text-[11px] font-semibold text-[#5A7464] mb-1">
                Stops
              </label>
              <select
                id="ts-stops"
                value={query.stops}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, stops: e.target.value as FlightSearchQuery['stops'] }))
                }
                className="w-full h-10 px-3 rounded-xl bg-white border border-[#D7E8DD] text-sm font-medium text-[#14261C] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              >
                <option value="all">Any Stops</option>
                <option value="direct">Direct Only</option>
                <option value="1-stop">1 Stop</option>
              </select>
            </div>

            <div>
              <label htmlFor="ts-airline" className="block text-[11px] font-semibold text-[#5A7464] mb-1">
                Airline
              </label>
              <select
                id="ts-airline"
                value={query.airline}
                onChange={(e) => setQuery((q) => ({ ...q, airline: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-white border border-[#D7E8DD] text-sm font-medium text-[#14261C] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              >
                <option value="All">All Airlines</option>
                {airlines.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ts-sort" className="block text-[11px] font-semibold text-[#5A7464] mb-1">
                Sort By
              </label>
              <select
                id="ts-sort"
                value={query.sortBy}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, sortBy: e.target.value as FlightSearchQuery['sortBy'] }))
                }
                className="w-full h-10 px-3 rounded-xl bg-white border border-[#D7E8DD] text-sm font-medium text-[#14261C] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              >
                <option value="price_asc">Lowest Price</option>
                <option value="duration_asc">Shortest Flight</option>
                <option value="depart_asc">Earliest Departure</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-[#4C6858]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#23804E]" />
              <span className="font-semibold text-[#14261C] tabular-nums">{results.length}</span>
              <span>matching flight options</span>
              {(query.destination || query.cabinClass !== 'All' || query.airline !== 'All' || query.stops !== 'all') && (
                <button
                  type="button"
                  onClick={() =>
                    setQuery({
                      origin: 'TAS',
                      destination: '',
                      cabinClass: 'All',
                      stops: 'all',
                      airline: 'All',
                      sortBy: 'price_asc',
                    })
                  }
                  className="ml-1 font-semibold text-[#23804E] hover:underline"
                >
                  Show all routes
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="ts-target-lead" className="text-xs font-semibold text-[#4C6858]">
                Attach to Lead:
              </label>
              <select
                id="ts-target-lead"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white border border-[#D7E8DD] text-xs font-semibold text-[#14261C] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} — {l.clientName} ({l.originCode}→{l.destinationCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {results.length === 0 ? (
            <div className="py-14 text-center">
              <Plane className="w-8 h-8 text-[#23804E] mx-auto mb-2" />
              <p className="text-base font-semibold text-[#14261C]">No flights match these filters</p>
              <p className="mt-1 text-sm text-[#5E7868]">
                Clear destination or airline filters to view all available TAS departures.
              </p>
            </div>
          ) : (
            results.map((flight) => {
              const attached = isAlreadyInLead(flight) || recentlyAddedIds.includes(flight.id);
              return (
                <article
                  key={flight.id}
                  className="rounded-2xl border border-[#DCECE2] hover:border-[#B6D9C4] bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3 lg:w-44 shrink-0">
                    <AirlineBadge code={flight.airlineCode} size="sm" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#14261C] truncate">
                        {flight.airlineName}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[#E4F6EB] text-[#1A6B3E] text-[11px] font-semibold">
                        {flight.cabinClass}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-sm">
                    <div>
                      <p className="font-bold text-[#14261C] tabular-nums">
                        {flight.outbound.fromCode} → {flight.outbound.toCode}
                      </p>
                      <p className="text-xs text-[#4C6858] tabular-nums">
                        {flight.outbound.dateLabel} · {flight.outbound.departTime}–{flight.outbound.arriveTime}
                      </p>
                      <p className="text-[11px] font-mono text-[#6E8577]">
                        {flight.outbound.flightNumber} ·{' '}
                        {flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stop`}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center gap-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#EEF8F2] text-xs font-semibold text-[#244D36] tabular-nums">
                        {flight.outbound.duration}
                      </span>
                      <span className="text-[11px] text-[#607A6B] inline-flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#23804E]" />
                        {flight.baggage}
                      </span>
                      <span className="text-[11px] text-[#607A6B] inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-[#23804E]" />
                        {flight.fareCondition}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-[#14261C] tabular-nums">
                        {flight.returnLeg.fromCode} → {flight.returnLeg.toCode}
                      </p>
                      <p className="text-xs text-[#4C6858] tabular-nums">
                        {flight.returnLeg.dateLabel} · {flight.returnLeg.departTime}–{flight.returnLeg.arriveTime}
                        {flight.returnLeg.nextDay && (
                          <span className="ml-1 text-[#C8433B] font-bold">+1</span>
                        )}
                      </p>
                      <p className="text-[11px] font-mono text-[#6E8577]">
                        {flight.returnLeg.flightNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EEF5F0]">
                    <div className="text-left lg:text-right">
                      <p className="text-lg font-bold text-[#14261C] leading-none tabular-nums">
                        {formatCurrency(flight.pricePerPassenger)}
                      </p>
                      <p className="mt-1 text-[11px] text-[#607A6B]">per passenger</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewFlight(activeLead, flight)}
                        aria-label={`Preview ${flight.airlineName} ${flight.outbound.flightNumber}`}
                        className="h-9 px-3 rounded-xl border border-[#D4E6DB] bg-white hover:bg-[#F2FAF5] text-xs font-semibold text-[#1D3B2B] inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#23804E]" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        disabled={attached}
                        onClick={() => handleAttach(flight)}
                        aria-label={`Add ${flight.airlineName} to lead`}
                        className={`h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                          attached
                            ? 'bg-[#E2F5E9] text-[#175B36] border border-[#B9E2C9] cursor-default'
                            : 'bg-[#23804E] hover:bg-[#1B693F] text-white'
                        }`}
                      >
                        {attached ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Lead</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
