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

/**
 * ===========================================================================
 * Save the current object : call corresponding method in SqlElement Class
 * The new values are fetched in $_REQUEST
 * The old values are fetched in $currentObject of SESSION
 * Only changed values are saved.
 * This way, 2 users updating the same object don't mess.
 */
require_once "../tool/projeqtor.php";

// Get the object class from request
$className = RequestHandler::getClass('objectClassName');
$objectId = RequestHandler::getId('objectId');

$obj = new $className($objectId);

$needProjectListRefresh=false;
$idCalendarForCalendarRefresh=false;
$currentFormFields = array();
$currentFormFields['objectClassName']=$className;
$currentFormFields['objectId']=$objectId;

$editableFields = RequestHandler::getValue('editableFields');
$editableFields = explode(',', $editableFields);
$editableFields = array_flip($editableFields);

$extraRequiredFields=array();

if (array_key_exists ( 'confirmed', $_REQUEST )) {
  if ($_REQUEST ['confirmed'] == 'true') {
    SqlElement::setSaveConfirmed ();
  }
}

Sql::beginTransaction ();
// get the modifications (from request)
foreach ($_REQUEST as $field=>$value){
  if(($field == 'name' and $obj->name!=$value) or ($field == 'idProject' and $obj->idProject!=$value))$needProjectListRefresh=true;
  if($field == 'idCalendarDefinition' and $obj->idCalendarDefinition!=$value)$idCalendarForCalendarRefresh=true;
  if(property_exists($className.'PlanningElement', 'id'.$className.pq_substr(ucfirst($field), 2))){
    $col = 'id'.$className.pq_substr(ucfirst($field), 2);
    $pe = $className.'PlanningElement';
    if(pq_trim($value) == ''){
      if($obj->$pe->getDataType($col) == 'int'){
        $value = intval($value);
      }else if($obj->$pe->getDataType($col) == 'decimal'){
        $value = floatval($value);
      }
    }
    $obj->$pe->$col = $value;
    $currentFormFields[$col]=$value;
  }else if(property_exists($className.'PlanningElement', 'id'.$className.ucfirst($field))){
    $col = 'id'.$className.ucfirst($field);
    $pe = $className.'PlanningElement';
    if(pq_trim($value) == ''){
      if($obj->$pe->getDataType($col) == 'int'){
        $value = intval($value);
      }else if($obj->$pe->getDataType($col) == 'decimal'){
        $value = floatval($value);
      }
    }
    $obj->$pe->$col = $value;
    $currentFormFields[$col] = $value;
  }else if(property_exists($className.'PlanningElement', $field)){
    $pe = $className.'PlanningElement';
    if(pq_trim($value) == ''){
      if($obj->$pe->getDataType($field) == 'int'){
        $value = intval($value);
      }else if($obj->$pe->getDataType($field) == 'decimal'){
        $value = floatval($value);
      }
    }
    $obj->$pe->$field = $value;
    $currentFormFields[$field]=$value;
  }else if(property_exists($className, 'id'.$className.ucfirst($field))){
    $col = 'id'.$className.ucfirst($field);
    if(pq_trim($value) == ''){
      if($obj->getDataType($col) == 'int'){
        $value = intval($value);
      }else if($obj->getDataType($col) == 'decimal'){
        $value = floatval($value);
      }
    }
    $obj->$col = $value;
    $currentFormFields[$col] = $value;
  }else if(property_exists($className, 'id'.ucfirst($field))){
    $col = 'id'.ucfirst($field);
    if(pq_trim($value) == ''){
      if($obj->getDataType($col) == 'int'){
        $value = intval($value);
      }else if($obj->getDataType($col) == 'decimal'){
        $value = floatval($value);
      }
    }
    $obj->$col = $value;
    $currentFormFields[$col] = $value;
  }else if(property_exists($className, $field)){
    if(pq_trim($value) == ''){
      if($obj->getDataType($field) == 'int'){
        $value = intval($value);
      }else if($obj->getDataType($field) == 'decimal'){
        $value = floatval($value);
      }
    }
    $obj->$field = $value;
    $currentFormFields[$field] = $value;
    if($field == 'idStatus'){
      $tab=SqlList::getList('Status','setIdleStatus');
      asort($tab);
      foreach ($tab as $idStatus=>$setIdleStatus) {
        if($idStatus == $value){
          $obj->idle = $setIdleStatus;
          $obj->idleDate = ($setIdleStatus)?date('Y-m-d'):null;
        }
      }
      $tab=SqlList::getList('Status','setDoneStatus');
      asort($tab);
      foreach ($tab as $idStatus=>$setDoneStatus) {
        if($idStatus == $value){
          $obj->done = $setDoneStatus;
          $obj->doneDate = ($setDoneStatus)?date('Y-m-d'):null;
        }
      }
    }
  }
}
// save to database
$result = $obj->save();
$status = getLastOperationStatus ( $result );

