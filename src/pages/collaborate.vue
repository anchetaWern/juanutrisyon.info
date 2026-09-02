<template>
  <main class="collaboration-page">
    <header class="collaboration-hero">
      <p class="eyebrow">Collaborate with Juan Nutrisyon</p>
      <h1>Help build stronger Filipino food and nutrition tools</h1>
      <div class="hero-copy">
        <p>
          Juan Nutrisyon is an independent project open to thoughtful collaboration with nutrition
          professionals, researchers, educators, organizations, food-data providers, and others
          working to improve how Filipinos understand and use nutrition information.
        </p>
        <p>
          The most useful collaborations bring complementary expertise to a specific problem—whether
          that involves nutrition methodology, Filipino food data, recipes, education, research, or
          professional tools.
        </p>
      </div>
      <div class="hero-actions">
        <a class="primary-button" href="#collaboration-areas">Explore ways to collaborate</a>
        <a
          class="secondary-button"
          :href="siteConfig.appUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Explore the live app (opens in a new tab)"
        >
          Explore the live app
        </a>
      </div>
    </header>

    <section class="page-section audience-section">
      <p class="eyebrow">Who this is for</p>
      <h2>Different perspectives can strengthen the project</h2>
      <p class="section-intro">
        Juan Nutrisyon is especially interested in focused conversations with people and
        organizations whose work overlaps with Filipino food, nutrition information, food literacy,
        public health, or nutrition-service delivery.
      </p>
      <ul class="compact-list audience-list">
        <li v-for="audience in audiences" :key="audience">{{ audience }}</li>
      </ul>
    </section>

    <section id="collaboration-areas" class="page-section anchor-section">
      <p class="eyebrow">Collaboration areas</p>
      <h2>Find the part of Juan Nutrisyon that overlaps with your work</h2>
      <div class="area-grid">
        <article v-for="area in collaborationAreas" :key="area.title" class="area-card">
          <h3>{{ area.title }}</h3>
          <p>{{ area.description }}</p>
          <RouterLink v-if="area.path" class="card-action" :to="area.path">
            {{ area.action }}
          </RouterLink>
          <a v-else class="card-action" :href="area.mailto">{{ area.action }}</a>
        </article>
      </div>
    </section>

    <section class="page-section">
      <p class="eyebrow">What already exists</p>
      <h2>More than an idea waiting to be built</h2>
      <p class="section-intro">
        Juan Nutrisyon can bring existing technical infrastructure and hands-on software development
        to a suitable collaboration. Depending on the project, that may include:
      </p>
      <ul class="compact-list contribution-list">
        <li v-for="contribution in contributions" :key="contribution">{{ contribution }}</li>
      </ul>
      <p class="disclosure">
        Existing components vary in maturity and should be evaluated against the requirements of a
        proposed collaboration. Juan Nutrisyon does not represent every component as scientifically
        validated or suitable for clinical use.
      </p>
    </section>

    <section class="page-section research-callout">
      <p class="eyebrow">For researchers and universities</p>
      <h2>Explore Juan Nutrisyon as research infrastructure</h2>
      <p>
        Researchers may be able to use or adapt the platform for studies involving Filipino food
        data, dietary research, nutrition-information presentation, food literacy, digital
        interventions, consumer behavior, or professional nutrition workflows.
      </p>
      <p>
        The dedicated research page explains the existing infrastructure, possible study directions,
        complementary roles, technically feasible adaptations, and Juan Nutrisyon's current
        validation status.
      </p>
      <RouterLink class="primary-button" to="/research">Explore research collaboration</RouterLink>
    </section>

    <section class="page-section collaboration-cta">
      <h2>See a specific way we could work together?</h2>
      <p>
        Send a short note about your area of work, the part of Juan Nutrisyon that interests you, and
        what you think a useful collaboration could accomplish. A finished proposal is not required
        to begin a conversation.
      </p>
      <a class="primary-button" :href="generalCollaborationMailto">Discuss a collaboration</a>
      <p class="supporting-copy">
        If you are mainly interested in donating, sharing the project, or making a community
        contribution, visit Juan Nutrisyon's
        <a
          :href="siteConfig.contributionUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contribution page (opens in a new tab)"
        >contribution page</a>
        instead.
      </p>
    </section>
  </main>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'
import { createMailto, siteConfig } from '@/config/site'

const collaborationBody = `Hello Wern,

I would like to explore a possible collaboration with Juan Nutrisyon.

My area of work:

Part of Juan Nutrisyon that interests me:

What I think we could work on:

Thank you.`

const generalCollaborationMailto = createMailto({
  subject: 'Collaboration inquiry — Juan Nutrisyon',
  body: collaborationBody
})

const audiences = [
  'Registered Nutritionist-Dietitians and other qualified nutrition professionals',
  'Nutrition researchers, faculty members, and universities',
  'Public-health organizations, government nutrition agencies, and LGUs',
  'Food-composition database organizations and food-data providers',
  'Filipino recipe developers and food educators',
  'Food manufacturers able to provide reliable product or recipe information',
  'Digital-health, design, and technical collaborators with a relevant contribution'
]

