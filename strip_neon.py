import os
import re

vault_dir = r"c:\Users\hsoha\OneDrive\obsedian\Pandoras-Vault"
targets = [
    r".obsidian\plugins\welcome-widget\styles.css",
    r".obsidian\plugins\mini-graph-widget\styles.css",
    r".obsidian\plugins\hub-links-widget\styles.css",
    r".obsidian\plugins\watchlog\styles.css",
    r".obsidian\plugins\productivity-hub\styles.css",
    r".obsidian\plugins\study-hub\styles.css",
    r".obsidian\snippets\calander-ui.css",
    r".obsidian\snippets\welcome-screen.css",
    r".obsidian\snippets\break-copilot-ui.css",
    r".obsidian\snippets\mascot.css",
    r".obsidian\snippets\banner-text-shadow.css",
]

for target in targets:
    path = os.path.join(vault_dir, target)
    if not os.path.exists(path):
        print(f"Skipping {target} (not found)")
        continue
        
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove backdrop-filter
    content = re.sub(r'^\s*backdrop-filter:\s*blur.*?;\r?\n?', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\s*-webkit-backdrop-filter:\s*blur.*?;\r?\n?', '', content, flags=re.MULTILINE)
    
    # 2. Remove text-shadow
    content = re.sub(r'^\s*text-shadow:\s*.*?;\r?\n?', '', content, flags=re.MULTILINE)
    
    # 3. Handle box-shadow (strip glowing ones)
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if 'box-shadow:' in line:
            # If it's a pure black shadow, keep it
            if re.search(r'rgba\(\s*0\s*,\s*0\s*,\s*0', line) and not re.search(r'rgba\(\s*[1-9]', line) and '#' not in line:
                new_lines.append(line)
            # If it contains both black shadow and colored glow, try to strip the colored part
            elif 'rgba(0, 0, 0' in line or 'rgba(0,0,0' in line:
                matches = re.findall(r'([^,:]+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*[\d.]+\))', line)
                if matches:
                    new_line = line[:line.find('box-shadow:')] + 'box-shadow: ' + ', '.join(matches).strip()
                    if new_line.endswith(';'):
                        new_lines.append(new_line)
                    else:
                        new_lines.append(new_line + ';')
                else:
                    pass
            else:
                pass
        else:
            new_lines.append(line)
            
    content = '\n'.join(new_lines)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Processed {target}")
