// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

// 插件引用
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
// 页面引用
import App from '@/App';
import goods from '@/components/goods/goods';
import ratings from '@/components/ratings/ratings';
import seller from '@/components/seller/seller';

import '@/common/stylus/index.styl';

// 使用插件
Vue.use(VueRouter);
Vue.use(VueResource);

// 定义路由组件
// const goods = require('@/components/goods/goods');

// 定义路由
const routes = [
  {path: '/goods', component: goods},
  {path: '/ratings', component: ratings},
  {path: '/seller', component: seller}
];

const router = new VueRouter({
  routes,
  linkActiveClass: 'active'
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {App},
  template: '<App/>',
  router
});

// router.push('/goods');
