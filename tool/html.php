<?php
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpPresentation\Shape\RichText\Paragraph;
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
 * Html specific functions
 */
require_once "../tool/projeqtor.php";
require_once "../tool/formatter.php";
//DO NOT SCRIPT LOG : html.php is included in projeqtor.php, so for each script 
//scriptLog('   ->/tool/html.php');
/** ===========================================================================
 * Draw the options list for a select  
 * @param $col the name of the field, as idXxx. The table ref is then xxx.
 * @param $selection the value of the field, to be selected in the list
 * @param $obj optional - object for which list is generated
 * @param $required optional - indicates wether the list may present an empty value or not
 * @return void
 */
// CHANGE BY Marc TABARY - 2017-02-17
function htmlDrawOptionForReference($col, $selection, $obj=null, $required=false, $critFld=null, $critVal=null, $limitToActiveProjects=true, $limitToActiveOrganizations=true,$showIdle=false,$onProjectSelector=false, $allProjects=false, $typeSelect=false) { 
  //scriptLog("      =>htmlDrawOptionForReference(col=$col,selection=$selection,object=" .debugDisplayObj($obj).",required=$required,critFld=".debugDisplayObj($critFld).",critVal=".debugDisplayObj($critVal).")");
  global $idReport, $idReportCategory;
  $reportAdminProject=false;
  // Take into account array of $critFld // TODO : check where it is used 
	$col=pq_str_replace(array('ActivityPlanningElement_','ProjectPlanningElement_','MilestonePlanningElement_','MeetingPlanningElement_','TestSessionPlanningElement_'),'',$col);
	if($col =="idBudgetItem"){
	  $col='idBudget';
	  $listShowIdle = false;
	  if(sessionValueExists('listShowIdleBudget') and get_class($obj)=='Budget'){
	    $listShowIdle = getSessionValue('listShowIdleBudget');
	    if($listShowIdle=="on")$showIdle=true;
	  } 
	  if(get_class($obj)=='Budget'){
	   $listBudgetElementary = SqlList::getList('BudgetItem','id',null,$showIdle);
	  }else{
	   $listBudgetElementary=SqlList::getListWithCrit('Budget',array('elementary'=>'1','isUnderConstruction'=>'0','idle'=>'0','cancelled'=>'0'),'id');
	  }
	}
	if($col=='idCriticalResource'){
	   $arrayRes = Affectable::getCriticalArray();
	   $tabArrayRes = array();
	   foreach ($arrayRes as $idRes=>$idProj){
	     $tabArrayRes[$idRes]=$idRes;
	   }
	   $col='idResourceAllNoMaterial';
	}
	//gautier #asset
	if($col=="idModel"){
	  $critFld = "idAssetType";
	  $critVal = $obj->idAssetType;
	  if(!$obj->idAssetType){
	    $type = new Type();
	    $firstTypeAsset = $type->getSqlElementsFromCriteria(array('scope'=>'Asset'),false,null,' sortOrder asc');
	    $critVal = $firstTypeAsset[0]->id;
	  }
	}
	if($col=="idComplexity"){
	    $critFld = "idCatalogUO";
	    if(property_exists($obj, 'idWorkUnit')){
  	    if($obj->idWorkUnit){
  	      $workUnits = new WorkUnit($obj->idWorkUnit,true);
  	      $critVal = $workUnits->idCatalogUO;
  	    }
	    }
	}
// BEGIN - ADD BY TABARY - POSSIBILITY TO HAVE AT X TIMES SAME idXXXX IN THE SAME OBJECT
    $col = foreignKeyWithoutAlias($col);
// END - ADD BY TABARY - POSSIBILITY TO HAVE AT X TIMES SAME idXXXX IN THE SAME OBJECT
  $critArray=array();
  if (is_array($critFld) and is_array($critVal) and count($critFld)==count($critVal)) {
    foreach($critFld as $id=>$fld) {
      $critArray[$critFld[$id]]=$critVal[$id];
    }
  } 
    
  if (is_array($critFld)) {
	  foreach ($critFld as $tempId=>$tempCrt) {
	    $crtName='critFld'.$tempId;
	    $$crtName=$tempCrt;
	  }
	  $critFld=$critFld[0];
	}
	// Take into account array of $critVal // TODO : check where it is used
	if (is_array($critVal)) {
	  foreach ($critVal as $tempId=>$tempVal) {
	    $valName='critVal'.$tempId;
	    $$valName=$tempVal;
	  }
	  $critVal=$critVal[0];
	}
  if ($col=='planning') {
    $listType='Project';
  } else {
    $listType=pq_substr($col,2);
  }
  if ($obj and $col=='id'.get_class($obj).'Type') {
    if ($critFld and $critVal) {
      $$critFld=$critVal;
    }
    $critFld=null;$critVal=null;
  }
	$column='name';
	$user=getSessionUser();
	if ($listType=='DocumentDirectory') {
		$column='location';
	}	
	// idProductOrComponent is an idProduct
  if ((pq_substr($col,0,2)=='id' and pq_substr($col,0,-7)=='Version') and ($critFld=='idProductOrComponent')) {
    $critFld='idProduct';
  }
  if ($col=='idProfile'){
    // Limit list of profiles to profiles with sortOrder >= sortOrder of user profile
    $idPrj = ($obj)?$obj->id:null;
    $user=new User();
    $prf = new Profile(getSessionUser()->getProfile($idPrj));
    $lstPrf=$prf->getSqlElementsFromCriteria(null,false,"idle=0 and ".(($prf->sortOrder)?'sortOrder>='.$prf->sortOrder:'1=1'),"sortOrder asc");
    $listPrf=array();
    foreach ($lstPrf as $profile) {
      $listPrf[$profile->id]=$profile->id;
    }
    $critFld='id';
    $critVal=$listPrf;
    // Attention, this case will then use standard process$table is not retreived yet)
  }
  if (($col=='idResource' or $col=='idAffectable' or $col=='idResourceAll' or $col=='idResourceAllNoMaterial' or $col=='idAccountable' or $col=='idResponsible' or $col=='idContact') and $critFld=='idProject') {
    // List of "affectable" with restriction to project : restrict on allocation to project (object Affectation)
  	$prj=new Project($critVal, true);
    $lstTopPrj=$prj->getTopProjectList(true);
    $in=transformValueListIntoInClause($lstTopPrj);
    $today=date('Y-m-d');
    $where="idProject in " . $in; 
    $where.=" and idle=0";
    //$where.=" and (startDate is null or startDate<='$today')";
    $where.=" and (endDate is null or endDate>='$today')";
    $aff=new Affectation();
    $list=$aff->getSqlElementsFromCriteria(null,null, $where);
    $nbRows=0;
    $table=array();
    if ($selection) {
       $table[$selection]=SqlList::getNameFromId('Affectable', $selection);
    }
    $planningMode = null;
    if($obj and property_exists($obj, get_class($obj).'PlanningElement')){
      $peFld=get_class($obj)."PlanningElement";
      $pMode = new PlanningMode($obj->$peFld->idPlanningMode);
      $planningMode = $pMode->code;
    }
    foreach ($list as $aff) {
      if (! array_key_exists($aff->idResource, $table)) {
        $id=$aff->idResource;
        $isResourceTeam=SqlList::getFieldFromId(pq_substr($col, 2), $id, 'isResourceTeam');
        if($planningMode == 'MAN' and $isResourceTeam)continue;
        $name=SqlList::getNameFromId(pq_substr($col, 2), $id);
        //if ($name==$id and $col=='idResource') { // PBE V6.0 : this would insert users in Reosurce list (for instance responsible on Ticket)
        //	$name=SqlList::getNameFromId('User', $id);
        //}
        if ($name!=$id) {
          $table[$id]=$name;
        } 
      }
    }
    asort($table);
  } else if ($critFld and ($col=='idProductVersion' or $col=='idComponentVersion') and ($critFld=='idVersion' or $critFld=='idComponentVersion' or $critFld=='idProductVersion') ) {
    // Limit Versions depending on product structure
    $critClass=pq_substr($critFld,2);
    $versionField=pq_str_replace('Version', '', $critFld);
    $version=new Version($critVal,true);
    $critArray=array($versionField=>$version->idProduct);
    $list=SqlList::getListWithCrit('ProductStructure',$critArray,pq_str_replace('Version', '',$col),$selection,$showIdle);
    $table=array();
    foreach ($list as $id) {
      $crit=array('idProduct'=>$id);
      $list=SqlList::getListWithCrit('Version',$crit);
      $table=array_merge_preserve_keys($table,$list);
    }  
    if ($selection and !isset($table[$selection])) {
      $table[$selection]=SqlList::getNameFromId('Version', $selection);
    }
  } else if ($critFld and ! (($col=='idProduct' or $col=='idProductOrComponent' or $col=='idComponent') and $critFld=='idProject') ) {
    // Limit on criteria : this is main case for criteria selection
    // but not for Product and Component depending on Project (will be managed with restriction table)
    if (count($critArray)==0) $critArray=array($critFld=>$critVal);
    
    $limitPlanning=Parameter::getGlobalParameter('limitPlanningActivity');
    $class=null;
    if($obj!=null){
      $class=get_class($obj);
    }  
    if($listType=="Activity" and $class=='Ticket' and $limitPlanning=="YES"){
      $critArray['isPlanningActivity']=1;
    }
    
    
    if ($col =='idTargetComponentVersion' and $obj and (get_class($obj)=='Activity') and $obj->idProduct == null and $obj->idComponent == null){
      $type = new Type();
      $componentVersionTypeDisplay = $type->getSqlElementsFromCriteria(array('lockUseOnlyForCC'=>'0','scope'=>'ComponentVersion'));
      $cpt=0;
      $arrayType=array();
      foreach ($componentVersionTypeDisplay as $cvtd){     
        $arrayType[$cpt] = $cvtd->id;
        $cpt+=1;
      }  
      $critArray['idVersionType'] = array_values($arrayType);        
    }
    foreach($critArray as $cF=>$cV) {
      if (pq_substr($cF,0,2)=='id' and pq_strlen($cF)>2) {
        $cFclass=pq_substr($cF,2);
        if ($cFclass==pq_ucfirst($cFclass) and $cV==' ') {
          unset($critArray[$cF]);
        }
      }
    }
    $table=SqlList::getListWithCrit($listType,$critArray,$column,$selection);
    if($col == 'idActivity' and $obj and (get_class($obj)=='Activity' or get_class($obj)=='TestSession' or get_class($obj)=='Milestone')){
      $activityTypeList = "(".implode(',' ,SqlList::getListWithCrit('ActivityType', array('canHaveSubActivity'=>'1', 'idle'=>'0'),'id')).")";
      if ($activityTypeList=='()') $activityTypeList='(0)';
      $activity = new Activity();
      $critWhere = "idActivityType in $activityTypeList";
      foreach ($critArray as $name=>$value){
        if ($name=='idProject' and $value=='*') continue;
        if ($name and $value) $critWhere .= " and $name = $value";
      }
// PB : performance
//      $activityList = $activity->getSqlElementsFromCriteria(null,null,$critWhere,null,null, true);
      $tableForType=SqlList::getListWithCrit('Activity', $critWhere);
      //if(count($activityList)>0)unset($table);
//       $tableForType=array();
//       foreach ($activityList as $id=>$act){
//         $tableForType[$act->id]=$act->name;
//       }
      $table=array_intersect_key($table, $tableForType);
    }
    /*Florent 
     * Ticket 3868
     */
    if($col == 'idActivity' or $col=='idTicket'){
      foreach ($table as $idTable=>$val){
        $table[$idTable]= SqlList::formatValWithId($idTable,$val);
      }
    }
    if ($selection and ! isset($table[$selection])) {
      $refTable=pq_substr($col,2);
      if (pq_substr($listType,-7)=='Version' and SqlElement::is_a($refTable, 'Version')) $refTable='Version';  
      /*Florent
       * Ticket 3868
      */
      if($col=='idActivity'or $col=='idTicket'){
        $table[$selection]=SqlList::formatValWithId($selection,SqlList::getFieldFromId($refTable, $selection,$column));
      } else {
        $table[$selection]=SqlList::getFieldFromId($refTable, $selection,$column); 
      }
    }
    if ($col=="idProject" or $col=="planning") { 
    	$wbsList=SqlList::getListWithCrit($listType,$critArray,'sortOrder',$selection);
    }
    if ($col=='idEmailTemplate') {
    	$mailable=($critVal0)?$critVal0:'0';
    	$type=($critVal1)?$critVal1:'0';
    	$crit=array('idMailable'=>$mailable,'idType'=>$type);
    	$list = SqlList::getListWithCrit ( "EmailTemplate", $crit, 'name', $selection, false );
    	$crit=array('idMailable'=>null);
    	$listAll = SqlList::getListWithCrit ( "EmailTemplate", $crit, 'name', $selection, false );
    	$crit=array('idMailable'=>$mailable, 'idType'=>null);
    	$listAllType = SqlList::getListWithCrit ( "EmailTemplate", $crit, 'name', $selection, false );
    	$table=array_merge_preserve_keys($list,$listAll,$listAllType);
    }
  } else if ($col=='idBill' or $col=='idProviderBill' or $col=='idProviderTerm')  {
    // Limit Bills list to done but not paid (this isd used on Payment screen to list bills to link to the payment)
    if ($col=='idBill'){
      $crit=array('paymentDone'=>'0','done'=>'1');
    } else if  ($col=='idProviderBill') {
      $crit=array('done'=>'1');
    } else if  ($col=='idProviderTerm') {
      $crit=array('isPaid'=>'0');
    }
    $table=SqlList::getListWithCrit($listType, $crit,$column,$selection, (! $obj)?!$limitToActiveProjects:false);
  } else if ($listType=='Linkable' or $listType=='Copyable' or $listType=='Dependable' or $listType=='Originable'){
    // Limit list of object to Link or to Copy to to objects visible to the user (depending on his access rights
    $typeRight='read';
    if($col=='idCopyable') $typeRight='create';
    $table=SqlList::getListNotTranslated($listType,$column,$selection, (! $obj)?!$limitToActiveProjects:false );
    $arrayToDel=array();
    foreach($table as $key => $val){
      $objTmp=new $val();
      if(property_exists($objTmp, "idProject") && $obj && property_exists($obj, "idProject")){
        $objTmp->idProject=(get_class($obj)=='Project')?$obj->id:$obj->idProject;
      }
      // Florent #2948	
      $testval=($val=='DocumentVersion')?'Document':$val;
      if(securityGetAccessRightYesNo('menu'.$testval, $typeRight, $objTmp)=="NO" or !securityCheckDisplayMenu(null,$testval))$arrayToDel[]=$key;
    }
    if ($col=='idLinkable' and $obj) {
    	foreach ($obj as $objFld=>$objVal) {
    		if (pq_substr($objFld,0,6)=='_Link_') {
    			$clsLinked=pq_substr($objFld,6);
    			$idLinked=SqlList::getIdFromTranslatableName('Linkable', $clsLinked);
    			$arrayToDel[]=$idLinked;
    		}
    	}
    }
    $table=SqlList::getList($listType,$column,$selection, (! $obj)?!$limitToActiveProjects:false );
    foreach($arrayToDel as $key)unset($table[$key]);
  } else if ($listType=='Mailable' or $listType=='Indicatorable' or $listType=='Textable' or $listType=='Checklistable' 
          or $listType=='Importable' or $listType=='Notifiable' or $listType=='Situationable'){
    $table=SqlList::getListNotTranslated($listType,$column,$selection);
    $arrayToDel=array();
    foreach($table as $key => $val){
      $checkMenu='menu'.$val;
      if ($val=='Assignment') $checkMenu='menuActivity';
      else if ($val=='TestCaseRun') $checkMenu='menuTestCase';
      else if ($val=='ProductStructure') $checkMenu='menuProduct';
      else if ($val=='Work') $checkMenu='menuImputation';
      else if ($val=='DocumentVersion') $checkMenu='menuDocument';
      if (! Module::isMenuActive($checkMenu)) $arrayToDel[]=$key;
    }
    $table=SqlList::getList($listType,$column,$selection );
    foreach($arrayToDel as $key)unset($table[$key]);
    if($col=='idImportable'){
      $table[72]=i18n('UseOfWorkUnit');
    }
    asort($table);
  } else if ($col=='idActivity' or $col=='idTicket') { 
    // List Activity or Ticket without a criteria // TODO : analyse effect of this... 
  	$cls=pq_substr($col,2);
  	$table=SqlList::getList($cls,'name',$selection,false,true);
  } else if ($col=='idTestCase') { 
    // List Test case with criteria on project or visible product
    $table=SqlList::getList($listType,$column,$selection, (! $obj)?!$limitToActiveProjects:false,true );
  } else if($col=="idWeightMode"){
    $showIdleCriteria=$showIdle;
    $table=SqlList::getList($listType,$column,$selection, $showIdleCriteria );
      if(isset($obj) and get_class($obj)=='ProjectPlanningElement'){
        unset($table[3]);
        unset($table[1]);
        $selection=2;
      }else if(isset($obj)){
        if($obj->getSonItemsArray()){
          unset($table[3]);
        }else {
          unset($table[2]);
        }
      }
  } else if($col=="idRevenueMode"){
    $showIdleCriteria=$showIdle;
    $table=SqlList::getList($listType,$column,$selection, $showIdleCriteria );
  }else if ($col=="idWorkUnit"){
      $table=array();
      $proj = new Project($obj->idProject);
//       $catalog = new CatalogUO();
//       $idProject = $catalog->getCatalogueForProject($obj->idProject);
//       if(!$idProject)$idProject= $obj->idProject;
//       $where="idProject=".Sql::fmtId($idProject);
//       $where.=" and idle=0 ";
      $where="";
      if($proj->idCatalogUO){
        $where="idCatalogUO = $proj->idCatalogUO and idle= 0";
        $workUnit=new WorkUnit();
        $list=$workUnit->getSqlElementsFromCriteria(null,false,$where);
        foreach ($list as $wu) {
          if (! array_key_exists($wu->id, $table)) {
            $table[$wu->id]=$wu->reference;
          }
        }
        if($selection){
          $table[$selection]=SqlList::getFieldFromId('WorkUnit', $selection, 'reference'); 
        }
        asort($table);
      }

  }elseif($col=="idWorkCommand"){
        $table=array();
    if(isset($obj->idWorkUnit)){
        $workUnit = new WorkUnit($obj->idWorkUnit);
        $complexity = new Complexity($obj->idComplexity);
        if($obj->idWorkUnit and $obj->idComplexity){
          $catalog = new CatalogUO();
          if(get_class($obj)=='ActivityWorkUnit'){
            if($obj->refType=='Activity'){
              $act = new Activity($obj->refId);
              $idProject= $act->idProject;
            }
          }else{
            $idProject= 0;
          }
          $listCommand=SqlList::getListWithCrit('Command',array('idProject'=>$idProject),'id');
          if(get_class($obj)=='ActivityWorkUnit'){
            if(property_exists($act, 'idClient')){
              if($act->idClient){
                $listCommand=SqlList::getListWithCrit('Command',array('idProject'=>$act->idProject,'idClient'=>$act->idClient),'id');
              }
            }else{
              if($act->idContact){
                $contact = new Contact($act->idContact);
                $listCommand=SqlList::getListWithCrit('Command',array('idProject'=>$act->idProject,'idClient'=>$contact->idClient),'id');
              }else{
                $listCommand=SqlList::getListWithCrit('Command',array('idProject'=>$act->idProject),'id');
              }
            }
          }
          $in=transformValueListIntoInClause($listCommand);
          $workCommand = new WorkCommand();
          $where = "( idCommand in ".$in.") and ( idWorkUnit = ".$obj->idWorkUnit." and idComplexity = ".$obj->idComplexity." ) ";
          $listWorkCOmmand = $workCommand->getSqlElementsFromCriteria(null,false,$where);
          $tabWorkCommand = array();
          foreach ($listWorkCOmmand as $val){
            $commandForRef = new Command($val->idCommand);
            $table[$val->id]=$commandForRef->reference.' - '.$val->name;
          }
          ksort($table);
        }
      }else{
          $workCommand=new WorkCommand();
          $com = new Command();
          $lstCom = $com->getSqlElementsFromCriteria(array('idProject'=>$obj->idProject));
          if(get_class($obj) == 'Bill'){
            if($obj->idClient){
              $lstCom = $com->getSqlElementsFromCriteria(array('idProject'=>$obj->idProject,'idClient'=>$obj->idClient));
            }
          }
          $tabLstCom = array();
          foreach ($lstCom as $valComId=>$valCom){
            $tabLstCom[]=$valCom->id;
          }
          $in = transformValueListIntoInClause($tabLstCom);
          $where=" idCommand in " .$in ;
          $list=$workCommand->getSqlElementsFromCriteria(null,null,$where);
          foreach ($list as $wu) {
            if (! array_key_exists($wu->id, $table)) {
              $id=$wu->id;
              $command = new Command($wu->idCommand);
              $table[$id]='#'.$wu->id.'-'.$command->reference.' - '. $wu->name;
            }
          }
          asort($table);
      }
  } else if ($col == 'idLocalizationTranslator' and get_class($obj) == 'LocalizationItem'){
      
        $table=SqlList::getList($listType,$column,$selection);
        $listTranslator = SqlList::getListWithCrit("LocalizationTranslatorLanguage", array("idLanguage"=>$obj->idLanguage), "idTranslator",$selection);
        $listTranslatorOriginLanguage = SqlList::getListWithCrit("LocalizationTranslatorLanguage", array("idLanguage"=>$obj->idOriginLanguage), "idTranslator",$selection);
        $listTranslator = array_intersect ($listTranslator, $listTranslatorOriginLanguage);
        $table = array_filter($table,
            function($keyTemp) use ($listTranslator){
              return in_array($keyTemp, $listTranslator);
            },
            ARRAY_FILTER_USE_KEY
        );
        $refTable=$listType;
  } else if ($col == "idTestSession" and $obj and (property_exists(get_class($obj), 'idProject') and $obj->idProject != null)) {
    $critWhere = "id != $obj->id ";
    $critWhere .= "and (idTestSession != '". $obj->id ."' or idTestSession IS NULL) ";
    $critWhere .= "and idProject = ". $obj->idProject;
  
    
    $testSession = new TestSession();
    $tableTestSession = $testSession->getSqlElementsFromCriteria(null,null, $critWhere);
    if (!empty($tableTestSession)) {
      foreach ($tableTestSession as $ts) {
          $table[$ts->id]=$ts->name;
      }
    } else {
      $table = array();
    }
  
  }else {
    // None of the previous cases : no criteria and not of the expected above cases
    $showIdleCriteria=$showIdle;
    if (! $obj and property_exists($listType, 'idProject'))  $showIdleCriteria=(! $limitToActiveProjects);
    global $scope;
    if ($col == 'idLeaveType' and $scope!='dialogLvTypeOfEmploymentContractType' ) {
      $table = [];
      $employementContract = new EmploymentContract();
      $userContractType = $employementContract->getSqlElementsFromCriteria(array("idEmployee" => getSessionUser()->id));
      
      $leaveTypeOfEmployment = new LeaveTypeOfEmploymentContractType();
      if ($userContractType) {
        $leaveTypeArray = $leaveTypeOfEmployment->getSqlElementsFromCriteria(array("idEmploymentContractType" => $userContractType[0]->idEmploymentContractType));
        $leaveType = new LeaveType();
        $leaveArray = $leaveType->getSqlElementsFromCriteria(array());
        foreach ($leaveArray as $array)
          foreach ($leaveTypeArray as $typeArray)
            if ($array->id == $typeArray->idLeaveType)
              $table[$array->id] = $array->name;
      }
    } else {
      if($col=="idProject" and $onProjectSelector ){
        $clause=" 1=1 ";
        $limitProjectLevel=Parameter::getUserParameter('projectSelectorLimitProjectLevel');
        if($limitProjectLevel!="" and $limitProjectLevel!="0"){
          $lentgh=5;
          if($limitProjectLevel!='1'){
            for ($i=1;$i < intval($limitProjectLevel) ;$i++){
              $lentgh+=6;
            }
          }
          $clause=" LENGTH (sortOrder) <=  $lentgh ";
        }
        $table = SqlList::getListWithCrit($listType,$clause, $column, $selection, $showIdleCriteria);
      }else{
        $table=SqlList::getList($listType, $column, $selection, $showIdleCriteria);
        if ($allProjects) {
          $table = array('0' => i18n('allProjects')) +$table;
        }
      } 
    }
    if($col == "idPokerComplexity"){
      if(in_array('?', $table)){
        unset($table[array_search('?', $table)]);
      }
    }
    if ($col=="idProject" or $col=="planning") { 
      // $wbsList will able to order list depending on WBS
    	$wbsList=SqlList::getList($listType,'sortOrder',$selection, (! $obj)?!$limitToActiveProjects:false );
    } 
    if ($col=="idOrganization") { 
      // Spmecificity for list of organisation // TODO : study if no other way is possible
    	$orgaList=SqlList::getList($listType,'sortOrder',$selection, (! $obj)?!$limitToActiveOrganizations:true );
    }
    if($col=="idBudget"){
      if(get_class($obj) == 'Budget'){
        $budgetList=SqlList::getList('Budget','bbsSortable',$selection,$showIdle);
      }else{
        $budgetList=SqlList::getListWithCrit('Budget',array('isUnderConstruction'=>'0','idle'=>'0','cancelled'=>'0'),'bbsSortable',$selection);
				foreach ($budgetList as $idB=>$bbsB) { if (! $bbsB) unset ($budgetList[$idB]); }
        $budgetListId = array_flip($budgetList);
      }
    }
    
    if($col=="idSkill"){
    	if(get_class($obj) == 'Skill'){
    		$skillList=SqlList::getList('Skill','sbsSortable',$selection,$showIdle);
    	}
    }

    if ($selection) {
      // Add selected value in the table // TODO : possibly move this after the closing } because it may be used in all cases (to be studied)
      $refTable=$listType;
      if (pq_substr($listType,-7)=='Version' and SqlElement::is_a($refTable, 'Version')) $refTable='Version';
      $table[$selection]=SqlList::getFieldFromId($refTable, $selection,$column);
    }
  }
  // Here $table is full with items to list
  $restrictArray=array();  // Prepare restriction array : if empty, no restriction will be applied, if not empty, will limit list the these items
  $excludeArray=array();   // Prepare exclusion array : all items in this list will not be listed
  if ($col=='idBaselineSelect') {
    $critWhere=  'idProject in ' . getVisibleProjectsList() ;
    $bl=new Baseline();
    $lstBaseline=$bl->getSqlElementsFromCriteria(null,null,$critWhere);
    foreach ($lstBaseline as $bl) {
      $restrictArray[$bl->id]=$bl->name;
    }
  }
  if ($obj and $col=='idEventForMail' and property_exists($obj, 'idMailable')) {
    $critValue=SqlList::getNameFromId('Mailable', $obj->idMailable,false);
    if (! property_exists ( $critValue, 'idResource' )) {
      $excludeArray [1]='NO'; // 1 responsibleChange
    }
    if (! property_exists ( $critValue, '_Note' )) {
      $excludeArray [2]='NO';
      $excludeArray [4]='NO';
    }
    if (! property_exists ( $critValue, '_Link' )) {
      $excludeArray [12]='NO';
      $excludeArray [13]='NO';
    }
    if (! property_exists ( $critValue, '_Attachment' )) {
      $excludeArray [3]='NO';
    }
    if ($critValue != 'Project') {
      $excludeArray [10]='NO';
      $excludeArray [11]='NO';
    }
    if (! property_exists ( $critValue, '_Assignment' )) {
      $excludeArray [7]='NO';
      $excludeArray [8]='NO';
    }
    if (! property_exists ( $critValue, 'description' )) {
      $excludeArray [5]='NO';
    }
    if (! property_exists ( $critValue, 'result' )) {
      $excludeArray [6]='NO';
    }
    if(! property_exists ( $critValue, 'idStatus' )){
      $excludeArray [14]='NO';
    }
    if(! property_exists ( $critValue, 'idPriority' )){
      $excludeArray [15]='NO';
    }
    if($critValue!='User'){
      $excludeArray [16]='NO';
    }
  }
  if ($obj) {
    // Current object is passed to the function, use it to apply restrictions or exclusions 
    // All lists froms objectDetail.php come here
  	$class=get_class($obj);
    if ( $class=='Project' and $col=="idProject" and $obj->id!=null) {
      // on "is sub-project of", remove subprojects of current project and current project itself
      $excludeArray=$obj->getRecursiveSubProjectsFlatList();
      $excludeArray[$obj->id]=$obj->name;
    } 
    if ( $class=='Organization' and $col=="idOrganization" and $obj->id!=null) { 
      // on "is sub-organization of", remove suborganization of current organization and current organization itself
      $excludeArray=$obj->getRecursiveSubOrganizationsFlatList();
      $excludeArray[$obj->id]=$obj->name;
    }  
    if ($col=="idProject") {
      // On list of project, restrict list to the one the user has visibility, depending on access rights
    	$menuClass=$obj->getMenuClass();
    	if ($class=='DocumentDirectory') {
    	  // Document directory has no specific access rights, retreive them from Document
    		$doc=new Document();
    		$menuClass=$doc->getMenuClass();
    	}
      $controlRightsTable=$user->getAccessControlRights($obj);
      if (! array_key_exists($menuClass,$controlRightsTable)) {
	      // If AccessRight not defined for object and for user profile => empty list + log error
	      traceLog('error in htmlDrawOptionForReference : no control rights for ' . $class);
        return;		
	    }
      $controlRights=$controlRightsTable[$menuClass];    
      if ($obj->id==null) {
        // creation mode
        if ($controlRights["create"]!="ALL") {         
          $restrictArray=$user->getVisibleProjects();
          if (count($restrictArray)==0) { // If user is affected to no project, only possible value is 0 (never users)
            $restrictArray[0]=0;
          }
        }
      } else {
        // read or update mode
        if (securityGetAccessRightYesNo($menuClass, 'update', $obj)=="YES") {
          // update
          if ($controlRights["update"]=="PRO" or $controlRights["update"]=="OWN" or $controlRights["update"]=="RES") {
            $restrictArray=$user->getVisibleProjects();
          }            
        }
      }
      if (count($restrictArray) and $controlRights["create"]!="ALL" and ! $idReport) {
        foreach ($restrictArray as $idP=>$nameP) {
            $tmpAccessRight="NO";
            $tmpAccessRightList = $user->getAccessControlRights($idP);
            if (array_key_exists ( $menuClass, $tmpAccessRightList )) {
              $tmpAccessRightObj = $tmpAccessRightList [$menuClass];
              if (array_key_exists ( 'create', $tmpAccessRightObj )) {
                $tmpAccessRight = $tmpAccessRightObj ['create'];
              }
            }
            if ($tmpAccessRight!='ALL' and $tmpAccessRight!='PRO') {
              unset($restrictArray[$idP]);
            }
        }
        if (count($restrictArray)==0) { 
          $restrictArray[0]=0;
        }
      }

      $reportAdminProject=false;
      if ($idReport and $idReportCategory<=2 and count($restrictArray)) {
        //damian ACT#1013
        $user=getSessionUser();
        $crit=array('idProfile'=>$user->idProfile, 'scope'=>'reportAdminProject');
        $habil=SqlElement::getSingleSqlElementFromCriteria('HabilitationOther', $crit);
        $reportAdminProject=false;
        if ($habil and $habil->id and $habil->rightAccess=='1') {
          $reportAdminProject=true;
        }
        if($reportAdminProject){
          $adminProjectList = Project::getAdminitrativeProjectList(true);
          if(count($adminProjectList)>0){
            unset($adminProjectList[0]);
            foreach ($adminProjectList as $idPrj){
              $prj=new Project($idPrj,true);
              $lstSubPrj=$prj->getRecursiveSubProjectsFlatList($limitToActiveProjects);
              foreach ($lstSubPrj as $idSubPrj=>$nameSubPrj) {
                if (!Profile::profileHasNoAccess($user->idProfile)) $restrictArray[$idSubPrj]=$nameSubPrj;
              }
              if (!Profile::profileHasNoAccess($user->idProfile)) $restrictArray[$idPrj]=$prj->name;
            }
          }
        }
      }
      if($idReport and getSessionValue('idFavoriteProjectList')){
        $visibleProj = explode(',',pq_trim(pq_substr(getVisibleProjectsList(),1,-1)));
        $topList = array();
        foreach ($visibleProj as $idProj){
          $proj = new Project($idProj,true);
          $topProjList = $proj->getTopProjectList(true);
          $topList = array_merge($topList, $topProjList);
        }
        if($topList){
          unset($restrictArray);
          foreach ($topList as $idP){
            if($idP)$restrictArray[$idP]=SqlList::getNameFromId('Project', $idP);
          }
        }
      }
      if(Parameter::getUserParameter("restrictProjectList")=="true" and !$onProjectSelector and (!$idReport or Project::getSelectedProject(false,false)!='*')) {
        $visibleProj = explode(',',pq_trim(pq_substr(getVisibleProjectsList(),1,-1)));
        $topList = array();
        foreach ($visibleProj as $idProj){
          $proj = new Project($idProj,true);
          if (!$proj->id) continue;
          $topProjList = $proj->getTopProjectList(true);
          $topList = array_merge($topList, $topProjList);
        }
        if (count($topList)>0) $topList = array_flip($topList);
        foreach ($wbsList as $idP=>$wbs){
          if(!array_key_exists($idP, $topList) and ! ($wbs='00000' and !$idReport and $reportAdminProject) ){
            $excludeArray[$idP]=SqlList::getNameFromId('Project', $idP);
          }
        }
        $class=get_class($obj);
        if(Project::getSelectedProject(true,false)){
          $arrayProj = Project::getSelectedProjectList();
          foreach ($arrayProj as $idProj){
            $proj = new Project($idProj,true);
            $lstProjChild = $proj->getRecursiveSubProjectsFlatList(true,true);
            foreach ($lstProjChild as $id=>$name){
              $lstChild[$id]=$name;
            }
          }
          if (count($restrictArray)>0) {
            $restrictArray=array_intersect_assoc($restrictArray,$lstChild);
          } else {
            $restrictArray=$lstChild;
          }
        }
      }
      if($idReport){
        $visibleProj = explode(',',pq_trim(pq_substr(getVisibleProjectsList(),1,-1)));
        $topList = array();
        foreach ($visibleProj as $idProj){
          $proj = new Project($idProj,true);
          $topProjList = $proj->getTopProjectList(true);
          $topList = array_merge($topList, $topProjList);
        }
        $topList = array_flip($topList);
      }
      if (! Project::isProjectLeaveVisible() and ! $idReport) $excludeArray[Project::getLeaveProjectId()]='Leave';
      // end of $col=="idProject"
    } else if ($col=='idStatus') {
      // On list of Status, limit list depending on workflow
    	if ($class=='TicketSimple') $class='Ticket';        
      $idType='id' . $class . 'Type';
      $typeClass=$class . 'Type';
      if (property_exists($obj,$idType) ) {
      	reset($table);
        $firstKey=key($table);
        $firstName=current($table);
        // look for workflow
        if ($obj->$idType and $obj->idStatus) {
          $profile="";
          if (sessionUserExists()) {
            $profile=getSessionUser()->getProfile($obj);
          } 
          $type=new $typeClass($obj->$idType,true);
          if (property_exists($type,'idWorkflow') ) {

// MTY - LEAVE SYSTEM              
            if (isLeavesSystemActiv()) {
                // For Leave System and Leave :
                //   - Leave Admin or 
                //   - Manager of Employee or
                //   - Employee of the leave 
                //   can see status
                if ( get_class($obj)=='Leave' and 
                     ( isLeavesAdmin() or 
                       isManagerOfEmployee(getSessionUser()->id, $obj->idEmployee) or
                       (getSessionUser()->isEmployee==1 and $obj->idEmployee == getSessionUser()->id)
                     )
                   )
                {
                    $admPrf = getFirstADMProfile();
                    if ($admPrf!=null) {
                        $profile = $admPrf->id;
                    }
                }
            }  
// MTY - LEAVE SYSTEM                            
            $ws=new WorkflowStatus();
            $crit=array('idWorkflow'=>$type->idWorkflow, 'allowed'=>1, 'idProfile'=>$profile, 'idStatusFrom'=>$obj->idStatus);
            $wsList=$ws->getSqlElementsFromCriteria($crit, false);
            $compTable=array($obj->idStatus=>'ok');
            foreach ($wsList as $ws) {
// MTY - LEAVE SYSTEM                
              // For Leave System and Leave : 
              //  Employee that is not Leave Admin or Manager of Employee can see only status :
              //    - idStatus = 1
              //    - OR setSubmittedLeave = 1
              if ( isLeavesSystemActiv() and
                get_class($obj)=='Leave' and 
                !isLeavesAdmin() and 
                !isManagerOfEmployee(getSessionUser()->id, $obj->idEmployee))
                {
                if ($ws->idStatusTo==1) {
                  $compTable[$ws->idStatusTo]="ok";
                } else {
                  $theStatus = new Status($ws->idStatusTo);
                  if ($theStatus->setSubmittedLeave==1 and ($theStatus->setRejectedLeave==0 and $theStatus->setAcceptedLeave==0)) {
                    $compTable[$ws->idStatusTo]="ok";
                  }
                }
              } else {
// MTY - LEAVE SYSTEM                                
                $compTable[$ws->idStatusTo]="ok";
              }
            }
            $table=array_intersect_key($table,$compTable);
          }
        } else {
           $table=array($firstKey=>$firstName);
        }
      }
      if ($selection) {
        $selStatus=new Status($selection,true);
        if ($selStatus->isCopyStatus and isset($firstKey)) {
        	$table[$firstKey]=$firstName;
        }
      }
      // End $col=='idStatus'
    } else if (($col=='idProduct' or $col=='idComponent' or  $col=='idProductOrComponent') and $critFld=='idProject' and $critVal) {
      // Limit list of products and components depending on Project : list only items with version linked to the project
      $restrictArray=array();
    	$versProj=new VersionProject();
    	$proj=new Project($critVal,true);
    	$lst=$proj->getTopProjectList(true);
    	$inClause='(0';
    	foreach ($lst as $prj) {
    	  if ($prj){
    	    $inClause.=',';
    	    $inClause.=$prj;
    	  }
    	}
    	$inClause.=')';
    	// PB : optimization;
    	//$versProjList=$versProj->getSqlElementsFromCriteria(null, false, 'idProject in '.$inClause);
    	$versProjList=SqlList::getListWithCrit('VersionProject', 'idProject in '.$inClause,'idVersion');
    	if (count($versProjList)==0) $table=array();
    	// hide automatically component depending of his type - Add mOlives - Ticket 178 - 17/05/2018
    	if ($col =='idComponent' and get_class($obj)=='Activity' and $obj->idProduct == null){
     	  $type = new Type();
     	  $componentTypeDisplay = $type->getSqlElementsFromCriteria(array('lockUseOnlyForCC'=>'0','scope'=>'Component'));   	    
    	  $crit='idComponentType in (0';
        foreach ($componentTypeDisplay as $filterType){
          $crit.=','.$filterType->id;
        }
        $crit.=')';
        $comp=new Component();
        $lstTmpComp=$comp->getSqlElementsFromCriteria(null,null,$crit,null,null,true);
        foreach($lstTmpComp as $comp) {
          $restrictArray[$comp->id]="OK";
        }
    	}	else {
    	  $crit="id in (0";
    	  foreach ($versProjList as $idVersion) {
     	    $crit.=','.$idVersion;
    	  }
    	  $crit.=')';
    	  $vers=new Version();
    	  // PB : optimization;
    	  //$lstTmpVers=$vers->getSqlElementsFromCriteria(null,null,$crit,null,null,true);
    	  $lstTmpVers=SqlList::getListWithCrit('Version', $crit,'idProduct');;
    	  foreach($lstTmpVers as $idProduct) {
    	    $restrictArray[$idProduct]="OK";
    	  }
    	}  	
    	//End mOlives - Ticket 178 - 17/05/2018
    	// Add list of products  directly linked to project (not only through version)
    	$pp=new ProductProject();
    	$ppList=$pp->getSqlElementsFromCriteria(null, false, 'idProject in '.$inClause);
    	foreach ($ppList as $pp) {
    	  $restrictArray[$pp->idProduct]="OK";
    	}
    	if ($selection) {
    	  $table[$selection]=SqlList::getNameFromId(pq_substr($col,2), $selection); 
    	}
    	//if (isset($restrictArray[$selection])) unset($restrictArray[$selection]); // Code removed : if left, list of product is all products
    	// End ($col=='idProduct' or $col=='idComponent') and $critFld=='idProject'
    } else if ($col=='idComponent' and $critFld=='idProduct' and intval($critVal)>0) {
      // Limit list of components depending on Product (only components linked to the product) 
      $prod=new Product($critVal,true);
      $table=$prod->getComposition(true,true);
      // hide automatically component depending of his type - Add mOlives - Ticket 178 - 17/05/2018
      if ($col =='idComponent' and (get_class($obj)=='Activity' or get_class($obj)=='Ticket') and $obj->idProduct != null){   
// PB : Fix Performance Issue when retreiving list of Component Version (Restriction on type where lockUseOnlyForCC=0 incorrectly applied)
//         $type = new Type();
//         $componentTypeDisplay = $type->getSqlElementsFromCriteria(array('lockUseOnlyForCC'=>'0','scope'=>'Component'));   
//         $crit='idComponentType in (0';
//         foreach ($componentTypeDisplay as $filterType){
//           $crit.=','.$filterType->id;
//         }
//         $crit.=')';
//         $comp=new Component();
//         $lstTmpComp=$comp->getSqlElementsFromCriteria(null,null,$crit,null,null,true);
//         foreach($lstTmpComp as $comp) {
//           $restrictArray[$comp->id]="OK";
//         }
// PB : Fix Performance - New code
        $componentTypeDisplay = SqlList::getListWithCrit('Type', array('lockUseOnlyForCC'=>'0','scope'=>'Component'));
        foreach($table as $idT=>$valT) {
          $typeValue=SqlList::getFieldFromId('Component', $idT , 'idComponentType');
          if (! isset($componentTypeDisplay[$typeValue]) ) {
            unset($table[$idT]);
          }
        }
// PB : Fix Performance - End
      }
      //End mOlives - Ticket 178 - 17/05/2018
      if ($selection) {
        $table[$selection]=SqlList::getNameFromId(pq_substr($col,2), $selection);
      }
      // End $col=='idComponent' and $critFld=='idProduct'
    } else if (pq_substr($col,-16)=='ComponentVersion' and $critFld=='idProductVersion' and $critVal) { 
      // Limit Component version (target, source or else) depending on Product Version
      $prodVers=new ProductVersion($critVal,true);
      $table=$prodVers->getComposition(true,true);
      if (isset($critFld1) and isset($critVal1) and $critFld1=='idComponent') {
        $listVers=SqlList::getListWithCrit('ComponentVersion', array('idComponent'=>$critVal1));
        $table=array_intersect_assoc($table,$listVers);
      }
      if (get_class($obj) == 'Ticket'){
// PB : Fix Performance Issue when retreiving list of Component Version (Restriction on type where lockUseOnlyForCC=0 incorrectly applied) 
//         $type = new Type();
//         $componentTypeDisplay = $type->getSqlElementsFromCriteria(array('lockUseOnlyForCC'=>'0','scope'=>'ComponentVersion'));        
//         $crit='idVersionType in (0';
//         foreach ($componentTypeDisplay as $filterType){
//           $crit.=','.$filterType->id;
//         }
//         $crit.=')';
//         $compVers=new ComponentVersion();
//         $lstTmpCompVers=$compVers->getSqlElementsFromCriteria(null,null,$crit,null,null,true);      
//         foreach($lstTmpCompVers as $compVers) {
//           $restrictArray[$compVers->id]="OK";
//         }        
// PB : Fix Performance Issue - New version of Code
        $componentTypeDisplay = SqlList::getListWithCrit('Type', array('lockUseOnlyForCC'=>'0','scope'=>'ComponentVersion'));
        foreach($table as $idT=>$valT) {
          $typeValue=SqlList::getFieldFromId('ComponentVersion', $idT , 'idVersionType');
          if (! isset($componentTypeDisplay[$typeValue]) ) {
            unset($table[$idT]);
          }
        }
// PB Fix Performance Issue - End
      }
      if ($selection) {
        $table[$selection]=SqlList::getNameFromId('ComponentVersion', $selection);
      }
      // End Limit Component version (target, source or else) depending on Product Version
    } else if ($col=='id'.$class.'Type' and property_exists($obj, 'idProject')) {
      // List of type on the item, where item has project : 
      if (! isset($idProject)) {
        if ($obj->idProject and $class!='Project' ) {
          $idProject=$obj->idProject;
        } else {
          $idProject=0;
        }
      }
      if ($class=='Project') {
        if ($obj and $obj->id) $idProject=$obj->id;
        else $idProject=null;
      }
      $critFld=null;$critVal=null;
      $rtListProjectType=Type::listRestritedTypesForClass($class.'Type',$idProject, null,null);
      if (count($rtListProjectType)) {
        foreach($rtListProjectType as $id=>$idType) {
          $restrictArray[$idType]="OK";
        }
        if ($selection) {$restrictArray[$selection]="OK";}
      }
      // End List of type on the item, where item has project 
    } else	if (get_class($obj)=='Asset' and $col=="idBrand" and property_exists($obj, 'idAssetType')) {
      if (!$obj->id) {
        $type = new Type();
        $firstTypeAsset = $type->getSqlElementsFromCriteria(array('scope'=>'Asset'),false,null,' sortOrder asc');
        $critType = $firstTypeAsset[0]->id;
      } else {
        $critType = $obj->idAssetType;
      }
      $brandsOfModels=SqlList::getListWithCrit('Model', array('idAssetType'=>$critType),'idBrand');
      $restrictArray=array_flip($brandsOfModels);
  	} else if ($col=='idDocumentDirectory' and get_class($obj)=='Document') {
  	  $idP=null;
  	  if ($critFld=='idProject' and pq_trim($critVal)) $idP=$critVal;
  	  else if ($obj->idProject) $idP=$obj->idProject;
  	  $prf=$user->getProfile($idP);
  	  foreach ($table as $idT=>$valT) {
  	    $dr=SqlElement::getSingleSqlElementFromCriteria('DocumentRight',array('idDocumentDirectory'=>$idT,'idProfile'=>$prf),true);
  	    $am=new AccessProfile($dr->idAccessMode);
  	    $mode=($obj->id)?$am->idAccessScopeUpdate:$am->idAccessScopeCreate;
  	    $right=SqlList::getFieldFromId('AccessScope', $mode, 'accessCode');
  	    if ($right=='NO') { 
  	      $excludeArray[$idT]=$valT;
  	    } else if ($right=='PRO') {
  	      $affList=$user->getAffectedProjects(true);
  	      if (! isset($affList[$idP])) { 
  	        $excludeArray[$idT]=$valT;
  	      }
  	    }
  	    
  	  }  	  
  	}
    // End of $obj set
  } else { 
    // $obj not set. For lists not on Object context (on most cases combos)
  	if ($col=="idProject") {
  	  // Restrict list f project depending on user rights
      $user=getSessionUser();
      if (! $user->_accessControlVisibility) {
        $user->getAccessControlRights(); // Force setup of accessControlVisibility
      }      
      if ($user->_accessControlVisibility != 'ALL') {
      	$restrictArray=$user->getVisibleProjects($limitToActiveProjects);
  	  }
  	  if(Parameter::getUserParameter("restrictProjectList")=="true") {
  	    $visibleProj = explode(',',pq_trim(pq_substr(getVisibleProjectsList(),1,-1)));
  	    $topList = array();
  	    foreach ($visibleProj as $idProj){
  	      $proj = new Project($idProj,true);
  	      $topProjList = $proj->getTopProjectList(true);
  	      $topList = array_merge($topList, $topProjList);
  	    }
  	    $topList = array_flip($topList);
  	    foreach ($wbsList as $idP=>$wbs){
  	      if(!array_key_exists($idP, $topList)){
  	        $excludeArray[$idP]=SqlList::getNameFromId('Project', $idP);
  	      }
  	    }
  	  }
    } else if ($col=="planning") {
      // Restrict planning depending on user rights
      $user=getSessionUser();
      $restrictArray=$user->getListOfPlannableProjects();
    } else if (($col=="idProduct" or $col=="idProductOrComponent" or $col=="idComponent") and $critFld=='idProject') {
      // List of products with crit on project : propose empty value // TODO : identify why 
   		echo '<option value=" " ></option>';
    	return ;
    }
    // End of $obj not set
  }
// MTY - LEAVE SYSTEM    
    if ($col=="idEmployee") {
        // Leave Admin can see all employee => Nothing to do
        if (isLeavesAdmin()) {
            $restrictArray = getUserVisibleResourcesList(true, 'List', '', true);
        }
        // Leave Manager can see its managed employees
        elseif (isLeavesManager()) {
            $manager = new EmployeeManager(getSessionUser()->id);
            $restrictArray = $manager->getManagedEmployees();
            $restrictArray[getSessionUser()->id] = getSessionUser()->name;
        } 
        // If Employee, can see self only
        if (getSessionUser()->isEmployee==1 and !array_key_exists(getSessionUser()->id, $restrictArray)) {
            $restrictArray[getSessionUser()->id] = getSessionUser()->name;
        }
        if ($selection) $restrictArray[$selection]="OK";
    }
// MTY - LEAVE SYSTEM    
    
  if ( ($col=='idResource' or $col=='idResourceAll' or $col=='idAccountable' or $col=='idResponsible') and Affectable::getVisibilityScope('List',($critFld=='idProject')?$critVal:null)!="all") {
    // Restrict List of affectables : restrict visibility (same Organization, or same Team or All)
    $restrictArray = getUserVisibleResourcesList(true, "List",'', false, false, false, false, false,($critFld=='idProject')?$critVal:null);
    if ($selection) $restrictArray[$selection]="OK";
  }
  if (($col=='idResource' or $col=='idResourceAll') and $obj and get_class($obj)==='Organization') {
    // An organization's manager must belong to the organization (no cascade on parent organizations)
    // Get resources linked by id to organization
    $resourcesOfThisOrga = $obj->getResourcesOfOrganizationsListAsArray();
    $restrictArray = array_intersect_key($restrictArray, $resourcesOfThisOrga);
  }    
  if ($col=='idTargetProductVersion' or $col=='idOriginalProductVersion') { //or $col=='idProductVersion' // TODO - idOriginProductVersion is incorrect
    // Must restrict to versions visible to user
    $limitToNotDeliveredProject = false;
    if ($obj and get_class($obj) == 'Activity' and $col == 'idTargetProductVersion' and Parameter::getGlobalParameter('authorizeActivityOnDeliveredProduct') == 'NO')
      $limitToNotDeliveredProject = true;
    $restrictArrayVersion=getSessionUser()->getVisibleVersions(true, $limitToNotDeliveredProject);
    if (isset($restrictArray) && count($restrictArray)>0) {
      $restrictArray=array_intersect_key($restrictArray, $restrictArrayVersion);
    } else {
      $restrictArray=$restrictArrayVersion;
    }
  } 
  // PBER #7203 (NB : may add "and $critFld!='idProject'" as criteria on project should concern project user has visivility on)
  if ($col=='idProduct' and $obj and get_class($obj)!='ProductVersion') {
    // Must restrict to products visible to user
    $restrictArrayProduct=getSessionUser()->getVisibleProducts();
    if (isset($restrictArray) && count($restrictArray)>0) {
      $restrictArray=array_intersect_key($restrictArray, $restrictArrayProduct);
      if (count($restrictArray)==0) $table=array();
    } else { 
      $restrictArray=$restrictArrayProduct;
    }
  }
  if ($col=='idOrganization' and Affectable::getOrganizationVisibilityScope()!="all") {
    // Restrict list of Organizations
    $restrictArray=array();
    $orga=new Organization();
    $scope=Affectable::getOrganizationVisibilityScope();
    if ($scope=='subOrga') {     // Can see his organization et sub-organization
      $crit="id in (". Organization::getUserOrganizationList().")";
    } else if ($scope=='orga') { // Can see only his organization
      $aff=new Affectable(getSessionUser()->id,true);
      $crit="id='$aff->idOrganization'";
    } else {
      traceLog("Error on htmlDrawOptionForReference() : Organization::getOrganizationVisibilityScope returned something different from 'all', 'subOrga', 'orga'");
      $crit=array('id'=>'0');
    }
    $list=$orga->getSqlElementsFromCriteria(null,false,$crit);
    foreach ($list as $orga) {
      $restrictArray[$orga->id]=$orga->name;
    }
    if ($selection) $restrictArray[$selection]="OK";    
  }
  
  // Add empty selectiopn if not required
  if (! $required) {
    echo '<option value=" " ></option>';
  }
  // For affectables, get the correct name
  if ($selection and ($col=='idResource' or $col=='idAffectable' or $col=='idResourceAll' or $col=='idResourceAllNoMaterial' or $col=='idAccountable' or $col=='idResponsible') and (! isset($table[$selection]) or $table[$selection]==$selection) ) {
    $table[$selection]=SqlList::getNameFromId('Affectable', $selection);
  }
  // Sort array of classes
  if ($listType=='Linkable' or $listType=='Copyable' or $listType=='Importable' or $listType=='Mailable'
   or $listType=='Indicatorable' or $listType=='Checklistable' or $listType=='Dependable' or $listType=='Originable'
   or $listType=='Referencable' or $listType == 'Notifiable' or $listType == 'ResourceAll' or $listType == 'ResourceAllNoMaterial') {
     $sortableTab = array_map('strtolower', $table);
     asort($sortableTab);
     $table = array_merge_preserve_keys($sortableTab, $table);
  }
  // Retreive the char to indent projects structure
  if ($col=="idProject" or $col=="planning") {
    $sepChar=Parameter::getUserParameter('projectIndentChar');
    if (!$sepChar) $sepChar='__';
    $wbsLevelArray=array();
  }
  // Retreive the char to indent organizations structure
  if ($col=="idOrganization") {
    $sepChar=Parameter::getUserParameter('projectIndentChar');
    if (!$sepChar) $sepChar='__';
    $orgaLevelArray=array();      
  }
  // Retreive the char to indent budget structure
  if($col=="idBudget"){
    $sepChar=Parameter::getUserParameter('projectIndentChar');
    if (!$sepChar) $sepChar='__';
    $bbsLevelArray=array();
  }
  if($col=="idSkill"){
  	$sepChar=Parameter::getUserParameter('projectIndentChar');
  	if (!$sepChar) $sepChar='__';
  	$sbsLevelArray=array();
  }
  //class where language will be filtered if already selected ones, in others class, all languages will be proposed
  $classMultiLanguage =array("Component","Product","ProductVersion","ComponentVersion");
  // Exclude in list of languages and contexts the already selected ones
  if ( ($col=='idLanguage' or $col=='idContext') and $obj and in_array(get_class($obj),$classMultiLanguage)) {
    $crtProd='idProduct';
    if ($col=='idLanguage'){
      $productContext = new ProductLanguage();
      $fldCtx='idLanguage';
    } else if ($col=='idContext'){
      $productContext = new ProductContext();
      $fldCtx='idContext';
    }
    if (pq_substr(get_class($obj),-7)=='Version') {
      $crtProd='idVersion';
      if ($col=='idLanguage'){
        $productContext = new VersionLanguage();
      } else if ($col=='idContext'){
        $productContext = new VersionContext();
      }
    }
    $listProductContext = $productContext->getSqlElementsFromCriteria(array($crtProd=>$obj->id));
    foreach ($listProductContext as $context){
      $excludeArray[$context->$fldCtx]=$context->$fldCtx;
    }
  }
  
  $pluginObjectClass=pq_substr($col,2);
  $lstPluginEvt=Plugin::getEventScripts('list',$pluginObjectClass);
  foreach ($lstPluginEvt as $script) {
    require $script; // execute code
  }
  if (! $obj and $col!="planning" and $col!="idProject") $sepChar='no';
  $selectedFound=false;
  $next="";
  if (!$allProjects) {
    if (isset($table['*'])) unset($table['*']);
  }
  
  
// MTY - LEAVE SYSTEM
  if ($col=="idEmployee") {
    $table = getUserVisibleResourcesList(true, "List",'', false, true,true,true);
  }

  if (isLeavesSystemActiv()) { $leaveProjectId = Project::getLeaveProjectId();}
  $group=null;
// MTY - LEAVE SYSTEM
  if($col == "idComplexity"){
    ksort($table);
  }
  foreach($table as $key => $val) {
    if($col == "idComplexity"){
      if(property_exists($obj, 'idWorkUnit')){
      $complexityVal = SqlElement::getSingleSqlElementFromCriteria('ComplexityValues', array('idComplexity'=>$key,'idWorkUnit'=>$obj->idWorkUnit));
      if(!$complexityVal->charge and !$complexityVal->price)continue;
      }
    }
    if($col =="idAsset"){
      if($key== $obj->id)continue;
    }
// MTY - LEAVE SYSTEM
    if ($col=="planning" and isLeavesSystemActiv()) {
    // Don't show the leave system project
      if ($key == $leaveProjectId) {continue;}
    }          
    
// MTY - LEAVE SYSTEM
    if ( (! array_key_exists($key, $excludeArray) and ( count($restrictArray)==0 or array_key_exists($key, $restrictArray)) ) or $key==$selection ) {
      if ( ($col=="idProject" or $col=="planning") and $sepChar!='no') {
        if (isset($wbsList[$key])) {
          $wbs=$wbsList[$key];
          if($wbs=='00000' and !$idReport and ! $reportAdminProject) continue;
        } else {
          $wbs='';
        }
        $wbsTest=$wbs;
        $level=1;
        while (pq_strlen($wbsTest)>3) {
          $wbsTest=pq_substr($wbsTest,0,pq_strlen($wbsTest)-6);
          if (array_key_exists($wbsTest, $wbsLevelArray)) {
            $level=$wbsLevelArray[$wbsTest]+1;
            $wbsTest="";
          }
        }
        $wbsLevelArray[$wbs]=$level;
        $sep='';for ($i=1; $i<$level;$i++) {$sep.=$sepChar;}
        $val = $sep.$val;
      }

// ADD BY Marc TABARY - 2017-02-12 - ORGANIZATIONS COMBOBOX LIST
      if ($col=="idOrganization" and $sepChar!='no' and isset($orgaList[$key])) {   
        $orgOrder=$orgaList[$key];
        $orgTest=$orgOrder;
        $level=1;
        while (pq_strlen($orgTest)>4) {
          $orgTest=pq_substr($orgTest,0,pq_strlen($orgTest)-5);
          if (array_key_exists($orgTest, $orgaLevelArray)) {
            $level=$orgaLevelArray[$orgTest]+1;
            $orgTest="";
          }
        }
        $orgaLevelArray[$orgOrder]=$level;
        $sep='';
        for ($i=1; $i<$level;$i++) {
            if (pq_strpos($sepChar,'|')!==FALSE and $i<$level-1 and pq_strlen($sepChar)>1) {
                $sepCharW = str_repeat('..', 2);
//                $sepCharW = pq_str_replace('|', $sepChar[1], $sepChar);
            } else {$sepCharW = $sepChar;}
            $sep.=$sepCharW;
        }
                
        $val = $sep.$val;
      }
      //gautier #indentBudget   
      if($col=="idBudget"  and isset($budgetList[$key])){
        $budgetOrder = $budgetList[$key];
        $budgetTest=$budgetOrder;
        $level=1;
        while (pq_strlen($budgetTest)>4) {
          $budgetTest=pq_substr($budgetTest,0,pq_strlen($budgetTest)-6);
          if (array_key_exists($budgetTest, $bbsLevelArray)) {
            $level=$bbsLevelArray[$budgetTest]+1;
            $budgetTest="";
          }
        }
        $bbsLevelArray[$budgetOrder]=$level;
        $sep='';
        for ($i=1; $i<$level;$i++) {
          if (pq_strpos($sepChar,'|')!==FALSE and $i<$level-1 and pq_strlen($sepChar)>1) {
            $sepCharW = str_repeat('..', 2);
          } else {$sepCharW = $sepChar;}
          $sep.=$sepCharW;
        }
        if(isset($listBudgetElementary) and get_class($obj)=='Budget'){
          if( in_array($key, $listBudgetElementary))continue;
        }
        $val =$sep.$val;
      }
      
      if($col=="idSkill"  and isset($skillList[$key])){
      	$skillOrder = $skillList[$key];
      	$skillTest=$skillOrder;
      	$level=1;
      	while (pq_strlen($skillTest)>4) {
      		$skillTest=pq_substr($skillTest,0,pq_strlen($skillTest)-6);
      		if (array_key_exists($skillTest, $sbsLevelArray)) {
      			$level=$sbsLevelArray[$skillTest]+1;
      			$skillTest="";
      		}
      	}
      	$sbsLevelArray[$skillOrder]=$level;
      	$sep='';
      	for ($i=1; $i<$level;$i++) {
      		if (pq_strpos($sepChar,'|')!==FALSE and $i<$level-1 and pq_strlen($sepChar)>1) {
      			$sepCharW = str_repeat('..', 2);
      		} else {$sepCharW = $sepChar;}
      		$sep.=$sepCharW;
      	}
      	$val =$sep.$val;
      }
// END ADD BY Marc TABARY - 2017-02-12 - ORGANIZATIONS COMBOBOX LIST

// MTY - LEAVE SYSTEM      
//      if ($col=='idResource' or $col=='idResourceAll' or $col=='idAccountable' or $col=='idResponsible') {
      if ($col=='idResource' or $col=='idAffectable' or $col=='idResourceAll' or $col=='idResourceAllNoMaterial' or $col=='idAccountable' or $col=='idResponsible' or $col=="idEmployee") {
// MTY - LEAVE SYSTEM      
      	if ($key==$user->id) {
      		$next=$key;
      	}
      } else if ($selectedFound) {
      	$selectedFound=false;
      	$next=$key;
      }
      if ($col=='idProduct' and !$next) { // Will return first item (defaut value) for Product 
        $next=$key;
      }
//       if ($col=='idBudgetItem') {
//         $top=SqlList::getFieldFromId('Budget', $key, 'idBudget');
//         if ($top!=$group) {
//           $group=$top;
//           echo '<option value="" disabled="disabled"><span style="font-weight:bold;background:#FFAAAA">'.SqlList::getNameFromId('Budget', $group).'</span></option>';
//         }
//       }

      if($col=='idBudget' and get_class($obj)!='Budget' and isset($listBudgetElementary) and  !in_array($key, $listBudgetElementary) and !in_array($key, $budgetListId))continue;
      
      if($typeSelect and ($col == 'idResourceAll' or $col == 'idResourceAllNoMaterial')){
        if(isset($tabArrayRes)){
          if(!in_array($key, $tabArrayRes))continue;
        }
        echo '<option  value="' . $key . '"';
      } else {
        echo '<option  value="' . $key . '"';
      }
      if ( $selection and $key==$selection and !isset($listBudgetElementary) ) {
      	echo ' SELECTED ';
      	$selectedFound=true; 
      }
// BEGIN - CHANGE BY TABARY - NOTIFICATION SYSTEM
// MTY - LEAVE SYSTEM      
//      if ($col=="idNotificationType" or $col=="idStatusNotification") {          
      if ($col=="idNotificationType" or $col=="idStatusNotification" or $col=="idManagmentType") {          
          echo '><span >'. htmlEncode(i18n($val)) . '</span></option>';
          if ($col=="idStatusNotification") {
              if ($selection==1) { $next=2; } else { $next=1;}
          }
      }elseif($col=='idBudget' and isset($listBudgetElementary)){
         $disabled ='';
        if(!in_array($key,$listBudgetElementary)){
          $disabled="disabled='disabled'";
        }
        if ( $selection and $key==$selection ) {
          echo ' selected="selected" ';
          $selectedFound=true;
        }
        echo $disabled;
        echo '><span>'. htmlEncode($val) . '</span></option>';
      }
      elseif ($col == 'idLocalizationTranslator' and get_class($obj) == 'LocalizationItem'){
          // Here we change behavior of list because we want to know language skill level of a translator for an easier visibility
          $languageSkillLevelId = SqlElement::getSingleSqlElementFromCriteria('LocalizationTranslatorLanguage',array("idTranslator"=>$key,"idLanguage"=>$obj->idLanguage));
          $idLanguageSkillLevel = $languageSkillLevelId->idLanguageSkillLevel;
          $languageSkillLevelName = SqlList::getNameFromId('LanguageSkillLevel',$idLanguageSkillLevel,false);
          $table[$selection]=SqlList::getFieldFromId($refTable, $selection,$column);

          $languageName = SqlList::getNameFromId("Language", $obj->idLanguage);
          $originLanguageName = SqlList::getNameFromId("Language", $obj->idOriginLanguage);
          $originLanguageSkillLevelId =SqlElement::getSingleSqlElementFromCriteria('LocalizationTranslatorLanguage',array("idTranslator"=>$key,"idLanguage"=>$obj->idOriginLanguage));
          $idOriginLanguageSkillLevel = $originLanguageSkillLevelId->idLanguageSkillLevel;
          $originLanguageSkillLevelName = SqlList::getNameFromId('LanguageSkillLevel',$idOriginLanguageSkillLevel,false);
          echo '><span>'. htmlEncode($val) . " - " . htmlEncode($originLanguageName) . ' [' . htmlEncode($originLanguageSkillLevelName) . ']' . " - " .  htmlEncode($languageName) . ' [' . htmlEncode($languageSkillLevelName) . ']' . ' </span></option>';
      }else if($col == 'idTestCase'){
        echo '><span>#'.htmlEncode($key).' - '.htmlEncode($val).'</span></option>';
      }else if($typeSelect and ($col == 'idResourceAll' or $col == 'idResourceAllNoMaterial')){
        $isResourceTeam = SqlList::getFieldFromId('ResourceAll', $key, 'isResourceTeam');
        $isPool=false;
        if($typeSelect and $isResourceTeam==1) $isPool=true;;
        echo ' ><span>'.(($isPool)?'[[POOL]]':'').htmlEncode($val).'</span></option>';
      }else{
        echo '><span>'. htmlEncode($val) . '</span></option>';
      }
// END - CHANGE BY TABARY - NOTIFICATION SYSTEM      
    }
  }
  // This function is not expected to return value, but is used to return next value (for status)
  return $next;
}

