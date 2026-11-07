export interface TreeCrown {
  id: string;
  lat: number;
  lon: number;
  canopyArea: number; // m²
  confidence: number; // %
  biomass: number; // kg
  carbon: number; // kg
  health: "Healthy" | "Stressed" | "Monitor";
  zone: string;
  xPercent: number; // relative SVG coordinate (0 - 100%)
  yPercent: number; // relative SVG coordinate (0 - 100%)
}

export interface Hotspot {
  id: string;
  alertId: string;
  name: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  areaHa: number;
  confidence: number;
  estimatedTreeLoss: number;
  date: string;
  type: string;
  zone: string;
  lat: number;
  lon: number;
  xPercent: number;
  yPercent: number;
  opticalEvidence: string;
  sarEvidence: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  description: string;
}

export interface AnalysisSession {
  analysisId: string;
  status: "completed" | "running" | "idle";
  target: {
    name: string;
    reserve: string;
    region: string;
    country: string;
    areaHa: number;
    center: { lat: number; lon: number };
    bounds: { north: number; south: number; west: number; east: number };
  };
  dates: {
    baseline: string;
    current: string;
    analysisDate: string;
    lastAcquisition: string;
  };
  sensors: {
    sentinel2: {
      available: boolean;
      quality: number;
      cloudCover: number;
      resolutionM: number;
      sceneId: string;
      sceneDate: string;
      bands: string[];
    };
    sentinel1: {
      available: boolean;
      vv: boolean;
      vh: boolean;
      quality: number;
      resolutionM: number;
      sceneId: string;
      sceneDate: string;
      orbit: string;
      polarizations: string[];
    };
    lidar: {
      available: boolean;
      quality: number;
      sensor: string;
      meanCanopyHeightM: number;
      profilesCount: number;
    };
  };
  canopy: {
    treesDetected: number;
    coverage: number; // %
    confidence: number; // %
    meanAreaM2: number;
    confidenceBreakdown: {
      high: number; // %
      medium: number; // %
      low: number; // %
    };
    zones: Array<{
      id: string;
      name: string;
      areaHa: number;
      treeCount: number;
      density: number;
      health: number;
      agb: number;
    }>;
  };
  biomass: {
    totalAGB: number; // tonnes
    density: number; // t/ha
    carbonStock: number; // tC
    co2e: number; // tCO₂e
    formula: string;
    featureContribution: Array<{
      name: string;
      weight: number;
      role: string;
    }>;
    trajectory: Array<{
      year: string;
      value: number;
      density: number;
    }>;
  };
  change: {
    period: string;
    canopyLossPercent: number;
    affectedAreaHa: number;
    estimatedTreeLoss: number;
    hotspotsCount: number;
    forestRiskIndex: number;
    riskLevel: string;
    hotspots: Hotspot[];
  };
  validation: {
    r2: number;
    mae: number; // t/ha
    rmse: number; // t/ha
    samples: number;
    model: string;
    provenance: {
      opticalSource: string;
      sarSource: string;
      lidarCalibration: string;
      analysisDate: string;
      forestArea: string;
      agbEstimate: string;
      carbonStock: string;
      co2Equivalent: string;
      confidenceScore: string;
      disclaimer: string;
    };
  };
  history: Array<{
    date: string;
    title: string;
    subtitle: string;
    area: string;
    status: string;
    id: string;
    details: string;
  }>;
}

