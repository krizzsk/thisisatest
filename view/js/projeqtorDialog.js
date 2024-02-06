/*******************************************************************************
 * COPYRIGHT NOTICE *
 * 
 * Copyright 2009-2021 ProjeQtOr - Pascal BERNARD - support@projeqtor.org
 * Contributors : -
 * 
 * This file is part of ProjeQtOr.
 * 
 * ProjeQtOr is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 * 
 * ProjeQtOr is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with ProjeQtOr. If not, see <http://www.gnu.org/licenses/>.
 * 
 * You can get complete code of ProjeQtOr, other resource, help and information
 * about contributors at http://www.projeqtor.org
 * 
 * DO NOT REMOVE THIS NOTICE **
 ******************************************************************************/

// ============================================================================
// All specific ProjeQtOr functions and variables for Dialog Purpose
// This file is included in the main.php page, to be reachable in every context
// ============================================================================

// =============================================================================
// = Variables (global)
// =============================================================================
var filterType="";
var closeFilterListTimeout;
var openFilterListTimeout;
var closeFavoriteReportsTimeout;
var openFavoriteReportsTimeout=null;
var closeFavoriteTimeout;
var openFavoriteTimeout=null;
var popupOpenDelay=200;
var closeMenuListTimeout=null;
var openMenuListTimeout=null;
var menuListAutoshow=false;
var hideUnderMenuTimeout;
var hideUnderMenuId;
var previewhideUnderMenuId;
var stockEmailHistory = new Array();
var lastKeys= new Array();
var cplastKey;
var tabLastKeys= new Array();
var addVal= [0,0,0,0];
var paramLength;
var cpMaj=0;
var cpNum=0;
var cpChar=0;
var cpParamLength=0;
var coverListAction='';

// =============================================================================
// = Dialog Management
// =============================================================================

// CHANGE BY Marc TABARY - 2017-03-13 - CHANGE TITLE DYNAMIC DIALOG
function loadDialog(dialogDiv, callBack, autoShow, params, clearOnHide, closable, dialogTitle, dialogTitleKeepAsIs, formName) {
  // Before loading, be sure to clear dialogs containing
  // "directAccessToListButton"
  // This is mandatory as these dialogs may not be cleared on direct access, as
  // they are not showed so .hide() and no effect and clearOnHide is not
  // triggered
  if (dojo.byId('directAccessToListButton')) {
   var parentName=dojo.byId('directAccessToListButton').parentNode.id;
   var dialogName="dialog"+parentName.substr(0,1).toUpperCase()+parentName.substr(1,parentName.length-5);
   if (dijit.byId(dialogName)){
     dijit.byId(dialogName).set("content",null);
   }
  }
  // Old
  // function loadDialog(dialogDiv, callBack, autoShow, params, clearOnHide,
  // closable) {
  // END CHANGE BY Marc TABARY - 2017-03-13 - PERIODIC YEAR BUDGET ELEMENT
  if(typeof closable =='undefined')closable=true;
  var hideCallback=function() {
   if (dialogDiv=='dialogNote') resumeBodyFocus();
  };
  if (clearOnHide) {
   hideCallback=function() {
     dijit.byId(dialogDiv).set('content', null);
     if (dialogDiv=='dialogNote') resumeBodyFocus();
   };
  }
  
  // ADD BY Marc TABARY - 2017-03-13 - CHANGE TITLE DYNAMIC DIALOG
  var setTitle=false;
  if(typeof dialogTitle == 'undefined') {
     theDialogTitle = dialogDiv;
  } else if (dialogTitle=='') {
     theDialogTitle = dialogDiv;    
  } else {
     theDialogTitle = dialogTitle;
     setTitle=true;
  }
  if (! dialogTitleKeepAsIs) theDialogTitle=i18n(theDialogTitle);
  // END ADD BY Marc TABARY - 2017-03-13 - CHANGE TITLE DYNAMIC DIALOG
  
  extraClass="projeqtorDialogClass";
  if (dialogDiv=="dialogLogfile") {
   extraClass="logFile";
  }
  if (!dijit.byId(dialogDiv)) {
   dialog=new dijit.Dialog({
     id : dialogDiv,
  // CHANGE BY Marc TABARY - 2017-03-13 - CHANGE TITLE DYNAMIC DIALOG
     title : theDialogTitle,
     // Old
  // title : i18n(dialogDiv),
  // END CHANGE BY Marc TABARY - 2017-03-13 - CHANGE TITLE DYNAMIC DIALOG
     width : '500px',
     onHide : hideCallback,
     content : i18n("loading"),
     'class' : extraClass,
     closable : closable
   });
  } else {
   dialog=dijit.byId(dialogDiv);
  // ADD BY Marc TABARY - 2017-03-13 - CHANGE TITLE DYNAMIC DIALOG
   if (setTitle) {
       dialog.set('title',theDialogTitle);
  }
  // END ADD BY Marc TABARY - 2017-03-13 - CHANGE TITLE DYNAMIC DIALOG
  }
  if (!params) {
   params="";
  }
  showWait();
  dojo.xhrPost({
   url : '../tool/dynamicDialog.php?dialog=' + dialogDiv + '&isIE='
       + ((dojo.isIE) ? dojo.isIE : '') + params+'&csrfToken='+csrfToken,
   form : formName,
   handleAs : "text",
   load : function(data) {
     var contentWidget=dijit.byId(dialogDiv);
     contentWidget.set('content', data);
     if (autoShow) {
       setTimeout("dijit.byId('" + dialogDiv + "').show();", 100);
     }
     hideWait();
     if (callBack) {
       setTimeout(callBack, 10);
     }
   },
   error : function() {
     consoleTraceLog("error loading dialog " + dialogDiv);
     hideWait();
   }
  });
}

// =============================================================================
// = Wait spinner
// =============================================================================

var waitingForReply=false;

function showWait() {
  if (dojo.byId("wait")) {
    showField("wait");
    waitingForReply=true;
  } else {
    showField("waitLogin");
  }
}

function hideWait() {
  waitingForReply=false;
  hideField("wait");
  hideField("waitLogin");
  if (window.top.dijit.byId("dialogInfo")) {
    window.top.dijit.byId("dialogInfo").hide();
  }
}

// =============================================================================
// = Generic field visibility properties
// =============================================================================

function showField(field) {
  var dest=dojo.byId(field);
  if (dijit.byId(field)) {
    dest=dijit.byId(field).domNode;
  }
  if (dest) {
    dojo.style(dest, {
      visibility : 'visible'
    });
    dojo.style(dest, {
      display : 'inline'
    });
  }
}

/**
 * ============================================================================
 * Setup the style properties of a field to set it invisible (hide it)
 * 
 * @param field
 *          the name of the field to be set
 * @return void
 */
function hideField(field) {
  var dest=dojo.byId(field);
  if (dijit.byId(field)) {
    dest=dijit.byId(field).domNode;
  }
  if (dest) {
    dojo.style(dest, {
      visibility : 'hidden'
    });
    dojo.style(dest, {
      display : 'none'
    });
  }
}

function protectDblClick(widget){
  if (!widget.id) return;
  disableWidget(widget.id);
  setTimeout("enableWidget('"+widget.id+"');",300);
}

// =============================================================================
// = Message boxes
// =============================================================================

/**
 * ============================================================================
 * Display a Dialog Error Message Box
 * 
 * @param msg
 *          the message to display in the box
 * @return void
 */
function showError(msg) {
  window.top.hideWait();
  if (window.top.dojo.byId("dialogErrorMessage")) {
    window.top.dojo.byId("dialogErrorMessage").innerHTML=msg;
    window.top.dijit.byId("dialogError").show();
  } else if (dojo.byId('loginResultDiv')) {
    dojo.byId('loginResultDiv').innerHTML=
      '<input type="hidden" id="isLoginPage" name="isLoginPage" value="true" />'
      +'<div class="messageERROR" style="width:100%">'+msg+'</div>';
  } else {
    alert(msg);
  }
}

/**
 * ============================================================================
 * Display a Dialog Information Message Box
 * 
 * @param msg
 *          the message to display in the box
 * @return void
 */
function showInfo(msg,callback) {
  var callbackFunc=function() {};
  if (callback) { 
    callbackFunc=callback;
  }
  window.top.dojo.byId("dialogInfoMessage").innerHTML=msg;
  window.top.dijit.byId("dialogInfo").acceptCallback=callbackFunc;
  window.top.dijit.byId("dialogInfo").show();
}

/**
 * ============================================================================
 * Display a Dialog Alert Message Box
 * 
 * @param msg
 *          the message to display in the box
 * @return void
 */
function showAlert(msg,callback) {
  window.top.hideWait();
  var callbackFunc=function() {};
  if (callback) { 
    callbackFunc=callback;
  }
  window.top.dojo.byId("dialogAlertMessage").innerHTML=msg;
  window.top.dijit.byId("dialogAlert").acceptCallback=callbackFunc;
  window.top.dijit.byId("dialogAlert").show();
}

/**
 * ============================================================================
 * Display a Dialog Question Message Box, with Yes/No buttons
 * 
 * @param msg
 *          the message to display in the box
 * @param actionYes
 *          the function to be executed if click on Yes button
 * @param actionNo
 *          the function to be executed if click on No button
 * @return void
 */
function showQuestion(msg, actionYes, actionNo) {
  dojo.byId("dialogQuestionMessage").innerHTML=msg;
  dijit.byId("dialogQuestion").acceptCallbackYes=actionYes;
  dijit.byId("dialogQuestion").acceptCallbackNo=actionNo;
  dijit.byId("dialogQuestion").show();
}

/**
 * ============================================================================
 * Display a Dialog Confirmation Message Box, with OK/Cancel buttons NB : no
 * action on Cancel click
 * 
 * @param msg
 *          the message to display in the box
 * @param actionOK
 *          the function to be executed if click on OK button
 * @return void
 */
function showConfirm(msg, actionOK) {
  dojo.byId("dialogConfirmMessage").innerHTML=msg;
  dijit.byId("dialogConfirm").acceptCallback=actionOK;
  dijit.byId("dialogConfirm").show();
}

/**
 * ============================================================================
 * Display a About Box
 * 
 * @param msg
 *          the message of the about box (must be passed here because built in
 *          php)
 * @return void
 */
function showAbout(msg) {
  showInfo(msg);
}

function showMsg(id,value){
  if(dojo.byId("divMsgFull"+id).style.display=="none"){
    dojo.byId("divSubTitle"+id).style.display="none";
    if(value==0.25 || value==1.25 || value==2.25){
      if(dojo.byId("divMsgTitle"+(id+1))){
        dojo.byId("divMsgTitle"+(id+1)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id+2))){
        dojo.byId("divMsgTitle"+(id+2)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id+3))){
        dojo.byId("divMsgTitle"+(id+3)).style.display="none";
      }
    }
    if(value==0.5 || value==1.5 || value==2.5){
      if(dojo.byId("divMsgTitle"+(id+1))){
        dojo.byId("divMsgTitle"+(id+1)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id+2))){
        dojo.byId("divMsgTitle"+(id+2)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id-1))){
        dojo.byId("divMsgTitle"+(id-1)).style.display="none";
      }
    }
    if(value==0.75 || value==1.75 || value==2.75){
      if(dojo.byId("divMsgTitle"+(id+1))){
        dojo.byId("divMsgTitle"+(id+1)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id-1))){
        dojo.byId("divMsgTitle"+(id-1)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id-2))){
        dojo.byId("divMsgTitle"+(id-2)).style.display="none";
      }
    }
    if(value==1 || value==2 || value==3){
      if(dojo.byId("divMsgTitle"+(id-1))){
        dojo.byId("divMsgTitle"+(id-1)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id-2))){
        dojo.byId("divMsgTitle"+(id-2)).style.display="none";
      }
      if(dojo.byId("divMsgTitle"+(id-3))){
        dojo.byId("divMsgTitle"+(id-3)).style.display="none";
      }
    }
    
    dojo.byId("divMsgTitle"+id).style.height=50+'px';
    dojo.byId("divMsgTitle"+id).style.margin = 0+'px';
    dojo.byId("divMsgTitle"+id).style.width=340+'px';
    dojo.byId("divMsgTitle"+id).style.borderRadius = 5+'px '+5+'px '+0+'px '+0+'px';
    dojo.addClass(dojo.byId("divMsgTitle"+id),"colorMediumDiv");
    dojo.byId("divMsgFull"+id).style.display="block";
    dojo.byId("divMsgFull"+id).style.height=270+'px';
    dojo.byId("divMsgFull"+id).style.width=340+'px';
    dojo.byId("divMsgTitle"+id).style.fontSize=13+'px';
    
  }else{
    dojo.byId("divMsgFull"+id).style.display="none";
    dojo.byId("divMsgTitle"+id).style.height=155+'px';
    dojo.byId("divMsgTitle"+id).style.width=165+'px';
    dojo.byId("divMsgTitle"+id).style.borderRadius = 5+'px '+5+'px '+5+'px '+5+'px';
    dojo.byId("divMsgTitle"+id).style.flexDirection="column";
    dojo.byId("divMsgTitle"+id).style.justifyContent="center";
    dojo.byId("divMsgTitle"+id).style.fontSize=13+'px';
    dojo.byId("divMsgtextTitle"+id).style.padding = 15+'px';
    dojo.byId("arrowNewsDown"+id).style.display="block";
    if(id==1 || id==3 || id==5 || id==7 || id==9 || id==11){
      dojo.byId("divMsgTitle"+id).style.marginRight = 10+'px';
    }
    dojo.byId("divMsgTitle"+id).style.marginBottom = 10+'px';
    
    dojo.removeClass(dojo.byId("divMsgTitle"+id),"colorMediumDiv");
    if(value==0.25 || value==1.25 || value==2.25){
      if(dojo.byId("divMsgTitle"+(id+1))){
        dojo.byId("divMsgTitle"+(id+1)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id+2))){
        dojo.byId("divMsgTitle"+(id+2)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id+3))){
        dojo.byId("divMsgTitle"+(id+3)).style.display="flex";
      }
    }
    if(value==0.5 || value==1.5 || value==2.5){
      if(dojo.byId("divMsgTitle"+(id+1))){
        dojo.byId("divMsgTitle"+(id+1)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id+2))){
        dojo.byId("divMsgTitle"+(id+2)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id-1))){
        dojo.byId("divMsgTitle"+(id-1)).style.display="flex";
      }
    }
    if(value==0.75 || value==1.75 || value==2.75){
      if(dojo.byId("divMsgTitle"+(id+1))){
        dojo.byId("divMsgTitle"+(id+1)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id-1))){
        dojo.byId("divMsgTitle"+(id-1)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id-2))){
        dojo.byId("divMsgTitle"+(id-2)).style.display="flex";
      }
    }
    if(value==1 || value==2 || value==3){
      if(dojo.byId("divMsgTitle"+(id-1))){
        dojo.byId("divMsgTitle"+(id-1)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id-2))){
        dojo.byId("divMsgTitle"+(id-2)).style.display="flex";
      }
      if(dojo.byId("divMsgTitle"+(id-3))){
        dojo.byId("divMsgTitle"+(id-3)).style.display="flex";
      }
    }
  }
}
function showIntrotext(id){
  if(dojo.byId("divMsgFull"+id).style.display=="none"){
    dojo.byId("divMsgTitle"+id).style.height=39+'px';
    dojo.byId("divMsgTitle"+id).style.width=165+'px';
    dojo.byId("divMsgTitle"+id).style.margin = 0+'px';
    dojo.byId("divMsgTitle"+id).style.borderRadius = 5+'px '+5+'px '+0+'px '+0+'px';
    dojo.addClass(dojo.byId("divMsgTitle"+id),"colorMediumDiv");
    dojo.byId("divSubTitle"+id).style.display="block";
    dojo.byId("divSubTitle"+id).style.height=116+'px';
    dojo.byId("divSubTitle"+id).style.fontSize=10+'px';
    dojo.byId("divMsgTitle"+id).style.fontSize=10+'px';
    dojo.byId("divMsgTitle"+id).style.textOverflow='ellipsis';
    dojo.byId("arrowNewsDown"+id).style.display="none";
    dojo.byId("divMsgtextTitle"+id).style.padding = 0+'px';
  }
}

function hideIntrotext(id){
  if(dojo.byId("divMsgFull"+id).style.display=="none"){
    dojo.byId("divSubTitle"+id).style.display="none";
    dojo.byId("divMsgTitle"+id).style.height=155+'px';
    dojo.byId("divMsgTitle"+id).style.width=165+'px';
    if(id==1 || id==3 || id==5 || id==7 || id==9 || id==11){
      dojo.byId("divMsgTitle"+id).style.marginRight = 10+'px';
    }
    dojo.byId("divMsgTitle"+id).style.marginBottom = 10+'px';
    dojo.byId("divMsgTitle"+id).style.borderRadius = 5+'px '+5+'px '+5+'px '+5+'px';
    dojo.byId("divMsgTitle"+id).style.flexDirection="column";
    dojo.byId("divMsgTitle"+id).style.justifyContent="center";
    dojo.byId("divMsgTitle"+id).style.display="flex";
    dojo.byId("divMsgTitle"+id).style.fontSize=13+'px';
    dojo.removeClass(dojo.byId("divMsgTitle"+id),"colorMediumDiv");
    dojo.byId("arrowNewsDown"+id).style.display="block";
    dojo.byId("divMsgtextTitle"+id).style.padding = 15+'px';
  }
}

function hideMsg(id,value){
  dojo.byId("divMsgFull"+id).style.display="none";
  dojo.byId("divMsgTitle"+id).style.height=155+'px';
  dojo.byId("divMsgTitle"+id).style.width=165+'px';
  if(id==1 || id==3 || id==5 || id==7 || id==9 || id==11){
    dojo.byId("divMsgTitle"+id).style.marginRight = 10+'px';
  }
  dojo.byId("arrowNewsDown"+id).style.display="block";
  dojo.removeClass(dojo.byId("divMsgTitle"+id),"colorMediumDiv");
  if(value==0.25 || value==1.25 || value==2.25){
    if(dojo.byId("divMsgTitle"+(id+1))){
      dojo.byId("divMsgTitle"+(id+1)).style.display="flex";
    }
    if(dojo.byId("divMsgTitle"+(id+2))){
      dojo.byId("divMsgTitle"+(id+2)).style.display="flex";
    }
    if(dojo.byId("divMsgTitle"+(id+3))){
      dojo.byId("divMsgTitle"+(id+3)).style.display="flex";
    }
  }
  if(value==0.5 || value==1.5 || value==2.5){
    if(dojo.byId("divMsgTitle"+(id+1))){
      dojo.byId("divMsgTitle"+(id+1)).style.display="flex";
    }
    if(dojo.byId("divMsgTitle"+(id+2))){
      dojo.byId("divMsgTitle"+(id+2)).style.display="flex";
    }
    if(dojo.byId("divMsgTitle"+(id-1))){
      dojo.byId("divMsgTitle"+(id-1)).style.display="flex";
    }
  }
  if(value==0.75 || value==1.75 || value==2.75){
    if(dojo.byId("divMsgTitle"+(id+1))){
      dojo.byId("divMsgTitle"+(id+1)).style.display="flex";
    }
    if(dojo.byId("divMsgTitle"+(id-2))){
      dojo.byId("divMsgTitle"+(id-2)).style.display="flex";
    }
    if(dojo.byId("divMsgTitle"+(id-1))){
      dojo.byId("divMsgTitle"+(id-1)).style.display="flex";
    }
  }
  if(value==1 || value==2 || value==3){
    if(dojo.byId("divMsgTitle"+(id-1))){
      dojo.byId("divMsgTitle"+(id-1)).style.display="block";
    }
    if(dojo.byId("divMsgTitle"+(id-2))){
      dojo.byId("divMsgTitle"+(id-2)).style.display="block";
    }
    if(dojo.byId("divMsgTitle"+(id-3))){
      dojo.byId("divMsgTitle"+(id-3)).style.display="block";
    }
  }
}

// =============================================================================
// = Print
// =============================================================================

function showPrint(page, context, comboName, outMode, orientation, attach) {
  showWait();
  quitConfirmed=true;
  noDisconnect=true;
  if (!orientation)
    orientation='L';
  if (!outMode)
    outMode='html';
  var printInNewWin=printInNewWindow;
  if (outMode == "pdf") {
    printInNewWin=pdfInNewWindow;
  }
  if (outMode == "csv") {
    printInNewWin=true;
  }
  if (outMode == "mpp") {
    printInNewWin=true;
  }
  if (context=='favorite' || context=='admin' || context=='organization' || context=='asset') {
    printInNewWin=false;
  }
  if (outMode == "csv" || outMode == "word" || outMode == "excel" || outMode == "download" || context=="download" || context=="downloadList") {
    printInNewWin=true; // Will not show print frame
  }
  if (!printInNewWin) {
    dijit.byId("dialogPrint").show();
  }
  
  if(context=="contextMenu" && outMode == "pdf"){
    printInNewWin=false;
  }
  
  cl='';
  if ( (context == 'list' || context == 'downloadList') && dojo.byId('objectClassList')) {
    cl=dojo.byId('objectClassList').value;
  } else if (dojo.byId('objectClass')) {
    cl=dojo.byId('objectClass').value;
  }
  
  id='';
  if (dojo.byId('objectId')) {
    id=dojo.byId('objectId').value;
  }
  var params="&orientation=" + orientation+"&csrfToken="+csrfToken;
  dojo.byId("sentToPrinterDiv").style.display='block';
  if (outMode) {
    params+="&outMode=" + outMode;
    if (outMode == 'pdf') {
      dojo.byId("sentToPrinterDiv").style.display='none';
    }
  }

  if (cl=='Organization' && dijit.byId('OrganizationBudgetElementCurrent__byMet_periodYear')) {
    params+='&OrganizationBudgetPeriod='+dijit.byId('OrganizationBudgetElementCurrent__byMet_periodYear').get("value");
  }
  if (context == 'list' || context == 'downloadList' || context == 'download') {
    if (dijit.byId("listShowIdle")) {
      if (dijit.byId("listShowIdle").get('checked')) {
        params+="&idle=true";
      }
    }
    if (dijit.byId("listIdFilter")) {
      if (dijit.byId("listIdFilter").get('value')) {
        params+="&listIdFilter="
            + encodeURIComponent(dijit.byId("listIdFilter").get('value'));
      }
    }
    if (dijit.byId("listNameFilter")) {
      if (dijit.byId("listNameFilter").get('value')) {
        params+="&listNameFilter="
            + encodeURIComponent(dijit.byId("listNameFilter").get('value'));
      }
    }
    if (dijit.byId("listTypeFilter")) {
      if (trim(dijit.byId("listTypeFilter").get('value'))) {
        params+="&objectType="
            + encodeURIComponent(dijit.byId("listTypeFilter").get('value'));
      }
    }
    if (dijit.byId("listBudgetParentFilter")) {
      if (trim(dijit.byId("listBudgetParentFilter").get('value'))) {
        params+="&budgetParent="
            + encodeURIComponent(dijit.byId("listBudgetParentFilter").get('value'));
      }
    }
    if (dijit.byId("listClientFilter")) {
      if (trim(dijit.byId("listClientFilter").get('value'))) {
        params+="&objectClient="
            + encodeURIComponent(dijit.byId("listClientFilter").get('value'));
      }
    }
    if (dijit.byId("listElementableFilter")) {
      if (trim(dijit.byId("listElementableFilter").get('value'))) {
        params+="&objectElementable="
            + encodeURIComponent(dijit.byId("listElementableFilter").get('value'));
      }
    }
    if (attach === true) {
      params+="&attach=true";
    }
  } else if (context == 'planning') {
    if (dijit.byId("startDatePlanView")) {
      params+="&startDate="
          + encodeURIComponent(formatDate(dijit.byId("startDatePlanView").get(
              "value")));
      params+="&endDate="
          + encodeURIComponent(formatDate(dijit.byId("endDatePlanView").get(
              "value")));
      params+="&format=" + g.getFormat();
      if(dijit.byId('listShowIdleSwitch')){
        if (dijit.byId('listShowIdleSwitch').get("value")=='on') {
          params+="&idle=true";
        }
      }
      if(dijit.byId('showWBS')!=null){
        if (dijit.byId('showWBS').checked) {
          params+="&showWBS=true";
        }
      }
      if (dijit.byId('listShowResource')) {
        if (dijit.byId('listShowResource').checked) {
          params+="&showResource=true";
        }
      }
      if (dojo.byId('showProjectModel')) {
        if (dojo.byId('showProjectModel').checked) {
          url += (param) ? "&" : "?";
          url += "showProjectModel=true";
          param = true;
        }
      }
      if (dijit.byId('listShowLeftWork')) {
        if (dijit.byId('listShowLeftWork').checked) {
          params+="&showWork=true";
        }
      }
      if (dijit.byId('listShowProject')) {
        if (dijit.byId('listShowProject').checked) {
          params+="&showProject=true";
        }
      }
    }
  } else if (context == 'report' || context=='favorite') {
    if (context == 'report' ) { 
      var frm=dojo.byId('reportForm'); 
    } else {
      var frm=dojo.byId('favoriteForm'); 
    }
    frm.action="../view/print.php?csrfToken="+csrfToken;
    if (outMode) {
      frm.page.value=page;
      dojo.byId('outMode').value=outMode;
    } else {
      dojo.byId('outMode').value='';
    }
    if (printInNewWin && !attach) {
      frm.target='#';
    } else {
      frm.target='printFrame';
    }
    frm.submit();
    hideWait();
    quitConfirmed=false;
    noDisconnect=false;
    return;
  } else if (context == 'criticalResource') {
    var frm=dojo.byId('criticalResourcesForm'); 
    frm.action="../view/print.php?csrfToken="+csrfToken;
    if (outMode) {
      frm.page.value=page;
      dojo.byId('outMode').value='excel';
    } else {
      dojo.byId('outMode').value='';
    }
    if (printInNewWin && !attach) {
      frm.target='#';
    } else {
      frm.target='printFrame';
    }
    frm.submit();
    hideWait();
    quitConfirmed=false;
    noDisconnect=false;
    return;
  } else if (context == 'imputation' || context == 'hierarchicalBudget') {
    var frm=dojo.byId('listForm');
    frm.action="../view/print.php?orientation=" + orientation
               +"&outMode=" + outMode+"&page="+page
               +"&userId="+dojo.byId("userId").value
               +"&rangeType="+dojo.byId("rangeType").value
               +"&rangeValue="+dojo.byId("rangeValue").value
               +"&csrfToken="+csrfToken;
    if (printInNewWin) {
      frm.target='#';
    } else {
      frm.target='printFrame';
    }
    if (outMode) {
      dojo.byId('outMode').value=outMode;
    } else {
      dojo.byId('outMode').value='';
    }
    frm.submit();
    hideWait();
    quitConfirmed=false;
    noDisconnect=false;
    return;
  }
  var grid=dijit.byId('objectGrid');
  if (grid) {
    var sortWay=(grid.getSortAsc()) ? 'asc' : 'desc';
    var sortIndex=grid.getSortIndex();
    if (sortIndex >= 0) {
      params+="&sortIndex=" + sortIndex;
      params+="&sortWay=" + sortWay;
    }
  }
  if (attach === true) {
    params+="&attach=true";
    redirectOnTab('', '', 'fichier');
    dojo.byId("generateAttachPDFFrame").src="print.php?print=true&page=" + page
    + "&context="+context
    + "&objectClass=" + cl + "&objectId=" + id + params;
  } else if (outMode=="download" && context=='template') {
    dojo.byId("printFrame").src="print.php?print=true&page=" + page+"&csrfToken="+csrfToken;
    hideWait();
  } else if (outMode == "csv" || outMode == "word" || outMode == "excel" || outMode == "download" || context=="download" || context == 'downloadList') {
    dojo.byId("printFrame").src="print.php?print=true&page=" + page
        + "&context="+context
        + "&objectClass=" + cl + "&objectId=" + id + params;
    hideWait();
  } else if (printInNewWin) {
//    if(context='contextMenu'){
//      context='';
//      cl=dojo.byId("contextMenuRefType").value;
//      id=dojo.byId("contextMenuRefId").value;
//    }
    var newWin=window.open("print.php?print=true&page=" + page
        + "&context="+context
        + "&objectClass=" + cl + "&objectId=" + id + params);
    hideWait();
  } else if(context=='contextMenu'){
    dojo.byId("printFrame").src="print.php?print=true&page=" + page
        + "&context="+context + "&objectClass=" + dojo.byId("contextMenuRefType").value + "&objectId=" + dojo.byId("contextMenuRefId").value + params;
  } else {
    dojo.byId("printFrame").src="print.php?print=true&page=" + page
        + "&context="+context
        + "&objectClass=" + cl + "&objectId=" + id + params;
    if (outMode == 'pdf') {
      // hideWait();
    } 
  }

  quitConfirmed=false;
  noDisconnect=false;
}

