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
 * Assignment defines link of resources to an Activity (or else)
 */  
require_once('_securityCheck.php');
class Assignment extends SqlElement {

  // extends SqlElement, so has $id

  public $_sec_Description;
  public $id;    // redefine $id to specify its visible place 
  public $idProject;
  public $refType;
  public $refId;
  public $_spe_itemName;
  public $idResource;
  public $uniqueResource;
  public $idRole;
  public $dailyCost;
  public $newDailyCost;
  public $rate;
  public $capacity;
  public $optional;
  public $comment;
  public $idle;
  public $_sec_Progress;
  public $_separator_sectionDates;
  public $_tab_2_2_smallLabel = array('planned', 'real', 'startDate', 'endDate');
  public $realStartDate;
  public $plannedStartDate;
  public $realEndDate;
  public $plannedEndDate;
  public $_separator_sectionCostWork;
  public $_tab_4_2_smallLabel = array('assigned', 'real', 'left', 'reassessed', 'work', 'cost');
  public $assignedWork;
  public $realWork;
  public $leftWork;
  public $plannedWork;
  public $assignedCost;
  public $realCost;
  public $leftCost;
  public $plannedCost;
  public $notPlannedWork;
  public $plannedStartFraction;
  public $plannedEndFraction;
  public $billedWork;
  public $isNotImputable;
  public $isResourceTeam;
  public $isMaterial;
  public $surbooked;
  public $supportedAssignment;
  public $supportedResource;
  public $hasSupport;
  public $manual;
  public static $_skipRightControl=false;
  
  private static $_fieldsAttributes=array("idProject"=>"required", 
    "idResource"=>"required", 
    "refType"=>"required, nobr", 
    "refId"=>"required,size1/3",
    "realWork"=>"readonly,noImport",
    "plannedWork"=>"readonly,noImport",
    "notPlannedWork"=>"readonly,noImport",
    "plannedStartDate"=>"readonly,noImport",
    "plannedStartFraction"=>"hidden,noImport",
    "plannedEndDate"=>"readonly,noImport",
    "plannedEndFraction"=>"hidden,noImport",
    "realStartDate"=>"readonly,noImport",
    "realEndDate"=>"readonly,noImport",
    "assignedCost"=>"readonly,noImport",
    "realCost"=>"readonly,noImport",
    "leftCost"=>"readonly,noImport",
    "plannedCost"=>"readonly,noImport",
    "billedWork"=>"hidden,noImport",
    "dailyCost"=>"hidden,noImport",
    "newDailyCost"=>"readonly,noImport",
    "isResourceTeam"=>"hidden,noImport",
    "isMaterial"=>"hidden,noImport",
    "surbooked"=>"hidden,noImport",
    "isNotImputable"=>"hidden,noImport",
    "supportedAssignment"=>"hidden,noImport",
    "supportedResource"=>"hidden,noImport",
    "hasSupport"=>"hidden,noImport",
    "manual"=>"hidden,noImport",
  );
  
  private static $_layout='
    <th field="id" formatter="numericFormatter" width="5%"># ${id}</th>
    <th field="nameResource" formatter="thumbName22" width="25%">${idResource}</th>
    <th field="nameProject" formatter="nameFormatter" width="25%">${idProject}</th>
    <th field="refType" formatter="translateFormatter" width="10%">${refType}</th>
    <th field="refId" formatter="numericFormatter" width="10%">${refId}</th>
    <th field="rate" formatter="numericFormatter" width="5%">${rate}</th>
    <th field="assignedWork" formatter="workFormatter" width="10%">${assignedWork}</th>
    <th field="nameRole" formatter="nameFormatter" width="10%">${idRole}</th>
    ';
  
  private static $_colCaptionTransposition = array(
      "dailyCost"=>"cost",
      "refType"=>"element"
  );
  
   /** ==========================================================================
   * Constructor
   * @param $id the id of the object in the database (null if not stored yet)
   * @return void
   */ 
  function __construct($id = NULL, $withoutDependentObjects=false) {
    parent::__construct($id,$withoutDependentObjects);
  }

  
   /** ==========================================================================
   * Destructor
   * @return void
   */ 
  function __destruct() {
    parent::__destruct();
  }

// ============================================================================**********
// MISCELLANOUS FUNCTIONS
// ============================================================================**********
  
