> 
前置条件：具备html、javascript、css的知识

## 银河智慧照明平台
1. 运行环境：node 14  
2. vue版本：2.6.12  
3. vue-cli版本：3.12.1  

## 基于vue-cli创建新项目
安装vue-cli:
```
npm install -g @vue/cli

```
新建vue2项目
```
vue create my-project
```
查看目录结构
```
tree -I "node_modules" -L 2
```
## 项目结构
```
├── README.md  
├── babel.config.js  // Babel 的配置文件，将 ES6+ 代码转换为向后兼容的 JavaScript 代码  
├── jsconfig.json  // 项目的配置信息，如编译器选项、文件包含/排除规则等  
├── package-lock.json  // 安装依赖时生成的锁定文件，确保在不同环境中安装相同版本的依赖
├── package.json  // 项目的元数据文件，包含项目名称、版本、依赖、脚本等信息
├── public  
│   ├── favicon.ico  
│   └── index.html  // 项目的入口 HTML 文件
├── src  
│   ├── App.vue // 项目的根组件
│   ├── assets   // 存放项目所需的图片、字体等静态资源
│   ├── components  // 存放可复用 vue 组件
│   ├── main.js  //  项目的入口文件，于创建 vue 实例和挂载根组件
│   ├── router // 存放与 vue-router 相关的路由配置文件和定义
│   ├── store // 存放 vuex 状态管理库的相关代码
│   ├── utils // 存放可复用工具函数或辅助方法
│   └── views // 存放页面、视图组件
└── vue.config.js   // vue-cli 项目的配置文件，可以覆盖或扩展默认的 webpack 配置
```
##  MVVM模式
MVVM 是Model-View-ViewModel 的缩写，它是一种基于前端开发的架构模式，其核心是提供对View 和 ViewModel 的双向数据绑定，这使得ViewModel 的状态改变可以自动传递给 View，即所谓的数据双向绑定。
其中 M 层 是vue中的data, V层是el绑定的HTML元素, VM是new实例的vue
##  vue实例
vue实例通常在main.js中创建，全局唯一
```javascript
new Vue({  // 创建一个vue实例
  router, // Vue Router 的实例
  store, // Vuex 的 store 实例
  render: h => h(App),  // 调用h函数（即createElement），并传入App作为实例的根组件
}).$mount('#app') // 将App组件挂载到id="app"的DOM元素
```
##  语法和指令
### 模板语法
1. **插值**：使用双大括号 {{ }} 来绑定数据到模板
```html
<div>{{ message }}</div>
```
2. **属性绑定**：使用 v-bind 指令来绑定一个属性，或者简写为 :
```html
<img v-bind:src="imageSrc">  
<!-- 或者简写为 -->  
<img :src="imageSrc">
```
3. **表达式**：在插值或某些指令中，你可以使用 JavaScript 表达式。
```html
<div>{{ number + 1 }}</div>  
<div>{{ isTrue ? 'Yes' : 'No' }}</div>
```
### 指令
1. **v-if、v-else-if、v-else**：条件渲染一个元素
```html
<div v-if="score >= 90">A</div>  
<div v-else-if="score >= 80">B</div>  
<div v-else>C</div>
```
2. **v-for**：基于源数据多次渲染一个元素或模板
```html
<div v-for="item in items">  
  {{ item.text }}  
</div>
```
3. **v-on**：监听 DOM 事件，并在触发时运行一些 JavaScript 代码。可以简写为 @
```html
<button v-on:click="handleClick">Click me</button>  
<!-- 或者简写为 -->  
<button @click="handleClick">Click me</button>
```
4. **v-model**：创建双向数据绑定。主要用于表单输入和应用状态之间的同步
```html
<input v-model="message">
```
## 单文件组件
单文件组件是一种组织组件的方式，它将组件的模板、JavaScript 代码和样式写在一个 .vue 文件中。  
单文件组件组件让开发更加模块化和可维护。
```html
<!-- MyComponent.vue -->  
<template>  
  <div class="my-component">  
    {{ message }}  
  </div>  
</template>  
<script>  
export default {  
  data() {  
    return {  
      message: 'Hello from MyComponent!'  
    }  
  }  
}  
</script>  
<style scoped>  
.my-component {  
  color: red;  
}  
</style>
```
##  props、data、computed、watch
1. **props**  
父组件传递给子组件的数据  
特点：
    * 单向数据流，父组件的更新可以在子组件监听到。
    * 不能在子组件修改props, 需要通过自定义事件修改。
