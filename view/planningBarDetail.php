<?php
include_once "../tool/projeqtor.php";
$class=null;
if (isset($_REQUEST['class'])) {
  $class=$_REQUEST['class'];
}
Security::checkValidClass($class);
if ($class=='Replan' or $class=='Construction' or $class=='Fixed') {
  $class='Project';
}
$id=null;
if (isset($_REQUEST['id'])) {
  $id=$_REQUEST['id'];
}
if ($class!='PeriodicMeeting') Security::checkValidId($id);

echo '<input type="hidden" id="planningBarDetailObjectClass" name="planningBarDetailObjectClass" value="'.$class.'" />';
echo '<input type="hidden" id="planningBarDetailObjectId" name="planningBarDetailObjectId" value="'.$id.'" />';

$scale='day';
if (isset($_REQUEST['scale'])) {
  $scale=$_REQUEST['scale'];
}
if ($scale!='day' and $scale!='week' and $scale!='month' and $scale!='quarter') {
  echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('ganttDetailScaleError');
  echo drawCloseButton(13, '#FFF0F0', '#E0E0E0');
  echo "</div>";
  return;
}
$objectClassManual=RequestHandler::getValue('objectClassManual');
if ($objectClassManual=='ResourcePlanning' and $class!='PeriodicMeeting') {
  $idAssignment=RequestHandler::getId('idAssignment');
}

$dates=array();
$work=array();
$weeks=array();
$maxCapacity=array();
$minCapacity=array();
$maxSurbooking=array();
$minSurbooking=array();
$ressAll=array();
$excludedAssKey=array();
$start=null;
$end=null;
$resourceList=array(0=>0);

if ($class=='Resource' or $class=='ResourceTeam' or $class=='PeriodicMeeting') {
  echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('noDataToDisplay');
  echo drawCloseButton(13, '#FFF0F0', '#E0E0E0');
  echo "</div>";
  return;
}
$crit=array('refType'=>$class, 'refId'=>$id);

if (!class_exists($class.'PlanningElement')) {
  echo "";
  return;
}
$pe=SqlElement::getSingleSqlElementFromCriteria($class.'PlanningElement', $crit);
if ($pe->assignedWork==0 and $pe->leftWork==0 and $pe->realWork==0) {
  echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('noDataToDisplay');
  echo drawCloseButton(13, '#FFF0F0', '#E0E0E0');
  echo "</div>";
  return;
}
// $modeName='id'pq_strtolower($class.'PlanningMode');
$mode=SqlList::getFieldFromId('PlanningMode', $pe->idPlanningMode, 'code');
if ($objectClassManual!='ResourcePlanning' and $mode=='REGUL' and $pe->realStartDate and !$pe->realEndDate and $pe->validatedEndDate>$pe->plannedEndDate) {
  $end=$pe->validatedEndDate;
} else if ($objectClassManual!='ResourcePlanning' and $mode=='REGUL' and !$pe->realEndDate and $pe->plannedEndDate>$pe->validatedEndDate) {
  $end=$pe->plannedEndDate;
}

if ($objectClassManual=='ResourcePlanning') {
  $crit=array('refType'=>$class, 'refId'=>$id, 'idAssignment'=>$idAssignment);
}

