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
//test
/** ============================================================================
 * Action is establised during meeting, to define an action to be followed.
 */ 
require_once('_securityCheck.php'); 
class LessonLearnedMain extends SqlElement {
  
  public $_sec_description;
  public $id;
  public $idUser;
  public $creationDateTime;
  public $name;
  public $idProject;
  public $idLessonLearnedType;
  public $description;
  public $_sec_treatment;
  public $idStatus;
  public $idle;
  public $actionPlan;
  public $result;                                        
  public $_sec_Link;
  public $_Link=array();
  public $_Attachment=array();
  public $_Note=array();
  public $_nbColMax=3;

  private static $_fieldsAttributes=array(
    "id"=>"",
    "idProject"=>"required",
    "name"=>"required",
    "idStatus"=>"required",
    "idLessonLearnedType"=>"required",
    "idle"=>""
  );
  
  private static $_layout='
    <th field="id" formatter="numericFormatter" width="10%"># ${id}</th>
    <th field="nameProject" width="50%">${idProject}</th>
    <th field="name" width="50%" formatter="translationFormatter">${name}</th>
    <th field="nameStatus" width="30%">${idStatus}</th>
    ';
 
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
	
	public function save() {
	  $result = parent::save();
	  return $result;
	} 
	/** ==========================================================================
	 * Return the specific layout
	 * @return the layout
	 */
	
	protected function getStaticLayout() {
	  return self::$_layout;
	}
	
  /** ==========================================================================
   * Return the specific fieldsAttributes
   * @return the fieldsAttributes
   */
  protected function getStaticFieldsAttributes() {
    return array_merge(parent::getStaticFieldsAttributes(),self::$_fieldsAttributes);
  }
 
  /** ============================================================================
   * Set attribut from parent : merge current attributes with those of Main class
   * @return void
   */
  public function setAttributes() {

    
	} 
}
?>