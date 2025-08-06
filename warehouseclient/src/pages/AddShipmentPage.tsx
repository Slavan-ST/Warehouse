import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Grid,
    MenuItem,
    Select,
} from '@mui/material';
import { ru } from 'date-fns/locale';
import { format, isValid } from 'date-fns';
import type { Resource, Unit, Client } from '../api/warehouseApi';
import { getResources, getUnits, getClients } from '../api/warehouseApi';
import { createShipment, signShipment } from '../api/warehouseApi'; 

const AddShipmentPage = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Состояние для формы
    const [formData, setFormData] = useState({
        documentNumber: '',
        clientId: null as number | null,
        date: new Date(),
        items: [] as {
            resourceId: number;
            unitOfMeasureId: number;
            quantity: number;
        }[],
    });

    // Загрузка справочников
    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [res, unt, clt] = await Promise.all([getResources(), getUnits(), getClients()]);
                setResources(res);
                setUnits(unt);
                setClients(clt);
            } catch (err) {
                console.error('Ошибка загрузки справочников:', err);
            }
        };
        loadReferences();
    }, []);

    // Обработчик изменения номера документа
    const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, documentNumber: e.target.value });
    };

    // Обработчик изменения клиента
    const handleClientChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setFormData({ ...formData, clientId: e.target.value as number });
    };

    // Обработчик изменения даты
    const handleDateChange = (newValue: string | null) => {
        if (!newValue || !isValid(new Date(newValue))) return;
        setFormData({ ...formData, date: new Date(newValue) });
    };

    // Обработчик добавления нового ресурса
    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { resourceId: 0, unitOfMeasureId: 0, quantity: 0 },
            ],
        });
    };

    // Обработчик удаления ресурса
    const handleRemoveItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    // Обработчик изменения значения ресурса
    const handleResourceChange = (index: number, value: string) => {
        const resourceId = parseInt(value, 10);
        setFormData({
            ...formData,
            items: formData.items.map((item, i) =>
                i === index ? { ...item, resourceId } : item
            ),
        });
    };

    // Обработчик изменения единицы измерения
    const handleUnitChange = (index: number, value: string) => {
        const unitOfMeasureId = parseInt(value, 10);
        setFormData({
            ...formData,
            items: formData.items.map((item, i) =>
                i === index ? { ...item, unitOfMeasureId } : item
            ),
        });
    };

    // Обработчик изменения количества
    const handleQuantityChange = (index: number, value: string) => {
        const quantity = parseInt(value, 10);
        setFormData({
            ...formData,
            items: formData.items.map((item, i) =>
                i === index ? { ...item, quantity } : item
            ),
        });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true); // Добавьте состояние loading
            setError(null);

            // Валидация формы
            if (!formData.documentNumber) {
                setError('Поле "Номер" не может быть пустым');
                return;
            }
            if (!formData.clientId) {
                setError('Поле "Клиент" не может быть пустым');
                return;
            }
            if (formData.items.length === 0 || formData.items.some(item => item.quantity <= 0)) {
                setError('Добавьте хотя бы один ресурс с количеством больше 0');
                return;
            }

            // Подготовка данных для отправки
            const request: CreateShipmentDocumentRequest = {
                number: formData.documentNumber,
                date: formData.date.toISOString(), // Преобразуем в ISO строку
                clientId: formData.clientId,
                resources: formData.items.map(item => ({
                    resourceId: item.resourceId,
                    unitOfMeasureId: item.unitOfMeasureId,
                    quantity: item.quantity
                }))
            };

            // Вызов API для создания отгрузки
            const createdShipment = await createShipment(request);

            // Показываем успех
            alert(`Отгрузка №${createdShipment.number} успешно создана!`);
            // Опционально: перенаправить на страницу просмотра или очистить форму
            // setFormData(initialState); // Сброс формы
        } catch (err) {
            console.error('Ошибка сохранения отгрузки:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при сохранении отгрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAndSign = async () => {
        try {
            setLoading(true);
            setError(null);

            // Сначала создаем документ
            const request: CreateShipmentDocumentRequest = {
                number: formData.documentNumber,
                date: formData.date.toISOString(),
                clientId: formData.clientId,
                resources: formData.items.map(item => ({
                    resourceId: item.resourceId,
                    unitOfMeasureId: item.unitOfMeasureId,
                    quantity: item.quantity
                }))
            };

            const createdShipment = await createShipment(request);

            // Затем подписываем его
            await signShipment(createdShipment.id);

            alert(`Отгрузка №${createdShipment.number} успешно создана и подписана!`);
        } catch (err) {
            console.error('Ошибка сохранения и подписания отгрузки:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при сохранении и подписании отгрузки');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Добавление отгрузки</Typography>
            <Grid container spacing={2}>
                {/* Номер документа */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Номер"
                        value={formData.documentNumber}
                        onChange={handleDocumentNumberChange}
                        fullWidth
                    />
                </Grid>
                {/* Клиент */}
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Клиент"
                        value={formData.clientId}
                        onChange={handleClientChange}
                        fullWidth
                    >
                        <MenuItem value="">Выберите клиента</MenuItem>
                        {clients.map(client => (
                            <MenuItem key={client.id} value={client.id}>
                                {client.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                {/* Дата */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Дата"
                        type="date"
                        value={formData.date.toISOString().split('T')[0]}
                        onChange={(e) => handleDateChange(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>
            {/* Таблица для добавления ресурсов */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Ресурс</TableCell>
                            <TableCell>Единица измерения</TableCell>
                            <TableCell align="right">Количество</TableCell>
                            <TableCell align="right">Доступно</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formData.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Button
                                        color="error"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={formData.items.length === 1}
                                    >
                                        ×
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={item.resourceId.toString()}
                                        onChange={(e) => handleResourceChange(index, e.target.value)}
                                        fullWidth
                                    >
                                        <MenuItem value="">Выберите ресурс</MenuItem>
                                        {resources.map(resource => (
                                            <MenuItem key={resource.id} value={resource.id}>
                                                {resource.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={item.unitOfMeasureId.toString()}
                                        onChange={(e) => handleUnitChange(index, e.target.value)}
                                        fullWidth
                                    >
                                        <MenuItem value="">Выберите единицу измерения</MenuItem>
                                        {units.map(unit => (
                                            <MenuItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell align="right">
                                    <TextField
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell align="right">0</TableCell> {/* Здесь можно добавить логику для доступного количества */}
                            </TableRow>
                        ))}
                        {/* Кнопка добавления нового ресурса */}
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleAddItem}
                                >
                                    + Добавить ресурс
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Кнопки сохранения */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    disabled={!formData.documentNumber || !formData.clientId || formData.items.length === 0}
                >
                    Сохранить
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmitAndSign}
                    disabled={!formData.documentNumber || !formData.clientId || formData.items.length === 0}
                >
                    Сохранить и подписать
                </Button>
            </Box>
        </Box>
    );
};

export default AddShipmentPage;