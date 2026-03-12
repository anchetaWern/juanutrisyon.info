import './assets/main.css'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue';
import { routes } from './router'; // Import the router

export const createApp = ViteSSG(
  App,
  { routes }, // Your routes array
 
)