"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// React-Leaflet components are dynamically imported client-side only 
// because Leaflet relies on the `window` object which breaks Next.js SSR.
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface EventMapProps {
  events: any[];
}

export function EventMap({ events }: EventMapProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!L) {
    return (
      <div className="w-full h-[600px] bg-[#050505] flex items-center justify-center border border-gray-800 rounded-3xl animate-pulse">
        <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Initializing Map Engine...</p>
      </div>
    );
  }

  // Use a custom hot-pink dot marker
  const customMarker = L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        width: 20px; 
        height: 20px; 
        background-color: #FF007A; 
        border-radius: 50%; 
        border: 3px solid #050505;
        box-shadow: 0 0 15px #FF007A;
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10], // Center the point
  });

  // Calculate generic bounds or default center (India center roughly)
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  
  const mapEvents = events.filter((e) => e.venue_lat && e.venue_lng);

  return (
    <div className="w-full h-[600px] md:h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full z-0 bg-[#0A0D15]"
      >
        {/* Dark theme map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        {mapEvents.map((event) => {
          const lowestPrice = event.ticketing?.length
            ? Math.min(...event.ticketing.map((t: any) => t.price))
            : null;

          return (
            <Marker
              key={event.id}
              position={[event.venue_lat, event.venue_lng]}
              icon={customMarker}
            >
              <Popup
                className="custom-popup" // Add this to CSS if needed to strip out Leaflet default margins
                minWidth={280}
              >
                <div className="bg-[#0A0D15] p-0 -mx-5 -my-3 rounded-xl overflow-hidden text-white border border-gray-800 font-sans">
                  {event.media?.banner ? (
                    <img
                      src={event.media.banner}
                      alt={event.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-[#FF007A]/20 to-orange-500/20" />
                  )}
                  <div className="p-4">
                    <p className="text-[9px] uppercase font-black text-[#FF007A] tracking-widest mb-1">
                      {event.category}
                    </p>
                    <h3 className="text-sm font-black uppercase tracking-tight mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold mb-3 truncate">
                      {event.venue?.city}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                      <span className="text-xs font-bold text-gray-300">
                        {lowestPrice === 0 ? "FREE" : `₹${lowestPrice}`}
                      </span>
                      <a
                        href={`/events/${event.id}`}
                        target="_top"
                        className="text-[10px] uppercase font-black text-[#FF007A] hover:underline"
                      >
                        Details →
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Fallback if zero mapped events */}
      {mapEvents.length === 0 && events.length > 0 && (
         <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
            <div className="bg-black border border-gray-800 px-6 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-primary shadow-[0_0_30px_rgba(255,0,122,0.2)]">
               No geo-coordinates found for active filters
            </div>
         </div>
      )}
    </div>
  );
}
