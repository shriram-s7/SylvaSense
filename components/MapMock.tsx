"use client";

import { useState, useId } from "react";
import { TreeCrown, Hotspot, sampleTreeCrowns, initialAnalysisSession } from "@/data/analysis";

export type MapLayer =
  | "optical"
  | "falseColor"
  | "ndvi"
  | "ndmi"
  | "nbr"
  | "sar"
  | "sarVh"
  | "canopy"
  | "biomass"
  | "carbon"
  | "change"
  | "confidence";

interface MapMockProps {
  layer: MapLayer;
  opacity?: number;
  selectedTreeId?: string | null;
  onSelectTree?: (tree: TreeCrown) => void;
  activeHotspotId?: string | null;
  onSelectHotspot?: (hotspot: Hotspot) => void;
  filterConfidence?: "all" | "high" | "low";
  focusedHotspot?: Hotspot | null;
}

export const layerMeta: Record<MapLayer, {
  name: string;
  category: "SPECTRAL" | "RADAR" | "CANOPY" | "BIOMASS" | "TEMPORAL";
  sensor: string;
  resolution: string;
  unit: string;
  range: string;
  description: string;
  legend: Array<{ label: string; color: string; value: string }>;
}> = {
  optical: {
    name: "True Color (RGB)",
    category: "SPECTRAL",
    sensor: "Sentinel-2 MSI",
    resolution: "10 m",
    unit: "Surface Reflectance",
    range: "B04, B03, B02",
    description: "Atmospherically corrected natural color composite showing canopy cover and topography.",
    legend: [
      { label: "Dense Canopy", color: "#195637", value: "High density" },
      { label: "Buffer / Scrub", color: "#3e7044", value: "Mixed crown" },
      { label: "Clearings / Edge", color: "#748858", value: "Sparse" },
      { label: "Water / River", color: "#38bdf8", value: "Bhavani river" }
    ]
  },
  falseColor: {
    name: "NIR False Color",
    category: "SPECTRAL",
    sensor: "Sentinel-2 MSI",
    resolution: "10 m",
    unit: "Reflectance",
    range: "B08, B04, B03",
    description: "Standard infrared vegetation composite. Healthy photosynthetic canopies reflect strongly in red.",
    legend: [
      { label: "Vigorous Canopy", color: "#e11d48", value: "High NIR" },
      { label: "Secondary Forest", color: "#be185d", value: "Moderate NIR" },
      { label: "Disturbed / Bare", color: "#475569", value: "Low NIR" }
    ]
  },
  ndvi: {
    name: "NDVI Vegetation Index",
    category: "SPECTRAL",
    sensor: "Sentinel-2 MSI (B08 - B04)/(B08 + B04)",
    resolution: "10 m",
    unit: "Index",
    range: "-0.15 → +0.92",
    description: "Normalized Difference Vegetation Index showing photosynthetic chlorophyll activity across 384.6 ha.",
    legend: [
      { label: "Intact Rainforest", color: "#10b981", value: "> 0.75" },
      { label: "Moderate Canopy", color: "#f59e0b", value: "0.45 – 0.75" },
      { label: "Degraded / Stressed", color: "#ef4444", value: "< 0.45" }
    ]
  },
  ndmi: {
    name: "NDMI Moisture Index",
    category: "SPECTRAL",
    sensor: "Sentinel-2 MSI (B08 - B11)/(B08 + B11)",
    resolution: "10 m",
    unit: "Moisture Index",
    range: "-0.20 → +0.65",
    description: "Normalized Difference Moisture Index tracking canopy water content and drought stress.",
    legend: [
      { label: "High Moisture", color: "#06b6d4", value: "> 0.40" },
      { label: "Average Canopy", color: "#14b8a6", value: "0.15 – 0.40" },
      { label: "Moisture Deficit", color: "#d97706", value: "< 0.15" }
    ]
  },
  nbr: {
    name: "NBR Burn / Disturbance",
    category: "SPECTRAL",
    sensor: "Sentinel-2 MSI (B08 - B12)/(B08 + B12)",
    resolution: "20 m",
    unit: "Ratio",
    range: "-0.30 → +0.85",
    description: "Normalized Burn Ratio for canopy severity assessment and clearcut boundary delineation.",
    legend: [
      { label: "Unburned / Stable", color: "#059669", value: "> 0.50" },
      { label: "Low Severity", color: "#f59e0b", value: "0.10 – 0.50" },
      { label: "Disturbance Signal", color: "#dc2626", value: "< 0.10" }
    ]
  },
  sar: {
    name: "Sentinel-1 SAR VV",
    category: "RADAR",
    sensor: "Sentinel-1 C-SAR IW",
    resolution: "10 m",
    unit: "Backscatter (dB)",
    range: "-22.4 → -6.2 dB",
    description: "C-band VV radar backscatter. Cloud-penetrating microwaves sensitive to surface roughness and trunk structure.",
    legend: [
      { label: "High Roughness", color: "#38bdf8", value: "> -10 dB" },
      { label: "Continuous Forest", color: "#0284c7", value: "-14 – -10 dB" },
      { label: "Smooth / Cleared", color: "#0c4a6e", value: "< -16 dB" }
    ]
  },
  sarVh: {
    name: "Sentinel-1 SAR VH",
    category: "RADAR",
    sensor: "Sentinel-1 C-SAR IW Cross-Pol",
    resolution: "10 m",
    unit: "Backscatter (dB)",
    range: "-28.1 → -11.5 dB",
    description: "Cross-polarization volumetric radar scattering. Directly correlates with multi-tiered tree crown volume.",
    legend: [
      { label: "Multi-layered Canopy", color: "#818cf8", value: "> -14 dB" },
      { label: "Single Tier", color: "#4f46e5", value: "-19 – -14 dB" },
      { label: "Depleted Biomass", color: "#1e1b4b", value: "< -21 dB" }
    ]
  },
  canopy: {
    name: "Canopy Mask & Crowns",
    category: "CANOPY",
    sensor: "Mask2Former + YOLOv8-OBB",
    resolution: "Sub-meter instance crowns",
    unit: "Detected Crowns",
    range: "12,482 crowns",
    description: "Segmented individual tree crowns with polygon boundaries, crown areas, and confidence classes.",
    legend: [
      { label: "High Conf (76.4%)", color: "#34d399", value: "≥ 90%" },
      { label: "Medium Conf (18.1%)", color: "#fbbf24", value: "80 – 89%" },
      { label: "Low Conf (5.5%)", color: "#fb7185", value: "< 80%" }
    ]
  },
  biomass: {
    name: "Biomass Density (AGB)",
    category: "BIOMASS",
    sensor: "SylvaSense-A1.4 Fused Model",
    resolution: "10 m pixel",
    unit: "Tonnes / Hectare (t/ha)",
    range: "14.2 → 72.8 t/ha",
    description: "Aboveground Biomass density map calibrated with GEDI LiDAR profiles and field forest plots. Average 47.9 t/ha.",
    legend: [
      { label: "High Biomass (>55 t/ha)", color: "#10b981", value: "Core reserve" },
      { label: "Moderate (40-55 t/ha)", color: "#f59e0b", value: "Transition" },
      { label: "Low (<40 t/ha)", color: "#ef4444", value: "Buffer fringe" }
    ]
  },
  carbon: {
    name: "Carbon Stock Density",
    category: "BIOMASS",
    sensor: "IPCC Biomass-to-Carbon (0.47 factor)",
    resolution: "10 m pixel",
    unit: "Tonnes Carbon / ha (tC/ha)",
    range: "6.7 → 34.2 tC/ha",
    description: "Spatial carbon stock allocation derived from 18,421 tonnes AGB. Total forest carbon = 8,658 tC.",
    legend: [
      { label: "High Stock (>26 tC/ha)", color: "#059669", value: "Old growth" },
      { label: "Medium Stock (18-26)", color: "#0284c7", value: "Secondary" },
      { label: "Low Stock (<18 tC/ha)", color: "#64748b", value: "Disturbed" }
    ]
  },
  change: {
    name: "Change Detection (2024 → 2026)",
    category: "TEMPORAL",
    sensor: "Bi-temporal Optical + SAR Difference",
    resolution: "10 m delta",
    unit: "Loss Classification",
    range: "29.6 ha affected",
    description: "Persistent structural loss signal corroborated across Sentinel-2 dNDVI and Sentinel-1 dBackscatter.",
    legend: [
      { label: "Confirmed Loss (Primary)", color: "#ef4444", value: "4.7 ha (93.2%)" },
      { label: "Vegetation Stress", color: "#f59e0b", value: "2.1 ha (88.4%)" },
      { label: "Minor Disturbance", color: "#38bdf8", value: "0.8 ha (81.7%)" },
      { label: "Stable Forest", color: "#1e3a2e", value: "355.0 ha" }
    ]
  },
  confidence: {
    name: "Model Confidence Grid",
    category: "BIOMASS",
    sensor: "SylvaSense Ensemble Posterior",
    resolution: "10 m",
    unit: "Confidence (%)",
    range: "81.4% → 99.2%",
    description: "Ensemble variance across tree segmentation and AGB regression models. Mean confidence 94.7%.",
    legend: [
      { label: "High Confidence", color: "#22c55e", value: "> 95%" },
      { label: "Good Confidence", color: "#38bdf8", value: "90 – 95%" },
      { label: "Review Threshold", color: "#f59e0b", value: "< 90%" }
    ]
  }
};

