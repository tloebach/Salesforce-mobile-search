//Sample code for Hybrid REST Explorer
var lastTarget;

function performSearch(searchString) {
    if (searchString == null) return false;
    var $j = jQuery.noConflict();
    addToHistory(searchString);
    
    // if there is an existing request abort it
    if (lastRequest != null) {
        lastRequest.abort();
    }
    
    var dateRangeStr = "";
    if (dateRange != "ANYTIME") {
        dateRangeStr = "WHERE createddate=" + dateRange;
    }
    
    if (searchString.length > 1) {
        $j.mobile.showPageLoadingMsg();
        if (searchContext == "Chatter" || searchContext == "History"){
            var request = forcetkClient.chattersearch(searchString, pageSize, onSuccessSfdcSearchChatter2, onErrorSfdc);
            searchContext = "Chatter";
            $j('#chatter-nav').addClass("ui-btn-active");
            $j('#history-nav').removeClass("ui-btn-active");


        } else if (searchContext == "Content") {
            var request = forcetkClient.search("FIND {" + searchString + "} RETURNING " + "ContentVersion (CreatedById, FileType, Title, CreatedDate, Id, Description, ContentSize " + dateRangeStr + " Order by CreatedDate DESC), " + "Document (CreatedById, Type, Name, CreatedDate, Id, BodyLength, Description " + dateRangeStr + " Order by CreatedDate) " + "LIMIT " + pageSize, onSuccessSfdcSearchContent, onErrorSfdc);
    
           // var request = forcetkClient.search("FIND {" + searchString + "} RETURNING " + "ContentVersion (CreatedById, FileType, Title, CreatedDate, Id, Description, ContentSize " + dateRangeStr + " Order by CreatedDate DESC) " + "LIMIT " + pageSize, onSuccessSfdcSearchContent, onErrorSfdc);
            
        } else if (searchContext == "Records") {
            //var request = forcetkClient.search("FIND {" + searchString + "} IN ALL FIELDS LIMIT " + pageSize, onSuccessSfdcSearchRecords, onErrorSfdc);
            var request = forcetkClient.search("FIND {" + searchString + "} IN ALL FIELDS Returning Account, Campaign, Report, Contact, Lead, Case, Opportunity  LIMIT " + pageSize, onSuccessSfdcSearchRecords, onErrorSfdc);

        }
        lastRequest = request;
        //udpate text in searchbox
        $j('#searchbar').val(searchString);

    }
    
}

function addToHistory (searchTerm) {
    
    if (searchTerm != null) {
        var localStore = window.localStorage;

        if (localStore.getItem("searchHistory") == null) {
            localStore.setItem("searchHistory","");
        }
        localStore.setItem("lastTerm", searchTerm);
        var searchTerms = localStore.getItem("searchHistory").split("||");
        if (searchTerm != searchTerms[0]) {
           localStore.setItem("searchHistory", searchTerm + "||" + localStore.getItem("searchHistory"));
        }
    }
}

function clearAllSearchTermHistory () {
    
        window.localStorage.removeItem("searchHistory");

        alert("Search History Cleared");
    
}


function getLastSearchTerm () {
    
    return window.localStorage.getItem("lastTerm");
    
}