const collaborationAreas = [
  {
    title: 'Nutrition methodology',
    description:
      'Help review or improve nutrient calculations, assumptions, terminology, educational interpretation, and professional-use workflows.',
    action: 'Discuss this area'
  },
  {
    title: 'Academic research',
    description:
      "Use or adapt Juan Nutrisyon's Filipino food-data and software infrastructure for dietary research, digital nutrition interventions, usability studies, or other investigator-led projects.",
    action: 'Explore research collaboration',
    path: '/research'
  },
  {
    title: 'Food-composition data',
    description:
      'Improve data quality, food matching, source documentation, attribution, household portions, and interoperability across Filipino and supplemental food-data sources.',
    action: 'Discuss this area'
  },
  {
    title: 'Filipino recipes',
    description:
      'Develop clearer ingredient, edible-portion, cooked-yield, serving, and recipe-analysis conventions for Filipino mixed dishes.',
    action: 'Discuss this area'
  },
  {
    title: 'Nutrition education',
    description:
      'Create or evaluate accessible food-literacy content and interactive learning experiences while keeping nutrition claims scientifically careful.',
    action: 'Discuss this area'
  },
  {
    title: 'Professional RND tools',
    description:
      'Explore ways to reduce repetitive calculation and meal-planning work while preserving professional judgment, assessment, and client care.',
    action: 'Discuss this area'
  }
].map((area) => ({
  ...area,
  mailto: area.path
    ? undefined
    : createMailto({
        subject: `Collaboration inquiry — ${area.title} — Juan Nutrisyon`,
        body: collaborationBody
      })
}))

const contributions = [
  'A working platform focused on Filipino food and nutrition information',
  'Food-database infrastructure and source-aware data workflows',
  'Food search, comparison, dietary-recording, and recipe-related tools',
  'An early professional meal-planning prototype for RNDs',
  'Product design, software engineering, deployment, and maintenance',
  'Analytics, event tracking, and structured data export',
  'Public-facing nutrition-education experience'
]

usePageSeo({
  title: 'Collaborate with Juan Nutrisyon',
  description:
    'Explore ways to collaborate with Juan Nutrisyon on Filipino food data, nutrition methodology, recipes, education, academic research, and professional tools.',
  path: '/collaborate'
})
</script>

<style scoped>
.collaboration-page {
  width: min(100% - 40px, 980px);
  margin: 0 auto;
  padding: var(--space-12) 0;
}

.collaboration-hero {
  max-width: 840px;
  padding: var(--space-6) 0 var(--space-8);
}

.collaboration-hero h1 {
  max-width: 760px;
  margin-top: var(--space-3);
}

.hero-copy,
.section-intro,
.research-callout p,
.collaboration-cta p {
  max-width: var(--reading-max);
}

.hero-copy {
  margin-top: var(--space-5);
}

.hero-copy p,
.research-callout p,
.collaboration-cta p {
  color: var(--text-secondary);
}

.hero-copy p + p,
.research-callout p + p {
  margin-top: var(--space-4);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.page-section {
  margin-top: var(--space-12);
  padding-top: var(--space-12);
  border-top: 1px solid var(--border-subtle);
}

.page-section h2 {
  max-width: 720px;
  margin-top: var(--space-2);
}

.section-intro {
  margin-top: var(--space-3);
  color: var(--text-secondary);
}

.anchor-section {
  scroll-margin-top: 112px;
}

.compact-list {
  margin-top: var(--space-5);
  padding-left: 1.25rem;
}

.compact-list li + li {
  margin-top: var(--space-2);
}

.audience-list,
.contribution-list {
  columns: 2;
  column-gap: var(--space-10);
}

.audience-list li,
.contribution-list li {
  break-inside: avoid;
  padding-right: var(--space-3);
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.area-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: var(--space-5);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
}

.area-card p {
  flex: 1;
  margin-top: var(--space-2);
  color: var(--text-secondary);
}

.card-action {
  align-self: flex-start;
  margin-top: var(--space-4);
  font-weight: 800;
}

.disclosure {
  max-width: var(--reading-max);
  margin-top: var(--space-6);
  padding: var(--space-4);
  border-left: 4px solid var(--brand-500);
  background: var(--brand-soft);
}

.research-callout,
.collaboration-cta {
  padding: var(--space-8);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

.research-callout .primary-button,
.collaboration-cta .primary-button {
  margin-top: var(--space-5);
}

.collaboration-cta {
  border-color: color-mix(in srgb, var(--brand-500) 45%, var(--border-default));
  background: var(--brand-soft);
}

.collaboration-cta .supporting-copy {
  margin-top: var(--space-5);
  font-size: 0.95rem;
}

@media (max-width: 720px) {
  .collaboration-page {
    width: min(100% - 32px, 980px);
    padding: var(--space-10) 0;
  }

  .collaboration-hero {
    padding-top: var(--space-3);
  }

  .page-section {
    margin-top: var(--space-10);
    padding-top: var(--space-10);
  }

  .anchor-section {
    scroll-margin-top: 220px;
  }

  .audience-list,
  .contribution-list {
    columns: 1;
  }

  .area-grid {
    grid-template-columns: 1fr;
  }

  .research-callout,
  .collaboration-cta {
    padding: var(--space-5);
  }
}

@media (max-width: 480px) {
  .hero-actions,
  .hero-actions a,
  .research-callout .primary-button,
  .collaboration-cta .primary-button {
    width: 100%;
  }
}
</style>