  /** ==========================================================================
   * Return the specific fieldsAttributes
   * @return the fieldsAttributes
   */
  protected function getStaticFieldsAttributes() {
//     if ($this->id) {
//       if (! $this->isResourceTeam) {
//         self::$_fieldsAttributes['uniqueResource']='hidden';
//         self::$_fieldsAttributes['capacity']='hidden';
//       } else {
//         self::$_fieldsAttributes['rate']='hidden';
//         self::$_fieldsAttributes['uniqueResource']='';
//         self::$_fieldsAttributes['capacity']='';
//       }
//     }
    if ($this->refType=='Meeting') {
      self::$_fieldsAttributes['optional']='';
    } else {
      self::$_fieldsAttributes['optional']='hidden';
    }
    return self::$_fieldsAttributes;
  }
  
  /**
   * ==========================================================================
   * Return the specific layout
   *
   * @return the layout
   */
  protected function getStaticLayout() {
    return self::$_layout;
  }
  
  /** ============================================================================
   * Return the specific colCaptionTransposition
   * @return the colCaptionTransposition
   */
  protected function getStaticColCaptionTransposition($fld=null) {
    return self::$_colCaptionTransposition;
  }
  /**
   * Save object 
   * @see persistence/SqlElement#save()
   */
  public function save() {
    $old=$this->getOld();
    
    if(Parameter::getGlobalParameter("statusChangeAssignment")=="YES" and property_exists($this->refType, 'idStatus')){
      $countAss=$this->countSqlElementsFromCriteria(array("refType"=>$this->refType,"refId"=>$this->refId));
      if($countAss==0){
        $user=getSessionUser();
        $obj= new $this->refType($this->refId);
        //$type=$this->refType.'Type';
        //$idType='id'.$type;
        $idType=$obj->getObjectTypeName();
        $type=substr($idType,2);
        $objType=new $type($obj->$idType);
        $idStatus=$obj->idStatus;
        $idProfile=$user->getProfile($this->idProject);
        $status=new Status($idStatus);
        if(!$status->setAssignedStatus){
          $workFlowStatus=new WorkflowStatus();
          $clause =" sortOrder > $status->sortOrder and setAssignedStatus=1 ";
          $idStatusTo=$status->getSqlElementsFromCriteria(null,false,$clause,'sortOrder ASC ',null,null,1);
          $idStatusTo=(!empty($idStatusTo))?$idStatusTo[0]->id:'0';
          $where = "idWorkflow=$objType->idWorkflow and idStatusFrom = $idStatus and idStatusTo = $idStatusTo and idProfile=$idProfile and allowed=1";
          $newStatus=$workFlowStatus->getSqlElementsFromCriteria(null,false,$where);
          if(!empty($newStatus)){
            $newStatus=array_shift($newStatus);
            $obj->idStatus=$newStatus->idStatusTo;
            $res=$obj->simpleSave();
            $res='_refreshStatusObject';
          }
        }

      }
    }
    
    if ($this->comment) {
      $comLength=intval($this->getDataLength('comment'));
      if ($comLength>0 and pq_strlen($this->comment)> $comLength) {
        $this->comment=pq_substr($this->comment, 0,$comLength);
        $lastBr=strrpos($this->comment,"\n");
        if ($lastBr>0) $this->comment=pq_substr($this->comment, 0,$lastBr-1);
      }
    }
    $additionalAssignedWork=$this->assignedWork-$old->assignedWork;
    $additionalLeftWork=$this->leftWork-$old->leftWork;
    
    if ($this->billedWork===null or $this->billedWork<0){
      $this->billedWork=0;
    }
  	$creation=($this->id)?false:true;
  	
    if (! $this->realWork) { $this->realWork=0; }
    // if cost has changed, update work 
    
    if ($this->refType=='Meeting' and ! $this->plannedStartDate) {
      $meeting=new $this->refType($this->refId);
      $this->plannedStartDate=$meeting->meetingDate;
      $this->plannedEndDate=$meeting->meetingDate;
    }
    
    if ($this->refType=='PokerSession' and ! $this->plannedStartDate) {
    	$pokerSession=new $this->refType($this->refId);
    	$this->plannedStartDate=$pokerSession->pokerSessionDate;
    	$this->plannedEndDate=$pokerSession->pokerSessionDate;
    }
    
    $r=new ResourceAll($this->idResource);
    $this->isResourceTeam=$r->isResourceTeam; // Store isResourceTeam from Resource for convenient use
    $this->isMaterial=$r->isMaterial; // Store isResourceTeam from Resource for convenient use
    if (!$this->id and !$this->supportedAssignment and !$this->manual) { // on creation
      $this->hasSupport=0;
      $rs=new ResourceSupport();
      $cpt=$rs->countSqlElementsFromCriteria(array('idResource'=>$this->idResource));
      if ($cpt>0) $this->hasSupport=1;
    }
      
    // If idRole not set, set to default for resource
    if (! $this->idRole) {
      $this->idRole=$r->idRole;
    }
    if($this->idle){
      $this->leftWork=0;
    }
    
    $today=date('Y-m-d');
    if ($this->realStartDate) {                                    // If started, take into account actual cost
      $newCost=$r->getActualResourceCost($this->idRole); 
    } else if ($this->plannedStartDate) {                          // If NOT started, take into account actual cost at plannedStartDate
      $newCost=$r->getActualResourceCost($this->idRole,$this->plannedStartDate);
    } else {                                                       // If NOT started and not planned, take into account actual cost
      $newCost=$r->getActualResourceCost($this->idRole);
    }
    $this->newDailyCost=$newCost;
    if ( $old->idRole!=$this->idRole and $newCost != $this->dailyCost ) {
      $this->dailyCost=$newCost;
    }
    $this->leftCost=$this->leftWork*$newCost;
    $this->plannedCost = $this->realCost + $this->leftCost;
    if ($this->dailyCost===null) {
      $this->dailyCost=$newCost;
      if (! $this->idRole) {
        // search idRole found for newDailyCost
        $where="idResource=" . Sql::fmtId($this->idResource);
        $where.= " and endDate is null";
        $where.= " and cost=" . (($newCost)?$newCost:'0');
        $rc=new ResourceCost();
        $lst = $rc->getSqlElementsFromCriteria(null, false, $where, "startDate desc");
        if (count($lst)>0) {
          $this->idRole=$lst[0]->idRole;
        }
      }      
    }
    if (!$this->dailyCost) $this->dailyCost=0;
    if (!$this->newDailyCost) $this->newDailyCost=0;
    if (!$this->assignedWork) $this->assignedWork=0;
    if(! $this->dailyCost && $this->newDailyCost){
      $this->assignedCost=round($this->assignedWork*floatval($this->newDailyCost),2);
    } else {
      $this->assignedCost=round($this->assignedWork*floatval($this->dailyCost),2);
    }
    
    if ($this->refType=='PeriodicMeeting') {
    	$this->idle=1;
    	$this->leftWork=0;
    	$this->realWork=0;
    	$this->plannedWork=0;
    }
    
    if (! $this->idProject) {
      if (!SqlElement::class_exists($this->refType)) return "ERROR '$this->refType' is not a valid class";
    	$refObj=new $this->refType($this->refId);
    	$this->idProject=$refObj->idProject;
    }
    
    $this->plannedWork = $this->realWork + $this->leftWork;
    if($this->refType=="Activity" and Parameter::getGlobalParameter('activityOnRealTime')=='YES'){
      if(!isset($refObj))$refObj=new $this->refType($this->refId);
      if($refObj->workOnRealTime==1 and $this->plannedWork!=$this->assignedWork){
        $this->assignedWork=$this->plannedWork;
      }
    }
    if ($this->rate===null) $this->rate=100;
    // Dispatch value
    $result = parent::save();
    if (getLastOperationStatus($result)!="OK") {
      return $result;     
    }
    
    if (property_exists($this, "_skipDispatch") and $this->_skipDispatch==true) { // When called from Assignment::insertAdministrativeLines(), no dispatch needed
      return $result;
    }
    if(isset($res))$result.=$res;
    if ($this->refType=='PeriodicMeeting') {
      $meet=new Meeting();
      $lstMeet=$meet->getSqlElementsFromCriteria(array('idPeriodicMeeting'=>$this->refId));
      foreach ($lstMeet as $meet) {
        if($meet->meetingDate < date('Y-m-d'))continue;
        $res = new ResourceAll($this->idResource, true);
        if($res->startDate != '' and $res->startDate > $meet->meetingDate)continue;
        if($res->endDate != ''  and $res->endDate < $meet->meetingDate)continue;
        $critArray=array('refType'=>'Meeting', 'refId'=>$meet->id, 'idResource'=>$this->idResource, 'idRole'=>$this->idRole);
        $ass=SqlElement::getSingleSqlElementFromCriteria('Assignment', $critArray);
        if (!$ass or !$ass->id) {
        	$ass->realWork=0;
            $ass->realCost=0;
        }
      	$ass->refType='Meeting';
      	$ass->refId=$meet->id;
      	$ass->idResource=$this->idResource;
      	$ass->idRole=$this->idRole;
      	$ass->idProject=$this->idProject;
        $ass->comment=$this->comment;
        $ass->assignedWork=$this->assignedWork;
        $ass->leftWork=$ass->assignedWork-$ass->realWork;
        $ass->plannedWork=$ass->assignedWork;
        $ass->rate=$this->rate;
        $ass->dailyCost=$this->dailyCost;
        $ass->assignedCost=$this->assignedCost;
        $ass->leftCost=$ass->assignedCost-$ass->realCost;
        $ass->plannedCost=$ass->assignedCost;
        $ass->idle=0;      	
        $ass->optional=$this->optional;
        $resAss=$ass->save();
      }
    }
    if ($this->refType=='PokerSession') {
      $pokerM = new PokerResource();
      $pokerMember = $pokerM->getSqlElementsFromCriteria(array('idAssignment'=>$this->id, 'idResource'=>$this->idResource, 'idPokerSession'=>$this->refId));
      if(count($pokerMember) == 0){
        $pokerM->idPokerSession = $this->refId;
        $pokerM->idResource = $this->idResource;
        $pokerM->idAssignment = $this->id;
        $pokerM->save();
      }
    }
    if (! PlanningElement::$_noDispatch) {
      PlanningElement::updateSynthesis($this->refType, $this->refId);
      if ($this->refType!=$old->refType or $this->refId!=$old->refId) {
        PlanningElement::updateSynthesis($old->refType, $old->refId);
      }
    } else {
      PlanningElement::updateSynthesisNoDispatch($this->refType, $this->refId);
      if ($this->refType!=$old->refType or $this->refId!=$old->refId) {
        PlanningElement::updateSynthesisNoDispatch($old->refType, $old->refId);
      }
    }

    // Recalculate indicators
    if (SqlList::getIdFromTranslatableName('Indicatorable',$this->refType)) {
      $indDef=new IndicatorDefinition();
      $crit=array('nameIndicatorable'=>$this->refType);
      $lstInd=$indDef->getSqlElementsFromCriteria($crit, false);
      if (count($lstInd)>0) {
      	$item=new $this->refType($this->refId);
        foreach ($lstInd as $ind) {
          $fldType='id'. $this->refType .'Type';
          if (! $ind->idType or $ind->idType==$item->$fldType) {
            IndicatorValue::addIndicatorValue($ind,$item);
          }
        }
      }
    }
    
    // If Resource is part of Resource Team (Pool), subtract additional work from Pool
    if ($additionalAssignedWork>0 and !isset($this->_origin) and ! SqlElement::isCopyInProgress() ) {
      $arrTeams=array();
      $currentRefType=$this->refType;
      $currentRefId=$this->refId;
      $stop=false;
      if ($this->isResourceTeam) {
        $arrTeams[$this->idResource]=$this->idResource;
        if (property_exists($currentRefType,'idActivity')) {
          $item=new $currentRefType($currentRefId);
          if ($item->idActivity) {
            $currentRefType='Activity';
            $currentRefId=$item->idActivity;
          } else {
            $stop=true;
          }
        }
      } else {
        $rta=new ResourceTeamAffectation();
        $rtaList=$rta->getSqlElementsFromCriteria(array('idResource'=>$this->idResource,'idle'=>'0'));    
        $today=date('Y-m-d');
        foreach($rtaList as $rta) {
          if (!$rta->idle and ($rta->endDate==null or $rta->endDate>$today ) ) {
            $arrTeams[$rta->idResourceTeam]=$rta->idResourceTeam;
          }
        }
      }
      while ($additionalAssignedWork>0 and !$stop) {
        $assList=$this->getSqlElementsFromCriteria(array('refType'=>$currentRefType,'refId'=>$currentRefId,'isResourceTeam'=>'1'));
        //if (count($assList)==0) $stop=true;
        foreach ($assList as $ass) {
          if (isset($arrTeams[$ass->idResource])) { // Current ressource is part of team already assigned, subtract additional work
            $subtractable=($ass->assignedWork>$additionalAssignedWork)?$additionalAssignedWork:$ass->assignedWork;
            if ($subtractable>0) {
              $ass->assignedWork-=$subtractable;
              if ($ass->assignedWork<0) $ass->assignedWork=0;
              $ass->leftWork-=$subtractable;
              if ($ass->leftWork<0) $ass->leftWork=0;
              if ($ass->leftWork==0 and $ass->realWork==0) {
                $ass->delete();
              } else {
                $ass->save();
              }
              //$stop=true;
              $additionalAssignedWork-=$subtractable;
            }
          }
        }
        if (!$stop and $additionalAssignedWork>0 and property_exists($currentRefType,'idActivity')) {
          $item=new $currentRefType($currentRefId);
          if ($item->idActivity) {
            $currentRefType='Activity';
            $currentRefId=$item->idActivity;
          } else {
            $stop=true;
          }
        } else {
          $stop=true;
        }
      }
    }
    
    if ($old->leftWork!=$this->leftWork or $old->realWork!=$this->realWork) {
      Project::setNeedReplan($this->idProject);
    }
    
    if ($this->hasSupport and ($this->assignedWork!=$old->assignedWork or $this->leftWork!=$old->leftWork or $this->idle!=$old->idle or $this->rate!=$old->rate)) { // If resource has support, create / update support assignments
      $rs=new ResourceSupport();
      $lst=$rs->getSqlElementsFromCriteria(array('idResource'=>$this->idResource));
      foreach ($lst as $rs) {
        $rs->manageSupportAssignment($this);
      }
    }
    return $result;
  }
  
