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
//= Planning PDF
//=============================================================================

function planningPDFBox(copyType) {
  loadDialog('dialogPlanningPdf', null, true, "", false);
}

// =============================================================================
// = Assignments
// =============================================================================

function addAssignment(unit, rawUnit, hoursPerDay, isTeam, isOrganization,
    isResourceTeam, isMaterial) {

  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    var objClass=dojo.byId('assignmentDialogObjectClass').value;
    var objId = dojo.byId("assignmentDialogObjectId").value;
    var idProject = dojo.byId('assignmentDialogIdProject').value;
  }else{
    var objClass=dojo.byId('objectClass').value;
    var objId = dojo.byId("objectId").value;
    var idProject = dijit.byId('idProject').get('value');
  }

  var callBack=function() {
    dijit.byId("dialogAssignment").show();
  };
  var params="&refType=" + objClass;
  params+="&refId=" + objId;
  params+="&idProject=" + idProject;
  params+="&unit=" + unit;
  if (objClass == 'Meeting'
      || objClass == 'PeriodicMeeting') {
    params+="&meetingEndTime=" + dijit.byId('meetingEndTime');
    params+="&meetingEndTimeValue=" + dijit.byId('meetingEndTime').get('value');
    params+="&meetingStartTime=" + dijit.byId('meetingStartTime');
    params+="&meetingStartTimeValue="
        + dijit.byId('meetingStartTime').get('value');
    params+="&rawUnit=" + rawUnit;
    params+="&hoursPerDay=" + hoursPerDay;
  }
  if (objClass == 'PokerSession') {
    params+="&pokerSessionEndTime=" + dijit.byId('pokerSessionEndTime');
    params+="&pokerSessionEndTimeValue="
        + dijit.byId('pokerSessionEndTime').get('value');
    params+="&pokerSessionStartTime=" + dijit.byId('pokerSessionStartTime');
    params+="&pokerSessionStartTimeValue="
        + dijit.byId('pokerSessionStartTime').get('value');
    params+="&rawUnit=" + rawUnit;
    params+="&hoursPerDay=" + hoursPerDay;
  }
  if (objClass != 'PeriodicMeeting'
      && objClass != 'PokerSession') {
    if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
      var validatedWork = dojo.byId("assignmentDialogValidatedWork").value;
      var assignedWork = dojo.byId("assignmentDialogAssignedWork").value;
    }else{
      var validatedWork = dijit.byId(objClass + "PlanningElement_validatedWork").get('value');
      var assignedWork = dijit.byId(objClass + "PlanningElement_assignedWork").get('value');
    }
    params+="&validatedWorkPe=" + validatedWork;
    params+="&assignedWorkPe=" + assignedWork;
  }
  params+="&isTeam=" + isTeam + "&isOrganization=" + isOrganization
      + "&isResourceTeam=" + isResourceTeam+ "&isMaterial=" + isMaterial;
  ;
  params+="&mode=add";
  loadDialog('dialogAssignment', callBack, false, params);
}

var editAssignmentLoading=false;
function editAssignment(assignmentId, idResource, idRole, cost, rate,
    assignedWork, realWork, leftWork, unit, optional) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    editAssignmentLoading=false;
    assignmentUpdatePlannedWork('assignment');
    dijit.byId("dialogAssignment").show();
  };
  
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    var objClass=dojo.byId('assignmentDialogObjectClass').value;
    var objId = dojo.byId("assignmentDialogObjectId").value;
    var idProject = dojo.byId('assignmentDialogIdProject').value;
  }else{
    var objClass=dojo.byId('objectClass').value;
    var objId = dojo.byId("objectId").value;
    var idProject = dijit.byId('idProject').get('value');
  }
  
  var params="&idAssignment=" + assignmentId;
  params+="&refType=" + objClass;
  params+="&idProject=" + idProject;
  params+="&refId=" + objId;
  params+="&idResource=" + idResource;
  params+="&idRole=" + idRole;
  params+="&mode=edit";
  params+="&unit=" + unit;
  params+="&realWork=" + realWork;
  editAssignmentLoading=true;
  loadDialog('dialogAssignment', callBack, false, params);
}

function divideAssignment(assignedIdOrigin, unit) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dijit.byId("dialogAssignment").show();
  };
  
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    var objClass=dojo.byId('assignmentDialogObjectClass').value;
    var objId = dojo.byId("assignmentDialogObjectId").value;
    var idProject = dojo.byId('assignmentDialogIdProject').value;
  }else{
    var objClass=dojo.byId('objectClass').value;
    var objId = dojo.byId("objectId").value;
    var idProject = dijit.byId('idProject').get('value');
  }
  
  var params="&refType=" + objClass;
  params+="&refId=" + objId;
  params+="&idProject=" + idProject;
  params+="&assignedIdOrigin=" + assignedIdOrigin;
  params+="&unit=" + unit;
  params+="&mode=divide";
  loadDialog('dialogAssignment', callBack, false, params);
}

function assignmentUpdateLeftWork(prefix) {
  var initAssigned=dojo.byId(prefix + "AssignedWorkInit");
  var initLeft=dojo.byId(prefix + "LeftWorkInit");
  var assigned=dojo.byId(prefix + "AssignedWork");
  var newAssigned=dojo.number.parse(assigned.value);
  var objClass=null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objClass=dojo.byId('assignmentDialogObjectClass').value;
  }else{
    objClass=dojo.byId('objectClass').value;
  }

  if (objClass == 'Activity' && prefix == 'assignment') {
    if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
      var isOnRealTime=dojo.byId('assignmentDialogWorkOnRealTime').value;
      isOnRealTime = (isOnRealTime == 1)?'on':0;
    }else{
      var isOnRealTime=dijit.byId('workOnRealTime').get('value');
    }
    if (isOnRealTime == 'on') {
      var realdWork=dojo.byId(prefix + "RealWork").value;
      if (newAssigned < realdWork) {
        dijit.byId(prefix + "AssignedWork").set("value", initAssigned.value);
        dijit.byId(prefix + "LeftWork").set("value", initLeft.value);
        showAlert(i18n('assingedWorkCantBeLowerInWorkOnRealTime'));
        return;
      }
    }
  }

  if (newAssigned == null || isNaN(newAssigned)) {
    newAssigned=0;
    assigned.value=dojo.number.format(newAssigned);
  }
  var left=dojo.byId(prefix + "LeftWork");
  var real=dojo.byId(prefix + "RealWork");
  diff=dojo.number.parse(assigned.value) - initAssigned.value;
  newLeft=parseFloat(initLeft.value) + diff;
  if (newLeft < 0 || isNaN(newLeft)) {
    newLeft=0;
  }
  if (assigned.value != initAssigned.value) {
    diffe=dojo.number.parse(assigned.value) - real.value;
    if (initAssigned.value == 0 || isNaN(initAssigned.value)) {
      newLeft=0 + diffe;
    }
  }
  left.value=dojo.number.format(newLeft);
  assignmentUpdatePlannedWork(prefix);
}

function assignmentUpdatePlannedWork(prefix) {
  var left=dojo.byId(prefix + "LeftWork");
  var newLeft=dojo.number.parse(left.value);
  if (newLeft == null || isNaN(newLeft)) {
    newLeft=0;
    left.value=dojo.number.format(newLeft);
  }
  var real=dojo.byId(prefix + "RealWork");
  var planned=dojo.byId(prefix + "PlannedWork");
  newPlanned=dojo.number.parse(real.value) + dojo.number.parse(left.value);
  planned.value=dojo.number.format(newPlanned);

}

function saveAssignment(definitive) {
  var formVar=dijit.byId('assignmentForm');
  var planningMode=dojo.byId('planningMode').value;
  var mode=dojo.byId('mode').value;
  var isTeam=dojo.byId('isTeam').value;
  var isOrga=dojo.byId('isOrganization').value;
  
  var objClass=null;
  var objId = null;
  var idProject = null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objClass=dojo.byId('assignmentDialogObjectClass').value;
    objId = dojo.byId("assignmentDialogObjectId").value;
    idProject = dojo.byId('assignmentDialogIdProject').value;
  }else{
    objClass=dojo.byId('objectClass').value;
    objId = dojo.byId("objectId").value;
    idProject = dijit.byId('idProject').get('value');
  }

  if (objClass == 'Activity') {
    var isOnRealTime=null;
    if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
      isOnRealTime=dojo.byId('assignmentDialogWorkOnRealTime').value;
      isOnRealTime = (isOnRealTime == '1')?'on':0;
    }else{
      isOnRealTime=dijit.byId('workOnRealTime').get('value');
    }
    if (isOnRealTime == 'on') {
      var realdWork=dojo.byId('assignmentRealWork').value, assign=dojo
          .byId('assignmentAssignedWork').value;
      if (assign < realdWork) {
        dijit.byId("assignmentAssignedWork").set("value",
            dojo.byId('assignedWorkOrigin').value);
        showAlert(i18n('assingedWorkCantBeLowerInWorkOnRealTime'));
        return;
      }
    }
  }

  if (formVar.validate()) {
    dijit.byId("assignmentPlannedWork").focus();
    dijit.byId("assignmentLeftWork").focus();
    url="../tool/saveAssignment.php";
    if (definitive)
      url+="?definitive=" + definitive;
    if (planningMode == 'MAN' && mode != 'edit' && !isTeam && !isOrga) {
      var callback=function() {
        var lastOperationStatus=dojo.byId('lastOperationStatus').value;
        if (lastOperationStatus != 'INVALID') {
          var params="&idAssignment=" + dojo.byId('idAssignment').value;
          params+="&refType=" + objClass;
          params+="&idProject=" + idProject;
          params+="&refId=" + objId;
          params+="&idResource="
              + dijit.byId('assignmentIdResource').get('value');
          params+="&idRole=" + dijit.byId('assignmentIdRole').get('value');
          params+="&unit=" + dojo.byId('assignmentAssignedUnit').value;
          params+="&realWork=" + dijit.byId('assignmentRealWork').get('value');
          params+=dijit.byId('assignmentDailyCost').get('value');
          params+="&mode=edit";
          loadDialog('dialogAssignment', null, false, params);
          var params="&objectClass=" + refType + "&objectId=" + refId;
          loadDialog('dialogEditAssignmentPlanning', null, true, params);
        } else {
          dijit.byId('dialogAssignment').hide();
          loadDialog('dialogEditAssignmentPlanning', null, false);
        }
      };
      
      loadContent(url, "resultDivMain", "assignmentForm", true, 'assignment',
            null, null, callback);
    } else {
      var callback=function() {
        if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
          var objClass=dojo.byId('assignmentDialogObjectClass').value;
          var objId = dojo.byId("assignmentDialogObjectId").value;
          var params="&objectClass=" + objClass + "&objectId=" + objId;
          loadDialog('dialogEditAssignmentPlanning', null, true, params);
        }
      };
      loadContent(url, "resultDivMain", "assignmentForm", true, 'assignment',null,null,callback);
      dijit.byId('dialogAssignment').hide();
    }
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function removeAssignment(assignmentId, realWork, resource) {
  var planningMode=dojo.byId('planningMode').value;
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  if (parseFloat(realWork)) {
    msg=i18n('msgUnableToDeleteRealWork');
    showAlert(msg);
    return;
  }
  var objClass=null;
  var objId = null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objClass=dojo.byId('assignmentDialogObjectClass').value;
    objId = dojo.byId("assignmentDialogObjectId").value;
  }else{
    objClass=dojo.byId('objectClass').value;
    objId = dojo.byId("objectId").value;
  }
  actionOK=function() {
    var callback=function() {
      if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
        var objClass=dojo.byId('assignmentDialogObjectClass').value;
        var objId = dojo.byId("assignmentDialogObjectId").value;
        var params="&objectClass=" + objClass + "&objectId=" + objId;
        loadDialog('dialogEditAssignmentPlanning', null, true, params);
      }
    };
    loadContent("../tool/removeAssignment.php?assignmentId=" + assignmentId
        + "&assignmentRefType=" + objClass
        + "&assignmentRefId=" + objId + "&planningMode="
        + planningMode, "resultDivMain", null, true, "assignment", null, null ,callback);
  };
  msg=i18n('confirmDeleteAssignment', new Array(resource));
  if (planningMode == 'MAN') {
    msg+='<br/><br/>' + i18n("confirmControlDeletePlannedWork");
  }
  showConfirm(msg, actionOK);
}

function assignmentChangeResourceTeamForCapacity() {
  if (editAssignmentLoading)
    return;
  var idResource=dijit.byId("assignmentIdResource").get("value");
  var isResourceTeamDialog=document.getElementById("isResourceTeam").value;
  if (idResource.trim()) {
    enableWidget('dialogAssignmentSubmit');
  } else {
    disableWidget('dialogAssignmentSubmit');
  }
  if (!idResource.trim()) {
    dojo.byId('assignmentRateRow').style.display="table-row";
    dojo.byId('assignmentCapacityResourceTeam').style.display="none";
    dojo.byId('assignmentUniqueSelection').style.display="none";
    dijit.byId('assignmentUnique').set('checked', false);
    dijit.byId('assignmentIdRole').set('value', null);
    return;
  }
  dojo.xhrGet({
    url : '../tool/getIfResourceTeamOrResource.php?idResource=' + idResource+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      if (idResource.trim() && data == 'isResourceTeam' && !isResourceTeamDialog) { // in case if we
        // are in
        // resourceTeam
        // assignment
        // dialog
        dojo.byId('assignmentRateRow').style.display="none";
        dojo.byId('assignmentCapacityResourceTeam').style.display="table-row";
        dojo.byId('assignmentUniqueSelection').style.display="table-row";
      } else {
        dojo.byId('assignmentRateRow').style.display="table-row";
        dojo.byId('assignmentCapacityResourceTeam').style.display="none";
        dojo.byId('assignmentUniqueSelection').style.display="none";
        dijit.byId('assignmentUnique').set('checked', false);
      }
      var planningMode=dojo.byId('planningMode').value;
      if (planningMode == 'MAN') {
        dojo.byId('assignmentRateRow').style.display="none";
      }
    }
  });
}

function assignmentChangeUniqueResource(newValue) {
  if (newValue == false) {
    dojo.byId('assignmentRateRow').style.display="none";
    dojo.byId('assignmentCapacityResourceTeam').style.display="table-row";
  } else {
    dojo.byId('assignmentRateRow').style.display="table-row";
    dojo.byId('assignmentCapacityResourceTeam').style.display="none";
  }
}

var assignmentUserSelectUniqueResourceCurrent=null;
function assignmentUserSelectUniqueResource(newValue, idRes) {
  if (assignmentUserSelectUniqueResourceCurrent != null)
    return;
  assignmentUserSelectUniqueResourceCurrent=idRes;
  dojo.query(".dialogAssignmentManualSelectCheck").forEach(
      function(node, index, nodelist) {
        var id=node.getAttribute('widgetid');
        if (dijit.byId(id) && parseInt(id.substr(34)) != parseInt(idRes)) {
          dijit.byId(id).set('checked', false);
        }
      });
  dojo.byId("dialogAssignmentManualSelect").value=(newValue) ? idRes : null;
  setTimeout("assignmentUserSelectUniqueResourceCurrent=null;", 100);
}

function assignmentChangeResource() {
  if (editAssignmentLoading)
    return;
  var idResource=dijit.byId("assignmentIdResource").get("value");
  var isTeam=dojo.byId("isTeam").value;
  var isOrganization=dojo.byId("isOrganization").value;
  var isResourceTeam=dojo.byId("isResourceTeam").value;
  if (isTeam=='1' || isOrganization=='1') return;
  if (!idResource) {
    return;
  }
  if (dijit.byId('assignmentDailyCost')) {
    dijit.byId('assignmentDailyCost').reset();
  }
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=isResourceTeam&idResource='
        + idResource + '&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      loadContent('../tool/refreshRoleAssignment.php?idResource='+idResource,
          'assignmentIdRoleDiv', 'assignmentForm', null, null, null, null,
          callBack);
      if (1 || data == 1) {
        dijit.byId('assignmentIdRole').required = false
      } else {
        dijit.byId('assignmentIdRole').required = true;
      }
    }
  });
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=resourceRole&idResource='
        + idResource + '&isTeam=' + isTeam + '&isOrganization='
        + isOrganization + '&isResourceTeam=' + isResourceTeam+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      // if (data) dijit.byId('assignmentCapacity').set('value',
      // parseInt(data)); // Error fixed by PBER : we retreive an idRole (and
      // must)
      if (data)
        dijit.byId('assignmentIdRole').set('value', parseInt(data));
    }
  });
}

