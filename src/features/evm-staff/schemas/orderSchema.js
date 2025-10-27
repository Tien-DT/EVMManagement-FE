// src/features/evm-staff/schemas/orderSchema.js
import { z } from 'zod';

export const orderSchema = z.object({
  code: z.string().min(1, 'Mã đơn hàng là bắt buộc'),
  quotationId: z.string().min(1, 'Báo giá là bắt buộc'),
  customerId: z.string().min(1, 'Khách hàng là bắt buộc'),
  dealerId: z.string().optional().nullable(),
  status: z.enum(['CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELED'], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' })
  }),
  totalAmount: z.number().min(0, 'Tổng tiền phải lớn hơn 0'),
  discountAmount: z.number().min(0, 'Giảm giá không được âm').default(0),
  finalAmount: z.number().min(0, 'Thành tiền phải lớn hơn 0'),
  expectedDeliveryAt: z.string().min(1, 'Ngày giao hàng dự kiến là bắt buộc'),
  orderType: z.enum(['B2B', 'B2C'], {
    errorMap: () => ({ message: 'Loại đơn không hợp lệ' })
  }),
  isFinanced: z.boolean().default(false)
});

export default orderSchema;

