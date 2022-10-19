const { getProcessedBulls } = require('../../services/bull')

exports.searchAllBulls = async (req, res) => {
  const { page = 0, limit = 20 } = req.query
  const bulls = await getProcessedBulls(page, limit)
  res.json({ bulls, page, limit })
}