function assignmentChangeResourceSelectFonction() {
  if (editAssignmentLoading)
    return;
  var idResource=dijit.byId("assignmentIdResource").get("value");
  if (!idResource) {
    return;
  }
  if (dijit.byId('assignmentDailyCost')) {
    dijit.byId('assignmentDailyCost').reset();
  }
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=resourceRole&idResource='
        + idResource+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      refreshListSpecific('listRoleResource', 'assignmentIdRole', 'idResource',
          idResource);
      if (data) {
        dijit.byId('assignmentIdRole').set('value', parseInt(data));
      } else {
        dijit.byId('assignmentIdRole').set('value', null);
      }
    }
  });
}

function refreshReccurentAssignmentDiv() {
  showWait();
  callBack=function() {
    hideWait();
  };
  loadContent('../tool/refreshReccurentAssignmentDiv.php',
      'recurringAssignmentDiv', 'assignmentForm', null, null, null, null,
      callBack);
}

function assignmentChangeRole() {
  if (editAssignmentLoading)
    return;
  var idResource=dijit.byId("assignmentIdResource").get("value")
  var idRole=dijit.byId("assignmentIdRole").get("value");
  if (!idRole.trim() && !isResourceTeam)
    disableWidget('dialogAssignmentSubmit');
  else if (dijit.byId('dialogAssignmentSubmit').get('disabled') == true)
    enableWidget('dialogAssignmentSubmit');
  if (!idResource || !idRole)
    return;  
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=resourceCost&idResource='
        + idResource + '&idRole=' + idRole+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      dijit.byId('assignmentDailyCost').set('value', dojo.number.format(data));
    }
  });
}

function assUpdateLeftWork(id, dialogEdit) {
  var idDialogEdit = (dialogEdit)?'dialogEdit_':'';
  var initAss=dojo.byId(idDialogEdit+'initAss_' + id).value;
  var assign=dijit.byId(idDialogEdit+"assAssignedWork_" + id).get('value');
  var newAss=assign;
  if (newAss == null || isNaN(newAss)) {
    newAss=0;
    dijit.byId(idDialogEdit+"assAssignedWork_" + id).set('value', 0);
  }
  var objClass=null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objClass=dojo.byId('assignmentDialogObjectClass').value;
  }else{
    objClass=dojo.byId('objectClass').value;
  }
  isOnRealTime=false;
  if (objClass == 'Activity') {
    var isOnRealTime=null;
    if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
      isOnRealTime=dojo.byId('assignmentDialogWorkOnRealTime').value;
      isOnRealTime = (isOnRealTime == '1')?'on':'off';
    }else{
      isOnRealTime=dijit.byId('workOnRealTime').get('value');
    }
    if (isOnRealTime == 'on') {
      var realdWork=dojo.byId(idDialogEdit+"RealWork_" + id).value;
      if (assign < realdWork) {
        dijit.byId(idDialogEdit+"assAssignedWork_" + id).set("value",
            dojo.byId(idDialogEdit+'initAss_' + id).value);
        dojo.byId(idDialogEdit+'initLeft_' + id).value=dojo.byId(idDialogEdit+'initAss_' + id).value;
        showAlert(i18n('assingedWorkCantBeLowerInWorkOnRealTime'));
        return;
      }
    }
  }
  var leftWork=dijit.byId(idDialogEdit+'assLeftWork_' + id).get("value");
  var diff=(newAss) - (initAss);
  var newLeft=leftWork + diff;
  if (newLeft < 0 || isNaN(newLeft)) {
    newLeft=0;
  }
  var assPeAss=dijit.byId(objClass + 'PlanningElement_assignedWork');
  var valPeAss=dijit.byId(objClass + 'PlanningElement_validatedWork');
  if (assPeAss) {
    assPeAss.set("value", assPeAss.get("value") + diff);
  }
  if (objClass == 'Activity' && isOnRealTime == 'on'
      && valPeAss) {
    valPeAss.set("value", assPeAss.get("value"));
  }
  dijit.byId(idDialogEdit+'assLeftWork_' + id).set("value", newLeft); // Will trigger the
  // saveLeftWork()
  // function
  dojo.byId(idDialogEdit+'initAss_' + id).value=newAss;
  diff=0;
  if(dojo.byId(objClass + 'PlanningElement_assignedCost'))dojo.byId(objClass + 'PlanningElement_assignedCost').style.textDecoration="line-through";
  if (objClass == 'Activity' && isOnRealTime == 'on') {
    if(dojo.byId(objClass + 'PlanningElement_validatedCost'))dojo.byId(objClass + 'PlanningElement_validatedCost').style.textDecoration="line-through";
    ;
  }
}

function assUpdateLeftWorkDirect(id, dialogEdit) {
  var idDialogEdit = (dialogEdit)?'dialogEdit_':'';
  var initLeft=dojo.byId(idDialogEdit+'initLeft_' + id).value;
  var assign=dijit.byId(idDialogEdit+"assAssignedWork_" + id).get('value');
  var left=dijit.byId(idDialogEdit+"assLeftWork_" + id).get('value');
  if (left == null || isNaN(left)) {
    left=0;
  }
  var objClass=null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objClass=dojo.byId('assignmentDialogObjectClass').value;
  }else{
    objClass=dojo.byId('objectClass').value;
  }
  if (objClass == 'Activity') {
    var isOnRealTime=null;
    if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
      isOnRealTime=dojo.byId('assignmentDialogWorkOnRealTime').value;
      isOnRealTime = (isOnRealTime == '1')?'on':'off';
    }else{
      isOnRealTime=dijit.byId('workOnRealTime').get('value');
    }
    if (isOnRealTime == 'on') {
      var realdWork=dojo.byId(idDialogEdit+"RealWork_" + id).value;
      var assign=parseFloat(dijit.byId(idDialogEdit+"assAssignedWork_" + id).get('value'));
      var revised=parseFloat(realdWork) + parseFloat(left);
      if (assign != revised) {
        dijit.byId(idDialogEdit+"assAssignedWork_" + id).set("value", revised);
        dojo.byId(idDialogEdit+'initAss_' + id).value=revised;
      }
    }
  }
  var diff=(left) - (initLeft);
  var assPeLeft=dijit.byId(objClass + 'PlanningElement_leftWork');
  if (assPeLeft) {
    assPeLeft.set("value", assPeLeft.get("value") + diff);
  }
  var assPePlanned=dijit.byId(objClass + 'PlanningElement_plannedWork');
  if (assPePlanned) {
    assPePlanned.set("value", assPePlanned.get("value") + diff);
  }
  //
  dojo.byId(idDialogEdit+'initLeft_' + id).value=left;
  diff=0;
  if(dojo.byId(objClass + 'PlanningElement_leftCost'))dojo.byId(objClass + 'PlanningElement_leftCost').style.textDecoration="line-through";
}


function saveAssignedWork(id, zone, dialogEdit) {
  var idDialogEdit = (dialogEdit == 1)?'dialogEdit_':'';
  var value=dijit.byId(idDialogEdit+"ass" + zone + "_" + id).get("value");
  var objClass=null;
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    objClass=dojo.byId('assignmentDialogObjectClass').value;
  }else{
    objClass=dojo.byId('objectClass').value;
  }
  var url='../tool/saveLeftWork.php?idAssign=' + id + '&zone=' + zone
      + '&valueTextZone=' + value;
  dojo
      .xhrPut({
        url : url+'&csrfToken='+csrfToken,
        form : (!dialogEdit)?'objectForm':null,
        handleAs : "text",
        load : function(data) {
          addMessage(i18n("col" + zone) + " " + i18n("resultSave"));
          document.getElementById('idImage' + zone + id).style.display="none";
          setTimeout("dojo.byId('idImage" + zone + id
              + "').style.display='block';", 1000);
          if(dialogEdit == 1){
            refreshGrid();
          }
        }
      });
}

function saveLeftWork(id, zone, dialogEdit) {
  var idDialogEdit = (dialogEdit == 1)?'dialogEdit_':'';
  var value=dijit.byId(idDialogEdit+"ass" + zone + "_" + id).get("value");
  if (isNaN(value) || value == null) {
    value=0;
    dijit.byId(idDialogEdit+"ass" + zone + "_" + id).set("value", 0);
  }
  if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
    var objClass=dojo.byId('assignmentDialogObjectClass').value;
  }else{
    var objClass=dojo.byId('objectClass').value;
  }
  var isOnRealTime=false;
  if (objClass == 'Activity') {
    if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
      isOnRealTime=dojo.byId('assignmentDialogWorkOnRealTime').value;
      isOnRealTime = (isOnRealTime == '1')?'on':0;
    }else{
      isOnRealTime=dijit.byId('workOnRealTime').get('value');
    }
  }
  
  var initLeft=dojo.byId(idDialogEdit+'initLeft_' + id).value;
  var assPeLeft=dijit.byId(objClass + 'PlanningElement_leftWork');
  var assPePlan=dijit.byId(objClass + 'PlanningElement_plannedWork');
  var assPeAss=dijit.byId(objClass + 'PlanningElement_assignedWork');
  var valPeAss=dijit.byId(objClass + 'PlanningElement_validatedWork');
  
  var diff=value - initLeft;

  if (assPeLeft) {
    assPeLeft.set("value", assPeLeft.get("value") + diff);
  }
  if (assPePlan) {
    assPePlan.set("value", assPePlan.get("value") + diff);
  }
  if (objClass == 'Activity' && isOnRealTime == 'on'
    && assPeAss) {
    assPeAss.set("value", assPePlan.get("value") + diff);
  }
  
  if (objClass == 'Activity' && isOnRealTime == 'on'
    && valPeAss) {
    valPeAss.set("value", assPePlan.get("value") + diff);
  }
  var url='../tool/saveLeftWork.php?idAssign=' + id + '&zone=' + zone
      + '&valueTextZone='+ value;
  dojo
      .xhrPut({
        url : url+'&csrfToken='+csrfToken,
        form : (!dialogEdit)?'objectForm':null,
        handleAs : "text",
        load : function(data) {
          if (data.substring(0, 3) == 'OK#') {
            addMessage(i18n("col" + zone) + " " + i18n("resultSave"));
            document.getElementById(idDialogEdit+'idImage' + zone + id).style.display="block";
            setTimeout("dojo.byId('"+idDialogEdit+"idImage" + zone + id
                + "').style.display='none';", 1000);
            if(dijit.byId('dialogEditAssignmentPlanning') && dijit.byId('dialogEditAssignmentPlanning').open){
              var objClass=dojo.byId('assignmentDialogObjectClass').value;
              var objId=dojo.byId('assignmentDialogObjectId').value;
            }else{
              var objClass=dojo.byId('objectClass').value;
              var objId=dojo.byId('objectId').value;
            }
            if(data.substring(3) != ''){
              dijit.byId(objClass + 'PlanningElement_realEndDate').set('value',data.substring(3));
            } else {
              dijit.byId(objClass + 'PlanningElement_realEndDate').set('value',null);
            }
          }else{
            document.getElementById(idDialogEdit+'idImage' + zone + 'KO' + id).style.display="block";
            setTimeout("dojo.byId('"+idDialogEdit+"idImage" + zone + 'KO' + id
                + "').style.display='none';", 1000);
            let doc = new DOMParser().parseFromString(data, "text/html");
            var destination = 'resultDivMain';
            var validationType = null;
            var contentNode=dojo.byId(destination);
            contentNode.innerHTML=data;
            var lastOperationStatus=dojo.byId('lastOperationStatus');
            var lastOperation=dojo.byId('lastOperation');
            if (!(lastOperationStatus && lastOperation)) {
              consoleTraceLog("***** Error **** isResultMessage without lastOperation or lastOperationStatus");
              consoleTraceLog(data);
            }
            dojo.fadeIn({
              node:contentNode,
              duration:100,
              onEnd:function() {
                if (!editorInFullScreen()) {
                  finalizeMessageDisplay(destination,validationType);
                } else {
                  var elemDiv=document.createElement('div');
                  elemDiv.id='testFade';
                  var leftMsg=(window.innerWidth - 400) / 2;
                  elemDiv.style.cssText='position:absolute;text-align:center;width:400px;height:auto;z-index:10000;top:50px;left:' + leftMsg + 'px';
                  elemDiv.innerHTML=data;
                  document.body.appendChild(elemDiv);
                  resultDivFadingOut=dojo.fadeOut({
                    node:elemDiv,
                    duration:3000,
                    onEnd:function() {
                      elemDiv.remove();
                    }
                  }).play();
                  hideWait();
                  formInitialize();
                  if (whichFullScreen == 996) {
                  } else if (whichFullScreen >= 0 && editorArray[whichFullScreen]) {
                    editorArray[whichFullScreen].focus();
                  }
                }
              }
            }).play();
          }
          
          dojo.byId('planLastSavedClass').value=objClass;
          dojo.byId('planLastSavedId').value=objId;
          if(dialogEdit == 1){
            refreshGrid();
          }
        }
      });
  dojo.byId(idDialogEdit+'initLeft_' + id).value=value;
  if(dojo.byId(objClass + 'PlanningElement_leftCost'))dojo.byId(objClass + 'PlanningElement_leftCost').style.textDecoration="line-through";
  if(dojo.byId(objClass + 'PlanningElement_plannedCost'))dojo.byId(objClass + 'PlanningElement_plannedCost').style.textDecoration="line-through";
}

// =============================================================================
// = Dependency
// =============================================================================

function addDependency(depType) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  noRefreshDependencyList=false;
  var objectClass=dojo.byId('objectClass').value;
  var objectId=dojo.byId("objectId").value;
  var message=i18n("dialogDependency");
  if (depType) {
    dojo.byId("dependencyType").value=depType;
    message=i18n("dialogDependencyRestricted", new Array(i18n(objectClass),
        objectId, i18n(depType)));
  } else {
    dojo.byId("dependencyType").value=null;
    message=i18n("dialogDependencyExtended", new Array(i18n(objectClass),
        objectId.value));
  }
  if (objectClass == 'Requirement') {
    refreshList('idDependable', 'scope', 'R', '4', 'dependencyRefTypeDep', true);
    dijit.byId("dependencyRefTypeDep").set('value', '4');
    dijit.byId("dependencyDelay").set('value', '0');
    dojo.byId("dependencyDelayDiv").style.display="none";
    dojo.byId("dependencyTypeDiv").style.display="none";
  } else if (objectClass == 'TestCase') {
    refreshList('idDependable', 'scope', 'TC', '5', 'dependencyRefTypeDep',
        true);
    dijit.byId("dependencyRefTypeDep").set('value', '5');
    dijit.byId("dependencyDelay").set('value', '0');
    dojo.byId("dependencyDelayDiv").style.display="none";
    dojo.byId("dependencyTypeDiv").style.display="none";
  } else {
    if (objectClass == 'Project') {
      dijit.byId("dependencyRefTypeDep").set('value', '3');
      refreshList('idDependable', 'scope', 'PE', '3', 'dependencyRefTypeDep',
          true);
    } else {
      dijit.byId("dependencyRefTypeDep").set('value', '1');
      refreshList('idDependable', 'scope', 'PE', '1', 'dependencyRefTypeDep',
          true);
    }
    if (objectClass == 'Term') {
      dojo.byId("dependencyDelayDiv").style.display="none";
      dojo.byId("dependencyTypeDiv").style.display="none";
      dijit.byId("typeOfDependency").set("value", "E-S");
    } else {
      dojo.byId("dependencyDelayDiv").style.display="block";
      dojo.byId("dependencyTypeDiv").style.display="block";
    }
  }
  dojo.byId("dependencyRefType").value=objectClass;
  dojo.byId("dependencyRefId").value=objectId;
  refreshList('idActivity', 'idProject', '0', null, 'dependencyRefIdDepEdit',
      false);
  dijit.byId('dependencyRefIdDepEdit').reset();
  dojo.byId("dependencyId").value="";
  dijit.byId("dialogDependency").set('title', message);
  dijit.byId("dialogDependency").show();
  dojo.byId('dependencyAddDiv').style.display='block';
  dojo.byId('dependencyEditDiv').style.display='none';
  dijit.byId("dependencyRefTypeDep").set('readOnly', false);
  dijit.byId("dependencyComment").set('value', null);
  disableWidget('dialogDependencySubmit');
  refreshDependencyList();
}

