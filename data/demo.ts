import { initialAnalysisSession, sampleTreeCrowns, generateCanopyGeoJson } from "./analysis";

export const forest = {
  name: initialAnalysisSession.target.name,
  region: initialAnalysisSession.target.region,
  areaHa: initialAnalysisSession.target.areaHa,
  trees: initialAnalysisSession.canopy.treesDetected,
  canopy: initialAnalysisSession.canopy.coverage,
  agb: initialAnalysisSession.biomass.totalAGB,
  biomassDensity: initialAnalysisSession.biomass.density,
  carbon: initialAnalysisSession.biomass.carbonStock,
  co2e: initialAnalysisSession.biomass.co2e,
  health: 87,
  risk: initialAnalysisSession.change.forestRiskIndex,
  analysisDate: initialAnalysisSession.dates.analysisDate,
  analysisId: initialAnalysisSession.analysisId
};

export const tree = sampleTreeCrowns[0];

export const biomassTrend = initialAnalysisSession.biomass.trajectory;

export const changeTrend = [
  { year: "2022", canopy: 72.8 },
  { year: "2023", canopy: 71.6 },
  { year: "2024", canopy: 70.9 },
  { year: "2025", canopy: 69.1 },
  { year: "2026", canopy: 67.4 }
];

export const alerts = initialAnalysisSession.change.hotspots.map(h => ({
  id: h.alertId,
  hotspotId: h.id,
  severity: h.severity,
  area: `${h.areaHa} ha`,
  confidence: h.confidence,
  date: h.date,
  type: h.type,
  name: h.name,
  treeLoss: h.estimatedTreeLoss,
  status: h.status,
  opticalEvidence: h.opticalEvidence,
  sarEvidence: h.sarEvidence,
  description: h.description,
  zone: h.zone
}));

export const canopyGeoJson = generateCanopyGeoJson(initialAnalysisSession);