$hideAssignationWithoutLeftWork=(Parameter::getUserParameter('hideAssignationWihtoutLeftWork')=='1')?true:false;
$wk=new Work();
$wkLst=$wk->getSqlElementsFromCriteria($crit);
foreach ($wkLst as $wk) {
  $dates[$wk->workDate]=$wk->workDate;
  if (!$start or $start>$wk->workDate) $start=$wk->workDate;
  if (!$end or $end<$wk->workDate) $end=$wk->workDate;
  $keyAss=$wk->idAssignment.'#'.$wk->idResource;
  $resourceList[$keyAss]=$wk->idResource;
  if (!isset($work[$keyAss])) $work[$keyAss]=array();
  if (!isset($work[$keyAss]['resource'])) {
    $ress=new ResourceAll($wk->idResource);
    $ressAll[$wk->idResource]=$ress;
    $work[$keyAss]['capacity']=($ress->capacity>1)?$ress->capacity:'1';
    $work[$keyAss]['resource']=$ress->name;
    $work[$keyAss]['idResource']=$ress->id;
    if ($ress->isResourceTeam) {
      $ass=new Assignment($wk->idAssignment);
      $work[$keyAss]['capacity']=($ass->capacity>1)?$ass->capacity:'1';
    }
    if ($work[$keyAss]['capacity']>1) {
      $work[$keyAss]['resource'].=' ('.i18n('max').' = '.htmlDisplayNumericWithoutTrailingZeros($work[$keyAss]['capacity']).' '.i18n('days').')';
    }
  }
  $work[$keyAss][$wk->workDate]=array('work'=>$wk->work, 'type'=>'real');
  $maxCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
  $minCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
  $maxSurbooking[$wk->idResource]=0;
  $minSurbooking[$wk->idResource]=0;
  if ($hideAssignationWithoutLeftWork==1) {
    $ass=new Assignment($wk->idAssignment);
    if ($ass->leftWork==0) {
      unset($work[$keyAss]);
      $excludedAssKey[$keyAss]=$ass->idResource;
    }
  }
}
$wk=new PlannedWork();
$wkLst=$wk->getSqlElementsFromCriteria($crit);
foreach ($wkLst as $wk) {
  if ($pe->realEndDate and $wk->workDate>$pe->realEndDate) continue; // Do not take into account planned work over existing real end date - due to not replanned work
  $dates[$wk->workDate]=$wk->workDate;
  if (!$start or $start>$wk->workDate) $start=$wk->workDate;
  if (!$end or $end<$wk->workDate) $end=$wk->workDate;
  $keyAss=$wk->idAssignment.'#'.$wk->idResource;
  $resourceList[$keyAss]=$wk->idResource;
  if (!isset($work[$keyAss])) $work[$keyAss]=array();
  if (!isset($work[$keyAss]['resource'])) {
    $ress=new ResourceAll($wk->idResource);
    $ressAll[$wk->idResource]=$ress;
    $work[$keyAss]['capacity']=($ress->capacity>1)?$ress->capacity:'1';
    $work[$keyAss]['resource']=$ress->name;
    $work[$keyAss]['idResource']=$ress->id;
    if ($ress->isResourceTeam) {
      $ass=new Assignment($wk->idAssignment);
      $work[$keyAss]['capacity']=($ass->capacity>1)?$ass->capacity:'1';
    }
    if ($work[$keyAss]['capacity']>1) {
      $work[$keyAss]['resource'].=' ('.i18n('max').' = '.htmlDisplayNumericWithoutTrailingZeros($work[$keyAss]['capacity']).' '.i18n('days').')';
    }
  }
  if (!isset($work[$keyAss][$wk->workDate])) {
    $work[$keyAss][$wk->workDate]=array(
        'work'=>$wk->work, 
        'type'=>'planned', 
        'surbooked'=>$wk->surbooked, 
        'surbookedWork'=>$wk->surbookedWork);
  }
  $maxCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
  $minCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
  $maxSurbooking[$wk->idResource]=0;
  $minSurbooking[$wk->idResource]=0;
  if ($hideAssignationWithoutLeftWork==1) {
    $ass=new Assignment($wk->idAssignment);
    if ($ass->leftWork==0) {
      unset($work[$keyAss]);
      $excludedAssKey[$keyAss]=$ass->idResource;
    }
  }
}
if (count($work)==0) {
  echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('noDataToDisplay');
  echo drawCloseButton(13, '#FFF0F0', '#E0E0E0');
  echo "</div>";
  return;
}
if ($pe->plannedEndDate>$end and !$pe->realEndDate and $objectClassManual!='ResourcePlanning') $end=$pe->plannedEndDate;
$where="idProject in ".Project::getAdminitrativeProjectList();
$act=new Activity();
$actList=$act->getSqlElementsFromCriteria(null, null, $where);
$actListId=array(0=>0);
foreach ($actList as $activity) {
  $actListId[$activity->id]=$activity->id;
}
$wk=new Work();
$where="refType='Activity' and refId in (".implode(',', $actListId).") and idResource in (".implode(',', $resourceList).")";
$actWorkList=$wk->getSqlElementsFromCriteria(null, null, $where);
$resourceList=array_flip($resourceList);
foreach ($actWorkList as $wk) {
  if ($start>$wk->workDate) continue;
  if ($end<$wk->workDate) continue;
  $dates[$wk->workDate]=$wk->workDate;
  $keyAss=$resourceList[$wk->idResource];
  if (!isset($work[$keyAss])) $work[$keyAss]=array();
  if (!isset($work[$keyAss]['resource'])) {
    $ress=new ResourceAll($wk->idResource);
    $ressAll[$wk->idResource]=$ress;
    $work[$keyAss]['capacity']=($ress->capacity>1)?$ress->capacity:'1';
    $work[$keyAss]['resource']=$ress->name;
    $work[$keyAss]['idResource']=$ress->id;
    if ($ress->isResourceTeam) {
      $ass=new Assignment($wk->idAssignment);
      $work[$keyAss]['capacity']=($ass->capacity>1)?$ass->capacity:'1';
    }
    if ($work[$keyAss]['capacity']>1) {
      $work[$keyAss]['resource'].=' ('.i18n('max').' = '.htmlDisplayNumericWithoutTrailingZeros($work[$keyAss]['capacity']).' '.i18n('days').')';
    }
  }
  
  if (isset($work[$keyAss][$wk->workDate])) {
    if ($work[$keyAss][$wk->workDate]['type']=='real') {
      $work[$keyAss][$wk->workDate]=array(
          'work'=>$work[$keyAss][$wk->workDate]['work'], 
          'type'=>'real_administrative', 
          'real'=>$work[$keyAss][$wk->workDate]['work'], 
          'adm'=>$wk->work, 
          'planned'=>0);
    } else {
      // $suboked=(isset($work[$keyAss][$wk->workDate]['surbooked']) and $work[$keyAss][$wk->workDate]['surbooked'])?($work[$keyAss][$wk->workDate]['surbookedWork']-$wk->work ):'';
      $suboked=(isset($work[$keyAss][$wk->workDate]['surbooked']) and $work[$keyAss][$wk->workDate]['surbooked'])?($work[$keyAss][$wk->workDate]['surbookedWork']):0;
      $work[$keyAss][$wk->workDate]=array(
          'work'=>$work[$keyAss][$wk->workDate]['work'], 
          'type'=>'planned_administrative', 
          'real'=>0, 
          'adm'=>$wk->work, 
          'planned'=>$work[$keyAss][$wk->workDate]['work'], 
          'surbooked'=>(isset($work[$keyAss][$wk->workDate]['surbooked']))?$work[$keyAss][$wk->workDate]['surbooked']:0, 
          'surbookedWork'=>$suboked);
    }
    $maxCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
    $minCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
    $maxSurbooking[$wk->idResource]=0;
    $minSurbooking[$wk->idResource]=0;
  } else {
    $work[$keyAss][$wk->workDate]=array('work'=>$wk->work, 'type'=>'administrative');
    $maxCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
    $minCapacity[$wk->idResource]=$work[$keyAss]['capacity'];
    $maxSurbooking[$wk->idResource]=0;
    $minSurbooking[$wk->idResource]=0;
  }
  if ($hideAssignationWithoutLeftWork==1 and isset($excludedAssKey[$keyAss])) {
    unset($work[$keyAss]);
  }
}
if ($mode=='RECW') { // RECW
  $start=$pe->plannedStartDate;
  $end=$pe->plannedEndDate;
}
if (!$start or !$end) {
  if ($pe->elementary) {
    if ($pe->paused) echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('noDataToDisplay').'<br/>'.i18n('msgPausedActivity');
    else if ($hideAssignationWithoutLeftWork) echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('noDataToDisplay');
    else echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('noDataToDisplay').'<br/>'.i18n('planningCalculationRequired');
    echo drawCloseButton(13, '#FFF0F0', '#E0E0E0');
    echo "</div>";
  } else {
    echo '<div style="background-color:#FFF0F0;padding:3px;border:1px solid #E0E0E0;">'.i18n('noDataToDisplay');
    echo drawCloseButton(13, '#FFF0F0', '#E0E0E0');
    echo "</div>";
    return;
  }
}
if ($objectClassManual!='ResourcePlanning') {
  if ($pe->elementary==0&&$pe->plannedStartDate&&$pe->plannedStartDate<$start) {
    $start=$pe->plannedStartDate; // PBER : Changed due to unconsistency with display
  }
}
$variableCapacity=array();
$surbooking=array();
$dt=$start;
while ($dt<=$end) {
  if (!isset($dates[$dt])) {
    $dates[$dt]=$dt;
  }
  foreach ($ressAll as $ress) {
    if (!isset($variableCapacity[$ress->id])) $variableCapacity[$ress->id]=array();
    if (!isset($surbooking[$ress->id])) $surbooking[$ress->id]=array();
    $capa=$ress->getCapacityPeriod($dt);
    $surbook=$ress->getSurbookingCapacity($dt, true);
    if (!$ress->isResourceTeam) {
      if (!isset($maxCapacity[$ress->id])) $maxCapacity[$ress->id]=$capa;
      if (!isset($minCapacity[$ress->id])) $minCapacity[$ress->id]=$capa;
      if ($capa!=$ress->capacity) {
        $variableCapacity[$ress->id][$dt]=$capa;
      }
      if ($capa>$maxCapacity[$ress->id]) $maxCapacity[$ress->id]=$capa;
      if ($capa<$minCapacity[$ress->id]) $minCapacity[$ress->id]=$capa;
    }
    if (!isset($maxSurbooking[$ress->id])) $maxSurbooking[$ress->id]=0;
    if (!isset($minSurbooking[$ress->id])) $minSurbooking[$ress->id]=0;
    if ($surbook>$maxSurbooking[$ress->id]) $maxSurbooking[$ress->id]=$surbook;
    if ($surbook<$minSurbooking[$ress->id]) $minSurbooking[$ress->id]=$surbook;
  }
  $dt=addDaysToDate($dt, 1);
}
ksort($dates);

