const { getCreatedBulls, processBull } = require('../services/bull')

exports.initWorker = async () => {
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
