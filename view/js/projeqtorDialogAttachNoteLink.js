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

// =============================================================================
// = Notes
// =============================================================================

// DOJO HACK
// Hack to be able to interact with ck_editor popups in Notes
// NEEDS TO CHANGE dijit/Dialog.js, in focus.watch
// Replace
//   if(node == topDialog.domNode || domClass.contains(node, "dijitPopup")){ return; }
// With
//   if(node == topDialog.domNode || domClass.contains(node, "dijitPopup") || domClass.contains(node, "cke_dialog_body")){ return; }
// And then rebuild dojo
// 7.3.0 Not usefull anymore with dojo 1.14 and 2 lines below

function pauseBodyFocus() {
  dojo.query(".cke_dialog_body").addClass("dijitPopup");
}

function resumeBodyFocus() {
  dojo.query(".cke_dialog_body").removeClass("dijitPopup");
}

// Function handling change in note size
function changeNoteSize(objName) {
  const
  collapse="iconButtonCollapseHide16 iconButtonCollapseHide iconSize16";
  const
  fullScreen="iconButtonCollapseOpen16 iconButtonCollapseOpen iconSize16";

  let
  noteDiv=document.getElementById(objName + "_Note");
  let
  mainDiv=document.getElementById("mainDiv");
  let
  newDiv;
  let
  count=1;

  if (document.getElementById("idIconButtonCollapseOpen").className == fullScreen) {

    mainDiv.style.visibility="hidden";
    document.getElementById("idIconButtonCollapseOpen").className=collapse;

    newDiv=document.createElement("div");
    newDiv.setAttribute("name",objName + "_Note");

    let
    temp=noteDiv.cloneNode(true);
    newDiv.appendChild(temp);

    noteDiv.id=objName + "_Note_Hidden";
    document.body.insertBefore(newDiv,document.body.firstChild);

    document.getElementById(objName + "_Note").style.width="98%";
    while (count <= newDiv.querySelectorAll("[id=idIconRemove]").length * 3 + 1) {
      newDiv.getElementsByClassName("roundedButtonSmall")[count].parentNode.style.visibility="collapse";
      count+=1;
    }
    document.getElementById(objName + "_Note_pane").style.height="94vh";
    document.getElementById(objName + "_Note_pane").style.overflow="auto";

  } else {
    document.getElementsByName(objName + "_Note")[0].remove();
    document.getElementById(objName + "_Note_Hidden").id=objName + "_Note";

    document.getElementById("idIconButtonCollapseOpen").className=fullScreen;
    mainDiv.style.visibility="visible";
  }
}

function addNote(reply,idParentNote) {
  if (dijit.byId("noteToolTip")) {
    dijit.byId("noteToolTip").destroy();
    dijit.byId("noteNote").set("class","");
  }
  pauseBodyFocus();
  var callBack=function() {
    var editorType=dojo.byId("noteEditorType").value;
    if (editorType == "CK" || editorType == "CKInline") { // CKeditor type
      ckEditorReplaceEditor("noteNote",999);
    } else if (editorType == "text") {
      dijit.byId("noteNote").focus();
      dojo.byId("noteNote").style.height=(screen.height * 0.6) + 'px';
      dojo.byId("noteNote").style.width=(screen.width * 0.6) + 'px';
    } else if (dijit.byId("noteNoteEditor")) { // Dojo type editor
      dijit.byId("noteNoteEditor").set("class","input");
      dijit.byId("noteNoteEditor").focus();
      dijit.byId("noteNoteEditor").set("height",(screen.height * 0.6) + 'px'); // Works
      // on
      // first
      // time
      dojo.byId("noteNoteEditor_iframe").style.height=(screen.height * 0.6) + 'px'; // Works
      // after
      // first
      // time
    }
  };
  var params="&objectClass=" + dojo.byId('objectClass').value;
  params+="&objectId=" + dojo.byId("objectId").value;
  params+="&noteId="; // Null
  params+="&reply=" + reply;
  if (reply) {
    params+="&idParentNote=" + idParentNote;
  }
  loadDialog('dialogNote',callBack,true,params,true);
}