export default function MapMock({
  layer,
  opacity = 86,
  selectedTreeId,
  onSelectTree,
  activeHotspotId,
  onSelectHotspot,
  filterConfidence = "all",
  focusedHotspot
}: MapMockProps) {
  const currentMeta = layerMeta[layer] || layerMeta.optical;
  const hotspots = initialAnalysisSession.change.hotspots;
  const gradientId = useId();

  // Mouse hover coordinate simulator
  const [cursorCoord, setCursorCoord] = useState<{ lat: string; lon: string; val: string } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;
    // Silent Valley bounding box interpolation: Lat 11.115 to 11.050, Lon 76.200 to 76.280
    const lat = (11.115 - yRatio * (11.115 - 11.050)).toFixed(4);
    const lon = (76.200 + xRatio * (76.280 - 76.200)).toFixed(4);
    let val = "Forest Core";
    if (layer === "ndvi") val = (0.45 + (1 - yRatio * 0.4) * 0.42).toFixed(2);
    else if (layer === "sar") val = (-16.5 + (1 - yRatio * 0.3) * 8.2).toFixed(1) + " dB";
    else if (layer === "biomass") val = (25 + (1 - yRatio * 0.35) * 45).toFixed(1) + " t/ha";
    else if (layer === "carbon") val = (12 + (1 - yRatio * 0.35) * 21).toFixed(1) + " tC/ha";
    setCursorCoord({ lat, lon, val });
  };

  const filteredTrees = sampleTreeCrowns.filter(t => {
    if (filterConfidence === "high") return t.confidence >= 90;
    if (filterConfidence === "low") return t.confidence < 90;
    return true;
  });

  return (
    <div
      className={`map map-${layer}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursorCoord(null)}
      style={{ opacity: Math.max(0.3, opacity / 100) }}
    >
      {/* Background GIS Shaders */}
      <div className="map-grid" />
      
      {/* Topographic elevation contours */}
      <svg className="map-svg-overlay" viewBox="0 0 1000 650" preserveAspectRatio="none">
        <defs>
          <radialGradient id={`grad-optic-${gradientId}`} cx="55%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#1a4d36" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#0f3424" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#081e15" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id={`grad-ndvi-${gradientId}`} cx="55%" cy="38%" r="48%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.55" />
            <stop offset="85%" stopColor="#d97706" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
          </radialGradient>
          <radialGradient id={`grad-biomass-${gradientId}`} cx="58%" cy="35%" r="52%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#ef4444" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#081e18" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id={`grad-change-${gradientId}`} cx="32%" cy="68%" r="22%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#f87171" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id={`blur-${gradientId}`}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Topographic contours */}
        <g stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" fill="none">
          <ellipse cx="600" cy="260" rx="320" ry="180" />
          <ellipse cx="610" cy="250" rx="240" ry="130" />
          <ellipse cx="620" cy="240" rx="160" ry="85" />
          <ellipse cx="630" cy="235" rx="90" ry="48" />
        </g>

        {/* Bhavani River drainage system */}
        <path
          d="M 50,420 Q 280,360 480,340 T 780,260 T 960,190"
          stroke="#38bdf8"
          strokeWidth="3.5"
          fill="none"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <path
          d="M 480,340 Q 520,440 590,580"
          stroke="#38bdf8"
          strokeWidth="2"
          fill="none"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />

        {/* Silent Valley Reserve Polygon Boundary */}
        <polygon
          points="80,180 260,60 680,85 890,210 820,520 540,600 170,550 50,340"
          fill={
            layer === "ndvi"
              ? `url(#grad-ndvi-${gradientId})`
              : layer === "biomass"
              ? `url(#grad-biomass-${gradientId})`
              : layer === "optical"
              ? `url(#grad-optic-${gradientId})`
              : "rgba(16, 185, 129, 0.04)"
          }
          stroke="#34d399"
          strokeWidth="2"
          strokeDasharray="8 4"
          strokeOpacity="0.85"
        />

        {/* Core Zone Inner Ring */}
        <polygon
          points="240,160 620,150 780,250 730,460 480,510 220,440"
          fill="none"
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="1.2"
        />

        {/* Change Layer Degradation Zones */}
        {(layer === "change" || layer === "optical") && (
          <g>
            {/* Primary hotspot footprint (4.7 ha) */}
            <circle cx="320" cy="442" r="48" fill={`url(#grad-change-${gradientId})`} />
            <polygon
              points="290,420 350,415 365,465 310,480"
              fill="rgba(239, 68, 68, 0.45)"
              stroke="#ef4444"
              strokeWidth="2"
            />
            {/* Hotspot 2 (2.1 ha) */}
            <circle cx="740" cy="182" r="32" fill="rgba(245, 158, 11, 0.35)" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Hotspot 3 (0.8 ha) */}
            <circle cx="240" cy="286" r="20" fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" strokeWidth="1.5" />
          </g>
        )}
      </svg>

      {/* Analytical Canopy Tree Objects */}
      {(layer === "canopy" || layer === "optical" || layer === "ndvi") && (
        <div className="trees-container">
          {filteredTrees.map(t => {
            const isSelected = selectedTreeId === t.id;
            return (
              <button
                key={t.id}
                className={`tree-point ${isSelected ? "selected" : ""} conf-${t.confidence >= 90 ? "high" : t.confidence >= 80 ? "mid" : "low"}`}
                style={{
                  left: `${t.xPercent}%`,
                  top: `${t.yPercent}%`,
                  width: `${Math.max(6, Math.min(18, t.canopyArea / 2.8))}px`,
                  height: `${Math.max(6, Math.min(18, t.canopyArea / 2.8))}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTree?.(t);
                }}
                title={`${t.id} · ${t.canopyArea}m² · ${t.confidence}% conf · ${t.health}`}
              >
                {isSelected && <span className="selection-ping" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Hotspot Markers (Linked across Change Detection, Alerts, and Explorer) */}
      {(layer === "change" || layer === "optical" || layer === "biomass" || layer === "canopy") && (
        <div className="hotspots-overlay">
          {hotspots.map(h => {
            const isFocused = focusedHotspot?.id === h.id || activeHotspotId === h.id || activeHotspotId === h.alertId;
            return (
              <button
                key={h.id}
                className={`hotspot-marker ${isFocused ? "focused" : ""} sev-${h.severity.toLowerCase()}`}
                style={{ left: `${h.xPercent}%`, top: `${h.yPercent}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot?.(h);
                }}
              >
                <div className="hotspot-pulse" />
                <div className="hotspot-badge">
                  <span className="dot" />
                  <b>{h.alertId}</b>
                  <small>{h.areaHa} ha</small>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Target Tree Focus indicator if TREE-08421 */}
      {selectedTreeId === "TREE-08421" && (
        <div className="target-reticle" style={{ left: "52%", top: "43%" }}>
          <div className="reticle-box" />
          <span className="reticle-tag">TARGET: TREE-08421 (34.7 m²)</span>
        </div>
      )}

      {/* Labels & Coordinates */}
      <div className="map-label label-a">SILENT VALLEY CORE RESERVE · 384.6 ha</div>
      <div className="map-label label-b">BHAVANI VALLEY DRAINAGE</div>
      <div className="map-coord coord-nw">11.1150° N, 76.2000° E</div>
      <div className="map-coord coord-se">11.0500° N, 76.2800° E</div>

      {/* Cursor Coordinate HUD Readout */}
      {cursorCoord && (
        <div className="cursor-hud">
          <span>LAT: <b>{cursorCoord.lat}° N</b></span>
          <span>LON: <b>{cursorCoord.lon}° E</b></span>
          <span>{currentMeta.unit}: <b>{cursorCoord.val}</b></span>
        </div>
      )}

      {/* Sensor Stamp */}
      <div className="map-live">
        <span /> {currentMeta.sensor} · {currentMeta.resolution}
      </div>

      {/* Map Scale */}
      <div className="map-scale">
        <div className="scale-bar" />
        <span>1 km</span>
      </div>

      {/* Active Layer Dynamic Legend Box */}
      <div className="map-legend-card">
        <div className="legend-title">
          <span>{currentMeta.name.toUpperCase()}</span>
          <em>{currentMeta.range}</em>
        </div>
        <div className="legend-items">
          {currentMeta.legend.map((item, idx) => (
            <div key={idx} className="legend-row">
              <span className="legend-color-box" style={{ backgroundColor: item.color }} />
              <span className="legend-name">{item.label}</span>
              <span className="legend-val">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}