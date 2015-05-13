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
 * @fileoverview Helper functions for generating JavaScript for blocks.
 * @author raingong@google.com (Rain Gong)
 */
'use strict';

goog.provide('Blockly.Clojure');

goog.require('Blockly.Generator');


/**
 * Clojure code generator.
 * @type !Blockly.Generator
 */
Blockly.Clojure = new Blockly.Generator('Clojure');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Clojure.addReservedWords(
    'Blockly,' +  // In case JS is evaled in the current window.
    // Java Reserved Words also???
    'doc,find-doc,apropos,source,pst,javadoc,' +
    'quot,rem,mod,inc,dec,max,min,not,compare,'+
    //+ - * / +' -' *' inc' dec'
    'bit-and,bit-or,bit-xor,bit-not,bit-flip,bit-set,bit-shift-right,bit-shift-left,bit-and-not,bit-clear,bit-test,unsigned-bit-shift-right,'+
    'byte,short,int,long,float,double,bigdec,bitint,num,rationalize,biginteger,'+
    'zero?,pos?,neg?,even?,odd?,number?,rational?,integer?,ratio?,decimal?,float?'+
    'rand,rand-int,with-precision,'+
    //Unchecked
    'str,format,count,get,subs,join,escape,split,split-lines,replace,replace-first,reverse,re-quote-replacement,.indexOf,.lastIndexOf,'+
    're-find,re-seq,re-matches,re-pattern,re-matcher,re-groups,replace,replace-first,'+
    'capitalize,lower-case,upper-case,trim,trim-newline,triml,trimr,'+
    'char,char?,string?,blank?,.startsWith,.endsWith,.contains,'+
    'char-name-string,char-escape-string,keyword,keyword?,find-keyword,symbol,symbol?,gensym,'+
    'join,select,project,union,difference,intersection,index,rename,' +
    'quote,do,let,def,defn,fn,if,loop,' +
    'recur,set!,eval,when,true,false,reduce,apply,assoc,partial,require');

/**
 * Clojure doesn't care Order
 */
Blockly.Clojure.ORDER_NONE = 0;          // (...)

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Clojure.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Clojure.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Clojure.functionNames_ = Object.create(null);

  if (!Blockly.Clojure.variableDB_) {
    Blockly.Clojure.variableDB_ =
        new Blockly.Names(Blockly.Clojure.RESERVED_WORDS_);
  } else {
    Blockly.Clojure.variableDB_.reset();
  }

  var defvars = [];
  var variables = Blockly.Variables.allVariables(workspace);
  for (var x = 0; x < variables.length; x++) {
    defvars[x] = '(def ' +
        Blockly.Clojure.variableDB_.getName(variables[x],
        Blockly.Variables.NAME_TYPE) + ')';
  }
  Blockly.Clojure.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Clojure.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.Clojure.definitions_) {
    definitions.push(Blockly.Clojure.definitions_[name]);
  }
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Clojure.scrubNakedValue = function(line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped JavaScript string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} JavaScript string.
 * @private
 */
Blockly.Clojure.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\"' + string + '\"';
};

/**
 * Common tasks for generating JavaScript from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The JavaScript code created for this block.
 * @return {string} JavaScript code with comments and subsequent blocks added.
 * @private
 */
Blockly.Clojure.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Clojure.prefixLines(comment, '; ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Clojure.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Clojure.prefixLines(comment, '; ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Clojure.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
