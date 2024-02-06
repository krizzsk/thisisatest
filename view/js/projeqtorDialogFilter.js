///*******************************************************************************
// * COPYRIGHT NOTICE *
// * 
// * Copyright 2009-2017 ProjeQtOr - Pascal BERNARD - support@projeqtor.org Contributors : -
// * 
// * This file is part of ProjeQtOr.
// * 
// * ProjeQtOr is free software: you can redistribute it and/or modify it under
// * the terms of the GNU Affero General Public License as published by the Free Software
// * Foundation, either version 3 of the License, or (at your option) any later
// * version.
// * 
// * ProjeQtOr is distributed in the hope that it will be useful, but WITHOUT ANY
// * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// * 
// * You should have received a copy of the GNU Affero General Public License along with
// * ProjeQtOr. If not, see <http://www.gnu.org/licenses/>.
// * 
// * You can get complete code of ProjeQtOr, other resource, help and information
// * about contributors at http://www.projeqtor.org
// * 
// * DO NOT REMOVE THIS NOTICE **
// ******************************************************************************/
//
//// ============================================================================
//// All specific ProjeQtOr functions and variables for Dialog Purpose
//// This file is included in the main.php page, to be reachable in every context
//// ============================================================================

// =============================================================================
// = Filter
// =============================================================================

var filterStartInput=false;
var filterFromDetail=false;
function showFilterDialog() {
  function callBack() {
    filterStartInput=false;
    window.top.filterFromDetail=false;
    if (window.top.dijit.byId('dialogDetail').open) {
      window.top.filterFromDetail=true;
      dojo.byId('filterDefaultButtonDiv').style.display='none';
    } else {
      dojo.byId('filterDefaultButtonDiv').style.display='block';
    }
    dojo.style(dijit.byId('idFilterOperator').domNode,{
      visibility:'hidden'
    });
    dojo.style(dijit.byId('filterValue').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueList').domNode,{
      display:'none'
    });
    if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    dojo.style(dijit.byId('showDetailInFilter').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueCheckbox').domNode,{
      display:'none'
    });
    if (dijit.byId('filterValueCheckboxSwitch')) {
      dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
        display:'none'
      });
    }
    dojo.style(dijit.byId('filterValueDate').domNode,{
      display:'none'
    });

    dojo.byId('filterDynamicParameterPane').style.display='none';
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    dijit.byId('idFilterAttribute').reset();
    if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) dojo.byId('filterObjectClass').value=dojo.byId('objectClassList').value;
    else if (dojo.byId('objectClassManual') && dojo.byId('objectClassManual').value) dojo.byId('filterObjectClass').value=dojo.byId('objectClassManual').value;
    else if (dojo.byId('objectClass') && dojo.byId('objectClass').value) dojo.byId('filterObjectClass').value=dojo.byId('objectClass').value;
    else dojo.byId('filterObjectClass').value=null;
    filterType="";
    var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '&comboDetail=true' : '';
    dojo.xhrPost({
      url:"../tool/backupFilter.php?filterObjectClass=" + dojo.byId('filterObjectClass').value + compUrl + "&csrfToken=" + csrfToken,
      handleAs:"text",
      load:function(data,args) {
      }
    });
    compUrl=(window.top.dijit.byId("dialogDetail").open) ? '?comboDetail=true' : '';
    loadContent("../tool/displayFilterClause.php" + compUrl,"listFilterClauses","dialogFilterForm",false,null,null,null,displayOrOperator);
    loadContent("../tool/displayFilterList.php" + compUrl,"listStoredFilters","dialogFilterForm",false);
    loadContent("../tool/displayFilterSharedList.php" + compUrl,"listSharedFilters","dialogFilterForm",false);
    var objectClass='';
    if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) objectClass=dojo.byId('objectClassList').value;
    else if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value
        && (dojo.byId("objectClassManual").value == 'Planning' || dojo.byId("objectClassManual").value == 'VersionsPlanning' || dojo.byId("objectClassManual").value == 'ResourcePlanning')) objectClass='Activity';
    else if (dojo.byId('objectClass') && dojo.byId('objectClass').value) objectClass=dojo.byId('objectClass').value;
    if (objectClass.substr(0,7) == 'Report_') objectClass=objectClass.substr(7);
    refreshListSpecific('object','idFilterAttribute','objectClass',objectClass);
    dijit.byId("dialogFilter").show();
  }
  loadDialog('dialogFilter',callBack,true,"",true);
}

function displayOrOperator() {
  if (dojo.byId('nbFilterCriteria').value != "0") {
    dojo.byId('filterLogicalOperator').style.display='block';
  }
}

