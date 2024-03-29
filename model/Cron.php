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

/* ============================================================================
 * ActionType defines the type of an issue.
 */ 
require_once('_securityCheck.php');

class Cron {

  // Define the layout that will be used for lists
    
  private static $sleepTime;
  private static $checkDates;
// BEGIN - ADD BY TABARY - NOTIFICATION SYSTEM
  private static $checkNotifications;
// END - ADD BY TABARY - NOTIFICATION SYSTEM
// MTY - LEAVE SYSTEM
  private static $checkLeavesEarned;
// MTY - LEAVE SYSTEM
  private static $checkImport;
  private static $checkEmails;
  private static $checkMailGroup;
  private static $runningFile;
  private static $timesFile;
  private static $stopFile;
  private static $errorFile;
  private static $deployFile;
  private static $restartFile;
  private static $historyFile;
  private static $cronWorkDir;
  public static $listCronExecution;
  public static $lastCronTimeExecution;
  public static $lastCronExecution;
  public static $listCronAutoSendReport;
  public static $lastCronTimeAutoSendReport;
  public static $lastCronAutoSendReport;
  public static $cronUniqueId;
  public static $cronProcessId;
  public static $cronRequestedStop;
  public static $lastBankUpdate;
  
  const CRON_DATA_SEPARATOR='|';  
   /** ==========================================================================
   * Constructor
   * @param $id the id of the object in the database (null if not stored yet)
   * @return void
   */ 
  function __construct($id = NULL, $withoutDependentObjects=false) {

  }

  
   /** ==========================================================================
   * Destructor
   * @return void
   */ 
  function __destruct() {
    
  }

// ============================================================================**********
// GET STATIC DATA FUNCTIONS
// ============================================================================**********
  
  public static function init() {
  	if (self::$cronWorkDir) return;
  	self::$cronWorkDir=Parameter::getGlobalParameter('cronDirectory');
    self::$runningFile=self::$cronWorkDir.'/RUNNING';
    self::$timesFile=self::$cronWorkDir.'/DELAYS';
    self::$stopFile=self::$cronWorkDir.'/STOP';
    self::$errorFile=self::$cronWorkDir.'/ERROR';
    self::$deployFile=self::$cronWorkDir.'/DEPLOY';
    self::$restartFile=self::$cronWorkDir.'/RESTART';
    self::$historyFile=self::$cronWorkDir.'/HISTORY';
  }
  
  public static function getActualTimes() {
  	self::init();
  	if (! is_file(self::$timesFile)) {
  		return array();
  	}
  	$handle=fopen(self::$timesFile, 'r');
    $line=fgets($handle);
    fclose($handle);
    $result=array();
    $arr=pq_explode('|',$line);
    foreach ($arr as $val) {
    	$split=pq_explode('=',$val);
    	if (count($split)==2) {
    	  $result[$split[0]]=$split[1];
    	}
    }
  	return $result;
  }

  public static function setActualTimes() {
  	self::init();
    $handle=fopen(self::$timesFile, 'w');
    fwrite($handle,'SleepTime='.self::getSleepTime()
                 .'|CheckDates='.self::getCheckDates()
                 .'|CheckImport='.self::getCheckImport()
                 .'|CheckEmails='.self::getCheckEmails()
                 .( Mail::isMailGroupingActiv() ?'|CheckMailGroup='.self::getCheckMailGroup():'')
// BEGIN - ADD BY TABARY - NOTIFICATION SYSTEM            
                 .(isNotificationSystemActiv()?'|CheckNotifications='.self::getCheckNotifications():'')
// END - ADD BY TABARY - NOTIFICATION SYSTEM
// MTY - LEAVE SYSTEM            
                 .(isLeavesSystemActiv()?'|CheckLeavesEarned='.self::getCheckLeavesEarned():'')
// MTY - LEAVE SYSTEM
           );
    fclose($handle);
  }
  
  public static function storeHistory($msg) {
    self::init();
    $handle=fopen(self::$historyFile, 'a');
    fwrite($handle,date('Y-m-d H:i:s')." - $msg \n");
    fclose($handle);
  }
  
  public static function getSleepTime() {
  	self::init();
    if (self::$sleepTime) {
    	return self::$sleepTime;
    }
  	$cronSleepTime=Parameter::getGlobalParameter('cronSleepTime');
    if (! $cronSleepTime) {$cronSleepTime=10;}
    self::$sleepTime=$cronSleepTime;
    return self::$sleepTime;
  }

  public static function getCheckDates() {
  	self::init();
    if (self::$checkDates) {
      return self::$checkDates;
    }
    $checkDates=Parameter::getGlobalParameter('cronCheckDates'); 
    if (! $checkDates) {$checkDates=30;}
    self::$checkDates=$checkDates;
    return self::$checkDates;
  }

// BEGIN - ADD BY TABARY - NOTIFICATION SYSTEM
  public static function getCheckNotifications() {
    self::init();
    if (!isNotificationSystemActiv()) {
        self::$checkNotifications=-1;
        return self::$checkNotifications;        
    }  
    if (self::$checkNotifications) {
      return self::$checkNotifications;
    }
    $checkNotifications=Parameter::getGlobalParameter('cronCheckNotifications'); 
    if (! $checkNotifications) {$checkNotifications=3600;}
    self::$checkNotifications=$checkNotifications;
    return self::$checkNotifications;
  }
// END - ADD BY TABARY - NOTIFICATION SYSTEM

// MTY - LEAVE SYSTEM
  public static function getCheckLeavesEarned() {
    self::init();
    if (!isLeavesSystemActiv()) {
        self::$checkLeavesEarned=-1;
        return self::$checkLeavesEarned;        
    }  
    if (self::$checkLeavesEarned) {
      return self::$checkLeavesEarned;
    }
    $checkLeavesEarned=3600*24; 
    self::$checkLeavesEarned=$checkLeavesEarned;
    return self::$checkLeavesEarned;
  }
// MTY - LEAVE SYSTEM
  
  
  public static function getCheckImport() {
  	self::init();
    if (self::$checkImport) {
      return self::$checkImport;
    }
    $checkImport=Parameter::getGlobalParameter('cronCheckImport'); 
    if (! $checkImport) {$checkImport=30;}
    self::$checkImport=$checkImport;
    return self::$checkImport;
  }  
  
  public static function getCheckEmails() {
    self::init();
    if (self::$checkEmails) {
      return self::$checkEmails;
    }
    $checkEmails=Parameter::getGlobalParameter('cronCheckEmails'); 
    if (! $checkEmails) {$checkEmails=5*60;} // Default=every 5 mn
    self::$checkEmails=$checkEmails;
    return self::$checkEmails;
  }  
  public static function getCheckMailGroup() {
    self::init();
    if (self::$checkMailGroup) {
      return self::$checkMailGroup;
    }
    $checkMailGroup=Mail::getMailGroupPeriod(); 
    if (! $checkMailGroup or $checkMailGroup<0) {
      $checkMailGroup=-1;
    } else {
      $checkMailGroup=$checkMailGroup/2; // Check every half period
      if ($checkMailGroup<self::getSleepTime()) {
        $checkMailGroup=self::getSleepTime();
      } else if ($checkMailGroup>60) { // check at least every minute;
        $checkMailGroup=60;
      }
    }
    self::$checkMailGroup=$checkMailGroup;
    return self::$checkMailGroup;
  }  
  
  public static function check() {
  	self::init();
    if (file_exists(self::$runningFile)) {
      $handle=fopen(self::$runningFile, 'r');
      $lastData=fgets($handle);
      $lastSplit=pq_explode(self::CRON_DATA_SEPARATOR,$lastData);
      $last=$lastSplit[0];
      $now=time();
      fclose($handle);
      //$timeout=self::getSleepTime()*5; // Old Timeout is too small : long Cronned tasks lead to unexpected relaunch
      $timeout=30*60; // 30 minutes before considering CRON is dead
      if ( !$last or !is_numeric($last) or ($now-$last) > $timeout) {
        // not running for more than 5 cycles : dead process
        self::removeRunningFlag();
        return "stopped";
      } else {
        return "running";
      }
    } else {
      return "stopped";
    }
  }

  public static function checkDuplicateRunning() {
    // Will check if another CRON is already running (with other Process ID)
    self::init();
    if (file_exists(self::$runningFile)) {
      $handle=fopen(self::$runningFile, 'r');
      $lastData=fgets($handle);
      fclose($handle);
      $lastSplit=pq_explode(self::CRON_DATA_SEPARATOR,$lastData);
      $last=$lastSplit[0];
      //$timeout=30*60; // 30 minutes before concidering CRON is dead
      //$now=time();
      //$lastExecTimeout=false;
      //if ( !$last or !is_numeric($last) or ($now-$last) > $timeout) {
      //  $lastExecTimeout=true;
      //}
      if (count($lastSplit)>2) {
        $lastProcessId=$lastSplit[1];
        $lastUniqueId=$lastSplit[2];
      } else {
        // Another process is already running with no PID logged => this is old CRON running
        // => Set Stop flag : hoping next to execute will be the old one, and it will be stopped
        debugTraceLog("Cron possibly running twice : set stop flag to stop the older one");
        self::storeHistory("set stop flag to stop duplicate");
        self::setStopFlag();
        return;
      }
      if ($lastProcessId!=self::$cronProcessId or $lastUniqueId!=self::$cronUniqueId) {
        // Another process is already running with different PID
        // => Stop current one (exit)
        traceLog("Cron possibly running twice");
        debugTraceLog("    current process ID is ".self::$cronProcessId);
        debugTraceLog("    current unique ID is ".self::$cronUniqueId);
        debugTraceLog("    running process ID is ".$lastProcessId);
        debugTraceLog("    running unique ID is ".$lastUniqueId);
        traceLog("    => stopping current Cron");
        self::storeHistory("stop duplicate");
        exit;
      }
    } else {
      // No running flag : no issue, it should be presnet at least at next loop
    }      
  }  
  
 public static function abort() {
  	self::init();
    if (Cron::$cronRequestedStop==false) {
      if (! file_exists("../model/Mail.php") and getcwd()=='/') {
        chdir(__DIR__);
      }
      if (! file_exists("../model/Mail.php")) {
        debugTraceLog("../model/Mail.php not found, current directory is :'".getcwd()."' \nTry to move up with chdir('../')");
        chdir('../');
      }
      errorLog('CRON abnormally stopped');
      debugPrintTraceStack();
      // Try and alert Admin (send mail)
      $dest=pq_trim(Parameter::getGlobalParameter('paramAdminMail'));
      $instance=Parameter::getGlobalParameter('paramDbDisplayName');
      $title="[$instance] Cron abnormally stopped";
      $now=date('Y-m-d H:i:s');
      $msg="Cron was stopped for an undefined reason (abort).<br/>Please check log file at $now for more information.";
      $smtp=Parameter::getGlobalParameter('paramMailSmtpServer');
      self::storeHistory("abort");
      if ($smtp and $dest) {
        $result=sendMail($dest,$title,$msg);
      }
    }
    
    //if (file_exists(self::$runningFile)) {
  	//  unlink(self::$runningFile); // On Abort, preserve Running Flag so that Cron can restart
    //}
    
    //$errorFileName=self::$errorFile.'_'.date('Ymd_His');
    //$mode=(file_exists($errorFileName))?'w':'x';
    //$errorFile=fopen($errorFileName, 'w');
    //fclose($errorFile);  
  } 
  