function htmlReturnOptionForWeekdays($selection, $required=false, $valueIsName=false) {
	$arrayWeekDay=array('1'=>'Monday', '2'=>'Tuesday', '3'=>'Wednesday', '4'=>'Thursday',
	                    '5'=>'Friday', '6'=>'Saturday', '7'=>'Sunday');
  $result="";
	if (! $required) {
    $result.='<option value=" " ></option>';
  }
  for ($key=1; $key<=7; $key++) {
    if($valueIsName)$result.= '<option value="' . $arrayWeekDay[$key] . '"';
    else $result.= '<option value="' . $key . '"';
    if ( $selection and $key==$selection ) { $result.= ' SELECTED '; } 
    $result.= '>'. i18n($arrayWeekDay[$key]) . '</option>';
  }
  return $result;
}

function htmlReturnOptionForMonths($selection, $required=false) {
  $arrayMonth=array('1'=>'January', '2'=>'February', '3'=>'March', '4'=>'April',
                      '5'=>'May', '6'=>'June', '7'=>'July','8'=>'August',
                      '9'=>'September', '10'=>'October', '11'=>'November','12'=>'December');
  $result="";
  if (! $required) {
    $result.='<option value=" " ></option>';
  }
  for ($key=1; $key<=12; $key++) {
    $result.= '<option value="' . $key . '"';
    if ( $selection and $key==$selection ) { $result.= ' SELECTED '; } 
    $result.= '>'. i18n($arrayMonth[$key]) . '</option>';
  }
  return $result;
}
/** ===========================================================================
 * Display the info of the aplication (name, version) with link to website
 * @return void
 */