function editDependency(depType, id, refType, refTypeName, refId, delay,
    typeOfDependency) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  noRefreshDependencyList=true;
  var objectClass=dojo.byId('objectClass').value;
  var objectId=dojo.byId("objectId").value;
  var message=i18n("dialogDependencyEdit");
  if (objectClass == 'Requirement') {
    refreshList('idDependable', 'scope', 'R', refType, 'dependencyRefTypeDep',
        true);
    dijit.byId("dependencyRefTypeDep").set('value', refType);
    dijit.byId("dependencyDelay").set('value', '0');
    dojo.byId("dependencyDelayDiv").style.display="none";
    dojo.byId("dependencyTypeDiv").style.display="none";
  } else if (objectClass == 'TestCase') {
    refreshList('idDependable', 'scope', 'TC', refType, 'dependencyRefTypeDep',
        true);
    dijit.byId("dependencyRefTypeDep").set('value', refType);
    dijit.byId("dependencyDelay").set('value', '0');
    dojo.byId("dependencyDelayDiv").style.display="none";
    dojo.byId("dependencyTypeDiv").style.display="none";
  } else {
    refreshList('idDependable', 'scope', 'PE', refType, 'dependencyRefTypeDep',
        true);
    dijit.byId("dependencyRefTypeDep").set('value', refType);
    dijit.byId("dependencyDelay").set('value', delay);
    dojo.byId("dependencyDelayDiv").style.display="block";
    dojo.byId("dependencyTypeDiv").style.display="block";
  }
  refreshList('id' + refTypeName, 'idProject', '0', refId,
      'dependencyRefIdDepEdit', true);
  dijit.byId('dependencyRefIdDepEdit').set('value', refId);
  dojo.byId("dependencyId").value=id;
  dojo.byId("dependencyRefType").value=objectClass;
  dojo.byId("dependencyRefId").value=objectId;
  dojo.byId("dependencyType").value=depType;
  dijit.byId("typeOfDependency").set('value', typeOfDependency);
  dijit.byId("dialogDependency").set('title', message);
  dijit.byId("dialogDependency").show();
  dojo.byId('dependencyAddDiv').style.display='none';
  dojo.byId('dependencyEditDiv').style.display='block';
  dijit.byId("dependencyRefTypeDep").set('readOnly', true);
  dijit.byId("dependencyRefIdDepEdit").set('readOnly', true);
  disableWidget('dialogDependencySubmit');
  disableWidget('dependencyComment');
  dijit.byId('dependencyComment').set('value', "");
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=dependencyComment&idDependency='
        + id+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      dijit.byId('dependencyComment').set('value', data);
      enableWidget('dialogDependencySubmit');
      enableWidget('dependencyComment');
    }
  });
}

var noRefreshDependencyList=false;
function refreshDependencyList(selected) {
  if (noRefreshDependencyList)
    return;
  disableWidget('dialogDependencySubmit');
  var url='../tool/dynamicListDependency.php';
  if (selected) {
    url+='?selected=' + selected;
  }
  loadContent(url, 'dialogDependencyList', 'dependencyForm', false);
}

function saveDependency() {
  var formVar=dijit.byId('dependencyForm');
  if (!formVar.validate()) {
    showAlert(i18n("alertInvalidForm"));
    return;
  }
  if (dojo.byId("dependencyRefIdDep").value == ""
      && !dojo.byId('dependencyId').value)
    return;
  loadContent("../tool/saveDependency.php", "resultDivMain", "dependencyForm",
      true, 'dependency');
  dijit.byId('dialogDependency').hide();
}

function saveDependencyFromDndLink(ref1Type, ref1Id, ref2Type, ref2Id) {
  if (ref1Type == ref2Type && ref1Id == ref2Id)
    return;
  param="ref1Type=" + ref1Type;
  param+="&ref1Id=" + ref1Id;
  param+="&ref2Type=" + ref2Type;
  param+="&ref2Id=" + ref2Id;
  loadContent("../tool/saveDependencyDnd.php?" + param, "resultDivMain", null,
      true, 'dependency');
}

function removeDependency(dependencyId, refType, refId) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  dojo.byId("dependencyId").value=dependencyId;
  actionOK=function() {
    loadContent("../tool/removeDependency.php", "resultDivMain",
        "dependencyForm", true, 'dependency');
  };
  msg=i18n('confirmDeleteLink', new Array(i18n(refType), refId));
  showConfirm(msg, actionOK);
}

// =============================================================================
// = Plan
// =============================================================================

var oldSelectedProjectsToPlan=null;
function showPlanParam(selectedProject) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  dijit.byId("dialogPlan").show();
  oldSelectedProjectsToPlan=dijit.byId("idProjectPlan").get("value");
}

function changedIdProjectPlan(value) {
  var selectField=dijit.byId("idProjectPlan").get("value");
  if (selectField.length <= 0) {
    dijit.byId('dialogPlanSubmit').set('disabled', true);
  } else {
    dijit.byId('dialogPlanSubmit').set('disabled', false);
  }
  if (!oldSelectedProjectsToPlan || oldSelectedProjectsToPlan == value)
    return;
  if (oldSelectedProjectsToPlan.indexOf(" ") >= 0 && value.length > 1) {
    if (value.indexOf(" ") >= 0) {
      value.splice(0, 1);
    }
    oldSelectedProjectsToPlan=value;
    dijit.byId("idProjectPlan").set("value", value);
  } else if (value.indexOf(" ") >= 0
      && oldSelectedProjectsToPlan.indexOf(" ") === -1) {
    value=[ " " ];
    oldSelectedProjectsToPlan=value;
    dijit.byId("idProjectPlan").set("value", value);
  }
  oldSelectedProjectsToPlan=value;
}

function saveProjectCriticalResources(value) {
  if (oldValueProjectCriticalResources.indexOf(" ") >= 0 && value.length > 1) {
    if (value.indexOf(" ") >= 0) {
      value.splice(0, 1);
    }
    oldValueProjectCriticalResources=value;
    dijit.byId("idProjectCriticalResources").set("value", value);
  } else if (value.length ==0 ) {
    value=[" "];
    dijit.byId("idProjectCriticalResources").set("value", value);
  } else if (value.indexOf(" ") >= 0
      && oldValueProjectCriticalResources.indexOf(" ") === -1) {
    value=[ " " ];
    oldValueProjectCriticalResources=value;
    dijit.byId("idProjectCriticalResources").set("value", value);
  } 
  
  oldValueProjectCriticalResources = value;
  saveDataToSession('idProjectCriticalResources', value,false);
}


function showSelectedProject(value) {
  var selectedProj=oldSelectedProjectsToPlan;
  var callback=function() {
    dijit.byId("idProjectPlan").set("value", selectedProj);
    var selectField=dijit.byId("idProjectPlan").get("value");
    if (selectField.length <= 0) {
      dijit.byId('dialogPlanSubmit').set('disabled', true);
    } else {
      dijit.byId('dialogPlanSubmit').set('disabled', false);
    }
  };
  loadContent("../view/refreshSelectedProjectListDiv.php?isChecked=" + value
      + "&selectedProjectPlan=" + selectedProj, "selectProjectList",
      "dialogPlanForm", false, null, null, null, callback);
}

function plan(allItems) {
  if (allItems && allItems!=undefined) {
    dojo.byId('planLastSavedClass').value="";
    dojo.byId('planLastSavedId').value="";
  }
  var bt=dijit.byId('planButton');
  if (bt) {
    bt.set('iconClass', "dijitIcon iconPlan");
  }
  if (!dijit.byId('idProjectPlan').get('value')) {
    dijit.byId('idProjectPlan').set('value', ' ');
  }
  if (!dijit.byId('startDatePlan').get('value')) {
    showAlert(i18n('messageInvalidDate'));
    return;
  }
  loadContent("../tool/plan.php", "resultDivMain", "dialogPlanForm", true, null);
  dijit.byId("dialogPlan").hide();
}

function cancelPlan() {
  if (!dijit.byId('idProjectPlan').get('value')) {
    dijit.byId('idProjectPlan').set('value', ' ');
  }
  dijit.byId('dialogPlan').hide();
}

function showPlanSaveDates() {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  callBack=function() {
    var proj=dijit.byId('idProjectPlan');
    if (proj && proj.get('value') && proj.get('value') != '*') {
      dijit.byId('idProjectPlanSaveDates').set('value', proj.get('value'));
    }
  };
  loadDialog('dialogPlanSaveDates', callBack, true, null, true);
}

function planSaveDates() {
  var formVar=dijit.byId('dialogPlanSaveDatesForm');
  if (!formVar.validate()) {
    showAlert(i18n("alertInvalidForm"));
    return;
  }
  if (!dijit.byId('idProjectPlanSaveDates').get('value')) {
    dijit.byId('idProjectPlanSaveDates').set('value', ' ');
  }
  loadContent("../tool/planSaveDates.php", "resultDivMain",
      "dialogPlanSaveDatesForm", true, null);
  dijit.byId("dialogPlanSaveDates").hide();
}

// =============================================================================
// = Baseline
// =============================================================================

function showPlanningBaseline() {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
//  callBack=function() {
//    var proj=dijit.byId('idProjectPlan');
//    if (proj) {
//      dijit.byId('idProjectPlanBaseline').set('value', proj.get('value'));
//    }
//  };
  callBack=null;
  loadDialog('dialogPlanBaseline', callBack, true);
}

function savePlanningBaseline() {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callback=function() {
    dijit.byId('selectBaselineTop').reset();
    dijit.byId('selectBaselineBottom').reset();
    refreshList('idBaselineSelect', null, null, null, 'selectBaselineTop');
    refreshList('idBaselineSelect', null, null, null, 'selectBaselineBottom');
  };
  if (dojo.byId('isGlobalPlanning')) {
    if (dojo.byId('globalPlanning')
        && dojo.byId('globalPlanning').value == 'true') {
      dojo.byId('isGlobalPlanning').value='true';
    }
  }
  var formVar=dijit.byId('dialogPlanBaselineForm');
  if (formVar.validate()) {
    loadContent("../tool/savePlanningBaseline.php", "resultDivMain",
        "dialogPlanBaselineForm", true, null, null, null, callback);
    dijit.byId("dialogPlanBaseline").hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function editBaseline(baselineId) {
  var params="&editMode=true&baselineId=" + baselineId;
  loadDialog('dialogPlanBaseline', null, true, params, true);
}

function removeBaseline(baselineId) {
  var param="?baselineId=" + baselineId;
  actionOK=function() {
    var callback=function() {
      dijit.byId('selectBaselineTop').reset();
      dijit.byId('selectBaselineBottom').reset();
      refreshList('idBaselineSelect', null, null, null, 'selectBaselineTop');
      refreshList('idBaselineSelect', null, null, null, 'selectBaselineBottom');
    };
    loadContent("../tool/removePlanningBaseline.php" + param,"dialogPlanBaseline", null,null,null,null,null,callback);
  };
  msg=i18n('confirmDelete', new Array(i18n('Baseline'), baselineId));
  showConfirm(msg, actionOK);
}

// =============================================================================
// = Affectation
// =============================================================================

function addAffectation(objectClass, type, idResource, idProject, isTeam, isOrganization) {
  var callBack=function() {
    affectationLoad=true;
    dijit.byId("dialogAffectation").show();
    setTimeout("affectationLoad=false", 500);
  };
  var params="&idProject=" + idProject;
  params+="&objectClass=" + objectClass;
  params+="&idResource=" + idResource;
  params+="&type=" + type;
  params+="&isTeam=" + isTeam;
  params+="&isOrganization=" + isOrganization;
  params+="&mode=add";
  loadDialog('dialogAffectation', callBack, false, params);
}

function addResourceCapacity(objectClass, type, idResource) {
  var callBack=function() {
    affectationLoad=true;
    dijit.byId("dialogResourceCapacity").show();
    setTimeout("affectationLoad=false", 500);
  };
  var params="&idResource=" + idResource;
  params+="&type=" + type;
  params+="&mode=add";
  loadDialog('dialogResourceCapacity', callBack, false, params);
}

function saveResourceCapacity(capacity) {
  var formVar=dijit.byId('resourceCapacityForm');
  if (dijit.byId('resourceCapacityStartDate')
      && dijit.byId('resourceCapacityEndDate')) {
    var start=dijit.byId('resourceCapacityStartDate').value;
    var end=dijit.byId('resourceCapacityEndDate').value;
    if (start && end && dayDiffDates(start, end) < 0) {
      showAlert(i18n("errorStartEndDates", new Array(i18n("colStartDate"),
          i18n("colEndDate"))));
      return;
    }
  }
  if (dijit.byId('resourceCapacity')) {
    var newCapacity=dijit.byId('resourceCapacity').value;
    if (capacity === newCapacity) {
      showAlert(i18n("changeCapacity"));
      return;
    }
  }

  if (formVar.validate()) {
    loadContent("../tool/saveResourceCapacity.php", "resultDivMain",
        "resourceCapacityForm", true, 'affectation');
    dijit.byId('dialogResourceCapacity').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function removeResourceCapacity(id, idResource) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    loadContent("../tool/removeResourceCapacity.php?idResourceCapacity=" + id
        + "&idResource=" + idResource, "resultDivMain", null, true,
        'affectation');
  };
  msg=i18n('confirmDeleteResourceCapacity', new Array(id, i18n('Resource'),
      idResource));
  showConfirm(msg, actionOK);
}

function editResourceCapacity(id, idResource, capacity, idle, startDate,
    endDate) {
  affectationLoad=true;
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dojo
        .xhrGet({
          url : '../tool/getSingleData.php?dataType=resourceCapacityDescription&idResourceCapacity='
              + id+'&csrfToken='+csrfToken,
          handleAs : "text",
          load : function(data) {
            dijit.byId('resourceCapacityDescription').set('value', data);
            enableWidget("resourceCapacityDescription");
          }
        });
    if (capacity) {
      dijit.byId("resourceCapacity").set('value', parseFloat(capacity));
    }
    if (startDate) {
      dijit.byId("resourceCapacityStartDate").set('value', startDate);
    } else {
      dijit.byId("resourceCapacityStartDate").reset();
    }
    if (endDate) {
      dijit.byId("resourceCapacityEndDate").set('value', endDate);
    } else {
      dijit.byId("resourceCapacityEndDate").reset();
    }
    if (idle == 1) {
      dijit.byId("resourceCapacityIdle").set('value', idle);
    } else {
      dijit.byId("resourceCapacityIdle").reset();
    }
    dijit.byId("dialogResourceCapacity").show();
    setTimeout("affectationLoad=false", 500);
  };
  var params="&id=" + id;
  params+="&idResource=" + idResource;
  params+="&mode=edit";
  loadDialog('dialogResourceCapacity', callBack, false, params);
}

// end workUnit

// gautier resourceSurbooking
function addResourceSurbooking(objectClass, type, idResource) {
  var callBack=function() {
    affectationLoad=true;
    dijit.byId("dialogResourceSurbooking").show();
    setTimeout("affectationLoad=false", 500);
  };
  var params="&idResource=" + idResource;
  params+="&type=" + type;
  params+="&mode=add";
  loadDialog('dialogResourceSurbooking', callBack, false, params);
}

function saveResourceSurbooking(capacity) {
  var formVar=dijit.byId('resourceSurbookingForm');
  if (dijit.byId('resourceSurbookingStartDate')
      && dijit.byId('resourceSurbookingEndDate')) {
    var start=dijit.byId('resourceSurbookingStartDate').value;
    var end=dijit.byId('resourceSurbookingEndDate').value;
    if (start && end && dayDiffDates(start, end) < 0) {
      showAlert(i18n("errorStartEndDates", new Array(i18n("colStartDate"),
          i18n("colEndDate"))));
      return;
    }
  }
  if (dijit.byId('resourceSurbooking')) {
    var newCapacity=dijit.byId('resourceSurbooking').value;
    if (newCapacity === 0) {
      showAlert(i18n("changeSurbooking"));
      return;
    }
  }
  if (formVar.validate()) {
    loadContent("../tool/saveResourceSurbooking.php", "resultDivMain",
        "resourceSurbookingForm", true, 'affectation');
    dijit.byId('dialogResourceSurbooking').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function removeResourceSurbooking(id, idResource) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    loadContent("../tool/removeResourceSurbooking.php?idResourceSurbooking="
        + id + "&idResource=" + idResource, "resultDivMain", null, true,
        'affectation');
  };
  msg=i18n('confirmDeleteResourceSurbooking', new Array(id, i18n('Resource'),
      idResource));
  showConfirm(msg, actionOK);
}

function editResourceSurbooking(id, idResource, capacity, idle, startDate,
    endDate) {
  affectationLoad=true;
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dojo
        .xhrGet({
          url : '../tool/getSingleData.php?dataType=resourceSurbookingDescription&idResourceSurbooking='
              + id+'&csrfToken='+csrfToken,
          handleAs : "text",
          load : function(data) {
            dijit.byId('resourceSurbookingDescription').set('value', data);
            enableWidget("resourceSurbookingDescription");
          }
        });
    if (capacity) {
      dijit.byId("resourceSurbooking").set('value', parseFloat(capacity));
    }
    if (startDate) {
      dijit.byId("resourceSurbookingStartDate").set('value', startDate);
    } else {
      dijit.byId("resourceSurbookingStartDate").reset();
    }
    if (endDate) {
      dijit.byId("resourceSurbookingEndDate").set('value', endDate);
    } else {
      dijit.byId("resourceSurbookingEndDate").reset();
    }
    if (idle == 1) {
      dijit.byId("resourceSurbookingIdle").set('value', idle);
    } else {
      dijit.byId("resourceSurbookingIdle").reset();
    }
    dijit.byId("dialogResourceSurbooking").show();
    setTimeout("affectationLoad=false", 500);
  };
  var params="&id=" + id;
  params+="&idResource=" + idResource;
  params+="&mode=edit";
  loadDialog('dialogResourceSurbooking', callBack, false, params);
}

