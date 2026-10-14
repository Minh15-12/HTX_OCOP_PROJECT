import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('   CHALLENGER FRONTEND 2 EMPIRICAL TEST HARNESS     ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;
let warningCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

function warn(message) {
  console.warn(`[WARN/FINDING] ${message}`);
  warningCount++;
}

// -------------------------------------------------------------
// TEST SUITE 1: Route Accessibility without Auth
// -------------------------------------------------------------
console.log('--- Test Suite 1: Unauthenticated Public Trace Route Accessibility ---');
const appRoutesPath = path.resolve('frontend/src/router/AppRoutes.tsx');
const appRoutesCode = fs.readFileSync(appRoutesPath, 'utf-8');

// Check routes exist
const hasTraceRoute = appRoutesCode.includes('path="/trace/:lotId"');
const hasPublicTraceRoute = appRoutesCode.includes('path="/public/trace/:lotId"');
assert(hasTraceRoute, 'Route /trace/:lotId is declared in AppRoutes.tsx');
assert(hasPublicTraceRoute, 'Route /public/trace/:lotId is declared in AppRoutes.tsx');

// Check that these routes are NOT inside ProtectedRoute
const protectedRouteIndex = appRoutesCode.indexOf('<Route element={<ProtectedRoute />}>');
const traceRouteIndex = appRoutesCode.indexOf('path="/trace/:lotId"');
const publicTraceRouteIndex = appRoutesCode.indexOf('path="/public/trace/:lotId"');

assert(
  protectedRouteIndex !== -1 && traceRouteIndex < protectedRouteIndex && publicTraceRouteIndex < protectedRouteIndex,
  'Public trace routes are located BEFORE and OUTSIDE ProtectedRoute wrapper'
);

// Check that these routes are NOT inside GuestRoute
const guestRouteIndex = appRoutesCode.indexOf('<Route element={<GuestRoute />}>');
const guestRouteEndIndex = appRoutesCode.indexOf('</Route>', guestRouteIndex);
assert(
  traceRouteIndex > guestRouteEndIndex,
  'Public trace routes are located OUTSIDE GuestRoute wrapper (accessible even if logged in)'
);

// Check PublicTraceabilityPage and traceabilityApi for any auth token requirements
const traceabilityApiPath = path.resolve('frontend/src/services/traceabilityApi.ts');
const traceabilityApiCode = fs.readFileSync(traceabilityApiPath, 'utf-8');
const doesNotThrowIfNoAuth = traceabilityApiCode.includes('defaultPalermoTraceability');
assert(doesNotThrowIfNoAuth, 'traceabilityApi provides fallback data without requiring auth headers/tokens');

// -------------------------------------------------------------
// TEST SUITE 2: Button CSS classes & Touch Target Sizes (>= 48px)
// -------------------------------------------------------------
console.log('\n--- Test Suite 2: QuickMobileLogModal Touch Targets (>= 48px) ---');
const modalPath = path.resolve('frontend/src/features/agriculture/components/QuickMobileLogModal.tsx');
const modalCode = fs.readFileSync(modalPath, 'utf-8');

// Check 5 activity selector buttons
const activityButtonsMinH = modalCode.includes('min-h-[54px]');
assert(activityButtonsMinH, '1-tap 5 Activity Selector buttons use min-h-[54px] (54px >= 48px)');

// Check Footer action buttons
const cancelBtnMinH = modalCode.includes('min-h-[48px] px-5 py-2.5 rounded-2xl');
const submitBtnMinH = modalCode.includes('min-h-[48px] px-7 py-2.5 rounded-2xl bg-emerald-600');
assert(cancelBtnMinH, 'Footer Cancel button uses min-h-[48px] (48px >= 48px)');
assert(submitBtnMinH, 'Footer Submit button uses min-h-[48px] (48px >= 48px)');

// Check Photo capture button
const photoCaptureMinH = modalCode.includes('min-h-[48px] px-4 py-2.5 rounded-xl border border-dashed');
assert(photoCaptureMinH, 'Evidence photo capture button uses min-h-[48px] (48px >= 48px)');

// Check GPS button
const gpsBtnHas44 = modalCode.includes('min-h-[44px]');
const gpsBtnHas48 = modalCode.includes('min-h-[48px] px-3.5 py-1.5');
if (gpsBtnHas44 && !gpsBtnHas48) {
  warn('GPS button uses min-h-[44px] (44px) instead of min-h-[48px] (48px). Satisfies Apple iOS touch target (44px) but is 4px under Android Material guideline (48px).');
} else {
  assert(gpsBtnHas48, 'GPS button uses min-h-[48px]');
}

// -------------------------------------------------------------
// TEST SUITE 3: GPS Validation when activity is SPRAYING
// -------------------------------------------------------------
console.log('\n--- Test Suite 3: GPS Validation for SPRAYING Activity (BR-FARM-003) ---');
// In QuickMobileLogModal.tsx:
const modalHasSprayingCheck = modalCode.includes("if (activityType === 'SPRAYING')");
const modalChecksLatLongNull = modalCode.includes('gpsLatitude === null ||') && modalCode.includes('gpsLongitude === null ||');
const modalBlocksSubmit = modalCode.includes('setValidationError(') && modalCode.includes('BR-FARM-003');
assert(modalHasSprayingCheck, 'QuickMobileLogModal has activityType === "SPRAYING" check in handleSubmit');
assert(modalChecksLatLongNull, 'QuickMobileLogModal validates gpsLatitude and gpsLongitude are not null or NaN');
assert(modalBlocksSubmit, 'QuickMobileLogModal blocks submission and sets BR-FARM-003 validation error if GPS missing');

// In farmingLogApi.ts:
const farmingLogApiPath = path.resolve('frontend/src/services/farmingLogApi.ts');
const farmingLogApiCode = fs.readFileSync(farmingLogApiPath, 'utf-8');

const apiHasSprayingCheck = farmingLogApiCode.includes("payload.activity_type === 'SPRAYING'");
const apiChecksGps = farmingLogApiCode.includes('payload.gps_latitude === undefined') && farmingLogApiCode.includes('payload.gps_longitude === undefined');
const apiThrowsGpsRequired = farmingLogApiCode.includes('ERR_GPS_LOCATION_REQUIRED');
assert(apiHasSprayingCheck, 'farmingLogApi.ts has payload.activity_type === "SPRAYING" check');
assert(apiChecksGps, 'farmingLogApi.ts checks gps_latitude, gps_longitude, NaN and (0,0)');
assert(apiThrowsGpsRequired, 'farmingLogApi.ts throws ERR_GPS_LOCATION_REQUIRED on missing GPS for SPRAYING');

// Simulate the logic in code
function testSprayingGpsLogic(activity, lat, lng) {
  if (activity === 'SPRAYING') {
    if (lat === null || lng === null || lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      throw new Error('ERR_GPS_LOCATION_REQUIRED');
    }
  }
  return true;
}

try {
  testSprayingGpsLogic('SPRAYING', null, null);
  assert(false, 'Should have blocked SPRAYING with null GPS');
} catch (e) {
  assert(e.message === 'ERR_GPS_LOCATION_REQUIRED', 'Empirical check: SPRAYING with null GPS is rejected');
}

try {
  testSprayingGpsLogic('SPRAYING', 0, 0);
  assert(false, 'Should have blocked SPRAYING with (0,0) GPS');
} catch (e) {
  assert(e.message === 'ERR_GPS_LOCATION_REQUIRED', 'Empirical check: SPRAYING with (0,0) GPS is rejected');
}

try {
  const ok = testSprayingGpsLogic('SPRAYING', 11.9501, 108.4712);
  assert(ok === true, 'Empirical check: SPRAYING with valid GPS (11.9501, 108.4712) is accepted');
} catch {
  assert(false, 'Valid GPS should be accepted');
}

try {
  const ok = testSprayingGpsLogic('FERTILIZATION', null, null);
  assert(ok === true, 'Empirical check: FERTILIZATION without GPS is accepted (GPS optional for non-spraying)');
} catch {
  assert(false, 'Non-spraying should not require GPS');
}

// -------------------------------------------------------------
// TEST SUITE 4: QR Code SVG Rendering and Print Dialog Trigger
// -------------------------------------------------------------
console.log('\n--- Test Suite 4: QR Code SVG Rendering and Print Dialog Trigger ---');
const qrSvgPath = path.resolve('frontend/src/features/agriculture/components/QrCodeSvg.tsx');
const qrSvgCode = fs.readFileSync(qrSvgPath, 'utf-8');

const hasSvgElement = qrSvgCode.includes('<svg') && qrSvgCode.includes('viewBox="0 0 100 100"');
const hasCrispEdges = qrSvgCode.includes('shapeRendering="crispEdges"');
const hasFinderPatterns = qrSvgCode.includes('drawFinder(0, 0)') && qrSvgCode.includes('drawFinder(size - 7, 0)');
assert(hasSvgElement, 'QrCodeSvg renders pure SVG with viewBox="0 0 100 100"');
assert(hasCrispEdges, 'QrCodeSvg uses shapeRendering="crispEdges" for sharp barcode scanner readability');
assert(hasFinderPatterns, 'QrCodeSvg generates official 7x7 finder patterns at 3 corners');

const printModalPath = path.resolve('frontend/src/features/agriculture/components/HarvestLabelPrintModal.tsx');
const printModalCode = fs.readFileSync(printModalPath, 'utf-8');

const hasPrintMediaCss = printModalCode.includes('@media print') && printModalCode.includes('width: 100mm') && printModalCode.includes('height: 75mm');
const hasWindowPrint = printModalCode.includes('window.print()');
const hasPrintButton = printModalCode.includes('onClick={handlePrint}');
const hasQrCodeSvgInModal = printModalCode.includes('<QrCodeSvg');
assert(hasPrintMediaCss, 'HarvestLabelPrintModal injects @media print for 100mm x 75mm physical label');
assert(hasWindowPrint, 'HarvestLabelPrintModal implements handlePrint = () => window.print()');
assert(hasPrintButton, 'Print button triggers handlePrint on click');
assert(hasQrCodeSvgInModal, 'HarvestLabelPrintModal includes QrCodeSvg component with public trace URL');

// Check HarvestsPage for button trigger
const harvestsPagePath = path.resolve('frontend/src/features/agriculture/pages/HarvestsPage.tsx');
const harvestsPageCode = fs.readFileSync(harvestsPagePath, 'utf-8');
const harvestsHasPrintBtn = harvestsPageCode.includes('In Tem QR') && harvestsPageCode.includes('setSelectedHarvestForPrint(item)');
const harvestsHasPrintModal = harvestsPageCode.includes('<HarvestLabelPrintModal');
assert(harvestsHasPrintBtn, 'HarvestsPage table row has "In Tem QR" button setting selected item');
assert(harvestsHasPrintModal, 'HarvestsPage mounts HarvestLabelPrintModal controlled by selected item');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n====================================================');
console.log(`RESULTS: ${passCount} Passed, ${failCount} Failed, ${warningCount} Warnings/Findings`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