function htmlDisplayInfos() {
  global $copyright, $version, $website, $aboutMessage;
  echo "<a class='statusBar' target='#' href='$website' >$copyright $version&nbsp;</a>";
}

/** ===========================================================================
 * Display the info of the aplication (name, version) with link to website
 * @return void
 */
function htmlDisplayDatabaseInfos() {
  $paramDbName=Parameter::getGlobalParameter('paramDbName');
  $paramDbDisplayName=Parameter::getGlobalParameter('paramDbDisplayName');
  $simuIndex=Parameter::getGlobalParameter('simuIndex');
  if (! $paramDbDisplayName) {
    $paramDbDisplayName=$paramDbName;
  }
  if($simuIndex){
  	$paramDbDisplayName=i18n('DataCloning').' '.$paramDbDisplayName;
  }
  echo "<span style='text-align:center;user-select: none;pointer-events: none;'><b>$paramDbDisplayName</b></span>";
}

/** ===========================================================================
 * Display the message No object selected for the corresponding object,
 * translate using i18n
 * @param $className the class of the object
 * @return void
 */
function htmlGetNoDataMessage($className) {
    return '<br/><i><div style="position:relative;left:15px;">' . i18n('messageNoData',array(i18n($className))) . '</div></i>';
}

function htmlGetNoAccessMessage($className) {
	return '<br/><i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' . i18n('messageNoAccess',array(i18n($className))) . '</i>';
}