echo drawCloseButton(13);

if ($scale=='day' or $scale=='week') {
  $width=20;
  echo '<table id="planningBarDetailTable" style="height:'.(count($work)*22).'px;background-color:#FFFFFF;border-collapse: collapse;marin:0;padding:0;width:100%">';
  $heightNormal=20;
  $heightCapacity=20;
  usort($work, 'sortByResourceName');
  
  if ($pe->idPlanningMode==8) {
    if ($pe->plannedDuration-$pe->validatedDuration>0) {
      $peEndDateOver=addWorkDaysToDate($pe->plannedStartDate, $pe->validatedDuration);
    }
  }
  
  $isColorBlind=Parameter::getUserParameter('colorBlindPlanning');
  foreach ($work as $resWork) {
    if (!isset($ressAll[$resWork['idResource']])) continue;
    $resObj=$ressAll[$resWork['idResource']];
    echo '<tr style="height:20px;border:1px solid #505050;">';
    $overCapa=null;
    $underCapa=null;
    $surbooked=null;
    foreach ($dates as $dt) {
      $color="#ffffff";
      $tdColor="";
      $height=20;
      $w=0;
      $heightSurbooked=0;
      $capacityTop=$maxCapacity[$resWork['idResource']]; // $resWork['capacity'];
      if (!isset($variableCapacity[$resWork['idResource']][$dt])) {
        $heightNormal=20;
        $heightCapacity=20;
      } else {
        $tmp=$ressAll[$resWork['idResource']];
        if ($variableCapacity[$resWork['idResource']][$dt]>$tmp->capacity) {
          if (!$overCapa or $variableCapacity[$resWork['idResource']][$dt]>$overCapa) {
            $overCapa=$variableCapacity[$resWork['idResource']][$dt];
          }
        } else {
          if (!$underCapa or $variableCapacity[$resWork['idResource']][$dt]<$underCapa) {
            $underCapa=$variableCapacity[$resWork['idResource']][$dt];
          }
        }
        $heightNormal=round(20*$resWork['capacity']/$capacityTop, 0);
        $heightCapacity=round(20*$variableCapacity[$resWork['idResource']][$dt]/$capacityTop, 0);
      }
      if ($capacityTop==0) $capacityTop=1;
      if (isset($resWork[$dt])) {
        $overLimitedFixedDuration=false;
        if (isset($peEndDateOver) and $peEndDateOver<$dt) {
          $overLimitedFixedDuration=true;
        }
        $w=$resWork[$dt]['work'];
        if ((!$pe->validatedEndDate or $dt<=$pe->validatedEndDate) and !$overLimitedFixedDuration) {
          if ($resWork[$dt]['type']=='real_administrative' or $resWork[$dt]['type']=='planned_administrative') {
            $color=($resWork[$dt]['real']!=0)?"#507050":"#50BB50";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['real']!=0)?"#50BB50":"#67ff00";
          } else {
            $color=($resWork[$dt]['type']=='real')?"#507050":"#50BB50";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['type']=='real')?"#50BB50":"#67ff00";
          }
        } else {
          if ($resWork[$dt]['type']=='real_administrative' or $resWork[$dt]['type']=='planned_administrative') {
            $color=($resWork[$dt]['type']=='real_administrative')?"#705050":"#BB5050";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['type']=='real_administrative')?"#63226b":"#9a3ec9";
          } else {
            $color=($resWork[$dt]['type']=='real')?"#705050":"#BB5050";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['type']=='real')?"#63226b":"#9a3ec9";
          }
        }
        if ($resWork[$dt]['type']=='administrative') {
          $color=($isColorBlind=='YES')?"#5e8cba":"#3d668f";
        }
        if (isset($resWork[$dt]) and ($resWork[$dt]['type']=='planned_administrative' or $resWork[$dt]['type']=='real_administrative')) {
          $val=($resWork[$dt]['planned']>0 and $resWork[$dt]['real']==0)?$resWork[$dt]['planned']:$resWork[$dt]['real'];
          $valAmd=$resWork[$dt]['adm'];
          $heightAdm=round($valAmd*20/$capacityTop, 0);
          $heightRealPlanned=round($val*20/$capacityTop, 0);
        }
        if (isset($resWork[$dt]['surbooked']) and $resWork[$dt]['surbooked']==1) {
          $sb=$resWork[$dt]['surbookedWork'];
          // PBER #7059
          $height=($w-$sb>0)?round(($w-$sb)*20/$capacityTop, 0):0;
          // $height=round(($w)*20/$capacityTop,0);
          $heightSurbooked=round($sb*20/$capacityTop, 0);
        } else {
          $height=round($w*20/$capacityTop, 0);
        }
      }
      if (isOffDay($dt, SqlList::getFieldFromId('ResourceAll', $resWork['idResource'], 'idCalendarDefinition'))) {
        // Gautier #6103 Gantt bar does not show the real work
        $tdColor="background-color:#dddddd;";
        if ($color=='#ffffff') {
          $color="#dddddd";
        }
      }
      $showBorder=false;
      if ($scale=='day') $showBorder=true;
      if ($scale=='week' and date('w', strtotime($dt))==0) $showBorder=true;
      echo '<td style="padding:0;width:'.$width.'px;'.(($showBorder)?'border-right:1px solid #eeeeee;':'').'position:relative;'.$tdColor.'">';
      if (isset($resWork[$dt]) and ($resWork[$dt]['type']=='planned_administrative' or $resWork[$dt]['type']=='real_administrative')) {
        $bottomAdmin=(isset($heightSurbooked) and $heightSurbooked>0)?$heightSurbooked:$heightRealPlanned;
        echo '<div style="display:block;background-color:#3d668f;position:absolute;bottom:'.$bottomAdmin.'px;left:0px;width:100%;height:'.$heightAdm.'px;"></div>';
        echo '<div style="display:block;background-color:'.$color.';position:absolute;bottom:0px;left:0px;width:100%;height:'.$heightRealPlanned.'px;"></div>';
      } else {
        echo '<div style="border-top:1px solid #555555;display:block;background-color:'.$color.';position:absolute;bottom:0px;left:0px;width:100%;height:'.$height.'px;"></div>';
      }
      if ($heightSurbooked>0) {
        echo '<div style="display:block;background-color:#f4bf42;position:absolute;bottom:'.$height.'px;left:0px;width:100%;height:'.$heightSurbooked.'px;border-top:1px solid grey"></div>';
      }
      if ($maxCapacity[$resWork['idResource']]!=$resWork['capacity'] or $minCapacity[$resWork['idResource']]!=$resWork['capacity']) {
        echo '<div style="display:block;background-color:transparent;position:absolute;bottom:0px;left:0px;width:100%;border-top:1px solid grey;height:'.$heightNormal.'px;"></div>';
      }
      if ($heightNormal!=$heightCapacity and isset($variableCapacity[$resWork['idResource']][$dt])) {
        echo '<div style="display:block;background-color:transparent;position:absolute;bottom:0px;left:0px;width:100%;border-top:1px solid red;height:'.$heightCapacity.'px;"></div>';
      }
      echo '</td>';
    }
    echo '<td style="border-left:1px solid #505050;">';
    echo '<div style="width:200px; max-width:200px;overflow:hidden; text-align:left;max-height:20px;">&nbsp;';
    if ($overCapa) echo '<div style="float:right;padding-right:3px">&nbsp;<img style="width:10px" src="../view/img/arrowUp.png" />&nbsp;'.htmlDisplayNumericWithoutTrailingZeros($overCapa).'</div>';
    if ($underCapa) echo '<div style="float:right">&nbsp;<img style="width:10px" src="../view/img/arrowDown.png" />&nbsp;'.htmlDisplayNumericWithoutTrailingZeros($underCapa).'</div>';
    if ($maxSurbooking[$resWork['idResource']]!=0 or $minSurbooking[$resWork['idResource']]!=0) {
      if ($maxSurbooking[$resWork['idResource']]) echo '<div style="float:right;padding-right:3px;">&nbsp;<span style="color:#f4bf42;font-weight:bold">+</span>&nbsp;'.htmlDisplayNumericWithoutTrailingZeros($maxSurbooking[$resWork['idResource']]).'</div>';
      else if ($minSurbooking[$resWork['idResource']]) echo '<div style="float:right;padding-right:3px;">&nbsp;<span style="color:#f4bf42;font-weight:bold">-</span>&nbsp;'.htmlDisplayNumericWithoutTrailingZeros((-1)*$minSurbooking[$resWork['idResource']]).'</div>';
    }
    echo '</div><div style="width:200px;position:absolute;left:10px;margin-top:-15px;text-shadow: 1px 1px 2px white;white-space:nowrap;overflow:hidden" class="planningBarDetailResName">'.$resWork['resource'].'&nbsp;</div></td>';
    echo '</tr>';
  }
  echo '</table>';
}

