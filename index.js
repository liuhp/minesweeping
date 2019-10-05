//雷的构造函数
function Mine(tr,td,mineNum){
    this.tr = tr;//扫雷的行数
    this.td = td;//扫雷的列数
    this.mineNum = mineNum;//雷数
    this.squares = [];//存储所有方块的信息,二维数组，按行列顺序排放
    this.tds = [];//存放所有单元格的DOM
    this.surplusMineNum = mineNum;//剩余雷的数组
    this.parent = document.getElementsByClassName('minebox')[0];//扫雷区域要插入table的父级
    this.allRight = false;//判断小红旗是否全部插对 
}

//生成table扫雷区域
Mine.prototype.createDom = function(){
    var This = this;
    var tableDom = document.createElement('table');
    for(var i=0; i<this.tr; i++){//行
        trDom = document.createElement('tr');
        this.tds[i] = [];
        for(var j=0; j<this.td; j++){//列
            var tdDom = document.createElement('td');
            this.tds[i][j] = tdDom;//把所有创建的td添加到数组中
            //绑定点击事件显示
            tdDom.pos = [i,j];//把格子对应的行与列存在格子身上，为了下面通过这个值去数组里取到对应的数据
            tdDom.onmousedown = function(e){
                This.play(e,this)  //This指向实例对象，this指向点击对象td
            }
            // if(this.squares[i][j].type == 'mine'){
            //     tdDom.className = 'mine';
            // }else {
            //     tdDom.innerHTML = this.squares[i][j].value;
            // }

            trDom.appendChild(tdDom);
        }
        tableDom.appendChild(trDom);
    }
    this.parent.appendChild(tableDom);
    tableDom.oncontextmenu = function(){//在table上取消鼠标右击默认事件
        return false;
    }
    
    
}
//生成随机不重复的数字（雷）
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr*this.td);
    var len = square.length;
    for(var i=0; i<len; i++){
        square[i] = i;
    }
    square.sort(function(){  //数组乱序
        return (0.5-Math.random());
    })
    
    return square.splice(0,this.mineNum);
}
// 初始化，给squares添加信息
Mine.prototype.init = function(){
    
    var mineArr = this.randomNum();
    var n = 0;
    for(var i=0; i<this.tr; i++){
        this.squares[i] = [];
        for(var j=0; j<this.td; j++){
            //取方块在数组中的数据用行列形式去取，找方块周围格子要用坐标形式去取，行列与坐标恰好相反
            if(mineArr.indexOf(++n) !=-1){//说明在雷数组中找到索引，此方块是雷
                this.squares[i][j] = {type:'mine',x:j,y:i};
                
            }else{ //此方块是数字
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};
            }
        }
    }

    this.updataNum();
    this.parent.innerHTML = '';
    this.createDom();
    this.surplusMineNumDom = document.querySelector('.minenum');
    this.surplusMineNumDom.innerHTML = this.surplusMineNum;
}
//找周围的空格子
Mine.prototype.getAround = function(square){
    var x = square.x,
        y = square.y,
        resArr = [];//把找到的格子存入此数组，行列形式，方便后面获取
    
    /* 雷点周围格子坐标
        x-1,y-1   x,y-1   x+1,y-1
        x-1,y     x,y     x+1,y
        x-1,y+1   x,y+1   x+1,y+1
    */
    for(let m=x-1; m<=x+1; m++){//先遍历x坐标，对应j
        for(let n=y-1; n<=y+1; n++){//再遍历y坐标，对应i
            if( m<0 || n<0 || m>this.tr-1 || n>this.td-1|| //四个顶点时注意
                (m==x && n==y)||//自己不用找
                this.squares[n][m].type == 'mine'){//雷点时不需要找
                continue;
            }
            resArr.push([n,m]);
        }
    }
    return resArr;
}
Mine.prototype.updataNum = function(){
    for(var i=0; i<this.tr; i++){
        for(var j=0; j<this.td; j++){
            if(this.squares[i][j].type == 'number'){//数字跳过，不需要更新，只更新雷周围的数字
                continue;
            }
            var arr = this.getAround(this.squares[i][j]);//获取雷周围数据
            for(var k=0; k<arr.length; k++){
                //arr[0] = [1,2]
                //arr[0][0] = 1 , arr[0][1] = 2
                this.squares[arr[k][0]][arr[k][1]].value++;
            }
        }
    }
}
Mine.prototype.play = function(event,tdobj){
    var This = this;
    if(event.which == 1){ //which=1代表鼠标左键,which=3鼠标右键
        var cl = ['zero','one','two','three','four','five','six','seven','eight'];
        var cursquare = this.squares[tdobj.pos[0]][tdobj.pos[1]];
        if(cursquare.type == 'number'){
            //点到数字，改变成相应类名并插入到页面中
            tdobj.className = cl[cursquare.value];
            tdobj.innerHTML = cursquare.value;

            //点到数字0，显示一大片，用递归思想
            if(cursquare.value == 0){
                /* 1.如果改点是0：
                        显示自己
                        // 寻找自己周围格子遍历：周围值不为0显示到此，如果改点是0：
                        //     显示自己   封装这两句
                            寻找自己周围格子。。。
                */
               tdobj.innerHTML = '';
               function showaround(square){
                    var around = This.getAround(square);//周围数字格子
                    for(var i=0; i<around.length; i++){
                        var x = around[i][0];
                        var y = around[i][1];
                        //添加类名
                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if(This.squares[x][y].value == 0){
                            if(!This.tds[x][y].checked){
                                This.tds[x][y].checked = true;
                                // This.tds[x][y].innerHTML = '';//这句为什么不写也可以
                                showaround(This.squares[x][y]);
                            }
                        }else{
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
               }
               showaround(cursquare);
            }
        } else{ //点到的不是数字，是雷
            alert('游戏失败 ');
            this.gameover(tdobj);
        }
    }
    if(event.which == 3){//which=1代表鼠标左键,which=3鼠标右键
        //已经显示的数字不能右击
        if(tdobj.className && tdobj.className != 'flag'){
            return;
        }
        if(this.squares[tdobj.pos[0]][tdobj.pos[1]].type = 'mine'){//有问题，奇数失败，偶数成功，或者最后一次决定
            this.allRight = true;
        }else{
            this.allRight = false;
        }
        //右击剩余雷数变化,小红旗切换
        if(tdobj.className == 'flag'){
            tdobj.className ='';
            this.surplusMineNumDom.innerHTML = ++this.surplusMineNum ;
        }else{
            tdobj.className ='flag';
            this.surplusMineNumDom.innerHTML = --this.surplusMineNum ;
        }
        if(this.surplusMineNum ==0){//用户标完小红旗了
            console.log(this.allright)
            if(this.allRight){
                alert('游戏胜利');
            }else{
                alert('游戏失败'); 
            }
        }

    }   
}
Mine.prototype.gameover = function(tdobj){
    //取消点击事件
    // 显示所有的雷
    //当前点击的雷变红
    tdobj.onmousedown = null;
    for(var i=0; i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type == 'mine'){
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    tdobj.style.backgroundColor = 'red';

}

var levelBtn = document.querySelectorAll('.level button');
var levelarr = [[9,9,10],[16,16,40],[28,28,99]];
var mine = null;
var ln = 0;//处理当前选中的状态
for(let i=0;i<levelBtn.length-1;i++){
    levelBtn[i].onclick = function(){
        levelBtn[ln].className = '';
        this.className = 'active';
        mine = new Mine(...levelarr[i]);
        mine.init();
        ln = i;
    }   
}

levelBtn[3].onclick = function(){
    mine.init();
}
levelBtn[0].click();

    




// var mine = new Mine(28,28,99);
// mine.init();
