<template>
  <div>
    <div class="goods">
      <!--左侧内容-->
      <div class="menu-wrapper" ref="menuWrapper">
        <ul>
          <!--当currentIndex与index相等的时候，设置高亮-->
          <li v-for="(item,index) in goods" :key="item.id" class="menu-item" :class="{'current':currentIndex === index}"
              @click="selectMenu(index,$event)">
          <span class="text border-1px">
            <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
          </span>
          </li>
        </ul>
      </div>
      <!--右侧内容-->
      <div class="foods-wrapper" ref="foodsWrapper">
        <ul>
          <!--food-list-hook用于dom操作，获取整体容器的高度-->
          <li v-for="(item,index) in goods" :key="item.id" class="food-list food-list-hook">
            <h1 class="title" :class="{'current':currentIndex === index}">{{item.name}}</h1>
            <ul>
              <li @click="selectFood(food,$event)" v-for="food in item.foods" :key="food.id"
                  class="food-item border-1px">
                <div class="icon">
                  <img width="57" height="57" :src="food.icon" alt="">
                </div>
                <div class="content">
                  <h2 class="name">{{food.name}}</h2>
                  <p class="desc">{{food.description}}</p>
                  <div class="extra">
                    <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                  </div>
                  <div class="price">
                    <span class="now">￥{{food.price}}</span>
                    <span class="old" v-show="food.oldPrice">{{food.oldPrice}}</span>
                  </div>
                  <div class="cartcontrol-wrapper">
                    <cartcontrol :food="food"></cartcontrol>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <shopcart ref="shopcart" :select-foods="selectFoods" :delivery-price="seller.deliveryPrice"
                :min-price="seller.minPrice"></shopcart>
    </div>
    <food :food="selectedFood" ref="food"></food>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';
  import shopcart from '@/components/shopcart/shopcart';
  import cartcontrol from '@/components/cartcontrol/cartcontrol';
  import food from '@/components/food/food';

  const ERR_OK = 0;

  export default{
    //    对象语法，提供校验
    props: {
      seller: {
        type: Object
      }
    },
    //    创建对象
    data() {
      return {
        goods: [],
        listHeight: [],
        scrollY: 0,
        selectedFood: {}
      };
    },
    //  计算点击右侧高度位置
    computed: {
      currentIndex () {
        for (let i = 0; i < this.listHeight.length; i++) {
          //  判断当currentIndex在height1和height2之间的时候显示
          let height1 = this.listHeight[i];
          let height2 = this.listHeight[i + 1];
          //  最后一个区间没有height2
          if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
            return i;
          }
        }
        return 0;
      },
      selectFoods() {
        let foods = [];
        //  foods会传入购物车组件中，作为购物车的数据来源
        this.goods.forEach((good) => {
          good.foods.forEach((food) => {
            if (food.count) {
              foods.push(food);
            }
          });
        });
        return foods;
      }
    },
    //  创建AJAX对象，连接数据库
    created() {
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
      this.$http.get('/api/goods').then((response) => {
        response = response.body;
        if (response.errno === ERR_OK) {
          this.goods = response.data;
          //  this.$nextTick() => 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
          //  数据发生变化后，不能直接更新在dom上，需要在回调函数中刷新DOM,即异步加载DOM
          this.$nextTick(() => {
            this._initScroll();
            this._calculateHeight();
          });
        }
      });
    },
    methods: {
//       左侧列表点击事件
      selectMenu(index, event) {
//          解决PC端双击问题
        if (!event._constructed) {
          return;
        }
        let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
        let el = foodList[index];
        this.foodsScorll.scrollToElement(el, 300);
      },
      selectFood(food, event) {
        if (!event._constructed) {
          return;
        }
        this.selectedFood = food;
        this.$refs.food.show();
      },
//      滚动插件配置
      _initScroll() {
        this.menuScorll = new BScroll(this.$refs.menuWrapper, {
          // 点击事件为有效
          click: true
        });
        this.foodsScorll = new BScroll(this.$refs.foodsWrapper, {
          click: true,
          //  探针作用，实时监测滚动位置
          probeType: 3
        });
        //  设置监听滚动位置
        this.foodsScorll.on('scroll', (pos) => {
          //  scrollY接收变量
          this.scrollY = Math.abs(Math.round(pos.y));
        });
      },
//      获取右侧列表每个当前视口高度
      _calculateHeight () {
        let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
        let height = 0;
        //  把第一个高度送入数组
        this.listHeight.push(height);
        //  通过循环foodList下的dom结构，将每一个li的高度依次送入数组
        for (let i = 0; i < foodList.length; i++) {
          let item = foodList[i];
          height += item.clientHeight;
          this.listHeight.push(height);
        }
      }
    },
    components: {
      shopcart,
      cartcontrol,
      food
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import '../../common/stylus/mixin.styl'

  .goods
    display: flex
    position: absolute
    top: 174px
    width: 100%
    bottom: 46px
    overflow: hidden
    /*左菜单*/
    .menu-wrapper
      flex: 0 0 80px
      width: 80px
      background: #f3f5f7
      .menu-item
        display: table
        height: 54px
        width: 56px
        line-height: 14px
        padding: 0 12px
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          background: #fff
          font-weight: 700
          .text
            border-none()
        .icon
          display: inline-block
          vertical-align: top
          width: 12px
          height: 12px
          margin-right: 2px
          background-size: 12px 12px
          background-repeat: no-repeat
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3')
        .text
          display: table-cell
          width: 56px
          vertical-align: middle
          border-1px(rgba(7, 17, 27, 0.1))
          font-size: 12px
    /*右商品部分*/
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        border-1px(rgba(7, 17, 27, 0.1))
        &:last-child
          border-none()
          margin-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rbg(7, 17, 27)
          .desc, .extra
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)
          .desc
            margin-bottom: 8px
            line-height: 12px
          .extra
            .count
              margin-right: 12px
          .price
            font-weight: 700
            line-height: 24px
            .now
              margin-right: 8px
              font-size: 14px
              color: rgb(240, 20, 20)
            .old
              text-decoration: line-through
              font-size: 10px
              color: rgb(147, 153, 159)

          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px

  /**/
</style>
