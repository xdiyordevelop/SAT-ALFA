import os
import re

def replace_colors(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The prompt says: Primary Brand Accent: Amber / Gold Yellow (amber-400 / yellow-400 / amber-500)
    # Backgrounds: bg-slate-950, bg-slate-900/80, border-slate-800/80
    
    new_content = content
    # Replace indigo-500 with amber-500
    new_content = re.sub(r'\bindigo-500\b', 'amber-500', new_content)
    # Replace indigo-600 with amber-500 (since hover should be amber-400 or yellow-500, let's say amber-600 is amber-500 and indigo-500 is amber-400, or just use amber-500 and amber-600)
    new_content = re.sub(r'\bindigo-600\b', 'amber-600', new_content)
    new_content = re.sub(r'\bindigo-400\b', 'amber-400', new_content)
    new_content = re.sub(r'\bindigo-300\b', 'amber-300', new_content)
    new_content = re.sub(r'\bindigo-200\b', 'amber-200', new_content)
    new_content = re.sub(r'\bindigo-100\b', 'amber-100', new_content)
    new_content = re.sub(r'\bindigo-50\b', 'amber-50', new_content)
    new_content = re.sub(r'\bindigo-700\b', 'amber-700', new_content)
    new_content = re.sub(r'\bindigo-800\b', 'amber-800', new_content)
    new_content = re.sub(r'\bindigo-900\b', 'amber-900', new_content)
    
    new_content = re.sub(r'\bpurple-500\b', 'yellow-500', new_content)
    new_content = re.sub(r'\bpurple-600\b', 'yellow-600', new_content)
    new_content = re.sub(r'\bpurple-400\b', 'yellow-400', new_content)
    
    # Also currency formatting
    new_content = new_content.replace('$', '')
    # We replaced some $ but need to be careful with templates like `${`
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def walk_dir(directory):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                if replace_colors(path):
                    count += 1
    print(f"Updated {count} files.")

if __name__ == '__main__':
    walk_dir('src/')
