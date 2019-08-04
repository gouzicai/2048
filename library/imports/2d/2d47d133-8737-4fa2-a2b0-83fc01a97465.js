"use strict";
cc._RF.push(module, '2d47dEzhzdPoqKwg/wBqXRl', 'block');
// Scripts/block.js

'use strict';

var colors = require('colors');
cc.Class({
    extends: cc.Component,

    properties: {
        numberLabel: cc.Label
    },
    start: function start() {},
    setNumber: function setNumber(number) {
        if (number == 0) {
            this.numberLabel.node.active = false;
        }
        this.numberLabel.string = number;
        if (number in colors) {
            this.node.color = colors[number];
        }
    }
});

cc._RF.pop();