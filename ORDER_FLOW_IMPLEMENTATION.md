# Order Flow Implementation - Cần bổ sung

## 📋 Flow yêu cầu của User:

```
1. CONFIRMED (Dealer tạo order)
   → EVM: Nút "Tạo báo giá" ✅ ĐÃ CÓ

2. QUOTATION_RECEIVED (EVM tạo quotation xong)
   → EVM: Hiện "Đã gửi báo giá" 
   → Dealer: Hiện "Đã nhận báo giá" + Nút "Chấp nhận báo giá"
   ❌ CHƯA CÓ STATUS NÀY

3. QUOTATION_ACCEPTED (Dealer chấp nhận báo giá)
   → EVM: Nút "Tạo hợp đồng"
   ❌ CHƯA CÓ STATUS NÀY

4. CREATED_CONTRACT (EVM tạo contract)
   → EVM: Vào chi tiết contract → Nút "Tải hợp đồng PDF"
   ❌ CHƯA CÓ STATUS NÀY

5. SIGNED_CONTRACT (EVM upload PDF thành công)
   → Auto chuyển status
   → EVM: Nút "Cập nhật trạng thái → AWAITING_DEPOSIT"
   ❌ CHƯA CÓ STATUS NÀY

6. AWAITING_DEPOSIT (EVM update status)
   → Dealer: Nút "Thanh toán đặt cọc"
   ✅ ĐÃ CÓ

7. DEPOSIT_SUCCESS (EVM confirm nhận tiền)
   → EVM: Nút "Chuẩn bị xe"
   ❌ CHƯA CÓ STATUS NÀY

8. IN_PROGRESS (EVM bấm chuẩn bị xe)
   → Dealer: Nút "Xác nhận đã nhận xe"
   ✅ ĐÃ CÓ

9. IN_TRANSIT (Dealer xác nhận)
   → Hoàn thành giao dịch
   ❌ CHƯA CÓ STATUS NÀY
```

---

## ❌ VẤN ĐỀ HIỆN TẠI:

### 1. **Missing Status Definitions:**
   - QUOTATION_RECEIVED
   - QUOTATION_ACCEPTED  
   - CREATED_CONTRACT
   - SIGNED_CONTRACT
   - DEPOSIT_SUCCESS
   - IN_TRANSIT

### 2. **Logic chưa đầy đủ:**

**EVM Staff Orders Page:**
- Chưa xử lý QUOTATION_RECEIVED → QUOTATION_ACCEPTED transition
- Chưa có nút "Tạo hợp đồng" cho status QUOTATION_ACCEPTED
- Chưa có logic tự động update status sau khi upload PDF contract
- Chưa có nút "Chuẩn bị xe" cho DEPOSIT_SUCCESS

**Dealer Manager Orders Page:**
- Chưa hiển thị status QUOTATION_RECEIVED
- Nút "Chấp nhận báo giá" đang dùng AWAITING_DEPOSIT thay vì QUOTATION_RECEIVED
- Chưa có nút "Xác nhận đã nhận xe" cho IN_PROGRESS

---

## ✅ IMPLEMENTATION PLAN:

### **Phase 1: Update Status Configurations**

#### File: `EvmStaffOrdersPage.jsx`

```javascript
const getStatusColor = (status) => {
  const upperStatus = status?.toUpperCase();
  switch(upperStatus) {
    case 'CONFIRMED': 
      return 'bg-green-50 text-green-700 border-green-200';
    case 'QUOTATION_RECEIVED': 
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'QUOTATION_ACCEPTED': 
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CREATED_CONTRACT': 
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'SIGNED_CONTRACT': 
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'AWAITING_DEPOSIT':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'DEPOSIT_SUCCESS':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'IN_PROGRESS': 
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IN_TRANSIT':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'READY_FOR_HANDOVER':
      return 'bg-lime-50 text-lime-700 border-lime-200';
    case 'COMPLETED': 
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELED': 
      return 'bg-red-50 text-red-700 border-red-200';
    default: 
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusText = (status) => {
  const upperStatus = status?.toUpperCase();
  switch(upperStatus) {
    case 'CONFIRMED': return 'Đã xác nhận';
    case 'QUOTATION_RECEIVED': return 'Đã gửi báo giá';
    case 'QUOTATION_ACCEPTED': return 'Báo giá được chấp nhận';
    case 'CREATED_CONTRACT': return 'Đã tạo hợp đồng';
    case 'SIGNED_CONTRACT': return 'Hợp đồng đã ký';
    case 'AWAITING_DEPOSIT': return 'Chờ đặt cọc';
    case 'DEPOSIT_SUCCESS': return 'Đã đặt cọc';
    case 'IN_PROGRESS': return 'Đang chuẩn bị xe';
    case 'IN_TRANSIT': return 'Đang vận chuyển';
    case 'READY_FOR_HANDOVER': return 'Sẵn sàng bàn giao';
    case 'COMPLETED': return 'Hoàn thành';
    case 'CANCELED': return 'Đã hủy';
    default: return 'Không xác định';
  }
};
```