function noteSelectPredefinedText(idPrefefinedText) {
  dojo.xhrGet({
    url:'../tool/getPredefinedText.php?id=' + idPrefefinedText + '&csrfToken=' + csrfToken,
    handleAs:"text",
    load:function(data) {
      var editorType=dojo.byId("noteEditorType").value;
      if (editorType == "CK" || editorType == "CKInline") { // CKeditor type
        CKEDITOR.instances['noteNote'].setData(data);
      } else if (editorType == "text") {
        dijit.byId('noteNote').set('value',data);
        dijit.byId('noteNote').focus();
      } else if (dijit.byId('noteNoteEditor')) {
        dijit.byId('noteNote').set('value',data);
        dijit.byId('noteNoteEditor').set('value',data);
        dijit.byId("noteNoteEditor").focus();
      }
    }
  });
}

function editNote(noteId,privacy) {
  if (dijit.byId("noteToolTip")) {
    dijit.byId("noteToolTip").destroy();
    dijit.byId("noteNote").set("class","");
  }
  pauseBodyFocus();
  var callBack=function() {
    // dijit.byId('notePrivacyPublic').set('checked', 'true');
    var editorType=dojo.byId("noteEditorType").value;
    if (editorType == "CK" || editorType == "CKInline") { // CKeditor type
      ckEditorReplaceEditor("noteNote",999);
    } else if (editorType == "text") {
      dijit.byId("noteNote").focus();
      dojo.byId("noteNote").style.height=(screen.height * 0.6) + 'px';
      dojo.byId("noteNote").style.width=(screen.width * 0.6) + 'px';
    } else if (dijit.byId("noteNoteEditor")) { // Dojo type editor
      dijit.byId("noteNoteEditor").set("class","input");
      dijit.byId("noteNoteEditor").focus();
      dijit.byId("noteNoteEditor").set("height",(screen.height * 0.6) + 'px'); // Works
      // on
      // first
      // time
      dojo.byId("noteNoteEditor_iframe").style.height=(screen.height * 0.6) + 'px'; // Works
      // after
      // first
      // time
    }
  };
  var params="&objectClass=" + dojo.byId('objectClass').value;
  params+="&objectId=" + dojo.byId("objectId").value;
  params+="&noteId=" + noteId;
  loadDialog('dialogNote',callBack,true,params,true);
}

function saveNote() {
  var editorType=dojo.byId("noteEditorType").value;
  if (editorType == "CK" || editorType == "CKInline") {
    noteEditor=CKEDITOR.instances['noteNote'];
    noteEditor.updateElement();
    var tmpCkEditor=noteEditor.document.getBody().getText();
    var tmpCkEditorData=noteEditor.getData();
    if (tmpCkEditor.trim() == "" && tmpCkEditorData.indexOf('<img') <= 0) {
      var msg=i18n('messageMandatory',new Array(i18n('Note')));
      noteEditor.focus();
      showAlert(msg);
      return;
    }
  } else if (dijit.byId("noteNoteEditor")) {
    if (dijit.byId("noteNote").getValue() == '') {
      dijit.byId("noteNoteEditor").set("class","input required");
      var msg=i18n('messageMandatory',new Array(i18n('Note')));
      dijit.byId("noteNoteEditor").focus();
      dojo.byId("noteNoteEditor").focus();
      showAlert(msg);
      return;
    }
  }
  loadContent("../tool/saveNote.php","resultDivMain","noteForm",true,'note');
  loadContentStream();

  dijit.byId('dialogNote').hide();
}

