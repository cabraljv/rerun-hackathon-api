const { getAllBulls, getSingleBull, processBull } = require('../../services/bull')

exports.searchAllBulls = async (req, res) => {
  let { page = 0, limit = 50, notGen, name, percent = 0 } = req.query
  console.log(name)
  if(notGen){
    notGen = notGen.split(',')
  }else{
    notGen = []
  }
  if(name){
    name = `%${name}%`
  }else{
    name = '%'
  }
  if(percent){
    percent = parseFloat(percent)
  }
  const bulls = await getAllBulls(page, limit, notGen, name, percent)
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
