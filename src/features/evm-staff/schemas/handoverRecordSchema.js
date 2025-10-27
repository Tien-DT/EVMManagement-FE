// src/features/evm-staff/schemas/handoverRecordSchema.js
import { z } from 'zod';

// Schema for CREATE - matches HandoverRecordCreateDto
export const handoverRecordSchema = z.object({
  orderId: z.string()
    .min(1, 'ID đơn hàng là bắt buộc')
    .uuid('ID đơn hàng không hợp lệ'),
  
  vehicleId: z.string()
    .min(1, 'ID xe là bắt buộc')
    .uuid('ID xe không hợp lệ'),
  
  transportDetailId: z.string()
    .uuid('ID thông tin vận chuyển không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  handoverDate: z.string()
    .optional()
    .nullable()
    .or(z.literal('')),
  
  notes: z.string()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
});

// Schema for UPDATE - matches HandoverRecordUpdateDto
export const handoverRecordUpdateSchema = z.object({
  transportDetailId: z.string()
    .uuid('ID thông tin vận chuyển không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  handoverDate: z.string()
    .optional()
    .nullable()
    .or(z.literal('')),
  
  notes: z.string()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  isAccepted: z.boolean()
    .optional(),
});

export default handoverRecordSchema;
