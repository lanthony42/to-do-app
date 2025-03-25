<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ listName }}</h1>
      <router-link to="/" class="btn btn-secondary">Back to List Manager</router-link>
    </div>

    <!-- Task Input Form -->
    <form @submit.prevent="addTask" class="mb-4">
      <div class="input-group">
        <input
          v-model="taskText"
          class="form-control"
          placeholder="Enter new task"
          required
        />
        <button type="submit" class="btn btn-primary">Add Task</button>
      </div>
    </form>

    <!-- Task List with Drag and Drop -->
    <draggable v-model="tasks" @end="onDragEnd" item-key="id" group="tasks" class="list-group mt-3">
      <template #item="{ element }">
        <TaskItem
          :task="element"
          :listId="listId"
          @task-updated="fetchTasks"
          @task-deleted="fetchTasks"
        />
      </template>
    </draggable>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { collection, doc, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import draggable from 'vuedraggable';
import TaskItem from './TaskItem.vue';

export default {
  components: { draggable, TaskItem },
  props: { listId: String },
  data() {
    return {
      tasks: [],
      listName: '',
      taskText: '', // Initialize task text
    };
  },
  created() {
    this.fetchTasks();
    this.fetchListName(); // Fetch the name of the list
  },
  methods: {
    fetchTasks() {
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'lists', this.listId, 'tasks');
      onSnapshot(tasksRef, (snapshot) => {
        this.tasks = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.order - b.order); // Sort tasks by order
      });
    },
    fetchListName() {
      const listRef = doc(db, 'users', auth.currentUser.uid, 'lists', this.listId);
      onSnapshot(listRef, (doc) => {
        if (doc.exists()) {
          this.listName = doc.data().name;
        }
      });
    },
    async addTask() {
      if (this.taskText.trim()) {
        const tasksRef = collection(db, 'users', auth.currentUser.uid, 'lists', this.listId, 'tasks');
        const newTask = { text: this.taskText, completed: false, order: this.tasks.length };
        this.taskText = ''; // Clear the input field

        await addDoc(tasksRef, newTask);
      }
    },
    onDragEnd() {
      this.saveOrder();
    },
    async saveOrder() {
      const userId = auth.currentUser.uid;
      await Promise.all(
        this.tasks.map((task, index) => {
          const taskRef = doc(db, 'users', userId, 'lists', this.listId, 'tasks', task.id);
          return updateDoc(taskRef, { order: index });
        })
      );
    },
  },
};
</script>

<style scoped>
.completed {
  text-decoration: line-through;
  color: #6c757d;
}
</style>