// gautier #resourceTeam
function addAffectationResourceTeam(objectClass, type, idResource) {
  var callBack=function() {
    affectationLoad=true;
    dijit.byId("dialogAffectationResourceTeam").show();
    setTimeout("affectationLoad=false", 500);
  };
  var params="&idResource=" + idResource;
  params+="&type=" + type;
  params+="&mode=add";
  loadDialog('dialogAffectationResourceTeam', callBack, false, params);
}

function removeAffectation(id, own, affectedClass, affectedId) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    var callback = function(){
      if(dijit.byId('dialogEditAffectationPlanning') && dijit.byId('dialogEditAffectationPlanning').open){
        var objClass=dojo.byId('affectationObjectClass').value;
        var objId = dojo.byId("affectationObjectId").value;
        var params="&objectClass=" + objClass + "&objectId=" + objId;
        loadDialog('dialogEditAffectationPlanning', null, true, params);
      }
    };
    loadContent("../tool/removeAffectation.php?affectationId=" + id
        + "&affectationIdTeam=''", "resultDivMain", null, true, 'affectation', null, null, callback);
  };
  if (own) {
    msg='<span style="color:red;font-weight:bold;">'
        + i18n('confirmDeleteOwnAffectation', new Array(id)) + '</span>';
  } else {
    msg=i18n('confirmDeleteAffectation', new Array(id, i18n(affectedClass),
        affectedId));
  }
  showConfirm(msg, actionOK);
}

function removeAffectationResourceTeam(id, idResource) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    var callback = function(){
      if(dijit.byId('dialogEditAffectationPlanning') && dijit.byId('dialogEditAffectationPlanning').open){
        var objClass=dojo.byId('affectationObjectClass').value;
        var objId = dojo.byId("affectationObjectId").value;
        var params="&objectClass=" + objClass + "&objectId=" + objId;
        loadDialog('dialogEditAffectationPlanning', null, true, params);
      }
    };
    loadContent("../tool/removeAffectationResourceTeam.php?affectaionId=" + id,
        "resultDivMain", null, true, 'affectation', null, null, callback);
  };
  msg=i18n('confirmDeleteAffectation', new Array(id, i18n('Resource'),
      idResource));
  showConfirm(msg, actionOK);
}

affectationLoad=false;
function editAffectationResourceTeam(id, objectClass, type, idResource, rate,
    idle, startDate, endDate) {
  affectationLoad=true;
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dojo
        .xhrGet({
          url : '../tool/getSingleData.php?dataType=affectationDescriptionResourceTeam&idAffectation='
              + id+'&csrfToken='+csrfToken,
          handleAs : "text",
          load : function(data) {
            dijit.byId('affectationDescriptionResourceTeam').set('value', data);
            enableWidget("affectationDescriptionResourceTeam");
          }
        });
    if (idResource) {
      dijit.byId("affectationResourceTeam").set('value', idResource);
    }
    if (rate) {
      dijit.byId("affectationRateResourceTeam").set('value', rate);
    }
    if (startDate) {
      dijit.byId("affectationStartDateResourceTeam").set('value', startDate);
    } else {
      dijit.byId("affectationStartDateResourceTeam").reset();
    }
    if (endDate) {
      dijit.byId("affectationEndDateResourceTeam").set('value', endDate);
    } else {
      dijit.byId("affectationEndDateResourceTeam").reset();
    }
    if (idle == 1) {
      dijit.byId("affectationIdleResourceTeam").set('value', idle);
    } else {
      dijit.byId("affectationIdleResourceTeam").reset();
    }
    dijit.byId("dialogAffectationResourceTeam").show();
    setTimeout("affectationLoad=false", 500);
  };
  var objClass=null;
  if(dijit.byId('dialogEditAffectationPlanning') && dijit.byId('dialogEditAffectationPlanning').open){
    objClass=dojo.byId('affectationObjectClass').value;
  }else{
    objClass=dojo.byId('objectClass').value;
  }
  var params="&id=" + id;
  params+="&refType=" + objClass;
  params+="&idResource=" + idResource;
  params+="&mode=edit";
  params+="&type=" + type;
  params+="&objectClass=" + objectClass;
  loadDialog('dialogAffectationResourceTeam', callBack, false, params);
}

function editAffectation(id, objectClass, type, idResource, idProject, rate,
    idle, startDate, endDate, idProfile, isResourceTeam) {
  affectationLoad=true;
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dojo
        .xhrGet({
          url : '../tool/getSingleData.php?dataType=affectationDescription&idAffectation='
              + id+'&csrfToken='+csrfToken,
          handleAs : "text",
          load : function(data) {
            dijit.byId('affectationDescription').set('value', data);
            enableWidget("affectationDescription");
          }
        });
    if (startDate) {
      dijit.byId("affectationStartDate").set('value', startDate);
    } else {
      dijit.byId("affectationStartDate").reset();
    }
    if (endDate) {
      dijit.byId("affectationEndDate").set('value', endDate);
    } else {
      dijit.byId("affectationEndDate").reset();
    }
    if(isResourceTeam == null) {
      var aff = dijit.byId("affectationProfile");
      aff.required = false;
      require(["dojo/query", "dojo/NodeList-dom"], function(query){
        query("#widget_affectationProfile ").removeClass("required");
      });
    }
    if (idle == 1) {
      dijit.byId("affectationIdle").set('value', idle);
    } else {
      dijit.byId("affectationIdle").reset();
    }
    dijit.byId("dialogAffectation").show();
    setTimeout("affectationLoad=false", 500);
  };
  var objClass=null;
  if(dijit.byId('dialogEditAffectationPlanning') && dijit.byId('dialogEditAffectationPlanning').open){
    objClass=dojo.byId('affectationObjectClass').value;
  }else{
    objClass=dojo.byId('objectClass').value;
  }
  var params="&id=" + id;
  params+="&refType=" + objClass;
  params+="&idProject=" + idProject;
  params+="&idResource=" + idResource;
  params+="&mode=edit";
  params+="&type=" + type;
  params+="&objectClass=" + objectClass;
  loadDialog('dialogAffectation', callBack, false, params);
}

function saveAffectation() {
  var formVar=dijit.byId('affectationForm');
  if (dijit.byId('affectationStartDate') && dijit.byId('affectationEndDate')) {
    var start=dijit.byId('affectationStartDate').value;
    var end=dijit.byId('affectationEndDate').value;
    if (start && end && dayDiffDates(start, end) < 0) {
      showAlert(i18n("errorStartEndDates", new Array(i18n("colStartDate"),
          i18n("colEndDate"))));
      return;
    }
  }
  if (formVar.validate()) {
	var callback=function(){
		var isResourceSkill = dojo.byId('isResourceSkill').value;
		if(isResourceSkill){
			hideWait();
			refreshResourceSkillList();
		}
		if(dijit.byId('dialogEditAffectationPlanning') && dijit.byId('dialogEditAffectationPlanning').open){
      var objClass=dojo.byId('affectationObjectClass').value;
      var objId = dojo.byId("affectationObjectId").value;
      var params="&objectClass=" + objClass + "&objectId=" + objId;
      loadDialog('dialogEditAffectationPlanning', null, true, params);
    }
	};
    loadContent("../tool/saveAffectation.php", "resultDivMain",
        "affectationForm", true, 'affectation', null, null, callback);
    dijit.byId('dialogAffectation').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function saveAffectationResourceTeam() {
  var formVar=dijit.byId('affectationResourceTeamForm');
  if (dijit.byId('affectationStartDate') && dijit.byId('affectationEndDate')) {
    var start=dijit.byId('affectationStartDate').value;
    var end=dijit.byId('affectationEndDate').value;
    if (start && end && dayDiffDates(start, end) < 0) {
      showAlert(i18n("errorStartEndDates", new Array(i18n("colStartDate"),
          i18n("colEndDate"))));
      return;
    }
  }
  if (trim(dijit.byId('affectationResourceTeam')) == '') {
    showAlert(i18n("messageMandatory", new Array(i18n("colIdResource"))));
    return;
  }
  if (formVar.validate()) {
    var callback=function(){
      if(dijit.byId('dialogEditAffectationPlanning') && dijit.byId('dialogEditAffectationPlanning').open){
        var objClass=dojo.byId('affectationObjectClass').value;
        var objId = dojo.byId("affectationObjectId").value;
        var params="&objectClass=" + objClass + "&objectId=" + objId;
        loadDialog('dialogEditAffectationPlanning', null, true, params);
      }
    };
    loadContent("../tool/saveAffectationResourceTeam.php", "resultDivMain",
        "affectationResourceTeamForm", true, 'affectation', null, null, callback);
    dijit.byId('dialogAffectationResourceTeam').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function affectTeamMembers(idTeam) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dijit.byId("dialogAffectation").show();
  };
  var params="&affectationIdTeam=" + idTeam;
  loadDialog('dialogAffectation', callBack, false, params);
}

function affectOrganizationMembers(idOrganization) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  var callBack=function() {
    dijit.byId("dialogAffectation").show();
  };
  var params="&affectationIdOrganization=" + idOrganization;
  loadDialog('dialogAffectation', callBack, false, params);
}

function affectationChangeResource() {
  var idResource=dijit.byId("affectationResource").get("value");
  if (!idResource)
    return;
  if (affectationLoad)
    return;
  res = dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=resourceProfile&idResource='
        + idResource+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      dijit.byId('affectationProfile').set('value', data);
    }
  });
  
 res.then(
      function(data){
        var aff = dijit.byId("affectationProfile");
        if(data=='') {
          aff.required = false;
          require(["dojo/query", "dojo/NodeList-dom"], function(query){
            query("#widget_affectationProfile ").removeClass("required");
          });

        } else {
          aff.required = true;
          require(["dojo/query", "dojo/NodeList-dom"], function(query){
            query("#widget_affectationProfile ").addClass("required");
          });
        }
    }
  );
}

function replaceAffectation(id, objectClass, type, idResource, idProject, rate,
    idle, startDate, endDate, idProfile) {
  var callback=function() {
    refreshList('idProfile', 'idProject', idProject, null,
        'replaceAffectationProfile', false);
  };
  var param="&idAffectation=" + id;
  loadDialog("dialogReplaceAffectation", callback, true, param);
}

function replaceAffectationSave() {
  var formVar=dijit.byId('replaceAffectationForm');
  if (dijit.byId('replaceAffectationStartDate')
      && dijit.byId('replaceAffectationEndDate')) {
    var start=dijit.byId('replaceAffectationStartDate').value;
    var end=dijit.byId('replaceAffectationEndDate').value;
    if (start && end && dayDiffDates(start, end) < 0) {
      showAlert(i18n("errorStartEndDates", new Array(i18n("colStartDate"),i18n("colEndDate"))));
      return;
    }
  }
  if (dijit.byId('replaceAffectationResource').get("value") == dojo
      .byId("replaceAffectationExistingResource").value) {
    showAlert(i18n("errorReplaceResourceNotChanged"));
    return;
  }
  if (formVar.validate()) {
    var callback=function(){
      if(dijit.byId('dialogEditAffectationPlanning')){
        var objClass=dojo.byId('affectationObjectClass').value;
        var objId = dojo.byId("affectationObjectId").value;
        var params="&objectClass=" + objClass + "&objectId=" + objId;
        loadDialog('dialogEditAffectationPlanning', null, true, params);
      }
    };
    loadContent("../tool/saveAffectationReplacement.php", "resultDivMain",
        "replaceAffectationForm", true, 'affectation', null, null, callback);
    dijit.byId('dialogReplaceAffectation').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function replaceAffectationChangeResource() {
  var idResource=dijit.byId("replaceAffectationResource").get("value");
  if (!idResource)
    return;
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=resourceProfile&idResource='
        + idResource+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      dijit.byId('replaceAffectationProfile').set('value', data);
    }
  });
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=resourceCapacity&idResource='
        + idResource+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      dijit.byId('replaceAffectationCapacity').set('value', parseFloat(data));
    }
  });
  dojo.xhrGet({
    url : '../tool/getSingleData.php?dataType=isResourceTeam&idResource='
        + idResource+'&csrfToken='+csrfToken,
    handleAs : "text",
    load : function(data) {
      if(data==0) {
        dijit.byId('replaceAffectationProfile').required = true;
        require(["dojo/dom-class"], function(domClass){
          domClass.add("widget_replaceAffectationProfile", "required");
        });
      } else {
        dijit.byId('replaceAffectationProfile').required = false;
        require(["dojo/dom-class"], function(domClass){
          domClass.remove("widget_replaceAffectationProfile", "required");
        });
      }
    }
  });
}

function addResourceIncompatible(idResource) {
  var callBack=function() {
    dijit.byId("dialogResourceIncompatible").show();
  };
  var params="&idResource=" + idResource;
  loadDialog('dialogResourceIncompatible', callBack, false, params);
}

function saveResourceIncompatible() {
  var formVar=dijit.byId('resourceIncompatibleForm');
  if (formVar.validate()) {
    loadContent("../tool/saveResourceIncompatible.php", "resultDivMain",
        "resourceIncompatibleForm", true, 'affectation');
    dijit.byId('dialogResourceIncompatible').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function removeResourceIncompatible(id) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    loadContent("../tool/saveResourceIncompatible.php?idIncompatible=" + id,
        "resultDivMain", null, true, 'affectation');
  };
  msg=i18n('confirmDeleteResourceIncompatible', new Array(id, i18n('Resource')));
  showConfirm(msg, actionOK);
}

function addResourceSupport(idResource) {
  var callBack=function() {
    dijit.byId("dialogResourceSupport").show();
  };
  var params="&idResource=" + idResource;
  loadDialog('dialogResourceSupport', callBack, false, params);
}

function saveResourceSupport(mode) {
  var formVar=dijit.byId('resourceSupportForm');
  if (formVar.validate()) {
    loadContent("../tool/saveResourceSupport.php?mode=" + mode,
        "resultDivMain", "resourceSupportForm", true, 'affectation');
    dijit.byId('dialogResourceSupport').hide();
  } else {
    showAlert(i18n("alertInvalidForm"));
  }
}

function editResourceSupport(id) {
  var callBack=function() {
    dijit.byId("dialogResourceSupport").show();
  };
  var params="&idSupport=" + id;
  loadDialog('dialogResourceSupport', callBack, false, params);
}

function removeResourceSupport(id) {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    loadContent("../tool/saveResourceSupport.php?idSupport=" + id,
        "resultDivMain", null, true, 'affectation');
  };
  msg=i18n('confirmDeleteResourceSupport', new Array(id, i18n('Resource')));
  showConfirm(msg, actionOK);
}

function assignTeamForMeeting() {
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  actionOK=function() {
    loadContent("../tool/assignTeamForMeeting.php?assignmentId=&assignmentRefType="+dojo.byId('objectClass').value+"&assignmentRefId="+dojo.byId("objectId").value,"resultDivMain", null,
        true, 'assignment');
  };
  msg=i18n('confirmAssignWholeTeam');
  showConfirm(msg, actionOK);
  
}


