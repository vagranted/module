const MailService = require('../service/mail-service');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const UserModel = require('../models/user-model');
const mailService = require("../service/mail-service");


async function changePassword(req, res, next) {
    try {
        const { email, currentPassword, newPassword } = req.body;
        console.log('Received body:', req.body); // Проверка тела запроса
        console.log('Received data:', { email, currentPassword, newPassword });

        // Проверяем правильность текущего пароля
        const user = await UserModel.findOne({ email });
        if (!user) {
            return next(ApiError.BadRequest('Пользователь с таким email не найден'));
        }

        // Сравниваем текущий пароль с хэшированным паролем пользователя из базы данных
        const isMatchPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isMatchPassword) {
            return next(ApiError.BadRequest('Настоящий пароль неверен'));
        }

        // Хэшируем новый пароль перед сохранением в базу данных
        const hashedNewPassword = await bcrypt.hash(newPassword, 3); // Увеличил значение "salt rounds"

        // Обновляем пароль пользователя в базе данных
        user.password = hashedNewPassword;
        await user.save();

        // Отправляем электронное письмо о смене пароля
        await mailService.sendPasswordEmail(email, `${process.env.API_URL}`);

        // Формируем и отправляем ответ об успешном изменении пароля
        return res.json({ message: 'Пароль успешно изменен' });

    } catch (e) {
        next(e);
    }
}

module.exports = changePassword;