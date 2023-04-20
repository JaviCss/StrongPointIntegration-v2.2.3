//IMPORTS
import { serviceNetsuite } from "./modules/serviceNetsuite.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES
let accountId
let bundlesList = []
let existingCustom = {}
let existingProp = {}
let ticketNumber
let ticketSubject
let ticketDescription
let ticketStatus
let statusNS
let linkCR
let bundleID = 0
let crId
let userData = ''
let client = ZAFClient.init()


client.invoke('resize', { width: '100%', height: '900px' })
client.on('reload', function () {
  setTimeout(() => {
    start(client)
  }, 1300)
})
start(client)

async function setComent(state) {
  let ticketObj = await serviceZendesk.getTicketInfo(client)
  let msj = {
    "ticket": {
      "comment": {
        "html_body": `<div style="  padding: 10px;  background-color: #f2f2f2;  border: solid 2px #305c91;  border-radius: 10px;   margin: auto;  font-size: min(4vw, 16px) !important ; font-family: 'Open Sans', sans-serif;" dir="auto">The status of the change request has been changed to <span style="font-weight: 700; color= #000000 ;"> ${state}</span><br></div>`
      }
    }
  }
  client.request({
    url: `/api/v2/tickets/${ticketObj.ticketNumber}`,
    type: 'PUT',
    dataType: 'json',
    data: msj,
  }).then(function (response) { }, function (response) { console.error(response.responseText) })
}



;

async function getMetadata(client) {
  let result = await client.metadata().then(function (metadata) {
    return metadata.settings
  })
  return result
}






function loader() {
  $('#info #loader').addClass('loader')
  $('#info #loader-pane').addClass('loader-pane')
}
async function start(client) {
  loader()
  userData = await serviceZendesk.getCurrentUser(client)
  let ticketObj = await serviceZendesk.getTicketInfo(client)
  let manifestInfo = await serviceZendesk.getManifestInfo(client)
  accountId = await serviceZendesk.getNsClietId(client)
  let requestApproveGroups = manifestInfo.requestApproveGroups
  let approveGroups = manifestInfo.approveGroups
  let approvalProcess = manifestInfo.approvalProcess
  let isOperator, isAdministrator
  ticketNumber = ticketObj.ticketNumber
  ticketSubject = ticketObj.ticketSubject
  ticketDescription = ticketObj.ticketDescription
  ticketStatus = ticketObj.ticketStatus
  requestApproveGroups = requestApproveGroups.split(',')
  approveGroups = approveGroups.split(',')
  approvalProcess = approvalProcess.split(',')
  userData?.groups.forEach(e => {
    if (requestApproveGroups.includes(e.name)) {
      isOperator = requestApproveGroups.includes(e.name)
      return
    }
  })
  userData?.groups.forEach(e => {
    if (approveGroups.includes(e.name)) {
      isAdministrator = approveGroups.includes(e.name)
      return
    }
  })
  showHome()
  document.getElementById('btn-request').style.display = 'none'
  document.getElementById('btn-approved').style.display = 'none'
  document.getElementById('btn-reject').style.display = 'none'
  document.getElementById('btn-close-status').style.display = 'none'
  document.getElementById('btn-push').style.display = 'none'

  getCustomizations(isOperator, isAdministrator, approvalProcess)


}
async function getCustomizations(isOperator, isAdministrator, approvalProcess) {
  let getCustom = await serviceNetsuite.getCustomization(client, accountId)
  if (getCustom !== undefined) {
    let getName = await serviceNetsuite.getName(client, accountId)
    getName = JSON.parse(getName)
    $('#synchronized').text(getName.companyname)
    $('#policy').text(getCustom.policyApplied)
    $('#level').text(getCustom.clReq)
    crId = getCustom.crId
    localStorage.setItem('crId', crId)
    bundlesList = getCustom.affectedBundleID === '' ? [] : getCustom.affectedBundleID.split(',')
    linkCR = getCustom.link
    var element = document.getElementById('linkCR')
    element.href = linkCR

    statusNS = getCustom.statusBarState
    if (statusNS == '') {
      document.querySelector('#statusNS').textContent = 'N/S'
    } else {
      document.querySelector('#statusNS').textContent = statusNS
    }
    let existingList = []
    getCustom.custIds.forEach((id, idx) => {
      existingList.push({ name: getCustom.custNames[idx], id: id })
    })
    if (isOperator && ['', 'Not Started', 'In Progress'].includes(getCustom.statusBarState) &&
      ['SP Approval In Zendesk', 'SP Approval In NetSuite'].includes(approvalProcess[0]) && true) {
      document.getElementById('btn-request').style.display = 'flex'
      // document.getElementById('btn-reject').style.display = 'flex';
    }
    if (isAdministrator && getCustom.statusBarState === 'Pending Approval' &&
      ['SP Approval In Zendesk'].includes(approvalProcess[0]) && true) {
      document.getElementById('btn-approved').style.display = 'flex'
      document.getElementById('btn-reject').style.display = 'flex'
    }
    // close
    if (isAdministrator && getCustom.statusBarState === 'Approved' &&
      ['SP Approval In Zendesk', 'No Approval Needed'].includes(approvalProcess[0]) && true) {
      document.getElementById('btn-close-status').style.display = 'flex'
    }
    // push
    if (isAdministrator && !['Completed', 'Rejected', 'Cancelled', 'Approved'].includes(
      getCustom.statusBarState) && ['No Approval Needed'].includes(approvalProcess[0]) && true) {
      document.getElementById('btn-push').style.display = 'flex'
    }
    localStorage.setItem('selectedCustomizationValues', JSON.stringify(existingList))
    if (getCustom.proposedCusts != '') {
      localStorage.setItem('ProposedCustomization', JSON.stringify(getCustom.proposedCusts.split(',')))
    } else {
      localStorage.setItem('ProposedCustomization', JSON.stringify([]))
    }
    //## RENDERS
    renderlookup()
    renderProposed()
    renderBundle()
    removeLoader()
  }
}

