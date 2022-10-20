const { getAllBulls, getSingleBull, processBull } = require('../../services/bull')

exports.searchAllBulls = async (req, res) => {
  const { page = 0, limit = 20 } = req.query
  const bulls = await getAllBulls(page, limit)
  return res.json({ bulls, page, limit })
}

exports.searchSingleBull = async (req, res) => {
  const { bullId } = req.params
  try {
    let bull = await getSingleBull(bullId)
    if (bull.status !== 'PROCESSED') {
      await processBull(bull)
      bull = await getSingleBull(bullId)
    }
    return res.json({ bull })
  } catch (error) {
    return res.status(404).json({ error: error.message })
  }
}
