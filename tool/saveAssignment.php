<?php
/*** COPYRIGHT NOTICE *********************************************************
 *
 * Copyright 2009-2017 ProjeQtOr - Pascal BERNARD - support@projeqtor.org
 * Contributors : -
 *
 * This file is part of ProjeQtOr.
 * 
 * ProjeQtOr is free software: you can redistribute it and/or modify it under 
 * the terms of the GNU Affero General Public License as published by the Free 
 * Software Foundation, either version 3 of the License, or (at your option) 
 * any later version.
 * 
 * ProjeQtOr is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
 * FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for 
 * more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with
 * ProjeQtOr. If not, see <http://www.gnu.org/licenses/>.
 *
 * You can get complete code of ProjeQtOr, other resource, help and information
 * about contributors at http://www.projeqtor.org 
 *     
 *** DO NOT REMOVE THIS NOTICE ************************************************/

/** ===========================================================================
 * Save a note : call corresponding method in SqlElement Class
 * The new values are fetched in $_REQUEST
 */

require_once "../tool/projeqtor.php";
$assignmentId=null;
$assignedChangeStatus=(Parameter::getGlobalParameter("statusChangeAssignment")=="YES")?true:false;
$refreshObj='false';
if (array_key_exists('assignmentId',$_REQUEST)) {
  $assignmentId=$_REQUEST['assignmentId']; // validated to be numeric in SqlElement base constructor
}
$assignmentId=pq_trim($assignmentId);
if ($assignmentId=='') {
  $assignmentId=null;
}

// Get the assignment info
if (! array_key_exists('assignmentRefType',$_REQUEST)) {
  throwError('assignmentRefType parameter not found in REQUEST');
}
$refType=$_REQUEST['assignmentRefType'];
Security::checkValidClass($refType);

if (! array_key_exists('assignmentRefId',$_REQUEST)) {
  throwError('assignmentRefId parameter not found in REQUEST');
}
$refId=$_REQUEST['assignmentRefId'];
Security::checkValidId($refId);

$idResource=null;
if (array_key_exists('assignmentIdResource',$_REQUEST)) {
  $idResource=$_REQUEST['assignmentIdResource'];
	Security::checkValidId($idResource);
}

$unique=RequestHandler::getBoolean('assignmentUnique');

$definitive=RequestHandler::getId('definitive');
if ($definitive>0) {
  $idResource=$definitive;
  $unique=false;
}

$idRole=null;
if (array_key_exists('assignmentIdRole',$_REQUEST)) {
  $idRole=$_REQUEST['assignmentIdRole'];
	Security::checkValidId($idRole);
}

$cost=null;
if (array_key_exists('assignmentDailyCost',$_REQUEST)) {
  $cost=$_REQUEST['assignmentDailyCost'];
  Security::checkValidNumeric($cost);
}

if (! array_key_exists('assignmentRate',$_REQUEST)) {
  throwError('assignmentRate parameter not found in REQUEST');
}
$rate=$_REQUEST['assignmentRate'];
Security::checkValidNumeric($rate);

if (! array_key_exists('assignmentAssignedWork',$_REQUEST)) {
  throwError('assignmentAssignedWork parameter not found in REQUEST');
}
$assignedWork=$_REQUEST['assignmentAssignedWork'];
Security::checkValidNumeric($assignedWork);

if (! array_key_exists('assignmentRealWork',$_REQUEST)) {
  throwError('assignmentRealWork parameter not found in REQUEST');
}
$realWork=$_REQUEST['assignmentRealWork'];
Security::checkValidNumeric($realWork);

if (! array_key_exists('assignmentLeftWork',$_REQUEST)) {
  throwError('assignmentLeftWork parameter not found in REQUEST');
}
$leftWork=$_REQUEST['assignmentLeftWork'];
Security::checkValidNumeric($leftWork);

if (! array_key_exists('assignmentPlannedWork',$_REQUEST)) {
  throwError('assignmentPlannedWork parameter not found in REQUEST');
}
$plannedWork=$_REQUEST['assignmentPlannedWork'];
Security::checkValidNumeric($plannedWork);

