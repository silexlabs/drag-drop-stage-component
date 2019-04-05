# About this folder

> this is an effort to document the work in progress and what I plan to do - [read these issues if you want to help](https://github.com/lexoyo/stage/labels/ready)

This folder contains the classes for the stage. See the [main readme](../../../../) for a general introduction.

## Stage

The [Stage class](./index.js) is the entry point and the main class. It instanciates the other classes and controls their interactions.

## Mouse

[Mouse](./Mouse.js) classe handle the mouse and emits high level events.

It listens to events in the iframe as well as outside the iframe, e.g. when the mouse goes outside the iframe while dragging an element, it is supposed to scroll the iframe.

## Selection

[Selection](Selection.js) class handle selection and multiple selection.

## Handler classes

Classes which are created when an action starts, and which will handle the move or resize of elements until they are released.

* [MoveHandler](./MoveHandler.js)
* ResizeHandler
* RegionHandler, this draws a rectangle and selects all the elements which intersect with it