// 48 spatially distributed tree crown instances within the Silent Valley boundary extent
export const sampleTreeCrowns: TreeCrown[] = [
  { id: "TREE-08421", lat: 11.0792, lon: 76.2124, canopyArea: 34.7, confidence: 96.4, biomass: 412, carbon: 193, health: "Healthy", zone: "Southern Buffer", xPercent: 52, yPercent: 43 },
  { id: "TREE-08422", lat: 11.0797, lon: 76.2132, canopyArea: 29.1, confidence: 95.1, biomass: 347, carbon: 163, health: "Healthy", zone: "Southern Buffer", xPercent: 56, yPercent: 41 },
  { id: "TREE-08423", lat: 11.0785, lon: 76.2117, canopyArea: 26.3, confidence: 92.8, biomass: 288, carbon: 135, health: "Monitor", zone: "Southern Buffer", xPercent: 48, yPercent: 46 },
  { id: "TREE-08424", lat: 11.0821, lon: 76.2185, canopyArea: 42.8, confidence: 97.2, biomass: 531, carbon: 249, health: "Healthy", zone: "Core Reserve", xPercent: 64, yPercent: 35 },
  { id: "TREE-08425", lat: 11.0834, lon: 76.2198, canopyArea: 38.6, confidence: 94.9, biomass: 472, carbon: 221, health: "Healthy", zone: "Core Reserve", xPercent: 68, yPercent: 32 },
  { id: "TREE-08426", lat: 11.0765, lon: 76.2089, canopyArea: 31.4, confidence: 89.2, biomass: 362, carbon: 170, health: "Monitor", zone: "Southern Buffer", xPercent: 42, yPercent: 54 },
  { id: "TREE-08427", lat: 11.0742, lon: 76.2051, canopyArea: 22.1, confidence: 78.4, biomass: 215, carbon: 101, health: "Stressed", zone: "Southern Buffer", xPercent: 35, yPercent: 62 },
  { id: "TREE-08428", lat: 11.0865, lon: 76.2241, canopyArea: 45.2, confidence: 98.1, biomass: 590, carbon: 277, health: "Healthy", zone: "Core Reserve", xPercent: 74, yPercent: 26 },
  { id: "TREE-08429", lat: 11.0882, lon: 76.2268, canopyArea: 36.9, confidence: 95.7, biomass: 440, carbon: 206, health: "Healthy", zone: "Core Reserve", xPercent: 78, yPercent: 22 },
  { id: "TREE-08430", lat: 11.0715, lon: 76.2014, canopyArea: 19.8, confidence: 73.1, biomass: 184, carbon: 86, health: "Stressed", zone: "Southern Buffer", xPercent: 29, yPercent: 68 },
  { id: "TREE-08431", lat: 11.0805, lon: 76.2156, canopyArea: 33.5, confidence: 93.4, biomass: 395, carbon: 185, health: "Healthy", zone: "Core Reserve", xPercent: 58, yPercent: 38 },
  { id: "TREE-08432", lat: 11.0848, lon: 76.2215, canopyArea: 39.4, confidence: 96.0, biomass: 489, carbon: 229, health: "Healthy", zone: "Core Reserve", xPercent: 71, yPercent: 29 },
  { id: "TREE-08433", lat: 11.0778, lon: 76.2105, canopyArea: 28.7, confidence: 91.5, biomass: 320, carbon: 150, health: "Healthy", zone: "Southern Buffer", xPercent: 46, yPercent: 49 },
  { id: "TREE-08434", lat: 11.0895, lon: 76.2291, canopyArea: 44.0, confidence: 97.8, biomass: 564, carbon: 265, health: "Healthy", zone: "Core Reserve", xPercent: 82, yPercent: 19 },
  { id: "TREE-08435", lat: 11.0731, lon: 76.2038, canopyArea: 24.5, confidence: 82.3, biomass: 250, carbon: 117, health: "Monitor", zone: "Southern Buffer", xPercent: 32, yPercent: 65 },
  { id: "TREE-08436", lat: 11.0812, lon: 76.2170, canopyArea: 35.8, confidence: 94.2, biomass: 425, carbon: 199, health: "Healthy", zone: "Core Reserve", xPercent: 61, yPercent: 37 },
  { id: "TREE-08437", lat: 11.0871, lon: 76.2255, canopyArea: 41.2, confidence: 96.8, biomass: 510, carbon: 239, health: "Healthy", zone: "Core Reserve", xPercent: 76, yPercent: 24 },
  { id: "TREE-08438", lat: 11.0758, lon: 76.2075, canopyArea: 30.1, confidence: 90.6, biomass: 345, carbon: 162, health: "Healthy", zone: "Southern Buffer", xPercent: 39, yPercent: 57 },
  { id: "TREE-08439", lat: 11.0910, lon: 76.2312, canopyArea: 46.5, confidence: 98.4, biomass: 610, carbon: 286, health: "Healthy", zone: "Core Reserve", xPercent: 85, yPercent: 16 },
  { id: "TREE-08440", lat: 11.0702, lon: 76.1995, canopyArea: 21.0, confidence: 75.9, biomass: 200, carbon: 94, health: "Stressed", zone: "Southern Buffer", xPercent: 26, yPercent: 71 },
  { id: "TREE-08441", lat: 11.0855, lon: 76.2228, canopyArea: 37.4, confidence: 95.3, biomass: 455, carbon: 213, health: "Healthy", zone: "Core Reserve", xPercent: 73, yPercent: 28 },
  { id: "TREE-08442", lat: 11.0789, lon: 76.2120, canopyArea: 32.2, confidence: 92.1, biomass: 380, carbon: 178, health: "Healthy", zone: "Southern Buffer", xPercent: 50, yPercent: 44 },
  { id: "TREE-08443", lat: 11.0925, lon: 76.2335, canopyArea: 48.0, confidence: 98.9, biomass: 640, carbon: 300, health: "Healthy", zone: "Core Reserve", xPercent: 88, yPercent: 13 },
  { id: "TREE-08444", lat: 11.0722, lon: 76.2025, canopyArea: 23.8, confidence: 80.5, biomass: 240, carbon: 112, health: "Monitor", zone: "Southern Buffer", xPercent: 30, yPercent: 67 },
  { id: "TREE-08445", lat: 11.0839, lon: 76.2205, canopyArea: 40.1, confidence: 96.5, biomass: 500, carbon: 235, health: "Healthy", zone: "Core Reserve", xPercent: 69, yPercent: 31 }
];

