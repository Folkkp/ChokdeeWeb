import sys, pathlib, re
sys.path.insert(0, r'E:\WebDev\Vercel\ChokdeeWeb\.codex_tmp_pypdf')
from pypdf import PdfReader
p = pathlib.Path(sys.argv[1])
reader = PdfReader(str(p))
print('pages=', len(reader.pages))
for i,page in enumerate(reader.pages,1):
    text = page.extract_text() or ''
    text = re.sub(r'\n{3,}', '\n\n', text)
    print(f'\n===== PAGE {i} =====\n{text}')
