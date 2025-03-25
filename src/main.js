import 'bootstrap/dist/css/bootstrap.min.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.directive('focus', {
  mounted(elem) { 
    elem.focus();
  }
});

app.use(router);
app.mount('#app');
