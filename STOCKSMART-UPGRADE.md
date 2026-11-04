# StockSmart v6 Upgrade (branch: stocksmart-complete-upgrade)

## Rollback point
- Base: `main` at commit `2b15123` ("Update service-worker.js")
- Original files preserved in concept: `index.html`, `manifest.json`, `service-worker.js`, `icon.png`
- Original inventory storage keys are unchanged:
  `stocksmart_items_v5_current_20260614T153640`,
  `stocksmart_shopping_v5_current_20260614T153640`,
  `stocksmart_next_id_v5_current_20260614T153640`
- The built-in starter list still has 320 entries. New v6 data uses separate keys
  (`stocksmart_v6_history`, `stocksmart_v6_sessions`, `stocksmart_v6_recipes`,
  `stocksmart_v6_planner`, `stocksmart_v6_settings`, `stocksmart_v6_corrections`,
  `stocksmart_v6_trash`), so old backups still restore.

## Audit findings (actual code, not assumed)
- Single-page HTML/CSS/JS PWA, ZXing barcode scanning, Open Food Facts lookup.
- Already present before v6: mobile card view, continuous-scan toggle that
  reopens the scanner after save, scan-to-add and scan-to-check, location
  inference, opened dates, grouped inventory, shopping list, meal ideas from
  templates, favorites, backup/restore/recover, hamburger-style menu modal,
  clickable dashboard cards.
- Missing or weak before v6: no addition history, no shopping sessions,
  no editable recipe library, no persistent 7-day planner, fixed 14-day
  expiring threshold, restore replaced data with no confirmation and no
  version check, backup omitted favorites/history/recipes/planner/settings,
  service worker was cache-first with no update prompt, save dropped the
  barcode on edit, inventory rows had no quick +/- quantity buttons, and
  no unit field.

## What v6 adds
### Milestone 1: Inventory and shopping
- Quick +/- quantity buttons on inventory rows. Grouped rows adjust the
  soonest-expiring batch first, never below zero, with confirmation when a
  batch is used up.
- Unit field (Each, Package, Box, Bottle, Can, Bag, Pound, Ounce), barcode
  field, and "use within X days after opening" field on the item form.
  The calculated use-by-after-opening date is stored when both are present.
- Duplicate-scan protection: the same barcode within 3 seconds is ignored.
- Remembered location corrections by barcode and by product name, applied
  on the next scan.
- Addition History (menu): pick any date, see product, quantity, unit,
  location, expiration, time, barcode, and source.
- Shopping Sessions (menu): start a session, add by scan or manually,
  finish it, and review unique products, total quantity, scanned vs manual
  entries, and every entry. Sessions are preserved after finishing.
- Saving a new inventory item marks a matching shopping-list item as
  Bought (it is not removed, so a mistaken match stays visible).
- Batches view (Settings): products with more than one expiration date
  are listed batch by batch. Adding the same product with a different
  expiration date already created a separate entry; v6 makes that visible.

### Milestone 2: Meal planning and recipes
- Editable recipe library (menu): add, edit, delete, favorite, category
  (Breakfast, Lunch, Dinner, Snacks), servings, prep time, ingredients as
  "name | qty | unit" lines, and instructions. Three starter recipes are
  seeded: Buttered Noodles with Parmesan, Grilled Cheese, Mac and Cheese.
- Inventory-aware matching: Ready to Make, Missing Ingredients, or Use Soon,
  with on-hand vs missing per ingredient. Matching is name-based and
  conservative; it does not claim an ingredient is available when the
  quantity is short.
- Seven-day planner (menu): assign a recipe to Monday through Sunday.
  A "Use soon" note lists items expiring within the threshold.
- Add missing ingredients to the shopping list, deduplicated against
  items already marked Needed.
- Made This Meal: shows proposed deductions, asks for confirmation, then
  deducts from the oldest batches first and removes batches that hit zero.

### Milestone 3: Polish and reliability
- Hamburger menu now includes Dashboard-adjacent sections: Addition
  History, Shopping Session, Recipes, Meal Planner, Settings, plus the
  existing Scan, Add Item, Shopping List, Backup, Restore, Recover, Deals,
  Family Sync, and Install Help.
- Dashboard cards were already clickable and compact on mobile; v6 keeps
  them and adds compact qty controls.
- Backup is now versioned (`stocksmart-v6`, app 6.0.0) and includes
  favorites, history, sessions, recipes, planner, settings, corrections,
  and trash, in addition to inventory, shopping list, and next id.
- Restore validates that a backup contains an inventory array, asks for
  confirmation before replacing current data, and restores v6 fields when
  present. Old (v5) backups still restore inventory and shopping only.
- Recover still reloads the built-in starter list, with its existing
  confirmation.
- Deleted items go to trash (Settings) and can be restored.
- Expiring-soon threshold is configurable in Settings (3, 5, 7, 14, 30 days).
- Service worker cache is now `stocksmart-v6-0-0`, supports SKIP_WAITING,
  and uses network-first for the app page so a new deployment is not hidden
  behind the old cached page. Other cached assets stay cache-first for
  offline use. The app shows a "New version available, Refresh to update"
  banner when a new worker is waiting.
- No paid APIs, no accounts, no remote database were added.

## Tests run (2026-11-03)
- `node --check` passes for both inline scripts and for
  `service-worker.js`.
- jsdom runtime test passes: page loads, dashboard total is 320,
  original items key is preserved with 320 entries, new menu buttons and
  form fields exist, recipe seed and matching work, history logging works,
  a shopping session starts, captures additions, and ends.
- jsdom save test passes: a manual save goes from 320 to 321, the saved
  item keeps barcode `012345678905` and unit `Each`, and history logs it.
- Not tested on a physical iPhone, and iPhone camera scanning was not
  verified on a device. That is the main remaining verification step
  before merging.

## How to test on iPhone (after GitHub Pages deploys this branch)
1. Open the Pages URL for this branch, or preview the branch build.
2. Check the dashboard still shows your existing inventory, not just the
   starter list, after you restore your own backup if needed.
3. Menu: Addition History, pick today, add an item, confirm it appears.
4. Menu: Shopping Session, start, scan or add two items, finish, review
   the summary.
5. Menu: Recipes, view Buttered Noodles, add missing to shopping, then
   Made This Meal with a test item, confirm the oldest batch drops first.
6. Menu: Settings, change the expiring threshold, restore a deleted item
   from trash.
7. Backup, then Restore with a test file, confirm the replace prompt appears.
8. After a new deploy, confirm the update banner appears instead of the
   old version sticking.

## Not merged
This branch is for review only. Do not merge into `main` until Mary
approves after the iPhone checks above.
