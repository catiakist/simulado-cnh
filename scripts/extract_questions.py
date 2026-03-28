import re
import json
import sys

# Add user site-packages path for Windows user installs
sys.path.insert(0, 'C:/Users/Catia/AppData/Roaming/Python/Python314/site-packages')

def extract_questions(pdf_path):
    import pdfplumber

    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                full_text += t + "\n"

    questions = []
    current_module = ""
    current_part = ""

    lines = full_text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if re.match(r'^PARTE\s+\d', line, re.IGNORECASE):
            current_part = line
        elif re.match(r'^M[ÓOo][Dd][Uu][Ll][Oo]\s+\d', line, re.IGNORECASE):
            current_module = line
        # Variações de codificação para "MÓDULO"
        elif re.match(r'^M.DULO\s+\d', line):
            current_module = line

        # Detecta início de questão
        # Formato real do PDF: "l (Fácil) 1. texto" ou "l (Intermediário) 2. texto"
        # O "l" pode ser ●, l, ou outro char dependendo da extração
        q_match = re.match(
            r'^[l●•◉]\s*\((F[áa]cil|Intermedi[áa]rio|Dif[íi]cil)\)\s*(\d+)\.\s*(.+)',
            line
        )
        if not q_match:
            # sem bullet
            q_match = re.match(
                r'^\((F[áa]cil|Intermedi[áa]rio|Dif[íi]cil)\)\s*(\d+)\.\s*(.+)',
                line
            )

        if q_match:
            difficulty_raw = q_match.group(1)
            # Normalizar dificuldade
            if 'cil' in difficulty_raw.lower() and 'di' not in difficulty_raw.lower():
                difficulty = 'Fácil'
            elif 'nter' in difficulty_raw.lower():
                difficulty = 'Intermediário'
            else:
                difficulty = 'Difícil'

            number = int(q_match.group(2))
            question_text = q_match.group(3)

            # Coletar linhas seguintes que ainda são parte do enunciado
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if (next_line.startswith("C") and "digo da placa:" in next_line) or \
                   next_line.startswith("Alternativa correta:") or \
                   re.match(r'^[l●•◉]\s*\(', next_line) or \
                   re.match(r'^\((F[áa]cil|Intermedi[áa]rio|Dif[íi]cil)\)', next_line) or \
                   re.match(r'^M.DULO', next_line) or \
                   re.match(r'^PARTE\s+\d', next_line, re.IGNORECASE):
                    break
                if next_line and \
                   not next_line.startswith("CNH do Brasil") and \
                   not re.match(r'^\d+$', next_line):
                    question_text += " " + next_line
                i += 1

            # Código da placa (opcional) - "Código da placa:" pode aparecer como "C digo da placa:" etc
            plate_code = None
            if i < len(lines):
                nl = lines[i].strip()
                if re.search(r'[Cc].digo da placa:', nl):
                    plate_code = re.sub(r'.*[Cc].digo da placa:\s*', '', nl).strip()
                    i += 1

            # Alternativa correta
            correct_answer = ""
            comment_lines = []
            if i < len(lines) and "Alternativa correta:" in lines[i]:
                correct_text = lines[i].strip()
                # Remove "Alternativa correta:" e o marcador de correto (3, ✓, etc.)
                correct_answer = re.sub(r'Alternativa correta:\s*', '', correct_text)
                correct_answer = re.sub(r'\s*[3✓]\s*$', '', correct_answer).strip()
                i += 1

                # Coletar Comentário (pode ser multi-linha)
                if i < len(lines) and lines[i].strip().startswith("Coment"):
                    comment_line = re.sub(r'^Coment[aá]rio:\s*', '', lines[i].strip())
                    comment_lines.append(comment_line)
                    i += 1
                    while i < len(lines):
                        nl = lines[i].strip()
                        if nl.startswith("Respostas incorretas") or \
                           re.match(r'^[l●•◉]\s*\(', nl) or \
                           re.match(r'^\((F[áa]cil|Intermedi[áa]rio|Dif[íi]cil)\)', nl) or \
                           nl.startswith("7 ") or nl.startswith("✗") or \
                           re.match(r'^M.DULO', nl) or \
                           re.match(r'^PARTE\s+\d', nl, re.IGNORECASE) or \
                           nl.startswith("CNH do Brasil"):
                            break
                        if nl and not re.match(r'^\d+$', nl):
                            comment_lines.append(nl)
                        i += 1

            comment = " ".join(comment_lines)

            # Respostas incorretas — marcadas com "7 " ou "✗"
            wrong_answers = []
            if i < len(lines) and "Respostas incorretas" in lines[i]:
                i += 1
            while i < len(lines) and len(wrong_answers) < 3:
                nl = lines[i].strip()
                if re.match(r'^7\s+.+', nl):
                    wrong_answers.append(re.sub(r'^7\s+', '', nl).strip())
                    i += 1
                elif nl.startswith("✗"):
                    wrong_answers.append(nl.replace("✗", "").strip())
                    i += 1
                elif re.match(r'^[l●•◉]\s*\(', nl) or \
                     re.match(r'^\((F[áa]cil|Intermedi[áa]rio|Dif[íi]cil)\)', nl) or \
                     re.match(r'^M.DULO', nl) or \
                     re.match(r'^PARTE\s+\d', nl, re.IGNORECASE):
                    break
                else:
                    i += 1

            questions.append({
                "id": len(questions) + 1,
                "number": number,
                "part": current_part,
                "module": current_module,
                "difficulty": difficulty,
                "question": question_text.strip(),
                "correct_answer": correct_answer,
                "comment": comment,
                "wrong_answers": wrong_answers,
                "plate_code": plate_code
            })
            continue

        i += 1

    return questions

if __name__ == "__main__":
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else "Banco_Nacional_de_Questoes.pdf"
    questions = extract_questions(pdf_path)
    print(f"Total de questões extraídas: {len(questions)}")

    import os
    os.makedirs("src/data", exist_ok=True)
    with open("src/data/questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("Arquivo salvo em src/data/questions.json")

    # Mostrar amostra
    print("\n--- Amostra das primeiras 3 questões ---")
    for q in questions[:3]:
        print(json.dumps(q, ensure_ascii=False, indent=2))

    # Estatísticas
    from collections import Counter
    modules = Counter(q["module"] for q in questions)
    difficulties = Counter(q["difficulty"] for q in questions)
    parts = Counter(q["part"] for q in questions)
    print(f"\n--- Por parte ---")
    for k, v in sorted(parts.items()):
        print(f"  '{k}': {v}")
    print(f"\n--- Por módulo ---")
    for k, v in sorted(modules.items()):
        print(f"  '{k}': {v}")
    print(f"\n--- Por dificuldade ---")
    for k, v in sorted(difficulties.items()):
        print(f"  {k}: {v}")
