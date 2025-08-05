import React, { useState } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import { createResource } from '../api/warehouseApi'; // Import the API function

const AddResourcePage = () => {
    // State for form data
    const [formData, setFormData] = useState({
        name: '',
    });

    // State for loading and error messages
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

            // Send POST request to create a new resource
            await createResource(formData.name);

            // Show success message
            alert('Ресурс успешно сохранен!');
            setFormData({ name: '' }); // Clear form after successful submission
        } catch (err) {
            console.error('Ошибка сохранения ресурса:', err);
            setError('Ошибка при сохранении ресурса');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Добавление ресурса</Typography>
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

export default AddResourcePage;