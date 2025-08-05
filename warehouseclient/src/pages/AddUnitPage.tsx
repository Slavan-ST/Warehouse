import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Alert } from '@mui/material';
import { createUnit } from '../api/warehouseApi';

const AddUnitPage = () => {
    const [formData, setFormData] = useState({
        name: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle form input changes
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate form data
            if (!formData.name) {
                setError('Поле "Наименование" не может быть пустым');
                return;
            }

            // Send POST request to create a new unit of measure
            await createUnit(formData.name);

            // Show success message
            alert('Единица измерения успешно сохранена!');
            setFormData({ name: '' }); // Clear form after successful submission
        } catch (err) {
            console.error('Ошибка сохранения единицы измерения:', err);
            setError('Ошибка при сохранении единицы измерения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Добавление единицы измерения</Typography>
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
            </Box>
            {/* Кнопка сохранения */}
            <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={!formData.name || loading}
                sx={{ mt: 2 }}
            >
                {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
        </Box>
    );
};

export default AddUnitPage;