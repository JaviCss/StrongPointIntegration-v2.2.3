//IMPORTS
import { serviceNetsuite } from "./modules/serviceNetsuite.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES
var client = ZAFClient.init()
localStorage.setItem('filter1', '[]')

$('#mod-inner #loader').addClass('loader')
$('#mod-inner #loader-pane').addClass('loader-pane')
window.document.querySelector('#modal').addEventListener('submit', (e) => {
  document.querySelector('#modal').classList.add('colapse')
  document.querySelector('.header').classList.add('colapse')
  document.querySelector('.header2').classList.add('visible')
  document.querySelector('.header2').classList.remove('colapse')
  document.querySelector('.header').classList.add('pb-0')
  document.querySelector('.header').classList.remove('pb-4')
  document.querySelector('.look-list').classList.remove('colapse')
  event.preventDefault()
  getFilter()
})
getModify()

//SELECT MODIFY BY
async function getModify() {
  let accountId = await serviceZendesk.getNsClietId(client)
  //agrega el loader
  $('#mod-inner #loader').addClass('loader')
  $('#mod-inner #loader-pane').addClass('loader-pane')
  let getModifyByObj = await serviceNetsuite.getModifyBy(client, accountId)
  let objectResp = JSON.parse(getModifyByObj)
  const impmodif = document.querySelector('#inp-modif')
  impmodif.innerHTML = '<option value="" selected>-Select Modified By-</option>' + objectResp.results
  removeLoader()
}

//SUBMIT
window.onModalSubmit = function onModalSubmit() {
  document.querySelector('#modal').classList.add('colapse')
  document.querySelector('.header').classList.add('colapse')
  document.querySelector('.header2').classList.add('visible')
  document.querySelector('.header2').classList.remove('colapse')
  document.querySelector('.header').classList.add('pb-0')
  document.querySelector('.header').classList.remove('pb-4')
  document.querySelector('.look-list').classList.remove('colapse')
  event.preventDefault()
  getFilter()
}
async function getFilter() {
  //agrega el loader
  $('#mod-inner #loader').addClass('loader')
  $('#mod-inner #loader-pane').addClass('loader-pane')
  //obtiene los datos del formulario
  // const filter = obtData()
  //arama la llamada de modified by
  let accountId = await serviceZendesk.getNsClietId(client)
  let getFilterData = await serviceNetsuite.getFilterData(client, accountId)
  renderlook(getFilterData)

}
function renderlook(res) {
  let resultList = document.querySelector('.resultList')
  resultList.innerHTML = ''
  for (let i = 0; i < res.length; i++) {
    if (res[i] !== '') {
      const tr = document.createElement('tr')
      tr.className = 'look-tr'
      tr.innerHTML = `
                        <td headers="name" class="d-flex w-60">
                            <input type="checkbox" class="lookupSelectedCusts my-auto check" name="lookupSelectedCusts" value="${res[i].values.name}" data-id="${res[i].id}">
                            <span class="my-auto os-12">${res[i].values.name}</span>                            
                        </td>
                        <td class="look-th d-flex w-40">
                            <p class="os-12"><i>${res[i].values.custrecord_flo_cust_id}</i></p>
                        </td>`
      resultList.appendChild(tr)
    }
  }
  removeLoader()
}
window.addCustom = async function addCustom() {
  $('#mod-inner #loader').addClass('loader')
  $('#mod-inner #loader-pane').addClass('loader-pane')
  let existingId = ''
  let inputs = $('.check')
  $('.check').each(i => {
    if (inputs[i].checked) {
      existingId += `${existingId.length > 0 ? ',' : ''}${inputs[i].dataset.id}`
    }
  })
  let accountId = await serviceZendesk.getNsClietId(client)
  //addCostumization existing NS  
  let addCustomSelecte = await serviceNetsuite.addCustomSelecte(client, existingId, localStorage.getItem('zendesk-tiquet-id'), accountId)
  console.log(addCustomSelecte)
  
  let existingList = []
  if (addCustomSelecte.status === 'success') {
    addCustomSelecte.custIds.forEach((id, idx) => {
      existingList.push({ name: addCustomSelecte.custNames[idx], id: id })
    })
    localStorage.setItem('selectedCustomizationValues', JSON.stringify(existingList))    
  }
  client.invoke('destroy')
}
window.checkAll = function checkAll(source) {
  let checkboxes = document.querySelectorAll('input[type="checkbox"]')
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i] != source) checkboxes[i].checked = source.checked
  }
}

function removeLoader() {
  if ($(`#mod-inner #loader`)) {
    $('#mod-inner #loader').removeClass('loader').trigger('enable')
    $('#mod-inner #loader-pane').removeClass('loader-pane')
  }
}



// notificaciones
function notifications(type, message) {
  $.showNotification({
    body: message,
    duration: 3000,
    type: type,
    maxWidth: "300px",
    shadow: "0 2px 6px rgba(0,0,0,0.2)",
    zIndex: 100,
    margin: "1rem"
  })
}
