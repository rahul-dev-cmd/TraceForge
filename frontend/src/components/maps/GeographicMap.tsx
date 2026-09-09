import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  ShieldAlert, 
  ExternalLink, 
  Layers, 
  Info,
  Building2,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { mockGeoThreatPoints } from '../../data/mockExchanges';

export const GeographicMap: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState(mockGeoThreatPoints[0]);

  return (
    <div className="space-y-4 uppercase font-mono">
      {/* Disclaimer Banner */}
      <div className="p-3 rounded-none bg-background border border-terminal-secondary flex items-start gap-2.5 text-xs text-terminal-secondary">
        <Info className="w-4 h-4 text-terminal-secondary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold tracking-wider">GEOGRAPHIC INDICATOR DISCLAIMER: </span>
          LOCATIONS REPRESENT HEURISTIC NETWORK ROUTING INDICATORS, VPN EXIT PROXIES, AND REGISTERED VASP JURISDICTIONS. THEY CONSTITUTE ANALYTICAL LEAD INDICATORS RATHER THAN CONCLUSIVE PHYSICAL EVIDENCE OF CRIMINAL PRESENCE.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Synthetic Interactive World Threat Map Canvas */}
        <div className="lg:col-span-2 relative rounded-none bg-background border border-terminal-muted min-h-[420px] p-6 overflow-hidden flex flex-col justify-between">
          
          {/* Top Canvas Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-terminal-primary" />
              <span className="font-bold text-terminal-primary tracking-wider">
                THREAT GEOLOCATION VECTOR RADAR
              </span>
            </div>
            <span className="text-[10px] text-terminal-primary bg-background px-2 py-0.5 rounded-none border border-terminal-primary font-bold">
              5 INTERCEPT NODES ACTIVE
            </span>
          </div>

          {/* Stylized World Vector Canvas with Interactive Pins */}
          <div className="relative z-10 my-8 flex items-center justify-center min-h-[260px]">
            {/* World Map SVG Silhouette */}
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-auto max-h-[300px] text-terminal-muted fill-current opacity-30 select-none"
            >
              <path d="M150,150 Q180,100 240,120 T300,180 T260,250 T180,240 Z" />
              <path d="M220,280 Q250,300 270,380 T240,460 T200,380 Z" />
              <path d="M480,100 Q550,80 600,120 T580,200 T490,170 Z" />
              <path d="M490,220 Q560,240 580,320 T520,400 T460,300 Z" />
              <path d="M620,100 Q780,80 850,140 T800,260 T640,200 Z" />
              <path d="M720,320 Q800,310 820,380 T760,420 T700,360 Z" />
            </svg>

            {/* Placed Interactive Hotspots */}
            {mockGeoThreatPoints.map((point) => {
              const isSelected = selectedPoint.id === point.id;
              // Normalize lat/lng to percentage coordinates
              const leftPercent = ((point.longitude + 180) / 360) * 100;
              const topPercent = ((90 - point.latitude) / 180) * 100;

              return (
                <div
                  key={point.id}
                  onClick={() => setSelectedPoint(point)}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="relative">
                    <span className={`block w-3.5 h-3.5 rounded-none ${
                      point.risk === 'CRITICAL' ? 'bg-terminal-error' :
                      point.risk === 'HIGH' ? 'bg-terminal-secondary' :
                      'bg-terminal-primary'
                    } ${isSelected ? 'scale-150 border-2 border-background' : 'hover:scale-125'} transition-none`} />

                    {/* Tooltip Tag */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-none bg-background border border-terminal-primary text-[10px] text-terminal-primary z-30 pointer-events-none font-bold">
                      <div className="truncate">{point.title}</div>
                      <div>{point.location}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Coordinates Status */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-terminal-muted pt-2 border-t border-terminal-muted font-bold">
            <div>
              ACTIVE CROSS-HAIR: <span className="text-terminal-primary">{selectedPoint.location}</span> ({selectedPoint.latitude}°, {selectedPoint.longitude}°)
            </div>
            <div>CASE REF: {selectedPoint.caseId}</div>
          </div>
        </div>

        {/* Selected Geographic Node Intel Card */}
        <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4 text-xs font-bold">
          <div className="flex items-center justify-between pb-2 border-b border-terminal-muted">
            <span className="text-terminal-primary uppercase">TARGET TELEMETRY</span>
            <span className={`px-2 py-0.5 rounded-none text-[10px] bg-background border ${
              selectedPoint.risk === 'CRITICAL' ? 'text-terminal-error border-terminal-error' :
              selectedPoint.risk === 'HIGH' ? 'text-terminal-secondary border-terminal-secondary' :
              'text-terminal-primary border-terminal-primary'
            }`}>
              {selectedPoint.risk} RISK
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-terminal-primary">{selectedPoint.title}</div>
            <div className="text-terminal-primary text-xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {selectedPoint.location}
            </div>
          </div>

          <div className="p-3 rounded-none bg-background border border-terminal-muted space-y-2">
            <div>
              <span className="text-[10px] text-terminal-muted block">NODE CLASSIFICATION</span>
              <span className="text-terminal-primary">{selectedPoint.type}</span>
            </div>
            <div>
              <span className="text-[10px] text-terminal-muted block">CORRELATED VOLUME</span>
              <span className="text-terminal-primary">{selectedPoint.amount}</span>
            </div>
          </div>

          <div className="p-3 rounded-none bg-background border border-terminal-muted space-y-1">
            <span className="text-[10px] text-terminal-primary uppercase">INVESTIGATIVE NOTES</span>
            <p className="text-terminal-muted text-[11px] leading-relaxed">{selectedPoint.details}</p>
          </div>

          <div className="space-y-2 pt-2">
            <button className="w-full py-2 rounded-none bg-background hover:bg-terminal-primary border border-terminal-primary text-terminal-primary hover:text-background text-xs transition-none shadow-none uppercase">
              FILTER TRANSACTION GRAPH BY NODE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