function filterSelectAtribute(value) {
  if (value) {
    filterStartInput=true;
    if (dijit.byId('filterDynamicParameterSwitch')) dijit.byId('filterDynamicParameterSwitch').set('value','off');
    dijit.byId('idFilterAttribute').store.store.fetchItemByIdentity({
      identity:value,
      onItem:function(item) {
        var dataType=dijit.byId('idFilterAttribute').store.store.getValue(item,"dataType","inconnu");
        if (value == "refTypeIncome" || value == "refTypeExpense") {
          dataType="list";
        }
        var datastoreOperator=new dojo.data.ItemFileReadStore({
          url:'../tool/jsonList.php?listType=operator&dataType=' + dataType + '&csrfToken=' + csrfToken
        });
        var storeOperator=new dojo.store.DataStore({
          store:datastoreOperator
        });
        storeOperator.query({
          id:"*"
        });
        dijit.byId('idFilterOperator').set('store',storeOperator);
        datastoreOperator.fetch({
          query:{
            id:"*"
          },
          count:1,
          onItem:function(item) {
            dijit.byId('idFilterOperator').set("value",item.id);
          },
          onError:function(err) {
            console.info(err.message);
          }
        });
        dojo.style(dijit.byId('idFilterOperator').domNode,{
          visibility:'visible'
        });
        // ADD qCazelles - Dynamic filter - Ticket #78
        dojo.byId('filterDynamicParameterPane').style.display='block';
        if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
        // END ADD qCazelles - Dynamic filter - Ticket #78
        dojo.byId('filterDataType').value=dataType;
        if (dataType == "bool") {
          filterType="bool";
          dojo.style(dijit.byId('filterValue').domNode,{
            display:'none'
          });
          dojo.style(dijit.byId('filterValueList').domNode,{
            display:'none'
          });
          if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
          if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
          if (dijit.byId('filterValueCheckboxSwitch')) {
            dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
              display:'block'
            });
            dijit.byId('filterValueCheckbox').set('value','off');
          } else {
            dojo.style(dijit.byId('filterValueCheckbox').domNode,{
              display:'block'
            });
            dijit.byId('filterValueCheckbox').set('checked','');
          }
          dojo.style(dijit.byId('filterValueDate').domNode,{
            display:'none'
          });
        } else if (dataType == "list") {
          filterType="list";
          var extraUrl="";
          if (value == 'idTargetVersion' || value == 'idTargetProductVersion' || value == 'idOriginalProductVersion') {
            value='idProductVersion';
            extraUrl='&critField=idle&critValue=all';
          } else if (value == 'idTargetComponentVersion' || value == 'idOriginalComponentVersion') {
            value='idComponentVersion';
            extraUrl='&critField=idle&critValue=all';
          } else if (value == 'idResourceSelect' || (value == 'idResource' && dojo.byId('filterObjectClass') && dojo.byId('filterObjectClass').value=='Assignment' )) {
            value='idResourceAllNoMaterial';
          }
          var urlListFilter='../tool/jsonList.php?required=true&listType=list&dataType=' + value + '&csrfToken=' + csrfToken;

          // CHANGE qCazelles - Ticket 165 //Empty lists on filter in
          // comboDetail
          // Old
          // if (currentSelectedProject && currentSelectedProject!='' &&
          // currentSelectedProject!='*') {
          // New
          if (typeof currentSelectedProject != 'undefined' && currentSelectedProject != '' && currentSelectedProject != '*') {
            // END CHANGE qCazelles - Ticket 165
            if (value == 'idActivity') {
              urlListFilter+='&critField=idProjectSub&critValue=' + currentSelectedProject;
            }
            if (value.substr(0,2)=='id' && value.substr(-4)=='Type') {
              // noting              
            } else if (value == 'idComponent') {
              // noting
            } else {
              urlListFilter+='&critField=idProject&critValue=' + currentSelectedProject;
            }
            if (extraUrl == '&critField=idle&critValue=all') {
              extraUrl == '&critField1=idle&critValue1=all';
            }
          }
          if (extraUrl != "") {
            urlListFilter+=extraUrl;
          }
          var tmpStore=new dojo.data.ItemFileReadStore({
            url:urlListFilter + '&csrfToken' + csrfToken
          });
          var mySelect=dojo.byId("filterValueList");
          mySelect.options.length=0;
          var nbVal=0;
          // ADD aGaye - Ticket 196
          if (dijit.byId('idFilterAttribute').getValue() == "idBusinessFeature") {
            var listId="";
            tmpStore.fetch({
              query:{
                id:"*"
              },
              onItem:function(item) {
                listId+=(listId != "") ? '_' : '';
                listId+=parseInt(tmpStore.getValue(item,"id",""),10) + '';
                nbVal++;
              },
              onError:function(err) {
                console.info(err.message);
              },
              onComplete:function() {
                dojo.xhrGet({
                  url:'../tool/getProductNameFromBusinessFeature.php?listId=' + listId + '&csrfToken=' + csrfToken,
                  handleAs:"text",
                  load:function(data) {
                    var listName=JSON.parse(data);
                    tmpStore.fetch({
                      query:{
                        id:"*"
                      },
                      onItem:function(item) {
                        mySelect.options[mySelect.length]=new Option(tmpStore.getValue(item,"name","") + " (" + listName[tmpStore.getValue(item,"id","")] + ")",tmpStore.getValue(item,"id",""));
                      },
                      onError:function(err) {
                        console.info(err.message);
                      }
                    });
                  }
                });
              }
            });
          } else {
            tmpStore.fetch({
              query:{
                id:"*"
              },
              onItem:function(item) {
                mySelect.options[mySelect.length]=new Option(tmpStore.getValue(item,"name",""),tmpStore.getValue(item,"id",""));
                nbVal++;
              },
              onError:function(err) {
                console.info(err.message);
              }
            });
          }
          // END aGaye - Ticket 196
          mySelect.size=(nbVal > 10) ? 10 : nbVal;
          dojo.style(dijit.byId('filterValue').domNode,{
            display:'none'
          });
          dojo.style(dijit.byId('filterValueList').domNode,{
            display:'block'
          });
          if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="8px";
          if (isNewGui) dojo.byId("filterValueListHideTop").style.display="block";
          dojo.xhrGet({
            url : "../tool/checkAccessForScreen.php?listType="+value+"&csrfToken="+csrfToken,
            handleAs : "text",
            load : function(data) {
              if(data && data=="YES"){          
                dojo.style(dijit.byId('showDetailInFilter').domNode, {display : 'block'}); 
              } else {
                dojo.style(dijit.byId('showDetailInFilter').domNode, {display : 'none'});
              }
            }
          });
          dijit.byId('showDetailInFilter').set('value',item.id);
          dijit.byId('filterValueList').reset();
          dojo.style(dijit.byId('filterValueCheckbox').domNode,{
            display:'none'
          });
          if (dijit.byId('filterValueCheckboxSwitch')) {
            dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
              display:'none'
            });
          }
          dojo.style(dijit.byId('filterValueDate').domNode,{
            display:'none'
          });
        } else if (dataType == "date") {
          filterType="date";
          dojo.style(dijit.byId('filterValue').domNode,{
            display:'none'
          });
          dojo.style(dijit.byId('filterValueList').domNode,{
            display:'none'
          });
          if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
          if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
          dojo.style(dijit.byId('showDetailInFilter').domNode,{
            display:'none'
          });
          dojo.style(dijit.byId('filterValueCheckbox').domNode,{
            display:'none'
          });
          if (dijit.byId('filterValueCheckboxSwitch')) {
            dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
              display:'none'
            });
          }
          dojo.style(dijit.byId('filterValueDate').domNode,{
            display:'block'
          });
          dijit.byId('filterValueDate').reset();
        } else {
          filterType="text";
          dojo.style(dijit.byId('filterValue').domNode,{
            display:'block'
          });
          dijit.byId('filterValue').reset();
          dojo.style(dijit.byId('filterValueList').domNode,{
            display:'none'
          });
          if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
          if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
          dojo.style(dijit.byId('showDetailInFilter').domNode,{
            display:'none'
          });
          dojo.style(dijit.byId('filterValueCheckbox').domNode,{
            display:'none'
          });
          if (dijit.byId('filterValueCheckboxSwitch')) {
            dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
              display:'none'
            });
          }
          dojo.style(dijit.byId('filterValueDate').domNode,{
            display:'none'
          });
        }
      },
      onError:function(err) {
        dojo.style(dijit.byId('idFilterOperator').domNode,{
          visibility:'hidden'
        });
        dojo.style(dijit.byId('filterValue').domNode,{
          display:'none'
        });
        dojo.style(dijit.byId('filterValueList').domNode,{
          display:'none'
        });
        if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
        if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
        dojo.style(dijit.byId('showDetailInFilter').domNode,{
          display:'none'
        });
        dojo.style(dijit.byId('filterValueCheckbox').domNode,{
          display:'none'
        });
        if (dijit.byId('filterValueCheckboxSwitch')) {
          dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
            display:'none'
          });
        }
        dojo.style(dijit.byId('filterValueDate').domNode,{
          display:'none'
        });
        // hideWait();
      }
    });
    dijit.byId('filterValue').reset();
    dijit.byId('filterValueList').reset();
    dijit.byId('filterValueCheckbox').reset();
    if (dijit.byId('filterValueCheckboxSwitch')) {
      dijit.byId('filterValueCheckboxSwitch').reset();
    }
    dijit.byId('filterValueDate').reset();

  } else {
    dojo.style(dijit.byId('idFilterOperator').domNode,{
      visibility:'hidden'
    });
    dojo.style(dijit.byId('filterValue').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueList').domNode,{
      display:'none'
    });
    if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    dojo.style(dijit.byId('showDetailInFilter').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueCheckbox').domNode,{
      display:'none'
    });
    if (dijit.byId('filterValueCheckboxSwitch')) {
      dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
        display:'none'
      });
    }
    dojo.style(dijit.byId('filterValueDate').domNode,{
      display:'none'
    });
  }
}

