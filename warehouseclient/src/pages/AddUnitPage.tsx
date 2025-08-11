import React, { useState } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import { createUnit } from '../api/warehouseApi';

const AddUnitPage = () => {
    const [formData, setFormData] = useState({
        name: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!formData.name) {
                setError('Поле "Наименование" не может быть пустым');
                return;
            }

            await createUnit(formData.name);

            alert('Единица измерения успешно сохранена!');
            setFormData({ name: '' });
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