import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = 'docs/Thong-tin-ve-cach-danh-gia-OCOP-148-ttg.signed.pdf'

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    # Find pages mentioning "Rau, củ, quả, hạt tươi" or "Phần A" or "Phần B" or "Phần C"
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if not text:
            continue
        if "Rau, củ, quả" in text or "rau, củ, quả" in text:
            print(f"--- Page {i+1} mentions 'Rau, củ, quả' ---")
            lines = text.split('\n')
            for line in lines[:10]:
                print("  ", line)