---

### **Phase 2: Update Action Buttons Logic - EVM Staff**

#### File: `EvmStaffOrdersPage.jsx` - Actions Column:

```javascript
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <div className="flex items-center justify-center gap-2">
    
    {/* 1. CONFIRMED → Nút "Tạo báo giá" */}
    {order.status?.toUpperCase() === 'CONFIRMED' && !order.quotationId && (
      <button
        onClick={() => handleCreateQuotation(order)}
        className="btn-primary"
      >
        <Plus size={14} />
        Tạo báo giá
      </button>
    )}

    {/* 2. QUOTATION_RECEIVED → Badge "Đã gửi báo giá" */}
    {order.status?.toUpperCase() === 'QUOTATION_RECEIVED' && (
      <span className="badge-info">
        <FileText size={14} />
        Đã gửi báo giá
      </span>
    )}

    {/* 3. QUOTATION_ACCEPTED → Nút "Tạo hợp đồng" */}
    {order.status?.toUpperCase() === 'QUOTATION_ACCEPTED' && !order.contractId && (
      <button
        onClick={() => handleCreateContract(order)}
        className="btn-primary"
      >
        <FileText size={14} />
        Tạo hợp đồng
      </button>
    )}

    {/* 4. CREATED_CONTRACT → Badge "Đã tạo HĐ - Chờ upload PDF" */}
    {order.status?.toUpperCase() === 'CREATED_CONTRACT' && order.contractId && (
      <button
        onClick={() => navigate(`/evm-staff/contracts/${order.contractId}`)}
        className="btn-info"
      >
        <FileText size={14} />
        Xem hợp đồng
      </button>
    )}

    {/* 5. SIGNED_CONTRACT → Nút "Cập nhật → Chờ đặt cọc" */}
    {order.status?.toUpperCase() === 'SIGNED_CONTRACT' && (
      <button
        onClick={() => handleUpdateStatusToAwaitingDeposit(order)}
        className="btn-success"
      >
        <CheckCircle size={14} />
        Cập nhật → Chờ đặt cọc
      </button>
    )}

    {/* 6. AWAITING_DEPOSIT → Badge "Chờ dealer thanh toán" */}
    {order.status?.toUpperCase() === 'AWAITING_DEPOSIT' && (
      <span className="badge-warning">
        <Clock size={14} />
        Chờ dealer thanh toán
      </span>
    )}

    {/* 7. DEPOSIT_SUCCESS → Nút "Chuẩn bị xe" */}
    {order.status?.toUpperCase() === 'DEPOSIT_SUCCESS' && (
      <button
        onClick={() => handlePrepareVehicle(order)}
        className="btn-primary"
      >
        <Car size={14} />
        Chuẩn bị xe
      </button>
    )}

    {/* 8. IN_PROGRESS → Badge "Chờ dealer xác nhận" */}
    {order.status?.toUpperCase() === 'IN_PROGRESS' && (
      <span className="badge-info">
        <Clock size={14} />
        Chờ dealer xác nhận
      </span>
    )}

    {/* 9. IN_TRANSIT → Badge "Đang vận chuyển" */}
    {order.status?.toUpperCase() === 'IN_TRANSIT' && (
      <span className="badge-success">
        <Truck size={14} />
        Đang vận chuyển
      </span>
    )}

    {/* Always show View button */}
    <button onClick={() => navigate(`/evm-staff/orders/${order.id}`)}>
      <Eye size={16} />
    </button>
  </div>
</td>
```

