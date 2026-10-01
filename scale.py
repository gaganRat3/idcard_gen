import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# The PDF section starts around line 660: /* ============================================= PDF HIDDEN PAGES
pdf_start = css.find('PDF HIDDEN PAGES')
pre_css = css[:pdf_start]
pdf_css = css[pdf_start:]

def scale_match(m):
    val = float(m.group(1))
    unit = m.group(2)
    # Don't scale if it's the page width/height, grid dimensions, etc.
    # We already hand-coded .pdf-page, .pdf-grid, .pdf-card.
    # Let's just avoid scaling values larger than 100 to be safe, since fonts/margins are small.
    if unit == 'px' and val > 150:
        return m.group(0) # don't change
        
    new_val = val * 1.333
    
    if unit == 'px':
        return f"{round(new_val)}{unit}"
    else:
        return f"{round(new_val, 2)}{unit}"

pdf_css_scaled = re.sub(r'(?<!\w)(\d+(?:\.\d+)?)(px|rem)', scale_match, pdf_css)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(pre_css + pdf_css_scaled)
print("Scaled PDF CSS")
