-- ///////////////////////////////////////////////////////////
-- // PROJECTOR                                             //
-- //-------------------------------------------------------//
-- // Version : 8.4.1                                       //
-- // Date : 2020-03-18                                     //
-- ///////////////////////////////////////////////////////////
-- Patch on V8.4.0

ALTER TABLE `${prefix}project` CHANGE `benefitValue` `benefitValue` INT(10) COMMENT '10';