function planningToCanvasToPDF(){

  var iframe = document.createElement('iframe');
  
  // this onload is for firefox but also work on others browsers
  iframe.onload = function() {
  var orientation="landscape";  // "portrait" ou "landscape"
  if(!document.getElementById("printLandscape").checked)orientation="portrait";
  var ratio=parseInt(document.getElementById("printZoom").value)/100;
  var repeatIconTask=document.getElementById("printRepeat").checked; // If true
                                                                      // this
                                                                      // will
                                                                      // repeat
                                                                      // on each
                                                                      // page
                                                                      // the
                                                                      // icon
  loadContent("../tool/submitPlanningPdf.php", "resultDivMain", 'planningPdfForm', false,null,null,null,function(){showWait();});
  var sizeElements=[];
  var marge=30;
  var widthIconTask=0; // the width that icon+task represent
  // var
  // heightColumn=parseInt(document.getElementById('leftsideTop').offsetHeight)*ratio;
  // damian #exportPDF
  var deviceRatio = window.devicePixelRatio;
  if(!deviceRatio){
    deviceRatio = 1;
  }
  var heightColumn=parseInt(document.getElementById('leftsideTop').offsetHeight)*deviceRatio;
  // var heightRow=21*ratio;
  var heightRow=21*deviceRatio;
  // var
  // widthRow=(parseInt(dojo.query('.ganttRightTitle')[0].offsetWidth)-1)*ratio;
  var widthRow=(parseInt(dojo.query('.ganttRightTitle')[0].offsetWidth)-1);
  var nbRowTotal=0;
  var nbColTotal=0;
  // init max width/height by orientation
  var pageFormat='A4';
  if(document.getElementById("printFormatA3").checked)pageFormat="A3";
  var imageZoomIn=1.3/ratio;
  var imageZoomOut=1/imageZoomIn;
  ratio=1;
  var maxWidth=(596-(2*marge))*imageZoomIn;
  var maxHeight=(842-(2*marge))*imageZoomIn;
  if (pageFormat=='A3') {
    var maxTemp=maxWidth;
    maxWidth=maxHeight;
    maxHeight=2*maxTemp;
  }
  if(orientation=="landscape"){
    var maxTemp=maxWidth;
    maxWidth=maxHeight;
    maxHeight=maxTemp;
  }
  
  // We create an iframe will which contain the planning to transform it in
  // image
  var frameContent=document.getElementById("iframeTmpPlanning");
  
  var cssLink2 = document.createElement("link");
  cssLink2.href = "css/projeqtor.css"; 
  cssLink2.rel = "stylesheet"; 
  cssLink2.type = "text/css"; 
  frameContent.contentWindow.document.head.appendChild(cssLink2);
  
  var cssLink3 = document.createElement("link");
  cssLink3.href = "css/projeqtorNew.css"; 
  cssLink3.rel = "stylesheet"; 
  cssLink3.type = "text/css"; 
  frameContent.contentWindow.document.head.appendChild(cssLink3);
  
  var cssLink = document.createElement("link");
  cssLink.href = "css/jsgantt.css"; 
  cssLink.rel = "stylesheet"; 
  cssLink.type = "text/css";
  frameContent.contentWindow.document.head.appendChild(cssLink);
  
// var jsLink = document.createElement("script");
// jsLink.setAttribute("src", "js/dynamicCss.js");
// jsLink.setAttribute("type", "text/javascript");
// frameContent.contentWindow.document.head.appendChild(jsLink);
// frameContent.contentWindow.setColorTheming(); // Not found ?
  frameContent.contentWindow.document.body.style.setProperty("--image-hue-rotate",document.body.style.getPropertyValue("--image-hue-rotate"));
  frameContent.contentWindow.document.body.style.setProperty("--image-hue-rotate-reverse",document.body.style.getPropertyValue("--image-hue-rotate-reverse"));
  frameContent.contentWindow.document.body.style.setProperty("--image-saturate",document.body.style.getPropertyValue("--image-saturate"));
  frameContent.contentWindow.document.body.style.setProperty("--image-brightness",document.body.style.getPropertyValue("--image-brightness"));
// addColor("--image-hue-rotate", hueRotate+'deg');
// addColor("--image-hue-rotate-reverse", (-1*hueRotate)+'deg');
// addColor("--image-saturate", saturate+'%');
// addColor("--image-brightness", brightness+'%');
  
  var heightV=(heightColumn+getMaxHeight(document.getElementById('leftside'))+(getMaxHeight(document.getElementById('leftside'))/21))+'px';
  
  frameContent.style.position='absolute';
  frameContent.style.width=(4+parseInt(document.getElementById('leftGanttChartDIV').style.width)+getMaxWidth(document.getElementById('rightTableContainer')))+'px';
  frameContent.style.height=heightV;
  frameContent.style.border='0';
  // frameContent.style.top='0';
  // frameContent.style.left='0';
  var bodyClass=document.body.className;
  bodyClass='ProjeQtOrFlatGrey';
  frameContent.contentWindow.document.body.innerHTML='<div class="'+bodyClass+'" style="float:left;width:'+document.getElementById('leftGanttChartDIV').style.width+';overflow:hidden;height:'+heightV+';">'+document.getElementById('leftGanttChartDIV').innerHTML+'</div><div style="float:left;width:'+getMaxWidth(document.getElementById('rightTableContainer'))+'px;height:'+heightV+';">'+document.getElementById('GanttChartDIV').innerHTML+"</div>";

  frameContent.contentWindow.document.getElementById('ganttScale').style.display='none';
  frameContent.contentWindow.document.getElementById('topGanttChartDIV').style.width=getMaxWidth(document.getElementById('rightTableContainer'))+'px';
  frameContent.contentWindow.document.getElementById('topGanttChartDIV').style.overflow='visible';
  frameContent.contentWindow.document.getElementById('mainRightPlanningDivContainer').style.overflow='visible';
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.overflow='visible';
  frameContent.contentWindow.document.getElementById('mainRightPlanningDivContainer').style.height=(getMaxHeight(document.getElementById('leftside')))+'px';
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.height=(getMaxHeight(document.getElementById('leftside')))+'px';
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.height=(getMaxHeight(document.getElementById('leftside')))+'px';
  frameContent.contentWindow.document.getElementById('dndSourceTable').style.height=(getMaxHeight(document.getElementById('leftside')))+'px';
  frameContent.contentWindow.document.getElementById('vScpecificDay_1').style.height=(getMaxHeight(document.getElementById('leftside')))+'px';
  frameContent.contentWindow.document.getElementById('leftside').style.top="0";
  frameContent.contentWindow.document.getElementById('leftsideTop').style.width=document.getElementById('leftGanttChartDIV').style.width;
  frameContent.contentWindow.document.getElementById('leftside').style.width=document.getElementById('leftGanttChartDIV').style.width;
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.overflowX="visible";
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.overflowY="visible";
  // Calculate each width column in left top side
  for(var i=0; i<dojo.query("[id^='topSourceTable'] tr")[1].childNodes.length;i++){
    sizeElements.push((dojo.query("[id^='topSourceTable'] tr")[1].childNodes[i].offsetWidth)*ratio);
  }
  for(var i=0; i<dojo.query("[class^='rightTableLine']").length;i++){
    dojo.query("[class^='rightTableLine']")[i].style.width=(parseInt(dojo.query("[class^='rightTableLine']")[i].style.width)-1)+"px";
  }
  for(var i=0; i<dojo.query("[class^='ganttDetail weekBackground']").length;i++){
    dojo.query("[class^='ganttDetail weekBackground']")[i].style.width=(parseInt(dojo.query("[class^='ganttDetail weekBackground']")[i].style.width)-1)+"px";
  }
  
  widthIconTask=(sizeElements[0]+sizeElements[1])*deviceRatio;
  if (widthIconTask>parseInt(document.getElementById('leftGanttChartDIV').style.width)*deviceRatio) widthIconTask=parseInt(document.getElementById('leftGanttChartDIV').style.width)*deviceRatio;
  
  sizeColumn=parseInt(dojo.query(".ganttRightTitle")[0].style.width)*ratio;
  
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.width=getMaxWidth(frameContent.contentWindow.document.getElementById('rightGanttChartDIV'))+'px';
  frameContent.contentWindow.document.getElementById('topGanttChartDIV').style.width=getMaxWidth(frameContent.contentWindow.document.getElementById('rightGanttChartDIV'))+'px';
  frameContent.contentWindow.document.getElementById('mainRightPlanningDivContainer').style.width=getMaxWidth(frameContent.contentWindow.document.getElementById('rightGanttChartDIV'))+'px';
  // add border into final print
  frameContent.contentWindow.document.getElementById('leftsideTop').innerHTML ='<div id="separatorLeftGanttChartDIV2" style="position:absolute;height:100%;z-index:10000;width:4px;background-color:#C0C0C0;"></div>'+frameContent.contentWindow.document.getElementById('leftsideTop').innerHTML;
  frameContent.contentWindow.document.getElementById('leftside').innerHTML ='<div id="separatorLeftGanttChartDIV" style="position:absolute;height:100%;z-index:10000;width:4px;background-color:#C0C0C0;"></div>'+frameContent.contentWindow.document.getElementById('leftside').innerHTML;
  frameContent.contentWindow.document.getElementById('leftside').style.width=(parseInt(frameContent.contentWindow.document.getElementById('leftside').style.width)+parseInt(frameContent.contentWindow.document.getElementById('separatorLeftGanttChartDIV').style.width))+'px';
  frameContent.contentWindow.document.getElementById('leftsideTop').style.width=frameContent.contentWindow.document.getElementById('leftside').style.width;
  frameContent.contentWindow.document.getElementById('separatorLeftGanttChartDIV').style.left=(parseInt(frameContent.contentWindow.document.getElementById('leftside').style.width)-4)+'px';
  frameContent.contentWindow.document.getElementById('separatorLeftGanttChartDIV2').style.left=(parseInt(frameContent.contentWindow.document.getElementById('leftsideTop').style.width)-4)+'px';
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.width=frameContent.contentWindow.document.getElementById('rightTableContainer').style.width;
  frameContent.contentWindow.document.getElementById('rightGanttChartDIV').style.height=frameContent.contentWindow.document.getElementById('rightTableContainer').style.height;

  var tabImage=[]; // Contain pictures
  var mapImage={}; // Contain pictures like key->value, cle=namePicture,
                    // value=base64(picture)
  
  // Start the 4 prints function
  // Print image activities and projects
  html2canvas(frameContent.contentWindow.document.getElementById('leftside')).then(function(leftElement) {
    // Print image column left side
    html2canvas(frameContent.contentWindow.document.getElementById('leftsideTop')).then(function(leftColumn) { 
      // Print right Line
      html2canvas(frameContent.contentWindow.document.getElementById('rightGanttChartDIV')).then(function(rightElement) {
        // Print right column
        html2canvas(frameContent.contentWindow.document.getElementById('rightside')).then(function(rightColumn) {
          if(ratio!=1){
            leftElement=cropCanvas(leftElement,0,0,leftElement.width,leftElement.height,ratio);
            leftColumn=cropCanvas(leftColumn,0,0,leftColumn.width,leftColumn.height,ratio);
            rightElement=cropCanvas(rightElement,0,0,rightElement.width,rightElement.height,ratio);
            rightColumn=cropCanvas(rightColumn,0,0,rightColumn.width,rightColumn.height,ratio);
          }
          // Init number of total rows
          nbRowTotal=Math.round(leftElement.height/heightRow); 
          // frameContent.parentNode.removeChild(frameContent);
          // Start pictures's calcul
          firstEnterHeight=true;
          var EHeightValue=0; // Height pointer cursor
          var EHeight=leftElement.height; // total height
          while((Math.ceil(EHeight/maxHeight)>=1 || firstEnterHeight) && EHeight>heightRow){
            var calculHeight=maxHeight;
            var ELeftWidth=leftElement.width; // total width
            var ERightWidth=rightElement.width; // total width
            var addHeighColumn=0;
            if(firstEnterHeight || (!firstEnterHeight && repeatIconTask)){
              addHeighColumn=heightColumn;
            }
            var heightElement=0;
            while(calculHeight-addHeighColumn>=heightRow && nbRowTotal!=0){
              calculHeight-=heightRow;
              heightElement+=heightRow;
              nbRowTotal--;
            }
            var iterateurColumnLeft=0;
            firstEnterWidth=true;
            var widthElement=0;
            var imageRepeat=null;
            if(repeatIconTask){
              imageRepeat=combineCanvasIntoOne(
                              cropCanvas(leftColumn,0,0,widthIconTask,heightColumn),
                              cropCanvas(leftElement,0,EHeightValue,widthIconTask,heightElement),
                              true);
            }
            var canvasList=[];
            while(ELeftWidth/maxWidth>=1 || (!firstEnterWidth && ELeftWidth>0)){
              firstEnterWidth2=true;
              oldWidthElement=widthElement;
              while(iterateurColumnLeft<sizeElements.length && ELeftWidth>=sizeElements[iterateurColumnLeft]){
                ELeftWidth-=sizeElements[iterateurColumnLeft];
                widthElement+=sizeElements[iterateurColumnLeft]*deviceRatio;
                if(repeatIconTask && !firstEnterWidth && firstEnterWidth2)ELeftWidth+=widthIconTask;
                iterateurColumnLeft++;
                firstEnterWidth2=false;
              }
              if(oldWidthElement==widthElement){
                widthElement+=ELeftWidth;
                ELeftWidth=0;
              }
              if(!firstEnterWidth){
                if(repeatIconTask){
                  canvasList.push(combineCanvasIntoOne(imageRepeat,
                                  combineCanvasIntoOne(
                                      cropCanvas(leftColumn,oldWidthElement,0,widthElement-oldWidthElement,heightColumn),
                                      cropCanvas(leftElement,oldWidthElement,EHeightValue,widthElement-oldWidthElement,heightElement),
                                      true),
                                      false));
                }else{
                  if(firstEnterHeight){
                    canvasList.push(combineCanvasIntoOne(
                                        cropCanvas(leftColumn,oldWidthElement,0,widthElement-oldWidthElement,heightColumn),
                                        cropCanvas(leftElement,oldWidthElement,EHeightValue,widthElement-oldWidthElement,heightElement),
                                        true));
                  }else{
                    canvasList.push(cropCanvas(leftElement,oldWidthElement,EHeightValue,widthElement-oldWidthElement,heightElement));
                  } 
                }
              }else{
                if(firstEnterHeight || repeatIconTask){
                  canvasList.push(combineCanvasIntoOne(
                                        cropCanvas(leftColumn,oldWidthElement,0,widthElement-oldWidthElement,heightColumn),
                                        cropCanvas(leftElement,oldWidthElement,EHeightValue,widthElement-oldWidthElement,heightElement),
                                        true));
                }else{
                  canvasList.push(cropCanvas(leftElement,oldWidthElement,EHeightValue,widthElement-oldWidthElement,heightElement));                  
                }
              }
              firstEnterWidth=false;
            }
            if(canvasList.length==0){
              if(firstEnterHeight || repeatIconTask){
                canvasList.push(combineCanvasIntoOne(
                                        cropCanvas(leftColumn,0,0,leftColumn.width,heightColumn),
                                        cropCanvas(leftElement,0,EHeightValue,leftElement.width,heightElement),
                                        true));
              }else{
                canvasList.push(cropCanvas(leftElement,0,EHeightValue,leftElement.width,heightElement));
              }
            }
            firstEnterWidth=true;
            if(repeatIconTask && leftColumn.width>widthIconTask){
              imageRepeat=combineCanvasIntoOne(combineCanvasIntoOne(
                                                    cropCanvas(leftColumn,0,0,widthIconTask,heightColumn),
                                                    cropCanvas(leftElement,0,EHeightValue,widthIconTask,heightElement),
                                                    true),
                                               combineCanvasIntoOne(
                                                    cropCanvas(leftColumn,leftColumn.width-4,0,4,heightColumn),
                                                    cropCanvas(leftElement,leftElement.width-4,EHeightValue,4,heightElement),
                                                    true),
                                               false);
            }
            widthElement=0;
            firstEnterWidth=true;
            var canvasList2=[];
            // Init number of total cols
            nbColTotal=Math.round(rightElement.width/widthRow); 
            var countIteration=0;
            while((Math.ceil(ERightWidth/maxWidth)>=1 || (!firstEnterWidth && ERightWidth>0)) && nbColTotal>0){
              countIteration++;
              firstEnterWidth2=true;
              oldWidthElement=widthElement;
              limit=0;
              if(firstEnterWidth)limit=canvasList[canvasList.length-1].width;
              if(!firstEnterWidth && repeatIconTask)limit=widthIconTask;
              var currentWidthElm=0;
              while(ERightWidth>widthRow && currentWidthElm+widthRow<maxWidth-limit && nbColTotal>0){
                ERightWidth-=widthRow;
                widthElement+=widthRow;
                currentWidthElm+=widthRow;
                firstEnterWidth2=false;
                nbColTotal--;
              }
              if(!firstEnterWidth){
                if(currentWidthElm!=0 && widthElement!=oldWidthElement)
                  if(repeatIconTask){
                    canvasList2.push(combineCanvasIntoOne(imageRepeat,
                                       combineCanvasIntoOne(
                                           cropCanvas(rightColumn,oldWidthElement+1,0,currentWidthElm,heightColumn),
                                           cropCanvas(rightElement,oldWidthElement,EHeightValue,currentWidthElm,heightElement),
                                           true),
                                       false));
                }else{
                  if(firstEnterHeight){
                    canvasList2.push(combineCanvasIntoOne(
                                          cropCanvas(rightColumn,oldWidthElement+1,0,currentWidthElm,heightColumn),
                                          cropCanvas(rightElement,oldWidthElement,EHeightValue,currentWidthElm,heightElement),
                                          true));
                  }else{
                    canvasList2.push(cropCanvas(rightElement,oldWidthElement,EHeightValue,currentWidthElm,heightElement));
                  }
                }
              }else{
                if(widthElement==0){
                  canvasList2.push(canvasList[canvasList.length-1]);
                }else if(firstEnterHeight || repeatIconTask){
                  canvasList2.push(combineCanvasIntoOne(canvasList[canvasList.length-1],
                                        combineCanvasIntoOne(
                                            cropCanvas(rightColumn,oldWidthElement+1,0,currentWidthElm,heightColumn),
                                            cropCanvas(rightElement,oldWidthElement,EHeightValue,currentWidthElm,heightElement),
                                            true),
                                        false));
                }else{
                  canvasList2.push(combineCanvasIntoOne(canvasList[canvasList.length-1],
                                        cropCanvas(rightElement,oldWidthElement,EHeightValue,currentWidthElm,heightElement),
                                        false));
                }
              }
              if(nbColTotal==0 || countIteration>100){
                ERightWidth=0;
              }
              firstEnterWidth=false;
            }
            var baseIterateur=tabImage.length;
            for(var i=0;i<canvasList.length-1;i++){
              
              // Add image to mapImage in base64 format
              mapImage["image"+(i+baseIterateur)]=canvasList[i].toDataURL();
              
              // Add to tabImage an array wich contain parameters to put an
              // image into a pdf page with a pagebreak if necessary
              ArrayToPut={image: "image"+(i+baseIterateur),width: canvasList[i].width*imageZoomOut,height:canvasList[i].height*imageZoomOut};
              if(!(canvasList2.length==0 && i==canvasList.length-1)){
                ArrayToPut['pageBreak']='after';
              }
              tabImage.push(ArrayToPut);
            }
            for(var i=0;i<canvasList2.length;i++){
              if(canvasList2[i].width-widthIconTask>4){
                // Add image to mapImage in base64 format
                mapImage["image"+(i+canvasList.length+baseIterateur)]=canvasList2[i].toDataURL();
                
                // Add to tabImage an array wich contain parameters to put an
                // image into a pdf page with a pagebreak if necessary
                ArrayToPut={image: "image"+(i+canvasList.length+baseIterateur),width: canvasList2[i].width*imageZoomOut,height:canvasList2[i].height*imageZoomOut};
                if(i!=canvasList2.length-1){
                  ArrayToPut['pageBreak']='after';
                }
                tabImage.push(ArrayToPut);
              }
            }
            EHeight-=maxHeight-calculHeight;
            EHeightValue+=maxHeight-calculHeight;
            firstEnterHeight=false;
          }
          var dd = {
             pageMargins: [ marge, marge, marge, marge ],
             pageOrientation: orientation,
             content: tabImage,
             images: mapImage,
             footer: function(currentPage, pageCount) {  return { fontSize : 8, text: currentPage.toString() + ' / ' + pageCount , alignment: 'center' };},
             pageSize: pageFormat
          };
          if( !dojo.isIE ) {
            var userAgent = navigator.userAgent.toLowerCase(); 
            var IEReg = /(msie\s|trident.*rv:)([\w.]+)/; 
            var match = IEReg.exec(userAgent); 
            if( match )
              dojo.isIE = match[2] - 0;
            else
              dojo.isIE = undefined;
          }
          var pdfFileName='ProjeQtOr_Planning';
          var now = new Date();
          pdfFileName+='_'+formatDate(now).replace(/-/g,'')+'_'+formatTime(now).replace(/:/g,'');
          pdfFileName+='.pdf';
          if((dojo.isIE && dojo.isIE>0) || window.navigator.userAgent.indexOf("Edge") > -1) {
            pdfMake.createPdf(dd).download(pdfFileName);
          }else{
            pdfMake.createPdf(dd).download(pdfFileName);
          }
          // open the PDF in a new window
          // pdfMake.createPdf(dd).open();
          // print the PDF (temporarily Chrome-only)
         // pdfMake.createPdf(dd).print();
          // download the PDF (temporarily Chrome-only)
          dijit.byId('dialogPlanningPdf').hide();
          iframe.parentNode.removeChild(iframe);
          setTimeout('hideWait();',100);
        });
      });
    });
  });
  };
  iframe.id="iframeTmpPlanning";
  document.body.appendChild(iframe);
}
function cropCanvas(canvasToCrop,x,y,w,h,r){
  if(typeof r=='undefined')r=1;
    var tempCanvas = document.createElement("canvas"),
    tCtx = tempCanvas.getContext("2d");
    tempCanvas.width = w*r;
    tempCanvas.height = h*r;
    if(w!=0 && h!=0)tCtx.drawImage(canvasToCrop,x,y,w,h,0,0,w*r,h*r);
    return tempCanvas;
}

