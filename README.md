# About this project

> this README is an effort to document the work in progress and what I plan to do

This is an attempt to make a "stage" component which lets the user select elements, drag and drop them, resize them. The goal is to be able to

A component like this will be useful to the developer building any tool which includes a WYSIWYG. 

The source code is written in ES2015 with less and jade.

## Use

The component can be initialized like this, which will make all the elements with the `.selectable` css class be selected, moved and resized.

```javascript
let iframe = document.querySelector('#iframe')
let stage = new Stage(iframe)
```

The iframe is where the elements to be manipulated live. The component itself is also acting on the outside of the iframe since the user can drag an element in the iframe and release the mouse outside the iframe.

## Build

The build requires nodejs and npm, and it produces these files:
* `pub/stage.js`, which you need to include in your project
* `pub/stage.css`, which will be included in the iframe to draw the UI
* `pub/demo.html`, which is a demo page for you to test the component

Run `npm install` and `npm run build` to build these files.

## Contribute

If you want to help and use this code in your project, [read this readme for an introduction to the source code](./src/js/) and [read these issues to see what needs to be done](https://github.com/lexoyo/stage/labels/ready).