  public static function removeStopFlag() {
  	self::init();
    if (file_exists(self::$stopFile)) {
      unlink(self::$stopFile);
    }
  }
  
  public static function removeRunningFlag() {
  	self::init();
    if (file_exists(self::$runningFile)) {
      unlink(self::$runningFile);
    }
  }
  public static function removeDeployFlag() {
    if (file_exists(self::$deployFile)) {
      unlink(self::$deployFile);
    }
  }
  public static function removeRestartFlag() {
    if (file_exists(self::$restartFile)) {
      unlink(self::$restartFile);
    }
  }
  public static function setRunningFlag() {
  	self::init();
  	$handle=fopen(self::$runningFile, 'w');
    fwrite($handle,time().self::CRON_DATA_SEPARATOR.self::$cronProcessId.self::CRON_DATA_SEPARATOR.self::$cronUniqueId);
    fclose($handle);
  }
  
  public static function setRestartFlag() {
    self::init();
    self::removeRunningFlag();
    self::removeStopFlag();
    $handle=fopen(self::$restartFile, 'w');
    fwrite($handle,time());
    fclose($handle);
    self::storeHistory("set restart flag");
  }
  
  public static function setStopFlag() {
  	self::init();
    $handle=fopen(self::$stopFile, 'w');
    fclose($handle);
    self::storeHistory("set stop flag");
  }
  
  public static function checkStopFlag() {
  	self::init();
    if (file_exists(self::$stopFile) or file_exists(self::$deployFile)) { 
      traceLog('Cron normally stopped at '.date('d/m/Y H:i:s'));
      Cron::$cronRequestedStop=true;
      self::removeRunningFlag();
      self::removeStopFlag();
      if (file_exists(self::$deployFile)) {
      	traceLog('Cron stopped for deployment. Will be restarted');
      	self::setRestartFlag();
        self::removeDeployFlag();
      }
      return true; 
    } else {
    	return false;
    }
  }
  
  // Restrart already running CRON  !!! NOT WORKING WITHOUT A RELAUNCH !!!
  public static function restart() {
    error_reporting(0);
    //session_write_close();
    if (self::check()=='running') {
      self::setStopFlag();
      sleep(self::getSleepTime());
    }
    self::storeHistory("request restart");
    self::setRestartFlag();
    //self::relaunch(); // FREEZES CURRENT USER
  }
  
	// If running flag exists and cron is not really running, relaunch
	public static function relaunch() {
		self::init();
		Cron::$cronRequestedStop=true; // Mandatory to avoid Abort message if Cron is already running
		if (file_exists(self::$restartFile)) {
			self::removeRestartFlag();
			Cron::$cronRequestedStop=false;
			self::run();
			self::storeHistory("restart (relaunch)");
		} else if (file_exists(self::$runningFile)) {
      $handle=fopen(self::$runningFile, 'r');
      //$last=fgets($handle);
      $lastData=fgets($handle);
      $lastSplit=pq_explode(self::CRON_DATA_SEPARATOR,$lastData);
      $last=$lastSplit[0];
      $now=time();
      fclose($handle);
      if (!$last or !is_numeric($last)) $last=0;
      if ( !$last or ($now-$last) > (60*30)) {
        // not running for more than 30 mn (before we used 5 cycles : dead process)
        self::removeRunningFlag();
        Cron::$cronRequestedStop=false;
        self::storeHistory("start (relaunch)");
        self::run();
      }
		}
	}
	
	public static function run() {
//scriptLog('Cron::run()');	
    self::$cronProcessId=getmypid();
    self::$cronUniqueId=uniqid('',true);
    global $cronnedScript, $i18nMessages, $currentLocale;
    $cronnedScript=true; // Defined and set to be able to force rights on Control() : Cron has all rights.
    self::init();  
    $i18nMessages=null;
    $currentLocale=Parameter::getGlobalParameter ( 'paramDefaultLocale' );
		if (self::check()=='running') {
      errorLog('Try to run cron already running - Exit');
      session_write_close();
      exit;
    }
    $inCronBlockFonctionCustom=true;
    self::removeDeployFlag();
    self::removeRestartFlag();
    projeqtor_set_time_limit(0);
    ignore_user_abort(1);
    error_reporting(0);
    session_write_close();
    error_reporting(E_ERROR);
// BEGIN - ADD BY TABARY - NOTIFICATION SYSTEM
    $cronCheckNotifications=-1;
    if (isNotificationSystemActiv()) {
        $cronCheckNotifications=self::getCheckNotifications();
    }
// END - ADD BY TABARY - NOTIFICATION SYSTEM
// MTY - LEAVE SYSTEM
    $cronCheckLeavesEarned=-1;
    if (isLeavesSystemActiv()) {
        $cronCheckLeavesEarned=self::getCheckLeavesEarned();
    }
// MTY - LEAVE SYSTEM
    $cronCheckDates=self::getCheckDates();
    $cronCheckImport=self::getCheckImport();
    $cronCheckEmails=self::getCheckEmails();
    $cronCheckMailGroup=self::getCheckMailGroup();
    $cronSleepTime=self::getSleepTime();
    self::setActualTimes();
    self::removeStopFlag();
    self::setRunningFlag();
    self::storeHistory("run");
    // PBER Force Cron User
    $cronUser=new User();
    $cronUser->idCalendarDefinition=1;
    $cronUser->idProfile=1;
    $cronUser->resetAllVisibleProjects();
    setSessionUser($cronUser);
    traceLog('Cron started at '.date('d/m/Y H:i:s')); 
    while(1) {
      if (self::checkStopFlag()) {
        self::storeHistory("stop");
        return; 
      }
      self::checkDuplicateRunning();
      Sql::reconnect(); // Force reconnection to avoid "mysql has gone away"
      self::setRunningFlag();
      // CheckDates : automatically raise alerts based on dates
      if ($cronCheckDates>0) {
	      $cronCheckDates-=$cronSleepTime;
	      if ($cronCheckDates<=0) {
	      	try { 
	          self::checkDates();
	      	} catch (Exception $e) {
	      		traceLog("Cron::run() - Error on checkDates()");
	      	}
	        $cronCheckDates=Cron::getCheckDates();
	      }
      }
      // CheckImport : automatically import some files in import directory
      if ($cronCheckImport>0) {
	      $cronCheckImport-=$cronSleepTime;
	      if ($cronCheckImport<=0) {
	      	try { 
	          self::checkImport();
	      	} catch (Exception $e) {
	          traceLog("Cron::run() - Error on checkImport()");
	        }
	        $cronCheckImport=Cron::getCheckImport();
	      }
      }
      // CheckEmails : automatically import notes from Reply to mails
//       try {
//         self::checkEmails();
//       } catch (Exception $e) {
//         traceLog("Cron::run() - Error on checkEmails()");
//       }
      if ($cronCheckEmails>0) {
	      $cronCheckEmails-=$cronSleepTime;
	      if ($cronCheckEmails<=0) {
	        try { 
	          self::checkEmails();
	        } catch (Exception $e) {
	          traceLog("Cron::run() - Error on checkEmails()");
	        }
	        $cronCheckEmails=Cron::getCheckEmails();
	      }
      }
      // CheckEmails : automatically import notes from Reply to mails
      if ($cronCheckMailGroup>0) {
        $cronCheckMailGroup-=$cronSleepTime;
        if ($cronCheckMailGroup<=0) {
          try {
            self::checkMailGroup();
          } catch (Exception $e) {
            traceLog("Cron::run() - Error on checkMailGroup()");
          }
          $cronCheckMailGroup=Cron::getCheckMailGroup();
        }
      }
      
      // Check Database Execution
      foreach (self::$listCronExecution as $key=>$cronExecution){
        if($cronExecution->nextTime===null){
          $cronExecution->calculNextTime();
        }
        $UTC=new DateTimeZone(Parameter::getGlobalParameter ( 'paramDefaultTimezone' ));
        $date=new DateTime('now');
        if($cronExecution->fileExecuted and file_exists($cronExecution->fileExecuted) and $cronExecution->nextTime!=null and $cronExecution->nextTime<=$date->format("U")){
          self::$lastCronTimeExecution = $cronExecution->nextTime;
          self::$lastCronExecution = $cronExecution->cron;
          $cronExecution->calculNextTime();
          call_user_func($cronExecution->fonctionName);
        }
      }
      
      // Check Database Execution for auto send report damian
      foreach (getlistCronAutoSendReport() as $key=>$cronAutoSendReport){
      	if($cronAutoSendReport->nextTime===null){
      		$cronAutoSendReport->calculNextTime();
      	}
      	$UTC=new DateTimeZone(Parameter::getGlobalParameter ( 'paramDefaultTimezone' ));
      	$date=new DateTime('now');
      	$resource = new Resource($cronAutoSendReport->idResource);
      	if($cronAutoSendReport->nextTime!=null && $cronAutoSendReport->nextTime<=$date->format("U")){
      		self::$lastCronTimeAutoSendReport = $cronAutoSendReport->nextTime;
      		self::$lastCronAutoSendReport = $cronAutoSendReport->cron;
      		if($cronAutoSendReport->sendFrequency != 'everyOpenDays'){
      		  $cronAutoSendReport->sendReport($cronAutoSendReport->idReport, $cronAutoSendReport->reportParameter);
      		}else{
      		  if(isOpenDay(date('Y-m-d'), $resource->idCalendarDefinition)){
      		    $cronAutoSendReport->sendReport($cronAutoSendReport->idReport, $cronAutoSendReport->reportParameter);
      		  }
      		}
      		$cronAutoSendReport->calculNextTime();
      	}
      }
      
// BEGIN - ADD BY TABARY - NOTIFICATION SYSTEM
      // CheckNotifications : automatically generate notifications
      if (isNotificationSystemActiv() and $cronCheckNotifications>0 ) {
        $cronCheckNotifications-=$cronSleepTime;
        if ($cronCheckNotifications<=0) {
          try { 
            self::checkNotifications();
          } catch (Exception $e) {
            traceLog("Cron::run() - Error on checkNotifications()");
          }
          $cronCheckNotifications=Cron::getCheckNotifications();
        }
      }
// END - ADD BY TABARY - NOTIFICATION SYSTEM
		
// MTY - LEAVE SYSTEM
      // CheckLeavesEarned : automatically calculed quantity and left for leaves earned
      if (isLeavesSystemActiv() and $cronCheckLeavesEarned>0 ) {
        $cronCheckLeavesEarned-=$cronSleepTime;
        if ($cronCheckLeavesEarned<=0) {
          try { 
            self::checkLeavesEarned();
          } catch (Exception $e) {
            traceLog("Cron::run() - Error on checkLeavesEarned()");
          }
          $cronCheckLeavesEarned=Cron::getCheckLeavesEarned();
        }
      }
// MTY - LEAVE SYSTEM
      
      // Sleep to next check
      sleep($cronSleepTime);
    } // While 1
  }
  
// BEGIN - ADD BY TABARY - NOTIFICATION SYSTEM
  public static function checkNotifications() {      
//scriptLog('Cron::checkNotifications()');
    global $globalCronMode;
    if (!isNotificationSystemActiv()) {return;}
    self::init();
    $globalCronMode=true;  
    // Generates notification from notification Definition
    $notifDef = new NotificationDefinition();
    $crit = array("idle" => '0');
    $lstNotifDef=$notifDef->getSqlElementsFromCriteria($crit);    
    foreach($lstNotifDef as $notifDef) {
        $notifDef->generateNotifications();
    }
  
    // Generates email notification
    $currentDate = date('Y-m-d');
    $currentTime = date('H:i:s');
    $crit = "idle=0 and sendEmail=1 and emailSent=0 and ( notificationDate<'$currentDate' or (notificationDate='$currentDate' and notificationTime<'$currentTime') )";
    $notif = new Notification();
    $lstNotif = $notif->getSqlElementsFromCriteria(null,false,$crit);
    foreach($lstNotif as $notif) {
      $notif->sendEmail();
    }
  }// END - ADD BY TABARY - NOTIFICATION SYSTEM
    
// MTY - LEAVE SYSTEM
  public static function checkLeavesEarned() {      
//scriptLog('Cron::checkLeavesEarned()');
    global $globalCronMode;
    if (!isLeavesSystemActiv()) {return;}
    self::init();
    $globalCronMode=true;  
    
    // Check for all employees
    $employee = new Employee();
    $crit = array("idle" => '0');
    $employeesList = $employee->getSqlElementsFromCriteria($crit);
    foreach($employeesList as $emp) {
        $employees[$emp->id] = $emp->name;
    }
    if (!empty($employees)) {        
        foreach ($employees as $key=>$emp) {
            $res = checkLeaveEarnedEnd($key);
            if ($res=='OK') { 
                $res = checkValidity($key);
                if ($res=='OK') { 
                    $res = checkEarnedPeriod($key);
                    if ($res!='OK') {
                        $msg = "ERROR - Cron - $res";                        
                    }
                } else {
                $msg = "ERROR - Cron - $res";                    
                }
            } else {
                $msg = "ERROR - Cron - $res";
            }
        }
    }
  }
// MTY - LEAVE SYSTEM
  
