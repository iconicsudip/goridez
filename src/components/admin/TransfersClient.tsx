'use client';

import { useState } from 'react';
import { Plane, MapPin, Plus, Trash2, Pencil } from 'lucide-react';
import { deleteRoundTripRoute, deleteAirportTransfer } from '@/app/admin/actions';
import RoundTripDrawer from './RoundTripDrawer';
import AirportTransferDrawer from './AirportTransferDrawer';

export default function TransfersClient({ roundTrips, airportTransfers, cities }: any) {
  const [activeTab, setActiveTab] = useState<'ROUND_TRIP' | 'AIRPORT'>('ROUND_TRIP');
  const [isRoundTripDrawerOpen, setIsRoundTripDrawerOpen] = useState(false);
  const [isAirportDrawerOpen, setIsAirportDrawerOpen] = useState(false);
  const [editingRoundTrip, setEditingRoundTrip] = useState<any>(null);
  const [editingAirport, setEditingAirport] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cityMap = Object.fromEntries(cities.map((c: any) => [c.id, c.name]));

  const handleDeleteRoundTrip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    setDeletingId(id);
    await deleteRoundTripRoute(id);
    setDeletingId(null);
  };

  const handleDeleteAirport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transfer?')) return;
    setDeletingId(id);
    await deleteAirportTransfer(id);
    setDeletingId(null);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight">TAXI & TRANSFERS</h1>
          <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase mt-1">
            Manage One-Way, Round-Trip, and Airport Transfer routes and pricing
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'ROUND_TRIP' ? (
            <button
              onClick={() => { setEditingRoundTrip(null); setIsRoundTripDrawerOpen(true); }}
              className="bg-brand-neon hover:bg-brand-hover text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)]"
            >
              <Plus size={14} /> Add Route
            </button>
          ) : (
            <button
              onClick={() => { setEditingAirport(null); setIsAirportDrawerOpen(true); }}
              className="bg-brand-neon hover:bg-brand-hover text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)]"
            >
              <Plus size={14} /> Add Transfer
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('ROUND_TRIP')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'ROUND_TRIP'
              ? 'bg-brand-neon text-black shadow-[0_0_20px_rgba(196,240,0,0.2)]'
              : 'bg-[#111111] text-white/50 hover:bg-white/5'
          }`}
        >
          <MapPin size={16} /> Intercity Routes
        </button>
        <button
          onClick={() => setActiveTab('AIRPORT')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'AIRPORT'
              ? 'bg-brand-neon text-black shadow-[0_0_20px_rgba(196,240,0,0.2)]'
              : 'bg-[#111111] text-white/50 hover:bg-white/5'
          }`}
        >
          <Plane size={16} /> Airport Transfers
        </button>
      </div>

      {/* Round Trips Grid */}
      {activeTab === 'ROUND_TRIP' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {roundTrips.map((route: any) => (
            <div key={route.id} className={`bg-[#111111] border border-white/5 rounded-2xl p-6 group transition-all hover:border-white/10 ${deletingId === route.id ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] text-brand-neon font-mono uppercase tracking-widest mb-1">{cityMap[route.cityId] || 'Unknown City'}</div>
                  <h3 className="text-sm font-black uppercase">{route.routeTitle}</h3>
                  <div className="text-[10px] text-white/40 font-mono mt-1">{route.distanceKm} KM Approx. • ₹{route.nightAllowance} Night Allowance</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingRoundTrip(route); setIsRoundTripDrawerOpen(true); }} className="p-2 rounded-xl bg-white/5 hover:bg-brand-neon/10 hover:text-brand-neon text-white/40 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteRoundTrip(route.id)} className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[9px] font-mono uppercase tracking-widest text-center mt-4">
                <div className="bg-black/50 border border-white/5 rounded-lg p-2">
                  <div className="text-white/30 mb-1">Sedan</div>
                  <div className="text-white">₹{route.sedan1D} / ₹{route.sedan2D}</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-lg p-2">
                  <div className="text-white/30 mb-1">SUV</div>
                  <div className="text-white">₹{route.suv1D} / ₹{route.suv2D}</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-lg p-2">
                  <div className="text-white/30 mb-1">Crysta</div>
                  <div className="text-white">₹{route.crysta1D} / ₹{route.crysta2D}</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-lg p-2">
                  <div className="text-white/30 mb-1">Luxury</div>
                  <div className="text-white">₹{route.luxury1D} / ₹{route.luxury2D}</div>
                </div>
              </div>
            </div>
          ))}
          {roundTrips.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
              <MapPin size={24} className="mx-auto text-white/20 mb-3" />
              <p className="text-[11px] text-white/40 font-mono uppercase">No round trip routes configured.</p>
            </div>
          )}
        </div>
      )}

      {/* Airport Transfers Grid */}
      {activeTab === 'AIRPORT' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {airportTransfers.map((transfer: any) => (
            <div key={transfer.id} className={`bg-[#111111] border border-white/5 rounded-2xl p-6 group transition-all hover:border-white/10 ${deletingId === transfer.id ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-brand-neon font-mono uppercase tracking-widest">{cityMap[transfer.cityId] || 'Unknown City'}</span>
                    <span className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded uppercase">{transfer.airport}</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase">{transfer.zone}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase">{transfer.areaLocality}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingAirport(transfer); setIsAirportDrawerOpen(true); }} className="p-2 rounded-xl bg-white/5 hover:bg-brand-neon/10 hover:text-brand-neon text-white/40 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteAirport(transfer.id)} className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[9px] font-mono uppercase tracking-widest text-center mt-4">
                <div className="bg-black/50 border border-white/5 rounded-lg p-2 flex flex-col gap-1">
                  <div className="text-white/30">Sedan</div>
                  <div className="text-green-400">PU: ₹{transfer.sedanPickup}</div>
                  <div className="text-orange-400">DR: ₹{transfer.sedanDrop}</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-lg p-2 flex flex-col gap-1">
                  <div className="text-white/30">SUV</div>
                  <div className="text-green-400">PU: ₹{transfer.suvPickup}</div>
                  <div className="text-orange-400">DR: ₹{transfer.suvDrop}</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-lg p-2 flex flex-col gap-1">
                  <div className="text-white/30">Crysta</div>
                  <div className="text-green-400">PU: ₹{transfer.crystaPickup}</div>
                  <div className="text-orange-400">DR: ₹{transfer.crystaDrop}</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-lg p-2 flex flex-col gap-1">
                  <div className="text-white/30">Luxury</div>
                  <div className="text-green-400">PU: ₹{transfer.luxuryPickup}</div>
                  <div className="text-orange-400">DR: ₹{transfer.luxuryDrop}</div>
                </div>
              </div>
            </div>
          ))}
          {airportTransfers.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
              <Plane size={24} className="mx-auto text-white/20 mb-3" />
              <p className="text-[11px] text-white/40 font-mono uppercase">No airport transfers configured.</p>
            </div>
          )}
        </div>
      )}

      {isRoundTripDrawerOpen && (
        <RoundTripDrawer
          isOpen={isRoundTripDrawerOpen}
          onClose={() => setIsRoundTripDrawerOpen(false)}
          cities={cities}
          route={editingRoundTrip}
        />
      )}

      {isAirportDrawerOpen && (
        <AirportTransferDrawer
          isOpen={isAirportDrawerOpen}
          onClose={() => setIsAirportDrawerOpen(false)}
          cities={cities}
          transfer={editingAirport}
        />
      )}
    </>
  );
}
