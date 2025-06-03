import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      error.value = null;
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      user.value = firebaseUser;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      error.value = null;
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      user.value = firebaseUser;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  // Escuchar cambios en el estado de autenticación
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    loading.value = false;
  });

  return {
    user,
    loading,
    error,
    login,
    register,
    logout
  };
});