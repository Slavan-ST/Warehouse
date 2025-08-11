import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import { getClientById, updateClient, archiveClient, restoreClient  } from '../api/warehouseApi';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import type {ClientDto} from "../api/warehouseApi";

const UpdateClientPage = () => {

    const { id } = useParams<{ id: string }>();
    const clientId = Number(id);
    const navigate = useNavigate();

    // State for form data
    const [client, setClient] = useState<ClientDto | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
    });

    // State for loading and error messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch the client by ID on mount
    useEffect(() => {
        const fetchClient = async () => {
            try {
                const fetchedClient = await getClientById(clientId);
                setClient(fetchedClient);
                setFormData({ name: fetchedClient.name, address: fetchedClient.address });
            } catch (err) {
                console.error('Ошибка получения клиента:', err);
                setError('Не удалось загрузить данные клиента');
            }
        };
        fetchClient();
    }, [clientId]);
    const handleRestore = async () => {
        try {
            setLoading(true);
            setError(null);
            await restoreClient(clientId);
            alert('Клиент восстановлен и возвращён в работу');
            setClient({ ...client!, status: 0 }); // Обновляем статус
        } catch (err) {
            console.error('Ошибка восстановления клиента:', err);
            setError('Не удалось восстановить клиента');
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, address: e.target.value });
    };

    // Handle save button click
    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate form data
            if (!formData.name || !formData.address) {
                setError('Поля "Наименование" и "Адрес" не могут быть пустыми');
                return;
            }

            // Send PUT request to update the client
            await updateClient(clientId, formData.name, formData.address);

            // Show success message
            alert('Клиент успешно обновлен!');
            setFormData({ name: formData.name, address: formData.address }); // Refresh form data
        } catch (err) {
            console.error('Ошибка обновления клиента:', err);
            setError('Ошибка при обновлении клиента');
        } finally {
            setLoading(false);
        }
    };

    // Handle archive button click
    const handleArchive = async () => {
        try {
            setLoading(true);
            setError(null);
            await archiveClient(clientId);
            alert('Клиент успешно архивирован!');
            navigate('/clients');
        } catch (err) {
            console.error('Ошибка архивации клиента:', err);
            setError('Ошибка при архивации клиента');
        } finally {
            setLoading(false);
        }
    };

    if (!client) {
        return <div>Загрузка...</div>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Клиент</Typography>
            <Box sx={{ mt: 2 }}>
                {/* Поле для наименования */}
                <TextField
                    label="Наименование"
                    value={formData.name}
                    onChange={handleNameChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText={error && error}
                    error={!!error}
                />
                {/* Поле для адреса */}
                <TextField
                    label="Адрес"
                    value={formData.address}
                    onChange={handleAddressChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText={error && error}
                    error={!!error}
                />
            </Box>
            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={!formData.name || !formData.address || loading || client?.status !== 0}
                >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>

                {client?.status === 0 ? (
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleArchive}
                        disabled={loading}
                    >
                        {loading ? 'Архивация...' : 'В архив'}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleRestore}
                        disabled={loading}
                    >
                        {loading ? 'Восстановление...' : 'Вернуть в работу'}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default UpdateClientPage;