function sendFrameToPrinter() {
  dojo.byId("sendToPrinter").blur();
  window.frames['printFrame'].focus();
  window.frames['printFrame'].print();
  dijit.byId('dialogPrint').hide();
  return true;
}

// =============================================================================
// = Detail (from combo)
// =============================================================================

function showDetailDependency() {
  var depType=dijit.byId('dependencyRefTypeDep').get("value");
  if (depType) {
    var dependable=dependableArray[depType];
    var canCreate=0;
    if (canCreateArray[dependable] == "YES") {
      canCreate=1;
    }
    showDetail('dependencyRefIdDep', canCreate, dependable, true);

  } else {
    showInfo(i18n('messageMandatory', new Array(i18n('linkType'))));
  }
}

function showDetailLink() {
  var linkType=dijit.byId('linkRef2Type').get("value");
  if (linkType) {
    var linkable=linkableArray[linkType];
    var canCreate=0;
    if (canCreateArray[linkable] == "YES") {
      canCreate=1;
    }
    showDetail('linkRef2Id', canCreate, linkable, true);

  } else {
    showInfo(i18n('messageMandatory', new Array(i18n('linkType'))));
  }
}

function showDetailOrigin() {
  var originType=dijit.byId('originOriginType').get("value");
  if (originType) {
    var originable=originableArray[originType];
    var canCreate=0;
    if (canCreateArray[originable] == "YES") {
      canCreate=1;
    }
    showDetail('originOriginId', canCreate, originable);

  } else {
    showInfo(i18n('messageMandatory', new Array(i18n('originType'))));
  }
}

function showDetailLinkedObject() {
  var mainObjectClassName = dojo.byId("mainObjectClass").value;
  var linkObjectClassName = dojo.byId("linkObjectClassName").value;
  if(linkObjectClassName){
    var canCreate=0;
    if (canCreateArray[linkObjectClassName] == "YES") {
      canCreate=1;
    }
    showDetail('linkedObjectId', canCreate, linkObjectClassName, true);
  } else {
    return;
  }
}

function showDetail(comboName, canCreate, objectClass, multiSelect, objectId, forceSearch) {
  if (comboName=='projectSelectorFiletering') {
    if (dojo.byId('projectSelectorMode') && dojo.byId('projectSelectorMode').value=='Standard') {
      multiSelect=true;
    } else {
      multiSelect=false;
    }
  }
  var contentWidget=dijit.byId("comboDetailResult");
  dojo.byId("canCreateDetail").value=canCreate;
  if (contentWidget) {
    contentWidget.set('content', '');
  }
  if (!objectClass) {
    objectClass=comboName.substring(2);
  }
  dojo.byId('comboName').value=comboName;
  dojo.byId('comboClass').value=objectClass;
  dojo.byId('comboMultipleSelect').value=(multiSelect) ? 'true' : 'false';
  dijit.byId('comboDetailResult').set('content',null);
  var val=null;
  if (dijit.byId(comboName)) {
    val=dijit.byId(comboName).get('value');
  } else if(dojo.byId(comboName)) {
    val=dojo.byId(comboName).value;
  }
  if (forceSearch) val=null; // will force search
  if (objectId) {
    if (objectId=='new') {
      cl=objectClass;
      id=null;
      window.frames['comboDetailFrame'].document.body.innerHTML='<i>'
          + i18n("messagePreview") + '</i>';
      dijit.byId("dialogDetail").show();
      // frames['comboDetailFrame'].location.href="print.php?print=true&page=preparePreview.php";
      newDetailItem(objectClass);
    } else {
      cl=objectClass;
      id=objectId;
      window.frames['comboDetailFrame'].document.body.innerHTML='<i>'
          + i18n("messagePreview") + '</i>';
      dijit.byId("dialogDetail").show();
      gotoDetailItem(objectClass,objectId);
    }
    
  } else if (!val || val == "" || val == " " || val == "*") {
    cl=objectClass;
    window.frames['comboDetailFrame'].document.body.innerHTML='<i>'
        + i18n("messagePreview") + '</i>';
    dijit.byId("dialogDetail").show();
    displaySearch(cl);
  } else {
    cl=objectClass;
    id=val;
    window.frames['comboDetailFrame'].document.body.innerHTML='<i>'
        + i18n("messagePreview") + '</i>';
    dijit.byId("dialogDetail").show();
    displayDetail(cl, id);
  }
  dojo.connect(dijit.byId("dialogDetail"),"onhide", 
    function(){
      // nothing to do;
    });
}

function displayDetail(objClass, objId) {
  showWait();
  showField('comboSearchButton');
  hideField('comboSelectButton');
  hideField('comboNewButton');
  hideField('comboSaveButton');
  showField('comboCloseButton');
  dijit.byId('comboDetailResult').set('content',null);
  frames['comboDetailFrame'].location.href="print.php?print=true&page=objectDetail.php&objectClass="
      + objClass + "&objectId=" + objId + "&detail=true&csrfToken="+csrfToken;
}

function directDisplayDetail(objClass, objId) {
  showWait();
  hideField('comboSearchButton');
  hideField('comboSelectButton');
  hideField('comboNewButton');
  hideField('comboSaveButton');
  showField('comboCloseButton');
  dijit.byId('comboDetailResult').set('content',null);
  window.frames['comboDetailFrame'].document.body.innerHTML='<i>'
    + i18n("messagePreview") + '</i>';
  dijit.byId("dialogDetail").show();
  frames['comboDetailFrame'].location.href="print.php?print=true&page=objectDetail.php&objectClass="
    + objClass + "&objectId=" + objId + "&detail=true&csrfToken="+csrfToken;
}

function selectDetailItem(selectedValue, lastSavedName) {
  var idFldVal="";
  if (selectedValue) {
    idFldVal=selectedValue;
  } else {
    var idFld=frames['comboDetailFrame'].dojo.byId('comboDetailId');
    var comboGrid=frames['comboDetailFrame'].dijit.byId('objectGrid');
    if (comboGrid) {
      idFldVal="";
      var items=comboGrid.selection.getSelected();
      dojo.forEach(items, function(selectedItem) {
        if (selectedItem !== null) {
          idFldVal+=(idFldVal != "") ? '_' : '';
          idFldVal+=parseInt(selectedItem.id, 10) + '';
        }
      });
    } else {
      if (!idFld) {
        showError('error : comboDetailId not defined');
        return;
      }
      idFldVal=idFld.value;
    }
    if (!idFldVal || idFldVal=="") {
      showAlert(i18n('noItemSelected'));
      return;
    }
  }
  var comboName=dojo.byId('comboName').value;
  var combo=dijit.byId(comboName);
  var comboClass=dojo.byId('comboClass').value;
  crit=null;
  critVal=null;
  if (comboClass == 'Activity' || comboClass == 'Resource'
      || comboClass == 'Ticket') {
    if (comboName.substr(0,15)=='filterValueList') {
      // Do not set current project (would be project of selected item), will
      // apply restriction to selected project
    } else {
      prj=dijit.byId('idProject');
      if (prj) {
        crit='idProject';
        critVal=prj.get("value");
      }else{
        var project = dojo.byId('idProject');
        if (project) {
          crit='idProject';
          critVal=project.value;
        }
      }
    }  
  }
  if (comboName != 'idStatus'  && comboName != 'versionsPlanningDetail' && comboName != 'projectSelectorFiletering') { 
    if (combo) {
      refreshList('id' + comboClass, crit, critVal, idFldVal, comboName);
    } else {
      if (comboName == 'dependencyRefIdDep') {
        refreshDependencyList(idFldVal);
        setTimeout("dojo.byId('dependencyRefIdDep').focus()", 1000);
        enableWidget('dialogDependencySubmit');
      } else if (comboName == 'linkRef2Id') {
        refreshLinkList(idFldVal);
        setTimeout("dojo.byId('linkRef2Id').focus()", 1000);
        enableWidget('dialogLinkSubmit');
      } else if (comboName == 'pokerItemRef2Id') {
          refreshPokerItemList(idFldVal);
          setTimeout("dojo.byId('pokerItemRef2Id').focus()", 1000);
          enableWidget('dialogPokerItemSubmit');
      } else if (comboName == 'productStructureListId') {
        refreshProductStructureList(idFldVal,lastSavedName);
        setTimeout("dojo.byId('productStructureListId').focus()",500);
        enableWidget('dialogProductStructureSubmit');
      // ADD aGaye - Ticket 179
      } else if (comboName == 'versionCompatibilityListId'){
    	  refreshVersionCompatibilityList(idFldVal,lastSavedName);
    	  setTimeout("dojo.byId('versionCompatibilityListId').focus()",500);
          enableWidget('dialogVersionCompatibilitySubmit');
      // END aGaye - Ticket 179
      } else if (comboName == 'productVersionStructureListId') {
    	  refreshProductVersionStructureList(idFldVal,lastSavedName);
        setTimeout("dojo.byId('productVersionStructureListId').focus()",500);
        enableWidget('dialogProductVersionStructureSubmit');
      } else if (comboName == 'otherVersionIdVersion') {
        refreshOtherVersionList(idFldVal);
        setTimeout("dojo.byId('otherVersionIdVersion').focus()", 1000);
        enableWidget('dialogOtherVersionSubmit');
      } else if (comboName == 'otherClientIdClient') {
        refreshOtherClientList(idFldVal);
        setTimeout("dojo.byId('otherClientIdClient').focus()", 1000);
        enableWidget('dialogOtherClientSubmit');
      } else if (comboName == 'approverId') {
        refreshApproverList(idFldVal);
        setTimeout("dojo.byId('approverId').focus()", 1000);
        enableWidget('dialogApproverSubmit');
      } else if (comboName == 'originOriginId') {
        refreshOriginList(idFldVal);
        setTimeout("dojo.byId('originOriginId').focus()", 1000);
        enableWidget('dialogOriginSubmit');
      } else if (comboName == 'testCaseRunTestCaseList') {
        refreshTestCaseRunList(idFldVal);
        setTimeout("dojo.byId('testCaseRunTestCaseList').focus()", 1000);
        enableWidget('dialogTestCaseRunSubmit');
      } else if (comboName == 'linkedObjectId') {
        var mainObjectClassName = dojo.byId("mainObjectClass").value;
        var linkObjectClassName = dojo.byId("linkObjectClassName").value;
        refreshLinkObjectList(idFldVal, mainObjectClassName, linkObjectClassName);
        setTimeout("dojo.byId('linkedObjectId').focus()", 1000);
        enableWidget('dialogObjectSubmit');
      } else if (comboName == 'linkProviderTerm') {
        refreshLinkProviderTerm(idFldVal);
      }    
    }
  }
  if (comboName == 'versionsPlanningDetail') {
	  displayVersionsPlanning(idFldVal,'ProductVersion');
	  hideDetail();
	  return;
  }else if(comboName == 'versionsComponentPlanningDetail'){
    displayVersionsPlanning(idFldVal,'ComponentVersion');
    hideDetail();
    return;                                                    
  }  
  if(comboClass=='Contact' && (dojo.byId('objectClass').value=='Client' || dojo.byId('objectClass').value=='Provider') ){
    saveContact(idFldVal,comboClass,comboName);
    hideDetail();
    return;
  }
  if (combo) {
  	if(comboName == 'projectSelectorFiletering'){
  		var pos = idFldVal.indexOf('_');
  		if(pos != -1){
  		  if (dijit.byId('multiProjectSelector')) {
  			  dijit.byId('multiProjectSelector').set("value", idFldVal);
  		  } else {
  		    showAlert(i18n("errorMultiSelectProject"));
  		  }
  		}else{
  			combo.set("value", idFldVal);
  		}
  	}else if(comboName.substr(0,15) == 'filterValueList'){
  		idFldVal=idFldVal.split('_');
  		combo.set("value", idFldVal);
  		// }
    }else if (comboName=='multipleUpdateValueList'){
      combo.set("selected", idFldVal);
      var nodeList=combo.domNode;
      for (var i = 0; i < nodeList.length; ++i) {
        if(nodeList[i].value==idFldVal){
          nodeList[i].selected=true;
          break;
        }
      }

    }else if (comboName.includes('refreshBottom')){
      if(dijit.byId('new'+inputName))dijit.byId('new'+inputName).focus();
      combo.set("value", idFldVal);
      var inputName = comboName.replace('refreshBottom', '');
      if(dijit.byId('new'+inputName))dijit.byId('new'+inputName).focus();
    }else{
  	  combo.set("value", idFldVal);
  	}
  }
  hideDetail();
  if (dojo.byId('directAccessToList') && dojo.byId('directAccessToList').value=='true' && dojo.byId('directAccessToListButton')) {
    var idButton = dojo.byId('directAccessToListButton').value;
    setTimeout("dijit.byId('" + idButton + "').onClick();", 20);
  }
}

function displaySearch(objClass) {
  if (!objClass) {
    objClass=dojo.byId('comboClass').value;
  }
  showWait();
  hideField('comboSearchButton');
  showField('comboSelectButton');
  if (dojo.byId("canCreateDetail").value=="1" && objClass!='Project' && objClass!='Status' ) {
    showField('comboNewButton');
  } else {
    hideField('comboNewButton');
  }
  hideField('comboSaveButton');
  showField('comboCloseButton');
  var multipleSelect=(dojo.byId('comboMultipleSelect').value == 'true') ? '&multipleSelect=true'
      : '';
  var currentProject=(top.dijit.byId('idProject'))?'&currentSelectedProject='+top.dijit.byId('idProject').get("value"):'';
  if (top.dojo.byId('objectClass') && top.dojo.byId('objectClass')=='Project' && top.dojo.byId('id')) currentProject='&currentSelectedProject='+top.dojo.byId('id').value;
  window.top.frames['comboDetailFrame'].location.href="comboSearch.php?objectClass="
      + objClass + "&mode=search" + multipleSelect+currentProject+'&csrfToken='+csrfToken;
  setTimeout('dijit.byId("dialogDetail").show()', 10);
}

function newDetailItem(objectClass) {
  gotoDetailItem(objectClass);
}
function gotoDetailItem(objectClass,objectId) {
  // comboName=dojo.byId('comboName').value;
  dijit.byId("dialogDetail").show();
  hideField('comboSearchButton');
  var objClass=objectClass;
  if (!objectClass) {
    objClass=dojo.byId('comboClass').value;
    showField('comboSearchButton');
  }
  showWait();
  hideField('comboSelectButton');
  hideField('comboNewButton');
  if (dojo.byId("canCreateDetail").value == "1") {
    showField('comboSaveButton');
  } else {
    hideField('comboSaveButton');
  }
  showField('comboCloseButton');
  destinationWidth=frames['comboDetailFrame'].document.body.offsetWidth
  page="comboSearch.php";
  page+="?objectClass=" + objClass;
  if (objectId) {
    page+="&objectId="+objectId;
    page+="&mode=new";    
  } else {
    var curClass = dojo.byId('objectClass').value;
    var curId = dojo.byId('objectId').value;
    var currentScreen=(historyTable[historyPosition] !== undefined) ? historyTable[historyPosition][2] : '';
    var currentItem = new Array(curClass, curId, currentScreen);
    if (currentScreen == "Planning" || currentScreen == "GlobalPlanning" || ((currentScreen == "VersionsPlanning" || currentScreen == "ResourcePlanning") && objectClass == "Activity")) {
      var currentItemParent=currentItem[1];
      var originClass=currentItem[0];
      page+='&insertItem=true&currentItemParent=' + currentItemParent + '&originClass=' + originClass;
      if (currentScreen == "VersionsPlanning" || currentScreen == "ResourcePlanning") {
        page+="&currentPlanning=" + currentScreen;
      }
    }
    page+="&objectId=0";
    page+="&mode=new";
    if(dijit.byId('idClient')){
    	if(trim(dijit.byId('idClient').get('value')) != ''){
    		page+="&idClient="+dijit.byId('idClient').get('value');
    	}
    }
    if (top.dojo.byId('objectClassManual') && top.dojo.byId('objectClassManual').value=='LiveMeeting' && top.dojo.byId('meetingId') ) {
      page+="&sourceItem=Meeting_"+top.dojo.byId('meetingId').value;
    }
  }
  page+="&destinationWidth=" + destinationWidth;
  window.top.frames['comboDetailFrame'].location.href=page+'&csrfToken='+csrfToken;
  setTimeout('dijit.byId("dialogDetail").show()', 10);   
}