if (! array_key_exists('assignmentComment',$_REQUEST)) {
  throwError('assignmentComment parameter not found in REQUEST');
}

$idOrigin=RequestHandler::getNumeric('assignedIdOrigin',false,null);
//gautier #1742
$optional=0;
if (array_key_exists('attendantIsOptional',$_REQUEST)) {
  $optional = $_REQUEST['attendantIsOptional'];
  if($optional == 'on'){
    $optional = 1;
  }
}

$isTeam = RequestHandler::getBoolean('isTeam');
$isOrganization = RequestHandler::getBoolean('isOrganization');
$isResourceTeam = RequestHandler::getBoolean('isResourceTeam');

$mode = RequestHandler::getValue('mode');

//gautier #resourceTeam
$etp = RequestHandler::getNumeric('assignmentCapacity');

$planningMode=null;
$obj=new $refType($refId);
$peName=$refType.'PlanningElement';
if (property_exists($obj, $peName)) {
  $idPm=$obj->$peName->idPlanningMode;
  $pmObj=new PlanningMode($idPm);
  $planningMode=$pmObj->code;
}
$assRec=array();
if ($planningMode=='RECW') {
  for ($i=1;$i<=7;$i++) $assRec[$i]=RequestHandler::getValue('recurringAssignmentW'.$i);
}
$idle=RequestHandler::getBoolean('assignmentIdle');

$assignment=new Assignment();
$result=null;
//$comment=htmlEncode($_REQUEST['assignmentComment']);
$comment=$_REQUEST['assignmentComment']; // Must not escape : will be done on display
$resourceList=array($idResource=>$idResource);
if($isTeam){
  $crit = array('idTeam'=>$idResource);
  $resourceList = SqlList::getListWithCrit('Resource', $crit);
}
if($isOrganization){
  $crit = array('idOrganization'=>$idResource);
  $resourceList = SqlList::getListWithCrit('Resource', $crit);
}
$res = new ResourceAll($idResource);

