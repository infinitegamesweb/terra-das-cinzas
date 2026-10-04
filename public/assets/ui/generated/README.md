# UI generated with Cloudflare Workers AI

These PNG assets were generated with `@cf/black-forest-labs/flux-2-klein-9b`, using the existing `public/assets/ui/new_gui/preview_2.png` as a style reference. The revised palette uses charcoal, ash grey and restrained antique gold. Raw model outputs are preserved under `art-staging/cloudflare/`; `tools/prepare_ui_asset.py` removes the flat magenta backdrop and trims only the button and portrait margins.

- `ashes-panel-frame.png` (512×512): empty reusable dark iron and aged bronze window frame, with no text or interior symbols.
- `ashes-button-frame.png` (325×130): blank dark iron and brass button frame for top navigation, tabs and actions.
- `errant-adventurer-portrait.png` (412×423): class-neutral hooded player avatar for the HUD.

CSS nine-slice (`border-image`) keeps the frame corners while HTML keeps live text and click targets. UI surfaces use ash and charcoal; the forest colors remain in the world artwork.

Regeneration prompts are in `art-staging/cloudflare/generation-prompts.md`. `tools/generate_cloudflare_asset.py` reads `CLOUDFLARE_API_TOKEN` and supports up to four reference images per request.
