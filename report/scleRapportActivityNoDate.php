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
$idProject=RequestHandler::getId('idProject');
if (!is_array($idProject)) $idProject=explode(',',$idProject);

if(!$idProject){
  echo '<br/><div style="background: #FFDDDD;font-size:150%;color:#808080;text-align:center;padding:20px">';
  echo i18n('messageMandatory',array(i18n('Project')));
  echo '</div>';
  exit();
}
$listProjects=array();
foreach ($idProject as $idP) {
  $proj=new Project($idP,true);
  $sub=$proj->getRecursiveSubProjectsFlatList(false,true);
  $listProjects=array_merge_preserve_keys($listProjects,$sub);
}

$headerParameters="";
if (count($idProject)>0) {
	$projName="";
	foreach ($idProject as $idP) { $projName.=SqlList::getNameFromId('Project', $idP).", ";}
	$projName=pq_substr($projName,0,-2);
	$headerParameters.= i18n("colIdProject") . ' : '.$projName.'<br/>';
}
include "header.php";

$activity = new Activity();
$where = "idProject in ".transformListIntoInClause($listProjects) ;
$where .= " and  idStatus not in ( 1,4,7,9)" ;
$lstAct = $activity->getSqlElementsFromCriteria(null,null,$where);

echo "<table style='margin-left:10%;margin-right:10%;width:80%'>";
echo "  <tr>";
echo "    <td class='reportTableHeader' style='width:10%;padding:2px 5px;'>".i18n('colId')."</td>";
echo "    <td class='reportTableHeader' style='width:90%;padding:2px 5px;'>".i18n('colName')."</td>";
echo "  </tr>";
$nbAct=0;
$today=date('Y-m-d');
foreach ($lstAct as $act){
  if ($act->ActivityPlanningElement->inheritedEndDate or $act->ActivityPlanningElement->validatedEndDate) continue;
  $nbAct++;
  $gotoE=' onClick="gotoElement('."'Activity','".htmlEncode($act->id)."'".');" ';
  echo "  <tr>";
  echo "    <td ".$gotoE." class='reportTableData' style='width:10%;text-align:center;padding:2px 5px;'>#".$act->id."</td>";
  echo "    <td ".$gotoE." class='reportTableData' style='cursor:pointer;width:90%;text-align:left;padding:2px 5px;'>".$act->name."</td>";
  echo "  </tr>";
}
if($nbAct==0){
  echo "  <tr>";
  echo "    <td colspan='2'  class='reportTableData'  style='font-size:100%;text-align:center;padding:2px 5px;'>".i18n('noDataFound')."</td>";
  echo "  </tr>";
}
echo "<tr><td class='reportTableLineHeader' colspan='2' style='font-size:100%;font-weight:bold;text-align:center;padding:2px 5px;'>";
echo $nbAct." ".i18n('menuActivity');
echo "</td></tr>";
echo "</table>";

end:
