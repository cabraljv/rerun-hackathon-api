const connectToDatabase = require('../utils/db')

exports.insertBullData = async (data) => {
  const { BullData } = await connectToDatabase()

  for (const bullData of data) {
    await BullData.upsert(bullData)
  }
}
