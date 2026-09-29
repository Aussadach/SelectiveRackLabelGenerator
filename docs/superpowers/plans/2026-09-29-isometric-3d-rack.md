# Isometric 3D Rack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat SVG rack drawing with an orthographic Three.js warehouse scene and make double racks occupy two grid cells.

**Architecture:** Pure footprint helpers stay in `model.js` and are covered by Node tests. `rack-scene.js` owns Three.js geometry, camera presets, raycasting and temporary visual states. `main.js` keeps application state and delegates rack-canvas interaction to the scene controller.

**Tech Stack:** JavaScript, Three.js, Vite, Node test runner

**Spec:** `docs/superpowers/specs/2026-09-29-isometric-3d-rack-design.md`

## Global Constraints

- Static GitHub Pages deployment with no backend.
- Orthographic camera with four snapped isometric angles and top view.
- Double L/R racks occupy two cells along the drag axis; Single racks occupy one.
- Preserve path validation, multi-select, Delete, Undo and label generation.

## Review Focus

- Double-rack footprint at grid edges must be rejected.
- Capacity changes must not silently overlap another rack or path.
- Old saved projects must receive a deterministic axis.
- Raycasting must pick the same cell after every camera rotation.
- WebGL resources must be disposed when the app rerenders.

### Task 1: Footprint model

- [ ] Add failing tests for rack columns, X/Y footprints, collision, path adjacency and selection.
- [ ] Implement `rackColumns`, `unitFootprint`, `canPlaceUnit` and footprint-aware helpers.
- [ ] Update the default layout to use non-overlapping two-cell racks.
- [ ] Run `npm test`.

### Task 2: Three-dimensional scene

- [ ] Add Three.js as an application dependency.
- [ ] Create `rack-scene.js` with parametric bins, frames, guards, paths, grid and camera presets.
- [ ] Expose grid raycasting, object picking, preview, selection and demolition highlighting.
- [ ] Run syntax checks and model tests.

### Task 3: Application integration

- [ ] Replace the SVG canvas host with the 3D scene host.
- [ ] Adapt drag placement, selection, paths and deletion to scene raycasting and full footprints.
- [ ] Reject capacity changes that would collide or leave the grid.
- [ ] Update saved-project normalization and README.
- [ ] Push and use GitHub Actions for dependency install, tests and production build.

