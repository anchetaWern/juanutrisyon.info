<script setup>
import LinkWrapper from './LinkWrapper.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
import GlobeIcon from './icons/GlobeIcon.vue'
</script>

<template>
  <LinkWrapper>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>View Nutrients</template>

    <a href="https://app.juanutrisyon.info" target="_blank">Search for foods</a> and explore their nutrient content.
  </LinkWrapper>

  <LinkWrapper>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>Create Recipes</template>

    <a href="https://app.juanutrisyon.info/recipe" target="_blank">Build recipes</a> and see the combined nutrient breakdown of all your ingredients.
  </LinkWrapper>

  <LinkWrapper>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>Analyze your diet</template>

    <a href="https://app.juanutrisyon.info/diary" target="_blank">Track</a> your daily intake and discover if you're meeting your nutritional needs, over-consuming, or falling short.
  </LinkWrapper>

  <LinkWrapper>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Collaborate</template>

    Juan Nutrisyon is open to collaboration with nutrition professionals, researchers, educators, public-health groups, food-data partners, and organizations working on Filipino food literacy.
    <RouterLink to="/research-partners">View collaboration areas</RouterLink>.
  </LinkWrapper>

  <LinkWrapper>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Contribute</template>

    Community members can submit information about foods or products that may be missing from Juan Nutrisyon. Submissions are reviewed before they are incorporated into the trusted food database.
    Visit <a href="https://contribute.juanutrisyon.info" target="_blank" rel="noopener">contribute.juanutrisyon.info</a> to contribute.
  </LinkWrapper>

  <LinkWrapper>
    <template #icon>
      <GlobeIcon />
    </template>
    <template #heading>Follow Us</template>

    We're constantly putting out new features. We also post content all about nutrition and healthy living. So if you want to stay in the loop, be sure to follow us on <a href="https://www.facebook.com/juanutrisyon/" target="_blank">Facebook.</a>
  </LinkWrapper>
</template>
