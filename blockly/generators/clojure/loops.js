/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Clojure for loop blocks.
 * @author raingong@google.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure.loops');

goog.require('Blockly.Clojure');


Blockly.Clojure['controls_repeat'] = function(block) {
  // Repeat n times (internal number).
  var repeats = Number(block.getFieldValue('TIMES'));
  var branch = Blockly.Clojure.statementToCode(block, 'DO');
  branch = Blockly.Clojure.addLoopTrap(branch, block.id);
  var loopVar = Blockly.Clojure.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = '(dotimes [' + loopVar + ' repeats ] ' +  branch + ')\n';
  return code;
};

Blockly.Clojure['controls_repeat_ext'] = function(block) {
  // Repeat n times (external number).
  var repeats = Blockly.Clojure.valueToCode(block, 'TIMES',
      Blockly.Clojure.ORDER_NONE) || '0';
  var branch = Blockly.Clojure.statementToCode(block, 'DO');
  branch = Blockly.Clojure.addLoopTrap(branch, block.id);
  var loopVar = Blockly.Clojure.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = '(dotimes [' + loopVar + ' repeats ] ' +  branch + ')\n';
  return code;
};

Blockly.Clojure['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Clojure.valueToCode(block, 'BOOL',
      until ? Blockly.Clojure.ORDER_LOGICAL_NOT :
      Blockly.Clojure.ORDER_NONE) || 'false';
  var branch = Blockly.Clojure.statementToCode(block, 'DO');
  branch = Blockly.Clojure.addLoopTrap(branch, block.id);
  if (until) {
    argument0 = '(not ' + argument0 + ')';
  }
  return '(while ' + argument0 + ' ' + branch + ')\n';
};

Blockly.Clojure['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Clojure.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Clojure.valueToCode(block, 'FROM',
      Blockly.Clojure.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.Clojure.valueToCode(block, 'TO',
      Blockly.Clojure.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.Clojure.valueToCode(block, 'BY',
      Blockly.Clojure.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.Clojure.statementToCode(block, 'DO');
  branch = Blockly.Clojure.addLoopTrap(branch, block.id);
  return '(for [' + variable0 + ' (range ' + argument0 + ' ' + argument1  + ' ' +increment + ')]\n' + branch + '\n)';
};

Blockly.Clojure['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Clojure.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Clojure.valueToCode(block, 'LIST',
      Blockly.Clojure.ORDER_NONE) || '[]';
  var branch = Blockly.Clojure.statementToCode(block, 'DO');
  branch = Blockly.Clojure.addLoopTrap(branch, block.id);
  var code = '';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  var listVar = argument0;
  var indexVar = Blockly.Clojure.variableDB_.getDistinctName(
      variable0 + '_index', Blockly.Variables.NAME_TYPE);
  code += '(for [' + indexVar + ' ' + listVar + '] ' + branch + ')\n';
  return code;
};

Blockly.Clojure['controls_flow_statements'] = function(block) {
  throw 'Unsupported flow statement in Clojure.';
};
