module.exports = (sequelize, type) => {
  const BullModel = sequelize.define('bull', {
    id: {
      type: type.STRING,
      primaryKey: true
    },
    name: {
      type: type.STRING,
      allowNull: true
    },
    bread: {
      type: type.STRING,
      allowNull: true
    },
    grandFatherId: {
      type: type.STRING,
      allowNull: true
    },
    fatherId: {
      type: type.STRING,
      allowNull: true
    },
    status: {
      type: type.ENUM,
      values: ['CREATED', 'PROCESSING', 'PROCESSED', 'ERROR']
    }
  },
  {
    freezeTableName: true,
    createdAt: 'created_at',
    timestamps: false
  })
  return BullModel
}
