<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Your To-Do Lists</h1>
      <button @click="showAddListForm = true" class="btn btn-success">+ Add New List</button>
    </div>

    <!-- To-Do Lists -->
    <div class="row">
      <div v-for="list in lists" :key="list.id" class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ list.name }}</h5>
            <p class="card-text">{{ getTaskCount(list.id) }}</p>
            <div class="d-flex justify-content-between">
              <router-link :to="`/list/${list.id}`" class="btn btn-primary">View Tasks</router-link>
              <button @click="openDeleteModal(list.id)" class="btn btn-danger">Delete List</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Adding a New List -->
    <div v-if="showAddListForm" class="modal-backdrop fade show" @click="showAddListForm = false"></div>
    <div v-if="showAddListForm" class="modal fade show d-block" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New List</h5>
            <button @click="showAddListForm = false" type="button" class="close" aria-label="Close">
              <span aria-hidden="true" class="close-icon">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addList">
              <div class="form-group">
                <input v-focus v-model="newListName" class="form-control" placeholder="Enter list name" required />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showAddListForm = false">Cancel</button>
                <button type="submit" class="btn btn-primary">Create List</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Deleting a List -->
    <div v-if="showDeleteModal" class="modal-backdrop fade show" @click="showDeleteModal = false"></div>
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button @click="showDeleteModal = false" type="button" class="close" aria-label="Close">
              <span aria-hidden="true" class="close-icon">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this list? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteList(selectedListId)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

export default {
  data() {
    return {
      lists: [],
      newListName: '',
      showAddListForm: false,
      showDeleteModal: false,
      selectedListId: null,
      taskCounts: {}, // To store task counts for each list
    };
  },
  created() {
    this.fetchLists();
  },
  methods: {
    fetchLists() {
      const userId = auth.currentUser.uid;
      const listsRef = collection(db, 'users', userId, 'lists');

      onSnapshot(listsRef, (snapshot) => {
        this.lists = snapshot.docs
          .map(doc => {
            const listId = doc.id;
            // Initialize task counts for each list
            this.taskCounts[listId] = { total: 0, completed: 0 };

            // Set up a listener for this list's tasks
            const tasksRef = collection(db, 'users', userId, 'lists', listId, 'tasks');
            onSnapshot(tasksRef, (tasksSnapshot) => {
              this.taskCounts[listId].total = tasksSnapshot.docs.length;
              this.taskCounts[listId].completed = tasksSnapshot.docs.filter(taskDoc => taskDoc.data().completed).length;
            });

            return { id: listId, ...doc.data() };
          })
          .sort((a, b) => a.createdAt - b.createdAt); // Sort lists by creation date
      });
    },
    async addList() {
      try {
        const userId = auth.currentUser.uid;
        const listsRef = collection(db, 'users', userId, 'lists');
        this.showAddListForm = false;

        await addDoc(listsRef, { name: this.newListName, createdAt: new Date() });
        this.newListName = '';
      } catch (error) {
        console.error("Error adding list:", error);
      }
    },
    async deleteList(listId) {
      try {
        const userId = auth.currentUser.uid;
        const listRef = doc(db, 'users', userId, 'lists', listId);
        this.showDeleteModal = false;

        await deleteDoc(listRef);
        this.selectedListId = null;
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    },
    openDeleteModal(listId) {
      this.selectedListId = listId;
      this.showDeleteModal = true;
    },
    getTaskCount(listId) {
      const count = this.taskCounts[listId] || { total: 0, completed: 0 };
      return `${count.completed} / ${count.total} tasks completed`;
    },
  },
};
</script>

<style scoped>
.modal-backdrop {
  opacity: 0.5;
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

.close {
  font-size: 1.5rem;
  margin-left: auto;
  cursor: pointer;
  border: none;
  background: transparent;
}

.close-icon {
  font-weight: bold;
  color: #000;
}
</style>
