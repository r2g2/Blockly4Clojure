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
 * @fileoverview Generating Clojure for colour blocks.
 * @author raingong@google.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure.colour');

goog.require('Blockly.Clojure');


Blockly.Clojure['colour_picker'] = function(block) {
  // Colour picker.
  var code = '(java.awt.Color. (Integer/parseInt (subs \"' + block.getFieldValue('COLOUR') + '\" 1) 16))';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['colour_random'] = function(block) {
  // Generate a random colour.
  var code ='(java.awt.Color. (float (rand)) (float (rand)) (float (rand)))';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.Clojure.valueToCode(block, 'RED',
      Blockly.Clojure.ORDER_NONE) || 0;
  var green = Blockly.Clojure.valueToCode(block, 'GREEN',
      Blockly.Clojure.ORDER_NONE) || 0;
  var blue = Blockly.Clojure.valueToCode(block, 'BLUE',
      Blockly.Clojure.ORDER_NONE) || 0;
  var code = '(java.awt.Color. (int ' + red + ')  (int ' + green + ') (int ' + blue + '))';
  return [code, Blockly.Clojure.ORDER_NONE];
};

Blockly.Clojure['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.Clojure.valueToCode(block, 'COLOUR1',
      Blockly.Clojure.ORDER_NONE) || '\'#000000\'';
  var c2 = Blockly.Clojure.valueToCode(block, 'COLOUR2',
      Blockly.Clojure.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Clojure.valueToCode(block, 'RATIO',
      Blockly.Clojure.ORDER_NONE) || 0.5;
  var functionName1 = Blockly.Clojure.provideFunction_(
    'to_rgb',
    ['(defn ' + Blockly.Clojure.FUNCTION_NAME_PLACEHOLDER_ +
     ' [c] ',
     ' (list (.getRed c)',
     '       (.getGreen c)',
     '       (.getBlue c)))']);

  var functionName2 = Blockly.Clojure.provideFunction_(
      'colour_blend',
      [ '(defn ' + Blockly.Clojure.FUNCTION_NAME_PLACEHOLDER_ +
        '  [c1, c2, ratio] ',
        '  (let [rgb1 (' + functionName1 + ' c1)',
        '        rgb2 (' + functionName1 + ' c2)',
        '        ratio1 (- 1 ratio)',
        '        rgb (map #(int (+ (* %1 ratio1) (* %2 ratio))) rgb1 rgb2)',
        '        ] ',
        '    (java.awt.Color. (nth rgb 0) (nth rgb 1) (nth rgb 2))',
        '))' ]);
  var code = '(' + functionName2 + ' ' + c1 + ' ' + c2 + ' ' + ratio + ')';
  return [code, Blockly.Clojure.ORDER_NONE];
};