    public static function checkDates() {
//scriptLog('Cron::checkDates()');
  	global $globalCronMode;
    self::init();
    $globalCronMode=true;  
    $indVal=new IndicatorValue();
    $where="type='delay' and idle=0 and (";
	  // If YEARLY, even if warning and alert have been sent, check if we need to update targetDateTime
    $where.=" ( warningTargetDateTime<='" . date('Y-m-d H:i:s') . "' and (warningSent=0 or code = 'YEARLY'))" ;
    $where.=" or ( alertTargetDateTime<='" . date('Y-m-d H:i:s') . "' and (alertSent=0 or code = 'YEARLY'))" ;
    $where.=")";
    $lst=$indVal->getSqlElementsFromCriteria(null, null, $where);

    foreach ($lst as $indVal) {
      $indVal->checkDates();
    }
  }
  
  public static function checkImport() {
//scriptLog('Cron::checkImport()');
    self::init();
  	global $globalCronMode, $globalCatchErrors;
    $globalCronMode=true;   	
    $globalCatchErrors=true;
  	$importDir=Parameter::getGlobalParameter('cronImportDirectory');
  	$eol=Parameter::getGlobalParameter('mailEol');
  	$cpt=0;
  	$pathSeparator=Parameter::getGlobalParameter('paramPathSeparator');
  	$importSummary="";
  	$importFullLog="";
  	$attachmentArray=array();
  	$boundary = null;
  	$importFileArray=array();
  	if (is_dir($importDir)) {
      if ($dirHandler = opendir($importDir)) {
        while (($file = readdir($dirHandler)) !== false) {
        	if ($file!="." and $file!=".." and filetype($importDir . $pathSeparator . $file)=="file") {
        		$globalCronMode=true; // Cron should not be stopped on error or exception
            $importFile=$importDir . $pathSeparator . $file;            
            $pos=pq_strpos($file,'_');
            if ($pos>0) {
              $timestamp=pq_substr($file,$pos+1).'_'.$cpt;
            } else {
              $timestamp=date('Ymd_his').'_'.$cpt;
            }
            $importFileArray[$timestamp]=$importFile;
        	}
        }
        ksort($importFileArray);
        foreach ($importFileArray as $importFile) {   
          $file=basename($importFile);
          $split=pq_explode('_',$file);
          $class=$split[0];
          $result="";
          try {
            $result=Importable::import($importFile, $class);
          } catch (Exception $e) {
          	$msg="CRON : Exception on import of file '$importFile'";
          	$result="ERROR";
          }
          $globalCronMode=false; // VOLOUNTARILY STOP THE CRON. Actions are requested !
          try {
            if ($result=="OK") {	            	
              $msg="Import OK : file $file imported with no error [ Number of '$class' imported : " . Importable::$cptDone . " ]";
              traceLog($msg);
              $importSummary.="<span style='color:green;'>$msg</span><br/>";
              if (! is_dir($importDir . $pathSeparator . "done")) {
              	mkdir($importDir . $pathSeparator . "done",0777,true);
              	
              }
              rename($importFile,$importDir . $pathSeparator . "done" . $pathSeparator . $file);
            } else {
            	if ($result=="INVALID") {
               	$msg="Import INVALID : file $file imported with " . Importable::$cptInvalid . " control errors [ Number of '$class' imported : " . Importable::$cptOK . " ]";
               	traceLog($msg);
                $importSummary.="<span style='color:orange;'>$msg</span><br/>";
              } else {
            	  $msg="Import ERROR : file $file imported with " . Importable::$cptRejected . " errors [ Number of '$class' imported : " . Importable::$cptOK . " ]";
            	  traceLog($msg);
                $importSummary.="<span style='color:red;'>$msg</span><br/>";
              }
              if (! is_dir($importDir . $pathSeparator . "error")) {
                mkdir($importDir . $pathSeparator . "error",0777,true);
              }
            	rename($importFile,$importDir . $pathSeparator . "error" . $pathSeparator . $file);
            }
          } catch (Exception $e) {
          	$msg="CRON : Impossible to move file '$importFile'";
          	traceLog($msg);
            $importSummary.="<span style='color:red;'>$msg</span><br/>";
          	$msg="CRON IS STOPPED TO AVOID MULTIPLE-TREATMENT OF SAME FILES";
          	traceLog($msg);
            $importSummary.="<span style='color:red;'>$msg</span><br/>";
          	$msg="Check access rights to folder '$importDir', subfolders 'done' and 'error' and file '$importFile'";
          	traceLog($msg);
            $importSummary.="<span style='color:red;'>$msg</span><br/>";
          	exit; // VOLOUNTARILY STOP THE CRON. Actions are requested !
          }
          $globalCronMode=true; // If cannot write log file, do not exit CRON (not blocking)
          $logFile=$importDir . $pathSeparator . 'logs' . $pathSeparator . pq_substr($file, 0, pq_strlen($file)-4) . ".log.htm";
      	  if (! is_dir($importDir . $pathSeparator . "logs")) {
            mkdir($importDir . $pathSeparator . "logs",0777,true);
          }
          if (file_exists($logFile)) {
          	kill($logFile);
          }
          // Write log file
          $fileHandler = fopen($logFile, 'w');
          fwrite($fileHandler, Importable::getLogHeader());
          fwrite($fileHandler, Importable::$importResult);
          fwrite($fileHandler, Importable::getLogFooter());
          fclose($fileHandler);
          // Prepare joined file on email
      	  if (Parameter::getGlobalParameter('cronImportLogDestination')=='mail+log') {
      	  	if (! isset($paramMailerType) or $paramMailerType=='phpmailer') {
      	  		$attachmentArray[]=$logFile;
      	  	} else { // old way to send attachments
        	  	if (! $boundary) {
        	  	  $boundary = md5(uniqid(microtime(), TRUE));
        	  	}
						  $file_type = 'text/html';
              $content = Importable::getLogHeader();
						  $content .= Importable::$importResult;
						  $content .= Importable::getLogFooter();
						  $content = chunk_split(base64_encode($content));       
              $importFullLog .= $eol.'--'.$boundary.$eol;
              $importFullLog .= 'Content-type:'.$file_type.';name="'.basename($logFile).'"'.$eol;
              $importFullLog .= 'Content-Length: ' . pq_strlen($content).$eol;     
              $importFullLog .= 'Content-transfer-encoding:base64'.$eol;
              $importFullLog .= 'Content-disposition: attachment; filename="'.basename($logFile).'"'.$eol; 
              $importFullLog .= $eol.$content.$eol;
              $importFullLog .= '--'.$boundary.$eol;
      	  	}
          }
          $cpt+=1;
        }
        closedir($dirHandler);
      }
    } else {
    	$msg="ERROR - check Cron::Import() - ". $importDir . " is not a directory";
    	traceLog($msg);
      $importSummary.="<span style='color:red;'>$msg</span><br/>";
    }
    if ($importSummary) {
	    $logDest=Parameter::getGlobalParameter('cronImportLogDestination');
	    if (pq_stripos($logDest,'mail')!==false) {
	    	$baseName=Parameter::getGlobalParameter('paramDbDisplayName');
	    	$to=Parameter::getGlobalParameter('cronImportMailList');
	    	if (! $to) {
	    		traceLog("Cron : email requested, but no email address defined");
	    	} else {
		      $message=$importSummary;
		      if (pq_stripos($logDest,'log')!==false) {
		      	$message=Importable::getLogHeader().$message;
		      	if($importFullLog) $message.=$eol.$importFullLog;
		      	Importable::getLogFooter();
		      }
	        $title="[$baseName] Import summary ". date('Y-m-d H:i:s');
	        $resultMail=sendMail($to, $title, $message, null, null, null, $attachmentArray, $boundary);	        
	    	}
	    }
    }
  }
  
  
  public static function checkEmails() {	
  	self::init();
    global $globalCronMode, $globalCatchErrors;
    $globalCronMode=true;     
    $globalCatchErrors=true;
    $checkEmails=Parameter::getGlobalParameter('cronCheckEmails');
    if (!$checkEmails or intval($checkEmails)<=0) {
      return; // disabled
    }
    require_once("../model/ImapMailbox.php"); // Imap management Class
    if (! ImapMailbox::checkImapEnabled()) {
      traceLog("ERROR - Cron::checkEmails() - IMAP extension not enabled in your PHP config. Cannot connect to IMAP Mailbox.");
      return;
    }
    
    $afterMailTreatment = Parameter::getGlobalParameter('afterMailTreatment');
    
    //gautier #inputMailbox
    $inputMb = new InputMailbox();
    $where = "1=1";
    //$lstIMb = $inputMb->getSqlElementsFromCriteria(array('idle'=>'0'));
    $lstIMb = $inputMb->getSqlElementsFromCriteria(null,null,$where, 'sortOrder ASC');
    $paramAttachDir=Parameter::getGlobalParameter('paramAttachmentDirectory');
    $pathSeparator=Parameter::getGlobalParameter('paramPathSeparator');
    if (pq_substr($paramAttachDir, -1)!=$pathSeparator) $paramAttachDir.=$pathSeparator;
    $uploaddirMail = $paramAttachDir . "emails" . $pathSeparator;
    $uploaddirAttach = $paramAttachDir;
    if (! file_exists($uploaddirMail)) {
      mkdir($uploaddirMail,0777,true);
    }
    
    $imapFilterCriteria=Parameter::getGlobalParameter('imapFilterCriteria');
    if (! $imapFilterCriteria) { $imapFilterCriteria='UNSEEN UNDELETED'; }
    if (file_exists ( $uploaddirMail )) {
      purgeFiles ( $uploaddirMail, null );
    }
    foreach ($lstIMb as $mb){ 
      if($mb->idle==1 and $mb->autoclosedReason !="connexion")continue;
      $mb->_noHistory=true; // Do no store history for cronned operation
      if($mb->autoclosedDateTime  and $mb->autoclosedReason=="connexion" and $mb->idle==1){
        //$now = date('Y-m-d H:i:s');
        $dateClosed = $mb->autoclosedDateTime;
        $now=time();
        $oneHourAgo=$now-3600;
        $oneHourAgoDate=date("Y-m-d H:i:s",$oneHourAgo);
        if($mb->idle==1 and $dateClosed < $oneHourAgoDate){
          $mb->idle = 0;
          $mb->autoclosedDateTime = null;
          $mb->autoclosedReason = null;
          $mb->failedRead=0;
          $mb->save();
        }else{
          continue;
        }
      }
      $actionOK = $mb->actionOK;
      $actionKO = $mb->actionKO;
      $inputMailbox = new ImapMailbox($mb->serverImap,$mb->imapUserAccount,decryptPwd($mb->pwdImap),$uploaddirMail,'utf-8');
      $mails = array();
      enableCatchErrors();
      $mailsIds = null;
      try {
        $mailsIds = $inputMailbox->searchMailBox($imapFilterCriteria);
      }catch (Exception $e) {
        $mb->failedRead += 1;
        if($mb->failedRead >= 5) {
          $mb->idle = 1;
          $mb->autoclosedReason = "connexion";
          $mb->autoclosedDateTime = date ( "Y-m-d H:i:s" );
          $mb->save();
          $receivers = array();
          $prof=new Profile();
          $user = new User();
          $crit=array('profileCode'=>'ADM');
          $lstProf=$prof->getSqlElementsFromCriteria($crit,false);
          foreach ($lstProf as $prof) {
            $crit=array('idProfile'=>$prof->id);
            $lstUsr=$user->getSqlElementsFromCriteria($crit,false);
            foreach($lstUsr as $usr) {
              $receivers[]=$usr;
            }
          }
          $title = "Cannot connect to mailbox";
          $content = pq_mb_substr(imap_last_error().(($mb->idle)?' - mailbox closed':''),0,200).' ,next try in 1 hour.';
          $name = "Cannot connect to mailbox #".$mb->id;
          sendNotification($receivers, $mb, "ALERT", $title, $content, $name);
        }
        $resMb=$mb->save();
        debugTraceLog("[IMB#$mb->id] ImapMailbox($mb->serverImap,$mb->imapUserAccount,$mb->pwdImap,$uploaddirMail,'utf-8')");
        errorLog("Error connecting to Mailbox $mb->serverImap for $mb->imapUserAccount");
        errorLog(imap_last_error());
        $inputMailboxHistory = new InputMailboxHistory();
        $inputMailboxHistory->idInputMailbox = $mb->id;
        $inputMailboxHistory->title = "Cannot connect to mailbox";
        $inputMailboxHistory->adress = "Cannot connect to mailbox";
        $inputMailboxHistory->date = date("Y-m-d H:i:s");
        $inputMailboxHistory->result = pq_mb_substr(imap_last_error().(($mb->idle)?' - mailbox closed':''),0,200);
        $inputMailboxHistory->save();
        unset($inputMailbox);
        continue;
      }
      disableCatchErrors();
      if(!$mailsIds) {
        debugTraceLog("[IMB#$mb->id] Mailbox #$mb->id $mb->serverImap for $mb->imapUserAccount is empty (filter='$imapFilterCriteria')"); // Will be a debug level trace
        if ($mb->failedRead>0) {
          $mb->failedRead=0;
          $resMb=$mb->save();
        }
        unset($inputMailbox);
        continue;
      }
      $failMessageLimit = false;
      foreach ($mailsIds as $mailId){
        if($mb->idle==1) break;
        $result = "";
        $resultTicket=null;
        $failMessage = false;
        $mail = $inputMailbox->getMail($mailId);
        $mailTo = array_merge_preserve_keys($mail->to,$mail->cc);
        $mailFrom = $mail->fromAddress;      
        $limitOfInputPerHour = $mb->limitOfInputPerHour;
        $inputHistory = new InputMailboxHistory();
        $now = date('Y-m-d H:i:s');
        $date = new DateTime($now);
        $date->sub(new DateInterval('PT1H'));
        $date = date_format($date, 'Y-m-d H:i:s');
        $where =  " idInputMailbox = ".$mb->id." and date >='" . $date . "'" ;
        $nbInputHistory = $inputHistory->countSqlElementsFromCriteria(null,$where);
        if($nbInputHistory >= $limitOfInputPerHour){
          $mb->idle=1;
          $result.= i18n('colLimitOfInputPerHour');
          $failMessage = true;
          $failMessageLimit = true;
          $mb->autoclosedReason = "toomany";
          $mb->autoclosedDateTime = date ( "Y-m-d H:i:s" );
          $mb->save();
          //send notification
          $receivers = array();
          $prof=new Profile();
          $user = new User();
          $crit=array('profileCode'=>'ADM');
          $lstProf=$prof->getSqlElementsFromCriteria($crit,false);
          foreach ($lstProf as $prof) {
            $crit=array('idProfile'=>$prof->id);
            $lstUsr=$user->getSqlElementsFromCriteria($crit,false);
            foreach($lstUsr as $usr) {
              $receivers[]=$usr;
            }
          }
          $title = 'inputMailbox #'.$mb->id.' closed';
          $content = i18n('colLimitOfInputPerHour');
          $name = ' inputMailbox #'.$mb->id.' closed';
          sendNotification($receivers, $mb, "WARNING", $title, $content, $name);
        }        
        $securityConstraint = $mb->securityConstraint;
        if($securityConstraint == '2' or $securityConstraint == '3'){
          //$emailExist = SqlElement::getSingleSqlElementFromCriteria('Affectable', array('email'=>$mail->fromAddress));
          $emailExist=Affectable::getAffectableFromEmail($mail->fromAddress);
          if(! $emailExist->id){
            $result= i18n('securityConstraint2');
          }
          if($securityConstraint == '3' and $emailExist->id){
            $aff= new Affectation();
            $affExist = $aff->countSqlElementsFromCriteria(array('idResource'=>$emailExist->id,'idProject'=>$mb->idProject));
            if($affExist<1) $result=i18n('securityConstraint3');
          }
        }
        
        if(!$mail->subject) $result=i18n('noSubject');
        $bodyHtml=$mail->textHtml;
        $body=$mail->textPlain;
        $subject=$mail->subject;
        if ($bodyHtml) {
        	$toText=new Html2Text($bodyHtml);
        	$body=$toText->getText();
        }
        $encodings = [
        "UTF-8",
        "Windows-1252",
        "ISO-8859-15",
        "ISO-8859-1",
        "ASCII"
        		];
        $subjectEncoding=mb_detect_encoding($subject, $encodings, false);
        if ($subjectEncoding==false) {
        	debugTraceLog("[IMB#$mb->id] Read Mailbox : cannot find encoding for message");
        	debugTraceLog("[IMB#$mb->id] $subject");
        } else if ($subjectEncoding!='UTF-8') {
        	$subject=mb_convert_encoding($subject,'UTF-8',$subjectEncoding);
        }
        $subject=InputMailbox::convertEmojis($subject);

        $class=null;
        $id=null;
        $msg=null;
        $senderId=null;
        $obj=null;
        // Class and Id of object
        $headerClass=pq_substr($subject, pq_strpos($subject, '[')+1, (pq_strpos($subject, ']')-1)-pq_strpos($subject, '['));
        $posClass=pq_strpos($body,'directAccess=true&objectClass=');
        if (! $posClass) $posClass=pq_strpos($body,'directAccess=true&amp;objectClass=');
        $arrayHeader = pq_explode(' ', $headerClass);
        $class = (isset($arrayHeader[0]))?$arrayHeader[0]:'';
        $id = (isset($arrayHeader[1]))?pq_substr($arrayHeader[1], 1):'';
        if(SqlElement::class_exists($class) and is_numeric($id)) $obj=new $class($id);
        if(!SqlElement::class_exists($class) or !$obj){
          if ($posClass) { // It is a ProjeQtor mail
          	$posId=pq_strpos($body,'&objectId=',$posClass);
          	if (! $posId) $posId=pq_strpos($body,'&amp;objectId=',$posClass);
          	if (! $posId) {
          	  debugTraceLog("[IMB#$mb->id] Message identified as response to Projeqtor email (but cannot find start of objectId)");
          	  if($actionKO){
          	    switch ($actionKO){
          	      case 'NONE':
          	        $inputMailbox->markMailAsUnread($mailId);
          	        break;
          	      case 'READ':
          	        $inputMailbox->markMailAsRead($mailId);
          	        break;
          	      case 'DELETE':
          	        $inputMailbox->deleteMail($mailId);
          	        break;
          	    }
          	  }
          	  continue;
          	}
          	$posEnd=pq_strpos($body,'>',$posId);
          	if (!$posEnd or $posEnd-$posId>22) {
          		$posEnd=pq_strpos($body,']',$posId);
          	}
          	if (!$posEnd or $posEnd-$posId>22) {
          		$posEnd=pq_strpos($body," ",$posId);
          	}
          	if (!$posEnd or $posEnd-$posId>22) {
          		$posEnd=pq_strpos($body,"\n",$posId);
          	}
          	if (!$posEnd or $posEnd-$posId>22) {
          		$posEnd=pq_strpos($body,"\r",$posId);
          	}
          
          	if (!$posEnd or $posEnd-$posId>22) {
          		if (pq_strlen($body)-$posId<20) {
          			$posEnd=pq_strlen($body)-1;
          			$testId=pq_substr($body,$posId+10);
          			if (! is_int($testId)) {
          				$posEnd=null;
          			}
          		}
          	}
          	if (! $posEnd or $posEnd-$posId>22) {
          		debugTraceLog("[IMB#$mb->id] Message identified as response to Projeqtor email (but cannot find end of objectId)");
          		if($actionKO){
          		  switch ($actionKO){
          		    case 'NONE':
          		      $inputMailbox->markMailAsUnread($mailId);
          		      break;
          		    case 'READ':
          		      $inputMailbox->markMailAsRead($mailId);
          		      break;
          		    case 'DELETE':
          		      $inputMailbox->deleteMail($mailId);
          		      break;
          		  }
          		}
          		continue;
          	}
          	$class=pq_substr($body,$posClass+30,$posId-$posClass-30);
          	$id=pq_substr($body,$posId+10,$posEnd-$posId-10);
          }
        }
        // Search end of Message (this is valid for text only, treatment of html messages would require other code)
        $posEndMsg=strrpos($body,"###PROJEQTOR###");
        if($posEndMsg){
        	$checkThunderAndGmail=pq_strpos($body,"\r\n>");
        	//$checkSeparator=pq_strpos($body,"____________________");
        	if($checkThunderAndGmail and $checkThunderAndGmail<$posEndMsg){
        		$posEndMsg=$checkThunderAndGmail;
        		$posEndMsg=strrpos(pq_substr($body,0,$posEndMsg-20), "\r\n");// Search for Thunderbird and Gmail
        	}else{
        		$substrEndBody=pq_substr($body,0,$posEndMsg);
        		$posStartTag=strrpos($substrEndBody,"\n");
        		$substrRow=pq_substr($body,0,$posStartTag-2);
        		$posEndMsg=strrpos($substrRow,"\n");
        	}
        	$msg=pq_substr($body,0,$posEndMsg);
        }else{
          $msg=$body;
        }
        if (!pq_trim ($msg)) { // Message not received with previous methods, try another one
        	$posEndMsg=strrpos(pq_substr($body,0,$posClass), "\n");
        	$posDe=strrpos(pq_substr($body,0,$posEndMsg), "De : ");
        	if ($posDe>2) {
        		$posEndMsg=$posDe-1;
        	}
        	else {
        		$posDe=strrpos(pq_substr($body,0,$posEndMsg), "From : ");
        		if ($posDe>2) {
        			$posEndMsg=$posDe-1;
        		}
        	}
        	$msg=pq_substr($body,0,$posEndMsg);
        }
        //florent
        $signIdent=Parameter::getGlobalParameter('paramSignatureAndTagToRemove');
        if(pq_trim($signIdent)!=''){
        	$posRemoveMsg=pq_strpos($body,$signIdent);
        	if(pq_trim($posRemoveMsg)){
        		$msg=pq_trim(pq_substr($body,0,$posRemoveMsg));
        	}
        }
        // Remove unexpected "tags" // Valid as long as we treat emails as text
        $msg=preg_replace('/<mailto.*?\>/','',pq_nvl($msg));
        $msg=preg_replace('/<http.*?\>/','',pq_nvl($msg));
        $msg=preg_replace('/<#[A-F0-9\-]*?\>/','',pq_nvl($msg));
        $msg=pq_str_replace(" \r\n","\r\n",$msg);
        $msg=pq_str_replace(" \r\n","\r\n",$msg);
        $msg=pq_str_replace(" \n","\n",$msg);
        $msg=pq_str_replace(" \n","\n",$msg);
        $msg=pq_str_replace("\n\n\n","\n\n",$msg);
        $msg=pq_str_replace("\n\n\n","\n\n",$msg);
        // Sender
        $sender=$mail->fromAddress;
        //$crit=array('email'=>$sender);
        //$usr=new Affectable();
        //$usrList=$usr->getSqlElementsFromCriteria($crit,false,null,'idle asc, isUser desc, isResource desc');
        //if (count($usrList)) {
        //	$senderId=$usrList[0]->id;
        //}
        $usr=Affectable::getAffectableFromEmail($sender);
        $senderId=$usr->id;
        debugTraceLog("[IMB#$mb->id] User corresponding to email address is #$senderId");
        if (! $senderId and $securityConstraint!='1') {
        	traceLog("#$mb->id - Email message received from '$sender', not recognized as resource or user or contact : message not stored as new ticket to avoid spamming");
        	if($actionKO){
        	  switch ($actionKO){
        	    case 'NONE':
        	      $inputMailbox->markMailAsUnread($mailId);
        	      break;
        	    case 'READ':
        	      $inputMailbox->markMailAsRead($mailId);
        	      break;
        	    case 'DELETE':
        	      $inputMailbox->deleteMail($mailId);
        	      break;
        	  }
        	  $result=i18n("errorMailSender",array($sender));
        	  if ($actionKO!='NONE') InputMailboxHistory::storeHistory($mb->id,$mail->subject, $mailFrom,$result,true);
        	  continue;
        	}
        }
        $arrayFrom=array("\n","\r"," ");
        $arrayTo=array("","","");
        $class=pq_str_replace($arrayFrom, $arrayTo, $class);
        $id=pq_str_replace($arrayFrom, $arrayTo, $id);
        $id=pq_str_replace(']','',$id);
        $obj=null;
        if (SqlElement::class_exists($class) and is_numeric($id)) {
        	$obj=new $class($id);
        	debugTraceLog("[IMB#$mb->id] Message identified as reply to message from $class #$id");
        }
        if (!pq_trim($msg)) {
          if ($obj and $obj->id) traceLog("[IMB#$mb->id] Could not retreive response (empty response) from '$sender' mail concerning $class #$id");
          else traceLog("[IMB#$mb->id] Could not retreive message from '$sender' mail");
        	debugTraceLog("[IMB#$mb->id] $body");
        	if($actionKO){
        	  switch ($actionKO){
        	    case 'NONE':
        	      $inputMailbox->markMailAsUnread($mailId);
        	      break;
        	    case 'READ':
        	      $inputMailbox->markMailAsRead($mailId);
        	      break;
        	    case 'DELETE':
        	      $inputMailbox->deleteMail($mailId);
        	      break;
        	  }
        	  $result=i18n("errorMailMessage",array($sender));
        	  if ($actionKO!='NONE') InputMailboxHistory::storeHistory($mb->id,$mail->subject, $mailFrom,$result,true);
        	}        	
        	continue;
        }
        // Case 1 => answer to mail sent from projeqtor : add message as note to item
        if ($obj and $obj->id and $result) {
          debugTraceLog ("[IMB#$mb->id] note not stored : $result");
          if($actionKO){
            switch ($actionKO){
              case 'NONE':
                $inputMailbox->markMailAsUnread($mailId);
                break;
              case 'READ':
                $inputMailbox->markMailAsRead($mailId);
                break;
              case 'DELETE':
                $inputMailbox->deleteMail($mailId);
                break;
            }
            if ($actionKO!='NONE') InputMailboxHistory::storeHistory($mb->id,$mail->subject, $mailFrom,$result);
          }
          continue;
        }
        if ($obj and $obj->id and !$result) {
          if (!$senderId) $senderId=getCurrentUserId();
        	if (substr_count($msg,"\r\n")==2*substr_count($msg,"\r\n\r\n")) {
        		$msg=pq_str_replace("\r\n\r\n","\r\n",$msg); // Remove double lines as all are double
        	}
        	$note=new Note();
        	$note->refType=$class;
        	$note->refId=$id;
        	$note->idPrivacy=1;
        	$note->note=nl2brForPlainText($msg);
        	$note->idUser=$senderId;
        	$note->creationDate=date('Y-m-d H:i:s');
        	$note->fromEmail=1;
        	$resSaveNote=$note->save();
          $status=getLastOperationStatus($resSaveNote);
        	if ($status=='OK') {
        		debugTraceLog("[IMB#$mb->id] Note from '$sender' added on $class #$id");
        		if($mb->addToFollowUp){
        		  $sender=$mail->fromAddress;
        		  //$crit=array('email'=>$sender);
        		  //$usr=new Affectable();
        		  //$usrList=$usr->getSqlElementsFromCriteria($crit,false,null,'idle asc, isUser desc, isResource desc');
        		  //if (count($usrList)) {
        		  //  $senderId=$usrList[0]->id;
        		  //}
//         		  $usr=Affectable::getAffectableFromEmail($sender);
//         		  $senderId=$usr->email;
//         		  $mailToString = ($mailFrom != $mb->imapUserAccount)?"'$mailFrom',":"";
//         		  foreach ($mailTo as $email=>$key){
//         		    if($email != $mb->imapUserAccount)$mailToString .= "'$email',";
//         		  }
//         		  $mailToString = ($mailToString)?pq_substr($mailToString, 0, -1):$mailToString;
//         		  $where = "email in ($mailToString)";
//         		  $usr=new Affectable();
//         		  $usrList=$usr->getSqlElementsFromCriteria(null,false,$where,'idle asc, isUser desc, isResource desc');
        		  $usrList=array();
        		  if ($mailFrom != $mb->imapUserAccount) {
        		    $aff=Affectable::getAffectableFromEmail($mailFrom);
        		    if ($aff->id) $usrList[]=$aff;
        		  }
        		  foreach ($mailTo as $email=>$key){
        		    $aff=Affectable::getAffectableFromEmail($email);
        		    if ($aff->id) $usrList[]=$aff;
        		  }
        		  foreach ($usrList as $affectable){
        		    $sub = new Subscription();
        		    $sub->idAffectable=$affectable->id;
        		    $sub->refType=$class;
        		    $sub->refId=$id;
        		    $sub->idUser=$senderId;
        		    $sub->creationDateTime=date('Y-m-d H:i:s');
        		    $sub->save();
        		  }
        		}
        	} else {
        		traceLog("ERROR saving note from '$sender' to item $class #$id : $resSaveNote");
        		InputMailboxHistory::storeHistory($mb->id,$mail->subject, $mailFrom,$resSaveNote);
        	}       	
        	$mailResult=$obj->sendMailIfMailable(false,false,false,false,true,false,false,false,false,false,false,true);
        }
        // Case 2 => new mail received : add new ticket
        if (!SqlElement::class_exists($class) or !$obj) {
          $bodyHtml=$mail->textHtml;
          $body=$mail->textPlain;
          $encodings = [
          "UTF-8",
          "Windows-1252",
          "ISO-8859-15",
          "ISO-8859-1",
          "ASCII"
          		];
          $bodyEncoding=mb_detect_encoding($bodyHtml, $encodings, false);
          if ($bodyEncoding==false) {
          	debugTraceLog("[IMB#$mb->id] Read Mailbox : cannot find encoding for message");
          	debugTraceLog("[IMB#$mb->id] $bodyHtml");
          } else if ($bodyEncoding!='UTF-8') {
          	$bodyHtml=mb_convert_encoding($bodyHtml,'UTF-8',$bodyEncoding);
          }
          $bodyHtml=InputMailbox::convertEmojis($bodyHtml);
          $ticket = new Ticket();
          if($result == ""){
          	$ticket->name = pq_mb_substr($mail->subject,0,100);
          	$ticket->idProject = $mb->idProject;
          	$ticket->idTicketType = $mb->idTicketType;
          	$ticket->idActivity = $mb->idActivity;
          	$ticket->idResource = $mb->idAffectable;
          	$ticket->externalReference = $mailFrom;
          	if(pq_trim($bodyHtml)) $ticket->description = $bodyHtml;
          	else $ticket->description = $body;
          	$idStatus = SqlElement::getFirstSqlElementFromCriteria('Status', array('isCopyStatus'=>'1'));
          	$ticket->idStatus = $idStatus->id;
          	//user know as contact
          	//$res = new Resource();
          	//$knowUser = $res->getSingleSqlElementFromCriteria('Affectable',array('email'=>$mailFrom));
          	$knownUser=Affectable::getAffectableFromEmail($mailFrom);
          	if($knownUser and $knownUser->id and $knownUser->isContact) $ticket->idContact = $knownUser->id;
          	if($knownUser and $knownUser->id and $knownUser->isUser) $ticket->idUser = $knownUser->id;
          	// Transaction mode required for PostgreSql
          	Sql::beginTransaction();
          	$resultTicket=$ticket->save();
          	if (getLastOperationStatus($resultTicket)=='OK') {
          	  Sql::commitTransaction();
          	} else {
          	  Sql::rollbackTransaction();
          	}
          	if(getLastOperationStatus($resultTicket)=='OK' and $mb->addToFollowUp){        	  
          	  $sender=$mail->fromAddress;
          	  //$crit=array('email'=>$sender);
          	  //$usr=new Affectable();
          	  //$usrList=$usr->getSqlElementsFromCriteria($crit,false,null,'idle asc, isUser desc, isResource desc');
          	  //if (count($usrList)) {
          	  //  $senderId=$usrList[0]->id;
          	  //}
              $usr=Affectable::getAffectableFromEmail($sender);
              $senderId=$usr->id;
          	  //$mailToString = ($mailFrom != $mb->imapUserAccount)?"'$mailFrom',":"";
          	  //foreach ($mailTo as $email=>$key){
          	  //  if($email != $mb->imapUserAccount)$mailToString .= "'$email',";
          	  //}
          	  //$mailToString = ($mailToString)?pq_substr($mailToString, 0, -1):$mailToString;
          	  //$where = "email in ($mailToString)";
          	  //$usr=new Affectable();
          	  //$usrList=$usr->getSqlElementsFromCriteria(null,false,$where,'idle asc, isUser desc, isResource desc');
          	  $usrList=array();
          	  if ($mailFrom != $mb->imapUserAccount) {
          	    $aff=Affectable::getAffectableFromEmail($mailFrom);
          	    if ($aff->id) $usrList[]=$aff;
          	  }
          	  foreach ($mailTo as $email=>$key){
          	    $aff=Affectable::getAffectableFromEmail($email);
          	    if ($aff->id) $usrList[]=$aff;
          	  }
          	  foreach ($usrList as $affectable){
          	    $sub = new Subscription();
          	    $sub->idAffectable=$affectable->id;
          	    $sub->refType='Ticket';
          	    $sub->refId=$ticket->id;
          	    $sub->idUser=$senderId;
          	    $sub->creationDateTime=date('Y-m-d H:i:s');
          	    $sub->save();
          	  }
          	}
          	if(getLastOperationStatus($resultTicket)=='OK') {
          	  // New set to status recorded
          	  $idStatus = SqlElement::getFirstSqlElementFromCriteria('Status', array('idle'=>'0'));
          	  $ticket->idStatus = $idStatus->id;
          	  $ticket->save();
          	} 
          	
          	if(getLastOperationStatus($resultTicket)=='OK' and $mb->allowAttach==1){
          		$sizeAttach = ($mb->sizeAttachment)*1024*1024;
          		$listAtt = $mail->getAttachments();
          		foreach ($listAtt as $att){
          			$attch = new Attachment();
          			$attch->refType = 'Ticket';
          			$attch->refId = $ticket->id;
          			$attch->idPrivacy=1;
          			$attch->type='file';
          			$namefileWithPath = $att->filePath;
          			$embededImg='src="cid:'.$att->id.'"';
          			if (pq_strpos($ticket->description, $embededImg)!=0) {
          				// This is an embeded image, do not save as attachment but as image embeded
          				rename($att->filePath, '../files/images/'.$att->id);
          				$ticket->description=pq_str_replace($embededImg, 'src="../files/images/'.$att->id.'"', $ticket->description);
          				$ticket->_noHistory=true;
          				$ticket->save();
          				continue; // Do not trat as attachment
          			}
          			$attch->fileName = $att->name;
          			$ext = pq_strtolower ( pathinfo ( $attch->fileName, PATHINFO_EXTENSION ) );
          			if (pq_substr($ext,0,3)=='php' or pq_substr($ext,0,3)=='pht' or pq_substr($ext,0,3)=='sht' or $ext=='phar' or $ext=='pgif') {
          				$attch->fileName.='.projeqtor.txt';
          			}
          			$attch->creationDate = date('Y-m-d H:i:s');
          			$attch->fileSize = filesize($att->filePath);
          			$attch->mimeType = mime_content_type($att->filePath);
          			if($sizeAttach-$attch->fileSize > 0){
          				$attch->save();
          				$sizeAttach-=$attch->fileSize;
          			} else {
          				break;
          			}
          			$uploaddir = $uploaddirAttach . "attachment_" . $attch->id . $pathSeparator;
          			if (! file_exists($uploaddir)) {
          				mkdir($uploaddir,0777,true);
          			}
          			$paramFilenameCharset=Parameter::getGlobalParameter('filenameCharset');
          			if ($paramFilenameCharset) {
          				$uploadfile = $uploaddir . iconv("UTF-8", $paramFilenameCharset.'//TRANSLIT//IGNORE',$attch->fileName);
          			} else {
          				$uploadfile = $uploaddir . $attch->fileName;
          			}
          			if ( ! rename($namefileWithPath, $uploadfile)) {
          				$error = htmlGetErrorMessage(i18n('errorUploadFile',array('hacking')));
          				errorLog($error);
          				$attch->delete();
          			} else {
          				$attch->subDirectory = pq_str_replace(Parameter::getGlobalParameter('paramAttachmentDirectory'),'${attachmentDirectory}',$uploaddir);
          				$otherResult=$attch->save();
          			}
          		}
          	}
          }
          $inputMailboxHistory = new InputMailboxHistory();
          $inputMailboxHistory->idInputMailbox = $mb->id;
          $inputMailboxHistory->title = pq_mb_substr($mail->subject,0,200);
          $inputMailboxHistory->adress = $mailFrom;
          $inputMailboxHistory->date = date("Y-m-d H:i:s");
          if($result == "" and getLastOperationStatus($resultTicket)=='OK'){
          	$result = i18n('ticketInserted').' : #'.$ticket->id;
          }else{
          	$result = pq_mb_substr(i18n('ticketRejected').' : '.(($result!=='')?$result:strip_tags(getLastOperationMessage($resultTicket))),0,200);
          	$failMessage=true;
          }
          $inputMailboxHistory->result = pq_mb_substr($result,0,200);
          $saveHisto=$inputMailboxHistory->save();
          if (getLastOperationStatus($saveHisto)!='OK') debugTraceLog("[IMB#$mb->id] Error saving InputMailboxHistory : $saveHisto");
          if(! $failMessageLimit){
            $action=($failMessage)?$actionKO:$actionOK;
            if($action){
              switch ($action){
                case 'NONE':
                  $inputMailbox->markMailAsUnread($mailId);
                  break;
                case 'READ':
                  $inputMailbox->markMailAsRead($mailId);
                  break;
                case 'DELETE':
                  $inputMailbox->deleteMail($mailId);
                  break;
              }
              continue;
            }
          } else {
          	$inputMailbox->markMailAsUnread($mailId);
          	continue;
          }
          if(!$failMessage){
          	$mb->lastInputDate = date("Y-m-d H:i:s");
          	$mb->idTicket = $ticket->id;
          	$mb->totalInputTicket += 1;
          }
          $mb->failedRead=0;
          $resMb=$mb->save();
        }else{
          $inputMailboxHistory = new InputMailboxHistory();
          $inputMailboxHistory->idInputMailbox = $mb->id;
          $inputMailboxHistory->title = $mail->subject;
          $inputMailboxHistory->adress = $mailFrom;
          $inputMailboxHistory->date = date("Y-m-d H:i:s");
          if($result == "" and getLastOperationStatus($resultTicket)=='OK'){
          	$result = i18n('noteAddFromMail', array($class, $id));
          }
          $inputMailboxHistory->result = $result;
          $inputMailboxHistory->save();
        }
        if($actionOK){
          $inputMailbox->markMailAsUnread($mailId);
          switch ($actionOK){
            case 'READ':
              $inputMailbox->markMailAsRead($mailId);
              break;
            case 'DELETE':
              $inputMailbox->deleteMail($mailId);
              break;
          }
        }
      }
      unset($inputMailbox);
    }
    if (file_exists ( $uploaddirMail )) {
      purgeFiles ( $uploaddirMail, null );
    }
    //end gautier
    
		// IMAP must be enabled in Mail Settings
		$emailEmail=Parameter::getGlobalParameter('cronCheckEmailsUser');
		$emailPassword=decryptPwd(Parameter::getGlobalParameter('cronCheckEmailsPassword'));
		//$emailAttachmentsDir=dirname(__FILE__) . '/../files/attach';
		$paramAttachDir=Parameter::getGlobalParameter('paramAttachmentDirectory');
		$pathSeparator=Parameter::getGlobalParameter('paramPathSeparator');
		if (pq_substr($paramAttachDir,0,2)=='..') {
		  $curdir=dirname(__FILE__);
		  $paramAttachDir=pq_str_replace(array('/model','\model'),array('',''),$curdir).pq_substr($paramAttachDir,2);
		}
		$emailAttachmentsDir=((pq_substr($paramAttachDir,-1)=='\\' or pq_substr($paramAttachDir,-1)=="/")?$paramAttachDir:$paramAttachDir.$pathSeparator).'emails';
		if (! file_exists($emailAttachmentsDir)) {
		  mkdir($emailAttachmentsDir,0777,true);
		}
		$emailHost=Parameter::getGlobalParameter('cronCheckEmailsHost'); // {imap.gmail.com:993/imap/ssl}INBOX';
		if (! $emailHost) {
		  if(isset($lstIMb)){
		    if(count($lstIMb)==0){
			   traceLog("IMAP connection string not defined");
		    }
		  }
			return;
		}
		$mailbox = new ImapMailbox($emailHost, $emailEmail, $emailPassword, $emailAttachmentsDir,'utf-8');
		$mails = array();
		// Get some mail
		//$mailsIds = $mailbox->searchMailBox('UNSEEN UNDELETED');
		$mailsIds = $mailbox->searchMailBox($imapFilterCriteria);
		if(!$mailsIds) {
		  debugTraceLog("[GP] Mailbox $emailHost for $emailEmail is empty (filter='$imapFilterCriteria')"); // Will be a debug level trace
		  unset($mailbox);
		  return;
		}
	  foreach ($mailsIds as $mailId) {
  		$mail = $mailbox->getMail($mailId);
  		$mailbox->markMailAsUnread($mailId);
  		$body=$mail->textPlain;
  		$bodyHtml=$mail->textHtml;
  		if ($bodyHtml) {		
  		  $toText=new Html2Text($bodyHtml);
  			$body=$toText->getText();
  		}
  		$encodings = [
  		"UTF-8",
  		"Windows-1252",
  		"ISO-8859-15",
  		"ISO-8859-1",
  		"ASCII"
  				];
  		$subject = $mail->subject;
  		$subjectEncoding=mb_detect_encoding($subject, $encodings, false);
  		if ($subjectEncoding==false) {
  			debugTraceLog("[GP] Read Mailbox : cannot find encoding for message");
  			debugTraceLog("[GP] $subject");
  		} else if ($subjectEncoding!='UTF-8') {
  			$subject=mb_convert_encoding($subject,'UTF-8',$subjectEncoding);
  		}
  		$subject=InputMailbox::convertEmojis($subject);
  		$class=null;
  		$id=null;
  		$msg=null;
  		$senderId=null;	
  		// Class and Id of object
  		$headerClass=pq_substr($subject, pq_strpos($subject, '[')+1, (pq_strpos($subject, ']')-1)-pq_strpos($subject, '['));
  		$posClass=pq_strpos($body,'directAccess=true&objectClass=');
  		if (! $posClass) $posClass=pq_strpos($body,'directAccess=true&amp;objectClass=');
  		$arrayHeader = pq_explode(' ', $headerClass);
        $class = (isset($arrayHeader[0]))?$arrayHeader[0]:'';
        $id = (isset($arrayHeader[1]))?pq_substr($arrayHeader[1], 1):'';
        if(SqlElement::class_exists($class) and is_numeric($id))$obj=new $class($id);
        if(!SqlElement::class_exists($class) or !$obj){
    		$posClass=pq_strpos($body,'directAccess=true&objectClass=');
    		if (! $posClass) $posClass=pq_strpos($body,'directAccess=true&amp;objectClass=');
    		if ($posClass) { // It is a ProjeQtor mail
    		  $posId=pq_strpos($body,'&objectId=',$posClass);
    		  if (! $posId) $posId=pq_strpos($body,'&amp;objectId=',$posClass);
    		  if (! $posId) {
    		    //debugTraceLog(pq_substr($body,$posClass,100));
    		    if(!$afterMailTreatment or $afterMailTreatment == 'markAsReadMail'){
    		    	$mailbox->markMailAsRead($mailId);
    		    }else{
    		    	$mailbox->deleteMail($mailId);
    		    }
    		    continue;
    		  }
    		  $posEnd=pq_strpos($body,'>',$posId);
    		  if (!$posEnd or $posEnd-$posId>22) {
    		    $posEnd=pq_strpos($body,']',$posId);
    		  }
    		  if (!$posEnd or $posEnd-$posId>22) {
    		    $posEnd=pq_strpos($body," ",$posId);
    		  }
    		  if (!$posEnd or $posEnd-$posId>22) {
    		    $posEnd=pq_strpos($body,"\n",$posId);
    		  }
    		  if (!$posEnd or $posEnd-$posId>22) {
    		    $posEnd=pq_strpos($body,"\r",$posId);
    		  }
  
    		  if (!$posEnd or $posEnd-$posId>22) {
    		    if (pq_strlen($body)-$posId<20) {
    		      $posEnd=pq_strlen($body)-1;
    		      $testId=pq_substr($body,$posId+10);
    		      if (! is_int($testId)) {
    		        $posEnd=null;
    		      }
    		    }
    		  }
    		  if (! $posEnd or $posEnd-$posId>22) {
    		    debugTraceLog("[GP] Message not identified as response to Projeqtor email (cannot find end of objectId)");
    		    if(!$afterMailTreatment or $afterMailTreatment == 'markAsReadMail'){
    		    	$mailbox->markMailAsRead($mailId);
    		    }else{
    		    	$mailbox->deleteMail($mailId);
    		    }
    		    continue;
    		  }
    		  $class=pq_substr($body,$posClass+30,$posId-$posClass-30);
    		  $id=pq_substr($body,$posId+10,$posEnd-$posId-10);		  
    		} else {	
    			debugTraceLog("[GP] Message not identified as response to Projeqtor email (cannot find objectClass)");
    		    if(!$afterMailTreatment or $afterMailTreatment == 'markAsReadMail'){
    		    	$mailbox->markMailAsRead($mailId);
    		    }else{
    		    	$mailbox->deleteMail($mailId);
    		    }
    			continue;
    		}
  		}
  		// Search end of Message (this is valid for text only, treatment of html messages would require other code)  		
  		$posEndMsg=strrpos($body,"###PROJEQTOR###");
  		if($posEndMsg){
  		  $checkThunderAndGmail=pq_strpos($body,"\r\n>");
  		  //$checkSeparator=pq_strpos($body,"____________________");
          if($checkThunderAndGmail and $checkThunderAndGmail<$posEndMsg){
            $posEndMsg=$checkThunderAndGmail;
            $posEndMsg=strrpos(pq_substr($body,0,$posEndMsg-20), "\r\n");// Search for Thunderbird and Gmail
          }else{
            $substrEndBody=pq_substr($body,0,$posEndMsg);
            $posStartTag=strrpos($substrEndBody,"\n");
            $substrRow=pq_substr($body,0,$posStartTag-2);
            $posEndMsg=strrpos($substrRow,"\n");
          }
  		}else if (!$posEndMsg and pq_strpos($body,"\r\n>")) {
  		  $posEndMsg=strrpos(pq_substr($body,0,$posEndMsg-20), "\r\n");
  		  /*if ($posEndMsg) {
  		    $posEndMsg=strrpos(pq_substr($body,0,$posEndMsg-20), "\r\n");
  		    $previousLine=strrpos(pq_substr($body,0,$posEndMsg-20), "\r\n");
  		    if ($previousLine and preg_match('/<.*?@.*?>/',pq_substr($body,$previousLine,$posEndMsg-$previousLine+1)) ) {
  		      $posEndMsgNew=strrpos(pq_substr($body,0,$posEndMsg-2), "\r\n");
  		      if ($posEndMsgNew) $posEndMsg=$posEndMsgNew;
  		    }
  		    
  		  }*/
  		} else {
  		  $posEndMsg=pq_strpos($body,"\n>");
  		  /*if ($posEndMsg) {
  		    $posEndMsg=strrpos(pq_substr($body,0,$posEndMsg-20), "\n");
  		    $previousLine=strrpos(pq_substr($body,0,$posEndMsg-20), "\n");
  		    if ($previousLine and preg_match('/<.*?@.*?>/',pq_substr($body,$previousLine,$posEndMsg-$previousLine+1)) ) {
  		      $posEndMsgNew=strrpos(pq_substr($body,0,$posEndMsg-2), "\n");
  		      if ($posEndMsgNew) $posEndMsg=$posEndMsgNew;
  		    }
  		  }*/ 
  		}
  		if (!$posEndMsg) { // Search for outlook
  		  preg_match('/<.*?@.*?> [\r\n]/',pq_nvl($body), $matches);
  		  if (count($matches)>0) {
  		    $posEndMsg=pq_strpos($body, $matches[0]);
  		    $posEndMsg=strrpos(pq_substr($body,0,$posEndMsg-2), "\r\n");
  		  }
  		}
  		if (!$posEndMsg) {
  		  $posEndMsg=pq_strpos($body,"\r\n\r\n\r\n");
  		  if (!$posEndMsg) {
  		    $posEndMsg=pq_strpos($body,"\n\n\n");
  		  }
  		}
  		if ($posEndMsg) {
  		  $msg=pq_substr($body,0,$posEndMsg);
  		}
  		if (!pq_trim ($msg)) { // Message not received with previous methods, try another one
  		  $posEndMsg=strrpos(pq_substr($body,0,$posClass), "\n");
  		  $posDe=strrpos(pq_substr($body,0,$posEndMsg), "De : ");
  		  if ($posDe>2) {
  		    $posEndMsg=$posDe-1;
  		  }
  		  else {
  		    $posDe=strrpos(pq_substr($body,0,$posEndMsg), "From : ");
  		    if ($posDe>2) {
  		      $posEndMsg=$posDe-1;
  		    }
  		  }
  		  $msg=pq_substr($body,0,$posEndMsg);
  		}
  		//florent
  		$signIdent=Parameter::getGlobalParameter('paramSignatureAndTagToRemove');
  		if(pq_trim($signIdent)!=''){
  		  $posRemoveMsg=pq_strpos($body,$signIdent);
  		  if(pq_trim($posRemoveMsg)){
  		    $msg=pq_trim(pq_substr($body,0,$posRemoveMsg));
  		  }
  		}
  		// Remove unexpected "tags" // Valid as long as we treat emails as text
  		$msg=preg_replace('/<mailto.*?\>/','',pq_nvl($msg));
  		$msg=preg_replace('/<http.*?\>/','',pq_nvl($msg));
  		$msg=preg_replace('/<#[A-F0-9\-]*?\>/','',pq_nvl($msg));
  		$msg=pq_str_replace(" \r\n","\r\n",$msg);
  		$msg=pq_str_replace(" \r\n","\r\n",$msg);
  		//$msg=pq_str_replace("\r\n\r\n\r\n","\r\n\r\n",$msg);
  		//$msg=pq_str_replace("\r\n\r\n\r\n","\r\n\r\n",$msg);
  		$msg=pq_str_replace(" \n","\n",$msg);
  		$msg=pq_str_replace(" \n","\n",$msg);
  		$msg=pq_str_replace("\n\n\n","\n\n",$msg);
  		$msg=pq_str_replace("\n\n\n","\n\n",$msg);
  		// Sender
  		$sender=$mail->fromAddress;
  		$crit=array('email'=>$sender);
  		$usr=new Affectable();
  		$usrList=$usr->getSqlElementsFromCriteria($crit,false,null,'idle asc, isUser desc, isResource desc');
  		if (count($usrList)) {
  		  $senderId=$usrList[0]->id;
  		}
  		debugTraceLog("[GP] User corresponding to email address is #$senderId");
  		if (! $senderId) {
  			traceLog("#$mb->id - (2) Email message received from '$sender', not recognized as resource or user or contact : message not stored as note to avoid spamming");
  		    if(!$afterMailTreatment or $afterMailTreatment == 'markAsReadMail'){
  		    	$mailbox->markMailAsRead($mailId);
  		    }else{
  		    	$mailbox->deleteMail($mailId);
  		    }
  			continue;
  		}
  		$arrayFrom=array("\n","\r"," ");
  		$arrayTo=array("","","");
  		$class=pq_str_replace($arrayFrom, $arrayTo, $class);
  		$id=pq_str_replace($arrayFrom, $arrayTo, $id);	
  		$id=pq_str_replace(']','',$id);
      $obj=null;
      if (SqlElement::class_exists($class) and is_numeric($id)) {
        $obj=new $class($id);
        debugTraceLog("[GP] Message identified as reply to message from $class #$id");
      }
      if (!$obj or !$obj->id) {
      	traceLog("Message received from $mail->fromAddress with response to note on $class #$id that does not exist in this database");
        if(!$afterMailTreatment or $afterMailTreatment == 'markAsReadMail'){
	    	  $mailbox->markMailAsRead($mailId);
	      }else{
	    	  $mailbox->deleteMail($mailId);
	      }
      	continue;
      }
      if (!pq_trim($msg)) {
      	traceLog("Could not retreive response (empty response) from '$sender' mail concerning $class #$id");
      	debugTraceLog("[GP] $body");
        if(!$afterMailTreatment or $afterMailTreatment == 'markAsReadMail'){
	    	$mailbox->markMailAsRead($mailId);
	    }else{
	    	$mailbox->deleteMail($mailId);
	    }
      	continue;
      }
  		if ($obj and $obj->id and $senderId) {
  		  if (substr_count($msg,"\r\n")==2*substr_count($msg,"\r\n\r\n")) {
  		    $msg=pq_str_replace("\r\n\r\n","\r\n",$msg); // Remove double lines as all are double
  		  }
  		  $note=new Note();
  		  $note->refType=$class;
  		  $note->refId=$id;
  		  $note->idPrivacy=1;
  		  $note->note=nl2brForPlainText($msg);
  		  $note->idUser=$senderId;
  		  $note->creationDate=date('Y-m-d H:i:s');
  		  $note->fromEmail=1;
  		  $resSaveNote=$note->save();
  		  if(!$afterMailTreatment or $afterMailTreatment == 'markAsReadMail'){
          	$mailbox->markMailAsRead($mailId);
          }else{
          	$mailbox->deleteMail($mailId);
          }
  		  $status=getLastOperationStatus($resSaveNote);
  		  if ($status=='OK') {
  		    debugTraceLog("[GP] Note from '$sender' added on $class #$id");
  		  } else {
  		  	traceLog("ERROR saving note from '$sender' to item $class #$id : $resSaveNote");
  		  }
 		    $mailResult=$obj->sendMailIfMailable(false,false,false,false,true,false,false,false,false,false,false,true);
  		} else {
  		  $mailbox->markMailAsUnread($mailId);
  		}
    }
    unset($mailbox);
    // Clean $emailAttachmentsDir for php files
    foreach(glob($emailAttachmentsDir.'/*') as $v) {
      if (! is_file($v)) continue;
      if (pq_substr(pq_strtolower($v),-4)=='.php' or pq_substr(pq_strtolower($v),-5,4)=='.php') unlink($v); // Default, but not enough
      if (is_file($v)) unlink($v); // delete all files (as of today, we don't retreive attachments)
    }
    
  }
  
