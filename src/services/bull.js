const connectToDatabase = require('../utils/db')
const dairybullsService = require('./dairybulls')
const { insertBullData } = require('./bullData')
const {Op} = require('sequelize')

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

exports.getAllBulls = async (page, limit, notGen, name, percent) => {
  const { Bull, BullData } = await connectToDatabase()
  const processedBulls = await Bull.findAll({
    where:{
        id: {
            [Op.in]: ['840M003209774579','840M003218042459','840M003218042425','840M003200644037']
        }
    },
    order: [['status', 'DESC']],
  })
  console.log(processedBulls.length)
  let validBulls = []
  for (const bull of processedBulls) {
    const father1 = await this.getSingleBull(bull.fatherId)
    const father2 = await this.getSingleBull(father1.sire)
    const father3 = await this.getSingleBull(father2.sire)
    const fatherGrandfather = await this.getSingleBull(father1.mgs)
    const mgs1 = await this.getSingleBull(bull.grandFatherId)
    const mgsFather = await this.getSingleBull(mgs1.sire)
    const ids = [bull.id, father1.id, father2.id, father3.id, fatherGrandfather.id, mgs1.id, mgsFather.id]
    const existentIds = ids.filter(id => notGen.includes(id))
    if(!ids.some(id => notGen.includes(id))){
      const bullData = await this.getSingleBull(bull.id)
      validBulls.push(bullData)
    }
  }


  return validBulls
  

}

exports.getSingleBull = async (bullId) => {
  const { Bull, BullData } = await connectToDatabase()
  const bull = await Bull.findOne({
    where: {
      id: bullId
    },
    include: [{ model: BullData }]
  })
  if (!bull) throw new Error('Bull not found')
  const obj = {}
  obj.id = bull.id
  obj.name = bull.name
  obj.status = bull.status
  obj.bread = bull.bread
  if (bull.bullData) {
    for (const data of bull.bullData) {
      obj[data.type] = data.value
    }
  }
  return obj
}

exports.processBull = async (bull) => {
  await this.updateBullStatus(bull.id, 'PROCESSING')
  try {
    const bullData = await dairybullsService.getSingleBullData(bull.id, bull.bread)
    const dataToInsert = Object.keys(bullData)
      .map(key => (
        {
          id: `${key}_${bull.id}`,
          type: key,
          value: bullData[key],
          bullId: bull.id
        }))
    await insertBullData(dataToInsert)
    await this.updateBull({
      id: bull.id,
      status: 'PROCESSED',
      grandFatherId: bullData.mgs,
      fatherId: bullData.sire
    })
  } catch (error) {
    console.log('ERROR PROCESSING', bull.id, error)
    await this.updateBullStatus(bull.id, 'ERROR')
  }
}
