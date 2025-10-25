// src/features/evm-staff/schemas/handoverRecordSchema.js
import * as Yup from 'yup';

export const handoverRecordSchema = Yup.object().shape({
  orderId: Yup.string()
    .required('ID đơn hàng là bắt buộc'),
  
  vehicleId: Yup.string()
    .required('ID xe là bắt buộc'),
  
  transportDetailId: Yup.string()
    .required('ID thông tin vận chuyển là bắt buộc'),
  
  handoverDate: Yup.date()
    .required('Ngày bàn giao là bắt buộc')
    .typeError('Ngày bàn giao không hợp lệ'),
  
  isAccepted: Yup.boolean()
    .required('Trạng thái chấp nhận là bắt buộc'),
  
  notes: Yup.string()
    .nullable()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự'),
});

export default handoverRecordSchema;
