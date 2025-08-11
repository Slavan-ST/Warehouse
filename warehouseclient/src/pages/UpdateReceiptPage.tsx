import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  getReceiptById,
  updateReceipt,
  archiveReceipt,
} from "../api/warehouseApi";
import { useParams, useNavigate } from "react-router-dom";

const UpdateReceiptPage = () => {
  const { id } = useParams<{ id: string }>();
  const receiptId = Number(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    number: "",
    date: "",
    receiptResources: [] as {
      resourceId: number;
      unitOfMeasureId: number;
      quantity: number;
    }[],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        setError(null);
        const receipt = await getReceiptById(receiptId);
        setFormData({
          number: receipt.number,
          date: receipt.date,
          receiptResources: receipt.receiptResources,
        });
      } catch (err) {
        console.error("Ошибка получения поступления:", err);
        setError("Не удалось загрузить данные поступления");
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [receiptId]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, number: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, date: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.number || !formData.date) {
        setError('Поля "Номер" и "Дата" не могут быть пустыми');
        return;
      }

      await updateReceipt(receiptId, {
        number: formData.number,
        date: formData.date,
        resources: formData.receiptResources, // ← ключевое изменение
      });

      alert("Поступление успешно обновлено!");
      setFormData({ ...formData });
    } catch (err) {
      console.error("Ошибка обновления поступления:", err);
      setError("Ошибка при обновлении поступления");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      setError(null);

      await archiveReceipt(receiptId);

      alert("Поступление успешно архивировано!");
      navigate("/receipts");
    } catch (err) {
      console.error("Ошибка архивации поступления:", err);
      setError("Ошибка при архивации поступления");
    } finally {
      setLoading(false);
    }
  };

  if (!formData || loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Поступление
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <TextField
          label="Номер"
          value={formData.number}
          onChange={handleNumberChange}
          fullWidth
          sx={{ mb: 2 }}
          helperText={error && error}
          error={!!error}
        />
        <TextField
          label="Дата"
          type="date"
          value={formData.date}
          onChange={handleDateChange}
          fullWidth
          sx={{ mb: 2 }}
          helperText={error && error}
          error={!!error}
        />
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ресурс</TableCell>
            <TableCell>Единица измерения</TableCell>
            <TableCell align="right">Количество</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.receiptResources.map((resource, index) => (
            <TableRow key={index}>
              <TableCell>{resource.resourceId}</TableCell>
              <TableCell>{resource.unitOfMeasureId}</TableCell>
              <TableCell align="right">{resource.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={!formData.number || !formData.date || loading}
          sx={{ mr: 2 }}
        >
          {loading ? "Обновление..." : "Сохранить"}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleArchive}
          disabled={loading}
        >
          {loading ? "Архивация..." : "Удалить"}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateReceiptPage;
