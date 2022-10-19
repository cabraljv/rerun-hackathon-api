const Sequelize = require('sequelize')
const BullModel = require('../models/bull')
const BullDataModel = require('../models/bullData')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false
  }
)

const Bull = BullModel(sequelize, Sequelize)
const BullData = BullDataModel(sequelize, Sequelize)

Bull.hasMany(BullData, { foreignKey: 'bullId' })
BullData.belongsTo(Bull, { foreignKey: 'bullId' })

const Models = { Bull, BullData, sequelize }
const connection = {}

module.exports = async () => {
  if (connection.isConnected) {
    return Models
  }

  await sequelize.authenticate()
  await sequelize.sync()
  connection.isConnected = true
  console.log('=> Created a new connection.')
  return Models
}