export const initialAnalysisSession: AnalysisSession = {
  analysisId: "SYLVA-2026-0921-001",
  status: "completed",
  target: {
    name: "Silent Valley Forest Reserve",
    reserve: "Silent Valley National Park",
    region: "Western Ghats, Kerala",
    country: "India",
    areaHa: 384.6,
    center: { lat: 11.0825, lon: 76.2418 },
    bounds: { north: 11.1150, south: 11.0500, west: 76.2000, east: 76.2800 }
  },
  dates: {
    baseline: "2024",
    current: "2026",
    analysisDate: "21 Sep 2026",
    lastAcquisition: "19 Sep 2026 00:42:18 UTC"
  },
  sensors: {
    sentinel2: {
      available: true,
      quality: 92,
      cloudCover: 8,
      resolutionM: 10,
      sceneId: "S2A_MSIL2A_20260918T050701_N0511_R019_T43PGQ",
      sceneDate: "18 Sep 2026",
      bands: ["B02 (Blue 490nm)", "B03 (Green 560nm)", "B04 (Red 665nm)", "B08 (NIR 842nm)", "B11 (SWIR 1610nm)", "B12 (SWIR 2190nm)"]
    },
    sentinel1: {
      available: true,
      vv: true,
      vh: true,
      quality: 96,
      resolutionM: 10,
      sceneId: "S1A_IW_GRDH_1SDV_20260919T004218_061099_0798C2",
      sceneDate: "19 Sep 2026",
      orbit: "Descending Track 121 (IW Mode)",
      polarizations: ["VV (Co-polarization)", "VH (Cross-polarization)"]
    },
    lidar: {
      available: true,
      quality: 94,
      sensor: "GEDI L2A/B Profiles + ICESat-2 Calibration",
      meanCanopyHeightM: 26.8,
      profilesCount: 342
    }
  },
  canopy: {
    treesDetected: 12482,
    coverage: 67.4,
    confidence: 94.7,
    meanAreaM2: 31.2,
    confidenceBreakdown: {
      high: 76.4,
      medium: 18.1,
      low: 5.5
    },
    zones: [
      { id: "core", name: "Core Reserve Zone", areaHa: 198.2, treeCount: 6842, density: 54.2, health: 91, agb: 10742 },
      { id: "buffer_south", name: "Southern Buffer Zone", areaHa: 112.4, treeCount: 3410, density: 41.8, health: 79, agb: 4698 },
      { id: "karipara", name: "Karipara Corridor", areaHa: 74.0, treeCount: 2230, density: 42.1, health: 83, agb: 2981 }
    ]
  },
  biomass: {
    totalAGB: 18421,
    density: 47.9,
    carbonStock: 8658,
    co2e: 31763,
    formula: "AGB = f(Canopy Area, NDVI, NDMI, SAR-VV, SAR-VH, Tree Density)",
    featureContribution: [
      { name: "Canopy Area", weight: 42, role: "Crown polygon geometry from high-res segmentation" },
      { name: "NDVI", weight: 28, role: "Normalized Difference Vegetation Index (B08 - B04)" },
      { name: "SAR Backscatter", weight: 18, role: "C-band VV + VH volumetric radar scattering" },
      { name: "Tree Density", weight: 8, role: "Spatial packing & nearest-neighbor canopy density" },
      { name: "Other / Residual", weight: 4, role: "Structural height prior & slope correction" }
    ],
    trajectory: [
      { year: "2022", value: 14280, density: 37.1 },
      { year: "2023", value: 15140, density: 39.4 },
      { year: "2024", value: 16490, density: 42.9 },
      { year: "2025", value: 17560, density: 45.7 },
      { year: "2026", value: 18421, density: 47.9 }
    ]
  },
  change: {
    period: "2024-2026",
    canopyLossPercent: 7.8,
    affectedAreaHa: 29.6,
    estimatedTreeLoss: 1284,
    hotspotsCount: 3,
    forestRiskIndex: 23,
    riskLevel: "LOW · 3 zones require review",
    hotspots: [
      {
        id: "HS-01",
        alertId: "A-2041",
        name: "Southern Buffer Canopy Removal",
        severity: "HIGH",
        areaHa: 4.7,
        confidence: 93.2,
        estimatedTreeLoss: 204,
        date: "14 Sep 2026",
        type: "Canopy removal",
        zone: "Southern Buffer Zone",
        lat: 11.0682,
        lon: 76.2285,
        xPercent: 32,
        yPercent: 68,
        opticalEvidence: "Degraded / Cloud Contaminated (61% S2)",
        sarEvidence: "Available (VV/VH Backscatter Drop -4.2 dB)",
        status: "OPEN",
        description: "High-confidence canopy removal event in the southern reserve buffer. Marked drop in SAR cross-polarization ratio confirmed structural vegetation loss."
      },
      {
        id: "HS-02",
        alertId: "AL-0881",
        name: "Karipara Edge Stress",
        severity: "MEDIUM",
        areaHa: 2.1,
        confidence: 88.4,
        estimatedTreeLoss: 92,
        date: "02 Aug 2026",
        type: "Vegetation stress",
        zone: "Karipara Corridor",
        lat: 11.0945,
        lon: 76.2512,
        xPercent: 74,
        yPercent: 28,
        opticalEvidence: "NDMI Moisture Deficit (-0.18 anomaly)",
        sarEvidence: "Moderate dielectric attenuation shift",
        status: "REVIEWED",
        description: "Moisture deficit anomaly detected via Sentinel-2 NDMI bands corroborated by SAR dielectric shift."
      },
      {
        id: "HS-03",
        alertId: "AL-0714",
        name: "Western Fringe Disturbance",
        severity: "LOW",
        areaHa: 0.8,
        confidence: 81.7,
        estimatedTreeLoss: 38,
        date: "18 Jun 2026",
        type: "Minor disturbance",
        zone: "Western Fringe",
        lat: 11.0831,
        lon: 76.2054,
        xPercent: 24,
        yPercent: 44,
        opticalEvidence: "Isolated spectral variance along access trail",
        sarEvidence: "Stable baseline structural signal",
        status: "RESOLVED",
        description: "Localized selective thinning or natural branchfall along peripheral boundary trail."
      }
    ]
  },
  validation: {
    r2: 0.91,
    mae: 5.17,
    rmse: 8.42,
    samples: 1250,
    model: "SylvaSense-A1.4",
    provenance: {
      opticalSource: "Sentinel-2 / multispectral (10m ESA Copernicus)",
      sarSource: "Sentinel-1 / VV + VH (C-band SAR)",
      lidarCalibration: "GEDI L2A/L2B canopy height profiles",
      analysisDate: "21 Sep 2026",
      forestArea: "384.6 ha",
      agbEstimate: "18,421 tonnes",
      carbonStock: "8,658 tC (IPCC 0.47 conversion factor)",
      co2Equivalent: "31,763 tCO₂e (3.67 × carbon stock)",
      confidenceScore: "94.7%",
      disclaimer: "Prototype validation / curated demonstration dataset"
    }
  },
  history: [
    {
      date: "21 SEP 2026",
      title: "Current analysis",
      subtitle: "Multi-sensor fusion pipeline",
      area: "384.6 ha",
      status: "Completed",
      id: "SYLVA-2026-0921-001",
      details: "Full 14-stage execution. Optical 92%, SAR 96%. 12,482 canopies detected, 18,421 t AGB estimated."
    },
    {
      date: "14 SEP 2026",
      title: "Change event detected",
      subtitle: "Canopy removal in Southern Buffer",
      area: "4.7 ha",
      status: "Alert Raised",
      id: "EVT-2026-0914-04",
      details: "High-risk deforestation anomaly detected. SAR VV/VH confirmed structural loss (-4.2 dB)."
    },
    {
      date: "02 AUG 2026",
      title: "Vegetation stress",
      subtitle: "Moisture deficit anomaly",
      area: "2.1 ha",
      status: "Flagged",
      id: "EVT-2026-0802-02",
      details: "NDMI deficit anomaly in Karipara corridor. Attributed to seasonal dry spell."
    },
    {
      date: "18 JUN 2026",
      title: "Minor disturbance",
      subtitle: "Peripheral boundary trail thinning",
      area: "0.8 ha",
      status: "Resolved",
      id: "EVT-2026-0618-01",
      details: "Ground patrol confirmed localized windfall branch clearance along perimeter trail."
    }
  ]
};

