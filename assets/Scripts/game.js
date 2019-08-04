const ROWS = 4;                      //行数
const NUMBERS = [2,4];               //随机生成的数字
const STARTMOVELENGTH = 50;          //触发移动的触摸距离
const MOVE_DURATION = 0.1;           //模块移动的速度

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel:cc.Label,
        score:0,
        blockPrefab:cc.Prefab,
        gap:20,
        bg:cc.Node
    },


    start () {
        this.drawBgBlocks();
        this.init();
        this.addEventHandler();
    },


    drawBgBlocks(){
        this.blockSize = (cc.winSize.width - this.gap * (ROWS+1)) / ROWS;
        let x = -this.blockSize/2;
        let y = this.blockSize;
        this.positions =[];
        for(let i = 0;i < ROWS; i++){
            this.positions.push([0,0,0,0]);
            for(let j = 0;j < ROWS ;j++){
                let block = cc.instantiate(this.blockPrefab);
                x += this.gap + this.blockSize;
                block.width = this.blockSize;
                block.height = this.blockSize;
                this.bg.addChild(block);
                block.position = cc.v2(x,y);
                this.positions[i][j] = block.position;
                block.getComponent('block').setNumber(0);
            }
            x = -this.blockSize/2;
            y += this.gap + this.blockSize;
        }
    },

    init(){
        this.updateScore(0);
        if(this.blocks){
            for(let i = 0;i<this.blocks.length ; i++){
                for(let j = 0;j<this.blocks[i].length;i++){
                    if(this.blocks[i][j] != null){
                        this.blocks[i][j].destroy();
                    }
                }
                 
            }
        }

        this.data = [];
        this.blocks = [];
        for(let i = 0;i < ROWS; i++){
            this.blocks.push([null,null,null,null]);
            this.data.push([0,0,0,0]);
        }
        this.addBlock();
        this.addBlock();
        this.addBlock();

    },

    updateScore(number){
        this.score = number,
        this.scoreLabel.string = '分数：' + number;
    },


    /**
     * 找出空余的块
     * @return 空闲块的位置表示
     */
    getEmptyLocations(){
        let locations = [];
        for(let i =0;i<this.blocks.length;i++){
            for(let j =0;j<this.blocks[i].length;j++){
                if(this.blocks[i][j] == null){
                    locations.push({x:i,y:j});
                }
            }
        }
        return locations;
    },
    
    addBlock(){
        let locations = this.getEmptyLocations();
        if(locations.length == 0) return false;
        let location = locations[Math.floor(Math.random() * locations.length)];
        let x = location.x;
        let y = location.y;
        let position = this.positions[x][y];
        let block = cc.instantiate(this.blockPrefab);
        block.width = this.blockSize;
        block.height = this.blockSize;
        this.bg.addChild(block);
        block.position = position;
        let number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        block.getComponent('block').setNumber(number);
        this.blocks[x][y] = block;
        this.data[x][y] = number;
        return true;
    },


    addEventHandler(){
        this.bg.on('touchstart',(event)=>{
            this.startPoint = event.getLocation();
        });

        this.bg.on('touchend',(event)=>{
            this.touchEnd(event);
        });

        this.bg.on('touchcancel',(event)=>{
            this.touchEnd(event);
        });
    },

    touchEnd(event){
        this.endPoint = event.getLocation();
            let vec = this.endPoint.sub(this.startPoint);
            if(vec.mag() > STARTMOVELENGTH){
                if(Math.abs(vec.x) > Math.abs(vec.y)){
                    //水平方向
                    if(vec.x > 0){
                        this.moveRight();    
                    }else{
                        this.moveLeft();
                    } 
                }else{
                    //竖直方向
                    if(vec.y > 0){
                        this.moveUp();
                    }else{
                        this.moveDown();
                    }
                }
            }
    },


    checkFail(){
        for(let i = 0;i<ROWS;i++){
            for(let j = 0;j<ROWS;j++){
                let n = this.data[i][j];
                if(n == 0) return false;
                if(j > 0 && this.data[i][j-1] == n) return false;
                if(j < ROWS-1 && this.data[i][j+1] == n) return false;
                if(i > 0 && this.data[i-1][j] == n) return false;
                if(i < ROWS-1 && this.data[i+1][j] == n) return false;
            }
        }
        return true;
    },

    gameOver(){
        cc.log('gameover');
        },
    afterMove(hasMoved){
        if(hasMoved){
            this.addBlock();
        }
        if(this.checkFail()){
            this.gameOver();
        }
    },