// Message of correct saving
if ($status == "OK") {
  Sql::commitTransaction ();
} else {
  Sql::rollbackTransaction ();
}

if ($status != "OK" && $status != "NO_CHANGE"){
  $peName=$className.'PlanningElement';
  $TypeName = SqlElement::getTypeName($className);
  if (property_exists($obj, $peName)) {
    $pe = $obj->$peName;
    $resultObj=$obj->getExtraRequiredFields($obj->$TypeName,$obj->idStatus,$obj->$peName->idPlanningMode,null);
    foreach ($resultObj as $key=>$val) {
      $extraRequiredFields[$key]=$val;
    }
    $resultPe=$pe->getExtraRequiredFields($obj->$TypeName,$obj->idStatus,$obj->$peName->idPlanningMode,null);
    foreach ($resultPe as $key=>$val) {
      $extraRequiredFields[$peName.'_'.$key]=$val;
    }
  }
  if (property_exists($obj, 'WorkElement') and $className!='TicketSimple') {
    $resultObj=$obj->getExtraRequiredFields($obj->$TypeName,$obj->idStatus,null,null);
    foreach ($resultObj as $key=>$val) {
      $extraRequiredFields[$key]=$val;
    }
    $we=$obj->WorkElement;
    $resultWe=$we->getExtraRequiredFields($obj->$TypeName,$obj->idStatus,null,null);
    foreach ($resultWe as $key=>$val) {
      $extraRequiredFields['WorkElement_'.$key]=$val;
    }
  }
  
  
  $arrayDefault=array('description'=>'optional', 'result'=>'optional', 'idResource'=>'optional', 'idResolution'=>'optional',
      $peName.'_validatedStartDate'=>'optional', $peName.'_validatedEndDate'=>'optional', $peName.'_validatedDuration'=>'optional');
  foreach ($arrayDefault as $key=>$val) {
    if (property_exists($obj,$key) and $obj->isAttributeSetToField($key,'required')) {
      $arrayDefault[$key]='required';
    }
  }
  $editable = Parameter::getPlanningColumnEditable();
  $extraRequiredFields=array_merge($arrayDefault,$extraRequiredFields);
  foreach ($extraRequiredFields as $col=>$option){
    $field = (pq_strpos($col, $peName) > -1)?pq_str_replace($peName.'_', '', $col):$col;
    if(ucfirst($field) == 'Result'){
      echo "<input type='hidden' id='needResult' name='needResult' value='true' />";
    }
    if(ucfirst($field) == 'Description'){
      echo "<input type='hidden' id='needDescription' name='needDescription' value='true' />";
    }
    if($option == 'required'){
      if(isset($editable[ucfirst($field)]) && isset($editableFields[$field])){
        unset($extraRequiredFields[$col]);
      } else if(isset($obj->$field) and $obj->$field){
        unset($extraRequiredFields[$col]);
      } 
    }else{
      unset($extraRequiredFields[$col]);
    }
  }
  if(count($extraRequiredFields) > 0){
    echo '<input type="hidden" id="lastSaveId" value="" /><input type="hidden" id="lastOperation" value="update" /><input type="hidden" id="lastOperationStatus" value="'.$status.'" />';
    echo "<input type='hidden' id='currentFormFields' name='currentFormFields' value='".json_encode($currentFormFields)."' />";
    echo "<input type='hidden' id='extraRequiredFields' name='extraRequiredFields' value='".json_encode($extraRequiredFields)."' />";
    echo "<input type='hidden' id='editRowObjectClass' name='editRowObjectClass' value='".$className."' />";
    echo "<input type='hidden' id='editRowObjectId' name='editRowObjectId' value='".$objectId."' />";
  }else{
    if($status == 'CONFIRM'){
      echo "<input type='hidden' id='editRowObjectConfirm' name='editRowObjectConfirm' value='1' />";
    }
    echo '<div class="message' . $status . '" >' . $result. '</div>';
  }
}else{
  if ($status == "OK" and $className=='Project') {
    if ($needProjectListRefresh) {
      echo '<input type="hidden" id="needProjectListRefresh" value="true" />';
    }
    if($idCalendarForCalendarRefresh){
      echo '<input type="hidden" id="idProjectForCalendarRefresh" value="'.$obj->id.'" />';
      echo '<input type="hidden" id="idCalendarForCalendarRefresh" value="'.$obj->idCalendarDefinition.'" />';
    }
  }
  if ($status == "OK") {
    $updateRight=securityGetAccessRightYesNo('menu' . $className, 'update', $obj);
    $deleteRight=securityGetAccessRightYesNo('menu' . $className, 'delete', $obj);
    echo "<input type='hidden' id='updateRightAfterSave' value='$updateRight' />";
    echo "<input type='hidden' id='deleteRightAfterSave' value='$deleteRight' />";
  }
  $globalResult=$result;
  $globalStatus=$status;
  echo '<div class="message' . $status . '" >' . $result. '</div>';
}
?>