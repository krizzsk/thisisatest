///*******************************************************************************
// * COPYRIGHT NOTICE *
// * 
// * Copyright 2009-2017 ProjeQtOr - Pascal BERNARD - support@projeqtor.org Contributors : -
// * 
// * This file is part of ProjeQtOr.
// * 
// * ProjeQtOr is free software: you can redistribute it and/or modify it under
// * the terms of the GNU Affero General Public License as published by the Free Software
// * Foundation, either version 3 of the License, or (at your option) any later
// * version.
// * 
// * ProjeQtOr is distributed in the hope that it will be useful, but WITHOUT ANY
// * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// * 
// * You should have received a copy of the GNU Affero General Public License along with
// * ProjeQtOr. If not, see <http://www.gnu.org/licenses/>.
// * 
// * You can get complete code of ProjeQtOr, other resource, help and information
// * about contributors at http://www.projeqtor.org
// * 
// * DO NOT REMOVE THIS NOTICE **
// ******************************************************************************/
//
//// ============================================================================
//// All specific ProjeQtOr functions and variables for Dialog Purpose
//// This file is included in the main.php page, to be reachable in every context
//// ============================================================================

//=============================================================================
//= Columns Mail
//=============================================================================

function dialogMailToOtherChange() {
  var show=dijit.byId('dialogMailToOther').get('checked');
  if (show) {
    showField('dialogOtherMail');
    showField('otherMailDetailButton');
  } else {
    hideField('dialogOtherMail');
    hideField('otherMailDetailButton');
  }
}

function mailerTextEditor(code) {
  var callBack=function() {
    var codeParam=dojo.byId("codeParam");
    codeParam.value=code;
    var editorType=dojo.byId("mailEditorType").value;
    if (editorType == "CK" || editorType == "CKInline") { // CKeditor type
      ckEditorReplaceEditor("mailEditor",999);
    } else if (editorType == "text") {
      dijit.byId("mailEditor").focus();
      dojo.byId("mailEditor").style.height=(screen.height * 0.6) + 'px';
      dojo.byId("mailEditor").style.width=(screen.width * 0.6) + 'px';
    } else if (dijit.byId("mailMessageEditor")) { // Dojo type editor
      dijit.byId("mailMessageEditor").set("class","input");
      dijit.byId("mailMessageEditor").focus();
      dijit.byId("mailMessageEditor").set("height",(screen.height * 0.6) + 'px'); // Works
      // on
      // first
      // time
      dojo.byId("mailMessageEditor_iframe").style.height=(screen.height * 0.6) + 'px'; // Works
      // after
      // first
      // time
    }
    dojo.byId("mailEditor").innerHTML=dojo.byId(code).value;
  };
  loadDialog('dialogMailEditor',callBack,true,null,true,true);
}

function saveMailMessage() {
  var codeParam=dojo.byId("codeParam").value;
  var editorType=dojo.byId("mailEditorType").value;
  if (editorType == "CK" || editorType == "CKInline") {
    noteEditor=CKEDITOR.instances['mailEditor'];
    noteEditor.updateElement();
    var tmpCkEditor=noteEditor.document.getBody().getText();
    var tmpCkEditorData=noteEditor.getData();
    if (tmpCkEditor.trim() == "" && tmpCkEditorData.indexOf('<img') <= 0) {
      var msg=i18n('messageMandatory',new Array(i18n('Message')));
      noteEditor.focus();
      showAlert(msg);
      return;
    }
  } else if (dijit.byId("messageMailEditor")) {
    if (dijit.byId("mailEditor").getValue() == '') {
      dijit.byId("messageMailEditor").set("class","input required");
      var msg=i18n('messageMandatory',new Array(i18n('Message')));
      dijit.byId("messageMailEditor").focus();
      dojo.byId("messageMailEditor").focus();
      showAlert(msg);
      return;
    }
  }
  var callBack=function() {
    dojo.byId(codeParam).value=tmpCkEditorData;
    dojo.byId(codeParam + "_display").innerHTML=tmpCkEditorData;
  };
  loadDiv("../tool/saveParameter.php","resultDivMain","parameterForm",callBack);
  dijit.byId('dialogMailEditor').hide();
}

var doNotTriggerEmailChange=false;
function findAutoEmail() {
  if (doNotTriggerEmailChange == true) return;
  var adress=dijit.byId('dialogOtherMail').get('value');
  var regex=/,[ ]*|;[ ]*/gi;
  adress=adress.replace(regex,",");
  dojo.xhrGet({
    url:'../tool/saveFindEmail.php?&isId=false&adress=' + adress + '&csrfToken=' + csrfToken,
    load:function(data,args) {
      var email=data;
      doNotTriggerEmailChange=true;
      dijit.byId('dialogOtherMail').set('value',email);
      doNotTriggerEmailChange=false;
    }
  });
}

