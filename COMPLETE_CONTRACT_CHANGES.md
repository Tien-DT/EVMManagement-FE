# Complete Contract Feature Changes for EVM Staff

## ✅ DONE - CreateContractModal Updated

## 🔧 REMAINING CODE CHANGES:

### 1. Update EvmStaffContractDetailPage.jsx

Add after line 80 (after imports and initial functions):

```javascript
// Add import
import FileUpload from '../../../components/FileUpload';
import { contractService } from '../../dealer-staff/services/contractService';

// Add upload handler function after fetchContractDetails():
const handlePdfUpload = async (fileUrl) => {
  try {
    showSuccess('Đang cập nhật hợp đồng...');
    
    // Update contract with PDF link, set status to ACTIVE, and set signedAt
    const updateData = {
      code: contract.code,
      orderId: contract.orderId,
      customerId: contract.customerId,
      createdByUserId: contract.createdByUserId,
      terms: contract.terms,
      status: 'ACTIVE',  // Change to ACTIVE
      signedAt: new Date().toISOString(),  // Set signed time
      contractLink: fileUrl  // Set PDF URL
    };
    
    const response = await contractService.updateContract(
      contract.id,
      updateData
    );
    
    if (response.success || response.data) {
      showSuccess('Upload thành công! Hợp đồng đã được kích hoạt.');
      fetchContractDetails(); // Refresh to show new status
    } else {
      throw new Error('Không thể cập nhật hợp đồng');
    }
  } catch (error) {
    console.error('Error updating contract:', error);
    showError('Lỗi khi upload PDF hợp đồng');
  }
};
```

Then in the JSX render (find the section showing contract details and add this AFTER the contract info cards):

```jsx
{/* PDF Upload Section - Only show if status is PENDING_SIGNATURE */}
{contract.status === 'PENDING_SIGNATURE' && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
    <div className="flex items-center gap-2 mb-4">
      <FileText className="text-blue-600" size={20} />
      <h3 className="text-lg font-semibold text-gray-900">
        Upload Hợp Đồng PDF
      </h3>
    </div>
    
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-yellow-800">
        <strong>Lưu ý:</strong> Sau khi upload PDF thành công, trạng thái hợp đồng 
        sẽ tự động chuyển sang "Đang hoạt động" và thời gian ký sẽ được ghi nhận.
      </p>
    </div>
    
    <FileUpload
      onUploadSuccess={handlePdfUpload}
      accept=".pdf"
      maxSize={10} // 10MB
    />
  </div>
)}

{/* Show PDF Download if contractLink exists */}
{contract.contractLink && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="text-green-600" size={20} />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Hợp Đồng PDF
          </h3>
          <p className="text-sm text-gray-600">
            Đã ký vào: {contract.signedAt ? 
              new Date(contract.signedAt).toLocaleString('vi-VN') : 
              'N/A'}
          </p>
        </div>
      </div>
      
      <a
        href={contract.contractLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FileText size={18} />
        Tải xuống PDF
      </a>
    </div>
  </div>
)}
```

### 2. Update EvmStaffContractsPage.jsx

Find the `handleDeleteConfirm` function (around line 100) and REPLACE it with:

```javascript
const handleDeleteConfirm = async () => {
  if (!contractToDelete) return;
  
  setIsDeleting(true);
  try {
    // Update status to CANCELED instead of actually deleting
    const updateData = {
      code: contractToDelete.code,
      orderId: contractToDelete.orderId,
      customerId: contractToDelete.customerId,
      createdByUserId: contractToDelete.createdByUserId,
      terms: contractToDelete.terms,
      status: 'CANCELED',  // Set to CANCELED
      signedAt: contractToDelete.signedAt,
      contractLink: contractToDelete.contractLink
    };
    
    const response = await contractService.updateContract(
      contractToDelete.id,
      updateData
    );
    
    if (response.success || response.data) {
      showSuccess('Đã hủy hợp đồng thành công');
      fetchContracts(); // Refresh list
    } else {
      throw new Error('Không thể hủy hợp đồng');
    }
  } catch (error) {
    console.error('Error canceling contract:', error);
    showError('Lỗi khi hủy hợp đồng');
  } finally {
    setIsDeleting(false);
    setShowDeleteModal(false);
    setContractToDelete(null);
  }
};
```

Also add this import at the top:

```javascript
import { contractService } from '../../dealer-staff/services/contractService';
```

### 3. Verify EvmStaffOrdersPage.jsx

Check if the "Tạo hợp đồng" button exists in the actions section. It should already be there based on the CreateContractModal import we saw. 

Find the section with order actions (around line 400-500) and ensure this button exists:

```jsx
{order.status === 'AWAITING_DEPOSIT' && order.quotation && (
  <button
    onClick={() => {
      setSelectedOrderForContract(order);
      setSelectedQuotation(order.quotation);
      setShowContractModal(true);
    }}
    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
  >
    <FileText size={16} />
    Tạo hợp đồng
  </button>
)}
```

And the modal should be at the bottom:

```jsx
{showContractModal && selectedOrderForContract && (
  <CreateContractModal
    visible={showContractModal}
    onClose={() => {
      setShowContractModal(false);
      setSelectedOrderForContract(null);
      setSelectedQuotation(null);
    }}
    order={selectedOrderForContract}
    quotation={selectedQuotation}
  />
)}
```

## 🎯 SUMMARY OF FLOW:

1. **EVM Staff Orders Page** → Click "Tạo hợp đồng" button
2. **CreateContractModal popup** → Enter code + terms → Submit
3. **Auto navigate** → `/evm-staff/contracts` page
4. **Contracts List** → Click to view detail
5. **Contract Detail Page** → Upload PDF (if status = PENDING_SIGNATURE)
6. **After upload** → Status changes to ACTIVE, signedAt is set
7. **To cancel** → Click delete in list → Status changes to CANCELED

## ✨ KEY FEATURES:

- ✅ Create contract without quotation requirement
- ✅ Auto navigate to contracts page after creation
- ✅ Upload PDF → Auto update status to ACTIVE + set signedAt
- ✅ Delete contract → Update status to CANCELED (soft delete)
- ✅ Download PDF if contract has contractLink

## 🔑 API Endpoints Used:

- POST `/api/v1/Contracts` - Create contract
- PUT `/api/v1/Contracts/{id}` - Update contract (for upload & cancel)
- GET `/api/v1/Contracts/{id}` - Get contract details
- GET `/api/v1/Contracts` - List contracts

## 📋 Testing Steps:

1. Login as EVM Staff
2. Go to Orders page
3. Find order with "Đã gửi báo giá" status
4. Click "Tạo hợp đồng"
5. Fill form and submit → Should navigate to /evm-staff/contracts
6. Click on the new contract
7. Upload a PDF file
8. Verify status changes to "Active" and signedAt is set
9. Go back to contracts list
10. Click delete on any contract
11. Verify status changes to "Canceled"

Done! 🚀
