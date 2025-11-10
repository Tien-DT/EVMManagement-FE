import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  Button, 
  Table, 
  Empty, 
  Image,
  Alert,
  Row,
  Col,
  Typography,
  Input,
  Badge,
  Tag,
  Select,
  Spin
} from "antd";
import { 
  X, 
  GitCompare,
  Car,
  Loader2,
  Search,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { useDealerVehicleModels } from "../hooks/useDealerVehicleModels";
import { vehicleService } from "../services/vehicleService";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const { Title, Text } = Typography;

const VehicleComparisonPage = () => {
  const [dealerId, setDealerId] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantOptions, setVariantOptions] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModelFilter, setSelectedModelFilter] = useState(null);

  const MAX_COMPARE = 4;
  const MIN_COMPARE = 2;

  // Fetch dealerId
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        // Check if dealerId already in localStorage
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          console.log("✅ Using cached dealerId:", cachedDealerId);
          setDealerId(cachedDealerId);
          return;
        }

        // Check userProfile in localStorage
        const userProfileStr = localStorage.getItem("userProfile");
        if (userProfileStr) {
          try {
            const userProfile = JSON.parse(userProfileStr);
            if (userProfile.dealerId) {
              console.log("✅ Using dealerId from userProfile:", userProfile.dealerId);
              localStorage.setItem("dealerId", userProfile.dealerId);
              setDealerId(userProfile.dealerId);
              return;
            }
          } catch (err) {
            console.error("Error parsing userProfile:", err);
          }
        }

        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          console.error("❌ No user found in localStorage");
          return;
        }

        const userData = JSON.parse(userStr);
        const accountId = userData.id;

        if (!accountId) {
          console.error("❌ No accountId found in user");
          return;
        }

        console.log("🔍 Fetching dealerId for accountId:", accountId);

        // Import dealerService dynamically
        const { dealerService } = await import(
          "../../dealer-manager/services/dealerService"
        );

        // Fetch user profile to get dealerId
        const userProfile = await dealerService.getUserProfile(accountId);
        console.log("📦 User profile response:", userProfile);

        if (userProfile.success && userProfile.data?.dealerId) {
          const fetchedDealerId = userProfile.data.dealerId;
          console.log("✅ DealerId fetched from API:", fetchedDealerId);

          // Save to localStorage for future use
          localStorage.setItem("dealerId", fetchedDealerId);
          localStorage.setItem("userProfile", JSON.stringify(userProfile.data));
          setDealerId(fetchedDealerId);
        } else {
          console.error("❌ No dealerId found in user profile");
        }
      } catch (error) {
        console.error("❌ Error fetching dealerId:", error);
      }
    };

    fetchDealerId();
  }, []);

  // Fetch all vehicle models
  const { models, loading: modelsLoading } = useDealerVehicleModels(dealerId);

  // Fetch all variants when models are loaded - OPTIMIZED: Parallel fetching + Caching
  useEffect(() => {
    const fetchAllVariants = async () => {
      if (!dealerId || !models || models.length === 0) return;

      // Check cache first
      const cacheKey = `vehicleVariants_${dealerId}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
        try {
          const parsed = JSON.parse(cachedData);
          setAvailableVariants(parsed.allVariants);
          setVariantOptions(parsed.groupedVariants);
          return;
        } catch (e) {
          console.error("Error parsing cached data:", e);
        }
      }

      setVariantsLoading(true);
      try {
        console.log("🚗 Fetching variants for", models.length, "models");
        // Fetch all variants in parallel
        const variantPromises = models.map(async (model) => {
          try {
            console.log(`🔍 Fetching variants for model ${model.id} (${model.name})`);
            const response = await vehicleService.getVehicleVariantsWithStock(
              dealerId,
              model.id,
              1,
              100
            );

            console.log(`📦 Variants response for model ${model.id}:`, response);

            let variantsData = [];
            
            // Handle different response structures (axiosInstance returns response.data)
            if (response?.success && response?.data) {
              // Structure: { success: true, data: { items: [...], totalCount: ... } }
              const data = response.data;
              if (Array.isArray(data.items)) {
                variantsData = data.items;
              } else if (Array.isArray(data)) {
                variantsData = data;
              }
            } else if (Array.isArray(response?.items)) {
              // Structure: { items: [...], totalCount: ... }
              variantsData = response.items;
            } else if (Array.isArray(response)) {
              // Structure: [...]
              variantsData = response;
            } else if (response?.data) {
              // Structure: { data: { items: [...], totalCount: ... } }
              const data = response.data;
              if (Array.isArray(data.items)) {
                variantsData = data.items;
              } else if (Array.isArray(data)) {
                variantsData = data;
              }
            }

            console.log(`✅ Found ${variantsData.length} variants for model ${model.id}`);

            return {
              model,
              variants: variantsData.map(v => ({
                ...v,
                modelName: model.name,
                modelId: model.id
              }))
            };
          } catch (error) {
            console.error(`❌ Error fetching variants for model ${model.id}:`, error);
            console.error("Error details:", error.response?.data || error.message);
            return { model, variants: [] };
          }
        });

        const results = await Promise.all(variantPromises);
        
        const allVariants = [];
        const groupedVariants = {};

        results.forEach(({ model, variants }) => {
          allVariants.push(...variants);
          groupedVariants[model.id] = {
            model: model,
            variants: variants
          };
        });

        console.log(`✅ Total variants loaded: ${allVariants.length}`);
        console.log(`✅ Models with variants: ${Object.keys(groupedVariants).length}`);

        // Cache the results
        const cacheData = {
          allVariants,
          groupedVariants
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        sessionStorage.setItem(`${cacheKey}_timestamp`, now.toString());

        setAvailableVariants(allVariants);
        setVariantOptions(groupedVariants);
      } catch (error) {
        console.error("❌ Error fetching variants:", error);
        console.error("Error details:", error.response?.data || error.message);
      } finally {
        setVariantsLoading(false);
      }
    };

    fetchAllVariants();
  }, [dealerId, models]);

  // Fetch full variant details when selected
  const fetchVariantDetails = async (variantId) => {
    try {
      console.log("🔍 Fetching variant details for:", variantId);
      const response = await axiosInstance.get(
        endpoints.vehicleVariants.getById(variantId)
      );
      console.log("📦 Variant details response:", response);
      
      // Handle different response structures
      if (response?.success && response?.data) {
        return response.data;
      } else if (response?.data && !response.success) {
        // Some APIs return data directly without success flag
        return response.data;
      } else if (response && !response.success && !response.data) {
        // Response is the data itself
        return response;
      }
      return null;
    } catch (error) {
      console.error("❌ Error fetching variant details:", error);
      console.error("Error details:", error.response?.data || error.message);
      return null;
    }
  };

  const handleToggleVariant = async (variant) => {
    const isSelected = selectedVariants.some(v => v.id === variant.id);
    
    if (isSelected) {
      handleRemoveVariant(variant.id);
    } else {
      if (selectedVariants.length >= MAX_COMPARE) {
        return;
      }

      setLoading(true);
      try {
        const variantDetail = await fetchVariantDetails(variant.id);
        if (variantDetail) {
          setSelectedVariants([...selectedVariants, {
            ...variantDetail,
            modelName: variant.modelName || variantDetail.vehicleModel?.name || "Unknown",
            imageUrl: variant.imageUrl || variantDetail.imageUrl
          }]);
        } else {
          setSelectedVariants([...selectedVariants, variant]);
        }
      } catch (error) {
        console.error("Error adding variant:", error);
        setSelectedVariants([...selectedVariants, variant]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveVariant = (variantId) => {
    setSelectedVariants(selectedVariants.filter(v => v.id !== variantId));
  };

  // Filter variants
  const filteredVariants = useMemo(() => {
    return availableVariants.filter(variant => {
      // Filter out already selected
      if (selectedVariants.some(sv => sv.id === variant.id)) {
        return false;
      }

      // Filter by search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = 
          variant.modelName?.toLowerCase().includes(searchLower) ||
          variant.color?.toLowerCase().includes(searchLower) ||
          variant.engine?.toLowerCase().includes(searchLower);
        
        if (!matches) return false;
      }

      // Filter by model
      if (selectedModelFilter && variant.modelId !== selectedModelFilter) {
        return false;
      }

      return true;
    });
  }, [availableVariants, selectedVariants, searchTerm, selectedModelFilter]);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatValue = (value, unit = "") => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  // Prepare comparison data
  const getComparisonData = () => {
    const specs = [
      { key: "modelName", label: "Model" },
      { key: "color", label: "Màu sắc" },
      { key: "price", label: "Giá", isPrice: true },
      { key: "engine", label: "Động cơ" },
      { key: "capacity", label: "Dung tích", unit: "kWh" },
      { key: "batteryType", label: "Loại pin" },
      { key: "batteryLife", label: "Tuổi thọ pin" },
      { key: "chargingTime", label: "Thời gian sạc", unit: "giờ" },
      { key: "chargingCapacity", label: "Công suất sạc", unit: "kW" },
      { key: "maximumSpeed", label: "Tốc độ tối đa", unit: "km/h" },
      { key: "distancePerCharge", label: "Quãng đường/lần sạc", unit: "km" },
      { key: "weight", label: "Trọng lượng", unit: "kg" },
      { key: "groundClearance", label: "Khoảng sáng gầm", unit: "mm" },
      { key: "brakes", label: "Phanh" },
      { key: "shockAbsorbers", label: "Giảm xóc" },
      { key: "length", label: "Chiều dài", unit: "mm" },
      { key: "width", label: "Chiều rộng", unit: "mm" },
      { key: "height", label: "Chiều cao", unit: "mm" },
      { key: "trunkWidth", label: "Kích thước cốp", unit: "mm" },
    ];

    return specs.map(spec => ({
      key: spec.key,
      label: spec.label,
      values: selectedVariants.map(variant => {
        const value = variant[spec.key];
        if (spec.isPrice) {
          return formatPrice(value);
        }
        return formatValue(value, spec.unit);
      })
    }));
  };

  if (modelsLoading || variantsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Title level={2} className="!mb-2">So sánh xe</Title>
        <Text type="secondary">
          Chọn từ {MIN_COMPARE} đến {MAX_COMPARE} xe để so sánh ({selectedVariants.length}/{MAX_COMPARE})
        </Text>
      </div>

      {/* Selected Cars Section */}
      {selectedVariants.length > 0 && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Title level={4} className="!mb-0">Xe đã chọn</Title>
              {selectedVariants.length >= MIN_COMPARE && (
                <Button
                  type="primary"
                  icon={<GitCompare size={16} />}
                  onClick={() => {
                    document.getElementById("comparison-table")?.scrollIntoView({ 
                      behavior: "smooth"
                    });
                  }}
                  style={{
                    opacity: 1,
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                  }}
                  className="hover:!opacity-100 hover:!bg-blue-600"
                >
                  Xem so sánh
                </Button>
              )}
            </div>

            {selectedVariants.length < MIN_COMPARE && (
              <Alert
                message={`Vui lòng chọn ít nhất ${MIN_COMPARE} xe để so sánh`}
                type="warning"
                showIcon
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedVariants.map((variant, index) => (
                <Card
                  key={variant.id}
                  className="relative"
                  cover={
                    <div className="relative h-40 bg-gray-50 flex items-center justify-center">
                      {variant.imageUrl ? (
                        <Image
                          src={variant.imageUrl}
                          alt={variant.color}
                          width="100%"
                          height={160}
                          style={{ objectFit: "contain" }}
                          preview={false}
                        />
                      ) : (
                        <Car size={64} className="text-gray-300" />
                      )}
                      <Badge
                        count={index + 1}
                        style={{ backgroundColor: '#1890ff' }}
                        className="absolute top-2 right-2"
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      key="remove"
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => handleRemoveVariant(variant.id)}
                      block
                    >
                      Xóa
                    </Button>
                  ]}
                >
                  <div>
                    <Text strong className="block">{variant.modelName}</Text>
                    <Text type="secondary" className="text-sm block">{variant.color || "—"}</Text>
                    <Text strong className="text-blue-600 text-base block mt-2">
                      {formatPrice(variant.price)}
                    </Text>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            placeholder="Tìm kiếm theo tên, màu sắc..."
            prefix={<Search size={16} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="Lọc theo model"
            allowClear
            value={selectedModelFilter}
            onChange={setSelectedModelFilter}
            style={{ width: 200 }}
          >
            {Object.values(variantOptions).map(({ model }) => (
              <Select.Option key={model.id} value={model.id}>
                {model.name}
              </Select.Option>
            ))}
          </Select>

          <div className="ml-auto">
            <Text type="secondary">
              Tìm thấy {filteredVariants.length} xe
            </Text>
          </div>
        </div>
      </Card>

      {/* Available Cars Grid */}
      <Card>
        <Title level={4} className="!mb-4">Chọn xe để so sánh</Title>
        
        {selectedVariants.length >= MAX_COMPARE && (
          <Alert
            message="Đã chọn đủ 4 xe. Vui lòng bỏ chọn một xe để chọn xe khác."
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {availableVariants.length === 0 && !variantsLoading ? (
          <Empty 
            description={
              models.length === 0 
                ? "Không có mẫu xe nào trong kho" 
                : "Không có biến thể xe nào để so sánh"
            }
          />
        ) : filteredVariants.length === 0 && searchTerm ? (
          <Empty description="Không tìm thấy xe phù hợp với từ khóa tìm kiếm" />
        ) : filteredVariants.length === 0 && selectedModelFilter ? (
          <Empty description="Không có xe nào trong model đã chọn" />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredVariants.map((variant) => {
              const isSelected = selectedVariants.some(sv => sv.id === variant.id);
              const isDisabled = selectedVariants.length >= MAX_COMPARE && !isSelected;

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={variant.id}>
                  <Card
                    hoverable={!isDisabled}
                    className={`h-full transition-all ${
                      isSelected
                        ? "ring-2 ring-blue-500 border-blue-500"
                        : isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:shadow-lg"
                    }`}
                    onClick={() => !isDisabled && handleToggleVariant(variant)}
                    cover={
                      <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {variant.imageUrl ? (
                          <Image
                            src={variant.imageUrl}
                            alt={variant.color}
                            width="100%"
                            height={192}
                            style={{ objectFit: "cover" }}
                            preview={false}
                          />
                        ) : (
                          <Car size={64} className="text-gray-300" />
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 size={24} className="text-blue-500" fill="white" />
                          </div>
                        )}
                        {variant.availableStock === 0 && (
                          <Tag color="red" className="absolute top-2 left-2">
                            Hết hàng
                          </Tag>
                        )}
                      </div>
                    }
                  >
                    <div>
                      <Text strong className="block text-base">{variant.modelName}</Text>
                      <Text type="secondary" className="text-sm block mb-2">
                        {variant.color || "—"}
                      </Text>
                      <Text strong className="text-blue-600 text-lg block mb-2">
                        {formatPrice(variant.price)}
                      </Text>
                      {variant.engine && (
                        <Text type="secondary" className="text-xs block">
                          Động cơ: {variant.engine}
                        </Text>
                      )}
                      {variant.availableStock > 0 && (
                        <Tag color="green" className="mt-2">
                          Còn {variant.availableStock} xe
                        </Tag>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Comparison Table */}
      {selectedVariants.length >= MIN_COMPARE && (
        <Card id="comparison-table">
          <Title level={3} className="!mb-4">Bảng so sánh</Title>
          
          <div className="overflow-x-auto">
            <Table
              dataSource={getComparisonData()}
              pagination={false}
              bordered
              size="middle"
              columns={[
                {
                  title: "Thông số",
                  dataIndex: "label",
                  key: "label",
                  width: 180,
                  fixed: "left",
                  render: (text) => <Text strong>{text}</Text>
                },
                ...selectedVariants.map((variant, index) => ({
                  title: (
                    <div className="text-center">
                      {variant.imageUrl ? (
                        <Image
                          src={variant.imageUrl}
                          alt={variant.color}
                          width={80}
                          height={60}
                          style={{ objectFit: "contain" }}
                          preview={false}
                        />
                      ) : (
                        <div className="h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                          <Car size={24} className="text-gray-400" />
                        </div>
                      )}
                      <Text strong className="block text-sm">{variant.modelName}</Text>
                      <Text type="secondary" className="text-xs">
                        {variant.color}
                      </Text>
                    </div>
                  ),
                  dataIndex: "values",
                  key: `variant-${variant.id}`,
                  render: (values) => (
                    <div className="text-center">
                      {values[index] || "—"}
                    </div>
                  ),
                  width: 180
                }))
              ]}
            />
          </div>
        </Card>
      )}

      {selectedVariants.length === 0 && (
        <Card>
          <Empty
            description="Chưa có xe nào được chọn. Vui lòng chọn ít nhất 2 xe để so sánh."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );
};

export default VehicleComparisonPage;

