const PAGE_URL = 'https://semex.com.br/leite-importado/JE/TPI/GENOMAX'

const axios = require('axios')
const { parse } = require('node-html-parser')

exports.getPageData = async (pageUrl) => {
  try {
    const { data } = await axios.get(pageUrl)
    const pageRoot = parse(data)
    const headersHtmlEl = pageRoot.querySelectorAll('thead > tr > th')
    const headerTexts = headersHtmlEl.map(el => el.innerText.trim())
    const bodyRows = pageRoot.querySelectorAll('tbody > tr')
    const rowsContent = bodyRows.map(row => {
      const valuesEl = row.querySelectorAll('td')
      const values = valuesEl.map(el => el.innerText.trim())
      const obj = {}
      for (let i = 0; i < headerTexts.length; i++) {
        obj[headerTexts[i]] = values[i]
      }
      return obj
    })

    return rowsContent
  } catch (error) {
    console.log('Error getting data', error)
    return []
  }
}

exports.scanAllPages = async (page = 0, currentData = []) => {
  const pageData = await exports.getPageData(`${PAGE_URL}?page=${page}`)
  if (pageData.length === 0) {
    return currentData
  }
  return this.scanAllPages(page + 1, [...currentData, ...pageData])
}