function htmlGetDeletedMessage($className) {
  return '<br/><i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' . i18n('messageDeleted',array(i18n($className))) . '</i>';
}


/** ===========================================================================
 * Draw an html Table as cross reference
 * @param $lineObj the object class containing line data
 * @param $columnTable the table containing column data
 * @param $pivotTable the table containing pivot data (must contain id'ColumnTable' and id'LineTable'
 * @param $pivotValue the name of the field in pivot table containing pivot data
 * @param $format the format of data : check, text, label
 * @return void
 */
function htmlDrawCrossTable($lineObj, $lineProp, $columnObj, $colProp, $pivotObj, $pivotProp, $format='label', $formatList=null, $break=null) {
// MTY - LEAVE SYSTEM
    // Don't draw leave system menu
    $testIfLeavesSystemMenu = false;
    if (!is_array($lineObj)) {
        if ($lineObj=="menu" and $lineProp=="idMenu") {
            $testIfLeavesSystemMenu = true;
        }
    }
// MTY - LEAVE SYSTEM
  global $collapsedList;
	if (is_array($lineObj)) {
    $lineList=$lineObj;
  } else {
    $lineList=SqlList::getList($lineObj);
  }
  // Filter on line (for instance will filter menu)
  if (is_array($lineObj)) {
    $pluginObjectClass='';
  } else {
    $pluginObjectClass=pq_ucfirst($lineObj);
  }
  $table=$lineList;
  $lstPluginEvt=Plugin::getEventScripts('list',$pluginObjectClass);
  foreach ($lstPluginEvt as $script) {
    require $script; // execute code
  }
  $lineList=$table;
  // Filter on columns (for instance will filter profile)
  $columnList=SqlList::getList($columnObj);
  $pluginObjectClass=pq_ucfirst($columnObj);
  $table=$columnList;
  $lstPluginEvt=Plugin::getEventScripts('list',$pluginObjectClass);
  foreach ($lstPluginEvt as $script) {
    require $script; // execute code
  }
  $columnList=$table;
  echo '<div style="width:98%; overflow-x:auto;  overflow-y:hidden;">';
  if ( ! ($break and ! is_array($lineObj)) ) {
	  echo '<table class="crossTable" >';
	  // Draw Header
	  echo '<tr><td>&nbsp;</td>';
	  foreach ($columnList as $col) {
	    echo '<td class="tabLabel">' . $col . '</td>';
	  }
	  echo '</tr>';
  }
  $breakVal='';
  $breakNum=0;
  foreach($lineList as $lineId => $lineName) {
// MTY - LEAVE SYSTEM
        // Don't show menu of leave system in habilitation if not activ
        if ( $testIfLeavesSystemMenu and //!isLeavesSystemActiv() and 
            $pivotObj=="habilitation" and 
            $lineObj=="menu" and 
            in_array($lineName, leavesSystemMenuI18nList())) {
            //$breakNum=0;
            //$breakVal='';
            continue;
        }
        if (!is_array($lineObj) and pq_substr($lineObj,0,4)=="menu") {
          $menuName=SqlList::getNameFromId('Menu', $lineId,false);
          if (!Module::isMenuActive($menuName)) {
            continue;
          }
        }
// MTY - LEAVE SYSTEM      
  	if ($break and ! is_array($lineObj)) {
  		$class=pq_ucfirst($lineObj);
  		$test=new $class($lineId,true);
  		if ($test->$break != $breakVal) {
  			$breakNum++;
  			$breakClass=pq_substr($break,2);
  			$breakObj=new $breakClass($test->$break,true);
  			$breakName="";
  			if ($breakObj->name) {
  			  $breakName=(property_exists($breakObj,'_isNameTranslatable'))?i18n($breakObj->name):$breakObj->name;
  			} 
  			//echo '<tr><td class="tabLabel" style="text-align:left;border-top:2px solid #A0A0A0;">' . $breakName  . '</td>';
  			if ($test->$break) {
  			  $breakCode=$breakObj->name;
  			} else {
  				$breakCode=$breakNum;
  			} 
  			if($breakCode == 'reportCategoryObjectList')continue;
  			echo '</table></div><br/>';
        $divName='CrossTable_'.$lineObj.'_'.$breakCode;
        echo '<div id="' . $divName . '" dojoType="dijit.TitlePane" class="TitlePaneDisplay"';
        echo ' open="' . (array_key_exists($divName, $collapsedList)?'false':'true') . '"';
        echo ' onHide="saveCollapsed(\'' . $divName . '\');"';
        echo ' onShow="saveExpanded(\'' . $divName . '\');"';
        echo ' title="' .$breakName . '"';
        echo ' style="width:98%; overflow-x:auto;  overflow-y:hidden;"';
        echo '>';
        echo '<table class="crossTable">';
        echo '<tr><td>&nbsp;</td>';
			  foreach ($columnList as $col) {
			    echo '<td class="tabLabel">' . $col . '</td>';
			  }
			  echo '</tr>';
        echo '<tr>';  			
  		}
  		$breakVal=$test->$break;
  	}
  	$title=i18n('help'.pq_ucfirst($lineId));
  	if (pq_substr($title,0,1)=='[') $title="";
    echo '<tr><td class="crossTableLine" title="'.$title.'" style="padding-right:10px;"><label class="label largeLabel">'.$lineName . '</label></td>';
    foreach ($columnList as $colId => $colName) {
      $crit=array();
      $crit[$lineProp]=$lineId;
      $crit[$colProp]=$colId;
      $name=$pivotObj . "_" . $lineId . "_" . $colId;
      $class=pq_ucfirst($pivotObj);
      $obj=SqlElement::getSingleSqlElementFromCriteria($class, $crit);
      $val=$obj->$pivotProp;
      echo '<td class="crossTablePivot">';
      switch ($format) {
        case 'check':
          $checked = ($val!='0' and ! $val==null) ? 'checked' : '';
          echo '<input dojoType="dijit.form.CheckBox" type="checkbox" ' . $checked . ' id="' . $name . '" name="' . $name . '" />'; 
          break;
        case 'text':
          echo '<input dojoType="dijit.form.TextBox id="' . $name . '" name="' . $name . '" type="text" class="input" style="width: 100px;" value="' . $val . '" />';
          break;
        case 'list':
          //echo '<input dojoType="dijit.form.TextBox id="' . $name . '" name="' . $name . '" type="text" class="input" style="width: 100px;" value="' . $val . '" />';
          echo '<select dojoType="dijit.form.FilteringSelect" class="input" '; 
          echo autoOpenFilteringSelect();
          echo ' style="width: 100px; font-size: 80%;"';
          echo ' id="' . $name . '" name="' . $name . '" ';
          echo ' >';
          htmlDrawOptionForReference('id' . $formatList, $val, null, true); 
          echo '</select>';
          break;  
        case 'label':
          echo $val;
          break;
      }
      echo '</td>';
    }
    echo '</tr>';
  }
  
  
  echo '</table></div>';
  
}

