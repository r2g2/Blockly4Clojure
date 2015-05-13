/**
 * license
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
 * fileoverview Generating Clojure for list blocks.
 * author raingong@google.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure.lists');

goog.require('Blockly.Clojure');


Blockly.Clojure['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['(list)', Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.Clojure.valueToCode(block, 'ADD' + n,
        Blockly.Clojure.ORDER_NONE) || 'null';
  }
  code = '(list ' + code.join(' ') + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var argument0 = Blockly.Clojure.valueToCode(block, 'ITEM',
      Blockly.Clojure.ORDER_NONE) || 'null';
  var argument1 = Blockly.Clojure.valueToCode(block, 'NUM',
      Blockly.Clojure.ORDER_NONE) || '0';
  var code = '(take ' + argument1 + ' (repeat ' + argument0 + '))';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['lists_length'] = function(block) {
  // List length.
  var argument0 = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_NONE) || '\'()';
  return ['(count '+ argument0 + ')', Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['lists_isEmpty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_NONE) || '\'()';
  return ['(empty? ' + argument0 + ')', Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      '.indexOf' : '.lastIndexOf';
  var argument0 = Blockly.Clojure.valueToCode(block, 'FIND',
      Blockly.Clojure.ORDER_NONE) || '\"\"';
  var argument1 = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_NONE) || '\'()';
  var code =  '(' + operator + ' ' + argument1 + ' ' + argument0 + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Clojure.valueToCode(block, 'AT',
      Blockly.Clojure.ORDER_NONE) || '1';
  var list = Blockly.Clojure.valueToCode(block, 'VALUE',
      Blockly.Clojure.ORDER_NONE) || '\'()';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = '(first ' + list + ')';
      return [code, Blockly.Clojure.ORDER_NONE];
    } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
    //  var code = '(let [_fl  (first '+ list + ')] (swap! '+ list.substring(1) + '  #(drop 1 %)) _fl)';
    //  return [code, Blockly.Clojure.ORDER_NONE];
    throw 'Unsupported mode GET_REMOVE|REMOVE in Clojure (lists_getIndex).';
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code ='(last ' + list + ')';
      return [code, Blockly.Clojure.ORDER_NONE];
    } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
    //  var code = '(let [_fl  (last '+ list + ')] (swap! '+ list.substring(1) + ' drop-last) _fl)';
    //  return [code, Blockly.Clojure.ORDER_NONE];
    throw 'Unsupported mode GET_REMOVE|REMOVE in Clojure (lists_getIndex).';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseFloat(at) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at = '(dec ' + at + ')';
    }
    if (mode == 'GET') {
      var code ='(nth ' + list + ' ' + at + ')';
      return [code, Blockly.Clojure.ORDER_NONE];
    } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
    //  var code = '(let [_fl  (nth '+ list + ' ' + at +')] (swap! '
    //      + list + ' (concat (take '+ at + ' ' + list + ') (drop (inc '
    //      + at + ') ' + list + '))) _fl)';
    //  return [code, Blockly.Clojure.ORDER_NONE];
    throw 'Unsupported mode GET_REMOVE|REMOVE in Clojure (lists_getIndex).';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code ='(nth ' + list + ' (- (count ' + list + ') ' + at + ')';
      return [code, Blockly.Clojure.ORDER_NONE];
    } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
    //  var code = '(let [_at (- (count  ' + list + ') ' + at + ') _fl  (nth '
    //      + list + ' _at )] (swap! '+ list.substring(1) + ' (concat (take _at ' + list
    //      + ') (drop (inc _at ) ' + list + '))) _fl)';
    //  return [code, Blockly.Clojure.ORDER_NONE];
    throw 'Unsupported mode GET_REMOVE|REMOVE in Clojure (lists_getIndex).';
    }
  } else if (where == 'RANDOM') {
    if (mode == 'GET') {
      var code ='(nth ' + list + ' (rand-int (count ' + list + ')))';
      return [code, Blockly.Clojure.ORDER_NONE];
    } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
    //  var code = '(let [_at (rand-int (count  ' + list + ')) _fl  (nth '
    //       + list + ' _at )] (swap! '+ list.substring(1) + ' (concat (take _at '
    //       + list + ') (drop (inc _at ) ' + list + '))) _fl)';
    //  return [code, Blockly.Clojure.ORDER_NONE];
    throw 'Unsupported mode GET_REMOVE|REMOVE in Clojure (lists_getIndex).';
    }
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Clojure['lists_setIndex'] = function(block) {
  throw 'Unsupported block in Clojure (lists_setIndex).';
};

Blockly.Clojure['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Clojure.valueToCode(block, 'LIST',
      Blockly.Clojure.ORDER_NONE) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Clojure.valueToCode(block, 'AT1',
      Blockly.Clojure.ORDER_NONE) || '1';
  var at2 = Blockly.Clojure.valueToCode(block, 'AT2',
      Blockly.Clojure.ORDER_NONE) || '1';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = list ;
  } else {
    var functionName = Blockly.Clojure.provideFunction_(
        'lists_get_sublist',
        [ '(defn ' + Blockly.Clojure.FUNCTION_NAME_PLACEHOLDER_ +
            '[ll, where1, at1, where2, at2] ',
          '  (let [llen (count ll) getAt (fn [where, at] ',
          '    (cond (= where \"FROM_START\") at ',
          '          (= where \"FROM_END\") (- llen at) ',
          '          (= where \"FIRST\") 0',
          '          (= where == \"LAST\") llen',
          '          :else ',
          '          (throw (Exception. \"Unhandled option (lists_getSublist).\"))))',
          '    at1 (getAt where1 at1)',
          '    at2 (getAt where2 at2)]',
          '    (take (- at2 at1) (drop at1 ll))))']);
    var code = '(' +functionName + ' ' + list + ' \"' +
        where1 + '\" ' + at1 + ' \"' + where2 + '\" ' + at2 + ')';
  }
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var value_input = Blockly.Clojure.valueToCode(block, 'INPUT',
      Blockly.Clojure.ORDER_NONE);
  var value_delim = Blockly.Clojure.valueToCode(block, 'DELIM',
      Blockly.Clojure.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!value_input) {
      value_input = '\"\"';
    }
    var code = '(clojure.string/split ' +  value_input + ' ' + value_delim + ')';
  } else if (mode == 'JOIN') {
    if (!value_input) {
      value_input = '\'()';
    }
    var code = '(clojure.string/join ' + value_delim + ' ' + value_input + ')';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  return [code, Blockly.Clojure.ORDER_NONE];
};
