const IndexPage = () => import('../pages/index.vue');
const AboutPage = () => import('../pages/about.vue');
const ContactPage = () => import('../pages/contact.vue');
const TermsPage = () => import('../pages/terms.vue');
const PrivacyPage = () => import('../pages/privacy.vue');
const GuidePage = () => import('../pages/guide.vue');
const BlogPage = () => import('../pages/blog.vue');
const HealthyEatingOnABudget = () => import('../pages/blog/healthy-eating-on-a-budget.vue');
const CommonNutritionMistakesFilipinosMake = () => import('../pages/blog/common-nutrition-mistakes-filipinos-make.vue');
const IsUsingAsinASin = () => import('../pages/blog/is-using-asin-a-sin.vue');
const SanaAllMayLabel = () => import('../pages/blog/sana-all-may-label.vue');
const NaturesHiddenPantry = () => import('../pages/blog/natures-hidden-pantry.vue');
const WhyFilipinoFoodIsHighInSodium = () => import('../pages/blog/why-filipino-food-is-high-in-sodium.vue');
const CarinderiaSurvivalGuideHealthyChoices = () => import('../pages/blog/carinderia-survival-guide-healthy-choices.vue');
const HiddenSugarInCommonFilipinoFoods = () => import('../pages/blog/hidden-sugar-in-common-filipino-foods.vue');
const BusogPeroKulang = () => import('../pages/blog/busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished.vue');

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
