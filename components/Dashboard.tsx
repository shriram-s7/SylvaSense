"use client";

import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, BrainCircuit, Check, CheckCircle2,
  ChevronRight, CircleDot, Clock, Download, Eye, FileText, Filter,
  Layers3, Leaf, Map as MapIcon, Play, RadioTower, RefreshCw,
  RotateCcw, ScanSearch, Satellite, ShieldCheck, Sliders, TreePine,
  Waves, X, Zap
} from "lucide-react";
import {
  AnalysisSession, Hotspot, TreeCrown, initialAnalysisSession,
  sampleTreeCrowns, generateCanopyGeoJson
} from "@/data/analysis";
import MapMock, { MapLayer, layerMeta } from "./MapMock";

type Page = "overview" | "explorer" | "fusion" | "canopy" | "biomass" | "change" | "alerts" | "validation";

const nav: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Mission Control", icon: Activity },
  { id: "explorer", label: "Forest Explorer", icon: MapIcon },
  { id: "fusion", label: "Data Fusion", icon: Layers3 },
  { id: "canopy", label: "Canopy Intelligence", icon: ScanSearch },
  { id: "biomass", label: "Biomass & Carbon", icon: Leaf },
  { id: "change", label: "Change Detection", icon: Waves },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "validation", label: "Validation", icon: ShieldCheck }
];

