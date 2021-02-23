const mongoose = require('mongoose');

require('dotenv').config({ path: 'variables.env'});

const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('DB connectada');
    } catch (error) {
        console.log('hubo un error');
        console.log(error);
        process.exit(1); //stop the app
    }
}

module.exports = connectionDB;