function saveDetailItem() {
  var comboName=dojo.byId('comboName').value;
  var formVar=frames['comboDetailFrame'].dijit.byId("objectForm");
  if (!formVar) {
    showError(i18n("errorSubmitForm", new Array(page, destination, formName)));
    return;
  }
  for(name in frames['comboDetailFrame'].CKEDITOR.instances) {
    frames['comboDetailFrame'].CKEDITOR.instances[name].updateElement();
  }
  // validate form Data
  if (1) { // if (formVar.validate()) {
    showWait();
    frames['comboDetailFrame'].dojo
        .xhrPost({
          url : "../tool/saveObject.php?comboDetail=true&csrfToken="+csrfToken,
          form : "objectForm",
          handleAs : "text",
          load : function(data, args) {
            var contentWidget=dijit.byId("comboDetailResult");
            if (!contentWidget) {
              return;
            }
            contentWidget.set('content', data);
            checkDestination("comboDetailResult");
            var lastOperationStatus=window.top.dojo
                .byId('lastOperationStatusComboDetail');
            var lastOperation=window.top.dojo.byId('lastOperationComboDetail');
            var lastSaveId=window.top.dojo.byId('lastSaveIdComboDetail');
            if (lastOperationStatus.value == "OK") {
              var currentItemName="";
              if (frames['comboDetailFrame'].dijit.byId("name")) {
                currentItemName=frames['comboDetailFrame'].dijit.byId("name").get("value");
              }
              selectDetailItem(lastSaveId.value,currentItemName);
              if(fromContextMenu){
                fromContextMenu=false;
                refreshGrid();
              }
            }else{
              dojo.byId('comboDetailResult').style.display = 'inline-block';
              dojo.byId('comboDetailResult').style.visibility = 'visible';
            }
            hideWait();
          },
          error : function() {
            hideWait();
          }
        });

  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function hideDetail() {
  hideField('comboSearchButton');
  hideField('comboSelectButton');
  hideField('comboNewButton');
  hideField('comboSaveButton');
  hideField('comboCloseButton');
  frames['comboDetailFrame'].location.href="preparePreview.php?csrfToken="+csrfToken;
  dijit.byId("dialogDetail").hide();
  if (dijit.byId(dojo.byId('comboName').value)) {
    dijit.byId(dojo.byId('comboName').value).focus();
  }
}

// =============================================================================
// = Copy Object
// =============================================================================

/**
 * Display a copy object Box
 * 
 */
function copyObjectBox(copyType) {
  var callBack=function() {

  };
  if (copyType=="copyDocument") {
    callBack=function() {
    };
    var params="&objectClass="+dojo.byId('objectClass').value;
    params+="&objectId="+dojo.byId("objectId").value;   
    params+="&copyType="+copyType;  
    loadDialog('dialogCopyDocument', callBack, true, params, false);
  }else{
  if (copyType=="copyVersion") {
    callBack=function() {
    };
  } else if(copyType=="copyObjectTo"){
    callBack=function() {
      dojo.byId('copyClass').value=dojo.byId('objectClass').value;
      dojo.byId('copyId').value=dojo.byId("objectId").value;
      copyObjectToShowStructure();
    };
  }else if(copyType=="copyProject"){
    callBack=function() {
      dojo.byId('copyProjectId').value=dojo.byId("objectId").value;
      dijit.byId('copyProjectToName').set('value', dijit.byId('name').get('value'));
      dijit.byId('copyProjectToType').reset();
      if (dijit.byId('idProjectType') && dojo.byId('codeType')
          && dojo.byId('codeType').value != 'TMP') {
        var runModif="dijit.byId('copyProjectToType').set('value',dijit.byId('idProjectType').get('value'))";
        setTimeout(runModif, 1);
      }
    };
  }
  var params="&objectClass="+dojo.byId('objectClass').value;
  params+="&objectId="+dojo.byId("objectId").value;   
  params+="&copyType="+copyType+"&fromContextMenu="+fromContextMenu;   
  loadDialog('dialogCopy', callBack, true, params, false);
  }
}

function copySubTaskObjectBox(refType,refId) {
  callBack=function() {
    dojo.byId('copyClass').value=refType;
    dojo.byId('copyId').value=refId;
  };
  
  var params="&objectClass="+refType;
  params+="&objectId="+refId;   
  params+="&copyType=copyObjectTo";   
  loadDialog('dialogCopy', callBack, true, params, false);
  
}

// =============================================================================
// = Origin
// =============================================================================

function addOrigin() {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var objectClass=dojo.byId('objectClass').value;
  var objectId=dojo.byId("objectId").value;
  dijit.byId("originOriginType").reset();
  refreshOriginList();
  dojo.byId("originId").value="";
  dojo.byId("originRefType").value=objectClass;
  dojo.byId("originRefId").value=objectId;
  dijit.byId("dialogOrigin").show();
  disableWidget('dialogOriginSubmit');
}

function refreshOriginList(selected) {
  disableWidget('dialogOriginSubmit');
  var url='../tool/dynamicListOrigin.php';
  if (selected) {
    url+='?selected=' + selected;
  }
  loadContent(url, 'dialogOriginList', 'originForm', false);
}

function saveOrigin() {
  if (dojo.byId("originOriginId").value == "")
    return;
  loadContent("../tool/saveOrigin.php", "resultDivMain", "originForm", true,
      'origin');
  dijit.byId('dialogOrigin').hide();
}

function removeOrigin(id, origType, origId) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  dojo.byId("originId").value=id;
  dojo.byId("originRefType").value=dojo.byId('objectClass').value;
  dojo.byId("originRefId").value=dojo.byId("objectId").value;
  dijit.byId("originOriginType").set('value', origType);
  dojo.byId("originOriginId").value=origId;
  actionOK=function() {
    loadContent("../tool/removeOrigin.php", "resultDivMain", "originForm", true,
        'origin');
  };
  msg=i18n('confirmDeleteOrigin', new Array(i18n(origType), origId));
  showConfirm(msg, actionOK);
}


// =============================================================================
// = ChecklistDefinitionLine
// =============================================================================

function addChecklistDefinitionLine(checkId) {
  var params="&checkId=" + checkId;
  loadDialog('dialogChecklistDefinitionLine', null, true, params);
}

function editChecklistDefinitionLine(checkId, lineId) {
  var params="&checkId=" + checkId + "&lineId=" + lineId;
  loadDialog('dialogChecklistDefinitionLine', null, true, params);
}

function saveChecklistDefinitionLine() {
  if (!dijit.byId("dialogChecklistDefinitionLineName").get('value')) {
    showAlert(i18n('messageMandatory', new Array(i18n('colName'))));
    return false;
  }
  loadContent("../tool/saveChecklistDefinitionLine.php", "resultDivMain",
      "dialogChecklistDefinitionLineForm", true, 'checklistDefinitionLine');
  dijit.byId('dialogChecklistDefinitionLine').hide();

}

function removeChecklistDefinitionLine(lineId) {
  var params="?lineId=" + lineId;
  actionOK=function() {
    loadContent("../tool/removeChecklistDefinitionLine.php" + params,
        "resultDivMain", null, true, 'checklistDefinitionLine');
  };
  msg=i18n('confirmDelete', new Array(i18n('ChecklistDefinitionLine'), lineId));
  showConfirm(msg, actionOK);
}

// =============================================================================
// = Checklist
// =============================================================================

function showChecklist(objectClass) {
  if (!objectClass) {
    return;
  }
  if (dijit.byId('id')) {
    var objectId=dijit.byId('id').get('value');
  } else {
    return;
  }
  var params="&objectClass=" + objectClass + "&objectId=" + objectId;
  loadDialog('dialogChecklist', null, true, params, true);
}

function saveChecklist() {
  loadContent('../tool/saveChecklist.php', 'resultDivMain', 'dialogChecklistForm',
      true, 'checklist');
  dijit.byId('dialogChecklist').hide();
  return false;
}

function checkClick(line, item) {
  checkName="check_" + line + "_" + item;
  if (dijit.byId(checkName).get('checked')) {
    for (var i=1; i <= 5; i++) {
      if (i != item && dijit.byId("check_" + line + "_" + i)) {
        dijit.byId("check_" + line + "_" + i).set('checked', false);
      }
    }
  }
}

// =============================================================================
// = History
// =============================================================================

function showHistory(objectClass) {
  if (!objectClass) {
    return;
  }
  if (dijit.byId('id')) {
    var objectId=dijit.byId('id').get('value');
  } else {
    return;
  }
  var params="&objectClass=" + objectClass + "&objectId=" + objectId;
  loadDialog('dialogHistory', null, true, params);
}

// =============================================================================
// = Import
// =============================================================================

/**
 * Display an import Data Box (Not used, for an eventual improvement)
 * 
 */
function importData() {
  var controls=controlImportData();
  if (controls) {
    showWait();
  }
  return controls;
}

function showHelpImportData() {
  var controls=controlImportData();
  if (controls) {
    showWait();
    var url='../tool/importHelp.php?elementType='
        + dijit.byId('elementType').get('value');
    url+='&fileType=' + dijit.byId('fileType').get('value');
    frames['resultImportData'].location.href=url+"&csrfToken="+csrfToken;
  }
}

function controlImportData() {
  var elementType=dijit.byId('elementType').get('value');
  if (!elementType) {
    showAlert(i18n('messageMandatory', new Array(i18n('colImportElementType'))));
    return false;
  }
  var fileType=dijit.byId('fileType').get('value');
  if (!fileType) {
    showAlert(i18n('messageMandatory', new Array(i18n('colImportFileType'))));
    return false;
  }
  return true;
}
function importFinished() {
  if (dijit.byId('elementType') && dijit.byId('elementType').get('displayedValue')==i18n('Project') ) {
    refreshProjectSelectorList();
  }
}

// =============================================================================
// = Report
// =============================================================================

function runReport() {
  clearCharts();
  var fileName = dojo.byId('reportFile').value;
  var listheight=dojo.byId('listHeightReport').value;
  var divHeight=dojo.byId('detailReportDiv').offsetHeight;
  var height = (listheight >= dojo.byId('mainReportContainer').offsetHeight)?(listheight-divHeight)-15:listheight;
  if((height >= dojo.byId('mainReportContainer').offsetHeight) || height==0 )height=250;
  saveContentPaneResizing('contentPaneDetailReportDiv',height,true);
  dijit.byId('listReportDiv').resize({h:height});
  dijit.byId('mainReportContainer').resize();
  var formVar=dijit.byId('reportForm');
  var reportParams='';
  dojo.forEach(
    formVar.getChildren(),  
    function(widget){
      var name=widget.id;
      if (!name || name=='') return;
      if (name.substr(0,6)=='report') return;
      if (reportParams!='') reportParams+='|';
      if (widget.declaredClass=='dijit.form.DateTextBox') reportParams+=widget.id+'='+widget.displayedValue;
      //else if (widget.declaredClass=='dijit.form.NumberSpinner') reportParams+=widget.id+'='+widget.displayedValue;
      else reportParams+=widget.id+'='+widget.value;
    }
  );
  var currentItem=historyTable[historyPosition];
  currentItem[3]=reportParams;
  historyTable[historyPosition]=currentItem;
  if(formVar.validate()) {
    showWait();
    loadContent("../report/" + fileName, "detailReportDiv", "reportForm", false);
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
  
}
function saveReportInToday() {
  var fileName = dojo.byId('reportFile').value;
  var form="reportForm";
  if(fileName=="showIntervention" && dojo.byId("consultationPlannedWorkManualParamDiv")){
    form="listFormConsPlannedWorkManual";
  }
    loadContent("../tool/saveReportInToday.php", "resultDivMain", form, true,
    'report');
}
function saveReportParametersForDialog() {
  var callback=function(){
  hideWait();
  showDialogAutoSendReport();
  };
  loadDiv("../tool/saveReportParametersForDialog.php", "resultDivMain", "reportForm", callback);
}   

function reportSelectCategory(idCateg) {
  if (isNaN(idCateg)) return;
  loadContent("../view/reportsParameters.php?idReport=", "reportParametersDiv",
      null, false);
  var tmpStore=new dojo.data.ItemFileReadStore(
      {
        url : '../tool/jsonList.php?required=true&listType=list&dataType=idReport&critField=idReportCategory&critValue='
            + idCateg+'&csrfToken='+csrfToken
      });
  var mySelectWidget=dijit.byId("reportsList");
  mySelectWidget.reset();
  var mySelect=dojo.byId("reportsList");
  mySelect.options.length=0;
  var nbVal=0;
  tmpStore.fetch({
    query : {
      id : "*"
    },
    onItem : function(item) {
      mySelect.options[mySelect.length]=new Option(tmpStore.getValue(item,
          "name", ""), tmpStore.getValue(item, "id", ""));
      nbVal++;
    },
    onError : function(err) {
      console.info(err.message);
    }
  });
}

function reportSelectReport(idReport) {
  if (isNaN(idReport)) return;
  clearCharts();
  dojo.query(".section").removeClass("reportSelected");
  dojo.addClass(dojo.byId('report'+idReport),"reportSelected");
  var height=dojo.byId('mainReportContainer').offsetHeight;
  dijit.byId('listReportDiv').resize({h:height});
  dijit.byId('mainReportContainer').resize();
  loadContent("../view/reportsParameters.php?idReport=" + idReport,
  "reportParametersDiv", null, false);
  // mehdi Ticket #3092
  detailReportDiv.innerHTML = ""; 
}
function clearCharts() {
// if (dojo.byId('reportChart')) {
// Chart.getChart("reportChart").destroy();
// }
  dojo.query(".reportChart").forEach(function(node, index, nodelist) {
    var name=node.getAttribute('id');
    Chart.getChart(name).destroy();
  });
}

// favorite reports management

function refreshFavoriteReportList(idFavoriteRow) {
  if (!dijit.byId('favoriteReports_'+idFavoriteRow)) return;
  dijit.byId('favoriteReports_'+idFavoriteRow).refresh();
  // var listContent=trim(dijit.byId('favoriteReports').get('content'));
}
function saveReportAsFavorite(idFavoriteRow) {
  if(!idFavoriteRow)idFavoriteRow=1;
  var fileName=dojo.byId('reportFile').value;
  var callback=function(){
   refreshFavoriteReportList(idFavoriteRow);
   dijit.byId('listFavoriteReports_'+idFavoriteRow).openDropDown();
   var delay=2000;
   var listContent=trim(dijit.byId('favoriteReports_'+idFavoriteRow).get('content'));
   if (listContent=="") {delay=1;}
   hideReportFavoriteTooltip(delay, idFavoriteRow);
  };
  loadContent("../tool/saveReportAsFavorite.php" , "resultDivMain", "reportForm", true, 'report',false,false, callback);
}

function showReportFavoriteTooltip(idFavoriteRow) {
  if(!idFavoriteRow)idFavoriteRow=1;
  var listContent=trim(dijit.byId('favoriteReports_'+idFavoriteRow).get('content'));
  if (listContent=="") {
   return;
  }
  clearTimeout(closeFavoriteReportsTimeout);
  clearTimeout(openFavoriteReportsTimeout);
  openFavoriteReportsTimeout=setTimeout('dijit.byId("listFavoriteReports_'+idFavoriteRow+'").openDropDown()',popupOpenDelay);
}

function hideReportFavoriteTooltip(delay, idFavoriteRow) {
  if(!idFavoriteRow)idFavoriteRow=1;
  if (!dijit.byId("listFavoriteReports_"+idFavoriteRow)) return;
  clearTimeout(closeFavoriteReportsTimeout);
  clearTimeout(openFavoriteReportsTimeout);
  closeFavoriteReportsTimeout=setTimeout('dijit.byId("listFavoriteReports_'+idFavoriteRow+'").closeDropDown()',delay);
}

function removeFavoriteReport(id, idFavoriteRow) {
var callBack=function() { refreshFavoriteReportList(idFavoriteRow);};
dojo.xhrGet({
 url: '../tool/removeFavoriteReport.php?idFavorite='+id+'&csrfToken='+csrfToken,
 handleAs : "text",
 load: callBack
});
}

function reorderFavoriteReportItems() {
var nodeList=dndFavoriteReports.getAllNodes();
var param="";
for (var i=0; i < nodeList.length; i++) {
 var domNode=nodeList[i];
 var item=nodeList[i].id.substr(11);
 var order=dojo.byId("favoriteReportOrder" + item);
 if (dojo.hasClass(domNode,'dojoDndItemAnchor')) {
   order.value=null;
   dojo.removeClass(domNode,'dojoDndItemAnchor');
   dojo.query('dojoDndItemAnchor').removeClass('dojoDndItemAnchor');
   // continue;
 }
 if (order) {
   order.value=i + 1;
   param+=((param)?'&':'?')+"favoriteReportOrder"+item+"="+(i+1);
 }
}
dojo.xhrPost({
 url: '../tool/saveReportFavoriteOrder.php'+param+'&csrfToken='+csrfToken,
 handleAs: "text",
 load: function(data,args) {
   refreshFavoriteReportList(); 
 }
});
}

function checkEmptyReportFavoriteTooltip(idFavoriteRow) {
if(!idFavoriteRow)idFavoriteRow=1;
var listContent=trim(dijit.byId('favoriteReports_'+idFavoriteRow).get('content'));
if (listContent=="") {
 dijit.byId("listFavoriteReports_"+idFavoriteRow).closeDropDown();
}
}

// =============================================================================
// = Linked Object by id to main object
// =============================================================================

function addLinkObjectToObject(mainObjectClassName, idOfInstanceOfMainClass, linkObjectClassName) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  if (typeof dojo.byId('linkedObjectId') !== 'undefined') {
    var node = document.getElementById("linkedObjectId");
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  refreshLinkObjectList(0,mainObjectClassName, linkObjectClassName);
  dijit.byId("dialogObject").show();

  dojo.byId("mainObjectClass").value = mainObjectClassName;
  dojo.byId("idInstanceOfMainClass").value = idOfInstanceOfMainClass;
  dojo.byId("linkObjectClassName").value = linkObjectClassName;

  disableWidget('dialogObjectSubmit');
}

function saveLinkObject() {  
  var param="";  
  var nbSelected=0;
  if (dojo.byId("linkedObjectId").value == "") {
      return;
  }
  list=dojo.byId("linkedObjectId");
  if (list.options) {
    selected=new Array();
    for (var i=0; i < list.options.length; i++) {
      if (list.options[i].selected) {
        selected.push(list.options[i].value);
        nbSelected++;
      }
    }
  }  
  param="?linkedObjectId="+selected;
  param+="&mainObjectClass="+dojo.byId('mainObjectClass').value;
  param+="&idInstanceOfMainClass="+dojo.byId('idInstanceOfMainClass').value;
  param+="&linkObjectClassName="+dojo.byId('linkObjectClassName').value;
  loadContent("../tool/saveObjectLinkedByIdToMainObject.php"+param, "resultDivMain", "objectFormDialog", true, 'linkObject');
  dijit.byId('dialogObject').hide();
}

function removeLinkObjectFromObject(mainObjectClassName, linkObjectClassName, idLinkObject, nameLinkObject) {
  var param="?mainObjectClassName="+mainObjectClassName;
  param+="&linkObjectClassName="+linkObjectClassName;
  param+="&idLinkObject="+idLinkObject;

if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }

  actionOK=function() {
    loadContent("../tool/removeObjectLinkedByIdToMainObject.php"+param, "resultDivMain", "objectForm", true, 'linkObject');
  };

  msg=i18n('confirmRemoveLinkObjFromObj') + '<br/>' + nameLinkObject;
  showConfirm(msg, actionOK);
}

function refreshLinkObjectList(selected, mainObjectClassName, linkObjectClassName) {
  var param='';  
  selected = typeof selected !== 'undefined' ? selected : 0;
  mainObjectClassName = typeof mainObjectClassName !== 'undefined' ? mainObjectClassName : '';
  linkObjectClassName = typeof linkObjectClassName !== 'undefined' ? linkObjectClassName : '';
  disableWidget('dialogObjectSubmit');
  var url='../tool/dynamicListObjectLinkedByIdToMainObject.php';
  param='?selected=' + selected;    
  if (mainObjectClassName!='') {
    param+='&mainObjectClass=' + mainObjectClassName;      
  }
  if (linkObjectClassName!='') {
    param+='&linkObjectClassName=' + linkObjectClassName;      
  }
  url+=param;
  loadContent(url, 'dialogObjectList', 'objectForm', false);
  selectLinkObjectItem();
}

function selectLinkObjectItem() {
  var nbSelected=0;
  list=dojo.byId('linkedObjectId');
  if (list.options) {
    for (var i=0; i < list.options.length; i++) {
      if (list.options[i].selected) {
        nbSelected++;
      }
    }
  }
  if (nbSelected > 0) {
    enableWidget('dialogObjectSubmit');
  } else {
    disableWidget('dialogObjectSubmit');
  }
}
function saveChangedStatusObject() {
    list=dojo.byId("changeStatusId");
    if (list.options) {
      selected=0;
      for (var i=0; i < list.options.length; i++) {
        if (list.options[i].selected) {
          selected=list.options[i].value;
          i = list.options.length+10;
        }
      }
      var objectClass = dojo.byId("objectClassChangeStatus").value;
      var objectId = dojo.byId("idInstanceOfClassChangeStatus").value;   
      url = "";
      param="?newStatusId="+selected;
      param+="&objectClass="+objectClass;
      param+="&idInstanceOfClass="+objectId;
      loadContent("../tool/changeObjectStatus.php"+param, "resultDivMain", "objectForm", true, objectClass);
      dijit.byId('dialogChangeStatus').hide();
    }  
}

function selectChangeStatusItem() {
  var nbSelected=0;
  list=dojo.byId('changeStatusId');
  if (list.options) {
    for (var i=0; i < list.options.length; i++) {
      if (list.options[i].selected) {
        nbSelected=1;
        break;
      }
    }
  }
  if (nbSelected > 0) {
    enableWidget('dialogChangeStatusSubmit');
  } else {
    disableWidget('dialogChangeStatusSubmit');
  }
}

function changeObjectStatus(objClass, objId, objTypeId, objStatusId) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  
  // empty select of previous options
  if (typeof dojo.byId('changeStatusId') !== 'undefined') {
    var node = document.getElementById("changeStatusId");
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  
  var param='';
    
  disableWidget('dialogChangeStatusSubmit');
  var url='../tool/dynamicListChangeStatus.php';

  param = '?objectId=' + objId;
  param += '&objectClass=' + objClass;
  param += '&idType=' + objTypeId;
  param += '&idStatus=' + objStatusId;

  url+=param;
  loadContent(url, 'dialogChangeStatusList', 'changeStatusForm', false);
  selectChangeStatusItem();

  dijit.byId("dialogChangeStatus").show();

  dojo.byId("objectClassChangeStatus").value = objClass;
  dojo.byId("idInstanceOfClassChangeStatus").value = objId;
  dojo.byId("idStatusOfInstanceOfClassChangeStatus").value = objStatusId;
  dojo.byId("idTypeOfInstanceOfClassChangeStatus").value = objTypeId;
}

function changeStatusNotification(objId, objStatusId) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  
  if (objStatusId == 1) { newStatusId = 2; } else { newStatusId = 1;}
  param="?newStatusId="+newStatusId;
  param+="&idInstanceOfClass="+objId;

  loadContent("../tool/changeStatusNotification.php"+param, "resultDivMain", "objectForm", true, "Notification");
  refreshNotificationTree(false);
}
 
// =============================================================================
// = Misceallanous
// =============================================================================

var manualWindow=null;
var helpTimer=false;
function showHelp(link) {
  if (helpTimer) return; // avoid double open
  helpTimer=true;
  if (manualWindow) manualWindow.close();
  var objectClass=(dojo.byId('objectClassList'))?dojo.byId('objectClassList'):dojo.byId('objectClass');
  var objectClassManual=dojo.byId('objectClassManual');
  var section='';
  var selectedTab=(dijit.byId('parameterTabContainer'))?dijit.byId('parameterTabContainer').selectedChildWidget.get("id"):null;
  if (objectClassManual) {
    section=objectClassManual.value;
  } else if (objectClass) {
    section=objectClass.value;
  }
  if(link == 'ShortCut'){
    section = link;
  }else if(link == 'Client'){
    section = link;
  }else if(link == 'Contact'){
    section = link;
  }else if(link == 'Resource'){
    section = link; 
  }else if(link == 'User'){
    section = link;
  }else if(link == 'Project'){
    section = link;
  }else if(link == 'Affectation'){
    section = link;
  }else if(link == 'Activity'){
    section = link;
  }else if(link == 'Milestone'){
    section = link;
  }else if(link == 'Planning'){
    section = link;
  }else if(link == 'Imputation'){
    section = link; 
  }else if(link == 'Ticket'){
    section = link;  
  }
  
//  if(link == 'ShortCut'){
//    section = link;
//  }

  dojo.xhrGet({
    url : "../tool/getManualUrl.php?section=" + section+"&tab="+selectedTab+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data, args) {
      var url=data;
      var name="Manual";
      var attributes='toolbar=yes, titlebar=no, menubar=no, status=no, scrollbars=yes, directories=no, location=no, resizable=yes,'
          + 'height=650, width=1024, top=0, left=0';
      manualWindow=window.open(url, name, attributes);
      manualWindow.focus();
    },
    error : function() {
      consoleTraceLog("Error retrieving Manual URL for section '"+section+"'");
    }
  });
  setTimeout("helpTimer=false;",1000);
  return false;
}
/**
 * Refresh a list (after update)
 */
function refreshList(field, param, paramVal, selected, destination, required, param1, paramVal1,objectClass) {
  var urlList='../tool/jsonList.php?listType=list&dataType=' + field+'&csrfToken='+csrfToken;
  if (param) {
    urlList+='&critField=' + param;
    urlList+='&critValue=' + paramVal;
    if(Array.isArray(paramVal)) {
      urlList += '&critArray=1';
    }
  }
  if (param1) {
    urlList+='&critField1=' + param1;
    urlList+='&critValue1=' + paramVal1;
  }
  if (selected && field!='planning') {
    urlList+='&selected=' + selected;
  }
  if (required || Array.isArray(paramVal)) {
    urlList+='&required=true';
  }
  if (objectClass) urlList+='&objectClass='+objectClass;
  if (destination=='idProjectPlan') {
      urlList+='&withoutLeaveProject=1';
  }
  if (directAccessIndex) {
    urlList += "&directAccessIndex=" + directAccessIndex;
  }
  var datastore=new dojo.data.ItemFileReadStore({
    url : urlList+'&csrfToken='+csrfToken
  });
  
  var store=new dojo.store.DataStore({
    store : datastore
  });
  if (destination) {
    var mySelect=dijit.byId(destination);
  } else {
    var mySelect=dijit.byId(field);
  }
  // mySelect.set('store', store);
  mySelect.set({labelAttr: 'name', store: store, sortByLabel: false});
  store.query({
    id : "*"
  }).then(function(items) {
    if (destination) {
      var mySelect=dijit.byId(destination);
    } else {
      var mySelect=dijit.byId(field);
    }
    if (required && ! selected && ! trim(mySelect.get('value')) ) { // required
                                                                    // but no
                                                                    // value set
                                                                    // : select
                                                                    // first
      mySelect.set("value", items[0].id);
    }
    if (selected) { // Check that selected is in the list
      var found=false;
      items.forEach(function(item) {
        if(Array.isArray(selected)==false){
          if(Number.isInteger(selected)==true)selected=selected.toString();
          selectionList=selected.split('_');
        }else{
          selectionList=selected;
        }
        if (selectionList.includes(item.id)) found=true;
      });
      if (! found) mySelect.set("value", items[0].id);
    }
    
    if (field=='planning') {
      mySelect.set("value",selected); 
    }
    if(destination){
      if(destination.substr(0,15)=='filterValueList' || destination=='multipleUpdateValueList') {
        var list=dojo.byId(destination);
        if(Array.isArray(selected)==false){
          if(Number.isInteger(selected)==true)selected=selected.toString();
          selectionList=selected.split('_');
        }else{
          selectionList=selected;
        }
        // while (list.options.length) {list.remove(0);} // Clean combo
        items.forEach(function(item) {
          if (!item.name || item.id==' ' || item.name==selected) {
          } else {
            if (selectionList.indexOf(item.id)>=0 && 1) {
              var found=false;
              for (var i=0;i<list.options.length;i++) { if (list.options[i].value==item.id) found=true; }
              if (!found) {
                var option = document.createElement("option");
                option.text = item.name;
                option.value = item.id;
                option.selected=true;
                list.add(option);
              }
            }
          }
        });
      }
    }
  });
}

function refreshListSpecific(listType, destination, param, paramVal, selected, required) {
  var urlList='../tool/jsonList.php?listType=' + listType;
  if (param) {
    urlList+='&' + param + '=' + paramVal;
  }
  if (selected) {
    urlList+='&selected=' + selected;
  }
  if (required) {
    urlList+='&required=true';
  }
  if (directAccessIndex) {
    urlList += "&directAccessIndex=" + directAccessIndex;
  }
  var datastore=new dojo.data.ItemFileReadStore({
    url : urlList+'&csrfToken='+csrfToken
  });
  var store=new dojo.store.DataStore({
    store : datastore
  });
  store.query({
    id : "*"
  });
  
  var mySelect=dijit.byId(destination);
  mySelect.set('store', store);
}

function setClientValueFromProject(field, projectId) {
  dojo.xhrGet({
    url : "../tool/getClientValueFromProject.php?idProject=" + projectId+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data, args) {
      client=dijit.byId(field);
      if (client && data) {
        client.set("value", data);
      }
    },
    error : function() {
    }
  });
}

var menuHidden=false;
var menuActualStatus='visible';
var menuDivSize=0;
var menuShowMode='CLICK';
var hideShowMenuInProgress=false;
var hideShowTries=0;
/**
 * Hide or show the Menu (left part of the screen
 */
function hideShowMenu(noRefresh,noStore) {
  if(isNewGui)return;
  var disableSlide=true;
  if (!dijit.byId("leftDiv")) {
    return;
  }
  if (!dijit.byId("leftDiv") || !dijit.byId("centerDiv") || !dijit.byId("leftDiv_splitter")) {
    hideShowTries++;
    if (hideShowTries<10) setTimeout("hideShowMenu();",100);
    return;
  }
  hideShowTries=0;
  hideShowMenuInProgress=true;
  duration=1;
  if (menuActualStatus == 'visible' || !menuHidden) {
    saveDataToSession("hideMenu","YES",true);
    if (!noStore) menuDivSize=dojo.byId("leftDiv").offsetWidth;
    fullWidth=dojo.byId("mainDiv").offsetWidth;
    if (menuDivSize < 2) {
      menuDivSize=dojo.byId("mainDiv").offsetWidth * .2;
    }
    if (disableSlide || !isHtml5()) {
      duration=0;
      dojo.byId('menuBarShow').style.display='block';
      dojo.byId('leftDiv_splitter').style.display='none';
      dijit.byId("leftDiv").resize({
        w : dojo.byId("menuBarShow").offsetWidth
      });
    } else {
      dojox.fx.combine([ dojox.fx.animateProperty({
        node : "leftDiv",
        properties : {
          width : 34
        },
        duration : duration
      }), dojox.fx.animateProperty({
        node : "centerDiv",
        properties : {
          left : 45,
          width : fullWidth
        },
        duration : duration
      }), dojox.fx.animateProperty({
        node : "leftDiv_splitter",
        properties : {
          left : 31
        },
        duration : duration
      }) ]).play();
      setTimeout("dojo.byId('menuBarShow').style.display='block'", duration);
      setTimeout("dojo.byId('leftDiv_splitter').style.display='none';",duration);
    }
    menuHidden=true;
    menuActualStatus='hidden'; 
    dojo.byId('hideMenuBarShowButton2').style.display='none';
  } else {
    saveDataToSession("hideMenu","NO",true);  
    if (menuDivSize < 20) {
      menuDivSize=dojo.byId("mainDiv").offsetWidth * .2;
    }
    if (disableSlide || !isHtml5()) {
      duration=0;
      dijit.byId("leftDiv").resize({
        w : menuDivSize
      });
      dojo.byId('menuBarShow').style.display='none';
      dojo.byId('leftDiv_splitter').style.left='20px';
      dojo.byId('leftDiv_splitter').style.display='block';
    } else {
      dojox.fx.combine([ dojox.fx.animateProperty({
        node : "leftDiv",
        properties : {
          width : menuDivSize
        },
        duration : duration
      }), dojox.fx.animateProperty({
        node : "centerDiv",
        properties : {
          left : menuDivSize + 5
        },
        duration : duration
      }), dojox.fx.animateProperty({
        node : "leftDiv_splitter",
        properties : {
          left : menuDivSize
        },
        duration : duration
      }) ]).play();
      dojo.byId('menuBarShow').style.display='none';
      dojo.byId('leftDiv_splitter').style.left='20px';
      dojo.byId('leftDiv_splitter').style.display='block';
    }
    menuHidden=false;
    menuActualStatus='visible';
    dojo.byId('hideMenuBarShowButton2').style.display='block';
  }
  setTimeout('dijit.byId("globalContainer").resize();', duration + 10);
  var detailHidden=false;
  if (dojo.byId('detailBarShow') && dojo.byId('detailBarShow').style.display=='block') detailHidden=true;
  if (!noRefresh && !formChangeInProgress && dojo.byId('id') && dojo.byId('id').value && !detailHidden) {
    setTimeout('loadContent("objectDetail.php", "detailDiv", "listForm");',
        duration + 50);
  }
  setTimeout("hideShowMenuInProgress=false;",duration+50);
  dojo.byId("hideMenuBarShowButton2").style.left=dojo.byId("leftDiv").offsetWidth+3+"px";
}

function hideMenuBarShowMode() {
  hideShowMenu(false);
  dijit.byId("iconMenuUserScreen").closeDropDown();
}

function hideMenuBarShowModeTop(){ 
  if(dojo.byId('statusBarDiv').style.height == '0px'){
    saveDataToSession("hideMenuTop","NO",true);
    dojo.byId('statusBarDiv').style.height="48px";
    dojo.byId('statusBarDiv').style.padding="1px";
    dojo.byId('leftDiv').style.top='82px';
    dojo.byId('centerDiv').style.top='82px';
    dojo.byId('menuBarShow').style.top='82px';
    var height=parseInt(dojo.byId('mainDiv').offsetHeight)-82;
    dijit.byId('centerDiv').resize({h:height});
    dijit.byId('leftDiv').resize({h:height});
    if(dojo.byId('menuBarShow').style.display=='none' || dojo.byId('menuBarShow').style.display == ''){
      dojo.byId('leftDiv_splitter').style.top='82px';
      var height = dojo.byId("leftDiv").offsetHeight+50;
      dojo.byId('leftDiv_splitter').style.height=height+'px';
    }
  }else{
    saveDataToSession("hideMenuTop","YES",true);
    // dojo.byId('statusBarDiv').style.display='none';
    dojo.byId('statusBarDiv').style.height="0px";
    dojo.byId('statusBarDiv').style.padding="0px";
    dojo.byId('leftDiv').style.top='30px';
    dojo.byId('centerDiv').style.top='30px';
    dojo.byId('menuBarShow').style.top='30px';
    var height=parseInt(dojo.byId('mainDiv').offsetHeight)-30;
    dijit.byId('centerDiv').resize({h:height});
    dijit.byId('leftDiv').resize({h:height});
    if(dojo.byId('menuBarShow').style.display=='none' || dojo.byId('menuBarShow').style.display == '' ){
      dojo.byId('leftDiv_splitter').style.top='32px';
      var height = dojo.byId("leftDiv").offsetHeight;
      dojo.byId('leftDiv_splitter').style.height=height+'px';
    }
    if(switchedMode==true){
      switchModeOn();
    }
  }
  dijit.byId("iconMenuUserScreen").closeDropDown();
}

function menuClick() {
  if (menuHidden) {
    menuHidden=false;
    hideShowMenu(true);
    menuHidden=true;
  }
}

var switchedMode=false;
var loadingContentDiv=false;
var listDivSize=0;
var switchedVisible='';
var switchListMode='CLICK';

function switchModeOn(objectIdScreen){
  switchedMode=true;
  // saveDataToSession('coversListPlan', 'CLOSE', true)
  if (!dojo.byId("listDiv")) {
    if (listDivSize == 0) {
      listDivSize=dojo.byId("centerDiv").offsetHeight * .4;
    }
    return;
  } else {
    listDivSize=dojo.byId("listDiv").offsetHeight;
  }
  if (dojo.byId('listDiv_splitter')) {
    dojo.byId('listDiv_splitter').style.display='none';
  }
  if (dijit.byId('id')) {
    hideList();
  } else {
    loadingContentDiv=false;
    showList();
  }
}

function switchModeOff(){
  switchedMode=false;
  if (!dojo.byId("listDiv")) {
    return;
  }
  if (dojo.byId('listBarShow')) {
    dojo.byId('listBarShow').style.display='none';
  }
  if (dojo.byId('detailBarShow')) {
    dojo.byId('detailBarShow').style.display='none';
  }
  if (dojo.byId('listDiv_splitter')) {
    dojo.byId('listDiv_splitter').style.display='block';
  }
  if (listDivSize == 0) {
    listDivSize=dojo.byId("centerDiv").offsetHeight * .4;
  }
  dijit.byId("listDiv").resize({
    h : listDivSize
  });
  dijit.byId("mainDivContainer").resize();
}

