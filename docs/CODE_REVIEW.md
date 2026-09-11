# วิเคราะห์โค้ดเดิมและแนวทางเว็บ

ตรวจไฟล์ source ทั้งหมด: main.py, generate_qr_labels.py, pyproject.toml, requirements.txt, README.md (ว่าง), ตัวอย่าง CSV, arrow SVG และรายการ assets/output. uv.lock เป็น lock dependency; PNG และ font เป็นทรัพยากร ไม่ใช่ source logic.

## พฤติกรรมเดิม

- main.py อ่าน CSV ที่ hardcode ใน Resource, uppercase column names, sort BAY/SIDE แล้วแปลงค่าทั้งหมดเป็น string. ไม่ได้อ่าน Excel แม้มีไฟล์ xlsx ใน Resource.
- generate_qr_labels.py ใช้ Pillow สร้างภาพ 312 × 262 px, qrcode สร้าง payload PLANT_ROW_BAY_LEVEL_SIDE โดยเติม BAY เป็น 2 หลัก, CairoSVG วาดลูกศร และ DejaVuSans ทำข้อความ.
- LEVEL 1–6 ใช้สี #ff6666, #66cc66, #6699ff, #fb60fc, #ffa500, #8a2be2; นอกช่วงใช้เทา. ชั้น 1 ลูกศรลง ที่เหลือลูกศรขึ้น.
- ตัวสร้างไม่สร้าง L/R เอง: อ่าน SIDE จาก CSV. ไม่มีแบบจำลอง rack/capacity, GUI, template editor, validation หรือระบบ stock.

## ข้อบกพร่องและความเสี่ยง

1. main.py รวมภาพเมื่อ LEVEL ของแถวถัดไปลดลง แทน groupby PLANT/ROW/BAY/SIDE. sort ไม่รวม PLANT, ROW, LEVEL และไม่ได้กำหนด stable sort จึงไม่รับประกันกลุ่มหรือการเรียงชั้น.
2. ชื่อภาพใช้แถว index-1 แทน key กลุ่ม; กรณีหนึ่งแถวใช้ index -1. มีความเสี่ยงตั้งชื่อไม่ตรง/เขียนทับเมื่อกลุ่มไม่ถูกต้อง.
3. QR box สูง 160 แต่ภาพ QR อนุญาต thumbnail สูง 320; QR box paste อาจมี offset ติดลบและตัด QR. ใช้ border=1 แทน quiet zone 4 modules และ resampling QR อาจลดความคม.
4. โหลด arrow/font ซ้ำทุกป้าย, มี import side effect สร้าง directory และโหลด assets. Relative paths ผูก working directory; Windows path string ใช้ backslash escape.
5. ไม่มีตรวจ missing columns, nulls, duplicate Location, invalid level/side, file error. pandas อาจทำเลขเป็นทศนิยมก่อน stringify หากมี missing values.
6. CSV ตารางป้ายเก่าใหม่.csv มี Location_Code แบบ PS1_A12_1_L แต่ generator สร้าง PS1_A_12_1_L. เวอร์ชัน 2 ใช้แบบมี underscore. เว็บยึด generator/เวอร์ชัน 2 และสร้าง Location_Code ใหม่จาก 5 fields ไม่เชื่อคอลัมน์ที่คำนวณเดิม.
7. anv1/anv2_location_codes.csv เป็น matrix ของรหัสไม่มี LEVEL และมีช่องว่าง/รหัสซ้ำ จึงไม่ควรเดาชั้นจากบรรทัด. เว็บแสดง error พร้อมคำแนะนำให้แปลงเป็น 5 columns.
8. requirements.txt ไม่ pin versions; pyproject/uv.lock เป็นอีกแนวทางติดตั้งและต้องการ Python >=3.13. README เดิมไม่มีวิธีใช้งาน.

## แอปใหม่

แยกเป็น Vite static bundle พร้อม local file parsing (SheetJS), model ที่ตรวจข้อมูล, SVG-based label export, QRCode, Code128 และ JSZip. รักษา payload/สี/ลูกศรเดิม แก้ quiet zone และแยกแต่ละ Location เป็นภาพชัดเจน. งานบันทึกเป็น JSON รวม template และ components; ไม่มี network storage. Rack grid เป็น schematic ใช้เปลี่ยนจำนวนตำแหน่ง ไม่ใช่ CAD หรือ stock transaction system.

แยก source: model.js (location/import), labels.js (SVG/PNG/QR/barcode), main.js (UI/interactions), style.css (layout). Workflow build เป็น relative paths สำหรับ GitHub project Pages.
