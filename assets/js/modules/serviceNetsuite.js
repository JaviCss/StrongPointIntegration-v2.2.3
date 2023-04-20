//VARIABLES 

export const serviceNetsuite = {
    getCustomization,
    getName,
    getModifyBy,
    getFilterData,
    getImpactAnalisis,
    setUpdateTicketStatus,
    setBundle,
    setCustomizations,
    addCustomSelecte,
    deleteBundle,
    deleteExistingCustomization,
    deletePorposedCustomization,

}

//UTILIDADES
function setPathEncoded(baseObject) {
    var result = ''
    Object.entries(baseObject).forEach(([item, prop]) => {
        if (prop && prop.trim() !== '')
            result += `${result.length > 0 ? '&' : ''}${item}=${encodeURIComponent(prop.trim())}`
    })
    return result
}
function setPath(baseObject) {
    var result = ''
    Object.entries(baseObject).forEach(([item, prop]) => {
        if (prop && prop.trim() !== '')
            result += `${result.length > 0 ? '&' : ''}${item}=${prop.trim()}`
    })
    return result
}
function removeLoader() {
    if ($(`#loader`)) {
        $(`#loader`).removeClass('loader').trigger('enable')
        $('#loader-pane').removeClass('loader-pane')
    }
}
function getCurrentUser(client) {
    return client.get('currentUser').then(async function (data) {
        return data['currentUser']
    })
}
function getTicket(client) {
    return client.get('ticket').then(async function (data) {
        let userData = await getCurrentUser(client)
        let ticketNumber = data.ticket.id.toString()
        const obj = {
            userData: userData,
            userName: userData?.name,
            ticketNumber: ticketNumber,
            ticketSubject: data.ticket.subject,
            ticketDescription: data.ticket.description,
            ticketStatus: data.ticket.status,
            urlticket: `${data.ticket.brand.url}/agent/tickets/${ticketNumber}`,
        }
        return obj
    })
}
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
function obtData() {
    let value = document.getElementById('inp-name').value
    let modifiedby = document.getElementById('inp-modif').value
    let scriptid = document.getElementById('inp-scriptid').value
    let type = document.getElementById('inp-type').value
    let bundleid = document.getElementById('inp-bundleid').value
    let from = document.getElementById('inp-date-from').value
    let to = document.getElementById('inp-date-to').value
    from = formatDate(from)
    var r = {
        value: value,
        modifiedby: modifiedby,
        scriptId: scriptid,
        type: type,
        bundleId: bundleid,
        from: from,
        to: to,
    }
    return r
}
function formatDate(date1) {
    let fechaFrom = ''
    if (date1 === '') {
    } else {
        var cdate = new Date(date1)
        var options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }
        date = cdate.toLocaleDateString('es-ar', options)
        date1 = date.split('/')
        //estrae el año
        let month = date1[1]
        let day = date1[0] + 1
        let year = Array.from(date1[2])
        year.splice(0, 2)
        fechaFrom = `${month}/${day}/ ${year[0]}${year[1]}`
    }
    return fechaFrom
}
function getFormData() {
    let scriptid = document.getElementById('inp-scriptid').value
    return scriptid
}
//METODOS
//GET INFO
async function getCustomization(client, accountId) {
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const scriptDeploy = 'flo_cr_api'
    const action = 'getCRData'
    const formValues = { ticketID: ticketNumber }

    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(formValues)}`
    const head = await getSigned(client, accountId, scriptDeploy, action, formValues)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        contentType: 'application/json',
    }

    return client.request(options).then(results => { 
        const elementos = document.querySelectorAll('.statusbar')
        const elementos2 = document.querySelectorAll('#infoNs')
        if (results.status === "failed") {

            for (let i = 0; i < elementos2.length; i++) {
                elementos2[i].classList.add('hid')
                elementos2[i].classList.remove('vis')
            }
            //notifications('primary', "CR created")
        } else { 
            if (!results.inactive) { 
                for (let i = 0; i < elementos.length; i++) {
                    elementos[i].classList.remove('hid')
                    elementos[i].classList.add('vis')
                }

                for (let i = 0; i < elementos2.length; i++) {
                    elementos2[i].classList.remove('hid')
                    elementos2[i].classList.add('vis')
                }
            } else {

                for (let i = 0; i < elementos.length; i++) {
                    elementos[i].classList.add('hid')
                    elementos[i].classList.remove('vis')
                }
            }
        }

        if (results.status === 'success') {
            removeLoader()
            return results
        }

        removeLoader()
        $('#existing-customizations.bundle-id-lista #loader').removeClass('loader').trigger('enable')
        $('#existing-customizations.bundle-id-lista #loader-pane').removeClass('loader-pane')

        $(`#bundle-id.bundle-id-lista #loader`).removeClass('loader').trigger('enable')
        $('#bundle-id.bundle-id-lista #loader-pane').removeClass('loader-pane')

        $(`#proposed-customizations #loader`).removeClass('loader').trigger('enable')
        $('#proposed-customizations #loader-pane').removeClass('loader-pane')


    }).catch(e => {
        console.error(e)
        const elementos = document.querySelectorAll('#infoNs')

        for (let i = 0; i < elementos.length; i++) {
            elementos[i].classList.remove('vis')
            elementos[i].classList.add('hid')
        }
        if (e.statusText === 'error') {
            removeLoader()
        }
        removeLoader()
    })
}
function getName(client, accountId) {
    let accountId2 = accountId.toUpperCase().replace('-', '_')
    const scriptDeploy = 'flo_get_account_name_type'
    let oauth_nonce, oauth_signature, oauth_timestamp, realm;
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let path = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=1`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=1`
    accountId = accountId.toUpperCase()
    const p = {
        url: `https://strongpointsigned.herokuapp.com/sign.js`,
        headers: {
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "tokeni": "{{setting.tokeni}}",
            "tokens": "{{setting.tokens}}",
        },
        secure: true,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "domainBase": `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`,
            "account_id": `${accountId2}`,
            "path": path,
            "pathEncoded": pathEncoded
        }),
    }
    return client.request(p).then(results => {
        let authHeader = results.headers.Authorization.split(',')
        authHeader.forEach((item, i) => {
            if (i == 1) {
                let prop = item.split('=')
                oauth_nonce = prop[1]
            }
            if (i == 2) {
                let prop = item.split('=')
                oauth_signature = prop[1]
            }

            if (i == 4) {
                let prop = item.split('=')
                oauth_timestamp = prop[1]
            }

            if (i == 7) {
                let prop = item.split('=')
                realm = prop[1]
            }
        })

        let head = { Authorization: `OAuth oauth_consumer_key="{{setting.consumeri}}", oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method="HMAC-SHA256", oauth_timestamp=${oauth_timestamp}, oauth_token="{{setting.tokeni}}", oauth_version="1.0",realm=${realm}` }

        let urln = domainBase + pathEncoded
        let options = {
            url: urln,
            type: 'GET',
            headers: head,
            secure: true,
            cors: false,
            contentType: 'application/json',
        }

        return client.request(options).then(results => { return results })
    })


}
async function getModifyBy(client, accountId) {
    const scriptDeploy = 'flo_customization_api'
    const action = 'allEmployees'
    const selectOptions = { value: 'customer' }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(selectOptions)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, selectOptions)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }

    return client.request(options).then(results => {
        return results
    })

}
async function getFilterData(client, accountId) {
    const scriptDeploy = 'flo_customization_api'
    const action = 'search'
    const filter = obtData()
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(filter)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, filter)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }

    return client.request(options).then(results => {
        let objectResp = JSON.parse(results)
        objectResp = objectResp.results
        return objectResp
    })
}
//TICKET STATUS
async function setUpdateTicketStatus(client, newState, accountId) {
    const ticketInfo = await getTicket(client)
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const scriptDeploy = 'flo_cr_api'
    const action = 'createCR'
    const formValues = {
        action: 'createCR',
        integrationCreatedBy: 'Set by Zendesk',
        externalLink: ticketInfo.urlticket,
        ticketID: ticketInfo.ticketNumber,
        changeNum: ticketInfo.ticketNumber,
        changeName: ticketInfo.ticketSubject,
        description: ticketInfo.ticketDescription,
        state: newState,
    }
    

    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}`
    const head = await getSignedForPost(client, accountId, scriptDeploy)   
    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'POST',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
        data:  JSON.stringify(formValues) 
    }
    return client.request(options).then( 
        function (response) {
            return response
         },
        function (response) { console.error(response);}  
        )
}
//BUNDLE
async function setBundle(client, bundleID, accountId) {
    let bundlesList = []
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    const scriptDeploy = 'flo_cr_api'
    const action = 'addBundleId'
    const values = {
        bundleId: bundleID,
        ticketID: ticketNumber,
    }


    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(values)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, values)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    $('#errorBundle')[0].innerHTML = ''
    return client.request(options).then(results => {
        if (results.status === 'failed') {
            notifications('primary', results.message)
        }
        if (results.status === 'success') {
            removeLoader()
            return bundlesList = results.affectedBundleID === '' ? [] : results.affectedBundleID.split(',')
        }
    })
}
async function deleteBundle(client, bundleID, accountId) {
    let bundlesList = []
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    const scriptDeploy = 'flo_cr_api'
    const action = 'removeBundleId'
    const values = {
        ticketID: ticketNumber,
        bundleId: bundleID,
    }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(values)}`
    const head = await getSigned(client, accountId, scriptDeploy, action, values)

    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    $('#errorBundle')[0].innerHTML = ''
    return client.request(options).then(results => {
        if (results.status === 'failed') {
            notifications('primary', results.message)
        }
        if (results.status === 'success') {
            return bundlesList = results.affectedBundleID
        }
    })
}
//EXISTING CUSTOMIZATION
async function addCustomSelecte(client, existingId, ticketID, accountId) {
    const scriptDeploy = 'flo_cr_api'
    const action = 'addCustomizations'
    const selectedCustom = {
        existing: existingId,
        ticketID: ticketID,
    }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(selectedCustom)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, selectedCustom)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    return client.request(options).then(results => {
        if (results.status === 'failed') {
            notifications('primary', results.message)
        }
        if (results.status === 'success') {
            return results
        }
    })
}
async function deleteExistingCustomization(client, existingId, existingName, ticketNumber, accountId) {
    const scriptDeploy = 'flo_cr_api'
    const action = 'removeCustomization'
    const params = {
        ticketID: ticketNumber,
        isExisting: 'true',
        existing: existingName,
        custoInternalId: existingId,
    }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(params)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, params)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    return client.request(options).then(results => {
        return results
    })
}
//PROPOSED
async function setCustomizations(client, ticketID, accountId) {
    const res = getFormData()
    const createdProposed = {
        proposed: res,
        ticketID: ticketID,
    }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const scriptDeploy = 'flo_cr_api'
    const action = 'addCustomizations'



    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(createdProposed)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, createdProposed)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    return client.request(options).then(results => { return results })
}
async function deletePorposedCustomization(client, proposedName, ticketNumber, accountId) {

    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const scriptDeploy = 'flo_cr_api'
    const action = 'removeCustomization'
    const params = {
        ticketID: ticketNumber,
        isExisting: '',
        existing: proposedName,
    }



    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(params)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, params)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }



    return client.request(options).then(results => {
        return results
    })
}
//IM´PACT ANALISIS
async function getImpactAnalisis(client, ticketId, accountId) {
    let accountId2 = accountId.toUpperCase().replace('-', '_')
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const scriptDeploy = 'flo_impact_analysis_restlet'
    let oauth_nonce, oauth_signature, oauth_timestamp, realm;
    let path = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&crId=${ticketId}`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&crId=${ticketId}`
    accountId = accountId.toUpperCase()
    const p = {
        url: `https://strongpointsigned.herokuapp.com/sign.js`,
        headers: {
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "tokeni": "{{setting.tokeni}}",
            "tokens": "{{setting.tokens}}",
        },
        secure: true,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "domainBase": `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`,
            "account_id": `${accountId2}`,
            "path": path,
            "pathEncoded": pathEncoded
        }),
    }
    return client.request(p).then(results => {
        let authHeader = results.headers.Authorization.split(',')
        authHeader.forEach((item, i) => {
            if (i == 1) {
                let prop = item.split('=')
                oauth_nonce = prop[1]
            }
            if (i == 2) {
                let prop = item.split('=')
                oauth_signature = prop[1]
            }

            if (i == 4) {
                let prop = item.split('=')
                oauth_timestamp = prop[1]
            }

            if (i == 7) {
                let prop = item.split('=')
                realm = prop[1]
            }
        })

        let head = { Authorization: `OAuth oauth_consumer_key="{{setting.consumeri}}", oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method="HMAC-SHA256", oauth_timestamp=${oauth_timestamp}, oauth_token="{{setting.tokeni}}", oauth_version="1.0",realm=${realm}` }

        let urln = domainBase + pathEncoded
        let options = {
            url: urln,
            type: 'GET',
            headers: head,
            secure: true,
            cors: false,
            contentType: 'application/json',
        }

        return client.request(options).then(results => {
            let result = JSON.parse(results)
            return result
        }).catch(e => { return e })
    })
}
function getSigned(client, accountId, scriptDeploy, action, formValues) {
    let accountId2 = accountId.toUpperCase().replace('-', '_')
    //VARIABLES
    let oauth_nonce, oauth_signature, oauth_timestamp, realm;
    let path = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(formValues)}`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPathEncoded(formValues)}`

    const p = {
        url: `https://strongpointsigned.herokuapp.com/sign.js`,
        headers: {
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "tokeni": "{{setting.tokeni}}",
            "tokens": "{{setting.tokens}}",
        },
        secure: true,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "domainBase": `https://${accountId}.restlets.api.netsuite.com`,
            "account_id": `${accountId2}`,
            "path": path,
            "pathEncoded": pathEncoded,
            "method": 'GET'
        }),
    }
    return client.request(p).then(results => {
        let authHeader = results.headers.Authorization.split(',')
        authHeader.forEach((item, i) => {
            if (i == 1) {
                let prop = item.split('=')
                oauth_nonce = prop[1]
            }
            if (i == 2) {
                let prop = item.split('=')
                oauth_signature = prop[1]
            }

            if (i == 4) {
                let prop = item.split('=')
                oauth_timestamp = prop[1]
            }

            if (i == 7) {
                let prop = item.split('=')
                realm = prop[1]
            }
        })

        let head = { Authorization: `OAuth oauth_consumer_key="{{setting.consumeri}}", oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method="HMAC-SHA256", oauth_timestamp=${oauth_timestamp}, oauth_token="{{setting.tokeni}}", oauth_version="1.0",realm=${realm}` }
        return head
    })

}
function getSignedForPost(client, accountId, scriptDeploy) {


    let accountId2 = accountId.toUpperCase().replace('-', '_')
    //VARIABLES
    let oauth_nonce, oauth_signature, oauth_timestamp, realm;
    let path = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}`

    const p = {
        url: `https://strongpointsigned.herokuapp.com/sign.js`,
        headers: {
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "tokeni": "{{setting.tokeni}}",
            "tokens": "{{setting.tokens}}",
        },
        secure: true,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "domainBase": `https://${accountId}.restlets.api.netsuite.com`,
            "account_id": `${accountId2}`,
            "path": path,
            "pathEncoded": pathEncoded,
            "method": 'POST'
        }),
    }
    return client.request(p).then(results => {
        let authHeader = results.headers.Authorization.split(',')
        authHeader.forEach((item, i) => {
            if (i == 1) {
                let prop = item.split('=')
                oauth_nonce = prop[1]
            }
            if (i == 2) {
                let prop = item.split('=')
                oauth_signature = prop[1]
            }

            if (i == 4) {
                let prop = item.split('=')
                oauth_timestamp = prop[1]
            }

            if (i == 7) {
                let prop = item.split('=')
                realm = prop[1]
            }
        })

        let head = { Authorization: `OAuth oauth_consumer_key="{{setting.consumeri}}", oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method="HMAC-SHA256", oauth_timestamp=${oauth_timestamp}, oauth_token="{{setting.tokeni}}", oauth_version="1.0",realm=${realm}` }

        return head
    })

}