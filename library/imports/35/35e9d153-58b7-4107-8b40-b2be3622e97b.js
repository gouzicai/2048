"use strict";
cc._RF.push(module, '35e9dFTWLdBB4tAsr42Iul7', 'game');
// Scripts/game.js

'use strict';

var ROWS = 4; //行数
var NUMBERS = [2, 4]; //随机生成的数字
var STARTMOVELENGTH = 50; //触发移动的触摸距离
var MOVE_DURATION = 0.1; //模块移动的速度

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        score: 0,
        blockPrefab: cc.Prefab,
        gap: 20,
        bg: cc.Node
    },

    start: function start() {
        this.drawBgBlocks();
        this.init();
        this.addEventHandler();
    },
    drawBgBlocks: function drawBgBlocks() {
        this.blockSize = (cc.winSize.width - this.gap * (ROWS + 1)) / ROWS;
        var x = -this.blockSize / 2;
        var y = this.blockSize;
        this.positions = [];
        for (var i = 0; i < ROWS; i++) {
            this.positions.push([0, 0, 0, 0]);
            for (var j = 0; j < ROWS; j++) {
                var block = cc.instantiate(this.blockPrefab);
                x += this.gap + this.blockSize;
                block.width = this.blockSize;
                block.height = this.blockSize;
                this.bg.addChild(block);
                block.position = cc.v2(x, y);
                this.positions[i][j] = block.position;
                block.getComponent('block').setNumber(0);
            }
            x = -this.blockSize / 2;
            y += this.gap + this.blockSize;
        }
    },
    init: function init() {
        this.updateScore(0);
        if (this.blocks) {
            for (var i = 0; i < this.blocks.length; i++) {
                for (var j = 0; j < this.blocks[i].length; i++) {
                    if (this.blocks[i][j] != null) {
                        this.blocks[i][j].destroy();
                    }
                }
            }
        }

        this.data = [];
        this.blocks = [];
        for (var _i = 0; _i < ROWS; _i++) {
            this.blocks.push([null, null, null, null]);
            this.data.push([0, 0, 0, 0]);
        }
        this.addBlock();
        this.addBlock();
        this.addBlock();
    },
    updateScore: function updateScore(number) {
        this.score = number, this.scoreLabel.string = '分数：' + number;
    },


    /**
     * 找出空余的块
     * @return 空闲块的位置表示
     */
    getEmptyLocations: function getEmptyLocations() {
        var locations = [];
        for (var i = 0; i < this.blocks.length; i++) {
            for (var j = 0; j < this.blocks[i].length; j++) {
                if (this.blocks[i][j] == null) {
                    locations.push({ x: i, y: j });
                }
            }
        }
        return locations;
    },
    addBlock: function addBlock() {
        var locations = this.getEmptyLocations();
        if (locations.length == 0) return false;
        var location = locations[Math.floor(Math.random() * locations.length)];
        var x = location.x;
        var y = location.y;
        var position = this.positions[x][y];
        var block = cc.instantiate(this.blockPrefab);
        block.width = this.blockSize;
        block.height = this.blockSize;
        this.bg.addChild(block);
        block.position = position;
        var number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        block.getComponent('block').setNumber(number);
        this.blocks[x][y] = block;
        this.data[x][y] = number;
        return true;
    },
    addEventHandler: function addEventHandler() {
        var _this = this;

        this.bg.on('touchstart', function (event) {
            _this.startPoint = event.getLocation();
        });

        this.bg.on('touchend', function (event) {
            _this.touchEnd(event);
        });

        this.bg.on('touchcancel', function (event) {
            _this.touchEnd(event);
        });
    },
    touchEnd: function touchEnd(event) {
        this.endPoint = event.getLocation();
        var vec = this.endPoint.sub(this.startPoint);
        if (vec.mag() > STARTMOVELENGTH) {
            if (Math.abs(vec.x) > Math.abs(vec.y)) {
                //水平方向
                if (vec.x > 0) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            } else {
                //竖直方向
                if (vec.y > 0) {
                    this.moveUp();
                } else {
                    this.moveDown();
                }
            }
        }
    },
    checkFail: function checkFail() {
        for (var i = 0; i < ROWS; i++) {
            for (var j = 0; j < ROWS; j++) {
                var n = this.data[i][j];
                if (n == 0) return false;
                if (j > 0 && this.data[i][j - 1] == n) return false;
                if (j < ROWS - 1 && this.data[i][j + 1] == n) return false;
                if (i > 0 && this.data[i - 1][j] == n) return false;
                if (i < ROWS - 1 && this.data[i + 1][j] == n) return false;
            }
        }
        return true;
    },
    gameOver: function gameOver() {
        cc.log('gameover');
    },
    afterMove: function afterMove(hasMoved) {
        if (hasMoved) {
            this.addBlock();
        }
        if (this.checkFail()) {
            this.gameOver();
        }
    },

    /**
     * 移动格子
     * @param {cc.Node} block 
     * @param {cc.v2} position 
     * @param {function} callback 
     */
    doMove: function doMove(block, position, callback) {
        var action = cc.moveTo(0.1, position);
        var finish = cc.callFunc(function () {
            callback && callback();
        });
        block.runAction(cc.sequence(action, finish));
    },
    moveLeft: function moveLeft() {
        var _this2 = this;

        // var data = this.data;
        // var blocks = this.blocks;
        // for(let i = 0;i < this.data.length;i++){
        //     for(let j = 0;j < this.data[i].length;j++){
        //         for(let k = j;k > 0;k--){
        //             if(data[i][k] == 0) continue;
        //             if(data[i][k-1] == 0){
        //                 data[i][k-1] = data[i][k];
        //                 data[i][k] = 0;
        //                 blocks[i][k-1] = blocks[i][k];
        //                 blocks[i][k-1].position = this.positions[i][k-1];
        //                 blocks[i][k] = null;
        //             }else if(data[i][k-1] == data[i][k]){
        //                 data[i][k-1] *= 2;
        //                 data[i][k] = 0;
        //                 blocks[i][k-1] = blocks[i][k];
        //                 blocks[i][k-1].position = this.positions[i][k-1];
        //                 let num = data[i][k-1];
        //                 blocks[i][k-1].getComponent('block').setNumber(num);
        //                 blocks[i][k] = null;
        //             }
        //         }
        //     }
        // }

        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (y == 0 || _this2.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this2.data[x][y - 1] == 0) {
                //移动
                var block = _this2.blocks[x][y];
                var position = _this2.positions[x][y - 1];
                _this2.data[x][y - 1] = _this2.data[x][y];
                _this2.data[x][y] = 0;
                _this2.blocks[x][y - 1] = block;
                _this2.blocks[x][y] = null;
                _this2.doMove(block, position, function () {
                    move(x, y - 1, callback);
                });
                hasMoved = true;
            } else if (_this2.data[x][y - 1] == _this2.data[x][y]) {
                //合并
                var _block = _this2.blocks[x][y];
                var block2 = _this2.blocks[x][y - 1];
                var _position = _this2.positions[x][y - 1];
                _this2.data[x][y - 1] *= 2;
                _this2.data[x][y] = 0;
                _this2.blocks[x][y - 1] = _block;
                _this2.blocks[x][y] = null;
                _this2.doMove(_block, _position, function () {
                    _block.getComponent('block').setNumber(_this2.data[x][y - 1]);
                    block2.destroy();
                    move(x, y - 1, callback);
                });
                hasMoved = true;
                _this2.score++;
                _this2.updateScore(_this2.score);
            } else {
                callback && callback();
                return;
            }
        };

        var moveBlocks = [];
        for (var i = 0; i < ROWS; i++) {
            for (var j = 0; j < ROWS; j++) {
                if (this.data[i][j] != 0) {
                    moveBlocks.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var _i2 = 0; _i2 < moveBlocks.length; _i2++) {
            move(moveBlocks[_i2].x, moveBlocks[_i2].y, function () {
                counter++;
                if (counter == moveBlocks.length) {
                    _this2.afterMove(hasMoved);
                }
            });
        }
    },
    moveRight: function moveRight() {
        var _this3 = this;

        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (y == ROWS - 1 || _this3.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this3.data[x][y + 1] == 0) {
                //移动
                var block = _this3.blocks[x][y];
                var position = _this3.positions[x][y + 1];
                _this3.data[x][y + 1] = _this3.data[x][y];
                _this3.data[x][y] = 0;
                _this3.blocks[x][y + 1] = block;
                _this3.blocks[x][y] = null;
                _this3.doMove(block, position, function () {
                    move(x, y + 1, callback);
                });

                hasMoved = true;
            } else if (_this3.data[x][y + 1] == _this3.data[x][y]) {
                //合并
                var _block2 = _this3.blocks[x][y];
                var block2 = _this3.blocks[x][y + 1];
                var _position2 = _this3.positions[x][y + 1];
                _this3.data[x][y + 1] *= 2;
                _this3.data[x][y] = 0;
                _this3.blocks[x][y + 1] = _block2;
                _this3.blocks[x][y] = null;
                _this3.doMove(_block2, _position2, function () {
                    _block2.getComponent('block').setNumber(_this3.data[x][y + 1]);
                    block2.destroy();
                    move(x, y + 1, callback);
                });
                hasMoved = true;
                _this3.score++;
                _this3.updateScore(_this3.score);
            } else {
                callback && callback();
                return;
            }
        };

        var moveBlocks = [];
        for (var i = 0; i < ROWS; i++) {
            for (var j = ROWS - 1; j > -1; j--) {
                if (this.data[i][j] != 0) {
                    moveBlocks.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var _i3 = 0; _i3 < moveBlocks.length; _i3++) {
            move(moveBlocks[_i3].x, moveBlocks[_i3].y, function () {
                counter++;
                if (counter == moveBlocks.length) {
                    _this3.afterMove(hasMoved);
                }
            });
        }
    },
    moveUp: function moveUp() {
        var _this4 = this;

        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (x == ROWS - 1 || _this4.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this4.data[x + 1][y] == 0) {
                //移动
                var block = _this4.blocks[x][y];
                var position = _this4.positions[x + 1][y];
                _this4.data[x + 1][y] = _this4.data[x][y];
                _this4.data[x][y] = 0;
                _this4.blocks[x + 1][y] = block;
                _this4.blocks[x][y] = null;
                _this4.doMove(block, position, function () {
                    move(x + 1, y, callback);
                });

                hasMoved = true;
            } else if (_this4.data[x + 1][y] == _this4.data[x][y]) {
                //合并
                var _block3 = _this4.blocks[x][y];
                var block2 = _this4.blocks[x + 1][y];
                var _position3 = _this4.positions[x + 1][y];
                _this4.data[x + 1][y] *= 2;
                _this4.data[x][y] = 0;
                _this4.blocks[x + 1][y] = _block3;
                _this4.blocks[x][y] = null;
                _this4.doMove(_block3, _position3, function () {
                    _block3.getComponent('block').setNumber(_this4.data[x + 1][y]);
                    block2.destroy();
                    move(x + 1, y, callback);
                });
                hasMoved = true;
                _this4.score++;
                _this4.updateScore(_this4.score);
            } else {
                callback && callback();
                return;
            }
        };

        var moveBlocks = [];
        for (var i = 0; i < ROWS; i++) {
            for (var j = ROWS - 1; j > -1; j--) {
                if (this.data[j][i] != 0) {
                    moveBlocks.push({ x: j, y: i });
                }
            }
        }
        cc.log(moveBlocks);

        var counter = 0;
        for (var _i4 = 0; _i4 < moveBlocks.length; _i4++) {
            move(moveBlocks[_i4].x, moveBlocks[_i4].y, function () {
                counter++;
                if (counter == moveBlocks.length) {
                    _this4.afterMove(hasMoved);
                }
            });
        }
    },
    moveDown: function moveDown() {
        var _this5 = this;

        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (x == 0 || _this5.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this5.data[x - 1][y] == 0) {
                //移动
                var block = _this5.blocks[x][y];
                var position = _this5.positions[x - 1][y];
                _this5.data[x - 1][y] = _this5.data[x][y];
                _this5.data[x][y] = 0;
                _this5.blocks[x - 1][y] = block;
                _this5.blocks[x][y] = null;
                _this5.doMove(block, position, function () {
                    move(x - 1, y, callback);
                });

                hasMoved = true;
            } else if (_this5.data[x - 1][y] == _this5.data[x][y]) {
                //合并
                var _block4 = _this5.blocks[x][y];
                var block2 = _this5.blocks[x - 1][y];
                var _position4 = _this5.positions[x - 1][y];
                _this5.data[x - 1][y] *= 2;
                _this5.data[x][y] = 0;
                _this5.blocks[x - 1][y] = _block4;
                _this5.blocks[x][y] = null;
                _this5.doMove(_block4, _position4, function () {
                    _block4.getComponent('block').setNumber(_this5.data[x - 1][y]);
                    block2.destroy();
                    move(x - 1, y, callback);
                });
                hasMoved = true;
                _this5.score++;
                _this5.updateScore(_this5.score);
            } else {
                callback && callback();
                return;
            }
        };

        var moveBlocks = [];
        for (var i = 0; i < ROWS; i++) {
            for (var j = 0; j < ROWS; j++) {
                if (this.data[j][i] != 0) {
                    moveBlocks.push({ x: j, y: i });
                }
            }
        }

        var counter = 0;
        for (var _i5 = 0; _i5 < moveBlocks.length; _i5++) {
            move(moveBlocks[_i5].x, moveBlocks[_i5].y, function () {
                counter++;
                if (counter == moveBlocks.length) {
                    _this5.afterMove(hasMoved);
                }
            });
        }
    }
});

cc._RF.pop();