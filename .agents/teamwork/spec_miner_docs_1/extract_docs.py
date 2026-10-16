import sys
import docx

sys.stdout.reconfigure(encoding='utf-8')

def dump_docx(path):
    print("=" * 60)
    print("FILE:", path)
    print("=" * 60)
    doc = docx.Document(path)
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt:
            print(txt)
    for i, t in enumerate(doc.tables):
        print(f"\n--- TABLE {i+1} ---")
        for row in t.rows:
            vals = [cell.text.strip().replace('\n', ' ') for cell in row.cells]
            # remove adjacent duplicates caused by merged cells
            dedup = []
            for v in vals:
                if not dedup or dedup[-1] != v:
                    dedup.append(v)
            print(" | ".join(dedup))

for p in [
    'docs/Bieu mẫu 1 mau-phieu-dk-danh-gia-phan-han-sp-OCOP.docx',
    'docs/Bieu mẫu 2.docx',
    'docs/BIEU SO 03-PHU LUC II-QD-148-QD-TTg.docx'
]:
    dump_docx(p)
