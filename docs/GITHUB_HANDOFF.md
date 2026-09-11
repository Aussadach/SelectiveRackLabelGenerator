# งานพร้อมรันต่อใน GitHub workspace

Root ของ Git repo จริงคือโฟลเดอร์ `QRcodeGenerator` ข้างในมี `web/`, `.github/workflows/pages.yml`, `WEB_README.md`, `docs/` และ Python เดิม. ยังไม่มี remote และยังไม่ได้ push. เก็บไฟล์ Python ที่แก้และ staged ไว้เดิมตามเดิม.

## คำสั่งที่ให้คุณรัน

จาก terminal ที่ root ของ repo ใน Codespaces:

```sh
cd web
npm install
npm test
npm run build
npm run dev:cloud
```

ใช้ Node.js 22.12 ขึ้นไป. เปิดแท็บ Ports → port 5173 → Open in Browser. ตั้ง visibility เป็น Private ได้. หาก Vite เลือก port อื่นให้ใช้ port ตาม terminal.

เมื่อ npm install สำเร็จ ให้เก็บ `web/package-lock.json` เข้า Git ด้วย; ครั้งถัดไปใช้ `npm ci`. ไม่ต้อง commit `node_modules`, `dist` หรือ `.npm-cache`.

SheetJS ดาวน์โหลดจาก official CDN `cdn.sheetjs.com` ส่วนไลบรารีอื่นจาก npm registry. ยังไม่ได้ติดตั้งหรือทดสอบ dependency integration ในเครื่องเดิมเนื่องจาก network timeout. หากพบ error ให้ส่ง output ของ npm install/test/build กลับมาเพื่อแก้ต่อ.

## สถานะการตรวจสอบ

- ผ่าน model tests 4 กรณี รวม CSV จริง, L/R/S, zero capacity, duplicate detection.
- ผ่าน JavaScript syntax check.
- ยังไม่ได้รัน production build, ทดสอบ UI ใน browser, PNG/ZIP/printing หรือสแกน QR จริง.
- เป็น implementation ชุดแรกที่ต้องตรวจ integration ใน Codespaces ก่อนนำไปใช้จริง.

## ตรวจใน browser หลังเปิดได้

1. เพิ่ม Row/Bay/Level, สลับ 3 views, ลาก Row ใน Top view.
2. เลือกช่อง ตั้งค่า 0/1/2 และตรวจจำนวน Location กับรหัส L/R/S.
3. นำเข้า Resource/ตารางป้ายเก่าใหม่2.csv และ Excel เทียบจำนวนรายการ.
4. อัปโหลดรูป Template, เพิ่ม QR/Barcode/ข้อความ, ลาก/ปรับขนาดและจัด layer.
5. บันทึก project JSON และเปิดใหม่ ตรวจค่ากลับมาครบ.
6. ส่งออก PNG/SVG/ZIP, สแกน QR/Code128 ด้วยอุปกรณ์หน้างาน เทียบ payload กับตาราง.
7. พิมพ์ทดสอบและวัดขนาดก่อนใช้กับสติกเกอร์จริง.

## GitHub Pages

หลัง commit/push โค้ดแล้ว ให้เลือก Settings → Pages → Source: GitHub Actions. Workflow รองรับ main/master และ workflow_dispatch. ติดตั้งด้วย npm install หากยังไม่มี lockfile; เมื่อมี lockfile จะใช้ npm ci. ส่งออกเฉพาะ web/dist เป็นเว็บ static. ไม่มีการเผยแพร่จากเครื่องเดิม.
