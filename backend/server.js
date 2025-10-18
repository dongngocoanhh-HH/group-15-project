require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json()); // body parser for JSON

// root route
app.get('/', (req, res) => {
  res.json({ message: 'Backend running' });
});

// mount user routes
const userRouter = require('./routes/user');
app.use('/api/users', userRouter);

// sample existing route (if any)
const sampleRouter = require('./routes/sample');
app.use('/api/sample', sampleRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
