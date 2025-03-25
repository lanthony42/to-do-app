<template>
  <li class="list-group-item d-flex align-items-center">
    <div class="form-check flex-grow-1" @click="editTask"> <!-- Make the whole area clickable -->
      <input type="checkbox" class="form-check-input" v-model="isCompleted" @change="toggleCompletion" @click.stop />
      <span v-if="!isEditing" :class="{ completed: isCompleted }" class="form-check-label">{{ task.text }}</span>
      <input v-else v-focus type="text" v-model="editText" @blur="saveTask" @keyup.enter="saveTask" class="form-control flex-grow-1" />
    </div>
    <button @click="deleteTask" class="btn btn-danger btn-sm">Delete</button>
  </li>
</template>

<script>
import { db, auth } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  props: { task: Object, listId: String },
  data() {
    return { 
      isCompleted: this.task.completed,
      isEditing: false,
      editText: this.task.text, // Store the editable text
    };
  },
  watch: {
    'task.completed'(newVal) {
      this.isCompleted = newVal;
    },
    'task.text'(newVal) {
      this.editText = newVal;
    }
  },
  methods: {
    async toggleCompletion() {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'lists', this.listId, 'tasks', this.task.id);
      await updateDoc(taskRef, { completed: this.isCompleted });
      this.$emit('task-updated'); // Notify parent to refresh tasks
    },
    async deleteTask() {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'lists', this.listId, 'tasks', this.task.id);
      await deleteDoc(taskRef);
      this.$emit('task-deleted'); // Notify parent to refresh tasks
    },
    editTask() {
      this.isEditing = true; // Switch to editing mode
    },
    async saveTask() {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'lists', this.listId, 'tasks', this.task.id);
      await updateDoc(taskRef, { text: this.editText }); // Update task text
      this.isEditing = false; // Switch back to view mode
      this.$emit('task-updated'); // Notify parent to refresh tasks
    },
  },
};
</script>

<style scoped>
.completed {
  text-decoration: line-through;
  color: #6c757d;
}

.form-check {
  cursor: pointer;
}

input[type="text"] {
  width: 100%;
  border: none;
  outline: none;
}
</style>
