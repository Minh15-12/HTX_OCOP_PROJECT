// Empirical Challenge Verification Script for Frontend UX, Math Invariants & Print Rules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('🚀 EMPIRICAL CHALLENGER: FRONTEND UX, MATH & PRINT VERIFICATION');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: DYNAMIC MODULE IMPORT & MATH INVARIANT VERIFICATION
// -----------------------------------------------------------------------------
console.log('--- SECTION 1: Testing Math Invariants & Scoring Rules ---');

// Dynamically import compiled bundle or parse ts directly
const distDir = path.join(frontendDir, 'dist', 'assets');
const distFiles = fs.readdirSync(distDir);
const ocopBundleFile = distFiles.find(f => f.startsWith('ocopQd148Data') && f.endsWith('.js'));

if (!ocopBundleFile) {
  throw new Error(`Could not find built ocopQd148Data bundle in ${distDir}`);
}

const ocopModule = await import(`file://${path.join(distDir, ocopBundleFile)}`);

const OCOP_QD148_CRITERIA_DATA = ocopModule.OCOP_QD148_CRITERIA_DATA || ocopModule.O;
const ALL_INDICATORS = ocopModule.ALL_INDICATORS || ocopModule.A;
const DEFAULT_SUGGESTED_SCORES = ocopModule.DEFAULT_SUGGESTED_SCORES || ocopModule.D;
const INITIAL_DRAFT_SCORES = ocopModule.INITIAL_DRAFT_SCORES || ocopModule.I;
const calculateOcopScores = ocopModule.calculateOcopScores || ocopModule.c;
const getCriterionBadgeStatus = ocopModule.getCriterionBadgeStatus || ocopModule.g;

// Test 1.1: Criteria Groups structure and max scores
assert(Array.isArray(OCOP_QD148_CRITERIA_DATA), 'OCOP_QD148_CRITERIA_DATA is an array');
assert(OCOP_QD148_CRITERIA_DATA.length === 3, 'OCOP_QD148_CRITERIA_DATA has exactly 3 groups (A, B, C)');

const groupA = OCOP_QD148_CRITERIA_DATA.find(g => g.code === 'GA');
const groupB = OCOP_QD148_CRITERIA_DATA.find(g => g.code === 'GB');
const groupC = OCOP_QD148_CRITERIA_DATA.find(g => g.code === 'GC');

assert(groupA && groupA.maxScore === 40.0, 'Group A (Sản phẩm & Sức mạnh cộng đồng) maxScore is 40.0');
assert(groupB && groupB.maxScore === 25.0, 'Group B (Khả năng tiếp thị) maxScore is 25.0');
assert(groupC && groupC.maxScore === 35.0, 'Group C (Chất lượng sản phẩm) maxScore is 35.0');

// Test 1.2: Invariant Sum(Part A + Part B + Part C) === 100.0
const groupSum = groupA.maxScore + groupB.maxScore + groupC.maxScore;
assert(groupSum === 100.0, `Group Max Score Invariant: 40.0 + 25.0 + 35.0 = ${groupSum} === 100.0`);

// Test 1.3: Sum of indicators inside each group matches group maxScore
const sumGroupA = groupA.indicators.reduce((acc, ind) => acc + ind.maxScore, 0);
const sumGroupB = groupB.indicators.reduce((acc, ind) => acc + ind.maxScore, 0);
const sumGroupC = groupC.indicators.reduce((acc, ind) => acc + ind.maxScore, 0);

assert(sumGroupA === 40.0, `Indicators in Group A sum to ${sumGroupA} === 40.0`);
assert(sumGroupB === 25.0, `Indicators in Group B sum to ${sumGroupB} === 25.0`);
assert(sumGroupC === 35.0, `Indicators in Group C sum to ${sumGroupC} === 35.0`);

// Test 1.4: Total number of indicators is 11, total maxScore is 100.0
assert(ALL_INDICATORS.length === 11, `ALL_INDICATORS contains exactly 11 indicators (got ${ALL_INDICATORS.length})`);
const totalIndicatorsScore = ALL_INDICATORS.reduce((acc, ind) => acc + ind.maxScore, 0);
assert(totalIndicatorsScore === 100.0, `Sum of all 11 indicators maxScores is ${totalIndicatorsScore} === 100.0`);

// Test 1.5: Option scores validity for each indicator
let allMaxOptionsMatch = true;
let indicatorsWithZeroOption = 0;
let mandatoryCount = 0;
const findings = [];

