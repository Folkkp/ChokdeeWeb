import sys, pathlib
sys.path.insert(0, r'E:\WebDev\Vercel\ChokdeeWeb\.codex_tmp_pymupdf')
import pymupdf
pdf = r'E:\Dowload_Edrive\งานตอนปี 4 เทอม 2\GEN 332\Group+3_Wk11_G3.pdf'
outdir = pathlib.Path(r'E:\WebDev\Vercel\ChokdeeWeb\.codex_tmp_pdf_pages')
outdir.mkdir(exist_ok=True)
doc = pymupdf.open(pdf)
for i in range(len(doc)):
    pix = doc[i].get_pixmap(matrix=pymupdf.Matrix(2.5,2.5), alpha=False)
    out = outdir / f'Group_Wk11_page_{i+1}.png'
    pix.save(out)
    print(out)
