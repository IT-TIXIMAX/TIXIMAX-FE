import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import { TrendingUp, Person, Scale, AttachMoney } from "@mui/icons-material";
import dashboardService from "../../Services/Dashboard/dashboardService";

const DashboardKPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Fetch KPI data
  const fetchKPIData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getRoutesKPI({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setKpiData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu KPI");
      console.error("Error fetching KPI:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, []);

  // Format currency
  const formatCurrency = (value, currency = "VND") => {
    if (!value) return "0";
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format weight
  const formatWeight = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Get routes list
  const routes = kpiData ? Object.keys(kpiData) : [];

  // Handle tab change
  const handleRouteChange = (event, newValue) => {
    setSelectedRoute(newValue);
  };

  // Handle date change
  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate route summary
  const getRouteSummary = (routeData) => {
    if (!routeData?.staffPerformances)
      return { totalGoods: 0, totalWeight: 0, staffCount: 0 };

    const totalGoods = routeData.staffPerformances.reduce(
      (sum, staff) => sum + (staff.totalGoods || 0),
      0
    );
    const totalWeight = routeData.staffPerformances.reduce(
      (sum, staff) => sum + (staff.totalNetWeight || 0),
      0
    );
    const staffCount = routeData.staffPerformances.filter(
      (staff) => staff.totalGoods > 0 || staff.totalNetWeight > 0
    ).length;

    return { totalGoods, totalWeight, staffCount };
  };

  // Get current route data
  const currentRouteKey = routes[selectedRoute];
  const currentRouteData = kpiData?.[currentRouteKey];
  const routeSummary = currentRouteData
    ? getRouteSummary(currentRouteData)
    : null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#1976d2", mb: 1 }}
        >
          Báo Cáo KPI Theo Tuyến
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Theo dõi hiệu suất nhân viên theo từng tuyến vận chuyển
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchKPIData}
                disabled={loading}
                sx={{
                  bgcolor: "#1976d2",
                  "&:hover": { bgcolor: "#1565c0" },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Xem Báo Cáo"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!loading && kpiData && routes.length > 0 && (
        <>
          {/* Route Tabs */}
          <Card sx={{ mb: 3 }}>
            <Tabs
              value={selectedRoute}
              onChange={handleRouteChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": { fontWeight: 600 },
                "& .Mui-selected": { color: "#1976d2" },
              }}
            >
              {routes.map((route, index) => (
                <Tab
                  key={route}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {route}
                      <Chip
                        label={kpiData[route].staffPerformances.length}
                        size="small"
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Card>

          {/* Route Summary Cards */}
          {routeSummary && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: "#e3f2fd", boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          bgcolor: "#1976d2",
                          borderRadius: "50%",
                          p: 1.5,
                          display: "flex",
                        }}
                      >
                        <AttachMoney sx={{ color: "white", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tổng Giá Trị Hàng
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#1976d2" }}
                        >
                          {formatCurrency(routeSummary.totalGoods)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: "#e8f5e9", boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          bgcolor: "#4caf50",
                          borderRadius: "50%",
                          p: 1.5,
                          display: "flex",
                        }}
                      >
                        <Scale sx={{ color: "white", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tổng Trọng Lượng
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#4caf50" }}
                        >
                          {formatWeight(routeSummary.totalWeight)} kg
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: "#fff3e0", boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          bgcolor: "#ff9800",
                          borderRadius: "50%",
                          p: 1.5,
                          display: "flex",
                        }}
                      >
                        <Person sx={{ color: "white", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nhân Viên Hoạt Động
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#ff9800" }}
                        >
                          {routeSummary.staffCount}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Staff Performance Table */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}
              >
                Hiệu Suất Nhân Viên - Tuyến {currentRouteKey}
              </Typography>

              <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 700 }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Mã NV</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Họ Tên</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Giá Trị Hàng
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Trọng Lượng (kg)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Trạng Thái
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRouteData?.staffPerformances.map((staff, index) => {
                      const isActive =
                        staff.totalGoods > 0 || staff.totalNetWeight > 0;
                      return (
                        <TableRow
                          key={staff.staffCode}
                          sx={{
                            "&:hover": { bgcolor: "#f5f5f5" },
                            opacity: isActive ? 1 : 0.6,
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Chip
                              label={staff.staffCode}
                              size="small"
                              sx={{
                                bgcolor: "#e3f2fd",
                                color: "#1976d2",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {staff.name}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(staff.totalGoods)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatWeight(staff.totalNetWeight)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={isActive ? "Hoạt động" : "Chưa hoạt động"}
                              size="small"
                              color={isActive ? "success" : "default"}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Data State */}
      {!loading && (!kpiData || routes.length === 0) && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <TrendingUp sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Không có dữ liệu KPI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng chọn khoảng thời gian và nhấn "Xem Báo Cáo"
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DashboardKPI;
