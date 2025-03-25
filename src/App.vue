<template>
  <div id="app">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand ms-3" href="#">To-Do App</a>
      <div v-if="user" class="ms-auto d-flex align-items-center">
        <p class="mb-0 me-3">Welcome, {{ user.email }}</p>
        <button @click="logout" class="btn btn-outline-danger btn-sm me-3">Logout</button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mt-4">
      <router-view />
    </div>
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

export default {
  data() {
    return {
      user: null,
    };
  },
  created() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
  },
  methods: {
    async logout() {
      try {
        await signOut(auth);
        this.$router.push('/login');
      } catch (error) {
        console.error("Logout failed:", error.message);
      }
    },
  },
};
</script>
