BEGIN TRANSACTION;
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "categories" VALUES(1,'PB','Phân bón','Phân bón vô cơ, hữu cơ và vi sinh','2026-09-14 17:09:50');
INSERT INTO "categories" VALUES(2,'BVTV','Thuốc BVTV Sinh học','Chế phẩm sinh học dùng trong bảo vệ cây trồng','2026-09-14 17:09:50');
INSERT INTO "categories" VALUES(3,'BB','Vật tư đóng gói','Bao bì, túi, tem và vật tư phục vụ đóng gói OCOP','2026-09-14 17:09:50');
INSERT INTO "categories" VALUES(4,'NC','Nông cụ','Dụng cụ, thiết bị cầm tay và thiết bị phục vụ sản xuất','2026-09-14 17:09:50');
CREATE TABLE inventory_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    old_quantity REAL NOT NULL CHECK (old_quantity >= 0),
    new_quantity REAL NOT NULL CHECK (new_quantity >= 0),
    reason TEXT NOT NULL,
    person TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);
CREATE TABLE inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    receipt_id INTEGER,
    type TEXT NOT NULL CHECK (type IN ('IN','OUT','ADJUSTMENT')),
    quantity REAL NOT NULL CHECK (quantity > 0),
    quantity_before REAL NOT NULL CHECK (quantity_before >= 0),
    quantity_after REAL NOT NULL CHECK (quantity_after >= 0),
    unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    note TEXT,
    person TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (receipt_id) REFERENCES stock_receipts(id) ON DELETE SET NULL
);
INSERT INTO "inventory_transactions" VALUES(1,4,1,'IN',400.0,800.0,1200.0,9500.0,'Nhập đợt vụ Đông Xuân','Nguyễn Văn Hải','2026-09-10 08:30:00');
INSERT INTO "inventory_transactions" VALUES(2,1,2,'OUT',120.0,270.0,150.0,18000.0,'Cấp cho tổ trồng rau xã viên','Trần Thị Mai','2026-09-11 09:15:00');
INSERT INTO "inventory_transactions" VALUES(3,3,3,'OUT',300.0,1150.0,850.0,4500.0,'Đóng gói lô OCOP tháng 9','Lê Văn Sơn','2026-09-12 10:00:00');
INSERT INTO "inventory_transactions" VALUES(4,2,4,'IN',25.0,20.0,45.0,120000.0,'Bổ sung từ nhà cung cấp Bio Việt','Nguyễn Văn Hải','2026-09-13 14:20:00');
CREATE TABLE materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    quantity REAL NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    safety_threshold REAL NOT NULL DEFAULT 0 CHECK (safety_threshold >= 0),
    unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    supplier_id INTEGER,
    warehouse_id INTEGER,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL
);
INSERT INTO "materials" VALUES(1,'VT001','Phân bón NPK 16-16-8 Đầu Trâu',1,1,150.0,300.0,18000.0,2,1,'Phân bón NPK phục vụ sản xuất rau màu','ACTIVE','2026-09-14 17:09:50','2026-09-14 17:09:50');
INSERT INTO "materials" VALUES(2,'VT002','Chế phẩm sinh học Trichoderma',2,3,45.0,20.0,120000.0,1,1,'Chế phẩm sinh học phòng nấm và cải tạo đất','ACTIVE','2026-09-14 17:09:50','2026-09-14 17:09:50');
INSERT INTO "materials" VALUES(3,'VT003','Bao bì túi zip nhôm OCOP 500g',3,2,850.0,1000.0,4500.0,3,1,'Bao bì phục vụ đóng gói sản phẩm OCOP','ACTIVE','2026-09-14 17:09:50','2026-09-14 17:09:50');
INSERT INTO "materials" VALUES(4,'VT004','Phân hữu cơ vi sinh Sông Giang',1,1,1200.0,500.0,9500.0,2,1,'Phân hữu cơ vi sinh','ACTIVE','2026-09-14 17:09:50','2026-09-14 17:09:50');
INSERT INTO "materials" VALUES(5,'VT005','Bình phun thuốc điện 16L',4,2,12.0,5.0,850000.0,2,2,'Bình phun điện 16 lít','ACTIVE','2026-09-14 17:09:50','2026-09-14 17:09:50');
INSERT INTO "materials" VALUES(6,'VT006','Kéo cắt cành Nhật Bản',4,2,8.0,10.0,150000.0,2,2,'Kéo cắt cành chuyên dụng','ACTIVE','2026-09-14 17:09:50','2026-09-14 17:09:50');
CREATE TABLE stock_receipt_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantity REAL NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    amount REAL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    note TEXT,
    FOREIGN KEY (receipt_id) REFERENCES stock_receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);
