<script setup>
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>View Nutrients</template>

    Search for foods and explore their nutrient content.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>Create Recipes</template>

    Build recipes and see the combined nutrient breakdown of all your ingredients.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>Analyze your diet</template>

    Track your daily intake and discover if you're meeting your nutritional needs, over-consuming, or falling short.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Collaborate</template>

    Whether you are a dietitian, nutritionist, food technologist, chef/baker/food entrepreneur, policymaker, research specialist, food blogger/vlogger, marketer, or a programmer/developer we need you.
    Please<a href="mailto:ancheta.wern@gmail.com" target="_blank" rel="noopener">say hi.</a>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Contribute</template>

    Juan Nutrisyon is a community-driven project. We rely on contributions from the community to add new foods to the database.
    Be sure to visit <a href="https://contribute.juanutrisyon.info" target="_blank">contribute.juanutrisyon.info</a> if you're interested in contributing.
  </WelcomeItem>
</template>
