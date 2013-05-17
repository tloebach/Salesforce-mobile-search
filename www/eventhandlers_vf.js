function regLinkClickHandlers() {
    var $j = jQuery.noConflict();
    
    var last;
    
    $j('#searchbar').live( "change", function(e) {
                          //hide the keyboard
                         // alert (e.timeStamp);
                          var int = 1;
                          if (this.value == "") {
                            $j('#searchbar').focus();
                          } else {
                             $j('#searchbar').blur();
                          }
                          //if (last) {
                         //    int = e.timeStamp - last;
                         //   // alert( "time since last event" + int );
                         // }
                         // last = e.timeStamp;
                          
                          // this handler fires twice in rapid succession. It is getting two change events quickly. One from the input submit and the other from the blur event. We only want to do the search once. We look at the timestamps to determine when to fire the search. We get a negative number on one event. Ignore the positve timestamp and only fire on the negative.
                          
                          var searchTerm = this.value;
                          if (this.value != "") {
                            performSearch(this.value);
                          }
                          });

    $j('#navbar').click(function(e) {
                        searchContext = e.target.innerText;
                        if (searchContext == "History") {
                           showSearchHistory();
                        }
                        else {
                          performSearch(getLastSearchTerm());
                        }
                        });
    
    $j('#det-navbar').click(function(e, ui) {
                            var detContext = e.target.innerText;
                            if (detContext == "Map") {
                              var mapStr = "http://maps.apple.com/maps?q=" + escape(lastResponse.MailingStreet) +
                                escape(" " + lastResponse.MailingCity) + escape(" " + lastResponse.MailingState);
                               window.plugins.childBrowser.showWebPage(mapStr);
                            } else if (detContext == "Mobile") {
                    
    }
                            $j('#next_page').hide();

                            });
    
    
    $j('#hashsearch').click(function() {
                            alert("hasssearch");
                            $j('#searchbar').blur();
                            performSearch(this.value);
                            });
    
    $j('#link_logout').click(function() {
                             });
    
   
    $j('#link_clearhistory').click(function(e) {
                                   clearAllSearchTermHistory();
                             });
       
    $j('#next_page').click(function() {
                           $j('#next_page').hide();
                           getNextPage($j('#next_page').attr("url"));
                           });
    
    $j('#limit').live("change", function() {
                      pageSize = this.value;
                      });
    
    $j('#date-range').live("change", function() {
                           dateRange = this.value;
                           });
    
    $j('#daterange2').live("change", function(e) {
                           e.preventDefault();
                           $j('.ui-dialog').dialog('close');
                           dateRange = this.value;
                           performSearch(lastSearchTerm);
                           });
    
  
    
    $j('.details').live("tap",function() {
                        onListRecordDetailTap();
                        });
    
    $j(document).on("tap",'.chatter',function(e) {
                    // dont let the click propagate
                    e.preventDefault();
                    onListItemTap();
                    });
    
    $j(document).on("tap",'.chatter-det-comment',function(e) {
                    // dont let the click propagate
                    //e.preventDefault();
                   // onListItemTap();
                    });
    
    $j(document).on("tap",'.chatter-li-comment',function(e) {
                    // dont let the click propagate
                    e.preventDefault();
                    onListItemTap();
                    });
    
    $j(document).on("tap",'.history-li',function(e) {
                    e.preventDefault();
                    onListItemTap();
                    });
    
    $j(document).on("tap",'.topics-li',function(e) {
                    e.preventDefault();
                    onListItemTap();
                    });
    
    $j(document).on("click",'#saveContact',function(e) {
                    var contact = navigator.contacts.create();
                    contact.displayName = lastResponse.Name;
                    contact.nickname = lastResponse.Name;       //specify both to support all devices
                    
                    // populate some fields
                    var name = new ContactName();
                    name.givenName = lastResponse.FirstName;
                    name.familyName = lastResponse.LastName;
                    contact.name = name;
                    
                    var phoneNumbers = [];
                    phoneNumbers[0] = new ContactField('work', lastResponse.Phone, false);
                    phoneNumbers[1] = new ContactField('mobile', lastResponse.MobilePhone, true); // preferred number
                    contact.phoneNumbers = phoneNumbers;
                    
                    var emails = [];
                    emails[0] = new ContactField('work', lastResponse.Email, false);
                    contact.emails = emails;
                    
                    var addresses=[];
                    addresses[0] = new ContactAddress();
                    addresses[0].type = 'work';
                    addresses[0].streetAddress = lastResponse.MailingStreet;
                    addresses[0].locality = lastResponse.MailingCity;
                    addresses[0].region = lastResponse.MailingState;
                    addresses[0].postalCode = lastResponse.MailingPostalCode;
                    addresses[0].country = lastResponse.MailingCountry;
                    contact.addresses = addresses;

                    // save to device
                    contact.save(function onSaveSuccess(contact) {
                                 alert("Contact Saved");
                                 }, function onSaveError(contactError) {
                                 alert("Error = " + contactError.code);
                                 });
                    lastResponse = null;
                    });

    $j(document).on("click",'#saveLead',function(e) {
                    var contact = navigator.contacts.create();
                    contact.displayName = lastResponse.Name;
                    contact.nickname = lastResponse.Name;       //specify both to support all devices
                    
                    // populate some fields
                    var name = new ContactName();
                    name.givenName = lastResponse.FirstName;
                    name.familyName = lastResponse.LastName;
                    contact.name = name;
                    
                    var phoneNumbers = [];
                    phoneNumbers[0] = new ContactField('work', lastResponse.Phone, false);
                    phoneNumbers[1] = new ContactField('mobile', lastResponse.MobilePhone, true); // preferred number
                    contact.phoneNumbers = phoneNumbers;
                    
                    var emails = [];
                    emails[0] = new ContactField('work', lastResponse.Email, false);
                    contact.emails = emails;
                    
                    var addresses=[];
                    addresses[0] = new ContactAddress();
                    addresses[0].type = 'work';
                    addresses[0].streetAddress = lastResponse.Street;
                    addresses[0].locality = lastResponse.City;
                    addresses[0].region = lastResponse.State;
                    addresses[0].postalCode = lastResponse.PostalCode;
                    addresses[0].country = lastResponse.Country;
                    contact.addresses = addresses;
                    
                    // save to device
                    contact.save(function onSaveSuccess(contact) {
                                 alert("Contact Saved");
                                 }, function onSaveError(contactError) {
                                 alert("Error = " + contactError.code);
                                 });
                    lastResponse = null;
                    });

    $j('.records').live("tap",function(e) {
                       // alert("record tap");
                        e.preventDefault();
                        onListRecordTap();
                        });
    
   }
