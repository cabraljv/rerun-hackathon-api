const { updateBullStatus, getCreatedBulls, updateBull } = require('../services/bull')
const { insertBullData } = require('../services/bullData')
const { getSingleBullData } = require('../services/dairybulls')

exports.initWorker = async () => {
  const processBull = async (bull) => {
    await updateBullStatus(bull.id, 'PROCESSING')
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
      await insertBullData(dataToInsert)
      await updateBull({
        id: bull.id,
        status: 'PROCESSED',
        grandFatherId: bullData.mgs,
        fatherId: bullData.sire
      })
    } catch (error) {
      console.log('ERROR PROCESSING', bull.id)
      await updateBullStatus(bull.id, 'ERROR')
    }
  }
  const proccessList = await getCreatedBulls()
  let index = 0
  const createProcessWorker = async () => {
    while (proccessList.length > 0) {
      const bull = proccessList.pop()
      const startTs = process.hrtime()
      await processBull(bull)
      const endTs = process.hrtime(startTs)
      console.log(`${index} => Processed bull ${bull.id} in ${endTs.join('.')}`)
      index++
    }
  }
  const promises = []
  for (let i = 0; i < Number(process.env.WORKERS_COUNT); i++) {
    promises.push(createProcessWorker())
  }
  await Promise.all(promises)
}