function switchModeLayout(paramToSend,notGlobal){
  if(dojo.byId('objectClass') && dojo.byId('objectClass').value!='Work' && dojo.byId('objectClass').value!=''){
    var currentObject=dojo.byId('objectClass').value;
    var currentScreen=(dojo.byId('objectClassManual'))?dojo.byId('objectClassManual').value:'Object';
  }else{
    showInfo(i18n("alertIncorrectScreenSwitch"));
    return;
  }
  if(checkFormChangeInProgress()){
    return;
  }
  var objectIdScreen=dojo.byId('objectId').value;
  var currentItem=historyTable[historyPosition];
  if (currentItem && currentItem!='undefined' && currentItem.length>2) currentScreen=currentItem[2];
  if(currentScreen=='Reports'){
    return false;
  }
  if (paramToSend=='top' || paramToSend=='left'){
      var screen=(dojo.byId('objectClassManual'))?currentScreen  : currentObject;
      var paramDiv=(!notGlobal)?'paramScreen':'paramScreen_'+screen;
      if(switchedMode==true){
        paramDiv='paramScreen';
        notGlobal=false;
        switchModeOff();
      }
      switchModeLoad(currentScreen,currentObject,paramDiv,paramToSend,objectIdScreen,notGlobal);
      setActionCoverListNonObj ('CLOSE',true);
  }else if(paramToSend=='bottom' || paramToSend=='trailing'){
    var screen=(dojo.byId('objectClassManual'))?currentScreen  : currentObject;
    var paramDiv=(!notGlobal)?'paramRightDiv':'paramRightDiv_'+screen;
    switchModeLoad(currentScreen,currentObject,paramDiv,paramToSend,objectIdScreen,notGlobal);
  }else if(paramToSend=='col' || paramToSend=='tab'){
    var paramDiv='paramLayoutObjectDetail';
    switchModeLoad(currentScreen,currentObject,paramDiv,paramToSend,objectIdScreen,notGlobal);
  }else if (paramToSend=='switch'){
    notGlobal=false;
    var paramDiv='paramScreen';
    if(objectIdScreen!=null){
      loadingContentDiv=true;
    }
    switchModeLoad(currentScreen,currentObject,paramDiv,paramToSend,objectIdScreen,notGlobal);
    switchModeOn(objectIdScreen);
  }
  dijit.byId('iconMenuUserScreen').closeDropDown();
}

function switchModeLoad(currentScreen,currentObject,paramDiv,paramToSend,objectIdScreen,notGlobal){
  // var urlParams="?objectClass="+
  // currentObject+"&"+paramDiv+"="+paramToSend+"&objectId="+objectIdScreen;
  var notGlob=(notGlobal)?"&notGlobal=true":"&notGlobal=false";
  var urlParams="?"+paramDiv+"="+paramToSend;
  if (currentObject) urlParams+="&objectClass="+ currentObject;
  if (objectIdScreen) urlParams+="&objectId="+objectIdScreen;
  var urlPage="objectMain.php";
  if(currentScreen=='Planning'){
    urlPage="planningMain.php";
  }else if(currentScreen=='GlobalPlanning'){
    urlPage="globalPlanningMain.php";
  }else if(currentScreen=='PortfolioPlanning' ){
    urlPage="portfolioPlanningMain.php";
  }else if(currentScreen=='ResourcePlanning') {
    urlPage="resourcePlanningMain.php";
  }else if(currentScreen=='VersionsPlanning') {
    var productVersionsListId=dojo.byId('productVersionsListId').value;
    urlPage="versionsPlanningMain.php";
    urlParams+="&productVersionsListId="+productVersionsListId;
  }else if(currentScreen=='ContractGantt') {
    urlPage="contractGanttMain.php";
  }else if(currentScreen=='HierarchicalBudget') {
    urlPage="hierarchicalBudgetMain.php";
  }else if(currentScreen=='ResourceSkill') {
    urlPage="resourceSkillMain.php";
  }else if(currentScreen=='HierarchicalSkill'){
    urlPage="hierarchicalSkillMain.php";
  }
  var param="";
  if(urlPage!="objectMain.php"){
    currentObject=currentScreen;
    param ="?planningType="+currentScreen;
  }
  var callBack=null;
  if(objectIdScreen !=''){
    callBack=function(){loadContent("objectDetail.php"+param, "detailDiv", 'listForm');};
  }
  if (dojo.byId('objectClass') && (dojo.byId('objectClass').value || urlPage!="objectMain.php")) {loadContent(urlPage+urlParams+notGlob, "centerDiv",null,null,null,null,null,callBack);}
  if(!notGlobal)loadDiv("menuUserScreenOrganization.php?currentScreen="+currentScreen+"&"+paramDiv+"="+paramToSend,"mainDivMenu");
}

var listDivWidth=0;
function setActionCoverListNonObj (action,changePose){
  if(coverListAction==action)return;
  coverListAction=action;
  if(dijit.byId('id') && changePose){
    coverListAction='OPEN';
  }
  saveDataToSession('coversListPlan', coverListAction, true);
}

var detailDivScreenWidth=400;
var detailDivScreenHeight=400;
function hideDetailScreen(){
  if (checkFormChangeInProgress()) {
    return;
  }
  unselectPlanningLines();
  if(coverListAction!='CLOSE')setActionCoverListNonObj('CLOSE',false);
  duration=300;
  detailRightDivName=(dijit.byId("detailRightDiv"))?'detailRightDiv':'detailRightDivAlt';
  if (dojo.attr(dojo.byId("listDiv"),"region")=='top'){
    fullSize=dojo.byId("listDiv").offsetHeight + dojo.byId("contentDetailDiv").offsetHeight+5 ;
    detailDivScreenHeight=dojo.byId("contentDetailDiv").offsetHeight;   
    if ( !isHtml5()) {
      dijit.byId("listDiv").resize({
        h : fullSize
      });
      dijit.byId("contentDetailDiv").resize({
        h : 0
      });
      dijit.byId("detailRightDiv").resize({
        h : 0
      });
      duration=0;
    } else {
      dojox.fx.combine([
        dojox.fx.animateProperty({
          node : "listDiv",
          properties : {
            height : fullSize
          },
          duration : duration
        }),
        dojox.fx.animateProperty({
          node : "contentDetailDiv",
          properties : {
            height : 0
          },
          duration : duration
        }),
        dojox.fx.animateProperty({
          node : detailRightDivName,
          properties : {
            height : 0
          },
          duration : duration
        })
        
      ]).play();
    }
  }else{
    detailDivScreenWidth=dojo.byId("contentDetailDiv").offsetWidth;
    fullSize=dojo.byId("centerDiv").offsetWidth+5 ;
    if (!isHtml5()) {
      dijit.byId("listDiv").resize({
        w : fullSize
      });
      dijit.byId("contentDetailDiv").resize({
        w : 0
      });
      duration=0;
    } else {
      dojox.fx.combine([
        dojox.fx.animateProperty({
          node : "listDiv",
          properties : {
            width : fullSize
          },
          duration : duration
        }),
        dojox.fx.animateProperty({
          node : "contentDetailDiv",
          properties : {
            width : 0
          },
          duration : duration
        })
        ]).play();
    }
  }
  resizeContainer("mainDivContainer", duration);
}

var ShowDetailScreenRun=false;
var showActivityStreamVar=false;
function ShowDetailScreen(){
  ShowDetailScreenRun=true;
  var displayAnotherDetail=false;
  var currentItem=historyTable[historyPosition];
  if (!currentItem || undoItemButtonRun || redoItemButtonRun || (currentItem && dojo.byId('objectId') && dojo.byId('objectClass')  && ((dojo.byId('objectClass').value == currentItem[0] && dojo.byId('objectId').value != currentItem[1]) || dojo.byId('objectClass').value != currentItem[0] ))) {
    displayAnotherDetail=true;
    dojo.byId('detailDiv').style.display="none";
  }
  if(undoItemButtonRun)undoItemButtonRun=false;
  if(redoItemButtonRun)redoItemButtonRun=false;

  setActionCoverListNonObj('OPEN',false);
  paramMode=(dojo.byId("listDiv"))?dojo.attr(dojo.byId("listDiv"),"region"):'';
  paramDiv=(dojo.byId("listDiv"))?dojo.attr(dojo.byId("listDiv"),"region"):'';
  paramRightDiv=(dojo.byId("detailRightDiv"))?dojo.attr(dojo.byId("detailRightDiv"),"region"):'';
  
  var callBack=null;
  // PBER : force reload of detail on every opening in Gantt mode
  //if(displayAnotherDetail){
  if (1) {  
    callBack = function(){
      callBFunc=function(){
        dojo.byId("detailDiv").style.display="block";
        resizeContainer("detailDiv", null);
      };
      loadContent("objectDetail.php?planning=true&planningType="+currentItem[0],"detailDiv","listForm",null,null,null,null,callBFunc);
    };
  }
  
  checkValidatedSize(paramDiv,paramRightDiv, paramMode,'true',callBack);
  if(dojo.byId('detailRightDiv') && dojo.byId('detailRightDiv').offsetHeight>10){
    showActivityStreamVar=true;
  }

}

var switchModeSkipAnimation=true;
function showList(mode, skipAnimation) {
  duration=300;
  if (switchModeSkipAnimation) {
    skipAnimation=true;
    duration=0;
  }
  if (mode == 'mouse' && switchListMode == 'CLICK')
    return;
  if (!switchedMode) {
    return;
  }
  if (!dijit.byId("listDiv") || !dijit.byId("mainDivContainer")) {
    return;
  }
  if (dojo.byId('listDiv_splitter')) {
    setTimeout("dojo.byId('listDiv_splitter').style.display='none';",duration+50);
  }
  if (dojo.byId('listBarShow')) {
    setTimeout("dojo.byId('listBarShow').style.display='none';",duration+50);
  }
  correction=0;
  if (dojo.byId("listDiv").offsetHeight > 100)
    correction=5;
  fullSize=dojo.byId("listDiv").offsetHeight
      + dojo.byId("contentDetailDiv").offsetHeight -20+correction;
  if (!mode && ! dijit.byId('objectGrid')) fullSize-=8;
  if (skipAnimation || !isHtml5()) {
    dijit.byId("listDiv").resize({
      h : fullSize
    });
    duration=0;
  } else {
    dojox.fx.animateProperty({
      node : "listDiv",
      properties : {
        height : fullSize
      },
      duration : duration
    }).play();
  }
  if (dojo.byId('detailBarShow')) {
    setTimeout("dojo.byId('detailBarShow').style.display='block';",
        duration + 50);
  }
  resizeContainer("mainDivContainer", duration);
  switchedVisible='list';
}

function hideList(mode, skipAnimation) {
  duration=300; 
  if (mode == 'mouse' && switchListMode == 'CLICK'){
    return;
  }
  if (!switchedMode) {
    return;
  }
  if (!dijit.byId("listDiv") || !dijit.byId("mainDivContainer")) {
    return;
  }
  if (skipAnimation && dijit.byId("detailDiv")) {
    dijit.byId("detailDiv").set('content', '');
  }
  if (switchModeSkipAnimation) {
    skipAnimation=true;
    duration=0;
  }
  if (dojo.byId('listDiv_splitter')) {
    dojo.byId('listDiv_splitter').style.display='none';
  }
  if (dojo.byId('listBarShow')) {
    setTimeout("dojo.byId('listBarShow').style.display='block';",duration+50);
  }
  if (dojo.byId('detailBarShow')) {
    setTimeout("dojo.byId('detailBarShow').style.display='none';",duration+50);
  }
  if (!isHtml5() || skipAnimation) {
    dijit.byId("listDiv").resize({
      h : 20
    });
    duration=0;
  } else {
    dojox.fx.combine([ dojox.fx.animateProperty({
      node : "listDiv",
      properties : {
        height : 20
      },
      duration : duration
    }) ]).play();
  }
  resizeContainer("mainDivContainer", duration);
  switchedVisible='detail';
}

function resizeContainer(container, duration) {
  sequ=10;
  if (!dijit.byId(container)) return;
  if (duration) {
    for (var i=0; i < sequ; i++) {
      setTimeout('dijit.byId("' + container + '").resize();', i * duration / sequ);
    }
  }
  setTimeout('dijit.byId("' + container + '").resize();', duration + 10);
}

function listClick() {
  // stockHistory(dojo.byId('objectClass').value, dojo.byId('objectId').value);
  if (!switchedMode ) {
    return;
  }
  setTimeout("hideList(null,true);", 1);
}

function consoleLogHistory(msg) {
  consoleTraceLog('====='+msg+'==== ('+historyTable.length+')');
  if (historyTable.length==0) {
    consoleTraceLog(msg+' => Empty');
  }
  for (var i=0;i<historyTable.length;i++) {
    current=historyTable[i];
    consoleTraceLog(msg+' => '+current[0]+ ' | '+current[1]+' | '+current[2]);
  }
}

function stockHistory(curClass, curId, currentScreen) {
  if (!currentScreen) {
    currentScreen="object";
    if (dojo.byId("objectClassManual")){
      currentScreen=dojo.byId("objectClassManual").value;
    }
  }
  if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value=='GlobalView' && curId) {
    curId=curClass+'|'+parseInt(curId);
    curClass=dojo.byId('objectClassList').value;
  }
  if (historyPosition>=0) {
    current=historyTable[historyPosition];
    if (current[0]==curClass && current[1]==curId && current[2]==currentScreen) return; // do not re-stock current item
    if (current[0]==curClass && current[1]==null && current[2]==currentScreen) historyPosition-=1; // previous is same class but with no selection, will overwrite
    if (current[0]==curClass && current[1]==curId && current[2]=='Planning' && currentScreen=='object') historyPosition-=1; // previous is same class but with no selection, will overwrite
  }
  historyPosition+=1;
  historyTable[historyPosition]=new Array(curClass, curId,currentScreen);
  // Purge next history (not valid any more)
  for (var i=historyPosition+1;i<historyTable.length;i++) {
    historyTable.splice(i,1); 
  }
  if (historyPosition > 0) {
    enableWidget('menuBarUndoButton');
  }
  if (historyPosition == historyTable.length - 1) {
    disableWidget('menuBarRedoButton');
  }
}

var undoItemButtonRun=false;
var redoItemButtonRun=false;
function undoRedoItemButton(action) {
  if (checkFormChangeInProgress()) {
    return ;
  }
  var len=historyTable.length;
  if (len == 0) {
    return;
  }
  if(action=='redo'){
    redoItemButtonRun=true;
    if (historyPosition == len - 1) {
      return;
    }
    historyPosition+=1;
  }
  if(action=='undo'){
    undoItemButtonRun=true;
    if (historyPosition == 0) {
      return;
    }
    historyPosition-=1;
  }
  var currentItem=historyTable[historyPosition];
  var currentScreen=currentItem[2];
  var target="";
  if (currentScreen=="object" && currentItem[1]!=null){
    gotoElement(currentItem[0], currentItem[1], true, false, currentScreen);
  }else if (currentScreen=="object") {
    loadContent("objectMain.php?objectClass=" + currentItem[0],"centerDiv");
    // gautier #3413
  } else if (currentScreen=="Planning" && currentItem[1]!=null){ 
    gotoElement(currentItem[0], currentItem[1], false, false, "planning");
  }else if(currentScreen=='ConsultationValidation'){
    loadMenuBarItem('ConsultationValidation','menuConsultationValidation','bar');
  }else if(currentScreen=='ViewAllSubTask'){
    loadMenuBarItem('ViewAllSubTask','menuViewAllSubTask','bar');
  }else if(currentScreen=='GanttSupplierContract' || currentScreen=='GanttClientContract' || currentScreen=='ContractGantt' || currentScreen=="HierarchicalBudget" || currentScreen=="HierarchicalSkill" ){
    if(currentScreen=="HierarchicalBudget")page="hierarchicalBudgetMain.php";
    else if (currentScreen=='GanttSupplierContract' || currentScreen=='GanttClientContract' || currentScreen=='ContractGantt')page="contractGanttMain.php";
    else page="hierarchicalSkillMain.php";
    var classEl=currentItem[0];
    if(currentItem[0]==currentScreen){
      loadMenuBarItem(currentScreen,'menu'+currentScreen,'bar');
    }else{
      var param="?objectClass="+currentItem[0];
      var callB=null;
      if(currentItem[1]!=null){
        param+="&objectId="+currentItem[1];
        callB=function(){
          loadContent('objectDetail.php', 'detailDiv', 'listForm');
        };
      }
        objectExist='true';
        vGanttCurrentLine=-1;
        cleanContent("centerDiv");
        loadContent(page+param, "centerDiv",null,null,null,null,null,callB);

    }
  } else if (currentScreen=="LiveMeeting" && currentItem[1]!=null){
    loadContent("../view/liveMeetingView.php?idMeeting="+currentItem[1]+"&saveDescription=false", "centerDiv");
  } else if (currentScreen=="Reports" && currentItem[1]!=null) {
    var executeNow=function() {
      dojo.byId('outMode').value='';
      if (currentItem.length>3) {
        params=currentItem[3];
        listParams=params.split('|');
        for (var i=0;i<listParams.length;i++) {
          par=listParams[i].split('=');
          field=par[0];
          value=par[1];
          if (dijit.byId(field)) {
            if (dijit.byId(field).declaredClass=='dijit.form.DateTextBox') dijit.byId(field).set('displayedValue',value);
            else if (dijit.byId(field).declaredClass=='dijit.form.NumberSpinner') dijit.byId(field).set('displayedValue',value);
            else if (dijit.byId(field).declaredClass=='dojox.form.CheckedMultiSelect') dijit.byId(field).set('value',value.split(','));
            else dijit.byId(field).set('value',value);
          }
        }
      }
      runReport();
    };
    loadContent("../view/reportsMain.php?" + currentItem[1],"centerDiv", null, false,null, null,null,executeNow);
  } else {
    target=getTargetFromCurrentScreen(currentScreen);
    loadContent(target,"centerDiv"); 
  }
  if(action=='undo'){
    enableWidget('menuBarRedoButton');
    if (historyPosition == 0) {
      disableWidget('menuBarUndoButton');
    }
  }
  if(action=='redo'){
    enableWidget('menuBarUndoButton');
    if (historyPosition == (len - 1)) {
      disableWidget('menuBarRedoButton');
    }
  }
  selectIconMenuBar(currentItem[0]);
  if(isNewGui){
    refreshSelectedMenuLeft('menu'+currentItem[0]);
    refreshSelectedItem(currentItem[0], defaultMenu);
  }
  if(action=='redo')getTargetFromCurrentScreen(currentScreen);
  setActionCoverListNonObj('CLOSE',false); 
}

function getTargetFromCurrentScreen(currentScreen){
  if (currentScreen=="Administration" || currentScreen=="Admin"){ 
    target="admin.php";
  } else if (currentScreen=="Import" || currentScreen=="ImportData"){ 
    target="importData.php";
  } else if (currentScreen=="DashboardTicket") {
    target="dashboardTicketMain.php";
  } else if (currentScreen=="DashboardRequirement") { // ADD qCazelles -
                                                      // Requirements dashboard
                                                      // - Ticket 90
  target="dashboardRequirementMain.php";
  } else if (currentScreen=="ActivityStream") {
    target="activityStreamMain.php";
  } else if (currentScreen=="Plugin"){ 
    target="pluginManagement.php";
  }else if (currentScreen=="Today"){ 
    target="today.php";
  } else if (currentScreen=="Kanban"){ 
    target="kanbanViewMain.php";
  } else if (currentScreen=="UserParameter") {
    target="parameter.php?type=userParameter";
  } else if (currentScreen=="ProjectParameter") {
    target="parameter.php?type=projectParameter";
  } else if (currentScreen=="GlobalParameter") {
    target="parameter.php?type=globalParameter";
  } else if (currentScreen=="Habilitation") {
    target="parameter.php?type=habilitation";
  } else if (currentScreen=="HabilitationReport") {
    target="parameter.php?type=habilitationReport";
  } else if (currentScreen=="HabilitationOther") {
    target="parameter.php?type=habilitationOther";
  } else if (currentScreen=="AccessRight") {
    target="parameter.php?type=accessRight";
  } else if (currentScreen=="AccessRightNoProject") {
    target="parameter.php?type=accessRightNoProject";
  } else if (pluginMenuPage['menu'+currentScreen]) {
    target=pluginMenuPage['menu'+currentScreen];
  } else {
    target=currentScreen.charAt(0).toLowerCase()+currentScreen.substr(1)+"Main.php";
  }
  return target;
}

function getTargetFromCurrentScreenChangeLang(currentScreen){
  if (currentScreen=="Administration" || currentScreen=="Admin"){ 
    target="admin.php";
  } else if (currentScreen=="Import" || currentScreen=="ImportData"){ 
    target="importData.php";
  } else if (currentScreen=="DashboardTicket") {
    target="dashboardTicketMain.php";
  } else if (currentScreen=="DashboardRequirement") { // ADD qCazelles -
                                                      // Requirements dashboard
                                                      // - Ticket 90
    target="dashboardRequirementMain.php";
  } else if (currentScreen=="ActivityStream") {
    target="activityStreamMain.php";
  } else if (currentScreen=="PlannedWorkManual") {
    target="plannedWorkManualMain.php";
  } else if (currentScreen=="Today"){ 
    target="today.php";
  } else {
    target="parameter.php";
  }
  return target;
}

var quickSearchStockId=null;
var quickSearchStockName=null;
var quickSearchIsOpen=false;

function quickSearchOpen() {
  dojo.style("quickSearchDiv", "display", "block");
  if (dijit.byId("listTypeFilter")) {
    dojo.style("listTypeFilter", "display", "none");
  }
  if (dijit.byId("listClientFilter")) {
    dojo.style("listClientFilter", "display", "none");
  }
  if (dijit.byId("listElementableFilter")) {
    dojo.style("listElementableFilter", "display", "none");
  }
  quickSearchStockId=dijit.byId('listIdFilter').get("value");
  if (dijit.byId('listNameFilter')) {
    quickSearchStockName=dijit.byId('listNameFilter').get("value");
    dojo.style("listNameFilter", "display", "none");
    dijit.byId('listNameFilter').reset();
  }
  dijit.byId('listIdFilter').reset();
  dojo.style("listIdFilter", "display", "none");
  dijit.byId("quickSearchValue").reset();
  dijit.byId("quickSearchValue").focus();
  quickSearchIsOpen=true;
}

function quickSearchClose() {
  quickSearchIsOpen=false;
  dojo.style("quickSearchDiv", "display", "none");
  if (dijit.byId("listTypeFilter")) {
    dojo.style("listTypeFilter", "display", "block");
  }
  if (dijit.byId("listClientFilter")) {
    dojo.style("listClientFilter", "display", "block");
  }
  if (dijit.byId("listElementableFilter")) {
    dojo.style("listElementableFilter", "display", "block");
  }
  dojo.style("listIdFilter", "display", "block");
  if (dijit.byId('listNameFilter')) {
    dojo.style("listNameFilter", "display", "block");
    dijit.byId('listNameFilter').set("value", quickSearchStockName);
  }
  dijit.byId("quickSearchValue").reset();
  dijit.byId('listIdFilter').set("value", quickSearchStockId);
  var objClass=(dojo.byId('objectClassList'))?dojo.byId('objectClassList').value:dojo.byId('objectClass').value;
  refreshJsonList(objClass);
}

function quickSearchCloseQuick(type) {
  dijit.byId("listQuickSearchFilter").reset();
  dojo.byId("listQuickSearchValueFilter").value = '';
  dijit.byId("quickSearchValueQuick").reset();
  dojo.byId("quickSearchValueQuickValue").value = '';
  var objClass=(dojo.byId('objectClassList'))?dojo.byId('objectClassList').value:dojo.byId('objectClass').value;
  refreshJsonList(objClass);
  if(type=='quick')dijit.byId('listFilterFilter').closeDropDown();
}
function quickSearchExecute() {
  if (!quickSearchIsOpen) {
    return;
  }
  if (!dijit.byId("quickSearchValue").get("value")) {
    showInfo(i18n('messageMandatory', new Array(i18n('quickSearch'))));
    return;
  }
  var objClass=(dojo.byId('objectClassList'))?dojo.byId('objectClassList').value:dojo.byId('objectClass').value;
  refreshJsonList(objClass);
}

function quickSearchExecuteQuick(type) {
  if ((type == 'quick' && !dijit.byId("quickSearchValueQuick").get("value")) || (type == 'list' && !dijit.byId("listQuickSearchFilter").get("value"))) {
    showInfo(i18n('messageMandatory', new Array(i18n('quickSearch'))));
    return;
  }
  if(type == 'list'){
    dojo.byId('listQuickSearchValueFilter').value = dijit.byId("listQuickSearchFilter").get('value');
  }else{
    dojo.byId('quickSearchValueQuickValue').value = dijit.byId("quickSearchValueQuick").get('value');
  }
  var objClass=(dojo.byId('objectClassList'))?dojo.byId('objectClassList').value:dojo.byId('objectClass').value;
  refreshJsonList(objClass);
  dijit.byId('listFilterFilter').closeDropDown();
}

/*
 * ========================================== Copy functions
 * ==========================================
 */

function copyObject(objectClass) {
  dojo.byId("copyButton").blur();
  action=function() {
    unselectAllRows('objectGrid');
    loadContent("../tool/copyObject.php", "resultDivMain", 'objectForm', true);
  };
  showConfirm(i18n("confirmCopy", new Array(i18n(objectClass),
      dojo.byId('id').value)), action);
}

function copyLinkTo(objectClass) {
  dojo.byId("copyButton").blur();
  action=function() {
    unselectAllRows('objectGrid');
    loadContent("../tool/copyObject.php", "linkRef2Id", 'objectForm', true);
  };
  showConfirm(i18n("confirmCopy", new Array(i18n(objectClass),
      dojo.byId('id').value)), action);
}

function copyObjectToShowStructure() {
  if (dojo.byId('copyClass').value == 'Activity'
      && copyableArray[dijit.byId('copyToClass').get('value')] == 'Activity') {
    dojo.byId('copyWithStructureDiv').style.display='block';
  } else {
    dojo.byId('copyWithStructureDiv').style.display='none';
  }
}

function copyObjectToSubmit(objectClass) {
  var formVar=dijit.byId('copyForm');
  if (!formVar.validate()) {
    showAlert(i18n("alertInvalidForm"));
    return;
  }
  unselectAllRows('objectGrid');
  if(fromContextMenu){
    var callback = function(){
      fromContextMenu=false;
    };
    loadContent("../tool/copyObjectTo.php?fromContextMenu="+fromContextMenu+"&objectId=" + dojo.byId('objectId').value
      + "&objectClass="+dojo.byId('objectClass').value, "resultDivMain", 'copyForm', true,
        'copyTo', null, true,callback);
  }else{
    loadContent("../tool/copyObjectTo.php", "resultDivMain", 'copyForm', true, 'copyTo');
  }
  dijit.byId('dialogCopy').hide();
}

function copyDocumentToSubmit(objectClass) {
  loadContent("../tool/copyDocumentTo.php", "resultDivMain", 'copyDocumentForm', true );
  dijit.byId('dialogCopyDocument').hide();
}

function copyProjectToSubmit(objectClass) {
  var formVar=dijit.byId('copyProjectForm');
  if (!formVar.validate()) {
    showAlert(i18n("alertInvalidForm"));
    return;
  }
  unselectAllRows('objectGrid');
  if(fromContextMenu){
    var callback = function(){
      fromContextMenu=false;
    };
    loadContent("../tool/copyProjectTo.php?fromContextMenu="+fromContextMenu+"&objectId=" + dojo.byId('objectId').value
      + "&objectClass="+dojo.byId('objectClass').value, "resultDivMain", 'copyProjectForm',
        true, 'copyProject', null, true,callback);
  }else{
    loadContent("../tool/copyProjectTo.php", "resultDivMain", 'copyProjectForm', true, 'copyProject');
  }
  dijit.byId('dialogCopy').hide();
}

function copyProjectStructureChange() {
  var cpStr=dijit.byId('copyProjectStructure');
  if (cpStr) {
    if (!cpStr.get('checked')) {
      dijit.byId('copyProjectAssignments').set('checked', false);
      dijit.byId('copyProjectAssignments').set('readOnly', 'readOnly');
    } else {
      dijit.byId('copyProjectAssignments').set('readOnly', false);
    }
  }
}

/*
 * ========================================================================
 * Planning columns management
 * ========================================================================
 */
function openPlanningColumnMgt() {
  // alert("openPlanningColumnMgt");
}