2. **data()**  
用于在组件中定义响应式数据。data 函数返回一个对象，该对象包含了组件的初始状态。  
这些状态数据将作为组件的响应式依赖，当它们变化时，视图会自动更新。
3. **computed**  
计算属性，基于依赖（data、props）缓存结果，依赖值变化的时候，重新计算结果。可直接在模板中引用computed的属性。
特点：
    * 计算结果缓存，依赖项不变时不会触发。
    * 只读，不能当作函数使用
    * 依赖追踪，依赖变化时会更新结果
```javascript
new Vue({  
  el: '#app',  
  data: {  
    firstName: 'John',  
    lastName: 'Doe'  
  },  
  computed: {  
    fullName: function() {  
      // 这个函数将作为一个 getter，无论访问多少次，只要 firstName 和 lastName 不变，  
      // 它就只会计算一次。  
      return this.firstName + ' ' + this.lastName;  
    }  
  }  
});
```
4. **watch**  
监听组件的数据（props、data）变化，变化时触发函数。
```javascript
new Vue({  
  el: '#app',  
  data: {  
    user: {  
      name: 'John',  
      age: 30  
    }  
  },  
  watch: {  
    user: {  
      handler(newVal, oldVal) {  
        console.log('User object changed!');  
        // 在这里执行相关逻辑  
      },  
      deep: true // 深度观察 user 对象的变化
      immediate: true // 在组件创建时立即执行一次
    }  
  }  
});
```
##  组件生命周期
### 1. 创建阶段  
* beforeCreate：实例还未完成初始化，无法访问到data、computed、watch、methods等属性和方法。
* created：实例已经创建，data数据已经初始化，但是尚未挂载到Vue实例上。
### 2. 挂载阶段
* beforeMount：在挂载开始之前被调用，此时模板已经编译完成，但尚未渲染成html。
* mounted：在实例挂载到页面之后调用。此时真实DOM已经渲染完成，可以进行DOM操作
### 3. 更新阶段
* beforeUpdate：数据更新时调用，发生在虚拟DOM打补丁之前。可以在这个钩子中访问更新前的DOM元素，适合在更新之前访问现有的DOM，比如手动移除已添加的事件监听器。
* updated：由于数据更改导致的虚拟DOM重新渲染和打补丁，在这之后会调用该钩子。当这个钩子被调用时，组件DOM已经更新，所以你现在可以执行依赖于DOM的操作。应该避免在此期间更改状态，因为这可能会导致更新无限循环。
### 4. 销毁阶段
* beforeDestroy：实例销毁之前调用。在这一步，实例仍然完全可用。
* destroyed：Vue实例销毁后调用。调用后，Vue实例指示的所有东西都会解绑，所有的事件监听器都会被移除，所有的子实例也会被销毁。

## 组件间通信
1. props和$emit  
常用的父子组件间通信方式
2. vuex  
全局状态管理
3. event bus  
使用 Vue 的实例作为事件中心，允许组件间通信，尤其是在非父子组件间  
4. provide & inject  
祖先组件向其所有子孙组件提供一个依赖，不论组件层次有多深，该依赖都可以注入进来

## vuex使用
```javascript
import Vue from 'vue';  
import Vuex from 'vuex';  
  
Vue.use(Vuex);  
  
const store = new Vuex.Store({  
  state: {   // 状态
    count: 0 
  },  
  mutations: {  // 直接修改状态
    increment(state) {  
      state.count++;  
    }  
  },  
  actions: {  
    increment({ commit }) {  // 
      commit('increment');  
    }  
  },  
  getters: {  // 对 state 中的数据进行计算或格式化
    doubleCount(state) {  
      return state.count * 2;  
    }  
  }  
});  
  
new Vue({  
  el: '#app',  
  store,  
  render: h => h(App)  
});
```
1. 访问状态
```javascript
// 1. 直接访问
this.$store.state.count
// 2. mapstate辅助映射到计算属性
import { mapState } from 'vuex';  
export default {  
  computed: mapState(['count'])  
};
```
2. 同步修改状态
```javascript
// 1. 直接提交mutation
this.$store.commit('increment')
// 2. mapMutations辅助映射到methods
import { mapMutations } from 'vuex';  
export default {  
  methods: {  
    ...mapMutations(['increment'])  
  }  
};
```
3. 异步修改状态
```javascript
// 1. 直接提交action
this.$store.dispatch('increment')
// 2. mapActions辅助映射到methods
import { mapActions } from 'vuex';  
export default {  
  methods: {  
    ...mapActions(['increment'])  
  }  
};
```
4. 使用Getter  
Getter 用于从 state 中派生出一些状态，例如对 state 中的数据进行计算或格式化
```javascript
// 1. 直接访问
this.$store.getters.doubleCount
// 2. mapGetters 辅助函数将 getter 映射到计算属性
import { mapGetters } from 'vuex';  
export default {  
  computed: {  
    ...mapGetters(['doubleCount'])  
  }  
};
```