  public static function checkMailGroup() {
    self::init();
    global $globalCronMode, $globalCatchErrors, $cronnedMailSender;
    $globalCronMode=true;
    $globalCatchErrors=true;
    $period=Mail::getMailGroupPeriod();
    if ($period<=0) return;
    // Direct SQL : allowed here because very technical query, requiring high performance
    //              attention, in postgresql, fields are always returned in lowercase
    $mts=new MailToSend();
    $mtsTable=$mts->getDatabaseTableName();
    $dateToCheck=date("Y-m-d H:i:s", pq_strtotime(date("Y-m-d H:i:s")) - $period);
    // Get list of items with last stored email (in MailToSend) older than period : must send the emails 
    $query="select refType as reftype, refId as refid, max(recordDateTime) as lastdate from $mtsTable group by refType, refId having max(recordDateTime)<'$dateToCheck'";
    $result = Sql::query($query);
    $arrayMailToSend=array();
    if (Sql::$lastQueryNbRows > 0) {
      $line = Sql::fetchLine($result);
      while ($line) {
        $arrayMailToSend[]=array('refType'=>$line['reftype'], 'refId'=>$line['refid'],'date'=>$line['lastdate']);
        $line = Sql::fetchLine($result);
      }
    } else {
      return;
    }
    // Here, $arrayMailToSend contains 1 line per element for wich mails have to be sent 
    $error=false;
    Sql::beginTransaction();
    $groupRule=Parameter::getGlobalParameter('mailGroupDifferent');
    if (!$groupRule) $groupRule='LAST';
    $idToPurge=array();
    $sepLine="<table style='width:95%'><tr><td style='border-bottom:3px solid #545381'>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></table>";
    foreach ($arrayMailToSend as $toSendItem) { // For each item in $arrayMailToSend
      // List all emails stored in MailToSend for the item
      $refType=$toSendItem['refType'];
      $refId=$toSendItem['refId'];
      $crit=array('refType'=>$refType, 'refId'=>$refId);
      $list=$mts->getSqlElementsFromCriteria($crit,false,null,'recordDateTime desc');
      $item=new $refType($refId);
      $arrayMail=array();
      $last=end($list);
      $lastDate=$last->recordDateTime;
      foreach ($list as $toSend) { // For each email to send
        if ($toSend->recordDateTime>$toSendItem['date']) continue; // Found a brand new email, do not take it into account, will be included in next period loop 
        $idToPurge[]=$toSend->id; // Store ids of MailToSend that need to be purge after sending email
        $key=0; // For $groupRule=='ALL' or $groupRule=='MERGE'
        if ($groupRule=='ALL') $key=$toSend->idEmailTemplate;
        if ( !isset($arrayMail[$key])) {
          if ($toSend->template=='basic') {
            $template=$item->getMailDetail();
          } else {
            $templateObj=new EmailTemplate($toSend->idEmailTemplate);
            $template=$item->getMailDetailFromTemplate($templateObj->template,$lastDate);
          }
          $arrayMail[$key]=array(
            'newerDate'=>$toSend->recordDateTime,
            'olderdate'=>$toSend->recordDateTime,
            'idEmailTemplate'=>$toSend->idEmailTemplate,
            'nameTemplate'=>$toSend->template,
            'template'=>$template,
            'title'=>$toSend->title,
            'allTitles'=>array($toSend->title),
            'allDates'=>array($toSend->recordDateTime),
            'allTemplates'=>array($toSend->template),
            'dest'=>$toSend->dest      
          );
        } else {
          // Merge dest
          $arr1=pq_explode(',',$arrayMail[$key]['dest']);
          $arr2=pq_explode(',',$toSend->dest);
          $arrMerged=array_unique(array_merge($arr1, $arr2));
          $arrayMail[$key]['dest']=implode(',', $arrMerged);
          // Merge titles
          $arrayMail[$key]['allTitles'][]=$toSend->title;
          $arrayMail[$key]['allDates'][]=$toSend->recordDateTime;
          // Merge template (if option is to merge templates)
          if ($groupRule=='MERGE' and ! in_array($toSend->template, $arrayMail[$key]['allTemplates'])) {
            $arrayMail[$key]['allTemplates'][]=$toSend->template;
            $body=$arrayMail[$key]['template'];
            if ($toSend->template=='basic') {
              $template=$item->getMailDetail();
            } else {
              $templateObj=new EmailTemplate($toSend->idEmailTemplate);
              $template=$item->getMailDetailFromTemplate($templateObj->template,$lastDate);
            }
            $body.=$sepLine.$template;
            $arrayMail[$key]['template']=$body;
          }
        }
      }
      foreach ($arrayMail as $mail) {
        $dest=$mail['dest'];
        $title=$mail['title'];
        $body='<html>';
        $body.='<head><title>' . $title .'</title></head>';
        $body.='<body style="font-family: Verdana, Arial, Helvetica, sans-serif;">';
        if (count($mail['allTitles'])>1) {
          $body.="<table style='width:95%'>";
          $body.="<tr><td colspan='2' style='text-align:center;background-color: #E0E0E0;font-weight:bold'>".i18n("mailGroupTitles")."</td></tr>";
          foreach ($mail['allTitles'] as $idx=>$title) {
            $body.="<tr><td style='width:10%;padding:3px 10px'>".htmlFormatDateTime($mail['allDates'][$idx])."</td><td style='padding:3px 10px'>$title</td></tr>";
          }
          $body.="";
          $body.="";
          $body.="</table>";
          $body.=$sepLine;
        }
        $body.=$mail['template'];
        $body.='</body>';
        $body.='</html>';
        $cronnedMailSender=$toSend->idUser;
        $resultMail[] = sendMail($dest, $title, $body, $item, null, null, null, null, null );
      }
    }
    
    // Puge sent emails from MailToSend
    $listId=implode(',',$idToPurge);
    $resPurge=$mts->purge("id in ($listId)");
    
    // Finalize
    if ($error) {
      Sql::rollbackTransaction();
    } else {
      Sql::commitTransaction();
    }
  }
  
}

function getListCronAutoSendReport(){
  //Look if CronAutoSendReport exist in database //damian
  $listCronAutoSendReport=SqlList::getListWithCrit("AutoSendReport", array("idle"=>"0"), 'id');
  $inCronBlockFonctionCustom=true;
  foreach ($listCronAutoSendReport as $key=>$cronAutoSendReport){
  	if(is_numeric($cronAutoSendReport)){
  		$listCronAutoSendReport[$key]=new AutoSendReport($cronAutoSendReport);
  		$cronAutoSendReport=$listCronAutoSendReport[$key];
  	}
  }
  return $listCronAutoSendReport;
}

//Look if CronExecution exist in database
Cron::$listCronExecution=SqlList::getListWithCrit("CronExecution", array("idle"=>"0"), 'id');
$inCronBlockFonctionCustom=true;
foreach (Cron::$listCronExecution as $key=>$cronExecution){
  if(is_numeric($cronExecution)){
    Cron::$listCronExecution[$key]=new CronExecution($cronExecution);
    $cronExecution=Cron::$listCronExecution[$key];
  }
  if ($cronExecution->fileExecuted) require_once $cronExecution->fileExecuted;
}

?>