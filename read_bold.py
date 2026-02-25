import sys
import subprocess

try:
    import fitz
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymupdf"])
    import fitz

doc = fitz.open("Backend Engineering Intern - Task.pdf")
b_text = ""
for page in doc:
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if b.get('type') == 0:
            for l in b.get("lines", []):
                for s in l.get("spans", []):
                    if "Bold" in s["font"] or "bold" in s["font"].lower() or (s.get("flags", 0) & 16):
                        b_text += s["text"] + "\n"

with open("bold_text.txt", "w", encoding="utf-8") as f:
    f.write(b_text)