function getNextPage(url) {
    var request = forcetkClient.getNextPage(url, onSuccessSfdcSearchChatter2, onErrorSfdc);
}
function onSuccessSfdcSearchRecords(response) {
    var $j = jQuery.noConflict();
    $j("#search_results").html("")
    
    var ul = $j('<ul id=recordlistview1 data-role="listview" data-inset="true" data-theme="d" data-dividertheme="a"></ul>');
    
    $j("#search_results").append(ul);
    
    
    if (response.length == 0) {
        ul.append($j('<li data-role="list-divider">No Results Found</li>'));
    } else {
        ul.append($j('<li data-role="list-divider">Salesforce Record Hits: ' + response.length + '</li>'));
    }
    var lasttype;
    var j = 0;
    lastSearchResult = null;
    $j.each(response, function(i, SearchResult) {
            if (lastSearchResult != null && lastSearchResult.attributes.type != SearchResult.attributes.type && j > 0 ) {
            var newLi = $j("<li class=records searchtype=records objtype=" + lastSearchResult.attributes.type + " id=" +lastSearchResult.Id + ">" + lastSearchResult.attributes.type + "<span class=ui-li-count>" + j + "</span></li>");
            ul.append(newLi);
            j = 0;
            }
            j++;
            lasttype = SearchResult.attributes.type;
            lastSearchResult = SearchResult;
            });
    
    //Pick up the last record
    if (response.length > 0) {
      var newLi = $j("<li class=records searchtype=records objtype=" + lastSearchResult.attributes.type + " id=" +lastSearchResult.Id + ">" + lastSearchResult.attributes.type + "<span class=ui-li-count>" + j + "</span></li>");
      ul.append(newLi);
    }
    
  // $j("#search_results").find("li").tap( onListRecordTap );

    $j("#search_results").trigger( "create" )
    $j.mobile.hidePageLoadingMsg();
    
    
}
function onSuccessSfdcSearchRecordList(response) {
    var $j = jQuery.noConflict();
    $j("#search_results").html("")
    
    var ul = $j('<ul id=recordlistview1 data-role="listview" data-inset="true" data-theme="d" data-dividertheme="a"></ul>');
    
    $j("#search_results").append(ul);
    
    
    if (response.length == 0) {
        ul.append($j('<li data-role="list-divider">No Results Found</li>'));
    } else {
        ul.append($j('<li data-role="list-divider">Salesforce Hits: ' + response.length + '</li>'));
    }
    var lasttype; 
    $j.each(response, function(i, SearchResult) {
            if (SearchResult.attributes.type == "Case") {
            var newLi = $j("<li class=details objtype=" + SearchResult.attributes.type + " id=" + SearchResult.Id + ">" + SearchResult.CaseNumber + "</li>");
            ul.append(newLi);
            } else {
            var newLi = $j("<li class=details objtype=" + SearchResult.attributes.type + " id=" + SearchResult.Id + ">" + SearchResult.Name + "</li>");
            ul.append(newLi);
            }
            });
    
  
   // $j("#record_results").find("li").tap( onListRecordDetailTap );
    $j.mobile.hidePageLoadingMsg();

    $j("#search_results").trigger( "create" );
    lastTarget.removeClass("ui-btn-active");

    
}
function onSuccessSfdcSearchRecordListDetail(response) {
    var $j = jQuery.noConflict();
    
    
    $j("#record_details").html("");
    
    var htmlStr = "";
    var phone = "";
    var mphone = "";
    if (response.Phone)
       phone = response.Phone.replace(/\D+/g,"");
    if (response.MobilePhone)
        mphone = response.MobilePhone.replace(/\D+/g,"");

    if (response.attributes.type == "Contact") {
        htmlStr = "<div class=contact-div>" + "<div class=contact-title>Name</div>" + "<div class=contact-value>" + response.Name + "</div></div>" +
        "<div class=contact-div><div class=contact-title>Phone <a href=tel:" + phone + "></div><div class=contact-value>" + nullCheck(response.Phone) + "</a></div></div>" +
        "<div class=contact-div><div class=contact-title>Mobile Phone <a href=tel:" + mphone + "></div><div class=contact-value>" + nullCheck(response.MobilePhone) + "</a></div></div>" +
        "<div class=contact-div>" + "<div class=contact-title>Title</div>" + "<div class=contact-value>" + nullCheck(response.Title) + "</div>" + "</div>" +
        "<div class=contact-div><div class=contact-title>Email <a href=mailto:" + nullCheck(response.Email) + "></div>" + "<div class=contact-value>" + response.Email	+ "</a></div></div>" +
        
        "<div class=contact-div><div class=contact-title>Address</div>" + "<div class=contact-value>" + nullCheck(response.MailingStreet)	+ "</div>" +
        "<div class=contact-value>" + nullCheck(response.MailingCity)	+ ", " + nullCheck(response.MailingState) + "</div>" +
        "<div class=contact-value>" + nullCheck(response.MailingCountry)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Map</div><a href=# onclick=window.plugins.childBrowser.showWebPage('http://maps.apple.com/maps?q=" + escape(response.MailingStreet) + escape(" " + response.MailingCity) + escape(" " + response.MailingState) + "')>Map</a></div>" +
        "<div class=contact-div><div class=contact-title>Link to Salesforce></div><div><a href= # onclick=window.plugins.childBrowser.showWebPage('https://na1.salesforce.com/" + response.Id + "')>Link</div></div></a>";
        
    } else if (response.attributes.type == "Lead") {
        htmlStr = "<div class=contact-div>" + "<div class=contact-title>Name</div>" + "<div class=contact-value>" + response.Name + "</div></div>" +
        "<div class=contact-div><div class=contact-title>Phone <a href=tel:" + phone + "></div><div class=contact-value>" + nullCheck(response.Phone) + "</a></div></div>" +
        "<div class=contact-div><div class=contact-title>Mobile Phone <a href=tel:" + mphone + "></div><div class=contact-value>" + nullCheck(response.MobilePhone) + "</a></div></div>" +
        "<div class=contact-div>" + "<div class=contact-title>Title</div>" + "<div class=contact-value>" + nullCheck(response.Title) + "</div>" + "</div>" +
        "<div class=contact-div><div class=contact-title>Email <a href=mailto:" + response.Email + "></div>" + "<div class=contact-value>" + nullCheck(response.Email)	+ "</a></div></div>" +
        "<div class=contact-div><div class=contact-title>Address</div>" + "<div class=contact-value>" + nullCheck(response.Street)	+ "</div>" +
        "<div class=contact-value>" + nullCheck(response.City)	+ ", " + nullCheck(response.State) +"</div>" +
        "<div class=contact-value>" + nullCheck(response.Country)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Map</div><a href=# onclick=window.plugins.childBrowser.showWebPage('http://maps.apple.com/maps?q=" + escape(response.Street) + escape(" " + response.City) + escape(" " + response.State) + "')>Map</a></div>" +
        "<div class=contact-div><div class=contact-title>Link to Salesforce></div><div><a href= # onclick=window.plugins.childBrowser.showWebPage('https://na1.salesforce.com/" + response.Id + "')>Link</div></div></a>";

    } else if (response.attributes.type == "Account") {
        htmlStr = "<div class=contact-div>" + "<div class=contact-title>Name</div>" + "<div class=contact-value>" + response.Name + "</div></div>" +
        "<div class=contact-div><div class=contact-title>Phone <a href=tel:" + phone + "></div><div class=contact-value>" + nullCheck(response.Phone) + "</a></div></div>" +
        "<div class=contact-div><div class=contact-title>Billing Address</div>" + "<div class=contact-value>" + nullCheck(response.Street)	+ "</div>" +
        "<div class=contact-value>" + nullCheck(response.BillingCity)	+ ", " + nullCheck(response.BillingState) +"</div>" +
        "<div class=contact-value>" + nullCheck(response.BillingCountry)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Map</div><a href=# onclick=window.plugins.childBrowser.showWebPage('http://maps.apple.com/maps?q=" + escape(response.BillingStreet) + escape(" " + response.BillingCity) + escape(" " + response.BillingState) + "')>Map</a></div>" +
        "<div class=contact-div><div class=contact-title>Link to Salesforce></div><div><a href= # onclick=window.plugins.childBrowser.showWebPage('https://na1.salesforce.com/" + response.Id + "')>Link</div></div></a>";

    } else if (response.attributes.type == "Opportunity") {
        htmlStr = "<div class=contact-div>" + "<div class=contact-title>Name</div>" + "<div class=contact-value>" + response.Name + "</div></div>" +
        "<div class=contact-div><div class=contact-title>Amount</div>" + "<div class=contact-value>" + nullCheck(response.Amount)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Close Date</div>" + "<div class=contact-value>" + nullCheck(response.CloseDate)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Stage</div>" + "<div class=contact-value>" + nullCheck(response.StageName)	+ "</div></div>" +
        "</div></a>";
    } else if (response.attributes.type == "Case") {
        htmlStr = "<div class=contact-div>" + "<div class=contact-title>Case Number</div>" + "<div class=contact-value>" + response.CaseNumber + "</div></div>" +
        "<div class=contact-div><div class=contact-title>Subject</div>" + "<div class=contact-value>" + nullCheck(response.Subject)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Status</div>" + "<div class=contact-value>" + nullCheck(response.Status)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Priority</div>" + "<div class=contact-value>" + nullCheck(response.Priority)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Link to Salesforce></div><div><a href= # onclick=window.plugins.childBrowser.showWebPage('https://na1.salesforce.com/" + response.Id + "')>Link</div>" +
        "</div></a>";
    } else if (response.attributes.type == "Report") {
        htmlStr = "<div class=contact-div>" + "<div class=contact-title>Report Name</div>" + "<div class=contact-value>" + response.Name + "</div></div>" +
        "<div class=contact-div><div class=contact-title>Description</div>" + "<div class=contact-value>" + nullCheck(response.Description)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Link to Salesforce></div><div><a href= # onclick=window.plugins.childBrowser.showWebPage('https://na1.salesforce.com/" + response.Id + "')>Link</div>" +
        "</div></a>";
    } else if ( response.attributes.type == "Campaign") {
        htmlStr = "<div class=contact-div>" + "<div class=contact-title>Campaign Name</div>" + "<div class=contact-value>" + response.Name + "</div></div>" +
        "<div class=contact-div><div class=contact-title>Description</div>" + "<div class=contact-value>" + nullCheck(response.Description)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Status</div>" + "<div class=contact-value>" + nullCheck(response.Status)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Start Date</div>" + "<div class=contact-value>" + nullCheck(response.StartDate)	+ "</div></div>" +
        "<div class=contact-div><div class=contact-title>Link to Salesforce></div><div><a href= # onclick=window.plugins.childBrowser.showWebPage('https://na1.salesforce.com/" + response.Id + "')>Link</div>" +
        "</div></a>";
    }
    else if (response.Name == null){
        htmlStr = "<div><a href=https://na1.salesforce.com/" + response.Id + ">Link to Salesforce</a></div>";
    } else {
        htmlStr = "<div>" + response.Name + "</div>";
    }
    $j("#record_details").html(htmlStr);
    $j("#record_details").trigger( "create" )
    $j.mobile.hidePageLoadingMsg();
    lastTarget.removeClass("ui-btn-active");

}
function onSuccessSfdcSearchContent(response) {
    var $j = jQuery.noConflict();
    $j("#search_results").html("")
    
    var ul = $j('<ul id=foo data-role="listview" data-inset="true" data-theme="d" data-dividertheme="a" ></ul>');
    $j("#search_results").append(ul);
    if (response.length == 0) {
        ul.append($j('<li data-role="list-divider">No Results Found' + '<a class="content-options" data-rel="dialog" data-rel="back" data-rel-back="true" href="#dialog" data-inline="true" data-role="button" data-icon="arrow-d" data-mini="true" data-transition="pop"><span class="content-options-text">'+dateRange+'</span></a></li>'));
    } else {
        ul.append($j('<li data-role="list-divider">Content Hits: ' + response.length + '<a class="content-options" data-rel="dialog"  data-rel="back" data-rel-back="true" href="#dialog" data-inline="true" data-role="button" data-icon="arrow-d" data-mini="true" data-transition="pop"><span class="content-options-text">'+dateRange+'</span></a></li>'));
    }
    
    $j.each(response, function(i, SearchResult) {
            var age = getAgeinDays(SearchResult.CreatedDate);
            age  = getAgeinDays(SearchResult.CreatedDate.substring(0,10))
            
            var descStr = "";
            if (SearchResult.Description != null) {
            var descStr = buildBody(SearchResult.Description);
            }
            
            if (SearchResult.attributes.type == "ContentVersion") {
            
            var newLi = $j("<li><a class=content-hl href=# onclick=window.plugins.childBrowser.showWebPage('" + forcetkClient.instanceUrl + "/sfc/servlet.shepherd/version/download/" + SearchResult.Id + "')>" + "<span class=content-hl-span>" + buildBody(SearchResult.Title) + "</span> " + "<span class=content-hl-age>" + descStr + "<br>" + age + "</span>" + "<span class=content-hl-filetype>" + SearchResult.FileType + " "  + bytesToSize(SearchResult.ContentSize , 0) + "</span>" + "</a></li>");
            

            ul.append(newLi);
            
            } else if (SearchResult.attributes.type == "Document") {
            var newLi = $j("<li><a href=# onclick=window.plugins.childBrowser.showWebPage('" + forcetkClient.instanceUrl + "/servlet/servlet.FileDownload?file=" + SearchResult.Id + "')>" + SearchResult.Name + "</a></li>");
            
            var newLi = $j("<li><a class=content-hl href=# onclick=window.plugins.childBrowser.showWebPage('" + forcetkClient.instanceUrl + "/servlet/servlet.FileDownload?file=" + SearchResult.Id + "')>" + "<span class=content-hl-span>" + buildBody(SearchResult.Name) + "</span> " + "<span class=content-hl-age>" + descStr + "<br> " + age + "</span>" + "<span class=content-hl-filetype>" + SearchResult.Type + " " + bytesToSize(SearchResult.BodyLength , 0) + "</span>" + "</a></li>");
            ul.append(newLi);
            }
            });
    
    
    
  //  $j("#search_results").find("li").tap( onListItemTap );
    $j("#search_results").trigger( "create" )
    $j.mobile.hidePageLoadingMsg();
    
    
    
}

