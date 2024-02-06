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
require_once "../tool/projeqtor.php";

if (! array_key_exists('objectClass',$_REQUEST)) {
  throwError('Parameter objectClass not found in REQUEST');
}
$objectClass=$_REQUEST['objectClass'];
Security::checkValidClass($objectClass);
if (! array_key_exists('objectId',$_REQUEST)) {
  throwError('Parameter objectId not found in REQUEST');
}
$objectId=$_REQUEST['objectId'];
Security::checkValidId($objectId);
if (! array_key_exists('copyType',$_REQUEST)) {
  throwError('Parameter copyType not found in REQUEST');
}
$copyType=$_REQUEST['copyType'];
if($copyType!='copyObjectTo' && $copyType!='copyProject' && $copyType!='copyVersion'){
  traceHack('dynamicDialogCopy: $copyType contains an unexpected valid value');
}
$fromContextMenu = RequestHandler::getBoolean('fromContextMenu');

$idClass=SqlList::getIdFromTranslatableName('Copyable', $objectClass);
$toCopy=new $objectClass($objectId);
$pe = $objectClass . 'PlanningElement';
$moveAfterCreate = null;
if (property_exists ( $toCopy, $pe )) {
  $moveAfterCreate = PlanningElement::getSingleSqlElementFromCriteria('PlanningElement', array('refType'=>$objectClass, 'refId'=>$objectId));
  if($moveAfterCreate->id){
    $moveAfterCreate = $moveAfterCreate->id;
  }
}
$newObj = new $objectClass();
$allowedStatusList = Workflow::getAllowedStatusListForObject($newObj);
$status = new Status();
if(isset($allowedStatusList) and count($allowedStatusList) > 0){
	$status = reset($allowedStatusList);
}
$copyToClassId=0;
if($copyType=="copyObjectTo"){
 $copyToClassId=SqlList::getFieldFromId('Copyable', $idClass, 'idDefaultCopyable', false);
 if ($copyToClassId) {
   $copyToClass=SqlList::getNameFromId('Copyable', $copyToClassId, false);
 } else {
   $copyToClassId=$idClass;
   $copyToClass=$objectClass;
 }
?>
  <table>
    <tr>
      <td>
       <form dojoType="dijit.form.Form" id='copyForm' name='copyForm' onSubmit="return false;">
         <input id="copyClass" name="copyClass" type="hidden" value="" />
         <input id="copyId" name="copyId" type="hidden" value="" />
         <input id="moveAfterCreate" name="moveAfterCreate" type="hidden" value="<?php echo $moveAfterCreate?>" />
         <table>
           <tr>
             <td class="dialogLabel"  >
               <label for="copyToClass" ><?php echo i18n("copyToClass") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <select dojoType="dijit.form.FilteringSelect" 
               <?php echo autoOpenFilteringSelect(); if($objectClass == 'CatalogUO'){ ?> readOnly <?php }?>
                id="copyToClass" name="copyToClass" required="required"
                class="input required" >
                 <?php htmlDrawOptionForReference('idCopyable', $copyToClassId, $toCopy, true,'idle','0');?>
                 <script type="dojo/connect" event="onChange" args="evt" >
                   var objclass=copyableArray[this.value];
                   dijit.byId('copyToType').set('value',null);
                   //dijit.byId('copyToType').reset();
                  <?php if($objectClass!='SubTask'){?>
                   var idProject=(dijit.byId('idProject'))?dijit.byId('idProject').get('value'):null;
                  <?php }else{?>
                   var idProject=(dijit.byId('copyToProject'))?dijit.byId('copyToProject').get('value'):null;
                  <?php }?>
                   refreshList("id"+objclass+"Type","idProject", idProject, null,'copyToType',true);
                   /*if (dojo.byId('copyClass').value==objclass) {
                     var runModif="dijit.byId('copyToType').set('value',dijit.byId('id"+objclass+"Type').get('value'))";
                     setTimeout(runModif,1);
                   }*/
                   copyObjectToShowStructure();
                   setValueCheckBoxForUser();
 
                 </script> 
               </select>
             </td>
           </tr>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <?php if($objectClass != 'CatalogUO'){?>
           <tr>
             <td class="dialogLabel"  >
               <label for="copyToType" ><?php echo i18n("copyToType") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <select dojoType="dijit.form.FilteringSelect" 
               <?php echo autoOpenFilteringSelect();?>
                id="copyToType" name="copyToType" required
                class="input required">
                <?php ($copyToClass=="PeriodicMeeting")?$colName='idMeetingType':$colName='id'.$copyToClass.'Type';
                      if($copyToClass!="ProviderTerm"){
                      htmlDrawOptionForReference($colName, (($copyToClass==$objectClass)?$toCopy->$colName:null), null, true); }
                ?>
               </select>
             </td>
           </tr>
           <?php }?>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <tr>
             <td class="dialogLabel" >
               <label for="copyToName" ><?php echo i18n("copyToName") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
             <?php if($objectClass=='SubTask'){  
                      if (isTextFieldHtmlFormatted($toCopy->name)) {
                        $text=new Html2Text($toCopy->name);
                        $val=$text->getText();
                      } else {
                        $val=br2nl($toCopy->name);
                      }
                      $val=pq_str_replace('"','""',$val);
                      $name=pq_substr($val,0,100);
                   }else{
                      $name=pq_str_replace('"', '&quot;', $toCopy->name);
                   }?>
               <select id="copyToName" name="copyToName" dojoType="dijit.form.ValidationTextBox"
                required="required"
                style="width: 400px;"
                trim="true" maxlength="100" class="input required"
                value="<?php echo $name;?>">
               </select>     
             </td>
           </tr>
           <?php if ($copyType=='copyObjectTo' and property_exists($toCopy, 'idProject')) {?>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <tr>
             <td class="dialogLabel" >
               <label for="copyToProject" ><?php echo i18n("copyToProject") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <div id="copyToProject" name="copyToProject" dojoType="dijit.form.FilteringSelect"
                required="required" class="input required" style="width: 400px;"
                data-dojo-props="queryExpr: '*${0}*',autoComplete:false"
                <?php echo autoOpenFilteringSelect();?>
                class="input">
                <?php htmlDrawOptionForReference('idProject', $toCopy->idProject, null, true);?>
               </div>     
             </td>
           </tr>
           <?php }?>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                 <?php  if($objectClass=='Requirement'){?>
            <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyStructure" style="width:90%;text-align: right;"><?php echo i18n("copyStructure") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php $isCheckedSructure=true;
                      
                    $isCheckedSructure=(Parameter::getUserParameter('isCheckedSructure'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedSructure'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedSructure'.$objectClass);
               ?>
               <div id="copyStructureRequirement" name="copyStructure" dojoType="dijit.form.CheckBox" <?php if ($isCheckedSructure=='true') echo " checked ";?> type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedSructure<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedSructure<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="duplicateLinkedTestsCases" style="width:90%;text-align: right;"><?php echo i18n("DuplicateLinkedTestsCases") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedDuplicateLink=true;
               $isCheckedDuplicateLink=(Parameter::getUserParameter('isCheckedDuplicateLink'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedDuplicateLink'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedDuplicateLink'.$objectClass);
               ?>
               <div id="duplicateLinkedTestsCases" name="duplicateLinkedTestsCases" dojoType="dijit.form.CheckBox" <?php if ($isCheckedDuplicateLink=='true') echo " checked ";?> type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedDuplicateLink<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedDuplicateLink<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           
            <?php }
            if($objectClass !="SubTask"){ ?>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <div id="copyWithStructureDiv" style="display:none;">
	               <label for="copyWithStructure" style="width:90%;text-align: right;"><?php echo i18n("copyWithStructure") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
	               <?php 
	               $isCheckedStructure=true;
	               $isCheckedStructure=(Parameter::getUserParameter('isCheckedStructure'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedStructure'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedStructure'.$objectClass);
	               ?>
	               <div id="copyWithStructure" name="copyWithStructure" dojoType="dijit.form.CheckBox" <?php if ($isCheckedStructure=='true') echo " checked ";?> type="checkbox" >
	               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                    saveDataToSession('isCheckedStructure<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                    saveDataToSession('isCheckedStructure<?php echo $objectClass;?>',((this.checked)?true:false),true);
                 </script>
	               </div>
	               <br />
                 <label for="copyWithAssignments" style="width:90%;text-align: right;"><?php echo i18n("copyAssignments") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
                 <?php 
                 $isCheckedWithAsignments=true;
                 $isCheckedWithAsignments=(Parameter::getUserParameter('isCheckedWithAsignments'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithAsignments'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithAsignments'.$objectClass);
                 ?>
                 <div id="copyWithAssignments" name="copyWithAssignments" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithAsignments=='true') echo " checked ";?> type="checkbox" >
                 <script type="dojo/method" event="onChange" >
                    var type=dijit.byId('copyToClass').get('value');
                    saveDataToSession('isCheckedWithAsignments<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                    saveDataToSession('isCheckedWithAsignments<?php echo $objectClass;?>',((this.checked)?true:false),true);
                 </script>
                 </div>
              </div>
             </td>
           </tr>
           <?php
           }
            if($objectClass !="CatalogUO" and $objectClass!='SubTask'){
           if($copyToClass!="Asset"){ ?> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToOrigin" style="width:90%;text-align: right;"><?php echo i18n("copyToOrigin") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedOrigin=true;
               $isCheckedOrigin=(Parameter::getUserParameter('isCheckedOrigin'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedOrigin'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedOrigin'.$objectClass);
               ?>
               <div id="copyToOrigin" name="copyToOrigin" dojoType="dijit.form.CheckBox"  <?php if ($isCheckedOrigin=='true') echo " checked ";?> type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedOrigin<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedOrigin<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToLinkOrigin" style="width:90%;text-align: right;"><?php echo i18n("copyToLinkOrigin") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedLinkOrigin=true;
               $isCheckedLinkOrigin=(Parameter::getUserParameter('isCheckedLinkOrigin'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedLinkOrigin'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedLinkOrigin'.$objectClass);
               ?>
               <div id="copyToLinkOrigin" name="copyToLinkOrigin" dojoType="dijit.form.CheckBox" <?php if ($isCheckedLinkOrigin=='true') echo " checked ";?> type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedLinkOrigin<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedLinkOrigin<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <tr>
           <?php }else{ ?> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyStructure" style="width:90%;text-align: right;"><?php echo i18n("copyStructure") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedSructure=true;
               $isCheckedSructure=(Parameter::getUserParameter('isCheckedSructure'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedSructure'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedSructure'.$objectClass);
               ?>
               <div id="copyStructure" name="copyStructure" dojoType="dijit.form.CheckBox" <?php if ($isCheckedSructure=='true') echo " checked ";?> type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedSructure<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedSructure<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <?php } }
           if($objectClass!='SubTask'){?>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithLinks" style="width:90%;text-align: right;"><?php echo i18n("copyToWithLinks") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedWithLink=true;
               $isCheckedWithLink=(Parameter::getUserParameter('isCheckedWithLink'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithLink'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithLink'.$objectClass);
               ?>
               <div id="copyToWithLinks" name="copyToWithLinks" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithLink=='true') echo " checked ";?> type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedWithLink<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedWithLink<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <?php if(property_exists($objectClass, '_SubTask')){?>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithSubTask" style="width:90%;text-align: right;"><?php echo i18n("copyToWithSubTask") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckSubTask=false;
               $isCheckedWithLink=(Parameter::getUserParameter('isCheckedSubTask'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedSubTask'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedSubTask'.$objectClass);
               ?>
               <div id="copyToWithSubTask" name="copyToWithSubTask" dojoType="dijit.form.CheckBox" <?php if ($isCheckSubTask=='true') echo " checked ";?> 
                    type="checkbox" >
                <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedSubTask<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedSubTask<?php echo $objectClass;?>',((this.checked)?true:false),true);
                </script>
               </div>
             </td>
           </tr>
           <?php }}?>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithAttachments" style="width:90%;text-align: right;"><?php echo i18n("copyToWithAttachments") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedWithAttachments=true;
               $isCheckedWithAttachments=(Parameter::getUserParameter('isCheckedWithAttachments'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithAttachments'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithAttachments'.$objectClass);
               ?>
               <div id="copyToWithAttachments" name="copyToWithAttachments" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithAttachments=='true') echo " checked ";?> type="checkbox">
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedWithAttachments<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedWithAttachments<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <?php if($objectClass!='SubTask'){?>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithNotes" style="width:90%;text-align: right;"><?php echo i18n("copyToWithNotes") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedWithNotes=true;
               $isCheckedWithNotes=(Parameter::getUserParameter('isCheckedWithNotes'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithNotes'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithNotes'.$objectClass);
               ?>
               <div id="copyToWithNotes" name="copyToWithNotes" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithNotes=='true') echo " checked ";?> 
                    type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedWithNotes<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedWithNotes<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>   
           <?php } if($copyToClass!="Asset" and $objectClass!= 'CatalogUO' and $objectClass!='SubTask'){ ?> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithResult" style="width:90%;text-align: right;"><?php echo i18n("copyToWithResult") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
                <?php 
                $isCheckedWithResult=true;
                $isCheckedWithResult=(Parameter::getUserParameter('isCheckedWithResult'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithResult'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithResult'.$objectClass);
                ?>
               <div id="copyToWithResult" name="copyToWithResult" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithResult=='true') echo " checked ";?> 
                    type="checkbox">
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedWithResult<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedWithResult<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>   
         <?php } if(property_exists($objectClass, 'idStatus')){ ?> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithStatus" style="width:90%;text-align: right;"><?php echo i18n("CopyWithStatus", array($status->name));?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
                <?php 
                $isCheckedWithStatus=true;
                $isCheckedWithStatus=(Parameter::getUserParameter('isCheckedWithStatus'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithStatus'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithStatus'.$objectClass);
                if(Parameter::getGlobalParameter('defaultSkipCopyStatus')=="YES"){$isCheckedWithStatus=true;}
                ?>
               <div id="copyToWithStatus" name="copyToWithStatus" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithStatus=='true') echo " checked ";?> 
                    type="checkbox">
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedWithStatus<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedWithStatus<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>   
         <?php } if($objectClass=='ProjectExpense' || $objectClass=='IndividualExpense'){ ?> 
          <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithDetail" style="width:90%;text-align: right;"><?php echo i18n("copyToWithDetail") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
                <?php 
                $isCheckedWithDetail=true;
                $isCheckedWithDetail=(Parameter::getUserParameter('$isCheckedWithDetail'.$objectClass.$copyToClassId))?Parameter::getUserParameter('$isCheckedWithDetail'.$objectClass.$copyToClassId):Parameter::getUserParameter('$isCheckedWithDetail'.$objectClass);
                ?>
               <div id="copyToWithDetail" name="copyToWithDetail" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithDetail=='true') echo " checked ";?> 
                    type="checkbox">
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('$isCheckedWithDetail<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('$isCheckedWithDetail<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>   
         <?php } ?>
           <tr><td>&nbsp;</td><td >&nbsp;</td></tr>
         </table>
        </form>
      </td>
    </tr>
    <tr>
      <td align="center">
        <input type="hidden" id="copyAction">
        <button class="mediumTextButton" dojoType="dijit.form.Button" type="button" onclick="dijit.byId('dialogCopy').hide();">
          <?php echo i18n("buttonCancel");?>
        </button>
        <button class="mediumTextButton" dojoType="dijit.form.Button" type="submit" id="dialogCopySubmit" onclick="protectDblClick(this);copyObjectToSubmit();return false;">
          <?php echo i18n("buttonOK");?>
        </button>
      </td>
    </tr>
  </table>
<?php 
}else if($copyType=="copyProject"){
?>
<table>
    <tr>
      <td>
       <form dojoType="dijit.form.Form" id='copyProjectForm' name='copyProjectForm' onSubmit="return false;">
         <input id="copyProjectId" name="copyProjectId" type="hidden" value="" />
         <input id="moveAfterCreate" name="moveAfterCreate" type="hidden" value="<?php echo $moveAfterCreate?>" />
         <table>
           <tr>
             <td class="dialogLabel"  >
               <label for="copyProjectToType" ><?php echo i18n("colProjectType") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <select dojoType="dijit.form.FilteringSelect" 
               <?php echo autoOpenFilteringSelect();?>
               required="required"
                id="copyProjectToType" name="copyProjectToType" required
                class="input required" value="<?php echo ($fromContextMenu and $toCopy->codeType != 'TMP')?$toCopy->idProjectType:'';?>" >
                <?php htmlDrawOptionForReference('idProjectType', null, $toCopy, true);?>
               </select>
             </td>
           </tr>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <tr>
             <td class="dialogLabel" >
               <label for="copyProjectToName" ><?php echo i18n("copyToName") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <div id="copyProjectToName" name="copyProjectToName" dojoType="dijit.form.ValidationTextBox"
                required="required"
                style="width: 400px;"
                trim="true" maxlength="100" class="input required"
                value="<?php echo ($fromContextMenu)?$toCopy->name:'';?>">
               </div>     
             </td>
           </tr>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <tr>
             <td class="dialogLabel" >
               <label for="copyProjectToName" ><?php echo i18n("colProjectCode") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <?php $required=(pq_strpos($toCopy->getFieldAttributes('projectCode'),'required')!==false)?true:false;?>
               <div id="copyProjectToProjectCode" name="copyProjectToProjectCode" dojoType="dijit.form.ValidationTextBox"
                style="width: 400px;" <?php if ($required) echo ' required="required" ';?>
                trim="true" maxlength="100" class="input<?php if ($required) echo ' required';?>"
                value="">
               </div>     
             </td>
           </tr>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <tr>
             <td class="dialogLabel"  >
               <label for="copyProjectToSubProject" ><?php echo i18n("colIsSubProject") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <select dojoType="dijit.form.FilteringSelect" 
               data-dojo-props="queryExpr: '*${0}*',autoComplete:false"
               <?php echo autoOpenFilteringSelect();?>
                id="copyProjectToSubProject" name="copyProjectToSubProject"
                class="input" >
                <?php htmlDrawOptionForReference('idProject', $toCopy->idProject,null,false);?> 
               </select>
             </td>
           </tr>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyProjectStructure" style="width:90%;text-align: right;"><?php echo i18n("copyProjectStructure") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedProjectStructure=true;
               $isCheckedProjectStructure=Parameter::getUserParameter('isCheckedProjectStructure'.$objectClass);
               ?>
               <div id="copyProjectStructure" name="copyProjectStructure" dojoType="dijit.form.CheckBox" <?php if ($isCheckedProjectStructure=='true') echo " checked ";?>
                type="checkbox" onChange="copyProjectStructureChange()" >
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedProjectStructure<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyOtherProjectStructure" style="width:90%;text-align: right;"><?php echo i18n("copyOtherProjectStructure") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedOtherProjectStructure=true;
               $isCheckedOtherProjectStructure=Parameter::getUserParameter('isCheckedOtherProjectStructure'.$objectClass);
               ?>
               <div id="copyOtherProjectStructure" name="copyOtherProjectStructure" dojoType="dijit.form.CheckBox" <?php if ($isCheckedOtherProjectStructure=='true') echo " checked ";?>
                type="checkbox" onChange="copyProjectStructureChange()" >
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedOtherProjectStructure<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copySubProjects" style="width:90%;text-align: right;"><?php echo i18n("copySubProjects") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedSubProject=true;
               $isCheckedSubProject=Parameter::getUserParameter('isCheckedSubProject'.$objectClass);
               ?>
               <div id="copySubProjects" name="copySubProjects" dojoType="dijit.form.CheckBox" <?php if ($isCheckedSubProject=='true') echo " checked ";?> type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedSubProject<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
            <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyProjectAffectations" style="width:90%;text-align: right;"><?php echo i18n("copyProjectAffectations") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>              
               <?php 
               $isCheckedProjectAffectation=Parameter::getUserParameter('isCheckedProjectAffectation'.$objectClass);
               ?>
               <div id="copyProjectAffectations" name="copyProjectAffectations" dojoType="dijit.form.CheckBox" <?php if ($isCheckedProjectAffectation=='true') echo " checked ";?>
                    type="checkbox" >
                <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedProjectAffectation<?php echo $objectClass;?>',((this.checked)?true:false),true);
                </script>
               </div>
             </td>
           </tr>
        <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyProjectAssignments" style="width:90%;text-align: right;"><?php echo i18n("copyAssignments") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedProjectAssignment=Parameter::getUserParameter('isCheckedProjectAssignment'.$objectClass);
               ?>
               <div id="copyProjectAssignments" name="copyProjectAssignments" dojoType="dijit.form.CheckBox" <?php if ($isCheckedProjectAssignment=='true') echo " checked ";?> 
                    type="checkbox" >
                <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedProjectAssignment<?php echo $objectClass;?>',((this.checked)?true:false),true);
                </script>
               </div>
             </td>
           </tr>
           <!--  Krowry #2206 -->
            <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithVersionProjects" style="width:90%;text-align: right;"><?php echo i18n("copyToWithVersionProjects") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedVersionProjects=true;
               $isCheckedVersionProjects=Parameter::getUserParameter('isCheckedVersionProjects'.$objectClass);
               ?>
               <div id="copyToWithVersionProjects" name="copyToWithVersionProjects" dojoType="dijit.form.CheckBox" <?php if ($isCheckedVersionProjects=='true') echo " checked ";?> 
                    type="checkbox" >
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedVersionProjects<?php echo $objectClass;?>',((this.checked)?true:false),true);
                </script>
               </div>
             </td>
           </tr>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyProjectRequirement" style="width:90%;text-align: right;"><?php echo i18n("copyProjectRequirement") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedProjectRequirement=true;
               $isCheckedProjectRequirement=Parameter::getUserParameter('isCheckedProjectRequirement'.$objectClass);
               ?>
               <div id="copyProjectRequirement" name="copyProjectRequirement" dojoType="dijit.form.CheckBox" <?php if ($isCheckedProjectRequirement=='true') echo " checked ";?>
                type="checkbox"  >
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedProjectRequirement<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyProjectRiskOpportunity" style="width:90%;text-align: right;"><?php echo i18n("copyProjectRiskOpportunity") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedProjectRiskOpportunity=Parameter::getUserParameter('isCheckedProjectRiskOpportunity'.$objectClass);
               ?>
               <div id="copyProjectRiskOpportunity" name="copyProjectRiskOpportunity" dojoType="dijit.form.CheckBox" <?php if ($isCheckedProjectRiskOpportunity=='true') echo " checked ";?>
                type="checkbox"  >
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedProjectRiskOpportunity<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
<!-- ADD BY Marc TABARY - 2017-03-17 - COPY ACTIVITY PRICE WHEN COPY PROJECT -->
            <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithActivityPrice" style="width:90%;text-align: right;"><?php echo i18n("copyToWithActivityPrice") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
                <?php 
                $isCheckedActivityPrice=Parameter::getUserParameter('isCheckedActivityPrice'.$objectClass);
                ?>
               <div id="copyToWithActivityPrice" name="copyToWithActivityPrice" dojoType="dijit.form.CheckBox" <?php if ($isCheckedActivityPrice=='true') echo " checked ";?> 
                    type="checkbox">
                 <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedActivityPrice<?php echo $objectClass;?>',((this.checked)?true:false),true);
                </script>
               </div>
             </td>
           </tr>
<!-- END ADD BY Marc TABARY - 2017-03-17 - COPY ACTIVITY PRICE WHEN COPY PROJECT -->
            <!-- Gautier #1769 --> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithLinks" style="width:90%;text-align: right;"><?php echo i18n("copyToWithLinks") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedLink=true;
               $isCheckedLink=Parameter::getUserParameter('isCheckedLink'.$objectClass);
               ?>
               <div id="copyToWithLinks" name="copyToWithLinks" dojoType="dijit.form.CheckBox" <?php if ($isCheckedLink=='true') echo " checked ";?> 
                    type="checkbox" >
                <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedLink<?php echo $objectClass;?>',((this.checked)?true:false),true);
                </script>
               </div>
             </td>
           </tr>
           <?php if(property_exists($objectClass, '_SubTask')){?>
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithSubTask" style="width:90%;text-align: right;"><?php echo i18n("copyToWithSubTask") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckSubTask=false;
               $isCheckSubTask=Parameter::getUserParameter('isCheckedSubTask'.$objectClass);
               ?>
               <div id="copyToWithSubTask" name="copyToWithSubTask" dojoType="dijit.form.CheckBox" <?php if ($isCheckSubTask=='true') echo " checked ";?> 
                    type="checkbox" >
                <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedSubTask<?php echo $objectClass;?>',((this.checked)?true:false),true);
                </script>
               </div>
             </td>
           </tr>
           <?php }?>
          <!-- Gautier #copyAttachments Project --> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithAttachments" style="width:90%;text-align: right;"><?php echo i18n("copyToWithAttachments") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
               <?php 
               $isCheckedWithAttachments=true;
               $isCheckedWithAttachments=Parameter::getUserParameter('isCheckedWithAttachments'.$objectClass);
               ?>
               <div id="copyToWithAttachments" name="copyToWithAttachments" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithAttachments=='true') echo " checked ";?> type="checkbox">
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedWithAttachments<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>
           <?php if(property_exists($objectClass, 'idStatus')){ ?> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithStatus" style="width:90%;text-align: right;"><?php echo i18n("CopyWithStatus", array($status->name));?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
                <?php 
                $isCheckedWithStatus=true;
                $isCheckedWithStatus=(Parameter::getUserParameter('isCheckedWithStatus'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithStatus'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithStatus'.$objectClass);
                if(Parameter::getGlobalParameter('defaultSkipCopyStatus')=="YES"){$isCheckedWithStatus=true;}
                ?>
               <div id="copyToWithStatus" name="copyToWithStatus" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithStatus=='true') echo " checked ";?> 
                    type="checkbox">
               <script type="dojo/method" event="onChange" >
                  saveDataToSession('isCheckedWithStatus<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>   
         <?php }?> 
          <tr><td>&nbsp;</td><td >&nbsp;</td></tr>
         </table>
        </form>
      </td>
    </tr>
    <tr>
      <td align="center">
        <input type="hidden" id="copyProjectAction">
        <button class="mediumTextButton" dojoType="dijit.form.Button" type="button" onclick="dijit.byId('dialogCopy').hide();">
          <?php echo i18n("buttonCancel");?>
        </button>
        <button class="mediumTextButton" dojoType="dijit.form.Button" type="submit" id="dialogCopySubmit" onclick="protectDblClick(this);copyProjectToSubmit();return false;">
          <?php echo i18n("buttonOK");?>
        </button>
      </td>
    </tr>
  </table>
<?php }
else if($copyType=="copyVersion"){
	if ($objectClass=='ComponentVersion') {
	  $source=new Component($toCopy->idComponent);
	  $type=$toCopy->idComponentVersionType; 
	} else if ($objectClass=='ProductVersion') {
	  $source=new Product($toCopy->idProduct);
	  $type=$toCopy->idProductVersionType;
	} else {
		errorLog("object class $objectClass not taken into account for copy type 'copyVersion'");
		exit;
	}
	$paramNameAutoformat=Parameter::getGlobalParameter('versionNameAutoformat');
	$paramNameAutoformatSeparator=Parameter::getGlobalParameter('versionNameAutoformatSeparator');
?>
  <table>
    <tr>
      <td>
       <form dojoType="dijit.form.Form" id='copyForm' name='copyForm' onSubmit="return false;">
         <input id="copyClass" name="copyClass" type="hidden" value="<?php echo $objectClass;?>" />
         <input id="copyToClass" name="copyToClass" type="hidden" value="<?php echo $objectClass;?>" />
         <input id="copyId" name="copyId" type="hidden" value="<?php echo $objectId;?>" />
         <input id="copySourceName" name="copySourceName" type="hidden" value="<?php echo $source->name;?>" />
         <input id="copySourceNameSeparator" name="copySourceNameSeparator" type="hidden" value="<?php echo $paramNameAutoformatSeparator;?>" />
         <input id="moveAfterCreate" name="moveAfterCreate" type="hidden" value="<?php echo $moveAfterCreate?>" />
         <table>
           <?php if ($paramNameAutoformat=='YES') {?>
           <tr>
             <td class="dialogLabel" >
               <label for="copyToVersionNumber" ><?php echo i18n("colVersionNumber") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <div id="copyToVersionNumber" name="copyToVersionNumber" dojoType="dijit.form.ValidationTextBox"
                required="required"
                style="width: 400px;"
                trim="true" maxlength="100" class="input"
                value="<?php echo pq_str_replace('"', '&quot;', $toCopy->versionNumber);?>">
                  <script type="dojo/connect" event="onChange">
                    dijit.byId("copyToName").set("value", dojo.byId('copySourceName').value+dojo.byId('copySourceNameSeparator').value+this.value);
                  </script>
               </div>     
             </td>
           </tr>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <?php }?>
           <tr>
             <td class="dialogLabel" >
               <label for="copyToName" ><?php echo i18n("copyToName") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <div id="copyToName" name="copyToName" dojoType="dijit.form.ValidationTextBox"
                <?php if ($paramNameAutoformat=='YES') { echo "readonly";} else { echo 'required="required"';}?>
                style="width: 400px;"
                trim="true" maxlength="100" class="input"
                value="<?php echo pq_str_replace('"', '&quot;', $toCopy->name);?>">
               </div>     
             </td>
           </tr>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           <?php  if($objectClass != "CatalogUO"){?>
           <tr>
             <td class="dialogLabel"  >
               <label for="copyToType" ><?php echo i18n("copyToType") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
             </td>
             <td>
               <select dojoType="dijit.form.FilteringSelect" 
               <?php echo autoOpenFilteringSelect();?>
                id="copyToType" name="copyToType" required
                class="input">
                <?php $colName='id'.$objectClass.'Type';
                      htmlDrawOptionForReference($colName, $toCopy->$colName, null, true);?>
               </select>
             </td>
           </tr>
           <?php } ?>
           <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
           
           <?php $paramTypeOfCopyComponentVersion = Parameter::getGlobalParameter('typeOfCopyComponentVersion');
                  if(!$paramTypeOfCopyComponentVersion){ $paramTypeOfCopyComponentVersion = 'free';} ?>
           
           <tr>
             <td class="dialogLabel" >
               <label><?php echo i18n("copyToCopyVersionStructure") ?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>           
             </td>
             <td>
               <table style="width:100%;">
               <tr><td style="position:relative">
                 <img style="position: absolute;left:0px; top:0px;height:50px;" src="../view/img/helpCopyVersion.png" 
                     onmouseenter="this.style.height='200px';this.style.top='-100px';" 
                     onmouseout="this.style.height='50px';this.style.top='0px';"/>
               <input type="radio" data-dojo-type="dijit/form/RadioButton"  <?php if($paramTypeOfCopyComponentVersion == 'A'){ echo 'checked'; } if($paramTypeOfCopyComponentVersion != 'free' and $paramTypeOfCopyComponentVersion != 'A'){ echo' disabled'; }?>  name="copyToCopyVersionStructure" id="copyToCopyVersionStructureCopy" value="Copy"/>
                 <label for="copyToCopyVersionStructureCopy" style="width:90%"><?php echo i18n("copyToCopyVersionStructureCopy")?></label>
               </td></tr><tr><td>
               <input type="radio" data-dojo-type="dijit/form/RadioButton" <?php if($paramTypeOfCopyComponentVersion == 'B' or $paramTypeOfCopyComponentVersion == 'free') { echo 'checked'; } if($paramTypeOfCopyComponentVersion != 'free' and $paramTypeOfCopyComponentVersion != 'B'){ echo' disabled'; }?>  name="copyToCopyVersionStructure" id="copyToCopyVersionStructureNoCopy"  value="NoCopy"/> 
                 <label for="copyToCopyVersionStructureNoCopy" style="width:90%"><?php echo i18n("copyToCopyVersionStructureNoCopy")?></label>
               </td></tr><tr><td>
               <input type="radio" data-dojo-type="dijit/form/RadioButton" <?php if($paramTypeOfCopyComponentVersion == 'C'){ echo 'checked'; } if($paramTypeOfCopyComponentVersion != 'free' and $paramTypeOfCopyComponentVersion != 'C'){ echo' disabled'; }?>  name="copyToCopyVersionStructure" id="copyToCopyVersionStructureReplace" value="Replace"/> 
                 <label for="copyToCopyVersionStructureReplace" style="width:90%"><?php echo i18n("copyToCopyVersionStructureReplace")?></label>
               </td></tr>
               </table>
             </td>
           </tr>
           <?php if(property_exists($objectClass, 'idStatus')){ ?> 
           <tr>
             <td class="dialogLabel" colspan="2" style="width:100%; text-align: left;">
               <label for="copyToWithStatus" style="width:90%;text-align: right;"><?php echo i18n("CopyWithStatus", array($status->name));?>&nbsp;<?php if(!isNewGui()){?>:<?php }?>&nbsp;</label>
                <?php 
                $isCheckedWithStatus=true;
                $isCheckedWithStatus=(Parameter::getUserParameter('isCheckedWithStatus'.$objectClass.$copyToClassId))?Parameter::getUserParameter('isCheckedWithStatus'.$objectClass.$copyToClassId):Parameter::getUserParameter('isCheckedWithStatus'.$objectClass);
                ?>
               <div id="copyToWithStatus" name="copyToWithStatus" dojoType="dijit.form.CheckBox" <?php if ($isCheckedWithStatus=='true') echo " checked ";?> 
                    type="checkbox">
               <script type="dojo/method" event="onChange" >
                  var type=dijit.byId('copyToClass').get('value');
                  saveDataToSession('isCheckedWithStatus<?php echo $objectClass;?>'+type,((this.checked)?true:false),true);
                  saveDataToSession('isCheckedWithStatus<?php echo $objectClass;?>',((this.checked)?true:false),true);
               </script>
               </div>
             </td>
           </tr>   
         <?php }?> 
           <tr><td>&nbsp;</td><td >&nbsp;</td></tr>
         </table>
        </form>
      </td>
    </tr>
    <tr>
      <td align="center">
        <input type="hidden" id="copyAction">
        <button class="mediumTextButton" dojoType="dijit.form.Button" type="button" onclick="dijit.byId('dialogCopy').hide();">
          <?php echo i18n("buttonCancel");?>
        </button>
        <button class="mediumTextButton" dojoType="dijit.form.Button" type="submit" id="dialogCopySubmit" onclick="protectDblClick(this);copyObjectToSubmit();return false;">
          <?php echo i18n("buttonOK");?>
        </button>
      </td>
    </tr>
  </table>
<?php 
}
?>