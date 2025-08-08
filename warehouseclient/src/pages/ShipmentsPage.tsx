import { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { isValid, isAfter, format } from "date-fns";
import type { ShipmentItem } from "../api/warehouseApi";
import {
  getShipments,
  getResources,
  getUnits,
  getClients,
} from "../api/warehouseApi";
import { Link as RouterLink } from "react-router-dom";
import type {
  ResourceDto as Resource,
  UnitOfMeasureDto as Unit,
  ClientDto as Client,
} from "../api/warehouseApi";

const ShipmentsPage = () => {
  // Основные данные
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры
  const [startDate, setStartDate] = useState<Date | null>(
    new Date("2000-07-28")
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date("2025-08-11"));
  const [documentNumberFilter, setDocumentNumberFilter] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<number | "">("");
  const [resourceFilter, setResourceFilter] = useState<number[]>([]);
  const [unitFilter, setUnitFilter] = useState<number[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);

  // Валидация дат
  useEffect(() => {
    if (startDate && endDate && isAfter(startDate, endDate)) {
      setDateError("Дата начала не может быть позже даты окончания");
    } else {
      setDateError(null);
    }
  }, [startDate, endDate]);

  // Загрузка данных
  // Загрузка данных
  const loadShipments = useCallback(async () => {
    if (dateError) return;

    try {
      setLoading(true);
      setError(null);

      const documentNumbers = documentNumberFilter
        ? [documentNumberFilter]
        : undefined;
      const resourceIds =
        resourceFilter.length > 0 ? resourceFilter : undefined;
      const unitIds = unitFilter.length > 0 ? unitFilter : undefined;

      const clientName = clientFilter
        ? clients.find((c) => c.id === clientFilter)?.name
        : undefined;

      const data = await getShipments(
        startDate,
        endDate,
        documentNumbers,
        resourceIds,
        unitIds
      );

      const filteredData = clientName
        ? data.filter((item) => item.clientName === clientName)
        : data;

      setShipments(filteredData);
    } catch (err) {
      console.error("Ошибка загрузки отгрузок:", err);
      setError("Не удалось загрузить отгрузки. Повторите попытку.");
    } finally {
      setLoading(false);
    }
  }, [
    startDate,
    endDate,
    documentNumberFilter,
    clientFilter,
    resourceFilter,
    unitFilter,
    dateError,
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resourcesRes, unitsRes, clientsRes] = await Promise.all([
          getResources(),
          getUnits(),
          getClients(),
        ]);
        setResources(resourcesRes);
        setUnits(unitsRes);
        setClients(clientsRes);

        await loadShipments();
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Обработчики дат
  const handleStartDateChange = (newValue: string) => {
    const date = new Date(newValue);
    if (isValid(date)) setStartDate(date);
  };

  const handleEndDateChange = (newValue: string) => {
    const date = new Date(newValue);
    if (isValid(date)) setEndDate(date);
  };

  const handleApplyFilters = () => {
    loadShipments();
  };

  // Форматирование статуса
  const getStatusLabel = (status: ShipmentItem["status"]) => {
    switch (status) {
      case "draft":
        return "Черновик";
      case "signed":
        return "Подписан";
      case "revoked":
        return "Отозван";
      default:
        return "Неизвестно";
    }
  };

  const getStatusColor = (status: ShipmentItem["status"]) => {
    switch (status) {
      case "draft":
        return "warning";
      case "signed":
        return "success";
      case "revoked":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Отгрузки
      </Typography>

      {/* Фильтры */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          "& > *": {
            flex: "1 1 calc(20% - 8px)",
            minWidth: {
              xs: "100%",
              sm: "calc(33.33% - 8px)",
              md: "calc(20% - 8px)",
            },
            maxWidth: {
              xs: "100%",
              sm: "calc(33.33% - 8px)",
              md: "calc(20% - 8px)",
            },
          },
        }}
      >
        <TextField
          label="Дата начала"
          type="date"
          value={startDate ? startDate.toISOString().split("T")[0] : ""}
          onChange={(e) => handleStartDateChange(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!dateError}
          disabled={loading}
        />
        <TextField
          label="Дата окончания"
          type="date"
          value={endDate ? endDate.toISOString().split("T")[0] : ""}
          onChange={(e) => handleEndDateChange(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!dateError}
          helperText={dateError}
          disabled={loading}
        />
        <TextField
          label="Номер отгрузки"
          value={documentNumberFilter}
          onChange={(e) => setDocumentNumberFilter(e.target.value)}
          fullWidth
          disabled={loading}
        />
        <FormControl fullWidth disabled={loading}>
          <InputLabel>Клиент</InputLabel>
          <Select
            value={clientFilter}
            label="Клиент"
            onChange={(e) => setClientFilter(e.target.value as number)}
          >
            <MenuItem value="">Все</MenuItem>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          select
          label="Ресурс"
          value={resourceFilter.map(String)}
          onChange={(e) => {
            const value = e.target.value;
            const ids = Array.isArray(value)
              ? value.map((id) => parseInt(id, 10))
              : [parseInt(value, 10)];
            setResourceFilter(ids);
          }}
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              selected
                .map((id) => {
                  const resource = resources.find((r) => r.id === Number(id));
                  return resource?.name || "";
                })
                .filter(Boolean)
                .join(", "),
          }}
          fullWidth
          disabled={loading}
        >
          {resources.map((resource) => (
            <MenuItem key={resource.id} value={resource.id}>
              {resource.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Единица измерения"
          value={unitFilter.map(String)}
          onChange={(e) => {
            const value = e.target.value;
            const ids = Array.isArray(value)
              ? value.map((id) => parseInt(id, 10))
              : [parseInt(value, 10)];
            setUnitFilter(ids);
          }}
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              selected
                .map((id) => {
                  const unit = units.find((u) => u.id === Number(id));
                  return unit?.name || "";
                })
                .filter(Boolean)
                .join(", "),
          }}
          fullWidth
          disabled={loading}
        >
          {units.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Кнопки */}
      <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={handleApplyFilters}
          disabled={loading || !!dateError}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Применить
        </Button>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/add-shipment"
          disabled={loading}
        >
          Добавить
        </Button>
      </Box>

      {/* Ошибка */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Загрузка */}
      {loading && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}

      {/* Таблица */}
      {!loading && !error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Список отгрузок
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Номер</TableCell>
                  <TableCell align="right">Дата</TableCell>
                  <TableCell align="right">Клиент</TableCell>
                  <TableCell align="right">Статус</TableCell>
                  <TableCell align="right">Ресурс</TableCell>
                  <TableCell align="right">Единица измерения</TableCell>
                  <TableCell align="right">Количество</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipments.length > 0 ? (
                  shipments.map((item) => (
                    <TableRow
                      key={`${item.documentId}-${item.resourceId}-${item.unitId}`}
                      component={RouterLink}
                      to={`/shipments/${item.documentId}`}
                      sx={{
                        textDecoration: "none",
                        "&:hover": { bgcolor: "action.hover" },
                        cursor: "pointer",
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {item.documentNumber}
                      </TableCell>
                      <TableCell align="right">
                        {format(new Date(item.date), "dd.MM.yyyy")}
                      </TableCell>
                      <TableCell align="right">{item.clientName}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          color={getStatusColor(item.status)}
                        >
                          {getStatusLabel(item.status)}
                        </Button>
                      </TableCell>
                      <TableCell align="right">{item.resourceName}</TableCell>
                      <TableCell align="right">{item.unitName}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Нет данных
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default ShipmentsPage;
