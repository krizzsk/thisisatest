/*******************************************************************************
 * COPYRIGHT NOTICE *
 * 
 * Copyright 2009-2017 ProjeQtOr - Pascal BERNARD - support@projeqtor.org
 * Contributors : -
 * 
 * This file is part of ProjeQtOr.
 * 
 * ProjeQtOr is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * ProjeQtOr is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along with
 * ProjeQtOr. If not, see <http://www.gnu.org/licenses/>.
 * 
 * You can get complete code of ProjeQtOr, other resource, help and information
 * about contributors at http://www.projeqtor.org
 * 
 * DO NOT REMOVE THIS NOTICE **
 ******************************************************************************/

// ============================================================================
// All specific ProjeQtOr functions and variables
// This file is included in the main.php page, to be reachable in every context
// ============================================================================
// =============================================================================
// = Variables (global)
// =============================================================================
//var i18nMessages = null; // array containing i18n messages
//var i18nMessagesCustom = null; // array containing i18n messages
//var currentLocale = null; // the locale, from browser or user set
//var browserLocale = null; // the locale, from browser
//var cancelRecursiveChange_OnGoingChange = false; // boolean to avoid
// recursive change trigger
//var formChangeInProgress = false; // boolean to avoid exit from form when
// changes are not saved
//var currentRow = null; // the row num of the current selected
// element in the main grid
//var currentFieldId = ''; // Id of the ciurrent form field (got
// via onFocus)
//var currentFieldValue = ''; // Value of the current form field (got
// via onFocus)
//var g; // Gant chart for JsGantt : must be
// named "g"
//var quitConfirmed = false;
//var noDisconnect = false;
//var forceRefreshMenu = false;
//var directAccessIndex = null;

//var debugPerf = new Array();

//var pluginMenuPage = new Array();
//
//var previousSelectedProject=null;
//var previousSelectedProjectName=null;
//
//var mustApplyFilter=false;
//
//var arraySelectedProject = new Array();
//
//var displayFilterVersionPlanning='0';
//var displayFilterComponentVersionPlanning='0';
//
//var contentPaneResizingInProgress={};
//
//var defaultMenu=null;

//=============================================================================
//function for close/open left Menu 
//
// ticket 4965 Florent
//=============================================================================

