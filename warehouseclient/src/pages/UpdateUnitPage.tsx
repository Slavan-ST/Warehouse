// src/pages/UpdateUnitPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Alert } from '@mui/material';
import { getUnitById, updateUnit, archiveUnit, restoreUnit } from '../api/warehouseApi';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import type {UnitOfMeasureDto} from "../api/warehouseApi";




const UpdateUnitPage = () => {
    const { id } = useParams<{ id: string }>();
    const unitId = Number(id);
    const navigate = useNavigate();

    const [unit, setUnit] = useState<UnitOfMeasureDto | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleSave = async () => {
        if (!formData.name) {
            setError('Поле "Наименование" не может быть пустым');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await updateUnit(unitId, formData.name);
            alert('Единица измерения успешно обновлена!');
        } catch (err) {
            console.error('Ошибка обновления единицы измерения:', err);
            setError('Ошибка при обновлении единицы измерения');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!window.confirm('Вы уверены, что хотите архивировать эту единицу измерения?')) return;

        try {
            setLoading(true);
            setError(null);
            await archiveUnit(unitId);
            alert('Единица измерения успешно архивирована!');
            navigate('/units');
        } catch (err) {
            console.error('Ошибка архивации единицы измерения:', err);
            setError('Ошибка при архивации единицы измерения');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!window.confirm('Восстановить единицу измерения в активные?')) return;

        try {
            setLoading(true);
            setError(null);
            await restoreUnit(unitId);
            alert('Единица измерения успешно восстановлена!');
            navigate('/units');
        } catch (err) {
            console.error('Ошибка восстановления единицы измерения:', err);
            setError('Ошибка при восстановлении единицы измерения');
        } finally {
            setLoading(false);
        }
    };

    if (!unit) {
        return <div>Загрузка...</div>;
    }

    const isArchived = unit.status === 1;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Единицы измерения</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mt: 2 }}>
                <TextField
                    label="Наименование"
                    value={formData.name}
                    onChange={handleNameChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText={error && error}
                    error={!!error}
                    disabled={isArchived}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={!formData.name || loading || isArchived}
                >
                    {loading ? 'Обновление...' : 'Сохранить'}
                </Button>

                {!isArchived ? (
                    <>
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
                    </>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleRestore}
                        disabled={loading}
                    >
                        {loading ? 'Восстановление...' : 'В работу'}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default UpdateUnitPage;