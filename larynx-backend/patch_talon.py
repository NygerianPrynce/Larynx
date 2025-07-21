import os

site_packages_dirs = [
    d for d in os.sys.path if "site-packages" in d
]

patched = False
for dir_path in site_packages_dirs:
    target_file = os.path.join(dir_path, "talon", "utils.py")
    if os.path.exists(target_file):
        with open(target_file, "r") as f:
            content = f.read()
        if "import cchardet" in content:
            new_content = content.replace(
                "import cchardet as chardet",
                "import chardet"
            )
            with open(target_file, "w") as f:
                f.write(new_content)
            patched = True
            print(f"✅ Patched: {target_file}")
        else:
            print(f"⚠️ Already uses chardet: {target_file}")
        break

if not patched:
    print("❌ Could not find talon/utils.py to patch.")