export default function Dashboard() {
  const [page, setPage] = useState<Page>("overview");
  const [session, setSession] = useState<AnalysisSession>(initialAnalysisSession);
  const [layer, setLayer] = useState<MapLayer>("optical");
  const [layerOpacity, setLayerOpacity] = useState<number>(86);
  const [selectedTree, setSelectedTree] = useState<TreeCrown | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<"all" | "high" | "low">("all");
  
  // Pipeline execution modal states
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  // Modals & detail panels
  const [historyDetailItem, setHistoryDetailItem] = useState<any | null>(null);
  const [incidentReportHotspot, setIncidentReportHotspot] = useState<Hotspot | null>(null);
  const [missionReplayActive, setMissionReplayActive] = useState(false);
  const [missionReplayStep, setMissionReplayStep] = useState(0);

  // Cloud impact simulation state for Data Fusion page
  const [cloudSimulated, setCloudSimulated] = useState(false);

  // Start analysis setup modal
  const handleOpenSetup = () => {
    setSetupModalOpen(true);
  };

  // Run the full 14-stage execution pipeline
  const executePipeline = () => {
    setSetupModalOpen(false);
    setPipelineRunning(true);
    setPipelineFinished(false);
    setPipelineStep(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setPipelineStep(current);
      if (current >= 13) {
        clearInterval(interval);
        setTimeout(() => {
          setPipelineRunning(false);
          setPipelineFinished(true);
        }, 350);
      }
    }, 240);
  };

  // Finish analysis run and load results into session
  const completeAnalysisRun = () => {
    setPipelineFinished(false);
    setSession({
      ...initialAnalysisSession,
      status: "completed",
      dates: {
        ...initialAnalysisSession.dates,
        analysisDate: "21 Sep 2026"
      }
    });
    setPage("overview");
  };

  // Hotspot review toggle
  const handleToggleReviewHotspot = (hotspotId: string) => {
    setSession(prev => ({
      ...prev,
      change: {
        ...prev.change,
        hotspots: prev.change.hotspots.map(h => {
          if (h.id === hotspotId || h.alertId === hotspotId) {
            const nextStatus = h.status === "OPEN" ? "REVIEWED" : h.status === "REVIEWED" ? "RESOLVED" : "OPEN";
            return { ...h, status: nextStatus };
          }
          return h;
        })
      }
    }));
  };

  // Hotspot locator navigation to Forest Explorer
  const handleLocateHotspotInExplorer = (hotspot: Hotspot) => {
    setActiveHotspot(hotspot);
    setLayer("change");
    setPage("explorer");
  };

  // Tree crown locator navigation to Canopy Intelligence
  const handleLocateTreeInCanopy = (t: TreeCrown) => {
    setSelectedTree(t);
    setLayer("canopy");
    setPage("canopy");
  };

  // Mission Replay steps walkthrough
  const replaySteps = [
    { page: "overview", layer: "optical", title: "Mission Control Overview", text: "Verified session SYLVA-2026-0921-001 loaded for Silent Valley (384.6 ha)." },
    { page: "fusion", layer: "optical", title: "Multi-Sensor EO Baseline", text: "Sentinel-2 optical (92% quality) and Sentinel-1 SAR (96% quality) ready for fusion." },
    { page: "fusion", layer: "sar", title: "Cloud Contamination Simulation", text: "Optical quality drops to 61% under simulated cloud, but SAR penetration maintains structural radar telemetry." },
    { page: "explorer", layer: "ndvi", title: "NDVI Vegetation Spectral Layer", text: "Tracking photosynthetic chlorophyll density across intact core and buffer zones." },
    { page: "explorer", layer: "sar", title: "SAR VV Surface Roughness Layer", text: "Cloud-independent microwave backscatter revealing terrain canopy structure." },
    { page: "canopy", layer: "canopy", title: "Canopy Instance Segmentation", text: "12,482 individual tree crowns segmented with 94.7% ensemble model confidence." },
    { page: "canopy", layer: "canopy", title: "Individual Tree Crown Inspection", text: "Inspecting crown TREE-08421: 34.7 m² crown area, 412 kg biomass, 96.4% confidence." },
    { page: "biomass", layer: "biomass", title: "Aboveground Biomass Estimation", text: "18,421 tonnes total AGB (47.9 t/ha) derived from multi-sensor feature formula (R² = 0.91)." },
    { page: "biomass", layer: "carbon", title: "Carbon Stock & CO₂e Conversion", text: "8,658 tC sequestered equivalent to 31,763 tCO₂e carbon offset potential." },
    { page: "change", layer: "change", title: "Temporal Change Detection (2024 → 2026)", text: "29.6 ha affected area with 7.8% canopy loss and 1,284 estimated tree loss across 3 hotspots." },
    { page: "alerts", layer: "change", title: "Primary Deforestation Alert A-2041", text: "4.7 ha high-risk canopy removal in Southern Buffer corroborated by SAR drop." },
    { page: "validation", layer: "confidence", title: "Model Governance & Audit Provenance", text: "R² 0.91, MAE 5.17 t/ha across 1,250 validation plots with reproducible GeoJSON export." }
  ];

  const handleStartMissionReplay = () => {
    setMissionReplayActive(true);
    setMissionReplayStep(0);
    applyReplayStep(0);
  };

  const applyReplayStep = (stepIdx: number) => {
    const step = replaySteps[stepIdx];
    if (!step) return;
    setPage(step.page as Page);
    setLayer(step.layer as MapLayer);
    if (step.page === "canopy") {
      setSelectedTree(sampleTreeCrowns[0]);
    } else if (step.page === "change" || step.page === "alerts") {
      setActiveHotspot(session.change.hotspots[0]);
    }
    if (stepIdx === 2) {
      setCloudSimulated(true);
    }
  };

  const handleNextReplayStep = () => {
    if (missionReplayStep < replaySteps.length - 1) {
      const next = missionReplayStep + 1;
      setMissionReplayStep(next);
      applyReplayStep(next);
    } else {
      setMissionReplayActive(false);
    }
  };

  const handlePrevReplayStep = () => {
    if (missionReplayStep > 0) {
      const prev = missionReplayStep - 1;
      setMissionReplayStep(prev);
      applyReplayStep(prev);
    }
  };

  const handleExitReplay = () => {
    setMissionReplayActive(false);
  };

  return (
    <main className="shell">
      {/* Left Navigation Sidebar */}
      <aside className="sidebar">
        <div className="brand" onClick={() => setPage("overview")} style={{ cursor: "pointer" }}>
          <div className="brand-mark"><TreePine size={21} /></div>
          <div>
            <div className="brand-name">SYLVASENSE</div>
            <div className="brand-sub">FOREST INTELLIGENCE</div>
          </div>
        </div>

        <div className="nav-section">PLATFORM MODULES</div>
        <nav>
          {nav.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {page === item.id && <ChevronRight size={14} className="nav-arrow" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-title"><span className="pulse" /> ANALYSIS COMPLETE</div>
            <div className="system-line">ID: {session.analysisId}</div>
            <div className="system-line">S2 · S1 · GEDI LIDAR READY</div>
            <div className="system-line">MODEL {session.validation.model}</div>
          </div>

          <button id="btn-run-new-analysis-sidebar" className="new-analysis" onClick={handleOpenSetup}>
            <RadioTower size={17} /> RUN NEW ANALYSIS
          </button>

          <button id="btn-mission-replay-sidebar" className="mission-replay-btn" onClick={handleStartMissionReplay}>
            <Play size={15} /> MISSION REPLAY
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="main">
        {/* Sticky Top Status Bar */}
        <header className="topbar">
          <div>
            <div className="eyebrow">
              {session.analysisId} · CURATED ANALYSIS DATASET · ROUND 1
            </div>
            <h1>{page === "overview" ? "Mission Control" : nav.find(n => n.id === page)?.label}</h1>
          </div>
          <div className="top-actions">
            <div className="location-pill">
              <CircleDot size={13} /> {session.target.region} ({session.target.areaHa} ha)
            </div>
            <div className="status-pill">
              <span className="pulse" /> ANALYSIS COMPLETE
            </div>
            <button
              id="top-alert-shortcut"
              className="icon-button"
              title="View Deforestation Alerts"
              onClick={() => setPage("alerts")}
            >
              <AlertTriangle size={17} />
              {session.change.hotspots.filter(h => h.status === "OPEN").length > 0 && (
                <span className="badge-count">
                  {session.change.hotspots.filter(h => h.status === "OPEN").length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Mission Replay HUD Toast */}
        {missionReplayActive && (
          <div className="replay-hud">
            <div className="replay-badge">
              <Zap size={14} /> MISSION REPLAY · STEP {missionReplayStep + 1} OF {replaySteps.length}
            </div>
            <div className="replay-body">
              <b>{replaySteps[missionReplayStep].title}</b>
              <p>{replaySteps[missionReplayStep].text}</p>
            </div>
            <div className="replay-controls">
              <button
                className="text-button"
                onClick={handlePrevReplayStep}
                disabled={missionReplayStep === 0}
              >
                Previous
              </button>
              <button className="primary-button-sm" onClick={handleNextReplayStep}>
                {missionReplayStep === replaySteps.length - 1 ? "Finish Replay" : "Next Step"} <ChevronRight size={14} />
              </button>
              <button className="icon-close-sm" onClick={handleExitReplay}>
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Page Renderers */}
        {page === "overview" && (
          <Overview
            session={session}
            setPage={setPage}
            setLayer={setLayer}
            onOpenSetup={handleOpenSetup}
            onStartReplay={handleStartMissionReplay}
            onSelectHistory={(item: any) => setHistoryDetailItem(item)}
            onLocateHotspot={handleLocateHotspotInExplorer}
          />
        )}
        {page === "explorer" && (
          <Explorer
            session={session}
            layer={layer}
            setLayer={setLayer}
            opacity={layerOpacity}
            setOpacity={setLayerOpacity}
            onTreeSelect={handleLocateTreeInCanopy}
            onHotspotSelect={handleLocateHotspotInExplorer}
            activeHotspot={activeHotspot}
          />
        )}
        {page === "fusion" && (
          <Fusion
            session={session}
            cloudSimulated={cloudSimulated}
            setCloudSimulated={setCloudSimulated}
            onNavigateCanopy={() => setPage("canopy")}
            onNavigateBiomass={() => setPage("biomass")}
          />
        )}
        {page === "canopy" && (
          <Canopy
            session={session}
            selectedTree={selectedTree}
            setSelectedTree={setSelectedTree}
            filter={confidenceFilter}
            setFilter={setConfidenceFilter}
          />
        )}
        {page === "biomass" && (
          <Biomass
            session={session}
            onNavigateValidation={() => setPage("validation")}
          />
        )}
        {page === "change" && (
          <Change
            session={session}
            onSelectHotspot={handleLocateHotspotInExplorer}
            onNavigateAlerts={() => setPage("alerts")}
          />
        )}
        {page === "alerts" && (
          <Alerts
            session={session}
            onToggleReview={handleToggleReviewHotspot}
            onLocateHotspot={handleLocateHotspotInExplorer}
            onCreateReport={(h: Hotspot) => setIncidentReportHotspot(h)}
          />
        )}
        {page === "validation" && (
          <Validation
            session={session}
          />
        )}

        {/* Persistent Bottom Footer */}
        <footer className="footer">
          <span>SYLVASENSE FOREST INTELLIGENCE • CURATED DEMONSTRATION DATASET • ROUND 1</span>
          <span>Target: {session.target.name} ({session.target.areaHa} ha) • Completed {session.dates.analysisDate}</span>
        </footer>
      </section>

      {/* Selected Tree Detail Drawer */}
      {selectedTree && (
        <TreePanel tree={selectedTree} onClose={() => setSelectedTree(null)} session={session} />
      )}

      {/* Analysis Setup Modal */}
      {setupModalOpen && (
        <SetupModal
          session={session}
          onClose={() => setSetupModalOpen(false)}
          onStartExecution={executePipeline}
        />
      )}

      {/* 14-Stage Execution Pipeline Stepper */}
      {pipelineRunning && (
        <ExecutionStepperModal currentStep={pipelineStep} onSkip={() => { setPipelineRunning(false); setPipelineFinished(true); }} />
      )}

      {/* Analysis Complete Summary Modal */}
      {pipelineFinished && (
        <AnalysisCompleteModal session={session} onViewResults={completeAnalysisRun} />
      )}

      {/* History Detail Modal */}
      {historyDetailItem && (
        <HistoryModal item={historyDetailItem} onClose={() => setHistoryDetailItem(null)} />
      )}

      {/* Incident Report Modal */}
      {incidentReportHotspot && (
        <IncidentReportModal
          hotspot={incidentReportHotspot}
          session={session}
          onClose={() => setIncidentReportHotspot(null)}
        />
      )}
    </main>
  );
}

// -------------------------------------------------------------
// 1. MISSION CONTROL (OVERVIEW)
// -------------------------------------------------------------
function Overview({
  session,
  setPage,
  setLayer,
  onOpenSetup,
  onStartReplay,
  onSelectHistory,
  onLocateHotspot
}: {
  session: AnalysisSession;
  setPage: (p: Page) => void;
  setLayer: (l: MapLayer) => void;
  onOpenSetup: () => void;
  onStartReplay: () => void;
  onSelectHistory: (item: any) => void;
  onLocateHotspot: (h: Hotspot) => void;
}) {
  const primaryHotspot = session.change.hotspots[0];

  return (
    <div className="content">
      {/* Hero Banner */}
      <div className="hero-row">
        <div>
          <div className="tag"><Satellite size={13} /> MULTI-SENSOR EARTH OBSERVATION FUSION</div>
          <h2>From satellite signals to <span>tree-level intelligence.</span></h2>
          <p className="hero-copy">
            Harmonizing Sentinel-2 optical multispectral telemetry with Sentinel-1 SAR radar backscatter and GEDI LiDAR structural baselines to enumerate individual crowns, calculate biomass, and detect micro-disturbances.
          </p>
        </div>
        <div className="hero-cta-group">
          <button id="btn-start-live-analysis-hero" className="primary-button" onClick={onOpenSetup}>
            <RadioTower size={17} /> Start live analysis <ChevronRight size={16} />
          </button>
          <button id="btn-replay-hero" className="secondary-button" onClick={onStartReplay}>
            <Play size={16} /> Mission Replay
          </button>
        </div>
      </div>

      {/* Coherent KPI Cards derived from central session */}
      <div className="kpi-grid">
        <Kpi
          icon={<TreePine />}
          label="TREES DETECTED"
          value={session.canopy.treesDetected.toLocaleString()}
          delta={`${session.canopy.confidence}% confidence`}
        />
        <Kpi
          icon={<MapIcon />}
          label="CANOPY AREA"
          value={`${session.target.areaHa} ha`}
          delta={`${session.canopy.coverage}% coverage`}
        />
        <Kpi
          icon={<BarChart3 />}
          label="ABOVEGROUND BIOMASS"
          value={`${session.biomass.totalAGB.toLocaleString()} t`}
          delta={`${session.biomass.density} t/ha`}
        />
        <Kpi
          icon={<Leaf />}
          label="CARBON STOCK"
          value={`${session.biomass.carbonStock.toLocaleString()} tC`}
          delta={`${session.biomass.co2e.toLocaleString()} tCO₂e`}
        />
      </div>

      {/* Main Grid: Interactive Map & Forest Health Breakdown */}
      <div className="grid-main">
        <div className="panel map-panel">
          <PanelHeader
            title="FOREST OBSERVATION"
            meta={`${session.dates.analysisDate} · ${session.target.name}`}
            action={
              <button
                className="text-button"
                onClick={() => {
                  setLayer("optical");
                  setPage("explorer");
                }}
              >
                Open explorer <ChevronRight size={14} />
              </button>
            }
          />
          <div className="map-wrap">
            <MapMock
              layer="optical"
              onSelectHotspot={onLocateHotspot}
            />
          </div>
        </div>

        <div className="panel health-panel">
          <PanelHeader title="FOREST HEALTH INDEX" meta="COMPOSITE MULTI-SENSOR" />
          <div className="health-score">
            <strong>87</strong><span>/ 100</span>
          </div>
          <div className="health-bar"><span style={{ width: "87%" }} /></div>
          <Metric label="Vegetation health (NDVI)" value="91%" />
          <Metric label="Canopy crown integrity" value="87%" />
          <Metric label="Biomass stability (AGB)" value="76%" />
          <Metric label="Change disturbance risk" value="LOW (23/100)" />

          <div
            className="mini-alert clickable"
            onClick={() => onLocateHotspot(primaryHotspot)}
            title="Click to inspect primary hotspot"
          >
            <AlertTriangle size={17} />
            <div>
              <b>{session.change.hotspotsCount} change zones detected</b>
              <span>Primary: {primaryHotspot.name} ({primaryHotspot.areaHa} ha) · Click to inspect</span>
            </div>
            <ChevronRight size={15} style={{ marginLeft: "auto" }} />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Temporal Trajectory & Analysis History */}
      <div className="bottom-grid">
        <div className="panel">
          <PanelHeader
            title="BIOMASS TRAJECTORY"
            meta="2022 — 2026 (TONNES AGB)"
            action={
              <button className="text-button" onClick={() => setPage("biomass")}>
                View accounting <ChevronRight size={14} />
              </button>
            }
          />
          <div className="trajectory-bars-container">
            {session.biomass.trajectory.map((item) => (
              <div key={item.year} className="trajectory-column">
                <div className="trajectory-val">{item.value.toLocaleString()} t</div>
                <div className="trajectory-bar-track">
                  <div
                    className="trajectory-bar-fill"
                    style={{ height: `${(item.value / 20000) * 100}%` }}
                  />
                </div>
                <div className="trajectory-year">{item.year}</div>
                <div className="trajectory-density">{item.density} t/ha</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel alerts-panel">
          <PanelHeader
            title="ANALYSIS HISTORY & EVENTS"
            meta="CHRONOLOGICAL LOG"
            action={
              <button className="text-button" onClick={() => setPage("change")}>
                View change <ChevronRight size={14} />
              </button>
            }
          />
          <div className="history-list">
            {session.history.map((h, i) => (
              <button
                key={i}
                className="history-row"
                onClick={() => onSelectHistory(h)}
                title="Click to view history details"
              >
                <div className="history-date">
                  <Clock size={12} />
                  <span>{h.date}</span>
                </div>
                <div className="history-info">
                  <b>{h.title}</b>
                  <span>{h.subtitle} · {h.area}</span>
                </div>
                <span className={`history-status-pill status-${h.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {h.status}
                </span>
                <ChevronRight size={14} className="history-chevron" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. FOREST EXPLORER
// -------------------------------------------------------------
function Explorer({
  session,
  layer,
  setLayer,
  opacity,
  setOpacity,
  onTreeSelect,
  onHotspotSelect,
  activeHotspot
}: {
  session: AnalysisSession;
  layer: MapLayer;
  setLayer: (l: MapLayer) => void;
  opacity: number;
  setOpacity: (o: number) => void;
  onTreeSelect: (t: TreeCrown) => void;
  onHotspotSelect: (h: Hotspot) => void;
  activeHotspot: Hotspot | null;
}) {
  const layerList: Array<{ id: MapLayer; label: string; cat: string; icon: React.ElementType }> = [
    { id: "optical", label: "True Color (RGB)", cat: "SPECTRAL", icon: Satellite },
    { id: "falseColor", label: "NIR False Color", cat: "SPECTRAL", icon: Eye },
    { id: "ndvi", label: "NDVI Index", cat: "SPECTRAL", icon: Leaf },
    { id: "ndmi", label: "NDMI Moisture", cat: "SPECTRAL", icon: Waves },
    { id: "nbr", label: "NBR Burn Ratio", cat: "SPECTRAL", icon: Zap },
    { id: "sar", label: "SAR VV Backscatter", cat: "RADAR", icon: RadioTower },
    { id: "sarVh", label: "SAR VH Cross-Pol", cat: "RADAR", icon: RadioTower },
    { id: "canopy", label: "Canopy Mask & Crowns", cat: "CANOPY", icon: ScanSearch },
    { id: "biomass", label: "Biomass Density", cat: "BIOMASS", icon: BarChart3 },
    { id: "carbon", label: "Carbon Stock Density", cat: "BIOMASS", icon: Leaf },
    { id: "change", label: "Change Heatmap (2024-26)", cat: "TEMPORAL", icon: AlertTriangle },
    { id: "confidence", label: "Model Confidence", cat: "MODEL", icon: ShieldCheck }
  ];

  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">GEOSPATIAL EARTH OBSERVATION VIEWER</div>
          <h2>Forest observation layers</h2>
        </div>
        <div className="layer-summary-pill">
          <span>AOI: {session.target.name}</span>
          <em>384.6 ha</em>
          <div className="date-pill">2024 <span>→</span> 2026</div>
        </div>
      </div>

      <div className="explorer-grid">
        <div className="panel map-panel big-map">
          <div className="map-toolbar">
            <div className="map-toolbar-left">
              <span className="live-layer-name">{layerMeta[layer]?.name}</span>
              <span className="live-sensor-tag">{layerMeta[layer]?.sensor}</span>
            </div>
            <div className="map-toolbar-right">
              <button
                className="outline-button-compact"
                onClick={() => onTreeSelect(sampleTreeCrowns[0])}
              >
                <ScanSearch size={14} /> Target TREE-08421
              </button>
            </div>
          </div>
          <div className="map-wrap">
            <MapMock
              layer={layer}
              opacity={opacity}
              activeHotspotId={activeHotspot?.id}
              onSelectHotspot={onHotspotSelect}
              onSelectTree={onTreeSelect}
            />
          </div>
        </div>

        <div className="panel layer-panel">
          <PanelHeader title="ANALYTICAL LAYERS" meta="12 PREPARED EO LAYERS" />
          <div className="layer-scroll-list">
            {layerList.map((item) => {
              const Icon = item.icon;
              const isSelected = layer === item.id;
              return (
                <button
                  key={item.id}
                  id={`layer-btn-${item.id}`}
                  className={`layer-row ${isSelected ? "selected" : ""}`}
                  onClick={() => setLayer(item.id)}
                >
                  <Icon size={16} />
                  <div className="layer-row-info">
                    <span className="layer-name">{item.label}</span>
                    <small className="layer-cat">{item.cat}</small>
                  </div>
                  {isSelected && <span className="layer-live">ACTIVE</span>}
                </button>
              );
            })}
          </div>

          <div className="layer-divider" />
          
          <div className="layer-controls-box">
            <div className="opacity-header">
              <span className="small-label">LAYER OPACITY</span>
              <b>{opacity}%</b>
            </div>
            <input
              id="slider-layer-opacity"
              className="range"
              type="range"
              min="20"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>

          <div className="explorer-actions">
            <button
              id="btn-inspect-canopy-explorer"
              className="outline-button full"
              onClick={() => onTreeSelect(sampleTreeCrowns[0])}
            >
              <ScanSearch size={15} /> Inspect Tree Crowns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. DATA FUSION
// -------------------------------------------------------------
function Fusion({
  session,
  cloudSimulated,
  setCloudSimulated,
  onNavigateCanopy,
  onNavigateBiomass
}: {
  session: AnalysisSession;
  cloudSimulated: boolean;
  setCloudSimulated: (b: boolean) => void;
  onNavigateCanopy: () => void;
  onNavigateBiomass: () => void;
}) {
  const opticalQuality = cloudSimulated ? 61 : session.sensors.sentinel2.quality;
  const sarQuality = session.sensors.sentinel1.quality;

  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">MULTI-SENSOR FUSION PIPELINE</div>
          <h2>Optical + SAR radar complementarity</h2>
        </div>
        <div className="fusion-status-group">
          <button
            id="btn-simulate-cloud"
            className={`simulate-cloud-btn ${cloudSimulated ? "active" : ""}`}
            onClick={() => setCloudSimulated(!cloudSimulated)}
          >
            <RefreshCw size={14} className={cloudSimulated ? "spin" : ""} />
            {cloudSimulated ? "RESET CLOUD SIMULATION" : "SIMULATE CLOUD IMPACT"}
          </button>
          <div className="status-chip">FUSION READY · 14 DIMENSIONS</div>
        </div>
      </div>

      {/* Sensor Cards & Fusion Node */}
      <div className="fusion-grid">
        {/* Sentinel-2 Optical Card */}
        <div className={`sensor-card ${cloudSimulated ? "degraded-card" : ""}`}>
          <div className="sensor-top">
            <div className="sensor-icon"><Satellite size={18} /></div>
            <span className="sensor-id">SENTINEL-2 MSI</span>
            <span className={`sensor-status ${cloudSimulated ? "warning" : ""}`}>
              <span /> {cloudSimulated ? "CLOUD IMPACT" : "AVAILABLE"}
            </span>
          </div>
          <h3>OPTICAL / MULTISPECTRAL</h3>
          <p className="sensor-desc">
            Provides rich spectral reflectance across visible, RedEdge, NIR and SWIR bands for chlorophyll and moisture calculation.
          </p>
          <div className="sensor-bars">
            <i style={{ width: `${opticalQuality}%` }} />
            <i style={{ width: `${Math.max(20, opticalQuality - 10)}%` }} />
            <i style={{ width: `${Math.max(15, opticalQuality - 20)}%` }} />
          </div>
          <div className="sensor-meta">
            <span>Quality: <b>{opticalQuality}%</b></span>
            <span>Cloud Cover: <b>{cloudSimulated ? "39% (Simulated)" : `${session.sensors.sentinel2.cloudCover}%`}</b></span>
            <span>Bands: <b>6 processed</b></span>
          </div>
          {cloudSimulated && (
            <div className="sensor-alert-box">
              <AlertTriangle size={14} /> Cloud contamination detected. Multispectral spectral indices degraded.
            </div>
          )}
        </div>

        {/* Central Fusion Node */}
        <div className="fusion-center">
          <div className="fusion-line" />
          <div className="fusion-node" title="Multi-Sensor Fusion Engine">
            <BrainCircuit size={22} />
          </div>
          <div className="fusion-line" />
        </div>

        {/* Sentinel-1 SAR Card */}
        <div className="sensor-card">
          <div className="sensor-top">
            <div className="sensor-icon"><RadioTower size={18} /></div>
            <span className="sensor-id">SENTINEL-1 C-SAR</span>
            <span className="sensor-status"><span /> AVAILABLE</span>
          </div>
          <h3>SAR / MICROWAVE RADAR</h3>
          <p className="sensor-desc">
            Cloud-penetrating 5.4 GHz C-band radar. Delivers VV surface texture and VH cross-polarization volumetric scattering.
          </p>
          <div className="sensor-bars">
            <i style={{ width: `${sarQuality}%` }} />
            <i style={{ width: `${sarQuality - 4}%` }} />
            <i style={{ width: `${sarQuality - 8}%` }} />
          </div>
          <div className="sensor-meta">
            <span>Quality: <b>{sarQuality}%</b></span>
            <span>Polarizations: <b>VV + VH</b></span>
            <span>Cloud Immunity: <b>100%</b></span>
          </div>
          <div className="sensor-note-good">
            <ShieldCheck size={14} /> Penetrates cloud cover & preserves structural forest metrics.
          </div>
        </div>
      </div>

      {/* Technical Complementarity Notice */}
      <div className="fusion-story-card">
        <div className="story-icon"><ShieldCheck size={24} /></div>
        <div className="story-content">
          <b>Complementary Sensor Fusion Architecture</b>
          <p>
            Optical data provides high-resolution spectral and vegetative information, while SAR provides cloud-independent microwave radar backscatter reflecting 3D canopy geometry and woody volume. Fusion does not merely replace pixels; it projects both sensors into a unified 14-dimensional feature embedding for robust tree segmentation and biomass estimation.
          </p>
        </div>
        <div className="story-telemetry">
          <div className="telem-item">
            <span>FUSED FEATURES</span>
            <b>14 Dimensions</b>
          </div>
          <div className="telem-item">
            <span>FUSED CONFIDENCE</span>
            <b>94.7% High</b>
          </div>
        </div>
      </div>

      {/* 4-Step Processing Pipeline */}
      <div className="fusion-process">
        <div className="process-title">
          <span>PROCESSING STAGES</span>
          <span className="live-text">● FUSED INFERENCE EXECUTED</span>
        </div>
        <ProcessStep n="01" title="Sentinel-2 surface reflectance & spectral extraction" value="12 bands (B02 - B12)" />
        <ProcessStep n="02" title="Sentinel-1 VV/VH backscatter extraction & speckle filtering" value="Gamma-0 radiometry" />
        <ProcessStep n="03" title="Multi-sensor latent feature alignment & cross-attention" value="14 dimensions" />
        <ProcessStep n="04" title="Instance crown segmentation & AGB regression (Model A1.4)" value="12,482 crowns · 18,421 t" />
      </div>

      {/* Navigation CTAs */}
      <div className="fusion-next-row">
        <button id="btn-fusion-to-canopy" className="outline-button" onClick={onNavigateCanopy}>
          <ScanSearch size={15} /> View Fused Canopy Crowns (12,482)
        </button>
        <button id="btn-fusion-to-biomass" className="primary-button" onClick={onNavigateBiomass}>
          <BarChart3 size={15} /> View Fused Biomass Results (18,421 t) <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. CANOPY INTELLIGENCE
// -------------------------------------------------------------
function Canopy({
  session,
  selectedTree,
  setSelectedTree,
  filter,
  setFilter
}: {
  session: AnalysisSession;
  selectedTree: TreeCrown | null;
  setSelectedTree: (t: TreeCrown) => void;
  filter: "all" | "high" | "low";
  setFilter: (f: "all" | "high" | "low") => void;
}) {
  const downloadGeoJson = () => {
    const geojson = generateCanopyGeoJson(session);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sylvasense-canopy-${session.analysisId.toLowerCase()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">INSTANCE COMPUTER VISION</div>
          <h2>Canopy intelligence & crown enumeration</h2>
        </div>
        <button id="btn-export-geojson-top" className="outline-button export-top" onClick={downloadGeoJson}>
          <Download size={15} /> Export Canopy GeoJSON
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid three">
        <Kpi
          icon={<TreePine />}
          label="INDIVIDUAL CANOPIES"
          value={session.canopy.treesDetected.toLocaleString()}
          delta={`${session.canopy.confidence}% confidence`}
        />
        <Kpi
          icon={<MapIcon />}
          label="CANOPY COVERAGE"
          value={`${session.canopy.coverage}%`}
          delta={`${session.target.areaHa} ha surveyed`}
        />
        <Kpi
          icon={<ScanSearch />}
          label="MEAN CROWN AREA"
          value={`${session.canopy.meanAreaM2} m²`}
          delta="per detected tree"
        />
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <span className="small-label"><Filter size={13} /> FILTER CONFIDENCE:</span>
        <button
          className={`filter-pill ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          SHOW ALL (12,482)
        </button>
        <button
          className={`filter-pill ${filter === "high" ? "active" : ""}`}
          onClick={() => setFilter("high")}
        >
          HIGH CONFIDENCE ≥90% ({session.canopy.confidenceBreakdown.high}%)
        </button>
        <button
          className={`filter-pill ${filter === "low" ? "active" : ""}`}
          onClick={() => setFilter("low")}
        >
          LOW / MED &lt;90% ({session.canopy.confidenceBreakdown.medium + session.canopy.confidenceBreakdown.low}%)
        </button>
      </div>

      {/* Canopy Main Layout */}
      <div className="canopy-grid">
        <div className="panel map-panel big-map">
          <PanelHeader
            title="INSTANCE SEGMENTATION MAP"
            meta="MASK2FORMER + YOLOV8-OBB ENSEMBLE"
            action={
              <button
                className="text-button"
                onClick={() => setSelectedTree(sampleTreeCrowns[0])}
              >
                Inspect sample TREE-08421 <ChevronRight size={14} />
              </button>
            }
          />
          <div className="map-wrap">
            <MapMock
              layer="canopy"
              selectedTreeId={selectedTree?.id}
              onSelectTree={setSelectedTree}
              filterConfidence={filter}
            />
          </div>
        </div>

        <div className="panel side-analysis">
          <PanelHeader title="DETECTION ANALYSIS" meta="12,482 CROWNS" />
          <Metric label="High confidence (≥90%)" value={`${session.canopy.confidenceBreakdown.high}%`} />
          <Metric label="Medium confidence (80-89%)" value={`${session.canopy.confidenceBreakdown.medium}%`} />
          <Metric label="Low confidence (<80%)" value={`${session.canopy.confidenceBreakdown.low}%`} />

          <div className="confidence-bars">
            <i style={{ width: `${session.canopy.confidenceBreakdown.high}%` }} title="High confidence" />
            <i style={{ width: `${session.canopy.confidenceBreakdown.medium}%` }} title="Medium confidence" />
            <i style={{ width: `${session.canopy.confidenceBreakdown.low}%` }} title="Low confidence" />
          </div>

          <div className="mini-code">
            <span>FeatureCollection</span>
            <b>12,482 Crown Polygons</b>
            <small>EPSG:4326 · RFC 7946 Standard</small>
            <div className="code-row">Target: <b>{session.target.name}</b></div>
            <div className="code-row">Mean Area: <b>{session.canopy.meanAreaM2} m²</b></div>
            <div className="code-row">Total Surveyed: <b>{session.target.areaHa} ha</b></div>
          </div>

          <div className="quick-tree-selector">
            <div className="small-label">SELECT TREE TO INSPECT</div>
            <div className="tree-pill-list">
              {sampleTreeCrowns.slice(0, 5).map(t => (
                <button
                  key={t.id}
                  className={`tree-select-pill ${selectedTree?.id === t.id ? "active" : ""}`}
                  onClick={() => setSelectedTree(t)}
                >
                  <TreePine size={13} /> {t.id} ({t.canopyArea} m²)
                </button>
              ))}
            </div>
          </div>

          <button id="btn-export-canopy-panel" className="primary-button full" onClick={downloadGeoJson}>
            <Download size={15} /> Export Canopy GeoJSON
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. BIOMASS & CARBON
// -------------------------------------------------------------
function Biomass({
  session,
  onNavigateValidation
}: {
  session: AnalysisSession;
  onNavigateValidation: () => void;
}) {
  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">CARBON & CLIMATE INTELLIGENCE</div>
          <h2>Biomass estimation & carbon stock accounting</h2>
        </div>
        <div className="status-chip">MODEL {session.validation.model} · CALIBRATED</div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <Kpi
          icon={<BarChart3 />}
          label="TOTAL ABOVEGROUND BIOMASS"
          value={`${session.biomass.totalAGB.toLocaleString()} t`}
          delta={`${session.biomass.density} t/ha average`}
        />
        <Kpi
          icon={<Leaf />}
          label="CARBON STOCK"
          value={`${session.biomass.carbonStock.toLocaleString()} tC`}
          delta="IPCC 0.47 × AGB conversion"
        />
        <Kpi
          icon={<Waves />}
          label="CO₂ EQUIVALENT"
          value={`${session.biomass.co2e.toLocaleString()} tCO₂e`}
          delta="3.67 × carbon stock"
        />
        <Kpi
          icon={<ShieldCheck />}
          label="MODEL ACCURACY"
          value={`R² = ${session.validation.r2}`}
          delta={`MAE: ${session.validation.mae} t/ha`}
        />
      </div>

      <div className="grid-main">
        {/* Spatial Biomass Map */}
        <div className="panel">
          <PanelHeader
            title="SPATIAL BIOMASS DENSITY MAP"
            meta="10m RESOLUTION FUSED ESTIMATE"
          />
          <div className="map-wrap">
            <MapMock layer="biomass" />
          </div>
        </div>

        {/* Mathematical Formulation & Feature Weights */}
        <div className="panel formula">
          <PanelHeader title="ALLOMETRIC REGRESSION FORMULATION" meta="MULTI-SENSOR FUSION" />
          
          <div className="formula-box">
            <b>AGB = f(Canopy Area, NDVI, NDMI, SAR-VV, SAR-VH, Tree Density)</b>
          </div>

          <div className="features-title">FEATURE CONTRIBUTION (100% TOTAL)</div>
          
          <div className="feature-bars-list">
            {session.biomass.featureContribution.map((f, i) => (
              <div key={i} className="feature-weight-row">
                <div className="feat-label">
                  <span>{f.name}</span>
                  <b>{f.weight}%</b>
                </div>
                <div className="feat-track">
                  <div className="feat-fill" style={{ width: `${f.weight}%` }} />
                </div>
                <small className="feat-role">{f.role}</small>
              </div>
            ))}
          </div>

          <div className="validation-mini">
            <div>
              <span>R² ACCURACY</span>
              <b>{session.validation.r2}</b>
            </div>
            <div>
              <span>MEAN ABS ERROR</span>
              <b>{session.validation.mae} t/ha</b>
            </div>
            <div>
              <span>RMSE</span>
              <b>{session.validation.rmse} t/ha</b>
            </div>
            <div>
              <span>VALIDATION SET</span>
              <b>{session.validation.samples} plots</b>
            </div>
          </div>

          <button
            id="btn-biomass-to-validation"
            className="outline-button full"
            onClick={onNavigateValidation}
          >
            <ShieldCheck size={15} /> View Model Governance & Provenance
          </button>
        </div>
      </div>

      {/* Zone Breakdown Table */}
      <div className="panel zone-breakdown-panel">
        <PanelHeader title="RESERVE STRATIFICATION ZONES" meta="3 SUB-REGIONS ANALYZED" />
        <div className="zone-grid">
          {session.canopy.zones.map(z => (
            <div key={z.id} className="zone-card">
              <div className="zone-head">
                <b>{z.name}</b>
                <span>{z.areaHa} ha</span>
              </div>
              <div className="zone-metrics">
                <div><span>Tree Crowns</span><b>{z.treeCount.toLocaleString()}</b></div>
                <div><span>AGB Density</span><b>{z.density} t/ha</b></div>
                <div><span>Total AGB</span><b>{z.agb.toLocaleString()} t</b></div>
                <div><span>Health</span><b>{z.health}/100</b></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. CHANGE DETECTION
// -------------------------------------------------------------
function Change({
  session,
  onSelectHotspot,
  onNavigateAlerts
}: {
  session: AnalysisSession;
  onSelectHotspot: (h: Hotspot) => void;
  onNavigateAlerts: () => void;
}) {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(session.change.hotspots[0]);

  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">TEMPORAL BI-TEMPORAL MONITORING</div>
          <h2>What changed? (2024 → 2026)</h2>
        </div>
        <div className="date-pill">
          {session.dates.baseline} <span>→</span> {session.dates.current}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="change-hero">
        <div className="change-number">
          <span>TOTAL CANOPY LOSS</span>
          <strong>{session.change.canopyLossPercent}%</strong>
          <small>{session.change.affectedAreaHa} ha affected · {session.change.estimatedTreeLoss.toLocaleString()} estimated tree crowns</small>
        </div>
        <div className="risk">
          <span>FOREST DISTURBANCE RISK</span>
          <strong>{session.change.forestRiskIndex} <small>/ 100</small></strong>
          <div className="risk-bar"><i style={{ width: `${session.change.forestRiskIndex}%` }} /></div>
          <em>{session.change.riskLevel}</em>
        </div>
      </div>

      <div className="what-changed">
        <span>CHANGE DETECTION SUMMARY</span>
        <p>
          Canopy loss detected across <b>{session.change.affectedAreaHa} ha</b> between {session.dates.baseline} and {session.dates.current}, concentrated in <b>{session.change.hotspotsCount} distinct hotspots</b>. Primary canopy removal accounts for <b>{session.change.hotspots[0].areaHa} ha</b> in the Southern Buffer.
        </p>
      </div>

      <div className="grid-main">
        {/* Heatmap */}
        <div className="panel">
          <PanelHeader
            title="DEGRADATION & CANOPY LOSS HEATMAP"
            meta={`${session.dates.baseline} → ${session.dates.current} DIFFERENCE`}
          />
          <div className="map-wrap">
            <MapMock
              layer="change"
              activeHotspotId={selectedHotspot.id}
              onSelectHotspot={(h) => {
                setSelectedHotspot(h);
              }}
            />
          </div>
        </div>

        {/* Hotspots List & Focus Details */}
        <div className="panel alerts-panel">
          <PanelHeader
            title="IDENTIFIED DISTURBANCE HOTSPOTS"
            meta={`${session.change.hotspotsCount} CONCENTRATED SITES`}
          />
          <div className="hotspot-select-list">
            {session.change.hotspots.map((h) => {
              const isSelected = selectedHotspot.id === h.id;
              return (
                <button
                  key={h.id}
                  className={`alert-row alert-button ${isSelected ? "selected-hotspot-row" : ""}`}
                  onClick={() => setSelectedHotspot(h)}
                >
                  <span className={`severity ${h.severity.toLowerCase()}`} />
                  <div>
                    <b>{h.alertId}: {h.name}</b>
                    <span>{h.date} · {h.areaHa} ha · {h.estimatedTreeLoss} trees lost</span>
                  </div>
                  <strong>{h.confidence}%</strong>
                </button>
              );
            })}
          </div>

          {/* Selected Hotspot Detailed Dossier */}
          <div className="selected-hotspot-card">
            <div className="sh-title">
              <span className={`sev-badge sev-${selectedHotspot.severity.toLowerCase()}`}>
                {selectedHotspot.severity} RISK
              </span>
              <b>{selectedHotspot.name}</b>
            </div>
            <p className="sh-desc">{selectedHotspot.description}</p>
            <div className="sh-grid">
              <Metric label="Affected Area" value={`${selectedHotspot.areaHa} ha`} />
              <Metric label="Estimated Tree Loss" value={`${selectedHotspot.estimatedTreeLoss} trees`} />
              <Metric label="Detection Date" value={selectedHotspot.date} />
              <Metric label="Status" value={selectedHotspot.status} />
              <Metric label="Optical Evidence" value={selectedHotspot.opticalEvidence} />
              <Metric label="SAR Radar Evidence" value={selectedHotspot.sarEvidence} />
            </div>
            <div className="sh-actions">
              <button
                className="outline-button"
                onClick={() => onSelectHotspot(selectedHotspot)}
              >
                <MapIcon size={14} /> Locate in Explorer
              </button>
              <button
                className="primary-button"
                onClick={onNavigateAlerts}
              >
                <AlertTriangle size={14} /> View in Alerts Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. ALERTS
// -------------------------------------------------------------
function Alerts({
  session,
  onToggleReview,
  onLocateHotspot,
  onCreateReport
}: {
  session: AnalysisSession;
  onToggleReview: (id: string) => void;
  onLocateHotspot: (h: Hotspot) => void;
  onCreateReport: (h: Hotspot) => void;
}) {
  const [activeAlertId, setActiveAlertId] = useState<string>(session.change.hotspots[0].id);
  const activeAlert = session.change.hotspots.find(h => h.id === activeAlertId) || session.change.hotspots[0];

  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">ACTION QUEUE & INCIDENT DISPATCH</div>
          <h2>Forest integrity alerts</h2>
        </div>
        <div className="status-chip">
          {session.change.hotspots.filter(h => h.status === "OPEN").length} OPEN INCIDENTS
        </div>
      </div>

      {/* Primary Alert Banner */}
      <div className="primary-alert">
        <div>
          <span>ALERT #{activeAlert.alertId} · {activeAlert.zone.toUpperCase()}</span>
          <h3>{activeAlert.name}</h3>
          <p>{activeAlert.description}</p>
        </div>
        <div className="alert-stat">
          <b>{activeAlert.areaHa}</b>
          <span>HECTARES AFFECTED</span>
        </div>
        <div className="alert-stat red">
          <b>{activeAlert.confidence}%</b>
          <span>DETECTION CONFIDENCE</span>
        </div>
        <div className={`alert-risk risk-${activeAlert.severity.toLowerCase()}`}>
          {activeAlert.severity} RISK
        </div>
      </div>

      {/* Alert Actions Bar */}
      <div className="alert-actions-toolbar">
        <button
          id="btn-mark-reviewed"
          className="outline-button-compact"
          onClick={() => onToggleReview(activeAlert.id)}
        >
          <Check size={14} />
          {activeAlert.status === "OPEN"
            ? "MARK AS REVIEWED"
            : activeAlert.status === "REVIEWED"
            ? "MARK AS RESOLVED"
            : "REOPEN INCIDENT"}
        </button>
        <button
          id="btn-locate-hotspot-alerts"
          className="outline-button-compact"
          onClick={() => onLocateHotspot(activeAlert)}
        >
          <MapIcon size={14} /> LOCATE HOTSPOT IN EXPLORER
        </button>
        <button
          id="btn-create-report"
          className="primary-button-compact"
          onClick={() => onCreateReport(activeAlert)}
        >
          <FileText size={14} /> CREATE INCIDENT REPORT
        </button>
      </div>

      {/* Grid: Alert Map & Evidence Dossier */}
      <div className="grid-main">
        <div className="panel">
          <PanelHeader
            title="INCIDENT HOTSPOT GEOMETRY"
            meta={`DETECTED ${activeAlert.date}`}
          />
          <div className="map-wrap">
            <MapMock
              layer="change"
              activeHotspotId={activeAlert.id}
              onSelectHotspot={(h) => setActiveAlertId(h.id)}
            />
          </div>
        </div>

        <div className="panel side-analysis">
          <PanelHeader title="SATELLITE EVIDENCE DOSSIER" meta={activeAlert.alertId} />
          <Metric label="Incident ID" value={activeAlert.alertId} />
          <Metric label="Status" value={activeAlert.status} />
          <Metric label="Change Period" value={session.change.period} />
          <Metric label="Affected Area" value={`${activeAlert.areaHa} ha`} />
          <Metric label="Estimated Tree Loss" value={`${activeAlert.estimatedTreeLoss} trees`} />
          <Metric label="Detection Date" value={activeAlert.date} />
          <Metric label="Coordinates" value={`${activeAlert.lat.toFixed(4)}° N, ${activeAlert.lon.toFixed(4)}° E`} />
          <Metric label="Optical Evidence" value={activeAlert.opticalEvidence} />
          <Metric label="SAR Radar Evidence" value={activeAlert.sarEvidence} />

          <div className="alert-selector-sublist">
            <div className="small-label">SWITCH INCIDENT</div>
            <div className="alert-tab-btns">
              {session.change.hotspots.map(h => (
                <button
                  key={h.id}
                  className={`alert-tab-btn ${activeAlert.id === h.id ? "active" : ""}`}
                  onClick={() => setActiveAlertId(h.id)}
                >
                  <span className={`severity ${h.severity.toLowerCase()}`} />
                  <b>{h.alertId}</b>
                  <span>({h.areaHa} ha · {h.status})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. VALIDATION & PROVENANCE
// -------------------------------------------------------------
function Validation({
  session
}: {
  session: AnalysisSession;
}) {
  const p = session.validation.provenance;

  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">MODEL GOVERNANCE & AUDITABILITY</div>
          <h2>Validation metrics & scientific provenance</h2>
        </div>
        <div className="status-chip">VERIFIED PROTOTYPE DATASET</div>
      </div>

      {/* Validation KPIs */}
      <div className="validation-grid">
        <Kpi
          icon={<BrainCircuit />}
          label="AGB R² ACCURACY"
          value={session.validation.r2.toString()}
          delta="validation set (1,250 plots)"
        />
        <Kpi
          icon={<Activity />}
          label="MEAN ABSOLUTE ERROR"
          value={`${session.validation.mae} t/ha`}
          delta="field plot cross-val"
        />
        <Kpi
          icon={<ShieldCheck />}
          label="ROOT MEAN SQ ERROR"
          value={`${session.validation.rmse} t/ha`}
          delta="residuals std error"
        />
        <Kpi
          icon={<ScanSearch />}
          label="VALIDATION RECORDS"
          value={session.validation.samples.toLocaleString()}
          delta="field & LiDAR calibrated"
        />
      </div>

      {/* Provenance Audit Table */}
      <div className="panel audit">
        <PanelHeader
          title="REPRODUCIBLE CARBON AUDIT TRAIL"
          meta={`${session.analysisId} · IMMUTABLE SPECIFICATION`}
        />
        <div className="audit-grid">
          <Audit k="ANALYSIS ID" v={session.analysisId} />
          <Audit k="ANALYSIS DATE" v={p.analysisDate} />
          <Audit k="TARGET ECOSYSTEM" v={session.target.name} />
          <Audit k="SURVEYED AREA" v={p.forestArea} />
          <Audit k="OPTICAL SOURCE" v={p.opticalSource} />
          <Audit k="SAR RADAR SOURCE" v={p.sarSource} />
          <Audit k="LIDAR CALIBRATION" v={p.lidarCalibration} />
          <Audit k="INFERENCE MODEL" v={session.validation.model} />
          <Audit k="DETECTED TREE CROWNS" v={`${session.canopy.treesDetected.toLocaleString()} crowns`} />
          <Audit k="CANOPY COVERAGE" v={`${session.canopy.coverage}%`} />
          <Audit k="ABOVEGROUND BIOMASS" v={p.agbEstimate} />
          <Audit k="BIOMASS DENSITY" v={`${session.biomass.density} t/ha`} />
          <Audit k="CARBON STOCK" v={p.carbonStock} />
          <Audit k="CO₂ EQUIVALENT" v={p.co2Equivalent} />
          <Audit k="TEMPORAL LOSS (2024-26)" v={`${session.change.affectedAreaHa} ha (${session.change.canopyLossPercent}%)`} />
          <Audit k="PROVENANCE NOTICE" v={p.disclaimer} />
        </div>
      </div>

      <div className="provenance-disclaimer">
        <ShieldCheck size={16} />
        <span>
          <b>Provenance Statement:</b> This analysis was conducted using prepared Earth Observation data for Silent Valley Forest Reserve. All figures, crown enumerations, biomass estimates, and temporal change vectors are derived deterministically from the central analysis dataset.
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// HELPER UI COMPONENTS & MODALS
// -------------------------------------------------------------
function ProcessStep({ n, title, value }: { n: string; title: string; value: string }) {
  return (
    <div className="process-step">
      <span className="step-number">{n}</span>
      <span className="step-title">{title}</span>
      <span className="step-value">{value}</span>
      <span className="step-check">✓</span>
    </div>
  );
}

function Audit({ k, v }: { k: string; v: string }) {
  return (
    <div className="audit-item">
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}

function Kpi({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) {
  return (
    <div className="kpi">
      <div className="kpi-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{delta}</small>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function PanelHeader({ title, meta, action }: { title: string; meta: string; action?: React.ReactNode }) {
  return (
    <div className="panel-header">
      <div>
        <b>{title}</b>
        <span>{meta}</span>
      </div>
      {action}
    </div>
  );
}

// Tree Inspection Side Drawer
function TreePanel({ tree, onClose, session }: { tree: TreeCrown; onClose: () => void; session: AnalysisSession }) {
  const downloadSingleGeoJson = () => {
    const singleGeoJson = {
      type: "Feature",
      id: tree.id,
      properties: {
        tree_id: tree.id,
        canopy_area_m2: tree.canopyArea,
        biomass_kg: tree.biomass,
        carbon_kg: tree.carbon,
        confidence_pct: tree.confidence,
        health: tree.health,
        zone: tree.zone,
        analysis_id: session.analysisId
      },
      geometry: {
        type: "Point",
        coordinates: [tree.lon, tree.lat]
      }
    };
    const blob = new Blob([JSON.stringify(singleGeoJson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tree.id.toLowerCase()}-inspection.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">CANOPY INSTANCE INSPECTION</span>
            <h2>{tree.id}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="tree-visual">
          <TreePine size={64} />
          <span className="tree-conf-badge">{tree.confidence}% CONF</span>
        </div>

        <Metric label="Tree Object ID" value={tree.id} />
        <Metric label="Coordinates" value={`${tree.lat.toFixed(4)}° N, ${tree.lon.toFixed(4)}° E`} />
        <Metric label="Canopy Crown Area" value={`${tree.canopyArea} m²`} />
        <Metric label="Detection Confidence" value={`${tree.confidence}%`} />
        <Metric label="Estimated Biomass" value={`${tree.biomass} kg (${(tree.biomass / 1000).toFixed(2)} t)`} />
        <Metric label="Carbon Stock" value={`${tree.carbon} kg C`} />
        <Metric label="Health Status" value={tree.health} />
        <Metric label="Stratification Zone" value={tree.zone} />

        <button className="primary-button full" onClick={downloadSingleGeoJson}>
          <Download size={15} /> Export Crown GeoJSON
        </button>
      </aside>
    </div>
  );
}

// Analysis Setup Modal (Section 5)
function SetupModal({
  session,
  onClose,
  onStartExecution
}: {
  session: AnalysisSession;
  onClose: () => void;
  onStartExecution: () => void;
}) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="setup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="setup-head">
          <div className="setup-title-box">
            <RadioTower size={20} className="setup-icon" />
            <div>
              <span className="eyebrow">EARTH OBSERVATION TASKING</span>
              <h2>Configure Forest Analysis Run</h2>
            </div>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="setup-grid">
          <div className="setup-field">
            <label>TARGET AREA</label>
            <input type="text" readOnly value={`${session.target.name}, ${session.target.region}`} />
          </div>
          <div className="setup-field">
            <label>ANALYSIS EXTENT</label>
            <input type="text" readOnly value={`${session.target.areaHa} ha (EPSG:4326)`} />
          </div>
          <div className="setup-field">
            <label>ANALYSIS PERIOD</label>
            <input type="text" readOnly value={`${session.dates.baseline} → ${session.dates.current} (Bi-temporal)`} />
          </div>
          <div className="setup-field">
            <label>INFERENCE MODEL</label>
            <input type="text" readOnly value={`${session.validation.model} (Ensemble Segmentation)`} />
          </div>
        </div>

        <div className="setup-section-title">DATA SOURCES</div>
        <div className="checklist-grid">
          <div className="check-item"><CheckCircle2 size={16} className="text-cyan" /> <span>Sentinel-2 Multispectral (10m ESA Copernicus)</span></div>
          <div className="check-item"><CheckCircle2 size={16} className="text-cyan" /> <span>Sentinel-1 SAR C-band VV/VH (IW GRD)</span></div>
          <div className="check-item"><CheckCircle2 size={16} className="text-cyan" /> <span>GEDI L2A/B LiDAR Structural Canopy Layer</span></div>
        </div>

        <div className="setup-section-title">ANALYTICAL MODULES</div>
        <div className="checklist-grid">
          <div className="check-item"><CheckCircle2 size={16} className="text-green" /> <span>Canopy Crown Instance Segmentation</span></div>
          <div className="check-item"><CheckCircle2 size={16} className="text-green" /> <span>Aboveground Biomass (AGB) Regression</span></div>
          <div className="check-item"><CheckCircle2 size={16} className="text-green" /> <span>Carbon Stock & CO₂e Offset Accounting</span></div>
          <div className="check-item"><CheckCircle2 size={16} className="text-green" /> <span>Bi-temporal Deforestation Change Detection</span></div>
        </div>

        <div className="setup-quality-row">
          <div className="quality-pill">Optical Quality: <b>{session.sensors.sentinel2.quality}%</b></div>
          <div className="quality-pill">SAR Telemetry: <b>{session.sensors.sentinel1.quality}%</b></div>
          <div className="quality-pill">LiDAR Calibration: <b>{session.sensors.lidar.quality}%</b></div>
        </div>

        <div className="setup-foot">
          <button className="text-button" onClick={onClose}>Cancel</button>
          <button id="btn-execute-run" className="primary-button" onClick={onStartExecution}>
            <RadioTower size={16} /> RUN ANALYSIS NOW <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// 14-Stage Execution Stepper Modal (Section 4)
function ExecutionStepperModal({
  currentStep,
  onSkip
}: {
  currentStep: number;
  onSkip: () => void;
}) {
  const pipelineStages = [
    { num: "01", name: "TARGET SELECTED", detail: "Silent Valley Reserve (384.6 ha) bounding box locked" },
    { num: "02", name: "SENTINEL-2 OPTICAL", detail: "Multispectral MSI surface reflectance ingested" },
    { num: "03", name: "SENTINEL-1 SAR", detail: "Microwave C-band VV + VH radar backscatter aligned" },
    { num: "04", name: "QUALITY CHECK", detail: "Atmospheric cloud mask and radiometric calibration verified" },
    { num: "05", name: "FEATURE EXTRACTION", detail: "NDVI, NDMI, NBR and SAR texture metrics extracted" },
    { num: "06", name: "MULTI-SENSOR FUSION", detail: "14-dimensional latent embedding cross-calibrated" },
    { num: "07", name: "CANOPY SEGMENTATION", detail: "Mask2Former sub-meter crown boundaries delineated" },
    { num: "08", name: "TREE ENUMERATION", detail: "12,482 individual tree instances attributed" },
    { num: "09", name: "BIOMASS ESTIMATION", detail: "Allometric regression applied across spatial grid" },
    { num: "10", name: "CARBON CALCULATION", detail: "IPCC 0.47 conversion to carbon stock & CO₂e" },
    { num: "11", name: "CHANGE DETECTION", detail: "Bi-temporal diff (2024 → 2026) disturbance mapping" },
    { num: "12", name: "ALERT GENERATION", detail: "3 prioritized deforestation hotspot clusters generated" },
    { num: "13", name: "VALIDATION AUDIT", detail: "R² 0.91 and MAE 5.17 t/ha verified against GEDI plots" },
    { num: "14", name: "GIS PACKAGING", detail: "FeatureCollection assembled and session ready" }
  ];

  const pct = Math.min(100, Math.round(((currentStep + 1) / pipelineStages.length) * 100));

  return (
    <div className="analysis-backdrop">
      <div className="analysis-modal wide">
        <div className="analysis-orb"><RadioTower size={28} /></div>
        <div className="eyebrow">SYLVASENSE INFERENCE ENGINE</div>
        <h2>Executing Forest Analysis Pipeline</h2>
        <p>Curated EO inference workflow · Multi-Sensor Earth Observation Fusion</p>

        <div className="analysis-steps-grid">
          {pipelineStages.map((stage, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={stage.num}
                className={`analysis-step-item ${isDone ? "done" : isCurrent ? "current" : ""}`}
              >
                <span className="step-badge">
                  {isDone ? "✓" : isCurrent ? "●" : stage.num}
                </span>
                <div className="step-info">
                  <b>{stage.name}</b>
                  <span>{stage.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="progress">
          <i style={{ width: `${pct}%` }} />
        </div>

        <div className="analysis-foot">
          <span>{pct}% COMPLETE · 14 PROCESSING STAGES</span>
          <button onClick={onSkip}>Skip Animation</button>
        </div>
      </div>
    </div>
  );
}

// Analysis Complete Summary Screen (Section 17)
function AnalysisCompleteModal({
  session,
  onViewResults
}: {
  session: AnalysisSession;
  onViewResults: () => void;
}) {
  return (
    <div className="analysis-backdrop">
      <div className="analysis-modal complete-card">
        <div className="complete-icon">
          <CheckCircle2 size={36} />
        </div>
        <div className="eyebrow">EXECUTION FINISHED</div>
        <h2>✓ ANALYSIS COMPLETE</h2>
        <div className="analysis-id-chip">{session.analysisId}</div>
        <p className="complete-sub">14 processing stages successfully executed across prepared EO scene.</p>

        <div className="complete-stats-grid">
          <div className="stat-box">
            <b>{session.canopy.treesDetected.toLocaleString()}</b>
            <span>Trees Detected</span>
          </div>
          <div className="stat-box">
            <b>{session.target.areaHa} ha</b>
            <span>Area Analyzed</span>
          </div>
          <div className="stat-box">
            <b>{session.biomass.totalAGB.toLocaleString()} t</b>
            <span>Estimated AGB</span>
          </div>
          <div className="stat-box">
            <b>{session.change.affectedAreaHa} ha</b>
            <span>Change Affected</span>
          </div>
          <div className="stat-box">
            <b>{session.change.hotspotsCount}</b>
            <span>Hotspots Generated</span>
          </div>
        </div>

        <button id="btn-view-results" className="primary-button full" onClick={onViewResults}>
          <BarChart3 size={16} /> VIEW RESULTS & POPULATE PLATFORM <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// History Item Modal
function HistoryModal({ item, onClose }: { item: any; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">ANALYSIS LOG</span>
            <h2>{item.title}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <Metric label="Event ID" value={item.id} />
        <Metric label="Recorded Date" value={item.date} />
        <Metric label="Survey Extent" value={item.area} />
        <Metric label="Status" value={item.status} />
        <div className="history-details-box">
          <label>EVENT SPECIFICATION</label>
          <p>{item.details}</p>
        </div>
        <button className="outline-button full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Incident Report Modal
function IncidentReportModal({
  hotspot,
  session,
  onClose
}: {
  hotspot: Hotspot;
  session: AnalysisSession;
  onClose: () => void;
}) {
  const downloadReportTxt = () => {
    const reportText = `=====================================================
SYLVASENSE FOREST INTELLIGENCE PLATFORM
OFFICIAL INCIDENT REPORT: #${hotspot.alertId}
=====================================================
Analysis Session: ${session.analysisId}
Target AOI: ${session.target.name}, ${session.target.region}
Detection Date: ${hotspot.date}
Incident Type: ${hotspot.type}
Severity Risk: ${hotspot.severity}
Status: ${hotspot.status}

GEOSPATIAL COORDINATES:
Latitude: ${hotspot.lat.toFixed(6)}° N
Longitude: ${hotspot.lon.toFixed(6)}° E
Stratification Zone: ${hotspot.zone}

IMPACT METRICS:
Affected Area: ${hotspot.areaHa} ha
Estimated Tree Crown Loss: ${hotspot.estimatedTreeLoss} trees
Detection Confidence: ${hotspot.confidence}%

SATELLITE EVIDENCE:
- Optical Evidence: ${hotspot.opticalEvidence}
- SAR Radar Evidence: ${hotspot.sarEvidence}

DESCRIPTION:
${hotspot.description}

RECOMMENDED ACTION:
1. Dispatch ground patrol to coordinates (${hotspot.lat.toFixed(4)}, ${hotspot.lon.toFixed(4)}).
2. Cross-reference UAV low-altitude imagery.
3. Update review status in SylvaSense Mission Control.

Generated by SylvaSense Platform (Round 1 Prototype)
=====================================================`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-report-${hotspot.alertId.toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">INCIDENT DOSSIER</span>
            <h2>Report #{hotspot.alertId}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="report-badge-row">
          <span className={`sev-badge sev-${hotspot.severity.toLowerCase()}`}>
            {hotspot.severity} RISK
          </span>
          <span className="status-chip">{hotspot.status}</span>
          <span className="report-date">{hotspot.date}</span>
        </div>

        <div className="report-preview-box">
          <div className="report-line"><span>Target:</span> <b>{session.target.name}</b></div>
          <div className="report-line"><span>Zone:</span> <b>{hotspot.zone}</b></div>
          <div className="report-line"><span>Coordinates:</span> <b>{hotspot.lat.toFixed(4)}° N, {hotspot.lon.toFixed(4)}° E</b></div>
          <div className="report-line"><span>Affected Area:</span> <b>{hotspot.areaHa} ha</b></div>
          <div className="report-line"><span>Tree Loss:</span> <b>{hotspot.estimatedTreeLoss} crowns</b></div>
          <div className="report-line"><span>Confidence:</span> <b>{hotspot.confidence}%</b></div>
          <div className="report-line"><span>Optical Evidence:</span> <b>{hotspot.opticalEvidence}</b></div>
          <div className="report-line"><span>SAR Evidence:</span> <b>{hotspot.sarEvidence}</b></div>
          <div className="report-desc-text">{hotspot.description}</div>
        </div>

        <div className="report-actions">
          <button className="outline-button" onClick={onClose}>Close</button>
          <button className="primary-button" onClick={downloadReportTxt}>
            <Download size={15} /> Download Incident Report (.txt)
          </button>
        </div>
      </div>
    </div>
  );
}
