# About this folder

> this is an effort to document the work in progress and what I plan to do - [read these issues if you want to help](https://github.com/silexlabs/drag-drop-stage-component/labels/ready)

This folder contains the classes for the stage component. See the [main readme](../../../../) for a general introduction.

## General concept

There is a store which has the app state. The app state is an [object described here](./ts/Types.ts#L24). It holds the state of the app, the cursor shape, all the elements which are tracked when moving the mouse around, with [the elements metrics and properties](./ts/Types.ts#L46).

When the state is changed, the observers are notified and apply the change to the UI or the DOM.

## Stage

The [Stage class is defined in index.ts](./index.ts), it is the entry point and the main class. It instanciates the other classes and controls their interactions.

## Mouse

[Mouse](./Mouse.ts) classe handle the mouse and emits high level events.

It listens to events in the iframe as well as outside the iframe, e.g. when the mouse goes outside the iframe while dragging an element, it keeps tracking the events. It uses the store to change the application state between "NONE", "DRAGGING", "RESIZING" and "DRAWING" states.

## Flux package

This layer is in charge of interfacing with the flux library. It exposes a store, the `StageStore` class, a flux store which is typed and has convenient methods in our specific case.

## Handlers package

Classes which are created when an action starts, and which will handle the move or resize of elements until they are released.

* [MoveHandler](./handlers/MoveHandler.ts)
* [ResizeHandler](./handlers/ResizeHandler.ts)
* [DrawHandler](./handlers/DrawHandler.ts): this draws a rectangle and selects all the elements which intersect with it

## Observers package

This layer listens to the store and apply the changes to the DOM or the UI. For exapmple if an element's position has changed in the store, [this is where the changes are actually applied to the element](./observers/SelectablesObserver.ts#L57).

This package is what React handles in a React app. Here the app handles it itself.
