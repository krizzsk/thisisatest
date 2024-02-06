<?php
/*
 *	@author: qCazelles 
 */

require_once('_securityCheck.php');
class WorkCommand extends SqlElement {
	
	public $id;   
	public $idCommand;
	public $idWorkUnit;
	public $idComplexity;
	public $name;
	public $unitAmount;
	public $commandQuantity;
	public $commandAmount;
	public $doneQuantity;
	public $doneAmount;
	public $billedQuantity;
	public $billedAmount;
	
	private static $_databaseCriteria = array();
	/** ==========================================================================
	 * Constructor
	 * @param $id the id of the object in the database (null if not stored yet)
	 * @return void
	 */

	
	/** ========================================================================
	 * Return the specific database criteria
	 * @return the databaseTableName
	 */
	protected function getStaticDatabaseCriteria() {
	  return self::$_databaseCriteria;
	}
	
	public function deleteControl(){
	  $result="";
	  
	  // Cannot delete done WorkCommand
	  if ($this->doneQuantity and $this->doneQuantity > 0 )	{
	  		$result .= "<br/>" . i18n("errorDeleteDoneWorkCommand");
	  }
	  // Cannot delete billed WorkCommand
	  if ($this->billedQuantity and $this->billedQuantity > 0 )	{
	    $result .= "<br/>" . i18n("errorDeleteBilledWorkCommand");
	  }
	   
	  if (! $result) {
	    $result=parent::deleteControl();
	  }
	  return $result;
	}
	
	
	/** ==========================================================================
	 * Construct
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
	
	
	
}