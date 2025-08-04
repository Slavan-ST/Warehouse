import { useState } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
} from '@mui/material';

const AddResourcePage = () => {
    // Состояние для формы
    const [formData, setFormData] = useState({
        name: '',
    });

    // Обработчик изменения значения поля "Наименование"
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    // Функция сохранения нового ресурса
    const handleSubmit = async () => {
        try {
            // Здесь должна быть реализация отправки данных на сервер
            console.log('Сохранение нового ресурса:', formData);
            alert('Ресурс успешно сохранен!');
        } catch (err) {
            console.error('Ошибка сохранения ресурса:', err);
            alert('Ошибка при сохранении ресурса');
        }
    };

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
                />
            </Box>
            {/* Кнопка сохранения */}
            <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={!formData.name}
                sx={{ mt: 2 }}
            >
                Сохранить
            </Button>
        </Box>
    );
};

export default AddResourcePage;