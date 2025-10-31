# Contract Feature Implementation for EVM Staff

## ✅ Completed:

### 1. Updated CreateContractModal (`src/features/evm-staff/components/CreateContractModal.jsx`)
**Changes:**
- Removed quotation validation (can create contract without quotation)
- Added `code` field (tên hợp đồng)
- Removed `contractLink` field from form
- Set `status` to `PENDING_SIGNATURE`
- customerId, signedAt, contractLink remain null/empty
- Navigate to `/evm-staff/contracts` after success

**Request Body:**
```json
{
  "code": "user-input",
  "orderId": "from-order",
  "createdByUserId": "from-user",
  "terms": "user-input",
  "status": "PENDING_SIGNATURE"
}
```

## 🚧 Remaining Tasks:

### 2. Update EvmStaffContractDetailPage
**File:** `src/features/evm-staff/pages/EvmStaffContractDetailPage.jsx`

**Add features:**
1. **PDF Upload Section** (copy from dealer-staff ContractDetailPage.jsx):
   ```jsx
   {contract.status === 'PENDING_SIGNATURE' && (
     <Card title="Upload PDF Hợp Đồng">
       <FileUpload
         onUploadSuccess={handlePdfUpload}
         accept=".pdf"
       />
     </Card>
   )}
   ```

2. **Handle PDF Upload:**
   ```javascript
   const handlePdfUpload = async (fileUrl) => {
     try {
       const updateData = {
         ...contract,
         contractLink: fileUrl,
         status: 'ACTIVE',
         signedAt: new Date().toISOString()
       };
       
       const response = await contractService.updateContract(
         contract.id,
         updateData
       );
       
       if (response.success) {
         message.success('Upload thành công! Hợp đồng đã được kích hoạt');
         fetchContractDetails(); // refresh
       }
     } catch (error) {
       message.error('Lỗi khi upload PDF');
     }
   };
   ```

### 3. Add Cancel Feature to EvmStaffContractsPage
**File:** `src/features/evm-staff/pages/EvmStaffContractsPage.jsx`

**Update `handleDeleteConfirm`:**
```javascript
const handleDeleteConfirm = async () => {
  if (!contractToDelete) return;
  
  setIsDeleting(true);
  try {
    // Update status to CANCELED instead of deleting
    const updateData = {
      ...contractToDelete,
      status: 'CANCELED'
    };
    
    const response = await contractService.updateContract(
      contractToDelete.id,
      updateData
    );
    
    if (response.success) {
      showSuccess('Đã hủy hợp đồng');
      fetchContracts(); // refresh list
    }
  } catch (error) {
    showError('Lỗi khi hủy hợp đồng');
  } finally {
    setIsDeleting(false);
    setShowDeleteModal(false);
  }
};
```

### 4. Add "Tạo hợp đồng" button to EvmStaffOrdersPage
**File:** `src/features/evm-staff/pages/EvmStaffOrdersPage.jsx`

**Find the actions section and add:**
```jsx
{order.status === 'AWAITING_DEPOSIT' && order.quotation && (
  <button
    onClick={() => handleCreateContract(order)}
    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
  >
    <FileText size={16} />
    Tạo hợp đồng
  </button>
)}

// Handler:
const handleCreateContract = (order) => {
  setSelectedOrderForContract(order);
  setShowContractModal(true);
};
```

## 📝 Flow Summary:

1. **EVM Staff creates contract:**
   - From Orders page → Click "Tạo hợp đồng"
   - Fill in: code (tên HĐ), terms (điều khoản)
   - Status = PENDING_SIGNATURE
   - Navigate to Contracts page

2. **View contract detail:**
   - Click on contract in list
   - See all contract info
   - If status = PENDING_SIGNATURE → show upload section

3. **Upload PDF:**
   - Choose PDF file
   - Upload to server
   - Automatically:
     - Update contractLink = file URL
     - Update status = ACTIVE
     - Update signedAt = now

4. **Cancel contract:**
   - Click delete button in contracts list
   - Update status = CANCELED

## 🔧 Files to modify:

1. ✅ `src/features/evm-staff/components/CreateContractModal.jsx` - DONE
2. ⏳ `src/features/evm-staff/pages/EvmStaffContractDetailPage.jsx` - ADD UPLOAD
3. ⏳ `src/features/evm-staff/pages/EvmStaffContractsPage.jsx` - UPDATE CANCEL
4. ⏳ `src/features/evm-staff/pages/EvmStaffOrdersPage.jsx` - ADD BUTTON

## 🎯 Testing Checklist:

- [ ] Create contract from order
- [ ] Navigate to contracts page
- [ ] View contract detail
- [ ] Upload PDF (status → ACTIVE, signedAt set)
- [ ] Cancel contract (status → CANCELED)
- [ ] Download PDF after upload

## 📚 Reference:

- Dealer Staff ContractDetailPage: `src/features/dealer-staff/pages/ContractDetailPage.jsx`
- Dealer Staff ContractsPage: `src/features/dealer-staff/pages/ContractsPage.jsx`
- API images: `assets/images/5.png` (POST /api/v1/Contracts)