// addBottom=true : we add the canvas2 at the bottom of canvas1, addBottom=false
// : we add the canvas2 at the right of canvas1
function combineCanvasIntoOne(canvas1,canvas2,addBottom){
  var tempCanvas = document.createElement("canvas");
  var tCtx = tempCanvas.getContext("2d");
  var ajoutWidth=0;
  var ajoutHeight=0;
  var x=0;
  var y=0;
  if(addBottom){
    ajoutHeight=canvas2.height;
    y=canvas1.height;
  }else{
    ajoutWidth=canvas2.width;
    x=canvas1.width;
  }
  tempCanvas.width = canvas1.width+ajoutWidth;
  tempCanvas.height = canvas1.height+ajoutHeight;
  if(canvas1.width!=0 && canvas1.height!=0)tCtx.drawImage(canvas1,0,0,canvas1.width,canvas1.height);
  if(canvas1.width!=0 && canvas1.height!=0)if(canvas2.width!=0 && canvas2.height!=0)tCtx.drawImage(canvas2,0,0,canvas2.width,canvas2.height,x,y,canvas2.width,canvas2.height);
  return tempCanvas;
}


function commentImputationSubmit(year,week,idAssignment,refType,refId){
  var text=dijit.byId('commentImputation').get('value');
  if(text.trim()==''){
    showAlert(i18n('messageMandatory',[i18n('colComment')]));
    return;
  }
  showWait();
  dojo.xhrPost({
    url : "../tool/dynamicDialogCommentImputation.php?year="+year+"&week="+week+"&idAssignment="+idAssignment+"&refTypeComment="+refType+"&refIdComment="+refId+"&csrfToken="+csrfToken,
    handleAs : "text",
    form : 'commentImputationForm',
    load : function(data, args) {
      formChangeInProgress=false;
      document.getElementById("showBig"+idAssignment).style.display='block'; 
      dojo.byId("showBig"+idAssignment).childNodes[0].onmouseover=function(){
        showBigImage(null,null,this,data);
      };
      dijit.byId('dialogCommentImputation').hide();
      hideWait();
    },
    error : function() {
      hideWait();
    }
  });
}

function commentImputationTitlePopup(type){
  title='';
  if(type=='add'){
    title= i18n('commentImputationAdd');
  }else if(type=='view'){
    title= i18n('commentImputationView');
  }
  dijit.byId('dialogCommentImputation').set('title',title);
}

/**
 * Draw a gantt chart using jsGantt
 * 
 * @return
 */
