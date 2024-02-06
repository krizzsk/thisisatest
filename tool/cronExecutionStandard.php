<?php 
/*** COPYRIGHT NOTICE *********************************************************
 *
 * Copyright 2009-2018 ProjeQtOr - Pascal BERNARD - support@projeqtor.org
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

require_once "../tool/projeqtor.php";
$operation=RequestHandler::getValue('operation');
if ($operation=='saveDefinition') {
  cronSaveDefinition();
} else if ($operation=='activate') {
  cronActivate();
}

function cronPlanningDifferential(){
  $user=new User();//getSessionUser();
  $user->idProfile=1; // Admin
  $user->resetAllVisibleProjects();
  setSessionUser($user);
  SqlList::cleanAllLists();
  $startDatePlan=cronPlanningStartDate(Parameter::getGlobalParameter("automaticPlanningDifferentialDate"));
  $modeSurbookingDifferential=Parameter::getGlobalParameter("modeSurbookingDifferential");
  $arrayProj=array();
  $pe=new PlanningElement();
  $lst=$pe->getSqlElementsFromCriteria(array('refType'=>'Project','needReplan'=>1));
  foreach ($lst as $pe) {
    $arrayProj[]=$pe->refId;
  }
  $mode=i18n("paramAutomaticPlanningDifferential");
  $mode=pq_str_replace(array("<b>","</b>"),array("",""),$mode);
  traceLog(i18n("sectionAutomaticPlanning").' : '.$mode." - ".i18n('colStart')." - ".i18n('projects').' : ' .((count($arrayProj))?implode(',',$arrayProj):i18n('paramNone')));
  if (count($arrayProj)>0) {
    //Sql::beginTransaction(); #3601 : management of transaction in now included in PlannedWork::plan()
    if($modeSurbookingDifferential=="YES"){
    $result=PlannedWork::plan($arrayProj, $startDatePlan, true, true);
    }else{
    $result=PlannedWork::plan($arrayProj, $startDatePlan);
    }
    $status = getLastOperationStatus ( $result );
    //if ($status == "OK" or $status=="NO_CHANGE" or $status=="INCOMPLETE") {
    //  Sql::commitTransaction ();
    //} else {
    //  Sql::rollbackTransaction ();
    //}
    if ($status == "OK") $resultStatus=i18n("planningResultOK");
    else if ($status == "NO_CHANGE" or $status == "INCOMPLETE") $resultStatus=i18n("planningResultNoChange");
    else $resultStatus=i18n("planningResultError");
    traceLog(i18n("sectionAutomaticPlanning").' : '.$mode." - ".i18n('colEnd')." - ". i18n("colResult"). " = $resultStatus");
  } else {
    $status='NO_CHANGE';
  }
}

function cronPlanningComplete(){
  $user=new User();//getSessionUser();
  $user->idProfile=1; // Admin
  $user->resetAllVisibleProjects();
  setSessionUser($user);
  SqlList::cleanAllLists();
  $startDatePlan=cronPlanningStartDate(Parameter::getGlobalParameter("automaticPlanningCompleteDate"));
  $enterPlannedAsReal=Parameter::getGlobalParameter('automaticFeedingOfTheReal');
  $modeSurbookingComplete=Parameter::getGlobalParameter("modeSurbookingComplete");
  if ($enterPlannedAsReal=='YES') {
    PlannedWork::enterPlannedWorkAsReal(null, $startDatePlan);  
  }
  
  $mode=i18n("paramAutomaticPlanningComplete");
  $mode=pq_str_replace(array("<b>","</b>"),array("",""),$mode);
  traceLog(i18n("sectionAutomaticPlanning").' : '.$mode." - ".i18n('colStart')." - ".i18n('projects').' : '.i18n('all'));
  //Sql::beginTransaction(); #3601 : management of transaction in now included in PlannedWork::plan()
  $modeSurbookingComplete = ($modeSurbookingComplete=="YES")?true:false;
  $result=PlannedWork::plan(array(' '), $startDatePlan, true, $modeSurbookingComplete);
  $status = getLastOperationStatus ( $result );
  //if ($status == "OK" or $status=="NO_CHANGE" or $status=="INCOMPLETE") {
  //  Sql::commitTransaction ();
  //} else {
  //  Sql::rollbackTransaction ();
  //}
  if ($status == "OK") $resultStatus=i18n("planningResultOK");
  else if ($status == "NO_CHANGE" or $status == "INCOMPLETE") $resultStatus=i18n("planningResultNoChange");
  else $resultStatus=i18n("planningResultError");
  traceLog(i18n("sectionAutomaticPlanning").' : '.$mode." - ".i18n('colEnd')." - ". i18n("colResult"). " = $resultStatus");
}

function cronPlanningStartDate($param) {
  if ($param=="W") {
    return date('Y-m-d',firstDayofWeek()); // Call with no parameter will return first day of current week
  } else if ($param=="M") {
    return date('Y-m').'-01';
  } else if (pq_substr($param,0,1)=='J') {
    $day=pq_substr($param,1);
    if ( is_numeric($day) and $day!=0) {
      return addDaysToDate(date('Y-m-d'), $day);
    } else {
      return date('Y-m-d');
    }
  } else {
    return date('Y-m-d',firstDayofWeek());
  }
}

function cronSaveDefinition() {
  $minutes=RequestHandler::getValue('cronDefinitonMinutes');
  $hours=RequestHandler::getValue('cronDefinitonHours');
  $dayOfMonth=RequestHandler::getValue('cronDefinitonDayOfMonth');
  $month=RequestHandler::getValue('cronDefinitonMonth');
  $dayOfWeek=RequestHandler::getValue('cronDefinitonDayOfWeek');
  
  $scope=RequestHandler::getValue('cronExecutionScope');
  $cronExecution=CronExecution::getObjectFromScope($scope);
  
  $cronStr=$minutes.' '.$hours.' '.$dayOfMonth.' '.$month.' '.$dayOfWeek;
  $cronExecution->idle=1; // Desactivate after save (will force reactivate and then CRON relaunch
  
  if (! $cronExecution->fileExecuted) {
    if (pq_substr($scope,0,15)=='imputationAlert') {
      $cronExecution->fileExecuted="../tool/generateImputationAlert.php";
    } else {
      $cronExecution->fileExecuted="../tool/cronExecutionStandard.php";
    }
  }
  if (! $cronExecution->fonctionName) $cronExecution->fonctionName="cron". pq_ucfirst($scope);
  $cronExecution->cron=$cronStr;
  $cronExecution->nextTime=null;
  $result=$cronExecution->save();
}

function cronActivate() {
  $scope=RequestHandler::getValue('cronExecutionScope');
  $cronExecution=CronExecution::getObjectFromScope($scope);
  $cronExecution->idle=($cronExecution->idle==0)?1:0;
  $cronExecution->nextTime=null;
  $result=$cronExecution->save();
}

function dataCloningCheckRequest(){
  $dataCloning = new DataCloning();
  $dataCloningList = $dataCloning->getSqlElementsFromCriteria(array('idle'=>'0'));
  foreach ($dataCloningList as $data){
    if(!$data->isActive and !$data->isRequestedDelete and !$data->codeError){
      $data->createDataCloning($data->id);
    }
    if($data->isRequestedDelete){
      $data->deleteDataCloning($data->id);
    }
  }
}

//florent
function archiveHistory(){
  $hist=new History();
  $histArch= new HistoryArchive();
  $timeToArchive=Parameter::getGlobalParameter('cronArchiveTime');
  $startArchive=Parameter::getGlobalParameter('cronArchivePlannedDate');
  $tableHist=$hist->getDatabaseTableName();
  $tableHistArch=$histArch->getDatabaseTableName();
  $archivDate = date('Y-m-d', pq_strtotime("-".$timeToArchive." day"));
  $colList="";
  foreach ($hist as $fld=>$val) {
    if (pq_substr($fld,0,1)=='_' or $fld=='id') continue;
    $col=$hist->getDatabaseColumnName($fld);
    if ($col) {
      $colList.="$col, ";
    }
  }
  $colList=pq_substr($colList,0,-2);
  $requestIns="INSERT INTO $tableHistArch ($colList)\n"
      ."SELECT $colList FROM $tableHist WHERE operationDate < '".$archivDate."'"; //   INSERT INTO `archivehistory` (`idHistory`,`refType`,`refId`,`operation`,`colName`,`oldValue`,`newValue`,`operationDate`,`isWorkHistory`,`idUser`) 
  $clauseDel="operationDate < '".$archivDate."'";
  SqlDirectElement::execute($requestIns);
  $res=Sql::$lastQueryNbRows;
  if($res > 0){
    $hist->purge($clauseDel);
  }
}
function kpiCalculate() {
  $time=date("Y-m-d H:00:00");
  KpiValueRequest::triggerCalculation($time);
}

function cronCloseMails(){
  $maintenanceCloseMail=SqlElement::getSingleSqlElementFromCriteria('Parameter', array('parameterCode'=>'maintenanceCloseMail'));
  if($maintenanceCloseMail->id=='')$nbDays=7;
  else $nbDays=$maintenanceCloseMail->parameterValue;
  $targetDate=addDaysToDate(date('Y-m-d'), (-1)*$nbDays ) . ' ' . date('H:i:s');
  $item='Mail';
  $obj=new $item();
  $clauseWhere="mailDateTime<'" . $targetDate . "'";
  $obj->close($clauseWhere);
}

function cronDeleteMails(){
  $maintenanceDeleteMail=SqlElement::getSingleSqlElementFromCriteria('Parameter', array('parameterCode'=>'maintenanceDeleteMail'));
  if($maintenanceDeleteMail->id=='')$nbDays=30;
  else $nbDays=$maintenanceDeleteMail->parameterValue;
  $targetDate=addDaysToDate(date('Y-m-d'), (-1)*$nbDays ) . ' ' . date('H:i:s');
  $item='Mail';
  $obj=new $item();
  $clauseWhere="mailDateTime<'" . $targetDate . "'";
  return $obj->purge($clauseWhere);
}

function cronCloseAlerts(){
  $maintenanceCloseAlert=SqlElement::getSingleSqlElementFromCriteria('Parameter', array('parameterCode'=>'maintenanceCloseAlert'));
  if($maintenanceCloseAlert->id=='')$nbDays=7;
  else $nbDays=$maintenanceCloseAlert->parameterValue;
  $targetDate=addDaysToDate(date('Y-m-d'), (-1)*$nbDays ) . ' ' . date('H:i:s');
  $item='Alert';
  $obj=new $item();
  $clauseWhere="alertInitialDateTime<'" . $targetDate . "'";
  $obj->read($clauseWhere);
  $obj->close($clauseWhere);
}
function cronDeleteAlerts(){
  $maintenanceDeleteAlert=SqlElement::getSingleSqlElementFromCriteria('Parameter', array('parameterCode'=>'maintenanceDeleteAlert'));
  if($maintenanceDeleteAlert->id=='')$nbDays=30;
  else $nbDays=$maintenanceDeleteAlert->parameterValue;
  $targetDate=addDaysToDate(date('Y-m-d'), (-1)*$nbDays ) . ' ' . date('H:i:s');
  $item='Alert';
  $obj=new $item();
  $clauseWhere="alertInitialDateTime<'" . $targetDate . "'";
  $obj->purge($clauseWhere);
}

function cronDeleteNotifications(){
  $maintenanceDeleteNotification=SqlElement::getSingleSqlElementFromCriteria('Parameter', array('parameterCode'=>'maintenanceDeleteNotification'));
  if($maintenanceDeleteNotification->id=='')$nbDays=30;
  else $nbDays=$maintenanceDeleteNotification->parameterValue;
  $targetDate=addDaysToDate(date('Y-m-d'), (-1)*$nbDays );
  $item='Notification';
  $obj=new $item();
  $clauseWhere="notificationDate<'" . $targetDate . "'";
  $obj->purge($clauseWhere);
}

function cronDeleteAudit(){
  $maintenanceDeleteAudit=SqlElement::getSingleSqlElementFromCriteria('Parameter', array('parameterCode'=>'maintenanceDeleteAudit'));
  if($maintenanceDeleteAudit->id=='')$nbDays=30;
  else $nbDays=$maintenanceDeleteAudit->parameterValue;
  $targetDate=addDaysToDate(date('Y-m-d'), (-1)*$nbDays ) . ' ' . date('H:i:s');
  $item='Audit';
  $obj=new $item();
  $clauseWhere="disconnectionDateTime<'" . $targetDate . "'";
  $obj->purge($clauseWhere);
}

function cronDeleteLogfile(){
  $maintenanceDeletedLogfile=SqlElement::getSingleSqlElementFromCriteria('Parameter', array('parameterCode'=>'deleteLogfileDays'));
  if($maintenanceDeletedLogfile->id=='')$nbDays=30;
  else $nbDays=$maintenanceDeletedLogfile->parameterValue;
  $clauseWhere=addDaysToDate(date('Y-m-d'), (-1)*$nbDays ) . ' ' . date('H:i:s');
  $item='Logfile';
  $obj=new $item();
  $obj->purge($clauseWhere);
}

function cronDisconnectAll(){
  $audit=new Audit();
  $list=$audit->getSqlElementsFromCriteria(array("idle"=>"0"));
  foreach($list as $audit) {
	  $audit->requestDisconnection=1;
	  $audit->save();
    $userAudit=new User($audit->idUser);
    if ($userAudit->id) {
      $userAudit->cleanCookieHash();
      $userAudit->stopAllWork();
    }
  }
}

function purgeGhostSessions() {
  $audit=new Audit();
  $date=date('Y-m-d');
  $time=date('H:i:s');
  $checkDateTime=addDaysToDate($date, -1).' '.$time;
  $list=$audit->getSqlElementsFromCriteria(null,null,"idle=0 and lastAccessDateTime<='$checkDateTime'");
  foreach($list as $audit) {
    $audit->disconnectionDateTime = $audit->lastAccessDateTime;
		$audit->idle = 1;
		$audit->sessionId=$audit->sessionId.'_'.date('YmdHis');
		enableCatchErrors(); 
		enableSilentErrors();
		$audit->save();
		$userAudit=new User($audit->idUser);
		if ($userAudit->id) {
		  $userAudit->cleanCookieHash();
		  $userAudit->stopAllWork();
		}
    disableCatchErrors();
    disableSilentErrors();
  }
}

function cronBaseline() {
  $baseline=new Baseline();
  $baseline->idProject='0';
  $baseline->baselineDate=date('Y-m-d');
  $baseline->name='automaticGlobalBaseline';
  $baseline->idUser=getSessionUser()->id; 
  $baseline->creationDateTime=date('Y-m-d H:i:s');
  $baseline->idPrivacy=9;
  $res=new Resource(getSessionUser()->id);
  $baseline->idTeam=$res->idTeam;
  $baseline->baselineNumber=intval($baseline->countSqlElementsFromCriteria(null,"name='$baseline->name' and idProject=0 and baselineDate<>'$baseline->baselineDate'"))+1;
  $baseline->saveWithPlanning();
}

function cronRunConsistencyFix(){
  $correct=1;
  IndicatorValue::$_doNotUpdate=true;
  SqlElement::$_skipAllControls=true;
  Consistency::checkWbs($correct,false,false);
  Consistency::checkBbs($correct,false,false);
  Consistency::checkSbs($correct,false,false);
  Consistency::checkDuplicateWork($correct,false,false);
  Consistency::checkWorkOnTicket($correct,false,false);
  Consistency::checkWorkOnAssignment($correct,false,false);
  Consistency::checkIdlePropagation($correct,false,false);
  Consistency::checkMissingPlanningElement($correct,false,false);
  Consistency::checkWorkOnActivity($correct,false,false);
  Consistency::checkWorkOnMeeting($correct,false,false);
  Consistency::checkPeriodicMeetingAssign($correct,false,false);
  Consistency::checkBudget($correct,false,false);
  Consistency::checkInvalidFilters($correct,false,false);
  Consistency::checkPools($correct,false,false);
  Consistency::checkProject($correct,false,false);
  IndicatorValue::$_doNotUpdate=false;
  SqlElement::$_skipAllControls=false;
}

function cronGlobalRenumberWbs() {
  projeqtor_set_time_limit(900);
  IndicatorValue::$_doNotUpdate=true;
  traceLog("=== Global renumber of WBS structure === Start ");
  $plan=new PlanningElement();
  $plan->renumberWbs(true);
  traceLog("=== Global renumber of WBS structure === End ");
  IndicatorValue::$_doNotUpdate=false;
}

?>