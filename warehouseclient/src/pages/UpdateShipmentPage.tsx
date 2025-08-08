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
import { getShipmentById, updateShipment, archiveShipment, type ClientDto } from '../api/warehouseApi';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateShipmentPage = () => {

    const { id } = useParams(); // `id` будет string | undefined

    const shipmentId = Number(id);
    const navigate = useNavigate();

    const [clients, setClients] = useState<ClientDto[]>([]);

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
                // --- ПРОВЕРКА ПАРАМЕТРА URL ---
                if (!id) {
                    setError('ID документа не указан в URL');
                    setLoading(false);
                    return;
                }

                // --- ПРЕОБРАЗОВАНИЕ И ВАЛИДАЦИЯ ID ---
                const shipmentId = Number(id);
                if (isNaN(shipmentId) || shipmentId <= 0) {
                    setError('Некорректный ID документа');
                    setLoading(false);
                    return;
                }

                // --- ЗАГРУЗКА ДАННЫХ ---
                setLoading(true);
                setError(null);

                // Вызов API для получения документа
                const shipment = await getShipmentById(shipmentId);

                // Установка данных формы
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
                // Определяем сообщение об ошибке
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Не удалось загрузить данные отгрузки');
                }
            } finally {
                // Обязательно снимаем индикатор загрузки
                setLoading(false);
            }
        };

        // Запускаем загрузку
        fetchShipment();
    }, [id]);

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

            // --- ВАЛИДАЦИЯ ---
            if (!formData.number || !formData.date) {
                setError('Поля "Номер" и "Дата" не могут быть пустыми');
                return;
            }
            if (isNaN(formData.clientId) || formData.clientId <= 0) {
                setError('Пожалуйста, выберите корректного клиента');
                return;
            }

            // --- ПОДГОТОВКА ЗАПРОСА ---
            const request = {
                number: formData.number,
                date: formData.date,
                clientId: formData.clientId,
                resources: formData.shipmentResources // Ключевое изменение!
            };

            // --- ОТПРАВКА ЗАПРОСА ---
            await updateShipment(shipmentId, request);

            alert('Отгрузка успешно обновлена!');
        } catch (err) {
            console.error('Ошибка обновления отгрузки:', err);
            setError('Ошибка при обновлении отгрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!window.confirm('Вы уверены, что хотите отозвать эту отгрузку?')) return;

        try {
            setLoading(true);
            setError(null);
            await archiveShipment(shipmentId);
            alert('Отгрузка успешно отозвана!');
            navigate('/shipments');
        } catch (err) {
            console.error('Ошибка отзыва отгрузки:', err);
            setError('Ошибка при отзыве отгрузки');
        } finally {
            setLoading(false);
        }
    };

    // --- УБРАНО !formData ---
    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Отгрузка</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleArchive}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    Отозвать
                </Button>

                <TextField
                    label="Номер"
                    value={formData.number}
                    onChange={handleNumberChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Дата"
                    type="date"
                    value={formData.date.split('T')[0]} // Очистка времени
                    onChange={handleDateChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="ID Клиента (для теста)"
                    type="number"
                    value={formData.clientId || ''}
                    onChange={handleClientIdChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText="Введите ID существующего клиента"
                />
            </Box>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Ресурс</TableCell>
                        <TableCell>Ед. изм.</TableCell>
                        <TableCell align="right">Кол-во</TableCell>
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

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Обновление...' : 'Сохранить'}
                </Button>
            </Box>
        </Box>
    );
};

export default UpdateShipmentPage;