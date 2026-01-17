const { DataTypes } = require("sequelize");
const sequelize = require('../utils/db-connection');

const DownloadedFile = sequelize.define('DownloadedFile', {
  fileURL: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = DownloadedFile;
