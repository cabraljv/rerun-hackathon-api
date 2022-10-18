const PAGE_URL = 'https://semex.com.br/leite-importado/JE/TPI/GENOMAX?page=1'
const SINGLE_BULL_SEARCH_URL = 'http://dairybulls.com/search/unitedstates2.asp'
const axios = require('axios')
const {parse} = require('node-html-parser')
const FormData = require('form-data')

const getPageData = async (pageUrl) => {
  try {
    const {data} = await axios.get(pageUrl)
    const pageRoot = parse(data)
    const headersHtmlEl = pageRoot.querySelectorAll('thead > tr > th')
    const headerTexts = headersHtmlEl.map(el=>el.innerText.trim())
    const bodyRows = pageRoot.querySelectorAll('tbody > tr')
    const rowsContent = bodyRows.map(row=>{
      const valuesEl = row.querySelectorAll('td')
      const values = valuesEl.map(el=>el.innerText.trim())
      const obj = {}
      for(let i=0;i<headerTexts.length;i++){
        obj[headerTexts[i]] = values[i]
      }
      return obj
    })

    return rowsContent

  } catch (error) {
    console.log('Error getting data',error)
    return []
  }
}

const getSingleBullData = async (name)=>{
  const form = new FormData()

  form.append('Breed','JE')
  form.append('Name',name)
  form.append('genbase','a')
  form.append('recordsperpage', '')


  const {data} = await axios.post(SINGLE_BULL_SEARCH_URL, 

    `Breed=JE&genbase=A&Name%3A=${encodeURIComponent(name)}&NAAB=&herdbook=&sire=&tpiptigt=%3E&PTI%3A=&FM%24gt=%3E&FM%24=&NMgt=%3E&NM=&CM%24gt=%3E&CM%24=&milkgt=%3E&milk=&fatgt=%3E&fat=&progt=%3E&protein=&%25fatgt=%3E&%25fat=&%25progt=%3E&%25pro=&PTATypegt=%3E&PTAType=&uddergt=%3E&udder=&SCSgt=%3E&SCS=&F%26Lgt=%3E&F%26L=&PTAPLgt=%3E&PTAPL=&cegt=%3E&ce=&orderby=%60Name%60&recordsperpage=100`,
    {
     headers:{
      'content-type': 'application/x-www-form-urlencoded'
     }
    })

  const pageRoot = parse(data)

  const headersHtmlEl = pageRoot.querySelectorAll('.rptHead td')

  const headerTexts = headersHtmlEl.map(el=>el.innerText.trim())
  const bodyRows = pageRoot.querySelectorAll('tr')
  bodyRows.shift
  const rowsContent = bodyRows.map(row=>{
    const valuesEl = row.querySelectorAll('td:not(.rptHead)')
    const values = valuesEl.map(el=>el.innerText.trim())
    const obj = {}
    for(let i=0;i<headerTexts.length;i++){
      obj[headerTexts[i]] = values[i]
    }
    return obj
  }) 
  return rowsContent.pop()


}


const main = async()=>{
  // const data = await getPageData(PAGE_URL)
  // console.log(data)
  const data = await getSingleBullData('JX RIVER VALLEY CHECKMATE {5}')
  console.log(data)
}

main()

