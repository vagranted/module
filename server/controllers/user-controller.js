const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const uuid = require('uuid');
const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');

/**
 * @swagger
 * tags:
 *   name: Пользователь
 *   description: Управление пользователями
 */

class UserController {
    /**
     * @swagger
     * /api/registration:
     *   post:
     *     summary: Регистрация пользователя
     *     description: Регистрирует нового пользователя.
     *     tags: [Пользователь]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               surname:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       '200':
     *         description: Пользователь успешно зарегистрирован
     *       '400':
     *         description: Некорректные данные пользователя
     *       '500':
     *         description: Внутренняя ошибка сервера
     */
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            }
            const {name, surname, email, password} = req.body;
            const userData = await userService.registration(name, surname, email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    /**
     * @swagger
     * /api/login:
     *   post:
     *     summary: Вход пользователя
     *     description: Аутентифицирует пользователя и создает сеанс.
     *     tags: [Пользователь]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       '200':
     *         description: Пользователь успешно вошел в систему
     *       '401':
     *         description: Неправильный email или пароль
     *       '500':
     *         description: Внутренняя ошибка сервера
     */
    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    /**
     * @swagger
     * /api/logout:
     *   post:
     *     summary: Выход пользователя
     *     description: Закрывает текущий сеанс пользователя.
     *     tags: [Пользователь]
     *     responses:
     *       '200':
     *         description: Пользователь успешно вышел из системы
     *       '500':
     *         description: Внутренняя ошибка сервера
     */
    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    /**
     * @swagger
     * /api/activate/{link}:
     *   get:
     *     summary: Активация аккаунта
     *     description: Активирует аккаунт пользователя по ссылке активации.
     *     tags: [Пользователь]
     *     parameters:
     *       - in: path
     *         name: link
     *         required: true
     *         description: Ссылка активации, отправленная на электронную почту пользователя
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Аккаунт успешно активирован
     *       '400':
     *         description: Некорректная или просроченная ссылка активации
     *       '500':
     *         description: Внутренняя ошибка сервера
     */
    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    /**
     * @swagger
     * /api/refresh:
     *   get:
     *     summary: Обновление токена доступа
     *     description: Обновляет токен доступа пользователя.
     *     tags: [Пользователь]
     *     responses:
     *       '200':
     *         description: Токен доступа успешно обновлен
     *       '401':
     *         description: Пользователь не авторизован
     *       '500':
     *         description: Внутренняя ошибка сервера
     */
    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    /**
     * @swagger
     * /api/users:
     *   get:
     *     summary: Получение списка пользователей
     *     description: Возвращает список всех пользователей.
     *     tags: [Пользователь]
     *     responses:
     *       '200':
     *         description: Список пользователей успешно получен
     *       '401':
     *         description: Пользователь не авторизован
     *       '500':
     *         description: Внутренняя ошибка сервера
     */
    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();