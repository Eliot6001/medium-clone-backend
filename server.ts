const appInstance = require('./app');
const port = process.env.PORT || 3002;

appInstance.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
