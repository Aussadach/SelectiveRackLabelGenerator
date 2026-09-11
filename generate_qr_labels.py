
import qrcode
from PIL import Image, ImageDraw, ImageFont

import io
import cairosvg
from pathlib import Path

# ตำแหน่งไฟล์ SVG ลูกศร
arrow_up_svg_path = "assets/UpArrow.svg"
arrow_down_svg_path = "assets/DownArrow.svg"


# สีตามระดับชั้น
level_colors_dark = {
    "1": (255, 102, 102),   # Red-ish
    "2": (102, 204, 102),   # Green-ish
    "3": (102, 153, 255),   # Blue-ish
   # "4": (255, 255, 102),   # Yellow-ish
    "4": (251, 96, 252),   # Yellow-ish
    "5": (255, 165, 0),     # Orange (Pastel)
    "6": (138, 43, 226),    # BlueViolet (Pastel)
}

# โฟลเดอร์ Output
output_folder_final = Path("qr_labels_final")
output_folder_final.mkdir(exist_ok=True)

# โหลดลูกศร SVG เป็น PNG ขนาด 84x84 คมชัด
def load_arrow_icons():
    up = Image.open(io.BytesIO(cairosvg.svg2png(url=arrow_up_svg_path, output_width=84, output_height=84))).convert("RGBA")
    down = Image.open(io.BytesIO(cairosvg.svg2png(url=arrow_down_svg_path, output_width=84, output_height=84))).convert("RGBA")
    return up, down

arrow_icon_up, arrow_icon_down = load_arrow_icons()
font_path = "assets/fonts/DejaVuSans-Bold.ttf"
font = ImageFont.truetype(font_path, 52)
font_adjusted = ImageFont.truetype(font_path, size=20)
small_font_adjusted = ImageFont.truetype(font_path, size=14)
arrow_icon_up_adjusted = arrow_icon_up.resize((56, 56))
arrow_icon_down_adjusted = arrow_icon_down.resize((56, 56))

def generate_location_label_crisp_arrow(plant, row, bay, level, side):
    inner_width = 280
    top_height = 160
    bottom_height = 60
    padding = 10
    container_padding = 16
    container_border_radius = 6
    inner_padding_x = 20
    col_margin = 40
    arrow_padding = 30
    col_ratios = [1.4, 1, 1, 1, 1]
    ratio_total = sum(col_ratios)
    # Re-render arrows directly to 84x84 from SVG without resizing later (preserve sharpness)
    arrow_icon_up_clean = Image.open(io.BytesIO(
        cairosvg.svg2png(url=arrow_up_svg_path, output_width=84, output_height=84)
    )).convert("RGBA")

    arrow_icon_down_clean = Image.open(io.BytesIO(
        cairosvg.svg2png(url=arrow_down_svg_path, output_width=84, output_height=84)
    )).convert("RGBA")

    # Confirm final size and image mode
    arrow_icon_up_clean.size, arrow_icon_up_clean.mode, arrow_icon_down_clean.size

    font_path = "assets/fonts/DejaVuSans-Bold.ttf"
    font = ImageFont.truetype(font_path, 52)
    font_adjusted = ImageFont.truetype(font_path, size=20)
    small_font_adjusted = ImageFont.truetype(font_path, size=14)
    arrow_icon_up_adjusted = arrow_icon_up.resize((56, 56))
    arrow_icon_down_adjusted = arrow_icon_down.resize((56, 56))

    bg_color = level_colors_dark.get(level, (160, 160, 160))
    white = (255, 255, 255)
    inner_height = top_height + bottom_height + padding
    label_width = inner_width + 2 * container_padding
    label_height = inner_height + 2 * container_padding

    label_img = Image.new("RGB", (label_width, label_height), white)
    draw = ImageDraw.Draw(label_img)
    draw.rounded_rectangle([(0, 0), (label_width, label_height)], radius=container_border_radius, fill=bg_color)

    inner_top_left = (container_padding, container_padding)
    content_img = Image.new("RGB", (inner_width, inner_height), white)
    content_draw = ImageDraw.Draw(content_img)

    qr_data = f"{plant}_{row}_{str(bay).zfill(2)}_{level}_{side}"
    qr = qrcode.QRCode(box_size=6, border=1)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

    qr_box_width = int((2 / 3) * inner_width)
    desired_qr_height = int((2 / 3) * top_height * 3)
    qr_img.thumbnail((desired_qr_height, desired_qr_height), Image.Resampling.LANCZOS)
    qr_box = Image.new("RGB", (qr_box_width, top_height), white)
    qr_x = (qr_box_width - qr_img.width) // 2
    qr_y = (top_height - qr_img.height) // 2
    qr_box.paste(qr_img, (qr_x, qr_y))
    content_img.paste(qr_box, (0, 0))

    arrow_area_width = inner_width - qr_box_width
    arrow_area = Image.new("RGB", (arrow_area_width, top_height), bg_color)
    content_img.paste(arrow_area, (qr_box_width, 0))

    arrow_icon = arrow_icon_down_clean if level == "1" else arrow_icon_up_clean
    arrow_center_x = qr_box_width + arrow_padding + (arrow_area_width - 2 * arrow_padding - arrow_icon.width) // 2
    arrow_center_y = arrow_padding + (top_height - 2 * arrow_padding - arrow_icon.height) // 2
    content_img.paste(arrow_icon, (arrow_center_x, arrow_center_y), arrow_icon)

    headers = ["PLANT", "ROW", "BAY", "LEVEL", "SIDE"]
    values = [plant, row, bay, str(level), side]
    usable_width = inner_width - 2 * inner_padding_x - col_margin * (len(headers) - 1)
    col_widths = [(r / ratio_total) * usable_width for r in col_ratios]
    x_pos = inner_padding_x

    for i, (header, value) in enumerate(zip(headers, values)):
        center_x = x_pos + col_widths[i] / 2
        content_draw.text((center_x - small_font_adjusted.getlength(header) / 2, top_height + 5),
                          header, fill="black", font=small_font_adjusted)
        value_y = top_height + 28
        if header == "LEVEL":
            value_box_width = font_adjusted.getlength(value) + 12
            content_draw.rectangle([
                (center_x - value_box_width / 2, value_y - 2),
                (center_x + value_box_width / 2, value_y + 22)
            ], fill=bg_color)
            content_draw.text((center_x - font_adjusted.getlength(value) / 2, value_y),
                              value, fill="white", font=font_adjusted)
        else:
            content_draw.text((center_x - font_adjusted.getlength(value) / 2, value_y),
                              value, fill="black", font=font_adjusted)
        x_pos += col_widths[i] + col_margin

    label_img.paste(content_img, inner_top_left)
    return label_img

# Save the updated label
def save_crisp_arrow_label(plant, row, bay, level, side):
    img = generate_location_label_crisp_arrow(plant, row, bay, level, side)
    filename = f"{plant}_{row}_{bay}_{level}_{side}.png"
    path = output_folder_final / filename
    img.save(path)
    return path

#final_preview_path = save_crisp_arrow_label("ANV1", "A", "01", 6, "L")
#final_preview_path