function onSuccessSfdcSearchChatter2(response) {
    var $j = jQuery.noConflict();
    
    $j("#search_results").html("");
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="a"></ul>');
    
    $j("#search_results").append(ul);
    
    var repl = '<mark class="highlight">$1</mark>';
    var re = new RegExp('(' + getLastSearchTerm() + ')', 'ig')
    
    if (response.items.length == 0) {
        ul.append($j('<li data-theme="d" data-role="list-divider">No Results Found</li>'));
    } else {
        ul.append($j('<li data-theme="d" data-role="list-divider">Chatter Search Results</li>'));
        
        $j.each(response.items, function(i, SearchResult) {
                var fileStr="";
                if (SearchResult.type == "ContentPost" || SearchResult.type == "LinkPost") {
                    fileStr="<img class=chatter-li-file src =jquery/images/Document-icon.png>";
                }
                
                // for hit highlighting  SearchResult.body.text.replace(re,repl) 
               
                var bodyText = buildBody(SearchResult.body);
                
                var newLi = $j("<li class=chatter objtype=feed-items id=" + SearchResult.id + ">" +
                               "<img class=chatter-li-thumb src=" + SearchResult.actor.photo.smallPhotoUrl + ">"  +
                               "<span class=chatter-li-body>" + bodyText + "</span>" +
                               "<span class=chatter-li-timestamp>"  + SearchResult.parent.name.replace(re,repl)  + "</span>" +
                               "<p class=chatter-li-timestamp>" + SearchResult.actor.name.replace(re,repl) + " " +
                                getAgeinDays(SearchResult.createdDate.substring(0,10)) + " " +
                                fileStr +
                               "</p>" +
                              "</li>");

                ul.append(newLi);
                
                if (SearchResult.comments.comments.length > 0) {
                    $j.each(SearchResult.comments.comments, function(i, comment) {
                            var fileStr="";
                            var repl = '<mark class="highlight">$1</mark>';
                            var re = new RegExp('(' + getLastSearchTerm() + ')', 'ig')
                            if (SearchResult.type == "ContentComment") {
                              fileStr="<img class=chatter-li-file src =jquery/images/Document-icon.png>";
                            }
                            var bodyText = buildBody(comment.body);

                            var newLi = $j("<li class=chatter-li-comment objtype=feed-items id="  + SearchResult.id + ">" +
                                "<img class=chatter-li-thumb src=" + comment.user.photo.smallPhotoUrl + ">"  +
                                            "<span class=chatter-li-commentbody>" + bodyText  + "</span>" +
                                    "<span class=chatter-li-timestamp-comment>"  + SearchResult.parent.name.replace(re,repl)  + "</span>" +
                                            "<p class=chatter-li-timestamp-comment>" + comment.user.name.replace(re,repl) + " " +
                                            getAgeinDays(comment.createdDate.substring(0,10)) + " " +
                                            fileStr +
                                            "</p>" +
                                            "</li>");
                              ul.append(newLi);

                            });
                }
                });
    }
    
    // The nextPageUrl dos not work. So just hide the button for future use.
    if (response.nextPageUrl != null) {
        $j('#next_page').hide();
        $j('#next_page').attr('url', response.nextPageUrl);
    } else {
        $j('#next_page').hide();

    }
    $j("#search_results").trigger( "create" );

    $j.mobile.hidePageLoadingMsg();
    
}

