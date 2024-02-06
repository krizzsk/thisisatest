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
 * Save a note : call corresponding method in SqlElement Class
 * The new values are fetched in $_REQUEST
 */
require_once "../tool/projeqtor.php";
scriptLog('   ->/tool/saveProviderTerm.php');

$mode=RequestHandler::getValue('mode');
$id = RequestHandler::getId('id');
$idCommand = RequestHandler::getId('idCommand');
$workCommandWorkUnit = RequestHandler::getId('workCommandWorkUnit');
$workCommandComplexity = RequestHandler::getId('workCommandComplexity');
$workCommandUnitAmount = RequestHandler::getValue('workCommandUnitAmount');
$workCommandQuantity = RequestHandler::getValue('workCommandQuantity');
$workCommandAmount = RequestHandler::getValue('workCommandAmount');
Sql::beginTransaction();
$result="";

if ($mode=='edit') {
  $workCommand = new WorkCommand($id);
  $nameWorkUnit = SqlList::getFieldFromId('WorkUnit',$workCommandWorkUnit,'reference');
  $nameComplexity = SqlList::getNameFromId('Complexity',$workCommandComplexity);
  $workCommand->name = $nameWorkUnit.' - '.$nameComplexity;
  $workCommand->idWorkUnit = $workCommandWorkUnit;
  $workCommand->idComplexity = $workCommandComplexity;
  $workCommand->commandQuantity = $workCommandQuantity;
  $workCommand->commandAmount = $workCommandQuantity * $workCommand->unitAmount;
  $res=$workCommand->save();
}else{
  $workCommand = new WorkCommand();
  $workCommand->idCommand = $idCommand;
  $nameWorkUnit = SqlList::getFieldFromId('WorkUnit',$workCommandWorkUnit,'reference');
  $nameComplexity = SqlList::getNameFromId('Complexity',$workCommandComplexity);
  $workCommand->name = $nameWorkUnit.' - '.$nameComplexity;
  $workCommand->idWorkUnit = $workCommandWorkUnit;
  $workCommand->idComplexity = $workCommandComplexity;
  $workCommand->unitAmount = $workCommandUnitAmount;
  $workCommand->commandQuantity = $workCommandQuantity;
  $workCommand->commandAmount = $workCommandAmount;
  $res=$workCommand->save();
}

if (!$result) {
  $result=$res;
}
// Message of correct saving
displayLastOperationStatus($result);

?>