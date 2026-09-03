import os
import zipfile

def make_clean_zip():
    base_dir = r"C:\Users\Shivam\Downloads\techpulse-ai"
    output_zip = r"C:\Users\Shivam\Downloads\SKYSHIELD_SIH26077.zip"
    
    # Exclude directories and patterns
    exclude_dirs = {
        'node_modules',
        '.git',
        '__pycache__',
        '.pytest_cache',
        '.vite',
        'venv',
        '.idea',
        '.vscode',
        'client',
        'server'
    }
    exclude_exts = {'.pyc', '.zip'}

    if os.path.exists(output_zip):
        try:
            os.remove(output_zip)
        except Exception:
            pass

    print(f"Creating zip file at: {output_zip}")
    file_count = 0
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(base_dir):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in exclude_exts or file == 'create_zip.py':
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                zf.write(full_path, arcname=os.path.join("SKYSHIELD", rel_path))
                file_count += 1

    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"Successfully zipped {file_count} files into {output_zip} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    make_clean_zip()