function buildBody (body) {
    var str="";
    
    var searchTerms=getLastSearchTerm().split(" ");
    var reStr = "";
    for (var i = 0; i < searchTerms.length; i++) {
        if ( i == 0) {
            reStr = "(" + searchTerms[i];
        } else {
            reStr = reStr + "\|" + searchTerms[i];
        }
    }
    reStr = reStr + ")";    
    
    //hit highlighting
    var repl = '<mark class="highlight">$1</mark>';
    
    var re = new RegExp('(' + reStr + ')', 'ig');
    if (body.messageSegments == null) {
        str = body.replace(re,repl);

    } else {
    $j.each(body.messageSegments, function(i,segments) {
            if (segments.type == "Hashtag"  || segments.type == "Mention") {
              str = str + "<a id=hashsearch searchtype=hashtag href=#>" + segments.text.replace(re,repl) + "</a>";
            } else {
              str = str + segments.text.replace(re,repl);
            }
    });
   }
return str;
}

function onSuccessSfdcChatterDetails2(response) {
    var $j = jQuery.noConflict();
    
    $j("#div_search_detail").html("");
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="a"></ul>');
    
    $j("#div_search_detail").append(ul);
    
    var repl = '<mark class="highlight">$1</mark>';
    var re = new RegExp('(' + getLastSearchTerm() + ')', 'ig')
    
    ul.append($j('<li data-theme="d" data-role="list-divider">Details</li>'));
    
    var fileStr="";
    if (response.type == "ContentPost" || response.type == "LinkPost") {
        fileStr="<img class=chatter-li-file src =jquery/images/Document-icon.png>";
    }
    
    // for hit highlighting  SearchResult.body.text.replace(re,repl)
    
    var bodyText = buildBody(response.body);
    
    
    var attStr = "";
    var fileSize = "";
    
    if(response.type ==  "ContentPost") {

         attStr = "<div class=renderImage><a href=# onclick=window.plugins.childBrowser.showWebPage('" + forcetkClient.instanceUrl + "/sfc/servlet.shepherd/version/download/" + response.attachment.versionId + "')><img class=detail-img src=" + forcetkClient.instanceUrl + "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB240BY180&versionId=" + response.attachment.versionId + "></a></div>";
         fileSize = bytesToSize(response.attachment.fileSize,0);

    } else if (response.type ==  "LinkPost"){
        attStr = "<div class=linkpost><a href=# onclick=window.plugins.childBrowser.showWebPage('" + response.attachment.url + "')>" + response.attachment.title + "</a></div>";
    }
    
    var newLi = $j("<li class=chatter-det objtype=feed-items id=" + response.id + ">" +
                   "<img class=chatter-li-thumb src=" + response.actor.photo.smallPhotoUrl + ">"  +
                   "<span class=chatter-li-body>" + bodyText + "</span>" +
                   "<span class=chatter-li-timestamp>"  + response.parent.name.replace(re,repl)  + "</span>" +
                   "<p class=chatter-li-timestamp>" + response.actor.name.replace(re,repl) + " " +
                   getAgeinDays(response.createdDate.substring(0,10)) + " " +
                   fileStr +  " " + fileSize +
                   "</p>" +
                   attStr +
                   "</li>");
    
    ul.append(newLi);

    $j.each(response.comments.comments, function(i, comment) {
            var fileStr="";
            var repl = '<mark class="highlight">$1</mark>';
            var re = new RegExp('(' + getLastSearchTerm() + ')', 'ig')
            if (comment.type == "ContentComment") {
            fileStr="<img class=chatter-li-file src =jquery/images/Document-icon.png>";
            }
            var bodyText = buildBody(comment.body);
            
            var attStr="";
            var fileSize="";

            if(comment.type ==  "ContentComment") {
            
            attStr = "<div class=renderImage><a href=# onclick=window.plugins.childBrowser.showWebPage('" + forcetkClient.instanceUrl + "/sfc/servlet.shepherd/version/download/" + comment.attachment.versionId + "')><img class=detail-img src=" + forcetkClient.instanceUrl + "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB240BY180&versionId=" + comment.attachment.versionId + "></a></div>";
            fileSize = bytesToSize(comment.attachment.fileSize,0);

            
            } else if (comment.type ==  "LinkComment"){
            attStr = "<div class=linkpost><a href=# onclick=window.plugins.childBrowser.showWebPage('" + comment.attachment.url + "')>" + comment.attachment.title + "</a></div>";

            }
            
            var newLi = $j("<li class=chatter-det-comment objtype=comments id="  + comment.id + ">" +
                           "<img class=chatter-li-thumb src=" + comment.user.photo.smallPhotoUrl + ">"  +
                           "<span class=chatter-li-commentbody>" + bodyText  + "</span>" +
                         //  "<span class=chatter-li-timestamp-comment>"  + comment.type  + "</span>" +
                           "<p class=chatter-li-timestamp-comment>" + comment.user.name.replace(re,repl) + " " +
                           getAgeinDays(comment.createdDate.substring(0,10)) + " " +
                           fileStr + " " + fileSize +
                           "</p>" +
                           attStr + 
                           "</li>");
            ul.append(newLi);
            
            });
    
    $j.mobile.changePage('#searchdetail');

   // window.setTimeout(function(){$j.mobile.changePage('#searchdetail')}, 1000);
    lastTarget.removeClass("ui-btn-active");
    lastTarget.addClass("chatter");
    lastTarget.addClass("chatter-li-comment");

    $j("#div_search_detail").trigger( "create" );
    
}
function onSuccessSfdcChatterDetails(response) {
    var age = getAgeinDays(response.createdDate);
    var htmlStr = "";
    var filestr = "";
    
    if(response.type ==  "TextComment") {
        htmlStr = "<div class=chatter-details><img class=chatter-details-img src=" + response.user.photo.largePhotoUrl + ">" +
                                       "</div>" +
                                        "<div class=chatter-details-user>" +
                                      response.user.name +  " " +
                                      "<span class=timestamp>" + age + "</span>"  +
                                       "</div>" +
                                      "<div class=chatter-details-text><p>" + response.body.text + "<p></div>";
                                      
    } else {
        htmlStr = "<div class=chatter-details><img class=chatter-details-img src=" + response.actor.photo.largePhotoUrl +
                                      "></div>" +
                                "<div>" +
                                      "<div><span class=chatter-details-group>" + response.parent.name + "</span>" +
                                      "</div>" +
                                        "<span class=timestamp>" + age + "</span>"  +
                                        "<div class=chatter-details-user>" +
                                         "<p>" + response.actor.name  + "</p>" +
                                         "</div>" +
                                "</div>" +
                                      "<div class=chatter-details-text>" + response.body.text + "</div>";
    }
    if(response.type ==  "ContentPost") {
      htmlStr = htmlStr + "<div class=title>" + response.attachment.title + "</div>";
      htmlStr = htmlStr + "<div class=renderImage><a href=# onclick=window.plugins.childBrowser.showWebPage('" + forcetkClient.instanceUrl + "/sfc/servlet.shepherd/version/download/" + response.attachment.versionId + "')><img src=" + forcetkClient.instanceUrl + "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB240BY180&versionId=" + response.attachment.versionId + "></a></div>";
    } else if (response.type ==  "LinkPost"){
        htmlStr = htmlStr + "<div class=linkpost><a href=# onclick=window.plugins.childBrowser.showWebPage('" + response.attachment.url + "')>" + response.attachment.url + "</a></div>";
    }
    
    htmlStr += "<div id=clist>";
    htmlStr += "<ul data-role=listview data-inset=true data-theme=d data-dividertheme=a>";

            $j.each(response.comments.comments, function(i, comment) {
                    var fileStr="";
                    var repl = '<mark class="highlight">$1</mark>';
                    var re = new RegExp('(' + getLastSearchTerm() + ')', 'ig')
                    if (comment.type == "ContentComment") {
                    fileStr="<img class=chatter-li-file src =jquery/images/Document-icon.png>";
                    }
                    var bodyText = buildBody(comment.body);
                    
                    var newLi = "<li class=chatter-li-comment objtype=comments id="  + comment.id + ">" +
                                   "<img class=chatter-li-thumb src=" + comment.user.photo.smallPhotoUrl + ">"  +
                                   "<span class=chatter-li-commentbody>" + bodyText  + "</span>" +
                                   "<p class=chatter-li-timestamp-comment>" + comment.user.name.replace(re,repl) + " " +
                                   getAgeinDays(comment.createdDate.substring(0,10)) + " " +
                                   fileStr +
                                   "</p>" +
                                   "</li>";
                    htmlStr = htmlStr + newLi;
                    });
    
    htmlStr += "</ul></div>";

    $j("#div_search_detail").html(htmlStr);
    $j("#clist").listview( 'refresh' );
    $j("#clist").trigger( "create" );
    $j("#div_search_detail").listview( 'refresh' );


}


