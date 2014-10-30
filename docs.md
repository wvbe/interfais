#Index

**Classes**

* [class: Cell](#Cell)
  * [new Cell(options)](#new_Cell)
* [class: Layout](#Layout)
  * [new Layout(options)](#new_Layout)
* [class: RecursiveObject](#RecursiveObject)
  * [new RecursiveObject()](#new_RecursiveObject)
  * [recursiveObject.get(attr, noInherit)](#RecursiveObject#get)
  * [recursiveObject.hasParent()](#RecursiveObject#hasParent)
  * [recursiveObject.getParent()](#RecursiveObject#getParent)
  * [recursiveObject.setParent(parent)](#RecursiveObject#setParent)
  * [recursiveObject.getParents()](#RecursiveObject#getParents)
  * [recursiveObject.getSiblings()](#RecursiveObject#getSiblings)
  * [recursiveObject.hasChild(child)](#RecursiveObject#hasChild)
  * [recursiveObject.getChildren()](#RecursiveObject#getChildren)
  * [recursiveObject.addChild(child)](#RecursiveObject#addChild)
* [class: Row](#Row)
  * [new Row(options)](#new_Row)

**Namespaces**

* [uiFactory](#uiFactory)

**Functions**

* [fillerString(length, char)](#fillerString)
* [addFormattingToLine(options, text)](#addFormattingToLine)

**Members**

* [prerender](#prerender)
  * [prerender.spacer()](#prerender.spacer)
  * [prerender.ruler(char)](#prerender.ruler)
  * [prerender.line(lines)](#prerender.line)
  * [prerender.keyValue(pairs, [options])](#prerender.keyValue)
  * [prerender.list(text)](#prerender.list)
  * [prerender.paragraph(text, formatting)](#prerender.paragraph)
* [REGEX_VALID_SYSNAMES](#REGEX_VALID_SYSNAMES)
 
<a name="Cell"></a>
#class: Cell
**Members**

* [class: Cell](#Cell)
  * [new Cell(options)](#new_Cell)

<a name="new_Cell"></a>
##new Cell(options)
**Params**

- options `Object`  
  - \[width\] `Number`  

**Returns**: [Cell](#Cell)  
<a name="Layout"></a>
#class: Layout
**Members**

* [class: Layout](#Layout)
  * [new Layout(options)](#new_Layout)

<a name="new_Layout"></a>
##new Layout(options)
**Params**

- options `Object`  
  - \[width\] `Number`  
  - \[height\] `Number`  

**Returns**: [Cell](#Cell)  
<a name="RecursiveObject"></a>
#class: RecursiveObject
**Members**

* [class: RecursiveObject](#RecursiveObject)
  * [new RecursiveObject()](#new_RecursiveObject)
  * [recursiveObject.get(attr, noInherit)](#RecursiveObject#get)
  * [recursiveObject.hasParent()](#RecursiveObject#hasParent)
  * [recursiveObject.getParent()](#RecursiveObject#getParent)
  * [recursiveObject.setParent(parent)](#RecursiveObject#setParent)
  * [recursiveObject.getParents()](#RecursiveObject#getParents)
  * [recursiveObject.getSiblings()](#RecursiveObject#getSiblings)
  * [recursiveObject.hasChild(child)](#RecursiveObject#hasChild)
  * [recursiveObject.getChildren()](#RecursiveObject#getChildren)
  * [recursiveObject.addChild(child)](#RecursiveObject#addChild)

<a name="new_RecursiveObject"></a>
##new RecursiveObject()
Conveinience object that can have more RecursiveObjects (or inheriting) in it.

**Returns**: [RecursiveObject](#RecursiveObject)  
<a name="RecursiveObject#get"></a>
##recursiveObject.get(attr, noInherit)
Returns whichever is defined first: own attribute, the parent getter for this attribute, the parent attribute, or its own attribute (undefined or whatever)

**Params**

- attr   
- noInherit   

**Returns**: `*`  
<a name="RecursiveObject#hasParent"></a>
##recursiveObject.hasParent()
**Returns**: `Boolean`  
<a name="RecursiveObject#getParent"></a>
##recursiveObject.getParent()
**Returns**: `ConfigurableObject`  
<a name="RecursiveObject#setParent"></a>
##recursiveObject.setParent(parent)
**Params**

- parent `ConfigurableObject`  

**Returns**: `ConfigurableObject` - self  
<a name="RecursiveObject#getParents"></a>
##recursiveObject.getParents()
**Returns**: `Array.<ConfigurableObject>`  
<a name="RecursiveObject#getSiblings"></a>
##recursiveObject.getSiblings()
**Returns**: `Array.<ConfigurableObject>`  
<a name="RecursiveObject#hasChild"></a>
##recursiveObject.hasChild(child)
**Params**

- child `ConfigurableObject`  

**Returns**: `Boolean`  
<a name="RecursiveObject#getChildren"></a>
##recursiveObject.getChildren()
**Returns**: `Array.<ConfigurableObject>`  
<a name="RecursiveObject#addChild"></a>
##recursiveObject.addChild(child)
**Params**

- child `ConfigurableObject`  

**Returns**: `ConfigurableObject` - self  
<a name="Row"></a>
#class: Row
**Members**

* [class: Row](#Row)
  * [new Row(options)](#new_Row)

<a name="new_Row"></a>
##new Row(options)
**Params**

- options `Object`  
  - \[height\] `Number`  

**Returns**: [Row](#Row)  
<a name="uiFactory"></a>
#uiFactory
Accumulates configuration in order to render and rerender UI elements like paragraphs,
lists, menu options and input fields. Also handles some basic stuff on the UI like scrolling
and menu focus. Most render items take a function as an argument instead of the regular input,
to enable you to inject your own logic at (pre)rendertime.

**Example**  
module.exports = function(ui, viewParams) {
    var name = null;
    ui
        .within(box)
        .h1('Whats up!')
        .paragraph('blabla whatever longtext wrapping etc')
        .list(['blabla whatever longtext wrapping etc'])
        .option('Close', function() {
            process.exit();
        })
        .input('Name: ', function(value) {
            name = value;
            ui.render();
        })
        .ruler('-')
        .line(function() {
            return ['Your name is ' + (name ? name : 'a big mystery')];
        })
        .spacer()
        .render()
};

**Members**

* [uiFactory](#uiFactory)

<a name="fillerString"></a>
#fillerString(length, char)
Repeats char untill length is reached or exceeded, and returns the trimmed string.

**Params**

- length   
- char   

**Returns**: `string`  
<a name="addFormattingToLine"></a>
#addFormattingToLine(options, text)
Applies the formatting codes that come with the FORMATTING_FLAGS. This is the last time one can trust line.length

**Params**

- options   
- text   

**Returns**: `string`  
<a name="prerender"></a>
#prerender
Render functions that may be queued with their respective arguments.

All prerenderers return an array of strings that are already wrapped and colorized, so that they can be rerendered easily.

All prerenderers have the uiFactory context.

<a name="REGEX_VALID_SYSNAMES"></a>
#REGEX_VALID_SYSNAMES
Accepts:
abcdefghijklmnopqrstuvwxyz
ABCDEFGHIJKLMNOPQRSTUVWXYZ
0123456789
-_.,:;()[]{}

**Type**: `RegExp`  
