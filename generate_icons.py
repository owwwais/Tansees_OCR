from PIL import Image, ImageDraw

def draw_quotes(size, filename):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    coral = (239, 131, 84, 255)
    
    # Dimensions for quotes
    qw = size * 0.2
    qh = size * 0.2
    
    # Left quote
    lx = size * 0.25
    ly = size * 0.35
    draw.ellipse([lx, ly, lx+qw, ly+qh], fill=coral)
    draw.polygon([(lx+qw*0.5, ly+qh*0.8), (lx+qw, ly+qh*0.8), (lx, ly+qh*1.8)], fill=coral)
    
    # Right quote
    rx = size * 0.55
    draw.ellipse([rx, ly, rx+qw, ly+qh], fill=coral)
    draw.polygon([(rx+qw*0.5, ly+qh*0.8), (rx+qw, ly+qh*0.8), (rx, ly+qh*1.8)], fill=coral)
    
    img.save(f"static/{filename}")

draw_quotes(192, "icon-192x192.png")
draw_quotes(512, "icon-512x512.png")
draw_quotes(32, "favicon-32x32.png")
draw_quotes(16, "favicon-16x16.png")

# Generate ICO
img_ico = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img_ico)
coral = (239, 131, 84, 255)
qw = 32 * 0.2
qh = 32 * 0.2
lx = 32 * 0.25; ly = 32 * 0.35
draw.ellipse([lx, ly, lx+qw, ly+qh], fill=coral)
draw.polygon([(lx+qw*0.5, ly+qh*0.8), (lx+qw, ly+qh*0.8), (lx, ly+qh*1.8)], fill=coral)
rx = 32 * 0.55
draw.ellipse([rx, ly, rx+qw, ly+qh], fill=coral)
draw.polygon([(rx+qw*0.5, ly+qh*0.8), (rx+qw, ly+qh*0.8), (rx, ly+qh*1.8)], fill=coral)
img_ico.save("static/favicon.ico")

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text x="50" y="85" font-family="sans-serif" font-size="100" font-weight="bold" fill="#ef8354" text-anchor="middle">"</text>
</svg>"""
with open("static/favicon.svg", "w") as f:
    f.write(svg_content)

print("Icons generated successfully.")
