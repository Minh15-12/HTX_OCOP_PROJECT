import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAutonomousAudit() {
  console.log('================================================================');
  console.log('🤖 KHỞI CHẠY QUY TRÌNH TỰ ĐỘNG ĐỐI SOÁT & KIỂM THỬ CRUD THỰC TẾ');
  console.log('================================================================\n');

  // 1. Kiểm tra số lượng xã viên hiện tại trong cơ sở dữ liệu PostgreSQL
  console.log('📦 BƯỚC 1: Dọn dẹp bản ghi kiểm thử cũ & Kiểm tra số lượng bản ghi DB ban đầu...');
  let initialDbCount = 0;
  try {
    execSync(
      `php artisan tinker --execute="DB::table('members')->where('member_code', 'TV031')->delete();"`,
      { cwd: path.resolve(__dirname, '../../backend') }
    );
    const rawCount = execSync(
      'php artisan tinker --execute="echo DB::table(\'members\')->count();"',
      { cwd: path.resolve(__dirname, '../../backend') }
    ).toString();
    initialDbCount = parseInt(rawCount.trim(), 10);
    console.log(`  -> Số lượng xã viên hiện tại trong DB: ${initialDbCount} người`);
  } catch (err) {
    console.error('  ❌ Lỗi khi truy vấn DB ban đầu:', err.message);
    process.exit(1);
  }

  // 2. Mở trình duyệt Playwright và thực hiện tương tác người dùng thật
  console.log('\n🌐 BƯỚC 2: Khởi động trình duyệt Playwright & Đăng nhập...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let apiCreateResponse = null;
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/v1/members') && response.request().method() === 'POST') {
      try {
        const body = await response.json();
        apiCreateResponse = { status: response.status(), body };
        console.log(`\n  📡 [NETWORK EVENT] POST /api/v1/members -> Status: ${response.status()}`);
        console.log('  Response Data:', JSON.stringify(body, null, 2));
      } catch (e) {
        apiCreateResponse = { status: response.status(), text: await response.text() };
      }
    }
  });

  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForTimeout(2500);

    console.log('\n📋 BƯỚC 3: Mở trang Xã viên & Bấm "+ Thêm xã viên mới"...');
    await page.goto('http://localhost:3000/members', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const addBtn = await page.waitForSelector('button:has-text("Thêm xã viên mới")', { timeout: 8000 });
    await addBtn.click();
    await page.waitForTimeout(1000);

    console.log('📝 BƯỚC 4: Điền thông tin Form Wizard 5 bước...');

    // Bước 1: Thông tin cá nhân
    console.log('  -> Bước 1: Thông tin định danh cá nhân');
    const nameInput = await page.waitForSelector('input[placeholder="NGUYỄN VĂN A"]', { timeout: 5000 });
    await nameInput.fill('HOÀNG MINH TRÍ');

    const dateInputs = await page.$$('input[type="date"]');
    if (dateInputs.length > 0) await dateInputs[0].fill('1995-08-15');

    const cccdInput = await page.$('input[placeholder="Đúng 12 chữ số"]');
    if (cccdInput) await cccdInput.fill('049095888999');

    if (dateInputs.length > 1) await dateInputs[1].fill('2021-06-20');

    const placeInput = await page.$('input[placeholder="VD: Cục Cảnh sát QLHC về trật tự xã hội"]');
    if (placeInput) await placeInput.fill('Cục Cảnh sát QLHC về trật tự xã hội');

    const jobInput = await page.$('input[placeholder="VD: Nông dân, Kỹ sư..."]');
    if (jobInput) await jobInput.fill('Kỹ sư nông nghiệp CNC');

    await page.click('button:has-text("Tiếp tục")');
    await page.waitForTimeout(600);

    // Bước 2: Liên hệ & Hộ khẩu
    console.log('  -> Bước 2: Địa chỉ & Liên lạc');
    const detailAddr = await page.waitForSelector('input[placeholder*="Thôn 2"]', { timeout: 5000 });
    await detailAddr.fill('Thôn 2, Xã Mê Linh');

    const phoneInput = await page.$('input[placeholder="10 chữ số"]');
    if (phoneInput) await phoneInput.fill('0918889999');

    const emailInput = await page.$('input[type="email"]');
    if (emailInput) await emailInput.fill('hoangminhtri@htxtantien.vn');

    await page.click('button:has-text("Tiếp tục")');
    await page.waitForTimeout(600);

    // Bước 3: Vốn điều lệ
    console.log('  -> Bước 3: Vốn điều lệ & Cam kết góp vốn');
    await page.click('button:has-text("Tiếp tục")');
    await page.waitForTimeout(600);

    // Bước 4: Tài khoản ngân hàng
    console.log('  -> Bước 4: Tài khoản ngân hàng & Hạn mức nợ');
    const bankNameInput = await page.$('input[placeholder*="Agribank chi nhánh Lâm Hà"]');
    if (bankNameInput) await bankNameInput.fill('Vietcombank - CN Lâm Đồng');

    await page.click('button:has-text("Tiếp tục")');
    await page.waitForTimeout(600);

    // Bước 5: Xem lại & Nộp hồ sơ
    console.log('  -> Bước 5: Xem lại hồ sơ & Bấm "Tạo hồ sơ Xã viên"...');
    const submitBtn = await page.waitForSelector('button:has-text("Tạo hồ sơ Xã viên")', { timeout: 5000 });
    await submitBtn.click();
    await page.waitForTimeout(3000);

    // 5. Kiểm tra kết quả phản hồi của API
    console.log('\n🔍 BƯỚC 5: Kiểm tra tính hợp lệ của phản hồi Backend...');
    if (!apiCreateResponse) {
      throw new Error('❌ Không phát hiện bất kỳ HTTP request nào gửi tới /api/v1/members!');
    }

    if (apiCreateResponse.status === 200 || apiCreateResponse.status === 201) {
      console.log(`  ✅ Backend API đã xử lý thành công với Status ${apiCreateResponse.status}!`);
    } else {
      console.error(`  ❌ Backend API từ chối với Status ${apiCreateResponse.status}! Chi tiết:`, apiCreateResponse.body);
      throw new Error(`Backend trả về lỗi: ${JSON.stringify(apiCreateResponse.body)}`);
    }

    // 6. Truy vấn Database thật kiểm tra record mới
    console.log('\n🗄️ BƯỚC 6: Đối soát trực tiếp Database PostgreSQL...');
    const postCountRaw = execSync(
      'php artisan tinker --execute="echo DB::table(\'members\')->count();"',
      { cwd: path.resolve(__dirname, '../../backend') }
    ).toString();
    const postDbCount = parseInt(postCountRaw.trim(), 10);
    console.log(`  -> Số lượng xã viên trong DB sau khi thêm: ${postDbCount} người`);

    if (postDbCount === initialDbCount + 1) {
      console.log('  ✅ THÀNH CÔNG RỰC RỠ: Cơ sở dữ liệu PostgreSQL đã tăng đúng 1 bản ghi thật!');
    } else {
      throw new Error(`❌ Dữ liệu không lưu vào DB! Ban đầu: ${initialDbCount}, Hiện tại: ${postDbCount}`);
    }

    // Kiểm tra chi tiết bản ghi vừa tạo
    const verifyMemberRaw = execSync(
      `php artisan tinker --execute="$m = DB::table('members')->where('member_code', 'TV031')->first(); echo json_encode($m, JSON_PRETTY_PRINT);"`,
      { cwd: path.resolve(__dirname, '../../backend') }
    ).toString();
    console.log('  -> Bản ghi thực tế trong PostgreSQL:\n', verifyMemberRaw);

    // 7. Chụp ảnh màn hình làm bằng chứng trực quan
    console.log('\n📸 BƯỚC 7: Chụp ảnh bằng chứng trực quan có xã viên mới trên bảng...');
    const artifactPath = path.resolve('C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c/14_autonomous_crud_success.png');
    await page.screenshot({ path: artifactPath });
    console.log(`  ✅ Đã lưu ảnh bằng chứng vào: ${artifactPath}`);

    console.log('\n================================================================');
    console.log('🎉 TOÀN BỘ QUY TRÌNH KIỂM THỬ TỰ ĐỘNG KHÉP KÍN ĐÃ HOÀN TẤT THÀNH CÔNG 100%!');
    console.log('================================================================');
  } catch (error) {
    console.error('❌ Kiểm thử thất bại:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAutonomousAudit();
