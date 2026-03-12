import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from '../pages/index.vue';
import AboutPage from '../pages/about.vue';
import ContactPage from '../pages/contact.vue';
import TermsPage from '../pages/terms.vue';
import PrivacyPage from '../pages/privacy.vue';
import GuidePage from '../pages/guide.vue';

export const routes = [
  {
    path: '/',
    name: 'home',
    component: IndexPage
  },
   {
    path: '/about',
    name: 'about',
    component: AboutPage
  },
   {
    path: '/contact',
    name: 'contact',
    component: ContactPage
  },
     {
    path: '/terms',
    name: 'terms',
    component: TermsPage
  },
   {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPage
  },
     {
    path: '/guide',
    name: 'guide',
    component: GuidePage
  },
 
];

