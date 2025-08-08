import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  MenuItem,
  Select,
} from "@mui/material";
import { format, isValid } from "date-fns";
import type {
  ResourceDto,
  UnitOfMeasureDto,
  ClientDto,
} from "../api/warehouseApi";
import {
  getActiveResources,
  getActiveUnits,
  getActiveClients,
} from "../api/warehouseApi";
import { createShipment, signShipment } from "../api/warehouseApi";

// Типы для запроса (должны быть определены в warehouseApi, но на всякий случай уточним)
interface CreateShipmentDocumentRequest {
  number: string;
  date: string;
  clientId: number;
  resources: {
    resourceId: number;
    unitOfMeasureId: number;
    quantity: number;
  }[];
}

const AddShipmentPage = () => {
  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [units, setUnits] = useState<UnitOfMeasureDto[]>([]);
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояние формы
  const [formData, setFormData] = useState({
    documentNumber: "",
    clientId: null as number | null,
    date: new Date(),
    items: [] as {
      resourceId: number;
      unitOfMeasureId: number;
      quantity: number;
    }[],
  });

  // Загрузка справочников — только активные
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [res, unt, clt] = await Promise.all([
          getActiveResources(),
          getActiveUnits(),
          getActiveClients(),
        ]);
        setResources(res);
        setUnits(unt);
        setClients(clt);
      } catch (err) {
        console.error("Ошибка загрузки справочников:", err);
        setError("Не удалось загрузить справочники");
      }
    };
    loadReferences();
  }, []);

  const handleDocumentNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, documentNumber: e.target.value });
    setError(null);
  };

  const handleClientChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({ ...formData, clientId: e.target.value as number });
    setError(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!newValue) return;
    const newDate = new Date(newValue);
    if (isValid(newDate)) {
      setFormData({ ...formData, date: newDate });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { resourceId: 0, unitOfMeasureId: 0, quantity: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleResourceChange = (index: number, value: string) => {
    const resourceId = value ? parseInt(value, 10) : 0;
    setFormData({
      ...formData,
      items: formData.items.map((item, i) =>
        i === index ? { ...item, resourceId } : item
      ),
    });
  };

  const handleUnitChange = (index: number, value: string) => {
    const unitOfMeasureId = value ? parseInt(value, 10) : 0;
    setFormData({
      ...formData,
      items: formData.items.map((item, i) =>
        i === index ? { ...item, unitOfMeasureId } : item
      ),
    });
  };

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = value === "" ? 0 : parseInt(value, 10);
    const safeQuantity = isNaN(quantity) ? 0 : quantity;
    setFormData({
      ...formData,
      items: formData.items.map((item, i) =>
        i === index ? { ...item, quantity: safeQuantity } : item
      ),
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.documentNumber.trim()) {
        setError('Поле "Номер" не может быть пустым');
        return;
      }
      if (formData.clientId === null) {
        setError('Поле "Клиент" не может быть пустым');
        return;
      }
      if (
        formData.items.length === 0 ||
        formData.items.some(
          (item) => item.resourceId === 0 || item.quantity <= 0
        )
      ) {
        setError("Добавьте хотя бы один ресурс с корректным количеством (> 0)");
        return;
      }

      const request: CreateShipmentDocumentRequest = {
        number: formData.documentNumber.trim(),
        date: format(formData.date, "yyyy-MM-dd"),
        clientId: formData.clientId,
        resources: formData.items.map((item) => ({
          resourceId: item.resourceId,
          unitOfMeasureId: item.unitOfMeasureId,
          quantity: item.quantity,
        })),
      };

      const createdShipment = await createShipment(request);
      alert(`Отгрузка №${createdShipment.number} успешно создана!`);
    } catch (err) {
      console.error("Ошибка сохранения отгрузки:", err);
      setError(
        err instanceof Error ? err.message : "Ошибка при сохранении отгрузки"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAndSign = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.documentNumber.trim()) {
        setError('Поле "Номер" не может быть пустым');
        return;
      }
      if (formData.clientId === null) {
        setError('Поле "Клиент" не может быть пустым');
        return;
      }
      if (
        formData.items.length === 0 ||
        formData.items.some(
          (item) => item.resourceId === 0 || item.quantity <= 0
        )
      ) {
        setError("Добавьте хотя бы один ресурс с корректным количеством (> 0)");
        return;
      }

      const request: CreateShipmentDocumentRequest = {
        number: formData.documentNumber.trim(),
        date: format(formData.date, "yyyy-MM-dd"),
        clientId: formData.clientId,
        resources: formData.items.map((item) => ({
          resourceId: item.resourceId,
          unitOfMeasureId: item.unitOfMeasureId,
          quantity: item.quantity,
        })),
      };

      const createdShipment = await createShipment(request);
      await signShipment(createdShipment.id);
      alert(`Отгрузка №${createdShipment.number} успешно создана и подписана!`);
    } catch (err) {
      console.error("Ошибка сохранения и подписания отгрузки:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка при сохранении и подписании"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Добавление отгрузки
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          "& > *": {
            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" },
          },
        }}
      >
        <TextField
          label="Номер"
          value={formData.documentNumber}
          onChange={handleDocumentNumberChange}
          fullWidth
          error={!!error && !formData.documentNumber.trim()}
        />
        <Select
          value={formData.clientId ?? ""}
          onChange={handleClientChange}
          displayEmpty
          fullWidth
          error={!!error && formData.clientId === null}
        >
          <MenuItem value="">Выберите клиента</MenuItem>
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Дата"
          type="date"
          value={formData.date.toISOString().split("T")[0]}
          onChange={handleDateChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      {/* Таблица ресурсов */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Ресурс</TableCell>
              <TableCell>Единица измерения</TableCell>
              <TableCell align="right">Количество</TableCell>
              <TableCell align="right">Доступно</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Button
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    disabled={formData.items.length === 1}
                    size="small"
                  >
                    ×
                  </Button>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.resourceId ? String(item.resourceId) : ""}
                    onChange={(e) =>
                      handleResourceChange(index, e.target.value)
                    }
                    displayEmpty
                    fullWidth
                  >
                    <MenuItem value="">Выберите ресурс</MenuItem>
                    {resources.map((resource) => (
                      <MenuItem key={resource.id} value={String(resource.id)}>
                        {resource.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={
                      item.unitOfMeasureId ? String(item.unitOfMeasureId) : ""
                    }
                    onChange={(e) => handleUnitChange(index, e.target.value)}
                    displayEmpty
                    fullWidth
                  >
                    <MenuItem value="">Выберите единицу</MenuItem>
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={String(unit.id)}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                    fullWidth
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell align="right">0</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={5}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAddItem}
                  size="small"
                >
                  + Добавить ресурс
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Кнопки */}
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          Сохранить
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmitAndSign}
          disabled={loading}
        >
          Сохранить и подписать
        </Button>
      </Box>
    </Box>
  );
};

export default AddShipmentPage;
