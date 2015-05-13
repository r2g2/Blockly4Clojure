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
 * @fileoverview Generating Clojure for logic blocks.
 * @author raingong@gmail.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure.logic');

goog.require('Blockly.Clojure');


Blockly.Clojure['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.Clojure.valueToCode(block, 'IF' + n,
      Blockly.Clojure.ORDER_NONE) || 'false';
  var branch = Blockly.Clojure.statementToCode(block, 'DO' + n);
  var code = '(cond (' + argument + ')' + branch + ' ';
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.Clojure.valueToCode(block, 'IF' + n,
        Blockly.Clojure.ORDER_NONE) || 'false';
    branch = Blockly.Clojure.statementToCode(block, 'DO' + n);
    code += ' (' + argument + ')' + branch + ' ';
  }
  if (block.elseCount_) {
    branch = Blockly.Clojure.statementToCode(block, 'ELSE');
    code += ':else ' + branch + ' ';
  }
  return code + ')\n';
};

Blockly.Clojure['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': 'not=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Clojure.ORDER_NONE;
  var argument0 = Blockly.Clojure.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Clojure.valueToCode(block, 'B', order) || '0';
  var code ='(operator ' + argument0 + ' ' + argument1 + ')';
  return [code, order];
};

Blockly.Clojure['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
  var order = Blockly.Clojure.ORDER_NONE;
  var argument0 = Blockly.Clojure.valueToCode(block, 'A', order);
  var argument1 = Blockly.Clojure.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'and') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = '(' + operator + ' ' + argument0 + ' ' + argument1 + ')';
  return [code, order];
};

Blockly.Clojure['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Clojure.ORDER_NONE;
  var argument0 = Blockly.Clojure.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '(not ' + argument0 + ')';
  return [code, order];
};

Blockly.Clojure['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['logic_null'] = function(block) {
  // Null data type.
  return ['nil', Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Clojure.valueToCode(block, 'IF',
      Blockly.Clojure.ORDER_NONE) || 'false';
  var value_then = Blockly.Clojure.valueToCode(block, 'THEN',
      Blockly.Clojure.ORDER_NONE) || 'null';
  var value_else = Blockly.Clojure.valueToCode(block, 'ELSE',
      Blockly.Clojure.ORDER_NONE) || 'null';
  var code = '(if ' + value_if + ' ' + value_then + ' ' + value_else + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};