function onListItemTap() {
    var target = $j( event.target );

    if(target.attr("searchtype")  == "hashtag" || target.attr("searchtype") == "mention" || target.attr("searchtype") == "history" ||  target.attr("searchtype") == "topics") {
        var searchtype = target.attr("searchtype");

    } else {
      // we need to find the parent element if a child element is tapped.
      while (target.get(0).nodeName.toUpperCase() != "LI") {
           target=target.parent();
      }
        target.removeClass("chatter");
        target.removeClass("chatter-li-comment");
        target.addClass("ui-btn-active");
        var id = target.attr("id");
        var objtype = target.attr("objtype");
        var searchtype = target.attr("searchtype");

    }
    
    
    if (searchtype == "hashtag" || searchtype == "mention"  || searchtype == "history" || searchtype == "topics" ){
        searchContext = "Chatter";
        $j('#chatter-nav').addClass("ui-btn-active");
        $j('#history-nav').removeClass("ui-btn-active");

        performSearch(target.get(0).innerText);

    }
    else if (objtype == "comments" || objtype == "feed-items") {
        forcetkClient.chatter(objtype, id, null, onSuccessSfdcChatterDetails2, onErrorSfdcChatter);

    } else {
        forcetkClient.retrieve(objtype,id, null, onSuccessSfdcContentDetails, onErrorSfdc);
    }
    lastTarget=target;
    //target.removeClass("ui-btn-active");

}