function changePlanningColumn(col, status, order, planningType) {
  if(!planningType)planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  if (status) {
    //order=planningColumnOrder[getIndiceForPlanningType(planningType)].indexOf('Hidden'+col);
    order=dojo.indexOf(planningColumnOrder[getIndiceForPlanningType(planningType)], 'Hidden' + col);
    planningColumnOrder[getIndiceForPlanningType(planningType)][order]=col;
    movePlanningColumn(col, col, planningType);
  } else {
    order=planningColumnOrder[getIndiceForPlanningType(planningType)].indexOf(col);
    //order=dojo.indexOf(planningColumnOrder[getIndiceForPlanningType(planningType)], col);
    planningColumnOrder[getIndiceForPlanningType(planningType)][order]='Hidden' + col;
  } 
  // moveListColumn(); // Removed as sets error
  if (col=='IdStatus' || col=='Type') {
    validatePlanningColumnNeedRefresh=true;
  }
  setPlanningFieldShow(col,status, planningType);
  
  var objectClass=dojo.byId('objectClass').value;
  if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) {
    objectClass=dojo.byId('objectClassList').value;
  } else if (!window.top.dijit.byId('dialogDetail').open && dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) {
    objectClass=dojo.byId("objectClassManual").value;
  }
  
  dojo.xhrGet({
    url : '../tool/savePlanningColumn.php?objectClass='+objectClass+'&action=status&status='
        + ((status) ? 'visible' : 'hidden') + '&item=' + col+'&planningType='+planningType+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    },
    error : function() {
    }
  });
}
function changePlanningColumnWidth(col, width, planningType, needRefresh) {
  if(!planningType)planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  setPlanningFieldWidth(col,width, planningType);
  showWait();
  JSGantt.changeFormat(g.getFormat(), g);
  
  var objectClass=dojo.byId('objectClass').value;
  if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) {
    objectClass=dojo.byId('objectClassList').value;
  } else if (!window.top.dijit.byId('dialogDetail').open && dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) {
    objectClass=dojo.byId("objectClassManual").value;
  }
  
  dojo.xhrGet({
    url : '../tool/savePlanningColumn.php?objectClass='+objectClass+'&action=width&width='+width+'&item=' + col+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
      if(needRefresh){
        loadContent('../tool/refreshPlanningColumnSelector.php?planningType='+planningType+'&layoutObjectClass=' + objectClass + '&csrfToken=' + csrfToken,'divPlanningColumnSelector', null, false, null, null,true);
      }
    },
    error : function() {
    }
  });
  hideWait();
}

function resetPlanningListColumn() {
  var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  var actionOK=function() {
    showWait();
    dijit.byId('planningColumnSelector').closeDropDown();
    var objectClass=dojo.byId('objectClass').value;
    if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) {
      objectClass=dojo.byId('objectClassList').value;
    } else if (!window.top.dijit.byId('dialogDetail').open && dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) {
      objectClass=dojo.byId("objectClassManual").value;
    }
    dojo.xhrGet({
      url : '../tool/savePlanningColumn.php?action=reset&objectClass='
          + objectClass+'&planningType='+planningType+'&csrfToken='+csrfToken,
      handleAs : "text",
      load : function(data, args) {
        var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
        var callback = function(){
          var nodeList=dndPlanningColumnSelector.getAllNodes();
          planningColumnOrder[getIndiceForPlanningType(planningType)]=new Array();
          for (var i=0; i < nodeList.length; i++) {
            var col=nodeList[i].id.substr(14);
            var status=(dijit.byId('checkColumnSelector' + col).get('checked')) ? true
                : false;
            var check = (status)?'':'hidden';
            planningColumnOrder[getIndiceForPlanningType(planningType)][i]=check + col;
            setPlanningFieldShow(col,status,planningType);
            if (col=='IdStatus' || col=='Type') {
              validatePlanningColumnNeedRefresh=true;
            }
          }
          validatePlanningColumn(planningType);
        };
        loadContent('../tool/refreshPlanningColumnSelector.php?planningType='+planningType+'&layoutObjectClass=' + objectClass + '&csrfToken=' + csrfToken,'divPlanningColumnSelector', null, false, null, null,true, callback);
      },
      error : function() {
      }
    });
  };
  showConfirm(i18n('confirmResetList'), actionOK);
}

var validatePlanningColumnNeedRefresh=false;
function validatePlanningColumn(planningType) {
  if(!planningType)planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  dijit.byId('planningColumnSelector').closeDropDown();
  showWait();
  setGanttVisibility(g, planningType);
  if (validatePlanningColumnNeedRefresh) { 
    refreshJsonPlanning();
  } else {
    JSGantt.closeEditRowObjectPlanning();
    JSGantt.changeFormat(g.getFormat(), g);
    hideWait();
  }
  validatePlanningColumnNeedRefresh=false;
}

function movePlanningColumn(source, destination, planningType) {
  if(!planningType)planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  var mode='';
  var list='';
  var nodeList=dndPlanningColumnSelector.getAllNodes();
  planningColumnOrder[getIndiceForPlanningType(planningType)]=new Array();
  for (var i=0; i < nodeList.length; i++) {
    var itemSelected=nodeList[i].id.substr(14);
    check=(dijit.byId('checkColumnSelector' + itemSelected).get('checked')) ? ''
        : 'hidden';
    list+=itemSelected + "|";
    planningColumnOrder[getIndiceForPlanningType(planningType)][i]=check + itemSelected;
  }
  // alert(planningColumnOrder);
  var objectClass=dojo.byId('objectClass').value;
  if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) {
    objectClass=dojo.byId('objectClassList').value;
  } else if (!window.top.dijit.byId('dialogDetail').open && dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) {
    objectClass=dojo.byId("objectClassManual").value;
  }
  
  var url='../tool/movePlanningColumn.php?objectClass='+objectClass+'&orderedList=' + list+'&csrfToken='+csrfToken;
  dojo.xhrPost({
    url : url,
    handleAs : "text",
    load : function(data, args) {
    }
  });
  // loadContent(url, "resultDivMain");
}

function movePlanningHeaderColumn(source, destination, planningType) {
  if(!planningType)planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  var list='Name|';
  var dndPlanningHeaderColumnList=dndPlanningHeaderColumn.getAllNodes();
  planningColumnOrder[getIndiceForPlanningType(planningType)]=new Array();
  planningColumnOrder[getIndiceForPlanningType(planningType)].push('Name');
  for (var i=0; i < dndPlanningHeaderColumnList.length; i++) {
    var itemSelected=dndPlanningHeaderColumnList[i].id.substr(15);
    list+=itemSelected + "|";
    planningColumnOrder[getIndiceForPlanningType(planningType)].push(itemSelected);
  }
  var dndPlanningColumnSelectorList=dndPlanningColumnSelector.getAllNodes();
  for (var i=0; i < dndPlanningColumnSelectorList.length; i++) {
    var itemSelected=dndPlanningColumnSelectorList[i].id.substr(14);
    var check=(dijit.byId('checkColumnSelector' + itemSelected).get('checked')) ? '':'hidden';
    if(check){
      list+=itemSelected + "|";
      planningColumnOrder[getIndiceForPlanningType(planningType)].push(check + itemSelected);
    }
  }
  var objectClass=dojo.byId('objectClass').value;
  if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) {
    objectClass=dojo.byId('objectClassList').value;
  } else if (!window.top.dijit.byId('dialogDetail').open && dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) {
    objectClass=dojo.byId("objectClassManual").value;
  }
  
  var url='../tool/movePlanningColumn.php?objectClass='+objectClass+'&orderedList=' + list+'&csrfToken='+csrfToken;
  dojo.xhrPost({
    url : url,
    handleAs : "text",
    load : function(data, args) {
      var callback = function(){
        validatePlanningColumnNeedRefresh=true;
        validatePlanningColumn(planningType);
      };
      loadContent('../tool/refreshPlanningColumnSelector.php?planningType='+planningType+'&layoutObjectClass=' + objectClass + '&csrfToken=' + csrfToken,'divPlanningColumnSelector', null, false, null, null,true, callback);
    }
  });
}

function tooglePlanningColumnList(){
  event.preventDefault();
  dijit.byId('planningColumnSelector').toggleDropDown();
}

/*
 * ======================================================================== List
 * columns management
 * ========================================================================
 */

function changeListColumn(tableId, fieldId, status, order) {
  var spinner=dijit.byId('checkListColumnSelectorWidthId' + fieldId);
  spinner.set('disabled', !status);
  dojo.xhrGet({
    url : '../tool/saveSelectedColumn.php?action=status&status='
        + ((status) ? 'visible' : 'hidden') + '&item=' + tableId+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    },
    error : function() {
    }
  });
  recalculateColumnSelectorName();
}

function changeListColumnWidth(tableId, fieldId, width) {
  if (width < 1) {
    width=1;
    dijit.byId('checkListColumnSelectorWidthId' + fieldId).set('value', width);
  } else if (width > 50) {
    width=50;
    dijit.byId('checkListColumnSelectorWidthId' + fieldId).set('value', width);
  }
  dojo.xhrGet({
    url : '../tool/saveSelectedColumn.php?action=width&item=' + tableId
        + '&width=' + width+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    },
    error : function() {
    }
  });
  recalculateColumnSelectorName();
}

function validateListColumn() {
  showWait();
  dijit.byId('listColumnSelector').closeDropDown();
  var callBack=function(){resizeListDiv();};
  loadContent("objectList.php?objectClass=" + dojo.byId('objectClassList').value+ "&objectId="+dojo.byId('objectId').value, 
              "listDiv",null,null,null,null,null,callBack);
}

function resetListColumn() {
  var actionOK=function() {
    showWait();
    dijit.byId('listColumnSelector').closeDropDown();
    dojo.xhrGet({
      url : '../tool/saveSelectedColumn.php?action=reset&objectClass='
          + dojo.byId('objectClassList').value+'&csrfToken='+csrfToken,
      handleAs : "text",
      load : function(data, args) {
        var callBack=function(){resizeListDiv();};
        loadContent("objectList.php?objectClass="+dojo.byId('objectClassList').value+"&objectId="+dojo.byId('objectId').value,
                    "listDiv",null,null,null,null,null,callBack);
      },
      error : function() {
      }
    });
  };
  showConfirm(i18n('confirmResetList'), actionOK);
}

function moveListColumn(source, destination) {
  var mode='';
  var list='';
  var nodeList=dndListColumnSelector.getAllNodes();
  listColumnOrder=new Array();
  for (var i=0; i < nodeList.length; i++) {
    var itemSelected=nodeList[i].id.substr(20);
    // check=(dijit.byId('checkListColumnSelector'+itemSelected).get('checked'))?'':'hidden';
    list+=itemSelected + "|";
    // listColumnOrder[i]=check+itemSelected;
  }  
  // dijit.byId('listColumnSelector').closeDropDown();
  var url='../tool/moveListColumn.php?orderedList=' + list;
  dojo.xhrPost({
    url : url+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    }
  });
  // loadContent(url, "resultDivMain");
  // setGanttVisibility(g);
  // JSGantt.changeFormat(g.getFormat(),g);
  // hideWait();
}

function moveFilterListColumn() {
    var mode='';
    var list='';
    var nodeList=dndListFilterSelector.getAllNodes();
    listColumnOrder=new Array();
    for (i=0; i < nodeList.length; i++) {
      var itemSelected=nodeList[i].id.substr(6);
      list+=itemSelected + "|";
    }  
    
    var callback=function() {
        if (window.top.dijit.byId('dialogDetail').open) {
          var doc=window.top.frames['comboDetailFrame'];
        } else {
          var doc=top;
        }
        if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value){
          var objectClass=dojo.byId('objectClassList').value;
        }else if (! window.top.dijit.byId('dialogDetail').open && dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value){ 
          var objectClass=dojo.byId("objectClassManual").value;
        }else if (dojo.byId('objectClass') && dojo.byId('objectClass').value){
          var objectClass=dojo.byId('objectClass').value;
        } 
        var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '?comboDetail=true' : '';
        if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value=='Kanban') {
          compUrl+='&context=directFilterList';
          compUrl+='&contentLoad=../view/kanbanView.php';
          compUrl+='&container=divKanbanContainer';
        }
        doc.loadContent(
            "../tool/displayFilterList.php?context=directFilterList&filterObjectClass="
                + objectClass + compUrl, "directFilterList", null,
           false, 'returnFromFilter', false);
      };
    
    var url='../tool/moveFilterColumn.php?orderedList=' + list;
    dojo.xhrPost({
      url : url+'&csrfToken='+csrfToken+'&csrfToken='+csrfToken,
      handleAs : "text",
      load : function(data, args) {
        if (callback)
          setTimeout(callback, 10);
      }
    });
}

function moveFilterListColumn2() {
  var mode='';
  var list='';
  var nodeList=dndListFilterSelector2.getAllNodes();
  listColumnOrder=new Array();
  for (i=0; i < nodeList.length; i++) {
    var itemSelected=nodeList[i].id.substr(6);
    list+=itemSelected + "|";
  }  
  
  var url='../tool/moveFilterColumn.php?orderedList=' + list+'&csrfToken'+csrfToken;
  dojo.xhrPost({
    url : url,
    handleAs : "text",
    load : function(data, args) {
    }
  });
}

function recalculateColumnSelectorName() {
  cpt=0;
  tot=0;
  while (cpt < 999) {
    var itemSelected=dijit.byId('checkListColumnSelectorWidthId' + cpt);
    if (itemSelected) {
      if (!itemSelected.get('disabled')) {
        tot+=itemSelected.get('value');
      }
    } else {
      cpt=999;
    }
    cpt++;
  }
  if (!dojo.byId('columnSelectorNameFieldId')) return;
  name="checkListColumnSelectorWidthId"+dojo.byId('columnSelectorNameFieldId').value;
  nameWidth=100 - tot;
  color="";
  if (nameWidth < 10) {
    nameWidth=10;
    color="#FFAAAA";
  }
  if (dijit.byId(name)) dijit.byId(name).set('value', nameWidth);
  totWidth=tot + nameWidth;
  totWidthDisplay="";
  if (color) {
    totWidthDisplay='<div style="background-color:' + color + '">' + totWidth
        + '&nbsp;%</div>';
  }
  dojo.byId('columnSelectorTotWidthTop').innerHTML=totWidthDisplay;
  dojo.byId('columnSelectorTotWidthBottom').innerHTML=totWidthDisplay;
  dojo.xhrGet({
    url : '../tool/saveSelectedColumn.php?action=width&item='
        + dojo.byId('columnSelectorNameTableId').value + '&width=' + nameWidth+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    },
    error : function() {
    }
  });
}

// =========================================================
// Items selector
// =========================================================
var oldSelectedItems=null;

function diarySelectItems(value) {
	  if (!oldSelectedItems || oldSelectedItems==value) return;
	  if (oldSelectedItems.indexOf("All")>=0 && value.length>1 ) {
	    value[0]=null;
	    oldSelectedItems=value;
	    dijit.byId("diarySelectItems").set("value",value);
	  } else if (value.indexOf("All")>=0 && oldSelectedItems.indexOf("All")===-1) {
	    value=["All"];
	    oldSelectedItems=value;
	    dijit.byId("diarySelectItems").set("value",value);
	  }
	  var finish=function() {
          loadContent("../view/diary.php","detailDiv","diaryForm");
	  };
	  if (value.length==0) value='none';
	  saveDataToSession('diarySelectedItems', value, true, finish);
	  oldSelectedItems=value;
}

function globalViewSelectItems(value) {
  if (!oldSelectedItems || oldSelectedItems==value) return;
  if (oldSelectedItems.indexOf(" ")>=0 && value.length>1 ) {
    value[0]=null;
    oldSelectedItems=value;
    dijit.byId("globalViewSelectItems").set("value",value);
  } else if (value.indexOf(" ")>=0 && oldSelectedItems.indexOf(" ")===-1) {
    value=[" "];
    oldSelectedItems=value;
    dijit.byId("globalViewSelectItems").set("value",value);
  }
  var finish=function() {
    refreshJsonList("GlobalView");
  };
  if (value.length==0) value='none';
  saveDataToSession('globalViewSelectedItems', value, true, finish);
  oldSelectedItems=value;
}
function globalPlanningSelectItems(value) {
  if (!oldSelectedItems || oldSelectedItems==value) return;
  if (oldSelectedItems.indexOf(" ")>=0 && value.length>1 ) {
    value[0]=null;
    oldSelectedItems=value;
    dijit.byId("globalPlanningSelectItems").set("value",value);
  } else if (value.indexOf(" ")>=0 && oldSelectedItems.indexOf(" ")===-1) {
    value=[" "];
    oldSelectedItems=value;
    dijit.byId("globalPlanningSelectItems").set("value",value);
  }
  var finish=function() {
    refreshJsonPlanning();
  };
  if (value.length==0) value='none';
  saveDataToSession('globalPlanningSelectedItems', value, true, finish);
  oldSelectedItems=value;
}



/*
 * ========================================================================
 * Today management
 * ========================================================================
 */

function setTodayParameterHideSection(section){
  var url='../tool/saveNewTodayParameters.php?section=' + section;
  dojo.xhrPost({
    url : url+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    }
  });
}

function setTodayParameterHiderReportSection(section){
  var url='../tool/saveNewTodayParameters.php?idReport=' + section;
  dojo.xhrPost({
    url : url+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    }
  });
}

function setTodayParameterDeleteReport(idReport){
  var url='../tool/saveTodayDeleteReport.php?idReport=' + idReport;
  dojo.xhrPost({
    url : url+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    }
  });
}

function saveTodayParameters() {
  loadContent('../tool/saveTodayParameters.php', 'centerDiv',
      'todayParametersForm');
  dijit.byId('dialogTodayParameters').hide();
}

function saveTodayParametersSwitch() {
  loadContent('../tool/saveTodayParametersSwitch.php', 'centerDiv',
      'todayParametersForm');
  dijit.byId('dialogNewTodayParameters').hide();
}

function setTodayParameterDeleted(id) {
  dojo.byId('dialogTodayParametersDelete' + id).value=1;
  dojo.byId('dialogTodayParametersRow' + id).style.display='none';
}

function loadReport(url, dialogDiv) {
  var contentWidget=dijit.byId(dialogDiv);
  contentWidget.set('content',
      '<img src="../view/css/images/treeExpand_loading.gif" />');
  dojo.xhrGet({
    url : url+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data) {
      var contentWidget=dijit.byId(dialogDiv);
      if (!contentWidget) {
        return;
      }
      contentWidget.set('content', data);
    },
    error : function() {
      consoleTraceLog("error loading report " + url + " into " + dialogDiv);
    }
  });
}

function reorderTodayItems() {
  var nodeList=dndTodayParameters.getAllNodes();
  for (i=0; i < nodeList.length; i++) {
    var item=nodeList[i].id.substr(24);
    var order=dojo.byId("dialogTodayParametersOrder" + item);
    if (order) {
      order.value=i + 1;
    }
  }
}
var multiSelection=false;
var switchedModeBeforeMultiSelection=false;
function startMultipleUpdateMode(objectClass) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  grid=dijit.byId("objectGrid"); // if the element is not a widget, exit.
  if (!grid) {
    return;
  }
  multiSelection=true;
  formChangeInProgress=true;
  switchedModeBeforeMultiSelection=switchedMode;
  if (switchedModeBeforeMultiSelection) {
    switchModeOn();
  }
  unselectAllRows("objectGrid");
  dijit.byId('objectGrid').selection.setMode('extended');
  loadContent('../view/objectMultipleUpdate.php?objectClass=' + objectClass,
      'detailDiv');
}

function saveMultipleUpdateMode(objectClass) {
  // submitForm("../tool/saveObject.php","resultDivMain", "objectForm", true);
  grid=dijit.byId("objectGrid"); // if the element is not a widget, exit.
  if (!grid) {
    return;
  }
  dojo.byId("selection").value="";
  var items=grid.selection.getSelected();
  if (items.length) {
    dojo.forEach(items, function(selectedItem) {
      if (selectedItem !== null) {
        dojo.byId("selection").value+=parseInt(selectedItem.id) + ";";
      }
    });
  }
  var callBack = function(){
    setTimeout("updateSelectedCountMultiple();",100);
  };
  loadContent('../tool/saveObjectMultiple.php?objectClass=' + objectClass,
      'resultDivMultiple', 'objectFormMultiple',null,null,null,null,callBack);
}

function endMultipleUpdateMode(objectClass) {
  if (dijit.byId('objectGrid')) {
    dijit.byId('objectGrid').selection.setMode('single');
    unselectAllRows("objectGrid");
  }
  multiSelection=false;
  formChangeInProgress=false;
  var sm='';
  if (switchedModeBeforeMultiSelection) {
    if (!switchedMode) {
      switchModeOn();
      sm='&switchedMode=on';
    }
  } else {
    if (switchedMode) {
      switchModeOn();
    }
  }
  if (objectClass) {
    loadContent('../view/objectDetail.php?noselect=true'+sm+'&objectClass='
        + objectClass, 'detailDiv');
  }
}

function deleteMultipleUpdateMode(objectClass) {
  grid=dijit.byId("objectGrid"); // if the element is not a widget, exit.
  if (!grid) {
    return;
  }
  dojo.byId("selection").value="";
  var items=grid.selection.getSelected();
  if (items.length) {
    dojo.forEach(items, function(selectedItem) {
      if (selectedItem !== null) {
        dojo.byId("selection").value+=parseInt(selectedItem.id) + ";";
      }
    });
  }
  actionOK=function() {
    actionOK2=function() {
      if (dijit.byId('deleteMultipleResultDiv').get('content')!='') {
        showConfirm(dijit.byId('deleteMultipleResultDiv').get('content'), function(){loadContent('../tool/deleteObjectMultiple.php?objectClass=' + objectClass,
          'resultDivMultiple', 'objectFormMultiple');});
      } else {
        loadContent('../tool/deleteObjectMultiple.php?objectClass=' + objectClass,
            'resultDivMultiple', 'objectFormMultiple');
      } 
    };
    setTimeout(function(){
      loadContent('../tool/deleteObjectMultipleControl.php?objectClass=' + objectClass,
          'deleteMultipleResultDiv', 'objectFormMultiple',null,null,null,null,actionOK2);
    },200);
  };
  msg=i18n('confirmDeleteMultiple', new Array(i18n('menu' + objectClass),
      items.length));
  showConfirm(msg, actionOK);
}
function updateSelectedCountMultiple() {
  if (dojo.byId('selectedCount')) {
    countSelectedItem('objectGrid','selectedCount');
  }
}
// gautier #533
function multipleUpdateResetPwd(objectClass) {
  grid=dijit.byId("objectGrid"); // if the element is not a widget, exit.
  if (!grid) {
    return;
  }
  dojo.byId("selection").value="";
  var items=grid.selection.getSelected();
  if (items.length) {
    dojo.forEach(items, function(selectedItem) {
      if (selectedItem !== null) {
        dojo.byId("selection").value+=parseInt(selectedItem.id) + ";";
      }
    });
  }
  var callBack = function(){
    
  };
  loadContent('../tool/saveObjectMultiplePwd.php?objectClass=' + objectClass,
      'resultDivMultiple', 'objectFormMultiple',null,null,null,null,callBack);
}

function showImage(objectClass, objectId, imageName) {
  if (objectClass == 'Affectable' || objectClass == 'Resource' || objectClass == 'User' || objectClass == 'Contact') {
    imageUrl="../files/thumbs/Affectable_" + objectId + "/thumb80.png";
  }else if(objectClass == 'Note'){
	  imageUrl=objectId;
  }else {
    imageUrl="../tool/download.php?class=" + objectClass + "&id=" + objectId;
  }
  var dialogShowImage=dijit.byId("dialogShowImage");
  if (!dialogShowImage) {
    dialogShowImage=new dojox.image.LightboxDialog({});
    dialogShowImage.startup();
  }
  if (dialogShowImage && dialogShowImage.show) {
    if (dojo.isFF) {
      dojo.xhrGet({
        url : imageUrl,
        handleAs : "text",
        load : function(data) {
          dialogShowImage.show({
            title : imageName,
            href : imageUrl
          });
          dijit.byId('formDiv').resize();
        }
      });
    } else {
      dialogShowImage.show({
        title : imageName,
        href : imageUrl
      });
      if (dijit.byId('formDiv')) dijit.byId('formDiv').resize();
    }
    // dialogShowImage.show({ title:imageName, href:imageUrl });
  } else {
    showError("Error loading image " + imageName);
  }
  // dijit.byId('formDiv').resize();
}
function showBigImage(objectClass, objectId, node, title, hideImage, nocache) {
  var top=node.getBoundingClientRect().top;
  var left=node.getBoundingClientRect().left;
  var height=node.getBoundingClientRect().height;
  var width=node.getBoundingClientRect().width;
  if (!objectClass && !objectId) top+=15;
  if (!height) height=40;
  if (objectClass == 'Affectable' || objectClass == 'Resource'
      || objectClass == 'User' || objectClass == 'Contact') {
    imageUrl="../files/thumbs/Affectable_" + objectId + "/thumb80.png";
    if (nocache) {
      imageUrl+=nocache+"&csrfToken="+csrfToken;
    }
  } else {
    imageUrl="../tool/download.php?class=" + objectClass + "&id=" + objectId+"&csrfToken="+csrfToken;
  }
  var centerThumb80=dojo.byId("centerThumb80");
  if (centerThumb80) {
    var htmlPhoto='';
    var alone='';
    if (objectClass && objectId && !hideImage) {
      htmlPhoto='<img style="border-radius:40px;" src="' + imageUrl + '" />';
    } else {
      alone='Alone';
    }
    if (title) {
      htmlPhoto+='<div id="centerThumb80TitleContainer" class="thumbBigImageTitle' + alone + '">' + title
          + '</div>';
    }
    var topPx=(top - 40 + (height / 2)) + "px";
    var leftPx=(left - 125) + "px";
    if(dojo.byId('objectClassManual') && dojo.byId('objectClassManual').value=='ActivityStream'){
      leftPx=(left + 125) + "px";
    }
    if (parseInt(leftPx)<3) {
      leftPx=(left+width+5)+"px";
    }
    
    centerThumb80.innerHTML=htmlPhoto;
    centerThumb80.style.top=topPx;
    centerThumb80.style.left=leftPx;
    centerThumb80.style.display="block";
    var titleDivRect=(dojo.byId('centerThumb80TitleContainer'))?dojo.byId('centerThumb80TitleContainer').getBoundingClientRect():null;
    var globalDivRect=document.documentElement.getBoundingClientRect();
    if (titleDivRect && titleDivRect.top+titleDivRect.height+50>globalDivRect.height) {
      var newTop=globalDivRect.height-titleDivRect.height-50;
      if (newTop<0) newTop=0;
      centerThumb80.style.top=newTop+'px';
    }
  }
  
}
function hideBigImage(objectClass, objectId) {
  var centerThumb80=dojo.byId("centerThumb80");
  if (centerThumb80) {
    centerThumb80.innerHTML="";
    centerThumb80.style.display="none";
  }
}

showHtmlContent=null;
function showLink(link) {
  if (dojo.isIE) {
    if (showHtmlContent==null) {
      showHtmlContent=dijit.byId("dialogShowHtml").get('content');
    } else {
      dijit.byId("dialogShowHtml").set('content',showHtmlContent);
    }
  }
  // window.frames['showHtmlFrame'].location.href='../view/preparePreview.php';
  dijit.byId("dialogShowHtml").title=link;
  window.frames['showHtmlFrame'].location.href=link;
  dijit.byId("dialogShowHtml").show();
  window.frames['showHtmlFrame'].focus();
}
function showHtml(id, file, className) {
  if (dojo.isIE) {
    if (showHtmlContent==null) {
      showHtmlContent=dijit.byId("dialogShowHtml").get('content');
    } else {
      dijit.byId("dialogShowHtml").set('content',showHtmlContent);
    }
  }
  dijit.byId("dialogShowHtml").title=file;
  window.frames['showHtmlFrame'].location.href='../tool/download.php?class='+className+'&id='
      + id + '&showHtml=true&csrfToken='+csrfToken;
  dijit.byId("dialogShowHtml").clearOnHide=false;
  dijit.byId("dialogShowHtml").show();
  window.frames['showHtmlFrame'].focus();
} 