if ($scale=='month' or $scale=='quarter') {
  $weeks=array();
  $width=20;
  $maxDaysPerWeek=0;
  echo '<table id="planningBarDetailTable" style="height:'.(count($work)*22).'px;background-color:#FFFFFF;border-collapse: collapse;margin:0;padding:0;width:100%">';
  $heightNormal=20;
  $heightCapacity=20;
  usort($work, 'sortByResourceName');
  if ($pe->idPlanningMode==8) {
    if ($pe->plannedDuration-$pe->validatedDuration>0) {
      $peEndDateOver=addWorkDaysToDate($pe->plannedStartDate, $pe->validatedDuration);
    }
  }
  $isColorBlind=Parameter::getUserParameter('colorBlindPlanning');
  foreach ($work as $resWork) {
    if (!isset($ressAll[$resWork['idResource']])) continue;
    $resObj=$ressAll[$resWork['idResource']];
    echo '<tr style="height:20px;border:1px solid #505050;">';
    $overCapa=null;
    $underCapa=null;
    $surbooked=null;
    $resourceCapacity=0;
    $weekData=array('color'=>array(), 'tdColor'=>array(), 'height'=>array(), 'heightSurbooked'=>array(), 'capacityTop'=>array());
    $currentWeek=null;
    $nbDaysInWeek=0;
    foreach ($dates as $dt) {
      $color="#ffffff";
      $tdColor="";
      $height=20;
      $w=0;
      $heightSurbooked=0;
      $capacityTop=$maxCapacity[$resWork['idResource']];
      if (!isset($variableCapacity[$resWork['idResource']][$dt])) {
        $heightNormal=20;
        $heightCapacity=20;
      } else {
        $tmp=$ressAll[$resWork['idResource']];
        if ($variableCapacity[$resWork['idResource']][$dt]>$tmp->capacity) {
          if (!$overCapa or $variableCapacity[$resWork['idResource']][$dt]>$overCapa) {
            $overCapa=$variableCapacity[$resWork['idResource']][$dt];
          }
        } else {
          if (!$underCapa or $variableCapacity[$resWork['idResource']][$dt]<$underCapa) {
            $underCapa=$variableCapacity[$resWork['idResource']][$dt];
          }
        }
        $heightNormal=round(20*$resWork['capacity']/$capacityTop, 0);
        $heightCapacity=round(20*$variableCapacity[$resWork['idResource']][$dt]/$capacityTop, 0);
      }
      if ($capacityTop==0) $capacityTop=1;
      if (isset($resWork[$dt])) {
        $overLimitedFixedDuration=false;
        if (isset($peEndDateOver) and $peEndDateOver<$dt) {
          $overLimitedFixedDuration=true;
        }
        $w=$resWork[$dt]['work'];
        if ((!$pe->validatedEndDate or $dt<=$pe->validatedEndDate) and !$overLimitedFixedDuration) {
          if ($resWork[$dt]['type']=='real_administrative' or $resWork[$dt]['type']=='planned_administrative') {
            $color=($resWork[$dt]['real']!=0)?"#507050":"#50BB50";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['real']!=0)?"#50BB50":"#67ff00";
          } else {
            $color=($resWork[$dt]['type']=='real')?"#507050":"#50BB50";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['type']=='real')?"#50BB50":"#67ff00";
          }
        } else {
          if ($resWork[$dt]['type']=='real_administrative' or $resWork[$dt]['type']=='planned_administrative') {
            $color=($resWork[$dt]['type']=='real_administrative')?"#705050":"#BB5050";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['type']=='real_administrative')?"#63226b":"#9a3ec9";
          } else {
            $color=($resWork[$dt]['type']=='real')?"#705050":"#BB5050";
            if ($isColorBlind=='YES') $color=($resWork[$dt]['type']=='real')?"#63226b":"#9a3ec9";
          }
        }
        if ($resWork[$dt]['type']=='administrative') {
          $color=($isColorBlind=='YES')?"#5e8cba":"#3d668f";
        }
        if (isset($resWork[$dt]) and ($resWork[$dt]['type']=='planned_administrative' or $resWork[$dt]['type']=='real_administrative')) {
          $val=($resWork[$dt]['planned']>0 and $resWork[$dt]['real']==0)?$resWork[$dt]['planned']:$resWork[$dt]['real'];
          $valAmd=$resWork[$dt]['adm'];
          $heightAdm=round($valAmd*20/$capacityTop, 0);
          $heightRealPlanned=round($val*20/$capacityTop, 0);
        }
        if (isset($resWork[$dt]['surbooked']) and $resWork[$dt]['surbooked']==1) {
          $sb=$resWork[$dt]['surbookedWork'];
          // PBER #7059
          $height=($w-$sb>0)?round(($w-$sb)*20/$capacityTop, 0):0;
          // $height=round(($w)*20/$capacityTop,0);
          $heightSurbooked=round($sb*20/$capacityTop, 0);
        } else {
          $height=round($w*20/$capacityTop, 0);
        }
        if ($w==0) $height=0;
      } else {
        $height=0;
      }
      if (isOffDay($dt, SqlList::getFieldFromId('ResourceAll', $resWork['idResource'], 'idCalendarDefinition'))) {
        continue;
      }
      
      $nbDaysInWeek++;
      $weekData['nbDays']=$nbDaysInWeek;
      $weekNumber=pq_substr($dt, 0, 4).getWeekNumber($dt);
      if ($weekNumber!=$currentWeek) {
        if ($currentWeek!==null) {
          echo '</div>';
          $weeks[$currentWeek][]=$weekData;
        }
        echo '<div class="week-container" style="display:flex;">';
        $weekData=array();
        $currentWeek=$weekNumber;
        $nbDaysInWeek=0;
      }
      //$weekData['nbDays']=$nbDaysInWeek;
      $weekData['color'][]=$color;
      $weekData['tdColor'][]=$tdColor;
      $weekData['height'][]=$height;
      $weekData['heightSurbooked'][]=$heightSurbooked;
      $weekData['capacityTop'][]=$capacityTop;
    }
    $nbDaysInWeek++;
    $weekData['nbDays']=$nbDaysInWeek;
    $weeks[$currentWeek][]=$weekData;
    foreach ($weeks as $weekNumber=>$weekData) {
      $totalHeight=0;
      $chosenColor=null;
      $totalHeightSurbooked=0;
      $totalCapacityTop=0;
      $totalHeightAdmin=0;
      $nbDaysInWeek=5;
      $hasBB5050=false;
      foreach ($weekData as $dayData) {
        // $dayData=$weekData;
        $nbDaysInWeek=$dayData['nbDays'];
        $totalHeightSurbooked+=array_sum($dayData['heightSurbooked']);
        $totalCapacityTop+=array_sum($dayData['capacityTop']);
        $totalHeight+=array_sum($dayData['height']);
        foreach ($dayData['color'] as $idC=>$color) {
          if ($color==='#BB5050') {
            $chosenColor=$color;
            $hasBB5050=true;
            //break 2;
          } else if ($color==='#3d668f') {
            $totalHeightAdmin+=$dayData['height'][$idC];
          }
        }
      }
      $nbWorkDaysInWeek=count($weekData[0]['color']);
      if (!$hasBB5050) {
        $colorCounts=array_count_values(array_merge(...array_column($weekData, 'color')));
        arsort($colorCounts);
        foreach ($colorCounts as $color=>$count) {
          if ($color!=='#ffffff') {
            $chosenColor=$color;
            break;
          }
        }
        if ($chosenColor===null) {
          $chosenColor='#fffffff';
        }
      }
      $averageHeight=($totalHeight-$totalHeightAdmin)/$nbDaysInWeek;
      $averageHeightAdmin=$totalHeightAdmin/$nbDaysInWeek;
      $finalColorForWeek=$chosenColor;
      $averageHeightSurbooked=($totalHeightSurbooked==0)?0:$totalHeightSurbooked/$nbWorkDaysInWeek;
      $averageCapacityTop=$totalCapacityTop/$nbDaysInWeek;
      
      $curWidth=$width*2*$nbWorkDaysInWeek/7;
      //$curWidth=$width;
      echo '<td style="padding:0;width:'.$curWidth.'px;'.((0 and $scale=='day')?'border-right:1px solid #eeeeee;':'border-right:0;').'position:relative;'.$tdColor.'">';
      if (0 and isset($resWork[$dt]) and ($resWork[$dt]['type']=='planned_administrative' or $resWork[$dt]['type']=='real_administrative')) {
        $bottomAdmin=(isset($averageHeightSurbooked) and $averageHeightSurbooked>0)?$averageHeightSurbooked:$heightRealPlanned;
        echo '<div style="display:block;background-color:#3d668f;position:absolute;bottom:'.$bottomAdmin.'px;left:0px;width:100%;height:'.$heightAdm.'px;"></div>';
        echo '<div style="display:block;background-color:'.$finalColorForWeek.';position:absolute;bottom:0px;left:0px;width:100%;height:'.$heightRealPlanned.'px;"></div>';
      } else if ($finalColorForWeek!='#fffffff') {
        if ($averageHeightAdmin>0) echo '<div style="display:block;background-color:#3d668f;position:absolute;bottom:0px;left:0px;width:100%;height:'.$averageHeightAdmin.'px;"></div>';
        echo '<div style="border-top:1px solid #555555;display:block;background-color:'.$finalColorForWeek.';position:absolute;bottom:'.$averageHeightAdmin.'px;left:0px;width:100%;height:'.$averageHeight.'px;"></div>';
      } else {       
        echo '<div style="display:block;background-color:'.$finalColorForWeek.';position:absolute;bottom:0px;left:0px;width:100%;height:'.$averageHeight.'px;"></div>';
      }
      if ($averageHeightSurbooked>0) {
        echo '<div style="display:block;background-color:#f4bf42;position:absolute;bottom:'.$averageHeight.'px;left:0px;width:100%;height:'.$averageHeightSurbooked.'px;"></div>';
      }
      if ($maxCapacity[$resWork['idResource']]!=$resWork['capacity'] or $minCapacity[$resWork['idResource']]!=$resWork['capacity']) {
        echo '<div style="display:block;background-color:transparent;position:absolute;bottom:0px;left:0px;width:100%;border-top:1px solid grey;height:'.$heightNormal.'px;"></div>';
      }
      if ($heightNormal!=$heightCapacity and isset($variableCapacity[$resWork['idResource']][$dt])) {
        echo '<div style="display:block;background-color:transparent;position:absolute;bottom:0px;left:0px;width:100%;border-top:1px solid red;height:'.$heightCapacity.'px;"></div>';
      }
      echo '</td>';
    }
    echo '<td style="border-left:1px solid #505050;">';
    echo '<div style="width:200px; max-width:200px;overflow:hidden; text-align:left;max-height:20px;">&nbsp;';
    if ($overCapa) echo '<div style="float:right;padding-right:3px">&nbsp;<img style="width:10px" src="../view/img/arrowUp.png" />&nbsp;'.htmlDisplayNumericWithoutTrailingZeros($overCapa).'</div>';
    if ($underCapa) echo '<div style="float:right">&nbsp;<img style="width:10px" src="../view/img/arrowDown.png" />&nbsp;'.htmlDisplayNumericWithoutTrailingZeros($underCapa).'</div>';
    if ($maxSurbooking[$resWork['idResource']]!=0 or $minSurbooking[$resWork['idResource']]!=0) {
      if ($maxSurbooking[$resWork['idResource']]) echo '<div style="float:right;padding-right:3px;">&nbsp;<span style="color:#f4bf42;font-weight:bold">+</span>&nbsp;'.htmlDisplayNumericWithoutTrailingZeros($maxSurbooking[$resWork['idResource']]).'</div>';
      else if ($minSurbooking[$resWork['idResource']]) echo '<div style="float:right;padding-right:3px;">&nbsp;<span style="color:#f4bf42;font-weight:bold">-</span>&nbsp;'.htmlDisplayNumericWithoutTrailingZeros((-1)*$minSurbooking[$resWork['idResource']]).'</div>';
    }
    echo '</div><div style="width:200px;position:absolute;left:10px;margin-top:-15px;text-shadow: 1px 1px 2px white;white-space:nowrap;overflow:hidden;" class="planningBarDetailResName">'.$resWork['resource'].'&nbsp;</div></td>';
    
    $weeks=array();
    echo '</div>';
    echo '</tr>';
  }
  
  echo '</table>';
}

