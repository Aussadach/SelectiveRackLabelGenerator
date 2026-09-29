# Rack Canvas Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cursor-centered camera navigation, explicit rack fronts and access validation, distinct L/R and Single build tools, grid-safe rotation and group movement, readable labels, and strict outside-grid handling to the 3D rack canvas.

**Architecture:** Keep warehouse rules as pure functions in `src/model.js`, store interaction transactions in `src/main.js`, and let `src/rack-scene.js` own camera and WebGL visuals without mutating project data. Saved racks receive schema-versioned world-space directions; all placement, rotation, move, and access checks consume the same footprint and front-cell helpers.

**Tech Stack:** Vanilla JavaScript ES modules, Three.js, Vite, Node test runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-29-rack-canvas-interactions-design.md`

## Global Constraints

- The application remains a static browser application deployable to GitHub Pages.
- Do not install dependencies locally; the existing GitHub Actions workflow performs dependency installation and production builds.
- Preserve imported/exported `PLANT`, `ROW`, `BAY`, `LEVEL`, and `SIDE` behavior.
- Use `KeyboardEvent.code` for `M` and `Escape` behavior so Thai keyboard layout does not affect shortcuts.
- L/R occupies two cells and requires two front path cells; Single occupies one cell and requires one front path cell.
- Camera rotation remains snapped to four isometric angles plus Top view.
- Every committed build, rack rotation, or group move is one undoable transaction.

## Review Focus

- Rotating a two-cell rack at a grid edge must reject the change atomically and preserve its original direction and coordinates; Task 1 tests this candidate before Task 2 wires the command.
- Moving a mixed rack/path selection over one of its own original cells must be allowed while collision with any unselected object must be rejected; Task 3 tests both cases.
- Wheel zoom at canvas corners must keep the cursor's floor point stable within floating-point tolerance; Task 4 tests the pure target-correction calculation.
- Pointer events that intersect the infinite floor outside the finite grid must return no grid cell in both Top and Isometric views; Task 4 adds bounds tests and a production browser check.
- Legacy schema-6 racks with capacity overrides must receive deterministic direction without changing their exported location records; Task 1 tests migration and location equality.

---

### Task 1: Direction, footprint, access, and schema migration

**Files:**
- Modify: `src/model.js`
- Modify: `src/model.test.js`
- Modify: `src/main.js` (project-load migration only)

**Interfaces:**
- Produces: `rackDirection(unit): 0|1|2|3`
- Produces: `rackAxis(unit): "x"|"y"`
- Produces: `frontPathCells(unit): Array<{gx:number,gy:number}>`
- Produces: `rotatedRack(unit, quarterTurns): object`
- Updates: `unitFootprint(unit)`, `hasAdjacentPath(unit, paths)`, and `migrateLegacyFootprints(...)` to use direction

- [ ] **Step 1: Write failing direction and front-access tests**

Add separate tests asserting:

```js
assert.deepEqual(frontPathCells(lrDirection0), [{gx:4,gy:6},{gx:5,gy:6}]);
assert.equal(hasAdjacentPath(lrDirection0,[{gx:4,gy:6}]),false);
assert.equal(hasAdjacentPath(lrDirection0,[{gx:4,gy:6},{gx:5,gy:6}]),true);
assert.equal(hasAdjacentPath(singleDirection0,[{gx:3,gy:5}]),false); // side
assert.equal(hasAdjacentPath(singleDirection0,[{gx:4,gy:6}]),true);  // front
```

Add rotation tests for directions `0..3`, footprint axes, out-of-bounds candidates, and unchanged input objects.

- [ ] **Step 2: Run the model suite and verify the new tests fail for the old adjacency behavior**

Run: `npm test`

Expected: new L/R one-path and Single side-path assertions fail while the existing suite remains otherwise healthy.

- [ ] **Step 3: Implement direction-based footprint and front cells**

Use these exact world directions:

- `0`: long axis X, front vector `(0,+1)`
- `1`: long axis Y, front vector `(+1,0)`
- `2`: long axis X, front vector `(0,-1)`
- `3`: long axis Y, front vector `(-1,0)`

Keep `axis` synchronized for backward compatibility. `hasAdjacentPath` must require every `frontPathCells` entry to exist in the path set.

- [ ] **Step 4: Add a failing schema-6 migration test**

Assert that X-axis racks migrate to direction `0`, Y-axis racks to direction `1`, the project version becomes `7`, and `locations(project)` is identical before and after direction migration.

- [ ] **Step 5: Implement schema version 7 migration and load behavior**

Update defaults to version `7`. Extend legacy migration without changing Row, Bay, Level, capacity, or generated locations.

- [ ] **Step 6: Run tests and commit**

Run: `npm test && node --check src/main.js && git diff --check`

Commit: `Add directional rack access rules`

### Task 2: Build types, monotonic Bay allocation, and rack rotation

**Files:**
- Modify: `src/model.js`
- Modify: `src/model.test.js`
- Modify: `src/main.js`
- Modify: `src/enhancements.css`

**Interfaces:**
- Produces: `nextBayForRow(units, row): number`
- Consumes: `rotatedRack`, `canPlaceUnit`, and direction helpers from Task 1
- UI state: `rackBuildType` with exact values `"lr"` and `"single"`

- [ ] **Step 1: Write failing Bay-allocation tests**

Assert that placing before the current lowest coordinate returns `max Bay + 1`, gaps are not reused, and moving or rotating data does not change existing Bay values. Remove expectations that creation renumbers a Row spatially.

- [ ] **Step 2: Run tests and verify the spatial-renumber behavior fails the new expectation**

Run: `npm test`

Expected: the new monotonic Bay test fails because `renumberSelectedRow()` currently rewrites Bay values.

- [ ] **Step 3: Implement monotonic identity allocation**

Make `placementIdentity` call `nextBayForRow`. Remove creation-time spatial renumbering. Preserve explicit `assignSelectionRow` renumbering.

- [ ] **Step 4: Add L/R and Single controls to the Build panel**

Replace the one rack palette entry with `Rack L/R` and `Rack Single`. New L/R units use `capacities[level]=2` for every default level; new Single units use `capacities[level]=1` for every default level. Drag direction still selects the initial X/Y axis and corresponding default direction.

- [ ] **Step 5: Add rack rotation commands**

For one selected rack, show rotate-left and rotate-right buttons in the inspector. Build a rotated candidate, validate it against grid bounds, paths, and all other racks, then commit or show a Thai error without state mutation. Update selection and invalid-path colors after success.

- [ ] **Step 6: Run tests and commit**

Run: `npm test && node --check src/main.js && git diff --check`

Commit: `Add rack types and safe rotation`

### Task 3: Grid-aligned selection box and transactional group move

**Files:**
- Modify: `src/model.js`
- Modify: `src/model.test.js`
- Modify: `src/main.js`
- Modify: `src/rack-scene.js`
- Modify: `src/enhancements.css`

**Interfaces:**
- Produces: `selectionAnchor(units, paths, unitIds, pathKeys): {gx,gy}|null`
- Produces: `planSelectionMove(units, paths, unitIds, pathKeys, target, gridSize): {valid:boolean,delta:{gx,gy},units:Array,paths:Array,reason:string}`
- Renderer command: `setSelectionBox(from, to)` and `clearSelectionBox()`
- Renderer command: `setMovePreview(plan)` and `clearMovePreview()`

- [ ] **Step 1: Write failing pure group-move tests**

Cover a rack-only selection, path-only selection, mixed selection, movement over the selection's original cells, collision with an unselected footprint/path, partial out-of-bounds movement, and preservation of rack identity/direction/relative offsets.

- [ ] **Step 2: Run tests and verify failure because the move planner is absent**

Run: `npm test`

Expected: import/export failure or missing-function assertion for `planSelectionMove`.

- [ ] **Step 3: Implement selection anchor and move planner**

Exclude selected originals from blockers. Return translated clones only; do not mutate input arrays. Use full rack footprints for bounds and collisions.

- [ ] **Step 4: Render the selection rectangle**

Add a flat translucent teal plane and dashed/outlined border spanning the inclusive start/end cells. Update it while dragging empty space with Select and clear it on pointerup/pointercancel.

- [ ] **Step 5: Implement Move mode**

Show `Move (M)` in the selection panel and status. Enter with the button or `code === "KeyM"`; update the snapped ghost on pointer movement; color the entire ghost red when invalid; commit on valid primary click as one undo entry; ignore invalid clicks; cancel on `Escape`, page/tool change, or pointer cancellation without changing original coordinates.

- [ ] **Step 6: Run tests and commit**

Run: `npm test && node --check src/main.js && node --check src/rack-scene.js && git diff --check`

Commit: `Add grid selection and group move mode`

### Task 4: Cursor-centered zoom, middle-button pan, and finite-grid picking

**Files:**
- Modify: `src/model.js`
- Modify: `src/model.test.js`
- Modify: `src/main.js`
- Modify: `src/rack-scene.js`

**Interfaces:**
- Produces: `zoomTargetCorrection(before, after): {x:number,z:number}`
- Scene state: `{targetX:number,targetZ:number,zoom:number}` retained by `main.js`
- Renderer commands: `setZoom(nextZoom, cursorEvent?)` and `fitCamera()`
- Updates: `gridFromEvent(event)` returns `null` outside the finite grid

- [ ] **Step 1: Write failing camera-math and bounds tests**

Assert target correction keeps the pre-zoom plane point fixed, zoom clamps to `0.5..2`, and finite-grid conversion rejects coordinates below zero or at/above `gridSize` rather than clamping.

- [ ] **Step 2: Run tests and verify the new helpers are missing**

Run: `npm test`

Expected: new camera helper tests fail before renderer wiring.

- [ ] **Step 3: Persist camera target and implement scene commands**

Configure the orthographic camera around the stored target. Wheel zoom raycasts the floor before and after projection changes and corrects the target by their difference. Toolbar zoom calls the same command. Fit resets target to grid center and zoom to `1`.

- [ ] **Step 4: Add middle-button panning**

On `button === 1`, capture the pointer, raycast successive floor points, translate the camera target by their delta, prevent default scrolling, and suppress every warehouse tool. Release/cancel ends pan without render-state mutation.

- [ ] **Step 5: Remove outside-grid clamping from every canvas tool**

Primary pointerdown outside the grid returns immediately. Pointermove outside the grid suspends previews rather than snapping to an edge. Rack, path, erase, selection, and move all share the finite-grid result.

- [ ] **Step 6: Run tests and commit**

Run: `npm test && node --check src/main.js && node --check src/rack-scene.js && git diff --check`

Commit: `Add cursor zoom pan and finite grid picking`

### Task 5: Consistent lighting, scalable nameplates, and hover tooltip

**Files:**
- Modify: `src/rack-scene.js`
- Modify: `src/enhancements.css`

**Interfaces:**
- Renderer behavior: nameplate scale is bounded by `rackColumns(unit)`
- Renderer behavior: tooltip text is `${row}-${bay.padStart(2,"0")}` and remains inside the scene host

- [ ] **Step 1: Disable all shadow work and normalize lighting**

Remove `castShadow`, `receiveShadow`, and `renderer.shadowMap.enabled`. Use camera-independent hemisphere/ambient lighting plus a world light configuration whose material color does not vary materially across snapped views.

- [ ] **Step 2: Resize world-space labels**

Increase canvas texture resolution and font size. Bound sprite width below the rendered rack width for both Single and L/R while retaining world-space scaling in Isometric and Top views.

- [ ] **Step 3: Add the screen-space hover tooltip**

Create one absolutely positioned tooltip inside the scene host. Raycast on pointermove when not middle-panning; show it for rack hits, clamp it within host bounds, and clear it on pointerleave, disposal, or non-rack hits.

- [ ] **Step 4: Add valid/invalid move materials and verify preview disposal**

Reuse shared geometries/materials where possible and dispose only scene-owned geometry/textures. Ensure repeated preview updates do not create retained canvas textures or WebGL contexts.

- [ ] **Step 5: Run static checks and commit**

Run: `npm test && node --check src/rack-scene.js && git diff --check`

Commit: `Polish rack scene labels and lighting`

### Task 6: Full verification, documentation, and deployment

**Files:**
- Modify: `README.md`
- Modify as needed from review: `src/model.js`, `src/main.js`, `src/rack-scene.js`, `src/enhancements.css`, `src/model.test.js`

**Interfaces:**
- Consumes all completed tasks; produces the deployable GitHub Pages build.

- [ ] **Step 1: Update user documentation**

Document L/R and Single build tools, explicit Rack front, wheel zoom, middle-drag pan, rotation, drag selection, `M` move mode, `Escape`, and front-path validation.

- [ ] **Step 2: Run the complete local verification suite**

Run: `npm test`, `node --check src/main.js`, `node --check src/rack-scene.js`, and `git diff --check`.

Expected: all tests pass, syntax checks produce no output, and diff check is clean.

- [ ] **Step 3: Perform production browser checks after GitHub Actions deploys**

Verify with a cache-busted Pages URL:

- wheel zoom toward four cursor positions and middle-drag pan
- Top and all four Isometric angles without a 0-degree color shift
- L/R and Single creation, footprint, rotation, and front-only path validity
- visible drag-selection rectangle and mixed group Move valid/invalid previews
- `M` under Thai keyboard layout and `Escape` cancellation
- ignored clicks outside all four grid edges
- readable bounded nameplates and large hover tooltip
- no browser console errors or warnings

- [ ] **Step 4: Commit review fixes, push, and confirm workflow**

Push `master`, wait for the matching GitHub Actions run to complete successfully, and record the deployed commit and test count in the final report.