INSERT INTO "stock_receipt_items" VALUES(1,1,4,400.0,9500.0,'Nhập đợt vụ Đông Xuân');
INSERT INTO "stock_receipt_items" VALUES(2,2,1,120.0,18000.0,'Cấp cho tổ trồng rau xã viên');
INSERT INTO "stock_receipt_items" VALUES(3,3,3,300.0,4500.0,'Đóng gói lô OCOP tháng 9');
INSERT INTO "stock_receipt_items" VALUES(4,4,2,25.0,120000.0,'Bổ sung từ nhà cung cấp Bio Việt');
CREATE TABLE stock_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('IN','OUT')),
    warehouse_id INTEGER,
    supplier_id INTEGER,
    person TEXT,
    note TEXT,
    total_value REAL NOT NULL DEFAULT 0 CHECK (total_value >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);
INSERT INTO "stock_receipts" VALUES(1,'PN-0032','IN',1,2,'Nguyễn Văn Hải','Nhập đợt vụ Đông Xuân',3800000.0,'2026-09-10 08:30:00');
INSERT INTO "stock_receipts" VALUES(2,'PX-0051','OUT',1,NULL,'Trần Thị Mai','Cấp cho tổ trồng rau xã viên',2160000.0,'2026-09-11 09:15:00');
INSERT INTO "stock_receipts" VALUES(3,'PX-0052','OUT',1,NULL,'Lê Văn Sơn','Đóng gói lô OCOP tháng 9',1350000.0,'2026-09-12 10:00:00');
INSERT INTO "stock_receipts" VALUES(4,'PN-0033','IN',1,1,'Nguyễn Văn Hải','Bổ sung từ nhà cung cấp Bio Việt',3000000.0,'2026-09-13 14:20:00');
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_code TEXT,
    contact_person TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "suppliers" VALUES(1,'NCC001','Nhà cung cấp Bio Việt','0900000001','bioviet@example.com','Đà Lạt, Lâm Đồng',NULL,'Nguyễn Văn Hải',1,'2026-09-14 17:09:50');
INSERT INTO "suppliers" VALUES(2,'NCC002','Công ty Vật tư Nông nghiệp Tây Nguyên','0900000002','vattu@example.com','Đắk Lắk',NULL,'Trần Thị Mai',1,'2026-09-14 17:09:50');
INSERT INTO "suppliers" VALUES(3,'NCC003','Cơ sở Bao bì OCOP Việt','0900000003','baobi@example.com','TP. Hồ Chí Minh',NULL,'Lê Văn Sơn',1,'2026-09-14 17:09:50');
CREATE TABLE units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
INSERT INTO "units" VALUES(1,'KG','kg','Kilogram');
INSERT INTO "units" VALUES(2,'CAI','cái','Đơn vị cái');
INSERT INTO "units" VALUES(3,'CHAI','chai','Chai');
INSERT INTO "units" VALUES(4,'BO','bộ','Bộ sản phẩm');
INSERT INTO "units" VALUES(5,'THUNG','thùng','Thùng');
INSERT INTO "units" VALUES(6,'BAO','bao','Bao');
CREATE TABLE warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    manager_name TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "warehouses" VALUES(1,'KHO01','Kho vật tư chính','Khu sản xuất HTX','Nguyễn Văn Hải',1,'2026-09-14 17:09:50');
INSERT INTO "warehouses" VALUES(2,'KHO02','Kho nông cụ','Khu nhà kho số 2','Trần Thị Mai',1,'2026-09-14 17:09:50');
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_materials_supplier ON materials(supplier_id);
CREATE INDEX idx_materials_warehouse ON materials(warehouse_id);
CREATE INDEX idx_receipts_type_date ON stock_receipts(type, created_at);
CREATE INDEX idx_receipt_items_material ON stock_receipt_items(material_id);
CREATE INDEX idx_transactions_material_date ON inventory_transactions(material_id, created_at);
CREATE INDEX idx_transactions_type ON inventory_transactions(type);
CREATE VIEW v_material_inventory AS
SELECT
    m.id,
    m.code,
    m.name,
    c.name AS category,
    u.name AS unit,
    m.quantity,
    m.safety_threshold,
    m.unit_price,
    ROUND(m.quantity * m.unit_price, 2) AS inventory_value,
    CASE
        WHEN m.quantity <= 0 THEN 'HẾT HÀNG'
        WHEN m.quantity < m.safety_threshold THEN 'CẢNH BÁO THIẾU'
        ELSE 'ĐỦ SỐ LƯỢNG'
    END AS stock_status,
    s.name AS supplier,
    w.name AS warehouse,
    m.status,
    m.created_at,
    m.updated_at