/** ===========================================================================
 * Get the data of a form table designed with htmlDrawCrossTable
 * @param $lineTable the table containing line data
 * @param $columnTable the table containing column data
 * @param $pivotTable the table containing pivot data (must contain id'ColumnTable' and id'LineTable'
 * @param $pivotValue the name of the field in pivot table containing pivot data
 * @param $format the format of data : check, text, label
 * @return an array containing 
 */
function htmlGetCrossTable($lineObj, $columnObj, $pivotObj) {
  if (is_array($lineObj)) {
    $lineList=$lineObj;
  } else {
    $lineList=SqlList::getList($lineObj);
  }
  // Filter on line (for menu)
  if (! is_array($lineObj)) {
    $pluginObjectClass=pq_ucfirst($lineObj);
    $table=$lineList;
    $lstPluginEvt=Plugin::getEventScripts('list',$pluginObjectClass);
    foreach ($lstPluginEvt as $script) {
      require $script; // execute code
    }
    $lineList=$table;
  }
  $columnList=SqlList::getList($columnObj);
  // Filter on columns (for profile)
  $pluginObjectClass=pq_ucfirst($columnObj);
  $table=$columnList;
  $lstPluginEvt=Plugin::getEventScripts('list',$pluginObjectClass);
  foreach ($lstPluginEvt as $script) {
    require $script; // execute code
  }
  $columnList=$table;
  $result=array();
  foreach($lineList as $lineId => $lineName) {
    foreach ($columnList as $colId => $colName) {
      $name=$pivotObj . "_" . $lineId . "_" . $colId;
      $val="";
      if (array_key_exists($name,$_REQUEST)) {
        $val=$_REQUEST[$name];
      }
      if (!is_array($lineObj) and $lineObj=="menu") {
        $menuName=SqlList::getNameFromId('Menu', $lineId,false);
        if (!Module::isMenuActive($menuName)) {
          continue;
        }
      }
      // Note: this needs an in-depth security review - seems to allow arbitrary manipulations of values (including access rights) by calls to saveParameter.php
      // TODO (SECURITY) : check validity of returned values
      $result[$lineId][$colId]=$val; 
    }
  }
  return $result;
}

/** ===========================================================================
 * Construct a Js table from a Php table (got from a database table)
 * @param $tableName name of database table containing data
 * @param $colName column name co,ntaining requested data in table
 * @return javascript creating an array 
 */
function htmlGetJsTable($tableName, $colName, $jsTableName=null) {
  $tab=SqlList::getList($tableName,$colName);
  asort($tab);
  $jsTableName=(! $jsTableName) ? 'tab'.pq_ucfirst($tableName):$jsTableName;
  $script='var ' . $jsTableName . ' = [ ';
  $nb=0;
  foreach ($tab as $id=>$value) {
    $script .= (++$nb>1) ? ', ': '';
    $script .= ' { id: "' . $id . '", ' . $colName . ': "' . $value . '" } ';
  }
  $script.= ' ];';
  return $script;
}

/**
 * Format a date, depending on currentLocale
 * @param $val
 * @return unknown_type
 */
function htmlFormatDate($val,$trunc=false,$textual=true) {
  global $browserLocaleDateFormat;
  if (!$val) return '';
  $timezone = (Parameter::getUserParameter('timeZone') != '')?Parameter::getUserParameter('timeZone'):Parameter::getGlobalParameter('paramDefaultTimezone');
  $value = date('Y-m-d', pq_strtotime($val.' '.$timezone));
  if (pq_strlen($value)!=10) {
  	if (pq_strlen($value)==19) {
  		if ($trunc) {
  			$val=pq_substr($value,0,10);
  		} else {
  		  return htmlFormatDateTime($value,true,false,$textual);
  		}
  	} else {
      return $value;
  	}
  }
  $year=pq_substr($value,0,4);
  $month=pq_substr($value,5,2);
  $day=pq_substr($value,8,2);
  $result=pq_str_replace('YYYY', $year, $browserLocaleDateFormat);
  $result=pq_str_replace('MM', $month, $result);
  $result=pq_str_replace('DD', $day, $result);
  $result=pq_str_replace('YY', pq_substr($year,2,2), $result);
  return $result;
}

/**
 * Format a dateTime, depending on currentLocale
 * @param $val
 * @return unknown_type
 */
function htmlFormatDateTime($val, $withSecond=true, $hideZeroTime=false,$textual=true) {
  global $browserLocale,$idTemplate,$outputHtml;
  if ($idTemplate) $textual=false;
  $isToday=false;
  $classicFormatDate=true;
  $classicFormatDateHour=false;
  $locale=pq_substr($browserLocale, 0,2);
  if (pq_strlen($val)!=19 and pq_strlen($val)!=16) {
    if (pq_strlen($val)=="10") {
      return htmlFormatDate($val);
    } else {
      return $val;
    }
  }
  $yesterday=date('Y-m-d', pq_strtotime(convertServerTimeToUserTimezone(date("Y-m-d H:i:s")). ' - 1 days '));
  $today=date('Y-m-d', pq_strtotime(convertServerTimeToUserTimezone(date("Y-m-d H:i:s"))));
  $hourDiff=date_diff(date_create($val),date_create(date("Y-m-d H:i:s")));
  $value = convertServerTimeToUserTimezone($val);
  switch (pq_substr($value,0,10)){
  	case $today:
  	  $isToday=true;
  	  if ($textual) {
  	    $classicFormatDate=false;
  	    $withSecond=false;
  	    $result=i18n("today").'&nbsp;'.i18n('formatDateAt').'&nbsp;';
  	  } else { 
  	    $result=htmlFormatDate(pq_substr($value,0,10)).'&nbsp;';
  	  }	  
  	  break;
  	case $yesterday:
  	  if ($textual) {
  	    $classicFormatDate=false;
  	    $withSecond=false;
  	    $result=i18n("yesterday").'&nbsp;'.i18n('formatDateAt').'&nbsp;';
  	  } else {
  	    $result=htmlFormatDate(pq_substr($value,0,10)).'&nbsp;';
  	  }
  	  break;
  	default :
  	  $result=htmlFormatDate(pq_substr($value,0,10)).'&nbsp;';
  	  break;
  }
  if (! $hideZeroTime or pq_substr($val,11,5)!='00:00') {
    if($isToday and $textual and ! $hourDiff->invert){
      switch ($hourDiff){
        case ($hourDiff->h=='0' and $hourDiff->i<='1'):
          $result=i18n("justNow");
          break;
        case ($hourDiff->h=='0' and $hourDiff->i<='5'):
          $result=i18n("lastFiveMinutes");
          break;
        case ($hourDiff->h=='0' and $hourDiff->i<='15'):
          $result=i18n("lastQuarterHour");
          break;
        case ($hourDiff->h=='0' and $hourDiff->i<='30'):
          $result=i18n("lastHalfHour");
          break;
        case ($hourDiff->h<='1' and $hourDiff->i>'30'):
          $result=i18n("lastHour");
          break;
        default :
          $classicFormatDateHour=true;
      	  $result.=(($withSecond)?pq_substr($value,11):pq_substr($value,11,5));
      	  break;
      }
    }else{
      $classicFormatDateHour=true;
      $result.=($withSecond)?pq_substr($value,11):pq_substr($value,11,5);
    }
  }
  if(getSessionValue('browserLocaleTimeFormat')=='h:mm a' and $classicFormatDate){
    $result = htmlFormatDate(pq_substr($value,0,10)) .'&nbsp;'. date('g:i A',pq_strtotime($value.' '.$timezone));
  }else if(getSessionValue('browserLocaleTimeFormat')=='h:mm a' and $classicFormatDateHour){
    $result .=date('g:i A',pq_strtotime($value.' '.$timezone));
  }
  if ($idTemplate and ! $outputHtml) {
    $result=pq_str_replace('&nbsp;',' ',$result); 
  }
  return $result;
}
//gautier #time
function htmlFormatTime($val, $withSecond=true) {
  global $browserLocale;
  $timezone = (Parameter::getUserParameter('timeZone') != '')?Parameter::getUserParameter('timeZone'):Parameter::getGlobalParameter('paramDefaultTimezone');
  $locale=pq_substr($browserLocale, 0,2);
  $value = convertServerTimeToUserTimezone($val);
  $result=(($withSecond)?$value:pq_substr($value,0,5));
  $result=date('H:i', pq_strtotime($result.' '.$timezone));
  if(getSessionValue('browserLocaleTimeFormat')=='h:mm a'){
    $result2 =   date('g:i A',pq_strtotime($result.' '.$timezone));
    $result = $result2;
  }
  return $result;
}
/** ============================================================================
 * Transform string to be displays in html, pedending on context 
 * @param $context Printing context : 
 *   'print' : for printing purpose, also converts nl to <br> 
 *   'default' : default for conversion
 *   'none' : no convertion
 * @return string - the formated value 
 */
function htmlEncode($val,$context="default") {
  if ($val===null) return '';
  $val=pq_str_replace(array('<style','/style>'),array('<nostyle','/nostyle>'),$val);
  if ($context=='none') {
    return pq_str_replace('"',"''",$val);
  } else if ($context=='print' or $context=='html') {
    return nl2br(pq_htmlentities($val,ENT_COMPAT,'UTF-8'));
  } else if ($context=='htmlNoNl2br') {
    return pq_htmlentities($val,ENT_COMPAT,'UTF-8');
  } else if ($context=='withBR') {
    return nl2br(pq_htmlspecialchars($val,ENT_QUOTES,'UTF-8'));
  } else if ($context=='mail') {
    $str=$val;
    if (get_magic_quotes_gpc()) {
      $str=pq_str_replace('\"','"',$str);
      $str=pq_str_replace("\'","'",$str);
      $str=pq_str_replace('\\\\','\\',$str);
    }
    return nl2br(pq_htmlentities($str,ENT_QUOTES,'UTF-8'));
  } else if ($context=='quotes') {
  	$str=pq_str_replace("'"," ",$val);
  	$str=pq_str_replace('"'," ",$str);
  	return $str;
  } else if ($context=='xml') {
  	$str=$val;
  	$str=pq_str_replace("	"," ",$val);
  	return pq_htmlspecialchars($str,ENT_QUOTES,'UTF-8');
  } else if ($context=="parameter") {
  	$str=pq_str_replace('"',"''",$val);
  	return pq_htmlspecialchars($str,ENT_QUOTES,'UTF-8');
  } else if ($context=="title") {
    $str=$val;
    //$str=br2nl($val);
    if (isTextFieldHtmlFormatted($str)) {
      $str=pq_str_replace("\n", "", $str);
      $str=pq_htmlspecialchars($str,ENT_QUOTES,'UTF-8');
    } else {
      $str=pq_htmlspecialchars(pq_htmlspecialchars($str,ENT_QUOTES,'UTF-8'),ENT_QUOTES,'UTF-8');
    }
    $str=pq_str_replace( array("\r\n","\n","\r"), array('<br/>','<br/>','<br/>'),$str);
    return $str;
  } else if ($context=="formatted") { // For long text, html format must be preserved but <script> must be removed (Mandatory for Editor fields)
    // Step one : remove <script> tags
    $str = preg_replace('#<script(.*?)>(.*?)</script>#is', '', pq_nvl($val));
    // Step two : if some dangerous scripting capacitites still exist : replace text by warning image
    $test=pq_strtolower($str);
    if (pq_strpos($test,'<script')!==false or pq_strpos($test,'onmouseover')!==false) {
      $str='<img src="../view/img/error.png"/><br/>'.i18n('textHiddenForSecurity');
    }
    return $str;
  } else if ($context=="pdf") {
    $str=pq_str_replace(array('</div>','</p>'),array('</div><br/>','</p><br/>'), $val);
    $str=strip_tags($str,'<br><br/><font><b>');
    return $str;
  } else if ($context=="stipAllTags") {
    //$str=pq_str_replace(array('</div>','</p>',"\n"),array('</div><br/>','</p><br/>',''), $val);
    $str=strip_tags($val);
    //$str=pq_str_replace('<br/>',"\n",$str);
    return $str;
  } else if ($context=='protectQuotes') {
    $str=pq_str_replace(array("'",'"'), array('\\'."'",'\\'.'"'), $val);
    return pq_htmlspecialchars($str,ENT_QUOTES,'UTF-8');    
  } else if ($context=='plainText') {
  	return nl2br(pq_htmlentities(pq_str_replace(array("\n",'<br>','<br/>','<br />'),array("","\n","\n","\n"),$val)));
  }
  return pq_htmlspecialchars(pq_nvl($val),ENT_QUOTES,'UTF-8');
}

function htmlEncodeUrl($link) {
  $link=htmlEncode($link);
  if (pq_substr($link,0,4)!='http' and pq_substr($link,0,7)!='mailto:' and pq_substr($link,0,4)!='tel:') {
    $link='http://'.$link;
  }
  return $link;
}
/**
 * Remove all caracters that may lead to error on Json file rendering
 * @param $val
 * @return unknown_type
 */
function htmlEncodeJson($val, $numericLength=0) {
  $val = pq_str_replace("\\","\\\\",$val);
  $val = pq_str_replace("\"","\\\"",$val);
  $val = pq_str_replace("\n"," ",$val);	     
  $val = preg_replace('/[ ]{2,}|[\t]/', ' ', pq_nvl(pq_trim($val)));
  $val=preg_replace('~[^\P{Cc}\r\n]+~u', '', pq_nvl($val));
  $val = pq_str_replace(array("\x0A","\x0D","\x1B"),"",$val);
  if ($numericLength>0) {
    if (pq_strpos($val,'.')>0) $numericLength+=pq_strlen($val)-pq_strpos($val,'.');
    $val=str_pad($val,$numericLength,'0', STR_PAD_LEFT);
  }
  return $val;
}

/** ============================================================================
 * Return an error message formated as a resultDiv result
 * @param $message the message to display
 * @return formated html message, with corresponding html input
 */
function htmlGetErrorMessage($message) {
  $returnValue = '<div class="messageERROR" >' . $message . '</div>';
  $returnValue .= '<input type="hidden" id="lastSaveId" value="" />';
  $returnValue .= '<input type="hidden" id="lastOperation" value="control" />';
  $returnValue .= '<input type="hidden" id="lastOperationStatus" value="ERROR" />';
  return $returnValue;
}

/** ============================================================================
 * Return a warning message formated as a resultDiv result
 * @param $message the message to display
 * @return formated html message, with corresponding html input
 */
function htmlGetWarningMessage($message) {
  $returnValue = '<div class="messageWARNING" >' . $message . '</div>';
  $returnValue .= '<input type="hidden" id="lastSaveId" value="" />';
  $returnValue .= '<input type="hidden" id="lastOperation" value="control" />';
  $returnValue .= '<input type="hidden" id="lastOperationStatus" value="WARNING" />';
  return $returnValue;
}

