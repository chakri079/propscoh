import sys
import subprocess

try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

reader = pypdf.PdfReader("Backend Engineering Intern - Task.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open("task_description.txt", "w", encoding="utf-8") as f:
    f.write(text)
