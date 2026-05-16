# Bulk update template

One row per bundle. Save as CSV (UTF-8) and re-upload, or open the
`Listing Generator.html` sidebar and use **Import bulk update**.

## Rules
- `Bundle ID` (PL01, PR05, UL08, etc) is the merge key.
- Empty cells keep the existing value. Non-empty cells overwrite.
- Use `\n` for line breaks inside labels (e.g. `Optimized\nPages`).
- Icon columns accept any key from `Icon Library.html` (case-insensitive):
  template, modules, newtemplate, edit, layout, simple, checklist,
  download, stack, files, share, settings, calendar, link, star, nav.
- Image URLs must be CORS-fetchable (the cloudfront ones in your master mapping work).

## Tier values
Core · Plus · Pro · Ultimate. Determines bg + accent palette.

## Columns
183 total. See the first row of the template for the order.