// MTY - FACILITY
/** ============================================================================
 * Return a message formated as a resultDiv result
 * @param string $messageType ERROR or WARNING - If passed other value then = null and no header message
 * @param string $message The message content. Default = 'An unknown error occurs' 
 * @param boolean $toTranslate True, if the content must be translated. In this case, $message must have a translation in tool/i18n
 * @param integer $idValue The id's value of the object on which the result occurs
 * @param string $lastOperationValue The last operation introduising this result
 * @param string $lastOperationStatus The status of the last operation introduising this result
 * @return string formated html message, with corresponding html input
 */
function htmlSetResultMessage($messageType=null, 
                              $message="AnUnknownErrorOccurs",
                              $toTranslate=false,
                              $idValue="", 
                              $lastOperationValue="ERROR", 
                              $lastOperationStatus="ERROR") {
    $returnValue="";
    if ($messageType!="ERROR" and $messageType!="WARNING") {$messageType = null;}
    if ($message=="AnUnknownErrorOccurs") { $message = i18n($message);} else { $message = ($toTranslate?i18n($message):$message);}
    if ($messageType!=null) {
        $returnValue = '<div class="message'.$messageType.'" >' . $message . '</div>';
    } else {
        $returnValue = $message;
    }
    $returnValue .= '<input type="hidden" id="lastSaveId" value="'.$idValue.'" />';
    $returnValue .= '<input type="hidden" id="lastOperation" value="'.$lastOperationValue.'" />';
    $returnValue .= '<input type="hidden" id="lastOperationStatus" value="'.$lastOperationStatus.'" />';
  return $returnValue;
}

/**
 * Return the message contented in the result of a CRUD operation
 * @param string $result : The result of a CRUD operation
 * @return string : The message contented in the result
 */
function getResultMessage($result) {
    $needle = '<input type="hidden" id="lastOperationStatus"';
    $message = pq_substr($result,0,pq_strpos($result,$needle));

    return $message;
}
// MTY - FACILITY

/** ============================================================================
 * Return an mime/Type formated as an image
 * @param $mimeType the textual mimeType
 * @return formated html mimeType, as an image
 */
function htmlGetMimeType($mimeType,$fileName, $id=null, $type='Attachment',$float="float:left",$size=null) {
    $ext = pq_strtolower(pathinfo(pq_str_replace('.projeqtor.txt','',$fileName), PATHINFO_EXTENSION));
    if (file_exists("../view/img/mime/$ext.png")) {
      $img="../view/img/mime/$ext.png";
    } else {
      $img= "../view/img/mime/unknown.png";
    }
    $image='<img src="' . $img . '" title="' . $mimeType . '" ';
    //or $ext=='msg' or $ext=='emg'
    if ($id and ($ext=="htm" or $ext=="html" or $ext=="pdf" or $ext=="txt" or $ext=="log" )) {
    	$image.=' style="'.(($size)?'height:'.$size.'px;':'').'cursor:pointer;'.$float.';" onClick="showHtml(\''.$id.'\',\''.htmlEncode($fileName,'quotes').'\',\''.$type.'\')" ';
    }
    else {
      $image.=' style="'.$float.';opacity: 0.4;filter: alpha(opacity=40);" ';
    }
    $image.='/>'.(($float=="float:left")?'':'&nbsp;');
  return $image;
}

/** ============================================================================
 * Return an fileSize formated as GB, MB KB or B 
 * @param $mimeType the textual mimeType
 * @return formated html mimeType, as an image
 */
function htmlGetFileSize($fileSize) {
  $nbDecimals=1;
  $limit=1000;
  if ($fileSize===null) {
    return '';
  }
  if ($fileSize<$limit) {
    return $fileSize . ' ' . i18n('byteLetter');
  } else {
    $fileSize=round($fileSize/1024,$nbDecimals);
    if ($fileSize<$limit) {
      return $fileSize . ' K' . i18n('byteLetter');
    } else {
      $fileSize=round($fileSize/1024,$nbDecimals);
      if ($fileSize<$limit) {
        return $fileSize . ' M' . i18n('byteLetter');
      } else {
        $fileSize=round($fileSize/1024,$nbDecimals);
        if ($fileSize<$limit) {
          return $fileSize . ' G' . i18n('byteLetter');
        } else {
          $fileSize=round($fileSize/1024,$nbDecimals);
          return $fileSize . ' T' . i18n('byteLetter');
        }      
      }
    }
  }
}

/**
 * Extract argument from condition
 * @param $tag String to extract from
 * @param $arg 
 * @return String
 */
function htmlExtractArgument($tag, $arg) {
  $sp=pq_explode($arg . '=', $tag);
  $fld="";
  if (isset($sp[1])) {
    $fld=$sp[1];
    if (pq_strpos($fld,' ')>1) {
      $fld=pq_substr($fld,0,pq_strpos($fld,' '));
    }
    if (pq_strpos($fld,'>')>1) {
      $fld=pq_substr($fld,0,pq_strpos($fld,'>'));
    }
    $fld=pq_trim($fld,'"');
  }
  return $fld;
}

/**
 * Display a, Array of filter criteria
 * @param $filterArray Array
 * @return Void
 */
function htmlDisplayFilterCriteria($filterArray, $filterName="") {
  // Display Result
  echo "<table width='99.9%'>";
  echo "<tr><td class='dialogLabel'>";
  echo '<label for="filterNameDisplay" style="'.((isNewGui())?'position:relative;top:5px;':'').'">' . i18n("filterName") . '&nbsp;'.((!isNewGui())?':':'').'&nbsp;</label>';
  echo '<div type="text" dojoType="dijit.form.ValidationTextBox" ';
  echo ' name="filterNameDisplay" id="filterNameDisplay"';
  echo '  style="width: '.((isNewGui())?'520px':'550px;').'" ';
  echo ' trim="true" maxlength="100" class="input" ';
  echo ' value="' . $filterName . '" ';
  echo ' >';
  echo '</td><td style="text-align:center">';
  echo '<button title="' . i18n('saveFilter') . '" ';  
  echo ' dojoType="dijit.form.Button" '; 
  echo ' id="dialogFilterSave" name="dialogFilterSave" class="resetMargin roundedButton notButton" style="height:24px;width:32px;margin-top:-1px;"';
  echo ' iconClass="dijitButtonIcon dijitButtonIconSave imageColorNewGui" showLabel="false"> ';
  echo ' <script type="dojo/connect" event="onClick" args="evt">saveFilter();</script>';
  echo '</button>';
  echo "</td></tr>";
  echo "<tr>";
  echo "<td class='filterHeader' style='width:525px;padding-left:50px'>" . i18n("criteria") . "</td>";
  echo "<td class='filterHeader' style='width:25px;'>";
  echo ' <a src="css/images/smallButtonRemove.png" onClick="removefilterClause(\'all\');" title="' . i18n('removeAllFilters') . '" > ';
  echo formatSmallButton('Remove');
  echo ' </a>';
  echo "</td>";
  echo "</tr>";
  //ADD qCazelles - Dynamic filter - Ticket #78
  $nbDynamicFilterCriteria=0;
  $nbFilters=0;
  //END ADD qCazelles - Dynamic filter - Ticket #78
  $nbHiddenFilters=0;   //ADD qCazelles - Ticket 165
  if (count($filterArray)>0) { 
    foreach ($filterArray as $id=>$filter) {
      if (isset($filter['hidden']) and $filter['hidden']=='1') {    //ADD qCazelles - Ticket 165
        $nbHiddenFilters+=1;
        continue;
      }
      echo "<tr>";
      echo "<td class='filterData' style=''>";
      //ADD qCazelles - Dynamic filter - Ticket #78
    if (!isset($filter['orOperator'])) $filter['orOperator']=0;
    if (!isset($filter['isDynamic'])) $filter['isDynamic']=0;
	  if ($filter['orOperator']=='1') {
      	echo i18n('OR').' ';
      }
      	elseif ($nbFilters==0) { //Nothing is displayed on the first criteria
       	$nbFilters+=1;
      }
      else {
      	echo i18n('AND').' ';
      }
      //END ADD qCazelles - Dynamic filter - Ticket #78
      echo $filter['disp']['attribute'] . " " .
           $filter['disp']['operator'] . " " .
           //CHANGE qCazelles - Dynamic filter - Ticket #78
           //Old
      	   //$filter['disp']['value'] .
           //New
           ($filter['isDynamic']=="1" ? '{'.i18n('dynamicValue').'}' : $filter['disp']['value']) .
           //END CHANGE qCazelles - Dynamic filter - Ticket #78
      	   "</td>";
      echo "<td class='filterData' style='text-align: center;'>";
      echo ' <a src="css/images/smallButtonRemove.png" onClick="removefilterClause(' . $id . ');" title="' . i18n('removeFilter') . '" > ';
      echo formatSmallButton('Remove');
      echo ' </a>';
      echo "</td>";
      echo "</tr>";
      //ADD qCazelles - Dynamic filter - Ticket #78
      if ($filter['isDynamic']=="1") {
      	$nbDynamicFilterCriteria+=1;
      }
      //END ADD qCazelles - Dynamic filter - Ticket #78
    }
  }
  //CHANGE qCazelles - Ticket 165
  //Old
  //else {
  //  echo "<tr><td class='filterData' colspan='2'><i>" . i18n("noFilterClause") . "</i></td></tr>";
  //}
  //echo "</table>";
  //echo '<input id="nbFilterCriteria" name="nbFilterCriteria" type="hidden" value="' . count($filterArray) . '" />';
  //New
  if (count($filterArray)==$nbHiddenFilters) {
    echo "<tr><td class='filterData' colspan='2' style=''><i>" . i18n("noFilterClause") . "</i></td></tr>";
  }
  if (isNewGui()) { echo '<tr><td><div style="height:6px"></div></td></tr>';}
  echo "</table>";
  
  echo '<input id="nbFilterCriteria" name="nbFilterCriteria" type="hidden" value="' . (count($filterArray) - $nbHiddenFilters) . '" />';
  //END CHANGE qCazelles - Ticket 165
  //ADD qCazelles - Dynamic filter - Ticket #78
  echo '<input id="nbDynamicFilterCriteria" name="nbDynamicFilterCriteria" type="hidden" value="'.$nbDynamicFilterCriteria.'" />';
  //END ADD qCazelles - Dynamic filter - Ticket #78
}

/**
 * Display a, Array of filter criteria
 * @param $filterArray Array
 * @return Void
 */
function htmlDisplayStoredFilter($filterArray,$filterObjectClass,$currentFilter="", $context="", $comboDetail=false) {
  // Display Result
  $param=SqlElement::getSingleSqlElementFromCriteria('Parameter', 
       array('idUser'=>getSessionUser()->id, 'parameterCode'=>'Filter'.$filterObjectClass));
  $defaultFilter=($param)?$param->parameterValue:'';
  echo "<div id='displayFilterList' style='overflow:hidden;'>";
  echo "<table width='100%'>";
  echo "<tr style='height:22px;'>";
  if ($context!='directFilterList') {
  	echo "<td class='filterHeader' colspan='3' style='width:749px;'>" . (isNewGui()?i18n("storedFiltersQuick"):i18n("storedFilters")) . "</td>";
    /*echo "<td class='filterHeader' style='width:25px;'>";
    echo "<td class='filterHeader' style='width:25px;'>";*/
  } else {
  	echo "<td class='filterHeader' style='".((!isNewGui())?'font-size:8pt;':'')."width:300px;'>" . (isNewGui()?i18n("storedFiltersQuick"):i18n("storedFilters")) . "</td>";
  }
  echo "</td>";
  echo "</tr>";
  if ($context=='directFilterList') {
    echo "<tr>";
    echo '<td style="cursor:pointer;'.((!isNewGui())?'font-size:8pt;':'').'font-style:italic;padding:5px' 
           . '"' 
           . ' class="filterData" '
           . 'onClick="selectStoredFilter(\'0\',\'directFilterList\''.(array_key_exists("contentLoad", $_REQUEST) && array_key_exists("container", $_REQUEST) ? ',\''.$_REQUEST['contentLoad'].'\',\''.$_REQUEST['container'].'\'' : '').');" ' 
           . ' title="' . i18n("selectStoredFilter") . '" >'
           . i18n("noFilterClause")
           . "</td>";
    echo "</tr>";
  }
  echo "</table>";
  echo "<div style='overflow:hidden;max-height:".(($context=='directFilterList')?202:127)."px;overflow-y:auto'>";
  $handle = (!$comboDetail)?"dojotype='dojo.dnd.Source' withhandles='true' data-dojo-props='accept: [ \"tableauBordLeft\",\"tableauBordRight\" ]'":"";
  if ($context!='directFilterList') {
    echo "<table id='dndListFilterSelector' jsId='dndListFilterSelector' width='100%' ".$handle.">";
  }else{
    echo "<table id='dndListFilterSelector2' jsId='dndListFilterSelector2' width='100%' ".$handle.">";
  }
  if (count($filterArray)>0) {
    //gautier #filter
    foreach ($filterArray as $filter) {
      if ($context!='directFilterList') {
        echo "<tr class='dojoDndItem' dndType='tableauBordLeft'  id='filter$filter->id' >";
      }else{
        echo "<tr class='dojoDndItem' dndType='tableauBordRight'  id='retlif$filter->id' >";
      }
      //ADD qCazelles - Dynamic filter - Ticket #78
      echo ($filter->isDynamic=="1" ? '<input type="hidden" id="dynamicFilterId'.$filter->id.'" />' : ''); //Used for selection of stored filter, to enable the prompt of dynamic value(s)
      //END ADD qCazelles - Dynamic filter - Ticket #78
      echo '<td style="'.((!isNewGui())?'font-size:8pt;':''). (($filter->name==$currentFilter and $context=='directFilterList')?'color:white; background-color: grey;':'cursor: pointer;') . '"' 
           . ' class="filterData" '
           //. ($filter->name==$currentFilter)?'':'onClick="selectStoredFilter('. "'" . htmlEncode($filter->id) . "'" . ');" ')
           . 'onClick="selectStoredFilter(\'' . htmlEncode($filter->id) . '\',\'' . htmlEncode($context) . '\''.(array_key_exists("contentLoad", $_REQUEST) && array_key_exists("container", $_REQUEST) ? ',\''.$_REQUEST['contentLoad'].'\',\''.$_REQUEST['container'].'\'' : '').');" ' 
           . ' title="' . i18n("selectStoredFilter") . '" >' ;
      //Gautier #filter
      if(!$comboDetail)echo '<span class="dojoDndHandle handleCursor"><img style="width:'.((isNewGui())?'10px;float:left':'6px;').'" src="css/images/iconDrag.gif" />&nbsp;&nbsp;</span>';
      echo  '<span style="position:relative;top:2px;margin:3px">'.htmlEncode($filter->name)
           . ( ($defaultFilter==$filter->id and $context!='directFilterList')?' (' . i18n('defaultValue') . ')':'')
           .'</span>'. "</td>";
      if ($context!='directFilterList') {
        echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>";      
        echo ' <a src="css/images/smallButtonRemove.png" onClick="removeStoredFilter('. "'" . htmlEncode($filter->id) . "','" . htmlEncode(htmlEncode($filter->name)) . "'" . ');" title="' . i18n('removeStoredFilter') . '" > ';
        echo formatSmallButton('Remove');
        echo ' </a>';
        echo "</td>";
        echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>";
        if($filter->isShared==0)echo ' <img src="css/images/share.png" class="roundedButtonSmall" onClick="shareStoredFilter('. "'" . htmlEncode($filter->id) . "','" . htmlEncode(htmlEncode($filter->name)) . "'" . ');" title="' . i18n('shareStoredFilter') . '" class="smallButton"/> ';
        if($filter->isShared==1)echo ' <img src="css/images/shared.png" class="roundedButtonSmall" onClick="shareStoredFilter('. "'" . htmlEncode($filter->id) . "','" . htmlEncode(htmlEncode($filter->name)) . "'" . ');" title="' . i18n('unshareStoredFilter') . '" class="smallButton"/> ';
        echo "</td>";
      }
      
      echo "</tr>";
    }
    //gautier #filter
  } else {
  	if ($context!='directFilterList') {
      echo "<tr><td class='filterData' colspan='3'><i>" . i18n("noStoredFilter") . "</i></td></tr>";
  	}
  }
  echo "</table>";
  echo "</div>";
  echo "</div>";
}

function htmlDisplaySharedFilter($filterArray,$filterObjectClass,$currentFilter="", $context="") {
  if (count($filterArray)>0) {  
    $nFilterArray=array();
    foreach ($filterArray as $filter) {
      $user=SqlElement::getSingleSqlElementFromCriteria("User", array("id"=>$filter->idUser));
      $cle=$user->name.'|'.$user->id;
      if(!isset($nFilterArray[$cle]))$nFilterArray[$cle]=array();
      $nFilterArray[$cle][$filter->name]=$filter;
      asort($nFilterArray[$cle]);
    }
    asort($nFilterArray);
    // Display Result
    $param=SqlElement::getSingleSqlElementFromCriteria('Parameter',
        array('idUser'=>getSessionUser()->id, 'parameterCode'=>'Filter'.$filterObjectClass));
    $defaultFilter=($param)?$param->parameterValue:'';
    echo '<div dojoType="dijit.form.DropDownButton"
                              style="width: 300px;margin:0 auto;"
                              id="filterSharedSelect" name="entity">';
    echo '<span>'.i18n("selectSharedFilter").'</span><div data-dojo-type="dijit/TooltipDialog">';
    $iterateur=0;
      foreach ($nFilterArray as $userName=>$filters) {
        $nameExplode=pq_explode('|',$userName);
        echo '<span style="float:left;height:15px;font-weight:bold;" disabled="disabled" value="-2" '
            . ' title="' . i18n("selectStoredFilter") . '" >'.$nameExplode[0].'</span><br/>';
        foreach ($filters as $filterName=>$filter) {
          echo '<span onclick="selectStoredFilter('.htmlEncode($filter->id).',\'' . htmlEncode($context) . '\');dijit.byId(\'filterSharedSelect\').closeDropDown();" class="menuTree" style="float:left;height:15px;" '
              . ' >&nbsp;&nbsp;&nbsp;&nbsp;'
                  . htmlEncode($filter->name)
                  . ( ($defaultFilter==$filter->id and $context!='directFilterList')?' (' . i18n('defaultValue') . ')':'')
                  . "</span><br/>";
        }
        $iterateur++;
        if(sizeof($nFilterArray)>$iterateur)echo '<span style="float:left;height:15px;" value="-1" '
        . ' title="' . i18n("selectStoredFilter") . '" ></span><br/>';
      }
    echo "</div></div>";
    echo "<span style='position:relative;left:20px;font-size:90%;color:#a0a0a0;'>".i18n("tipsSharedFilter").'</span>';
  }
}

