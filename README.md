# SylvaSense - Round 1 Prototype

This is a UI-first prototype for ORION-PS-03.

## Scope

The app uses predefined/mock data to simulate:

- Sentinel-2 optical imagery
- Sentinel-1 SAR
- Multi-sensor fusion
- Canopy instance segmentation
- Tree enumeration
- AGB estimation
- Carbon metrics
- Temporal change detection
- Deforestation alerts
- Validation
- GeoJSON export workflow

It is intentionally not a production remote-sensing engine.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Next implementation step

Replace `MapMock.tsx` with Mapbox GL JS / Deck.gl and add prepared raster/GeoJSON assets. Then split the dashboard into route-level screens and connect the mock FastAPI service.