function dialogMailIdEmailChange() {
  if (doNotTriggerEmailChange == true) return;
  doNotTriggerEmailChange=true;
  var value=dijit.byId('dialogOtherMail').get('value');
  var id=dijit.byId('dialogMailObjectIdEmail').get('value');
  id=id + ',' + value;
  dojo.xhrGet({
    url:'../tool/saveFindEmail.php?&isId=true&id=' + id + '&csrfToken=' + csrfToken,
    load:function(data,args) {
      var email=data;
      dijit.byId('dialogOtherMail').set('value',email);
      doNotTriggerEmailChange=false;
    }
  });
}
// end

// damian #2936
function stockEmailCurrent() {
  var adress=dijit.byId('dialogOtherMail').get('value');
  var adressSplit=adress.split(',');
  adressSplit.forEach(function(emailSplit) {
    if (stockEmailHistory.indexOf(emailSplit) == -1) {
      stockEmailHistory.push(emailSplit);
    }
  });
}

function compareEmailCurrent() {
  if (stockEmailHistory.length > 0) {
    var inputEmail=dijit.byId('dialogOtherMail').get('value');
    var split=inputEmail.split(',');
    inputEmail=split[split.length - 1];
    var count=0;
    var email="";
    var divCount=0;
    // var display = '';
    stockEmailHistory.forEach(function(element) {
      count++;
      if (split.indexOf(element) <= -1) {
        divCount++;
        if (divCount < 0) {
          dojo.byId('dialogOtherMailHistorical').style.display='none';
        }
        if (element.search(inputEmail) > -1) {
          dojo.byId('dialogOtherMailHistorical').style.display='block';
          email+='<div class="emailHistorical" id="email' + count + '" style="cursor:pointer;"' + 'onclick="selectEmailHistorical(\'' + element + '\')">' + element + '</div>';
          dojo.byId('dialogOtherMailHistorical').innerHTML=email;
        }
      } else {
        divCount--;
      }
      if (divCount > 7) {
        dojo.byId('dialogOtherMailHistorical').style.height='100px';
      } else {
        dojo.byId('dialogOtherMailHistorical').style.height='auto';
      }
    });
  } else {
    dojo.byId('dialogOtherMailHistorical').style.display='none';
  }
}

function hideEmailHistorical() {
  setTimeout(function() {
    dojo.byId('dialogOtherMailHistorical').style.display='none';
  },200);
}

function selectEmailHistorical(email) {
  var currentValue=dijit.byId('dialogOtherMail').get("value");
  var tab=currentValue.split(',');
  var tabLength=tab.length;
  var newValue="";
  if (currentValue != "") {
    if (tabLength > 1) {
      for (var i=0;i < tabLength - 1;i++) {
        if (tab[i].search('@') > -1) {
          newValue+=tab[i] + ',';
        }
      }
    }
    newValue+=email + ',';
    dijit.byId('dialogOtherMail').set("value",newValue);
  } else {
    dijit.byId('dialogOtherMail').set("value",email + ',');
  }
  dojo.byId('dialogOtherMailHistorical').style.display='none';
}
// end #2936

function extractEmails(str) {
  var current='';
  var result='';
  var name=false;
  for (var i=0;i < str.length;i++) {
    car=str.charAt(i);
    if (car == '"') {
      if (name == true) {
        name=false;
        current="";
      } else {
        if (current != '') {
          if (result != '') {
            result+=', ';
          }
          result+=trimTag(current);
          current='';
        }
        name=true;
      }
    } else if (name == false) {
      if (car == ',' || car == ';' || car == ' ') {
        if (current != '') {
          if (result != '') {
            result+=', ';
          }
          result+=trimTag(current);
          current='';
        }
      } else {
        current+=car;
      }
    }
  }
  if (current != "") {
    if (result != '') {
      result+=', ';
    }
    result+=trimTag(current);
  }
  return result;
}

function sendMail() {
  var idEmailTemplate=dijit.byId('selectEmailTemplate').get("value");
  if (dojo.byId('maxSizeNoconvert') && dojo.byId('totalSizeNoConvert').value > Number(dojo.byId('maxSizeNoconvert').value)) {
    showAlert(i18n('errorAttachmentSize'));
    return;
  } else {
    var callBack=function() {
      hideWait();
      loadContentStream();
    };
    loadContent("../tool/sendMail.php?className=Mailable&idEmailTemplate=" + idEmailTemplate,"resultDivMain","mailForm",true,'mail',false,false,callBack);
    dijit.byId("dialogMail").hide();
  }
}

