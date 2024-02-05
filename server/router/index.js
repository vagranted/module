const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const passwordMiddleware = require('../middlewares/passwordMiddleware');
const authMiddleware = require('../middlewares/auth-middleware');
const changePasswordController = require('../controllers/changePassword-controller');



router.post('/registration', passwordMiddleware,
    body('email').isEmail(),
    body('password')
        .isLength({min: 8}) // Минимальная длина пароля
        .withMessage('Пароль должен содержать не менее 8 символов')
        .matches(/[A-Z]/) // Наличие латинских символов в верхнем регистре
        .withMessage('Пароль должен содержать хотя бы один символ в верхнем регистре')
        .matches(/[0-9]/) // Наличие цифр
        .withMessage('Пароль должен содержать хотя бы одну цифру')
        .matches(/[^A-Za-z0-9]/) // Наличие специальных символов
        .withMessage('Пароль должен содержать хотя бы один специальный символ')
    , userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);
router.post('/changePassword', body('email').isEmail(), changePasswordController);




module.exports = router