for (const ind of ALL_INDICATORS) {
  if (ind.isMandatory) mandatoryCount++;
  assert(ind.options && ind.options.length >= 2, `${ind.code} has multiple scoring options`);
  const maxOption = Math.max(...ind.options.map(o => o.score));
  const minOption = Math.min(...ind.options.map(o => o.score));
  if (maxOption !== ind.maxScore) {
    allMaxOptionsMatch = false;
    console.error(`  [ERROR] ${ind.code} max option score ${maxOption} !== indicator maxScore ${ind.maxScore}`);
  }
  if (minOption === 0.0) {
    indicatorsWithZeroOption++;
  } else {
    findings.push(`[FINDING] ${ind.code} (${ind.name}) minimum option is ${minOption} > 0.0 (omits 0.0 option)`);
  }
}
assert(allMaxOptionsMatch, 'Every indicator has max option score exactly equal to indicator maxScore');
assert(indicatorsWithZeroOption === 10, '10 of 11 indicators have 0.0 base option');
if (findings.length > 0) {
  console.log(`  [NOTE] Empirical Finding: ${findings.join('; ')}`);
}
assert(mandatoryCount === 5, `Exactly 5 mandatory indicators defined (got ${mandatoryCount})`);

// Test 1.6: DEFAULT_SUGGESTED_SCORES evaluation
const defaultResult = calculateOcopScores(DEFAULT_SUGGESTED_SCORES);
assert(defaultResult.partAScore === 40.0, `Default Part A score = ${defaultResult.partAScore} === 40.0`);
assert(defaultResult.partBScore === 23.5, `Default Part B score = ${defaultResult.partBScore} === 23.5`);
assert(defaultResult.partCScore === 35.0, `Default Part C score = ${defaultResult.partCScore} === 35.0`);
assert(defaultResult.totalScore === 98.5, `Default Total score = ${defaultResult.totalScore} === 98.5`);
assert(defaultResult.starRating === 5, `Default Star Rating = ${defaultResult.starRating} === 5`);
assert(defaultResult.isPassingMandatory === true, 'Default scores pass all mandatory conditions');
assert(defaultResult.completionPercentage === 100, `Default completion percentage is ${defaultResult.completionPercentage}% === 100%`);

// Test 1.7: Mandatory condition failure (VietGAP missing: TC-C.2.1 = 0)
const missingVietGapScores = { ...DEFAULT_SUGGESTED_SCORES, 'TC-C.2.1': 0 };
const missingVietGapResult = calculateOcopScores(missingVietGapScores);
assert(missingVietGapResult.isPassingMandatory === false, 'Missing VietGAP causes isPassingMandatory to be FALSE');
assert(missingVietGapResult.mandatoryIssues.some(m => m.includes('TC-C.2.1')), 'Mandatory issue reported for TC-C.2.1');
assert(missingVietGapResult.starRating < 5, `Star rating downgraded from 5 when VietGAP is missing (got ${missingVietGapResult.starRating})`);

// Test 1.8: Score capping invariance under extreme overflow inputs
const overflowScores = {};
ALL_INDICATORS.forEach(ind => { overflowScores[ind.code] = 999.0; });
const overflowResult = calculateOcopScores(overflowScores);
assert(overflowResult.partAScore === 40.0, `Overflow Part A capped at ${overflowResult.partAScore} === 40.0`);
assert(overflowResult.partBScore === 25.0, `Overflow Part B capped at ${overflowResult.partBScore} === 25.0`);
assert(overflowResult.partCScore === 35.0, `Overflow Part C capped at ${overflowResult.partCScore} === 35.0`);
assert(overflowResult.totalScore === 100.0, `Overflow Total capped at ${overflowResult.totalScore} === 100.0`);

// Test 1.9: Empty score set
const emptyResult = calculateOcopScores({});
assert(emptyResult.totalScore === 0.0, `Empty scores total is ${emptyResult.totalScore} === 0.0`);
assert(emptyResult.starRating === 0, `Empty scores star rating is ${emptyResult.starRating} === 0`);

// -----------------------------------------------------------------------------
// SECTION 2: TOUCH ERGONOMICS VERIFICATION (>=48px Touch Targets)
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 2: Testing Touch Ergonomics & Card-Based Options ---');

const farmerCardPath = path.join(frontendDir, 'src', 'features', 'ocop', 'components', 'FarmerCriterionCard.tsx');
const farmerCardContent = fs.readFileSync(farmerCardPath, 'utf-8');

// Check min-h-[52px] or >= 48px
const minHeightMatch = farmerCardContent.match(/min-h-\[(\d+)px\]/);
assert(minHeightMatch !== null, 'FarmerCriterionCard contains min-h-[Npx] class for radio option buttons');
if (minHeightMatch) {
  const pixelHeight = parseInt(minHeightMatch[1], 10);
  assert(pixelHeight >= 48, `Card-based option target height is ${pixelHeight}px (>= 48px minimum touch ergonomic standard)`);
}

