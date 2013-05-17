

    
    // The version of the REST API you wish to use in your app.
    var apiVersion = "v27.0";

	// If you want to prevent dragging, uncomment this section
	/*
	function preventBehavior(e) 
	{ 
      e.preventDefault(); 
    };
	document.addEventListener("touchmove", preventBehavior, false);
	*/
	
	/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
	see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
	for more details -jm */
	/*
	function handleOpenURL(url)
	{
		// do something with the url passed in.
	}
	*/
	
    var forcetkClient;
    var searchContext = "Chatter";
    var pageSize = 25;
    var dateRange = "LAST_90_DAYS";
    var lastSearchTerm;
    var lastRequest;
    var lastResponse;

    //var debugMode = true;

    jQuery(document).ready(function() {
        //Add event listeners and so forth here
		document.addEventListener("deviceready", onDeviceReady,false);
                          
    });

    // When this function is called, Cordova has been initialized and is ready to roll 
    function onDeviceReady() {
		//Call getAuthCredentials to get the initial session credentials
        cordova.require("salesforce/plugin/oauth").getAuthCredentials(salesforceSessionRefreshed, getAuthCredentialsError);

        //register to receive notifications when autoRefreshOnForeground refreshes the sfdc session
        document.addEventListener("salesforceSessionRefresh",salesforceSessionRefreshed,false);

        //enable buttons
        regLinkClickHandlers();
        
       
       
    }
        

    function salesforceSessionRefreshed(creds) {
        
        // Depending on how we come into this method, `creds` may be callback data from the auth
        // plugin, or an event fired from the plugin.  The data is different between the two.
        var credsData = creds;
        if (creds.data)  // Event sets the `data` object with the auth data.
            credsData = creds.data;

        forcetkClient = new forcetk.Client(credsData.clientId, credsData.loginUrl);
        forcetkClient.setSessionToken(credsData.accessToken, apiVersion, credsData.instanceUrl);
        forcetkClient.setRefreshToken(credsData.refreshToken);
        forcetkClient.setUserAgentString(credsData.userAgent);
        forcetkClient.setUserId(credsData.userId);

    }


    function getAuthCredentialsError(error) {
        alert("getAuthCredentialsError: " + error);
    }
        
