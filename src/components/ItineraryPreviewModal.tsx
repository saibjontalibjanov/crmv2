import React, { useEffect, useState } from 'react';
import {
  Armchair,
  ArrowRight,
  Briefcase,
  Check,
  Copy,
  Download,
  Info,
  Mail,
  Plane,
  Printer,
  Ticket,
  X,
} from 'lucide-react';
import type { FlightOption, Lead } from '../types/crm';
import { AVIATION_BANNER_IMAGE } from '../data/seedData';
import { formatCurrency } from '../utils/crmLogic';
import { AirlineBadge, StaraviaLogo } from './BrandLogo';

interface ItineraryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
  flight?: FlightOption;
  onSendViaEmail: (lead: Lead | undefined, flight: FlightOption) => void;
}

export const ItineraryPreviewModal: React.FC<ItineraryPreviewModalProps> = ({
  isOpen,
  onClose,
  lead,
  flight,
  onSendViaEmail,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !flight) return null;

  const clientName = lead?.clientName ?? 'Valued Client';
  const pax = lead?.pax ?? 1;
  const totalForGroup = flight.pricePerPassenger * pax;

  const handleCopySummary = () => {
    const summary = [
      `StarAviaTravel — Trip Itinerary`,
      `Client: ${clientName}`,
      `Airline: ${flight.airlineName} (${flight.cabinClass})`,
      `Outbound: ${flight.outbound.fromCode} → ${flight.outbound.toCode} (${flight.outbound.flightNumber}) | ${flight.outbound.dateLabel}, ${flight.outbound.departTime} - ${flight.outbound.arriveTime} (${flight.outbound.duration})`,
      `Return: ${flight.returnLeg.fromCode} → ${flight.returnLeg.toCode} (${flight.returnLeg.flightNumber}) | ${flight.returnLeg.dateLabel}, ${flight.returnLeg.departTime} - ${flight.returnLeg.arriveTime} (${flight.returnLeg.duration})`,
      `Baggage: ${flight.baggage} | Fare: ${flight.fareCondition}`,
      `Price: ${formatCurrency(flight.pricePerPassenger)} per passenger${pax > 1 ? ` (${formatCurrency(totalForGroup)} total for ${pax} passengers)` : ''}`,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadItinerary = () => {
    const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>StarAviaTravel Itinerary — ${flight.outbound.fromCode} to ${flight.outbound.toCode}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #14261c; background: #f4faf6; padding: 32px; }
  .card { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #d7e8dd; border-radius: 16px; padding: 28px; }
  .brand { font-family: Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 0.12em; }
  .sub { font-size: 11px; letter-spacing: 0.25em; color: #23804e; font-weight: 700; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e4f0e8; padding-bottom: 16px; margin-bottom: 20px; }
  .price-box { background: #eaf7ef; border-radius: 12px; padding: 16px; text-align: center; margin-top: 16px; }
  .price { font-size: 28px; font-weight: 700; color: #155c35; }
  .leg { border: 1px solid #e4f0e8; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .note { margin-top: 16px; background: #edf8f1; padding: 12px; border-radius: 10px; font-size: 13px; color: #2d553f; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div><div class="brand">STARAVIA</div><div class="sub">★ TRAVEL ★</div></div>
      <div style="text-align:right"><strong>Your Trip Itinerary</strong><br/>${flight.outbound.fromCode} → ${flight.outbound.toCode}</div>
    </div>
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>Please find below your flight option details from ${flight.outbound.fromCity} (${flight.outbound.fromCode}) to ${flight.outbound.toCity} (${flight.outbound.toCode}).</p>
    <div class="leg">
      <strong>Outbound: ${flight.outbound.fromCode} → ${flight.outbound.toCode} (${flight.outbound.flightNumber})</strong><br/>
      ${flight.outbound.fromCity} ${flight.outbound.departTime} — ${flight.outbound.duration} — ${flight.outbound.toCity} ${flight.outbound.arriveTime}<br/>
      ${flight.outbound.dateLabel} 2026
    </div>
    <div class="leg">
      <strong>Return: ${flight.returnLeg.fromCode} → ${flight.returnLeg.toCode} (${flight.returnLeg.flightNumber})</strong><br/>
      ${flight.returnLeg.fromCity} ${flight.returnLeg.departTime} — ${flight.returnLeg.duration} — ${flight.returnLeg.toCity} ${flight.returnLeg.arriveTime}<br/>
      ${flight.returnLeg.dateLabel} 2026
    </div>
    <div class="price-box">
      <div>Total Price (${flight.airlineName} · ${flight.cabinClass})</div>
      <div class="price">${formatCurrency(flight.pricePerPassenger)}</div>
      <div>per passenger · Baggage ${flight.baggage} · ${flight.fareCondition}</div>
    </div>
    <div class="note">Prices and availability are valid at the time of quotation and may change.</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StarAviaTravel-Itinerary-${flight.outbound.fromCode}-${flight.outbound.toCode}-${flight.outbound.flightNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="itinerary-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F2418]/45 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl border border-[#D4E6DB] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="no-print px-6 py-4 border-b border-[#E5F1E9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </span>
            <h2 id="itinerary-modal-title" className="text-lg font-bold text-[#14261C]">
              Itinerary Preview (For Client)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Itinerary Preview dialog"
            className="w-9 h-9 rounded-xl text-[#567261] hover:bg-[#F1FAF4] hover:text-[#14261C] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Itinerary Body (Image 4) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Branded Aviation Sky & Wing Header Banner */}
          <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-[#D7E9DE] bg-[#E8F5EE]">
            <img
              src={AVIATION_BANNER_IMAGE}
              alt="Staraviatravel itinerary aircraft wing sky banner"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#F4FBF7]/95 via-[#EDF8F2]/55 to-[#1B5C47]/85"
              aria-hidden="true"
            />
            <div className="relative h-full px-6 sm:px-8 flex items-center justify-between gap-4">
              <StaraviaLogo size="lg" />

              <div className="text-right text-white">
                <p className="text-sm sm:text-base font-medium text-white/90">
                  Your Trip Itinerary
                </p>
                <p className="mt-0.5 text-xl sm:text-2xl font-bold tracking-tight flex items-center justify-end gap-2 tabular-nums">
                  <span>{flight.outbound.fromCode}</span>
                  <ArrowRight className="w-5 h-5 text-[#A4F0C4]" />
                  <span>{flight.outbound.toCode}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Client Greeting */}
          <div className="text-sm text-[#243E2F] leading-relaxed">
            <p>
              Dear <strong className="font-bold text-[#14261C]">{clientName}</strong>,
            </p>
            <p className="mt-1">
              Please find below your flight option details from {flight.outbound.fromCity} (
              {flight.outbound.fromCode}) to {flight.outbound.toCity} ({flight.outbound.toCode}).
              This is a personalized itinerary prepared by StarAviaTravel.
            </p>
          </div>

          {/* 2-Column Flight Segments + Price & Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Left Flight Segment Details */}
            <div className="md:col-span-8 rounded-2xl border border-[#DCECE2] bg-white p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#ECF5EF]">
                <div className="flex items-center gap-3">
                  <AirlineBadge code={flight.airlineCode} />
                  <h3 className="text-lg font-bold text-[#14261C]">{flight.airlineName}</h3>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#E1F5E8] text-[#1A6B3E] text-xs font-semibold whitespace-nowrap">
                  {flight.cabinClass}
                </span>
              </div>

              {/* Outbound Sector */}
              <div className="py-5 flex gap-4">
                <div className="flex flex-col items-center pt-1 shrink-0" aria-hidden="true">
                  <Plane className="w-5 h-5 text-[#23804E]" />
                  <div className="w-px flex-1 border-l-2 border-dashed border-[#B7DEC7] my-1.5" />
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#23804E] bg-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 text-sm">
                    <span className="font-bold text-[#14261C] tabular-nums">
                      {flight.outbound.fromCode} → {flight.outbound.toCode}
                    </span>
                    <span className="font-mono text-xs text-[#5E7868]">
                      {flight.outbound.flightNumber}
                    </span>
                    <span className="text-xs text-[#5E7868]">
                      · {flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stop`}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-11 items-center gap-2">
                    <div className="sm:col-span-4">
                      <p className="text-xs text-[#4C6858]">
                        {flight.outbound.fromCity} ({flight.outbound.fromCode})
                      </p>
                      <p className="text-2xl font-bold text-[#14261C] leading-tight tabular-nums">
                        {flight.outbound.departTime}
                      </p>
                      <p className="text-xs text-[#5E7868] mt-0.5">{flight.outbound.dateLabel} 2026</p>
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-start sm:justify-center gap-1.5">
                      <span className="hidden sm:block h-px w-4 bg-[#B8DCC6]" aria-hidden="true" />
                      <span className="px-2.5 py-1 rounded-full bg-[#EDF8F1] border border-[#D4ECDD] text-xs font-semibold text-[#1D6B40] tabular-nums whitespace-nowrap">
                        {flight.outbound.duration}
                      </span>
                      <span className="hidden sm:block h-px w-4 bg-[#B8DCC6]" aria-hidden="true" />
                    </div>

                    <div className="sm:col-span-4">
                      <p className="text-xs text-[#4C6858]">
                        {flight.outbound.toCity} ({flight.outbound.toCode})
                      </p>
                      <p className="text-2xl font-bold text-[#14261C] leading-tight tabular-nums">
                        {flight.outbound.arriveTime}
                        {flight.outbound.nextDay && (
                          <span className="ml-1 text-xs font-bold text-[#C8433B]">+1</span>
                        )}
                      </p>
                      <p className="text-xs text-[#5E7868] mt-0.5">{flight.outbound.dateLabel} 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#ECF5EF]" />

              {/* Return Sector */}
              <div className="pt-5 flex gap-4">
                <div className="flex flex-col items-center pt-1 shrink-0" aria-hidden="true">
                  <Plane className="w-5 h-5 text-[#23804E] rotate-180" />
                  <div className="w-px flex-1 border-l-2 border-dashed border-[#B7DEC7] my-1.5" />
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#23804E] bg-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 text-sm">
                    <span className="font-bold text-[#14261C] tabular-nums">
                      {flight.returnLeg.fromCode} → {flight.returnLeg.toCode}
                    </span>
                    <span className="font-mono text-xs text-[#5E7868]">
                      {flight.returnLeg.flightNumber}
                    </span>
                    <span className="text-xs text-[#5E7868]">
                      · {flight.returnLeg.stops === 0 ? 'Direct' : `${flight.returnLeg.stops} stop`}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-11 items-center gap-2">
                    <div className="sm:col-span-4">
                      <p className="text-xs text-[#4C6858]">
                        {flight.returnLeg.fromCity} ({flight.returnLeg.fromCode})
                      </p>
                      <p className="text-2xl font-bold text-[#14261C] leading-tight tabular-nums">
                        {flight.returnLeg.departTime}
                      </p>
                      <p className="text-xs text-[#5E7868] mt-0.5">{flight.returnLeg.dateLabel} 2026</p>
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-start sm:justify-center gap-1.5">
                      <span className="hidden sm:block h-px w-4 bg-[#B8DCC6]" aria-hidden="true" />
                      <span className="px-2.5 py-1 rounded-full bg-[#EDF8F1] border border-[#D4ECDD] text-xs font-semibold text-[#1D6B40] tabular-nums whitespace-nowrap">
                        {flight.returnLeg.duration}
                      </span>
                      <span className="hidden sm:block h-px w-4 bg-[#B8DCC6]" aria-hidden="true" />
                    </div>

                    <div className="sm:col-span-4">
                      <p className="text-xs text-[#4C6858]">
                        {flight.returnLeg.toCity} ({flight.returnLeg.toCode})
                      </p>
                      <p className="text-2xl font-bold text-[#14261C] leading-tight tabular-nums">
                        {flight.returnLeg.arriveTime}
                        {flight.returnLeg.nextDay && (
                          <span className="ml-1 text-xs font-bold text-[#C8433B]">+1</span>
                        )}
                      </p>
                      <p className="text-xs text-[#5E7868] mt-0.5">{flight.returnLeg.dateLabel} 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Total Price & Conditions Card */}
            <div className="md:col-span-4 rounded-2xl border border-[#DCECE2] bg-white overflow-hidden flex flex-col">
              <div className="bg-[#E6F6EC] px-5 py-6 text-center border-b border-[#D2EAD9]">
                <p className="text-sm font-semibold text-[#244734]">Total Price</p>
                <p className="mt-1 text-4xl font-bold text-[#145531] tracking-tight tabular-nums">
                  {formatCurrency(flight.pricePerPassenger)}
                </p>
                <p className="mt-1 text-xs font-medium text-[#3D654E]">per passenger</p>
                {pax > 1 && (
                  <p className="mt-2 pt-2 border-t border-[#CBE6D6] text-xs font-semibold text-[#175B36] tabular-nums">
                    {formatCurrency(totalForGroup)} total ({pax} passengers)
                  </p>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-center divide-y divide-[#EEF5F0] text-sm">
                <div className="pb-3.5 flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-[#23804E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#5B7566]">Baggage Allowance</p>
                    <p className="font-semibold text-[#14261C] tabular-nums">{flight.baggage}</p>
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3">
                  <Armchair className="w-5 h-5 text-[#23804E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#5B7566]">Cabin Class</p>
                    <p className="font-semibold text-[#14261C]">{flight.cabinClass}</p>
                  </div>
                </div>

                <div className="pt-3.5 flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-[#23804E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#5B7566]">Fare Type</p>
                    <p className="font-semibold text-[#14261C]">{flight.fareCondition}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Validity Notice */}
          <div className="px-4 py-3 rounded-xl bg-[#EAF7EF] border border-[#D3ECDD] flex items-center gap-2.5 text-xs sm:text-sm text-[#1E5938]">
            <Info className="w-4 h-4 text-[#23804E] shrink-0" />
            <span>Prices and availability are valid at the time of quotation and may change.</span>
          </div>
        </div>

        {/* Modal Footer Actions (Strictly NO Telegram / WhatsApp Pop-ups!) */}
        <div className="no-print px-6 py-4 border-t border-[#E5F1E9] bg-[#FAFDFA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#D4E6DB] bg-white hover:bg-[#F2FAF5] text-sm font-semibold text-[#1E3B2B] transition-colors"
            >
              <Printer className="w-4 h-4 text-[#23804E]" />
              <span>Print Preview</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadItinerary}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#D4E6DB] bg-white hover:bg-[#F2FAF5] text-sm font-semibold text-[#1E3B2B] transition-colors"
            >
              {downloaded ? (
                <Check className="w-4 h-4 text-[#23804E]" />
              ) : (
                <Download className="w-4 h-4 text-[#23804E]" />
              )}
              <span>{downloaded ? 'Saved Itinerary' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#D4E6DB] bg-white hover:bg-[#F2FAF5] text-sm font-semibold text-[#1E3B2B] transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#23804E]" />
              ) : (
                <Copy className="w-4 h-4 text-[#23804E]" />
              )}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSendViaEmail(lead, flight)}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Send via Email</span>
          </button>
        </div>
      </div>
    </div>
  );
};