  // Save without extra save() feature and without controls
  public function simpleSave() {
    if (PlannedWork::$_planningInProgress and $this->id) {
      // Attention, we'll execute direct query to avoid concurrency issues for long duration planning
      // Otherwise, saving planned data may overwrite real work entered on Timesheet for corresponding items.
      $old=$this->getOld();
      $change=false;
      $fields=array('plannedStartDate','plannedStartFraction','plannedEndDate','plannedEndFraction','notPlannedWork','surbooked');
      if ($this->assignedWork!=$old->assignedWork) {
        $extraFields=array('assignedWork','assignedCost','leftWork','leftCost','plannedWork','plannedCost');
        $fields=array_merge($fields,$extraFields);
        if ($this->assignedWork<0) $this->assignedWork=0;
        if ($this->leftWork<0) $this->leftWork=0;
        $this->plannedWork=$this->leftWork+$old->realWork;
        $this->plannedCost=$this->leftCost+$old->realCost;
      }
      $this->leftWork=round($this->leftWork,5);
      $query="UPDATE ".$this->getDatabaseTableName(). " SET ";
      foreach($fields as $field) {
        if (pq_substr($field,-4)!='Date') {
          $newVal=floatval($this->$field);
          $oldVal=floatval($old->$field);
        } else {
          $newVal=$this->$field;
          $oldVal=$old->$field;
        }
        if ( strval($newVal) != strval($oldVal) ) {
          if ($change) $query.=',';
          if ($newVal===null or $newVal==='') {
            $query.=" $field=null ";
          } else if (pq_substr($field,-4)=='Date') {
            $query.=" $field='".$newVal."' ";
          } else {
            $query.=" $field=".$newVal;
          }
          $change=true;
          //History::store($this, $this->refType, $this->refId, 'update', $field, $oldVal, $newVal);
        }
      }
      $query.=" WHERE id=$this->id";
      if ($change) {
        Sql::query($query);
      }
      $result="OK";
    } else {
  	  $result = parent::saveForced();
    }
  	return $result;
  }
  /**
   * Delete object and dispatch updates to top 
   * @see persistence/SqlElement#save()
   */
  public function delete() {   
    if ($this->refType=='PeriodicMeeting') {
      $meet=new Meeting();
      $lstMeet=$meet->getSqlElementsFromCriteria(array('idPeriodicMeeting'=>$this->refId));
      foreach ($lstMeet as $meet) {
        $critArray=array('refType'=>'Meeting', 'refId'=>$meet->id, 'idResource'=>$this->idResource, 'idRole'=>$this->idRole);
        $ass=SqlElement::getSingleSqlElementFromCriteria('Assignment', $critArray);
        if ($ass and $ass->id and ! $ass->realWork) {
        	$ass->delete();
        }
      }
    }
    $result = parent::delete();
    if (! pq_strpos($result,'id="lastOperationStatus" value="OK"')) {
      return $result;     
    }
    // Delete planned work for the assignment
    $pw=new PlannedWork();
    $pwList=$pw->purge('idAssignment='.Sql::fmtId($this->id));
    
    $obj = new $this->refType($this->refId);
    $peName=$this->refType.'PlanningElement';
    if ($peName=='PeriodicMeetingPlanningElement') $peName='MeetingPlanningElement';
    $planningMode = new PlanningMode($obj->$peName->idPlanningMode);
    if($planningMode->code == 'MAN'){
    	$pwm = new PlannedWorkManual();
    	$pwm->purge('idAssignment='.$this->id);
    }
    
    //gautier #3646
    // If Resource is part of Resource Team (Pool) and Pool is assigned, add work from Pool
    if($this->refType=='Activity'){
      $resAffPool = new ResourceTeamAffectation();
      $lstResAffPool = $resAffPool->getSqlElementsFromCriteria(array('idResource'=>$this->idResource));
      if($lstResAffPool){
        $arrTeams=array();
        foreach ($lstResAffPool as $pool){
          $arrTeams[$pool->idResourceTeam]=$pool->idResourceTeam;
        }
        $idAct = $this->refId;
        
        $ass = new Assignment();
        $lstAss = $ass->getSqlElementsFromCriteria(array('refId'=>$this->refId,'refType'=>'Activity'));
        foreach ($lstAss as $value){
          if($value->isResourceTeam){
            if (in_array($value->idResource, $arrTeams)) {
              $assAdd = new Assignment($value->id);
              $assAdd->assignedWork += $this->assignedWork;
              $assAdd->leftWork += $this->leftWork;
              $assAdd->save();
            }
          }
        }
      }
    }
    //end
    
    // Update planning elements
    PlanningElement::updateSynthesis($this->refType, $this->refId);
    if ($this->leftWork!=0) {
      Project::setNeedReplan($this->idProject);
    }
    // Dispatch value
    
    if ($this->hasSupport) { // If resource has support, delete support assignments
      $rs=new ResourceSupport();
      $lst=$this->getSqlElementsFromCriteria(array('supportedAssignment'=>$this->id));
      foreach ($lst as $asSup) {
        $asSup->delete();
      }
    }
    
    return $result;
  }
  