function filterSelectOperator(operator) {
  filterStartInput=true;
  if (operator == "SORT") {
    filterType="SORT";
    dojo.style(dijit.byId('filterValue').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueList').domNode,{
      display:'none'
    });
    if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    dojo.style(dijit.byId('showDetailInFilter').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueCheckbox').domNode,{
      display:'none'
    });
    if (dijit.byId('filterValueCheckboxSwitch')) {
      dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
        display:'none'
      });
    }
    dojo.style(dijit.byId('filterValueDate').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterSortValueList').domNode,{
      display:'block'
    });
    dijit.byId('filterDynamicParameter').set('checked','');
    if (dijit.byId('filterDynamicParameterSwitch')) dijit.byId('filterDynamicParameterSwitch').set('value','off');
    dojo.byId('filterDynamicParameterPane').style.display='none';
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
  } else if (operator == "<=now+" || operator == ">=now+") {
    filterType="text";
    dojo.style(dijit.byId('filterValue').domNode,{
      display:'block'
    });
    dojo.style(dijit.byId('filterValueList').domNode,{
      display:'none'
    });
    if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    dojo.style(dijit.byId('showDetailInFilter').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueCheckbox').domNode,{
      display:'none'
    });
    if (dijit.byId('filterValueCheckboxSwitch')) {
      dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
        display:'none'
      });
    }
    dojo.style(dijit.byId('filterValueDate').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterSortValueList').domNode,{
      display:'none'
    });
  } else if (operator == "isEmpty" || operator == "isNotEmpty" || operator == "hasSome") {
    filterType="null";
    dojo.style(dijit.byId('filterValue').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueList').domNode,{
      display:'none'
    });
    if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="200px";
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    dojo.style(dijit.byId('showDetailInFilter').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterValueCheckbox').domNode,{
      display:'none'
    });
    if (dijit.byId('filterValueCheckboxSwitch')) {
      dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
        display:'none'
      });
    }
    dojo.style(dijit.byId('filterValueDate').domNode,{
      display:'none'
    });
    dojo.style(dijit.byId('filterSortValueList').domNode,{
      display:'none'
    });
    dijit.byId('filterDynamicParameter').set('checked','');
    if (dijit.byId('filterDynamicParameterSwitch')) dijit.byId('filterDynamicParameterSwitch').set('value','off');
    dojo.byId('filterDynamicParameterPane').style.display='none';
    if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
  } else {
    dojo.style(dijit.byId('filterValue').domNode,{
      display:'none'
    });
    dataType=dojo.byId('filterDataType').value;
    dojo.style(dijit.byId('filterSortValueList').domNode,{
      display:'none'
    });
    if (dataType == "bool") {
      filterType="bool";
      if (dijit.byId('filterValueCheckboxSwitch')) {
        dojo.style(dijit.byId('filterValueCheckboxSwitch').domNode,{
          display:'block'
        });
      } else {
        dojo.style(dijit.byId('filterValueCheckbox').domNode,{
          display:'block'
        });
      }
    } else if (dataType == "list") {
      filterType="list";
      dojo.style(dijit.byId('filterValueList').domNode,{
        display:'block'
      });
      if (isNewGui) dojo.byId("filterDynamicParameterPane").style.left="8px";
      if (isNewGui) dojo.byId("filterValueListHideTop").style.display="block";
      dojo.style(dijit.byId('showDetailInFilter').domNode,{
        display:'block'
      });
      dijit.byId('filterDynamicParameter').set('checked','');
      if (dijit.byId('filterDynamicParameterSwitch')) dijit.byId('filterDynamicParameterSwitch').set('value','off');
      dojo.byId('filterDynamicParameterPane').style.display='block';
    } else if (dataType == "date") {
      filterType="date";
      dojo.style(dijit.byId('filterValueDate').domNode,{
        display:'block'
      });
      dijit.byId('filterDynamicParameter').set('checked','');
      if (dijit.byId('filterDynamicParameterSwitch')) dijit.byId('filterDynamicParameterSwitch').set('value','off');
      dojo.byId('filterDynamicParameterPane').style.display='block';
      if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    } else {
      filterType="text";
      dojo.style(dijit.byId('filterValue').domNode,{
        display:'block'
      });
      dijit.byId('filterDynamicParameter').set('checked','');
      if (dijit.byId('filterDynamicParameterSwitch')) dijit.byId('filterDynamicParameterSwitch').set('value','off');
      dojo.byId('filterDynamicParameterPane').style.display='block';
      if (isNewGui) dojo.byId("filterValueListHideTop").style.display="none";
    }
  }
}

