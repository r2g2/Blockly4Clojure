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
 * @fileoverview Generating Clojure for math blocks.
 * @author raingong@gmail.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure.math');

goog.require('Blockly.Clojure');


Blockly.Clojure['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  return [code, Blockly.Clojure.ORDER_ATOMIC];
};

Blockly.Clojure['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.Clojure.ORDER_NONE],
    'MINUS': [' - ', Blockly.Clojure.ORDER_NONE],
    'MULTIPLY': [' * ', Blockly.Clojure.ORDER_NONE],
    'DIVIDE': [' / ', Blockly.Clojure.ORDER_NONE],
    'POWER': ['Math/pow', Blockly.Clojure.ORDER_NONE]  //clojure.math.numeric-tower
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Clojure.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Clojure.valueToCode(block, 'B', order) || '0';
  var code = '('+ operator + ' ' + argument0 + ' ' + argument1 + ')';
  return [code, order];
};

Blockly.Clojure['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Clojure.valueToCode(block, 'NUM',
        Blockly.Clojure.ORDER_NONE) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '(-' + arg + ')';
    return [code, Blockly.Clojure.ORDER_NONE];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Clojure.valueToCode(block, 'NUM',
        Blockly.Clojure.ORDER_NONE) || '0';
  } else {
    arg = Blockly.Clojure.valueToCode(block, 'NUM',
        Blockly.Clojure.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = '(Math/abs ' + arg + ')';
      break;
    case 'ROOT':
      code = '(Math/sqrt ' + arg + ')';
      break;
    case 'LN':
      code = '(Math/log ' + arg + ')';
      break;
    case 'EXP':
      code = '(Math/exp ' + arg + ')';
      break;
    case 'POW10':
      code = '(Math/pow 10 ' + arg + ')';
      break;
    case 'ROUND':
      code = '(Math/round ' + arg + ')';
      break;
    case 'ROUNDUP':
      code = '(Math/ceil ' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = '(Math/floor ' + arg + ')';
      break;
    case 'SIN':
      code = '(Math.sin (/  (* 180 ' + arg + ') Math/PI))';
      break;
    case 'COS':
      code = '(Math.cos (/  (* 180 ' + arg + ') Math/PI))';
      break;
    case 'TAN':
      code = '(Math.tan (/  (* 180 ' + arg + ') Math/PI))';
      break;
  }
  if (code) {
    return [code, Blockly.Clojure.ORDER_NONE];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = '(Math/log10 ' + arg + ')';
      break;
    case 'ASIN':
      code = '(Math/asin (/  (* 180 ' + arg + ') Math/PI))';
      break;
    case 'ACOS':
      code = '(Math/acos (/  (* 180 ' + arg + ') Math/PI))';
      break;
    case 'ATAN':
      code = '(Math/atan (/  (* 180 ' + arg + ') Math/PI))';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Math/PI', Blockly.Clojure.ORDER_ATOMIC],
    'E': ['Math/E', Blockly.Clojure.ORDER_ATOMIC],
    'GOLDEN_RATIO':
        ['(/ (+ (Math/sqrt 5) 1) 2)', Blockly.Clojure.ORDER_NONE],
    'SQRT2': ['(Math/sqrt 2)', Blockly.Clojure.ORDER_NONE],
    'SQRT1_2': ['(Math/sqrt 0.5)', Blockly.Clojure.ORDER_NONE],
    'INFINITY': ['Double/MAX_VALUE', Blockly.Clojure.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Clojure['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Clojure.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Clojure.ORDER_ATOMIC) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  switch (dropdown_property) {
    case 'PRIME':
      code = '(.isProbablePrime (BigInteger/valueOf ' + number_to_check + ') 5)';
      break;
    case 'EVEN':
      code = '(even? ' + number_to_check + ')';
      break;
    case 'ODD':
      code = '(odd? ' + number_to_check + ')';
      break;
    case 'WHOLE':
      code = '(integer? ' +  number_to_check + ')';
      break;
    case 'POSITIVE':
      code = '(pos? ' + number_to_check + ')';
      break;
    case 'NEGATIVE':
      code = '(neg? ' + number_to_check + ')';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Clojure.valueToCode(block, 'DIVISOR',
          Blockly.Clojure.ORDER_NONE) || '0';
      code = '(== 0 (mod ' + number_to_check + '  ' + divisor + '))';
      break;
  }
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['math_change'] = function(block) {
  // Add to a variable in place.
  //var argument0 = Blockly.Clojure.valueToCode(block, 'DELTA',
  //    Blockly.Clojure.ORDER_NONE) || '0';
  //var varName = Blockly.Clojure.variableDB_.getName(
  //    block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  //return '(reset! ' + varName + '(+ @' + varName + ' ' + argument0 + '))';
  throw 'Unsupported block in Clojure (math_change).';
};

// Rounding functions have a single operand.
Blockly.Clojure['math_round'] = Blockly.Clojure['math_single'];
// Trigonometry functions have a single operand.
Blockly.Clojure['math_trig'] = Blockly.Clojure['math_single'];

Blockly.Clojure['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list = Blockly.Clojure.valueToCode(block, 'LIST',
          Blockly.Clojure.ORDER_NONE) || '\'()';
  var code;
  switch (func) {
    case 'SUM':
      code =  '(reduce + 0 ' + list + ')';
      break;
    case 'MIN':
      code = '(reduce min ' + list + ')';
      break;
    case 'MAX':
      code = '(reduce max ' + list + ')';
      break;
    case 'AVERAGE':
      code = '(/ (reduce + 0 ' + list + ') (count ' + list + '))';
      break;
    case 'MEDIAN':
      code = '(let [ll (sort (filter number?' + list + ')) llen (count ll)] ' +
              '    (if (even? llen) (/ (+ (nth ' + list + ' (/ llen 2)) (nth ' + list + ' (dec (/ llen 2))) ) 2) ' +
              '    (nth ' + list + ' ((dec llen) 2) )))';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      code = '(let [lfreq (frequencies ' + list + ') maxfreq (reduce max (vals lfreq))] (keys (filter #(= maxfreq (val %)) lfreq)))';
      break;
    case 'STD_DEV':
      code = '(let [llen (count ' + list + ') lmean (/ (reduce + 0 ' + list + ') llen)]' +
                '(Math/sqrt (/ (reduce + 0 (map (Math/pow #(- % lmean) 2) ' + list + ')) llen)))';
      break;
    case 'RANDOM':
      code = '(nth ' + list + ' (rand-int (count ' + list + ')))';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.Clojure.ORDER_FUNCTION_CALL];
};

Blockly.Clojure['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Clojure.valueToCode(block, 'DIVIDEND',
      Blockly.Clojure.ORDER_ATOMIC) || '0';
  var argument1 = Blockly.Clojure.valueToCode(block, 'DIVISOR',
      Blockly.Clojure.ORDER_ATOMIC) || '0';
  var code = '(mod ' + argument0 + ' ' + argument1 + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_ATOMIC) || '0';
  var argument1 = Blockly.Clojure.valueToCode(block, 'LOW',
      Blockly.Clojure.ORDER_ATOMIC) || '0';
  var argument2 = Blockly.Clojure.valueToCode(block, 'HIGH',
      Blockly.Clojure.ORDER_ATOMIC) || 'Infinity';
  var code = '(min (max ' + argument0 + ' ' + argument1 + ') ' + argument2 + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.Clojure.valueToCode(block, 'FROM',
      Blockly.Clojure.ORDER_NONE) || '0';
  var argument1 = Blockly.Clojure.valueToCode(block, 'TO',
      Blockly.Clojure.ORDER_NONE) || '0';
  var code = '(+ (min ' + argument0 + ' ' + argument1 + ') (rand-int (Math/abs (- ' + argument0 + ' ' + argument1 + '))))';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['(rand)', Blockly.Clojure.ORDER_NONE];
};
