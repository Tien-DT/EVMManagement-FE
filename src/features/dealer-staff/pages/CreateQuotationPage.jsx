// src/features/evm-staff/pages/CreateQuotationPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QuotationForm from "../components/QuotationForm";
import { useCreateQuotation } from "../hooks/useCreateQuotation";

export const CreateQuotationPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    control,
    watch,
    setValue,
  } = useCreateQuotation();

  const onSubmit = async (data) => {
    const result = await handleSubmit(data);
    if (result.success) {
      toast.success("Tạo báo giá thành công!");
      navigate("/dealer-staff/quotations");
    } else {
      toast.error(result.error || "Có lỗi xảy ra khi tạo báo giá");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dealer-staff/quotations")}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h5" component="h1">
            Tạo báo giá mới
          </Typography>
        </Box>

        <QuotationForm
          register={register}
          onSubmit={onSubmit}
          errors={errors}
          isSubmitting={isSubmitting}
          control={control}
          watch={watch}
          setValue={setValue}
        />
      </Paper>
    </Container>
  );
};

export default CreateQuotationPage;
