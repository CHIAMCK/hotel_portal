const express = require('express');
const routes = require('./routes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/v1', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