// *******************************************************
// Dojo code to position into a tree
// *******************************************************
function recursiveHunt(lookfor, model, buildme, item) {
  var id=model.getIdentity(item);
  buildme.push(id);
  if (id == lookfor) {
    return buildme;
  }
  for ( var idx in item.children) {
    var buildmebranch=buildme.slice(0);
    var r=recursiveHunt(lookfor, model, buildmebranch, item.children[idx]);
    if (r) {
      return r;
    }
  }
  return undefined;
}

function selectTreeNodeById(tree, lookfor) {
  var buildme=[];
  var result=recursiveHunt(lookfor, tree.model, buildme, tree.model.root);
  if (result && result.length > 0) {
    tree.set('path', result);
  }
}


// ==================================================================
// Project Selector Functions
// ==================================================================
function changeProjectSelectorType(displayMode) {
	// #2887
	
	
	var callBack = function(){
	  loadContent("../view/menuProjectSelector.php", 'projectSelectorDiv');
	};
	
	saveDataToSession('projectSelectorDisplayMode', displayMode, true, callBack);
	if(displayMode=='select'){
	  if(dojo.byId('favoriteProjectEditRow')){
	    dojo.byId('favoriteProjectEditRow').style.display = 'none';
	  }
	}else{
	  if(dojo.byId('favoriteProjectEditRow')){
      dojo.byId('favoriteProjectEditRow').style.display = '';
    }
	}
  if (dijit.byId('dialogProjectSelectorParameters')) {
    dijit.byId('dialogProjectSelectorParameters').hide();
  }
}

function refreshProjectSelectorList() {
  dojo.xhrPost({
    url : "../tool/refreshVisibleProjectsList.php?csrfToken="+csrfToken,
    load : function() {
      loadContent('../view/menuProjectSelector.php', 'projectSelectorDiv');
      if (dijit.byId('idProjectPlan')) {
        refreshList('planning', null, null, dijit.byId('idProjectPlan').get('value'), 'idProjectPlan', false);
      }
    }
  });
  if (dijit.byId('dialogProjectSelectorParameters')) {
    dijit.byId('dialogProjectSelectorParameters').hide();
  }
}

// ********************************************************************************************
// Diary
// ********************************************************************************************
function diaryPrevious() {
  diaryPreviousNext(-1);
}
function diaryNext() {
  diaryPreviousNext(1);
}

var noRefreshDiaryPeriod=false;
function diarySelectDate(directDate) {
  if (!directDate)
    return;
  if (noRefreshDiaryPeriod) {
    return;
  }
  noRefreshDiaryPeriod=true;
  var period=dojo.byId("diaryPeriod").value;
  var year=directDate.getFullYear();
  var month=directDate.getMonth() + 1;
  if (period == "month") {
    dojo.byId("diaryYear").value=year;
    dojo.byId("diaryMonth").value=(month >= 10) ? month : "0" + month;
    diaryDisplayMonth(month, year);
  } else if (period == "week") {
    var week=getWeek(directDate.getDate(), month, year) + '';
    if (week == 1 && month > 10) {
      year+=1;
      month=1;
    }
    if (week > 50 && month == 1) {
      year-=1;
      month=12;
    }
    dojo.byId("diaryWeek").value=week;
    dojo.byId("diaryYear").value=year;
    dojo.byId("diaryMonth").value=month;
    diaryDisplayWeek(week, year);
  } else if (period == "day") {
    day=formatDate(directDate);
    dojo.byId("diaryDay").value=day;
    dojo.byId("diaryYear").value=year;
    diaryDisplayDay(day);
  }
  setTimeout("noRefreshDiaryPeriod=false;", 10);
  setTimeout('loadContent("../view/diary.php", "detailDiv", "diaryForm");',200);
  return true;
}

function diaryPreviousNext(way) {
  if (waitingForReply)  {
    showInfo(i18n("alertOngoingQuery"));
    return;
  }
  period=dojo.byId("diaryPeriod").value;
  year=dojo.byId("diaryYear").value;
  month=dojo.byId("diaryMonth").value;
  week=dojo.byId("diaryWeek").value;
  day=dojo.byId("diaryDay").value;
  if (period == "month") {
    month=parseInt(month) + parseInt(way);
    if (month <= 0) {
      month=12;
      year=parseInt(year) - 1;
    } else if (month >= 13) {
      month=1;
      year=parseInt(year) + 1;
    }
    dojo.byId("diaryYear").value=year;
    dojo.byId("diaryMonth").value=(month >= 10) ? month : "0" + month;
    diaryDisplayMonth(month, year);
  } else if (period == "week") {
    week=parseInt(week) + parseInt(way);
    if (parseInt(week) == 0) {
      week=getWeek(31, 12, year - 1);
      if (week == 1) {
        var day=getFirstDayOfWeek(1, year);
        week=getWeek(day.getDate() - 1, day.getMonth() + 1, day.getFullYear());
      }
      year=parseInt(year) - 1;
    } else if (parseInt(week, 10) > 53) {
      week=1;
      year=parseInt(year) + 1;
    } else if (parseInt(week, 10) > 52) {
      lastWeek=getWeek(31, 12, year);
      if (lastWeek == 1) {
        var day=getFirstDayOfWeek(1, year + 1);
        lastWeek=getWeek(day.getDate() - 1, day.getMonth() + 1, day
            .getFullYear());
      }
      if (parseInt(week, 10) > parseInt(lastWeek, 10)) {
        week=01;
        year=parseInt(year) + 1;
      }
    }
    dojo.byId("diaryWeek").value=week;
    dojo.byId("diaryYear").value=year;
    diaryDisplayWeek(week, year);
  } else if (period == "day") {
    day=formatDate(addDaysToDate(getDate(day), way));
    year=day.substring(0, 4);
    dojo.byId("diaryDay").value=day;
    dojo.byId("diaryYear").value=year;
    diaryDisplayDay(day);
  }
  // loadContent("../view/diary.php", "detailDiv", "diaryForm");
}

function diaryWeek(week, year) {
  dojo.byId("diaryPeriod").value="week";
  dojo.byId("diaryYear").value=year;
  dojo.byId("diaryWeek").value=week;
  diaryDisplayWeek(week, year);
  loadContent("../view/diary.php", "detailDiv", "diaryForm");
}

function diaryMonth(month, year) {
  dojo.byId("diaryPeriod").value="month";
  dojo.byId("diaryYear").value=year;
  dojo.byId("diaryMonth").value=month;
  diaryDisplayMonth(month, year);
  loadContent("../view/diary.php", "detailDiv", "diaryForm");
}
function diaryDay(day) {
  dojo.byId("diaryPeriod").value="day";
  dojo.byId("diaryYear").value=day.substring(day, 0, 4);
  dojo.byId("diaryMonth").value=day.substring(day, 5, 2);
  dojo.byId("diaryDay").value=day;
  diaryDisplayDay(day);
  loadContent("../view/diary.php", "detailDiv", "diaryForm");
}

function diaryDisplayMonth(month, year) {
  var vMonthArr=new Array(i18n("January"), i18n("February"), i18n("March"),
      i18n("April"), i18n("May"), i18n("June"), i18n("July"), i18n("August"),
      i18n("September"), i18n("October"), i18n("November"), i18n("December"));
  caption=vMonthArr[month - 1] + " " + year;
  dojo.byId("diaryCaption").innerHTML=caption;
  var firstday=new Date(year, month - 1, 1);
  dijit.byId('dateSelector').set('value', firstday);
}

function diaryDisplayWeek(week, year) {
  var firstday=getFirstDayOfWeek(week, year);
  var lastday=new Date(firstday);
  lastday.setDate(firstday.getDate() + 6);
  if (week<10) week='0'+parseInt(week);
  caption=year + ' #' + week + "<span style='font-size:70%'> (" + dateFormatter(formatDate(firstday))
      + " - " + dateFormatter(formatDate(lastday)) + ") </span>";
  dojo.byId("diaryCaption").innerHTML=caption;
  dijit.byId('dateSelector').set('value', firstday);
}

function diaryDisplayDay(day) {
  var vDayArr=new Array(i18n("Sunday"), i18n("Monday"), i18n("Tuesday"),
      i18n("Wednesday"), i18n("Thursday"), i18n("Friday"), i18n("Saturday"));
  var d=getDate(day);
  caption=vDayArr[d.getDay()] + " " + dateFormatter(day);
  dojo.byId("diaryCaption").innerHTML=caption;
  dijit.byId('dateSelector').set('value', day);
}

function changeCreationInfo() {
  toShow=false;
  if (dijit.byId('idUser')) {
    dijit.byId('dialogCreationInfoCreator').set('value',
        dijit.byId('idUser').get('value'));
    dojo.byId('dialogCreationInfoCreatorLine').style.display='inline';
    toShow=true;
  } else if (dojo.byId('idUser')) {
    dijit.byId('dialogCreationInfoCreator').set('value',
        dojo.byId('idUser').value);
    dojo.byId('dialogCreationInfoCreatorLine').style.display='inline';
    toShow=true;
  } else {
    dojo.byId('dialogCreationInfoCreatorLine').style.display='none';
  }

  if (dijit.byId('creationDate')) {
    dijit.byId('dialogCreationInfoDate').set('value',
        dijit.byId('creationDate').get('value'));
    dojo.byId('dialogCreationInfoDateLine').style.display='inline';
    dojo.byId('dialogCreationInfoTimeLine').style.display='none';
    toShow=true;
  } else if (dojo.byId('creationDate')) {
    dijit.byId('dialogCreationInfoDate').set('value',
        dojo.byId('creationDate').value);
    dojo.byId('dialogCreationInfoDateLine').style.display='inline';
    dojo.byId('dialogCreationInfoTimeLine').style.display='none';
    toShow=true;
  } else if (dijit.byId('creationDateTime')) {
    val=dijit.byId('creationDateTime').get('value');
    valDate=val.substr(0, 10);
    valTime='T' + val.substr(11, 8);
    dijit.byId('dialogCreationInfoDate').set('value', valDate);
    dijit.byId('dialogCreationInfoTime').set('value', valTime);
    dojo.byId('dialogCreationInfoDateLine').style.display='inline';
    dojo.byId('dialogCreationInfoTimeLine').style.display='inline';
    toShow=true;
  } else if (dojo.byId('creationDateTime')) {
    val=dojo.byId('creationDateTime').value;
    valDate=val.substr(0, 10);
    valTime=val.substr(11, 8);
    dijit.byId('dialogCreationInfoDate').set('value', valDate);
    dijit.byId('dialogCreationInfoTime').set('value', valTime);
    dojo.byId('dialogCreationInfoDateLine').style.display='inline';
    dojo.byId('dialogCreationInfoTimeLine').style.display='inline';
    toShow=true;
  } else {
    dojo.byId('dialogCreationInfoDateLine').style.display='none';
    dojo.byId('dialogCreationInfoTimeLine').style.display='none';
  }
  if (toShow) {
    dijit.byId('dialogCreationInfo').show();
  }

  if (toShow) {
    dijit.byId('dialogCreationInfo').show();
  }
}

function saveCreationInfo() {
  if (dijit.byId('idUser')) {
    dijit.byId('idUser').set('value',
        dijit.byId('dialogCreationInfoCreator').get('value'));
  } else if (dojo.byId('idUser')) {
    dojo.byId('idUser').value=dijit.byId('dialogCreationInfoCreator').get(
        'value');
  }

  if (dijit.byId('creationDate')) {
    dijit.byId('creationDate').set('value',
        formatDate(dijit.byId('dialogCreationInfoDate').get('value')));
  } else if (dojo.byId('creationDate')) {
    dojo.byId('creationDate').value=formatDate(dijit.byId(
        'dialogCreationInfoDate').get('value'));
  } else {
    if (dijit.byId('creationDateTime')) {
      valDate=formatDate(dijit.byId('dialogCreationInfoDate').get('value'));
      valTime=formatTime(dijit.byId('dialogCreationInfoTime').get('value'));
      val=valDate + ' ' + valTime;
      dijit.byId('creationDateTime').set('value', val);
    } else if (dojo.byId('creationDateTime')) {
      valDate=format(Datedijit.byId('dialogCreationInfoDate').get('value'));
      valTime=format(Datedijit.byId('dialogCreationInfoTime').get('value'));
      val=valDate + ' ' + valTime;
      dojo.byId('dialogCreationInfoDate').value=val;
    }
  }
  formChanged();
  // dojo.byId('buttonDivCreationInfo').innerHTML="";
  // forceRefreshCreationInfo=true;
  saveObject();
  dijit.byId('dialogCreationInfo').hide();
}

function logLevel(value){
  var url='../tool/storeLogLevel.php?value=' + value;
  dojo.xhrPost({
    url : url+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    }
  });
}

function showLogfile(name) {
  var atEnd=null;
  if (name=='last') {
    atEnd=function(name){
      scrollIndex=0;
      setTimeout("scrollLogFile();",100);
    };
  }
  loadDialog('dialogLogfile', atEnd, true, '&logname='+name, true);
}
var scrollIndex=0;
function scrollLogFile() {
  dojo.query(".logFile .dijitDialogPaneContent").forEach(function(node, index, arr){
    node.scrollTop=parseInt(dojo.byId('logTableContainer').offsetHeight);
  });
  scrollIndex++;
  if (scrollIndex<10) setTimeout("scrollLogFile();",100);
}

function installPlugin(fileName,confirmed) {
  if (! confirmed) {
    actionOK=function() {
      installPlugin(fileName, true);
    };
    msg=i18n('confirmInstallPlugin', new Array(fileName));
    showConfirm(msg,actionOK);
  } else {
    showWait();
    dojo.xhrGet({
      url : "../plugin/loadPlugin.php?pluginFile="
          + encodeURIComponent(fileName)+"&csrfToken="+csrfToken,
      load : function(data) {
        if (data=="OK") {
          loadContent("pluginManagement.php", "centerDiv");
        } else if (data=="RELOAD") {
          showWait();
          noDisconnect=true;
          quitConfirmed=true;        
          dojo.byId("directAccessPage").value="pluginManagement.php";
          dojo.byId("menuActualStatus").value=menuActualStatus;
          dojo.byId("p1name").value="type";
          dojo.byId("p1value").value=forceRefreshMenu;
          forceRefreshMenu="";
          dojo.byId("directAccessForm").submit();     
        } else if (data.substr(0,8)=="CALLBACK") {
          var url=data.substring(9,data.indexOf('#'));
          window.open(url);
          var msg=data.substring(data.indexOf('#')+1,data.indexOf('##'));
          hideWait();
          callback=function() {loadContent("pluginManagement.php", "centerDiv");};
          showInfo(msg,callback);
          // setTimeout(callback,5000);
        } else {
          hideWait();
          showError(data+'<br/>');
        }
      },
      error : function(data) {
        hideWait();
        showError(data);
      }
    });
  }
}
function deletePlugin(fileName,confirmed) {
  if (! confirmed) {
    actionOK=function() {
      deletePlugin(fileName, true);
    };
    msg=i18n('confirmDeletePluginFile', new Array(fileName));
    showConfirm(msg,actionOK);
  } else {
    showWait();
    dojo.xhrGet({
      url : "../plugin/deletePlugin.php?pluginFile="
          + encodeURIComponent(fileName)+"&csrfToken="+csrfToken,
      load : function(data) {
        if (data=="OK") {
          loadContent("pluginManagement.php", "centerDiv");
        } else {
          hideWait();
          showError(data+'<br/>');
        }
      },
      error : function(data) {
        hideWait();
        showError(data);
      }
    });
  }
}

function uninstallPlugin(uniqueCode, name, confirmed) {
	  if (! confirmed) {
	    actionOK=function() {
	    	uninstallPlugin(uniqueCode, name, true);
	    };
	    msg=i18n('confirmUninstallPlugin', new Array(name));
	    showConfirm(msg,actionOK);
	  } else {
	    showWait();
	    dojo.xhrGet({
	      url : "../plugin/uninstallPlugin.php?uniqueCode="+ uniqueCode +"&pluginName="+name+"&csrfToken="+csrfToken,
	      load : function(data) {
	          showWait();
	          noDisconnect=true;
	          quitConfirmed=true;        
	          dojo.byId("directAccessPage").value="pluginManagement.php";
	          dojo.byId("menuActualStatus").value=menuActualStatus;
	          dojo.byId("p1name").value="type";
	          dojo.byId("p1value").value=forceRefreshMenu;
	          forceRefreshMenu="";
	          dojo.byId("directAccessForm").submit();
	      },
	      error : function(data) {
	        hideWait();
	        showError(data);
	      }
	    });
	  }
	}

var historyShowHideWorkStatus=0;
function historyShowHideWork() {
  if (! dojo.byId('objectClass')) {return;}
  historyShowHideWorkStatus=((historyShowHideWorkStatus)?0:1);
  if (dijit.byId('dialogHistory')) {
    dijit.byId('dialogHistory').hide();
  } 
  var callBack = function(){
	showHistory(dojo.byId('objectClass').value);
  };
  saveDataToSession("showWorkHistory", historyShowHideWorkStatus, null, callBack);
}

// ====================================================
// * UPLOAD PLUGIN * //
// ====================================================

function uploadPlugin() {
  if (!isHtml5()) {
    return true;
  }
  if (dojo.byId('pluginFileName').innerHTML == "") {
    return false;
  }
  dojo.style(dojo.byId('downloadProgress'), {
    display : 'block'
  });
  showWait();
  return true;
}

function changePluginFile(list) {
  if (list.length > 0) {
    dojo.byId("pluginFileName").innerHTML=list[0]['name'];
    return true;
  }
}

function savePluginAck(dataArray) {
  if (!isHtml5()) {
    resultFrame=document.getElementById("resultPost");
    resultText=resultPost.document.body.innerHTML;
    dijit.byId('resultDivMain').set('content',resultText);
    savePluginFinalize();
    return;
  }
  if (dojo.isArray(dataArray)) {
    result=dataArray[0];
  } else {
    result=dataArray;
  }
  dojo.style(dojo.byId('downloadProgress'), {
    display : 'none'
  });
  if (dojo.isArray(dataArray)) {
    result=dataArray[0];
  } else {
    result=dataArray;
  }
  dojo.style(dojo.byId('downloadProgress'), {
    display : 'none'
  });
  contentNode = dojo.byId('resultDivMain');
  contentNode.innerHTML=result.message;
  contentNode.style.display="block"; 
  contentNode.style.opacity=1; 
  setTimeout("dojo.byId('resultDivMain').style.display='none';",2000);
  savePluginFinalize();
}
function savePluginFinalize() {
  contentNode = dojo.byId('resultDivMain');
  if (contentNode.innerHTML.indexOf('resultOK')>0) {
    setTimeout('loadContent("pluginManagement.php", "centerDiv");',1000);
  } else {
    hideWait();
  }
}


function showMenuList() {
  clearTimeout(closeMenuListTimeout);
  menuListAutoshow=true;
  clearTimeout(openMenuListTimeout);
  openMenuListTimeout=setTimeout("dijit.byId('menuSelector').loadAndOpenDropDown();",popupOpenDelay);
  
}
function hideMenuList(delay, item) {
  if (! menuListAutoshow) return;
  clearTimeout(closeMenuListTimeout);
  clearTimeout(openMenuListTimeout);
  closeMenuListTimeout=setTimeout("dijit.byId('menuSelector').closeDropDown();",delay);
}

function saveRestrictTypes() {
  callback=function() {
    var fnClBk=function(data) {
      dojo.byId('resctrictedTypeClassList').innerHTML=data;
    };
    dojo.xhrGet({
      url : '../tool/getSingleData.php?dataType=restrictedTypeClass'
        +'&idProject='+dojo.byId('idProjectParam').value
        +'&idProjectType='+dojo.byId('idProjectTypeParam').value
        +'&idProfile='+dojo.byId('idProfile').value+'&csrfToken='+csrfToken,
      handleAs : "text",
      load : fnClBk
    });
  }
  loadContent("../tool/saveRestrictTypes.php" , "resultDivMain", "restrictTypesForm", true, 'report',false,false, callback);
  dijit.byId('dialogRestrictTypes').hide();
}

function getMaxWidth(document){
  return Math.max( document.scrollWidth, document.offsetWidth, 
      document.clientWidth);
}

function getMaxHeight(document){
  return Math.max( document.scrollHeight, document.offsetHeight, 
      document.clientHeight);
}

function changeParamDashboardTicket(paramToSend){
  loadContent('dashboardTicketMain.php?'+paramToSend, 'centerDiv', 'dashboardTicketMainForm');
}

function changeDashboardTicketMainTabPos(){
  var listChild=dojo.byId('dndDashboardLeftParameters').childNodes[1].childNodes;
  addLeft="";
  iddleList=',"iddleList":[';
  if(listChild.length>1){
    addLeft="[";
    for(var i=1;i<listChild.length;i++){
      getId="";
      if(listChild[i].id.includes('dialogDashboardLeftParametersRow')){
        getId=listChild[i].id.split('dialogDashboardLeftParametersRow')[1];
      }
      if(listChild[i].id.includes('dialogDashboardRightParametersRow')){
        getId=listChild[i].id.split('dialogDashboardRightParametersRow')[1];
      }
      // iddleList+='"'+dijit.byId('dialogTodayParametersIdle'+listChild[i].id.split('dialogDashboardLeftParametersRow')[1]).get('checked')+'"';
      if(getId!=""){
        addLeft+='"'+getId+'"';
        iddleList+='{"name":"'+getId+'","idle":'+dijit.byId('tableauBordTabIdle'+getId).get('checked')+'}';
        if(i+1!=listChild.length){
          addLeft+=',';
          iddleList+=',';
        } 
      }
    }
    addLeft+="]";
    if(dojo.byId('dndDashboardRightParameters').childNodes[0].childNodes.length>1){
      iddleList+=',';
    }
  }
  
  var listChild=dojo.byId('dndDashboardRightParameters').childNodes[0].childNodes;
  addRight="";
  if(listChild.length>1){
    addRight="[";
    for(var i=1;i<listChild.length;i++){
      getId="";
        if(listChild[i].id.includes('dialogDashboardLeftParametersRow')){
          getId=listChild[i].id.split('dialogDashboardLeftParametersRow')[1];
        }
        if(listChild[i].id.includes('dialogDashboardRightParametersRow')){
          getId=listChild[i].id.split('dialogDashboardRightParametersRow')[1];
        }
        // iddleList+='"'+dijit.byId('dialogTodayParametersIdle'+listChild[i].id.split('dialogDashboardLeftParametersRow')[1]).get('checked')+'"';
        if(getId!=""){
          addRight+='"'+getId+'"';
          iddleList+='{"name":"'+getId+'","idle":'+dijit.byId('tableauBordTabIdle'+getId).get('checked')+'}';
          if(i+1!=listChild.length){
            addRight+=',';
            iddleList+=',';
          }
        }
      }
    addRight+="]";
  }
  toSend='{"addLeft":';
  if(addLeft==""){
    addLeft="[]";
  }
  toSend+=addLeft;
  
  toSend+=',"addRight":';
  if(addRight==""){
    addRight="[]";
  }
  iddleList+="]";
  toSend+=addRight+iddleList+"}";
  if (dojo.byId('objectClassManual') && dojo.byId('objectClassManual').value=='DashboardRequirement') {
	  loadContent('dashboardRequirementMain.php?updatePosTab='+toSend, 'centerDiv', 'dashboardRequirementMainForm');
  } else {
	  loadContent('dashboardTicketMain.php?updatePosTab='+toSend, 'centerDiv', 'dashboardTicketMainForm');
  }
}

function changeParamDashboardRequirement(paramToSend){
  loadContent('dashboardRequirementMain.php?'+paramToSend, 'centerDiv', 'dashboardRequirementMainForm');
}

function getLocalLocation(){
  var availableScaytLocales=["en_US", "en_GB", "pt_BR", "da_DK", "nl_NL", "en_CA", "fi_FI", "fr_FR", "fr_CA", "de_DE", "el_GR", "it_IT", "nb_NO", "pt_PT", "es_ES", "sv_SE"];
  var correspondingLocales= ["en",    "",      "pt-br", "",      "nl",    "",      "",      "fr",    "fr-ca", "de",    "el",    "it",    "",      "pt",    "es",    ""];
  var locale=dojo.locale;
  if (currentLocale) {
    var pos=correspondingLocales.indexOf(currentLocale);
    if (pos>=0) {
      locale=availableScaytLocales[pos];
    }
  }
  return locale;
}
function getLocalScaytAutoStartup() {
  if (typeof scaytAutoStartup == "undefined" || scaytAutoStartup===null || scaytAutoStartup==='' || scaytAutoStartup=='YES' || scaytAutoStartup===true) {
    return true;
  } else {
    return scaytAutoStartup;
  }
}

// =============================================================================
// = JobDefinition
// =============================================================================

/**
 * Display a add line Box
 * 
 */
function addJobDefinition(checkId) {
  var params="&checkId=" + checkId;
  loadDialog('dialogJobDefinition', null, true, params);
}

/**
 * Display a edit line Box
 * 
 */
function editJobDefinition(checkId, lineId) {
  var params="&checkId=" + checkId + "&lineId=" + lineId;
  loadDialog('dialogJobDefinition', null, true, params);
}

/**
 * save a line (after addDetail or editDetail)
 * 
 */
function saveJobDefinition() {
  if (!dijit.byId("dialogJobDefinitionName").get('value')) {
    showAlert(i18n('messageMandatory', new Array(i18n('colName'))));
    return false;
  }
  loadContent("../tool/saveJobDefinition.php", "resultDivMain",
      "dialogJobDefinitionForm", true, 'jobDefinition');
  dijit.byId('dialogJobDefinition').hide();

}

/**
 * Display a delete line Box
 * 
 */
function removeJobDefinition(lineId) {
  var params="?lineId=" + lineId;
  // loadDialog('dialogJobDefinition',null, true, params)
  // dojo.byId("jobDefinitionId").value=lineId;
  actionOK=function() {
    loadContent("../tool/removeJobDefinition.php" + params,
        "resultDivMain", null, true, 'jobDefinition');
  };
  msg=i18n('confirmDelete', new Array(i18n('JobDefinition'), lineId));
  showConfirm(msg, actionOK);
}

// =============================================================================
// = Joblist
// =============================================================================

function showJoblist(objectClass) {
  if (!objectClass) {
    return;
  }
  if (dijit.byId('id')) {
    var objectId=dijit.byId('id').get('value');
  } else {
    return;
  }
  var params="&objectClass=" + objectClass + "&objectId=" + objectId;
  loadDialog('dialogJoblist', null, true, params, true);
}

function saveJoblist() {
  // var params="&objectClass="+objectClass+"&objectId="+objectId;
  // loadDialog('dialogJoblist',null, true, params);
  loadContent('../tool/saveJoblist.php', 'resultDivMain', 'dialogJoblistForm',
      true, 'joblist');
  dijit.byId('dialogJoblist').hide();
  return false;
}

function jobClick(line) {
  jobName="check_" + line;
  if (dijit.byId(jobName).get('checked') && dijit.byId("check_" + line)) {
    dijit.byId("check_" + line).set('checked', false);
  }
}

