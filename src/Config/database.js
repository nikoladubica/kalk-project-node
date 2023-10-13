const { Sequelize } = require('sequelize');
const { PROD } = require('./../config');

let sequelize = null;

if (PROD === true) {
    sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        username: 'servern',
        password: 'root1000',
        database: 'kalk_project',
    });
} else {
    sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        username: 'root',
        password: 'root1000',
        database: 'kalk-project',
    });
}

module.exports = sequelize;