/*SHOW HOME */
function showHome() {
  let requester_data = {}
  let source = $('#home-template').html()
  let template = Handlebars.compile(source)
  let html = template(requester_data)
  $('#home').html(html)
  let btn2 = document.getElementById('proposed')
  btn2.addEventListener('click', () => {
    popModal('assets/modal.html', '440')
  })
  let btn3 = document.getElementById('lookup')
  btn3.addEventListener('click', () => {
    popModal('assets/modalList.html', '240')
  })
  let btn4 = document.getElementById('btn-impact')
  btn4.addEventListener('click', () => {
    popModal('assets/modalImpact.html', '550')
  })
}
/*ERRORES */
function renderlookup() {
  let existingList = document.querySelector('.lookup-list')
  existingList.innerHTML = ''
  let selectedCustomizationValues = JSON.parse(localStorage.getItem('selectedCustomizationValues'))
  selectedCustomizationValues.forEach(item => {
    const url = `https://${accountId}.app.netsuite.com/c.${accountId}/suitebundle294336/FLODocs%20Enterprise/FLOEntryScreens.html?STAGE=custframe&customizationid=${item.id}`
    const li = document.createElement('li')
    li.className = 'bundle-li'
    li.innerHTML = `      
    <span class="w-75 ps-2">${item.name}</span>
      <div class="btn-group dropdown w-25">
        <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="clickDeleteLookup('${item.id}', '${item.name}')" id="bundle-delete">Remove</button></li>
          <li> 
          <a target="_blank" onclick="erd('${url}')">
          <button class="dropdown-item" id="ver-erd">ERD</button>
          </a>
          </li>
          </div>`
    existingList.appendChild(li)
  })
  localStorage.removeItem('selectedCustomizationValues')
  removeLoader()
}
window.erd = function erd(url) {
  window.open(url, '_blank')
}
window.clickDeleteLookup = async function clickDeleteLookup(existingId, existingName) {
  $('#existing-customizations.bundle-id-lista #loader').addClass('loader')
  $('#existing-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  let deleteExistingCustomization = await serviceNetsuite.deleteExistingCustomization(client, existingId, existingName, ticketNumber, accountId)
  let existingList = []
  let existingList1 = []
  if (deleteExistingCustomization.custIds) {
    deleteExistingCustomization.custIds.forEach((id, idx) => {
      existingList.push({ name: deleteExistingCustomization.custNames[idx], id: id })
    })
  }
  localStorage.setItem('selectedCustomizationValues', JSON.stringify(existingList1))
  renderlookup()
}
//Proposed Customization
function renderProposed() {
  let bundleLista = document.querySelector('.proposed-lista')
  bundleLista.innerHTML = ''
  let ProposedCustomization = JSON.parse(
    localStorage.getItem('ProposedCustomization')
  )
  let i = 0
  ProposedCustomization.forEach(item => {
    const li = document.createElement('li')
    li.className = 'bundle-li'
    li.innerHTML = `      
    <span class="w-75 ps-2">${item}</span>
    <div class="btn-group dropdown w-25">
    <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
    <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="clickDeleteProposed('${item}')" data-value="${i}" id="bundle-delete">Remove</button></li>
          </div>`
    bundleLista.appendChild(li)
    i++
  })
  localStorage.removeItem('ProposedCustomization')
}

window.clickDeleteProposed = async function clickDeleteProposed(name) {
  $('#proposed-customizations.bundle-id-lista #loader').addClass('loader')
  $('#proposed-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  let deletePorposedCustomization = await serviceNetsuite.deletePorposedCustomization(client, name, localStorage.getItem('zendesk-tiquet-id'), accountId)
  if (deletePorposedCustomization.proposedCusts != '') {
    localStorage.setItem('ProposedCustomization', JSON.stringify(deletePorposedCustomization.proposedCusts.split(',')))
  } else {
    localStorage.setItem('ProposedCustomization', JSON.stringify([]))
  }
  renderProposed()
  $(`#proposed-customizations #loader`).removeClass('loader').trigger('enable')
  $('#proposed-customizations #loader-pane').removeClass('loader-pane')
}
/*BUNDLE*/
function renderBundle() {
  const bundlesRender = document.querySelector('.bundle-list')
  bundlesRender.innerHTML = ''
  let i = 0
  bundlesList.forEach(bundle => {
    const li = document.createElement('li')
    li.className = 'bundle-li'
    li.innerHTML = `
      <span class="w-75 ps-2">${bundle}</span>
      <div class="btn-group dropdown w-25">
        <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="removeBundle('${bundle}')" data-value="${i}" id="bundle-delete">Remove</button></li>
      </div>`
    bundlesRender.appendChild(li)
    i++
  })
  $(`#bundle-id.bundle-id-lista #loader`)
    .removeClass('loader')
    .trigger('enable')
  $('#bundle-id.bundle-id-lista #loader-pane').removeClass('loader-pane')
}
window.addBundle = async function addBundle() {
  //valida los dats del input
  // loader()
  //compara si esta vacio
  if ($('#inp-bundle')[0].value !== '') {
    //compara si es un numero
    if (!isNaN($('#inp-bundle')[0].value)) {
      //compara si tiene mas de 6 digitos
      if ($('#inp-bundle')[0].value.length > 0) {
        //activa y desactiva el boton
        $('#bundle-id.bundle-id-lista #loader').addClass('loader')
        $('#bundle-id.bundle-id-lista #loader-pane').addClass('loader-pane')
        $('.btn-plus').prop('disabled', true)
        $('#bundle-id.bundle-id-lista #loader').on('enable', function () {
          $('.btn-plus').prop('disabled', false)
        })
        //obtiene el valor
        bundleID = document.getElementById('inp-bundle').value
        $('#inp-bundle')[0].value = ''
        //scryt de NS
        const setBundle = await serviceNetsuite.setBundle(client, bundleID, accountId)
        //renderBundle()
        start(client)


        $('#errorBundle')[0].innerHTML = ''
      } else {
        $('#errorBundle')[0].innerHTML = '<p>You must enter six numbers</p>'
      }
    } else {
      $('#errorBundle')[0].innerHTML = '<p>You must enter a number</p>'
    }
  } else {
    $('#errorBundle')[0].innerHTML = '<p>You must enter a bundle ID</p>'
  }
}
window.removeBundle = async function removeBundle(bundleID) {
  $('#bundle-id.bundle-id-lista #loader').addClass('loader')
  $('#bundle-id.bundle-id-lista #loader-pane').addClass('loader-pane')
  let deleteBundle = await serviceNetsuite.deleteBundle(client, bundleID, accountId)
  if (deleteBundle !== '') {
    bundlesList = deleteBundle === '' ? [] : deleteBundle.split(',')
    renderBundle()
  } else {
    bundlesList = deleteBundle === '' ? [] : deleteBundle.split(',')
    renderBundle()
  }
}
//MODAL CLIENTE
function popModal(url, h) {
  localStorage.removeItem('zendesk-tiquet-id')
  localStorage.setItem('zendesk-tiquet-id', ticketNumber)
  client
    .invoke('instances.create', {
      location: 'modal',
      url: url,
      size: { width: '750px', height: h },
    })
    .then(function (modalContext) {
      // The modal is on the screen now!
      var modalClient = client.instance(
        modalContext['instances.create'][0].instanceGuid
      )
      client.on('instance.registered', function () { })
      modalClient.on('modal.close', function () {
        if (localStorage.getItem('selectedCustomizationValues')) {
          renderlookup()
          start(client)
        }
        if (localStorage.getItem('ProposedCustomization')) {
          renderProposed()
          start(client)
        }
        // The modal has been closed.
      })
    })
}
//CHANGESTATUS
window.changeStatus = async function changeStatus(action) {
  switch (action) {
    case 'request':
      updateTicketStatus('PendingApproval')
      //setComent('PendingApproval')
      break
    case 'approved':
      updateTicketStatus('Approve')
      // setComent('Approve')
      break
    case 'reject':
      updateTicketStatus('Reject')
      // setComent('Reject')
      break
    case 'close':
      updateTicketStatus('Closed')
      //setComent('Closed')
      break
    default:
      break
  }
}
async function updateTicketStatus(newState) {
  $('#info #loader').addClass('loader')
  $('#info #loader-pane').addClass('loader-pane')
  let setUpdateTicketStatus = await serviceNetsuite.setUpdateTicketStatus(client, newState, accountId)
  statusNS = setUpdateTicketStatus.statusBarState
  start(client)
}

//UTYLITIES
function removeLoader() {
  if ($(`#loader`)) {
    $(`#info #loader`).removeClass('loader').trigger('enable')
    $('#info #loader-pane').removeClass('loader-pane')
  }


  $('#existing-customizations.bundle-id-lista #loader').removeClass('loader').trigger('enable')
  $('#existing-customizations.bundle-id-lista #loader-pane').removeClass('loader-pane')

  $(`#bundle-id.bundle-id-lista #loader`).removeClass('loader').trigger('enable')
  $('#bundle-id.bundle-id-lista #loader-pane').removeClass('loader-pane')

  $(`#proposed-customizations #loader`).removeClass('loader').trigger('enable')
  $('#proposed-customizations #loader-pane').removeClass('loader-pane')
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