function onListRecordTap() {
    var target = $j( event.target );
    var id = target.attr("id");
    target.addClass("ui-btn-active");
    var objtype = target.attr("objtype");
    var searchtype = target.attr("searchtype");
    
    
    
    //  while (target.get(0).nodeName.toUpperCase() != "LI") {
    //       target=target.parent();
    //   }
    var id = target.attr("id");
    
    if (objtype == "Case") {
        forcetkClient.search("FIND {" + getLastSearchTerm() + "} IN ALL FIELDS Returning " + objtype + "(Id, CaseNumber)", onSuccessSfdcSearchRecordList, onRecordErrorSfdc);
        
    } else {
    forcetkClient.search("FIND {" + getLastSearchTerm() + "} IN ALL FIELDS Returning " + objtype + "(Id, Name)", onSuccessSfdcSearchRecordList, onRecordErrorSfdc);
    }
    lastTarget=target;

    
}

function onListRecordDetailTap() {
    var target = $j( event.target );
    target.addClass("ui-btn-active");

   
    var id = target.attr("id");
    target.addClass("ui-btn-active");
    var objtype = target.attr("objtype");
    var searchtype = target.attr("searchtype");
    
    //  while (target.get(0).nodeName.toUpperCase() != "LI") {
    //       target=target.parent();
    //   }
    var id = target.attr("id");
        
    forcetkClient.retrieve(objtype, id, null, onSuccessSfdcSearchRecordListDetail, onErrorSfdc);

   // forcetkClient.search("FIND {" + lastSearchTerm + "} IN ALL FIELDS Returning " + objtype + "(Id, Name)", onSuccessSfdcSearchRecordListDetail, onErrorSfdc);
    
    $j.mobile.changePage('#recorddetail');

    lastTarget=target;

    
}
function onRecordErrorSfdc(error) {
    //alert('Error getting results!' + error.statusText);
}

