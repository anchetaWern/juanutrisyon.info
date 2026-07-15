<template>
    <div class="nav">
      <picture>
        <source srcset="/logo-dark.png" media="(prefers-color-scheme: dark)" />
        <img src="/logo.png" alt="Juan Nutrisyon" class="logo" width="280" height="73" />
      </picture>
      <nav>
        <RouterLink to="/">Home</RouterLink> |
        <RouterLink to="/about">About</RouterLink> |
        <RouterLink to="/data-methodology">Data & Methodology</RouterLink> |
        <RouterLink to="/research-partners">Research & Partners</RouterLink> |
        <RouterLink to="/guide">Guide</RouterLink> |
        <RouterLink to="/blog">Blog</RouterLink> |
        <RouterLink to="/media">Media</RouterLink>
      </nav>
    </div>
</template>

<style scoped>
.logo {
  max-width: 280px;
  width: 100%;
  height: auto;
}

nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  padding: 0 1rem;
  text-align: center;
}
</style>
