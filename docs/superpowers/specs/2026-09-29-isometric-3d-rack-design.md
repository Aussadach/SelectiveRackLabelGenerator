# Isometric 3D Rack Designer

The warehouse canvas uses a real WebGL scene with an orthographic camera. Camera rotation is limited to four isometric presets at 0°, 90°, 180° and 270° plus a top view, so every view remains aligned with the placement grid.

Rack geometry is parametric and code-native: four blue uprights, base plates, silver braces, orange bottom beams, tapered blue glove bins with three feet each, and four yellow/black guards at ground level. Bins stack directly without intermediate beams. Existing selection, invalid, preview and demolition states change the 3D materials.

A rack that contains any L/R level has two columns and occupies two adjacent grid cells along its row axis. A rack whose enabled levels are all Single occupies one grid cell. Drag direction determines the row axis. Collision checks, path validation, selection, deletion and grid resizing use the full footprint.

The label data model remains unchanged: one rack still produces the configured Row, Bay, Level and Side locations. Saved projects without an axis default to the X axis and are normalized on load.

