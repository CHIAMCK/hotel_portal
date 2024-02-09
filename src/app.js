const express = require('express');
const routes = require('./routes');
const redis = require('ioredis');
const fetchDataAndMerge = require('./cron/dataProcess');
const cron = require('node-cron');

const app = express();
const redisClient = new redis({
    host: 'localhost',
    port: 6379,
});

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/v1', routes);
app.set('redisClient', redisClient);

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

cron.schedule('*/5 * * * *', async () => {
    console.log('Running data fetching job...');
    await fetchDataAndMerge(redisClient);
});

console.log('Server started. Running initial data fetching job...');
fetchDataAndMerge(redisClient);

// Start the server
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});

module.exports = redisClient;