## vue-router使用
1. 引入并配置
```javascript
// 告诉 Vue 使用 VueRouter  
Vue.use(VueRouter); 
// 路由配置
const routes = [  
  { path: '/', component: Home },  
  { path: '/about', component: About }  
];  
  
const router = new VueRouter({  
  routes // 相当于 routes: routes  
});  
  
new Vue({  
  router,  
  render: h => h(App)  
}).$mount('#app');
```
2. 组件中使用路由  
```javascript
// 声明式导航:在模板中使用 `<router-link>` 组件来创建导航链接
<template>  
  <div id="app">  
    <router-link to="/">Home</router-link>  
    <router-link to="/about">About</router-link>  
    <router-view></router-view>  
  </div>  
</template>
// 编程式导航
this.$router.push({ path: 'search', query: { q: 'vue' } });
this.$router.replace({ path: 'search', query: { q: 'vue' } });
this.$router.pop();
```
3. 嵌套路由
```javascript
const routes = [  
  {  
    path: '/user/:id',  
    component: User,  
    children: [  
      {  
        // 当 /user/:id/profile 匹配成功，  
        // UserProfile 会被渲染在 User 的 <router-view> 中  
        path: 'profile',  
        component: UserProfile  
      },  
      {  
        // 当 /user/:id/edit 匹配成功，  
        // UserEdit 会被渲染在 User 的 <router-view> 中  
        path: 'edit',  
        component: UserEdit  
      }  
    ]  
  }  
];
```
4. 路由守卫
* 全局守卫
```javascript
const router = new VueRouter({ ... });  
  
// 全局前置守卫  
router.beforeEach((to, from, next) => {  
  // ...  
  // 一定要调用 next() 来 resolve 这个钩子  
  // 否则，导航会一直卡住  
  next();  
});  
  
// 全局解析守卫  
router.beforeResolve((to, from, next) => {  
  // ...  
  next();  
});  
  
// 全局后置钩子  
router.afterEach((to, from) => {  
  // 这里的逻辑会在导航完成后执行  
  // 不接受 next() 函数，因此没有办法改变导航本身  
});
```
* 路由独享的守卫
```javascript
const routes = [  
  {  
    path: '/foo',  
    component: Foo,  
    beforeEnter: (to, from, next) => {  
      // ...  
      next();  
    }  
  }  
];
```
* 组件内守卫
```javascript
export default {  
  data() {  
    return {  
      loading: false  
    }  
  },  
  beforeRouteEnter(to, from, next) {  
    // 在渲染该组件的对应路由被 confirm 前调用  
    // 不！能！获取组件实例 `this`  
    // 因为当守卫执行时，组件实例还没被创建  
    next(vm => {  
      // 通过 `vm` 访问组件实例  
      vm.loading = true  
    })  
  },  
  beforeRouteUpdate(to, from, next) {  
    // 在当前路由改变，但是该组件被复用时调用  
    // 举例来说，对于带有动态参数的路径 `/foo/:id`，在 `/foo/1` 和 `/foo/2` 之间跳转的时候，  
    // 由于会渲染同样的 Foo 组件，因此这个钩子会被调用，可以用这个钩子来根据当前路由参数的变化来更新组件  
    this.loading = true  
    next();  
  },  
  beforeRouteLeave(to, from, next) {  
    // 导航离开该组件的对应路由时调用  
    // 可以访问组件实例 `this`  
    const answer = window.confirm('你确定要离开吗？')  
    if (answer) {  
      next()  
    } else {  
      next(false) // 取消导航  
    }  
  }  
}
```