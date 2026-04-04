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

    Whether you are a dietitian, nutritionist, food technologist, chef/baker/food entrepreneur/carinderia, LGU/policy maker, research specialist, food blogger/vlogger, marketer, or a programmer/developer we need you.
    Please<a href="mailto:juanutrisyon@gmail.com" target="_blank" rel="noopener">say hi.</a>
  </LinkWrapper>

  <LinkWrapper>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Contribute</template>

    Juan Nutrisyon is a community-driven project. We rely on contributions from the community to add new foods to the database.
    Be sure to visit <a href="https://contribute.juanutrisyon.info" target="_blank">contribute.juanutrisyon.info</a> if you're interested in contributing.
  </LinkWrapper>

  <LinkWrapper>
    <template #icon>
      <GlobeIcon />
    </template>
    <template #heading>Follow Us</template>

    We're constantly putting out new features. We also post content all about nutrition and healthy living. So if you want to stay in the loop, be sure to follow us on <a href="https://www.facebook.com/juanutrisyon/" target="_blank">Facebook.</a>
  </LinkWrapper>
</template>
