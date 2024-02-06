<?php
/*** COPYRIGHT NOTICE *********************************************************
 *
 * Copyright 2018 ProjeQtOr - Pascal BERNARD - support@projeqtor.org
 *
 ******************************************************************************
 *** WARNING *** T H I S    F I L E    I S    N O T    O P E N    S O U R C E *
 ******************************************************************************
 *
 * This file is an add-on to ProjeQtOr, packaged as a plug-in module.
 * It is NOT distributed under an open source license. 
 * It is distributed in a proprietary mode, only to the customer who bought
 * corresponding licence. 
 * The company ProjeQtOr remains owner of all add-ons it delivers.
 * Any change to an add-ons without the explicit agreement of the company 
 * ProjeQtOr is prohibited.
 * The diffusion (or any kind if distribution) of an add-on is prohibited.
 * Violators will be prosecuted.
 *    
 *** DO NOT REMOVE THIS NOTICE ************************************************/

include_once '../tool/projeqtor.php';
include_once '../tool/formatter.php';

//Parameters
$idResource=RequestHandler::getId('resourceTeam');
$today=date('Y-m-d');
$month=date('m',pq_strtotime($today));
$year=date('Y',pq_strtotime($today));
$newYear = $year+1;
$cumul=RequestHandler::getBoolean('cumul');
$arrDates=array();
if($month < 4){
  $arrDates[$today]=$year.'-03-31';
  $arrDates[$year.'-03-31']=$year.'-06-30';
  $arrDates[$year.'-06-30']=$year.'-09-30';
  $arrDates[$year.'-09-30']=$year.'-12-31';
}elseif ($month < 7){
  $arrDates[$today]=$year.'-06-30';
  $arrDates[$year.'-06-30']=$year.'-09-30';
  $arrDates[$year.'-09-30']=$year.'-12-31';
  $arrDates[$year.'-12-31']=$newYear.'-03-31';
}elseif ($month < 10){
  $arrDates[$today]=$year.'-09-30';
  $arrDates[$year.'-09-30']=$year.'-12-31';
  $arrDates[$year.'-12-31']=$newYear.'-03-31';
  $arrDates[$newYear.'-03-31']=$newYear.'-06-30';
}else{
  $arrDates[$today]=$year.'-12-31';
  $arrDates[$year.'-12-31']=$newYear.'-03-31';
  $arrDates[$newYear.'-03-31']=$newYear.'-06-30';
  $arrDates[$newYear.'-06-30']=$newYear.'-09-30';
}


$margePool = true;
$included = false;

if(!$idResource){
  echo '<br/><div style="background: #FFDDDD;font-size:150%;color:#808080;text-align:center;padding:20px">';
  echo i18n('messageMandatory',array(i18n('Resource')));
  echo '</div>';
}else{
	$headerParameters="";
	if (count($idResource)>0) {
	  $poolName="";
	  foreach ($idResource as $idR) { $poolName.=SqlList::getNameFromId('ResourceTeam', $idR).", ";}
	  $poolName=pq_substr($poolName,0,-2);
	  $headerParameters.= i18n("colResourceTeam") . ' : '.$poolName.'<br/>';
	}
	include "header.php";
	
  foreach ($idResource as $idResPool){
    foreach ($arrDates as $startDate=>$endDateQuarter){
        if ($cumul) $startDate=$today;
        include("../report/scleRapportMarge.php");
        $included = true;
    }
  }
}