if ($isResourceTeam){

    $crit = array('idResourceTeam'=>$idResource);
    $rta=new ResourceTeamAffectation();
    if($refType=='Meeting' or $refType=='PeriodicMeeting' or $refType=='PokerSession'){
      if($refType=='Meeting'){
        $date=$obj->meetingDate;
      }else if($refType=='PeriodicMeeting'){
        $date=$obj->periodicityStartDate;
      }else{
        $date=$obj->pokerSessionDate;
      }
      $where="idResourceTeam = $idResource and (startDate <= '$date' or startDate IS NULL) and (endDate >= '$date'  or endDate IS NULL ) ";
       $list=$rta->getSqlElementsFromCriteria(null,null,$where);
    }else{
      $list=$rta->getSqlElementsFromCriteria($crit);
    }
    $resourceList = array();
    foreach ($list as $l){
        $resource = new ResourceAll($l->idResource);
        $resourceList[$resource->id] = $resource->name;
    }
}
Sql::beginTransaction();
if($planningMode == 'MAN' and $mode =='edit'){
  $assignment=new Assignment($assignmentId);
  $oldCost=$assignment->dailyCost;
  $assignment->idRole=$idRole;
  $assignment->comment=$comment;
  $assignment->dailyCost=$cost;
  $assignment->idle=intval(pq_trim($idle));
  if (! $oldCost or $assignment->dailyCost!=$oldCost) {
    $assignment->newDailyCost=$cost;
  }
  $result=$assignment->save();
  //$result = i18n('Assignment').' #'.$assignmentId.' '.i18n("resultUpdated").'<input type="hidden" id="lastSaveId" value="'.$assignmentId.'" /><input type="hidden" id="lastOperation" value="update" /><input type="hidden" id="lastOperationStatus" value="OK" />';
}else{
  foreach ($resourceList as $idResource=>$name){
    // get the modifications (from request)
    $assignment=new Assignment($assignmentId);
    $res = new ResourceAll($idResource);
    $oldCost=$assignment->dailyCost;
    
    $assignment->refId=$refId;
    $assignment->refType=$refType;
    if (! $realWork && $idResource) {
      $assignment->idResource=$idResource;
    }
    // if it's a pool, affect role of resource in pool
    if(!pq_trim($idRole)){
      $assignment->idRole = $res->idRole;
    }else{
      $assignment->idRole=$idRole;
    }
    $assignment->dailyCost=$cost;
    if (! $oldCost or $assignment->dailyCost!=$oldCost) {
      $assignment->newDailyCost=$cost;
    }
    $resource = new ResourceAll($assignment->idResource);
    if($resource->isResourceTeam and !$unique){
      $assignment->capacity=$etp;
      $periods = ResourceTeamAffectation::buildResourcePeriods($idResource);
      $today=date('Y-m-d');
      $maxCapacity = 1;
      foreach ($periods as $p) {
        if($p['end']>$today and $maxCapacity < $p['rate']){
          $maxCapacity = $p['rate'];
        }
      }
      $rate = ($etp/$maxCapacity)*100;
      if($rate > 100){
        $rate = 100;
      }
      $assignment->rate = $rate;
    }else{
      $assignment->rate=$rate;
    }
    $assignment->uniqueResource=($unique)?1:0;;
    $assignment->assignedWork=Work::convertWork($assignedWork);
    //$assignment->realWork=Work::convertWork($realWork); // Should not be changed here
    $assignment->leftWork=Work::convertWork($leftWork);
    $assignment->plannedWork=Work::convertWork($plannedWork);
    $assignment->idle=intval(pq_trim($idle));
    $assignment->comment=$comment;
    
    if (! $assignment->idProject) {
      $refObj=new $refType($refId);
      $assignment->idProject=$refObj->idProject;
    }
    
    if (! $oldCost and $cost and $assignment->realWork) {
    	$wk=new Work();
    	$where="idResource=" . Sql::fmtId($assignment->idResource);
    	$where.=" and idAssignment=" . $assignment->id ;
    	$where.=" and (cost=0 or cost is null) and work>0";
    	$wkList=$wk->getSqlElementsFromCriteria(null, false, $where);
    	foreach ($wkList as $wk) {
    		$wk->dailyCost=$cost;
    		$wk->cost=$cost*$wk->work;
    		$wk->save();
    	}
    	$assignment->realCost=$assignment->realWork*$assignment->dailyCost;
    }
    if(isset($optional)){
      $assignment->optional=$optional;
    }
    if ($idOrigin) {
      $assignment->_origin=$idOrigin;
    }
    $resultTmp=$assignment->save();
    if (!isset($result) or !$result) $result=$resultTmp;
    if($assignedChangeStatus and $refreshObj=='false' and pq_strpos($result, "_refreshStatusObject")!==false){
      $refreshObj='true';
      $result=pq_substr($result,0,pq_strpos($result, "_refreshStatusObject"));
    }
    
    // 
    //$ar=new AssignmentRecurring();
    if ($planningMode=='RECW') {
      for ($i=1;$i<=7;$i++) {
        $res='';
        $ar=SqlElement::getSingleSqlElementFromCriteria('AssignmentRecurring', array('idAssignment'=>$assignment->id, 'day'=>$i));
        if (!$assRec[$i]) {
          if ($ar->id) $res=$ar->delete();
        } else {
          $ar->idAssignment=$assignment->id;
          $ar->type=pq_substr($planningMode,-1);
          $ar->day=$i;
          $ar->value=Work::convertWork($assRec[$i]);
          $ar->refType=$refType;
          $ar->refId=$refId;
          $ar->idResource=$idResource;
          $res=$ar->save();
        }
        if (getLastOperationStatus($result)=='NO_CHANGE' and getLastOperationStatus($res)=='OK') {
          $result=pq_str_replace('NO_CHANGE', 'OK', $result);
          $result=i18n("Assignment").' #'.htmlEncode($assignment->id).' '.i18n('resultUpdated').pq_substr($result,pq_strpos($result,'<input'));
        }
      }
    } else {
      $ar=new AssignmentRecurring();
      if ($assignment->id) $ar->purge("idAssignment=$assignment->id");
    }
    
    $elt=new $assignment->refType($assignment->refId);
    $mailResult=null;
    if ($assignmentId) {
      $mailResult=$elt->sendMailIfMailable(false,false,false,false,false,false,false,false,false,false,true,false);
    } else {
      $mailResult=$elt->sendMailIfMailable(false,false,false,false,false,false,false,false,false,true,false,false);
    }
    if ($mailResult) {
      $pos=pq_strpos($result,'<input type="hidden"');
      if ($pos) {
        $result=pq_substr($result, 0,$pos).' - ' . Mail::getResultMessage($mailResult).pq_substr($result, $pos);
      }
    }
    if ($refType=='Meeting' or $refType=='PeriodicMeeting') {
      Meeting::removeDupplicateAttendees($refType, $refId);
    }
    if ($refType=='Meeting') {
      $meeting = new Meeting($refId);
      $meetTable=$meeting->getDatabaseTableName();
      $critWhere = "refType = 'Meeting'";
      $critWhere .= " and idResource=$idResource ";
      $critWhere .= " and refId <> $refId";
      $critWhere .= " and refId in (Select id From $meetTable meet where ";
      $critWhere .= " ( meet.meetingStartDateTime between '".  $meeting->meetingStartDateTime . "' and '" . $meeting->meetingEndDateTime ."'";
      $critWhere .= " or meet.meetingEndDateTime between '" . $meeting->meetingStartDateTime . "' and '" . $meeting->meetingEndDateTime ."' ) )";
      $tmpAss=new Assignment();
      $countSame = $tmpAss->countSqlElementsFromCriteria(null,$critWhere);
      if ($countSame > 0) {
        $result .= '</br>'. i18n('resourceAlreadyTaken', array(SqlList::getNameFromId('Affectable', $idResource)));
        $result=pq_str_replace('id="lastOperationStatus" value="OK"','id="lastOperationStatus" value="INCOMPLETE"',$result);
      }
    }
    
    if ($idOrigin){
      $assignmentOrigin = new Assignment($idOrigin);
        $assignmentOrigin->assignedWork=$assignmentOrigin->assignedWork-Work::convertWork($assignedWork);
        if ($assignmentOrigin->assignedWork<0) $assignmentOrigin->assignedWork=0;
        $assignmentOrigin->leftWork=$assignmentOrigin->leftWork-Work::convertWork($leftWork);
        if ($assignmentOrigin->leftWork<0) $assignmentOrigin->leftWork=0;
        $assignmentOrigin->save();
    }
      
    // If uniquerResource, store list of resources
    if ($assignment->isResourceTeam and $assignment->uniqueResource) {
      $userSelected=RequestHandler::getValue("dialogAssignmentManualSelect");
      $res=AssignmentSelection::addResourcesFromPool($assignment->id,$assignment->idResource,$userSelected);
      if (getLastOperationStatus($result)=='NO_CHANGE' and $res and getLastOperationStatus($res)=='OK') {
        $result=$res;
      } 
    }
    if ($definitive) {
      $assSel=new AssignmentSelection();
      $assSel->purge("idAssignment=$assignment->id");
    }
  }
  echo '<input id="idAssignment" name="idAssignment" type="hidden" value="'.$assignment->id.'"/>';
}
$status = getLastOperationStatus($result);
if ($result==null) {
  echo '<div class="messageNO_CHANGE" >'.i18n("messageNoChange").' '.i18n("Assignment").'</div>';
  echo '<input id="lastOperationStatus" name="lastOperationStatus" type="hidden" value="NO_CHANGE"/>';
} else {
  if($assignedChangeStatus){
    echo '<input id="refreshObjectAfterAssigned" name="refreshObjectAfterAssigned" type="hidden" value="'.$refreshObj.'"/>';
  }
   echo '<input id="lastOperationStatus" name="lastOperationStatus" type="hidden" value="'.$status.'"/>';
   displayLastOperationStatus($result);
}
// Message of correct saving
?>