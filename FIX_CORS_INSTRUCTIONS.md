# Hướng dẫn fix lỗi CORS và 500 Error

## Các thay đổi đã thực hiện:

### 1. **Thêm Proxy Configuration**
- Đã thêm proxy trong `package.json` để forward requests từ localhost đến backend server
- Đã update `.env` để sử dụng relative URL `/api` thay vì full URL

### 2. **Enhanced Validation**
- Validate tất cả required fields trước khi gửi request
- Validate GUID format cho customerId, dealerId, userProfileId
- Validate amounts (phải > 0)
- Validate date format

### 3. **Better Error Handling**
- Chi tiết error messages
- Log đầy đủ request/response để debug
- Type conversion cho tất cả fields (Number, String, Boolean)

### 4. **Data Formatting**
- Trim whitespace từ code
- Convert numbers properly
- Handle multiple date formats
- Remove null quotationId (chỉ gửi khi có giá trị)

## ⚠️ QUAN TRỌNG: Cần restart dev server để proxy có hiệu lực

### Các bước thực hiện:

1. **Dừng server hiện tại**
   ```bash
   # Nhấn Ctrl+C trong terminal đang chạy react app
   ```

2. **Xóa cache (optional nhưng recommended)**
   ```bash
   # Windows
   rmdir /s /q node_modules\\.cache

   # Linux/Mac
   rm -rf node_modules/.cache
   ```

3. **Start lại server**
   ```bash
   npm start
   ```

4. **Clear browser cache**
   - Mở DevTools (F12)
   - Right click vào Refresh button
   - Chọn "Empty Cache and Hard Reload"
   - Hoặc nhấn Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

5. **Kiểm tra trong Console**
   - Mở DevTools Console (F12)
   - Khi tạo order, sẽ thấy các logs:
     ```
     ✅ All IDs validated as proper GUIDs
     📤 Creating order with data: {...}
     📤 Request will be sent to: /api/v1/Orders
     ```

## 🔍 Nếu vẫn còn lỗi:

### A. Kiểm tra Backend
1. Backend có đang chạy không?
2. Check backend logs xem lỗi gì (có thể là validation error từ backend)
3. Verify backend API endpoint: `https://evm-redg.onrender.com/api/v1/Orders`

### B. Kiểm tra Data
1. Mở Console và xem logged data
2. Copy request body và test trực tiếp bằng Postman/Thunder Client
3. So sánh với API requirements trong hình 5.png

### C. Temporary Workaround (nếu CORS vẫn còn)
Nếu proxy không work, có thể:

**Option 1: Use CORS extension**
- Install "CORS Unblock" extension cho Chrome/Edge
- Enable nó khi dev

**Option 2: Update .env về full URL**
```env
REACT_APP_API_BASE_URL=https://evm-redg.onrender.com/api
```
Và xóa dòng proxy trong package.json

Nhưng cách này vẫn bị CORS nếu backend không config đúng.

### D. Backend phải có CORS headers
Backend cần có:
```csharp
// In Startup.cs or Program.cs
app.UseCors(builder => 
    builder.WithOrigins("http://localhost:3000")
           .AllowAnyMethod()
           .AllowAnyHeader()
           .AllowCredentials()
);
```

## 📝 Debug Checklist

Khi test lại, check những điều sau:

- [ ] Dev server đã restart
- [ ] Browser cache đã clear
- [ ] Console không còn CORS error
- [ ] Request được gửi đến `/api/v1/Orders` (relative URL)
- [ ] Logged request body có đầy đủ fields và đúng format
- [ ] Tất cả GUIDs đều hợp lệ
- [ ] Date format đúng ISO 8601
- [ ] Backend đang chạy và accessible

## 🎯 Expected Console Output

Khi mọi thứ hoạt động đúng, console sẽ hiển thị:

```
✅ All IDs validated as proper GUIDs
- customerId: c2b37f2e-b9cc-4fc1-b7be-d88c5e7385ce
- dealerId: 990a534c-8e7b-4777-aa26-3ed99b052b45
- userProfileId: 3a91089d-3d11-4e5f-954f-91e87a08b3ae

📤 Creating order with data: {
  "code": "O111",
  "customerId": "c2b37f2e-b9cc-4fc1-b7be-d88c5e7385ce",
  "dealerId": "990a534c-8e7b-4777-aa26-3ed99b052b45",
  ...
}

📤 Request will be sent to: /api/v1/Orders
🔍 Validating order data before sending...
✅ All required fields present
✅ Create order response: { success: true, data: {...} }
```

## 📞 Nếu cần support thêm

Gửi screenshot của:
1. Full console logs (F12 -> Console tab)
2. Network tab showing the failed request
3. Request payload và response

Good luck! 🚀