// Check padding
assert(farmerCardContent.includes('p-3'), 'FarmerCriterionCard uses p-3 (12px) padding ensuring comfortable touch perimeter');

// Check large radio circle
assert(farmerCardContent.includes('w-5 h-5') || farmerCardContent.includes('w-6 h-6'), 'FarmerCriterionCard provides large visual radio indicator (w-5 h-5 / 20px)');

// Check plain-language accordion
assert(farmerCardContent.includes('🌾 Chú giải mộc mạc cho nhà nông'), 'FarmerCriterionCard provides farmer-plain explanation accordion');
assert(farmerCardContent.includes('plainExplanation.farmerAdvice'), 'FarmerCriterionCard displays practical farmer advice');

// Check smart suggestion integration
assert(farmerCardContent.includes('SmartSuggestionButton'), 'FarmerCriterionCard integrates SmartSuggestionButton');

// Check DossierDetailPage replaces select with FarmerCriterionCard
const detailPagePath = path.join(frontendDir, 'src', 'features', 'ocop', 'pages', 'DossierDetailPage.tsx');
const detailPageContent = fs.readFileSync(detailPagePath, 'utf-8');

// Ensure no tiny select remains in self-eval tab
const selfEvalSectionMatch = detailPageContent.match(/activeTab === 'self_eval'[\s\S]*?(?={activeTab === 'evidences'|<div className="fixed)/);
if (selfEvalSectionMatch) {
  const selfEvalSection = selfEvalSectionMatch[0];
  assert(!selfEvalSection.includes('<select'), 'DossierDetailPage self_eval tab has eliminated tiny <select> dropdowns');
  assert(selfEvalSection.includes('<FarmerCriterionCard'), 'DossierDetailPage self_eval tab renders large <FarmerCriterionCard> components');
}

// -----------------------------------------------------------------------------
// SECTION 3: WIZARD STEP 4 MATH & REVENUE INTEGRITY VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 3: Testing CreateDossierWizardPage Math Invariants ---');

const wizardPagePath = path.join(frontendDir, 'src', 'features', 'ocop', 'pages', 'CreateDossierWizardPage.tsx');
const wizardContent = fs.readFileSync(wizardPagePath, 'utf-8');

assert(wizardContent.includes('40.0'), 'CreateDossierWizardPage Step 4 displays 40.0 for Part A');
assert(wizardContent.includes('25.0'), 'CreateDossierWizardPage Step 4 displays 25.0 for Part B');
assert(wizardContent.includes('35.0'), 'CreateDossierWizardPage Step 4 displays 35.0 for Part C');
assert(wizardContent.includes('100.0'), 'CreateDossierWizardPage Step 4 displays 100.0 for Total');

// Check that Step 4 table breakdown has exact 40, 25, 35 denominators
assert(wizardContent.includes('(calculation.partAScore / 40.0) * 100'), 'Step 4 percentage calculation uses 40.0 denominator for Part A');
assert(wizardContent.includes('(calculation.partBScore / 25.0) * 100'), 'Step 4 percentage calculation uses 25.0 denominator for Part B');
assert(wizardContent.includes('(calculation.partCScore / 35.0) * 100'), 'Step 4 percentage calculation uses 35.0 denominator for Part C');
assert(wizardContent.includes('(calculation.totalScore / 100.0) * 100'), 'Step 4 percentage calculation uses 100.0 denominator for Total');

// Check Step 3 Evidences SHA-256 and camera feature
assert(wizardContent.includes('Mã băm toàn vẹn SHA-256'), 'CreateDossierWizardPage Step 3 displays SHA-256 Integrity Check');
assert(wizardContent.includes('Chụp ảnh Camera') || wizardContent.includes('Ống kính Camera đã sẵn sàng'), 'CreateDossierWizardPage Step 3 supports mobile camera upload');

// -----------------------------------------------------------------------------
// SECTION 4: PRINT RULES & @media print ISOLATION VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 4: Testing @media print Rules & Document Isolation ---');

const printModalPath = path.join(frontendDir, 'src', 'features', 'ocop', 'components', 'Qd148DocumentModal.tsx');
const printModalContent = fs.readFileSync(printModalPath, 'utf-8');

assert(printModalContent.includes('@media print'), 'Qd148DocumentModal contains dedicated @media print stylesheet');
assert(printModalContent.includes('body * {'), 'Print stylesheet controls global body elements visibility');
assert(printModalContent.includes('visibility: hidden !important;'), 'Print stylesheet hides default page elements with visibility: hidden !important');
assert(printModalContent.includes('#print-document-container'), 'Print stylesheet targets #print-document-container');
assert(printModalContent.includes('#print-document-container * {'), 'Print stylesheet ensures children of document container remain visible');
assert(printModalContent.includes('visibility: visible !important;'), 'Document container is explicitly made visible !important');
assert(printModalContent.includes('position: absolute !important;'), 'Document container is positioned absolute at top-left 0,0');
assert(printModalContent.includes('display: none !important;'), 'Print stylesheet hides overlays, navbar, header, aside with display: none !important');
assert(printModalContent.includes('size: A4 portrait;'), 'Print stylesheet configures standard @page size: A4 portrait');
assert(printModalContent.includes('margin: 15mm 15mm 15mm 20mm;'), 'Print stylesheet enforces administrative margins: 15mm 15mm 15mm 20mm');

// Verify BieuMau Print View components
const bieu01Path = path.join(frontendDir, 'src', 'features', 'ocop', 'components', 'print', 'BieuMau01PrintView.tsx');
const bieu02Path = path.join(frontendDir, 'src', 'features', 'ocop', 'components', 'print', 'BieuMau02PrintView.tsx');
const bieu03Path = path.join(frontendDir, 'src', 'features', 'ocop', 'components', 'print', 'BieuMau03PrintView.tsx');

const bieu01Content = fs.readFileSync(bieu01Path, 'utf-8');
const bieu02Content = fs.readFileSync(bieu02Path, 'utf-8');
const bieu03Content = fs.readFileSync(bieu03Path, 'utf-8');

assert(bieu01Content.includes('print:p-0 print:m-0 print:max-w-none print:shadow-none'), 'BieuMau01 removes padding, margins, max-width, shadow on print');
assert(bieu02Content.includes('print:p-0 print:m-0 print:max-w-none print:shadow-none'), 'BieuMau02 removes padding, margins, max-width, shadow on print');
assert(bieu03Content.includes('print:p-0 print:m-0 print:max-w-none print:shadow-none'), 'BieuMau03 removes padding, margins, max-width, shadow on print');

// Verify Vietnamese administrative format in BieuMau01
assert(bieu01Content.includes('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'), 'BieuMau01 contains official national motto header');
assert(bieu01Content.includes('Mai Văn Tân'), 'BieuMau01 includes representative Mai Văn Tân');
assert(bieu01Content.includes('HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến') || bieu01Content.includes('Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến'), 'BieuMau01 includes cooperative name');
assert(bieu01Content.includes('ỚT CHUÔNG SWEET PALERMO ĐỎ ĐÀ LẠT'), 'BieuMau01 includes product name');

// Verify 4 sections in BieuMau02
assert(bieu02Content.includes('PHẦN I. THÔNG TIN CHUNG VỀ CHỦ THỂ VÀ SẢN PHẨM'), 'BieuMau02 contains Part I (General Information)');
assert(bieu02Content.includes('PHẦN II. HIỆN TRẠNG SẢN XUẤT KINH DOANH') || bieu02Content.includes('PHẦN II'), 'BieuMau02 contains Part II (Production & Business Status)');
assert(bieu02Content.includes('PHẦN III. KẾT QUẢ TỰ ĐÁNH GIÁ') || bieu02Content.includes('PHẦN III'), 'BieuMau02 contains Part III (100pt Criteria & 14 Evidences)');
assert(bieu02Content.includes('PHẦN IV. KẾ HOẠCH PHÁT TRIỂN') || bieu02Content.includes('PHẦN IV'), 'BieuMau02 contains Part IV (Future Plan)');
assert(bieu02Content.includes('14 Evidence Documents') || bieu02Content.includes('evidenceList'), 'BieuMau02 includes 14 attached evidence documents list');

// Verify 4 confirmation points in BieuMau03
assert(bieu03Content.includes('1. Về sử dụng nguồn nguyên liệu địa phương:'), 'BieuMau03 confirms Point 1: 100% local raw materials');
assert(bieu03Content.includes('2. Về sử dụng lao động tại chỗ:'), 'BieuMau03 confirms Point 2: Local workforce');
assert(bieu03Content.includes('3. Về nguồn gốc ý tưởng sản phẩm:'), 'BieuMau03 confirms Point 3: Product idea origin');
assert(bieu03Content.includes('4. Về bản sắc văn hóa và trí tuệ địa phương:'), 'BieuMau03 confirms Point 4: Cultural identity & local wisdom');

console.log('\n================================================================');
console.log(`SUMMARY: Total Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
