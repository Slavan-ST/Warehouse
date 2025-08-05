import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Alert } from '@mui/material';
import { getUnitById, updateUnit, archiveUnit } from '../api/warehouseApi';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';


const UpdateUnitPage = () => {

    const { id } = useParams<{ id: string }>();
    const unitId = Number(id);

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unit, setUnit] = useState<any | null>(null);

    // Fetch the unit by ID on mount
    useEffect(() => {
        const fetchUnit = async () => {
            try {
                const fetchedUnit = await getUnitById(unitId);
                setUnit(fetchedUnit);
                setFormData({ name: fetchedUnit.name });
            } catch (err) {
                console.error('Ошибка получения единицы измерения:', err);
                setError('Не удалось загрузить данные единицы измерения');
            }
        };

        fetchUnit();
    }, [unitId]);

    // Handle form input changes
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    // Handle save button click
    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate form data
            if (!formData.name) {
                setError('Поле "Наименование" не может быть пустым');
                return;
            }

            // Send PUT request to update the unit
            await updateUnit(unitId, formData.name);

            // Show success message
            alert('Единица измерения успешно обновлена!');
            setFormData({ name: formData.name }); // Refresh form data
        } catch (err) {
            console.error('Ошибка обновления единицы измерения:', err);
            setError('Ошибка при обновлении единицы измерения');
        } finally {
            setLoading(false);
        }
    };

    // Handle archive button click
    const handleArchive = async () => {
        try {
            setLoading(true);
            setError(null);

            // Send DELETE request to archive the unit
            await archiveUnit(unitId);

            // Show success message
            alert('Единица измерения успешно архивирована!');
            navigate('/units'); // Redirect to units list
        } catch (err) {
            console.error('Ошибка архивации единицы измерения:', err);
            setError('Ошибка при архивации единицы измерения');
        } finally {
            setLoading(false);
        }
    };

    if (!unit) {
        return <div>Загрузка...</div>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Единицы измерения</Typography>
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
            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={!formData.name || loading}
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

export default UpdateUnitPage;