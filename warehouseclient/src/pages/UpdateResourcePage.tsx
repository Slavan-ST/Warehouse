import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import { getResourceById, updateResource, archiveResource } from '../api/warehouseApi';

interface Resource {
    id: number;
    name: string;
}

const UpdateResourcePage = ({ resourceId }: { resourceId: number }) => {
    // State for form data
    const [resource, setResource] = useState<Resource | null>(null);
    const [formData, setFormData] = useState({
        name: '',
    });

    // State for loading and error messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch the resource by ID on mount
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

            // Send PUT request to update the resource
            await updateResource(resourceId, formData.name);

            // Show success message
            alert('Ресурс успешно обновлен!');
            setFormData({ name: formData.name }); // Refresh form data
        } catch (err) {
            console.error('Ошибка обновления ресурса:', err);
            setError('Ошибка при обновлении ресурса');
        } finally {
            setLoading(false);
        }
    };

    // Handle archive button click
    const handleArchive = async () => {
        try {
            setLoading(true);
            setError(null);

            // Send POST request to archive the resource
            await archiveResource(resourceId);

            // Show success message
            alert('Ресурс успешно архивирован!');
            window.location.href = '/resources'; // Redirect to resource list
        } catch (err) {
            console.error('Ошибка архивации ресурса:', err);
            setError('Ошибка при архивации ресурса');
        } finally {
            setLoading(false);
        }
    };

    if (!resource) {
        return <div>Загрузка...</div>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Ресурс</Typography>
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

export default UpdateResourcePage;