function changeJobInfo(jobId) {
  toShow=false;
  if(dijit.byId('dialogJobInfoJobId')) {
    dijit.byId('dialogJobInfoJobId').set('value', jobId);
  } else if (dijit.byId('dialogJobInfoJobId')) {
    dojo.byId('dialogJobInfoJobId').value = jobId;
  }

  if (dijit.byId('job_'+jobId+'_idUser')) {
    dijit.byId('dialogJobInfoCreator').set('value',
        dijit.byId('job_'+jobId+'_idUser').get('value'));
    dojo.byId('dialogJobInfoCreatorLine').style.display='inline';
    toShow=true;
  } else if (dojo.byId('job_'+jobId+'_idUser')) {
    dijit.byId('dialogJobInfoCreator').set('value',
        dojo.byId('job_'+jobId+'_idUser').value);
    dojo.byId('dialogJobInfoCreatorLine').style.display='inline';
    toShow=true;
  } else {
    dojo.byId('dialogJobInfoCreatorLine').style.display='none';
  }

  if (dijit.byId('job_'+jobId+'_creationDate')) {
    if(dijit.byId('job_'+jobId+'_creationDate').get('value') != '') {
      dijit.byId('dialogJobInfoDate').set('value', dijit.byId('job_'+jobId+'_creationDate').get('value'));
    }
    dojo.byId('dialogJobInfoDateLine').style.display='inline';
    toShow=true;
  } else if (dojo.byId('job_'+jobId+'_creationDate')) {
    if(dojo.byId('job_'+jobId+'_creationDate').value != '') {
      dojo.byId('dialogJobInfoDate').set('value', dojo.byId('job_'+jobId+'_creationDate').value);
    }
    dojo.byId('dialogJobInfoDateLine').style.display='inline';
    toShow=true;
  } else {
    dojo.byId('dialogJobInfoDateLine').style.display='none';
  }

  if (toShow) {
    dijit.byId('dialogJobInfo').show();
  }
}

function saveJobInfo() {
  if(dijit.byId('dialogJobInfoJobId')) {
    jobId = dijit.byId('dialogJobInfoJobId').get('value');
  } else if (dijit.byId('dialogJobInfoJobId')) {
    jobId = dijit.byId('dialogJobInfoJobId').get('value');
  }
  if(jobId) {
    if (dijit.byId('job_'+jobId+'_idUser')) {
      dijit.byId('job_'+jobId+'_idUser').set('value',
        dijit.byId('dialogJobInfoCreator').get('value'));
    } else if (dojo.byId('job_'+jobId+'_idUser')) {
      dojo.byId('job_'+jobId+'_idUser').value = dijit.byId('dialogJobInfoCreator').get(
          'value');
    }

    if(dijit.byId('dialogJobInfoDate').get('value') != '') {
        if (dijit.byId('job_'+jobId+'_creationDate')) {
            dijit.byId('job_'+jobId+'_creationDate').set('value',
              formatDate(dijit.byId('dialogJobInfoDate').get('value')));
        } else if (dojo.byId('job_'+jobId+'_creationDate')) {
            dojo.byId('job_'+jobId+'_creationDate').value = formatDate(dijit.byId(
              'dialogJobInfoDate').get('value'));
        }
    }
    formChanged();
    // To implement if we want to hide before reload after save
    /* dojo.byId('buttonDivCreationInfo').innerHTML=""; */
    forceRefreshJobInfo=true;
    saveObject();
    dijit.byId('dialogJobInfo').hide();
  }
}

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    enterFullScreen();
  } else { 
    exitFullScreen();
  }
  dijit.byId("iconMenuUserScreen").closeDropDown();
}
function enterFullScreen() {
  if (document.documentElement.requestFullScreen) {
    document.documentElement.requestFullScreen();  
  } else if (document.documentElement.mozRequestFullScreen) {  
    document.documentElement.mozRequestFullScreen();  
  } else if (document.documentElement.webkitRequestFullScreen) {  
    document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
  }
}
function exitFullScreen() {
  if (document.cancelFullScreen ) {
    document.cancelFullScreen(); 
  } else if (document.mozCancelFullScreen) {  
    document.mozCancelFullScreen(); 
  } else if (document.webkitCancelFullScreen) {  
    document.webkitCancelFullScreen(); 
  }
}
/**
 * Subscription
 * 
 */
function subscribeToItem(objectClass, objectId, userId) {
    if (! objectId && dojo.byId('id')) objectId=dojo.byId('id').value;
    var url="../tool/saveSubscription.php?mode=on";
    url+="&objectClass="+objectClass;
    url+="&objectId="+objectId;
    url+="&userId="+userId;
  dojo.xhrGet({
    url : url+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data) {
      var result="KO";
      var itemLabel="";
      var response=JSON.parse(data);
      if (response.hasOwnProperty('result')) result=response.result;
      if (response.hasOwnProperty('itemLabel')) itemLabel=response.itemLabel;
      if (result=='OK') {
        addMessage(i18n('subscriptionSuccess',new Array(itemLabel)));
        dijit.byId('subscribeButton').set('iconClass','dijitButtonIcon dijitButtonIconSubscribeValid');
        enableWidget('subscribeButtonUnsubscribe');
        disableWidget('subscribeButtonSubscribe');
      } else {
        showError(i18n('subscriptionFailed'));
      }
    },
    error : function() {
      showError(i18n('subscriptionFailed'));
    }
  });
}

function unsubscribeFromItem(objectClass, objectId, userId) {
  if (! objectId && dojo.byId('id')) objectId=dojo.byId('id').value;
  var url="../tool/saveSubscription.php?mode=off";
  url+="&objectClass="+objectClass;
  url+="&objectId="+objectId;
  url+="&userId="+userId;
  dojo.xhrGet({
    url : url+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data) {
      var result="KO";
      var itemLabel="";
      var message="";
      var response=JSON.parse(data);
      if (response.hasOwnProperty('result')) result=response.result;
      if (response.hasOwnProperty('itemLabel')) itemLabel=response.itemLabel;
      if (response.hasOwnProperty('message')) message=response.message;
      if (result=='OK') {
        addMessage(i18n('unsubscriptionSuccess',new Array(itemLabel)));
        dijit.byId('subscribeButton').set('iconClass','dijitButtonIcon dijitButtonIconSubscribe');
        enableWidget('subscribeButtonSubscribe');
        disableWidget('subscribeButtonUnsubscribe');
      } else {
        showError(i18n('subscriptionFailed')+'<br/>'+message);
      }
    },
    error : function() {
      showError(i18n('subscriptionFailed'));
    }
  });
}

function subscribeForOthers(objectClass, objectId) {
  if (! objectId && dojo.byId('id')) objectId=dojo.byId('id').value;
  loadDialog('dialogSubscriptionForOthers',null,true,'&objectClass='+objectClass+'&objectId='+objectId,true);
}
function showSubscribersList(objectClass, objectId) {
  if (! objectId && dojo.byId('id')) objectId=dojo.byId('id').value;
  loadDialog('dialogSubscribersList',null,true,'&objectClass='+objectClass+'&objectId='+objectId,true);
}

function showSubscriptionList(userId) {
  loadDialog('dialogSubscriptionList',null,true,'&userId='+userId,true);
}

function changeSubscriptionFromDialog(mode,dialog,objectClass,objectId,userId,key,currentUserId) {
  if (! objectId && dojo.byId('id')) objectId=dojo.byId('id').value;
  var url="../tool/saveSubscription.php?mode="+mode;
  url+="&objectClass="+objectClass;
  url+="&objectId="+objectId;
  url+="&userId="+userId;
  dojo.xhrGet({
    url : url+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data) {
      var result="KO";
      var itemLabel="";
      var message="";
      var userName="";
      var userId="";
      var currentUserId="";
      var objectClass="";
      var objectId="";
      var response=JSON.parse(data);
      if (response.hasOwnProperty('result')) result=response.result;
      if (response.hasOwnProperty('itemLabel')) itemLabel=response.itemLabel;
      if (response.hasOwnProperty('userName')) userName=response.userName;
      if (response.hasOwnProperty('userId')) userId=response.userId;
      if (response.hasOwnProperty('currentUserId')) currentUserId=response.currentUserId;
      if (response.hasOwnProperty('objectClass')) objectClass=response.objectClass;
      if (response.hasOwnProperty('objectId')) objectId=response.objectId;
      if (response.hasOwnProperty('message'))  message=response.message;
      if (result=='OK') {
        if (dialog=='list') {
          addMessage(i18n('unsubscriptionSuccess',new Array(itemLabel)));
        } else if (dialog=='other') {
          if (mode=='on') {
            addMessage(i18n('subscriptionSuccess',new Array(userName)));
          } else {
            addMessage(i18n('unsubscriptionSuccess',new Array(userName)));
          }
        }
        if (key) {
          if (mode=='on') {
            dojo.byId('subscribtionButton'+key).style.display="none";
            dojo.byId('unsubscribtionButton'+key).style.display="inline-block";
          } else {
            dojo.byId('unsubscribtionButton'+key).style.display="none";
            dojo.byId('subscribtionButton'+key).style.display="inline-block";
          }
        }
        if (userId && currentUserId && userId==currentUserId && objectClass && objectId) {
          if (dojo.byId('objectClass') && objectClass==dojo.byId('objectClass').value && dojo.byId('objectId') && parseInt(objectId)==parseInt(dojo.byId('objectId').value)) {
            if (mode=='on') {
              if (dijit.byId('subscribeButton')) dijit.byId('subscribeButton').set('iconClass','dijitButtonIcon dijitButtonIconSubscribeValid');
              enableWidget('subscribeButtonUnsubscribe');
              disableWidget('subscribeButtonSubscribe');
            } else {
              if (dijit.byId('subscribeButton')) dijit.byId('subscribeButton').set('iconClass','dijitButtonIcon dijitButtonIconSubscribe');
              enableWidget('subscribeButtonSubscribe');
              disableWidget('subscribeButtonUnsubscribe');
            }
          }
        }
      } else {
        showError(i18n('subscriptionFailed')+'<br/>'+message);
      }
    },
    error : function() {
      showError(i18n('subscriptionFailed'));
    }
  });
}

function filterDnDList(search,list) {
  var searchVal=dojo.byId(search).value;
  searchVal=searchVal.replace(/\*/gi,'.*');
  var pattern = new RegExp(searchVal, 'i');
  dojo.map(dojo.byId(list).children, function(child){
    if (searchVal!='' && ! pattern.test(child.getAttribute('value')) ) {
      child.style.display="none";
    } else {
      child.style.display="block";
    }
  });
}

function filterDnDListLayout(search,list) {
  var searchVal=dojo.byId(search).value;
  if(list=='layoutAvailable'){
    dojo.byId('iconSearchLayout').style.display="none";
    dojo.byId('iconCancelLayout').style.display="block";
  }
  searchVal=searchVal.replace(/\*/gi,'.*');
  var pattern = new RegExp(searchVal, 'i');
  dojo.map(dojo.byId(list).children, function(child){
    if (searchVal!='' && ! pattern.test(child.getAttribute('value')) ) {
      child.style.display="none";
    } else {
      child.style.display="block";
    }
  });
}

function clearFilterDnDListLayout() {
    dojo.byId('iconSearchLayout').style.display="block";
    dojo.byId('iconCancelLayout').style.display="none";
    dojo.map(dojo.byId('layoutAvailable').children, function(child){
      child.style.display="block";
    });
    dojo.byId('layoutAvailableSearch').value="";
}


var arrayPaneSize=[];
function storePaneSize(paneName,sizeValue) {
  if (arrayPaneSize[paneName] && arrayPaneSize[paneName]==sizeValue) {
    return;
  }
  arrayPaneSize[paneName]=sizeValue;
  saveDataToSession(paneName, sizeValue, true);
}

function displayMenu(id){
  if(hideUnderMenuId){
    if (hideUnderMenuId == id ){
      clearTimeout(hideUnderMenuTimeout);
      hideUnderMenuId=null;
    }else{
      hideUnderMenu(hideUnderMenuId);
    }
  }
  dojo.byId('UnderMenu'+id).style.zIndex="999999";
  dojo.byId('UnderMenu'+id).style.display="block";
  setTimeout("repositionMenuDiv("+id+","+id+");",10);
}

function displayUnderMenu(id,idParent){
  if (hideUnderMenuId==null && previewhideUnderMenuId!=null){
    hideUnderMenu(previewhideUnderMenuId,0);
  }
  else 
    if(hideUnderMenuId){
      if (hideUnderMenuId == id ){
        dojo.byId('UnderMenu'+id).style.display="none";
        clearTimeout(hideUnderMenuTimeout);
      }else{
        hideUnderMenu(hideUnderMenuId);
      }
    }
    dojo.byId('UnderMenu'+id).style.display="block";
    setTimeout("repositionMenuDiv("+id+","+idParent+");",10);
  // Florent
    previewhideUnderMenuId=id;
}

function repositionMenuDiv(id,idParent) {
  var parentDiv=dojo.byId('Menu'+idParent);
  var currentDiv=dojo.byId('UnderMenu'+id);
  var top = parentDiv.offsetTop;
  var totalHeight = dojo.byId('centerDiv').offsetHeight;
  currentDiv.style.maxHeight=(totalHeight-50)+'px';
  var height = currentDiv.offsetHeight;
  if(id==152 && top + height > totalHeight - 45){
    newTop = totalHeight - (top + height) - 10 ; 
    currentDiv.style.top = newTop+'px';
  }
  if (top + height > totalHeight - 30){
    newTop = totalHeight - (top + height) - 10 ; 
    currentDiv.style.top = newTop+'px';
  };
}

function hideMenu(id,delay){
  if(! delay){ 
    delay=300;
  }
  if(hideUnderMenuTimeout){
    clearTimeout(hideUnderMenuTimeout);
  }  
  hideUnderMenuId = id;
  hideUnderMenuTimeout=setTimeout("hideUnderMenu("+id+")",delay);
}

function hideUnderMenu(id){
  dojo.query(".hideUndermenu"+id+".dijitAccordionTitle2.reportTableColumnHeader2.largeReportHeader2").forEach(function(node, index, nodelist) {
    node.style.display="none";
   });
  dojo.byId('UnderMenu'+id).style.display="none";
  hideUnderMenuId = null;
}

function hidePreviewUnderMenu(id){
  if(previewhideUnderMenuId!=id && previewhideUnderMenuId!=null){
    hideUnderMenu(previewhideUnderMenuId);
  }
}
// end
function displayListOfApprover(id){
  var params="&objectId=" + id;
  loadDialog('dialogListApprover', null, true,params,null,true);
}

function readNotification (id){
  var url='../view/menuNotificationRead.php?id=' + id;
  dojo.xhrPost({
    url : url+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data, args) {
      var objClass = 'objectClass';
      try {
         objClass = dojo.byId('objectClass').value;
      } catch(e) {
        objClass = 'Other';
      }
      if (objClass == 'Notification'){
        loadContent("objectMain.php?objectClass="+objClass,"centerDiv");
      }
      refreshNotificationTree(false);
      loadContent("../view/menuNotificationRead.php", "drawNotificationUnread");
    }
  });
}



// MTY - GENERIC DAY OFF
function addGenericBankOffDays(idCalendarDefinition) {
    if (checkFormChangeInProgress()) {
      showAlert(i18n('alertOngoingChange'));
      return;
    }

    var params="&idGenericBankOffDays=0";
    params += "&idCalendarDefinition="+idCalendarDefinition;
    params += "&addMode=true&editMode=false";
    
    loadDialog('dialogGenericBankOffDays',null,true,params,true);        
}

function editGenericBankOffDays(idGenericBankOffDays,
                                idCalendarDefinition,
                                name,
                                month,
                                day,
                                easterDay
                                ) {
    if (checkFormChangeInProgress()) {
      showAlert(i18n('alertOngoingChange'));
      return;
    }
    var params = "&idGenericBankOffDays="+idGenericBankOffDays;
    params+="&idCalendarDefinition="+idCalendarDefinition;
    params+="&name="+name;
    params+="&month="+month;
    params+="&day="+day;
    params+="&easterDay="+easterDay;
    params +="&addMode=false&editMode=true";
    loadDialog('dialogGenericBankOffDays',null,true,params,true);    
}