function addfilterClause(silent) {
  filterStartInput=false;
  if (dijit.byId('filterNameDisplay')) {
    dojo.byId('filterName').value=dijit.byId('filterNameDisplay').get('value');
  }
  if (filterType == "") {
    if (!silent) showAlert(i18n('attributeNotSelected'));
    return;
  }
  if (trim(dijit.byId('idFilterOperator').get('value')) == '') {
    if (!silent) showAlert(i18n('operatorNotSelected'));
    return;
  }
  if (!dijit.byId('filterDynamicParameter').get('checked')) {
    if (filterType == "list" && trim(dijit.byId('filterValueList').get('value')) == '') {
      if (!silent) showAlert(i18n('valueNotSelected'));
      return;
    }
    if (filterType == "date" && !dijit.byId('filterValueDate').get('value')) {
      if (!silent) showAlert(i18n('valueNotSelected'));
      return;
    }
    if (filterType == "text" && !dijit.byId('filterValue').get('value')) {
      if (!silent) showAlert(i18n('valueNotSelected'));
      return;
    }
    if (dijit.byId('idFilterAttribute').get('value') == 'idle' && dijit.byId('idFilterOperator').get('value') == '=' && dijit.byId('filterValueCheckbox').get('checked')) {
      dijit.byId('listShowIdle').set('checked',true);
    }
  }
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '?comboDetail=true' : '';
  loadContent("../tool/addFilterClause.php" + compUrl,"listFilterClauses","dialogFilterForm",false,null,null,null,function() {
    clearDivDelayed('saveFilterResult');
  });
  if (dojo.byId('filterLogicalOperator') && dojo.byId('filterLogicalOperator').style.display == 'none') {
    dojo.byId('filterLogicalOperator').style.display='block';
  }
}

