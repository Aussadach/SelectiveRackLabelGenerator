# Selective Rack Label Generator

Static web application สำหรับออกแบบผัง Selective Rack, สร้างรหัส Location และออกแบบป้าย QR/Barcode โดยทำงานใน browser ทั้งหมด ข้อมูลและรูปภาพของผู้ใช้ไม่ถูกส่งไป backend.

ใช้งานเวอร์ชันล่าสุดได้ที่ [GitHub Pages](https://aussadach.github.io/SelectiveRackLabelGenerator/).

## ความสามารถหลัก

- วาง Unit Rack และทางเดินบนกริดแบบ Isometric หรือ Top view พร้อม Zoom และหมุนมุมมอง
- กำหนด Plant, Row, Bay, Level และจำนวนตำแหน่ง `L/R` หรือ `S` ของแต่ละ Level
- ตรวจ Rack ที่ไม่มีทางเดินก่อนออกแบบหรือส่งออกป้าย
- นำเข้า CSV, XLS หรือ XLSX ที่มีคอลัมน์ `PLANT`, `ROW`, `BAY`, `LEVEL`, `SIDE`
- ออกแบบป้ายด้วย Layer สำหรับสี, Rectangle, ลูกศร, QR, Code128, ข้อความ และรูปภาพ
- กำหนดขนาดพิมพ์จริงเป็นเซนติเมตรหรือนิ้ว เลือก 150, 203, 300 หรือ 600 PPI และดูขนาด Pixel ที่คำนวณได้ (ค่าเริ่มต้น 300 PPI)
- เลือก Layer หลายรายการด้วย `Ctrl/Shift + Click` แล้วลบพร้อมกันด้วยปุ่มบนหน้าจอหรือปุ่ม `Delete`
- ส่งออก SVG, PNG, ZIP, CSV, Excel และพิมพ์เป็น PDF จาก browser โดย SVG/Print เก็บขนาดจริงและ PNG ใช้จำนวน Pixel ตาม PPI
- รวมป้ายที่มี Plant, Row, Bay และ Side เดียวกันตาม Level ได้ทั้งแนวตั้งและแนวนอน
- บันทึกและเปิดงานต่อด้วยไฟล์ JSON

## เริ่มพัฒนา

ต้องใช้ Node.js 22.12 ขึ้นไป จาก root ของ repository ให้รัน:

```sh
npm install
npm run dev
```

คำสั่งตรวจสอบและ build:

```sh
npm test
npm run build
```

ไฟล์ static ที่ build แล้วอยู่ใน `dist/`. แอปต้องเปิดผ่าน HTTP server เช่น Vite หรือ GitHub Pages.

## โครงสร้าง Repository

```text
.
├── .github/workflows/pages.yml  # Test, build และ deploy GitHub Pages
├── examples/                    # CSV ตัวอย่างสำหรับ regression test
├── src/
│   ├── main.js                  # UI, state และ interaction
│   ├── model.js                 # Rack/location model และ validation
│   ├── labels.js                # SVG/PNG/QR/Barcode renderer
│   ├── model.test.js            # Unit tests
│   ├── style.css                # Styles หลัก
│   └── enhancements.css         # Styles ของ Rack builder และ feature เพิ่มเติม
├── index.html
├── package.json
└── vite.config.js
```

Repository นี้เป็น Web application เท่านั้นและไม่มี Python runtime หรือ backend.

## รูปแบบไฟล์นำเข้า

ดาวน์โหลด CSV ตัวอย่างจากปุ่ม **ไฟล์ตัวอย่าง** ในแอป หรือดู [examples/location-import-example.csv](examples/location-import-example.csv). ค่าที่รองรับ:

- `PLANT` และ `ROW`: ตัวอักษรอังกฤษ ตัวเลข หรือ `-`
- `BAY` และ `LEVEL`: จำนวนเต็มตั้งแต่ 1 ขึ้นไป
- `SIDE`: `L`, `R` หรือ `S`

รหัส Location ถูกสร้างในรูปแบบ `PLANT_ROW_BAY_LEVEL_SIDE` โดยเติม Bay ให้มีอย่างน้อย 2 หลัก.

## รูปแบบไฟล์ส่งออก

หน้า **ตรวจสอบ & ส่งออก** เลือกรูปแบบ CSV/Excel ได้ 2 แบบ:

- รูปแบบเดียวกับไฟล์ `Location Rack subplant.xlsx`: `SubPlant`, `RackCode`, `TopReserveBy`, `BottomReserveBy` โดยสองคอลัมน์ Reserve เว้นว่างไว้สำหรับกรอกต่อ
- รูปแบบรายละเอียด Location: `PLANT`, `ROW`, `BAY`, `LEVEL`, `SIDE`, `Location_Code`

Excel แบบ SubPlant ใช้ชื่อ Sheet `Sheet1` และเรียงคอลัมน์ตรงกับไฟล์ตัวอย่างที่แนบมา.

## การ Deploy

Workflow [pages.yml](.github/workflows/pages.yml) ทำงานเมื่อ push ไปที่ `master` หรือ `main` โดยติดตั้ง dependency, รัน test, build และ deploy โฟลเดอร์ `dist/` ไป GitHub Pages.

ข้อมูล Rack, CSV/Excel, รูปภาพ และไฟล์ JSON ถูกประมวลผลภายใน browser. ควรบันทึกไฟล์งาน JSON ก่อนปิดหน้า เพราะแอปไม่มี autosave หรือฐานข้อมูล.
