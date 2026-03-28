"""
Baixa imagens das placas do CTB do Wikimedia Commons.
As imagens são de domínio público / licença livre.
"""
import sys, os, json, urllib.request, time

sys.path.insert(0, 'C:/Users/Catia/AppData/Roaming/Python/Python314/site-packages')

OUTPUT_DIR = 'C:/Users/Catia/Desktop/simulado-cnh/public/signs'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mapeamento de códigos CTB → nome do arquivo no Wikimedia Commons
# Padrão: https://upload.wikimedia.org/wikipedia/commons/[X]/[XX]/Brazilian_traffic_sign_[CODE].svg
# Alguns têm nomes diferentes — verificados manualmente
WIKIMEDIA_MAP = {
    # Regulamentação
    'R-1':   'R-1',   'R-2':   'R-2',   'R-3':   'R-3',
    'R-4a':  'R-4a',  'R-4b':  'R-4b',
    'R-5a':  'R-5a',  'R-5b':  'R-5b',
    'R-6a':  'R-6a',  'R-6b':  'R-6b',  'R-6c':  'R-6c',
    'R-7':   'R-7',   'R-8a':  'R-8a',  'R-8b':  'R-8b',
    'R-9':   'R-9',   'R-10':  'R-10',  'R-11':  'R-11',
    'R-12':  'R-12',  'R-13':  'R-13',  'R-14':  'R-14',
    'R-15':  'R-15',  'R-16':  'R-16',  'R-17':  'R-17',
    'R-18':  'R-18',  'R-19':  'R-19',  'R-20':  'R-20',
    'R-21':  'R-21',  'R-22':  'R-22',  'R-23':  'R-23',
    'R-24a': 'R-24a', 'R-24b': 'R-24b',
    'R-25a': 'R-25a', 'R-25b': 'R-25b', 'R-25c': 'R-25c',
    'R-26':  'R-26',  'R-27':  'R-27',  'R-28':  'R-28',
    'R-29':  'R-29',  'R-30':  'R-30',  'R-31':  'R-31',
    'R-32':  'R-32',  'R-33':  'R-33',  'R-34':  'R-34',
    'R-35a': 'R-35a', 'R-35b': 'R-35b',
    'R-36a': 'R-36a', 'R-36b': 'R-36b',
    'R-37':  'R-37',  'R-38':  'R-38',  'R-39':  'R-39',
    'R-40':  'R-40',  'R-41':  'R-41',  'R-44':  'R-44',
    # Advertência
    'A-1a':  'A-1a',  'A-1b':  'A-1b',
    'A-2a':  'A-2a',  'A-2b':  'A-2b',
    'A-3a':  'A-3a',  'A-3b':  'A-3b',
    'A-4a':  'A-4a',  'A-4b':  'A-4b',
    'A-5a':  'A-5a',  'A-5b':  'A-5b',
    'A-6':   'A-6',   'A-7a':  'A-7a',  'A-7b':  'A-7b',  'A-7c': 'A-7c',
    'A-8':   'A-8',   'A-9':   'A-9',
    'A-10a': 'A-10a', 'A-10b': 'A-10b',
    'A-11a': 'A-11a', 'A-11b': 'A-11b',
    'A-12':  'A-12',  'A-13a': 'A-13a', 'A-13b': 'A-13b',
    'A-14':  'A-14',  'A-15':  'A-15',  'A-16':  'A-16',
    'A-17':  'A-17',  'A-18':  'A-18',  'A-19':  'A-19',
    'A-20a': 'A-20a', 'A-20b': 'A-20b',
    'A-21':  'A-21',  'A-22':  'A-22',  'A-23':  'A-23',
    'A-24':  'A-24',  'A-25':  'A-25',
    'A-26a': 'A-26a', 'A-26b': 'A-26b',
    'A-27':  'A-27',  'A-28':  'A-28',  'A-29':  'A-29',
    'A-30a': 'A-30a', 'A-30b': 'A-30b',
    'A-31':  'A-31',  'A-32':  'A-32',  'A-32a': 'A-32a',
    'A-33a': 'A-33a', 'A-33b': 'A-33b',
    'A-34':  'A-34',  'A-35':  'A-35',  'A-36':  'A-36',
    'A-37':  'A-37',  'A-38':  'A-38',  'A-39':  'A-39',
    'A-40':  'A-40',  'A-41':  'A-41',
    'A-42a': 'A-42a', 'A-42b': 'A-42b',
    'A-43':  'A-43',
}

import hashlib

def wikimedia_url(filename):
    """Builds Wikimedia Commons thumb URL using MD5 hash."""
    md5 = hashlib.md5(filename.encode('utf-8')).hexdigest()
    a, ab = md5[0], md5[:2]
    return f'https://upload.wikimedia.org/wikipedia/commons/thumb/{a}/{ab}/{filename}/200px-{filename}.png'

def try_download(code, out_path):
    filename = f'Brazilian_traffic_sign_{code}.svg'
    url = wikimedia_url(filename)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'SimuladoCNH/1.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = r.read()
        if len(data) < 500:  # Too small = error page
            return False
        with open(out_path, 'wb') as f:
            f.write(data)
        return True
    except Exception:
        return False

# Load used codes from questions
with open('C:/Users/Catia/Desktop/simulado-cnh/src/data/questions.json', encoding='utf-8') as f:
    qs = json.load(f)
used_codes = set(q['plate_code'] for q in qs if q.get('plate_code'))

print(f'Códigos para baixar: {len(used_codes)}')
success, fail = 0, []

for code in sorted(used_codes):
    out = os.path.join(OUTPUT_DIR, f'{code}.png')
    if os.path.exists(out):
        success += 1
        continue
    if try_download(code, out):
        success += 1
        print(f'  OK {code}')
    else:
        fail.append(code)
        print(f'  FAIL {code}')
    time.sleep(0.3)

print(f'\nBaixadas: {success} | Falhas: {len(fail)}')
if fail:
    print('Não encontradas:', fail)
