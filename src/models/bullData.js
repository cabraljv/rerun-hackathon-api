module.exports = (sequelize, type) => {
  const BullModel = sequelize.define('bullData', {
    id: {
      type: type.STRING,
      primaryKey: true
    },
    type: {
      type: type.STRING,
      allowNull: true
    },
    bullId: {
      type: type.STRING,
      allowNull: true
    },
    value: {
      type: type.STRING,
      allowNull: true
    }
  },
  {
    freezeTableName: true,
    createdAt: 'created_at',
    timestamps: false
  })
  return BullModel
}
