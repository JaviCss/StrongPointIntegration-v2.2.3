//IMPORTS
import { serviceNetsuite } from "./modules/serviceNetsuite.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES
var client = ZAFClient.init()
//SUBMIT
document.querySelector('#modal').addEventListener('submit', (e) => {
  event.preventDefault()
  submitData()
})


async function submitData() {
  $('#proposed-customizations #loader').addClass('loader')
  $('#proposed-customizations #loader-pane').addClass('loader-pane')
  // //addCostumization propose NS
  let accountId = await serviceZendesk.getNsClietId(client)
  let setCustomizations = await serviceNetsuite.setCustomizations(client, localStorage.getItem('zendesk-tiquet-id'),accountId)
  if (setCustomizations.proposedCusts != '') {
    localStorage.setItem('ProposedCustomization', JSON.stringify(setCustomizations.proposedCusts.split(',')))
  } else {
    localStorage.setItem('ProposedCustomization', JSON.stringify([]))
  }
  client.invoke('destroy')
}
$('#inp-type').change(function () {
  var prefix = $(this).val()
  if (prefix != '99999') {
    document.getElementById('inp-scriptid').value = $(this).val() + '_'
  } else {
    document.getElementById('inp-scriptid').value = ''
  }
})
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
function removeLoader() {
  if ($(`#loader`)) {
    $(`#loader`).removeClass('loader').trigger('enable')
    $('#loader-pane').removeClass('loader-pane')
  }
}