// BEGIN - ADD BY TABARY - TOOLTIP
function htmlDisplayTooltip($value="", $colName="", $print=false, $outMode="", $position='before') {
    if ($value=="" or $print or $outMode!="" or $colName=="") { return "";}
    return '<div class="generalColClass" dojoType="dijit.Tooltip" position="'.$position.'" connectId="'.$colName.'">'. i18n($value).'</div>';
}
// END - ADD BY TABATY - TOOLTIP

function htmlDisplayCheckbox ($value, $remote=false) {
  $checkImg="checkedKO.png";
  if (($value!='0' and $value!='off' and $value!==null) or $value=="1" or $value=='on') {
    $checkImg= 'checkedOK.png';
  } 
  $baseUrl=($remote)?SqlElement::getBaseUrl().'/view/':'../view/';
  return '<img src="'.$baseUrl.'img/' . $checkImg . '" />';
}

function htmlDisplayColored($value,$color) {
  global $print, $outMode;
  $result= "";
  $foreColor=htmlForeColorForBackgroundColor($color);
  //$result.= '<table><tr><td style="background-color:' . $color . '; color:' . $foreColor . ';">';
  //$result.= $value;
  //$result.= "</td></tr></table>";
  $result.='<div style="vertical-align:middle;border:1px solid #CCC;border-radius:10px;text-align: center;'
      .(($print and $outMode=='pdf')?'width:95%;min-height:18px;':'') 
      . 'background-color: ' . $color . '; color:' . $foreColor . ';">'
      .$value.'</div>';
  return $result;
}
function htmlDisplayColoredFull($value,$color) {
  global $print, $outMode, $outModeBack;
  $minHeight=10;
  $result= "";
  $foreColor=htmlForeColorForBackgroundColor($color);
//   $result.='<div style="height:100%;display:block;vertical-align:middle;padding: 3px;text-align: center;'
//       .(($print and $outMode=='pdf')?'width:10px;min-height:18px':'')
//       . 'background-color: ' . $color . '; color:' . $foreColor . ';">'
//           .$value.'</div>';
  $result.='<table style="width:100%;height:100%;min-height:'.$minHeight.'px;border-collapse: collapse;">'
      .' <tr style="height:100%;min-height:'.$minHeight.'px">'
      .'  <td style="vertical-align:middle;border:0px;'
      . (($print and $outMode!='pdf' and $outModeBack=='pdf')?'font-size:10pt;':'')
      .(($color=='transparent')?'font-style:italic;':'')
      .'text-align: center;'.(($print and $outMode=='pdf')?'width:95%;min-height:18px;':'') . 'background-color: ' . $color . '; color:' . $foreColor . ';">'
      .$value
      .'</td></tr></table>';
  return $result;
}

function htmlForeColorForBackgroundColor($color) {
  $foreColor='#000000';
  if (pq_strlen($color)==7) {
    $red=base_convert(pq_substr($color,1,2),16,10);
    $green=base_convert(pq_substr($color,3,2),16,10);
    $blue=base_convert(pq_substr($color,5,2),16,10);
    $light=(0.3)*$red + (0.6)*$green + (0.1)*$blue;
    if ($light<128) { $foreColor='#FFFFFF'; }
  }
  return $foreColor;
}

function htmlDisplayCurrency($val,$noDecimal=false) {
  if (! $val and $val!='0') return '';
  global $browserLocale;
  $currency=Parameter::getGlobalParameter('currency');
  $currencyPosition=Parameter::getGlobalParameter('currencyPosition');
  if ($noDecimal) {
    $fmt = new NumberFormatter52( $browserLocale, NumberFormatter52::INTEGER );
  } else {
    $fmt = new NumberFormatter52( $browserLocale, NumberFormatter52::DECIMAL );
  }
  if (! isset($currencyPosition) or ! isset($currency) or $currencyPosition=='none') {
    return $fmt->format($val) ;
  } 
  if ($currencyPosition=='after') {
    return pq_str_replace(' ','&nbsp;',$fmt->format($val)) . '&nbsp;' . $currency; 
  } else {
    return $currency . '&nbsp;' . pq_str_replace(' ','&nbsp;',$fmt->format($val)) ;
  }
}

function htmlDisplayNumeric($val) {
  global $browserLocale;
  // old version : too restrictive
  $fmt = new NumberFormatter52( $browserLocale, NumberFormatter52::DECIMAL );
  return $fmt->format($val) ;
  // numflt_* functions unvailable in some PHP versions, so keep old version
  //$fmt = numfmt_create( $browserLocale, NumberFormatter::DECIMAL );
  //$data = numfmt_format($fmt, $val);
  //return $data;
}

// ADD BY Marc TABARY - 2017-03-02 - DRAW SPINNER
function htmlDrawSpinner($col, $val, $spinnerAttributes, $attributes, $name, $title, $fieldWidth, $colScript) {
    // Default values of spinner
    $min=0;
    $max=100;
    $step=1;
    $bkColor='';
    
    // Take nobr
    $nobr = (pq_strpos($attributes,'nobr')===false?false:true);
    
// BEGIN - ADD BY TABARY - TAKE DISPLAY ATTRIBUTE    
    $display = (pq_strpos($attributes,'hidden')===false?($nobr?' display:inline-block':' display:inline-block'):' display:none');
// END - ADD BY TABARY - TAKE DISPLAY ATTRIBUTE    
    // List of spinner Attributes
    $spinnerAttrList = pq_explode(',',$spinnerAttributes);
    foreach($spinnerAttrList as $spinnerAttr) {
        $spinnerNameAndValue = pq_explode(':', $spinnerAttr);
        if(count($spinnerNameAndValue)==2) {
            switch(pq_strtolower($spinnerNameAndValue[0])) {
                case 'min' : 
                    $min=(intval($spinnerNameAndValue[1])?$spinnerNameAndValue[1]:0);
                    break;
                case 'max' :
                    $max=(intval($spinnerNameAndValue[1])?$spinnerNameAndValue[1]:0);
                    break;
                case 'step' :    
                    $step=(intval($spinnerNameAndValue[1])?$spinnerNameAndValue[1]:0);
                    break;
                case 'bkcolor' :
                    $bkColor=$spinnerNameAndValue[1];
                    break;
            }
        }
    }
    // min > max ==> invert
    if ($min>$max) {
        $temp=$max;
        $max=$min;
        $min=$temp;
    }
    // step > max ==> step = 1
    $step = ($step>$max?1:$step);
    
    // maxlength = length of max
    $maxlength = pq_strlen(strval($max));
    
// ADD BY Marc TABARY - 2017-03-06 - DRAW SPINNER - ADD VALIDATION SCRIPT ON SPINNER'S EVENT 'Change'
    if (pq_strpos($colScript,'event="onKeyDown"')!==false and pq_strpos($colScript, 'isEditingKey(event)')!==false) {
        $colScript.= '"<script type="dojo/on" data-dojo-event="change" args="event">if (isEditingKey(event)) {formChanged();}</script>';
    }    
// END ADD BY Marc TABARY - 2017-03-06 - DRAW SPINNER - ADD VALIDATION SCRIPT ON SPINNER'S EVENT 'Change'
    // <div ...            
    $result=  '<div ';
    // Style
// BEGIN - ADD BY TABARY - TAKE DISPLAY ATTRIBUTE    
//    $result.=  'style="width:'.$fieldWidth.'px; text-align: center; color: #000000;" ';
    $result.=  'style="width:'.$fieldWidth.'px; text-align: center; color: #000000;'.$display.';" ';
// END - ADD BY TABARY - TAKE DISPLAY ATTRIBUTE        // dojoType
    $readOnly = (pq_strpos($attributes,'readonly')===false?'':' readOnly');
    $result.= 'dojoType="dijit.form.NumberSpinner"'. $readOnly.' ';
    // Constraints
    $result.= 'constraints="{min:'.$min.',max:'.$max.',places:0,pattern:\'###0\'}" ';
    // Change and maxlength
    $result.= 'intermediateChanges="true" maxlength="'.$maxlength.'" ';
    // Class
    $required = (pq_strpos($attributes,'required')!==false?'required':'');
    $result.= ' class="input '.$required.$readOnly.' generalColClass '.$col.'Class" ';    // Value
    $result.= ' value="'. $val.'" ';
    // Step
    $result.= 'smallDelta="'.$step.'" ';
    // id and name
    $result.= $name;
    // title
    $result.= $title; 
    // Close div
    $result.= '>';
    // Script
    $result.= $colScript;
    // </div>
    $result.= '</div>';
    // Pct
    if (pq_substr($col,-3,3)=='Pct' or pq_substr($col, -4, 4)=='Rate') {
        $result.= '<span class="generalColClass '.$col.'Class">%'.($bkColor==''?'&nbsp;':'').'</span>';
    }
    // Background Color            
    if ($bkColor!=='') {
        $result.= '<span style="display:inline-block;widht:50px;margin:0px 20px 0px 3px;background-color:'.$bkColor.'">&nbsp;&nbsp;&nbsp;&nbsp</span><span>&nbsp;</span>';        
    }
    
    return $result;
}
// END ADD BY Marc TABARY - 2017-03-02 - DRAW SPINNER
function htmlDisplayNumericWithoutTrailingZeros($val) {
  global $browserLocale;
  if ($val==0) return 0;
  $fmt = new NumberFormatter52( $browserLocale, NumberFormatter52::DECIMAL );
  $res=$val;
  if (pq_strpos($res, '.')!==false) {
    $res=pq_trim($res,'0');
  }
  if (pq_substr($res, -1)=='.') {
    $res=pq_trim($res,'.');
  }
  if ($res<1 and pq_substr($res,0,1)=='.') $res='0'.$res;
  if ($fmt->decimalSeparator!='.') {
    $res=pq_str_replace('.', $fmt->decimalSeparator, $res);
  }
  return $res ;
}

function htmlDisplayPct($val) {
  return htmlDisplayNumericWithoutTrailingZeros($val) . '&nbsp;%';
}

function htmlRemoveDocumentTags($val) {
  $res=strstr($val, '<body>');
  $res=pq_str_replace(array('<html>','</html>','<body>','</body>') , '', $res);
  return $res;
}

function htmlDrawLink($obj, $display=null) {
	$canRead=securityGetAccessRightYesNo('menu' . get_class($obj), 'read', $obj)=="YES";
	$disp=htmlencode(($display)?$display:$obj->name);
	if ($canRead) {
	  $result='<a class="link" onClick="gotoElement(\'' . get_class($obj) .'\',\''. htmlEncode($obj->id) .'\');">' . $disp . '</a>';
	} else {
		$result=$disp;
	}  
	 
	return $result;
}

function htmlFixLengthNumeric($val, $numericLength=0) {  
  if ($numericLength>0) {
    $val=str_pad($val,$numericLength,'0', STR_PAD_LEFT);
  }
  return $val;
}
function htmlSortFixLengthNumeric($val, $numericLength=0) {
  if ($val>=0) {
    return '>'.htmlFixLengthNumeric($val,$numericLength);;
  } else {
    $max=intval(str_pad('',$numericLength,'9', STR_PAD_LEFT));
    $val=abs($val);
    if ($max<$val) $inverse=0;
    else $inverse=$max-$val;
    return '<'.htmlFixLengthNumeric($inverse,$numericLength);
  }
}



function htmlTransformRichtextToPlaintext($string) {
  $string=pq_str_replace(array('</div>  <div>'),
                      array('</div><div>'),
                      $string);
  $string=pq_str_replace(array('&nbsp;','<br /> ','<br>','<br/>'  ,'</div>'  ,'</p>'  ,'</tr>'),
                      array(' '     ,"\n"    ,"\n"  ,"\n","</div>\n","</p>\n","</tr>\n"),
                      $string);
  $string=strip_tags(html_entity_decode($string));
  return $string;
}

function htmlSetClickableImages($text,$maxWidth, $fromMailDetail=false) {
  //$text=preg_replace('/<img src="(.*?)" style="/', '<img onClick="showImage(\'Note\',\'$1\',\'preview\');" src="$1" style="cursor:pointer;', $text);
  //$text=preg_replace('/<img src="(.*?)"/', '<img onClick="showImage(\'Note\',\'$1\',\'preview\');" src="$1" style="cursor:pointer;"', $text);
  //return $text;
  $text=pq_str_replace('<img src=', '<img alt="" src=', $text);
  $mot = 'alt="';
//   if(pq_strpos($text, $mot) !== false){
     $newText = '/<img alt="(.*?)" src="(.*?)" style="(.*?)"/';
//   }else{
//    $newText = '/<img src="(.*?)" style="(.*?)"/';
//   }
  global $widthToPass, $mailDetail;
  $widthToPass=$maxWidth;
  $mailDetail=$fromMailDetail;
  $title='title="'.i18n("msgClickToEnlarge").'"';
  $text=preg_replace_callback(
      $newText, 
      function ($matches) { 
        global $widthToPass, $mailDetail;
        if ($mailDetail==true) $title="";
        else $title='title="'.i18n("msgClickToEnlarge").'"';
        $nbMatches = count($matches);
        $maxWidth=$widthToPass;
        $style=$matches[2];
        if($nbMatches==4){
          $style=$matches[3];
        }
        if ($maxWidth) {
          $maxWidth=intval($maxWidth)-3;
          if (RequestHandler::isCodeSet('refreshNotes')) $maxWidth-=1;
          $attrs=pq_explode(';', $matches[2]);
          if($nbMatches==4){
            $attrs=pq_explode(';', $matches[3]);
          }
          $style="";
          $height=null;
          $width=null;
          foreach ($attrs as $att) {
            $att=pq_strtolower(pq_trim($att,' '));
            $vals=pq_explode(':',$att);
            if (count($vals)!=2) continue;
            $key=$vals[0];
            $val=$vals[1];
            if ($key=='width') {
              $width=intval($val);
            } else if ($key=='height') {
              $height=intval($val);
            } else {
              $style.=$att.';';
            }
            
          }       
          if ($height and $width) {
            if ($width>$maxWidth) {
              $newWidth=$maxWidth;
              $newHeight=intval($height*$newWidth/$width);
            } else {
              $newWidth=$width;
              $newHeight=$height;
            }
            $newWidth.='px';
            $newHeight.='px';
            $style.="height:$newHeight;width:$newWidth";
          }
        }
        if($nbMatches==4){
          if($matches[1]=='') $matches[1]=basename($matches[2]);
          if ($mailDetail) return '<img style="'.$style.'" src="'.$matches[2].'" '; 
          else return '<img alt="'.$matches[1].'" onClick="showImage(\'Note\',\''.$matches[2].'\',\''.basename($matches[1]).'\');" src="'.$matches[2].'" style="cursor:pointer;'.$style.'" '.$title;
        }else {
          if ($mailDetail) return '<img style="'.$style.'" src="'.$matches[1].'"';
          else return '<img onClick="showImage(\'Note\',\''.$matches[1].'\',\''.basename($matches[1]).'\');" src="'.$matches[1].'" style="cursor:pointer;'.$style.'" '.$title;
        }
      },
      pq_nvl($text));
   if (! $mailDetail) $text=preg_replace_callback(
       '/<img src="(.*?)"/', 
       function ($matches) { 
         $title='title="'.i18n("msgClickToEnlarge").'"';
         return '<img onClick="showImage(\'Note\',\''.$matches[1].'\',\''.basename($matches[1]).'\');" src="'.$matches[1].'" style="cursor:pointer;" '.$title;
       },
      pq_nvl($text));
  return $text;
}

function drawColorDefaultThemes($fldMain,$fldSecondary,$width=80,$left=0) {
  $border=intval($width/15);
  $array=array(
      "blue"=>array('#545381','#e97b2c'),
      "red"=>array('#865f5f','#2ba9e9'),
      "grey"=>array('#c2c2c2','#f1acac'),
      "green"=>array('#656565','#8fc874')
  );
  $globalMain='#'.Parameter::getGlobalParameter('newGuiThemeColor');
  $globalSecondary='#'.Parameter::getGlobalParameter('newGuiThemeColorBis');
  $globalColor=null;
  foreach($array as $color=>$arr) {
    if ($arr[0]==$globalMain and $arr[1]==$globalSecondary) {
      $globalColor=$color;
      break;
    }
  }
  if ($fldMain!='globalParameter_newGuiThemeColor' and ! $globalColor) {
    unset($array['green']);
    $array['global']=array($globalMain,$globalSecondary);
  }
  echo '<div style="position:relative;float:left;left:'.$left.'px">';
  echo '  <div style="position:absolute;width:'.($width+($border*2)+5).'px;height:'.($width+($border*2)+5).'px;">';
  foreach ($array as $color=>$colors) {
    $click=" onClick='dojo.byId(\"$fldMain\").value=\"".$colors[0]."\";dojo.byId(\"$fldMain\").dispatchEvent(new Event(\"change\"));"
                    ."dojo.byId(\"$fldSecondary\").value=\"".$colors[1]."\";dojo.byId(\"$fldSecondary\").dispatchEvent(new Event(\"change\"));"
                    ."'";
    echo '    <div '.$click.' style="z-index:500;overflow:hidden;border-radius:'.floor($width/2).'px;cursor:pointer;width:'.floor($width/2).'px;height:'.floor($width/2).'px;position:relative;float:left;margin-right:'.$border.'px;margin-bottom:'.$border.'px;background:'.$colors[0].';">';
    echo '      <div style="width:'.floor($width/4).'px;height:'.floor($width/4).'px;position:absolute;right:0;bottom:0;background:'.$colors[1].';">';
    //echo '      <div style="width:'.floor($width/4).'px;height:'.floor($width/4).'px;position:absolute;left:'.intval($width/8).'px;top:'.intval($width/8).'px;background:'.$colors[1].';">';
    echo '      </div>';
    echo '    </div>';
  }
  echo '  </div>';
  echo '</div>';
}

