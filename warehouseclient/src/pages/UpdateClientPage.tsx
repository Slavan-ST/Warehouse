import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import { getClientById, updateClient, archiveClient } from '../api/warehouseApi';

interface Client {
    id: number;
    name: string;
    address: string;
}

const UpdateClientPage = ({ clientId }: { clientId: number }) => {
    // State for form data
    const [client, setClient] = useState<Client | null>(null);
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

            // Send DELETE request to archive the client
            await archiveClient(clientId);

            // Show success message
            alert('Клиент успешно архивирован!');
            window.location.href = '/clients'; // Redirect to client list
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
                    disabled={!formData.name || !formData.address || loading}
                    sx={{ mr: 2 }}
                >
                    {loading ? 'Обновление...' : 'Сохранить'}
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleArchive}
                    disabled={loading}
                >
                    {loading ? 'Архивация...' : 'Удалить'}
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleArchive}
                    disabled={loading}
                >
                    {loading ? 'Архивация...' : 'В архив'}
                </Button>
            </Box>
        </Box>
    );
};

export default UpdateClientPage;