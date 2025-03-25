import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase';

import ListManager from '../components/ListManager.vue';
import TaskList from '../components/TaskList.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';

const routes = [
  { path: '/', name: 'Home', component: ListManager, meta: { requiresAuth: true } },
  { path: '/list/:listId', name: 'TaskList', component: TaskList, meta: { requiresAuth: true }, props: true },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication
router.beforeResolve(async (to, from, next) => {
  // Wait for state to be ready
  await auth.authStateReady();

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = !!auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/login'); // Redirect to login if authentication is required
  }
  else if (!requiresAuth && isAuthenticated) {
    next('/'); // Redirect to home if authenticated
  }
  else {
    next(); // Proceed to the requested route
  }
});

export default router;