function onErrorSfdc(error) {
    if ( error.statusText != "abort") {
       alert('Error getting results!' + error.responseText);
    }
    $j.mobile.hidePageLoadingMsg();

    
}
function onErrorSfdcSearch(error) {
    alert('Error getting search results! ' + error.statusText);
}
function onErrorSfdcChatter(error) {
    alert('Error getting Chatter results!' + error.statusText);
}
function onErrorDevice(error) {
    alert('Error getting information!' + error.statusText);
}

function getAgeinDays(xDate) {
    var msecPerday = 86400000;
    var aDate = new Date(xDate);
    var today = new Date();
    var interval = Math.floor((today.getTime() - aDate.getTime())/ msecPerday);
    return  ( (interval == 0) ? "today" : interval + "d ago");
    pageSize
}

function onErrorNoAlert(error) {
    //alert (error.statusText);
}


function showSearchHistory() {
    var $j = jQuery.noConflict();
    
    $j("#search_results").html("");
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="a"></ul>');
    
    $j("#search_results").append(ul);
    
   
    var storage = window.localStorage;
    var searchHistory = storage.getItem("searchHistory");
    
    if (searchHistory == null || searchHistory.length == 0) {
       
        ul.append($j('<li data-theme="d" data-role="list-divider">No History Found</li>'));
    } else {
        ul.append($j('<li data-theme="d" data-role="list-divider">Search History</li>'));
        
        var searchTerms = searchHistory.split("||");
        for (var i = 0; i < searchTerms.length; i++) {
            if (searchTerms[i] != null && searchTerms[i] != "") {
              var newLi = $j("<li class=history-li><a searchtype=history class=history-a href=# searchterm=" + searchTerms[i] + ">" +
                             searchTerms[i] + "</a></li>");
              ul.append(newLi);
            }

        }
    }
    $j("#search_results").trigger( "create" );
    $j.mobile.hidePageLoadingMsg();
    
}

