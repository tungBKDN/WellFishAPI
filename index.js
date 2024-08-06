const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { indexCorsOptions } = require('./corsConfig')

require('./services/pictureUpload');

app.use(bodyParser.json());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(indexCorsOptions);

// Routes assigning -- START
app.use('/api/login', require('./routes/loginRoutes'));
app.use('/api/register', require('./routes/registerRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/home', require('./routes/homeRoutes'));
app.use('/public/picture', require('./routes/pictureRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));

app.use('/api/orders', require('./routes/orderRoutes'));
// Routes assigning -- END

const port = process.env.PORT || 3333;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});