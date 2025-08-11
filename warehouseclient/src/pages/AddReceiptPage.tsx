import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  TableContainer,
} from "@mui/material";
import { format, isValid } from "date-fns";
import type {
  ResourceDto,
  UnitOfMeasureDto,
  CreateReceiptDocumentRequest,
} from "../api/warehouseApi";
import { getActiveResources, getActiveUnits } from "../api/warehouseApi";
import { createReceipt } from "../api/warehouseApi";

const AddReceiptPage = () => {
  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [units, setUnits] = useState<UnitOfMeasureDto[]>([]);

  // Состояние для формы
  const [formData, setFormData] = useState({
    documentNumber: "",
    date: new Date(),
    items: [] as {
      resourceId: number;
      unitOfMeasureId: number;
      quantity: number;
    }[],
  });

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [res, unt] = await Promise.all([
          getActiveResources(),
          getActiveUnits(),
        ]);
        setResources(res);
        setUnits(unt);

        if (res.length > 0 && unt.length > 0) {
          setFormData((prev) => ({
            ...prev,
            items: [
              ...prev.items,
              { resourceId: 0, unitOfMeasureId: 0, quantity: 0 },
            ],
          }));
        }
      } catch (err) {
        console.error("Ошибка загрузки справочников:", err);
      }
    };
    loadReferences();
  }, []);

  const handleDocumentNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, documentNumber: e.target.value });
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
    if (!formData.documentNumber.trim()) {
      alert("Введите номер документа");
      return;
    }

    if (
      formData.items.length === 0 ||
      formData.items.some(
        (item) =>
          item.resourceId === 0 ||
          item.unitOfMeasureId === 0 ||
          item.quantity <= 0
      )
    ) {
      alert(
        "Заполните все поля ресурсов корректно (ресурс, единица, количество > 0)"
      );
      return;
    }

    const request: CreateReceiptDocumentRequest = {
      number: formData.documentNumber.trim(),
      date: format(formData.date, "yyyy-MM-dd"),
      resources: formData.items.map((item) => ({
        resourceId: item.resourceId,
        unitOfMeasureId: item.unitOfMeasureId,
        quantity: item.quantity,
      })),
    };

    try {
      const result = await createReceipt(request);
      console.log("Поступление успешно создано:", result);
      alert("Поступление успешно сохранено!");
    } catch (err) {
      console.error("Ошибка сохранения поступления:", err);
      alert(
        err instanceof Error ? err.message : "Ошибка при сохранении поступления"
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Добавление поступления
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mt: 1,
        }}
      >
        <TextField
          label="Номер документа"
          value={formData.documentNumber}
          onChange={handleDocumentNumberChange}
          fullWidth
          required
          sx={{ flex: 1 }}
        />
        <TextField
          label="Дата"
          type="date"
          value={formData.date.toISOString().split("T")[0]}
          onChange={handleDateChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          required
          sx={{ flex: 1 }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Ресурс</TableCell>
              <TableCell>Единица измерения</TableCell>
              <TableCell align="right">Количество</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Нет добавленных ресурсов
                </TableCell>
              </TableRow>
            ) : (
              formData.items.map((item, index) => (
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
                      value={item.resourceId || ""}
                      onChange={(e) =>
                        handleResourceChange(index, String(e.target.value))
                      }
                      displayEmpty
                      fullWidth
                    >
                      <MenuItem value="">Выберите ресурс</MenuItem>
                      {resources.map((resource) => (
                        <MenuItem key={resource.id} value={resource.id}>
                          {resource.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.unitOfMeasureId || ""}
                      onChange={(e) =>
                        handleUnitChange(index, String(e.target.value))
                      }
                      displayEmpty
                      fullWidth
                    >
                      <MenuItem value="">Выберите единицу измерения</MenuItem>
                      {units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
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
                </TableRow>
              ))
            )}
            <TableRow>
              <TableCell colSpan={4}>
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

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            !formData.documentNumber.trim() ||
            formData.items.length === 0 ||
            formData.items.some(
              (item) => item.resourceId === 0 || item.quantity <= 0
            )
          }
        >
          Сохранить
        </Button>
      </Box>
    </Box>
  );
};

export default AddReceiptPage;