---

### **Phase 3: Update Action Buttons Logic - Dealer Manager**

#### File: `DealerManagerOrdersPage.jsx` - Actions Column:

```javascript
<td>
  <Space>
    
    {/* 1. QUOTATION_RECEIVED → Nút "Chấp nhận báo giá" */}
    {record.status?.toUpperCase() === 'QUOTATION_RECEIVED' && record.quotationId && (
      <Button
        type="primary"
        icon={<CheckCircleOutlined />}
        onClick={() => handleAcceptQuotation(record)}
      >
        Chấp nhận báo giá
      </Button>
    )}

    {/* 2. QUOTATION_ACCEPTED → Badge "Đã chấp nhận - Chờ hợp đồng" */}
    {record.status?.toUpperCase() === 'QUOTATION_ACCEPTED' && (
      <Tag color="blue">Đã chấp nhận - Chờ hợp đồng</Tag>
    )}

    {/* 3. CREATED_CONTRACT → Badge "Đã tạo HĐ - Chờ ký" */}
    {record.status?.toUpperCase() === 'CREATED_CONTRACT' && (
      <Tag color="purple">Chờ EVM ký hợp đồng</Tag>
    )}

    {/* 4. SIGNED_CONTRACT → Badge "HĐ đã ký" */}
    {record.status?.toUpperCase() === 'SIGNED_CONTRACT' && (
      <Tag color="cyan">Hợp đồng đã ký</Tag>
    )}

    {/* 5. AWAITING_DEPOSIT → Nút "Thanh toán đặt cọc" */}
    {record.status?.toUpperCase() === 'AWAITING_DEPOSIT' && (
      <Button
        type="primary"
        icon={<DollarCircleOutlined />}
        onClick={() => handleCreateDeposit(record)}
      >
        Thanh toán đặt cọc
      </Button>
    )}

    {/* 6. DEPOSIT_SUCCESS → Badge "Đã đặt cọc - Chờ chuẩn bị" */}
    {record.status?.toUpperCase() === 'DEPOSIT_SUCCESS' && (
      <Tag color="green">Đã đặt cọc - Chờ chuẩn bị xe</Tag>
    )}

    {/* 7. IN_PROGRESS → Nút "Xác nhận đã nhận xe" */}
    {record.status?.toUpperCase() === 'IN_PROGRESS' && (
      <Button
        type="primary"
        icon={<CheckCircleOutlined />}
        onClick={() => handleConfirmReceived(record)}
      >
        Xác nhận đã nhận xe
      </Button>
    )}

    {/* 8. IN_TRANSIT → Badge "Đang vận chuyển" */}
    {record.status?.toUpperCase() === 'IN_TRANSIT' && (
      <Tag color="blue">Đang vận chuyển đến dealer</Tag>
    )}

    {/* Always show View button */}
    <Button icon={<EyeOutlined />} onClick={() => viewDetail(record.id)}>
      Xem
    </Button>
  </Space>
</td>
```

---

### **Phase 4: Contract Upload Auto-Update Status**

#### File: `EvmStaffContractDetailPage.jsx` - Upload Handler:

```javascript
const handleSignedContractUpload = async (url) => {
  try {
    if (typeof url === "undefined") return;
    
    setUpdatingContractLink(true);
    
    // 1. Update contract with PDF link
    const payload = { contractLink: url || null };
    const response = await contractService.updateContract(id, payload);
    
    if (response && (response.success || response.data)) {
      message.success('Đã upload PDF hợp đồng');
      
      // 2. Auto update order status to SIGNED_CONTRACT
      if (contract.orderId) {
        try {
          await axiosInstance.patch(
            endpoints.orders.updateStatus(contract.orderId),
            { status: 'SIGNED_CONTRACT' }
          );
          message.success('Đã tự động cập nhật trạng thái order → SIGNED_CONTRACT');
        } catch (error) {
          console.error('Error updating order status:', error);
          message.warning('Upload thành công nhưng không thể tự động cập nhật trạng thái order');
        }
      }
      
      await fetchContractDetails();
    }
  } catch (error) {
    console.error('Error uploading contract:', error);
    message.error('Lỗi khi upload PDF hợp đồng');
  } finally {
    setUpdatingContractLink(false);
  }
};
```