function saveGenericBankOffDays() {
  var formVar=dijit.byId('genericBankOffDaysForm');
  if (formVar.validate()) {
    loadContent("../tool/saveGenericBankOffDays.php", "resultDivMain", "genericBankOffDaysForm", true, 'calendarBankOffDays');
    dijit.byId('dialogGenericBankOffDays').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function removeGenericBankOffDays(id, name) {
    if (checkFormChangeInProgress()) {
        showAlert(i18n('alertOngoingChange'));
        return;
    }
    actionOK=function() {
        loadContent("../tool/removeGenericBankOffDay.php?idBankOffDay="+id, "resultDivMain", null, true, 'calendarBankOffDays');
    };
    msg=i18n('confirmDeleteGenericBankOffDay', new Array(name));
    showConfirm(msg, actionOK);
}
// MTY - GENERIC DAY OFF

function showDialogAutoSendReport(){
	setTimeout(loadDialog('dialogAutoSendReport',null,true,null,true), 200);
}

function saveAutoSendReport(){
	var formVar=dijit.byId('autoSendReportForm');
	  if (dijit.byId('destinationInput').get('value') == '' && dijit.byId('otherDestinationInput').get('value') == '') {
	      showAlert(i18n("errorNoReceivers"));
	      return;
	  }
	  if (formVar.validate()) {
		  loadContent("../tool/saveAutoSendReport.php", "resultDivMain", "autoSendReportForm", true, "report");
		  dijit.byId('dialogAutoSendReport').hide();
	  } else {
	    showAlert(i18n("alertInvalidForm"));
	  }
}

function refreshRadioButtonDiv(){
	loadContent("../tool/refreshButtonAutoSendReport.php", "radioButtonDiv", "autoSendReportForm");
}
		  
function saveModuleStatus(id,status) {
  if (id==12 && (status==false || status=='false')) {
      actionOK = function () {
        adminDisconnectAll(false);
        saveModuleStatusContinue(id,status);
      };
      actionKO = function () {
          dijit.byId("module_12").set("checked",true);
      };
      msg=i18n("thisActionWillDeleteAllsLeavesSystemElements")+"<br/><br/>"+i18n("AreYouSure")+" ?";
      showQuestion(msg, actionOK, actionKO);
  } else {
    saveModuleStatusContinue(id,status);
  }
}   

function saveModuleStatusContinue(id,status) {
  var url='../tool/saveModuleStatus.php?idModule='+id+'&status='+status;
  dojo.xhrGet({
    url : url+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(){
    }
  });
  dojo.query(".moduleClass.parentModule"+id).forEach(function(domNode){
    var name=domNode.getAttribute('widgetid');
    var widget=dijit.byId(name);
    if (widget) {
      var idSub=name.replace('module_','');
      var parentActive=dojo.byId('parentActive_'+idSub).value;
      if((parentActive==1 && status==true) || status==false){
        widget.set('checked',(status==true)?true:false);
        var url='../tool/saveModuleStatus.php?idModule='+idSub+'&status='+status;
        dojo.xhrGet({
          url : url+'&csrfToken='+csrfToken,
          handleAs : "text",
          load : function(){
          }
        });
      }
    }
  });
  saveModuleStatusCheckParent(id);  
}

function saveModuleStatusCheckParent(id) {
  var wdgt=dijit.byId('module_'+id);
  var parent=wdgt.get('parent');
  var notActiveAlone=(dojo.byId('notActiveAlone_'+parent))?dojo.byId('notActiveAlone_'+parent).value:false;
  if (dojo.byId('module_'+parent)) {
    var oneOn=false;
    var allOff=true;
    dojo.query(".moduleClass.parentModule"+parent).forEach(function(domNode){
      var name=domNode.getAttribute('widgetid');
      var widget=dijit.byId(name);
      if (widget) {
        if (widget.get('checked')==true) {
          allOff=false;
          oneOn=true;
        }
      }
    });
    var status=(oneOn==true)?true:false;
    var widget=dijit.byId('module_'+parent);
    if (widget.get('checked')!=status && ((notActiveAlone=='1' && status==false) || status==true)) {
      widget.set('checked',status);
      var url='../tool/saveModuleStatus.php?idModule='+parent+'&status='+status;
      dojo.xhrGet({
        url : url+'&csrfToken='+csrfToken,
        handleAs : "text",
        load : function(){         
        }
      });
    }
  }
}

function controlChar (){
  var requiredLength=dojo.byId('paramPwdLth').value;
  var gen= new RegExp(["^(?=.*[a-zA-Z0-9!@#$&()-`.+,/\"])"]);
  var min =new RegExp([ "^(?=.*[a-z])"]);
  var maj =new RegExp([ "^(?=.*[A-Z])"]);
  var num=new RegExp(["^(?=.*[0-9])"]);
  //var char=new RegExp("(\?\=\.\*\[\@\#\$\%\^\&\\\/\~\"\'\])");
  var char=new RegExp(/[!@#$%^&*(),.?":;{}|<>~'Â°\=\+â‚¬Â£_\\\/|Â§\{\}\[\]\-]/);
  var progress=dojo.byId('progress');
  var value=0;
  var curpwd=dojo.byId('dojox_form__NewPWBox_0').value;
  addVal=[0,0,0,0];
  if (curpwd.length>=requiredLength) {
    addVal[0]=1;
    value+=1; 
  }
  if( min.test(curpwd) && maj.test(curpwd) ){
    addVal[1]=1;
    value+=1;    
  }
  if(num.test(curpwd)){
    addVal[2]=1;
    if (min.test(curpwd) || maj.test(curpwd) ) value+=1;
  } 
  if(char.test(curpwd)){
    addVal[3]=1;
    if (min.test(curpwd) || maj.test(curpwd) ) value+=1;
  }
  progress.value=value;
  var strength=dojo.byId('parmPwdSth').value;
  var enough=false;
  var msg=i18n('pwdRequiredStrength');
  if(strength==1){
    if (addVal[0]==1) enough=true;
  }else if(strength==2){
    if (addVal[0]==1 && addVal[1]==1) enough=true;
  }else if(strength==3){
    if (addVal[0]==1 && addVal[1]==1 && addVal[2]==1) enough=true; 
  }else if(strength==4){
    if (addVal[0]==1 && addVal[1]==1 && addVal[2]==1 && addVal[3]==1) enough=true;
  }
  if (addVal[0]==0 && strength>=1) msg+='<br/>&nbsp;-&nbsp;'+i18n("pwdErrorLength",[requiredLength]);
  if (addVal[1]==0 && strength>=2) msg+='<br/>&nbsp;-&nbsp;'+i18n("pwdErrorCase");
  if (addVal[2]==0 && strength>=3) msg+='<br/>&nbsp;-&nbsp;'+i18n("pwdErrorDijit");
  if (addVal[3]==0 && strength>=4) msg+='<br/>&nbsp;-&nbsp;'+i18n("pwdErrorChar");
  var strengthMsg=document.getElementById('strength');
  dojo.byId('passwordValidate').value=(enough)?'true':'false';
  dojo.byId('criteria').value=msg;
  require(["dijit/Tooltip", "dojo/domReady!"], function(Tooltip) {
    var node = dojo.byId('dojox_form__NewPWBox_0');
    if (enough) {
      Tooltip.hide(node);
      strengthMsg.innerHTML=i18n('pwdValidStrength');
      strengthMsg.style="color:green;";
    } else {      
      Tooltip.show(msg, node);
      strengthMsg.innerHTML=i18n('pwdInvalidStrength');
      strengthMsg.style="color:red;";
    }
  });
}

function refreshDataCloningCountDiv(userSelected){
	loadContent("../tool/refreshDataCloningCountDiv.php?userSelected="+userSelected+'&destinationWidth='+dojo.byId('listDiv').offsetWidth, "labelDataCloningCountDiv", "addDataCloningForm");
}

function selectAllCheckBox(val){
  dojo.query(val).forEach(function(node, index, nodelist) {
      if(dijit.byId('dialogMailAll').get('checked')!=true){
        dijit.byId(node.getAttribute('widgetid')).set('checked', false);
      }else{
        dijit.byId(node.getAttribute('widgetid')).set('checked', true);
      }
    });
}

function saveContact(idFldVal,comboClass){
  var addVal=dojo.byId('objectId').value;
  var obj=dojo.byId('objectClass').value;
  var parm="operation=add&objectClass="+comboClass+"&listId="+idFldVal+"&class="+obj+"&addVal="+addVal;
  loadContent("../tool/saveContact.php?"+parm, "resultDivMain",null,true,"contact"+dojo.byId('objectClass'));
}

function removeContact(idFldVal){
  var obj=dojo.byId('objectClass').value;
  var parm="operation=remove&objectClass=Contact&objectId="+idFldVal+"&class="+obj;
  actionOK=function() {
    loadContent("../tool/removeContact.php?"+parm, "resultDivMain",null,true,"contact"+dojo.byId('objectClass'));
  };
  msg=i18n('confirmDissociate', new Array(i18n('Contact'),idFldVal));
  showConfirm(msg, actionOK);
}
// End

var currentSelectedModuleMenu=null;
function showDisplayModule(id,total){
  if(dojo.byId("displayModule"+id).style.display=="block"){
      dojo.byId("moduleTitle_"+id).style.width=260+'px';
      dojo.byId("displayModule"+id).style.display="none";
  }else{
    for (var i=1; i <= total; i++) {
      if(dojo.byId("moduleTitle_"+i)){
        if(dojo.byId("moduleTitle_"+i).style.width==290+'px'){
          dojo.byId("moduleTitle_"+i).style.width=260+'px';
        }
      }
      if(dojo.byId("displayModule"+i)){
        if(dojo.byId("displayModule"+i).style.display=="block"){
          dojo.byId("displayModule"+i).style.display="none";
          dojo.byId("displayModule"+i).style.visibility = 'hidden';
          dojo.byId("displayModule"+i).style.opacity = 0;
        }
      }
    }
    if(dojo.byId("displayModule"+id)){
      currentSelectedModuleMenu=id;
      dojo.byId("displayModule"+id).style.display="block";
      dojo.byId("displayModule"+id).style.visibility="visible";
      dojo.byId("displayModule"+id).style.opacity=1;
      positionTopForCurrentSelectedModule(id);  
    }
    dojo.byId("moduleTitle_"+id).style.width=290+'px';
  }
}
function positionTopForCurrentSelectedModule(id) {
  if (!id) id=currentSelectedModuleMenu;
  if (!id) return;
  if (!dojo.byId("displayModule"+id)) return;
  dojo.byId("displayModule"+id).style.top=dojo.byId("moduleMenuDiv_"+id).offsetTop+"px";
  actualTop=dojo.byId("displayModule"+id).offsetTop;
  scroll=dojo.byId("detailDiv").scrollTop;
  position=actualTop - scroll;
  height=dojo.byId("displayModule"+id).offsetHeight;
  containerHeight=dojo.byId("detailDiv").offsetHeight;
  border=5;
  if (actualTop<scroll) {
    dojo.byId("displayModule"+id).style.top=scroll+"px";
  } else if (position+height+border>containerHeight ) {
    newTop=actualTop-(position+height+border)+containerHeight;
    if (newTop<scroll) newTop=scroll;
    dojo.byId("displayModule"+id).style.top=newTop+"px";
  }
}

function filterMenuModule(id,nbTotal){
  var reset = 0;
  for (var i=1; i <= 7; i++) {
    if(dojo.hasClass(dojo.byId("menuFilterModuleTop"+i),'menuBarItemSelectedModule')){
      if(id==i){
        reset = 1;
      }
      dojo.removeClass(dojo.byId("menuFilterModuleTop"+i),"menuBarItemSelectedModule");
      dojo.removeClass(dojo.byId("menuFilterModuleTopIcon"+i),"menuFilterModuleTopIcon");
    }
  }
  if(reset==0){
    dojo.addClass(dojo.byId("menuFilterModuleTop"+id),"menuBarItemSelectedModule");
    dojo.addClass(dojo.byId("menuFilterModuleTopIcon"+id),"menuFilterModuleTopIcon");
  }else{
    id=1;
    dojo.addClass(dojo.byId("menuFilterModuleTop"+id),"menuBarItemSelectedModule");
    dojo.addClass(dojo.byId("menuFilterModuleTopIcon"+id),"menuFilterModuleTopIcon");
  }
  
  if(id==2){
    var tab = [1,9,16,22];
  }else if(id==3){
    var tab = [2,16];
  }else if(id==4){
    var tab = [4,8,9,10];
  }else if(id==5){
    var tab = [5,6,7,19,20];
  }else if(id==6){
    var tab = [17,13,15];
  }
  for (var i=1; i <= nbTotal; i++) {
    if(id==1){
      if(dojo.byId("moduleMenuDiv_"+i)){
        dojo.byId("moduleMenuDiv_"+i).style.display="block";
      }
    }else{
      if(dojo.byId("moduleMenuDiv_"+i)){
        if(tab.indexOf(i) !== -1){
          dojo.byId("moduleMenuDiv_"+i).style.display="block";
        }else{
          dojo.byId("moduleMenuDiv_"+i).style.display="none";
          if(dojo.byId("displayModule"+i).style.display=="block"){
            dojo.byId("displayModule"+i).style.display="none";
            dojo.byId("moduleTitle_"+i).style.width=260+'px';
          }
        }
      }
    }
  }
}

function filterMenuModuleDisable(nbTotal){
  for (var i=1; i <= 6; i++) {
    if(dojo.hasClass(dojo.byId("menuFilterModuleTop"+i),'menuBarItemSelectedModule')){
      dojo.removeClass(dojo.byId("menuFilterModuleTop"+i),"menuBarItemSelectedModule");
      dojo.removeClass(dojo.byId("menuFilterModuleTopIcon"+i),"menuFilterModuleTopIcon");
    }
  }
  var reset = 0;
  if(dojo.hasClass(dojo.byId("menuFilterModuleTop7"),'menuBarItemSelectedModule')){
    reset = 1;
  }
  if(reset==0){
    dojo.addClass(dojo.byId("menuFilterModuleTop7"),"menuBarItemSelectedModule");
    dojo.addClass(dojo.byId("menuFilterModuleTopIcon7"),"menuFilterModuleTopIcon");
    for (var i=1; i <= nbTotal; i++) {
      if(dojo.byId("moduleTitle_"+i)){
        if(dojo.hasClass(dojo.byId("moduleMenuDiv_"+i),'activeModuleMenu')){
          dojo.byId("moduleMenuDiv_"+i).style.display="none";
          if(dojo.byId("displayModule"+i).style.display=="block"){
            dojo.byId("displayModule"+i).style.display="none";
            dojo.byId("moduleTitle_"+i).style.width=260+'px';
          }
        }else{
          dojo.byId("moduleMenuDiv_"+i).style.display="block";
        }
      }
    }
  }else{
    filterMenuModule(1,nbTotal);
  }
}

function changeSpeedAnimation (val){
  dojo.byId('animationSpeed').value=val;
  dijit.byId('lowAnimation').selected='false';
  dijit.byId('medAnimation').selected='false';
  dijit.byId('fastAnimation').selected='false';
  
  switch(val){
  case 'Low':
      dijit.byId('lowAnimation').selected='true';
    break;
  case 'Med':
      dijit.byId('medAnimation').selected='true';
    break;
  case 'Fast':
      dijit.byId('fastAnimation').selected='true';
    break;
  }
  saveUserParameter('animationSpeedMode',val);
}

function multipleUpadteSelectAtribute(value) {
  if (value) {
    filterStartInput=true;
    var displayFormatInputation=false;
    var displayFormatWork=false;
    dijit.byId('idMultipleUpdateAttribute').store.fetchItemByIdentity({
      identity : value,
      onItem : function(item) {
        var dataType=dijit.byId('idMultipleUpdateAttribute').store.getValue(
            item, "dataType", "inconnu");
        if(value=="refTypeIncome" || value=="refTypeExpense"){
          dataType="list";
        }
        if(value=="maxDailyWork" || value=="maxWeeklyWork"){
          displayFormatInputation=true;
        }
        if(value=="workVal"){
          displayFormatWork=true;
        }
        var datastoreOperator=new dojo.data.ItemFileReadStore({
          url : '../tool/jsonList.php?listType=operator&actualView=MultipleUpadate&dataType=' + dataType+'&csrfToken='+csrfToken
        });
        var storeOperator=new dojo.store.DataStore({
          store : datastoreOperator
        });
        storeOperator.query({
          id : "*"
        });
        dojo.byId('multipleUpdateOperateur').visibility = 'visible';
        if(dataType!='textarea'){
          dojo.byId('isLongText').value="";
          if(dojo.byId('multipleUpdateOperateur').firstChild.innerHTML==undefined || dojo.byId('multipleUpdateOperateur').firstChild.innerHTML!=i18n('replaceMultipleUpadte') ){
            var spanVal=document.createElement('span');
            spanVal.setAttribute('style','position:relative;');
            spanVal.innerHTML=i18n('replaceMultipleUpadte');
            if(dojo.byId('multipleUpdateOperateur').firstChild.innerHTML!=undefined )dojo.byId('multipleUpdateOperateur').removeChild(dojo.byId('multipleUpdateOperateur').firstChild);
            dojo.byId('multipleUpdateOperateur').insertAdjacentElement('afterbegin',spanVal);
          }
        }
        dojo.byId('dataTypeSelected').value=dataType;
        if (dataType == "bool") {
          filterType="bool";
          dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
            display : 'none'
          });
          if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
            dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
              display : 'block'
            });
            dijit.byId('multipleUpdateValueCheckbox').set('value', 'off');
          } else {
            dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
              display : 'block'
            });
            dijit.byId('multipleUpdateValueCheckbox').set('checked', '');
          }
          dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
            display : 'none'
          });
        }else if(dataType == "color"){
          filterType="color";
          dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
            display : 'block'
          });
          dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
            display : 'none'
          });
          if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
            dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
              display : 'none'
            });
            dijit.byId('multipleUpdateValueCheckbox').set('value', 'off');
          } else {
            dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
              display : 'none'
            });
            dijit.byId('multipleUpdateValueCheckbox').set('checked', '');
          }
          dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
            display : 'none'
          });
        } else if (dataType == "decimal" || dataType=="numeric") {
          filterType=dataType;
          dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
            display : 'inline-block'
          });
          if(displayFormatInputation){
            dojo.byId('formatInputation').style.display= 'inline-block';
          }
          if(displayFormatWork){
            dojo.byId('formatWork').style.display ='inline-block';
          }
          dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
            display : 'none'
          });
          if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
            dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
              display : 'none'
            });
            dijit.byId('multipleUpdateValueCheckbox').set('value', 'off');
          } else {
            dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
              display : 'none'
            });
            dijit.byId('multipleUpdateValueCheckbox').set('checked', '');
          }
          dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
            display : 'none'
          });
        } else if (dataType == "list") {
          filterType="list";
          var extraUrl="";
          if (value == 'idTargetVersion' || value == 'idTargetProductVersion' || value == 'idOriginalProductVersion') {
            value='idProductVersion';
            extraUrl='&critField=idle&critValue=all';
          } else if (value == 'idTargetComponentVersion' || value == 'idOriginalComponentVersion') {
            value='idComponentVersion';
            extraUrl='&critField=idle&critValue=all';
          }
          var urlListFilter='../tool/jsonList.php?listType=list&dataType='+value+'&actualView=MultipleUpadate';

          if (typeof currentSelectedProject!='undefined' && currentSelectedProject!='' && currentSelectedProject!='*') {
          if (value=='idActivity') {
              urlListFilter+='&critField=idProjectSub&critValue='+currentSelectedProject;
            } if (value=='idComponent') {
              // noting
            } else {
              urlListFilter+='&critField=idProject&critValue='+currentSelectedProject;
            }
            if (extraUrl=='&critField=idle&critValue=all') {
              extraUrl=='&critField1=idle&critValue1=all';
            }
          }
          if (extraUrl!="") {
            urlListFilter+=extraUrl;
          }  
          var tmpStore=new dojo.data.ItemFileReadStore({
            url : urlListFilter+'&csrfToken='+csrfToken
          });
          var mySelect=dojo.byId("multipleUpdateValueList");
          mySelect.options.length=0;
          var nbVal=0;
          if(dijit.byId('idMultipleUpdateAttribute').getValue()=="idBusinessFeature"){
            var listId = "";
            tmpStore.fetch({
                query : {
                  id : "*"
                },
                onItem : function(item) {
                  listId += (listId != "") ? '_' : '';
                    listId += parseInt(tmpStore.getValue(item, "id", ""), 10) + '';
                    nbVal++;
                },
                onError : function(err) {
                  console.info(err.message);
                },
                onComplete : function() { 
                  dojo.xhrGet({
                  url : '../tool/getProductNameFromBusinessFeature.php?listId=' + listId+'&csrfToken='+csrfToken,
                handleAs : "text",
                load: function(data){
                  var listName = JSON.parse(data);
                  tmpStore.fetch({
                          query : {
                            id : "*"
                          },
                          onItem : function(item) {
                            mySelect.options[mySelect.length]=new Option(tmpStore.getValue(item, "name", "") + " (" + listName[tmpStore.getValue(item, "id", "")] + ")", tmpStore.getValue(item, "id", ""));
                          },
                          onError : function(err) {
                            console.info(err.message);
                          }
                        });
                }
                  });
                 }
              });
          }else{
            tmpStore.fetch({
                  query : {
                    id : "*"
                  },
                  onItem : function(item) {
                    mySelect.options[mySelect.length]=new Option(tmpStore.getValue(
                        item, "name", ""), tmpStore.getValue(item, "id", ""));
                    nbVal++;
                  },
                  onError : function(err) {
                    console.info(err.message);
                  }
                });
          }
          dojo.removeAttr('multipleUpdateValueList','multiple');
          dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
            display : 'block'
          });
          dojo.xhrGet({
            url : "../tool/checkAccessForScreen.php?listType="+value+"&csrfToken="+csrfToken,
            handleAs : "text",
            load : function(data) {
              if(data && data=="YES"){          
                dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {display : 'block'}); 
              } else {
                dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {display : 'none'});
              }
            }
          });
          dijit.byId('showDetailInMultipleUpdate').set('value', item.id);
          dijit.byId('multipleUpdateValueList').reset();
          dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
            display : 'none'
          });
          if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
            dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
              display : 'none'
            });
          }
          dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
            display : 'none'
          });
        } else if (dataType == "date" || dataType=="datetime" || dataType=="time") {
          filterType="date";
          dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
            display : 'none'
          });
          if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
            dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
              display : 'none'
            });
          }
          dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
            display : 'none'
          });
          if(dataType=="datetime" || dataType=="date") {
            dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
              display : 'block'
            });
          }
          if(dataType=="datetime" || dataType=="time"){
            dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
              display : 'block'
            });
          }
          dijit.byId('multipleUpdateValueDate').reset();
          dijit.byId('multipleUpdateValueTime').reset();
        } else if (dataType=="textarea" || dataType=="note"){
          dojo.byId('isLongText').value="true";
          dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
            display : 'block'
          });
          if(dojo.byId('multipleUpdateOperateur').firstChild.innerHTML==undefined || dojo.byId('multipleUpdateOperateur').firstChild.innerHTML!=i18n('addMultipleUpdate')){
            var spanVal=document.createElement('span');
            spanVal.setAttribute('style','position:relative;top:10px;');
            spanVal.innerHTML=i18n('addMultipleUpdate');
            if(dojo.byId('multipleUpdateOperateur').firstChild.innerHTML!=undefined )dojo.byId('multipleUpdateOperateur').removeChild(dojo.byId('multipleUpdateOperateur').firstChild);
            dojo.byId('multipleUpdateOperateur').insertAdjacentElement('afterbegin',spanVal);
          }
          dojo.byId('multipleUpdateOperateur').visibility = 'hidden';
          dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
            display : 'none'
          });
          if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
            dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
              display : 'none'
            });
          }
          dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
            display : 'none'
          });
        }else {
          filterType="text";
          dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
            display : 'block'
          });
          dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
            display : 'none'
          });
          dijit.byId('newMultipleUpdateValue').reset();
          dijit.byId('newMultipleUpdateValueNum').reset();
          dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
            display : 'none'
          });
          if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
            dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
              display : 'none'
            });
          }
          dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
            display : 'none'
          });
          dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
            display : 'none'
          });
        }
      },
      onError : function(err) {
        dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
          display : 'none'
        });
        dojo.byId('multipleUpdateOperateur').visibility = 'hidden';
        dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
          display : 'none'
        });
        dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
          display : 'none'
        });
        dojo.style(dijit.byId('newMultipleUpdateValueueList').domNode, {
          display : 'none'
        });
        dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
          display : 'none'
        });
        dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
          display : 'none'
        });
        if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
          dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
            display : 'none'
          });
        }
        dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
          display : 'none'
        });
        dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
          display : 'none'
        });
        // hideWait();
      }
    });
    dijit.byId('newMultipleUpdateValueNum').reset();
    dijit.byId('newMultipleUpdateValue').reset();
    dijit.byId('multipleUpdateValueList').reset();
    dijit.byId('multipleUpdateValueCheckbox').reset();
    if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { dijit.byId('multipleUpdateValueCheckboxSwitch').reset();}
    dijit.byId('multipleUpdateValueDate').reset();
    dijit.byId('multipleUpdateTextArea').reset();
    
  } else {
    dojo.byId('multipleUpdateOperateur').visibility = 'hidden';
    dojo.style(dijit.byId('multipleUpdateColorButton').domNode, {
      display : 'none'
    });
    dojo.style(dijit.byId('newMultipleUpdateValue').domNode, {
      display : 'none'
    });
    dojo.style(dijit.byId('newMultipleUpdateValueNum').domNode,{
      display : 'none'
    });
    dojo.style(dijit.byId('multipleUpdateValueList').domNode, {
      display : 'none'
    });
    dojo.style(dijit.byId('showDetailInMultipleUpdate').domNode, {
      display : 'none'
    });
    dojo.style(dijit.byId('multipleUpdateValueCheckbox').domNode, {
      display : 'none'
    });
    if (dijit.byId('multipleUpdateValueCheckboxSwitch')) { 
      dojo.style(dijit.byId('multipleUpdateValueCheckboxSwitch').domNode, {
        display : 'none'
      });
    }
    dojo.style(dijit.byId('multipleUpdateValueDate').domNode, {
      display : 'none'
    });
    dojo.style(dijit.byId('multipleUpdateValueTime').domNode, {
      display : 'none'
    });
    dojo.style(dijit.byId('multipleUpdateTextArea').domNode, {
      display : 'none'
    });
  }
}

function setLstDocumentRight(lst,val){
  var valueLst=dojo.byId(lst).value;
  if (valueLst.indexOf(val)!=-1)return;
  if(valueLst==''){
    dojo.byId(lst).value=val;
  }else{
    dojo.byId(lst).value=valueLst+','+val;
  }
}

var activFuncHideShowDropDiv=false;
function hideShowDropDiv(mode,subTaskRawId){
  event.preventDefault();
  var el=dojo.byId(subTaskRawId);
  divAttach=el.querySelector('.divAttachSubTask');
  if(dijit.byId('attachmentFileDirect'))dijit.byId('attachmentFileDirect').reset();
  if(mode=='show'){
      el.style.background="var(--color-button-background-selected)";
      el.style.opacity='50%';
      el.style.border=" 2px dashed grey";

      activFuncHideShowDropDiv=true;
  }else if(mode =='hide'){
    el.style.background="unset";
    el.style.opacity='unset';
    el.style.border="";
      activFuncHideShowDropDiv=false;
  }else {
    activFuncHideShowDropDiv=false;
    el.style.background="unset";
    el.style.opacity='unset';
    el.style.border="";
  }

}

function setDragAndDropAttachmentSubTask(destination,tableClass,rawClass,attachmentDivClass){
  var dest=dojo.byId(destination);
  var allTable=dest.querySelectorAll('.'+tableClass);
  
  allTable.forEach(function(table){
    var allRaw=table.querySelectorAll('.'+rawClass);
    allRaw.forEach(function(el){
      var divAttach=el.querySelector('.'+attachmentDivClass);
      if(divAttach.childNodes[1] && divAttach.childNodes[1].firstChild && divAttach.childNodes[1].firstChild.id){
        var idDiv=divAttach.childNodes[1].firstChild.id;
        dijit.byId(idDiv).reset();
        dijit.byId(idDiv).addDropTarget(el,false);
      }
      
    });
  });
}

function refreshSubTaskAttachment(idSubTask){
  loadDiv('../view/refreshSubTaskAttachmentDiv.php?idSubTask='+idSubTask ,'divAttachement_'+idSubTask);
}


function selectResources(type,target,project) {
  loadDialog('dialogSelectResources',null,true,'&type='+type+'&list='+dojo.byId(target).value+'&target='+target+'&project='+project,true);
}

function selectResourcesValidated(targeted,target2) {
  selectResourcesSelected.sync();
  var nodeList=selectResourcesSelected.getAllNodes();
  var arrayValues=new Array();
  for (var i=0; i < nodeList.length; i++) {
    arrayValues[i]=nodeList[i].getAttribute('userid');
  }
  var result = "";
  for (var i=0; i < nodeList.length; i++) {
    if(result==""){
      result += arrayValues[i];
    }else{
      result += ";"+arrayValues[i];
    }
  }
  var dest = target2+'Display';
  dojo.byId(targeted).value=result;
  dijit.byId(dest).set('value',result);
  setTimeout('selectResourcesTransformIdToName( \''+dest+'\')', 100);
  setTimeout("dijit.byId('dialogSelectResources').hide()", 200);
}

function selectResourcesTransformIdToName(target){
    dojo.xhrGet({
      url : '../tool/getSingleData.php?dataType=selectResourceTransformIdToName&idResource='+dijit.byId('paramTryToHackUserListDisplay').get('value')+'&csrfToken='+csrfToken,
      handleAs : "text",
      load : function(data) {
         dijit.byId(target).setDisplayedValue(data);
      }
    });
}

function resizeActivityStreamToday (){
  if(showHideActivityStreamTodayRun)return;
  var dimension =250;
  var duration=50;
  todayActiStreamDivLastWidth=dimension;
  var classicViewDim = dojo.byId("centerDiv").offsetWidth-dimension-5;
  saveContentPaneResizing("contentPaneTodayActStreamWidth", dimension, true);
  saveContentPaneResizing("contentPaneTodayClassicViewWidth", classicViewDim, true);
  dojox.fx.combine([ dojox.fx.animateProperty({
    node : "todayClassicView",
    properties : {
     width : classicViewDim,
  },
  duration : duration
  }), dojox.fx.animateProperty({
    node : "todayActStream",
    properties : {
    width : dimension
  },
  duration : duration
  })]).play();
  setTimeout('dijit.byId("globalContainer").resize();', duration+5);
}

function saveSynchronizeDefinition() {
  var formVar=dijit.byId('synchroniseDefinitionForm');
  if (formVar.validate()) {
    loadContent("../tool/saveSynchronizationDefinition.php", "resultDivMain", "synchroniseDefinitionForm",true, 'Synchronization');
    dijit.byId('dialogSynchroniseDefinition').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function saveDisableSynchronizeDefinition() {
  var formVar=dijit.byId('disableSynchronizeDefinitionForm');
  if (formVar.validate()) {
    loadContent("../tool/saveDisableSynchronizationDefinition.php", "resultDivMain", "disableSynchronizeDefinitionForm",true, 'Synchronization');
    dijit.byId('dialogDisableSynchronizeDefinition').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function setAttributionVoteElement() {
  if (!dijit.byId("attributionVoteRule")|| !dijit.byId("attributionVoteRule").get("value"))return;
  var idVoteRule=dijit.byId("attributionVoteRule").get("value");
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=attributionVoteRule&id='+idVoteRule+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      arrayData=data.split('#!#!#!#!#!#');
        if(arrayData[0] == 'none'){
          dijit.byId("attributionVoteElement").set("readOnly",false);
          dijit.byId('attributionVoteElement').set('value', '');
        }else{
          dijit.byId("attributionVoteElement").set("readOnly",true);
          dijit.byId('attributionVoteElement').set('value', arrayData[0]);
        }
        dijit.byId('attributionVoteTotal').set('value', arrayData[1]);
      }
  });
    
}

function newDetailItemLink (){
  var linkType=dijit.byId('linkRef2Type').get("value");
  if (linkType) {
    var objectClass=linkableArray[linkType];
    if (canCreateArray[objectClass] == "YES") {
      dojo.byId('comboName').value='linkRef2Id';
      dojo.byId('comboClass').value=objectClass;
      dijit.byId("dialogDetail").show();
      hideField('comboSearchButton');
      hideField('comboDetailResult');
      showWait();
      hideField('comboSelectButton');
      hideField('comboNewButton');
      showField('comboSaveButton');
      showField('comboCloseButton');
      destinationWidth=frames['comboDetailFrame'].document.body.offsetWidth
      page="comboSearch.php?objectClass=" + objectClass+"&objectId=0&mode=new&destinationWidth=" + destinationWidth;
      window.top.frames['comboDetailFrame'].location.href=page+'&csrfToken='+csrfToken;
      setTimeout('dijit.byId("dialogDetail").show()', 10);   
    }else{
      showInfo(i18n('errorCreateRights'));
    }

  } else {
    showInfo(i18n('messageMandatory', new Array(i18n('linkType'))));
  }
 
}

function changeVoteSelf(voteUserId,valueUser){
  var voteSelfValue=dijit.byId("voteSelf").get("value");
  if(!voteSelfValue)voteSelfValue=0;
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=voteSelf&id='+voteSelfValue+'&voteUserId='+voteUserId+'&valueUser='+valueUser+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
        dijit.byId('pointsVote').set('value', data);
      }
  });
}


//=========================================================
//Other
//=========================================================

//var objectClass=dojo.byId('objectClass').value;
//var objectId=dojo.byId('objectId').value;
//var param='';
//if(objectClass!=null && objectId!=null && dojo.byId('mailRefType') &&
//dojo.byId('mailRefId').value){
//dojo.byId('mailRefType').value=dojo.byId('objectClass').value;
//dojo.byId('mailRefId').value=dojo.byId('objectId').value;
//param="&objectClass=" +objectClass+"&objectId=" +objectId;
//}

// florent ticket 4442
function showAttachedSize(size,name,id,type){
  var totalSize=dojo.byId('totalSizeNoConvert').value;
  var maxSize=Number(dojo.byId('maxSizeNoconvert').value);
  var attachments=dojo.byId('attachments').value;
  var addAttachments='';
  if(isNaN(size)){
   size=0;
  }
  if(dijit.byId('dialogMail'+name).get('checked')==true){
   totalSize=Number(totalSize)+Number(size);
   if(attachments!=''){
     addAttachments=attachments+'/'+id+'_'+type;
   }else{
     addAttachments=id+'_'+type;
   }
   dojo.byId('attachments').value=addAttachments;
  }else{
   var regex='/'+id+'_'+type;
   if(attachments.indexOf('/'+id+'_'+type)!=-1){
     addAttachments=attachments.replace(regex,'');
   }else{
     regex=id+'_'+type;
     addAttachments=attachments.replace(regex,'');
   }
   dojo.byId('attachments').value=addAttachments;
   totalSize=Number(totalSize)-Number(size);
  }
  var noConvert=totalSize;
  if(totalSize!=0){
   totalSize=octetConvertSize(totalSize);
  }
  if( maxSize < noConvert ){
   dojo.byId('infoSize').style.color="red";
   dojo.byId('totalSize').style.color="red";
  }else if ((maxSize >= noConvert) || noConvert==0) {
   dojo.byId('infoSize').style.color="green";
   dojo.byId('totalSize').style.color="green";
  }
  dojo.byId('totalSizeNoConvert').value=noConvert;
  dojo.byId('totalSize').value=totalSize;
}

function octetConvertSize(octet){
  if(octet!=0 && octet!='-'){
   octet = Math.abs(parseInt(octet, 10));
   var def = [[1, ' octets'], [1024, ' ko'], [1024*1024, ' Mo'], [1024*1024*1024, ' Go'], [1024*1024*1024*1024, ' To']];
   for(var i=0; i<def.length; i++){
     if(octet<def[i][0]) return (octet/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
   }
  }else{
   return i18n('errorNotFoundAttachment');
  }

}

clearDivDelayedTimeout=[];
function clearDivDelayed(divName,delay) {
  if (clearDivDelayedTimeout[divName]) clearTimeout(clearDivDelayedTimeout[divName]);
  if (!divName) return;
  if (!delay) delay=2000;
  clearDivDelayedTimeout[divName]=setTimeout("if (dojo.byId('" + divName + "')) dojo.byId('" + divName + "').innerHTML='';",delay);
}

function purgeAssignmentTable(){
  var objectClass = null;
  var objectId = null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objectClass=dojo.byId('assignmentObjectClass').value;
    objectId = dojo.byId("assignmentObjectId").value;
  }else{
    objectClass=dojo.byId('objectClass').value;
    objectId = dojo.byId("objectId").value;
  }
  
  var actionOK = function(){
    showWait();
    dojo.xhrGet({url : '../tool/purgeAssignment.php?&csrfToken='+csrfToken+'&objectClass='+objectClass+'&objectId='+objectId,
      handleAs : "text",
      load : function(data) {
          if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
            var params="&objectClass=" + objectClass + "&objectId=" + objectId;
            loadDialog('dialogEditAssignmentPlanning', null, true, params);
          }else{
            loadContent("objectDetail.php", "detailDiv", "listForm");
          }
        }
    });
  };
  showConfirm(i18n('confirmPurgeAssignment', new Array(i18n(objectClass), parseInt(objectId))), actionOK);
}

function resetAssignmentTable(){
  var objectClass = null;
  var objectId = null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objectClass=dojo.byId('assignmentObjectClass').value;
    objectId = dojo.byId("assignmentObjectId").value;
  }else{
    objectClass=dojo.byId('objectClass').value;
    objectId = dojo.byId("objectId").value;
  }
  
  var actionOK = function(){
    showWait();
    dojo.xhrGet({url : '../tool/resetAssignment.php?&csrfToken='+csrfToken+'&objectClass='+objectClass+'&objectId='+objectId,
      handleAs : "text",
      load : function(data) {
          if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
            var params="&objectClass=" + objectClass + "&objectId=" + objectId;
            loadDialog('dialogEditAssignmentPlanning', null, true, params);
          }else{
            loadContent("objectDetail.php", "detailDiv", "listForm");
          }
        }
    });
  };
  showConfirm(i18n('confirmResetAssignment', new Array(i18n(objectClass), parseInt(objectId))), actionOK);
}

function resourceListTransformation(field) {
  var store=dijit.byId(field).store;
  for (i=0;i<store.data.length;i++) {
    store.data[i].label=store.data[i].name.replace('[[POOL]]','<span style="font-family: Verdana, Arial, Tahoma, sans-serif, icomoon;">&#xe903&nbsp;</span>');
    store.data[i].name=store.data[i].name.replace('[[POOL]]','');
  }
  if (dijit.byId(field).get("displayedValue").substr(0,8)=='[[POOL]]') {
    var val=dijit.byId(field).get("value");
    dijit.byId(field).set("value",null);
    dijit.byId(field).set("value",val);
  }
}

function showUpdateResourceCost(idRole) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var params="&idRole=" + idRole;
  loadDialog('dialogUpdateResourceCost',null,true,params,true);
}

function updateResourceCost(){
  var formVar=dijit.byId('updateResourceCostForm');
  if (formVar.validate()) {
    loadContent("../tool/updateResourceCost.php","resultDivMain",'updateResourceCostForm', true, 'updateResourceCost');
    dijit.byId('dialogUpdateResourceCost').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}


var hideToolTipTimeout=null;
function showToolTip(idToolTip){
  clearTimeout(hideToolTipTimeout);
  var toolTip = dijit.byId(idToolTip);
  if(toolTip){
    toolTip.openDropDown();
  }
}

function hideToolTip(idToolTip, delay){
  var toolTip = dijit.byId(idToolTip);
  clearTimeout(hideToolTipTimeout);
  if(toolTip){
    var callback = function(){
      toolTip.closeDropDown();
    }
    hideToolTipTimeout = setTimeout(callback, delay);
  }
}