function drawGantt() {
  // first, if detail is displayed, reload class
  if (dojo.byId('objectClass') && !dojo.byId('objectClass').value
      && dojo.byId("objectClassName") && dojo.byId("objectClassName").value) {
    dojo.byId('objectClass').value = dojo.byId("objectClassName").value;
  }
  var planningType = 'planning';
  if(dojo.byId('planningType')){
    planningType = dojo.byId('planningType').value;
  }
  if (dojo.byId("objectId") && !dojo.byId("objectId").value && dijit.byId("id")
      && dijit.byId("id").get("value")) {
    dojo.byId("objectId").value = dijit.byId("id").get("value");
  }
  var startDateView = (dojo.byId('projectDate') && dojo.byId('projectDate').checked)?null:new Date();
  if (dijit.byId('startDatePlanView') && dojo.byId('projectDate')) {
    //gautier #6924
    if(!dojo.byId('projectDate').checked){
      startDateView = dijit.byId('startDatePlanView').get('value');
    }
  }
  var endDateView = null;
  if (dijit.byId('endDatePlanView') && dojo.byId('projectDate')) {
    if(!dojo.byId('projectDate').checked){
      endDateView = dijit.byId('endDatePlanView').get('value');
    }
  }
  var showWBS = null;
  if (dijit.byId('showWBS')) {
    //showWBS = dijit.byId('showWBS').get('checked');
    showWBS = dijit.byId('showWBS').get('value');
    if(dijit.byId('showWBS').get('checked')){
      showWBS=='on';
    }
    if(showWBS=='on'){
      showWBS=true;
    }else{
      showWBS=false;
    }
  }
  // showWBS=true;
  var gFormat = "day";
  if (g) {
    gFormat = g.getFormat();
  }
  g = new JSGantt.GanttChart('g', dojo.byId('GanttChartDIV'), gFormat);
  setGanttVisibility(g, planningType);
  g.setCaptionType('Caption'); // Set to Show Caption
  // (None,Caption,Resource,Duration,Complete)
  // g.setShowStartDate(1); // Show/Hide Start Date(0/1)
  // g.setShowEndDate(1); // Show/Hide End Date(0/1)
  g.setDateInputFormat('yyyy-mm-dd'); // Set format of input dates
  // ('mm/dd/yyyy', 'dd/mm/yyyy',
  // 'yyyy-mm-dd')
  g.setDateDisplayFormat('default'); // Set format to display dates
  // ('mm/dd/yyyy', 'dd/mm/yyyy',
  // 'yyyy-mm-dd')
  g.setFormatArr("day", "week", "month", "quarter"); // Set format options (up
  if (dijit.byId('selectBaselineBottom')) {
    g.setBaseBottomName(dijit.byId('selectBaselineBottom').get('displayedValue'));
  }
  if (dijit.byId('selectBaselineTop')) {
    g.setBaseTopName(dijit.byId('selectBaselineTop').get('displayedValue'));
  }
  // to 4 :
  // "minute","hour","day","week","month","quarter")
  if (ganttPlanningScale) {
    g.setFormat(ganttPlanningScale,true);
  }
  g.setStartDateView(startDateView);
  g.setEndDateView(endDateView);
  if (dijit.byId('criticalPathPlanning')) g.setShowCriticalPath(dijit.byId('criticalPathPlanning').get('checked'));
  if (dijit.byId('criticalPathPlanning')){
    if(dijit.byId('criticalPathPlanning').get('value')=='on'){
      g.setShowCriticalPath(true);
    }
  }
  var contentNode = dojo.byId('gridContainerDiv');
  if (contentNode) {
    g.setWidth(dojo.style(contentNode, "width"));
  }
  jsonData = dojo.byId('planningJsonData');
  if (jsonData.innerHTML.indexOf('{"identifier"') < 0 || jsonData.innerHTML.indexOf('{"identifier":"id", "items":[ ] }')>=0) {
    if (dijit.byId('leftGanttChartDIV')) dijit.byId('leftGanttChartDIV').set('content',null);
    if (dijit.byId('rightGanttChartDIV')) dijit.byId('rightGanttChartDIV').set('content',null);
    if (dijit.byId('topGanttChartDIV')) dijit.byId('topGanttChartDIV').set('content',null);  
    if (jsonData.innerHTML.length > 10 && jsonData.innerHTML.indexOf('{"identifier":"id", "items":[ ] }')<0) {
      showAlert(jsonData.innerHTML);
    } else {
      dojo.byId("leftGanttChartDIV").innerHTML='<div class="labelMessageEmptyArea" style="top:42px;">'
        + i18n('ganttMsgLeftPart') + '</div>';
      dojo.byId("rightGanttChartDIV").innerHTML='<div class="labelMessageEmptyArea" style="top:0px;">'
        + i18n('ganttMsgRightPart') + '</div>';
    }
    hideWait();
    return;
  }
  var now = formatDate(new Date());
  var arrProjectStart={};
  // g.AddTaskItem(new JSGantt.TaskItem( 0, 'project', '', '', 'ff0000', '',
  // 0, '', '10', 1, '', 1, '' , 'test'));
  if (g && jsonData) {
    try {
      var store = eval('(' + jsonData.innerHTML + ')');
    } catch(e) {
      consoleTraceLog("ERROR Parsing jsonData in drawGantt()");
      consoleTraceLog(jsonData.innerHTML);
      return;
    }
    var items = store.items;
    // var arrayKeys=new Array();
    var keys = "";
    var currentResource=null;
    if(dojo.byId('portfolioPlanning')){
      for(var j=0;j <items.lenght; i++){
        var item = items[j];
        if(item.reftype == 'Milestone'){
          items[j-1]+=item;
        }
      }
    }
    var arrayVisible=new Array();
    for (var i = (items.length) - 1; i>=0; i--) {
      var item = items[i];
      if (item.id==0 && item.msgErrorDisplay){continue;}
      var wbs=item.wbssortable;
      if ( (item.hidden==undefined || item.hidden=="0" || item.hidden=="" || !item.hidden) && wbs && wbs!=undefined) {
        while (wbs.length>=5 && arrayVisible.indexOf(wbs)==-1) {
          arrayVisible.push(wbs);
          wbs=wbs.substring(0, wbs.length - 6);
        }
      }
    } 
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if(item.id==0 && item.msgErrorDisplay){
        var msg=item.msgErrorDisplay,
          displayLimited=true;
        break;
      }
      if (item.wbssortable && arrayVisible.length>0 && arrayVisible.indexOf(item.wbssortable)<0) continue;
      // var topId=(i==0)?'':item.topid;
      var topId = item.topid;
      // pStart : start date of task
      var pStart = now;
      var pStartFraction = 0;
      pStart = (trim(item.initialstartdate) != "") ? item.initialstartdate : pStart;
      pStart = (trim(item.validatedstartdate) != "") ? item.validatedstartdate : pStart;
      pStart = (trim(item.plannedstartdate) != "") ? item.plannedstartdate : pStart;
      pStart = (trim(item.realstartdate) != "") ? item.realstartdate : pStart;
      pStart = (trim(item.plannedstartdate) && trim(item.realstartdate) && item.plannedstartdate<item.realstartdate && parseFloat(item.leftwork)>0) ? item.plannedstartdate:pStart;
      if (trim(item.plannedstartdate) != "" && trim(item.realenddate) == "") {
        pStartFraction = item.plannedstartfraction;
      }
      // If real work in the future, don't take it in account
      if (trim(item.plannedstartdate) && trim(item.realstartdate)
          && item.plannedstartdate < item.realstartdate
          && item.realstartdate > now) {
        pStart = item.plannedstartdate;
      }
      // PBER - Display project after validated start date when planning is not
      // calculated yet
      if (dojo.byId('projectNotStartBeforeValidatedDate') && dojo.byId('projectNotStartBeforeValidatedDate').value==1 ) {
        if (item.reftype=='Project') {
          arrProjectStart[item.refid]=item.validatedstartdate;
        } else if (! trim(item.plannedstartdate) && ! trim(item.realstartdate)){
          if (arrProjectStart[item.idproject] && arrProjectStart[item.idproject]!=undefined) {
            pStart=arrProjectStart[item.idproject];
          }
        }
      }
      // pEnd : end date of task
      var pEnd = now;
      // var pEndFraction = 1;
      pEnd = (trim(item.initialenddate) != "") ? item.initialenddate : pEnd;
      pEnd = (trim(item.validatedenddate) != "") ? item.validatedenddate : pEnd;
      pEnd = (trim(item.plannedenddate) != "") ? item.plannedenddate : pEnd;
      
      pRealEnd = "";
      pPlannedStart = "";
      pWork = "";
      if (dojo.byId('resourcePlanning')) {
        pRealEnd = item.realenddate;
        pPlannedStart = item.plannedstartdate;
        pWork = item.leftworkdisplay;
        g.setSplitted(true);
      } else if(dojo.byId('contractGantt') && item.reftype == 'Milestone'){
        pEnd=item.realstartdate;
      }else {
        pEnd = (trim(item.realenddate) != "") ? item.realenddate : pEnd;
      }
      if (pEnd < pStart)
        pEnd = pStart;
      //
      var realWork = parseFloat(item.realwork);
      var plannedWork = parseFloat(item.plannedwork);
      var validatedWork = parseFloat(item.validatedwork);
      var progress = 0;
      if (item.isglobal && item.isglobal==1 && item.progress) { 
        progress=item.progress;
      } else {
        progress=item.progress;
        if (plannedWork > 0 && item.idplanningmode!=8  && item.idplanningmode!=14) { // Not calculate for FDUR
          progress = Math.round(100 * realWork / plannedWork);
        } else {
          if (item.done == 1) {
            progress = 100;
          }
        }
      }
      // pGroup : is the task a group one ?
      var pGroup = (item.elementary == '0') ? 1 : 0;
      // MODIF qCazelles - GANTT
      if (item.reftype=='Project' || item.reftype=='Fixed' || item.reftype=='Replan' || item.reftype=='Construction' || item.reftype=='ProductVersionhasChild' || item.reftype=='ComponentVersionhasChild' || item.reftype=='SupplierContracthasChild' || item.reftype=='ClientContracthasChild' || item.reftype=='ActivityhasChild') pGroup=1;
     // END MODIF qCazelles - GANTT
      var pobjecttype='';
      var pHealthStatus='';
      var pQualityLevel='';
      var pTrend='';
      var pExtRessource='';
      var pDurationContract='';
      var pOverallProgress='';
      if(dojo.byId('contractGantt') &&  item.reftype!='Milestone'){
        pExtRessource=item.externalressource;
        pDurationContract=item.duration;
        pobjecttype=item.objecttype;
      }
      if(dojo.byId('portfolio')){
        pHealthStatus=item.health;
        pQualityLevel=item.quality;
        pTrend=item.trend;
        pOverallProgress=item.overallprogress;
      }

      if(dojo.byId('versionsPlanning')){
        pobjecttype=item.objecttype;
      }
     
      // runScript : JavaScript to run when click on task (to display the
      // detail of the task)
      var runScript="";
      if(!(dojo.byId('contractGantt') && item.reftype=='Milestone')){
         runScript = "runScript('" + item.reftype + "','" + item.refid + "','"+ item.id + "');";
      }
      elementIdRef=" \' "+ item.reftype +" \',\' " + item.refid +"\',\'"+ item.id +" \' " ;
      if(!(dojo.byId('contractGantt'))){
        var contextMenu = "runScriptContextMenu('" + item.reftype + "','" + item.refid + "','"+ item.id + "');";
      }
      
      // display Name of the task
      var pName = ((showWBS) ? item.wbs : '') + " " + htmlDecode(item.refname); // for
                                                                    // testeing
      // purpose, add
      // wbs code
      // var pName=item.refname;
      // display color of the task bar
      var pColor = (pGroup)?'003000':'50BB50'; // Default green
      var pColorBlindColor = (pGroup)?'#50BB50':'#67ff00';
      var pColorBlindTaskColor='67ff00';
      if (! pGroup && item.notplannedwork > 0) { // Some left work not planned
                                                  // : purple
        pColor = '9933CC';
        pColorBlindColor = '#BB5050';
      } else if (trim(item.validatedenddate) != "" && item.validatedenddate < pEnd) { // Not respected constraints end date : red
        if (item.reftype!='Milestone' && ( ! item.assignedwork || item.assignedwork==0 ) && ( ! item.leftwork || item.leftwork==0 ) && ( ! item.realwork || item.realwork==0 )) {
          pColor = (pGroup)?'650000':'BB9099';
          pColorBlindColor = (pGroup)?'#63226b':'linear-gradient(45deg, #63226b 5%, #9a3ec9 5%, #9a3ec9 45%, #63226b 45%, #63226b 55%, #9a3ec9 55%, #9a3ec9 95%, #63226b 95%);';
          pColorBlindTaskColor='9a3ec9';
        } else {
          pColor = (pGroup)?'650000':'BB5050';
          pColorBlindColor = (pGroup)?'#63226b':'linear-gradient(45deg, #63226b 5%, #9a3ec9 5%, #9a3ec9 45%, #63226b 45%, #63226b 55%, #9a3ec9 55%, #9a3ec9 95%, #63226b 95%);';
          pColorBlindTaskColor='9a3ec9';
        }
      } else if ( ( (item.idplanningmode==8 || item.idplanningmode==14) && parseInt(item.validatedduration) < parseInt(item.plannedduration) ) 
               || ( (item.idplanningmode==25 || item.idplanningmode==26) && item.plannedstartdate != item.validatedstartdate )
               || ( (item.idplanningmode==19 || item.idplanningmode==21) && item.plannedstartdate < item.validatedstartdate )  ) {
        pColor = (pGroup)?'650000':'BB5050';
        pColorBlindColor = (pGroup)?'#63226b':'linear-gradient(45deg, #63226b 5%, #9a3ec9 5%, #9a3ec9 45%, #63226b 45%, #63226b 55%, #9a3ec9 55%, #9a3ec9 95%, #63226b 95%);';
        pColorBlindTaskColor='9a3ec9';
      } else if (! pGroup && item.reftype!='Milestone' && ( ! item.assignedwork || item.assignedwork==0 ) && ( ! item.leftwork || item.leftwork==0 ) && ( ! item.realwork || item.realwork==0 ) ) { // No workassigned : greyed 
        pColor = 'AEC5AE';
      }
      if (item.surbooked==1) {
        pColor='f4bf42';
        pColorBlindColor='#bfbfbf';
        pColorBlindTaskColor='bfbfbf';
      }
      // Following code is for VersionPlanning and ContractPlanning only 
      // item.redElement not defined in othjer cases
      if (item.redElement == '1') {
        pColor = 'BB5050';
        pColorBlindColor = (pGroup)?'#9a3ec9':'linear-gradient(45deg, #63226b 5%, #9a3ec9 5%, #9a3ec9 45%, #63226b 45%, #63226b 55%, #9a3ec9 55%, #9a3ec9 95%, #63226b 95%);';
        pColorBlindTaskColor='9a3ec9';
      } else if(item.redElement == '0') {
        pColor = '50BB50';
        pColorBlindColor = (pGroup)?'#50BB50':'#67ff00';
        pColorBlindTaskColor='67ff00';
      }
      // Color for late from inheritedEndDate
      if (trim(item.validatedenddate)=="" && trim(item.inheritedenddate)!="" && item.inheritedenddate < pEnd) {
        if (item.assignedwork>0) pColor = 'DA70D6';    // Orchid
        else pColor = 'DDA0DD';    // Plum
      }
      // gautier #3925
      if(trim(item.plannedenddate) != "" && item.done == 0){
        var today = (new Date()).toISOString().substr(0,10);
        var endDate = item.plannedenddate.substr(0,10);
        if( endDate < today){
          if(item.reftype=="Project"){
            pColor = '650000';
            pColorBlindColor = '#63226b';
            pColorBlindTaskColor='63226b';
          }else{
            pColor = 'BB5050';
            pColorBlindColor = (pGroup)?'#9a3ec9':'linear-gradient(45deg, #63226b 5%, #9a3ec9 5%, #9a3ec9 45%, #63226b 45%, #63226b 55%, #9a3ec9 55%, #9a3ec9 95%, #63226b 95%);';
            pColorBlindTaskColor='9a3ec9';
          }
        }
      }
      var pItemColor=item.color;
      // pMile : is it a milestone ?
      var pMile = (item.reftype == 'Milestone') ? 1 : 0;
      if (pMile) {
        pStart = pEnd;
      }
      pClass = item.reftype;
      pId = item.refid;
      pScope = "Planning_" + pClass + "_" + pId;
      pOpen = (item.collapsed == '1') ? '0' : '1';
      var pResource = item.resource;
      var pCaption = "";
      
      if (dojo.byId('listShowResource')) {
        if (dojo.byId('listShowResource').checked) {
          pCaption = pResource;
        }
      }
      if (dijit.byId('displayRessourceCheck')) {
        listShowResource = dijit.byId('displayRessourceCheck').get('value');
        if(listShowResource=='on'){
          pCaption = pResource;
        }else{
          pCaption = "";
        }
      }
      if (dijit.byId('showRessourceComponentVersion')) {
        listShowResource = dijit.byId('showRessourceComponentVersion').get('value');
        if(listShowResource=='on'){
          pCaption = pResource;
        }else{
          pCaption = "";
        }
      }
      if (dojo.byId('showRessourceComponentVersion')) {
        if (dojo.byId('showRessourceComponentVersion').checked) {
          pCaption = pResource;
        }
      }
      
      if (dojo.byId('listShowLeftWork')
          && dojo.byId('listShowLeftWork').checked) {
        if (item.leftwork > 0) {
          pCaption = item.leftworkdisplay;
        } else {
          pCaption = "";
        }
      }
      
      if (dijit.byId('listShowLeftWork')) {
        showLeftWork = dijit.byId('listShowLeftWork').get('value');
        if(showLeftWork=='on'){
          pCaption = item.leftworkdisplay;
        }else{
          pCaption = "";
        }
      }
      
      var pDepend = item.depend;
      topKey = "#" + topId + "#";
      curKey = "#" + item.id + "#";
      if (keys.indexOf(topKey) == -1) {
        topId = '';
      }
      if (item.paused==1) {
        pColor='A0A0A0';
        pColorBlindColor = '#4d4d4d';
        pItemColor='A0A0A0';
        pColorBlindTaskColor='4d4d4d';
      }
      keys += "#" + curKey + "#";
      pColorBaselineBottom=(dojo.byId('colorBaselineBottomValue'))?dojo.byId('colorBaselineBottomValue').value:"";
      pColorBaselineUpper=(dojo.byId('colorBaselineUpperValue'))?dojo.byId('colorBaselineUpperValue').value:"";
      
      var pIdPlanningMode = item.idplanningmode;
      var pIdStatus = item.idstatus;
      
      g.AddTaskItem(new JSGantt.TaskItem(item, planningType, pName, pStart, pEnd, pColor,
          runScript, contextMenu, progress, topId, pCaption, pScope, pRealEnd, pPlannedStart,
          pHealthStatus,pQualityLevel,pTrend,pOverallProgress,pobjecttype,pExtRessource, pIdPlanningMode, pIdStatus,
          pDurationContract,elementIdRef,pColorBlindColor,pColorBlindTaskColor,pColorBaselineBottom,pColorBaselineUpper));
    }
    dojo.query(".inputDateGantBarResize").forEach(function(node, index, nodelist) {
      node.value='';
    });
    g.Draw();
    g.DrawDependencies();
    if(displayLimited!==undefined && displayLimited==true){
      drawLimitedDisplayMessage(msg);
// var divLeft=dojo.byId('leftGanttChartDIV'),
// divRight=dojo.byId('rightTableContainer'),
// divMessageL=document.createElement("div"),
// divMessageR=document.createElement("div"),
// inputInfoLimited=document.createElement("input");
//      
// var RWidth=divRight.getElementsByClassName('ganttDetail');
// var lWidth=divLeft.getElementsByClassName('ganttLeftHover');
//      
// divMessageL.style="background:#FFDDDD;font-size:150%;color:#808080;text-align:left;padding:
// 10px 50px 10px;";
// divMessageR.style="background:#FFDDDD;font-size:150%;color:#808080;text-align:left;padding:
// 10px 50px 10px;";
//      
// divMessageL.style.width=(lWidth[0].offsetWidth+24) +"px";
// divMessageR.style.width=(RWidth[0].offsetWidth)-100+"px";
// divMessageR.setAttribute('position','relative');
//      
// inputInfoLimited.setAttribute('id','divMessageLimitedDisplay');
// inputInfoLimited.setAttribute('type','hidden');
// inputInfoLimited.setAttribute('value','msg');
//      
// divMessageL.insertAdjacentHTML('beforeend', msg);
// divMessageR.insertAdjacentHTML('beforeend', msg);
//      
//      
// divLeft.insertAdjacentHTML('beforeend', divMessageL.outerHTML);
// divRight.insertAdjacentHTML('afterend', divMessageR.outerHTML);
// divRight.insertAdjacentHTML('afterend', inputInfoLimited.outerHTML);
    }
  } else {
    // showAlert("Gantt chart not defined");
    return;
  }
  if (dojo.byId('leftGanttChartDIV').offsetWidth>dojo.byId('listHeaderDiv').offsetWidth-15) {
    var resizeWidth=dojo.byId('listHeaderDiv').offsetWidth-15;
    dijit.byId('leftGanttChartDIV').resize({w:resizeWidth});
    dijit.byId("centerDiv").resize(); 
  }
  highlightPlanningLine();
}


