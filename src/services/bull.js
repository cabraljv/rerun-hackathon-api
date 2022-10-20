const connectToDatabase = require('../utils/db')
const { getSingleBullData } = require('./dairybulls')

exports.updateBullStatus = async (bullId, status) => {
  const { Bull } = await connectToDatabase()
  await Bull.update({ status }, { where: { id: bullId } })
}

exports.getCreatedBulls = async () => {
  const { Bull } = await connectToDatabase()
  const createdBulls = await Bull.findAll({ where: { status: 'CREATED' } })
  return createdBulls
}

exports.updateBull = async ({ id, grandFatherId, fatherId, status }) => {
  const { Bull } = await connectToDatabase()
  await Bull.update({ grandFatherId, fatherId, status }, { where: { id } })
}

exports.insertBulls = async (bulls) => {
  const { Bull } = await connectToDatabase()
  const insertData = bulls.map(bull => ({
    id: bull.id,
    name: bull.name,
    bread: bull.bread,
    status: 'CREATED'
  }))
  for (const data of insertData) {
    await Bull.upsert(data)
  }
}

exports.getAllBulls = async (page, limit) => {
  const { Bull, BullData } = await connectToDatabase()
  const processedBulls = await Bull.findAll({
    offset: page * limit,
    limit,
    order: [['status', 'DESC']],
    includes: [{ model: BullData }]
  })
  const returnBulls = processedBulls.map(bull => {
    const obj = {}
    obj.id = bull.id
    obj.name = bull.name
    obj.status = bull.status
    obj.grandFatherId = bull.grandFatherId
    obj.bread = bull.bread
    obj.fatherId = bull.fatherId
    if (bull.bullDatas) {
      for (const data of bull.bullDatas) {
        obj[data.type] = data.value
      }
    }
    return obj
  })

  return returnBulls
}

exports.getSingleBull = async (bullId) => {
  const { Bull, BullData } = await connectToDatabase()
  const bull = await Bull.findOne({
    where: {
      id: bullId
    },
    includes: [{ model: BullData }]
  })
  if (!bull) throw new Error('Bull not found')
  const obj = {}
  obj.id = bull.id
  obj.name = bull.name
  obj.status = bull.status
  obj.grandFatherId = bull.grandFatherId
  obj.bread = bull.bread
  obj.fatherId = bull.fatherId
  if (bull.bullDatas) {
    for (const data of bull.bullDatas) {
      obj[data.type] = data.value
    }
  }
  return obj
}

exports.processBull = async (bull) => {
  await this.updateBullStatus(bull.id, 'PROCESSING')
  try {
    const bullData = await getSingleBullData(bull.id, bull.bread)
    const dataToInsert = Object.keys(bullData)
      .map(key => (
        {
          id: `${key}_${bull.id}`,
          type: key,
          value: bullData[key],
          bullId: bull.id
        }))
    await this.insertBullData(dataToInsert)
    await this.updateBull({
      id: bull.id,
      status: 'PROCESSED',
      grandFatherId: bullData.mgs,
      fatherId: bullData.sire
    })
  } catch (error) {
    console.log('ERROR PROCESSING', bull.id)
    await this.updateBullStatus(bull.id, 'ERROR')
  }
}
