import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from '../pages/index.vue';
import AboutPage from '../pages/about.vue';
import ContactPage from '../pages/contact.vue';
import TermsPage from '../pages/terms.vue';
import PrivacyPage from '../pages/privacy.vue';
import GuidePage from '../pages/guide.vue';
import BlogPage from '../pages/blog.vue';
import HealthyEatingOnABudget from '../pages/blog/healthy-eating-on-a-budget.vue';
import CommonNutritionMistakesFilipinosMake from '../pages/blog/common-nutrition-mistakes-filipinos-make.vue';
import IsUsingAsinASin from '../pages/blog/is-using-asin-a-sin.vue';
import SanaAllMayLabel from '../pages/blog/sana-all-may-label.vue';
import NaturesHiddenPantry from '../pages/blog/natures-hidden-pantry.vue';
import WhyFilipinoFoodIsHighInSodium from '../pages/blog/why-filipino-food-is-high-in-sodium.vue';
import CarinderiaSurvivalGuideHealthyChoices from '../pages/blog/carinderia-survival-guide-healthy-choices.vue';
import HiddenSugarInCommonFilipinoFoods from '../pages/blog/hidden-sugar-in-common-filipino-foods.vue';
import BusogPeroKulang from '../pages/blog/busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished.vue';

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
  {
    path: '/blog',
    name: 'blog',
    component: BlogPage
  },
  {
    path: '/blog/healthy-eating-on-a-budget',
    name: 'blog-healthy-eating-on-a-budget',
    component: HealthyEatingOnABudget
  },
  {
    path: '/blog/common-nutrition-mistakes-filipinos-make',
    name: 'blog-common-nutrition-mistakes-filipinos-make',
    component: CommonNutritionMistakesFilipinosMake
  },
  {
    path: '/blog/is-using-asin-a-sin',
    name: 'blog-is-using-asin-a-sin',
    component: IsUsingAsinASin
  },
  {
    path: '/blog/natures-hidden-pantry',
    name: 'blog-natures-hidden-pantry',
    component: NaturesHiddenPantry
  },
  {
    path: '/blog/sana-all-may-label',
    name: 'blog-sana-all-may-label',
    component: SanaAllMayLabel
  },
  {
    path: '/blog/why-filipino-food-is-high-in-sodium',
    name: 'blog-why-filipino-food-is-high-in-sodium',
    component: WhyFilipinoFoodIsHighInSodium
  },
  {
    path: '/blog/carinderia-survival-guide-healthy-choices',
    name: 'blog-carinderia-survival-guide-healthy-choices',
    component: CarinderiaSurvivalGuideHealthyChoices
  },
  {
    path: '/blog/hidden-sugar-in-common-filipino-foods',
    name: 'blog-hidden-sugar-in-common-filipino-foods',
    component: HiddenSugarInCommonFilipinoFoods
  },
  {
    path: '/blog/busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished',
    name: 'blog-busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished',
    component: BusogPeroKulang
  },
 
];