function getTrendingTopics () {
    forcetkClient.chatterTrendingTopics(onSuccessSfdcTrendingTopics, onErrorSfdc);
}

function onSuccessSfdcTrendingTopics (response) {
    var $j = jQuery.noConflict();
    alert("trending");
    $j("#search_results").html("");
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="a"></ul>');
    
    $j("#search_results").append(ul);
    
    if (response.topics.length == 0) {
        ul.append($j('<li data-theme="d" data-role="list-divider">No Topics Found</li>'));
    } else {
        ul.append($j('<li data-theme="d" data-role="list-divider">Trending Topics</li>'));
        
        $j.each(response.topics, function(i, topics) {
                var newLi = $j("<li class=topics-li><a searchtype=topics class=topics-a href=# searchterm=" + topics.name  + ">" + topics.name + "</a></li>");
                ul.append(newLi);
            
                });
    }
        

}

function bytesToSize(bytes, precision) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    var posttxt = 0;
    if (bytes == 0) return 'n/a';
    while( bytes >= 1024 ) {
        posttxt++;
        bytes = bytes / 1024;
    }
    return parseInt(bytes).toFixed(precision) + " " + sizes[posttxt];
}

function nullCheck(str) {
    if (str == null) {
        return "";
    } else {
        return str;
    }
}





