const connectToDatabase = require('../utils/db')

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

exports.getProcessedBulls = async (page, limit) => {
  const { Bull, BullData } = await connectToDatabase()
  const processedBulls = await Bull.findAll({
    where: { status: 'PROCESSED' },
    offset: page * limit,
    limit,
    includes: [{ model: BullData }]
  })
  const returnBulls = processedBulls.map(bull => {
    const obj = {}
    obj.id = bull.id
    obj.name = bull.name
    obj.status = bull.status
    obj.grandFatherId = bull.grandFatherId
    obj.fatherId = bull.fatherId
    for (const data of bull.bullDatas) {
      obj[data.type] = data.value
    }
    return obj
  })

  return returnBulls
}
