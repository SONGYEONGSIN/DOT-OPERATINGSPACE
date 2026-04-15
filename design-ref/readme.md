# Design System Strategy: Tactical Intelligence

This document outlines the visual and behavioral framework for a high-stakes enterprise operations environment. The goal is to move beyond generic "dashboard" layouts toward a signature "Command Center" aesthetic—one that feels authoritative, ultra-modern, and intentionally structured.

## 1. Creative North Star: The Kinetic Grid
The design system is built on the concept of **Kinetic Intelligence**. In a high-stakes environment, data shouldn't just sit on a screen; it should feel alive and prioritized. We break the "template" look through a high-contrast interaction between deep obsidian surfaces and neon-kinetic accents. By utilizing intentional asymmetry, varying typographic scales, and layered depth, we create a UI that signals precision and immediate action.

- **Intentional Asymmetry:** Avoid perfectly centered blocks for data. Use weighted layouts where the most critical "Primary" data takes up larger, non-standard proportions of the grid.
- **Tonal Depth:** Instead of lines, we use light. Hierarchy is defined by how much "glow" or "lift" a component has against the dark background.

## 2. Color Architecture & Surface Philosophy

The color palette is designed for prolonged focus in low-light environments, using high-chroma accents for "critical-path" information.

### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. They clutter the visual field and feel "standard." Boundaries must be defined through:
1.  **Background Shifts:** Moving from `surface` (#0c0e10) to `surface-container-low` (#111416).
2.  **Negative Space:** Utilizing the `Spacing Scale` (specifically 12 to 20 units) to create distinct visual islands.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of intelligence modules.
*   **Base Level:** `surface` (#0c0e10) — The desk.
*   **Section Level:** `surface-container` (#171a1c) — The primary work area.
*   **Component Level:** `surface-container-high` (#1d2023) — The interactive modules.
*   **Focus Level:** `surface-bright` (#292c30) — Active states or floating panels.

### The Glass & Gradient Rule
Main CTAs and high-level status indicators should use a subtle gradient from `primary` (#d9fd53) to `primary-container` (#9fc00f). For floating "Command Overlays," use Glassmorphism:
*   **Fill:** `surface-container` at 70% opacity.
*   **Effect:** Backdrop blur (20px–40px).
*   **Impact:** This ensures the "Command Center" feels like a unified, high-tech interface rather than a collection of flat boxes.

## 3. Typography: The Pretendard Scale

We have transitioned to **Pretendard** to provide a more technical, sans-serif precision. It offers superior legibility in high-density data environments.

*   **Display (lg/md):** Reserved for mission-critical metrics or high-level status summaries. Use `primary` or `on-surface` with tight letter spacing (-0.02em).
*   **Headline (lg/md/sm):** Used for primary module titles. Headlines should feel editorial—bold and unapologetic.
*   **Body (lg/md/sm):** The workhorse for data logs and descriptions. Ensure `body-md` (0.875rem) is the default for readability.
*   **Label (md/sm):** Used for metadata, timestamps, and micro-copy. These should often use `on-surface-variant` (#aaabad) to recede visually, keeping the focus on the data itself.

## 4. Elevation & Depth: Tonal Layering

We reject traditional shadows in favor of **Ambient Luminance**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-highest` card placed on a `surface-dim` background creates a natural, sharp lift.
*   **Ambient Shadows:** When a floating state is required (e.g., a modal or dropdown), use a massive blur (40px+) at a very low opacity (6%) using the `surface-tint` color. This creates a "glow" rather than a "shadow," fitting the command center aesthetic.
*   **The Ghost Border:** If a containment line is strictly required for accessibility, use `outline-variant` (#46484a) at 15% opacity. It should be felt, not seen.

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (#d9fd53) with `on-primary` (#4e5f00) text. Sharp `md` (0.375rem) corners.
*   **Secondary:** Ghost style. `outline` color for the label, with a `surface-container-high` background on hover.
*   **Tactical:** Small, icon-only buttons using `primary-container` background for rapid-fire actions.

### Cards & Data Modules
*   **Constraint:** Zero divider lines.
*   **Separation:** Use `surface-container-lowest` (#000000) for the card background to "sink" the content into the interface, creating a high-contrast bezel effect.
*   **Padding:** Strict adherence to `spacing.6` (1.3rem) for internal card padding to maintain the "clean and structured" requirement.

### Input Fields
*   **Base:** `surface-container-highest` background.
*   **Active State:** No change in background color; instead, use a 1px `primary` ghost-border (at 50% opacity) and a subtle `primary` outer glow.
*   **Error:** Use `error` (#ff7351) text and an `error-container` (#b92902) background at 10% opacity for the input field.

### Status Chips
*   Use `full` (9999px) roundedness. 
*   **Critical:** `error_container` background with `on_error_container` text.
*   **Operational:** `primary_container` background with `on_primary_container` text.

## 6. Do's and Don'ts

### Do
*   **Do** use `primary` (#DBFF55) sparingly. It is a laser, not a paint brush. Use it to draw the eye to the most important action or data point.
*   **Do** leverage the `surface-container` tiers to create hierarchy.
*   **Do** use "Pretendard" Medium for labels and Bold for headlines to create clear distinction.
*   **Do** ensure all interactive elements have a clear `surface-bright` hover state.

### Don't
*   **Don't** use 100% white (#FFFFFF). Use `on-surface` (#eeeef0) to reduce eye strain in the dark-mode command center.
*   **Don't** use 1px solid borders to separate sections. Use spacing and background shifts.
*   **Don't** use standard "drop shadows." Use ambient tonal glows or simply rely on color contrast.
*   **Don't** overcrowd the grid. Enterprise doesn't mean "crammed." Respect the `Spacing Scale` to allow the user's eye to navigate the "high-stakes" data without fatigue.