function runScript(refType, refId, id) {
  if (g) {  
    var vList=g.getList();
    if (vList) {
      var vTask=null;
      for(var i = 0; i < vList.length; i++) {
        if (vList[i].getID()==id) {
          vTask=vList[i];
          break;
        }
      }
      if (vTask && dojo.byId('resourcePlanningSelectedResource')) {
        dojo.byId('resourcePlanningSelectedResource').value=vTask.getResource();
      }
      if(vTask){
        var idProject = vTask.getProjectId();
        JSGantt.closeEditRowObjectPlanning();
        cachedEditRowPlanningClick = 'JSGantt.planningRowClickAction(\''+id+'\', '+refId+', \''+refType+'\', '+idProject+')';
        JSGantt.editRowObjectPlanning(id, refId, refType, idProject);
      }
    }
  }
  if (refType == 'Fixed' || refType=='Construction' || refType=='Replan') {
    refType = 'Project';
  }
  // ADD by qCazelles - GANTT
  if (refType == 'ActivityhasChild') {
    refType = 'Activity';
  }
  if (refType == 'ProductVersionhasChild') {
    refType = 'ProductVersion';
  }
  if (refType == 'ComponentVersionhasChild') {
    refType = 'ComponentVersion';
  }
  if(refType=='SupplierContracthasChild'){
    refType = 'SupplierContract';
  }
  if(refType=='ClientContracthasChild'){
    refType = 'ClientContract';
  }
  // END ADD qCazelles - GANTT
  if (waitingForReply) {
    showInfo(i18n("alertOngoingQuery"));
    return;
  }
  if (checkFormChangeInProgress()) {
    return false;
  }
  dojo.byId('objectClass').value = refType;
  dojo.byId('objectId').value = refId;
  var ctrlPressed=(window.event && (window.event.ctrlKey || window.event.shiftKey))?true:false;
  if (ctrlPressed && refType && refId) {
    openInNewWindow(refType, refId);
    return;
  }
  hideList();
  loadContent('objectDetail.php?planning=true&planningType='+dojo.byId('objectClassManual').value, 'detailDiv', 'listForm', false,null,null,null);
  loadContentStream();
  highlightPlanningLine(id);
}
var ongoingRunScriptContextMenu=false;
function runScriptContextMenu(refType, refId, id) {
  if (ongoingRunScriptContextMenu) return;
  ongoingRunScriptContextMenu=true;
  var objectClassManual = dojo.byId('objectClassManual').value;
  showWait();
  setTimeout("document.body.style.cursor='default';",100);
  dojo.xhrGet({
    url : "../view/planningBarDetail.php?class="+refType+"&id="+refId+"&scale="+ganttPlanningScale+"&objectClassManual="+objectClassManual+"&idAssignment="+id+"&csrfToken="+csrfToken,
    load : function(data, args) {
      // ongoingRunScriptContextMenu=true;
      setTimeout("document.body.style.cursor='default';",100);
      var bar = dojo.byId('bardiv_'+id);
      var line = dojo.byId('childgrid_'+id);
      var detail = dojo.byId('rightTableBarDetail');
      if(detail.style.display == 'block'){
        var pObjectClass = dojo.byId('planningBarDetailObjectClass').value;
        var pObjectId = dojo.byId('planningBarDetailObjectId').value;
        if(pObjectClass == refType && pObjectId == refId){
          detail.style.display = 'none';
        }else{
          detail.style.display="block";
        }
      }else{
        detail.style.display="block";
      }
      detail.innerHTML=data;
      detail.style.width=(parseInt(bar.style.width)+202)+'px';
      detail.style.left=(bar.offsetLeft-1)+"px";
      var tableHeight=44;
      if (dojo.byId('planningBarDetailTable')) tableHeight=dojo.byId('planningBarDetailTable').offsetHeight
      if ( dojo.byId('rightTableContainer').offsetHeight + tableHeight > (dojo.byId('rightGanttChartDIV').offsetHeight) && (line.offsetTop+25)> dojo.byId('rightTableContainer').offsetHeight ) {
        detail.style.top=(line.offsetTop-tableHeight+1)+"px";  
      } else {
        detail.style.top=(line.offsetTop+22)+"px";
      }
      var positions = elementPosition(bar);
    var detailDiv = document.getElementById('detailDiv').clientWidth;
    var leftGanttChartDIV = document.getElementById('leftGanttChartDIV').clientWidth;
    if(detailDiv >= leftGanttChartDIV+document.getElementById('rightGanttChartDIV').clientWidth)detailDiv=0;
    var diffSizeLeft = document.documentElement.clientWidth-document.getElementById('rightGanttChartDIV').clientWidth-detailDiv;
      var posLeft = (diffSizeLeft-(positions.viewportXLeft));
    var diffSizeRight = document.documentElement.clientWidth-detailDiv;
      var posRight = posLeft+document.getElementById('rightGanttChartDIV').clientWidth-100;
      var halfSize = (parseInt(detail.style.width)/2);
      dojo.query(".planningBarDetailResName").forEach(function(node, index, nodelist) {
        if(positions.viewportXRight > halfSize && positions.viewportXRight > (diffSizeRight-50) && posRight > -50){
        node.style.left = (posRight)+"px";
        }else if(positions.viewportXRight < halfSize && positions.viewportXRight > (diffSizeRight-50) && posRight > -50){
        node.style.left = (posRight)+"px";
        }else if(positions.viewportXRight < halfSize && positions.viewportXRight < (diffSizeRight-50) && posRight > -50){
        node.style.left = "unset";
        }else if(positions.viewportXRight > halfSize && positions.viewportXRight < (diffSizeRight-50) && posRight > -50){
        node.style.left = "unset";
        }
    });
      if(dojo.byId('planningBarDetailCloseButton')){
        if(positions.viewportXRight > halfSize && (positions.viewportXRight+150) > (diffSizeRight-50) && posRight > -50){
          dojo.byId('planningBarDetailCloseButton').style.left = (posRight+63)+"px";
        }else if(positions.viewportXRight < halfSize && (positions.viewportXRight+150) > (diffSizeRight-50) && posRight > -50){
          dojo.byId('planningBarDetailCloseButton').style.left = (posRight+63)+"px";
        }else if(positions.viewportXRight < halfSize && (positions.viewportXRight+150) < (diffSizeRight-50) && posRight > -50){
          dojo.byId('planningBarDetailCloseButton').style.left = "unset";
        }else if(positions.viewportXRight > halfSize && (positions.viewportXRight+150) < (diffSizeRight-50) && posRight > -50){
          dojo.byId('planningBarDetailCloseButton').style.left = "unset";
        }
      }
      document.getElementById('rightGanttChartDIV').addEventListener('scroll', () => {
          var positions = elementPosition(bar);
        var detailDiv = document.getElementById('detailDiv').clientWidth;
        var leftGanttChartDIV = document.getElementById('leftGanttChartDIV').clientWidth;
        if(detailDiv >= leftGanttChartDIV+document.getElementById('rightGanttChartDIV').clientWidth)detailDiv=0;
        var diffSizeLeft = document.documentElement.clientWidth-document.getElementById('rightGanttChartDIV').clientWidth-detailDiv;
          var posLeft = (diffSizeLeft-(positions.viewportXLeft));
        var diffSizeRight = document.documentElement.clientWidth-detailDiv;
          var posRight = posLeft+document.getElementById('rightGanttChartDIV').clientWidth-100;
          var halfSize = (parseInt(detail.style.width)/2);
          dojo.query(".planningBarDetailResName").forEach(function(node, index, nodelist) {
            if(positions.viewportXRight > halfSize && positions.viewportXRight > (diffSizeRight-50) && posRight > -50){
            node.style.left = (posRight)+"px";
            }else if(positions.viewportXRight < halfSize && positions.viewportXRight > (diffSizeRight-50) && posRight > -50){
            node.style.left = (posRight)+"px";
            }else if(positions.viewportXRight < halfSize && positions.viewportXRight < (diffSizeRight-50) && posRight > -50){
            node.style.left = "unset";
            }else if(positions.viewportXRight > halfSize && positions.viewportXRight < (diffSizeRight-50) && posRight > -50){
            node.style.left = "unset";
            }
        });
          if(dojo.byId('planningBarDetailCloseButton')){
            if(positions.viewportXRight > halfSize && (positions.viewportXRight+150) > (diffSizeRight-50) && posRight > -50){
              dojo.byId('planningBarDetailCloseButton').style.left = (posRight+63)+"px";
            }else if(positions.viewportXRight < halfSize && (positions.viewportXRight+150) > (diffSizeRight-50) && posRight > -50){
              dojo.byId('planningBarDetailCloseButton').style.left = (posRight+63)+"px";
            }else if(positions.viewportXRight < halfSize && (positions.viewportXRight+150) < (diffSizeRight-50) && posRight > -50){
              dojo.byId('planningBarDetailCloseButton').style.left = "unset";
            }else if(positions.viewportXRight > halfSize && (positions.viewportXRight+150) < (diffSizeRight-50) && posRight > -50){
              dojo.byId('planningBarDetailCloseButton').style.left = "unset";
            }
          }
    });
      hideWait();
      setTimeout("ongoingRunScriptContextMenu=false;",20);
    },
    error : function () {
      console.warn ("error on return from planningBarDetail.php");
      hideWait();
      setTimeout("ongoingRunScriptContextMenu=false;",20);
    }
  });
  return false;
}
function highlightPlanningLine(id, planningEditMode) {
  if (id == null)
    id = vGanttCurrentLine;
  if (id < 0)
    return;
  vGanttCurrentLine = id;
  vTaskList = g.getList();
  for (var i = 0; i < vTaskList.length; i++) {
    JSGantt.ganttMouseOut(i);
  }
  if(planningEditMode == undefined)planningEditMode=false;
  var vRowObj1 = JSGantt.findObj('child_' + id);
  if (vRowObj1) {
    // vRowObj1.className = "dojoxGridRowSelected dojoDndItem";// ganttTask" +
    // pType;
    if(planningEditMode){
      dojo.addClass(vRowObj1, "editModeRowSelected");
    }else{
      dojo.addClass(vRowObj1, "dojoxGridRowSelected");
      dojo.removeClass(vRowObj1, "editModeRowSelected");
    }
  }
  var vRowObj2 = JSGantt.findObj('childrow_' + id);
  if (vRowObj2) {
    // vRowObj2.className = "dojoxGridRowSelected";
    if(planningEditMode){
      dojo.addClass(vRowObj2, "editModeRowSelected");
    }else{
      dojo.addClass(vRowObj2, "dojoxGridRowSelected");
      dojo.removeClass(vRowObj2, "editModeRowSelected");
    }
  }
  if (vRowObj1 && vRowObj2 && document.getElementById('child_' + id)) {
    var currentPos = document.getElementById('child_' + id).offsetTop;
    var containerScroll=document.getElementById('rightGanttChartDIV').scrollTop;
    var containerHeight=document.getElementById('rightGanttChartDIV').offsetHeight;
    if (currentPos<containerScroll || currentPos>containerScroll+containerHeight) {
      var newPos=currentPos-(containerHeight/2)+10;
      if (newPos<0) newPos=0;
      document.getElementById('rightGanttChartDIV').scrollTop = newPos;
    }
  }
}
function selectPlanningLine(selClass, selId) {
  vGanttCurrentLine = id;
  vTaskList = g.getList();
  var tId = null;
  for (var i = 0; i < vTaskList.length; i++) {
    scope = vTaskList[i].getScope();
    spl = scope.split("_");
    if (spl.length > 2 && spl[1] == selClass && spl[2] == selId) {
      tId = vTaskList[i].getID();
    }
  }
  if (tId != null) {
    unselectPlanningLines();
    highlightPlanningLine(tId);
  }
}
function unselectPlanningLines() {
  dojo.query(".dojoxGridRowSelected").forEach(function(node, index, nodelist) {
    dojo.removeClass(node, "dojoxGridRowSelected");
  });
  dojo.query(".editModeRowSelected").forEach(function(node, index, nodelist) {
    dojo.removeClass(node, "editModeRowSelected");
  });
}

function addToTimeline(refId, refType){
  var callback = function(){
    JSGantt.hideMenu(0);
    if(dojo.query('.hiddenTimelineTask').length == 0){
      loadMenuBarItem('Planning','Planning','bar');
    }else{
      refreshTimeline();
    }
  };
  loadContent("../tool/setTimelineItem.php?refId=" + refId
      + "&refType="+refType+"&mode=add", "resultDivMain", null, true, 'Timeline' ,null ,true ,callback);
}

function removeFromTimeline(refId, refType) {
  var callback = function(){
    JSGantt.hideMenu(0);
    if(dojo.query('.hiddenTimelineTask').length == 1){
      loadMenuBarItem('Planning','Planning','bar');
    }else{
      refreshTimeline();
    }
  };
  loadContent("../tool/setTimelineItem.php?refId=" + refId
      + "&refType="+refType+"&mode=remove", "resultDivMain", null, true, 'Timeline' ,null ,true ,callback);
}

function refreshTimeline(){
  loadContent("../tool/jsonTimeline.php", "timelineGanttDiv", null, false);
}

function openTimelineContextMenu(taskId, refId, refType){
  var contextMenu = dijit.byId('planningContextMenu');
  var contextMenuDiv = dojo.byId('dialogPlanningContextMenu');
  var mousePosition = {};
  mousePosition.x = event.clientX;
  if(dojo.byId('isMenuLeftOpen').value == 'true'){
    mousePosition.x -= 250;
  }
  mousePosition.y = event.clientY-220;
  dojo.query('.contextMenuClass').forEach(function(node){
    node.style.cssText='position:absolute;width:0px;height:0px;overflow:hidden;top:'+mousePosition.y+'px;left:'+mousePosition.x+'px';
  });
  
  if(dojo.byId('cm_addFromPlanning'))dojo.byId('cm_addFromPlanning').style.display = 'none';
  if(dojo.byId('cm_openFromPlanning'))dojo.byId('cm_openFromPlanning').style.display = 'none';
  if(dojo.byId('cm_closeFromPlanning'))dojo.byId('cm_closeFromPlanning').style.display = 'none';
  if(dojo.byId('cm_editFromPlanning'))dojo.byId('cm_editFromPlanning').style.display = 'none';
  if(dojo.byId('cm_removeFromPlanning'))dojo.byId('cm_removeFromPlanning').style.display = 'none';
  if(dojo.byId('cm_copyFromPlanning'))dojo.byId('cm_copyFromPlanning').style.display = 'none';
  if(dojo.byId('cm_editAssignmentFromPlanning'))dojo.byId('cm_editAssignmentFromPlanning').style.display = 'none';
  if(dojo.byId('cm_editAffectationFromPlanning'))dojo.byId('cm_editAffectationFromPlanning').style.display = 'none';
  if(dojo.byId('cm_emailFromPlanning'))dojo.byId('cm_emailFromPlanning').style.display = 'none';
  if(dojo.byId('cm_historyFromPlanning'))dojo.byId('cm_historyFromPlanning').style.display = 'none';
  if(dojo.byId('cm_printFromPlanning'))dojo.byId('cm_printFromPlanning').style.display = 'none';
  if(dojo.byId('cm_pdfFromPlanning'))dojo.byId('cm_pdfFromPlanning').style.display = 'none';
  if(dojo.byId('cm_successorFromPlanning'))dojo.byId('cm_successorFromPlanning').style.display = 'none';
  if(dojo.byId('cm_predecessorFromPlanning'))dojo.byId('cm_predecessorFromPlanning').style.display = 'none';
  if(dojo.byId('cm_sectionTimeline'))dojo.byId('cm_sectionTimeline').style.display = 'none';
  if(dojo.byId('cm_editOnlineFromPlanning'))dojo.byId('cm_editOnlineFromPlanning').style.display = 'none';
  
  if(dojo.byId('TimelineItemTask_'+taskId)){
    dojo.byId('cm_addToTimeline').style.display = 'none';
    dojo.byId('cm_removeFromTimeline').style.display = '';
    dojo.byId('cm_removeFromTimeline').setAttribute('onClick', 'removeFromTimeline('+refId+', \''+refType+'\')');
  }else{
    dojo.byId('cm_addToTimeline').style.display = '';
    dojo.byId('cm_removeFromTimeline').style.display = 'none';
    dojo.byId('cm_addToTimeline').setAttribute('onClick', 'addToTimeline('+refId+', \''+refType+'\')');
  }
  contextMenu.openDropDown();
  contextMenuDiv.focus();
}

function openObjectFromContextMenu(refType, refId, taskId, idProject){
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  JSGantt.hideMenu();
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  notShowDetailAfterReplan=false;
  runScript(refType, refId, taskId);
}

function closeObjectFromContextMenu(){
  JSGantt.hideMenu();
  hideDetailScreen();
  JSGantt.closeEditRowObjectPlanning();
}

function addObjectFromContextMenu(refId, refType){
  fromContextMenu = true;
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  JSGantt.closeEditRowObjectPlanning();
  var canCreate = (canCreateArray[refType] == 'YES')?1:0;
  dojo.byId('objectClass').value = refType;
  dojo.byId('objectId').value = refId;
  showDetail(null, canCreate, refType, false, 'new', true);
}

function editObjectFromContextMenu(refId, refType, taskId, idProject){
  fromContextMenu = true;
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  hideDetailScreen();
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  var canCreate = (canCreateArray[refType] == 'YES')?1:0;
  showDetail(null, canCreate, refType, false, refId, true);
}

function deleteObjectFromContextMenu(refId, refType){
  fromContextMenu = true;
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  hideDetailScreen();
  JSGantt.closeEditRowObjectPlanning();
  var action=function(){
    var resetContextMenuVariable=function(){
      if(!(dojo.byId('confirmControl') && dojo.byId('confirmControl').value=='delete')){
        fromContextMenu=false;
      }
    }
    dojo.byId('objectClass').value = refType;
    dojo.byId('objectId').value = refId;
    loadContent('../tool/deleteObject.php?objectId=' + refId
        + '&objectClassName='+refType+'&fromContextMenu='+fromContextMenu, 'resultDivMain', 'objectForm', true, null, null, null, resetContextMenuVariable);
  };
  showConfirm(i18n('confirmDelete', new Array(refType, refId)) ,action);
}

function copyObjectFromContextMenu(refId, refType, taskId, idProject){
  fromContextMenu = true;
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  hideDetailScreen();
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  var paramCopy="copyProject";
  dojo.byId('objectClass').value = refType;
  dojo.byId('objectId').value = refId;
  if(refType != "Project"){
    if (refType=='ComponentVersion') {
      paramCopy="copyVersion";
      copyObjectBox(paramCopy);
    } else if (copyableArray.indexOf(refType) != -1) {
      paramCopy="copyObjectTo";
      copyObjectBox(paramCopy);
    }else{
      if (refType=='Document'){
        paramCopy="copyDocument";
        copyObjectBox(paramCopy);
      }else{            
        copyObject(refType);
      }
    }
  }else{
    copyObjectBox(paramCopy);
  }
}

function editAssignmentFromContextMenu(refId, refType, taskId, idProject){
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  hideDetailScreen();
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  var params="&objectClass=" + refType + "&objectId=" + refId;
  loadDialog('dialogEditAssignmentPlanning', null, true, params);
}

function editAffectationFromContextMenu(refId, refType, taskId, idProject){
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  hideDetailScreen();
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  var params="&objectClass=" + refType + "&objectId=" + refId;
  loadDialog('dialogEditAffectationPlanning', null, true, params);
}

function sendMailFromContextMenu(refId, refType, taskId, idProject){
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  dojo.byId('objectClass').value = refType;
  dojo.byId('objectId').value = refId;
  showMailOptions();
}

function showHistoryFromContextMenu(refId, refType, taskId, idProject){
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  var params="&objectClass=" + refType + "&objectId=" + refId;
  loadDialog('dialogHistory', null, true, params);
}

function successorFromContextMenu(refId, refType, taskId, idProject){
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  dojo.byId('objectClass').value = refType;
  dojo.byId('objectId').value = refId;
  indentTask("increase");
}

function predecessorFromContextMenu(refId, refType, taskId, idProject){
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  JSGantt.closeAndSelectEditRow(taskId, refId, refType, idProject);
  dojo.byId('objectClass').value = refType;
  dojo.byId('objectId').value = refId;
  indentTask("decrease");
}

function invertSwitchValue(switchName) {
  if (! dijit.byId(switchName)) return;
  if (dijit.byId(switchName).get('value')=='on') dijit.byId(switchName).set('value','off');
  else dijit.byId(switchName).set('value','on');
}