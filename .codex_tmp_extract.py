import sys, pathlib, re
sys.path.insert(0, r'E:\WebDev\Vercel\ChokdeeWeb\.codex_tmp_pypdf')
from pypdf import PdfReader
outdir = pathlib.Path(r'E:\WebDev\Vercel\ChokdeeWeb\.codex_tmp_pdf_text')
outdir.mkdir(exist_ok=True)
for f in sys.argv[1:]:
    p = pathlib.Path(f)
    reader = PdfReader(str(p))
    chunks=[]
    for i,page in enumerate(reader.pages, 1):
        try:
            text = page.extract_text() or ''
        except Exception as e:
            text = f'[extract error: {e}]'
        text = re.sub(r'\n{3,}', '\n\n', text)
        chunks.append(f'\n\n===== PAGE {i} =====\n{text}')
    out=(outdir/(p.stem+'.txt'))
    out.write_text('\n'.join(chunks), encoding='utf-8')
    print(p.name, 'pages=', len(reader.pages), 'chars=', sum(len(c) for c in chunks), 'out=', out)