function removeNote(noteId) {
  var param="?noteId=" + noteId;
  var dest="resultDivMain";
  if (dojo.byId('objectClass') && dojo.byId("objectId")) {
    param+="&noteRefType=" + dojo.byId('objectClass').value;
    param+="&noteRefId=" + dojo.byId("objectId").value;
  } else if (dojo.byId('noteRefType') && dojo.byId('noteRefId')) {
    param+="&noteRefType=" + dojo.byId('noteRefType').value;
    param+="&noteRefId=" + dojo.byId('noteRefId').value;
    // dest="resultKanbanStreamDiv";
  }
  actionOK=function() {
    loadContent("../tool/removeNote.php" + param,dest,"noteForm",true,'note');
  };
  msg=i18n('confirmDelete',new Array(i18n('Note'),noteId));
  showConfirm(msg,actionOK);
}

// =============================================================================
// = Attachments
// =============================================================================

function addAttachment(attachmentType,refType,refId) {
  var content="";
  if (dijit.byId('dialogAttachment')) content=dijit.byId('dialogAttachment').get('content');
  if (content == "") {
    callBack=function() {
      dojo.connect(dijit.byId("attachmentFile"),"onComplete",function(dataArray) {
        saveAttachmentAck(dataArray);
      });
      dojo.connect(dijit.byId("attachmentFile"),"onProgress",function(data) {
        saveAttachmentProgress(data);
      });
      dojo.connect(dijit.byId("attachmentFile"),"onError",function(evt) {
        hideWait();
        showError(i18n("uploadUncomplete"));
      });
      addAttachment(attachmentType,refType,refId);
      if (isHtml5() && dijit.byId('attachmentFileDirect')) {
        dijit.byId('attachmentFileDirect').reset();
        dijit.byId('attachmentFileDirect').addDropTarget(dojo.byId('attachmentFileDropArea'));
      }
    };
    loadDialog('dialogAttachment',callBack);
    return;
  }
  dojo.byId("attachmentId").value="";
  dojo.byId("attachmentRefType").value=(refType) ? refType : ((dojo.byId('objectClass')) ? dojo.byId('objectClass').value : 'User');
  dojo.byId("attachmentRefId").value=(refId) ? refId : ((dojo.byId('objectId')) ? dojo.byId("objectId").value : dojo.byId("userMenuIdUser").value);
  dojo.byId("attachmentType").value=attachmentType;
  if (dojo.byId("attachmentFileName")) {
    dojo.byId("attachmentFileName").innerHTML="";
  }
  dojo.style(dojo.byId('downloadProgress'),{
    display:'none'
  });
  if (attachmentType == 'file') {
    if (dijit.byId("attachmentFile")) {
      dijit.byId("attachmentFile").reset();
      if (!isHtml5()) {
        enableWidget('dialogAttachmentSubmit');
      } else {
        disableWidget('dialogAttachmentSubmit');
      }
    }
    dojo.style(dojo.byId('dialogAttachmentFileDiv'),{
      display:'block'
    });
    dojo.style(dojo.byId('dialogAttachmentLinkDiv'),{
      display:'none'
    });
  } else {
    if (dijit.byId("attachmentLink")) {
      dijit.byId("attachmentLink").set('value',null);
    }
    dojo.style(dojo.byId('dialogAttachmentFileDiv'),{
      display:'none'
    });
    dojo.style(dojo.byId('dialogAttachmentLinkDiv'),{
      display:'block'
    });
    enableWidget('dialogAttachmentSubmit');
  }
  if (dijit.byId("attachmentDescription").get('checked') == true && refType != 'SubTask') {
    dijit.byId("attachmentDescription").set('disabled',false);
    dijit.byId('attachmentPrivacyPrivate').set('disabled',false);
  }
  dijit.byId("attachmentDescription").set('value',null);
  dijit.byId("dialogAttachment").set('title',i18n("dialogAttachment"));
  dijit.byId('attachmentPrivacyPublic').set('checked','true');
  if (refType == 'SubTask') {
    dijit.byId("attachmentDescription").set('disabled',true);
    dijit.byId('attachmentPrivacyPrivate').set('disabled',true);
  }

  dijit.byId("dialogAttachment").show();
}

