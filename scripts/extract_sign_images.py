"""
Extrai imagens das placas de trânsito do PDF de Sinalização Vertical.
Funciona para placas do tipo A- (Advertência) presentes no PDF.
"""
import sys, os, re, json
sys.path.insert(0, 'C:/Users/Catia/AppData/Roaming/Python/Python314/site-packages')
import fitz

PDF_PATH = r'C:/Users/Catia/Desktop/sinalização vertical de transito.pdf'
OUT_DIR = 'C:/Users/Catia/Desktop/simulado-cnh/public/signs'
os.makedirs(OUT_DIR, exist_ok=True)

# Load codes needed by the quiz
with open('C:/Users/Catia/Desktop/simulado-cnh/src/data/questions.json', encoding='utf-8') as f:
    qs = json.load(f)
needed = set(q['plate_code'] for q in qs if q.get('plate_code') and ' ' not in q.get('plate_code', ''))

code_pat = re.compile(r'^([AR]-\d+[a-z]?|SAU-\d+|TAR-\d+|THC-\d+|TNA-\d+|DEF-\d+)$')

doc = fitz.open(PDF_PATH)

def extract_sign(page, code, code_y_center, code_x0, padding=8):
    """
    Finds the sign drawing on the page near the code's y position
    and to the left of the code text, then renders it as PNG bytes.
    """
    drawings = page.get_drawings()

    # Find drawings that are vertically close to the code text and to the left
    candidates = []
    for d in drawings:
        r = d['rect']
        cy = (r.y0 + r.y1) / 2
        if abs(cy - code_y_center) < 40 and r.x1 < code_x0 + 20 and r.width > 10 and r.height > 10:
            if d.get('fill') and d['fill'] != (1.0, 1.0, 1.0):  # not white
                candidates.append(r)

    if not candidates:
        return None

    # Get bounding box of all candidate drawings together
    x0 = min(r.x0 for r in candidates)
    y0 = min(r.y0 for r in candidates)
    x1 = max(r.x1 for r in candidates)
    y1 = max(r.y1 for r in candidates)

    crop = fitz.Rect(x0 - padding, y0 - padding, x1 + padding, y1 + padding)

    # Render at 3x resolution for quality
    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=crop, colorspace=fitz.csRGB, alpha=False)
    return pix.tobytes('png')


extracted = {}

for page_idx in range(len(doc)):
    page = doc[page_idx]

    if len(page.get_drawings()) < 5:
        continue

    words = page.get_text('words')
    code_words = [(w[0], w[1], w[2], w[3], w[4]) for w in words if code_pat.match(w[4])]

    for x0, y0, x1, y1, code in code_words:
        if code not in needed:
            continue
        if code in extracted:
            continue

        code_y_center = (y0 + y1) / 2
        png_data = extract_sign(page, code, code_y_center, x0)

        if png_data and len(png_data) > 1000:
            out_path = os.path.join(OUT_DIR, f'{code}.png')
            if os.path.exists(out_path):
                extracted[code] = 'already_exists'
                continue
            with open(out_path, 'wb') as f:
                f.write(png_data)
            extracted[code] = page_idx + 1
            print(f'  OK {code} (page {page_idx + 1})')

doc.close()

print(f'\nExtraídas: {len(extracted)}')
missing = [c for c in sorted(needed) if c not in extracted
           and not os.path.exists(os.path.join(OUT_DIR, f'{c}.png'))
           and not os.path.exists(os.path.join(OUT_DIR, f'{c}.svg'))]
print(f'Ainda faltando: {len(missing)}')
if missing:
    print('Faltando:', missing)
