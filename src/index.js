const app = require('./app');
const sequelize = require('./Config/database');
const { PROD } = require('./config');

// Database synchronization (if using Sequelize)
sequelize.sync()
    .then(() => {
        console.log('Database synced successfully.');
    })
    .catch((error) => {
        console.error('Database synchronization failed:', error);
    });

    // Start the Express server
const port = PROD === true ? 3000 : 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