  public function refresh() {
    $work=new Work();
    $crit=array('idAssignment'=>$this->id);
    $workList=$work->getSqlElementsFromCriteria($crit,false);
    $realWork=0;
    $realCost=0;
    $this->realStartDate=null;
    $this->realEndDate=null;
    foreach ($workList as $work) {
      $realWork+=$work->work;
      $realCost+=$work->cost;
      if ( !$this->realStartDate or $work->workDate<$this->realStartDate ) {
        $this->realStartDate=$work->workDate;
      }
      if ($this->assignedWork>0 and $this->leftWork==0) {
        if ( ! $this->realEndDate or $work->workDate > $this->realEndDate ) {
          $this->realEndDate=$work->workDate;
        }
      }     
    }
    $this->realWork=$realWork;
    $this->realCost=$realCost;
  }
  
  public function saveWithRefresh() {
    $this->refresh();
    return $this->save();
  }
  
  public static function updateProjectFromPlanningElement($refType, $refId, $idProject=null) {
    $ass=new Assignment(); $assTable=$ass->getDatabaseTableName();
    $pe=new PlanningElement(); $peTable=$pe->getDatabaseTableName();
    if (!$idProject) $idProject="(SELECT idProject FROM $peTable pe WHERE pe.refType=ass.refType and pe.refId=ass.refId)";
    $query="UPDATE $assTable ass SET idProject=$idProject WHERE refType='$refType' and refId=$refId";
    Sql::query($query);
  }

