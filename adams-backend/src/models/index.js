const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const modelMap = {
  Role: require('./Role'),
  College: require('./College'),
  Department: require('./Department'),
  Program: require('./Program'),
  Team: require('./Team'),
  User: require('./User'),
  InvitationCode: require('./InvitationCode'),
  Document: require('./Document'),
  DocumentVersion: require('./DocumentVersion'),
  ReviewAction: require('./ReviewAction'),
  AuditLog: require('./AuditLog'),
  Notification: require('./Notification'),
  Report: require('./Report')
};

const models = {};
for (const [name, definition] of Object.entries(modelMap)) {
  models[name] = definition(sequelize, DataTypes);
}

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, Sequelize: require('sequelize'), ...models };