function getWeekNumber($date) {
  return date('W', strtotime($date));
}

function sortByResourceName($a, $b) {
  return $a['resource'] <=> $b['resource'];
}

function drawCloseButton($size, $bgColor='white', $borderColor='black') {
  $tabSize=($size*2)-4;
  $tabHeight=$size+4;
  $marge=($size/2)-2;
  $margeHeight=($tabHeight-$size)/2;
  $display=(Parameter::getUserParameter('lockPlanningBarDetail')=='1' or Parameter::getUserParameter('lockPlanningBarDetail')=='')?'':'display:none;';
  $closeButton="<div id='planningBarDetailCloseButton' style='".$display."cursor:pointer;position: absolute;right: 0px;top: -".($tabHeight+1)."px;width:".$tabSize."px;height: ".$tabHeight."px;background-color:".$bgColor.";border-top: 1px solid ".$borderColor.";border-left: 1px solid ".$borderColor.";border-right: 1px solid ".$borderColor.";border-radius: 5px 5px 0px 0px;' onClick='JSGantt.exitBarLink(null, true)'>";
  $closeButton.="<div style='position: absolute;right:".$marge."px;top:".$margeHeight."px;'><span style='width:".$size."px;height:".$size."px;' class='imageColorNewGui'><img style='width:".$size."px;height:".$size."px;' src='images/tabClose.svg' /></span></div>";
  $closeButton.="</div>";
  return $closeButton;
}