  public function getExtraHiddenFields($newType = "", $newStatus = "", $newProfile = "", $forExport=false) {
    $res=array();
    if ($newType=='*') return $res;
    $idResource=($newType and $newType!='*')?$newType:$this->idResource;
    $resource=new ResourceAll($idResource);
    if (! $resource->isResourceTeam) {
      $res[]='uniqueResource';
      $res[]='capacity';
    } else {
      $res[]='rate';
    }
    return $res;
  }
  public function getExtraRequiredFields($newType = "", $newStatus = "", $newPlanningMode="", $newProfile = "") {
    $res=array();
    if ($newType=='*') return $res;
    $adminProjects=Project::getAdminitrativeProjectList(true);
    if (isset($adminProjects[$this->idProject])) return $res;
    $idResource=($newType and $newType!='*')?$newType:$this->idResource;
    if (RequestHandler::isCodeSet('idResource')) $idResource=RequestHandler::getValue('idResource');
    $resource=new ResourceAll($idResource);
    if ($resource->isResourceTeam and ! $this->uniqueResource) {
      $res['capacity']='required';
    } else {
      $res['rate']='required';
    }
    return $res;
  }
/** =========================================================================
   * control data corresponding to Model constraints
   * @param void
   * @return "OK" if controls are good or an error message 
   *  must be redefined in the inherited class
   */
  public function control(){
    $result="";
    if (! $this->idResource) {
      $result.='<br/>' . i18n('messageMandatory', array(i18n('colIdResource')));
    }
    if (! SqlElement::class_exists($this->refType)) {
      $result.='<br/>' . i18n('invalidClassName', array($this->refType,''));
      return $result;
    }
    $obj = new $this->refType($this->refId);
    $classObj=get_class($obj);
    if ($classObj=='PeriodicMeeting')  $classObj='Meeting';
    $peFld=$classObj."PlanningElement";
    $planningMode = new PlanningMode($obj->$peFld->idPlanningMode);
      
    //gautier #4495
    if($this->id){
      $old=$this->getOld();
      if($this->idle==0 and $old->idle==1){
        $proj = new Project($this->idProject,true);
        $topProject = $proj->getTopProjectList(true);
        $aff = new Affectation();
        $where = " idResource = ".$this->idResource." and idProject in " . transformValueListIntoInClause($topProject);
        $affExist = $aff->countSqlElementsFromCriteria(null,$where);
        if(!$affExist){
          $result .= '<br/>' . i18n ( 'cantOpenActivityWithoutAffectedResource' );
        }
      }
      if ($this->idResource!=$old->idResource and $this->realWork>0) {
        $result .= '<br/>' . i18n ( 'msgUnableToMoveRealWork' );
      }
      // Many inconsistencies possible moving assignment : with real work, to another project, to another refType (Milestone ?), to another activity with different planning mode...    
      if ($this->refType!=$old->refType or $this->refId!=$old->refId) {
        $result .= '<br/>' . i18n ( 'msgUnableToMoveAssignment' );
      }
    }
    
    if($this->id and $this->refType == 'Activity' and $this->leftWork > 0) {
      $idActivityType = SqlList::getFieldFromId('Activity', intval($this->refId), 'idActivityType');
      $lockNoLeftOnDone = SqlList::getFieldFromId('ActivityType', $idActivityType, 'lockNoLeftOnDone');
      $idActivityStatus = SqlList::getFieldFromId('Activity', $this->refId, 'idStatus');
      $setDoneStatus = SqlList::getFieldFromId('Status', $idActivityStatus, 'setDoneStatus');
      if($lockNoLeftOnDone and $setDoneStatus){
        $result .= '<br/>'.i18n('statusMustChangeLeftDone');
      }
    }
    
    $defaultControl=parent::control();
    if ($defaultControl!='OK') {
      $result.=$defaultControl;
    }else if($this->refType=="Meeting" or $this->refType=="PokerSession"){ //  or $planningMode->code == 'MAN'
      $elm=SqlElement::getSingleSqlElementFromCriteria("Assignment", array('refType'=>$this->refType,'refId'=>$this->refId,'idResource'=>$this->idResource));
      if($elm && $elm->id && $elm->id!=$this->id){
        $result.='<br/>' . i18n('messageResourceDouble');
      }
    }
    if ($result=="") {
      $result='OK';
    }
    
    if($this->refType=='Activity'){
      $activity = new Activity($this->refId);
      $minimumThreshold = $activity->ActivityPlanningElement->minimumThreshold;
      if($minimumThreshold){
      	$res = new ResourceAll($this->idResource);
      	if($res->capacity*($this->rate/100) < $minimumThreshold){
      	  $workUnit = Parameter::getGlobalParameter('workUnit');
      	  $dayTime = 1;
      	  if($workUnit == 'hours'){
      	  	$dayTime = Parameter::getGlobalParameter('dayTime');
      	  }
      	  $result=i18n('minimumThresholdAssignError',array(($minimumThreshold*$dayTime).Work::displayShortWorkUnit()));
      	}
      }
      if($activity->ActivityPlanningElement->idPlanningMode==22 and !$this->id){
        $cpAssAct=$this->countSqlElementsFromCriteria(array("refId"=>$activity->id,"refType"=>$this->refType,"idResource"=>$this->idResource));
        if($cpAssAct == 1)$result ='<br/>' .i18n("resourceAlreadyAssigned");
      }
    }
    
    if($this->refType=='Meeting'){
      $supp = new ResourceSupport();
      $suppList = $supp->getSqlElementsFromCriteria(array('idSupport'=>$this->idResource));
      if($suppList){
        foreach ($suppList as $id=>$obj){
          $ass = SqlElement::getSingleSqlElementFromCriteria('Assignment', array('idResource'=>$obj->idResource, 'refType'=>'Meeting'));
          if($ass->id){
            $result='<br/>' . i18n('errorSupportMeeting', array($obj->idResource, $obj->idSupport));
          }
        }
      }
    }

    return $result;
  }
  
