import os
import pathlib

talon_utils_path = pathlib.Path(__file__).parent / ".venv/lib/python*/site-packages/talon/utils.py"

# Find the actual utils.py file path (wildcard python version)
matches = list(talon_utils_path.parent.glob("python*/site-packages/talon/utils.py"))

if not matches:
    raise FileNotFoundError("Could not find talon/utils.py")

utils_path = matches[0]

with open(utils_path, "r") as file:
    content = file.read()

# Replace cchardet import with chardet
content = content.replace("import cchardet as chardet", "import chardet")

with open(utils_path, "w") as file:
    file.write(content)

print(f"✅ Patched Talon to use chardet at {utils_path}")
