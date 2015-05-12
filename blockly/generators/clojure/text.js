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
 * @fileoverview Generating Clojure for text blocks.
 * @author raingong@google.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure.texts');

goog.require('Blockly.Clojure');


Blockly.Clojure['text'] = function(block) {
  // Text value.
  var code = Blockly.Clojure.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Clojure.ORDER_ATOMIC];
};

Blockly.Clojure['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  var code;
  if (block.itemCount_ == 0) {
    return ['\"\"', Blockly.Clojure.ORDER_ATOMIC];
  }  {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.Clojure.valueToCode(block, 'ADD' + n,
          Blockly.Clojure.ORDER_NONE) || '\"\"';
    }
    code = '(str ' + code.join(' ') + ')';
    return [code, Blockly.Clojure.ORDER_NONE];
  }
};

Blockly.Clojure['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Clojure.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Clojure.valueToCode(block, 'TEXT',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  return '(str' + varName + ' ' + argument0 + ')\n';
};

Blockly.Clojure['text_length'] = function(block) {
  // String length.
  var argument0 = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  return ['(.length " + argument0  ')', Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_isEmpty'] = function(block) {
  // Is the string null?
  var argument0 = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_ATOMIC) || '\"\"';
  return ['(empty? ' + argument0 + ')', Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      '.indexOf' : '.lastIndexOf';
  var argument0 = Blockly.Clojure.valueToCode(block, 'FIND',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  var argument1 = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  var code = '(' + operator + ' '  argument1 + ' ' + argument0 + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Clojure.valueToCode(block, 'AT',
      Blockly.Clojure.ORDER_NONE) || '1';
  var text = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  switch (where) {
    case 'FIRST':
      at = 0;
    case 'LAST':
      at = '(dec (.length ' + text + ' ))';
    case 'FROM_START':
      // Blockly uses one-based indicies.
      if (Blockly.isNumber(at)) {
        // If the index is a naked number, decrement it right now.
        at = parseFloat(at) - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at = '(dec ' + at + ' )';
      }
    case 'FROM_END':
      at = '(- (.length ' + text + ' ) ' + at + ')';
    case 'RANDOM':
      at = '(rand-int (.length ' + text + '))';
      break;
    default:
      throw 'Unhandled option (text_charAt).';
  }
  code = '(.charAt ' + text + ' ' + at ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.Clojure.valueToCode(block, 'STRING',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Clojure.valueToCode(block, 'AT1',
      Blockly.Clojure.ORDER_NONE) || '1';
  var at2 = Blockly.Clojure.valueToCode(block, 'AT2',
      Blockly.Clojure.ORDER_NONE) || '1';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else {
    var functionName = Blockly.Clojure.provideFunction_(
        'text_get_At ',
        [ '(defn ' + Blockly.Clojure.FUNCTION_NAME_PLACEHOLDER_ +
            '[text where at]',
          '    (cond (= where \"FROM_START\") ',
          '            (dec at)',
          '          (= where \"FROM_END\") ',
          '            (- (.length text) at)',
          '          (= where \"FIRST\") ',
          '            0',
          '          (= where \"LAST\") ',
          '            (- (.length text) 1)',
         '          :else ',
          '      (throw (Exception. \"Unhandled option (text_getSubstring).\"))',
          '    )',
          '  )',
          '  at1 = getAt(where1, at1);',
          '  at2 = getAt(where2, at2) + 1;',
          '  return text.slice(at1, at2);',
          ]);
    var code = '(subs ' + text + '(' + functionName + ' ' + text + ' \"' + where1 + '\" ' + at1 + ') (' + functionName + ' ' + text + ' \"' + where2 + '\" ' + at2 + '))'
  }
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': 'upper-case',
    'LOWERCASE': 'lower-case',
    'TITLECASE': 'capitalize'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  // Upper and lower case are functions built into Clojure.
  var argument0 = Blockly.Clojure.valueToCode(block, 'TEXT',
        Blockly.Clojure.ORDER_NONE) || '\"\"';
  var code = '(' + operator + ' ' + argument0 + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': 'triml',
    'RIGHT': 'trimr',
    'BOTH': 'trim'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.Clojure.valueToCode(block, 'TEXT',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  return ['(' + operator + ' ' + argument0 + ')', Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Clojure.valueToCode(block, 'TEXT',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  return '(println ' + argument0 + ')\n';
};

Blockly.Clojure['text_prompt'] = function(block) {
  // Prompt function (internal message).
  var msg = Blockly.Clojure.quote_(block.getFieldValue('TEXT'));
  var code = '(println ' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = code + ' (Float/parseFloat ' msg + ')' ;
  }
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['text_prompt_ext'] = function(block) {
  // Prompt function (external message).
  var msg = Blockly.Clojure.valueToCode(block, 'TEXT',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  var code = '(println ' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = code + ' (Float/parseFloat ' msg + ')' ;
  }
  return [code, Blockly.Clojure.ORDER_NONE];
};