function removefilterClause(id) {
  if (dijit.byId('filterNameDisplay')) {
    dojo.byId('filterName').value=dijit.byId('filterNameDisplay').get('value');
  }
  dojo.byId("filterClauseId").value=id;
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '?comboDetail=true' : '';
  loadContent("../tool/removeFilterClause.php" + compUrl,"listFilterClauses","dialogFilterForm",false);
  if (id == 'all' || dojo.byId('nbFilterCriteria').value == "1") { // Value is
    // not set
    // to 0
    // already
    // but is
    // going to
    dojo.byId('filterLogicalOperator').style.display='none';
  } else if (dojo.byId('nbFilterCriteria').value == "2") { // Value is going to
    // be set at 1
    loadContent("../tool/displayFilterClause.php" + compUrl,"listFilterClauses","dialogFilterForm",false,null,null,null,function() {
      clearDivDelayed('saveFilterResult');
    });
  }
}

function selectFilter() {
  if (filterStartInput) {
    addfilterClause(true);
    setTimeout("selectFilterContinue();",1000);
  } else {
    selectFilterContinue();
  }
}

function selectFilterContinue() {
  if (window.top.dijit.byId('dialogDetail').open) {
    var doc=window.top.frames['comboDetailFrame'];
  } else {
    var doc=window.top;
  }
  if (dijit.byId('filterNameDisplay')) {
    dojo.byId('filterName').value=dijit.byId('filterNameDisplay').get('value');
  }
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '&comboDetail=true' : '';
  dojo.xhrPost({
    url:"../tool/backupFilter.php?valid=true" + compUrl + "&csrfToken=" + csrfToken,
    form:'dialogFilterForm',
    handleAs:"text",
    load:function(data,args) {
    }
  });
  if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) {
    objectClass=dojo.byId('objectClassList').value;
  } else if (!window.top.dijit.byId('dialogDetail').open && dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) {
    objectClass=dojo.byId("objectClassManual").value;
  } else if (dojo.byId('objectClass') && dojo.byId('objectClass').value) {
    objectClass=dojo.byId('objectClass').value;
  }
  if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value == 'Kanban') {
    compUrl+='&context=directFilterList';
    compUrl+='&contentLoad=../view/kanbanView.php';
    compUrl+='&container=divKanbanContainer';
  }
  doc.loadContent("../tool/displayFilterList.php?displayQuickFilter=true&context=directFilterList&filterObjectClass=" + objectClass + compUrl,"directFilterList",null,false,'returnFromFilter',false);
  /*
   * florent Ticket #4010 When adding filter (not stored), icon has not the "on"
   * flag
   */
  if (dojo.byId("nbFilterCriteria").value > 0 && !dijit.byId('filterDynamicParameter').get("checked") && dojo.byId('nbDynamicFilterCriteria').value == 0) {
    setTimeout("dijit.byId('listFilterFilter').set('iconClass', 'dijitButtonIcon iconActiveFilter')",500);
  } else {
    setTimeout("dijit.byId('listFilterFilter').set('iconClass', 'dijitButtonIcon iconFilter')",500);
  }
  if (!window.top.dijit.byId('dialogDetail').open && dojo.byId('objectClassManual') && (dojo.byId('objectClassManual').value == 'Kanban' || dojo.byId('objectClassManual').value == 'LiveMeeting')) {
    loadContent("../view/kanbanView.php?idKanban=" + dojo.byId('idKanban').value,"divKanbanContainer");
  } else if (!dijit.byId('filterDynamicParameter').get("checked")) {
    if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value == 'Planning' && !window.top.dijit.byId('dialogDetail').open) {
      refreshJsonPlanning();
    } else if (dojo.byId("objectClassManual") && (dojo.byId("objectClassManual").value == 'VersionsPlanning' || dojo.byId("objectClassManual").value == 'ResourcePlanning')
        && !window.top.dijit.byId('dialogDetail').open) {
      if (dojo.byId("objectClassManual").value == 'VersionsPlanning') {
        refreshJsonPlanning('version');
      } else {
        refreshJsonPlanning('resource');
      }
    } else if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value == 'Report') {
      dojo.byId('outMode').value='';
      runReport();
    } else {
      doc.refreshJsonList(objectClass);
    }
  }
  dijit.byId("dialogFilter").hide();
  filterStartInput=false;
}

