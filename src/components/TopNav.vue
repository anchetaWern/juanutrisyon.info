<template>
    <div class="nav">
      <picture>
        <source srcset="/logo-dark.png" media="(prefers-color-scheme: dark)" />
        <img src="/logo.png" alt="Juan Nutrisyon" class="logo" width="280" height="73" />
      </picture>
      <nav>
        <RouterLink to="/">Home</RouterLink> |
        <RouterLink to="/about">About</RouterLink> |
        <RouterLink to="/terms">Terms</RouterLink> |
        <RouterLink to="/privacy">Privacy Policy</RouterLink> |
        <RouterLink to="/guide">Guide</RouterLink> |
        <RouterLink to="/blog">Blog</RouterLink> |
        <RouterLink to="/contact">Contact</RouterLink>
      </nav>
    </div>
</template>

<style scoped>
.logo {
  max-width: 280px;
  width: 100%;
  height: auto;
}
</style>
