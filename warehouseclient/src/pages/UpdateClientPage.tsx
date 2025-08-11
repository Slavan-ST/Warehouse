import React, { useState, useEffect } from "react";
import { Typography, Box, TextField, Button, Alert } from "@mui/material";
import {
  getClientById,
  updateClient,
  archiveClient,
  restoreClient,
} from "../api/warehouseApi";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { ClientDto } from "../api/warehouseApi";

const UpdateClientPage = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);
  const navigate = useNavigate();

  const [client, setClient] = useState<ClientDto | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchClient = async () => {
        try {
          const fetchedClient = await getClientById(clientId);
          setClient(fetchedClient);
          setFormData({
            name: fetchedClient.name,
            address: fetchedClient.address,
          });
        } catch (err) {
          setError("Не удалось загрузить данные клиента");
        }
      };
      fetchClient();
    }, [id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, address: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      setError('Поля "Наименование" и "Адрес" не могут быть пустыми');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updateClient(clientId, formData.name, formData.address);
      alert("Клиент успешно обновлён!");
      navigate("/clients");
    } catch (err) {
      console.error("Ошибка обновления клиента:", err);
      setError("Ошибка при обновлении клиента");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("Вы уверены, что хотите архивировать этого клиента?"))
      return;

    try {
      setLoading(true);
      setError(null);
      await archiveClient(clientId);
      alert("Клиент успешно архивирован!");
      navigate("/clients");
    } catch (err) {
      console.error("Ошибка архивации клиента:", err);
      setError("Ошибка при архивации клиента");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm("Восстановить клиента в активные?")) return;

    try {
      setLoading(true);
      setError(null);
      await restoreClient(clientId);
      alert("Клиент успешно восстановлен!");
      navigate("/clients");
    } catch (err) {
      console.error("Ошибка восстановления клиента:", err);
      setError("Ошибка при восстановлении клиента");
    } finally {
      setLoading(false);
    }
  };

  if (!client) {
    return <Box sx={{ p: 3 }}>Загрузка...</Box>;
  }

  const isArchived = client.status === 1;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Редактирование клиента
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <TextField
          label="Наименование"
          value={formData.name}
          onChange={handleNameChange}
          fullWidth
          sx={{ mb: 2 }}
          disabled={isArchived}
          error={!!error && !formData.name}
          helperText={!formData.name ? "Обязательное поле" : ""}
        />
        <TextField
          label="Адрес"
          value={formData.address}
          onChange={handleAddressChange}
          fullWidth
          sx={{ mb: 2 }}
          disabled={isArchived}
          error={!!error && !formData.address}
          helperText={!formData.address ? "Обязательное поле" : ""}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        {!isArchived ? (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={loading || !formData.name || !formData.address}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleArchive}
              disabled={loading}
            >
              {loading ? "Архивация..." : "В архив"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleRestore}
            disabled={loading}
          >
            {loading ? "Восстановление..." : "Вернуть в работу"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default UpdateClientPage;
