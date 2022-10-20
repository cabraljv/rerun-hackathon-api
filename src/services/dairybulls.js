const PAGE_BULL_SEARCH_URL = 'http://dairybulls.com/search/unitedstates2.asp'
const SINGLE_BULL_SEARCH_URL = 'http://dairybulls.com/search/sirepage/sireUS2.asp'
const axios = require('axios')
const { parse } = require('node-html-parser')
const { insertBulls } = require('./bull')

exports.getSingleBullData = async (bullId, bre) => {
  const queryUrl = `${SINGLE_BULL_SEARCH_URL}?InterbullID=${bullId}&Bre=${bre}&genbase=A`
  console.log('GETTING DATA FOR BULL', queryUrl)
  const { data } = await axios.get(queryUrl)

  const pageRoot = parse(data.replace(/<A/g, '<a'))
  const ptatDiv = pageRoot.querySelectorAll('td').find(el => el.innerText.trim() === 'PTAT')
  const parentPtatDiv = ptatDiv.parentNode
  const pti = parentPtatDiv.querySelector('td:nth-child(2)').innerText.trim()
  const ptat = parentPtatDiv.querySelector('td:nth-child(4)').innerText.trim()
  const genbase = pageRoot.querySelectorAll('td[nowrap]')[2].innerText.trim()
  const fatherParentDiv = pageRoot.querySelectorAll('a').filter(el => {
    return el.attributes.href && el.attributes.href.includes('sireUSFrame2.asp')
  }).map(el => el.attributes.href.replace('sireUSFrame2.asp?InterbullID=', '').split('&')[0])
  const sire = fatherParentDiv[0]
  const mgs = fatherParentDiv[1]
  return {
    pti,
    ptat,
    sire,
    mgs,
    genbase
  }
}

exports.getPageBullsData = async (libsMilk, bread) => {
  const { data } = await axios.post(PAGE_BULL_SEARCH_URL, `Breed=${bread}&genbase=A&Name%3A=&NAAB=&herdbook=&sire=&tpiptigt=%3E&TPI%3A=&FM%24gt=%3E&FM%24=&NMgt=%3E&NM=&CM%24gt=%3E&CM%24=&milkgt=%3C&milk=${libsMilk}&fatgt=%3E&fat=&progt=%3E&protein=&%25fatgt=%3E&%25fat=&%25progt=%3E&%25pro=&PTATypegt=%3E&PTAType=&uddergt=%3E&udder=&SCSgt=%3E&SCS=&F%26Lgt=%3E&F%26L=&PTAPLgt=%3E&PTAPL=&cegt=%3E&ce=&orderby=%60Milk%60+DESC&recordsperpage=1000`)

  const pageRoot = parse(data)

  const headersHtmlEl = pageRoot.querySelectorAll('.rptHead td')

  const headerTexts = headersHtmlEl.map(el => el.innerText.trim())
  const bodyRows = pageRoot.querySelectorAll('tr')
  const rowsContent = bodyRows.map(row => {
    const valuesEl = row.querySelectorAll('td:not(.rptHead)')
    const values = valuesEl.map(el => el.innerText.trim())
    const obj = {}
    for (let i = 0; i < headerTexts.length; i++) {
      obj[headerTexts[i]] = values[i]
    }
    return obj
  })
  return rowsContent.filter(row => row['Lbs. Milk'] && isNaN(Number(row['Lbs. Milk'])) === false)
}

exports.getAllBullsData = async (bread, filter = 5000) => {
  console.log('GETTING DATA FOR MILK <', filter)
  const pageData = await this.getPageBullsData(filter, bread)
  const filteredData = pageData.map(item => (item && item['Interbull ID']) ? { id: item['Interbull ID'], name: item.Name, bread } : 'NONE')
  await insertBulls(filteredData)
  if (pageData.length > 100) {
    const lastItem = pageData.pop()
    let lastItemValue = -10000
    if (lastItem && lastItem['Lbs. Milk']) { lastItemValue = Number(lastItem['Lbs. Milk']) }
    return this.getAllBullsData(bread, lastItemValue - 1)
  }
}