function showMailOptions() {
  var callback=function() {
    title=i18n('buttonMail',new Array(i18n(dojo.byId('objectClass').value)));
    if (dijit.byId('attendees')) {
      dijit.byId('dialogMailToOther').set('checked','checked');
      dijit.byId('dialogOtherMail').set('value',extractEmails(dijit.byId('attendees').get('value')));
      dialogMailToOtherChange();
    }
    dijit.byId("dialogMail").set('title',title);
    refreshListSpecific('emailTemplate','selectEmailTemplate','objectIdClass',dojo.byId('objectId').value + '_' + dojo.byId('objectClass').value);
    loadDialog("dialogMail",null,true,'&objectClass=' + dojo.byId('objectClass').value + '&objectId=' + dojo.byId('objectId').value);
  }
  if (dijit.byId("dialogMail") && dojo.byId('dialogMailObjectClass') && dojo.byId('dialogMailObjectClass').value == dojo.byId('objectClass').value) {
    refreshListSpecific('emailTemplate','selectEmailTemplate','objectIdClass',dojo.byId('objectId').value + '_' + dojo.byId('objectClass').value);
    loadDialog("dialogMail",null,true,'&objectClass=' + dojo.byId('objectClass').value + '&objectId=' + dojo.byId('objectId').value);
  } else {
    var param="&objectClass=" + dojo.byId('objectClass').value + "&objectId=" + dojo.byId('objectId').value;
    loadDialog("dialogMail",callback,false,param);
  }
}

function changeFileSizeMail(name) {
  var attachments=dojo.byId('attachments').value;
  var addAttachments='';
  var totalSize=dojo.byId('totalSizeNoConvert').value;
  var maxSize=Number(dojo.byId('maxSizeNoconvert').value);
  var val1=dojo.byId('v1_' + name).value;
  var val2=dojo.byId('v2_' + name).value;
  var id=dojo.byId('addVersion' + name).value;
  var type='DocumentVersion';
  var docVersRef=dojo.byId('idDocRef' + name).value;
  var docVers=dojo.byId('idDoc' + name).value;
  if (dijit.byId('dialogMail' + name).get('checked') == true) {

    if (totalSize != 0) {
      size=Number(totalSize) - Number(dojo.byId('filesizeNoConvert' + name).value);
    }
    var regex='/' + id + '_' + type;
    if (attachments.indexOf(regex) == -1) {
      regex=id + '_' + type;
    }
    suprAttachments=attachments.replace(regex,'');
    if (dijit.byId('versionRef' + name).get('checked') == true) {
      if (suprAttachments != '') {
        addAttachments=suprAttachments + '/' + docVersRef + '_' + type;
      } else {
        addAttachments=docVersRef + '_' + type;
      }
      totalSize=size + Number(val1);
      dojo.byId('filesize' + name).value=octetConvertSize(val1);
      dojo.byId('filesizeNoConvert' + name).value=val1;
      dojo.byId('addVersion' + name).value=docVersRef;
      dojo.byId('attachments').value=addAttachments;
    } else {
      if (suprAttachments != '') {
        addAttachments=suprAttachments + '/' + docVers + '_' + type;
      } else {
        addAttachments=docVers + '_' + type;
      }
      dojo.byId('filesize' + name).value=octetConvertSize(val2);
      dojo.byId('filesizeNoConvert' + name).value=val2;
      dojo.byId('addVersion' + name).value=docVers;
      dojo.byId('attachments').value=addAttachments;
    }
    var noConvert=totalSize;
    if (totalSize != 0) {
      totalSize=octetConvertSize(totalSize);
    }
    if (maxSize < noConvert) {
      dojo.byId('infoSize').style.color="red";
      dojo.byId('totalSize').style.color="red";
    } else if ((maxSize >= noConvert) || noConvert == 0) {
      dojo.byId('infoSize').style.color="green";
      dojo.byId('totalSize').style.color="green";
    }
    dojo.byId('totalSizeNoConvert').value=noConvert;
    dojo.byId('totalSize').value=totalSize;
  } else {
    if (dijit.byId('versionRef' + name).get('checked') == true) {
      dojo.byId('filesize' + name).value=octetConvertSize(val1);
      dojo.byId('filesizeNoConvert' + name).value=val1;
      dojo.byId('addVersion' + name).value=docVersRef;
    } else {
      dojo.byId('filesize' + name).value=octetConvertSize(val2);
      dojo.byId('filesizeNoConvert' + name).value=val2;
      dojo.byId('addVersion' + name).value=docVers;
    }
  }
}
