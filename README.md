
## instalar zat
# INSTALACION
https://developer.zendesk.com/documentation/apps/zendesk-app-tools-zat/installing-and-using-zat/

# API
https://developer.zendesk.com/apps/docs/core-api/client_api#client.requestoptions

Luego isntalar 

ruby-dev
gcc
make
g++
zlibc
zlib1g
zlib1g-dev

# App name

[brief description of the app]

### The following information is displayed:

* info1
* info2
* info3

Please submit bug reports to [Insert Link](). Pull requests are welcome.

### Screenshot(s):
[put your screenshots down here.]

## Para mas informacion sobre el manifest visite:
https://developer.zendesk.com/apps/docs/developer-guide/manifest

## Para leer sobre los setins para usuarios cuando esta intalada la app:
https://developer.zendesk.com/apps/docs/developer-guide/setup#creating-a-settings-page-for-users


## para editar el servidor de sinatra en ruby:
C:\Users\javie\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu20.04onWindows_79rhkp1fndgsc\LocalState\rootfs\var\lib\gems\2.7.0\gems\zendesk_apps_tools-3.8.1\lib\zendesk_apps_tools

## OAuth
https://support.zendesk.com/hc/en-us/articles/203663836-Using-OAuth-authentication-with-your-application


## app submition
https://developer.zendesk.com/account/app_submissions


## Realización de solicitudes a la API de Zendesk
https://develop.zendesk.com/hc/en-us/articles/360001074168




## manejo de errores
https://developer.zendesk.com/documentation/apps/app-developer-guide/using-the-apps-framework



## Enable the OAuth 2.0 Feature NS
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771482304.html

## To enable OAuth 2.0 feature:
1- Go to Setup > Company > Enable Features.

2- Click the SuiteCloud subtab.

3- In the SuiteScript section, check the following boxes:

  -Client SuiteScript. Click I Agree on the SuiteCloud Terms of Service page.

  -Server SuiteScript. Click I Agree on the SuiteCloud Terms of Service page.

        Note: You must enable both the Client SuiteScript and Server SuiteScript features to use OAuth 2.0 feature for RESTlets.
4- In the Manage Authentication section, check the OAuth 2.0 box. Click I Agree on the SuiteCloud Terms of Service page.

5- Click Save.

 °° You must set up OAuth 2.0 roles. See Set Up OAuth 2.0 Roles. See also OAuth 2.0 Permissions.




## Create Integration Records for Applications to Use OAuth 2.0
 https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771733782.html


 Before users can authorize an OAuth 2.0 application for NetSuite access through REST web services or RESTlets, an integration record must be created for the application. It is also possible to edit an existing integration record. Administrators or users with the Integration Application permission can create integration records. For more information about integration records, see Integration Management.

The following procedure describes how to create an integration record.

To create an integration record for an application:
1- Go to Setup > Integration > New.

2- Enter a name for your application in the Name field.

3- Enter a description in the Description field, if desired.

4- Select Enabled in the State field.

5- Enter a note in the Note field, if desired.

        Note: Values of the State and Note fields are specific to one NetSuite account. If you install a record in a different account, the values can change. Values of the Name and Description fields are read-only if the record is installed in a different account. For more information, see Auto-Installation of Integration Records.
        On the Authentication tab, check or clear the appropriate boxes for your application:

## OAuth 2.0 Authorization Code Grant Flow
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158074210415.html

Application developers and integrators can use a redirection-based authorization code grant flow with OAuth 2.0. If there is no active session, users enter user credentials into one of the following login forms as a part of the flow.

## Step One GET Request to the Authorization Endpoint
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158081944642.html

In the first step of the OAuth 2.0 authorization code grant flow, the application sends a GET request to the authorization endpoint. This request must include the required parameters in the request header.

The format of the URL is:

*https://<accountID>.app.netsuite.com/app/login/oauth2/authorize.nl*

where <accountID> represents your NetSuite account ID. If you do not know the specific account ID, requests can be sent to:

*https://system.netsuite.com/app/login/oauth2/authorize.nl*



The following URL provides a sample GET request.

            https://<accountID>.app.netsuite.com/app/login/oauth2/authorize.nl?scope=restlets+rest_webservices&redirect_uri=https%3A%2F%2Fmyapplication.com%2Fnetsuite%2Foauth2callback&response_type=code&client_id=6794a3086e4f61a120350d01b8527aed3631472ef33412212495be65a8fc8d4c&state=ykv2XLx1BpT5Q0F3MRPHb94j&code_challenge=Who5QBshz2Mu1Mq6GuAknYA5TnjA-0z7VhAgLloec1s&code_challenge_method=S256 


## Step Two POST Request to the Token Endpoint
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158081952044.html

The application sends a POST request to the token endpoint. The request must include client credentials in the HTTP authorization request header and the required parameters in the request body. At the end of this step, the access token and refresh token are granted.
The format of the URL is:

*https://<accountID>.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token*
where <accountID> is your NetSuite account ID.



## Refresh Token POST Request to the Token Endpoint
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158082518856.html

When the access token expires, the application can send the refresh token POST request to the token endpoint to get a new access token.

The format of the URL is:

*https://<accountID>.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token*

where <accountID> represents your NetSuite account ID.



Please note when the refresh token expires(in 7 days), the token endpoint returns an invalid_grant error. The application must go through the aforementioned OAuth 2.0 authorization code grant flow to obtain tokens again.

