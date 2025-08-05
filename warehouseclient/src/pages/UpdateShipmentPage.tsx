import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { getShipmentById, updateShipment, archiveShipment } from '../api/warehouseApi';
import { useParams, useNavigate } from 'react-router-dom';

interface Shipment {
    id: number;
    number: string;
    date: string;
    clientId: number;
    clientName: string;
    shipmentResources: {
        resourceId: number;
        unitOfMeasureId: number;
        quantity: number;
        resourceName: string;
        unitName: string;
    }[];
}

const UpdateShipmentPage = () => {
    const { id } = useParams<{ id: string }>();
    const shipmentId = Number(id);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        number: '',
        date: '',
        clientId: 0,
        shipmentResources: [] as {
            resourceId: number;
            unitOfMeasureId: number;
            quantity: number;
        }[],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShipment = async () => {
            try {
                setLoading(true);
                setError(null);
                const shipment = await getShipmentById(shipmentId);
                setFormData({
                    number: shipment.number,
                    date: shipment.date,
                    clientId: shipment.clientId,
                    shipmentResources: shipment.shipmentResources.map((sr) => ({
                        resourceId: sr.resourceId,
                        unitOfMeasureId: sr.unitOfMeasureId,
                        quantity: sr.quantity,
                    })),
                });
            } catch (err) {
                console.error('Ошибка получения отгрузки:', err);
                setError('Не удалось загрузить данные отгрузки');
            } finally {
                setLoading(false);
            }
        };
        fetchShipment();
    }, [shipmentId]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, number: e.target.value });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, date: e.target.value });
    };

    const handleClientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, clientId: Number(e.target.value) });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate form data
            if (!formData.number || !formData.date || formData.clientId <= 0) {
                setError('Поля "Номер", "Дата" и "Клиент" не могут быть пустыми');
                return;
            }

            // Send PUT request to update the shipment
            await updateShipment(shipmentId, formData);

            // Show success message
            alert('Отгрузка успешно обновлена!');
            setFormData({ ...formData }); // Refresh form data
        } catch (err) {
            console.error('Ошибка обновления отгрузки:', err);
            setError('Ошибка при обновлении отгрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        try {
            setLoading(true);
            setError(null);

            // Send DELETE request to archive the shipment
            await archiveShipment(shipmentId);

            // Show success message
            alert('Отгрузка успешно архивирована!');
            navigate('/shipments'); // Redirect to shipments list
        } catch (err) {
            console.error('Ошибка архивации отгрузки:', err);
            setError('Ошибка при архивации отгрузки');
        } finally {
            setLoading(false);
        }
    };

    if (!formData || loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Отгрузка</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mt: 2 }}>
                {/* Кнопка отзыва */}
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleArchive}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    Отозвать
                </Button>

                {/* Поле для номера */}
                <TextField
                    label="Номер"
                    value={formData.number}
                    onChange={handleNumberChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText={error && error}
                    error={!!error}
                />
                {/* Поле для даты */}
                <TextField
                    label="Дата"
                    type="date"
                    value={formData.date}
                    onChange={handleDateChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText={error && error}
                    error={!!error}
                />
                {/* Поле для клиента */}
                <TextField
                    label="Клиент"
                    value={formData.clientId.toString()}
                    onChange={handleClientIdChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText={error && error}
                    error={!!error}
                />
            </Box>

            {/* Таблица с ресурсами */}
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Ресурс</TableCell>
                        <TableCell>Единица измерения</TableCell>
                        <TableCell align="right">Количество</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {formData.shipmentResources.map((resource, index) => (
                        <TableRow key={index}>
                            <TableCell>{resource.resourceId}</TableCell>
                            <TableCell>{resource.unitOfMeasureId}</TableCell>
                            <TableCell align="right">{resource.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={!formData.number || !formData.date || formData.clientId <= 0 || loading}
                    sx={{ mr: 2 }}
                >
                    {loading ? 'Обновление...' : 'Сохранить'}
                </Button>
            </Box>
        </Box>
    );
};

export default UpdateShipmentPage;