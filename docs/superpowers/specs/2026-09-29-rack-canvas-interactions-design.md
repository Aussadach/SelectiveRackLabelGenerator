# Rack Canvas Interaction and Orientation Design

## Goal

Make the 3D warehouse canvas practical for large layouts: navigation follows common CAD/game controls, every rack has an explicit usable front, placement and movement remain grid-safe, and rack labels stay readable at different zoom levels.

## Rack type, footprint, and orientation

The Build panel offers two rack tools:

- **L/R rack**: every new level starts with capacity `2`, the model contains left and right bins, and its footprint is two adjacent grid cells.
- **Single rack**: every new level starts with capacity `1`, the model contains one bin, and its footprint is one grid cell.

Each rack stores an explicit quarter-turn `direction` in world coordinates. Direction controls the rendered model, footprint axis, front edge, and validation; camera rotation never changes rack direction. A horizontal rack initially faces toward increasing grid Y in Top view. A vertical rack initially faces toward increasing grid X. Rotating a selected rack changes direction by 90 degrees and recomputes its footprint. Rotation is rejected without changing state when the new footprint leaves the grid or collides with an unselected rack or path.

Existing projects are migrated deterministically. Their current `axis` determines footprint orientation, and the default front is increasing Y for X-axis racks or increasing X for Y-axis racks. Saved projects move to schema version 7 while retaining the current Row, Bay, Level, and Side label data.

## Path validation

Path access is based only on the rack's front edge.

- An L/R rack is valid only when both footprint cells have a path immediately in front of them. Paths at either short end or behind the rack do not count.
- A Single rack is valid only when the one cell immediately in front has a path. Side and rear paths do not count.

Invalid racks render red and are checked again after every rack or path placement, deletion, capacity change, rotation, and move. The existing warning before label design and export uses the same validation function.

## Camera navigation

The camera remains orthographic and supports the four snapped isometric angles plus Top view.

- Mouse-wheel scrolling zooms continuously within the existing safe minimum and maximum. The grid point beneath the cursor remains beneath the cursor after zooming.
- Holding the middle mouse button and dragging pans the camera target without selecting, building, erasing, or moving warehouse objects. A middle-button click without movement also has no warehouse action.
- The toolbar zoom controls update the same camera state. **Fit** recenters the grid and restores the fitted zoom.
- Camera target and zoom survive selection and inspector updates; normal canvas clicks do not reset the view.
- Ray-to-grid conversion returns `null` when the floor intersection is outside `[0, gridSize)`. Every tool treats that as no action and never clamps it to the nearest tile.

## Selection and movement

Dragging empty grid space with the Select tool displays a translucent rectangular selection box aligned to the grid. Racks are selected when any footprint cell intersects the box; paths are selected per cell. The box disappears when the pointer is released or cancelled, while selected objects keep their existing highlight.

When at least one rack or path is selected, the inspector and selection status show a **Move (M)** action. `KeyboardEvent.code === "KeyM"` activates it so the shortcut works with Thai and other keyboard layouts.

Move mode keeps the original objects in place until a valid destination is committed:

1. The minimum selected grid coordinate is the group anchor and every selected rack/path keeps its offset from that anchor.
2. Pointer movement shows a ghost of the full selected group snapped to the hovered grid cell.
3. The ghost uses the normal preview color when every moved footprint is in bounds and avoids all unselected racks and paths. It turns red when any part is invalid.
4. Clicking a valid destination commits the whole move as one undoable action. Clicking an invalid destination has no effect and leaves move mode active.
5. `Escape` cancels move mode and leaves every object at its original coordinate. Leaving move mode without a valid click likewise preserves the originals.

Move does not change Row, Bay, Level, capacity, rack direction, or relative spacing. Undo restores the complete group to its previous coordinates.

## Row and Bay identity

Spatial position does not reorder identifiers. A newly created rack that joins an existing Row receives `max(existing Bay in that Row) + 1`, regardless of whether it was drawn before, after, left, right, above, or below existing racks. A new isolated Row continues the existing extended alphabetic sequence. Creating, rotating, or moving racks never renumbers existing Bay values. Explicit multi-select Row reassignment remains the only operation that deliberately runs Bay numbers again.

## 3D rendering and labels

Rack and path materials use consistent ambient and directional lighting at every snapped camera angle. Shadow casting and receiving are disabled to reduce GPU work and prevent the 0-degree view from appearing different from the other views.

Each rack has a world-space nameplate showing `ROW-BAY`. Its scale is derived from the model width, so a Single label never exceeds one rack cell and an L/R label never exceeds its two-cell model. Because it remains in world space, it naturally scales with camera zoom in both Isometric and Top views.

Pointer hover over a rack also displays a large screen-space tooltip with the full rack position. The tooltip follows the pointer, remains legible when zoomed far out, stays inside the canvas bounds, and disappears when the pointer leaves the rack or canvas. Hover does not change selection or trigger a canvas action.

Preview rendering uses the selected Build rack type. Move preview can render racks and paths together and has separate valid and invalid colors. No preview object writes to project state.

## State and component boundaries

Pure layout rules stay in `src/model.js`: direction normalization, footprint cells, front path cells, path validity, collision checks, rotation candidates, group translation validation, and monotonic Bay allocation. These functions accept plain data and are covered by Node tests.

`src/rack-scene.js` owns WebGL concerns: camera target and cursor-anchored zoom, panning, raycasting, rack rotation, labels, tooltips, selection rectangles, and ghost rendering. It exposes events and small commands to `src/main.js` rather than mutating application state directly.

`src/main.js` owns tool state and transactions: selected Build type, selection, entering/cancelling/committing Move mode, undo snapshots, rack rotation commands, migration, and UI controls. One committed build, rotation, or group move creates one undo entry.

## Error handling and constraints

- Build, rotate, and move reject out-of-bounds or colliding footprints without partially mutating the layout.
- Capacity changes that alter Single/L/R footprint continue to use the same collision rules.
- Wheel and middle-mouse gestures prevent browser scrolling only while the pointer is over the rack canvas.
- Primary-button canvas tools ignore non-primary buttons.
- Pointer cancellation clears temporary selection and preview visuals.
- Empty selections cannot enter Move mode.

## Acceptance criteria

1. Wheel zoom preserves the world point under the cursor; middle-drag pans without editing objects.
2. Build creates uniform L/R or Single racks according to the selected palette item.
3. Rack rotation changes its model, footprint, and front edge together and rejects collisions atomically.
4. L/R requires two front path cells; Single requires one front path cell; side/rear paths never validate either type.
5. Lighting color is consistent at all four isometric angles and shadows are disabled.
6. Nameplates stay within rack width and scale with zoom; hover displays a large readable position tooltip.
7. New Bay numbers only increase within a Row and are not reordered by placement direction or movement.
8. Drag selection shows a visible grid-aligned rectangle.
9. Move mode supports mixed rack/path selections, valid and invalid previews, click-to-commit, and Escape-to-cancel.
10. Every tool ignores clicks outside the grid.
11. Existing projects load with deterministic orientation and remain export-compatible.
12. Automated model tests and production browser checks cover the behaviors above in Isometric and Top views.