function cancelFilter() {
  filterStartInput=true;
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '&comboDetail=true' : '';
  dojo.xhrPost({
    url:"../tool/backupFilter.php?cancel=true" + compUrl + "&csrfToken=" + csrfToken,
    form:'dialogFilterForm',
    handleAs:"text",
    load:function(data,args) {
    }
  });
  dijit.byId('dialogFilter').hide();
}

function clearFilter() {
  if (dijit.byId('filterNameDisplay')) {
    dijit.byId('filterNameDisplay').reset();
  }
  dojo.byId('filterName').value="";
  removefilterClause('all');
  // setTimeout("selectFilter();dijit.byId('listFilterFilter').set('iconClass','dijitButtonIcon
  // iconFilter');",100);
  dijit.byId('listFilterFilter').set('iconClass','dijitButtonIcon iconFilter');
  dijit.byId('filterNameDisplay').set('value',null);
  dojo.byId('filterName').value=null;
}

function defaultFilter() {
  if (dijit.byId('filterNameDisplay')) {
    dojo.byId('filterName').value=dijit.byId('filterNameDisplay').get('value');
  }
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '?comboDetail=true' : '';
  loadContent("../tool/defaultFilter.php" + compUrl,"listStoredFilters","dialogFilterForm",false,null,null,null,function() {
    clearDivDelayed('saveFilterResult');
  });
}

function saveFilter() {
  if (dijit.byId('filterNameDisplay')) {
    if (dijit.byId('filterNameDisplay').get('value') == "") {
      showAlert(i18n("messageMandatory",new Array(i18n("filterName"))));
      return;
    }
    dojo.byId('filterName').value=dijit.byId('filterNameDisplay').get('value');
  }
  var nbFilter=dojo.byId('nbFilterCriteria');
  if (nbFilter && nbFilter.value == 0) {
    showAlert(i18n("cantSaveFilterWithNoClause"));
    return;
  }
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '?comboDetail=true' : '';
  loadContent("../tool/saveFilter.php" + compUrl,"listStoredFilters","dialogFilterForm",false,null,null,null,function() {
    clearDivDelayed('saveFilterResult');
  });
}

/**
 * Select a stored filter in the list and fetch criteria
 * 
 */
var globalSelectFilterContenLoad=null;
var globalSelectFilterContainer=null;
function selectStoredFilter(idFilter,context,contentLoad,container) {
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '&comboDetail=true' : '';
  globalSelectFilterContenLoad=null;
  globalSelectFilterContainer=null;
  if (context == 'directFilterList') {
    if (dojo.byId('noFilterSelected')) {
      if (idFilter == '0') {
        dojo.byId('noFilterSelected').value='true';
      } else {
        dojo.byId('noFilterSelected').value='false';
      }
    } else if (window.top.dojo.byId('noFilterSelected')) {
      if (idFilter == '0') {
        window.top.dojo.byId('noFilterSelected').value='true';
      } else {
        window.top.dojo.byId('noFilterSelected').value='false';
      }
    }
    if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) objectClass=dojo.byId('objectClassList').value;
    else if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) objectClass=dojo.byId("objectClassManual").value;
    else if (dojo.byId('objectClass') && dojo.byId('objectClass').value) objectClass=dojo.byId('objectClass').value;
    var validationType=null;
    var currentScreen = (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value)?dojo.byId("objectClassManual").value:null;
    if (dojo.byId('dynamicFilterId' + idFilter)) {
      var param="&idFilter=" + idFilter + "&filterObjectClass=" + objectClass;
      loadDialog('dialogDynamicFilter',null,true,param,true);
      globalSelectFilterContenLoad=contentLoad;
      globalSelectFilterContainer=container;
      validationType='selectFilter'; // will avoid immediate refresh
    }
    if (typeof contentLoad != 'undefined' && typeof container != 'undefined') {
      loadContent("../tool/selectStoredFilter.php?currentscreen="+currentScreen+"&idFilter=" + idFilter + "&context=" + context + "&contentLoad=" + contentLoad + "&container=" + container + "&filterObjectClass=" + objectClass
          + compUrl,"directFilterList",null,false,validationType);
      if (!dojo.byId('dynamicFilterId' + idFilter)) loadContent(contentLoad,container);
    } else {
      loadContent("../tool/selectStoredFilter.php?currentscreen="+currentScreen+"&idFilter=" + idFilter + "&context=" + context + "&filterObjectClass=" + objectClass + compUrl,"directFilterList",null,false,validationType);
      if (dojo.byId("objectClassList") && dojo.byId("objectClassList").value.substr(0,7) == 'Report_') {
        dojo.byId('outMode').value='';
        runReport();
      }
    }
    if (isNewGui) {
      dijit.byId('listFilterFilter').closeDropDown();
    }
  } else {
    if (dojo.byId('filterLogicalOperator') && dojo.byId('filterLogicalOperator').style.display == 'none') {
      dojo.byId('filterLogicalOperator').style.display='block';
    }
    loadContent("../tool/selectStoredFilter.php?idFilter=" + idFilter + compUrl,"listFilterClauses","dialogFilterForm",false);
  }

}

