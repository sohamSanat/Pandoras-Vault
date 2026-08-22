import os
import re

vault_dir = r"c:\Users\hsoha\OneDrive\obsedian\Pandoras-Vault"
targets = [
    r".obsidian\snippets\calander-ui.css",
    r".obsidian\snippets\break-copilot-ui.css",
    r".obsidian\plugins\welcome-widget\styles.css",
    r".obsidian\snippets\mascot.css"
]

def replace_border_colors(text):
    # Regex to find border/border-* rules containing the blue colors
    # We will replace rgba(56, 189, 248, X) with rgba(255, 255, 255, 0.1)
    # and #38bdf8 with rgba(255, 255, 255, 0.2)
    
    lines = text.split('\n')
    new_lines = []
    for line in lines:
        if 'border' in line:
            # Replace rgba(56, 189, 248, ...)
            line = re.sub(r'rgba\(\s*56\s*,\s*189\s*,\s*248\s*,\s*[0-9.]+\s*\)', 'rgba(255, 255, 255, 0.1)', line)
            # Replace #38bdf8
            line = re.sub(r'#38bdf8', 'rgba(255, 255, 255, 0.2)', line)
            
            # If the line still has a border style we changed, that's it.
            new_lines.append(line)
        else:
            new_lines.append(line)
            
    return '\n'.join(new_lines)

for target in targets:
    path = os.path.join(vault_dir, target)
    if not os.path.exists(path):
        print(f"Skipping {target} (not found)")
        continue
        
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    new_content = replace_border_colors(content)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Processed {target}")
