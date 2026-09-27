import os
import sys

# Try importing docx, if not present we can unpack the zip directly using zipfile and xml parsing!
try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx_fallback(docx_path):
    text_parts = []
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            # Find all paragraphs w:p
            for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = [node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
                if texts:
                    text_parts.append(''.join(texts))
    except Exception as e:
        text_parts.append(f"Error reading {docx_path}: {e}")
    return '\n'.join(text_parts)

def extract_text(docx_path):
    if HAS_DOCX:
        try:
            doc = docx.Document(docx_path)
            # extract paragraphs
            lines = [p.text for p in doc.paragraphs]
            # also extract tables if any
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip().replace('\n', ' ') for cell in row.cells)
                    lines.append(row_text)
            return '\n'.join(lines)
        except Exception:
            return extract_text_from_docx_fallback(docx_path)
    else:
        return extract_text_from_docx_fallback(docx_path)

files = [
    r'f:\HTX_OCOP_PROJECT\docs\Báo Cáo Nghiên Cứu Quy Trình Phê Duyệt Đa Cấp.docx',
    r'f:\HTX_OCOP_PROJECT\docs\Báo Cáo Nghiên Cứu Quy Trình Quản Trị Kho Vật Tư.docx',
    r'f:\HTX_OCOP_PROJECT\docs\Báo Cáo Nghiên Cứu Quy Trình Quản Trị Thành Viên và Quản Lý Vốn Góp.docx',
    r'f:\HTX_OCOP_PROJECT\docs\Báo Cáo Nghiên Cứu Quy Trình Quản Trị Vùng Trồng Và Mùa Vụ.docx',
    r'f:\HTX_OCOP_PROJECT\docs\Báo Cáo Nghiên Cứu Thiết Kế Hệ Thống Số Hóa Hồ Sơ Và Đánh Giá Phân Hạng OCOP Theo Quyết Định 148.docx',
    r'f:\HTX_OCOP_PROJECT\docs\BÁO CÁO NGHIÊN CỨU TOÀN DIỆN VÀ HOÀN THIỆN ĐẶC TẢ KỸ THUẬT HỆ THỐNG QUẢN TRỊ HỢP TÁC XÃ NÔNG NGHIỆP VÀ SỐ HÓA HỒ SƠ PHÂN HẠNG OCOP.docx',
    r'f:\HTX_OCOP_PROJECT\docs\them một số logic còn thiếu.docx'
]

out_dir = r'f:\HTX_OCOP_PROJECT\docs\extracted_text'
os.makedirs(out_dir, exist_ok=True)

for fpath in files:
    fname = os.path.basename(fpath)
    out_name = os.path.splitext(fname)[0] + '.txt'
    out_path = os.path.join(out_dir, out_name)
    content = extract_text(fpath)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"EXTRACTED: {fname} -> {len(content)} chars")
