require ('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const PORT = process.env.PORT || 5000;
const app = express()

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API для 2-го задания',
            version: '1.0.0',
            description: 'Описание  API',

        },
    },
    // Пути к файлам, содержащим комментарии JSDoc для автоматической генерации документации Swagger
    apis: ['./controllers/*.js', './service/*.js', './middlewares/*.js'], // Укажите путь к вашим контроллерам, сервисам и промежуточным слоям

};


const specs = swaggerJsdoc(options);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);
app.use(errorMiddleware);


const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        app.listen(PORT, () => console.log(`Сервер запущен на порту = ${PORT}`))
    } catch (e) {
        console.log(e);
    }

}

start()