function removeStoredFilter(idFilter,nameFilter) {
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '&comboDetail=true' : '';
  var action=function() {
    var callBack=function() {
      clearDivDelayed('saveFilterResult');
    };
    loadContent("../tool/removeFilter.php?idFilter=" + idFilter + compUrl,"listStoredFilters","dialogFilterForm",false,null,null,null,callBack);
  };
  window.top.showConfirm(i18n("confirmRemoveFilter",new Array(nameFilter)),action);
}

function shareStoredFilter(idFilter,nameFilter) {
  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '&comboDetail=true' : '';
  loadContent("../tool/shareFilter.php?idFilter=" + idFilter + compUrl,"listStoredFilters","dialogFilterForm",false);
}

function selectDynamicFilter() {
  for (var i=0;i < dojo.byId('nbDynamicFilterClauses').value;i++) {
    if (dijit.byId('filterValueList' + i)) {
      if (dijit.byId('filterValueList' + i).get("value") == "") {
        showAlert(i18n('valueNotSelected'));
        return;
      }
    } else if (dijit.byId('filterValue' + i)) {
      if (dijit.byId('filterValue' + i).get("value") == "") {
        showAlert(i18n('valueNotSelected'));
        return;
      }
    } else if (dijit.byId('filterValueDate' + i)) {
      if (dijit.byId('filterValueDate' + i).get("value") == "") {
        showAlert(i18n('valueNotSelected'));
        return;
      }
    }
  }

  var compUrl=(window.top.dijit.byId("dialogDetail").open) ? '?comboDetail=true' : '';
  var callBack=function() {
    selectDynamicFilterContinue();
  }
  loadContent("../tool/addDynamicFilterClause.php" + compUrl,"listDynamicFilterClauses","dialogDynamicFilterForm",false,null,null,null,callBack);
}

function selectDynamicFilterContinue() {
  if (window.top.dijit.byId('dialogDetail').open) {
    var doc=window.top.frames['comboDetailFrame'];
  } else {
    var doc=top;
  }
  if (dijit.byId('filterNameDisplay')) {
    dojo.byId('filterName').value=dijit.byId('filterNameDisplay').get('value');
  }
  doc.dijit.byId("listFilterFilter").set("iconClass","dijitButtonIcon iconActiveFilter");
  if (dojo.byId('objectClassList') && dojo.byId('objectClassList').value) objectClass=dojo.byId('objectClassList').value;
  else if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value) objectClass=dojo.byId("objectClassManual").value;
  else if (dojo.byId('objectClass') && dojo.byId('objectClass').value) objectClass=dojo.byId('objectClass').value;
  var compUrl='';
  if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value == 'Kanban') {
    compUrl+='&context=directFilterList';
    compUrl+='&contentLoad=../view/kanbanView.php';
    compUrl+='&container=divKanbanContainer';
  }
  doc.loadContent("../tool/displayFilterList.php?context=directFilterList&displayQuickFilter=true&displayQuickFilter=true&filterObjectClass=" + objectClass + compUrl,"directFilterList",null,false,
      'returnFromFilter',false);

  if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value == 'Planning' && !window.top.dijit.byId('dialogDetail').open) {
    refreshJsonPlanning();
  } else if (dojo.byId("objectClassManual") && dojo.byId("objectClassManual").value == 'Report') {
    dojo.byId('outMode').value='';
    runReport();
  } else if (doc.dojo.byId('objectClassList')) {
    doc.refreshJsonList(doc.dojo.byId('objectClassList').value);
  } else {
    doc.refreshJsonList(doc.dojo.byId('objectClass').value);
  }
  dijit.byId("dialogDynamicFilter").hide();
}

/*
 * Ticket #3988 - Object list : boutton reset parameters florent
 */
