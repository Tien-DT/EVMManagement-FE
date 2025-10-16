import { z } from "zod";

export const warehouseSchema = z.object({
  name: z
    .string()
    .min(3, "Tên kho phải có ít nhất 3 ký tự")
    .max(100, "Tên kho không được vượt quá 100 ký tự"),
  address: z
    .string()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
    .max(200, "Địa chỉ không được vượt quá 200 ký tự"),
  capacity: z
    .number()
    .min(1, "Sức chứa phải lớn hơn 0")
    .max(100000, "Sức chứa không được vượt quá 100,000"),
});