function htmlDrawSwitch($field,$value,$directDraw=true,$visible=true) {
  $hidden=(!$visible)?"display:none":"";
  $result='';
  $result.='<div  id="'.$field.'Switch" class="colorSwitch" data-dojo-type="dojox/mobile/Switch" ';
  if (pq_substr(i18n('label'.$field),0,1)!='[') $result.='    title="'.i18n("labelShowIdle").'" ';
  $result.='   value="'.(($value)?"on":"off").'" ';
  $result.='   leftLabel="" rightLabel="" style="width:10px;position:relative; left:0px;top:2px;z-index:99;'.$hidden.'" >';
  $result.='   <script type="dojo/method" event="onStateChanged" >';
  $result.='     dijit.byId("'.$field.'").set("checked",(this.value=="on")?true:false);';
  $result.='   </script>';
  $result.='</div>';
  if ($directDraw) echo $result;
  else return $result;
}

function htmlDrawSwitchAssign($field,$value,$class,$id,$directDraw=true) {
  $result='';
  $result.='&nbsp;&nbsp;<div  id="'.$field.'Switch" class="colorSwitch" data-dojo-type="dojox/mobile/Switch"';
  if (pq_substr(i18n('label'.$field),0,1)!='[') $result.='    title="'.i18n("labelShowIdle").'" ';
  $result.='   value="'.(($value)?"on":"off").'" ';
  $result.='   leftLabel="" rightLabel="" style="width:10px;position:relative; left:0px;top:2px;z-index:99;" >';
  $result.='   <script type="dojo/method" event="onStateChanged" >';
  $result.='if (automaticAssignmentRevertValue==true) return;';
  $result.='if (checkFormChangeInProgress()) {';
  $result.="  showAlert(i18n('alertOngoingChange'));";
  $result .=' automaticAssignmentRevertValue=true;';
  $result.='  if (this.value=="on") setTimeout(\'dijit.byId("'.$field.'Switch").set("value","off");automaticAssignmentRevertValue=false;\',500);';
  $result.='  else setTimeout(\'dijit.byId("'.$field.'Switch").set("value","on");automaticAssignmentRevertValue=false;\',500);';
  $result.='}else{';
  $result.='     dijit.byId("'.$field.'Switch").set("checked",(this.value=="on")?true:false);';
  $result.='     automaticAssignment("'.$class.'","'.$id.'",dijit.byId("'.$field.'Switch").get("value")); ';
  $result.='}';
  $result.='   </script>';
  $result.='</div>';
  if ($directDraw) echo $result;
  else return $result;
}

function htmlDisplayStoredLayout($layoutArray,$layoutObjectClass,$currentLayout="",$comboDetail=false) {
  $param=SqlElement::getSingleSqlElementFromCriteria('Parameter',array('idUser'=>getSessionUser()->id, 'parameterCode'=>'Layout'.$layoutObjectClass));
  $defaultLayout=($param)?$param->parameterValue:'';
  $user = getSessionUser();
  echo "<div id='displayLayoutList' style='overflow:hidden;'>";
  echo "<table width='100%'>";
  echo "<tr style='height:22px;'>";
  echo "<td class='filterHeader' colspan='3' style='width:749px;'>" .i18n("storedLayouts"). "</td>";
  echo "</td>";
  echo "</tr>";
  echo "</table>";
  echo "<div style='overflow:hidden;max-height:127px;overflow-y:auto'>";
  $handle = (!$comboDetail)?"dojotype='dojo.dnd.Source' withhandles='true' data-dojo-props='accept: [ \"tableauBordLeft\" ]'":"";
  echo "<table id='dndListLayoutSelector' jsId='dndListLayoutSelector' width='100%' ".$handle.">";
  $forcedLayout = LayoutForced::getSingleSqlElementFromCriteria('LayoutForced', array('idUser'=>$user->id, 'objectClass'=>$layoutObjectClass));
  $planningClass = array('Planning'=>'planning','PortfolioPlanning'=>'portfolio','ResourcePlanning'=>'resource','GlobalPlanning'=>'global','VersionPlanning'=>'version','ContractGantt'=>'contract');
  if($forcedLayout->id){
    $layout = new Layout($forcedLayout->idLayout);
    $planningType = (isset($planningClass[$layout->objectClass]))?$planningClass[$layout->objectClass]:null;
    $selectedListClass = ($layout->id == $currentLayout)?'dojoDndItemAnchor':'';
    $selectedBackgroundColor = ($layout->id == $currentLayout)?'favoriteProjectListSelected':'';
    echo "<tr class='dojoDndItem $selectedListClass' dndType='tableauBordLeft'  id='layout$layout->id' >";
    echo '<td style="'.((!isNewGui())?'font-size:8pt;':'').'cursor: pointer;'. 'font-style: italic;color: var(--color-secondary) !important;"'
        . ' class="filterData '.$selectedBackgroundColor.'" '
            . 'onClick="selectStoredLayout(\'' . htmlEncode($layout->id) . '\');" '
                . 'ondblclick="selectStoredLayout(\'' . htmlEncode($layout->id) . '\');validateLayoutListColumn(\'' .$planningType. '\');" '
                    . ' title="' . i18n("selectStoredLayout") . '" >' ;
    if(!$comboDetail)echo '<span class="dojoDndHandle handleCursor"><img style="width:'.((isNewGui())?'10px;float:left':'6px;').'" src="css/images/iconDrag.gif" />&nbsp;&nbsp;</span>';
    echo  '<span style="position:relative;top:2px;margin:3px">'.htmlEncode($layout->scope)
    . ( ($defaultLayout==$layout->id)?' (' . i18n('defaultValue') . ')':'')
    .'</span><span style="padding-left:10px">'.formatCommentThumb($layout->comment).'</span>'. "</td>";
    echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>".formatIcon('Fixed', 16)."</td>";
    echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>";
    echo formatUserThumb($forcedLayout->idCreator, SqlList::getNameFromId('Affectable', $forcedLayout->idCreator), SqlList::getNameFromId('Affectable', $forcedLayout->idCreator));
    echo "</td>";
    echo "</tr>";
  }
  if (count($layoutArray)>0) {
    foreach ($layoutArray as $layout) {
      $planningType = (isset($planningClass[$layout->objectClass]))?$planningClass[$layout->objectClass]:null;
      $selectedListClass = ($layout->id == $currentLayout)?'dojoDndItemAnchor':'';
      $selectedBackgroundColor = ($layout->id == $currentLayout)?'favoriteProjectListSelected':'';
      echo "<tr class='dojoDndItem $selectedListClass' dndType='tableauBordLeft'  id='layout$layout->id' >";
      echo '<td style="'.((!isNewGui())?'font-size:8pt;':'').'cursor: pointer;'. '"'
          . ' class="filterData '.$selectedBackgroundColor.'" '
      . 'onClick="selectStoredLayout(\'' . htmlEncode($layout->id) . '\');" '
      . 'ondblclick="selectStoredLayout(\'' . htmlEncode($layout->id) . '\');validateLayoutListColumn(\'' .$planningType. '\');" '
          . ' title="' . i18n("selectStoredLayout") . '" >' ;
      if(!$comboDetail)echo '<span class="dojoDndHandle handleCursor"><img style="width:'.((isNewGui())?'10px;float:left':'6px;').'" src="css/images/iconDrag.gif" />&nbsp;&nbsp;</span>';
      echo  '<span style="position:relative;top:2px;margin:3px">'.htmlEncode($layout->scope)
      . ( ($defaultLayout==$layout->id)?' (' . i18n('defaultValue') . ')':'')
      .'</span><span style="padding-left:10px">'.formatCommentThumb($layout->comment).'</span>'. "</td>";
      echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>";
      echo ' <a src="css/images/smallButtonRemove.png" onClick="removeStoredLayout('. "'" . htmlEncode($layout->id) . "','" . htmlEncode(htmlEncode($layout->scope)) . "'" . ');" title="' . i18n('removeStoredLayout') . '" > ';
      echo formatSmallButton('Remove');
      echo ' </a>';
      echo "</td>";
      echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>";
      if($layout->isShared==0)echo ' <img src="css/images/share.png" class="roundedButtonSmall" onClick="shareStoredLayout('. "'" . htmlEncode($layout->id) . "','" . htmlEncode(htmlEncode($layout->scope)) . "'" . ');" title="' . i18n('shareStoredLayout') . '" class="smallButton"/> ';
      if($layout->isShared==1)echo ' <img src="css/images/shared.png" class="roundedButtonSmall" onClick="shareStoredLayout('. "'" . htmlEncode($layout->id) . "','" . htmlEncode(htmlEncode($layout->scope)) . "'" . ');" title="' . i18n('unshareStoredLayout') . '" class="smallButton"/> ';
      echo "</td>";
      echo "</tr>";
    }
  } else if(!$forcedLayout->id){
    echo "<tr><td class='filterData' colspan='3'><i>" . i18n("noStoredLayout") . "</i></td></tr>";
  }
  echo "</table>";
  echo "</div>";
}

function htmlDisplaySharedLayout($layoutArray,$layoutObjectClass,$currentLayout="") {
  if (count($layoutArray)>0) {
    $nLayoutArray=array();
    foreach ($layoutArray as $layout) {
      $user=SqlElement::getSingleSqlElementFromCriteria("User", array("id"=>$layout->idUser));
      $cle=$user->name.'|'.$user->id;
      if(!isset($nLayoutArray[$cle]))$nLayoutArray[$cle]=array();
      $nLayoutArray[$cle][$layout->scope]=$layout;
      asort($nLayoutArray[$cle]);
    }
    asort($nLayoutArray);
    // Display Result
    $param=SqlElement::getSingleSqlElementFromCriteria('Parameter',array('idUser'=>getSessionUser()->id, 'parameterCode'=>'Layout'.$layoutObjectClass));
    $defaultLayout=($param)?$param->parameterValue:'';
    echo '<div style="float:left;">';
    echo '<div dojoType="dijit.form.DropDownButton"
                              style="width: 400px;margin:0 auto;"
                              id="layoutSharedSelect" name="entity">';
    echo '<span>'.i18n("selectSharedLayout").'</span><div data-dojo-type="dijit/TooltipDialog">';
    $iterateur=0;
    foreach ($nLayoutArray as $userName=>$layouts) {
      $nameExplode=pq_explode('|',$userName);
      echo '<span style="float:left;height:15px;font-weight:bold;" disabled="disabled" value="-2" '
          . ' title="' . i18n("selectStoredLayout") . '" >'.$nameExplode[0].'</span><br/>';
      foreach ($layouts as $layoutName=>$layout) {
        echo '<span onclick="selectStoredLayout('.htmlEncode($layout->id).');dijit.byId(\'layoutSharedSelect\').closeDropDown();" class="menuTree" style="float:left;height:15px;" '
            . ' >&nbsp;&nbsp;&nbsp;&nbsp;'
                . htmlEncode($layout->scope)
                . ( ($defaultLayout==$layout->id)?' (' . i18n('defaultValue') . ')':'')
                . "</span><br/>";
      }
      $iterateur++;
      if(sizeof($nLayoutArray)>$iterateur)echo '<span style="float:left;height:15px;" value="-1" '
          . ' title="' . i18n("selectStoredLayout") . '" ></span><br/>';
    }
    echo "</div></div></div>";
    echo "<div><span style='position:relative;left:20px;font-size:90%;color:#a0a0a0;'>".i18n("tipsSharedLayout").'</span></div>';
  }
}

function htmlDisplayStoredReportLayout($reportLayoutArray,$reportLayoutObjectClass,$currentReportLayout="",$comboDetail=false) {
  $param=SqlElement::getSingleSqlElementFromCriteria('Parameter',array('idUser'=>getSessionUser()->id, 'parameterCode'=>'ReportLayout'.$reportLayoutObjectClass));
  $defaultReportLayout=($param)?$param->parameterValue:'';
  $user = getSessionUser();
  echo "<div id='displayReportLayoutList' style='overflow:hidden;'>";
  echo "<table width='100%'>";
  echo "<tr style='height:22px;'>";
  echo "<td class='filterHeader' colspan='3' style='width:749px;'>" .i18n("storedReportLayouts"). "</td>";
  echo "</td>";
  echo "</tr>";
  echo "</table>";
  echo "<div style='overflow:hidden;max-height:127px;overflow-y:auto'>";
  $handle = (!$comboDetail)?"dojotype='dojo.dnd.Source' withhandles='true' data-dojo-props='accept: [ \"tableauBordLeft\" ]'":"";
  echo "<table id='dndListReportLayoutSelector' jsId='dndListReportLayoutSelector' width='100%' ".$handle.">";
  if (count($reportLayoutArray)>0) {
    foreach ($reportLayoutArray as $reportLayout) {
      $selectedListClass = ($reportLayout->id == $currentReportLayout)?'dojoDndItemAnchor':'';
      $selectedBackgroundColor = ($reportLayout->id == $currentReportLayout)?'favoriteProjectListSelected':'';
      echo "<tr class='dojoDndItem $selectedListClass' dndType='tableauBordLeft'  id='reportLayout$reportLayout->id' >";
      echo '<td style="'.((!isNewGui())?'font-size:8pt;':'').'cursor: pointer;'. '"'
          . ' class="filterData '.$selectedBackgroundColor.'" '
              . 'onClick="selectStoredReportLayout(\'' . htmlEncode($reportLayout->id) . '\');" '
                      . ' title="' . i18n("selectStoredReportLayout") . '" >' ;
      if(!$comboDetail)echo '<span class="dojoDndHandle handleCursor"><img style="width:'.((isNewGui())?'10px;float:left':'6px;').'" src="css/images/iconDrag.gif" />&nbsp;&nbsp;</span>';
      echo  '<span style="position:relative;top:2px;margin:3px">'.htmlEncode($reportLayout->scope)
      . ( ($defaultReportLayout==$reportLayout->id)?' (' . i18n('defaultValue') . ')':'')
      .'</span><span style="padding-left:10px">'.formatCommentThumb($reportLayout->comment).'</span>'. "</td>";
      echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>";
      echo ' <a src="css/images/smallButtonRemove.png" onClick="removeStoredReportLayout('. "'" . htmlEncode($reportLayout->id) . "','" . htmlEncode(htmlEncode($reportLayout->scope)) . "'" . ');" title="' . i18n('removeStoredReportLayout') . '" > ';
      echo formatSmallButton('Remove');
      echo ' </a>';
      echo "</td>";
      echo "<td class='filterData dndHidden' style='text-align: center;width:25px'>";
      if($reportLayout->isShared==0)echo ' <img src="css/images/share.png" class="roundedButtonSmall" onClick="shareStoredReportLayout('. "'" . htmlEncode($reportLayout->id) . "','" . htmlEncode(htmlEncode($reportLayout->scope)) . "'" . ');" title="' . i18n('shareStoredReportLayout') . '" class="smallButton"/> ';
      if($reportLayout->isShared==1)echo ' <img src="css/images/shared.png" class="roundedButtonSmall" onClick="shareStoredReportLayout('. "'" . htmlEncode($reportLayout->id) . "','" . htmlEncode(htmlEncode($reportLayout->scope)) . "'" . ');" title="' . i18n('unshareStoredReportLayout') . '" class="smallButton"/> ';
      echo "</td>";
      echo "</tr>";
    }
  } else {
    echo "<tr><td class='filterData' colspan='3'><i>" . i18n("noStoredReportLayout") . "</i></td></tr>";
  }
  echo "</table>";
  echo "</div>";
}

function htmlDisplaySharedReportLayout($reportLayoutArray,$reportLayoutObjectClass,$currentReportLayout="") {
  if (count($reportLayoutArray)>0) {
    $nReportLayoutArray=array();
    foreach ($reportLayoutArray as $reportLayout) {
      $user=SqlElement::getSingleSqlElementFromCriteria("User", array("id"=>$reportLayout->idUser));
      $cle=$user->name.'|'.$user->id;
      if(!isset($nReportLayoutArray[$cle]))$nReportLayoutArray[$cle]=array();
      $nReportLayoutArray[$cle][$reportLayout->scope]=$reportLayout;
      asort($nReportLayoutArray[$cle]);
    }
    asort($nReportLayoutArray);
    // Display Result
    $param=SqlElement::getSingleSqlElementFromCriteria('Parameter',array('idUser'=>getSessionUser()->id, 'parameterCode'=>'ReportLayout'.$reportLayoutObjectClass));
    $defaultReportLayout=($param)?$param->parameterValue:'';
    echo '<div style="float:left;">';
    echo '<div dojoType="dijit.form.DropDownButton"
                              style="width: 400px;margin:0 auto;"
                              id="reportLayoutSharedSelect" name="entity">';
    echo '<span>'.i18n("selectSharedReportLayout").'</span><div data-dojo-type="dijit/TooltipDialog">';
    $iterateur=0;
    foreach ($nReportLayoutArray as $userName=>$reportLayouts) {
      $nameExplode=pq_explode('|',$userName);
      echo '<span style="float:left;height:15px;font-weight:bold;" disabled="disabled" value="-2" '
          . ' title="' . i18n("selectStoredReportLayout") . '" >'.$nameExplode[0].'</span><br/>';
      foreach ($reportLayouts as $reportLayoutName=>$reportLayout) {
        echo '<span onclick="selectStoredReportLayout('.htmlEncode($reportLayout->id).');dijit.byId(\'reportLayoutSharedSelect\').closeDropDown();" class="menuTree" style="float:left;height:15px;" '
            . ' >&nbsp;&nbsp;&nbsp;&nbsp;'
                . htmlEncode($reportLayout->scope)
                . ( ($defaultReportLayout==$reportLayout->id)?' (' . i18n('defaultValue') . ')':'')
                . "</span><br/>";
      }
      $iterateur++;
      if(sizeof($nReportLayoutArray)>$iterateur)echo '<span style="float:left;height:15px;" value="-1" '
          . ' title="' . i18n("selectStoredReportLayout") . '" ></span><br/>';
    }
    echo "</div></div></div>";
    echo "<div><span style='position:relative;left:20px;font-size:90%;color:#a0a0a0;'>".i18n("tipsSharedReportLayout").'</span></div>';
  }
}