function resetFilter(lstStat) {
  var grid=dijit.byId("objectGrid");
  var notDef;
  var i=0;
  for (i=1;i <= lstStat;i++) {
    if (dijit.byId('showStatus' + i)) {
      dijit.byId('showStatus' + i).set('checked',false);
    }
  }

  if (dijit.byId("listFilterFilter").iconClass == "dijitButtonIcon iconActiveFilter") {
    selectStoredFilter('0','directFilterList',notDef,notDef);
  }
  if (grid) {
    if (dijit.byId('listTypeFilter')) {
      dijit.byId('listTypeFilter').set('value','');
    }
    if (dijit.byId('listClientFilter')) {
      dijit.byId('listClientFilter').set('value','');
    }
    if (dijit.byId('listItemSelector')) {
      dijit.byId('listItemSelector').set('value','');
    }
    if (dijit.byId('showAllProjects')) {
      dijit.byId('showAllProjects').set('value','');
    }
    if (dijit.byId('ListPredefinedActions')) {
      dijit.byId('ListPredefinedActions').set('value','');
    }
    if (dijit.byId('ListBudgetParentFilter')) {
      dijit.byId('ListBudgetParentFilter').set('value','');
    }
    if (dijit.byId('ListBudgetParentFilter')) {
      dijit.byId('ListBudgetParentFilter').set('value','');
    }
    if (dijit.byId('ListShowIdle')) {
      dijit.byId('ListShowIdle').set('value','');
    }
    if (dijit.byId('hideInService')) {
      dijit.byId('hideInService').set('value','');
    }
    if (dijit.byId('listIdFilter') || dijit.byId('listNameFilter') || dijit.byId('listNameFilter') && dijit.byId('listIdFilter')) {
      dijit.byId('listIdFilter').set('value','');
      dijit.byId('listNameFilter').set('value','');
      filter={};
      grid.query=filter;
      grid._refresh();
    }
  }

}

function resetFilterQuick(lstStat) {
  var grid=dijit.byId("objectGrid");
  var notDef;
  var i=0;
  for (i=1;i <= lstStat;i++) {
    if (dijit.byId('showStatus' + i)) {
      dijit.byId('showStatus' + i).set('checked',false);
    }
  }

  if (dijit.byId("listFilterFilter").iconClass == "dijitButtonIcon iconActiveFilter") {
    selectStoredFilter('0','directFilterList',notDef,notDef);
  }
  if (grid) {
    if (dijit.byId('listTypeFilter')) {
      dijit.byId('listTypeFilter').set('value','');
    }
    if (dijit.byId('listClientFilter')) {
      dijit.byId('listClientFilter').set('value','');
    }
    if (dijit.byId('listItemSelector')) {
      dijit.byId('listItemSelector').set('value','');
    }
    if (dijit.byId('showAllProjects')) {
      dijit.byId('showAllProjects').set('value','');
    }
    if (dijit.byId('ListPredefinedActions')) {
      dijit.byId('ListPredefinedActions').set('value','');
    }
    if (dijit.byId('ListBudgetParentFilter')) {
      dijit.byId('ListBudgetParentFilter').set('value','');
    }
    if (dijit.byId('ListBudgetParentFilter')) {
      dijit.byId('ListBudgetParentFilter').set('value','');
    }
    if (dijit.byId('ListShowIdle')) {
      dijit.byId('ListShowIdle').set('value','');
    }
    if (dijit.byId('hideInService')) {
      dijit.byId('hideInService').set('value','');
    }
    if (dijit.byId('listIdFilter')) {
      dijit.byId('listIdFilter').set('value','');
    }
    if (dijit.byId('listNameFilter')) {
      dijit.byId('listNameFilter').set('value','');
    }
    if (dijit.byId('listIdFilter') || dijit.byId('listNameFilter')) {
      filter={};
      grid.query=filter;
      grid._refresh();
    }
  }

  if (dijit.byId('listIdFilterQuick')) {
    dijit.byId('listIdFilterQuick').set('value','');
    if (dijit.byId('listIdFilterQuickSw').get('value') == 'off') {
      dojo.byId('filterDivsSpan').style.display="none";
      dijit.byId('listIdFilter').domNode.style.display='none';
    }
  }
  if (dijit.byId('listNameFilterQuick')) {
    dijit.byId('listNameFilterQuick').set('value','');
    if (dijit.byId('listNameFilterQuickSw').get('value') == 'off') {
      dojo.byId('listNameFilterSpan').style.display="none";
      dijit.byId('listNameFilter').domNode.style.display='none';
    }
  }
  if (dijit.byId('listTypeFilterQuick')) {
    dijit.byId('listTypeFilterQuick').set('value','');
  }
  if (dijit.byId('listClientFilterQuick')) {
    dijit.byId('listClientFilterQuick').set('value','');
  }
  if (dijit.byId('listBudgetParentFilterQuick')) {
    dijit.byId('listBudgetParentFilterQuick').set('value','');
  }

  if (dijit.byId('quickSearchValueQuick')) {
    dijit.byId('quickSearchValueQuick').set('value','');
  }
}
