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
    Autocomplete,
    CircularProgress,
} from '@mui/material';
import { getShipmentById, updateShipment, archiveShipment, getClients, type ClientDto } from '../api/warehouseApi';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateShipmentPage = () => {
    const { id } = useParams();
    const shipmentId = Number(id);
    const navigate = useNavigate();

    const [clients, setClients] = useState<ClientDto[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
    const [clientsLoading, setClientsLoading] = useState(false);

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
        const fetchClients = async () => {
            setClientsLoading(true);
            try {
                const clientsData = await getClients();
                setClients(clientsData);
            } catch (err) {
                console.error('Ошибка загрузки клиентов:', err);
                setError('Не удалось загрузить список клиентов');
            } finally {
                setClientsLoading(false);
            }
        };

        fetchClients();
    }, []);

    useEffect(() => {
        const fetchShipment = async () => {
            if (!id) {
                setError('ID документа не указан в URL');
                setLoading(false);
                return;
            }

            const shipmentId = Number(id);
            if (isNaN(shipmentId) || shipmentId <= 0) {
                setError('Некорректный ID документа');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const shipment = await getShipmentById(shipmentId);

                setFormData({
                    number: shipment.number,
                    date: shipment.date,
                    clientId: shipment.client.id,
                    shipmentResources: shipment.shipmentResources.map((sr) => ({
                        resourceId: sr.resourceId,
                        unitOfMeasureId: sr.unitOfMeasureId,
                        quantity: sr.quantity,
                    })),
                });

                const client = clients.find(c => c.id === shipment.client.id) || null;
                setSelectedClient(client);
            } catch (err) {
                console.error('Ошибка получения отгрузки:', err);
                setError(err instanceof Error ? err.message : 'Не удалось загрузить данные отгрузки');
            } finally {
                setLoading(false);
            }
        };

        if (clients.length > 0) {
            fetchShipment();
        }
    }, [id, clients]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, number: e.target.value });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, date: e.target.value });
    };

    const handleClientChange = (_: any, value: ClientDto | null) => {
        setSelectedClient(value);
        setFormData({ ...formData, clientId: value?.id || 0 });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!formData.number || !formData.date) {
                setError('Поля "Номер" и "Дата" не могут быть пустыми');
                return;
            }
            if (!selectedClient) {
                setError('Пожалуйста, выберите клиента');
                return;
            }

            const request = {
                number: formData.number,
                date: formData.date,
                clientId: selectedClient.id,
                resources: formData.shipmentResources,
            };

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

    if (loading) {
        return <div>Загрузка данных...</div>;
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
                    value={formData.date.split('T')[0]}
                    onChange={handleDateChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                />

                <Autocomplete
                    value={selectedClient}
                    onChange={handleClientChange}
                    options={clients}
                    getOptionLabel={(option) => `${option.name}`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    loading={clientsLoading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Выберите клиента"
                            fullWidth
                            helperText="Начните вводить имя клиента"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {clientsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    noOptionsText="Клиенты не найдены"
                    sx={{ mb: 2 }}
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
                            <TableCell>Ресурс #{resource.resourceId}</TableCell>
                            <TableCell>Ед. изм. {resource.unitOfMeasureId}</TableCell>
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
                    {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </Box>
        </Box>
    );
};

export default UpdateShipmentPage;