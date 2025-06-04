import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Importa createPinia
import App from './App.vue';
import router from './router'; // Importa tu instancia de router
import './style.css'; // Tus estilos globales

const app = createApp(App);

app.use(createPinia()); // Usa Pinia
app.use(router);        // Usa Vue Router

app.mount('#app');