---

### **Phase 5: Handler Functions**

#### Add to `EvmStaffOrdersPage.jsx`:

```javascript
// Update status to AWAITING_DEPOSIT after contract signed
const handleUpdateStatusToAwaitingDeposit = async (order) => {
  try {
    await axiosInstance.patch(
      endpoints.orders.updateStatus(order.id),
      { status: 'AWAITING_DEPOSIT' }
    );
    showSuccess('Đã cập nhật trạng thái → Chờ đặt cọc');
    refetch(); // Reload orders list
  } catch (error) {
    showError('Lỗi khi cập nhật trạng thái');
  }
};

// Prepare vehicle (DEPOSIT_SUCCESS → IN_PROGRESS)
const handlePrepareVehicle = async (order) => {
  try {
    await axiosInstance.patch(
      endpoints.orders.updateStatus(order.id),
      { status: 'IN_PROGRESS' }
    );
    showSuccess('Đã chuyển sang trạng thái Đang chuẩn bị xe');
    refetch();
  } catch (error) {
    showError('Lỗi khi cập nhật trạng thái');
  }
};
```

#### Add to `DealerManagerOrdersPage.jsx`:

```javascript
// Accept quotation (QUOTATION_RECEIVED → QUOTATION_ACCEPTED)
const handleAcceptQuotation = async (order) => {
  try {
    await axiosInstance.patch(
      endpoints.orders.updateStatus(order.id),
      { status: 'QUOTATION_ACCEPTED' }
    );
    message.success('Đã chấp nhận báo giá');
    refetch();
  } catch (error) {
    message.error('Lỗi khi chấp nhận báo giá');
  }
};

// Confirm received vehicle (IN_PROGRESS → IN_TRANSIT)
const handleConfirmReceived = async (order) => {
  try {
    await axiosInstance.patch(
      endpoints.orders.updateStatus(order.id),
      { status: 'IN_TRANSIT' }
    );
    message.success('Đã xác nhận đã nhận xe');
    refetch();
  } catch (error) {
    message.error('Lỗi khi xác nhận');
  }
};
```

---

## 📝 TESTING CHECKLIST:

- [ ] 1. CONFIRMED → Nút "Tạo báo giá" hoạt động
- [ ] 2. Sau tạo quotation → Status chuyển QUOTATION_RECEIVED
- [ ] 3. Dealer thấy nút "Chấp nhận báo giá"
- [ ] 4. Sau chấp nhận → Status chuyển QUOTATION_ACCEPTED
- [ ] 5. EVM thấy nút "Tạo hợp đồng"
- [ ] 6. Sau tạo contract → Status chuyển CREATED_CONTRACT
- [ ] 7. Upload PDF → Status tự động chuyển SIGNED_CONTRACT
- [ ] 8. EVM thấy nút "Cập nhật → Chờ đặt cọc"
- [ ] 9. Click update → Status chuyển AWAITING_DEPOSIT
- [ ] 10. Dealer thấy nút "Thanh toán đặt cọc"
- [ ] 11. Sau payment → Status chuyển DEPOSIT_SUCCESS
- [ ] 12. EVM thấy nút "Chuẩn bị xe"
- [ ] 13. Click prepare → Status chuyển IN_PROGRESS
- [ ] 14. Dealer thấy nút "Xác nhận đã nhận"
- [ ] 15. Click confirm → Status chuyển IN_TRANSIT

---

## 🚀 PRIORITY:

1. **HIGH**: Thêm các status mới vào status configs
2. **HIGH**: Update action buttons logic cho EVM Staff
3. **HIGH**: Update action buttons logic cho Dealer Manager
4. **MEDIUM**: Auto-update status sau upload PDF
5. **LOW**: Styling và UI improvements

---

Sau khi implement xong, flow sẽ hoàn chỉnh từ đầu đến cuối!
