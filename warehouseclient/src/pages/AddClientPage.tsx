import React, { useState } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import { createClient } from '../api/warehouseApi';


const AddClientPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, address: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate form data
            if (!formData.name || !formData.address) {
                setError('Поля "Наименование" и "Адрес" не могут быть пустыми');
                return;
            }

            // Send POST request to create a new client
            await createClient(formData.name, formData.address);

            // Show success message
            alert('Клиент успешно сохранен!');
            setFormData({ name: '', address: '' }); // Clear form after successful submission
        } catch (err) {
            console.error('Ошибка сохранения клиента:', err);
            setError('Ошибка при сохранении клиента');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Добавление клиента</Typography>
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
            {/* Кнопка сохранения */}
            <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.address || loading}
                sx={{ mt: 2 }}
            >
                {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
        </Box>
    );
};

export default AddClientPage;