FROM materials m
JOIN categories c ON c.id = m.category_id
JOIN units u ON u.id = m.unit_id
LEFT JOIN suppliers s ON s.id = m.supplier_id
LEFT JOIN warehouses w ON w.id = m.warehouse_id;
CREATE VIEW v_inventory_history AS
SELECT
    t.id,
    COALESCE(r.receipt_code, 'ADJUSTMENT') AS receipt_code,
    t.type,
    m.code AS material_code,
    m.name AS material_name,
    u.name AS unit,
    t.quantity,
    t.quantity_before,
    t.quantity_after,
    t.unit_price,
    ROUND(t.quantity * t.unit_price, 2) AS amount,
    t.person,
    t.note,
    t.created_at
FROM inventory_transactions t
JOIN materials m ON m.id = t.material_id
JOIN units u ON u.id = m.unit_id
LEFT JOIN stock_receipts r ON r.id = t.receipt_id;
CREATE TRIGGER trg_materials_updated_at
AFTER UPDATE ON materials
FOR EACH ROW
BEGIN
    UPDATE materials
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;
CREATE TRIGGER trg_receipt_item_amount_check
AFTER INSERT ON stock_receipt_items
FOR EACH ROW
BEGIN
    UPDATE stock_receipts
    SET total_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM stock_receipt_items
        WHERE receipt_id = NEW.receipt_id
    )
    WHERE id = NEW.receipt_id;
END;
CREATE TRIGGER trg_receipt_item_amount_update
AFTER UPDATE ON stock_receipt_items
FOR EACH ROW
BEGIN
    UPDATE stock_receipts
    SET total_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM stock_receipt_items
        WHERE receipt_id = NEW.receipt_id
    )
    WHERE id = NEW.receipt_id;
END;
CREATE TRIGGER trg_receipt_item_amount_delete
AFTER DELETE ON stock_receipt_items
FOR EACH ROW
BEGIN
    UPDATE stock_receipts
    SET total_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM stock_receipt_items
        WHERE receipt_id = OLD.receipt_id
    )
    WHERE id = OLD.receipt_id;
END;
DELETE FROM "sqlite_sequence";
INSERT INTO "sqlite_sequence" VALUES('categories',4);
INSERT INTO "sqlite_sequence" VALUES('units',6);
INSERT INTO "sqlite_sequence" VALUES('suppliers',3);
INSERT INTO "sqlite_sequence" VALUES('warehouses',2);
INSERT INTO "sqlite_sequence" VALUES('materials',6);
INSERT INTO "sqlite_sequence" VALUES('stock_receipts',4);
INSERT INTO "sqlite_sequence" VALUES('stock_receipt_items',4);
INSERT INTO "sqlite_sequence" VALUES('inventory_transactions',4);
COMMIT;