  public static function insertAdministrativeLines($resourceId) {
    // Insert new assignment for all administrative activities
    if (! $resourceId) return;
    $type=new ProjectType();
    $critType=array('code'=>'ADM', 'idle'=>'0');
    $lstType=$type->getSqlElementsFromCriteria($critType,false,null,null,false,true);
    foreach ($lstType as $type) {
    	$proj=new Project();
    	$critProj=array('idProjectType'=>$type->id, 'idle'=>'0');
    	$lstProj=$proj->getSqlElementsFromCriteria($critProj,false,null,null,false,true);
    	foreach ($lstProj as $proj) {
// MTY - LEAVE SYSTEM
            if (isLeavesSystemActiv()) {
                // If the project is the Leave Project and is not visible ==> not taken into account
                if (Project::isTheLeaveProject($proj->id) && !Project::isProjectLeaveVisible()) {continue;}
            }
// MTY - LEAVE SYSTEM
            
    		$acti=new Activity();
    	  $critActi=array('idProject'=>$proj->id, 'idle'=>'0');
    	  $lstActi=$acti->getSqlElementsFromCriteria($critActi,false,null,null,false,true);
    	  foreach ($lstActi as $acti) {
          $assi=new Assignment();
          $critAssi=array('refType'=>'Activity', 'refId'=>$acti->id, 'idResource'=>$resourceId);
          $lstAssi=$assi->getSqlElementsFromCriteria($critAssi,false,null,null,false,true);
          if (count($lstAssi)==0) {
          	$assi->idProject=$proj->id;
          	$assi->refType='Activity';
          	$assi->refId=$acti->id;
          	$assi->idResource=$resourceId;          	
            $assi->assignedWork=0;
            $assi->realWork=0;
            $assi->leftWork=0;
            $assi->plannedWork=0;
            $assi->notPlannedWork=0;
            $assi->rate=0;
            $assi->idle=0;
            $assi->_skipDispatch=true;
            $res=$assi->save();
            if (getLastOperationStatus($res)!='OK') {
              traceLog("Error while creating Administrative Assignment for Resource #$assi->idResource on Activity #$assi->refId");
              traceLog($res);
            }
          }
    	  }
    	}
    }
  }
  public function getMenuClass() {
    return "menuActivity";
  }
  