/**
 * 移动格子
 * @param {cc.Node} block 
 * @param {cc.v2} position 
 * @param {function} callback 
 */
    doMove(block,position,callback){
        let action = cc.moveTo(0.1,position);
        let finish = cc.callFunc(()=>{
           callback && callback(); 
        });
        block.runAction(cc.sequence(action,finish));
    },
    moveLeft(){
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

        let hasMoved = false;
        let move = (x,y,callback)=>{
            if(y == 0 || this.data[x][y] == 0){
                callback && callback();
                return;
            }else if(this.data[x][y-1] == 0){
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x][y-1];
                this.data[x][y-1] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y-1] = block;
                this.blocks[x][y] = null;
                this.doMove(block,position,()=>{
                    move(x,y-1,callback)
                })
                hasMoved = true;
            }else if(this.data[x][y-1] == this.data[x][y]){
                //合并
                let block = this.blocks[x][y];
                let block2 = this.blocks[x][y-1];
                let position = this.positions[x][y-1];
                this.data[x][y-1] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y-1] = block;
                this.blocks[x][y] = null;
                this.doMove(block,position,()=>{
                    block.getComponent('block').setNumber(this.data[x][y-1]);
                    block2.destroy();
                    move(x,y-1,callback);
                })
                hasMoved = true;
                this.score++;
                this.updateScore(this.score);
            }else{
                callback && callback();
                return;
            }
        };

        let moveBlocks = [];
        for(let i = 0; i < ROWS; i++){
            for(let j =0; j < ROWS; j++){
                if(this.data[i][j] != 0){
                    moveBlocks.push({x:i,y:j});
                }
            }
        }

        let counter = 0;
        for(let i = 0;i < moveBlocks.length; i++){
            move(moveBlocks[i].x,moveBlocks[i].y,()=>{
                counter++;
                if(counter == moveBlocks.length){
                    this.afterMove(hasMoved);
                }
            });
        }
    },

    moveRight(){
        let hasMoved = false;
        let move = (x,y,callback)=>{
            if(y == ROWS-1 || this.data[x][y] == 0){
                callback && callback();
                return;
            }else if(this.data[x][y+1] == 0){
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x][y+1];
                this.data[x][y+1] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y+1] = block;
                this.blocks[x][y] = null;
                this.doMove(block,position,()=>{
                    move(x,y+1,callback)
                });

                hasMoved = true;
            }else if(this.data[x][y+1] == this.data[x][y]){
                //合并
                let block = this.blocks[x][y];
                let block2 = this.blocks[x][y+1];
                let position = this.positions[x][y+1];
                this.data[x][y+1] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y+1] = block;
                this.blocks[x][y] = null;
                this.doMove(block,position,()=>{
                    block.getComponent('block').setNumber(this.data[x][y+1]);
                    block2.destroy();
                    move(x,y+1,callback);
                })
                hasMoved = true;
                this.score++;
                this.updateScore(this.score);
            }else{
                callback && callback();
                return;
            }
        };

        let moveBlocks = [];
        for(let i = 0; i < ROWS; i++){
            for(let j = ROWS-1; j > -1; j--){
                if(this.data[i][j] != 0){
                    moveBlocks.push({x:i,y:j});
                }
            }
        }

        let counter = 0;
        for(let i = 0;i < moveBlocks.length; i++){
            move(moveBlocks[i].x,moveBlocks[i].y,()=>{
                counter++;
                if(counter == moveBlocks.length){
                    this.afterMove(hasMoved);
                }
            });
        }
    },

    moveUp(){
        let hasMoved = false;
        let move = (x, y, callback) => {
            if (x == ROWS-1 || this.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (this.data[x + 1][y] == 0) {
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x + 1][y];
                this.data[x + 1][y] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x + 1][y] = block;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    move(x + 1, y, callback)
                });

                hasMoved = true;
            } else if (this.data[x + 1][y] == this.data[x][y]) {
                //合并
                let block = this.blocks[x][y];
                let block2 = this.blocks[x + 1][y];
                let position = this.positions[x + 1][y];
                this.data[x + 1][y] *= 2;
                this.data[x][y] = 0;
                this.blocks[x + 1][y] = block;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    block.getComponent('block').setNumber(this.data[x + 1][y]);
                    block2.destroy();
                    move(x + 1, y, callback);
                })
                hasMoved = true;
                this.score++;
                this.updateScore(this.score);
            } else {
                callback && callback();
                return;
            }
        };

        let moveBlocks = [];
        for (let i = 0; i < ROWS; i++) {
            for (let j = ROWS - 1; j > -1; j--) {
                if (this.data[j][i] != 0) {
                    moveBlocks.push({ x: j, y: i });
                }
            }
        }
        cc.log(moveBlocks);

        let counter = 0;
        for (let i = 0; i < moveBlocks.length; i++) {
            move(moveBlocks[i].x, moveBlocks[i].y, () => {
                counter++;
                if (counter == moveBlocks.length) {
                    this.afterMove(hasMoved);
                }
            });
        }
    },

    moveDown(){
        let hasMoved = false;
        let move = (x,y,callback)=>{
            if(x == 0 || this.data[x][y] == 0){
                callback && callback();
                return;
            }else if(this.data[x-1][y] == 0){
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x-1][y];
                this.data[x-1][y] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x-1][y] = block;
                this.blocks[x][y] = null;
                this.doMove(block,position,()=>{
                    move(x-1,y,callback)
                });
                
                hasMoved = true;
            }else if(this.data[x-1][y] == this.data[x][y]){
                //合并
                let block = this.blocks[x][y];
                let block2 = this.blocks[x-1][y];
                let position = this.positions[x-1][y];
                this.data[x-1][y] *= 2;
                this.data[x][y] = 0;
                this.blocks[x-1][y] = block;
                this.blocks[x][y] = null;
                this.doMove(block,position,()=>{
                    block.getComponent('block').setNumber(this.data[x-1][y]);
                    block2.destroy();
                    move(x-1,y,callback);
                })
                hasMoved = true;
                this.score++;
                this.updateScore(this.score);
            }else{
                callback && callback();
                return;
            }
        };

        let moveBlocks = [];
        for(let i = 0; i < ROWS; i++){
            for(let j = 0; j < ROWS; j++){
                if(this.data[j][i] != 0){
                    moveBlocks.push({x:j,y:i});
                }
            }
        }

        let counter = 0;
        for(let i = 0;i < moveBlocks.length; i++){
            move(moveBlocks[i].x,moveBlocks[i].y,()=>{
                counter++;
                if(counter == moveBlocks.length){
                    this.afterMove(hasMoved);
                }
            });
        }
    }
});
