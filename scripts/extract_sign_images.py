"""
Extrai imagens das placas do PDF, associando cada imagem à questão correspondente.
As placas aparecem como gráficos vetoriais ACIMA do texto da questão em cada página.
"""
import sys, os, json, re

sys.path.insert(0, 'C:/Users/Catia/AppData/Roaming/Python/Python314/site-packages')
import fitz  # PyMuPDF

PDF_PATH = 'C:/Users/Catia/Desktop/Banco Nacional de Questões.pdf'
QUESTIONS_PATH = 'C:/Users/Catia/Desktop/simulado-cnh/src/data/questions.json'
OUTPUT_DIR = 'C:/Users/Catia/Desktop/simulado-cnh/public/signs'

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(QUESTIONS_PATH, encoding='utf-8') as f:
    questions = json.load(f)

# Questões que precisam de imagem (têm plate_code)
plate_questions = {q['number']: q for q in questions if q.get('plate_code')}
print(f"Questões com código de placa: {len(plate_questions)}")

doc = fitz.open(PDF_PATH)
saved = 0
not_found = []

# Padrão para detectar início de questão no texto da página
# Exemplo: "l (Fácil) 30." ou "G (Intermediário) 30."
Q_PATTERN = re.compile(r'[lG●•]\s*\([^)]+\)\s*(\d+)\.')

for page_num in range(len(doc)):
    page = doc[page_num]
    page_text = page.get_text('text')

    # Encontrar quais questões estão nesta página
    found_nums = [int(m.group(1)) for m in Q_PATTERN.finditer(page_text)]
    questions_on_page = [n for n in found_nums if n in plate_questions]

    if not questions_on_page:
        continue

    # Obter blocos de texto com posições
    blocks = page.get_text('blocks')  # (x0,y0,x1,y1,text,block_no,block_type)

    for q_num in questions_on_page:
        # Encontrar bloco de texto onde começa esta questão
        q_block = None
        for b in blocks:
            if re.search(r'[lG●•]\s*\([^)]+\)\s*' + str(q_num) + r'\.', b[4]):
                q_block = b
                break

        if q_block is None:
            not_found.append(q_num)
            continue

        q_y = q_block[1]  # y0 do bloco da questão

        # Encontrar o bloco anterior (acima) na mesma página
        # Ordenar blocos por y0
        sorted_blocks = sorted(blocks, key=lambda b: b[1])
        prev_block = None
        for b in sorted_blocks:
            if b[1] < q_y - 5:  # bloco acima da questão
                prev_block = b

        if prev_block is None:
            not_found.append(q_num)
            continue

        prev_y_end = prev_block[3]  # y1 do bloco anterior

        # Área da placa: entre o fim do bloco anterior e o início da questão
        sign_y0 = prev_y_end + 2
        sign_y1 = q_y - 2

        # Se a área for muito pequena, pode ser que a placa seja mais acima
        if sign_y1 - sign_y0 < 20:
            # Tentar pegar área maior
            sign_y0 = max(0, q_y - 120)
            sign_y1 = q_y - 2

        if sign_y1 - sign_y0 < 15:
            not_found.append(q_num)
            continue

        # Clipar e renderizar a área da placa
        page_width = page.rect.width
        clip = fitz.Rect(0, sign_y0, page_width, sign_y1)

        # Renderizar em alta resolução
        mat = fitz.Matrix(4, 4)  # 4x zoom para qualidade
        pix = page.get_pixmap(matrix=mat, clip=clip, colorspace=fitz.csRGB)

        out_path = os.path.join(OUTPUT_DIR, f'q{q_num}.png')
        pix.save(out_path)
        saved += 1

        if saved % 20 == 0:
            print(f"  Salvas: {saved}...")

print(f"\nTotal salvas: {saved}")
print(f"Não encontradas: {len(not_found)} → {not_found[:20]}")

# Criar mapa de plate_code → question_number para referência
plate_map = {q['plate_code']: q['number'] for q in questions if q.get('plate_code')}
with open(os.path.join(OUTPUT_DIR, 'plate_map.json'), 'w', encoding='utf-8') as f:
    json.dump(plate_map, f, ensure_ascii=False, indent=2)
print("plate_map.json salvo.")