function changeAttachment(list) {
  if (list.length > 0) {
    htmlList="";
    for (var i=0;i < list.length;i++) {
      htmlList+=list[i]['name'] + '<br/>';
    }
    dojo.byId('attachmentFileName').innerHTML=htmlList;
    enableWidget('dialogAttachmentSubmit');
    dojo.byId('attachmentFile').height="200px";
  } else {
    dojo.byId('attachmentFileName').innerHTML="";
    disableWidget('dialogAttachmentSubmit');
    dojo.byId('attachmentFile').height="20px";
  }
}

var cancelDupplicate=false;
function saveAttachment(direct,idName) {
  // disableWidget('dialogAttachmentSubmit');
  if (cancelDupplicate) return;
  cancelDupplicate=true;
  if (!isHtml5()) {
    if (dojo.isIE && dojo.isIE <= 8) {
      dojo.byId('attachmentForm').submit();
    }
    showWait();
    dijit.byId('dialogAttachment').hide();
    return true;
  }
  if (dojo.byId("attachmentType") && dojo.byId("attachmentType").value == 'file' && dojo.byId('attachmentFileName') && dojo.byId('attachmentFileName').innerHTML == "") {
    return false;
  }

  if (direct) {
    if (dijit.byId(idName)) {
      if (dijit.byId(idName).getFileList().length > 20) {
        showAlert(i18n('uploadLimitNumberFiles'));
        return false;
      }
    }
  } else {
    if (dijit.byId("attachmentFile")) {
      if (dijit.byId("attachmentFile").getFileList().length > 20) {
        showAlert(i18n('uploadLimitNumberFiles'));
        return false;
      }
    }
  }
  dojo.style(dojo.byId('downloadProgress'),{
    display:'block'
  });
  showWait();
  dijit.byId('dialogAttachment').hide();
  return true;
}

function saveAttachmentAck(dataArray) {
  if (dataArray == undefined) {
    dojo.style(dojo.byId('downloadProgress'),{
      display:'none'
    });
    dojo.byId('resultAck').value=i18n("uploadUncomplete");
    hideWait();
    return;
  }
  if (!isHtml5()) {
    resultFrame=document.getElementById("resultPost");
    resultText=resultPost.document.body.innerHTML;
    dojo.byId('resultAck').value=resultText;
    loadContent("../tool/ack.php","resultDivMain","attachmentAckForm",true,'attachment');
    return;
  }
  dijit.byId('dialogAttachment').hide();
  if (dojo.isArray(dataArray)) {
    result=dataArray[0];
  } else {
    result=dataArray;
  }
  dojo.style(dojo.byId('downloadProgress'),{
    display:'none'
  });
  dojo.byId('resultAck').value=result.message;
  loadContent("../tool/ack.php","resultDivMain","attachmentAckForm",true,'attachment');
  loadContent("../view/menuUserTop.php","drawMenuUser");
}

function saveAttachmentProgress(data) {
  done=data.bytesLoaded;
  total=data.bytesTotal;
  if (total) {
    progress=done / total;
  }
  dijit.byId('downloadProgress').set('value',progress);
}

function removeAttachment(attachmentId) {
  var content="";
  if (dijit.byId('dialogAttachment')) content=dijit.byId('dialogAttachment').get('content');
  if (content == "") {
    callBack=function() {
      dojo.connect(dijit.byId("attachmentFile"),"onComplete",function(dataArray) {
        saveAttachmentAck(dataArray);
      });
      dojo.connect(dijit.byId("attachmentFile"),"onProgress",function(data) {
        saveAttachmentProgress(data);
      });
      dijit.byId('dialogAttachment').hide();
      removeAttachment(attachmentId);
    };
    loadDialog('dialogAttachment',callBack);
    return;
  }
  dojo.byId("attachmentId").value=attachmentId;
  dojo.byId("attachmentRefType").value=dojo.byId('objectClass').value;
  dojo.byId("attachmentRefId").value=dojo.byId("objectId").value;
  actionOK=function(reftype,refId,idResource) {
    loadContent("../tool/removeAttachment.php","resultDivMain","attachmentForm",true,'attachment');
    loadContent("../view/menuUserTop.php","drawMenuUser");
    // loadContent("../view/menuBar.php", "iconMenuUserPhoto");
    if (dojo.byId('refreshSTDivValues')) {
      var idSubTask=dojo.byId('refreshSTDivValues').value;
      setTimeout('refreshSubTaskAttachment(' + idSubTask + ')',200);
    }
  };

  msg=i18n('confirmDelete',new Array(i18n('Attachment'),attachmentId));
  showConfirm(msg,actionOK);
}

