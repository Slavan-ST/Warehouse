// src/pages/UpdateResourcePage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Alert } from '@mui/material';
import { getResourceById, updateResource, archiveResource, restoreResource } from '../api/warehouseApi';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import type {ResourceDto} from "../api/warehouseApi";



const UpdateResourcePage = () => {
    const { id } = useParams<{ id: string }>();
    const resourceId = Number(id);
    const navigate = useNavigate();

    const [resource, setResource] = useState<ResourceDto | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const fetchedResource = await getResourceById(resourceId);
                setResource(fetchedResource);
                setFormData({ name: fetchedResource.name });
            } catch (err) {
                console.error('Ошибка получения ресурса:', err);
                setError('Не удалось загрузить данные ресурса');
            }
        };
        fetchResource();
    }, [resourceId]);

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
            await updateResource(resourceId, formData.name);
            alert('Ресурс успешно обновлен!');
        } catch (err) {
            console.error('Ошибка обновления ресурса:', err);
            setError('Ошибка при обновлении ресурса');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!window.confirm('Вы уверены, что хотите архивировать этот ресурс?')) return;

        try {
            setLoading(true);
            setError(null);
            await archiveResource(resourceId);
            alert('Ресурс успешно архивирован!');
            navigate('/resources');
        } catch (err) {
            console.error('Ошибка архивации ресурса:', err);
            setError('Ошибка при архивации ресурса');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!window.confirm('Восстановить ресурс в активные?')) return;

        try {
            setLoading(true);
            setError(null);
            await restoreResource(resourceId);
            alert('Ресурс успешно восстановлен!');
            navigate('/resources');
        } catch (err) {
            console.error('Ошибка восстановления ресурса:', err);
            setError('Ошибка при восстановлении ресурса');
        } finally {
            setLoading(false);
        }
    };

    if (!resource) {
        return <div>Загрузка...</div>;
    }

    const isArchived = resource.status === 1;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Ресурс</Typography>
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

export default UpdateResourcePage;