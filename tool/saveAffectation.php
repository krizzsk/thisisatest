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
scriptLog('   ->/tool/saveAffectation.php');
// Get the info
if (! array_key_exists('affectationId',$_REQUEST)) {
  throwError('affectationId parameter not found in REQUEST');
}
$id=($_REQUEST['affectationId']); // validated to be numeric value in SqlElement base constructor.

$idTeam=null;
if (array_key_exists('affectationIdTeam',$_REQUEST)) {
	$idTeam=$_REQUEST['affectationIdTeam']; // escaped before used in DB queries
}

$idOrganization=RequestHandler::getId('affectationIdOrganization');

if (! array_key_exists('affectationProject',$_REQUEST)) {
  throwError('affectationProject parameter not found in REQUEST');
}
$project=($_REQUEST['affectationProject']); // escaped before used in DB queries

if (! array_key_exists('affectationResource',$_REQUEST) and !$idTeam and !$idOrganization) {
  throwError('affectationResource parameter not found in REQUEST');
}
$resource=($_REQUEST['affectationResource']); // escaped before used in DB queries

if (! array_key_exists('affectationProfile',$_REQUEST) and !$idTeam and !$idOrganization) {
  throwError('affectationProfile parameter not found in REQUEST');
}
$profile=($_REQUEST['affectationProfile']); // escaped before used in DB queries

if (! array_key_exists('affectationRate',$_REQUEST)) {
  throwError('affectationRate parameter not found in REQUEST');
}
$rate=($_REQUEST['affectationRate']);
Security::checkValidNumeric($rate);

$description=null;
if (array_key_exists('affectationDescription',$_REQUEST)) {
  $description=($_REQUEST['affectationDescription']);
}
$paramAutoAff=Parameter::getGlobalParameter('autoAffectationPool');

$startDate="";
if (array_key_exists('affectationStartDate',$_REQUEST)) {
	$startDate=($_REQUEST['affectationStartDate']);;
}
Security::checkValidDateTime($startDate);

$endDate="";
if (array_key_exists('affectationEndDate',$_REQUEST)) {
	$endDate=($_REQUEST['affectationEndDate']);;
}
Security::checkValidDateTime($endDate);

$idle=0;
if (array_key_exists('affectationIdle',$_REQUEST)) {
  $idle=1;
}
$isTeam = RequestHandler::getBoolean('isTeam');
$isOrganization = RequestHandler::getBoolean('isOrganization');
if($isTeam)$idTeam = $resource;
if($isOrganization)$idOrganization = $resource;
$mailResult=null;
Sql::beginTransaction();
if (! $idTeam and !$idOrganization) {
	$affectation=new Affectation($id);
	$affectation->idProject=$project;
	$affectation->idResource=$resource;
	if($affectation->idle!=$idle){
    	if($affectation->idResource!=''){
    	  $ress=new ResourceAll($affectation->idResource);
    	}else{
    	  $ress=new ResourceAll($affectation->idResourceSelect);
    	}
    	if( $ress->isResourceTeam==1 and $paramAutoAff=='IMPLICIT' ){
    	  $allAffImpl=$affectation->getSqlElementsFromCriteria(array('idResourceTeam'=>$ress->id));
    	  foreach ($allAffImpl as $affImp){
    	    $affImp->idle=$idle;
    	    $affImp->save();
    	  }
    	}
	}
	$affectation->idle=$idle;
	$affectation->rate=$rate;
	$affectation->startDate=$startDate;
	$affectation->endDate=$endDate;
	$affectation->idProfile=$profile;
	if (! $affectation->id or $description!=formatAnyTextToPlainText($affectation->description)) {
	  $affectation->description=nl2brForPlainText($description);
	}
	$result=$affectation->save();
	if ($affectation->idResource==getCurrentUserId()) $result .= '<input type="hidden" id="needProjectListRefresh" value="true" />';
} else {
  if($idOrganization){
    $crit=array('idOrganization'=>$idOrganization,'idle'=>'0');
  }else if($idTeam){
    $crit=array('idTeam'=>$idTeam,'idle'=>'0');
  }
	$ress=new Affectable();
	$list=$ress->getSqlElementsFromCriteria($crit, false);
	$nbAff=0;
	$currentUserDone=false;
	foreach ($list as $ress) {
		$affectation=new Affectation($id);
		$exist=$affectation->getSqlElementsFromCriteria(array('idResource'=>$ress->id, 'idProject'=>$project));
		if (count($exist)>0) continue;
    $affectation->idProject=$project;
    $affectation->idResource=$ress->id;
    if (trim($profile)) $affectation->idProfile=$profile;
    else $affectation->idProfile=$ress->idProfile;
    $affectation->idle=$idle;
    $affectation->rate=$rate;
    $affectation->startDate=$startDate;
    $affectation->endDate=$endDate;
    $res=$affectation->save();
    if (pq_stripos($res,'id="lastOperationStatus" value="OK"')>0 ) {
      $nbAff++;
      if ($affectation->idResource==getCurrentUserId()) $currentUserDone=true;
	  }
	}
	if ($nbAff) {
    $result='<b>' . i18n('menuAffectation') . ' ' . i18n('resultInserted') . ' : ' . $nbAff . '</b>';
    $result .= '<input type="hidden" id="lastSaveId" value="" />';
    $result .= '<input type="hidden" id="lastOperation" value="insert" />';
    $result .= '<input type="hidden" id="lastOperationStatus" value="OK" />';
    if ($currentUserDone) $result .= '<input type="hidden" id="needProjectListRefresh" value="true" />';
	} else {
		$result=i18n('Affectation') . ' ' . i18n('resultInserted') . ' : 0';
    $result .= '<input type="hidden" id="lastSaveId" value="" />';
    $result .= '<input type="hidden" id="lastOperation" value="control" />';
    $result .= '<input type="hidden" id="lastOperationStatus" value="INVALID" />';
	}
}
$mailResult=null;
$proj = new Project($project);
if ($id) {
  $mailResult=$proj->sendMailIfMailable(false,false,false,false,false,false,false,false,false,false,false,false,false,true);
} else {
  $mailResult=$proj->sendMailIfMailable(false,false,false,false,false,false,false,false,false,false,false,false,true);
}
if ($mailResult) {
  $pos=pq_strpos($result,'<input type="hidden"');
  if ($pos) {
    $result=pq_substr($result, 0,$pos).' - ' . Mail::getResultMessage($mailResult).pq_substr($result, $pos);
  }
}

// Message of correct saving
displayLastOperationStatus($result);
?>