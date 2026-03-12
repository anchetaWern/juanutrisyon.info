<template>
  <!-- Added a class 'container' to the parent div -->
  <div class="container">

    <TopNav />

    <div class="wrapper">
      <RouterView />
    </div>
    
  </div>
</template>

<script setup>
import TopNav from "@/components/TopNav.vue";
</script>

<style>
/* 1. The Parent Container */
.container {
  display: flex;
  flex-direction: column; /* Stack nav and wrapper vertically */
  align-items: center;    /* Center them horizontally */
  width: 100%;
}

/* 2. The Nav Section */
.nav {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;    /* Centers the logo and the nav links */
  gap: 10px;              /* Adds space between logo and links */
}

.nav a {
  color: #333;
}

/* 3. The Content Wrapper */
.wrapper {
  width: 100%;
  max-width: 1200px;      /* Optional: Prevents content from getting too wide */
}
</style>