  public function drawSpecificItem($item){
    global $print,$displayWidth;
    $labelWidth=175; // To be changed if changes in css file (label and .label)
    $largeWidth=( (intval($displayWidth)+30) / 2) - $labelWidth;
    $result="";
    if ($item=='itemName') {
      if (! $this->refType or ! $this->refId or ! SqlElement::class_exists($this->refType)) return '';
      $class=$this->refType;
      $item=new $class($this->refId);
      if (!$item->id) return '';
      $result .='<div style="position:relative;left:197px; height:20px">'.$item->name.'</div>';
    }
    return $result;
  }
  public function getValidationScript($colName) {
    $colScript = parent::getValidationScript ( $colName );
  
    if ($colName == "assignedWork") {
      $colScript .= '<script type="dojo/connect" event="onChange" >';
      $colScript .= '  var initAssigned='.(($this->assignedWork)?$this->assignedWork:0).';';
      $colScript .= '  var initLeft='.(($this->leftWork)?$this->leftWork:0).';';
      $colScript .= '  var diff=this.value-initAssigned; ';
      $colScript .= '  var left=initLeft+diff; ';
      $colScript .= '  if (left<0) left=0; ';
      $colScript .= '  dijit.byId("leftWork").set("value",left);';
      $colScript .= '  formChanged();';
      $colScript .= '</script>';
    } else if ($colName == "leftWork") {
      $colScript .= '<script type="dojo/connect" event="onChange" >';
      $colScript .= '  var left=dijit.byId("leftWork").get("value");';
      $colScript .= '  var real=dijit.byId("realWork").get("value");';
      $colScript .= '  dijit.byId("plannedWork").set("value",left+real);';
      $colScript .= '  formChanged();';
      $colScript .= '</script>';
    } else if ($colName == "idResource") {
      $colScript .= '<script type="dojo/connect" event="onChange" >';
      $colScript .= '  getExtraHiddenFields(this.value);';
      $colScript .= '  getExtraRequiredFields(this.value);';
      $colScript .= '  formChanged();';
      $colScript .= '</script>';
    }
    
    return $colScript;
  }
}
?>