;( function(window) {
  function menuLeft(menu) {  
    this.el = menu;
    this._init();
  }

  menuLeft.prototype = {
    _init : function() {
      this.menuRight=dojo.byId('menuBarVisibleDiv');
      this.trigger = dojo.byId( 'hideStreamNewGui' );
      this.isMenuOpen =dojo.byId('isMenuLeftOpen').value; //replace to datatsession;
      //divButton
      this.hidStreamButtonTopBar= document.createElement('div');
      this.hidStreamButtonTopBar.className = 'hideStreamNewGuiTopBar';
      this.hidStreamButtonTopBar.setAttribute('id', 'hideStreamNewGuiTopBar');
      this.hidStreamButtonTopBar.setAttribute('style', ((this.isMenuOpen=='false')?'float:left;width:32px;display:block;':'display:none;'));
      
      //incon
      this.hidStreamButtonTopBarIcon = document.createElement('div');
      this.hidStreamButtonTopBarIcon.className = 'iconHideMenuRight iconSize32';
      //insert in menuBar
      this.menuRight.insertAdjacentElement('afterbegin', this.hidStreamButtonTopBar);
      this.hidStreamButtonTopBar.insertAdjacentElement('afterbegin',  this.hidStreamButtonTopBarIcon);
      
      this.triggerBar = dojo.byId( 'hideStreamNewGuiTopBar' );
      this.eventtype ='click';
      this.menuLinks = dojo.query('.menu__linkDirect');
      this.pinButton = dojo.byId('autoHideMenuIcon');
      this.autoHideMenu = (dojo.byId( 'modePin' ).value == 'true') ? true : false;
      this._initEvents();
    },
    
    _initEvents : function() {
      var self = this;
      this.isInit=false;
      
      if (this.autoHideMenu == true) {
        this.triggerBar.addEventListener( "mouseover", menuOpenEventMouseOver, true );
        this.triggerBar.addEventListener("mouseout", menuOpenEventMouseLeave, true);
      } else {
        this.triggerBar.addEventListener( "click", menuOpenEventMouseOver, true );
      }
      
      function menuOpenEventMouseOver( ev ) {
        ev.stopPropagation();
        ev.preventDefault();
        this.timeOutEvent = setTimeout(function () {
          if(self.isMenuOpen=='false' ) {
            self._openMenu();
            document.addEventListener( self.eventtype, self.bodyClickFn );
          }
        },200);        
      };
      
      function menuOpenEventMouseLeave( ev )   {
        ev.stopPropagation();
        ev.preventDefault();
        clearTimeout(this.timeOutEvent);
      };
      
      this.pinButton.addEventListener("click", function(ev) {
        if(self.autoHideMenu){
          self.pinButton.removeAttribute('class');
          self.pinButton.setAttribute('class', 'autoHideMenuOff iconSize16');
          self.autoHideMenu = false;
          self.triggerBar.removeEventListener( "mouseover", menuOpenEventMouseOver,true );
          self.triggerBar.removeEventListener("mouseout", menuOpenEventMouseLeave, true);
          self.hidStreamButtonTopBar.setAttribute('style', ((self.isMenuOpen=='false')?'float:left;width:32px;display:block;':'display:none;'));
          if (dojo.byId('globalTopCenterDiv').style.left == "0px"){
            self._setSize();  
          }
          saveDataToSession('pinMode',false,true);
        }else{
          self.pinButton.removeAttribute('class');
          self.pinButton.setAttribute('class', 'autoHideMenuOn iconSize16');
          self.autoHideMenu = true;
          self.triggerBar.addEventListener( "mouseover", menuOpenEventMouseOver, true );
          self.triggerBar.addEventListener("mouseout", menuOpenEventMouseLeave, true);
          saveDataToSession('pinMode',true,true);
        }
      });
      
      this.menuLinks.forEach(function(link, pos) {
        link.addEventListener( "click", function( ev ) {
          ev.stopPropagation();
          ev.preventDefault();
          if (self.autoHideMenu) {
            self._closeMenu();
            document.removeEventListener( self.eventtype, self.bodyClickFn );
          }
        });
      });
      
      this.trigger.addEventListener( this.eventtype, function( ev ) {
        ev.stopPropagation();
        ev.preventDefault();
        if( self.isMenuOpen=='true' ) {
          self._closeMenu();
          document.removeEventListener( self.eventtype, self.bodyClickFn );
        }
      } );
      this.triggerBar.addEventListener( this.eventtype, function( ev ) {
        ev.stopPropagation();
        ev.preventDefault();
        if(self.isMenuOpen=='false' ) {
          self._openMenu();
          document.addEventListener( self.eventtype, self.bodyClickFn );
        }
      } );
    },
    
    _openMenu : function() {
      if(this.isMenuOpen=='true') return;
      this.isMenuOpen = 'true'; //replace to datatsession;
      this._setSize();
      this._showHideButton();
      saveDataToSession('isMenuLeftOpen','true', true);
      setTimeout("kawaMsgShow();",1000);
    },
    
    _closeMenu : function() {
      if(this.isMenuOpen=='false') return;
      this.isMenuOpen = 'false';//replace to datatsession;
      this._setSize();
      this._showHideButton();
      saveDataToSession('isMenuLeftOpen','false', true);
    },
    
    _showHideButton : function(){
      dojo.removeAttr('hideStreamNewGui','style');
      dojo.removeAttr('contentMenuBar','style');
      dojo.removeAttr('hideStreamNewGuiTopBar','style');
      if(this.isMenuOpen=='true'){
        dojo.byId('hideStreamNewGui').setAttribute('style','display:block;float:right;');
        if (this.autoHideMenu == false || !dojo.byId('mainDivContainer')) {
          dojo.byId('hideStreamNewGuiTopBar').setAttribute('style','display:none;');
        } else {
          dojo.byId('hideStreamNewGuiTopBar').setAttribute('style','float:left;width:32px;display:block;');
        }
        dojo.byId('hideMenuLeftMargin').style.display = 'none';
        dojo.byId('isMenuLeftOpen').value = 'true';
      }else{
        dojo.byId('hideStreamNewGui').setAttribute('style','display:none;');
        dojo.byId('hideStreamNewGuiTopBar').setAttribute('style','float:left;width:32px;display:block;');
        dojo.byId('hideMenuLeftMargin').style.display = '';
        dojo.byId('isMenuLeftOpen').value = 'false';
      }
      dojo.setAttr('contentMenuBar','style','top:1px; overflow:hidden; z-index:0');
    },
    
    _setSize :function(){
      if (dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOff') ) var globalWidth=(this.isMenuOpen=='true') ? dojo.byId('mainDiv').offsetWidth-250 : dojo.byId('mainDiv').offsetWidth;
      else var globalWidth=dojo.byId('mainDiv').offsetWidth;
      duration=this._resizeDiv (globalWidth);
      this._resizeGlobalContainer(duration);
     },
    
    _resizeDiv : function(globalWidth){
      var isObject=true;
      closeOpenLeftMenu=true;
      var hideDetail=false;
      if(dojo.byId('objectClass') && dojo.byId('mainDivContainer')){
          var mainDivHeight= dojo.byId('mainDivContainer').offsetHeight;
          var detailHeight=dojo.byId("contentDetailDiv").offsetHeight;
          if(dojo.attr(dojo.byId("listDiv"),"region")=='top'){
           var listDivHeight=mainDivHeight - detailHeight-5;
           var listDivWidth=globalWidth-20;

           var detailWidth=dojo.byId("contentDetailDiv").offsetWidth;        
           if(detailWidth==0) hideDetail=true;
           if (this.autoHideMenu == "false") {
             var detailLeft=(this.isMenuOpen=='true')? dojo.byId("contentDetailDiv").offsetLeft-250 : dojo.byId("contentDetailDiv").offsetLeft+250;
           } else {
             var detailLeft= dojo.byId("mainDiv").offsetLeft;
           }
           var mainDivContainerWith=dojo.byId('mainDiv').offsetWidth+1;
           listDivWidth=mainDivContainerWith-1;
           detailWidth=mainDivContainerWith;
          }else {
            if (this.autoHideMenu===false || dojo.byId("globalTopCenterDiv").offsetLeft==250) {
              var detailWidth=dojo.byId("contentDetailDiv").offsetWidth;
              if(detailWidth==0)hideDetail=true;
              var detailLeft=(this.isMenuOpen=='true')? dojo.byId("contentDetailDiv").offsetLeft-250 : dojo.byId("contentDetailDiv").offsetLeft+250;
              var listDivWidth=(this.isMenuOpen=='true')? (dojo.byId('mainDivContainer').offsetWidth-250) - detailWidth -5: (dojo.byId('mainDivContainer').offsetWidth+250) - detailWidth-5;
              var listDivHeight=mainDivHeight;
              var mainDivContainerWith=listDivWidth+detailWidth+5;
              
              if(hideDetail)listDivWidth+=5;
            }
          }
        var currentScreen=(dojo.byId('objectClassManual'))?dojo.byId('objectClassManual').value:'Object';
        if(tabPlanView.includes(currentScreen)){
          isObject=false;
          if(coverListAction!='CLOSE' && (detailWidth==0 || detailHeight==0 ))setActionCoverListNonObj('CLOSE',false);
        }
        
      }
      var contentPaneNode=(document.querySelector('[id^="dijit_layout_ContentPane_"'))?document.querySelector('[id^="dijit_layout_ContentPane_"'):document.querySelector('[id^="dijit_layout_BorderContainer_"');
      var duration=200;
      if(dojo.byId('objectClass')&& dojo.byId('mainDivContainer')){
          dojox.fx.combine([ dojox.fx.animateProperty({
            node : "menuTop",
            properties : {
              width : globalWidth,
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "leftMenu",
            properties : {
              width : { start:(this.isMenuOpen=='true')? 0 : 250 ,
                        end:(this.isMenuOpen=='true')? 250 : 0}
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "leftDiv",
            properties : {
              width : { start:(this.isMenuOpen=='true')? 0 : 250 ,
                        end:(this.isMenuOpen=='true')? 250 : 0}
            },
            duration : duration
          }),dojox.fx.animateProperty({
            node : "menuLeftBarContaineur",
            properties : {
              width :{ start:(this.isMenuOpen=='true')?  0 : 250,
                       end:(this.isMenuOpen=='true')? 250 :0 }
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "globalTopCenterDiv",
            properties : {
              width : globalWidth,
              left: { start:(this.isMenuOpen=='true' || dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOn') )? 0 : 250 ,
                      end:(this.isMenuOpen=='true' && dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOff') )? 250 : 0}
            },
            duration : duration
          }),dojox.fx.animateProperty({
            node : "statusBarDiv",
            properties : {
              width : globalWidth,
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "centerDiv",
            properties : {
              width : globalWidth,
              left:0
            },
            duration : duration
          })
          , dojox.fx.animateProperty({
            node : "listDiv_splitter",
            properties : {
              left : (hideDetail)?detailLeft:detailLeft-5,
            },
            duration : duration
          })
          ,  dojox.fx.animateProperty({
            node : "statusBarDivBottom",
            properties : {
              width : globalWidth,
            },
            duration : duration
          })
          , dojox.fx.animateProperty({
          node : "mainDivContainer",
          properties : {
            width :mainDivContainerWith ,
          },
          duration : duration
        })
        , dojox.fx.animateProperty({
          node : contentPaneNode,
          properties : {
            width :mainDivContainerWith,
          },
          duration : duration
        })
        , dojox.fx.animateProperty({
          node :  document.querySelector('[id^="dijit_layout_BorderContainer_"'),
          properties : {
            width :mainDivContainerWith,
          },
          duration : duration
        })
          , dojox.fx.animateProperty({
            node : "listDiv",
            properties : {
              width :listDivWidth ,
              height :listDivHeight,
            },
            duration : duration
          })
          ,dojox.fx.animateProperty({
            node : "contentDetailDiv",
            properties : {
              width : detailWidth,
              height :detailHeight,
              left : detailLeft
            },
            duration : duration
          })
          ,dojox.fx.animateProperty({
            node : "globalContainer",
            properties : {
              width :(this.isMenuOpen=='true')? globalWidth+250 : globalWidth ,
            },
            duration : duration
          })
          
        ]).play();
        setTimeout("if (dojo.byId('detailDiv').offsetWidth<dojo.byId('contentDetailDiv').offsetWidth-20) dijit.byId('contentDetailDiv').resize();",duration+50);

      }else{
          dojox.fx.combine([ dojox.fx.animateProperty({
            node : "menuTop",
            properties : {
              width : globalWidth,
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "leftMenu",
            properties : {
              width : { start:(this.isMenuOpen=='true')? 0 : 250 ,end:(this.isMenuOpen=='true')? 250 : 0}
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "leftDiv",
            properties : {
              width : { start:(this.isMenuOpen=='true')? 0 : 250 ,end:(this.isMenuOpen=='true')? 250 : 0}
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "globalTopCenterDiv",
            properties : {
              width : globalWidth,
              left: { start:(this.isMenuOpen=='true' || dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOn') )? 0 : 250 ,end:(this.isMenuOpen=='true' &&  dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOff') )? 250 : 0}
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "centerDiv",
            properties : {
              width : globalWidth,
              left: { start:(this.isMenuOpen=='true' || dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOn')  )? 0 : -250 ,end:(this.isMenuOpen=='true'  &&  dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOff') )? 0 : 0}
            },
            duration : duration
          }),dojox.fx.animateProperty({
            node : "menuLeftBarContaineur",
            properties : {
              width :{ start:(this.isMenuOpen=='true')?  0 : 250,end:(this.isMenuOpen=='true')? 250 :0 }
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "statusBarDiv",
            properties : {
              width : globalWidth,
            },
            duration : duration
          }),  dojox.fx.animateProperty({
            node : "statusBarDivBottom",
            properties : {
              width : globalWidth,
//              left: { start:(this.isMenuOpen=='true'  || dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOn') )? 0 : 250 ,end:(this.isMenuOpen=='true'  &&  dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOff') )? 250 : 0}
            },
            duration : duration
          })
        ]).play();
      } 
        
      if(dojo.byId('todayClassicView') && dojo.byId('todayActStream')){
        var todayActStreamWidth=(dojo.byId('todayActStreamIsActive').value=='true')? 0 : parseInt(dojo.byId('defaultTodayActStreamWidth').value);
        var todayClassicViwWidth=(globalWidth-20)-todayActStreamWidth;
        if(todayActStreamWidth==0){
            dojox.fx.combine([ dojox.fx.animateProperty({
            node : "todayClassicView",
            properties : {
              width : todayClassicViwWidth,
              left: { start:(this.isMenuOpen=='true')? 0 : 250 ,end:(this.isMenuOpen=='true')? 250 : 0}
            },
            duration : duration
          }), dojox.fx.animateProperty({
            node : "todayActStream",
            properties : {
              width : todayActStreamWidth,
              left: { start:(this.isMenuOpen=='true')? 0 : 250 ,end:(this.isMenuOpen=='true')? 250 : 0}
            },
            duration : duration
          })]).play();
        }
      }
      return duration;
    },
    
    _resizeGlobalContainer: function (duration){
      if (dojo.byId('mainDivContainer')) {
  			if (dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOn') ) {
          //setTimeout('dojo.byId("globalTopCenterDiv").offsetWidth=dojo.byId("toolBarDiv").offsetWidth+250;dijit.byId("globalContainer").resize();dojo.byId("globalTopCenterDiv").style.left = 0;', duration+50);
  			  setTimeout('dijit.byId("listDiv").resize();dijit.byId("leftDiv").resize();', duration+50);
        } else {
          //var toolBarDivWidth=+dojo.byId("toolBarDiv").offsetWidth;
          setTimeout('dijit.byId("globalContainer").resize();', duration+50);
          if(dojo.byId('contentDetailDiv').style.width == '0px'){
            setTimeout('refreshTimeline();', duration+50);
          }
        }
      } else {
        if (dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOn') ) {
          //setTimeout('dojo.byId("globalTopCenterDiv").offsetWidth=dojo.byId("toolBarDiv").offsetWidth+250;dijit.byId("globalContainer").resize();dojo.byId("globalTopCenterDiv").style.left = 0;', duration+50);
          setTimeout('dijit.byId("centerDiv").resize();dijit.byId("leftDiv").resize();', duration+50);
        } else {
          //var toolBarDivWidth=+dojo.byId("toolBarDiv").offsetWidth;
          setTimeout('dijit.byId("globalContainer").resize();', duration+50);
        }
      }
			setTimeout('closeOpenLeftMenu=false',duration+400) ;
    }
  };
  
  window.menuLeft = menuLeft;

} )(window);


//=============================================================================
//add remove favoris 
//=============================================================================
function addRemoveFavMenuLeft (id,name,mode,type,idRow){
  var items=dojo.byId('ml-menu').querySelectorAll('#'+id);
  items.forEach(function(el){
  el.removeAttribute('class');
  el.removeAttribute('onclick');
  });
  if(mode=='add'){
     var isReport=(type=="reportDirect")?'true':'false';
      var func= "addRemoveFavMenuLeft('"+id+"','"+name+"','remove','"+type+"')";
      var menuName=(isReport=='true')?name:name.substr(4);
      var param="?operation=add&class="+menuName+"&isReport="+isReport;
      dojo.xhrGet({
        url : "../tool/saveCustomMenu.php"+param+"&csrfToken="+csrfToken,
        handleAs : "text",
        load : function(data, args) {
        	menuNewGuiFilter('menuBarCustom', null);
        },
      });
      items.forEach(function(el){
        el.setAttribute('onclick',func);
        el.setAttribute('class','menu__as__Fav');
      });
  }else{
  var isReport=(type=="reportDirect")?'true':'false';
  var func= "addRemoveFavMenuLeft('"+id+"','"+name+"','add','"+type+"')";
  var menuName=(isReport=='true')?name:name.substr(4);
  var param="?operation=remove&class="+menuName+"&isReport="+isReport+"&idRow="+idRow;
  dojo.xhrGet({
    url : "../tool/saveCustomMenu.php"+param+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data, args) {
    	menuNewGuiFilter('menuBarCustom', null);
    },
  });
  items.forEach(function(el){
    el.setAttribute('onclick',func);
    el.setAttribute('class','menu__add__Fav');
  
  });
  }
}

//=============================================================================
//show icons on menu left 
//=============================================================================
function showIconLeftMenu(){
  var leftMenu=dojo.byId('ml-menu');
  var divMenuSearch=leftMenu.querySelector('.menu__searchMenuDiv ');
  var mode=dojo.byId('displayModeLeftMenu').value;
  display=(mode=='ICONTXT')?'none':'block';
  style=(mode=='ICONTXT')?"float:left;max-width:180px;":"float:left;max-width:155px;";
  style2=(mode=='ICONTXT')?"float:left;max-width:200px;":"float:left;max-width:165px;";
  leftMenu.menus = [].slice.call(leftMenu.querySelectorAll('.menu__level'));
  leftMenu.menus.forEach(function(menuEl, pos) {
    var items = menuEl.querySelectorAll('.menu__item');
    items.forEach(function(itemEl) {
      var iconDiv = itemEl.querySelector('.iconSize16');
      iconDiv.style.display=display;
      
      var posDiv = itemEl.querySelector('.divPosName');
      posDiv.style=(itemEl.querySelector('.menuPluginToInstlal'))?style2:style;
    });
  });
  if(dojo.byId('menuSearchDiv').value.trim()!=''){
    var menus=divMenuSearch.querySelectorAll('.menu__item');
    menus.forEach(function(menuCopyEl, pos) {
        var iconDivCopy = menuCopyEl.querySelector('.iconSize16');
        iconDivCopy.style.display=display;
        var posDivCopy = menuCopyEl.querySelector('.divPosName');
        posDivCopy.style=(menuCopyEl.querySelector('.menuPluginToInstlal'))?style2:style;
    });
  }

  if(dojo.byId('selectedViewMenu').value=='Parameter'){
    if(dojo.byId('parameterMenu')){
      var menuParam=dojo.byId('parameterMenu').querySelectorAll('.menu__item');
      menuParam.forEach(function(e){
       var icon=e.querySelector('.iconSize16');
       icon.style.display=display;
      });
    }
  }
  mode=(display=='block')?'ICONTXT':'TXT';
  dojo.setAttr('displayModeLeftMenu','value',mode);
  saveDataToSession('menuLeftDisplayMode',mode,true);
}

//=============================================================================
//show bottom content on menu left 
//=============================================================================
function showBottomContent (menu){
  if(menu==dojo.byId('selectedViewMenu').value)return;
  menuAcces=dojo.byId('menuPersonalAcces');
  var asSelect=menuAcces.querySelector('.iconBreadSrumbSelect');
  if(asSelect){
    classie.remove(asSelect,'iconBreadSrumbSelect');
  }
  classie.add(dojo.byId('button'+menu),'iconBreadSrumbSelect');
  saveDataToSession('bottomMenuDivItemSelect',menu,true);
  if(menu!='Console'){
    dojo.byId('messageDivNewGui').style.display='none';
    dojo.byId('loadDivBarBottom').style.display='block';
  }
  if(menu!='Kawa'){
    dojo.byId('kawaDivNewGui').style.display='none';
  }
  var items=dojo.byId('loadDivBarBottom');
  var alldiv=items.querySelectorAll('.menuBottomDiv');
  alldiv.forEach(function(el){
    el.style.display='none';
  });
  dojo.setAttr('selectedViewMenu','value',menu);
  switch(menu){
    case 'Parameter':
        var menuLeftTop=dojo.byId('ml-menu');
        var menuSelected=menuLeftTop.querySelector('.menu__link--current');
        if(menuSelected!=null){
          var onclick=menuSelected.getAttribute('onclick');
          var isObject=(onclick.includes('loadMenuBarItem'))?'false':'true';
          var id=(menuSelected.id.indexOf('report')!=-1)?'Report':menuSelected.id.substr(4);
          showMenuBottomParam(id,isObject);
        }
        dojo.byId('parameterDiv').style.display='block';
      break;
    case 'Link':
      dojo.byId('projectLinkDiv').style.display='block';
      break;
    case 'Document':
      dojo.byId('documentsDiv').style.display='block';
      dojo.byId('documentDirectoryTree').style.height="auto";
      dojo.byId('documentDirectoryTree').style.width="auto";
      dijit.byId('documentsDiv').resize();
      break;
    case 'Notification':
      dojo.byId('notificationBottom').style.display='block';
      dijit.byId('notificationBottom').resize();
      break;
    case 'Console':
      items.style.display='none';
      dojo.byId('messageDivNewGui').style.display='block';
      break;
    case 'Kawa':
      items.style.display='none';
      if (!isHosted) dojo.byId('kawaDivNewGui').style.display='block';
      break;
  }
  
}

//=============================================================================
//load reports  
//=============================================================================
function loadMenuReportDirect(cate,idReport,lstRepId,file){
 
  if (checkFormChangeInProgress()) {
    return false;
  }
  setActionCoverListNonObj('CLOSE',false); 
  item="Reports";
  cleanContent("detailDiv");
  hideResultDivs();
  formChangeInProgress=false;
  var currentScreen=item;
  var objectExist='false';
  var repList=(lstRepId!='')?'&lstRepId='+lstRepId:'';
  var nameCat=(file!='')?'&nameSubCat='+file:'';
  loadContent("reportsMain.php?idCategory="+cate+repList+nameCat, "centerDiv");
  loadDiv("menuUserScreenOrganization.php?currentScreen="+currentScreen+'&objectExist='+objectExist,"mainDivMenu");
  stockHistory(item,null,currentScreen);
  if(defaultMenu == 'menuBarRecent'){
    menuNewGuiFilter(defaultMenu, item);
  }
  editFavoriteRow(true);
  selectIconMenuBar(item);
  setTimeout('reportSelectReport('+idReport+')',500);
  return true;
}
  

//=============================================================================
//show menu prameter on bottom left menu  
//=============================================================================
function showMenuBottomParam(item,isObject){
  if(dojo.byId('selectedViewMenu') && dojo.byId('selectedViewMenu').value=='Parameter'){
    var execute=true;
    if(dojo.byId('menuParamDisplay')){
      execute=(dojo.byId('menuParamDisplay').value!=menuSelect)?true:false;
    }
    var menuSelect = dojo.byId('selectedScreen').value;
    if(item!=menuSelect && execute==true ){
      loadContent("../tool/drawBottomParameterMenu.php?currentScreen="+item+'&isObject='+isObject,"parameterDiv");
    }
    dojo.setAttr('selectedScreen','value',item);
  }
}

//=============================================================================
//refresh selected menu on Menu left 
//=============================================================================
function refreshSelectedMenuLeft(menuName){
  var menuLeftTop=dojo.byId('ml-menu');
  var divMenuSearch=leftMenu.querySelector('.menu__searchMenuDiv ');
  if(dojo.byId('parameterMenu'))var menuLeftBottom=dojo.byId('parameterMenu');
  
  var curents=menuLeftTop.querySelectorAll('.menu__link--current');
  curents.forEach(function(el){
    classie.remove(el,'menu__link--current');
  });
  var newCurrents=menuLeftTop.querySelectorAll('#'+menuName);
  newCurrents.forEach(function(e){
    classie.add(e,'menu__link--current');
  });
  if(dojo.byId('parameterMenu')){
    var bootomMenuSelcet=menuLeftBottom.querySelector('.menu__link--current');
    if(bootomMenuSelcet!=null){
      classie.remove(bootomMenuSelcet, 'menu__link--current');
    }
    var newMenuBottomSelect=menuLeftBottom.querySelector('#'+menuName+'Param');
    if(newMenuBottomSelect!=null) classie.add(newMenuBottomSelect,'menu__link--current');
  }
  if(dojo.byId('menuSearchDiv').value.trim()!=''){
    var searchMenuSelcet=divMenuSearch.querySelector('.menu__link--current');
    if(searchMenuSelcet!=null){
      classie.remove(searchMenuSelcet, 'menu__link--current');
    }
    var newSearchMenuSelect=divMenuSearch.querySelector('#'+menuName);
    if(newSearchMenuSelect!=null) classie.add(newSearchMenuSelect,'menu__link--current');
  }
}
//=============================================================================
//load plugin page for not intaled plugins 
//=============================================================================
function loadPluginView(id){
  setActionCoverListNonObj('CLOSE',false); 
  loadContent("pluginShopView.php?objectId="+id,"centerDiv");
}

function directionExternalPage (page){
  window.open(page, '_blank');
}
//=============================================================================


//=============================================================================
//load plugin page for not intaled plugins 
//=============================================================================
//=============================================================================
function changePasswordType(old){
  if(!old){
    var newPw=dojo.byId('dojox_form__NewPWBox_0'),
    veryPw=dojo.byId('dojox_form__VerifyPWBox_0');
    if(newPw.getAttribute('type')=='password' && veryPw.getAttribute('type')=='password'){
      newPw.setAttribute('type','text');
      veryPw.setAttribute('type','text');
    }else{
      newPw.setAttribute('type','password');
      veryPw.setAttribute('type','password');
    }
  }else{
    var oldPw=dojo.byId('oldPwd');
    if(oldPw.getAttribute('type')=='password'){
      oldPw.setAttribute('type','text');
    }else{
      oldPw.setAttribute('type','password');
    }
  }
}

//=============================================================================
//search menu 
//=============================================================================
function searchMenuToDisplay(val){
  val=val.toUpperCaseWithoutAccent();
  var menuExist= new Array();
  var menuReportExist= new Array();
  var arrayMenuName=new Array();
  var menuLeftTop=dojo.byId('ml-menu');
  var currentDivMenu=menuLeftTop.querySelector('.menu__wrap');
  var menuSearchMenu=menuLeftTop.querySelector('.menu__searchMenuDiv ');
  var clearSearch=dojo.byId('clearSearchMenu');
  
  if(currentDivMenu.style.display!='none' && val.trim()!=''){
    currentDivMenu.setAttribute('style','display:none;');
  }else if(currentDivMenu.style.display=='none' && val.trim()==''){
    currentDivMenu.setAttribute('style','display:block;');
  }
  var testasChild=menuSearchMenu.hasChildNodes();
  if(menuSearchMenu.style.display=='none' && val.trim()!='' && !testasChild){
    menuSearchMenu.setAttribute('style','display:block;');
  }else if(menuSearchMenu.style.display=='block' && val.trim()==''){
    menuSearchMenu.setAttribute('style','display:none;');
  }else if((val.trim()!='' && testasChild )){
    menuSearchMenu.remove();
    var menuSearchMenu=document.createElement('div');
    menuSearchMenu.className='menu__searchMenuDiv ';
    menuSearchMenu.setAttribute('style','display:block');
    menuLeftTop.insertAdjacentElement('beforeEnd',menuSearchMenu );
  }
  if(val.trim()==''){
    clearSearch.style.display='none';
    return;
  }
  if(clearSearch.style.display=='none')clearSearch.style.display='block';
  var menus=menuLeftTop.querySelectorAll('.divPosName');
  var c=0;
  menus.forEach(function(el){
    c++;
    var text=el.innerHTML.toLowerCase();
    text=text.replace('<span style="display:none">','');
    text=text.replace('</span>','');
    menuName="'"+text+"'";
    if(!arrayMenuName.includes(menuName)){
      if(menuName.includes(val.toLowerCase())){
        if(el.parentNode.className=='menu__linkDirect' || el.parentNode.className=='menu__linkDirect menu__link--current'){
          arrayMenuName.push(menuName);
          if(el.parentNode.parentNode.querySelector('#reportFileMenu')){
            var report=el.parentNode.parentNode.cloneNode(true);
            report.setAttribute('onClick','refreshSelectedMenuLeft("'+el.parentNode.id+'")');
            menuReportExist.push(report);
          }else{
            var menu=el.parentNode.parentNode.cloneNode(true);
            menu.setAttribute('onClick','refreshSelectedMenuLeft("'+el.parentNode.id+'")');
            menuExist.push(menu);
          }
        }
      }
    }
  });
  
  menuExist.forEach(function(e){
    menuSearchMenu.insertAdjacentElement('beforeEnd',e);
    e.addEventListener( "click", function( ev ) {
      ev.stopPropagation();
      ev.preventDefault();
      if (dojo.byId('autoHideMenuIcon').className.includes('autoHideMenuOn')) {
        menuLeft.prototype._closeMenu();
        dojo.byId( 'hideStreamNewGuiTopBar' ).addEventListener( "mouseover", function() {
          ev.stopPropagation();
          ev.preventDefault();
          this.timeOutEvent = setTimeout(function () {
            if(menuLeft.prototype.isMenuOpen=='false' ) {
              menuLeft.prototype._openMenu();
              document.addEventListener( self.eventtype, self.bodyClickFn );
            }
          },200); 
        }, true );
        document.removeEventListener( menuLeft.prototype.eventtype, menuLeft.prototype.bodyClickFn );
      }
    });
  });
  
  if(menuReportExist.length!==0){
    if(menuExist.length!==0){
      var reportDiv=document.createElement('div');
      reportDiv.className='sectionReportMenuSearch';
      reportDiv.innerHTML=i18n('menuReports');
      menuSearchMenu.insertAdjacentElement('beforeEnd',reportDiv );
    }

    menuReportExist.forEach(function(e){
      menuSearchMenu.insertAdjacentElement('beforeEnd',e);
    });
  }
}

//=============================================================================
//clear search
//=============================================================================

function clearSearchInputMenuLeft(){
  dojo.byId('menuSearchDiv').value='';
  dojo.byId('clearSearchMenu').style.display='none';
  var menuLeftTop=dojo.byId('ml-menu');
  var currentDivMenu=menuLeftTop.querySelector('.menu__wrap');
  var menuSearchMenu=menuLeftTop.querySelector('.menu__searchMenuDiv ');
  menuSearchMenu.remove();
  var newMenuSearchMenu=document.createElement('div');
  newMenuSearchMenu.className='menu__searchMenuDiv ';
  newMenuSearchMenu.setAttribute('style','display:none');
  menuLeftTop.insertAdjacentElement('beforeEnd',newMenuSearchMenu );
  currentDivMenu.setAttribute('style','display:block;');
}
//=============================================================================


function helpDisplayIconIsRead (val){
  if(val=='yes'){
    saveUserParameter('helpDisplayIconMesagediv',val);
    dojo.byId('helpDisplayIcon').style.display='none';
  }
}

var menuBarListDivData=null;
var anotherBarContainerData=null;
var menuBarListDivCallback=null;
var anotherBarContainerCallback=null;
var menuNewGuiFilterInProgress=false;
function menuNewGuiFilter(filter, item) {
  if (menuNewGuiFilterInProgress==true) {
    return;
  }
  menuNewGuiFilterInProgress=true;
  saveUserParameter('defaultMenu', filter);
  if(!item)item=dojo.byId('itemSelected').value;
	var historyBar = new Array();
	historyTable.forEach(function(element){
		historyBar.push('menu'+element[0]);
	});
	var callback = function(){
	  //refreshSelectedItem(item, filter);
		if(filter != 'menuBarCustom'){
			dojo.byId('favoriteSwitch').style.display = 'none';
			dojo.addClass('recentButton','imageColorNewGuiSelected');
			dojo.removeClass('favoriteButton','imageColorNewGuiSelected');
		}else{
			dojo.byId('favoriteSwitch').style.display = 'block';
			dojo.addClass('favoriteButton','imageColorNewGuiSelected');
			dojo.removeClass('recentButton','imageColorNewGuiSelected');
		}
    dojo.query('.anotherBarDiv').forEach(function(el){
    	var source = new dojo.dnd.Source(el.id, { accept:["menuBar" ],horizontal:true});
    });
	};
	var hide = function(){
		if(filter == 'menuBarRecent')editFavoriteRow(true);
	};
	var isMenuLeftOpen = dojo.byId('isMenuLeftOpen').value;
	//cleanContent("menuBarListDiv");
	menuBarListDivData=null;
	anotherBarContainerData=null;
	saveUserParameter('defaultMenu', filter);
	defaultMenu=filter;
	loadContent('../view/refreshMenuBarList.php?menuFilter='+filter+'&historyTable='+historyBar, 'menuBarListDiv', null, null, null, null, null, callback, true);
	//cleanContent("anotherBarContainer");
	loadContent('../view/refreshMenuAnotherBarList.php?menuFilter='+filter+'&isMenuLeftOpen='+isMenuLeftOpen, 'anotherBarContainer', null, null, null, null, null, hide, true);
	refreshSelectedItem(item, filter);
	//saveUserParameter('defaultMenu', filter);
	//defaultMenu=filter;
}

function refreshSelectedItem(item, filter){
	dojo.byId('itemSelected').value = item;
	var refreshItem = function(){
		if(item)selectIconMenuBar(item);
	};
	loadDiv('../view/refreshMenuBarButtonFavorite.php?item='+item+'&menuFilter='+filter, 'menuBarFavoriteButton', null, refreshItem);
}

function switchFavoriteRow(idRow, direction, maxRow){
	var nextRow=idRow;
	if(direction=='up'){
		do{
			nextRow -= 1;
			if(nextRow < 1)nextRow=maxRow;
		}while(dojo.byId('menuBarDndSource'+nextRow) && dojo.byId('menuBarDndSource'+nextRow).querySelectorAll('.dojoDndItem').length == 0);
	}else if(direction=='down'){
		do{
			nextRow += 1;
			if(nextRow > maxRow)nextRow=1;
		}while(dojo.byId('menuBarDndSource'+nextRow) && dojo.byId('menuBarDndSource'+nextRow).querySelectorAll('.dojoDndItem').length == 0);
	}else{
		
	}
	var callback = function(){
		saveUserParameter('idFavoriteRow', nextRow);
		menuNewGuiFilter('menuBarCustom', null);
	};
	if(nextRow != idRow){
		loadDiv('../view/refreshMenuBarFavoriteCount.php?idFavoriteRow='+nextRow+'&defaultMenu='+defaultMenu, 'favoriteSwitch', null, callback);
	}else{
		return;
	}
}

function gotoFavoriteRow(idRow, nextRow){
	var row = nextRow;
	if(dojo.byId('menuBarDndSource'+nextRow).querySelectorAll('.dojoDndItem').length == 0){
		row=idRow;
	}
	var callback = function(){
		saveUserParameter('idFavoriteRow', nextRow);
		menuNewGuiFilter('menuBarCustom', null);
	};
	if(row != idRow){
		loadDiv('../view/refreshMenuBarFavoriteCount.php?idFavoriteRow='+nextRow+'&defaultMenu='+defaultMenu, 'favoriteSwitch', null, callback);
	}else{
		return;
	}
}

function wheelFavoriteRow(idRow, evt, maxRow){
	if(defaultMenu == 'menuBarRecent')return;
	var nextRow=idRow;
	if(evt.deltaY < 0){
		do{
			nextRow -= 1;
			if(nextRow < 1)nextRow=maxRow;
		}while(dojo.byId('menuBarDndSource'+nextRow) && dojo.byId('menuBarDndSource'+nextRow).querySelectorAll('.dojoDndItem').length == 0);
	}else if(evt.deltaY > 0){
		do{
			nextRow += 1;
			if(nextRow > maxRow)nextRow=1;
		}while(dojo.byId('menuBarDndSource'+nextRow) && dojo.byId('menuBarDndSource'+nextRow).querySelectorAll('.dojoDndItem').length == 0);
	}
	var callback = function(){
		saveUserParameter('idFavoriteRow', nextRow);
		menuNewGuiFilter('menuBarCustom', null);
	};
	if(nextRow != idRow){
		loadDiv('../view/refreshMenuBarFavoriteCount.php?idFavoriteRow='+nextRow+'&defaultMenu='+defaultMenu, 'favoriteSwitch', null, callback);
	}else{
		return;
	}
}


function checkClassForDisplay(el,id,mode){
  element=el.querySelector('#'+id);
  if(mode=='leave'){
    element.setAttribute('style','display:none;');
  }else{
    element.setAttribute('style','display:block;');
  }
}

function editFavoriteRow(hide){
	if(defaultMenu == 'menuBarRecent')return;
	if(dojo.byId('isEditFavorite').value == 'true' || hide){
		dojo.byId('menuBarListDiv').setAttribute('style', 'overflow:hidden;width: 100%;height: 43px;border-left: 1px solid var(--color-dark);');
		dojo.byId('isEditFavorite').value = 'false';
		dojo.byId('anotherBarContainer').style.display = 'none';
	}else{
		dojo.byId('menuBarListDiv').setAttribute('style', 'overflow:hidden;width: 100%;height: 43px;border-radius: 5px;border-left: 1px solid var(--color-dark);');
		dojo.byId('isEditFavorite').value = 'true';
		dojo.byId('anotherBarContainer').style.display = 'block';
	}
}

function resetTodayDiv(){
  var param="?reset=1";
  dojo.xhrGet({
    url : "../tool/saveCustomTodayMenuOrder.php"+param+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data, args) {
      loadMenuBarItem('Today','Today','bar');
      dijit.byId('dialogNewTodayParameters').hide();
    },
  });
}

function moveTodayDiv(source, target, selection){
  var customArray = new Array();
  var pos = 1;
  dojo.byId(target).querySelectorAll('.dojoDndItem').forEach(function(node){
    var name = node.id;
    if(name.indexOf('dojoUnique') == -1){
      customArray[pos] = name;
      pos++;
    }
  });
  
  
  var param="?customArray="+customArray;
  dojo.xhrGet({
    url : "../tool/saveCustomTodayMenuOrder.php"+param+"&csrfToken="+csrfToken,
    handleAs : "text",
    load : function(data, args) {
      
    },
  });
  
}

function moveMenuBarItem(source, target, selection, copy){
	if(dojo.byId('isEditFavorite').value != 'true')dojo.byId('anotherBarContainer').style.display = 'none';
	dojo.byId('removeMenuDiv').style.visibility = 'hidden';
	var idRow = null;
	var idRowSource = null;
	if(target != 'menuBarDndSource'){
		idRow = target.substr(-1);
	}else{
		idRow = dojo.byId('idFavoriteRow').value;
	}
	if(source != 'menuBarDndSource'){
		idRowSource = source.substr(-1);
	}else{
		idRowSource = dojo.byId('idFavoriteRow').value;
	}
	var customArray = new Array();
	var pos = 1;
	dojo.byId(target).querySelectorAll('.dojoDndItem').forEach(function(node){
		var idItem = node.id;
		var name = idItem.substr(7);
		if(idItem.indexOf('dojoUnique') == -1){
			name = name.split('_')[0];
			customArray[pos] = name;
			pos++;
		}
	});
	if(copy == 'true'){
		var selectedItems = selection.split(',');
		customArray = new Array();
		selectedItems.forEach(function(idItem){
			var name = idItem.substr(7);
			name = name.split('_')[0];
			customArray[pos] = name;
			pos++;
		});
	}
	  var param="?idSourceFrom="+source+"&idSourceTo="+target+"&idRow="+idRow+"&customArray="+customArray+'&defaultMenu='+defaultMenu+'&copy='+copy+'&idRowSource='+idRowSource;
	  dojo.xhrGet({
	    url : "../tool/saveCustomMenuOrder.php"+param+"&csrfToken="+csrfToken,
	    handleAs : "text",
	    load : function(data, args) {
	    	menuNewGuiFilter('menuBarCustom', null);
	    },
	  });
}

function getSourceSelectedItem(nodes){
	var selectedItem = new Array();
	nodes.forEach(function(item, id, map){
		selectedItem[id]=item.id;
	});
	return selectedItem.toString();
}

function removeMenuBarItem(target, idNode){
	dojo.byId('removeMenuDiv').style.visibility = 'hidden';
	dojo.byId('removeMenuDiv').querySelectorAll('.dojoDndItem').forEach(function(node){
		var name = node.id.substr(7);
		var idName = name.split('_');
		name = idName[0];
		var idRow = idName[1];
		var type = (name.substr(4) == 'menu')?'menu':'reportDirect';
		var id = (type=='menu')?'div'+name.charAt(0).toUpperCase()+name.slice(1):'div'+name;
		addRemoveFavMenuLeft (id, name, 'remove', type, idRow);
	});
}

function showFavoriteTooltip(menuClass,idFavoriteRow) {
  editFavoriteRow(true);
  clearTimeout(closeFavoriteTimeout);
  clearTimeout(openFavoriteTimeout);
  openFavoriteTimeout=setTimeout("dijit.byId('addFavorite"+menuClass+"_"+idFavoriteRow+"').openDropDown();",100);
  customMenuAddRemoveClass=menuClass;
}

function hideFavoriteTooltip(delay, menuClass, idFavoriteRow) {
  if (!dijit.byId("addFavorite"+menuClass+"_"+idFavoriteRow)) return;
  clearTimeout(closeFavoriteTimeout);
  clearTimeout(openFavoriteTimeout);
  closeFavoriteTimeout=setTimeout("dijit.byId('addFavorite"+menuClass+"_"+idFavoriteRow+"').closeDropDown();",delay);
  customMenuAddRemoveClass=menuClass;
}

function addNewGuiItem(item){
	if (checkFormChangeInProgress()) {
	    return false;
	}
    var currentScreen=null;
    if(dojo.byId('objectClass'))currentScreen=dojo.byId('objectClass').value;
    var classManual=null;
    if(dojo.byId('objectClassManual'))classManual=dojo.byId('objectClassManual').value;
    var param = dojo.byId('newItemAccessMode').value;
    if(classManual == 'Kanban' && item==currentScreen){
    	showDetail('refreshActionAdd'+item,1,item,false,'new');
    	return;
    }
	if(param == 'direct'){
		var callbackPlanning = function(){
			loadDiv("menuUserScreenOrganization.php?currentScreen=Planning&objectExist="+objectExist,"mainDivMenu");
			stockHistory('Planning',null,'Planning');
			if(defaultMenu == 'menuBarRecent'){
			  menuNewGuiFilter(defaultMenu, 'Planning');
			}
			selectIconMenuBar('Planning');
			addNewItem(item);
		};
		var callbackItem = function(){
			loadDiv("menuUserScreenOrganization.php?currentScreen="+item+"&objectExist="+objectExist,"mainDivMenu");
			stockHistory(item,null,'Object');
			if(defaultMenu == 'menuBarRecent'){
			  menuNewGuiFilter(defaultMenu, item);
			}
			selectIconMenuBar(item);
			addNewItem(item);
		};
		if(item != 'Resource' && item != 'Ticket'){
			var currentMenu=null;
		    if(dojo.byId('objectClassManual'))currentMenu=dojo.byId('objectClassManual').value;
		    if(currentMenu != 'Planning'){
		    	vGanttCurrentLine=-1;
			    cleanContent("centerDiv");
			    notShowDetailAfterReplan=false;
				loadContent("planningMain.php", "centerDiv",null,null,null,null,null,callbackPlanning);
		    }else{
		    	addNewItem(item);
		    }
		}else{
			if(currentScreen != item){
				cleanContent("detailDiv");
				loadContent("objectMain.php?objectClass=" + item, "centerDiv",null,null,null,null,null,callbackItem);
			}else{
				addNewItem(item);
			}
		}
	}else{
	  var currentClass='';
	  if (dojo.byId('objectClassManual')) currentClass=dojo.byId('objectClassManual').value;
	  else if (dojo.byId('objectClass')) currentClass=dojo.byId('objectClass').value;
	  if (currentClass==item || currentClass.substr(0,8)=="Planning") fromContextMenu=true;
		actionSelectAdd(item, null, null);
	}
}

function setArchiveMode(){
	var callBack = function(){
	    refreshProjectSelectorList();
	    if (dojo.byId('objectClass') ) {
	      refreshGrid(true);
	    }
	  };
  saveDataToSession('projectSelectorShowIdle', 0,false,callBack);
  dijit.byId('dialogProjectSelectorParameters').hide();
  dojo.byId('archiveOn').style.display='none';
  dojo.byId('archiveOnSeparator').style.display='none';
  dojo.byId('archiveOnDiv').style.display='none';
}

function displayFullScreenCK(field) {
  displayFullScreenCKfield=field;
  displayFullScreenCKopening=true;
  alreadyExist=false;
  if (typeof CKEDITOR.instances['textFullScreenCK'] == 'undefined') {
    ckEditorReplaceEditor("textFullScreenCK",996);
  } else {    
    if(CKEDITOR.instances['textFullScreenCK'].getCommand('maximize').state == CKEDITOR.TRISTATE_OFF) CKEDITOR.instances['textFullScreenCK'].execCommand( 'maximize');
  }
  if (typeof CKEDITOR.instances['textFullScreenCK'] != 'undefined' && typeof CKEDITOR.instances[field] != 'undefined') {
    var ckSetDataAndFocus=function() {
      var editorFS=CKEDITOR.instances['textFullScreenCK'];
      var editorSource=CKEDITOR.instances[field];
      editorFS.setData(editorSource.getData(),function(){editorFS.focus();});
      editorFS.readOnly=editorSource.readOnly;
    };
    setTimeout(ckSetDataAndFocus,100);
  }
  whichFullScreen=996;
  setTimeout("displayFullScreenCKopening=false;",500);
}
function displayFullScreenCK_close() {
  if (displayFullScreenCKopening) return;
  displayFullScreenCKopening=true;
  if (typeof CKEDITOR.instances['textFullScreenCK'] != 'undefined' && typeof CKEDITOR.instances[displayFullScreenCKfield] != 'undefined') {
    var editor=CKEDITOR.instances[displayFullScreenCKfield];
    if (! editor.readOnly ) editor.setData(CKEDITOR.instances['textFullScreenCK'].getData(),function(){editor.focus();});
    //var focusManager=new CKEDITOR.focusManager(CKEDITOR.instances[displayFullScreenCKfield]);
    //focusManager.focus();
  }
  displayFullScreenCKfield=null;
  setTimeout("displayFullScreenCKopening=false;",500);
  whichFullScreen=-1;
}

idFavoriteProjectList = null;
function addRemoveFavProject (id,mode){
	var div = dojo.byId('divFavProject_'+id);
	if(!div)return;
	dojo.removeAttr(div, 'class');
	dojo.removeAttr(div, 'onclick');
  if(mode=='add'){
	  var func= "event.stopPropagation();addRemoveFavProject('"+id+"','remove')";
	  dojo.setAttr(div, 'onclick',func);
	  dojo.setAttr(div, 'class', 'menu__as__Fav');
	  dojo.byId('labelProject_'+id).style.color = 'var(--color-secondary)';
	  if(favoriteProjectsArray.length > 0){
		  favoriteProjectsArray += ','+id;
	  }else{
		  favoriteProjectsArray = id;
	  }
	  saveDataToSession('favoriteProjectsArray', favoriteProjectsArray, true);
  }else{
	  var func= "event.stopPropagation();addRemoveFavProject('"+id+"','add')";
	  dojo.setAttr(div, 'onclick',func);
	  dojo.setAttr(div, 'class', 'menu__add__Fav');
	  dojo.byId('labelProject_'+id).style.color = '';
	  if(favoriteProjectsArray.length > 0){
		  if(favoriteProjectsArray.indexOf(','+id) != -1){
			  favoriteProjectsArray = favoriteProjectsArray.replace(','+id,'');
		  }else{
			  favoriteProjectsArray = favoriteProjectsArray.replace(id,'');
		  }
	  }
	  if(favoriteProjectsArray.substr(0, 1) == ','){
		  favoriteProjectsArray = favoriteProjectsArray.substr(1);
	  }
	  saveDataToSession('favoriteProjectsArray', favoriteProjectsArray, true);
	  var isFavoriteSelected = dojo.byId('isFavoriteSelected').value;
	  if(isFavoriteSelected == '1'){
		  refreshProjectSelectorList();
	  }
  }
}

function saveFavoriteProjectList() {
  if (dijit.byId('favoriteProjectListName')) {
    if (dijit.byId('favoriteProjectListName').get('value') == "") {
      showAlert(i18n("messageMandatory", new Array(i18n("colFavoriteName"))));
      return;
    }
    if(favoriteProjectsArray.length <= 0){
		showAlert(i18n("noFavoriteProjectItem"));
		return;
    }
    dojo.byId('favoriteProjectName').value=dijit.byId('favoriteProjectListName').get(
        'value');
  }
  var callback = function(){
    clearDivDelayed('saveFavoriteProjectResult');
  };
  loadContent("../tool/saveFavoriteProjectList.php", "listStoredFavoriteProjectList",
      "favoriteProjectListForm", false,null,null,null,callback);
}

function removeFavoriteProjectList(favoriteFlatList ,id){
	var callback = function(){
		clearDivDelayed('saveFavoriteProjectResult');
		if(idFavoriteProjectList == id){
			saveDataToSession('idFavoriteProjectList', '');
			refreshProjectSelectorList();
		}
		if(favoriteFlatList.length > 0){
		  if(favoriteFlatList.indexOf(','+id) != -1){
			  favoriteFlatList = favoriteFlatList.replace(','+id,'');
		  }else{
			  favoriteFlatList = favoriteFlatList.replace(id,'');
		  }
		  if(favoriteFlatList.length <= 0 || favoriteFlatList == ''){
			  refreshProjectSelectorList();
		  }
		}else{
			refreshProjectSelectorList();
		}
	};
	loadContent("../tool/saveFavoriteProjectList.php?idFavoriteList="+id, "listStoredFavoriteProjectList",
		      "favoriteProjectListForm", false,null,null,null,callback);
}

function selectFavoriteProjectList(favoriteProjectlist, idFavoriteList){
	saveDataToSession('favoriteProjectsArray', favoriteProjectlist, true);
	favoriteProjectsArray = favoriteProjectlist;
	saveDataToSession('idFavoriteProjectList', idFavoriteList, true);
	idFavoriteProjectList = idFavoriteList;
	var isFavoriteListSelected = dojo.byId('isFavoriteListSelected');
	if(idFavoriteList == ''){
		isFavoriteListSelected.value = 0;
		if(favoriteProjectlist != ''){
  		var chars = favoriteProjectlist.split(',');
  		chars.forEach(function(el){
  		  addRemoveFavProject(el,'remove');
  		});
		}
	}else{
		var row = dojo.byId('favoriteList'+idFavoriteList);
		dojo.setAttr(row, 'class', 'dojoDndItemAnchor');
		isFavoriteListSelected.value = idFavoriteList;
	}
	saveDataToSession('project', '*');
	refreshProjectSelectorList();
	if (dojo.byId("GanttChartDIV")) {
		if (dojo.byId("resourcePlanning")) {
	      loadContent("resourcePlanningList.php", "listDiv", 'listForm');
	    } else if (dojo.byId("portfolioPlanning")) {
	      loadContent("portfolioPlanningList.php", "listDiv", 'listForm');
	    } else if (dojo.byId("globalPlanning")) {
	      loadContent("globalPlanningList.php", "listDiv", 'listForm');
	    } else {
	      loadContent("planningList.php", "listDiv", 'listForm');
	    }
	}else if(dojo.byId('objectClass')){
		var objclass = dojo.byId('objectClass').value;
		refreshJsonList(objclass);
	}else{
		refreshGrid();
	}
}