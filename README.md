# Rack Label Studio

แอปใหม่อยู่ใน `web/` ส่วน Python เดิมอยู่ที่ root ของ repo นี้.

## เริ่มใช้งาน

ใช้ Node.js 22.12 ขึ้นไป แล้วรันในโฟลเดอร์ `web`:

```sh
npm install
npm run dev
```

เปิด URL ที่แสดงใน terminal. ใช้ `npm test` ตรวจตรรกะ Location และ `npm run build` สร้าง static files ใน `web/dist`. ต้องเปิดผ่าน HTTP server ไม่ใช่ดับเบิลคลิก index.html.

## GitHub Pages

Push repository นี้ไป GitHub ตั้งค่า Settings → Pages → Source เป็น GitHub Actions. Workflow `.github/workflows/pages.yml` จะ build/test และเผยแพร่เมื่อ push ไป main/master หรือกด Run workflow. หากใช้ branch อื่นให้เปลี่ยน branches ใน workflow. Repository: https://github.com/Aussadach/SelectiveRackLabelGenerator

ไฟล์ build ใช้ relative asset paths รองรับ `https://USER.github.io/REPOSITORY/`. ไม่มี backend, API key, login หรือฐานข้อมูล. Libraries รวมอยู่ใน build; ข้อมูล CSV/Excel และภาพไม่ได้ส่งไป server. กดบันทึกงานเพื่อดาวน์โหลด JSON ก่อนปิดหน้า ไม่มี autosave.

## การใช้งาน

1. ตั้ง Plant, เพิ่ม Row/Zone, Bay และ Level; สลับ Top/Side/Isometric. Top view ลากแถวเพื่อจัดผัง. คลิกช่องแล้วเลือกปิดช่อง, 1 ตำแหน่ง S, หรือ 2 ตำแหน่ง L/R. ใช้กับทุกช่องในแถวได้.
2. หรือนำเข้า CSV/XLS/XLSX แผ่นงานแรก ต้องมี PLANT, ROW, BAY, LEVEL, SIDE (ไม่สนตัวพิมพ์เล็กใหญ่). รายการนำเข้าใช้สร้างป้ายโดยตรง ไม่สร้างผัง Rack จากข้อมูลที่ไม่มีพิกัด. กด “ใช้ Location จาก Layout” เพื่อกลับมาใช้ผัง.
3. ออกแบบป้าย: อัปโหลด PNG/JPEG/WebP ได้ไม่เกิน 10 MB. ภาพถูกย่อไม่เกิน 2000 px และใช้เป็นชั้นพื้นหลัง. ภาพถูกยืดตามขนาดป้าย; ปรับอัตราส่วนป้ายให้ตรงภาพเพื่อไม่ให้บิดเบี้ยว. อัปโหลดภาพจะนำพื้นสีเริ่มต้นออก เพื่อให้เห็นภาพ.
4. เพิ่ม/ลาก/ปรับขนาด Rectangle, สีตามชั้น, ลูกศร, QR, Code128 Barcode, PLANT, ROW, BAY, LEVEL, SIDE, LOCATION. จัดชั้นหน้าหลัง เปลี่ยนสีและพื้นหลังโปร่งใสได้. QR/Barcode มีพื้นขาวและ quiet zone ภายในเพื่ออ่านได้.
5. ส่งออก CSV, Excel, SVG, PNG 2x, ZIP รวม PNG หรือพิมพ์/Save as PDF ผ่าน browser. ป้ายในหน้าพิมพ์กว้าง 190 mm บน A4; ปรับ scale ใน print dialog ตามขนาดสติกเกอร์. ทดสอบพิมพ์และสแกนจริงก่อนผลิตจำนวนมาก โดยเฉพาะเมื่อวาง layer ทับ QR หรือย่อขนาดมาก.

## ความสามารถของผังและการส่งออก

- Top view มีเครื่องมือวาง Row และทางเดินได้ทั้งแนวนอนและแนวตั้ง คลิกพื้นที่ว่างเพื่อวาง แล้วลากจัดตำแหน่ง
- Side view ใช้ปุ่มซ้าย/ขวาเพื่อดู Row ถัดไป และแต่ละ Bay กำหนดจำนวน Level แยกกันได้
- การเปลี่ยนขนาดป้ายเปลี่ยนเฉพาะ Canvas; Component คงตำแหน่งและขนาดเดิม
- ป้ายรวมจัดกลุ่มตาม PLANT + ROW + BAY + SIDE แล้วต่อ Level จากน้อยไปมากได้ทั้งแนวตั้งและแนวนอน
- ดาวน์โหลด `location-import-template.csv` จากหน้าสร้างพื้นที่เพื่อใช้เป็นแบบกรอกข้อมูล

SIDE S เป็นกติกาใหม่สำหรับช่องเดี่ยว ต้องตรวจว่าระบบปลายทางรองรับ. QR ยังเป็นรหัสตำแหน่ง ไม่ใช่ระบบบันทึกรับเข้า/จ่ายออกหรือจัดการ stock. Row รองรับ 1–30 bays, 1–12 levels. ชุดป้ายจำนวนมากอาจใช้เวลาและหน่วยความจำมากจากภาพ PNG 2x.

รายละเอียดวิเคราะห์โค้ดเดิม: `docs/CODE_REVIEW.md`.

## ทำต่อใน GitHub Codespaces

ดูคำสั่งและรายการตรวจสอบใน docs/GITHUB_HANDOFF.md. การ install/build และ UI ยังไม่ได้ตรวจเนื่องจาก npm registry เชื่อมต่อไม่ได้ในเครื่องพัฒนา.


