/*** COPYRIGHT NOTICE *********************************************************
/*
* Copyright (c) 2009, Shlomy Gantz BlueBrick Inc. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of Shlomy Gantz or BlueBrick Inc. nor the
*       names of its contributors may be used to endorse or promote products
*       derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY SHLOMY GANTZ/BLUEBRICK INC. ''AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL SHLOMY GANTZ/BLUEBRICK INC. BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* 
* =============================================================================
* 
* This file has bee adapted and is part of ProjeQtOr.
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
 * JSGantt component is a UI control that displays gantt charts based by using
 * CSS and HTML
 * 
 * @module jsgantt
 * @title JSGantt
 */
var JSGantt; if (!JSGantt) JSGantt = {};
var vTimeout = 0;
var vBenchTime = new Date().getTime();
var arrayClosed=new Array();
var vGanttCurrentLine=-1;
var linkInProgress=false;
var vCriticalPathColor='#FF0040';
var planningFieldsDescription=new Array();
var planningTypeList = new Array('contract','global','planning','portfolio','resource','version');
planningTypeList.forEach(function(planningType) {
  //planningFieldsDescription[getIndiceForPlanningType(planningType)]=planningFieldsDescriptionRef;
  var idx=getIndiceForPlanningType(planningType);
  planningFieldsDescription[idx]=new Array(
  {name:"Name",           show:false,  order:0,  width:300, minWidth:100, showSpecif:true, type:"text", inputType:"dijit/form/TextBox",rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"Id",             show:false,  order:1,  width:100, minWidth:50, showspecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"Type",           show:false,  order:2, width:100, minWidth:50, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"IdStatus",       show:false,  order:3, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"Priority",       show:false,  order:4, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"IdPlanningMode", show:false,  order:5, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"ValidatedStartDate", show:false, order:6,  width:100, minWidth:50, showSpecif:true, type:"date", inputType:"dijit/form/DateTextBox", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"ValidatedEndDate", show:false, order:7,  width:100, minWidth:50, showSpecif:true, type:"date", inputType:"dijit/form/DateTextBox", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"ValidatedDuration", show:false, order:8,  width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"ValidatedCost",  show:false,  order:9, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"ValidatedWork",  show:false,  order:10,  width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"UnitProgress",   show:false,  order:11, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:true},
  {name:"AssignedWork",   show:false,  order:12,  width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"RealWork",       show:false,  order:13,  width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"LeftWork",       show:false,  order:14,  width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"Progress",       show:false,  order:15, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"Resource",       show:false,  order:16,  width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"Responsible",    show:false,  order:17,  width:100, minWidth:50, showSpecif:true, type:"text", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"RespInitial",    show:false,  order:18,  width:100, minWidth:50, showSpecif:true, type:"text", inputType:"dijit/form/TextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"StartDate",      show:false,  order:19,  width:100, minWidth:50, showSpecif:true, type:"date", inputType:"dijit/form/DateTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"EndDate",        show:false,  order:20,  width:100, minWidth:50, showSpecif:true, type:"date", inputType:"dijit/form/DateTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"PlannedWork",    show:false,  order:21, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"Duration",       show:false,  order:22,  width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"AssignedCost",   show:false,  order:23, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"RealCost",       show:false,  order:24, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"LeftCost",       show:false,  order:25, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"PlannedCost",    show:false,  order:26, width:100, minWidth:50, showSpecif:true, type:"number", inputType:"dijit/form/NumberTextBox", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"IdHealthStatus", show:false,  order:27, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"QualityLevel",   show:false,  order:28, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"IdTrend",        show:false,  order:29, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"IdOverallProgress", show:false,  order:30, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"ObjectType",     show:false,  order:31, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"ExterRes",       show:false,  order:32, width:100, minWidth:50, showSpecif:true, type:"select", inputType:"dijit/form/FilteringSelect", rawValue:new Array(), showValue:new Array(), editable:false},
  {name:"Completed",      show:false,  order:33,  width:100, minWidth:50, showSpecif:true, type:"text", inputType:"dijit/form/TextBox", rawValue:new Array(), showValue:new Array(), editable:false}
  );
});
function getIndiceForPlanningType(planningType) {
  if(!planningType)planningType='planning';
  return planningTypeList.indexOf(planningType);
}
function setPlanningFieldShow(field, value, planningType) {
  if(!planningType)planningType='planning';
  return setPlanningField('show',field, value, planningType);
}
function setPlanningFieldShowSpecif(field, value, planningType) {
  if(!planningType)planningType='planning';
  return setPlanningField('showSpecif',field, value, planningType);
}
function getPlanningFieldShow(field,planningType) {
  if(!planningType)planningType='planning';
  if (getPlanningField('show',field, planningType) && getPlanningField('showSpecif',field, planningType)) {
    return true;
  } else {
    return false;
  }
}
function setPlanningFieldOrder(field, value, planningType) {
  return setPlanningField('order',field, value, planningType);
}
function getPlanningFieldOrder(field, planningType) {
  return getPlanningField('order',field, planningType);
}
function setPlanningFieldWidth(field, value, planningType) {
  return setPlanningField('width',field, value, planningType);
}
function getPlanningFieldWidth(field, planningType) {
  return getPlanningField('width',field, planningType);
}
function setPlanningFieldMinWidth(field, value, planningType) {
  return setPlanningField('minWidth',field, value, planningType);
}
function getPlanningFieldMinWidth(field, planningType) {
  return getPlanningField('minWidth',field, planningType);
}
function getPlanningFieldValue(field, refItem, type, planningType) {
  if(!planningType)planningType='planning';
  planningTypeIndice=getIndiceForPlanningType(planningType);
  for (var i=0;i<planningFieldsDescription[planningTypeIndice].length;i++) {
    if (planningFieldsDescription[planningTypeIndice][i].name==field) {
      if(refItem){
        if(type == null){
          return new Array({raw:planningFieldsDescription[planningTypeIndice][i].rawValue[refItem], show:planningFieldsDescription[planningTypeIndice][i].showValue[refItem]});
        }else{
          if(type == 'show')return planningFieldsDescription[planningTypeIndice][i].showValue[refItem];
          if(type == 'raw')return planningFieldsDescription[planningTypeIndice][i].rawValue[refItem];
        }
      }else{
        return null;
      }
    }
  }
  return "["+field+"]";
}
function setPlanningFieldValue(field, refItem, fieldValue, type, planningType) {
  if(!planningType)planningType='planning';
  planningTypeIndice=getIndiceForPlanningType(planningType);
  for (var i=0;i<planningFieldsDescription[planningTypeIndice].length;i++) {
    if (planningFieldsDescription[planningTypeIndice][i].name==field) {
      if(refItem){
        if(type == null){
          planningFieldsDescription[planningTypeIndice][i].rawValue[refItem] = fieldValue;
          planningFieldsDescription[planningTypeIndice][i].showValue[refItem] = fieldValue;
        }else{
          if(type == 'show')planningFieldsDescription[planningTypeIndice][i].showValue[refItem] = fieldValue;
          if(type == 'raw')planningFieldsDescription[planningTypeIndice][i].rawValue[refItem] = fieldValue;
        }
      }else{
        return;
      }
    }
  }
}

function setPlanningField(attribute, field, value, planningType) {
  if(!planningType)planningType='planning';
  var planningTypeIndice=getIndiceForPlanningType(planningType);
  for (var i=0;i<planningFieldsDescription[planningTypeIndice].length;i++) {
    if (planningFieldsDescription[planningTypeIndice][i].name==field) {
      if (attribute=='show') {
        planningFieldsDescription[planningTypeIndice][i].show=value;
      }
      else if (attribute=='showSpecif') {planningFieldsDescription[planningTypeIndice][i].showSpecif=value;}
      else if (attribute=='order') {planningFieldsDescription[planningTypeIndice][i].order=value;}
      else if (attribute=='width') {planningFieldsDescription[planningTypeIndice][i].width=value;}
      else if (attribute=='minWidth') {planningFieldsDescription[planningTypeIndice][i].minWidth=value;}
      return true;
    }
  }
} 
function getPlanningField(attribute,field, planningType) {
  if(!planningType)planningType='planning';
  planningTypeIndice=getIndiceForPlanningType(planningType);
  for (var i=0;i<planningFieldsDescription[planningTypeIndice].length;i++) {
    if (planningFieldsDescription[planningTypeIndice][i].name==field) {
      if (attribute=='show') {return planningFieldsDescription[planningTypeIndice][i].show;}
      else if (attribute=='showSpecif') {return planningFieldsDescription[planningTypeIndice][i].showSpecif;}
      else if (attribute=='order') {return planningFieldsDescription[planningTypeIndice][i].order;}
      else if (attribute=='width') {return planningFieldsDescription[planningTypeIndice][i].width;}
      else if (attribute=='minWidth') {return planningFieldsDescription[planningTypeIndice][i].minWidth;}
      else {return null;}
    }
  }
} 
function getPlanningEditableFields(planningType, refItem, isPlanningElement) {
  if(!planningType)planningType='planning';
  if(planningType=='version' || planningType=='contract')return null;
  planningTypeIndice=getIndiceForPlanningType(planningType);
  var editableField = new Array();
  for (var i=0;i<planningFieldsDescription[planningTypeIndice].length;i++) {
    if (planningFieldsDescription[planningTypeIndice][i].editable==true && planningFieldsDescription[planningTypeIndice][i].show == 1) {
      if(!(planningFieldsDescription[planningTypeIndice][i].name == 'Name' ||
          planningFieldsDescription[planningTypeIndice][i].name == 'IdStatus' ||
          planningFieldsDescription[planningTypeIndice][i].name == 'Type') && !isPlanningElement)continue;
      var field = {
       name : planningFieldsDescription[planningTypeIndice][i].name,
       show : planningFieldsDescription[planningTypeIndice][i].show,
       order : planningFieldsDescription[planningTypeIndice][i].order,
       width : planningFieldsDescription[planningTypeIndice][i].width,
       minWidth : planningFieldsDescription[planningTypeIndice][i].minWidth,
       showSpecif : planningFieldsDescription[planningTypeIndice][i].showSpecif,
       type : planningFieldsDescription[planningTypeIndice][i].type,
       inputType : planningFieldsDescription[planningTypeIndice][i].inputType,
       rawValue : planningFieldsDescription[planningTypeIndice][i].rawValue[refItem],
       showValue : planningFieldsDescription[planningTypeIndice][i].showValue[refItem]};
      editableField[planningFieldsDescription[planningTypeIndice][i].order]=field;
    }
  }
  return editableField;
}
function setPlanningFieldEditable(planningType, field, value) {
  if(!planningType)planningType='planning';
  if(planningType=='version' || planningType=='contract')return;
  planningTypeIndice=getIndiceForPlanningType(planningType);
  for (var i=0;i<planningFieldsDescription[planningTypeIndice].length;i++) {
    if (planningFieldsDescription[planningTypeIndice][i].name == field){
      planningFieldsDescription[planningTypeIndice][i].editable=value;
    }
  }
}
function isPlanningFieldEditable(planningType, field) {
  if(!planningType)planningType='planning';
  if(planningType=='version' || planningType=='contract')return false;
  planningTypeIndice=getIndiceForPlanningType(planningType);
  for (var i=0;i<planningFieldsDescription[planningTypeIndice].length;i++) {
    if (planningFieldsDescription[planningTypeIndice][i].name == field){
      if (planningFieldsDescription[planningTypeIndice][i].editable==true) {
        return true;
      }else{
        return false;
      }
    }
  }
}

JSGantt.TaskItem = function(pItem, pPlanningType, pName, pStart, pEnd, pColor,
                            pLink, pContextMenu, pComp, pParent, pCaption, pScope, pRealEnd, pPlanStart,
                            pHealthStatus,pQualityLevel,pTrend,pOverallProgress,pObjectType,pExtRes, pIdPlanningMode, pIdStatus,
                            pDurationContract,pElementIdRef,pColorBlindColor, pColorBlindTaskColor,pColorBaslineBottom,pColorBaslineUpper) {
  var vPlanningTypeIndice=getIndiceForPlanningType(pPlanningType);
  var pRefItem = pItem.reftype+'_'+pItem.refid;
  if (pPlanningType=="resource") {
    if (pItem.reftype=='Project' || pItem.reftype=='Fixed' || pItem.reftype=='Replan' || pItem.reftype=='Construction') {
      pRefItem+='_'+pItem.id;
    } else {
      pRefItem+='_'+pItem.idresource+'_'+pItem.id;
    }
  }
  for (var i=0;i<planningFieldsDescription[vPlanningTypeIndice].length;i++) {
    var col = planningFieldsDescription[vPlanningTypeIndice][i].name.toLowerCase();
    if (pItem[col] !== undefined) {
      setPlanningFieldValue(planningFieldsDescription[vPlanningTypeIndice][i].name, pRefItem, pItem[col], null, pPlanningType);
    }
    if(pItem[col+'display'] !== undefined){
      setPlanningFieldValue(planningFieldsDescription[vPlanningTypeIndice][i].name, pRefItem, pItem[col+'display'], 'show', pPlanningType);
    }
    if (pItem[col.substr(2)] !== undefined) {
      setPlanningFieldValue(planningFieldsDescription[vPlanningTypeIndice][i].name, pRefItem, pItem[col.substr(2)], 'show', pPlanningType);
    }
    if(col == 'name'){
      setPlanningFieldValue(planningFieldsDescription[vPlanningTypeIndice][i].name, pRefItem, htmlEncode(pItem.refname), 'raw', pPlanningType);
      setPlanningFieldValue(planningFieldsDescription[vPlanningTypeIndice][i].name, pRefItem, pName, 'show', pPlanningType);
    }
  }
  var vID = pItem.id;
  var vName  = pName;
  var vId	 = pItem.refid;
  var vStart = new Date();  
  var vEnd   = new Date();
  var vColor = pColor;
  var vTaskColor = (pItem.paused==1)?'A0A0A0':pItem.color;
  var vColorBlindTaskColor = pColorBlindTaskColor;
  var vLink  = pLink;
  var vContextMenu  = pContextMenu;
  var vMile  = (pItem.reftype == 'Milestone') ? 1 : 0;
  var vRes   = pItem.resource;
  var vExtRes   = pExtRes;
  var vComp  = pComp;
  var vUnitProgress = Math.round(pItem.unitprogress);
  var vGroup = (pItem.elementary == '0' || pItem.reftype=='Project' || pItem.reftype=='Fixed' || pItem.reftype=='Replan' || pItem.reftype=='Construction' ) ? 1 : 0;
  var vParent = pParent;
  var vOpen   = (pItem.collapsed == '1') ? '0' : '1';;
  var vDepend = pItem.depend;
  var vCaption = pCaption;
  var vObjectType= pObjectType;
  var vDuration = '';
  var vLevel = 0;
  var vNumKid = 0;
  var vVisible  = 1;
  var x1=0;
  var y1=0;
  var x2=0;
  var y2=0;
  var vIdPlanningMode=pIdPlanningMode;
  var vIdStatus=pIdStatus;
  var vClass=pItem.reftype;
  var vScope=pScope;
  var vRealEnd=new Date();
  var vPlanStart=new Date();
  var vHealthStatus=pHealthStatus;
  var vQualityLevel=pQualityLevel;
  var vTrend=pTrend;
  var vOverallProgress=pOverallProgress;
  var vBaseTopStart=new Date(); ;
  var vBaseTopEnd=new Date(); ;
  var vBaseBottomStart=new Date(); ;
  var vBaseBottomEnd=new Date(); ;
  var vIsOnCriticalPath=pItem.isoncriticalpath;
  var vGlobal='notSet';
  var vDurationContract=pDurationContract;
  var vStartInit = pStart;
  var vEndInit   = pEnd;
  var vElementIdRef=pElementIdRef;
  var vIconClass=pItem.iconClass;
  var vColorBlindColor=pColorBlindColor;
  var vValidatedStartDate = pItem.validatedstartdate;
  var vValidatedEndDate = pItem.validatedenddate;
  var vValidatedDuration = pItem.validatedduration;
  var vColorBaselineUpper=pColorBaslineUpper;
  var vColorBaselineBottom=pColorBaslineBottom;
  
  vStart = JSGantt.parseDateStr(pStart,g.getDateInputFormat());
  vEnd   = JSGantt.parseDateStr(pEnd,g.getDateInputFormat());
  vValidatedStartDate = JSGantt.parseDateStr(pItem.validatedstartdate,g.getDateInputFormat());
  vValidatedEndDate   = JSGantt.parseDateStr(pItem.validatedenddate,g.getDateInputFormat());
  vRealEnd = JSGantt.parseDateStr(pRealEnd,g.getDateInputFormat());
  vPlanStart = JSGantt.parseDateStr(pPlanStart,g.getDateInputFormat());
  vBaseTopStart = JSGantt.parseDateStr(pItem.baseTopStart,g.getDateInputFormat());
  vBaseTopEnd = JSGantt.parseDateStr(pItem.baseTopEnd,g.getDateInputFormat());
  vBaseBottomStart = JSGantt.parseDateStr(pItem.baseBottomStart,g.getDateInputFormat());
  vBaseBottomEnd = JSGantt.parseDateStr(pItem.baseBottomEnd,g.getDateInputFormat());
  
  this.getFieldValue = function(pField) {
    if (pField=='Name') return vName;
    else if (pField=='ID') return vID;
    else if (pField=='Id') return vId;
    else if (pField=='StartDate') return JSGantt.formatDateStr(this.getStart(),'default');
    else if (pField=='EndDate') return JSGantt.formatDateStr((this.getEnd())?this.getEnd():this.getRealEnd(),'default');
    else if (pField=='Resource') return vRes;
    else if (pField=='ValidatedStartDate') return JSGantt.formatDateStr(vValidatedStartDate,'default');
    else if (pField=='ValidatedEndDate') return JSGantt.formatDateStr(vValidatedEndDate,'default');
    else if (pField=='ExterRes')return vExtRes;
    else if (pField=='PlanEnd') return vPlanEnd;
    else if (pField=='RealEnd') return vRealEnd;
    else if (pField=='IdHealthStatus')return vHealthStatus;
    else if (pField=='QualityLevel')return vQualityLevel;
    else if (pField=='IdTrend')return vTrend;
    else if (pField=='IdOverallProgress')return vOverallProgress;
    else if (pField=='ObjectType')return vObjectType;
    else if (pField=='Duration') return this.getDuration(g.getFormat());
    else if (pField=='Progress') return this.getCompStr();
    else if (pField=='UnitProgress') return this.getUnitProgressStr();
    else return getPlanningFieldValue(pField, pRefItem, 'show', pPlanningType);
    //else if(getPlanningFieldValue(pField, pRefItem, 'show', pPlanningType) !== undefined) return getPlanningFieldValue(pField, pRefItem, 'show', pPlanningType);
    //else return "["+pField+"]";
  };
  this.getItem     = function(){ return pItem; };
  this.getID       = function(){ return vID; };
  this.getId       = function(){ return vId; };
  this.getName     = function(){ return vName; };
  this.getNameTitle=function(){ return vName.replace(/"/g,"''"); };
  this.getStart    = function(){ return vStart;};
  this.getEnd      = function(){ return vEnd;  };
  this.getIdPlanningMode =function(){ return vIdPlanningMode;};
  this.getIdStatus     = function(){ return vIdStatus;  };
  this.getEndInit      = function(){ return vEndInit;  };
  this.getRealEnd  = function(){ return vRealEnd;  };
  this.getPlanStart= function(){ return vPlanStart;  };
  this.getBaseTopStart     = function(){ return vBaseTopStart;  };
  this.getBaseTopEnd     = function(){ return vBaseTopEnd;  };
  this.getBaseBottomStart     = function(){ return vBaseBottomStart;  };
  this.getBaseBottomEnd     = function(){ return vBaseBottomEnd;  };
  this.getIsOnCriticalPath     = function(){ if (g.getShowCriticalPath()) {return vIsOnCriticalPath;} else {return 0;}  };
  this.getColorBaselineUpper = function() { return vColorBaselineUpper; };
  this.getColorBaselineBottom = function() { return vColorBaselineBottom; };
  this.getColor    = function(){ 
    if (vTaskColor) return vTaskColor;
    else return vColor;
  };
  this.getActivityColor = function() {
    if (vTaskColor) return vTaskColor;
    else return null;
  };
  this.getActivityBlindColor = function() {
    if (vColorBlindTaskColor) return vColorBlindTaskColor;
    else return null;
  };
  this.getTaskStatusColor    = function(){ 
    return vColor;
  };
  this.getColorBlindColor    = function(){ 
    if (pColorBlindColor) return pColorBlindColor;
    else return vColor;
  };
  this.getLink     = function(){ return vLink; };
  this.getContextMenu = function(){ return vContextMenu; };
  this.getMile     = function(){ return vMile; };
  this.getDepend   = function(){ if(vDepend) return vDepend; else return null; };
  this.getCaption  = function(){ if(vCaption) return vCaption; else return ''; };
  this.getResource = function(){ if(vRes) return vRes; else return '&nbsp';  };
  this.getCompVal  = function(){ if(vComp) return vComp; else return 0; };
  this.getCompStr  = function(){ if(vComp) return vComp+'%'; else return '0%'; };
  this.getUnitProgress  = function(){ if(vUnitProgress) return vUnitProgress; else return 0; };
  this.getUnitProgressStr  = function(){ if(vUnitProgress) return vUnitProgress+'%'; else return '0%'; };
  this.getDurationContract = function(){ return vDurationContract; };
  this.getElementIdRef = function(){ return vElementIdRef;};
  this.getDuration = function(vFormat){ 
    if (vMile) { 
      vDuration = '-';
    }else if(dojo.byId('contractGantt') && !vMile){
      vDuration=this.getDurationContract();
    } else if (vFormat=='hour') {
      tmpPer =  Math.ceil((this.getEnd() - this.getStart()) /  ( 60 * 60 * 1000) );
      vDuration = tmpPer + ' ' + i18n('shortHour');
    } else if (vFormat=='minute') {
      tmpPer =  Math.ceil((this.getEnd() - this.getStart()) /  ( 60 * 1000) );
      vDuration = tmpPer + ' ' + i18n('shortMinute');
    }else {
      if (this.getStart()==null || this.getEnd()==null) {
      	if (this.getStart()==null && this.getRealEnd()==null) {
      	  vDuration = '-';
      	} else {
      	  if (this.getStart()!=null &&  this.getRealEnd()!=null) {
        	  tmpPer =  workDayDiffDates(this.getStart(), this.getRealEnd(), pItem.idproject);
            vDuration = tmpPer + ' ' + i18n('shortDay');
      	  } else {
      	    vDuration = '-';
      	  }
      	}
      } else {
        tmpPer =  workDayDiffDates(this.getStart(), this.getEnd(), pItem.idproject);
        vDuration = tmpPer + ' ' + i18n('shortDay');
      }
    }
    return( vDuration );
  };
  this.getParent   = function(){ return vParent; };
  this.getGroup    = function(){ return vGroup; };
  this.getOpen     = function(){ return vOpen; };
  this.getLevel    = function(){ return vLevel; };
  this.getNumKids  = function(){ return vNumKid; };
  this.getStartX   = function(){ return x1; };
  this.getStartY   = function(){ return y1; };
  this.getEndX     = function(){ return x2; };
  this.getEndY     = function(){ return y2; };
  this.getVisible  = function(){ return vVisible; };
  this.getScope    = function(){ return vScope; };
  this.getClass    = function(){ return vClass; };
  this.getGlobal   = function() {
    if (vGlobal=='notSet') {  
      var cls=this.getClass();
      if (cls=='Action' || cls=='Decision' || cls=='Delivery' || cls=='Deliverable' || cls=='Incoming' || cls=='Issue' || cls=='Opportunity'
      || cls=='Question' || cls=='Risk' || cls=='Ticket' ) {
        vGlobal=true;  
      } else { 
        vGlobal=false;  
      }
    } 
    return vGlobal;
  }
  this.getIconClass = function(){ 
    if(!vIconClass){
      vIconClass=this.getClass();
    }
    return vIconClass;
  };
  this.setStart    = function(pStart){ vStart = pStart;};
  this.setEnd      = function(pEnd)  { vEnd   = pEnd;  };
  this.setLevel    = function(pLevel){ vLevel = pLevel;};
  this.setColor    = function(pColor){ vColor = pColor;};
  this.setNumKid   = function(pNumKid){ vNumKid = pNumKid;};
  this.setCompVal  = function(pCompVal){ vComp = pCompVal;};
  this.setStartX   = function(pX) {x1 = pX; };
  this.setStartY   = function(pY) {y1 = pY; };
  this.setEndX     = function(pX) {x2 = pX; };
  this.setEndY     = function(pY) {y2 = pY; };
  this.setOpen     = function(pOpen) {vOpen = pOpen; };
  this.setVisible  = function(pVisible) {vVisible = pVisible; };
  this.setBaseTopStart  = function(pBaseTopStart) {vBaseTopStart = pBaseTopStart; };
  this.setBaseTopEnd  = function(pBaseTopEnd) {vBaseTopEnd = pBaseTopEnd; };
  this.setBaseBottomStart  = function(pPlanningMode) {vBaseBottomStart = pBaseBottomStart; };
  this.setBaseBottomEnd  = function(pBaseBottomEnd) {vBaseBottomEnd = pBaseBottomEnd; };
  this.getIdProject = function(pList) {
    if (this.getClass()=='Project') return this.getID();
    if (! this.getParent()) { 
      traceLog("Cannot find project for task "+this.getId()+" ("+this.getClass()+") - "+this.getName());
      return null;
    }
    for (j=0;j<pList.length;j++) {
      if (pList[j].getID()==this.getParent()) {
        parent=pList[j];
        if (parent.getClass()=='Project') return parent.getID();
        return parent.getIdProject(pList);
        break;
      }
    }
    return null;
  };
  this.getProjectId = function(){
    if (this.getClass()=='Project'){
      return this.getID();
    }else{
      return pItem.idproject;
    }
  }
};  
  
/**
 * Creates the gant chart.
 */
JSGantt.GanttChart =  function(pGanttVar, pDiv, pFormat) {
  var vGanttVar = pGanttVar;
  var vDiv      = pDiv;
  var vFormat   = pFormat;
  var vShowRes  = 1;
  var vShowDur  = 1;
  var vShowComp = 1;
  var vShowStartDate = 1;
  var vShowEndDate = 1;
  var vShowValidatedWork = 0;
  var vShowAssignedWork = 0;
  var vShowRealWork = 0;
  var vShowLeftWork = 0;
  var vShowPlannedWork = 0;
  var vShowPriority = 0;
  var vShowPlanningMode = 0;
  var vSortArray=new Array();
  var vSplitted = false;
  var vDateInputFormat = "yyyy-mm-dd";
  var vDateDisplayFormat = "yyyy-mm-dd";
  var vNumUnits  = 0;
  var vCaptionType;
  var vDepId = 1;
  var vShowCriticalPath=0;
  var vTaskList     = new Array();  
  var vFormatArr  = new Array("day","week","month","quarter");
  var vQuarterArr   = new Array(1,1,1,2,2,2,3,3,3,4,4,4);
  var vMonthDaysArr = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
  var vMonthArr     = new Array(JSGantt.i18n("January"),JSGantt.i18n("February"),JSGantt.i18n("March"),
                                JSGantt.i18n("April"), JSGantt.i18n("May"),JSGantt.i18n("June"),
                                JSGantt.i18n("July"),  JSGantt.i18n("August"),  JSGantt.i18n("September"),
                                JSGantt.i18n("October"),JSGantt.i18n("November"),JSGantt.i18n("December"));
  
  var vMonthShortArr = new Array(JSGantt.i18n("JanuaryShort"),JSGantt.i18n("FebruaryShort"),JSGantt.i18n("MarchShort"),
                                 JSGantt.i18n("AprilShort"), JSGantt.i18n("MayShort"),JSGantt.i18n("JuneShort"),
                                 JSGantt.i18n("JulyShort"),  JSGantt.i18n("AugustShort"),  JSGantt.i18n("SeptemberShort"),
                                 JSGantt.i18n("OctoberShort"),JSGantt.i18n("NovemberShort"),JSGantt.i18n("DecemberShort"));
  var vGanttWidth=1000;
  var vStartDateView=new Date();
  var vEndDateView=new Date();
  var vBaseTopName="";
  var vBaseBottomName="";
  var showResourceComponentVersion="No";
  this.setFormatArr = function() {
    vFormatArr = new Array();
    for(var i = 0; i < arguments.length; i++) {vFormatArr[i] = arguments[i];}
    if(vFormatArr.length>4){vFormatArr.length=4;}
  };
  this.setShowRes  = function(pShow) { vShowRes  = pShow; };
  this.setShowDur  = function(pShow) { vShowDur  = pShow; };
  this.setShowComp = function(pShow) { vShowComp = pShow; };
  this.setShowValidatedWork = function(pShow) { vShowValidatedWork = pShow; };
  this.setShowAssignedWork = function(pShow) { vShowAssignedWork = pShow; };
  this.setShowRealWork = function(pShow) { vShowRealWork = pShow; };
  this.setShowLeftWork = function(pShow) { vShowLeftWork = pShow; };
  this.setShowPlannedWork = function(pShow) { vShowPlannedWork = pShow; };
  this.setShowPlanningMode = function(pShow) { vShowPlanningMode = pShow; };
  this.setShowPriority = function(pShow) { vShowPriority = pShow; };
  this.setSortArray = function(pSortArray) { vSortArray = pSortArray; };
  this.setSplitted = function(pSplitted) { vSplitted = pSplitted; };
  this.setShowStartDate = function(pShow) { vShowStartDate = pShow; };
  this.setShowEndDate = function(pShow) { vShowEndDate = pShow; };
  this.setDateInputFormat = function(pDate) { vDateInputFormat = pDate; };
  this.setDateDisplayFormat = function(pDate) { vDateDisplayFormat = pDate; };
  this.setCaptionType = function(pType) { vCaptionType = pType; };
  this.setBaseBottomName = function(pBaseBottomName) {vBaseBottomName = pBaseBottomName; };
  this.setBaseTopName = function(pBaseTopName) {vBaseTopName = pBaseTopName; };
  this.setFormat = function(pFormat, dontDraw){ 
    vFormat = pFormat; 
    this.clearDependencies();
    this.ClearGraph();
    if (! dontDraw) this.Draw(); 
  };
  this.setWidth = function (pWidth) {vGanttWidth=pWidth;};
  this.setStartDateView = function (pStartDateView) { vStartDateView=pStartDateView; };
  this.setEndDateView = function (pEndDateView) { vEndDateView=pEndDateView; };
  this.setShowCriticalPath = function (pShowCriticalPath) { vShowCriticalPath=pShowCriticalPath;};
  this.setColorBaselineUpper = function(pColorBaselineUpper) { vColorBaselineUpper=pColorBaselineUpper;};
  this.setColorBaselineBottom = function(pColorBaselineBottom) { vColorBaselineBottom=pColorBaselineBottom;};
  this.resetStartDateView = function () {
    if (dijit.byId('startDatePlanView')) {
      vStartDateView=dijit.byId('startDatePlanView').get('value');
    }
  };
  this.resetEndDateView = function () {
	    if (dijit.byId('endDatePlanView')) {
	      vEndDateView=dijit.byId('endDatePlanView').get('value');
	    }
	  };
  this.getShowRes  = function(){ return vShowRes; };
  this.getShowDur  = function(){ return vShowDur; };
  this.getShowComp = function(){ return vShowComp; };
  this.getShowValidatedWork = function(){ return vShowValidatedWork; };
  this.getShowAssignedWork = function(){ return vShowAssignedWork; };
  this.getShowRealWork = function(){ return vShowRealWork; };
  this.getShowLeftWork = function(){ return vShowLeftWork; };
  this.getShowPlannedWork = function(){ return vShowPlannedWork; };
  this.getShowPlanningMode = function(){ return vShowPlanningMode; };
  this.getShowPriority = function(){ return vShowPriority; };
  this.getSplitted = function(){ return vSplitted; };
  this.getShowStartDate = function(){ return vShowStartDate; };
  this.getShowEndDate = function(){ return vShowEndDate; };
  this.getSortArray = function(){ return vSortArray; };
  this.getDateInputFormat = function() { return vDateInputFormat; };
  this.getDateDisplayFormat = function() { return vDateDisplayFormat; };
  this.getCaptionType = function() { return vCaptionType; };
  this.getWidth = function() { return vGanttWidth; };
  this.getStartDateView = function() { return vStartDateView; };
  this.getEndDateView = function() { return vEndDateView; };
  this.getInitialStartDateView = function() { return vInitialStartDateView; };
  this.getFormat = function(){ return vFormat; };
  this.getBaseBottomName = function() { return vBaseBottomName; };
  this.getBaseTopName = function() { return vBaseTopName; };
  this.getShowCriticalPath = function () { return vShowCriticalPath;};
  this.getColorBaselineUpper = function() { return vColorBaselineUpper; };
  this.getColorBaselineBottom = function() { return vColorBaselineBottom; };
  this.CalcTaskXY = function () { 
    var vList = this.getList();
    var vTaskDiv;
    var vParDiv;
    var vLeft, vTop, vHeight, vWidth;
    for(var i = 0; i < vList.length; i++) {
      vID = vList[i].getID();
      vTaskDiv = JSGantt.findObj("taskbar_"+vID);
      vBarDiv  = JSGantt.findObj("bardiv_"+vID);
      vParDiv  = JSGantt.findObj("childgrid_"+vID);
      if(vBarDiv) {
        vList[i].setStartX( vBarDiv.offsetLeft );
        vList[i].setEndX( vBarDiv.offsetLeft + vBarDiv.offsetWidth );
        if (!vParDiv && vList[i].getMile() && dojo.byId('objectClassManual').value=='PortfolioPlanning') {
          idPrarent=vTaskList[i].getParent();
          vParDiv  = JSGantt.findObj("childgrid_"+idPrarent);
        }
        if (vParDiv) {
          //if (vList[i].getMile() && dojo.byId('objectClassManual').value!='PortfolioPlanning') {
          if (vList[i].getMile() ) {
            vList[i].setEndY( vParDiv.offsetTop+vBarDiv.offsetTop+12 );
            vList[i].setStartY( vParDiv.offsetTop+vBarDiv.offsetTop+12 );
          } else {
           // if(dojo.byId('objectClassManual').value!='PortfolioPlanning'){
              vList[i].setEndY( vParDiv.offsetTop+vBarDiv.offsetTop+6 );
              vList[i].setStartY( vParDiv.offsetTop+vBarDiv.offsetTop+6 );
           // }
          }
        }
      };
    };
  };
  
  /* Does not work : cannot remove node, always referenced */
   this.ClearGraph = function () {
	  var vList = this.getList();
	  var vBarDiv;
	  for(var i = 0; i < vList.length; i++) {
		  vID = vList[i].getID();
		  vBarDiv  = JSGantt.findObj("bardiv_"+vID);
		  if(vBarDiv) {
			  dojo.query("#bardiv_"+vID).orphan();
		  }
	  }
  };
  this.AddTaskItem = function(value) {
    vTaskList.push(value);
  };
  this.getList   = function() { return vTaskList; };
  this.clearDependencies = function(temp) {
	var parent = JSGantt.findObj('rightGanttChartDIV');
	var depLine;
    var vMaxId = vDepId;
    for (var i=1; i<vMaxId; i++ ) {
      depLine = JSGantt.findObj( ((temp)?"temp":"")+"line"+i);
      if (depLine) { parent.removeChild(depLine); }
    };
    vDepId = 1;
  };
  
  this.sLine = function(x1,y1,x2,y2,color,temp,keyDep,dependencyKey) {
    vLeft = Math.min(x1,x2);
    vTop  = Math.min(y1,y2);
    vWid  = Math.abs(x2-x1) + 1;
    vHgt  = Math.abs(y2-y1) + 1;
    vDoc = JSGantt.findObj('rightGanttChartDIV');
    var oDiv = document.createElement('div');
    oDiv.id = ((temp)?"temp":"")+"line"+vDepId++;
    oDiv.addEventListener("contextmenu", dependencyRightClick,true);
    oDiv.addEventListener("click", dependencyRightClick,true);
    oDiv.style.position = "absolute";
    oDiv.style.margin = "0px";
    oDiv.style.padding = "0px";
    oDiv.style.overflow = "hidden";
    oDiv.style.border = "0px";
    oDiv.setAttribute('dependencyid',dependencyKey);
    if (color==vCriticalPathColor) oDiv.style.zIndex = 60000; else oDiv.style.zIndex = 50000;
    oDiv.style.cursor = "pointer";
    oDiv.className="dependencyLine"+keyDep;
    if (!color) color="#000000";
    
    //color="#000000";
    oDiv.style.backgroundColor = color;
    oDiv.style.left = vLeft + "px";
    oDiv.style.top = vTop + "px";
    oDiv.style.width = vWid + "px";
    oDiv.style.height = vHgt + "px";
    oDiv.style.visibility = "visible";
    oDiv.addEventListener('mouseenter', highlightDependency, false);
    oDiv.addEventListener('mouseout', outHighlightDependency, false);
    vDoc.appendChild(oDiv);
  };
  /*this.dLine = function(x1,y1,x2,y2,color) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var x = x1;
    var y = y1;
    var n = Math.max(Math.abs(dx),Math.abs(dy));
    dx = dx / n;
    dy = dy / n;
    for (var i = 0; i <= n; i++ ) {
      vx = Math.round(x); 
      vy = Math.round(y);
      if (!color) color="#000000";
      this.sLine(vx,vy,vx,vy,color);
      x += dx;
      y += dy;
    };
  };*/
  this.drawDependency =function(x1,y1,x2,y2,color,temp,keyDep,dependencyKey,vType) { // For compatibility
    if (vType=='E-E') {
      this.drawDependencyEE(x1,y1,x2,y2,color,temp,keyDep,dependencyKey);
    } else if (vType=='S-S') {
      this.drawDependencySS(x1,y1,x2,y2,color,temp,keyDep,dependencyKey);
    } else  {
      this.drawDependencyES(x1,y1,x2,y2,color,temp,keyDep,dependencyKey);
    }
  }
  this.drawDependencyES =function(x1,y1,x2,y2,color,temp,keyDep,dependencyKey) {
    if (x1 <= x2+4) {
      if (y1 <= y2) {
        this.sLine(x1,y1,x2+4,y1,color,temp,keyDep,dependencyKey);
        this.sLine(x2+4,y1,x2+4,y2-6,color,temp,keyDep,dependencyKey);
        this.sLine(x2+1, y2-9, x2+7, y2-9,color,temp,keyDep,dependencyKey);
        this.sLine(x2+2, y2-8, x2+6, y2-8,color,temp,keyDep,dependencyKey);
        this.sLine(x2+3, y2-7, x2+5, y2-7,color,temp,keyDep,dependencyKey);
      } else {
        this.sLine(x1,y1,x2+4,y1,color,temp,keyDep,dependencyKey);
        this.sLine(x2+4,y1,x2+4,y2+6,color,temp,keyDep,dependencyKey);
        this.sLine(x2+1, y2+9, x2+7, y2+9,color,temp,keyDep,dependencyKey);
        this.sLine(x2+2, y2+8, x2+6, y2+8,color,temp,keyDep,dependencyKey);
        this.sLine(x2+3, y2+7, x2+5, y2+7,color,temp,keyDep,dependencyKey);
      }
    } else {
      if (y1 <= y2) {
        this.sLine(x1,y1,x1+4,y1,color,temp,keyDep,dependencyKey);
        this.sLine(x1+4,y1,x1+4,y2-8,color,temp,keyDep,dependencyKey);
        this.sLine(x1+4,y2-8,x2-8,y2-8,color,temp,keyDep,dependencyKey);
        this.sLine(x2-8,y2-8,x2-8,y2,color,temp,keyDep,dependencyKey);
        this.sLine(x2-8,y2,x2,y2,color,temp,keyDep,dependencyKey);
        this.sLine(x2-3,y2+3,x2-3,y2-3,color,temp,keyDep,dependencyKey);
        this.sLine(x2-2,y2+2,x2-2,y2-2,color,temp,keyDep,dependencyKey);
        this.sLine(x2-1,y2+1,x2-1,y2-1,color,temp,keyDep,dependencyKey);
      } else {
    	this.sLine(x1,y1,x1+4,y1,color,temp,keyDep,dependencyKey);
        this.sLine(x1+4,y1,x1+4,y2+8,color,temp,keyDep,dependencyKey);
        this.sLine(x1+4,y2+8,x2-8,y2+8,color,temp,keyDep,dependencyKey);
        this.sLine(x2-8,y2+8,x2-8,y2,color,temp,keyDep,dependencyKey);
        this.sLine(x2-8,y2,x2,y2,color,temp,keyDep,dependencyKey);
        this.sLine(x2-3,y2+3,x2-3,y2-3,color,temp,keyDep,dependencyKey);
        this.sLine(x2-2,y2+2,x2-2,y2-2,color,temp,keyDep,dependencyKey);
        this.sLine(x2-1,y2+1,x2-1,y2-1,color,temp,keyDep,dependencyKey);
      }
    }
  };
  this.drawDependencySS =function(x1,y1,x2,y2,color,temp,keyDep,dependencyKey) {
    if (x1 <= x2-4) {
      this.sLine(x1,y1,x1-4,y1,color,temp,keyDep,dependencyKey);
      this.sLine(x1-4,y1,x1-4,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x1-4,y2,x2,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x2-3,y2+3,x2-3,y2-3,color,temp,keyDep,dependencyKey);
      this.sLine(x2-2,y2+2,x2-2,y2-2,color,temp,keyDep,dependencyKey);
      this.sLine(x2-1,y2+1,x2-1,y2-1,color,temp,keyDep,dependencyKey);
    } else {
      this.sLine(x1,y1,x2-8,y1,color,temp,keyDep,dependencyKey);
      this.sLine(x2-8,y1,x2-8,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x2-8,y2,x2,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x2-3,y2+3,x2-3,y2-3,color,temp,keyDep,dependencyKey);
      this.sLine(x2-2,y2+2,x2-2,y2-2,color,temp,keyDep,dependencyKey);
      this.sLine(x2-1,y2+1,x2-1,y2-1,color,temp,keyDep,dependencyKey);
    }
  };
  this.drawDependencyEE =function(x1,y1,x2,y2,color,temp,keyDep,dependencyKey) {
    if (x1 >= x2+4) {
      this.sLine(x1,y1,x1+4,y1,color,temp,keyDep,dependencyKey);
      this.sLine(x1+4,y1,x1+4,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x1+4,y2,x2,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x2+3,y2+3,x2+3,y2-3,color,temp,keyDep,dependencyKey);
      this.sLine(x2+2,y2+2,x2+2,y2-2,color,temp,keyDep,dependencyKey);
      this.sLine(x2+1,y2+1,x2+1,y2-1,color,temp,keyDep,dependencyKey);
    } else {
      this.sLine(x1,y1,x2+8,y1,color,temp,keyDep,dependencyKey);
      this.sLine(x2+8,y1,x2+8,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x2+8,y2,x2,y2,color,temp,keyDep,dependencyKey);
      this.sLine(x2+3,y2+3,x2+3,y2-3,color,temp,keyDep,dependencyKey);
      this.sLine(x2+2,y2+2,x2+2,y2-2,color,temp,keyDep,dependencyKey);
      this.sLine(x2+1,y2+1,x2+1,y2-1,color,temp,keyDep,dependencyKey);
    }
  };
  this.DrawDependencies = function () {
 //   if (dojo.byId('portfolio')) return;
    this.CalcTaskXY();
    this.clearDependencies();
    var vList = this.getList();
    for(var i = 0; i < vList.length; i++) {
      vDepend = vList[i].getDepend();
      if(vDepend) {
        var vDependStr = vDepend + '';
        var vDepList = vDependStr.split(',');
        var n = vDepList.length;
        for(var k=0;k<n;k++) {
          var depListSplit=vDepList[k].split("#");
          dependencyKey=depListSplit[1];
          dojo.byId("rightClickDependencyId").value=depListSplit[1];
          var vTask = this.getArrayLocationByID(depListSplit[0]);
          var vType="E-S";
          if (depListSplit[3]) {
            vType=depListSplit[3];
          }
          var color='#000000';          
          if(vTask!=null && vList[vTask].getVisible()==1 && vList[i].getVisible()==1) {
            if (dojo.byId('portfolio')&& vList[i].getMile() &&  vList[vTask].getMile()) { // PBER
              var projDep1=vList[vTask].getIdProject(vList);
              var projDep2=vList[i].getIdProject(vList);
              if (projDep1 && projDep2 && projDep1==projDep2) continue;
            }
            if (vList[vTask].getIsOnCriticalPath()=='1' && vList[i].getIsOnCriticalPath()=='1') color=vCriticalPathColor;
            if (g.getEndDateView() && vList[vTask].getEnd()>g.getEndDateView() && vList[i].getStart()>g.getEndDateView()) continue;
            if (vType=='S-S' || (vList[vTask].getMile() && vType!='E-E')) {
              this.drawDependencySS(vList[vTask].getStartX()-1,vList[vTask].getStartY(),vList[i].getStartX()-1,
                  vList[i].getStartY(),color,null,'_'+i+'_'+k,dependencyKey);
            } else if (vType=='E-S') {
              if (vList[i].getMile())
                this.drawDependencyES(vList[vTask].getEndX(),vList[vTask].getEndY(),vList[i].getStartX()+2,
                    vList[i].getStartY(),color,null,'_'+i+'_'+k,dependencyKey);
              else
                this.drawDependencyES(vList[vTask].getEndX(),vList[vTask].getEndY(),vList[i].getStartX()-1,
                            vList[i].getStartY(),color,null,'_'+i+'_'+k,dependencyKey);
            } else  if (vType=='E-E') {
              this.drawDependencyEE(vList[vTask].getEndX(),vList[vTask].getEndY(),vList[i].getEndX()-1,
                  vList[i].getEndY(),color,null,'_'+i+'_'+k,dependencyKey);
            }
          }
        }
      }
    }
  };
  this.getArrayLocationByID = function(pId)  {
    var vList = this.getList();
    for(var i = 0; i < vList.length; i++) {
      if(vList[i].getID()==pId) {
        return i;
      }
    }
  };
  this.Draw = function(){
    window.top.showWait();
    var vMaxDate = new Date();
    var vMinDate = new Date();
    var vDefaultMinDate = new Date();
    var vTmpDate = new Date();
    var vNxtDate = new Date();
    var vCurrDate = new Date();
    var vTaskLeft = 0;
    var vTaskRight = 0;
    var vNumCols = 0;
    var vID = 0;
    var VId = 0;
    var vMainTable = "";
    var vLeftTable = "";
    var vRightTable = "";
    var vDateRowStr = "";
    var vItemRowStr = "";
    var vColWidth = 0;
    var vColUnit = 0;
    var vChartWidth = 0;
    var vNumDays = 0;
    var vNumUnits = 1;
    var vDayWidth = 0;
    var vStr = "";
    var vRowType="";
    var vIconWidth=24;
    var vNameWidth = 300;  
    var vStatusWidth = 70;
    var vResourceWidth = 90;
    var vWorkWidth = 70;
    var vDateWidth = 80;
    var vDurationWidth = 60;
    var vProgressWidth = 50;
    var vPriorityWidth=50;
    var vPlanningModeWidth=150;
    var vWidth=this.getWidth();
    var sortArray=this.getSortArray();
    var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
    var vLeftWidth = vIconWidth+getPlanningFieldWidth('Name',planningType)+2;
    //CHANGE qCazelles - GANTT (Correction)
    //ADD
    
    
//    if( dojo.byId('versionsPlanning')&&(dojo.byId('showRessourceComponentVersion').checked && (dojo.byId('listDisplayComponentVersionActivity').checked || dojo.byId('listDisplayProductVersionActivity').checked))){
//      showResourceComponentVersion='Yes';
//    }
    if( dojo.byId('versionsPlanning')&&
       (dijit.byId('showRessourceComponentVersion').get('value')=='on' && 
       (dijit.byId('listDisplayComponentVersionActivity').get('value')=='on' || 
        dijit.byId('listDisplayProductVersionActivity').get('value')=='on'))){
      showResourceComponentVersion='Yes';
    }
    
    
    if (!dojo.byId('versionsPlanning') && !dojo.byId('contractGantt')) {
    //END ADD
      for (var iSort=0;iSort<sortArray.length;iSort++) {
        if(sortArray[iSort] === undefined)continue;
        var field=sortArray[iSort];
        if (field.substr(0,6)=='Hidden') field=field.substr(6);
        var showField=getPlanningFieldShow(field,planningType);
        var fieldWidth=getPlanningFieldWidth(field,planningType);
        if (showField && field!='Name') vLeftWidth+=1+fieldWidth;
      }
    }
  //florent ticket 4397
    else if (dojo.byId('contractGantt')){
      for (var iSort=0;iSort<sortArray.length;iSort++) {
          if(sortArray[iSort] === undefined)continue;
          var field=sortArray[iSort];
          if (field.substr(0,6)=='Hidden') field=field.substr(6);
          var showField=getPlanningFieldShow(field,planningType);
          var fieldWidth=getPlanningFieldWidth(field,planningType);
          if (field!='Name' && showField && (field=='StartDate' || field=='EndDate' ||field=='Resource' || field=='IdStatus' ||  field=='Duration' || field=='ObjectType' || field=='ExterRes'  ) ) vLeftWidth+=1+fieldWidth;
        }
    }
    else if (dojo.byId('versionsPlanning')){
      for (var iSort=0;iSort<sortArray.length;iSort++) {
        if(sortArray[iSort] === undefined)continue;
        var field=sortArray[iSort];
        if (field.substr(0,6)=='Hidden') field=field.substr(6);
        var fieldWidth=getPlanningFieldWidth(field,planningType);
        if (field!='Name' && (field=='StartDate' || field=='EndDate' || field=='IdStatus'  || field=='Id' || field=='Duration' || field=='Priority' || field=='Type' || field=='Progress' || (field.slice(-4) == 'Work' && field.substr(0,6)!='hidden')|| (field=='Resource' && showResourceComponentVersion=='Yes'))) vLeftWidth+=1+fieldWidth;
      }
    }
    else {
      for (var iSort=0;iSort<sortArray.length;iSort++) {
          if(sortArray[iSort] === undefined)continue;
          var field=sortArray[iSort];
          if (field.substr(0,6)=='Hidden') field=field.substr(6);
          var fieldWidth=getPlanningFieldWidth(field,planningType);
          if (field!='Name' && (field=='StartDate' || field=='EndDate' || field=='IdStatus'  || (field=='Resource' && showResourceComponentVersion=='Yes')) || field=='Responsible' || field=='RespInitial') vLeftWidth+=1+fieldWidth;
        }
    }
    //END ADD
    //END CHANGE qCazelles - GANTT (Correction)
    
    var vRightWidth = vWidth - vLeftWidth - 18;
    var ffSpecificHeight=(dojo.isFF<16)?' class="ganttHeight"':'';
    var vLeftTable="";
    var vRightTable="";
    var specificRightClickDiv="";
    var vTopRightTable="";
    if(vTaskList.length > 0) {
      JSGantt.processRows(vTaskList, 0, -1, 1, 1);
      vMinDate = JSGantt.getMinDate(vTaskList, vFormat,g.getStartDateView());
      vDefaultMinDate = JSGantt.getMinDate(vTaskList, vFormat);
      vMaxDate = JSGantt.getMaxDate(vTaskList, vFormat, g.getEndDateView());
      vDefaultMaxDate = JSGantt.getMaxDate(vTaskList, vFormat);
      if(vFormat == 'day') {
        vColWidth = 18;
        vColUnit = 1;
      } else if(vFormat == 'week') {
        vColWidth = 50;
        vColUnit = 7;
      } else if(vFormat == 'month') {
        vColWidth = 90;
        vColUnit = 30.5;
      } else if(vFormat == 'quarter') {
        vColWidth = 20;
        vColUnit = 30.5;
      }
      vMinDate.setHours(0, 0, 0, 0);
      vMaxDate.setHours(23, 59, 59, 0);
      //must remove 1 hour in case of Winter / Summer Time Change Ticket #1550
      vNumDays = (Date.parse(vMaxDate) - Date.parse(vMinDate) - 1000*60*60) / ( 24 * 60 * 60 * 1000); 
      vNumDays = Math.ceil(vNumDays);
      vNumUnits = vNumDays / vColUnit;
      vNumUnits=Math.round(vNumUnits);
      vChartWidth = (vNumUnits * (vColWidth + 1))+1;
      vDayWidth = (vColWidth / vColUnit) + (1/vColUnit);
// LEFT ===========================================================
      vNameWidth=getPlanningFieldWidth('Name',planningType);
      vLeftTable = '<DIV class="scrollLeftTop" id="leftsideTop" style="width:' + vLeftWidth + 'px;">' 
      +'<TABLE jsId="topSourceTable" id="topSourceTable" class="ganttTable"><TBODY>'
        +'<TR class="ganttHeight" style="height:24px">'
        +'<TD class="ganttLeftTopLine" colspan="2" style="width: ' + (vNameWidth+vIconWidth) + 'px;"><span class="nobr">';
      vLeftTable+=JSGantt.drawFormat(vFormatArr, vFormat, vGanttVar,'top');
      vLeftTable+= '</span></TD>'; 

      //CHANGE qCazelles - GANTT (Correction)
      //ADD
      if (!dojo.byId('versionsPlanning') && !dojo.byId('contractGantt')) {
      //END ADD
        for (iSort=0;iSort<sortArray.length;iSort++) {
          if(sortArray[iSort] === undefined)continue;
          var field=sortArray[iSort];
          if (field.substr(0,6)=='Hidden') field=field.substr(6);
          var showField=getPlanningFieldShow(field,planningType);
          var fieldWidth=getPlanningFieldWidth(field,planningType);
          if(showField && field!='Name') { 
            vLeftTable += '<TD class="ganttLeftTopLine" style="width: ' + fieldWidth + 'px;"></TD>' ;
          }
        }
        var columnNameMinWidth = getPlanningFieldMinWidth('Name',planningType);
        vLeftTable += '</TR><TR dojoType="dojo.dnd.Source" withHandles="true" jsId="dndPlanningHeaderColumn" id="dndPlanningHeaderColumn"'
          +'dndType="planningHeaderColumn" data-dojo-props="accept: [\'planningHeaderColumn\']" class="ganttHeight" style="height:24px">'
          +'<TD class="ganttLeftTitle" style="width:22px;"><div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:22px; z-index:1000;" class="namePartgroup"><span class="nobr">&nbsp;</span></div></TD>'
          +'<TD id="jsGanttHeaderTDName" class="ganttLeftTitle ganttAlignLeft ganttNoLeftBorder" style="position:relative;width: ' + vNameWidth + 'px;" oncontextmenu="tooglePlanningColumnList()">'
          +'<div id="jsGanttHeaderName" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:' + vNameWidth + 'px; z-index:1000;" class="namePartgroup">'
          +'<span class="nobr">'+(JSGantt.i18n('colTask')==''?'&nbsp;':JSGantt.i18n('colTask'))+'</span></div>'
          +'<div id="NameColumnResizer" style="width:10px !important" class="planningColumnResizer" onmouseenter="if(!isResizingPlanningHeaderColumn)handleResizePlanningHeaderColumn(\'Name\','+columnNameMinWidth+', 1);"></div>'
          +'<div id="NameColumnResizerIndicator" class="planningColumnResizerIndicator" style="display:none;"></div>'
          +'</TD>' ;        
        
        for (var iSort=0;iSort<sortArray.length;iSort++) {
          if(sortArray[iSort] === undefined)continue;
          var field=sortArray[iSort];
          if (field.substr(0,6)=='Hidden') field=field.substr(6);
          var nameField=field;
          var showField=getPlanningFieldShow(field,planningType);
          var fieldWidth=getPlanningFieldWidth(field,planningType);
          var handleDndWidth = fieldWidth-10;
          if(showField && field!='Name') {
            var columnMinWidth = getPlanningFieldMinWidth(field,planningType);
            if(field=='IdOverallProgress') nameField='Progress';
            if(field=='ValidatedStartDate') nameField='ValidatedStart';
            if(field=='ValidatedEndDate') nameField='ValidatedEnd';
            if(field=='UnitProgress')nameField='UnitProgressShort';
            vLeftTable += '<TD id="jsGanttHeaderTD'+field+'" class="dojoDndItem planningHeaderColumn ganttLeftTitle" dndtype="planningHeaderColumn" style="position:relative;width: ' + fieldWidth + 'px;padding:unset !important;" nowrap oncontextmenu="tooglePlanningColumnList()">'
              +'<span class="dojoDndHandle handleCursor planningColumnDndHandle" style="width:'+handleDndWidth+'px !important"></span>'
              +'<div id="jsGanttHeader'+field+'" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:' + fieldWidth + 'px; z-index:1000;" class="namePartgroup">'
              +'<span class="nobr">'+ JSGantt.i18n( ('col'+nameField).replace('Work','')) + '</span>'
              //+'<div class="columnHandle" onmousedown="startResizeJsHeader(event,\''+field+'\');"  onmouseup="stopResizeJsHeader(event);" onmouseleave="stopResizeJsHeader(event);" onmousemove="resizeJsHeader(event);">&nbsp;</div>'
              +'</div>'
              +'<div id="'+field+'ColumnResizer" style="width:10px !important" class="planningColumnResizer" onmouseenter="if(!isResizingPlanningHeaderColumn)handleResizePlanningHeaderColumn(\''+field+'\','+columnMinWidth+', 1);"></div>'
              +'<div id="'+field+'ColumnResizerIndicator" class="planningColumnResizerIndicator" style="display:none;"></div>'
              +'</TD>' ;
          }
        }
    //ADD
      }
    //florent ticket 4397
      else if (dojo.byId('contractGantt')) {
        for (iSort=0;iSort<sortArray.length;iSort++) {
          if(sortArray[iSort] === undefined)continue;
          var field=sortArray[iSort];
          if (field.substr(0,6)=='Hidden') field=field.substr(6);
          var showField=getPlanningFieldShow(field,planningType);
          var fieldWidth=getPlanningFieldWidth(field,planningType);
          if (field!='Name' && showField && (field=='StartDate' || field=='EndDate' ||field=='Resource' || field=='IdStatus' ||  field=='Duration' || field=='ObjectType' || field=='ExterRes'  ) ){
            vLeftTable += '<TD class="ganttLeftTopLine" style="width: ' + fieldWidth + 'px;"></TD>' ;
          }
        }
        vLeftTable += '</TR><TR class="ganttHeight" style="height:24px">'
          +'<TD class="ganttLeftTitle" style="width:22px;"><div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:22px; z-index:1000;" class="namePartgroup"><span class="nobr">&nbsp;</span></div></TD>'
          +'<TD class="ganttLeftTitle ganttAlignLeft ganttNoLeftBorder" style="width: ' + vNameWidth + 'px;"><div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:' + vNameWidth + 'px; z-index:1000;" class="namePartgroup"><span class="nobr">'
          +(JSGantt.i18n('colTask')==''?'&nbsp;':JSGantt.i18n('colTask'))+'</span></div></TD>' ;        
        
        for (var iSort=0;iSort<sortArray.length;iSort++) {
          if(sortArray[iSort] === undefined)continue;
          var field=sortArray[iSort];
          if (field.substr(0,6)=='Hidden') field=field.substr(6);
          var showField=getPlanningFieldShow(field,planningType);
          var fieldWidth=getPlanningFieldWidth(field,planningType);
          if (field!='Name' && showField && (field=='StartDate' || field=='EndDate' ||field=='Resource' || field=='IdStatus' ||  field=='Duration' || field=='ObjectType' || field=='ExterRes'  ) ){
            if(field=='ExterRes' && dojo.byId('objectGantt').value=='SupplierContract'){
              field='IdProvider';
            }else if(field=='ExterRes' && dojo.byId('objectGantt').value=='ClientContract'){
              field='IdClient';
            }
            vLeftTable += '<TD id="jsGanttHeaderTD'+field+'" class="ganttLeftTitle" style="position:relative;width: ' + fieldWidth + 'px;max-width: ' + fieldWidth + 'px;overflow:hidden" nowrap>'
              +'<div id="jsGanttHeader'+field+'" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:' + fieldWidth + 'px; z-index:1000;" class="namePartgroup">';
            vLeftTable +='<span class="nobr">'+ JSGantt.i18n( ('col'+field).replace('Work','')) + '</span>';
            vLeftTable +='</div></TD>' ;
          }
        }
    }else {
        for (iSort=0;iSort<sortArray.length;iSort++) {
            if(sortArray[iSort] === undefined)continue;
            var field=sortArray[iSort];
            if (field.substr(0,6)=='Hidden') field=field.substr(6);
            var fieldWidth=getPlanningFieldWidth(field,planningType);
            if(field!='Name' && (field=='StartDate' || field=='EndDate' || field=='IdStatus'   || (field=='Resource' && showResourceComponentVersion=='Yes' ) || (dojo.byId('versionsPlanning') && (field == 'Id' || field == 'Type' || field == 'Progress' || field=='Duration' || field=='Priority' || ( field.slice(-4) == 'Work' && field.substr(0,6)!='hidden'))))) {
              vLeftTable += '<TD class="ganttLeftTopLine" style="width: ' + fieldWidth + 'px;"></TD>' ;
            }
          }
          vLeftTable += '</TR><TR class="ganttHeight" style="height:24px">'
            +'<TD class="ganttLeftTitle" style="width:22px;"><div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:22px; z-index:1000;" class="namePartgroup"><span class="nobr">&nbsp;</span></div></TD>'
            +'<TD class="ganttLeftTitle ganttAlignLeft ganttNoLeftBorder" style="width: ' + vNameWidth + 'px;"><div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:' + vNameWidth + 'px; z-index:1000;" class="namePartgroup"><span class="nobr">'
            +(JSGantt.i18n('colTask')==''?'&nbsp;':JSGantt.i18n('colTask'))+'</span></div></TD>' ;        
          
          for (var iSort=0;iSort<sortArray.length;iSort++) {
            if(sortArray[iSort] === undefined)continue;
            var field=sortArray[iSort];
            if (field.substr(0,6)=='Hidden') field=field.substr(6);
            var fieldWidth=getPlanningFieldWidth(field,planningType);
            if(field!='Name' && (field=='StartDate' || field=='EndDate' || field=='IdStatus'  || (field=='Resource' && showResourceComponentVersion=='Yes') || (dojo.byId('versionsPlanning') && (field == 'Id' || field == 'Type' || field == 'Progress' || field=='Duration' || field=='Priority' ||  (field.slice(-4) == 'Work' && field.substr(0,6)!='hidden' ))))) {
              vLeftTable += '<TD id="jsGanttHeaderTD'+field+'" class="ganttLeftTitle" style="position:relative;width: ' + fieldWidth + 'px;max-width: ' + fieldWidth + 'px;overflow:hidden" nowrap>'
                +'<div id="jsGanttHeader'+field+'" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width:' + fieldWidth + 'px; z-index:1000;" class="namePartgroup">'
                +'<span class="nobr">'+ JSGantt.i18n( ('col'+field).replace('Work','')) + '</span>'
                //+'<div class="columnHandle" onmousedown="startResizeJsHeader(event,\''+field+'\');"  onmouseup="stopResizeJsHeader(event);" onmouseleave="stopResizeJsHeader(event);" onmousemove="resizeJsHeader(event);">&nbsp;</div>'
                +'</div></TD>' ;
            }
          }
      }
      //END ADD
      //END CHANGE qCazelles - GANTT (Correction)
      var planningPage=dojo.byId('objectClassManual').value;
      vLeftTable += '</TR>';
      vLeftTable += '</TBODY></TABLE></DIV>'
        +'<DIV class="scrollLeft" id="leftside" style="z-index:-1;position:relative;width:' + vLeftWidth + 'px;">'
        +'<form dojoType="dijit.form.Form" id="planningListForm" name="planningListForm" action="" method="post">'
        +'<input type="hidden" id="idProjectRow" name="idProjectRow" value="">'
        + ( (dojo.ifFF)?'<div style="height:1px"></div>':'')
        +'<TABLE dojoType="dojo.dnd.Source" withHandles="true" jsId="dndSourceTable" id="dndSourceTable" type="xxx"'
        +'class="ganttTable"  ><TBODY>';
      // =========================================== TREAT ALL LINES TO DISPLAY ON GANTT ================================================= 
      for(var i = 0; i < vTaskList.length; i++) {
        if(!(planningPage=='PortfolioPlanning' && vTaskList[i].getMile())){
          if( vTaskList[i].getGroup()) {
            vRowType = "group";
          } else if( vTaskList[i].getMile()){
            vRowType  = "mile";
          } else {
            vRowType  = "row";
          }
          vID = vTaskList[i].getID();
          var invisibleDisplay=(vTaskList[i].getVisible() == 0)?'style="display:none"':'';
          var background = (isColorBlind == 'YES')?vTaskList[i].getActivityBlindColor():vTaskList[i].getActivityColor();
          var idProject = vTaskList[i].getProjectId();
          
          var colorAct = false;
          if(dojo.byId('showColorActivity').checked){
            colorAct = true;
          }
          if(dijit.byId('showColorActivity').get('value')=='on'){
            colorAct = true;
          }
          if(colorAct) {
            vLeftTable += '<TR id=child_'+vID+' dndType="planningTask" class="dojoDndItem ganttTask' + vRowType + '" ' 
            + invisibleDisplay + ' style="height:21px;background:#'+background+';color:'+getForeColor('#'+background)+'">' ;
          
          } else {
            vLeftTable += '<TR id=child_'+vID+' dndType="planningTask" class="dojoDndItem ganttTask' + vRowType + '" ' 
            + invisibleDisplay + ' style="height:21px;">' ;
          
          }
          vLeftTable += '  <TD class="ganttName" style="width:'+vIconWidth+'px">';
          var iconName = vTaskList[i].getIconClass();
          
          if (vTaskList[i].getIconClass() == 'ActivityhasChild') {
           iconName = 'Activity';
          }
          if (vTaskList[i].getIconClass() == 'ComponentVersionhasChild') {
            iconName = 'ComponentVersion';
          }
          else if (vTaskList[i].getIconClass() == 'ProductVersionhasChild') {
            iconName = 'ProductVersion';
          }
          else if (vTaskList[i].getIconClass() == 'SupplierContracthasChild') {
            iconName = 'SupplierContract';
          }else if (vTaskList[i].getIconClass() == 'ClientContracthasChild') {
            iconName = 'SupplierContract';
          }
          if (vTaskList[i].getClass() == 'ProductVersionhasChild' || vTaskList[i].getClass() == 'ComponentVersionhasChild'){
            dateEndMax = new Date(vTaskList[i].getEnd());
            dateEnd = new Date(vTaskList[i].getEndInit());
            dateStarMin = new Date(vTaskList[i].getStart())

            dateEndMax.setHours(23, 59, 59, 0);
            dateEnd.setHours(23, 59, 59, 0);
            dateStarMin.setHours(0,0,0);

            diffEndStartMin = dateEnd.getTime() - dateStarMin.getTime();
            diffEndMaxStartMin = dateEndMax.getTime() - dateStarMin.getTime();

            vTaskList[i].setCompVal((diffEndStartMin/diffEndMaxStartMin)*100)
            if (dateEndMax > dateEnd){
              vTaskList[i].setColor('BB5050') // set to red.
            }
          }
        //florent ticket 4397
          if (planningPage=='ResourcePlanning' || planningPage=='VersionsPlanning' || planningPage=='ContractGantt') {
            vLeftTable += '<span class="">'
              + '<table><tr><td>&nbsp;</td><td class="ganttIconBackground">'
              + '<div class="icon'+iconName+' icon'+iconName+'16 iconSize16" style="width:16px;height:16px;" >&nbsp;</div>'
              + '</td></tr></table>'
              +'</span>';
          } else {
            vLeftTable += 
                '<span class="dojoDndHandle handleCursor">'
              + ' <table><tr>'
              + '  <td class="ganttIconBackground">'
              + '   <div class="icon'+ iconName +'16 icon'+ iconName +' iconSize16" style="width:16px;height:16px;" >&nbsp;</div>'
              + '  </td>'
              + '  <td><img style="width:8px" src="css/images/iconDrag.gif" /></td>'
              + ' </tr></table>'
              + '</span>';
          }
          vLeftTable += '</TD>'
            +'<TD class="ganttName ganttAlignLeft" style="width: ' + vNameWidth + 'px;" nowrap title="' + vTaskList[i].getNameTitle() + '" >';
          if( vTaskList[i].getMile() && dojo.byId('contractGantt')){
            vLeftTable+='<div class="ganttLeftMileContract" style="width:'+(vLeftWidth-25)+'px;" ';
          }else{
            var idProject = vTaskList[i].getProjectId();
            vLeftTable+='<div class="ganttLeftHover" id="ganttLeftHover_'+vID+'" style="width:'+(vLeftWidth-25)+'px;" ';
            vLeftTable+=' oncontextmenu=event.preventDefault();JSGantt.openPlanningContextMenu("'+vID+'","'+vTaskList[i].getId()+'","' + vTaskList[i].getClass() + '",\'' + idProject + '\');';
            vLeftTable+=' onclick="JSGantt.planningRowClickAction(\''+vID+'\',\'' + vTaskList[i].getId()+ '\', \'' + vTaskList[i].getClass() + '\',\'' + idProject + '\');"';
          }
          vLeftTable+=' onMouseover=JSGantt.ganttMouseOver("'+vID+'","left","' + vRowType + '")'
              + ' onMouseout=JSGantt.ganttMouseOut("'+vID+'","left","' + vRowType + '")>&nbsp;</div>';
          vLeftTable += '<div style="position:relative;width: ' + vNameWidth + 'px;height:100%;">';
          var levl=vTaskList[i].getLevel();
          var levlWidth = (levl-1) * 16;
          var background = (isColorBlind == 'YES')?vTaskList[i].getActivityBlindColor():vTaskList[i].getTaskStatusColor();
          vLeftTable +='<table style="margin-left:3px;height:100%;"><tr><td id="ganttEditButton_'+vID+'">';
          vLeftTable += '<div style="width:' + levlWidth + 'px;">';
          if (vTaskList[i].getGroup() 
          && vTaskList[i].getClass() != 'ProductVersionhasChild' &&  vTaskList[i].getClass() != 'ComponentVersionhasChild' 
          //&&  vTaskList[i].getClass() != 'SupplierContracthasChild' &&  vTaskList[i].getClass() != 'ClientContracthasChild' 
          &&  vTaskList[i].getClass() != 'ActivityhasChild') {
            vLeftTable += '<div style="margin-left:3px;width:8px;">&nbsp</div>';
          } else if(vTaskList[i].getGroup() && (vTaskList[i].getClass() == 'ProductVersionhasChild' ||  vTaskList[i].getClass() == 'ComponentVersionhasChild')){
            vLeftTable += '<div style="border-radius:2px;margin-left: '+levlWidth+'px;margin-top: 1px;width: 12px;height: 12px;background:#'+background+'">&nbsp</div>';
          }        
          vLeftTable += '</div>';
          vLeftTable +='</td><td>';
          if( vTaskList[i].getGroup()) {
            if( vTaskList[i].getOpen() == 1) {
              vLeftTable += '<div id="group_'+vID+'" class="ganttExpandOpened"' 
                + 'style="position: relative; z-index: 100000; width:16px; height:13px;"'
                +' onclick="JSGantt.folder(\''+vID+'\','+vGanttVar+');'+vGanttVar+'.DrawDependencies();"' 
                +'>'           
                +'</div>' ;
            } else {
              vLeftTable += '<div id="group_'+vID+'" class="ganttExpandClosed"' 
                + 'style="position: relative; z-index: 100000; width:16px; height:13px;"'
                +' onclick="JSGantt.folder(\''+vID+'\','+vGanttVar+');'+vGanttVar+'.DrawDependencies();"' 
                +' >' 
                +'&nbsp;&nbsp;&nbsp;&nbsp;</div>' ;
            } 
          } else {
            if( vTaskList[i].getMile()) {
              vLeftTable += '<div style="border-radius:2px;margin-right:4px;width:12px; height:12px;background:#'+background+'" class="ganttNoExpandMile"></div>';  
            } else {
                 vLeftTable += '<div style="border-radius:2px;margin-right:4px;width:12px; height:12px;background:#'+background+'" class="ganttNoExpand"></div>';
            }
          }
          //var idProject = vTaskList[i].getProjectId();
          vLeftTable +='</td><td class="namePart" id="ganttName_'+vID+'"'
          +' oncontextmenu=event.preventDefault();JSGantt.openPlanningContextMenu("'+vID+'","'+vTaskList[i].getId()+'","' + vTaskList[i].getClass() + '",\'' + idProject + '\');'
          +' onclick="JSGantt.SetEditableInputFieldFocus(\'Name\', \''+vID+'\',\'' + vTaskList[i].getId()+ '\', \'' + vTaskList[i].getClass() + '\',\'' + idProject + '\')">';
          var nameLeftWidth= vNameWidth - 16 - levlWidth - 18 ;
          //vLeftTable += '<div onclick=JSGantt.taskLink("' + vTaskList[i].getLink() + '") style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '
          vLeftTable += '<div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '
          	+'width:'+ nameLeftWidth +'px;" class="namePart' + vRowType + '"><span class="nobr">' +vTaskList[i].getName() + '</span></div>' ;
          vLeftTable +='</td></tr></table></div>';
          vLeftTable +='</TD>';
          vLeftTable +='<TD style="width:0px;position:relative;"><div id="ganttEditButtonDetail_'+vID+'" style="position:absolute;top:0px;right:0px"></div></TD>';
          if (!dojo.byId('versionsPlanning') && !dojo.byId('contractGantt')) {
              for (var iSort=0;iSort<sortArray.length;iSort++) {
                if(sortArray[iSort] === undefined)continue;
                var field=sortArray[iSort];
                if (field.substr(0,6)=='Hidden') field=field.substr(6);
                var showField=getPlanningFieldShow(field,planningType);
                var fieldWidth=getPlanningFieldWidth(field,planningType);
                if(showField==1 && field!='Name') {
                  valueField=vTaskList[i].getFieldValue(field,JSGantt);
                  padding='';
                  if (field=='IdStatus' ||  field=='QualityLevel' || field=='IdTrend' || field=='IdHealthStatus' ) {
                    valueField=colorNameFormatter(valueField);
                    padding='';
                  }else {
                    padding='padding-top: 4px;';
                  }
                  height=(dojo.isFF)?'':'height:100%;';
                  vLeftTable += '<TD class="ganttDetail dndHidden gantt'+field+'" id="gantt'+field+'_'+vID+'" style="width: ' + fieldWidth + 'px;"'
                    +'onclick="JSGantt.SetEditableInputFieldFocus(\''+field+'\', \''+vID+'\',\'' + vTaskList[i].getId()+ '\', \'' + vTaskList[i].getClass() + '\',\'' + idProject + '\');" '
                    +'oncontextmenu=event.preventDefault();JSGantt.openPlanningContextMenu("'+vID+'","'+vTaskList[i].getId()+'","' + vTaskList[i].getClass() + '",\'' + idProject + '\');>'
                    +'<span class="nobr hideLeftPart' + vRowType + '" style="'+height+'width: ' + fieldWidth + 'px;text-overflow:ellipsis;'+padding+'">'+valueField+'</span></TD>' ;
                }
              }
         }
        //florent ticket 4397
          else if(dojo.byId('contractGantt')) {
            for (var iSort=0;iSort<sortArray.length;iSort++) {
              if(sortArray[iSort] === undefined)continue;
              var field=sortArray[iSort];
              if (field.substr(0,6)=='Hidden') field=field.substr(6);
              var showField=getPlanningFieldShow(field,planningType);
              var fieldWidth=getPlanningFieldWidth(field,planningType);
              var valueField=vTaskList[i].getFieldValue(field,JSGantt);
              if (field!='Name' && showField && (field=='StartDate' || field=='EndDate' ||field=='Resource' || field=='IdStatus' ||  field=='Duration' || field=='ObjectType' || field=='ExterRes'  ) ){
                padding=''; 
                if(valueField===undefined &&  (field=='Type' || field=='StartDate' || field=='EndDate')){
                  valueField='-';
                  padding='';
                }else if(valueField===undefined ){
                  valueField='';
                  padding='padding-top: 4px;';
                }
                vLeftTable += '<TD class="ganttDetail" style="width: ' + fieldWidth + 'px;">'
                  +'<span class="nobr hideLeftPart' + vRowType + '" style="width: ' + fieldWidth + 'px;top:2px;text-overflow:ellipsis;'+padding+'">' + valueField
                  +'</span></TD>' ;
              }
            }
          }
          else if (dojo.byId('versionsPlanning')) {
            for (var iSort=0;iSort<sortArray.length;iSort++) {
              if(sortArray[iSort] === undefined)continue;
              var field=sortArray[iSort];
              if (field.substr(0,6)=='Hidden') field=field.substr(6);
              var fieldWidth=getPlanningFieldWidth(field,planningType);
              var valueField=vTaskList[i].getFieldValue(field,JSGantt);

              if(field!='Name' && (field=='StartDate' || field=='EndDate' || field=='IdStatus' || field=='Id' || field=='Type' || field=='Progress' || field=='Duration' || field=='Priority' ||  (field.slice(-4) == 'Work' && field.substr(0,6)!='hidden') || (field=='Resource' && showResourceComponentVersion=='Yes'))) {
                if(valueField===undefined && field=='Resource' && showResourceComponentVersion=='Yes'){
                  valueField='-';
                }
                if ((field.slice(-4) == 'Work' || field == 'Priority') && vTaskList[i].getFieldValue('ObjectType',JSGantt) == 'version'){
                  valueField='-';
                }
                if (field=='IdStatus') {
                  valueField=colorNameFormatter(valueField);
                  padding='';
                }else {
                  padding='padding-top: 4px;';
                }
                height=(dojo.isFF)?'':'height:100%;';
                vLeftTable += '<TD class="ganttDetail" style="width: ' + fieldWidth + 'px;">'
                    +'<span class="nobr hideLeftPart' + vRowType + '" style="'+height+'width: ' + fieldWidth + 'px;text-overflow:ellipsis;'+padding+'">' + valueField
                    +'</span></TD>' ;
              }
            }
          }else {
            for (var iSort=0;iSort<sortArray.length;iSort++) {
                if(sortArray[iSort] === undefined)continue;
                var field=sortArray[iSort];
                if (field.substr(0,6)=='Hidden') field=field.substr(6);
                var fieldWidth=getPlanningFieldWidth(field,planningType);
                var valueField=vTaskList[i].getFieldValue(field,JSGantt);
                if(field!='Name' && (field=='StartDate' || field=='EndDate' || field=='IdStatus' || (field=='Resource' && showResourceComponentVersion=='Yes'))) { 
                   if(valueField===undefined && field=='Resource' && showResourceComponentVersion=='Yes'){
                      valueField='-';
                    }
                    padding='padding-top: 4px;';
                  vLeftTable += '<TD class="ganttDetail" style="width: ' + fieldWidth + 'px;">'
                    +'<span class="nobr hideLeftPart' + vRowType + '" style="width: ' + fieldWidth + 'px;text-overflow:ellipsis;'+padding+'">' + valueField
                    +'</span></TD>' ;
                }
            }
          }
          //END ADD
          //END CHANGE qCazelles - GANTT (Correction)
          vLeftTable += '</TR>';
        }
      }
      vLeftTable += '</TBODY></TABLE></form></DIV>';

// RIGHT ======================================================================
      var vOutDays="";
      var vCurrentDay="";
      vTopRightTable = '<DIV id="rightside" class="scrollRightTop ganttUnselectable" '
      +' onmouseout="JSGantt.cancelLink();" unselectable="ON" '   
      +' style="width: ' + vChartWidth + 'px; border-left:0px; border-right:0px; position:absolute;height:44px;">';
      
      vTmpDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate());
      vTmpDate.setHours(0);
      vTmpDate.setMinutes(0);
      var vWidth=vColWidth+1;
      var cpt=0;
      while(Date.parse(vTmpDate) <= Date.parse(vMaxDate)) { 
        vStr = vTmpDate.getFullYear() + '';
        if (vFormat == 'day') {
          vTopRightTable += '<div class="ganttRightTitle" style="width:'+(vWidth*7)+'px;left:'+((vWidth*7)*cpt)+'px;">' 
            +JSGantt.formatDateStr(vTmpDate,"week-long",vMonthShortArr)+'</div>';
          vTmpDate.setDate(vTmpDate.getDate()+7);
        } else if (vFormat == 'week') {
          vTopRightTable += '<div class="ganttRightTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;">' 
            +JSGantt.formatDateStr(vTmpDate,"week-short",vMonthArr)+'</div>';
          vTmpDate.setDate(vTmpDate.getDate()+7);
        } else if (vFormat == 'month') {
          vTopRightTable += '<div class="ganttRightTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;">'
            +vStr+'</div>';
          vTmpDate.setDate(vTmpDate.getDate() + 1);
          while(vTmpDate.getDate() > 1) {
            vTmpDate.setDate(vTmpDate.getDate() + 1);
          }
        } else if (vFormat == 'quarter') {
          vTopRightTable += '<div class="ganttRightTitle" style="width:'+(vWidth*3)+'px;left:'+((vWidth*3)*cpt)+'px">'
            +'Q'+vQuarterArr[vTmpDate.getMonth()]+" "+vStr+'</div>';
          vTmpDate.setDate(vTmpDate.getDate() + 81);
          while(vTmpDate.getDate() > 1) {
            vTmpDate.setDate(vTmpDate.getDate() + 1);
          }
        }
        cpt++;
      }
      vTmpDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate());
      vTmpDate.setHours(0);
      vTmpDate.setMinutes(0);
      vNxtDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate());
      vNxtDate.setHours(0);
      vNxtDate.setMinutes(0);
      vNumCols = 0;
      var vScpecificDayCount=0;
      var vHighlightSpecificDays="";
      var vTotalHeight=21*vTaskList.length;
      var vWeekendColor="dfdfdf";
      var vCurrentdayColor="ffffaa";
      cpt=0;
      var idProjectForCalendar = (dojo.byId('idProjectForCalendar') && dojo.byId('idProjectForCalendar').value)?dojo.byId('idProjectForCalendar').value:null;
      while(Date.parse(vTmpDate) <= Date.parse(vMaxDate)) {
        if(vFormat == 'day' ) {
          if (isOffDay(vTmpDate,idProjectForCalendar)) {
            vTaskLeft = Math.ceil((Date.parse(vTmpDate) - Date.parse(vMinDate) + (1000*60*60)) / (24 * 60 * 60 * 1000) );
            vDayLeft=Math.ceil( (vTaskLeft-1) * (vDayWidth));
            vScpecificDayCount++;
            vHighlightSpecificDays+='<DIV id="vScpecificDay_'+vScpecificDayCount+'" class="specificDayWeekEnd" '
            +'style="top: 0px; left:'+vDayLeft+'px; height:'+100+'px; width:'+vColWidth+'px"></DIV>';  
          }
          if (JSGantt.formatDateStr(vCurrDate,'mm/dd/yyyy') == JSGantt.formatDateStr(vTmpDate,'mm/dd/yyyy')) {
            vTaskLeft = Math.ceil((Date.parse(vTmpDate) - Date.parse(vMinDate) + (1000*60*60)) / (24 * 60 * 60 * 1000) );
            vDayLeft=Math.ceil( (vTaskLeft- 1) * (vDayWidth));
            vScpecificDayCount++;
            vHighlightSpecificDays+='<DIV id="vScpecificDay_'+vScpecificDayCount+'"class="specificDayCurrent" '
              +'style="top: 0px; left:'+vDayLeft+'px; height:'+100+'px; width:'+vColWidth+'px"></DIV>';   
          } 
          if(isOffDay(vTmpDate,idProjectForCalendar)) {
            vDateRowStr+='<div class="ganttRightSubTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;background:#'+vWeekendColor+'">' 
              +vTmpDate.getDate()+'</div>';
          } else {
            if( JSGantt.formatDateStr(vCurrDate,'mm/dd/yyyy') == JSGantt.formatDateStr(vTmpDate,'mm/dd/yyyy')) {
              vDateRowStr += '<div class="ganttRightSubTitle" style="width: '+vWidth+'px;left:'+(vWidth*cpt)+'px;background:#' + vCurrentdayColor + '">' 
                + vTmpDate.getDate() + '</div>';
            } else {
              vDateRowStr += '<div class="ganttRightSubTitle" style="width: '+vWidth+'px;left:'+(vWidth*cpt)+'px;">' 
              + vTmpDate.getDate() + '</div>';
            }
          }
          vTmpDate.setDate(vTmpDate.getDate() + 1);
        } else if (vFormat == 'week') {
          vNxtDate.setDate(vNxtDate.getDate() + 7);
          if(vCurrDate >= vTmpDate && vCurrDate < vNxtDate) {
            vTaskLeft = Math.ceil((Date.parse(vTmpDate) - Date.parse(vMinDate) + (1000*60*60)) / (24 * 60 * 60 * 1000) );
            vDayLeft=Math.ceil( (vTaskLeft-1) * (vDayWidth));
            vScpecificDayCount++;
            vHighlightSpecificDays+='<DIV id="vScpecificDay_'+vScpecificDayCount+'" class="specificDayCurrent" '
            +'style="top: 0px; left:'+vDayLeft+'px; height:'+vTotalHeight+'px; width:'+vColWidth+'px"></DIV>';   
          } 
          if( vCurrDate >= vTmpDate && vCurrDate < vNxtDate ) { 
            vDateRowStr+='<div class="ganttRightSubTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;background:#' + vCurrentdayColor + '">' 
              +JSGantt.formatDateStr(vTmpDate,"week-firstday",vMonthArr)+'</div>';          
          } else {
            vDateRowStr+='<div class="ganttRightSubTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;">' 
              +JSGantt.formatDateStr(vTmpDate,"week-firstday",vMonthArr)+'</div>';
          }
          vTmpDate.setDate(vTmpDate.getDate() + 7);
        } else if (vFormat == 'month') {
          vNxtDate.setFullYear(vTmpDate.getFullYear(), vTmpDate.getMonth(), vMonthDaysArr[vTmpDate.getMonth()]);
          vNxtDate.setHours(0);
          vNxtDate.setMinutes(0);
          if(vCurrDate >= vTmpDate && vCurrDate < vNxtDate) {
            vTaskLeft=vTmpDate.getMonth()-vMinDate.getMonth()+12*(vTmpDate.getFullYear()-vMinDate.getFullYear());
            vDayLeft=Math.ceil(vTaskLeft*(vColWidth+1));
            vScpecificDayCount++;
              vHighlightSpecificDays+='<DIV id="vScpecificDay_'+vScpecificDayCount+'" class="specificDayCurrent" '
              +'style="top:0px; left:'+vDayLeft+'px; height:'+vTotalHeight+'px; width:'+vColWidth+'px"></DIV>';   
          } 
          if( vCurrDate >= vTmpDate && vCurrDate < vNxtDate ) {
            vDateRowStr+='<div class="ganttRightSubTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;background:#'+vCurrentdayColor+'">' 
              +JSGantt.formatDateStr(vTmpDate,"month-long",vMonthArr)+'</div>';
          } else {
            vDateRowStr+='<div class="ganttRightSubTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;">' 
              +JSGantt.formatDateStr(vTmpDate,"month-long",vMonthArr)+'</div>';
          }         
          vTmpDate.setDate(vTmpDate.getDate() + 1);
          while(vTmpDate.getDate() > 1) {
            vTmpDate.setDate(vTmpDate.getDate() + 1);
          }
        } else if (vFormat == 'quarter') {
          vNxtDate.setFullYear(vTmpDate.getFullYear(), vTmpDate.getMonth(), vMonthDaysArr[vTmpDate.getMonth()]);
         if(vCurrDate >= vTmpDate && vCurrDate < vNxtDate) {
            vTaskLeft=vTmpDate.getMonth()-vMinDate.getMonth()+12*(vTmpDate.getFullYear()-vMinDate.getFullYear());
            vDayLeft=Math.ceil(vTaskLeft*(vColWidth+1));
            vScpecificDayCount++;
              vHighlightSpecificDays+='<DIV id="vScpecificDay_'+vScpecificDayCount+'" class="specificDayCurrent" '
              +'style="top: 0px; left:'+vDayLeft+'px; height:'+vTotalHeight+'px; width:'+vColWidth+'px"></DIV>';   
          } 
          if( vCurrDate >= vTmpDate && vCurrDate < vNxtDate ) {
            vDateRowStr+='<div class="ganttRightSubTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;background:#'+vCurrentdayColor+'">' 
              +JSGantt.formatDateStr(vTmpDate,"mm",vMonthArr)+'</div>';
          } else {
            vDateRowStr+='<div class="ganttRightSubTitle" style="width:'+vWidth+'px;left:'+(vWidth*cpt)+'px;">' 
              +JSGantt.formatDateStr(vTmpDate,"mm",vMonthArr)+'</div>';
          }        
          vTmpDate.setDate(vTmpDate.getDate() + 1);
          while(vTmpDate.getDate() > 1) {
            vTmpDate.setDate(vTmpDate.getDate() + 1);
          }
        }
        cpt++;
      }
      
      vItemRowStr='<td><div class="ganttDetail '+vFormat+'Background" style="border-left:0px; height: 20px; width: ' + vChartWidth + 'px;"></div></td>';  
      vTopRightTable += vDateRowStr + '</DIV>';
            
      // Display "Today"
      vTmpDate=new Date();
      vTmpDateZero=new Date();
      vTmpDateZero.setHours(1);
      vTmpDateZero.setMinutes(0);
      vTmpDateZero.setSeconds(0);
      vHour=Date.parse(vTmpDate)-Date.parse(vTmpDateZero);
      vTaskLeft = Math.ceil((Date.parse(vTmpDate) - Date.parse(vMinDate) + (1000*60*60)) / (24 * 60 * 60 * 1000) );
      vDayLeft= (vTaskLeft-1+(vHour/(24 * 60 * 60 * 1000))) * (vDayWidth);
      vScpecificDayCount++;
      vHighlightSpecificDays+='<DIV id="vScpecificDay_'+vScpecificDayCount+'" class="specificDayToday" '
      +'style="top: 0px; left:'+vDayLeft+'px; height:'+100+'px;"></DIV>'; 
      // ================================================ TREAT EACH LINE - DISPLAY GANTT PART =====================================================
      for(i = 0; i < vTaskList.length; i++) {
        vTmpDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate());
        vTaskStart = vTaskList[i].getStart();
        vTaskEnd   = vTaskList[i].getEnd();
        vTaskRealEnd = vTaskList[i].getRealEnd();
        vTaskPlanStart = vTaskList[i].getPlanStart();
        if (vTaskList[i].getGroup() && vTaskEnd==null && vTaskRealEnd!=null)vTaskEnd=vTaskRealEnd;
        vNumCols = 0;
        vID = vTaskList[i].getID();
        vNumUnits = (vTaskList[i].getEnd() - vTaskList[i].getStart()) / (24 * 60 * 60 * 1000) + 1;
        if(!(planningPage=='PortfolioPlanning' && vTaskList[i].getMile())){
          if(vTaskList[i].getVisible() == 0) {
            vRightTable += '<DIV onselectstart="event.preventDefault();return false;" class="ganttUnselectable" onMouseup="JSGantt.cancelLink('+i+');" id=childgrid_'+vID+' style="position:relative; display:none;">';
          } else {
            vRightTable += '<DIV onselectstart="event.preventDefault();return false;" class="ganttUnselectable" onMouseup="JSGantt.cancelLink('+i+');" id=childgrid_'+vID+' style="position:relative;">';
          }
        }
        if( vTaskList[i].getMile()) {
          if(!(planningPage=='PortfolioPlanning' )){
            vRightTable += '<DIV ' + ffSpecificHeight+ '>'
              + '<TABLE class="rightTableLine" style="width: ' + (vChartWidth) + 'px; " >' 
              + '<TR id=childrow_'+vID+' class="ganttTaskmile" style="height: 21px;"'
              + ' onMouseover=JSGantt.ganttMouseOver("'+vID+'","right","mile") ' 
              + ' oncontextmenu="return false;"'
              + ' onMouseout=JSGantt.ganttMouseOut("'+vID+'","right","mile")>' + vItemRowStr + '</TR></TABLE></DIV>';
          }
          vDateRowStr = JSGantt.formatDateStr(vTaskStart,vDateDisplayFormat);
          var vBaselineTopTitle="";
          if ( vTaskList[i].getBaseTopStart() && planningPage!='PortfolioPlanning') {              
            vBaseStart=vTaskList[i].getBaseTopStart();
            vDateBaseStr = JSGantt.formatDateStr(vBaseStart,vDateDisplayFormat);
            vBaselineTopTitle="\n"+vBaseTopName+" : "+vDateBaseStr;
            vBaseRight = 1 ;            
            vBaseLeft = Math.ceil((Date.parse(vBaseStart) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
            var colorMilestoneUpper=vTaskList[i].getColorBaselineUpper();
            if (vFormat=='day') vBaseLeft = vBaseLeft - 0.70;
            else if (vFormat=='week') vBaseLeft = vBaseLeft - 0.40;
            else if (vFormat=='month') vBaseLeft = vBaseLeft + 0.20;
            else if (vFormat=='quarter') vBaseLeft = vBaseLeft + 3;
            if (Date.parse(vMaxDate)>=Date.parse(vBaseStart) ) {
              vRightTable += '<div class="barDivMilestone ganttTaskrowBaseTopMile" style="top:-6px;left:' + Math.ceil(vBaseLeft * (vDayWidth)) + 'px;color:'+colorMilestoneUpper+';" >' 
              + '<div style="overflow:hidden; font-size:16px;">&diams;</div>'
              + '</div>';
            }
          }
          var vBaselineBottomTitle="";
          if ( vTaskList[i].getBaseBottomStart() && planningPage!='PortfolioPlanning') {              
            vBaseStart=vTaskList[i].getBaseBottomStart();
            vDateBaseStr = JSGantt.formatDateStr(vBaseStart,vDateDisplayFormat);
            vBaselineBottomTitle="\n"+vBaseBottomName+" : "+vDateBaseStr;
            vBaseRight = 1 ;            
            vBaseLeft = Math.ceil((Date.parse(vBaseStart) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
            var colorMilestoneBottom=vTaskList[i].getColorBaselineBottom();
            if (vFormat=='day') vBaseLeft = vBaseLeft - 0.70;
            else if (vFormat=='week') vBaseLeft = vBaseLeft - 0.40;
            else if (vFormat=='month') vBaseLeft = vBaseLeft + 0.20;
            else if (vFormat=='quarter') vBaseLeft = vBaseLeft + 3;
            if (Date.parse(vMaxDate)>=Date.parse(vBaseStart) ) {
              vRightTable += '<div class="barDivMilestone ganttTaskrowBaseBottomMile" style="top:6px;left:' + Math.ceil(vBaseLeft * (vDayWidth)) + 'px;color:'+colorMilestoneBottom+';" >' 
              + '<div style="overflow:hidden; font-size:16px;">&diams;</div>'
              + '</div>';
            }
          }
          vTaskLeft = Math.ceil((Date.parse(vTaskList[i].getStart()) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
          //if (vMinDate>vDefaultMinDate) {
            vTaskLeft = vTaskLeft - 0.85;
          //}
          vTaskRight = 1;
          if (vTaskStart && vTaskEnd && Date.parse(vMaxDate)>=Date.parse(vTaskList[i].getEnd())) {
            vBardivName='bardiv_' + vID;
          } else {
            vBardivName='outbardiv_' + vID;
          }   
          vMileLeft = Math.ceil(vTaskLeft * (vDayWidth));
          if (vFormat=='day') vMileLeft = vMileLeft - 1;
          else if (vFormat=='week') vMileLeft = vMileLeft - 5;
          else if (vFormat=='month') vMileLeft = vMileLeft - 8;
          else if (vFormat=='quarter') vMileLeft = vMileLeft - 8;
          vRightTableTempMile = '<div id=' + vBardivName + ' class="barDivMilestone" style="' 
            + 'z-index: 9999;color:#' + vTaskList[i].getColor() + ';' 
            + 'left:' + vMileLeft + 'px;"'
            + ' onmousedown=JSGantt.startLink('+i+'); '
            + ' onmouseup=JSGantt.endLink('+i+'); '
            + ' onMouseover=JSGantt.enterBarLink('+i+'); '
            + ' onMouseout=JSGantt.exitBarLink('+i+'); '
            +'>' 
            + ' <div id=taskbar_'+vID+' title="' + vTaskList[i].getNameTitle() + ' : ' + vDateRowStr + vBaselineTopTitle + vBaselineBottomTitle + '" '
            + ' style="overflow:hidden; font-size:18px;" '
            + ' onmousedown=JSGantt.startLink('+i+'); '
            + ' onmouseup=JSGantt.endLink('+i+'); '
            + ' onMouseover=JSGantt.enterBarLink('+i+'); '
            + ' onMouseout=JSGantt.exitBarLink('+i+'); ';
          if(!dojo.byId('contractGantt')){
            vRightTableTempMile += ' onclick=JSGantt.taskLink("' + vTaskList[i].getLink() + '"); ';
          }
          vRightTableTempMile += ' >';
          if (vTaskStart && vTaskEnd && Date.parse(vMaxDate)>=Date.parse(vTaskList[i].getEnd())) {
            if(vTaskList[i].getCompVal() < 100) {
              vRightTableTempMile += '&loz;</div>' ;
            } else { 
              vRightTableTempMile += '&diams;</div>' ;
            }          
            if( g.getCaptionType() ) {
              vCaptionStr = '';
              switch( g.getCaptionType() ) {           
                case 'Caption':    vCaptionStr = vTaskList[i].getCaption();  break;
                case 'Resource':   vCaptionStr = vTaskList[i].getResource();  break;
                case 'Duration':   vCaptionStr = vTaskList[i].getDuration(vFormat);  break;
                case 'Complete':   vCaptionStr = vTaskList[i].getCompStr();  break;
                case 'Work':       vCaptionStr = vTaskList[i].getWork();  break;
              }
              vRightTableTempMile += '<div class="labelBarDiv">' + vCaptionStr + '</div>';
            }
          } else {
            vRightTableTempMile += '</div>' ;  
          }
          vRightTableTempMile += '</div>';
          if (planningPage=='PortfolioPlanning') {
            $idPrarent=vTaskList[i].getParent();
            var tagParent='<tag id="mile_'+$idPrarent+'" ></tag>';
            vRightTableTempMile=vRightTableTempMile.replace('font-size:18px', 'font-size:21px;text-shadow: 0px -2px 0px white;');
            vRightTable=vRightTable.replace(tagParent,tagParent+vRightTableTempMile);
          }else{
            vRightTable+=vRightTableTempMile;
          }
          
        } else {
          //florent
          // PBER #7162 : commented 2 following lines - cannot guess what it stands for and leads to non visible tasks on Firefox
          //if(dojo.byId('inputDateGantBarResizeleft_'+vID) && dojo.byId('inputDateGantBarResizeleft_'+vID).value.trim()!='') vTaskStart= new Date(Date.parse("'"+dojo.byId('inputDateGantBarResizeleft_'+vID).value+"'"));
          //if(dojo.byId('inputDateGantBarResizeRight_'+vID) && dojo.byId('inputDateGantBarResizeRight_'+vID).value.trim()!='') vTaskEnd= new Date(Date.parse("'"+dojo.byId('inputDateGantBarResizeRight_'+vID).value+"'"));
          vDateRowStr = JSGantt.formatDateStr(vTaskStart,vDateDisplayFormat) + ' - ' 
            + JSGantt.formatDateStr(vTaskEnd,vDateDisplayFormat);
          vTmpEnd=(Date.parse(vMaxDate)<Date.parse(vTaskEnd))?vMaxDate:vTaskEnd;
          vTaskRight = (Date.parse(vTmpEnd) - Date.parse(vTaskStart)) / (24 * 60 * 60 * 1000) + 1 ;
          vTaskLeft = Math.ceil((Date.parse(vTaskStart) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
          vTaskLeft = vTaskLeft - 1;
          var vBarLeft=Math.ceil(vTaskLeft * (vDayWidth));
          var vBarWidth=Math.ceil((vTaskRight) * (vDayWidth) );
          //if (vBarWidth<10) vBarWidth=10;
   
          if (g.getSplitted()==true && !vTaskList[i].getGroup()) {
              var vTmpEndReal=(Date.parse(vMaxDate)<Date.parse(vTaskList[i].getRealEnd()))?vMaxDate:vTaskList[i].getRealEnd();
              vTaskRightReal = (Date.parse(vTmpEndReal) - Date.parse(vTaskList[i].getStart())) / (24 * 60 * 60 * 1000) + 1 ;
              vTaskLeftPlan = Math.ceil((Date.parse(vTaskList[i].getPlanStart()) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
              vTaskLeftPlan = vTaskLeftPlan - 1;
              var vBarLeftPlan=Math.ceil(vTaskLeftPlan * (vDayWidth))- vBarLeft ;
              var vBarWidthPlan=Math.ceil(((vTaskRight-vTaskLeftPlan+vTaskLeft) * (vDayWidth)) );
              var vBarWidthReal=Math.ceil((vTaskRightReal) * (vDayWidth) );
              vBarWidth=vBarWidth-1;
          }
          if( vTaskList[i].getGroup()) {   
            vRightTable += '<DIV ' + ffSpecificHeight+ '>'
              + ((vTaskList[i].getClass()=='PeriodicMeeting')?'<tag id="meeting_'+vTaskList[i].getID()+'" ></tag>':'')
              + ((planningPage=='PortfolioPlanning')?'<tag id="mile_'+vTaskList[i].getID()+'" ></tag>':'')
              + '<TABLE class="rightTableLine" style="width:' + vChartWidth + 'px;">' 
              + '<TR id=childrow_'+vID+' class="ganttTaskgroup" style="height: 21px;"'
              + ' onMouseover=JSGantt.ganttMouseOver("'+vID+'","right","group") '
              //+ ' oncontextmenu="return false;"'
              + ' oncontextmenu="'+vTaskList[i].getContextMenu()+';return false;" '
              + ' onMouseout=JSGantt.ganttMouseOut("'+vID+'","right","group")>' + vItemRowStr + '</TR></TABLE></DIV>';
            var vBaselineTopTitle="";
            if (vTaskList[i].getBaseTopStart() && vTaskList[i].getBaseTopEnd()) {              
              vBaseEnd=vTaskList[i].getBaseTopEnd();
              vBaseStart=vTaskList[i].getBaseTopStart();
              vDateBaseStr = JSGantt.formatDateStr(vBaseStart,vDateDisplayFormat) + ' - ' + JSGantt.formatDateStr(vBaseEnd,vDateDisplayFormat);
              vBaselineTopTitle="\n"+vBaseTopName+" : "+vDateBaseStr;
              vTmpEnd=(Date.parse(vMaxDate)<Date.parse(vBaseEnd))?vMaxDate:vBaseEnd;
              vBaseRight = (Date.parse(vTmpEnd) - Date.parse(vBaseStart)) / (24 * 60 * 60 * 1000) + 1 ;            
              vBaseLeft = Math.ceil((Date.parse(vBaseStart) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
              vBaseLeft = vBaseLeft - 1;
              var vBarBaseLeft=Math.ceil(vBaseLeft * (vDayWidth));
              var vBarBaseWidth=Math.ceil((vBaseRight) * (vDayWidth) );
              var colorUpper = vTaskList[i].getColorBaselineUpper();
              vRightTable +='<div class="ganttTaskrowBaseBar ganttTaskrowBaseTop ganttTaskrowBaseTopGroup"  '
              + 'style="width:'+vBarBaseWidth+'px;left:'+vBarBaseLeft+'px;background-color:'+colorUpper+'" >'
              + '</div>';
            }
            var vBaselineBottomTitle="";
            if (vTaskList[i].getBaseBottomStart() && vTaskList[i].getBaseBottomEnd()) {              
              vBaseEnd=vTaskList[i].getBaseBottomEnd();
              vBaseStart=vTaskList[i].getBaseBottomStart();
              vDateBaseStr = JSGantt.formatDateStr(vBaseStart,vDateDisplayFormat) + ' - ' + JSGantt.formatDateStr(vBaseEnd,vDateDisplayFormat);
              vBaselineBottomTitle="\n"+vBaseBottomName+" : "+vDateBaseStr;
              vTmpEnd=(Date.parse(vMaxDate)<Date.parse(vBaseEnd))?vMaxDate:vBaseEnd;
              vBaseRight = (Date.parse(vTmpEnd) - Date.parse(vBaseStart)) / (24 * 60 * 60 * 1000) + 1 ;            
              vBaseLeft = Math.ceil((Date.parse(vBaseStart) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
              vBaseLeft = vBaseLeft - 1;
              var vBarBaseLeft=Math.ceil(vBaseLeft * (vDayWidth));
              var colorBottom = vTaskList[i].getColorBaselineBottom();
              var vBarBaseWidth=Math.ceil((vBaseRight) * (vDayWidth) );
              vRightTable +='<div class="ganttTaskrowBaseBar ganttTaskrowBaseBottom ganttTaskrowBaseBottomGroup" '
              + 'style="width:'+vBarBaseWidth+'px;left:'+vBarBaseLeft+'px;background-color:'+colorBottom+'" >'
              + '</div>';
            }
            if (vTaskStart && vTaskEnd && Date.parse(vMaxDate)>=Date.parse(vTaskList[i].getStart()) ) {
              vBardivName='bardiv_' + vID;
            } else {
              vBardivName='outbardiv_' + vID;
            }  
            vRightTable += '<div id=' + vBardivName + ' class="barDivGoup" style="'
                + ' left:' + vBarLeft + 'px; height: 7px; '
                + ' width:' + vBarWidth + 'px">';
            var displayTaskName = (showTaskNameOnPlanningBar==0)?'display:none':'';
            var taskNameOverflow = (planningShowResource==1)?'overflow:visible;overflow-x:clip;':'';
            if (vTaskStart && vTaskEnd && Date.parse(vMaxDate)>=Date.parse(vTaskStart) ) {
              var background = (isColorBlind=='YES')?vTaskList[i].getColorBlindColor()+';background-size:10px 10px':'#'+vTaskList[i].getTaskStatusColor();
              vRightTable += '<div id=taskbar_'+vID+' title="' + vTaskList[i].getNameTitle() + ' : ' + vDateRowStr + vBaselineTopTitle + vBaselineBottomTitle +'" '
              + ' onmousedown=JSGantt.startLink('+i+'); '
              + ' onmouseup=JSGantt.endLink('+i+'); '
              //+ ' oncontextmenu="return false;"'
              + ' oncontextmenu="'+vTaskList[i].getContextMenu()+';return false;" '
              + ' onMouseover=JSGantt.enterBarLink('+i+'); '
              + ' onMouseout=JSGantt.exitBarLink('+i+'); '
              //+ '  oncontextmenu=JSGantt.openPlanningContextMenu("' + vTaskList[i].getLink() + '");'
              + '  onclick=JSGantt.taskLink("' + vTaskList[i].getLink() + '");'
                + ' class="ganttTaskgroupBar" style="'+taskNameOverflow+'width:' + vBarWidth + 'px;background:'+background+'">'
                + '<div style="position:absolute;z-index:1;left:5px;top:1px;font-size: 7pt;white-space: nowrap;color:white;text-shadow: 1px 1px 2px black;'+displayTaskName+'">'+ vTaskList[i].getName()+'</div>'
                + '<div style="width:' + vTaskList[i].getCompStr() + ';"' 
                + ' onmousedown=JSGantt.startLink('+i+'); '
                + ' onmouseup=JSGantt.endLink('+i+'); '
                + ' onMouseover=JSGantt.enterBarLink('+i+'); '
                //+ ' oncontextmenu="return false;"'
                + ' oncontextmenu="'+vTaskList[i].getContextMenu()+';return false;" '                
                + ' onMouseout=JSGantt.exitBarLink('+i+'); '                
                + ' class="ganttGrouprowBarComplete">'
                + '</div>' 
                + '</div>' 
                + '<div class="ganttTaskgroupBarExt" style="float:left; height:4px;background:'+background+'"></div>'               
                + '<div class="ganttTaskgroupBarExt" style="float:left; height:3px;background:'+background+'"></div>'                 
                + '<div class="ganttTaskgroupBarExt" style="float:left; height:2px;background:'+background+'"></div>'              
                + '<div class="ganttTaskgroupBarExt" style="float:left; height:1px;background:'+background+'"></div>' ;
              if (Date.parse(vMaxDate)>=Date.parse(vTaskEnd)) {
                vRightTable += '<div class="ganttTaskgroupBarExt" style="float:right; height:4px;background:'+background+'"></div>' 
                  + '<div class="ganttTaskgroupBarExt" style="float:right; height:3px;background:'+background+'"></div>'
                  + '<div class="ganttTaskgroupBarExt" style="float:right; height:2px;background:'+background+'"></div>' 
                  + '<div class="ganttTaskgroupBarExt" style="float:right; height:1px;background:'+background+'"></div>';  
              }
              if( g.getCaptionType() ) {
                vCaptionStr = '';
                switch( g.getCaptionType() ) {           
                  case 'Caption':    vCaptionStr = vTaskList[i].getCaption();  break;
                  case 'Resource':   vCaptionStr = vTaskList[i].getResource();  break;
                  case 'Duration':   vCaptionStr = vTaskList[i].getDuration(vFormat);  break;
                  case 'Complete':   vCaptionStr = vTaskList[i].getCompStr();  break;
                  case 'Work':       vCaptionStr = vTaskList[i].getWork();  break;
                }
                vRightTable += '<div class="labelBarDiv"  '
                  //+ ' onMouseover=JSGantt.enterBarLink('+i+'); '
                  //+ ' onMouseout=JSGantt.exitBarLink('+i+'); '
                  + ' onMouseover=JSGantt.exitBarLink('+i+'); '
                + 'style="left:' + (Math.ceil((vTaskRight) * (vDayWidth) - 1) + 6) + 'px;display:block;">' + vCaptionStr + '</div>';
              }
            }
            vRightTable += '</div>';
          } else { // task (not a milestone, not a group)
            vDivStr = '<DIV ' + ffSpecificHeight+ '>'
              +'<TABLE class="rightTableLine" style="width:' + vChartWidth + 'px;" >' 
              +'<TR id=childrow_'+vID+' class="ganttTaskrow" style="height: 21px;"  '
              +'  onMouseover=JSGantt.ganttMouseOver("'+vID+'","right","row") '
              + ' oncontextmenu="return false;"'
              + ' onMouseout=JSGantt.ganttMouseOut("'+vID+'","right","row")>' + vItemRowStr + '</TR></TABLE></DIV>';
            if (Date.parse(vMaxDate)>=Date.parse(vTaskList[i].getStart()) ) {
              vBardivName='bardiv_' + vID;
            } else {
              vBardivName='outbardiv_' + vID;
            }
            vRightTable += vDivStr;   
            var vBaselineTopTitle="";
            if (vTaskList[i].getBaseTopStart() && vTaskList[i].getBaseTopEnd()) {              
              vBaseEnd=vTaskList[i].getBaseTopEnd();
              vBaseStart=vTaskList[i].getBaseTopStart();
              vDateBaseStr = JSGantt.formatDateStr(vBaseStart,vDateDisplayFormat) + ' - ' + JSGantt.formatDateStr(vBaseEnd,vDateDisplayFormat);
              vBaselineTopTitle="\n"+vBaseTopName+" : "+vDateBaseStr;
              vTmpEnd=(Date.parse(vMaxDate)<Date.parse(vBaseEnd))?vMaxDate:vBaseEnd;
              vBaseRight = (Date.parse(vTmpEnd) - Date.parse(vBaseStart)) / (24 * 60 * 60 * 1000) + 1 ;            
              vBaseLeft = Math.ceil((Date.parse(vBaseStart) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
              vBaseLeft = vBaseLeft - 1;
              var vBarBaseLeft=Math.ceil(vBaseLeft * (vDayWidth));
              var vBarBaseWidth=Math.ceil((vBaseRight) * (vDayWidth) );
              var colorUpper = vTaskList[i].getColorBaselineUpper();
              vRightTable +='<div class="ganttTaskrowBaseBar ganttTaskrowBaseTop"  '
              + 'style="width:'+vBarBaseWidth+'px;left:'+vBarBaseLeft+'px;background-color:'+colorUpper+'" >'
              + '</div>';
            }
            var vBaselineBottomTitle="";
            if (vTaskList[i].getBaseBottomStart() && vTaskList[i].getBaseBottomEnd()) {              
              vBaseEnd=vTaskList[i].getBaseBottomEnd();
              vBaseStart=vTaskList[i].getBaseBottomStart();
              vDateBaseStr = JSGantt.formatDateStr(vBaseStart,vDateDisplayFormat) + ' - ' + JSGantt.formatDateStr(vBaseEnd,vDateDisplayFormat);
              vBaselineBottomTitle="\n"+vBaseBottomName+" : "+vDateBaseStr;
              vTmpEnd=(Date.parse(vMaxDate)<Date.parse(vBaseEnd))?vMaxDate:vBaseEnd;
              vBaseRight = (Date.parse(vTmpEnd) - Date.parse(vBaseStart)) / (24 * 60 * 60 * 1000) + 1 ;            
              vBaseLeft = Math.ceil((Date.parse(vBaseStart) - Date.parse(vMinDate)) / (24 * 60 * 60 * 1000) );
              vBaseLeft = vBaseLeft - 1;
              var vBarBaseLeft=Math.ceil(vBaseLeft * (vDayWidth));
              var vBarBaseWidth=Math.ceil((vBaseRight) * (vDayWidth) );
              var colorBottom = vTaskList[i].getColorBaselineBottom();
              vRightTable +='<div class="ganttTaskrowBaseBar ganttTaskrowBaseBottom" '
              + 'style="width:'+vBarBaseWidth+'px;left:'+vBarBaseLeft+'px;background-color:'+colorBottom+'" >'
              + '</div>';
            }
            if (vTaskList[i].getGlobal() && pFormat!='day') {
              vBarWidth+=15;
              vBarLeft-=15;
            }
            vIsOnCriticalPath=vTaskList[i].getIsOnCriticalPath();
            vRightTableTempMeeting = '<div id=' + vBardivName + '  class="barDivTask" style="'+((vTaskList[i].getVisible()==1 && vTaskList[i].getClass()=='Meeting' )?'display:block;':'');
            if (! vTaskList[i].getGlobal() || !dojo.byId('resourcePlanning'))
              var vBorderBottomColor=(isColorBlind=='YES')?colorBlind:'#'+vTaskList[i].getColor();
              var vBorderBottomSize=2;
              if (vTaskList[i].getTaskStatusColor()!=vTaskList[i].getColor() && vTaskList[i].getTaskStatusColor()!='50BB50' && vTaskList[i].getTaskStatusColor()!='AEC5AE') {
                vBorderBottomColor=(isColorBlind=='YES')?colorBlind:'#'+vTaskList[i].getTaskStatusColor();
                vBorderBottomSize=3;
              }
              if (! vTaskList[i].getGlobal() )vRightTableTempMeeting += ' border-bottom: '+vBorderBottomSize+'px solid ' + vBorderBottomColor + ';';
              vRightTableTempMeeting += ' left:' + vBarLeft + 'px; height:11px; '
              + ' width:' + vBarWidth + 'px" '
              + ' oncontextmenu="'+vTaskList[i].getContextMenu()+';return false;" ';
              if(!vTaskList[i].getGlobal() && !dojo.byId('resourcePlanning'))vRightTableTempMeeting += 'onmouseleave="if(!isResizingGanttBar)hideResizerGanttBar ('+vID+');"';
              if(!vTaskList[i].getGlobal() && !dojo.byId('resourcePlanning'))vRightTableTempMeeting +='onmouseenter ="if(!isResizingGanttBar)handleResizeGantBar('+vTaskList[i].getElementIdRef()+','+ Date.parse(vMinDate)+','+vDayWidth+',\''+vDateDisplayFormat+'\',\''+vTaskList[i].getIdPlanningMode()+'\');"';
              vRightTableTempMeeting +='>'; 

            vRightTableTempMeeting += ' <div class="ganttTaskrowBarComplete"  '
              + ' style="width:' + vTaskList[i].getCompStr() + '; cursor: pointer;'+((vTaskList[i].getGlobal)?'opacity:0.2;':'')+'"'
              + ' onmousedown=JSGantt.startLink('+i+'); '
              + ' onmouseup=JSGantt.endLink('+i+'); '
              + ' onMouseover=JSGantt.enterBarLink('+i+'); '
              + ' onMouseout=JSGantt.exitBarLink('+i+'); '
              + ' oncontextmenu="'+vTaskList[i].getContextMenu()+';return false;" '
              + ' onclick=if(isResizingGanttBar==false)JSGantt.taskLink("' + vTaskList[i].getLink() + '");>'
              + ' </div>'; 
            if(displayUnitProgress == 1){
              vRightTableTempMeeting += ' <div class="ganttTaskrowBarTechnicalProgress"  '
              + ' style="width:' + vTaskList[i].getUnitProgressStr() + '; cursor: pointer;"'
              + ' onmousedown=JSGantt.startLink('+i+'); '
              + ' onmouseup=JSGantt.endLink('+i+'); '
              + ' onMouseover=JSGantt.enterBarLink('+i+'); '
              + ' onMouseout=JSGantt.exitBarLink('+i+'); '
              + ' oncontextmenu="'+vTaskList[i].getContextMenu()+';return false;" '
              + ' onclick=if(isResizingGanttBar==false)JSGantt.taskLink("' + vTaskList[i].getLink() + '");>'
              + ' </div>'; 
            }
  	        if (Date.parse(vMaxDate)>=Date.parse(vTaskList[i].getStart())) {
  	        	var tmpColor=' #'+vTaskList[i].getColor();
  	        	var colorBlind = (isColorBlind=='YES')?vTaskList[i].getColorBlindColor()+';background-size:10px 10px;':tmpColor;
  	        	if (g.getSplitted()) {
  	        		tmpColor='#999999';
  	        		vBarWidth=vBarWidthReal;
  	        	}
              var imgColor='grey';
              var imgSaturate=1;
  	        	if (vTaskList[i].getGlobal()) {
  	        	  tmpColor='transparent';
  	        	  if (vTaskList[i].getTaskStatusColor()=='BB5050' || vTaskList[i].getTaskStatusColor()=='BB9099') {
  	        	    imgColor='red';
  	        	    imgSaturate='2';
  	        	  } else if (vTaskList[i].getTaskStatusColor()=='50BB50' || vTaskList[i].getTaskStatusColor()=='AEC5AE') {
  	        	    imgColor='green';
  	        	    imgSaturate='4';
  	        	  }
  	        	}
  	        	vIsOnCriticalPath=vTaskList[i].getIsOnCriticalPath();
  	        	if(tmpColor.trim() == '#f4bf42'){
  	        	  //colorBlind=tmpColor.trim(); // PBER #7150
  	        	}
  	        	var background = ((vIsOnCriticalPath=='1')?vCriticalPathColor:(isColorBlind=='YES')?colorBlind:tmpColor);
  	        	vRightTableTempMeeting += '<div id=taskbar_'+vID+' title="' + vTaskList[i].getNameTitle() + ' : ' + vDateRowStr + vBaselineTopTitle + vBaselineBottomTitle + '" '
  	            + ' class="ganttTaskrowBar" style="'+taskNameOverflow+'position:relative;background:'+background+'; '
  	            + ' width:' + vBarWidth + 'px;'+ ((vIsOnCriticalPath=='1')?' border-bottom: 5px solid '+tmpColor+';border-top: 5px solid '+tmpColor+';height:3px;':'')+'" ' 
        		    + ' onmousedown=JSGantt.startLink('+i+'); '
                + ' onmouseup=JSGantt.endLink('+i+'); '
                + ' onMouseover=JSGantt.enterBarLink('+i+'); '
                + ' onMouseout=JSGantt.exitBarLink('+i+'); '
                + ' oncontextmenu="'+vTaskList[i].getContextMenu()+';return false;" '
  	            + ' onclick=if(isResizingGanttBar==false)JSGantt.taskLink("' + vTaskList[i].getLink() + '"); >';
  	        	  
  	        	  if (vTaskList[i].getGlobal()) {
  	        	    vRightTableTempMeeting +='<img src="../view/css/customIcons/'+imgColor+'/icon'+vTaskList[i].getClass()+'.png" style="pointer-events: none;filter:saturate('+imgSaturate+');width:16px;height:16px;z-index:13;position:absolute;right:2px;" />';
  	        	  }
  	        	  vRightTableTempMeeting += '<div style="position:relative;left:5px;'+((vIsOnCriticalPath=='1')?'top:-4px;':'top:1px;')+'font-size: 7pt;white-space: nowrap;color:white;text-shadow: 1px 1px 2px black;'+displayTaskName+'">'+ vTaskList[i].getName()+'</div>';
  	        	  vRightTableTempMeeting += ' </div>';
  	        	if (g.getSplitted()) {
  	        	  var background = (isColorBlind=='YES')?colorBlind:'#'+vTaskList[i].getColor();
  	        	  vRightTableTempMeeting +='<div class="ganttTaskrowBar"  title="' + vTaskList[i].getNameTitle() + ' : ' + vDateRowStr + vBaselineTopTitle + vBaselineBottomTitle + '" '
  		        		  + 'style="position: absolute; background:' + background +';'
  		        		  + 'top: 0px; width:' + vBarWidthPlan + 'px; left: ' + vBarLeftPlan + 'px; "'
  		        		  + ' onmousedown=JSGantt.startLink('+i+'); '
  		                  + ' onmouseup=JSGantt.endLink('+i+'); '
  		                  + ' onMouseover=JSGantt.enterBarLink('+i+'); '
  		                  + ' onMouseout=JSGantt.exitBarLink('+i+'); '
  		        		  + ' onclick=JSGantt.taskLink("' + vTaskList[i].getLink() + '");></div>';
  		        }
              if( g.getCaptionType() ) {
                switch( g.getCaptionType() ) {           
                  case 'Caption':    vCaptionStr = vTaskList[i].getCaption();  break;
                  case 'Resource':   vCaptionStr = vTaskList[i].getResource();  break;
                  case 'Duration':   vCaptionStr = vTaskList[i].getDuration(vFormat);  break;
                  case 'Complete':   vCaptionStr = vTaskList[i].getCompStr();  break;
                  case 'Work':       vCaptionStr = vTaskList[i].getWork();  break;
                }
                  vRightTableTempMeeting += '<div id="labelBarDiv_'+vID+'" class="labelBarDiv" '
                  // + ' onMouseover=JSGantt.enterBarLink('+i+'); '
                  // + ' onMouseout=JSGantt.exitBarLink('+i+'); '
                  + ' onMouseover=JSGantt.exitBarLink('+i+'); '
                  + 'style="'+(vTaskList[i].getVisible()==1?'display:block;':'display:none;')+'left:'+ (Math.ceil((vTaskRight) * (vDayWidth) - 1) + 6) + 'px;">' + vCaptionStr + '</div>';
              }
	          }
  	        vRightTableTempMeeting += '</div>' ;
  	        if(!dojo.byId('resourcePlanning')){
              var idPm=vTaskList[i].getIdPlanningMode();
              if((idPm=='2'  || idPm=='20' ||idPm=='3' || idPm=='7' || idPm=='10'|| idPm=='11' || idPm=='12' || idPm=='13' || idPm=='19' || idPm=='21' || idPm=='27' || idPm=='28') && vTaskList[i].getIconClass()!='Fixed' && !vTaskList[i].getGroup() && !vTaskList[i].getGlobal()){
                // handle resizer start=======================
                leftposLeftResizer=vBarLeft-22;
                leftposdivDate=vBarLeft-43;
                vRightTableTempMeeting +='<div class="resizerStart" id="taskbar_'+vID+'ResizerStart" style="display:none;left:'+leftposLeftResizer+'px;"'
                                       + 'onmouseenter ="showResizerGanttBar ('+vID+',\'start\');" onmouseleave="if(!isResizingGanttBar)hideResizerGanttBar ('+vID+');"></div>';
                vRightTableTempMeeting +='<div class="divDateGantBarResizeleft" id="divStartDateResize_'+vID+'" style="display:none;left:'+leftposdivDate+'px;" >'+JSGantt.formatDateStr(vTaskStart,vDateDisplayFormat)+'</div>';
                vRightTableTempMeeting +='<input class="inputDateGantBarResize" id="inputDateGantBarResizeleft_'+vID+'" name="inputDateGantBarResizeleft_'+vID+'" type="hidden" value="'+vTaskStart+'" />';
                //===========================
              }
              if((idPm=='2'  || idPm=='20' ||idPm=='3' || idPm=='7' || idPm=='10'|| idPm=='11' || idPm=='12' || idPm=='13'  || idPm=='8'  || idPm=='4'  || idPm=='12' || idPm=='27' || idPm=='28') && vTaskList[i].getIconClass()!='Fixed' && !vTaskList[i].getGroup() && !vTaskList[i].getGlobal()){
                // handle resizer end=======================
                leftposRightResizer=vBarLeft+vBarWidth-11;
                vRightTableTempMeeting +='<div class="resizerEnd" id="taskbar_'+vID+'ResizerEnd" style="display:none;left:'+leftposRightResizer+'px;" '
                                       +'onmouseenter ="showResizerGanttBar ('+vID+',\'end\');"  onmouseleave="if(!isResizingGanttBar)hideResizerGanttBar ('+vID+');"></div>';
                vRightTableTempMeeting +='<div class="divDateGantBarResizeRight" id="divEndDateResize_'+vID+'" style="display:none;left:'+leftposRightResizer+'px;">'+JSGantt.formatDateStr(vTaskEnd,vDateDisplayFormat)+'</div>';
                vRightTableTempMeeting +='<input class="inputDateGantBarResize" id="inputDateGantBarResizeRight_'+vID+'" name="inputDateGantBarResizeRight_'+vID+'" type="hidden" value="'+vTaskEnd+'" />';
                //===========================
              }
  	        }
            if(vTaskList[i].getClass()=='Meeting'){
              $idPrarentMeeting=vTaskList[i].getParent();
              var tagParentMeeting='<tag id="meeting_'+$idPrarentMeeting+'" ></tag>';
              
              if(vTaskList[i].getVisible()==1){
                vRightTableMeeting=vRightTableTempMeeting.replace('style="display:block;','style="z-index:99;display:none;');
              }else{
                vRightTableMeeting=vRightTableTempMeeting.replace('style="','style="z-index:99;');
              }
              replaceElem=vRightTableMeeting.replace('bardiv_','bardivMetting_');
              replaceElem=replaceElem.replace('labelBarDiv_','labelBarDivMeeting_');
              vRightTable=vRightTable.replace(tagParentMeeting,tagParentMeeting+replaceElem);

              vRightTable+=vRightTableTempMeeting;
            }else{
              vRightTable+=vRightTableTempMeeting;
            }
          }
        }
        if(!(planningPage=='PortfolioPlanning' && vTaskList[i].getMile()) ){
          vRightTable += '</DIV>';
        }

      }
      vRightTable+=vHighlightSpecificDays;

      var editDependencyDiv='<div style="position:fixed;width:229px;height:138px;display:none;z-index:99999999999;" id="editDependencyDiv" class="editDependencyDiv">';    
      editDependencyDiv+='</div>';      
      editDependencyDiv+='<input type="hidden" name="rightClickDependencyId" id="rightClickDependencyId" />';
  
      vRightTable+=editDependencyDiv;
    
      //vRightTable+=vHighlightToday;  
        //vRightTable+='<div class="ganttUnselectable" style="position: absolute; z-index:25; opacity:0.1; filter: alpha(opacity=10); width: 200px; height: 200px; left: 0px; top:0px; background-color: red"></div>';
      dijit.byId("leftGanttChartDIV").set('content', null);
      dojo.byId("leftGanttChartDIV").innerHTML=vLeftTable;
      dojo.byId("rightGanttChartDIV").innerHTML='<div id="rightTableContainer" style="position:relative;"><div id="rightTableBarDetail">&nbsp;</div>'+vRightTable+'</div>';
      dojo.byId('editDependencyDiv').addEventListener('click',function(evt){evt.stopPropagation();});
      dojo.byId("topGanttChartDIV").innerHTML=vTopRightTable;
      dojo.parser.parse('leftGanttChartDIV');
      dojo.parser.parse('editDependencyDiv');
      //dojo.parser.parse('topGanttChartDIV');
      dojo.byId('rightside').style.left='-'+(dojo.byId('rightGanttChartDIV').scrollLeft+1)+'px';
      dojo.byId('leftside').style.top='-'+(dojo.byId('rightGanttChartDIV').scrollTop)+'px';
      dojo.byId('ganttScale').style.left=(dojo.byId('leftGanttChartDIV').scrollLeft)+'px';
      adjustSpecificDaysHeight();
    }
    window.top.hideWait();
  }; // this.draw
   
}; // GanttChart


JSGantt.isIE = function () {
  if(dojo.isIE) {
    return true;
  } else {
    return false;
  }
};

/**
 * Recursively process task tree ... set min, max dates of parent tasks and
 * identfy task level.
 * 
 * @method processRows
 * @param pList
 *            {Array} - Array of TaskItem Objects
 * @param pID
 *            {Number} - task ID
 * @param pRow
 *            {Number} - Row in chart
 * @param pLevel
 *            {Number} - Current tree level
 * @param pOpen
 *            {Boolean}
 * @return void
 */ 
JSGantt.processRows = function(pList, pID, pRow, pLevel, pOpen) {
  var vMinDate = new Date();
  var vMaxDate = new Date();
  var vMinSet  = 0;
  var vMaxSet  = 0;
  var vList    = pList;
  var vLevel   = pLevel;
  var i        = 0;
  var vNumKid  = 0;
  var vCompSum = 0;
  var vVisible = pOpen;
  if (pRow==0) {
    for(i=pList.length-1; i>0; i--) {
      parentId=null;
      if (pList[i].getParent()) {
        for (j=0;j<pList.length;j++) {
          if (pList[j].getID()==pList[i].getParent()) {
            parentId=j;
            break;
          }
        }
        if (pList[parentId].getStart()>pList[i].getStart()) { pList[parentId].setStart(pList[i].getStart());}
        if (pList[parentId].getEnd()<pList[i].getEnd()) { pList[parentId].setEnd(pList[i].getEnd());}
      }
    }
  }
  for(i = 0; i < pList.length; i++) {
    if(pList[i].getParent() == pID || (pID==0 && i==0) ) {
      vVisible = pOpen;
      pList[i].setVisible(vVisible);
      if(vVisible==1 && pList[i].getOpen() == 0) {
        vVisible = 0;
      }
      pList[i].setLevel(vLevel);
      vNumKid++;
      if(pList[i].getGroup() == 1) {
        JSGantt.processRows(vList, pList[i].getID(), i, vLevel+1, vVisible);
      };
      if( vMinSet==0 || pList[i].getStart() < vMinDate) {
        vMinDate = pList[i].getStart();
        vMinSet = 1;
      };
      if( vMaxSet==0 || pList[i].getEnd() > vMaxDate) {
        vMaxDate = pList[i].getEnd();
        vMaxSet = 1;
      };
      vCompSum += pList[i].getCompVal();
    }
  }
  if(pRow >= 0) {
    if (vMinDate==null) {
      if (vMaxDate==null) {
        vMinDate = new Date();
        vMaxDate = new Date();
      } else {
        vMinDate = vMaxDate;
      }
    } else {
      if (vMaxDate==null) {
        vMaxDate=vMinDate;
      }
    }    
    // pList[pRow].setStart(vMinDate);
    // pList[pRow].setEnd(vMaxDate);
    pList[pRow].setNumKid(vNumKid);
    // pList[pRow].setCompVal(Math.ceil(vCompSum/vNumKid));
  }
};

/**
 * Determine the minimum date of all tasks and set lower bound based on format
 * 
 * @method getMinDate
 * @param pList
 *            {Array} - Array of TaskItem Objects
 * @param pFormat
 *            {String} - current format (minute,hour,day...)
 * @return {Datetime}
 */
JSGantt.getMinDate = function getMinDate(pList, pFormat, pStartDateView) {
  var vDate = new Date();
  var vDateFirstSet=(pStartDateView==null)?false:true;
  // vDate.setFullYear(pList[0].getStart().getFullYear(),
  // pList[0].getStart().getMonth(), pList[0].getStart().getDate());
  // Parse all Task End dates to find min
  for(i = 0; i < pList.length; i++) {
    if(pList[i].getStart()!=null && (Date.parse(pList[i].getStart()) < Date.parse(vDate) || vDateFirstSet==false) ) {
      vDateFirstSet=true;
      vDate.setFullYear(pList[i].getStart().getFullYear(), pList[i].getStart().getMonth(), pList[i].getStart().getDate());
    }
  }
  if (vDate.getDay()>0 && vDate.getDay()<2) vDate.setDate(vDate.getDate() - 7); // Propose to display 1 week before start (to show Start-Start dependencies) 
  if (pStartDateView && vDate<pStartDateView) {
    vDate=g.getStartDateView();
  }
  // Adjust min date to specific format boundaries (first of week or first of
  // month)
  if ( pFormat== 'minute') {
    vDate.setHours(0);
    vDate.setMinutes(0);
  } else if (pFormat == 'hour' ) {
    vDate.setHours(0);
    vDate.setMinutes(0);
  } else if (pFormat=='day') {   
    //vDate.setDate(vDate.getDate() - 1);
    while(vDate.getDay() % 7 != 1) {
      vDate.setDate(vDate.getDate() - 1);
    }
  } else if (pFormat=='week') {
    //vDate.setDate(vDate.getDate() - 1);
    while(vDate.getDay() % 7 != 1) {
      vDate.setDate(vDate.getDate() - 1);
    }
  } else if (pFormat=='month') {
    while(vDate.getDate() > 1) {
      vDate.setDate(vDate.getDate() - 1);
    }
  } else if (pFormat=='quarter') {
    if( vDate.getMonth()==0 || vDate.getMonth()==1 || vDate.getMonth()==2 ) {
      vDate.setFullYear(vDate.getFullYear(), 0, 1);
    } else if ( vDate.getMonth()==3 || vDate.getMonth()==4 || vDate.getMonth()==5 ) {
      vDate.setFullYear(vDate.getFullYear(), 3, 1);
    } else if( vDate.getMonth()==6 || vDate.getMonth()==7 || vDate.getMonth()==8 ) {
      vDate.setFullYear(vDate.getFullYear(), 6, 1);
    } else if( vDate.getMonth()==9 || vDate.getMonth()==10 || vDate.getMonth()==11 ) {
      vDate.setFullYear(vDate.getFullYear(), 9, 1);
    }
  };
  return(vDate);
};

/**
 * Used to determine the minimum date of all tasks and set lower bound based on
 * format
 * 
 * @method getMaxDate
 * @param pList
 *            {Array} - Array of TaskItem Objects
 * @param pFormat
 *            {String} - current format (minute,hour,day...)
 * @return {Datetime}
 */
JSGantt.getMaxDate = function (pList, pFormat, pEndDateView)
{
  var vDate = new Date();
  // Parse all Task End dates to find max
  for(i = 0; i < pList.length; i++) {
    if(pList[i].getEnd()!=null && Date.parse(pList[i].getEnd()) > Date.parse(vDate)) {
      vDate.setTime(Date.parse(pList[i].getEnd()));
    }  
    if(pList[i].getBaseBottomEnd()!=null && Date.parse(pList[i].getBaseBottomEnd()) > Date.parse(vDate)) {
      vDate.setTime(Date.parse(pList[i].getBaseBottomEnd()));
    }  
    if(pList[i].getBaseTopEnd()!=null && Date.parse(pList[i].getBaseTopEnd()) > Date.parse(vDate)) {
      vDate.setTime(Date.parse(pList[i].getBaseTopEnd()));
    }  
  }
  if (pEndDateView && vDate>pEndDateView) {
	vDate=g.getEndDateView();
  }
  if (pFormat == 'minute') {
    vDate.setHours(vDate.getHours() + 1);
    vDate.setMinutes(59);
  }  else if (pFormat == 'hour') {
    vDate.setHours(vDate.getHours() + 2);
  }  else if (pFormat=='day') {      
  // Adjust max date to specific format boundaries (end of week or end of
  // month)
    //vDate.setDate(vDate.getDate() + 1);
    while(vDate.getDay() != 0) {
      vDate.setDate(vDate.getDate() + 1);
    }
  } else if (pFormat=='week') {
    vDate.setDate(vDate.getDate() + 2);
    while(vDate.getDay() != 0) {
      vDate.setDate(vDate.getDate() + 1);
    }
  } else if (pFormat=='month') {
     // Set to last day of current Month
      while(vDate.getDate() > 1) {
       vDate.setDate(vDate.getDate() + 1);
     }
    vDate.setDate(vDate.getDate() - 1);
  } else if (pFormat=='quarter') {
 // Set to last day of current Quarter
    if ( vDate.getMonth()==0 || vDate.getMonth()==1 || vDate.getMonth()==2 ) {
      vDate.setFullYear(vDate.getFullYear(), 2, 31);
    } else if ( vDate.getMonth()==3 || vDate.getMonth()==4 || vDate.getMonth()==5 ) {
      vDate.setFullYear(vDate.getFullYear(), 5, 30);
    } else if ( vDate.getMonth()==6 || vDate.getMonth()==7 || vDate.getMonth()==8 ) {
      vDate.setFullYear(vDate.getFullYear(), 8, 30);
    } else if( vDate.getMonth()==9 || vDate.getMonth()==10 || vDate.getMonth()==11 ) {
      vDate.setFullYear(vDate.getFullYear(), 11, 31);
    }
  }
  return(vDate);
};


/**
 * Returns an object from the current DOM
 * 
 * @method findObj
 * @param theObj
 *            {String} - Object name
 * @param theDoc
 *            {Document} - current document (DOM)
 * @return {Object}
 */
JSGantt.findObj = function (theObj, theDoc) {
  return dojo.byId(theObj);
};


/**
 * Change display format of current gantt chart
 * 
 * @method changeFormat
 * @param pFormat
 *            {String} - Current format (minute,hour,day...)
 * @param ganttObj
 *            {GanttChart} - The gantt object
 * @return {void}
 */
let ctrlKeyPressed = false;

document.addEventListener('keydown', function(event) {
  if (event.key === 'Control') {
    ctrlKeyPressed = true;
  }
});
document.addEventListener('keyup', function(event) {
  if (event.key === 'Control') {
    ctrlKeyPressed = false;
  }
});
const validFormats = ['day', 'week', 'month', 'quarter'];
function getCurrentFormat() {
  const selectedFormat = Array.from(dojo.query('.dijitCheckBoxInput'))
    .map(node => dijit.byId(node.id))
    .find(element => element && element.get('checked') && validFormats.includes(element.get('value')));
  const currentFormat = selectedFormat ? selectedFormat.get('value') : null;
  return currentFormat;
}

document.addEventListener('wheel', function(event) {
  const objectClassManualElement = document.getElementById('objectClassManual');
  const isPlanning = objectClassManualElement && objectClassManualElement.value === 'Planning';
  if (event.ctrlKey && isPlanning) {
    event.preventDefault();
    const delta = event.deltaY;
    const currentFormat = getCurrentFormat();
    let targetFormat;
    const currentIndex = validFormats.indexOf(currentFormat);
    if (delta < 0) {
      const nextIndex = (currentIndex + 1) % validFormats.length;
      targetFormat = validFormats[nextIndex];
    } else {
      const nextIndex = (currentIndex - 1 + validFormats.length) % validFormats.length;
      targetFormat = validFormats[nextIndex];
    }
    JSGantt.changeFormat(targetFormat,g);
  }
}, { passive: false});

JSGantt.changeFormat = function(pFormat,ganttObj) {
  if(ganttObj) {
    window.top.showWait();
	  var func=function() {
	    var drawLimited=false;
      if(dojo.byId('divMessageLimitedDisplay')){
        drawLimited=true;
        var msg=dojo.byId('divMessageLimitedDisplay').value;
      }
  	  if (ganttObj.getFormat()=='month' && ganttObj.getEndDateView() ) {
        ganttObj.setFormat(pFormat);
        refreshJsonPlanning();

      } else {
        ganttObj.resetStartDateView();
        ganttObj.resetEndDateView();
        ganttObj.setFormat(pFormat);
        ganttObj.DrawDependencies();
      }
  	  if(drawLimited){
  	    drawLimitedDisplayMessage(msg);
  	  }
  	  window.top.hideWait();
	  };
	  setTimeout(func,10); // This is done to let the time to the browser to display the waiting spinner (showWait())
  } else {
    consoleTraceLog('Chart undefined');
  };
  saveUserParameter('planningScale',pFormat);
  ganttPlanningScale=pFormat;
  highlightPlanningLine();
};

/**
 * Open/Close and hide/show children of specified task
 * 
 * @method folder
 * @param pID
 *            {Number} - Task ID
 * @param ganttObj
 *            {GanttChart} - The gantt object
 * @return {void}
 */
JSGantt.folder= function (pID,ganttObj) {
  var vList = ganttObj.getList();
  for(i = 0; i < vList.length; i++) {
    if(vList[i].getID() == pID) {
      if( vList[i].getOpen() == 1 ) {
        vList[i].setOpen(0);
        JSGantt.hide(pID,ganttObj);
        JSGantt.findObj('group_'+pID).className = "ganttExpandClosed";
        var callBack=function() {window.top.hideWait();}
        saveCollapsed(vList[i].getScope(),callBack);
      } else {
        vList[i].setOpen(1);
        JSGantt.show(pID, ganttObj); 
        JSGantt.findObj('group_'+pID).className = "ganttExpandOpened";
        var callBack=function() {window.top.hideWait();}
        saveExpanded(vList[i].getScope(),callBack);
      }
    }
  }
  adjustSpecificDaysHeight();
};

JSGantt.collapseAll= function (vGanttVar) {
  window.top.showField('wait');
  var fnc=function() {
    JSGantt.collapse(vGanttVar);
    //window.top.hideField('wait');
    //setTimeout('collapsedTrue="";',100);
  };
  setTimeout(fnc,10);
};
JSGantt.collapse= function (ganttObj) {
  var vList = ganttObj.getList();
  for(i = vList.length -1; i >=0 ; i--) {
    if (vList[i].getGroup()) {
      if (vList[i].getOpen()) {
        JSGantt.folder(vList[i].getID(),ganttObj);
      }      
    }
  }
  ganttObj.DrawDependencies();
};
JSGantt.expandAll= function (vGanttVar) {
  window.top.showField('wait');
  var fnc=function() {
    JSGantt.expand(vGanttVar);
    //window.top.hideField('wait');
    //setTimeout('collapsedFalse="";',100);
  };
  setTimeout(fnc,10);
};
JSGantt.expand= function (ganttObj) {
  JSGantt.collapse(ganttObj);
  var vList = ganttObj.getList();
  //for(i = 0; i < vList.length; i++) {
  for(var i = vList.length -1; i >=0 ; i--) {
    if(vList[i].getGroup()) {
      if (! vList[i].getOpen()) {
        JSGantt.folder(vList[i].getID(),ganttObj);
      }
    }
  }
  ganttObj.DrawDependencies();
};
	
/**
 * Hide children of a task
 * 
 * @method hide
 * @param pID
 *            {Number} - Task ID
 * @param ganttObj
 *            {GanttChart} - The gantt object
 * @return {void}
 */
JSGantt.hide=function (pID,ganttObj) {
   var vList=ganttObj.getList();
   var vID=0;
   var parentLine='';
   var newParentLine=parentLine;
   var sonsLines='';
   var node=null;
   for(var i = 0; i < vList.length; i++) {
     if(vList[i].getParent()==pID) {
       vID = vList[i].getID();
       if(JSGantt.findObj('child_' + vID)){
         node=JSGantt.findObj('child_' + vID);
         if (node) node.style.display = "none";
         node=JSGantt.findObj('childgrid_' + vID);
         if (node) node.style.display = "none";
       }
       if(vList[i].getClass()=='Meeting'){
         node=JSGantt.findObj('bardivMetting_' + vID);
         if (node) node.style.display = "";
         node=JSGantt.findObj('labelBarDivMeeting_'+ vID);
         if (node) node.style.display = "none";
       }
       node=JSGantt.findObj('labelBarDiv_'+ vID);
       if (node) node.style.display = "none";
       vList[i].setVisible(0);
       if(vList[i].getGroup() == 1) {
         JSGantt.hide(vID,ganttObj);
       }
     }
   }
};

/**
 * Show children of a task
 * 
 * @method show
 * @param pID
 *            {Number} - Task ID
 * @param ganttObj
 *            {GanttChart} - The gantt object
 * @return {void}
 */
JSGantt.show =  function (pID, ganttObj) {
  var vList = ganttObj.getList();
  var vID   = 0;
  var pIDindex=0;
  var node=null;
  for(var i = 0; i < vList.length; i++) {
    if (vList[i].getID()==pID) {
      pIDindex=i;
    }
    if(vList[i].getParent() == pID) {
      vID = vList[i].getID();
      if (vList[pIDindex].getOpen()==1) {
        if(JSGantt.findObj('child_' + vID)){
          node=JSGantt.findObj('child_'+vID);
          if (node) node.style.display = "";
          node=JSGantt.findObj('childgrid_'+vID);
          if (node) node.style.display = "";
        }
        if(vList[i].getClass()=='Meeting'){
          node=JSGantt.findObj('bardivMetting_' + vID);
          if (node) node.style.display = "none";
//          node=JSGantt.findObj('labelBarDiv_'+ vID);
//          if (node) node.style.display = "block";        
        }
        node=JSGantt.findObj('labelBarDiv_'+ vID);
        if (node) node.style.display = 'block';
        vList[i].setVisible(1);
      }
      if(vList[i].getGroup() == 1 && vList[i].getVisible()) {
        JSGantt.show(vID, ganttObj);
      }
    }
  }
};

/**
 * Handles click events on task name, currently opens a new window
 * 
 * @method taskLink
 * @param pRef
 *            {String} - Javascript code to be executed !!! Must not include "
 *            char // BABYNUS 2009-09-10 : change text // BABYNUS 2009-09-10 :
 *            remove 2 lines
 * @return {void}
 */
JSGantt.taskLink = function(pRef){
  eval(pRef); // BABYNUS 2009-09-10 : add this line
};
JSGantt.openPlanningContextMenu = function(taskId, refId, refType, idProject){
  //alert(pRef); // BABYNUS 2009-09-10 : add this line
  var contextMenu = dijit.byId('planningContextMenu');
  var contextMenuDiv = dojo.byId('dialogPlanningContextMenu');
  var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  var mousePosition = {};
  mousePosition.x = event.clientX;
  if(dojo.byId('isMenuLeftOpen').value == 'true'){
    mousePosition.x -= 250;
  }
  mousePosition.y = event.clientY-110;//event.target.offsetTop+56;
  if(dojo.byId('timelineGanttDiv') && dojo.byId('timelineGanttDiv').style.display != 'none'){
    mousePosition.y -= dojo.byId('timelineGanttDiv').offsetHeight;
  }
  dojo.query('.contextMenuClass').forEach(function(node){
    node.style.cssText='position:absolute;width:0px;height:0px;overflow:hidden;top:'+mousePosition.y+'px;left:'+mousePosition.x+'px';
  });
  
  if(dojo.byId('contextMenuRefId'))dojo.byId('contextMenuRefId').value = refId;
  if(dojo.byId('contextMenuRefType'))dojo.byId('contextMenuRefType').value = refType;
  
  if (refType=='Replan' || refType=='Construction' || refType=='Fixed') refType='Project';
  
  var currentClass = null;
  var currentId = null;
  
  if(dojo.byId('objectClass'))currentClass=dojo.byId('objectClass').value;
  if(dojo.byId('objectId'))currentId=dojo.byId('objectId').value;
  
  if(dojo.byId('cm_openFromPlanning')){
    dojo.byId('cm_openFromPlanning').style.display = '';
    dojo.byId('cm_openFromPlanning').setAttribute('onClick', 'openObjectFromContextMenu(\''+refType+'\', '+refId+', \''+taskId+'\', '+idProject+')');
  }
  if(dojo.byId('cm_closeFromPlanning') && coverListAction == 'OPEN' && (refType==currentClass && refId==currentId)){
    dojo.byId('cm_closeFromPlanning').style.display = '';
    dojo.byId('cm_closeFromPlanning').setAttribute('onClick', 'closeObjectFromContextMenu()');
    dojo.byId('cm_openFromPlanning').style.display = 'none';
  }else if(dojo.byId('cm_closeFromPlanning')){
    dojo.byId('cm_closeFromPlanning').style.display = 'none';
  }
  if(dojo.byId('cm_emailFromPlanning')){
    dojo.byId('cm_emailFromPlanning').style.display = '';
    dojo.byId('cm_emailFromPlanning').setAttribute('onClick', 'sendMailFromContextMenu('+refId+', \''+refType+'\', \''+taskId+'\', '+idProject+')');
  }
  if(dojo.byId('cm_historyFromPlanning')){
    dojo.byId('cm_historyFromPlanning').style.display = '';
    dojo.byId('cm_historyFromPlanning').setAttribute('onClick', 'showHistoryFromContextMenu('+refId+', \''+refType+'\', \''+taskId+'\', '+idProject+')');
  }
  if(dojo.byId('cm_printFromPlanning')){
    dojo.byId('cm_printFromPlanning').style.display = '';
    dojo.byId('cm_printFromPlanning').setAttribute('onClick', 'JSGantt.hideMenu();showPrint("objectDetail.php", "contextMenu", null, null, "P")');
  }
  if(dojo.byId('cm_pdfFromPlanning')){
    dojo.byId('cm_pdfFromPlanning').style.display = '';
    dojo.byId('cm_pdfFromPlanning').setAttribute('onClick', 'JSGantt.hideMenu();showPrint("objectDetail.php", "contextMenu", null, "pdf", "P")');
  }
  dojo.xhrGet({
    url:'../tool/getSingleData.php?dataType=canUpdateObject&objectClass=' + refType + '&objectId='+refId+'&csrfToken=' + csrfToken,
    handleAs:"text",
    load:function(data) {
      if(data){
        if(dojo.byId('cm_editFromPlanning') && coverListAction == 'CLOSE'){
          if(data == 'YES'){
            dojo.byId('cm_editFromPlanning').style.display = '';
            dojo.byId('cm_editFromPlanning').setAttribute('onClick', 'editObjectFromContextMenu(\''+refId+'\', \''+refType+'\', \''+taskId+'\', '+idProject+')');
          }else{
            dojo.byId('cm_editFromPlanning').style.display = 'none';
            dojo.byId('cm_editFromPlanning').setAttribute('onClick', '');
          }
        }else if(dojo.byId('cm_editFromPlanning')){
          dojo.byId('cm_editFromPlanning').style.display = 'none';
        }
        if(dojo.byId('cm_editOnlineFromPlanning')){
          if(((planningType != 'resource' && refType != 'Resource') || (planningType == 'resource' && (refType != 'Resource' && refType != 'Project'))) && data == 'YES'){
            dojo.byId('cm_editOnlineFromPlanning').style.display = '';
            if(coverListAction == 'CLOSE'){
              dojo.byId('cm_editOnlineFromPlanning').setAttribute('onClick', 'JSGantt.hideMenu();JSGantt.editRowObjectPlanning(\''+taskId+'\', '+refId+', \''+refType+'\', '+idProject+')');
            }else{
              dojo.byId('cm_editOnlineFromPlanning').setAttribute('onClick', 'JSGantt.hideMenu();hideDetailScreen();if(checkFormChangeInProgress())return;JSGantt.editRowObjectPlanning(\''+taskId+'\', '+refId+', \''+refType+'\', '+idProject+')');
            }
          }else{
            dojo.byId('cm_editOnlineFromPlanning').style.display = 'none';
          }
        }
        if(dojo.byId('cm_editAssignmentFromPlanning')){
          if(data == 'YES' && (refType != 'Project' && refType != 'Milestone')){
            dojo.byId('cm_editAssignmentFromPlanning').style.display = '';
            dojo.byId('cm_editAssignmentFromPlanning').setAttribute('onClick', 'editAssignmentFromContextMenu('+refId+', \''+refType+'\', \''+taskId+'\', '+idProject+')');
          }else{
            dojo.byId('cm_editAssignmentFromPlanning').style.display = 'none';
            dojo.byId('cm_editAssignmentFromPlanning').setAttribute('onClick', '');
          }
        }
        if(dojo.byId('cm_editAffectationFromPlanning')){
          if(data == 'YES' && refType == 'Project'){
            dojo.byId('cm_editAffectationFromPlanning').style.display = '';
            dojo.byId('cm_editAffectationFromPlanning').setAttribute('onClick', 'editAffectationFromContextMenu('+refId+', \''+refType+'\', \''+taskId+'\', '+idProject+')');
          }else{
            dojo.byId('cm_editAffectationFromPlanning').style.display = 'none';
            dojo.byId('cm_editAffectationFromPlanning').setAttribute('onClick', '');
          }
        }
        if(dojo.byId('cm_successorFromPlanning')){
          if(data == 'YES'){
            dojo.byId('cm_successorFromPlanning').style.display = '';
            dojo.byId('cm_successorFromPlanning').setAttribute('onClick', 'successorFromContextMenu('+refId+', \''+refType+'\', \''+taskId+'\', '+idProject+')');
          }else{
            dojo.byId('cm_successorFromPlanning').style.display = 'none';
            dojo.byId('cm_successorFromPlanning').setAttribute('onClick', '');
          }
        }
        if(dojo.byId('cm_predecessorFromPlanning')){
          if(data == 'YES'){
            dojo.byId('cm_predecessorFromPlanning').style.display = '';
            dojo.byId('cm_predecessorFromPlanning').setAttribute('onClick', 'predecessorFromContextMenu('+refId+', \''+refType+'\', \''+taskId+'\', '+idProject+')');
          }else{
            dojo.byId('cm_predecessorFromPlanning').style.display = 'none';
            dojo.byId('cm_predecessorFromPlanning').setAttribute('onClick', '');
          }
        }
      }
    }
  });
  dojo.xhrGet({
    url:'../tool/getSingleData.php?dataType=canCreateObject&objectClass=' + refType + '&objectId='+refId+'&csrfToken=' + csrfToken,
    handleAs:"text",
    load:function(data) {
      if(data){
        if(dojo.byId('cm_addFromPlanning')){
          if(data == 'YES'){
            dojo.byId('cm_addFromPlanning').style.display = '';
            dojo.byId('cm_addFromPlanning').setAttribute('onClick', 'addObjectFromContextMenu(\''+refId+'\', \''+refType+'\')');
          }else{
            dojo.byId('cm_addFromPlanning').style.display = 'none';
            dojo.byId('cm_addFromPlanning').setAttribute('onClick', '');
          }
        }
      }
    }
  });
  dojo.xhrGet({
    url:'../tool/getSingleData.php?dataType=canDeleteObject&objectClass=' + refType + '&objectId='+refId+'&csrfToken=' + csrfToken,
    handleAs:"text",
    load:function(data) {
      if(data){
        if(dojo.byId('cm_removeFromPlanning')){
          if(data == 'YES'){
            dojo.byId('cm_removeFromPlanning').style.display = '';
            dojo.byId('cm_removeFromPlanning').setAttribute('onClick', 'deleteObjectFromContextMenu('+refId+', \''+refType+'\')');
          }else{
            dojo.byId('cm_removeFromPlanning').style.display = 'none';
            dojo.byId('cm_removeFromPlanning').setAttribute('onClick', '');
          }
        }
      }
    }
  });
  dojo.xhrGet({
    url:'../tool/getSingleData.php?dataType=canCopyObject&objectClass=' + refType + '&objectId='+refId+'&csrfToken=' + csrfToken,
    handleAs:"text",
    load:function(data) {
      if(data){
        if(dojo.byId('cm_copyFromPlanning')){
          if(data == 'YES'){
            dojo.byId('cm_copyFromPlanning').style.display = '';
            dojo.byId('cm_copyFromPlanning').setAttribute('onClick', 'copyObjectFromContextMenu('+refId+', \''+refType+'\', \''+taskId+'\', '+idProject+')');
          }else{
            dojo.byId('cm_copyFromPlanning').style.display = 'none';
            dojo.byId('cm_copyFromPlanning').setAttribute('onClick', ')');
          }
        }
      }
    }
  });
  
  if(dojo.byId('TimelineItemTask_'+taskId)){
    if(dojo.byId('cm_sectionTimeline'))dojo.byId('cm_sectionTimeline').style.display = '';
    if(dojo.byId('cm_addToTimeline'))dojo.byId('cm_addToTimeline').style.display = 'none';
    if(dojo.byId('cm_removeFromTimeline'))dojo.byId('cm_removeFromTimeline').style.display = '';
    if(dojo.byId('cm_removeFromTimeline'))dojo.byId('cm_removeFromTimeline').setAttribute('onClick', 'removeFromTimeline('+refId+', \''+refType+'\')');
  }else {
    if(refType == 'Activity' || refType == 'Project'){
      if(dojo.byId('cm_sectionTimeline'))dojo.byId('cm_sectionTimeline').style.display = '';
      if(dojo.byId('cm_addToTimeline'))dojo.byId('cm_addToTimeline').style.display = '';
      if(dojo.byId('cm_removeFromTimeline'))dojo.byId('cm_removeFromTimeline').style.display = 'none';
      if(dojo.byId('cm_addToTimeline'))dojo.byId('cm_addToTimeline').setAttribute('onClick', 'addToTimeline('+refId+', \''+refType+'\')');
    }else{
      if(dojo.byId('cm_sectionTimeline'))dojo.byId('cm_sectionTimeline').style.display = 'none';
      if(dojo.byId('cm_addToTimeline'))dojo.byId('cm_addToTimeline').style.display = 'none';
      if(dojo.byId('cm_removeFromTimeline'))dojo.byId('cm_removeFromTimeline').style.display = 'none';
      if(dojo.byId('cm_addToTimeline'))dojo.byId('cm_addToTimeline').setAttribute('onClick', '');
    }
  }
  contextMenu.openDropDown();
  contextMenuDiv.focus();
};

var hidePlanningContextMenu=null;
JSGantt.hideMenu = function(delay){
  var contextMenu = dijit.byId('planningContextMenu');
  var contextMenuDiv = dojo.byId('dialogPlanningContextMenu');
  if(contextMenu){
    var callback = function(){
      if(dojo.byId('cm_addFromPlanning'))dojo.byId('cm_addFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_openFromPlanning'))dojo.byId('cm_openFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_addToTimeline'))dojo.byId('cm_addToTimeline').setAttribute('onClick', '');
      if(dojo.byId('cm_removeFromTimeline'))dojo.byId('cm_removeFromTimeline').setAttribute('onClick', '');
      if(dojo.byId('contextMenuRefId'))dojo.byId('contextMenuRefId').value = '';
      if(dojo.byId('contextMenuRefType'))dojo.byId('contextMenuRefType').value = '';
      if(dojo.byId('cm_removeFromPlanning'))dojo.byId('cm_removeFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_copyFromPlanning'))dojo.byId('cm_copyFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_emailFromPlanning'))dojo.byId('cm_emailFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_historyFromPlanning'))dojo.byId('cm_historyFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_printFromPlanning'))dojo.byId('cm_printFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_pdfFromPlanning'))dojo.byId('cm_pdfFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_successorFromPlanning'))dojo.byId('cm_successorFromPlanning').setAttribute('onClick', '');
      if(dojo.byId('cm_predecessorFromPlanning'))dojo.byId('cm_predecessorFromPlanning').setAttribute('onClick', '');
      contextMenu.closeDropDown();
      contextMenuDiv.blur();
    }
    hidePlanningContextMenu = setTimeout(callback, delay);
  }
};
/**
 * Parse dates based on gantt date format setting as defined in
 * JSGantt.GanttChart.setDateInputFormat()
 * 
 * @method parseDateStr
 * @param pDateStr
 *            {String} - A string that contains the date (i.e. "01/01/09")
 * @param pFormatStr
 *            {String} - The date format (mm/dd/yyyy,dd/mm/yyyy,yyyy-mm-dd)
 * @return {Datetime}
 */
JSGantt.parseDateStr = function(pDateStr,pFormatStr) {
  if (pDateStr==null || pDateStr=='' || pDateStr==' ') return null;
  var vDate =new Date();  
  // vDate.setTime( Date.parse(pDateStr));
  switch(pFormatStr) {
    case 'mm/dd/yyyy':
      var vDateParts = pDateStr.split('/');
      if (vDateParts.length==3) {
        vDate.setFullYear(parseInt(vDateParts[2], 10), parseInt(vDateParts[0], 10) - 1, parseInt(vDateParts[1], 10));
      }
      break;
    case 'dd/mm/yyyy':
      var vDateParts = pDateStr.split('/');
      if (vDateParts.length==3) {
        vDate.setFullYear(parseInt(vDateParts[2], 10), parseInt(vDateParts[1], 10) - 1, parseInt(vDateParts[0], 10));
      }
      break;
    case 'yyyy-mm-dd':
      var vDateParts = pDateStr.split('-');
      if (vDateParts.length==3) {
        vDate.setFullYear(parseInt(vDateParts[0], 10), parseInt(vDateParts[1], 10) - 1, parseInt(vDateParts[2], 10)); // BABYNUS
                                                            // CORRECTION
      }
      break;
  }
  return(vDate);  
};

/**
 * Display a formatted date based on gantt date format setting as defined in
 * JSGantt.GanttChart.setDateDisplayFormat()
 * 
 * @method formatDateStr
 * @param pDate
 *            {Date} - A javascript date object
 * @param pFormatStr
 *            {String} - The date format (mm/dd/yyyy,dd/mm/yyyy,yyyy-mm-dd...)
 * @return {String}
 */
JSGantt.formatDateStr = function(pDate,pFormatStr, vMonthArray) {
  if (pDate==null || pDate=='') return '-';
  var vYear4Str = pDate.getFullYear() + '';
   var vYear2Str = vYear4Str.substring(2,4);
  var vMonthStr = (pDate.getMonth()+1) + '';
  if (vMonthStr.length==1) vMonthStr="0"+vMonthStr;
  var vDayStr   = pDate.getDate() + '';
  if (vDayStr.length==1) vDayStr="0"+vDayStr;
  var vWeekNum = dateGetWeek(pDate,1); 
  switch(pFormatStr) {
    case 'default':
      fmt=window.top.getBrowserLocaleDateFormatJs();
      return dojo.date.locale.format(pDate, {datePattern: fmt, formatLength: "short", fullYear: true, selector: "date"});
    case 'mm/dd/yyyy':
      return( vMonthStr + '/' + vDayStr + '/' + vYear4Str );
    case 'dd/mm/yyyy':
      return( vDayStr + '/' + vMonthStr + '/' + vYear4Str );
    case 'yyyy-mm-dd':
      return( vYear4Str + '-' + vMonthStr + '-' + vDayStr );
    case 'mm/dd/yy':
       return( vMonthStr + '/' + vDayStr + '/' + vYear2Str );
    case 'dd/mm/yy':
      eturn( vDayStr + '/' + vMonthStr + '/' + vYear2Str );
    case 'yy-mm-dd':
      return( vYear2Str + '-' + vMonthStr + '-' + vDayStr );
    case 'mm/dd':
      return( vMonthStr + '/' + vDayStr );
    case 'dd/mm':
      return( vDayStr + '/' + vMonthStr );
    case 'mm':
        return(vMonthStr );
    case 'yy':
        return( vYear2Str );
    case 'week-long':
      if (vMonthStr=='12' && vWeekNum==1) {
        vYear4Str=(parseInt(vYear4Str)+1)+'';
      }
      return ( '' + vYear4Str + " #" + vWeekNum + ' (' + vMonthArray[pDate.getMonth()] + ') ');
    case 'week-short':
      if (vMonthStr=='12' && vWeekNum==1) {
        vYear2Str=(parseInt(vYear2Str)+1)+'';
      }
      return ( vYear2Str + ' #'  + vWeekNum  );
    case 'week-firstday':
      fmt=window.top.getBrowserLocaleDateFormatJs();
      if (fmt.substr(0,5).toUpperCase()=="DD/MM") {
        return (  vDayStr + '/' + vMonthStr );
      } else {
        return ( vMonthStr + '/'  + vDayStr );
      }
    case 'year-long':
      return ( vYear4Str + '');
    case 'month-long':
      return ( vMonthArray[pDate.getMonth()].substr(0,10) + '' );      
  }  
};

/**
 * Specific funtion to get Week Number
 */
Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
};

JSGantt.benchMark = function(pItem){
  var vEndTime=new Date().getTime();
  consoleTraceLog(pItem + ': Elapsed time: '+((vEndTime-vBenchTime)/1000)+' seconds.');
  vBenchTime=new Date().getTime();
};

JSGantt.setSelected = function(pID) {
  var vRowObj1 = JSGantt.findObj('child_' + pID);
  if (vRowObj1) vRowObj1.className = "selectedrow" + pType;
  var vRowObj2 = JSGantt.findObj('childrow_' + pID);
  if (vRowObj2) vRowObj2.className = "selectedrow" + pType;
};

JSGantt.i18n = function (message) {
  return i18n(message);
};

JSGantt.drawFormat = function(vFormatArr, vFormat, vGanttVar, vPos) {
  var vLeftTable='<div style="position:relative;" id="ganttScale" class="ganttScale">';
  vLeftTable+='<span style="position:relative;top:2px">';
  vLeftTable+='<button dojoType="dijit.form.Button" showlabel="false"'
	     +' title="' + i18n('buttonCollapse') + '"'
	     +' style="font-size:5px; text-align: center; position: relative; top: -1px;vertical-align: middle; height:16px; width:16px;"'
	     +' onclick="JSGantt.collapseAll('+vGanttVar+');"'
	     +' iconClass="iconCollapse">'
	     +'</button>&nbsp;';
  vLeftTable+='</span><span style="position:relative;top:2px">';
  vLeftTable+='<button dojoType="dijit.form.Button" showlabel="false"'
	     +' title="' + i18n('buttonExpand') + '"'
	     +' style="font-size:5px;position: relative; top: -1px;vertical-align: middle; height:16px; width:16px;"'
	     +' onclick="JSGantt.expandAll('+vGanttVar+');"'
	     +' iconClass="iconExpand" >'
	     +'</button>&nbsp;';
  vLeftTable+='</span>&nbsp;';
  vLeftTable +='<span style="position:relative;top:1px"><b>' + JSGantt.i18n('periodScale') + '&nbsp;:&nbsp;&nbsp;</b></span>';
  if (vFormatArr.join().indexOf("day")!=-1) { 
    if (vFormat=='day') {
      vLeftTable += '<label class="ganttScale">'
    	+'<input type="RADIO" dojoType="dijit.form.RadioButton"'
    	+' name="radFormat' + vPos + '" value="day" checked />' 
    	+'<span class="ganttScaleText">'+JSGantt.i18n('day')+'</span>'
    	+'</label>';
    } else {
      vLeftTable += '<label class="ganttScale" style="cursor:pointer;">'
    	+'<input type="RADIO" dojoType="dijit.form.RadioButton"'
    	+' name="radFormat' + vPos + '"' 
        +' onChange=JSGantt.changeFormat("day",'+vGanttVar+'); value="day" />' 
        +'<span class="ganttScaleText">'+JSGantt.i18n('day')+'</span>'
        + '</label>';
    }
    vLeftTable += '&nbsp;&nbsp;';
  }
  if (vFormatArr.join().indexOf("week")!=-1) { 
    if (vFormat=='week') {
      vLeftTable += '<label class="ganttScale">'
    	+'<input type="RADIO" dojoType="dijit.form.RadioButton" '
    	+' name="radFormat' + vPos + '" value="week" checked />' 
    	+'<span class="ganttScaleText">'+JSGantt.i18n('week')+'</span>'
    	+'</label>';
    } else {
      vLeftTable += '<label class="ganttScale" style="cursor:pointer">'
    	+'<input type="RADIO" dojoType="dijit.form.RadioButton"'
        +' name="radFormat' + vPos + '"' 
        +' onChange=JSGantt.changeFormat("week",'+vGanttVar+') value="week" />'
        +'<span class="ganttScaleText">'+JSGantt.i18n('week')+'</span>'
        +'</label>';
    }
    vLeftTable += '&nbsp;&nbsp;';
  }
  if (vFormatArr.join().indexOf("month")!=-1) { 
    if (vFormat=='month') { 
      vLeftTable += '<label class="ganttScale">'
        +'<input type="RADIO" dojoType="dijit.form.RadioButton" '
        +'name="radFormat' + vPos + '" value="month" checked>' 
        +'<span class="ganttScaleText">'+JSGantt.i18n('month')+'</span>'
        +'</label>';
    } else {
      vLeftTable += '<label class="ganttScale" style="cursor:pointer">'
    	+'<input type="RADIO" dojoType="dijit.form.RadioButton"'
    	+' name="radFormat' + vPos + '"' 
        + ' onChange=JSGantt.changeFormat("month",'+vGanttVar+') value="month">' 
        +'<span class="ganttScaleText">'+JSGantt.i18n('month')+'</span>'
        +'</label>';
    }
    vLeftTable += '&nbsp;&nbsp;';
  }
  if (vFormatArr.join().indexOf("quarter")!=-1) { 
    if (vFormat=='quarter') {
	  vLeftTable += '<label class="ganttScale">'
        +'<input type="RADIO" dojoType="dijit.form.RadioButton" '
        +'name="radFormat' + vPos + '" value="quarter" checked>' 
        +'<span class="ganttScaleText">'+JSGantt.i18n('quarter')+'</span>'
        +'</label>';
    } else {
      vLeftTable += '<label class="ganttScale" style="cursor:pointer">'
    	+'<input type="RADIO" dojoType="dijit.form.RadioButton"'
    	+' name="radFormat' + vPos + '"' 
        + ' onChange=JSGantt.changeFormat("quarter",'+vGanttVar+') value="quarter">' 
        +'<span class="ganttScaleText">'+JSGantt.i18n('quarter')+'</span>'
        +'</label>';
    }
    vLeftTable += '&nbsp;&nbsp;';
  }
  vLeftTable+='</div>';
  return vLeftTable;
};

function setGanttVisibility(g, ganttType) {
  if(!ganttType)ganttType='planning';
  planningTypeIndice=getIndiceForPlanningType(ganttType);
  for (var i=0; i<planningFieldsDescription[planningTypeIndice].length ;i++) {
    planningFieldsDescription[planningTypeIndice][i].showSpecif=true;
  }
  if (dojo.byId('resourcePlanning')) {
    setPlanningFieldShowSpecif('Resource',0 ,ganttType); 
    setPlanningFieldShowSpecif('ValidatedWork',0 ,ganttType);
	  setPlanningFieldShowSpecif('ValidatedCost',0 ,ganttType);
	  setPlanningFieldShowSpecif('AssignedCost',0 ,ganttType);
	  setPlanningFieldShowSpecif('RealCost',0 ,ganttType);
	  setPlanningFieldShowSpecif('LeftCost',0 ,ganttType);
	  setPlanningFieldShowSpecif('PlannedCost',0 ,ganttType);
	}
	if (dojo.byId('portfolio')) {
	  setPlanningFieldShowSpecif('Resource',0 ,ganttType); 
	  //setPlanningFieldShow('priority',0 ,ganttType);
	  setPlanningFieldShowSpecif('IdPlanningMode',0 ,ganttType);
  }
	 if(!dojo.byId('portfolio')){
     setPlanningFieldShowSpecif('IdHealthStatus',0 ,ganttType);
     setPlanningFieldShowSpecif('QualityLevel',0 ,ganttType);
     setPlanningFieldShowSpecif('IdTrend',0 ,ganttType);
     setPlanningFieldShowSpecif('IdOverallProgress',0 ,ganttType);
  }
	if(!dojo.byId('contractGantt')){
	  setPlanningFieldShowSpecif('ObjectType',0 ,ganttType); 
	  setPlanningFieldShowSpecif('ExterRes',0 ,ganttType); 
	}
	if(dojo.byId('portfolio') || dojo.byId('contractGantt') || dojo.byId('versionPlanning')){
    setPlanningFieldShowSpecif('Responsible',0 ,ganttType);
    setPlanningFieldShowSpecif('RespInitial',0 ,ganttType);
  }
	g.setSortArray(planningColumnOrder[getIndiceForPlanningType(ganttType)]);
}
JSGantt.ganttMouseOver = function( pID, pPos, pType) {
  if (dojo.byId('bodyPrint')) return;
  if (! pType) {
  	vTaskList=g.getList();	
  	if( vTaskList[pID].getGroup()) {	
  		pType = "group";
    } else if( vTaskList[pID].getMile()){
    	pType  = "mile";
    } else {
    	pType  = "row";
    }
	  pID=vTaskList[pID].getID();
  } else if (ongoingJsLink>=0) {  
	document.body.style.cursor="url('css/images/dndLink.png'),help";
  }
  if (pID==vGanttCurrentLine) return;
  var vRowObj1 = JSGantt.findObj('child_' + pID);
  if (vRowObj1) vRowObj1.className = "dojoDndItem ganttTask" + pType + " ganttRowHover";
  var vRowObj2 = JSGantt.findObj('childrow_' + pID);
  if (vRowObj2) vRowObj2.className = "ganttTask" + pType + " ganttRowHover"+ ((ongoingJsLink>=0)?" ganttDndLink":"");
  //var vRowObj3 = JSGantt.findObj('child_row_' + pID);
  //if (vRowObj3) vRowObj3.className = "ganttTask" + pType + " ganttRowHover"
  if (pType && ongoingJsLink>=0) {  
	document.body.style.cursor="url('css/images/dndLink.png'),help";
  }
};

JSGantt.ganttMouseOut = function(pID, pPos, pType) {
  if (dojo.byId('bodyPrint')) return;
  if (! pType) {
  	vTaskList=g.getList();	
  	if( vTaskList[pID].getGroup()) {	
  		pType = "group";
    } else if( vTaskList[pID].getMile()){
    	pType  = "mile";
    } else {
    	pType  = "row";
    }
  	pID=vTaskList[pID].getID();
  }	
  if (pID==vGanttCurrentLine) return;	
  var vRowObj1 = JSGantt.findObj('child_' + pID);
  if (vRowObj1) vRowObj1.className = "dojoDndItem ganttTask" + pType;
  var vRowObj2 = JSGantt.findObj('childrow_' + pID);
  if (vRowObj2) vRowObj2.className = "ganttTask" + pType + ((ongoingJsLink>=0)?" ganttDndLink":"");
//  JSGantt.destroyEditRowButton(pID);
};

ongoingJsLink=-1;
JSGantt.startLink = function (idRow) {
//florent ticket 4397
  if(dojo.byId('versionsPlanning') || dojo.byId('contractGantt')){
    return;
  }  
  if (dojo.byId('bodyPrint')) return;
	vTaskList=g.getList();
	document.body.style.cursor="url('css/images/dndLink.png'),help";
	ongoingJsLink=idRow;
};
JSGantt.endLink = function (idRow) {
  if (dojo.byId('bodyPrint')) return;
	vTaskList=g.getList();
	document.body.style.cursor='default';
	if (ongoingJsLink>=0 && idRow!=ongoingJsLink) {
		var ref1Type=vTaskList[ongoingJsLink].getClass();
		scope1="Planning_"+ref1Type+"_";
		var ref1Id=vTaskList[ongoingJsLink].getScope().substr(scope1.length);
		var ref2Type=vTaskList[idRow].getClass();
		scope2="Planning_"+ref2Type+"_";
		var ref2Id=vTaskList[idRow].getScope().substr(scope2.length);
		var vRowObj2 = JSGantt.findObj('childrow_' + vTaskList[idRow].getID());
		if( vTaskList[idRow].getGroup()) {
	      vRowType = "group";
	    } else if( vTaskList[idRow].getMile()){
	      vRowType  = "mile";
	    } else {
	      vRowType  = "row";
	    }
		if (vRowObj2) vRowObj2.className = "ganttTask" + vRowType;
		saveDependencyFromDndLink(ref1Type,ref1Id,ref2Type, ref2Id);
	}
	ongoingJsLink=-1;
};
JSGantt.cancelLink = function (idRow) {
  if (dojo.byId('bodyPrint')) return;
	vTaskList=g.getList();
	document.body.style.cursor='default';
	if (idRow) {
		var vRowObj2 = JSGantt.findObj('childrow_' + vTaskList[idRow].getID());
		if( vTaskList[idRow].getGroup()) {
	      vRowType = "group";
	    } else if( vTaskList[idRow].getMile()){
	      vRowType  = "mile";
	    } else {
	      vRowType  = "row";
	    }
	}
	if (vRowObj2) vRowObj2.className = "ganttTask" + vRowType;
	ongoingJsLink=-1;
};
JSGantt.enterBarLink = function (idRow) {
  if (dojo.byId('bodyPrint')) return;
	JSGantt.ganttMouseOver(idRow);
	vTaskList=g.getList();
	if (ongoingJsLink>=0) {
		if (idRow!=ongoingJsLink) {
		  g.drawDependency(vTaskList[ongoingJsLink].getEndX(),vTaskList[ongoingJsLink].getEndY(),
			              vTaskList[idRow].getStartX()-1,vTaskList[idRow].getStartY(),
			              "#5050FF",true);
		}
		document.body.style.cursor="url('css/images/dndLink.png'),help";
	} else {
		document.body.style.cursor='pointer';
	}
};
JSGantt.exitBarLink = function (idRow, directClose) {
  if (dojo.byId('bodyPrint')) return;
	if(!directClose)JSGantt.ganttMouseOut(idRow);
	vTaskList=g.getList();
	if (ongoingJsLink>=0) {
	  document.body.style.cursor="url('css/images/dndLink.png'),help";
	  g.clearDependencies(true);
	} else {
	  document.body.style.cursor='default';
	}
	if (dojo.byId('rightTableBarDetail') && ! ongoingRunScriptContextMenu && lockPlanningBarDetail == '0') {
	  setTimeout("if (dojo.byId('rightTableBarDetail')) {dojo.byId('rightTableBarDetail').innerHTML='';dojo.byId('rightTableBarDetail').style.display='none';}",500);
	}else if(directClose && lockPlanningBarDetail == '1'){
	  if (dojo.byId('rightTableBarDetail')) {
      dojo.byId('rightTableBarDetail').innerHTML='';
      dojo.byId('rightTableBarDetail').style.display='none';
    }
	}
};

function leftMouseWheel(evt) {
	var oldTop=parseInt(dojo.byId('leftside').style.top);
	var newTop=oldTop;
	if (evt && evt.deltaMode==1) {
	  var delta=evt.deltaY;
	  if (dojo.isFF) {
	    if (delta>0) delta+=1;
	    else delta-=1;
	  }
	  newTop=oldTop-(delta*21);
	} else if (evt) {
	  newTop=oldTop-(evt.deltaY);
	}
	var visibleHeight=parseInt(dojo.byId('rightGanttChartDIV').style.height);
	var totalHeight=parseInt(dojo.byId('leftside').style.height);
	if (newTop>0) newTop=0;
  dojo.byId('rightGanttChartDIV').scrollTop +=oldTop-newTop;
  //dojo.byId('leftside').style.top=newTop+'px';
  dojo.byId('leftside').style.top='-'+(dojo.byId('rightGanttChartDIV').scrollTop)+'px';
}

function adjustSpecificDaysHeight() {
	vScpecificDayCount=1;
	var height=dojo.byId("rightTableContainer").offsetHeight;
	while (dojo.byId("vScpecificDay_"+vScpecificDayCount)) {
	  dojo.byId("vScpecificDay_"+vScpecificDayCount).style.height=height+'px';
	  vScpecificDayCount++;
	}
}

jsHeaderResizePos=null;
jsHeaderResizeField=null;
jsHeaderResizeSize=null;
function startResizeJsHeader(event,field) {
  jsHeaderResizeField=field;
  jsHeaderResizePos=event.clientX;
}
function stopResizeJsHeader(event) {
  if (!jsHeaderResizePos) return;
  jsHeaderResizePos=null;
  jsHeaderResizeField=null;
}
function resizeJsHeader(event) {
  if (!jsHeaderResizePos) return;
  var newWidth=dojo.byId('jsGanttHeader'+jsHeaderResizeField).style.width+event.clientX-jsHeaderResizePos;
  dojo.byId('jsGanttHeader'+jsHeaderResizeField).style.width=newWidth;
  dojo.byId('jsGanttHeaderTD'+jsHeaderResizeField).style.width=newWidth;
  jsHeaderResizePos=event.clientX;
}

function dependencyRightClick(evt){
  var divRightGanttChart=dojo.byId('rightGanttChartDIV');
  var divRightGanttChartHeight=parseInt(divRightGanttChart.style.height);
  var screenWidth = document.body.getBoundingClientRect().width;
  var divRightGanttChartTop=parseInt(divRightGanttChart.offsetTop)+115;
  depNode=evt.target;
  id=depNode.getAttribute('dependencyid');
  var divNode=dojo.byId("editDependencyDiv");
  var editDependencyDivHeight=parseInt(divNode.style.height);
  var editDependencyDivWidth=parseInt(divNode.style.width);
  divNode.style.display="block";
  divNode.style.left=((evt.pageX)+7)+"px";
  divNode.style.top=evt.pageY+"px";
  var streamWitdh=0;
  //florent 4433
  if (dojo.byId("detailRightDiv") && (dojo.byId("mainDivContainer").style.width !=  dojo.byId("detailRightDiv").style.width )) {
    streamWitdh=parseInt(dojo.byId("detailRightDiv").style.width)+5;
  }
  if(evt.pageY>divRightGanttChartHeight+divRightGanttChartTop-editDependencyDivHeight){
    divNode.style.top=(divRightGanttChartHeight+divRightGanttChartTop-editDependencyDivHeight)+"px";
  }else{
    divNode.style.top=evt.pageY+"px";
  }
  if (evt.pageX+editDependencyDivWidth>screenWidth-20-streamWitdh){
    divNode.style.left=(screenWidth-20-editDependencyDivWidth-streamWitdh)+"px";
  } else{
    divNode.style.left=((evt.pageX)+7)+"px";
  }
  var url = '../tool/dynamicDialogDependency.php?id='+ id;
  loadDiv(url, 'editDependencyDiv',null,null,null);
  evt.preventDefault();
  evt.stopPropagation();
}

function removeDependencyRightClick(dependencyId,evt){
  if (checkFormChangeInProgress()) {
    showAlert(i18n('alertOngoingChange'));
    return;
  }
  dependencyId=dojo.byId('dependencyRightClickId').value;
    loadContent("../tool/removeDependency.php?dependencyId=" + dependencyId, "resultDivMain", "",
        true, 'dependency');
  hideDependencyRightClick();
}

function saveDependencyRightClick() {
  if (!dojo.byId('delayDependency').value
        && !dojo.byId('commentDependency').value)
      return;
  if (isNaN(dojo.byId('delayDependency').value)) {
    showAlert(i18n('messageInvalidNumeric',new Array(i18n('colDependencyDelay'))));
    return;
  }
  loadContent("../tool/saveDependencyRightClick.php", "resultDivMain", "dynamicRightClickDependencyForm",
      true, 'dependency');
  dijit.byId('dialogDependency').hide();
  hideDependencyRightClick();
}

var oldDependencyColor=null;
function highlightDependency(event) { 
  var className=null;
  f = navigator.userAgent.search("Firefox");
  if(f > -1){
    className=event.target.getAttribute('class');
  }else{
    className=event.srcElement.getAttribute('class');
  }
  dojo.query("."+className).forEach(function(node, index, nodelist) {
    oldDependencyColor=node.style.backgroundColor;
    if (node.style.width=='1px') {
      node.style.width='3px';
      node.style.backgroundColor="#E97B2D";
    } else if (node.style.height=='1px') {
      node.style.height='3px';
      node.style.backgroundColor="#E97B2C";
    }
  });
}

function outHighlightDependency(event){
  var className=null;
  f = navigator.userAgent.search("Firefox");
  if(f > -1){
    className=event.target.getAttribute('class');
  }else{
    className=event.srcElement.getAttribute('class');
  }
  var color=(oldDependencyColor)?oldDependencyColor:"#000000";
  dojo.query("."+className).forEach(function(node, index, nodelist) {
    if (node.style.backgroundColor=="rgb(233, 123, 45)" || node.style.backgroundColor=="#E97B2D" )  {
      node.style.width='1px';
      node.style.backgroundColor=color;
    } else if (node.style.backgroundColor=="rgb(233, 123, 44)" || node.style.backgroundColor=="#E97B2C" ) {
      node.style.height='1px';
      node.style.backgroundColor=color;
    }
  });
  oldDependencyColor=null;
}

function hideDependencyRightClick(){
  var divNode=dojo.byId("editDependencyDiv");
  if (!divNode) return;
  divNode.style.display="none";
}

function drawLimitedDisplayMessage(msg){
  var divLeft=dojo.byId('leftGanttChartDIV'),
  divRight=dojo.byId('rightTableContainer'),
  divMessageL=document.createElement("div"),
  divMessageR=document.createElement("div"),
  inputInfoLimited=document.createElement("input");

  var  RWidth=divRight.getElementsByClassName('ganttDetail');
  var  lWidth=divLeft.getElementsByClassName('ganttLeftHover');

  divMessageL.style="background:#FFDDDD;font-size:150%;color:#808080;text-align:left;padding: 10px 50px 10px;";
  divMessageR.style="background:#FFDDDD;font-size:150%;color:#808080;text-align:left;padding: 10px 50px 10px;";
  
  divMessageL.style.width=(lWidth[0].offsetWidth+24) +"px";
  divMessageR.style.width=(RWidth[0].offsetWidth)-100+"px";
  divMessageR.setAttribute('position','relative');
  
  inputInfoLimited.setAttribute('id','divMessageLimitedDisplay');
  inputInfoLimited.setAttribute('type','hidden');
  inputInfoLimited.setAttribute('value',msg);
  
  divMessageL.insertAdjacentHTML('beforeend', msg);
  divMessageR.insertAdjacentHTML('beforeend', msg);
  
  
  divLeft.insertAdjacentHTML('beforeend', divMessageL.outerHTML);
  divRight.insertAdjacentHTML('afterend', divMessageR.outerHTML);
  divRight.insertAdjacentHTML('afterend', inputInfoLimited.outerHTML);
}

function editRowSaveCallback(pId, refId, refClass, idProject){
  if(dijit.byId('dialogEditRowObjectUpdate'))dijit.byId('dialogEditRowObjectUpdate').hide();
  if(dojo.byId('lastOperationStatus') && (dojo.byId('lastOperationStatus').value == 'OK' || dojo.byId('lastOperationStatus').value == 'NO_CHANGE')){
    enableWidget('planButton');
    enableWidget('automaticRunPlanSwitch');
    enableWidget('saveBaselineButtonMenu');
    enableWidget('planningNewItem');
    enableWidget('listFilterFilter');
    enableWidget('planningColumnSelector');
    enableWidget('extraButtonPlanning');
    enableWidget('menuLayoutScreenButton');
    formChangeInProgress=false;
    currentRowToEdit = pId;
    vGanttCurrentLine = null;
  }
  if (refClass=='Replan' || refClass=='Construction' || refClass=='Fixed') refClass='Project';
  cachedEditRowPlanningClick = 'JSGantt.planningRowClickAction(\''+pId+'\', '+refId+', \''+refClass+'\', '+idProject+')';
}

var clickPlanningTimeout = null;
JSGantt.planningRowClickAction = function(pId, refId, refClass, idProject){
  if(waitingForReply){
    waitingForReply = false;
    return;
  }
  var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  var isDetailClose = (coverListAction == 'OPEN')?false:true;
  var planningEditMode = (dojo.byId('buttonEditRowDetail'))?true:false;
  if (refClass=='Replan' || refClass=='Construction' || refClass=='Fixed') refClass='Project';
  var callback = function () {
    JSGantt.saveEditRowObject(true, editRowSaveCallback(pId, refId, refClass, idProject));
  }
  if(checkPlanningFormChange(callback))return;
  if(dojo.byId('idProjectRow'))dojo.byId('idProjectRow').value = idProject;
  if(planningClickAction == 1 || coverListAction == 'OPEN'){
    if(vGanttCurrentLine != pId){
      JSGantt.selectGanttRowToEdit(pId);
      cachedEditRowPlanningClick = 'JSGantt.planningRowClickAction(\''+pId+'\', '+refId+', \''+refClass+'\', '+idProject+')';
      runScript(refClass, refId, pId);
    }else{
      cachedEditRowPlanningClick = 'JSGantt.planningRowClickAction(\''+pId+'\', '+refId+', \''+refClass+'\', '+idProject+')';
      JSGantt.editRowObjectPlanning(pId, refId, refClass, idProject);
    }
  }else{
    if(vGanttCurrentLine != pId || !planningEditMode){
      JSGantt.selectGanttRowToEdit(pId);
    }
    cachedEditRowPlanningClick = 'JSGantt.planningRowClickAction(\''+pId+'\', '+refId+', \''+refClass+'\', '+idProject+')';
    JSGantt.editRowObjectPlanning(pId, refId, refClass, idProject);
  }
};

var currentRowToEdit = null;
var defaultValueOnchange = true;
var finalizeEditRowDefaultValueTimeout = null;
var cachedEditRowPlanningClick = null;
var isEditRowFinishDisplay = false;
var GetIsClosed = null;
var GetCanbeUpdated = null;
var GetHtmlDrawOption = null;
JSGantt.editRowObjectPlanning = function(pId, refId, refClass, idProject){
  if(waitingForReply){
    waitingForReply = false;
    highlightPlanningLine(pId);
    return;
  }
  var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  if(planningType == 'contract' || planningType == 'version'){
    highlightPlanningLine(pId);
    return;
  }
  if(planningType == 'resource' && (refClass == 'Resource' || refClass == 'Project')){
    highlightPlanningLine(pId);
    return;
  }
  if (refClass=='Replan' || refClass=='Construction' || refClass=='Fixed') refClass='Project';
  var refItem = refClass+'_'+refId;
  var isPlanningElement = (pId.indexOf('_') > -1)?false:true;
  var editableFields = getPlanningEditableFields(planningType, refItem, isPlanningElement);
  if(!editableFields){
    highlightPlanningLine(pId);
    return;
  }
  if(dojo.byId('idProjectRow'))dojo.byId('idProjectRow').value = idProject;
  var isEditModeActive = (dojo.byId('buttonEditRowDetail'))?true:false;
  if(!isEditModeActive && !isEditRowFinishDisplay){
    if(waitingForReply){
      waitingForReply = false;
      highlightPlanningLine(pId);
      return;
    }
    highlightPlanningLine(pId);
    currentRowToEdit = pId;
    vGanttCurrentLine = pId;
    formChangeInProgress=false;
    defaultValueOnchange = true;
    if(GetIsClosed && !GetIsClosed.isResolved()){
      GetIsClosed.cancel();
      GetIsClosed = null;
    }
    if(GetCanbeUpdated && !GetCanbeUpdated.isResolved()){
      GetCanbeUpdated.cancel();
      GetCanbeUpdated = null;
    }
    if(GetHtmlDrawOption && !GetHtmlDrawOption.isResolved()){
      GetHtmlDrawOption.cancel();
      GetHtmlDrawOption = null;
    }
    if(dojo.byId('ganttLeftHover_'+pId))dojo.byId('ganttLeftHover_'+pId).style.display = 'none';
    var editButtonDetail = dojo.byId('ganttEditButtonDetail_'+pId);
    var divButtonDetail = dojo.create('div', {
      dojoType: 'dijit.layout.ContentPane',
      region:'center',
      className: 'ganttEditableField',
      style: 'position: absolute;right:2px;top:2px;z-index:999999;',
    }, editButtonDetail);
    var buttonDetail=dojo.create('div', { 
      id : 'buttonEditRowDetail',
      title : (planningClickAction == 1)?i18n('contextMenuButtonEditOnline'):i18n('contextMenuButtonOpen'),
      className: (planningClickAction == 1)?'iconButtonEdit16 iconButtonEdit iconSize16 imageColorNewGui':'iconButtonView16 iconButtonView iconSize16 imageColorNewGui',
      onClick : (planningClickAction == 1)?'JSGantt.editRowObjectPlanning(\''+pId+'\', '+refId+', \''+refClass+'\', '+idProject+');':'openObjectFromContextMenu(\''+refClass+'\', '+refId+', \''+pId+'\', '+idProject+');',
      style: 'margin: 0px 1px 0px 1px !important;',
    }, divButtonDetail);
    dojo.parser.parse(editButtonDetail);
    GetIsClosed = dojo.xhrGet({
      url:'../tool/getSingleData.php?dataType=isClosed&objectClass=' + refClass + '&objectId='+refId+'&csrfToken=' + csrfToken,
      handleAs:"text",
      failOk : true,
      load:function(isClosed) {
        GetCanbeUpdated = dojo.xhrGet({
          url:'../tool/getSingleData.php?dataType=canUpdateObject&objectClass=' + refClass + '&objectId='+refId+'&csrfToken=' + csrfToken,
          handleAs:"text",
          failOk : true,
          load:function(canUpdateObject) {
            if(canUpdateObject){
              if(canUpdateObject == 'YES'){
                var planningListform = dojo.byId('planningListForm');
                dojo.create('input', { 
                  id : 'editRowMode',
                  name : 'editRowMode',
                  type: 'hidden',
                  className: 'ganttEditableField',
                  value : pId,
                }, planningListform);
                dojo.create('input', { 
                  id : 'objectClassName',
                  name : 'objectClassName',
                  type: 'hidden',
                  className: 'ganttEditableField',
                  value : refClass,
                }, planningListform);
                dojo.create('input', { 
                  id : 'objectId',
                  name : 'objectId',
                  type: 'hidden',
                  className: 'ganttEditableField',
                  value : refId,
                }, planningListform);
                var editButtonDiv = dojo.byId('ganttEditButton_'+pId);
                var divButton = dojo.create('div', {
                  dojoType: 'dijit.layout.ContentPane',
                  region:'center',
                  className: 'ganttEditableField ganttEditableFieldHidden',
                  style: 'position: absolute;overflow: hidden;left:1px;top:0px;background:white;border-radius:5px;z-index:999999;border: 1px solid rgb(212, 212, 212);',
                }, editButtonDiv);
                var buttonSave=dojo.create('Button', { 
                  id : 'buttonEditRowSave',
                  dojoType : 'dijit.form.Button',
                  showlabel : 'false',
                  title : i18n('buttonSave', new Array(i18n(refClass))),
                  iconClass : 'iconButtonSave16 iconButtonSave iconSize16',
                  className: 'detailButton roundedButtonSmall',
                  onClick : 'JSGantt.saveEditRowObject(true, null)',
                  style: 'margin: 0px 3px 0px 5px !important;',
                }, divButton);
                var buttonCancel=dojo.create('Button', { 
                  id : 'buttonEditRowCancel',
                  dojoType : 'dijit.form.Button',
                  showlabel : 'false',
                  title : i18n('buttonUndo', new Array(i18n(refClass))),
                  iconClass : 'iconButtonCancel16 iconButtonCancel iconSize16',
                  className: 'detailButton roundedButtonSmall',
                  onClick : 'JSGantt.closeAndSelectEditRow(\''+pId+'\', '+refId+', \''+refClass+'\', '+idProject+');',
                  style: 'margin: 0px 5px 0px 3px !important;',
                }, divButton);
                dojo.parser.parse(editButtonDiv);
                editableFields.forEach(function(field){
                  var name = field.name;
                  if(name == 'IdPlanningMode' && (refClass == 'Project' || refClass=='Replan' || refClass=='Construction' || refClass=='Fixed'))return;
                  if(name == 'UnitProgress' && refClass != 'Activity')return;
                  if((name == 'ValidatedDuration' || name == 'ValidatedCost' || name == 'ValidatedStartDate' || name == 'ValidatedWork') && refClass == 'Milestone')return;
                  if(isClosed == 1 && name != 'IdStatus')return;
                  var currentField = dojo.byId('gantt'+field.name+'_'+pId);
                  if(currentField){
                    var width = (name=='Name')?(field.width-45)+1:field.width+1;
                    var top = 0;
                    var right = (name=='Name')?-7:0;
                    var fieldDiv=dojo.create('div', { 
                      dojoType: 'dijit.layout.ContentPane',
                      region:'center',
                      className: 'ganttEditableField ganttEditableFieldHidden',
                      style:'position: absolute;overflow: hidden;z-index: 999999;right:'+right+'px;top: '+top+'px;width:'+width+'px;height:21px;'
                      }, currentField);
                    var fieldValue = (field.type=='number')?Number(field.rawValue):field.rawValue;
                    var nameField = name.charAt(0).toLowerCase() + name.slice(1);
                    if(name == 'Type')nameField='id'+refClass+'Type';
                    if(name == 'IdPlanningMode')nameField='id'+refClass+'PlanningMode';
                    var idField = 'editInput'+nameField.charAt(0).toUpperCase() + nameField.slice(1);
                    var type = (field.type=='select')?field.type:'div';
                    var widthInput = (name=='Name')?width-8+'px':width-1+'px';
                    var fieldInput=dojo.create(type, { 
                      id : idField,
                      name : nameField,
                      type : field.type,
                      dojoType: field.inputType,
                      className: nameField+'Class input rounded',
                      required : false,
                      style: 'width:'+widthInput+' !important;height:18px !important;margin: unset !important;padding: 0px !important;font-size: 10px;',
                    }, fieldDiv);
                    var required = (isPlanningElement && (name == 'Type' || name == 'IdPlanningMode' || name == 'IdStatus'))?'getExtraRequiredFields();':'';
                    var setDefaultPMode = (name == 'Type' && (refClass == 'Activity' || refClass == 'Milestone' || refClass == 'TestSession'))?'setDefaultPlanningMode(this.value);':'';
                    var setDefaultPrio = (name == 'Type' && refClass == 'Activity')?'setDefaultPriority(this.value);':'';
                    var colScript = 
                      '<script type="dojo/method" event="onFocus" args="evt">'
                      +'  dojo.addClass(dojo.byId(\'widget_\'+this.id), \'editInputFieldFocus\');'
                      +'</script>'
                      +'<script type="dojo/method" event="onBlur" args="evt">'
                      +'  dojo.removeClass(dojo.byId(\'widget_\'+this.id), \'editInputFieldFocus\');'
                      +'</script>';
                    var interceptPoint = '';
                    if(field.type == 'number'){
                      interceptPoint =
                        '  if(evt.keyCode == 110){'
                        +'    intercepPointKey(this,evt);'
                        +' }';
                    }
                    var keyDownChange = '';
                    if(field.type != 'date' && field.type != 'select'){
                      keyDownChange =
                         'if(!defaultValueOnchange){'
                        +'  var defaultValue=\''+fieldValue+'\';'
                        +'  var newValue = dojo.byId(this.id).value;'
                        +'  if(defaultValue != newValue.toString()){'
                        +'    formChanged();'
                        +'  }'
                        +'}';
                    }
                    colScript +=
                      '<script type="dojo/method" event="onKeyDown" args="evt">'
                      +'  if(evt.keyCode == 9){'
                      +'    JSGantt.updateEditableInputFieldFocus(\''+refClass+'\', '+refId+', \''+pId+'\', \'this.id\');'
                      +'    if(dojo.byId(\'editModeCurrentInputFocus\')){dojo.byId(\'editModeCurrentInputFocus\').value = this.id;}'
                      +'    var firstField = (dojo.byId(\'editModeFirstInputFocus\'))?dojo.byId(\'editModeFirstInputFocus\').value:null;'
                      +'    var lastField = (dojo.byId(\'editModeLastInputFocus\'))?dojo.byId(\'editModeLastInputFocus\').value:null;' 
                      +'    if(evt.shiftKey == true && firstField == this.id){'
                      +'      if(lastField){'
                      +'        evt.preventDefault();'
                      +'        dojo.byId(lastField).focus();'
                      +'        if(dojo.byId(\'editModeCurrentInputFocus\')){dojo.byId(\'editModeCurrentInputFocus\').value = lastField;}' 
                      +'      }'
                      +'    }else if(evt.shiftKey == false && lastField == this.id){'
                      +'      if(firstField){'
                      +'        evt.preventDefault();'
                      +'        dojo.byId(firstField).focus();'
                      +'        if(dojo.byId(\'editModeCurrentInputFocus\')){dojo.byId(\'editModeCurrentInputFocus\').value = firstField;}'
                      +'      }'
                      +'    }'
                      +'  }'
                      +interceptPoint
                      +keyDownChange
                      +'</script>';
                    var scriptOnChange =
                       '<script type="dojo/connect" event="onChange" >'
                      +'  if(defaultValueOnchange)return;'
                      +'  if (!defaultValueOnchange && testAllowedChange(this.value)) {'
                      +'    terminateChange();'
                      +'    formChanged();'
                      +'  }'
                      +required
                      +setDefaultPMode
                      +setDefaultPrio
                      +'</script>';
                    if(field.type == 'select'){
                      var col = name;
                      if(name.indexOf('Id') != -1){
                        col = name.charAt(0).toLowerCase() + name.slice(1);
                      }
                      GetHtmlDrawOption = dojo.xhrGet({
                        url : "../tool/getHtmlDrawOptionForReference.php?col="+col+"&selection="+fieldValue+"&refType="+refClass+"&refId="+refId+"&csrfToken="+csrfToken,
                        handleAs : "text",
                        sync : true,
                        failOk : true,
                        load : function(data, args) {
                          fieldInput.innerHTML = data+scriptOnChange+colScript;
                        },
                        handle: function(error, ioargs){
                          GetHtmlDrawOption = null;
                        }
                      });
                    }else{
                      if (nameField=="validatedStartDate") {
                        colScript += '<script type="dojo/connect" event="onChange" >';
                        colScript += '  if(defaultValueOnchange)return;';
                        colScript += '  if (!defaultValueOnchange && testAllowedChange(this.value)) {';
                        colScript += '    var startDate=dijit.byId("editInputValidatedStartDate").get("value");';
                        colScript += '    var duration=dijit.byId("editInputValidatedDuration").get("value");';
                        colScript += '    var endDate=addWorkDaysToDate(startDate,duration,'+idProject+');';
                        colScript += '    if ((duration || duration===0) && endDate) dijit.byId("editInputValidatedEndDate").set("value",endDate);';
                        colScript += '    terminateChange();';
                        colScript += '    formChanged();';
                        colScript += '  }';
                        colScript += '</script>';
                      } else if (nameField=="validatedEndDate") {
                        colScript += '<script type="dojo/connect" event="onChange" >';
                        colScript += '  if(defaultValueOnchange)return;';
                        colScript += '  if (!defaultValueOnchange && testAllowedChange(this.value)) {';    
                        colScript += '    var endDate=this.value;';
                        colScript += '    var startDate=dijit.byId("editInputValidatedStartDate").value;';
                        colScript += '    var duration=workDayDiffDates(startDate, endDate, '+idProject+');';
                        colScript += '    if (endDate && startDate && duration) dijit.byId("editInputValidatedDuration").set("value",duration);';
                        colScript += '    terminateChange();';
                        colScript += '    formChanged();';
                        colScript += '  }';   
                        colScript += '</script>';
                      } else if (nameField=="validatedDuration") {
                        colScript += '<script type="dojo/connect" event="onChange" >';
                        colScript += '  if(defaultValueOnchange)return;';
                        colScript += '  var value=dijit.byId("editInputValidatedDuration");';
                        colScript += '  if (!defaultValueOnchange && testAllowedChange(value)) {';
                        colScript += '    var duration=(value==null || value=="")?"":parseInt(value.get("value"));';
                        colScript += '    var startDate=dijit.byId("editInputValidatedStartDate").get("value");';
                        colScript += '    var endDate=dijit.byId("editInputValidatedEndDate").get("value");';
                        colScript += '    if (duration!=null && duration!="") {';
                        colScript += '      if (startDate!=null && startDate!="") {';
                        colScript += '        endDate = addWorkDaysToDate(startDate,duration,'+idProject+');';
                        colScript += '        dijit.byId("editInputValidatedEndDate").set("value",endDate);';
                        colScript += '      }';
                        colScript += '    }';
                        colScript += '    terminateChange();';
                        colScript += '    formChanged();';
                        colScript += '  }';
                        colScript += '</script>';
                      }else{
                        colScript += scriptOnChange;
                      }
                      fieldInput.innerHTML = colScript;
                    }
                    dojo.parser.parse(currentField);
                    if(field.type != 'select'){
                      if(!fieldValue && field.type=='date')fieldValue=null;
                      if(name == 'Name')fieldValue = htmlDecode(htmlDecode(fieldValue));
                      dijit.byId(idField).set('value', fieldValue);
                    }
                  }
                });
                clearTimeout(finalizeEditRowDefaultValueTimeout);
                finalizeEditRowDefaultValueTimeout = setTimeout('finalizeEditRowDefaultValue()', 100);
              }
            }
          },
          handle: function(error, ioargs){
            GetCanbeUpdated = null;
          }
        });
      },
      handle: function(error, ioargs){
        GetIsClosed = null;
      }
    });
  }else{
    var isEditModeActive = (dojo.byId('editRowMode'))?true:false;
    var isEditModeDisplay = (dojo.byId('buttonEditRowDetail'))?true:false;
    if(!isEditModeActive && isEditModeDisplay){
      highlightPlanningLine(pId);
      return;
    }
    if(isEditRowFinishDisplay){
      highlightPlanningLine(pId);
      return;
    }
    hideDetailScreen();
    highlightPlanningLine(pId, true);
    if(dojo.byId('buttonEditRowDetail')){
      dojo.byId('buttonEditRowDetail').style.display = 'none';
    }
    dojo.query('.ganttEditableFieldHidden').forEach(function(node){
      dojo.removeClass(node, 'ganttEditableFieldHidden');
    });
    JSGantt.updateEditableInputFieldFocus(objectClass, objectId, pId);
    isEditRowFinishDisplay = true;
  }
};

function finalizeEditRowDefaultValue(){
  var isEditModeActive = (dojo.byId('buttonEditRowDetail'))?true:false;
  formChangeInProgress=false;
  defaultValueOnchange=false;
  getExtraReadonlyFields();
  getExtraRequiredFields();
}

JSGantt.updateEditableInputFieldFocus = function(refClass, refId, pId, currentFocus){
  var firstField = null;
  var lastField = null;
  if (refClass=='Replan' || refClass=='Construction' || refClass=='Fixed') refClass='Project';
  var refItem = refClass+'_'+refId;
  var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  var isPlanningElement = (pId.indexOf('_') > -1)?false:true;
  var editableFields = getPlanningEditableFields(planningType, refItem, isPlanningElement);
  if(!editableFields)return;
  var planningListform = dojo.byId('planningListForm');
  editableFields.forEach(function(field){
    if((field.name == 'ValidatedDuration' || field.name == 'ValidatedCost' || field.name == 'ValidatedStartDate' || field.name == 'ValidatedWork') && refClass == 'Milestone')return;
    if(field.name == 'IdPlanningMode' && (refClass == 'Project' || refClass=='Replan' || refClass=='Construction' || refClass=='Fixed'))return;
    var nameField = field.name.charAt(0).toLowerCase() + field.name.slice(1);
    if(field.name == 'Type')nameField='id'+refClass+'Type';
    if(field.name == 'IdPlanningMode')nameField='id'+refClass+'PlanningMode';
    var idField = 'editInput'+nameField.charAt(0).toUpperCase() + nameField.slice(1);
    if(dijit.byId(idField)){
      if(dijit.byId(idField).get('disabled') == true){
        dojo.byId(idField).blur();
        return;
      }
    }
    if(!firstField){
      firstField = idField;
    }
    lastField = idField;
  });
  if(dojo.byId('editModeFirstInputFocus')){
    if(firstField)dojo.byId('editModeFirstInputFocus').value = firstField;
  }else{
    dojo.create('input', { 
      id : 'editModeFirstInputFocus',
      name : 'editModeFirstInputFocus',
      type: 'hidden',
      className: 'ganttEditableField',
      value : firstField,
    }, planningListform);
  }
  if(dojo.byId('editModeLastInputFocus')){
    if(lastField)dojo.byId('editModeLastInputFocus').value = lastField;
  }else{
    dojo.create('input', { 
      id : 'editModeLastInputFocus',
      name : 'editModeLastInputFocus',
      type: 'hidden',
      className: 'ganttEditableField',
      value : lastField,
    }, planningListform);
  }
  
  if(dojo.byId('editModeCurrentInputFocus') && currentFocus){
    dojo.byId('editModeCurrentInputFocus').value = currentFocus;
  }else{
    dojo.create('input', { 
      id : 'editModeCurrentInputFocus',
      name : 'editModeCurrentInputFocus',
      type: 'hidden',
      className: 'ganttEditableField',
      value : currentFocus,
    }, planningListform);
  }
  focusCurrentEditRowInput();
}

JSGantt.SetEditableInputFieldFocus = function(field, pId, refId, refClass, idProject){
  if(waitingForReply){
    waitingForReply = false;
    return;
  }
  if(isEditRowFinishDisplay)return;
  var isEditModeActive = (dojo.byId('buttonEditRowDetail'))?true:false;
  var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  if (refClass=='Replan' || refClass=='Construction' || refClass=='Fixed') refClass='Project';
  if(isPlanningFieldEditable(planningType, field)){
    var planningListform = dojo.byId('planningListForm');
    var nameField = field.charAt(0).toLowerCase() + field.slice(1);
    if(field == 'Type')nameField='id'+refClass+'Type';
    if(field == 'IdPlanningMode')nameField='id'+refClass+'PlanningMode';
    var idField = 'editInput'+nameField.charAt(0).toUpperCase() + nameField.slice(1);
    
    if(dojo.byId('editModeCurrentInputFocus')){
      dojo.byId('editModeCurrentInputFocus').value = nameField;
    }else{
      dojo.create('input', { 
        id : 'editModeCurrentInputFocus',
        name : 'editModeCurrentInputFocus',
        type: 'hidden',
        className: 'ganttEditableField',
        value : nameField,
      }, planningListform);
    }
  }
  if(isEditModeActive && isEditRowFinishDisplay)return;
  hideDetailScreen();
  cachedEditRowPlanningClick = 'JSGantt.planningRowClickAction(\''+pId+'\', '+refId+', \''+refClass+'\', '+idProject+')';
  JSGantt.editRowObjectPlanning(pId, refId, refClass, idProject);
}

function focusCurrentEditRowInput(){
  var isEditModeActive = (dojo.byId('buttonEditRowDetail'))?true:false;
  if(isEditModeActive){
    if(dojo.byId('editModeCurrentInputFocus') && dojo.byId('editModeCurrentInputFocus').value){
      var nameField = dojo.byId('editModeCurrentInputFocus').value;
      var idField = 'editInput'+nameField.charAt(0).toUpperCase() + nameField.slice(1);
      if(dojo.byId(idField))dojo.byId(idField).focus();
    }
  }
}

JSGantt.closeEditRowObjectPlanning = function(){
  formChangeInProgress=false;
  enableWidget('planButton');
  enableWidget('automaticRunPlanSwitch');
  enableWidget('saveBaselineButtonMenu');
  enableWidget('planningNewItem');
  enableWidget('listFilterFilter');
  enableWidget('planningColumnSelector');
  enableWidget('extraButtonPlanning');
  enableWidget('menuLayoutScreenButton');
  
  dojo.query('.ganttEditableField').forEach(function(node){
    if(dijit.byId(node.id))dijit.byId(node.id).set('content', null);
    node.remove();
  });
  if(currentRowToEdit && dojo.byId('ganttLeftHover_'+currentRowToEdit)){
    dojo.byId('ganttLeftHover_'+currentRowToEdit).style.display = '';
  }
  cachedEditRowPlanningClick = null;
  isEditRowFinishDisplay = false;
  vGanttCurrentLine = null;
  currentRowToEdit = null;
  defaultValueOnchange = true;
  clickCloseBoxOnMessage('resultDivMain');
};

JSGantt.saveEditRowObject = function(noReplan, callback) {
  if (!currentRowToEdit) return;
  if (waitingForReply) {
    showInfo(i18n("alertOngoingQuery"));
    return true;
  }
  if (dojo.byId("buttonEditRowSave")) dojo.byId("buttonEditRowSave").blur();
  var formName = 'planningListForm'
  if(dijit.byId('editRowObjectResultForm')){
    formName = 'editRowObjectResultForm';
  }
  var formVar=dijit.byId(formName);
  
  var editRowObjectClass = (dojo.byId('objectClassName'))?dojo.byId('objectClassName').value:null;
  if (editRowObjectClass=='Replan' || editRowObjectClass=='Construction' || editRowObjectClass=='Fixed') editRowObjectClass='Project';
  var editRowObjectId = (dojo.byId('objectId'))?dojo.byId('objectId').value:null;
  var editRowObjectIdProject = (dojo.byId('idProjectRow'))?dojo.byId('idProjectRow').value:null;
  var planningType = (dojo.byId('planningType'))?dojo.byId('planningType').value:'planning';
  var currentRowId = (dojo.byId('editRowMode'))?dojo.byId('editRowMode').value:null;
  var refItem = editRowObjectClass+'_'+editRowObjectId;
  var isPlanningElement = (currentRowId.indexOf('_') > -1)?false:true;
  var editables = getPlanningEditableFields(planningType, refItem, isPlanningElement);
  var editableFields = '';
  editables.forEach(function(element){
    editableFields += element.name.charAt(0).toLowerCase() + element.name.slice(1) + ',';
  });
  var confirmed = (dojo.byId('editRowObjectConfirm') && dojo.byId('editRowObjectConfirm').value == 1)?'&confirmed=true':'';
  var page = "../tool/saveEditRowObject.php?csrfToken=" + csrfToken + '&editableFields='+editableFields+confirmed;
  var destination = "resultDivMain";
  if (!formVar) {
    showError(i18n("errorSubmitForm",new Array(page,destination,formName)));
    return;
  }
  
  if (typeof CKEDITOR.instances.editRowObjectResult != 'undefined') {
    CKEDITOR.instances.editRowObjectResult.updateElement();
  }
  if (typeof CKEDITOR.instances.editRowObjectDescription != 'undefined') {
    CKEDITOR.instances.editRowObjectDescription.updateElement();
  }
  
  var validationType = (noReplan)?'quickPlanningEditSave':null;
  
  if(formName == 'editRowObjectResultForm'){
      callback = function(){
        if(dojo.byId('lastOperationStatus') && (dojo.byId('lastOperationStatus').value == 'OK' || dojo.byId('lastOperationStatus').value == 'NO_CHANGE')){
          enableWidget('planButton');
          enableWidget('automaticRunPlanSwitch');
          enableWidget('saveBaselineButtonMenu');
          enableWidget('planningNewItem');
          enableWidget('listFilterFilter');
          enableWidget('planningColumnSelector');
          enableWidget('extraButtonPlanning');
          enableWidget('menuLayoutScreenButton');
          formChangeInProgress=false;
          defaultValueOnchange=true;
          isEditRowFinishDisplay = false;
          vGanttCurrentLine = null;
          if(dijit.byId('dialogEditRowObjectUpdate'))dijit.byId('dialogEditRowObjectUpdate').hide();
          if(cachedEditRowPlanningClick)setTimeout(cachedEditRowPlanningClick, 100);
        }
      }
  }
  if(!callback){
    callback = function(){
      enableWidget('planButton');
      enableWidget('automaticRunPlanSwitch');
      enableWidget('saveBaselineButtonMenu');
      enableWidget('planningNewItem');
      enableWidget('listFilterFilter');
      enableWidget('planningColumnSelector');
      enableWidget('extraButtonPlanning');
      enableWidget('menuLayoutScreenButton');
      isEditRowFinishDisplay = false;
      vGanttCurrentLine = null;
      formChangeInProgress=false;
      defaultValueOnchange=true;
    };
  }
  loadContent(page,destination,formName,true,validationType,null,false,callback);
}

function checkPlanningFormChange(callback) {
  if (formChangeInProgress) {
    if (callback) {
      callback();
    }
    return true;
  } else {
    return false;
  }
}

JSGantt.selectGanttRowToEdit = function(rowId){
  JSGantt.closeEditRowObjectPlanning();
  currentRowToEdit = rowId;
  vGanttCurrentLine = rowId;
  highlightPlanningLine(rowId);
}

JSGantt.closeAndSelectEditRow = function(rowId, refId, refClass, idProject){
  var isEditModeActive = (dojo.byId('buttonEditRowDetail'))?true:false;
  if(!isEditModeActive)return;
  if (refClass=='Replan' || refClass=='Construction' || refClass=='Fixed') refClass='Project';
  JSGantt.selectGanttRowToEdit(rowId);
  cachedEditRowPlanningClick = 'JSGantt.planningRowClickAction(\''+rowId+'\', '+refId+', \''+refClass+'\', '+idProject+')';
  JSGantt.editRowObjectPlanning(rowId, refId, refClass, idProject);
}