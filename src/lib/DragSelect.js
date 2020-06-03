"use strict";function _typeof(obj){if(typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"){_typeof=function _typeof(obj){return typeof obj}}else{_typeof=function _typeof(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj}}return _typeof(obj)}function _toConsumableArray(arr){return _arrayWithoutHoles(arr)||_iterableToArray(arr)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function _iterableToArray(iter){if(Symbol.iterator in Object(iter)||Object.prototype.toString.call(iter)==="[object Arguments]")return Array.from(iter)}function _arrayWithoutHoles(arr){if(Array.isArray(arr)){for(var i=0,arr2=new Array(arr.length);i<arr.length;i++){arr2[i]=arr[i]}return arr2}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}var DragSelect=function(){function DragSelect(_ref){var _this=this;var _ref$area=_ref.area,area=_ref$area===void 0?document:_ref$area,_ref$autoScrollSpeed=_ref.autoScrollSpeed,autoScrollSpeed=_ref$autoScrollSpeed===void 0?1:_ref$autoScrollSpeed,_ref$callback=_ref.callback,callback=_ref$callback===void 0?function(){}:_ref$callback,_ref$customStyles=_ref.customStyles,customStyles=_ref$customStyles===void 0?false:_ref$customStyles,_ref$hoverClass=_ref.hoverClass,hoverClass=_ref$hoverClass===void 0?"ds-hover":_ref$hoverClass,_ref$multiSelectKeys=_ref.multiSelectKeys,multiSelectKeys=_ref$multiSelectKeys===void 0?["ctrlKey","shiftKey","metaKey"]:_ref$multiSelectKeys,_ref$multiSelectMode=_ref.multiSelectMode,multiSelectMode=_ref$multiSelectMode===void 0?false:_ref$multiSelectMode,_ref$onDragMove=_ref.onDragMove,onDragMove=_ref$onDragMove===void 0?function(){}:_ref$onDragMove,_ref$onDragStart=_ref.onDragStart,onDragStart=_ref$onDragStart===void 0?function(){}:_ref$onDragStart,_ref$onDragStartBegin=_ref.onDragStartBegin,onDragStartBegin=_ref$onDragStartBegin===void 0?function(){}:_ref$onDragStartBegin,_ref$onElementSelect=_ref.onElementSelect,onElementSelect=_ref$onElementSelect===void 0?function(){}:_ref$onElementSelect,_ref$onElementUnselec=_ref.onElementUnselect,onElementUnselect=_ref$onElementUnselec===void 0?function(){}:_ref$onElementUnselec,_ref$selectableClass=_ref.selectableClass,selectableClass=_ref$selectableClass===void 0?"ds-selectable":_ref$selectableClass,_ref$selectables=_ref.selectables,selectables=_ref$selectables===void 0?[]:_ref$selectables,_ref$selectedClass=_ref.selectedClass,selectedClass=_ref$selectedClass===void 0?"ds-selected":_ref$selectedClass,_ref$selector=_ref.selector,selector=_ref$selector===void 0?undefined:_ref$selector,_ref$selectorClass=_ref.selectorClass,selectorClass=_ref$selectorClass===void 0?"ds-selector":_ref$selectorClass,_ref$zoom=_ref.zoom,zoom=_ref$zoom===void 0?1:_ref$zoom;_classCallCheck(this,DragSelect);_defineProperty(this,"_multiSelectKeyPressed",false);_defineProperty(this,"_initialCursorPos",{x:0,y:0});_defineProperty(this,"_newCursorPos",{x:0,y:0});_defineProperty(this,"_previousCursorPos",{x:0,y:0});_defineProperty(this,"_initialScroll",{x:0,y:0});_defineProperty(this,"_selected",[]);_defineProperty(this,"_prevSelected",[]);_defineProperty(this,"_lastTouch",void 0);_defineProperty(this,"_onClick",function(event){return _this.handleClick(event)});_defineProperty(this,"_startUp",function(event){return _this.startUp(event)});_defineProperty(this,"_handleMove",function(event){return _this.handleMove(event)});_defineProperty(this,"_end",function(event){return _this.reset(event,true)});this.selectedClass=selectedClass;this.hoverClass=hoverClass;this.selectorClass=selectorClass;this.selectableClass=selectableClass;this.selectables=[];this._initialSelectables=this._toArray(selectables);this.multiSelectKeys=multiSelectKeys;this.multiSelectMode=multiSelectMode;this.autoScrollSpeed=autoScrollSpeed===0?0:autoScrollSpeed;this.selectCallback=onElementSelect;this.unselectCallback=onElementUnselect;this.onDragStartBegin=onDragStartBegin;this.moveStartCallback=onDragStart;this.moveCallback=onDragMove;this.callback=callback;this.area=this._handleArea(area);this.customStyles=customStyles;this.zoom=zoom;this.selector=selector||this._createSelector();this.selector.classList.add(this.selectorClass);this.start()}_createClass(DragSelect,[{key:"_handleArea",value:function _handleArea(area){if(area===document)return area;var computedStyles=getComputedStyle(area);area.computedBorder=parseInt(computedStyles.borderWidth);var position=computedStyles.position;var isPositioned=position==="absolute"||position==="relative"||position==="fixed";if(!isPositioned){area.style.position="relative"}return area}},{key:"_handleSelectables",value:function _handleSelectables(selectables,remove,fromSelection){for(var index=0;index<selectables.length;index++){var selectable=selectables[index];var indexOf=this.selectables.indexOf(selectable);if(indexOf<0&&!remove){this._addSelectable(selectable,fromSelection)}else if(indexOf>-1&&remove){this._removeSelectable(selectable,indexOf,fromSelection)}}}},{key:"_addSelectable",value:function _addSelectable(selectable,toSelection){selectable.classList.add(this.selectableClass);selectable.addEventListener("click",this._onClick);this.selectables.push(selectable);if(toSelection&&this._selected.indexOf(selectable)<0){selectable.classList.add(this.selectedClass);this._selected.push(selectable)}}},{key:"_removeSelectable",value:function _removeSelectable(selectable,indexOf,fromSelection){selectable.classList.remove(this.hoverClass);selectable.classList.remove(this.selectableClass);selectable.removeEventListener("click",this._onClick);this.selectables.splice(indexOf,1);if(fromSelection&&this._selected.indexOf(selectable)>-1){selectable.classList.remove(this.selectedClass);this._selected.splice(this._selected.indexOf(selectable),1)}}},{key:"handleClick",value:function handleClick(event){if(this.mouseInteraction){return}if(this._isRightClick(event)){return}var node=event.target;if(this._isMultiSelectKeyPressed(event)){this._prevSelected=this._selected.slice()}else{this._prevSelected=[]}this.checkIfInsideSelection(true);if(this.selectables.indexOf(node)>-1){this.toggle(node)}this._end(event)}},{key:"_createSelector",value:function _createSelector(){var selector=document.createElement("div");selector.style.position="absolute";if(!this.customStyles){selector.style.background="rgba(0, 0, 255, 0.1)";selector.style.border="1px solid rgba(0, 0, 255, 0.45)";selector.style.display="none";selector.style.pointerEvents="none"}var _area=this.area===document?document.body:this.area;_area.appendChild(selector);return selector}},{key:"start",value:function start(){this._handleSelectables(this._initialSelectables);this.area.addEventListener("mousedown",this._startUp);this.area.addEventListener("touchstart",this._startUp,{passive:false})}},{key:"startUp",value:function startUp(event){if(event.type==="touchstart")event.preventDefault();if(this._isRightClick(event))return;if(this._isScrollbarClick(event,this.area))return;this.onDragStartBegin(event);if(this._breaked)return false;this.mouseInteraction=true;this.selector.style.display="block";if(this._isMultiSelectKeyPressed(event))this._prevSelected=this._selected.slice();else this._prevSelected=[];this._getStartingPositions(event);this.checkIfInsideSelection(true);this.selector.style.display="none";this.moveStartCallback(event);if(this._breaked)return false;this.area.removeEventListener("mousedown",this._startUp);this.area.removeEventListener("touchstart",this._startUp,{passive:false});this.area.addEventListener("mousemove",this._handleMove);this.area.addEventListener("touchmove",this._handleMove,{passive:false});document.addEventListener("mouseup",this._end);document.addEventListener("touchend",this._end)}},{key:"_isMultiSelectKeyPressed",value:function _isMultiSelectKeyPressed(event){this._multiSelectKeyPressed=false;if(this.multiSelectMode){this._multiSelectKeyPressed=true}else{for(var index=0;index<this.multiSelectKeys.length;index++){var mKey=this.multiSelectKeys[index];if(event[mKey]){this._multiSelectKeyPressed=true}}}return this._multiSelectKeyPressed}},{key:"_getStartingPositions",value:function _getStartingPositions(event){this._initialCursorPos=this._newCursorPos=this._getCursorPos(event,this.area);this._initialScroll=this.getScroll(this.area);var selectorPos={};selectorPos.x=this._initialCursorPos.x+this._initialScroll.x;selectorPos.y=this._initialCursorPos.y+this._initialScroll.y;selectorPos.w=0;selectorPos.h=0;this._updatePos(this.selector,selectorPos)}},{key:"handleMove",value:function handleMove(event){var selectorPos=this._getPosition(event);this.moveCallback(event);if(this._breaked)return false;this.selector.style.display="block";this._updatePos(this.selector,selectorPos);this.checkIfInsideSelection(null);this._autoScroll(event)}},{key:"_getPosition",value:function _getPosition(event){var cursorPosNew=this._getCursorPos(event,this.area);var scrollNew=this.getScroll(this.area);this._newCursorPos=cursorPosNew;var scrollAmount={x:scrollNew.x-this._initialScroll.x,y:scrollNew.y-this._initialScroll.y};var selectorPos={};if(cursorPosNew.x>this._initialCursorPos.x-scrollAmount.x){selectorPos.x=this._initialCursorPos.x+this._initialScroll.x;selectorPos.w=cursorPosNew.x-this._initialCursorPos.x+scrollAmount.x}else{selectorPos.x=cursorPosNew.x+scrollNew.x;selectorPos.w=this._initialCursorPos.x-cursorPosNew.x-scrollAmount.x}if(cursorPosNew.y>this._initialCursorPos.y-scrollAmount.y){selectorPos.y=this._initialCursorPos.y+this._initialScroll.y;selectorPos.h=cursorPosNew.y-this._initialCursorPos.y+scrollAmount.y}else{selectorPos.y=cursorPosNew.y+scrollNew.y;selectorPos.h=this._initialCursorPos.y-cursorPosNew.y-scrollAmount.y}return selectorPos}},{key:"checkIfInsideSelection",value:function checkIfInsideSelection(force){var anyInside=false;for(var i=0,il=this.selectables.length;i<il;i++){var selectable=this.selectables[i];var scroll=this.getScroll(this.area);var selectionRect={y:this.selector.getBoundingClientRect().top/this.zoom+scroll.y,x:this.selector.getBoundingClientRect().left/this.zoom+scroll.x,h:this.selector.offsetHeight,w:this.selector.offsetWidth};if(this._isElementTouching(selectable,selectionRect,scroll)){this._handleSelection(selectable,force);anyInside=true}else{this._handleUnselection(selectable,force)}}return anyInside}},{key:"_handleSelection",value:function _handleSelection(item,force){if(item.classList.contains(this.hoverClass)&&!force){return false}var posInSelectedArray=this._selected.indexOf(item);if(posInSelectedArray<0){this.select(item)}else if(posInSelectedArray>-1&&this._multiSelectKeyPressed){this.unselect(item)}item.classList.add(this.hoverClass)}},{key:"_handleUnselection",value:function _handleUnselection(item,force){if(!item.classList.contains(this.hoverClass)&&!force){return false}var posInSelectedArray=this._selected.indexOf(item);var isInPrevSelection=this._prevSelected.indexOf(item);if(posInSelectedArray>-1&&isInPrevSelection<0){this.unselect(item)}else if(posInSelectedArray<0&&isInPrevSelection>-1){this.select(item)}item.classList.remove(this.hoverClass)}},{key:"select",value:function select(item){if(this._selected.indexOf(item)>-1)return false;this._selected.push(item);item.classList.add(this.selectedClass);this.selectCallback(item);if(this._breaked)return false;return item}},{key:"unselect",value:function unselect(item){if(this._selected.indexOf(item)<0)return false;this._selected.splice(this._selected.indexOf(item),1);item.classList.remove(this.selectedClass);this.unselectCallback(item);if(this._breaked)return false;return item}},{key:"toggle",value:function toggle(item){if(this._selected.indexOf(item)>-1){this.unselect(item)}else{this.select(item)}return item}},{key:"_isElementTouching",value:function _isElementTouching(element,selectionRect,scroll){var rect=element.getBoundingClientRect();var elementRect={y:rect.top/this.zoom+scroll.y,x:rect.left/this.zoom+scroll.x,h:rect.height/this.zoom,w:rect.width/this.zoom};if(selectionRect.x<elementRect.x+elementRect.w&&selectionRect.x+selectionRect.w>elementRect.x&&selectionRect.y<elementRect.y+elementRect.h&&selectionRect.h+selectionRect.y>elementRect.y){return true}else{return false}}},{key:"_autoScroll",value:function _autoScroll(event){var edge=this.isCursorNearEdge(event,this.area);var docEl=document&&document.documentElement&&document.documentElement.scrollTop&&document.documentElement;var _area=this.area===document?docEl||document.body:this.area;if(edge==="top"&&_area.scrollTop>0){_area.scrollTop-=1*this.autoScrollSpeed}else if(edge==="bottom"){_area.scrollTop+=1*this.autoScrollSpeed}else if(edge==="left"&&_area.scrollLeft>0){_area.scrollLeft-=1*this.autoScrollSpeed}else if(edge==="right"){_area.scrollLeft+=1*this.autoScrollSpeed}}},{key:"isCursorNearEdge",value:function isCursorNearEdge(event,area){var cursorPosition=this._getCursorPos(event,area);var areaRect=this.getAreaRect(area);var tolerance={x:Math.max(areaRect.width/10,30),y:Math.max(areaRect.height/10,30)};if(cursorPosition.y<tolerance.y){return"top"}else if(areaRect.height-cursorPosition.y<tolerance.y){return"bottom"}else if(areaRect.width-cursorPosition.x<tolerance.x){return"right"}else if(cursorPosition.x<tolerance.x){return"left"}return false}},{key:"reset",value:function reset(event,withCallback){var _this2=this;this._previousCursorPos=this._getCursorPos(event,this.area);document.removeEventListener("mouseup",this._end);document.removeEventListener("touchend",this._end);this.area.removeEventListener("mousemove",this._handleMove);this.area.removeEventListener("touchmove",this._handleMove,{passive:false});this.area.addEventListener("mousedown",this._startUp);this.area.addEventListener("touchstart",this._startUp,{passive:false});if(withCallback)this.callback(this.getSelection(),event);if(this._breaked)return false;this.selector.style.width="0";this.selector.style.height="0";this.selector.style.display="none";setTimeout(function(){return _this2.mouseInteraction=false},100)}},{key:"break",value:function _break(){var _this3=this;this._breaked=true;setTimeout(function(){return _this3._breaked=false},100)}},{key:"stop",value:function stop(){var remove=arguments.length>0&&arguments[0]!==undefined?arguments[0]:true;var fromSelection=arguments.length>1&&arguments[1]!==undefined?arguments[1]:true;var withCallback=arguments.length>2?arguments[2]:undefined;this.reset(false,withCallback);this.area.removeEventListener("mousedown",this._startUp);this.area.removeEventListener("touchstart",this._startUp,{passive:false});document.removeEventListener("mouseup",this._end);document.removeEventListener("touchend",this._end);this._handleSelectables(_toConsumableArray(this.selectables),remove,fromSelection)}},{key:"getSelection",value:function getSelection(){return _toConsumableArray(this._selected)}},{key:"getCursorPos",value:function getCursorPos(event,_area,ignoreScroll){if(!event)return{x:0,y:0};var area=_area||_area!==false&&this.area;var pos=this._getCursorPos(event,area);var scroll=ignoreScroll?{x:0,y:0}:this.getScroll(area);return{x:pos.x+scroll.x,y:pos.y+scroll.y}}},{key:"addSelection",value:function addSelection(_nodes,triggerCallback,dontAddToSelectables){var nodes=this._toArray(_nodes);for(var index=0,il=nodes.length;index<il;index++){var node=nodes[index];this.select(node)}if(!dontAddToSelectables){this.addSelectables(nodes)}if(triggerCallback){this.callback(this._selected,false)}return this._selected}},{key:"removeSelection",value:function removeSelection(_nodes,triggerCallback,removeFromSelectables){var nodes=this._toArray(_nodes);for(var index=0,il=nodes.length;index<il;index++){var node=nodes[index];this.unselect(node)}if(removeFromSelectables){this.removeSelectables(nodes)}if(triggerCallback){this.callback(this._selected,false)}return this._selected}},{key:"toggleSelection",value:function toggleSelection(_nodes,triggerCallback,special){var nodes=this._toArray(_nodes);for(var index=0,il=nodes.length;index<il;index++){var node=nodes[index];if(this._selected.indexOf(node)<0){this.addSelection(node,triggerCallback,special)}else{this.removeSelection(node,triggerCallback,special)}}return this._selected}},{key:"setSelection",value:function setSelection(_nodes,triggerCallback,dontAddToSelectables){this.clearSelection();this.addSelection(_nodes,triggerCallback,dontAddToSelectables);return this._selected}},{key:"clearSelection",value:function clearSelection(triggerCallback){var selection=this._selected.slice();for(var index=0,il=selection.length;index<il;index++){var node=selection[index];this.unselect(node)}if(triggerCallback){this.callback(this._selected,false)}return this._selected}},{key:"addSelectables",value:function addSelectables(_nodes,addToSelection){var nodes=this._toArray(_nodes);this._handleSelectables(nodes,false,addToSelection);return _nodes}},{key:"getSelectables",value:function getSelectables(){return this.selectables}},{key:"setSelectables",value:function setSelectables(nodes,removeFromSelection,addToSelection){this.removeSelectables(this.getSelectables(),removeFromSelection);return this.addSelectables(nodes,addToSelection)}},{key:"removeSelectables",value:function removeSelectables(_nodes,removeFromSelection){var nodes=this._toArray(_nodes);this._handleSelectables(nodes,true,removeFromSelection);return _nodes}},{key:"_isRightClick",value:function _isRightClick(event){var isRightMB=false;if("which"in event){isRightMB=event.which===3}else if("button"in event){isRightMB=event.button===2}return isRightMB}},{key:"_isScrollbarClick",value:function _isScrollbarClick(event,area){var cPos=this._getCursorPos(event,area);var areaRect=this.getAreaRect(area);var border=area.computedBorder||0;if(areaRect.width+border<=cPos.x)return true;if(areaRect.height+border<=cPos.y)return true;return false}},{key:"_toArray",value:function _toArray(nodes){if(!nodes)return[];if(!nodes.length&&this._isElement(nodes))return[nodes];var array=[];for(var i=nodes.length-1;i>=0;i--){array[i]=nodes[i]}return array}},{key:"_isElement",value:function _isElement(node){try{return node instanceof HTMLElement||node instanceof SVGElement}catch(e){return _typeof(node)==="object"&&node.nodeType===1&&_typeof(node.style)==="object"&&_typeof(node.ownerDocument)==="object"}}},{key:"_getCursorPos",value:function _getCursorPos(event,area){if(!event)return{x:0,y:0};if(event.touches&&event.type!=="touchend"){this._lastTouch=event}event=event.touches?this._lastTouch.touches[0]:event;var cPos={x:event.pageX||event.clientX,y:event.pageY||event.clientY};var areaRect=this.getAreaRect(area||document);var docScroll=this.getScroll();return{x:(cPos.x-areaRect.left-docScroll.x)/this.zoom,y:(cPos.y-areaRect.top-docScroll.y)/this.zoom}}},{key:"getInitialCursorPosition",value:function getInitialCursorPosition(){return this._initialCursorPos}},{key:"getCurrentCursorPosition",value:function getCurrentCursorPosition(){return this._newCursorPos}},{key:"getPreviousCursorPosition",value:function getPreviousCursorPosition(){return this._previousCursorPos}},{key:"getCursorPositionDifference",value:function getCursorPositionDifference(usePreviousCursorDifference){var posA=this.getCurrentCursorPosition();var posB=usePreviousCursorDifference?this.getPreviousCursorPosition():this.getInitialCursorPosition();return{x:posA.x-posB.x,y:posA.y-posB.y}}},{key:"getScroll",value:function getScroll(area){var body={top:document.body.scrollTop>0?document.body.scrollTop:document.documentElement.scrollTop,left:document.body.scrollLeft>0?document.body.scrollLeft:document.documentElement.scrollLeft};var scroll={y:area&&area.scrollTop>=0?area.scrollTop:body.top,x:area&&area.scrollLeft>=0?area.scrollLeft:body.left};return scroll}},{key:"getAreaRect",value:function getAreaRect(area){if(area===document){var size={y:area.documentElement.clientHeight>0?area.documentElement.clientHeight:window.innerHeight,x:area.documentElement.clientWidth>0?area.documentElement.clientWidth:window.innerWidth};return{top:0,left:0,bottom:0,right:0,width:size.x,height:size.y}}var rect=area.getBoundingClientRect();return{top:rect.top,left:rect.left,bottom:rect.bottom,right:rect.right,width:area.clientWidth||rect.width,height:area.clientHeight||rect.height}}},{key:"_updatePos",value:function _updatePos(node,pos){node.style.left=pos.x+"px";node.style.top=pos.y+"px";node.style.width=pos.w+"px";node.style.height=pos.h+"px";return node}}]);return DragSelect}();if(typeof module!=="undefined"&&module!==null){module.exports=DragSelect}else if(typeof define!=="undefined"&&typeof define==="function"&&define){define(function(){return DragSelect})}else{window.DragSelect=DragSelect}export {DragSelect};