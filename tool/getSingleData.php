<?PHP
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
 * Get the list of objects, in Json format, to display the grid list
 */
    require_once "../tool/projeqtor.php"; 
    if (ob_get_length()){
      ob_clean();  // Important : clean possible extra char before returning data;
    }
    scriptLog('   ->/tool/getSingleData.php');
    $type=RequestHandler::getValue('dataType'); // checked against constant values
    if ($type=='resourceCost') {
      $idRes=RequestHandler::getId('idResource'); // validated to be numeric value in SqlElement base constructor.
      if (! $idRes) return;
      $idRol=RequestHandler::getId('idRole');
      if (! $idRol) return;
      $r=new ResourceAll($idRes);//florent ticket #5263
      echo $r->getActualResourceCost($idRol);
    } else if ($type=='resourceCostDefault') {
      $idRol=RequestHandler::getId('idRole');
      if (! $idRol) return;
      $role=new Role($idRol);
      $isSubContractor = RequestHandler::getBoolean('isSubContractor');
      if($isSubContractor){
        if ($role->defaultExternalCost) {
          echo $role->defaultExternalCost;
          return;
        }
      }else{
        if ($role->defaultCost) {
          echo $role->defaultCost;
          return;
        }
      }
    } else if ($type=='resourceRole') {
      $idRes=RequestHandler::getId('idResource'); // validated to be numeric value in SqlElement base constructor.
      $isTeam=RequestHandler::getBoolean('isTeam');
      $isOrganization=RequestHandler::getBoolean('isOrganization');
      $isResourceTeam=RequestHandler::getBoolean('isResourceTeam');
      if (! $idRes) return;
      if($isTeam){
        $crit = array('idTeam'=>$idRes);
      	$resourceList = SqlList::getListWithCrit('Resource', $crit);
      	$roleArray = array();
      	foreach ($resourceList as $id=>$name){
      	  $res = new ResourceAll($id);
      	  $roleArray[$res->idRole]= $res->idTeam;
      	}
      	if(count($roleArray) == 1){
      	  $roleArray = array_flip($roleArray);
      	  echo $roleArray[$idRes];
      	}else{
      	  return;
      	}
      }else if($isOrganization){
        $crit = array('idOrganization'=>$idRes);
        $resourceList = SqlList::getListWithCrit('Resource', $crit);
        $roleArray = array();
        foreach ($resourceList as $id=>$name){
            $res = new ResourceAll($id);
        	$roleArray[$res->idRole]= $res->idOrganization;
        }
        if(count($roleArray) == 1){
            $roleArray = array_flip($roleArray);
        	echo $roleArray[$idRes];
        }else{
      	  return;
      	}
      }else if($isResourceTeam){
          $crit = array('idResourceTeam'=>$idRes);
          $rta=new ResourceTeamAffectation();
          $list=$rta->getSqlElementsFromCriteria($crit);
          $roleArray = array();
          foreach ($list as $l){
              $res = new ResourceAll($l->idResource);
              $roleArray[$res->idRole]= $idRes;
          }
          if(count($roleArray) == 1){
              $roleArray = array_flip($roleArray);
              echo $roleArray[$idRes];
          }else{
              return;
          }
      }else{
        $r=new ResourceAll($idRes);
        echo $r->idRole;
      }
      return;
    } else if ($type=='isResourceTeam') {
      $idRes=RequestHandler::getId('idResource'); // validated to be numeric value in SqlElement base constructor.
      if (! $idRes) return;
      $r=new ResourceAll($idRes);
      echo $r->isResourceTeam;
    } else if ($type=='resourceProfile') {
      $idRes=RequestHandler::getId('idResource'); // validated to be numeric value in SqlElement base constructor.
      if (! $idRes) return;
      $r=new Affectable($idRes);
      echo $r->idProfile;
    } else if ($type=='resourceCapacity') {
      $idRes=RequestHandler::getId('idResource'); // validated to be numeric value in SqlElement base constructor.
      if (! $idRes) return;
      $r=new Resource($idRes);
      echo $r->capacity;
    } else if ($type=='defaultPlanningMode') {
      $idType=RequestHandler::getId('idType');
      $className=RequestHandler::getClass('objectClass');
      $typeClass=$className.'Type';
      $type=new $typeClass($idType);
      $planningModeName='id'.$className.'PlanningMode';
      echo $type->$planningModeName;
    } else if ($type=='defaultPriority') {
      $idType=RequestHandler::getId('idType');
      $className=RequestHandler::getClass('objectClass');
      $typeClass=$className.'Type';
      $type=new $typeClass($idType);
      $planningPriority='priority';
      echo $type->$planningPriority;
    } else if ($type=='restrictedTypeClass') {
      $idProjectType=RequestHandler::getId('idProjectType');
      $idProject=RequestHandler::getId('idProject');
      $idProfile=RequestHandler::getId('idProfile');
      $list=Type::getRestrictedTypesClass($idProject,$idProjectType,$idProfile);
      $cpt=0;
      foreach ($list as $cl) {
        $cpt++;
        echo (($cpt>1)?', ':'').$cl;
      }
    } else if ($type=='affectationDescription') {
      $idAffectation=RequestHandler::getId('idAffectation');
      $aff=new Affectation($idAffectation);
      echo formatAnyTextToPlainText($aff->description,false);
    } else if ($type=='affectationDescriptionResourceTeam') {
      $idAffectation=RequestHandler::getId('idAffectation');
      $aff=new ResourceTeamAffectation($idAffectation);
      echo formatAnyTextToPlainText($aff->description,false);
    } else if ($type=='resourceCapacityDescription') {
      $idResourceCapacity=RequestHandler::getId('idResourceCapacity');
      $resCap=new ResourceCapacity($idResourceCapacity);
      echo formatAnyTextToPlainText($resCap->description,false);
    } else if ($type=='resourceSurbookingDescription') {
      $idResourceSurbooking=RequestHandler::getId('idResourceSurbooking');
      $resSur=new ResourceSurbooking($idResourceSurbooking);
      echo formatAnyTextToPlainText($resSur->description,false);
    } else if ($type=='assignmentDescription') {
      $idAssignment=RequestHandler::getId('idAssignment');
      $ass=new Assignment($idAssignment);
      echo formatAnyTextToPlainText($ass->comment,false);
    } else if ($type=='responsible') {
      $responsibleFromProduct=Parameter::getGlobalParameter('responsibleFromProduct');
    	if (!$responsibleFromProduct) $responsibleFromProduct='always';
    	$idC=RequestHandler::getId('idComponent');
    	$idP=RequestHandler::getId('idProduct');
    	$idR=RequestHandler::getId('idResource');
    	if ($responsibleFromProduct=='always' or ($responsibleFromProduct=='ifempty' and !pq_trim($idR))) { 
    	  $comp=new Component($idC,true);
    	  if ($comp->idResource) {
    	    echo $comp->idResource;
    	  } else {
    	    $prod=new Product($idP,true);
    	    if ($prod->idResource) {
    	      echo $prod->idResource;
    	    }
    	  }
    	}
    } else if ($type=='dependencyComment') {
      $idDependency=RequestHandler::getId('idDependency');
      $dep=new Dependency($idDependency);
      echo $dep->comment;	  
    } else if ($type=='count') {
      $class=RequestHandler::getClass('class');
      $obj=new $class();
      $cpt=1;
      $crit=array();
      while (RequestHandler::isCodeSet('param'.$cpt) and RequestHandler::isCodeSet('value'.$cpt) ){
        $param=RequestHandler::getAlphanumeric('param'.$cpt);
        $value=RequestHandler::getValue('value'.$cpt);
        $value=htmlEncode($value);
        $crit[$param]=$value;
        $cpt++;
      }      
      $val=$obj->countSqlElementsFromCriteria($crit);
      echo $val;
    } else if ($type=='defaultCategory'){
      $idType=RequestHandler::getId('idType');
      $className=RequestHandler::getClass('objectClass');
      $typeClass=$className.'Type';
      $type=new $typeClass($idType);
      echo $type->idCategory;
    } else if ($type=='catalogBillLine') { //gautier #2516
      $idCat=RequestHandler::getId('idCatalog'); 
      $r=new Catalog($idCat);
      $catalog_array = "$r->description#!#!#!#!#!#$r->detail#!#!#!#!#!#$r->nomenclature#!#!#!#!#!#$r->unitCost#!#!#!#!#!#$r->idMeasureUnit#!#!#!#!#!#$r->specification#!#!#!#!#!#$r->quantity";
      echo $catalog_array;
    }else if($type=='providerPayment'){
      $idBill=pq_trim(RequestHandler::getValue('idBill'));
      $idTerm=pq_trim(RequestHandler::getValue('idTerm'));
      if ($idBill) {
        $bill=new ProviderBill($idBill);
        $totalFullAmount = $bill->totalFullAmount;
        echo $totalFullAmount;
        //echo pq_str_replace('.', ',', $totalFullAmount);
      } else if ($idTerm) {
        $term = new ProviderTerm($idTerm);
        $fullAmount = $term->fullAmount;
        echo $fullAmount;
      }
    } else if ($type=='contactPhone') { 
        $idContact=RequestHandler::getId('idContact');
        if (!$idContact) return;
        $contact=new Contact($idContact);
        echo ($contact->phone)?$contact->phone:$contact->mobile;
    } else if ($type=='brandOfModel') {
        $idModel=RequestHandler::getId('idModel');
        $model=new Model($idModel);
        echo $model->idBrand;
    }else if($type=='workCommand'){
      $idComplexity = RequestHandler::getId('idComplexity');
      $idWorkUnit = RequestHandler::getId('idWorkUnit');
      $complexityValues=SqlElement::getSingleSqlElementFromCriteria('ComplexityValues',array('idComplexity'=>$idComplexity,'idWorkUnit'=>$idWorkUnit));
      echo htmlDisplayNumericWithoutTrailingZeros($complexityValues->price);
    }else if($type=='billedWorkCommand'){
        $idWorkCommand = RequestHandler::getId('idWorkCommand');
        $workCommand = new WorkCommand($idWorkCommand);
        $name=SqlList::getNameFromId('WorkUnit', $workCommand->idWorkUnit);
        $complex = SqlList::getNameFromId('Complexity', $workCommand->idComplexity);
        $workCommand_array = "$name#!#!#!#!#!#$complex#!#!#!#!#!#$workCommand->unitAmount#!#!#!#!#!#$workCommand->commandQuantity;#!#!#!#!#!#$workCommand->doneQuantity#!#!#!#!#!#$workCommand->billedQuantity";
        echo $workCommand_array;
    }else if($type=='billedWorkCommandQuantityAdd'){
      $idWorkCommand = RequestHandler::getId('idWorkCommand');
      $workCommand = new WorkCommand($idWorkCommand);
      echo $workCommand->billedQuantity;
    }else if($type=='billedWorkCommandQuantityEdit'){
      $idWorkCommand = RequestHandler::getId('idWorkCommand');
      $workCommand = new WorkCommand($idWorkCommand);
      $idWorkCommandBill = RequestHandler::getValue('idWorkCommandBill');
      $workCommandBill = new WorkCommandBilled($idWorkCommandBill);
      $total = ($workCommand->billedQuantity)-($workCommandBill->billedQuantity);
      echo $total;
    }else if($type=='editLink'){  
      $id = RequestHandler::getId('idLink');
      $link = new Link($id,true);
      echo $link->comment;
    }else if($type=='editPokerItem'){  
      $id = RequestHandler::getId('idPokerItem');
      $pokerItem = new PokerItem($id,true);
      echo $pokerItem->comment;
    }else if($type=='editAttachment'){
      $id = RequestHandler::getId('id');
      $att = new Attachment($id,true);
      echo $att->description;
    }else if($type=='validityDate'){
      $id = RequestHandler::getId('idWorkUnit');
      $workUnit = new WorkUnit($id);
      echo $workUnit->validityDate;
    }else if($type=='selectResourceTransformIdToName'){
      $value = "";
      $idResources = RequestHandler::getValue('idResource');
      $idAffectable = pq_explode(";", $idResources);
      $number = 1;
      $countNumber = count($idAffectable);
      foreach ($idAffectable as $myId){
        if($number > 1 and $number <= $countNumber  ){ $value.= ';'; $value.= "\n";  } 
        $value.= SqlList::getNameFromId('Affectable', $myId);
        $number++;
      }
      echo $value;
    }else if($type=='Notification'){  
      $id=RequestHandler::getId('idNotification');
      $alert = new Alert($id);
      $data = "$alert->refType#!#!#!#!#!#$alert->refId";
      echo $data;
    }else if($type=='NotificationTree'){
        $id=RequestHandler::getId('idNotification');
        $notif = new Notification($id);
        //$data = "$notif->refType#!#!#!#!#!#$notif->refId";
        //echo $data;
    }else if($type=='getOwnAllocation'){
      $data = 0;   
      $id=RequestHandler::getId('id');
      $userId = getSessionUser()->id;
      $aff = new Affectation($id);
      if($aff->idResource==$userId)$data = 1;
      echo $data;
    }else if($type=='attributionVoteRule'){
      $data = 'none';
      $id=RequestHandler::getId('id');
      $voteRule = new VotingAttributionRule($id);
      if($voteRule->refType)$data=$voteRule->refType;
      $data .= "#!#!#!#!#!#";
      $value = 0;
      if($voteRule->fixValue)$value=$voteRule->fixValue;
      if($voteRule->weeklyValue)$value=$voteRule->weeklyValue;
      if($voteRule->dailyValue)$value=$voteRule->dailyValue;
      if($voteRule->monthlyValue)$value=$voteRule->monthlyValue;
      if($voteRule->yearlyValue)$value=$voteRule->yearlyValue;
      $data .= $value;
      echo $data;
    }else if($type=='existingRightForLeaveType'){
      $idLeaveType=RequestHandler::getId('id');
      $leavType=new LeaveType($idLeaveType);
      echo ($leavType->notRequiredRight)?'true':'false';  
    }else if($type=='selectGroup'){
      $data = '';
      $idGroup=RequestHandler::getId('idGroup');
      $group = new LayoutGroupUser();
      $lstGroup = $group->getSqlElementsFromCriteria(array('idLayoutGroup'=>$idGroup));
      foreach ($lstGroup as $idGroupUser){
        $data .= "#!#!#!#!#!#";
        $data .= $idGroupUser->idUser;
      }
      echo $data;
    }else if($type=='voteSelf'){
       $value = RequestHandler::getValue('id');
       $voteUserId = RequestHandler::getId('voteUserId');
       $voteUser = new VotingAttribution($voteUserId);
       $valueUser = RequestHandler::getId('valueUser');
       $maxPointPerUser = $voteUser->leftValue;
       if($valueUser){
        $data = $maxPointPerUser - abs($value) + abs($valueUser);
        if($value==0)$data = $maxPointPerUser + abs($valueUser);
       }else{
         $data = $maxPointPerUser - abs($value);
         if($value==0)$data = $maxPointPerUser;
       }
       echo $data;
    }else if($type=='canCreateObject'){
      $className = RequestHandler::getClass('objectClass');
      $objectId = RequestHandler::getId('objectId');
      $obj = new $className($objectId);
      if(($className == 'Project' && $obj->codeType == 'TMP') && $prfCode == 'PL'){
        $right='YES';
      }else{
        $right=securityGetAccessRightYesNo('menu' . $className,'create', $obj);
      }
      echo $right;
    }else if($type=='canUpdateObject'){
      $className = RequestHandler::getClass('objectClass');
      $objectId = RequestHandler::getId('objectId');
      $obj = new $className($objectId);
      $right=securityGetAccessRightYesNo('menu' . $className,'update', $obj);
      echo $right;
    }else if($type=='canDeleteObject'){
      $className = RequestHandler::getClass('objectClass');
      $objectId = RequestHandler::getId('objectId');
      $obj = new $className($objectId);
      $right=securityGetAccessRightYesNo('menu' . $className,'delete', $obj);
      echo $right;
    }else if($type=='canCopyObject'){
      $className = RequestHandler::getClass('objectClass');
      $objectId = RequestHandler::getId('objectId');
      $obj = new $className($objectId);
      $prfCode=SqlList::getFieldFromId('Profile',$user->idProfile,'profileCode');
      if(($className == 'Project' && $obj->codeType == 'TMP') && $prfCode == 'PL'){
        $right='YES';
      }else{
        $read=securityGetAccessRightYesNo('menu' . $className,'read', $obj);
        $create=securityGetAccessRightYesNo('menu' . $className,'create');
        $right = ($read == 'YES' and $create == 'YES')?'YES':'NO';
      }
      echo $right;
    }else if($type=='isClosed'){
      $className = RequestHandler::getClass('objectClass');
      $objectId = RequestHandler::getId('objectId');
      $obj = new $className($objectId);
      echo $obj->idle;
    }else {
      debugTraceLog("Unknown type '$type'");          
      echo '';
    } 
?>