function editAttachment(id) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dojo.xhrGet({
      url:'../tool/getSingleData.php?dataType=editAttachment&id=' + id + '&csrfToken=' + csrfToken,
      handleAs:"text",
      load:function(data) {
        dijit.byId('attachmentDescriptionEdit').set('value',data);
      }
    });
    dijit.byId("dialogAttachmentEdit").show();
  };
  var params="&id=" + id;
  params+="&mode=edit";
  loadDialog('dialogAttachmentEdit',callBack,false,params);
}

function saveAttachmentEdit() {
  var privacy=0;
  if (dijit.byId('attachmentPrivacyPublicEdit').get('checked')) privacy=1;
  if (dijit.byId('attachmentPrivacyTeamEdit').get('checked')) privacy=2;
  if (dijit.byId('attachmentPrivacyPrivateEdit').get('checked')) privacy=3;
  var url='../tool/saveAttachmentEdit.php';
  url+='?privacy=' + privacy;
  loadContent(url,"resultDivMain","attachmentFormEdit",true,"attachment");
  dijit.byId('dialogAttachmentEdit').hide();
}

// =============================================================================
// = Links
// =============================================================================

var noRefreshLink=false;
function addLink(classLink,defaultLink) {
  if (dojo.byId('objectClass') && dojo.byId('objectClass').value == 'Requirement' && classLink == 'TestCase' && checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  if (!classLink) {
    var params="&objectClass=" + dojo.byId('objectClass').value + "&objectId=" + dojo.byId("objectId").value;
  }
  loadDialog('dialogLink',function() {
    noRefreshLink=true;
    var objectClass=dojo.byId('objectClass').value;
    var objectId=dojo.byId("objectId").value;
    var message=i18n("dialogLink");
    dojo.byId("linkId").value="";
    dojo.byId("linkRef1Type").value=objectClass;
    dojo.byId("linkRef1Id").value=objectId;
    dojo.style(dojo.byId('linkDocumentVersionDiv'),{
      display:'none'
    });
    dijit.byId("linkDocumentVersion").reset();
    if (classLink) {
      dojo.byId("linkFixedClass").value=classLink;
      message=i18n("dialogLinkRestricted",new Array(i18n(objectClass),objectId,i18n(classLink)));
      dijit.byId("linkRef2Type").setDisplayedValue(i18n(classLink));
      lockWidget("linkRef2Type");
      noRefreshLink=false;
      refreshLinkList();
    } else {
      dojo.byId("linkFixedClass").value="";
      if (defaultLink) {
        dijit.byId("linkRef2Type").set('value',defaultLink);
      } else {
        dijit.byId("linkRef2Type").reset();
      }
      message=i18n("dialogLinkExtended",new Array(i18n(objectClass),objectId));
      unlockWidget("linkRef2Type");
      noRefreshLink=false;
      refreshLinkList();
    }
    dijit.byId("dialogLink").set('title',message);
    dijit.byId("linkComment").set('value','');
    dijit.byId("dialogLink").show();
    disableWidget('dialogLinkSubmit');
  },true,params,true);
}

function selectLinkItem() {
  var nbSelected=0;
  list=dojo.byId('linkRef2Id');
  if (dojo.byId("linkRef2Type").value == "Document") {
    if (list.options) {
      selected=new Array();
      for (var i=0;i < list.options.length;i++) {
        if (list.options[i].selected) {
          selected.push(list.options[i].value);
          nbSelected++;
        }
      }
      if (selected.length == 1) {
        dijit.byId("linkDocumentVersion").reset();
        refreshList('idDocumentVersion','idDocument',selected[0],null,'linkDocumentVersion',false);
        dojo.style(dojo.byId('linkDocumentVersionDiv'),{
          display:'block'
        });
      } else {
        dojo.style(dojo.byId('linkDocumentVersionDiv'),{
          display:'none'
        });
        dijit.byId("linkDocumentVersion").reset();
      }
    }
  } else {
    if (list.options) {
      for (var i=0;i < list.options.length;i++) {
        if (list.options[i].selected) {
          nbSelected++;
        }
      }
    }
    dojo.style(dojo.byId('linkDocumentVersionDiv'),{
      display:'none'
    });
    dijit.byId("linkDocumentVersion").reset();
  }
  if (nbSelected > 0) {
    enableWidget('dialogLinkSubmit');
  } else {
    disableWidget('dialogLinkSubmit');
  }
}

function refreshLinkList(selected) {
  if (noRefreshLink) return;
  disableWidget('dialogLinkSubmit');
  var url='../tool/dynamicListLink.php';
  if (selected) {
    url+='?selected=' + selected;
  }
  if (!selected) {
    selectLinkItem();
  }
  loadContent(url,'dialogLinkList','linkForm',false);
}

function saveLink() {
  if (dojo.byId("linkRef2Id").value == "") return;
  var fixedClass=(dojo.byId('linkFixedClass')) ? dojo.byId('linkFixedClass').value : '';
  loadContent("../tool/saveLink.php","resultDivMain","linkForm",true,'link' + fixedClass);
  dijit.byId('dialogLink').hide();
}

function removeLink(linkId,refType,refId,refTypeName,fixedClass) {
  if (dojo.byId('objectClass') && dojo.byId('objectClass').value == 'Requirement' && fixedClass == 'TestCase' && checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    if (fixedClass && fixedClass == refType) {
      loadContent("../tool/removeLink.php?linkId=" + linkId + "&linkRef1Type=" + dojo.byId('objectClass').value + "&linkRef1Id=" + dojo.byId("objectId").value + "&linkRef2Type=" + refType
          + "&linkRef2Id=" + refId,"resultDivMain",null,true,'link' + fixedClass);
    } else {
      loadContent("../tool/removeLink.php?linkId=" + linkId + "&linkRef1Type=" + dojo.byId('objectClass').value + "&linkRef1Id=" + dojo.byId("objectId").value + "&linkRef2Type=" + refType
          + "&linkRef2Id=" + refId,"resultDivMain",null,true,'link');
    }
  };
  if (!refTypeName) {
    refTypeName=i18n(refType);
  }
  msg=i18n('confirmDeleteLink',new Array(refTypeName,refId));
  showConfirm(msg,actionOK);
}

function editLink(linkId,id,classLink) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dojo.xhrGet({
      url:'../tool/getSingleData.php?dataType=editLink&idLink=' + linkId + '&csrfToken=' + csrfToken,
      handleAs:"text",
      load:function(data) {
        dijit.byId('linkComment').set('value',data);
        if (classLink) {
          dojo.byId("linkFixedClass").value=classLink;
        }
      }
    });
    dijit.byId("dialogLink").show();
  };
  var params="&id=" + id;
  params+="&linkId=" + linkId;
  params+="&mode=edit";
  loadDialog('dialogLink',callBack,false,params);
}

function removeFollowup(followupId,all) {
  var param="?messageFollowup=" + followupId;
  param+="&deleteAll=" + all;

  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    loadContent("../tool/removeMessageFollowup.php" + param,"resultDivMain","objectForm",true,'MessageLegalFollowup');
  };

  msg=i18n('confirmRemoveMessageFollowup');
  showConfirm(msg,actionOK);
}
