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
 * @fileoverview Generating Clojure for procedure blocks.
 * @author raingong@google.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure.procedures');

goog.require('Blockly.Clojure');


Blockly.Clojure['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Clojure.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Clojure.statementToCode(block, 'STACK');
  if (Blockly.Clojure.STATEMENT_PREFIX) {
    branch = Blockly.Clojure.prefixLines(
        Blockly.Clojure.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Clojure.INDENT) + branch;
  }
  if (Blockly.Clojure.INFINITE_LOOP_TRAP) {
    branch = Blockly.Clojure.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Clojure.valueToCode(block, 'RETURN',
      Blockly.Clojure.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  ' + returnValue + '\n';
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Clojure.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = '(defn ' + funcName + '[' + args.join('  ') + '] \n' +
  //var code = '(defn ' + funcName + '[' + block.arguments_.join('  ') + '] \n' +
      branch + returnValue + ')';
  code = Blockly.Clojure.scrub_(block, code);
  Blockly.Clojure.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Clojure['procedures_defnoreturn'] =
    Blockly.Clojure['procedures_defreturn'];

Blockly.Clojure['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Clojure.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Clojure.valueToCode(block, 'ARG' + x,
        Blockly.Clojure.ORDER_NONE) || 'nil';
  }
  var code = '(' + funcName + ' ' + args.join(' ') + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Clojure.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Clojure.valueToCode(block, 'ARG' + x,
        Blockly.Clojure.ORDER_NONE) || 'nil';
  }
  var code = '(' + funcName + ' ' + args.join(' ') + ')\n';
  return code;
};

Blockly.Clojure['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Clojure.valueToCode(block, 'CONDITION',
      Blockly.Clojure.ORDER_NONE) || 'false';
  var code = '(if ' + condition + '\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Clojure.valueToCode(block, 'VALUE',
        Blockly.Clojure.ORDER_NONE) || 'nil';
    code += ' ' + value + '\n';
  } else {
    code += ' \n';
  }
  code += ')\n';
  return code;
};
