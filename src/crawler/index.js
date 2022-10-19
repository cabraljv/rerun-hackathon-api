const { getAllBullsData } = require('../services/dairybulls')
const { initWorker } = require('./worker')

const main = async () => {
  const breadsToProcess = process.env.BREADS_TO_PROCESS.split(',')
  const promises = breadsToProcess.map(bread => getAllBullsData(bread))
  await Promise.all(promises)
  await initWorker()
}
main()