// Generates valid RFC 7946 GeoJSON FeatureCollection from the canopy crowns and reserve boundary
export function generateCanopyGeoJson(session: AnalysisSession = initialAnalysisSession) {
  return {
    type: "FeatureCollection",
    name: "sylvasense_canopy_silent_valley",
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
    },
    metadata: {
      analysisId: session.analysisId,
      date: session.dates.analysisDate,
      target: session.target.name,
      totalTreesDetected: session.canopy.treesDetected,
      totalAGBTonnes: session.biomass.totalAGB,
      provenance: session.validation.provenance.disclaimer
    },
    features: [
      // Target AOI boundary polygon
      {
        type: "Feature",
        id: "AOI_SILENT_VALLEY",
        properties: {
          name: session.target.name,
          category: "Forest Reserve Boundary",
          area_ha: session.target.areaHa,
          canopy_coverage_pct: session.canopy.coverage,
          agb_tonnes: session.biomass.totalAGB,
          carbon_tC: session.biomass.carbonStock
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [76.2000, 11.0720],
              [76.2180, 11.1120],
              [76.2650, 11.1080],
              [76.2800, 11.0850],
              [76.2710, 11.0550],
              [76.2350, 11.0500],
              [76.2080, 11.0580],
              [76.2000, 11.0720]
            ]
          ]
        }
      },
      // Individual detected tree canopy crowns
      ...sampleTreeCrowns.map(t => ({
        type: "Feature",
        id: t.id,
        properties: {
          tree_id: t.id,
          canopy_area_m2: t.canopyArea,
          biomass_kg: t.biomass,
          carbon_kg: t.carbon,
          confidence_pct: t.confidence,
          health_status: t.health,
          zone: t.zone,
          analysis_id: session.analysisId
        },
        geometry: {
          type: "Point",
          coordinates: [t.lon, t.lat]
        }
      })),
      // Change Hotspots
      ...session.change.hotspots.map(h => ({
        type: "Feature",
        id: h.id,
        properties: {
          alert_id: h.alertId,
          hotspot_name: h.name,
          category: "Change Hotspot",
          severity: h.severity,
          affected_area_ha: h.areaHa,
          confidence_pct: h.confidence,
          estimated_tree_loss: h.estimatedTreeLoss,
          detection_date: h.date,
          status: h.status
        },
        geometry: {
          type: "Point",
          coordinates: [h.lon, h.lat]
        }
      }))
    ]
  };
}
