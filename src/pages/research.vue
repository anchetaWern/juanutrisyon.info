<template>
  <main class="research-page">
    <header class="research-hero">
      <p class="eyebrow">Research collaboration</p>
      <h1>Build nutrition research on existing Filipino food-data and software infrastructure</h1>
      <div class="hero-copy">
        <p>
          Juan Nutrisyon is a working Filipino nutrition-information platform. We are exploring
          collaborations with researchers who may be able to use or adapt its food data, nutrition
          interfaces, and software infrastructure for suitable academic studies.
        </p>
        <p>
          You bring the scientific question and research methodology. We can contribute the technical
          implementation needed to turn it into a usable digital study, intervention, or research
          tool.
        </p>
      </div>
      <div class="hero-actions">
        <a class="primary-button" :href="researchMailto">Discuss a research idea</a>
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

    <section class="research-section">
      <p class="eyebrow">A platform that already exists</p>
      <h2>Start with working infrastructure, not a blank development project</h2>
      <p class="section-intro">
        A researcher planning a digital nutrition study may otherwise need to commission a website,
        implement nutrition data, build participant interfaces, add tracking, deploy the system, and
        maintain it throughout the study. Juan Nutrisyon may provide part of that technical
        foundation already.
      </p>
      <div class="infrastructure-grid">
        <article v-for="item in infrastructure" :key="item.title" class="research-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
      <p class="disclosure">
        Availability, completeness, and methodological suitability vary by component. The
        requirements of a proposed study would be reviewed before any component is represented as
        suitable for research use.
      </p>
    </section>

    <section class="research-section">
      <p class="eyebrow">Where the platform may fit</p>
      <h2>Three possible ways to collaborate</h2>
      <div class="pathway-grid">
        <article v-for="pathway in pathways" :key="pathway.title" class="pathway-card">
          <h3>{{ pathway.title }}</h3>
          <p>{{ pathway.description }}</p>
          <h4>Potential areas</h4>
          <ul>
            <li v-for="area in pathway.areas" :key="area">{{ area }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="research-section">
      <p class="eyebrow">Starting points</p>
      <h2>Questions the existing platform could help investigate</h2>
      <p class="section-intro">
        These are examples rather than fixed protocols. The research question, measures, methods,
        and analysis would remain under the research team's direction.
      </p>
      <ol class="question-list">
        <li v-for="question in researchQuestions" :key="question">{{ question }}</li>
      </ol>
      <p class="closing-copy">
        We are also open to a researcher's existing question where Juan Nutrisyon can remove a
        meaningful technical barrier.
      </p>
    </section>

    <section class="research-section">
      <p class="eyebrow">Complementary roles</p>
      <h2>Combine research leadership with technical implementation</h2>
      <div class="roles-grid">
        <article class="role-panel">
          <h3>Researcher or institution</h3>
          <ul>
            <li v-for="role in researcherRoles" :key="role">{{ role }}</li>
          </ul>
        </article>
        <article class="role-panel">
          <h3>Juan Nutrisyon</h3>
          <ul>
            <li v-for="role in juanNutrisyonRoles" :key="role">{{ role }}</li>
          </ul>
        </article>
      </div>
      <p class="terms-note">
        The exact responsibilities, data access, authorship, ownership, costs, maintenance period,
        and publication or productization rights would need to be agreed for each collaboration. This
        page does not establish those terms.
      </p>
    </section>

    <section class="research-section">
      <p class="eyebrow">Adaptable for a protocol</p>
      <h2>Study features can be scoped around the research question</h2>
      <p class="section-intro">
        These features are not all available as off-the-shelf modules today. They represent
        technically feasible adaptations that can be assessed and built when a suitable study
        requires them.
      </p>
      <ul class="adaptation-list">
        <li v-for="adaptation in adaptations" :key="adaptation">{{ adaptation }}</li>
      </ul>
    </section>

    <section class="research-section status-section">
      <p class="eyebrow">Current status</p>
      <h2>What has—and has not—been validated</h2>
      <div class="status-panel">
        <p>
          Juan Nutrisyon is an existing nutrition-information and software platform, but it is not
          currently presented as a validated dietary-assessment instrument, diagnostic tool, or
          clinical decision-support system.
        </p>
        <p>
          A collaboration may use existing components as technical infrastructure, adapt them to an
          investigator-defined method, or study and validate a specific component where appropriate.
          The evidence required depends on the role the platform plays in the proposed study.
        </p>
        <p>
          For example, an experimental nutrition-information interface may require content review,
          software testing, and pilot testing. A component intended to estimate actual dietary intake
          would require stronger scientific validation for that measurement claim. Nutrient
          calculations and data transformations should be documented and computationally verified
          for the protocol in which they are used.
        </p>
        <p>
          Any study involving human participants would remain subject to the collaborating
          institution's methodology, ethics-review, privacy, consent, and research-governance
          requirements.
        </p>
      </div>
      <div class="table-wrap status-table-wrap">
        <table>
          <caption>Current implications for possible research roles</caption>
          <thead>
            <tr>
              <th scope="col">Possible role of Juan Nutrisyon</th>
              <th scope="col">Current implication</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in validationStatus" :key="row.role">
              <th scope="row">{{ row.role }}</th>
              <td>{{ row.implication }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="research-section about-section">
      <p class="eyebrow">About the project</p>
      <h2>Built around practical nutrition information for Filipino foods</h2>
      <div class="reading-copy">
        <p>
          Juan Nutrisyon is an independent nutrition-information project started in 2024. Its goal
          is to make food and nutrient information more practical for Filipinos by connecting
          nutrient data with recognizable foods, servings, and household measures.
        </p>
        <p>
          The public platform includes food search, nutrition-information pages, food comparison,
          dietary-recording and recipe-related tools. The project has also developed and tested an
          early meal-planning prototype with Registered Nutritionist-Dietitians. These existing
          products provide both technical building blocks and real-world questions that may be useful
          in research.
        </p>
        <p>
          Juan Nutrisyon is led by Wern Ancheta, a software developer working across the platform's
          product design, engineering, data infrastructure, deployment, and ongoing development.
          Research collaborators would retain leadership over the scientific and
          nutrition-methodology aspects of a study.
        </p>
      </div>
      <RouterLink class="text-link" to="/about">Learn more about Juan Nutrisyon</RouterLink>
    </section>

    <section class="research-section research-cta">
      <h2>Have a research question that could benefit from this infrastructure?</h2>
      <p>
        If your work involves Filipino food data, nutrition information, dietary research, digital
        nutrition education, consumer food behavior, or professional nutrition workflows, we would be
        glad to explore whether there is a genuine fit.
      </p>
      <p>
        You do not need to send a finished proposal. A short note about your research area, the
        question you are considering, and the part of Juan Nutrisyon that caught your attention is
        enough to begin.
      </p>
      <a class="primary-button" :href="researchMailto">Discuss a research idea</a>
      <p class="share-note">
        Not the right person, but know someone whose work overlaps? You are welcome to share this
        page with them.
      </p>
    </section>
  </main>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'
import { createMailto, siteConfig } from '@/config/site'

const researchBody = `Hello Wern,

I came across Juan Nutrisyon's research collaboration page and would like to explore a possible overlap.

Research area or question:

Part of Juan Nutrisyon that may be relevant:

Institution or affiliation (optional):

Thank you.`

const researchMailto = createMailto({
  subject: 'Research collaboration inquiry — Juan Nutrisyon',
  body: researchBody
})

const infrastructure = [
  {
    title: 'Filipino food-data layer',
    description:
      'Searchable food records integrating Philippine food-composition data with supplemental sources, source attribution, nutrient values, and household portions where available.'
  },
  {
    title: 'Nutrition-information interfaces',
    description:
      'Food pages, nutrient summaries, food comparison, and other interfaces that can be adapted to study how people understand and use nutrition information.'
  },
  {
    title: 'Dietary-recording infrastructure',
    description:
      'Existing food-diary and nutrient-computation workflows that may support investigator-defined logging or dietary-research protocols after appropriate adaptation.'
  },
  {
    title: 'Recipe-analysis infrastructure',
    description:
      'Ingredient, serving, and recipe nutrient workflows that can support research involving Filipino mixed dishes, subject to clearly documented calculation methods and limitations.'
  },
  {
    title: 'Professional workflow prototype',
    description:
      'An early-stage meal-planning tool for Registered Nutritionist-Dietitians that may be used as a prototype or research object in studies of professional nutrition workflows.'
  },
  {
    title: 'Deployed software foundation',
    description:
      'Existing authentication, hosting, deployment, analytics, event tracking, and product infrastructure that can reduce the amount of software work needed to begin a study.'
  }
]

const pathways = [
  {
    title: 'Dietary research infrastructure',
    description:
      'Adapt food search, household portions, dietary input, source provenance, and nutrient computation to support an investigator-defined dietary-research workflow.',
    areas: [
      'Dietary recording and food coding',
      'Household-measure usability',
      'Localized food coverage',
      'Dietary-assessment feasibility or validation studies'
    ]
  },
  {
    title: 'Digital nutrition experiments and education',
    description:
      'Use real Filipino foods and interactive nutrition interfaces to test how different information formats, educational experiences, or digital interventions affect understanding and food decisions.',
    areas: [
      'Food and nutrition literacy',
      'Nutrition-label comprehension',
      'Menu or calorie-label presentation',
      'Food comparison and consumer choice',
      'Digital nutrition education'
    ]
  },
  {
    title: 'Nutrition informatics and professional tools',
    description:
      'Study nutrition-service workflows or adapt existing professional prototypes to test whether purpose-built software can reduce repetitive work or improve the delivery of nutrition services.',
    areas: [
      'RND workflow and needs assessment',
      'Meal-planning usability',
      'Food-exchange workflows',
      'Nutrition information systems',
      'Telenutrition or digital service delivery'
    ]
  }
]

const researchQuestions = [
  "Does localized nutrition information about Filipino foods improve people's ability to evaluate everyday food choices?",
  'Does side-by-side nutrient comparison improve food-choice understanding compared with a conventional nutrition table?',
  'Which formats—per 100 g, per serving, household measure, % Daily Value, or interpretive indicators—are easiest for Filipino users to understand?',
  'Does better coverage of Filipino foods reduce friction or abandonment in digital dietary recording?',
  'How usable are household measures compared with gram-based input in a dietary-recording interface?',
  'Which stages of meal-plan development consume the most time among Filipino RNDs, and can a purpose-built digital workflow reduce that burden?',
  'How should nutrition information for Filipino mixed dishes and recipes be calculated, communicated, and interpreted?'
]

const researcherRoles = [
  'Scientific question and study design',
  'Nutrition and subject-matter expertise',
  'Selection or development of research measures',
  'Recruitment and research operations',
  'Statistical and methodological oversight',
  'Institutional ethics review and governance',
  'Research personnel or students, where applicable'
]

const juanNutrisyonRoles = [
  'Software engineering and product design',
  'Technical scoping and feasibility assessment',
  'Study-specific interfaces and participant flows',
  'Implementation of questionnaires or educational modules',
  'Randomization or experimental variants when required',
  'Event logging, data capture, and export',
  'Deployment and technical maintenance during the agreed study period',
  'Potential productization of useful findings under a separate agreement'
]

const adaptations = [
  'Participant codes or pseudonymous study accounts',
  'Study-specific cohorts',
  'Informed-consent and participant-information screens',
  'Eligibility or baseline questionnaires',
  'Pre-test and post-test measures',
  'Configurable educational or intervention modules',
  'Random assignment and interface variants',
  'Study-specific event tracking',
  'Data-quality and completion checks',
  'CSV or structured-data export',
  'Role-based researcher access where required'
]

const validationStatus = [
  {
    role: 'Experimental interface or study stimulus',
    implication:
      'Can potentially be adapted; the protocol determines required content review, testing, and piloting.'
  },
  {
    role: 'Digital nutrition intervention',
    implication: 'Can potentially be studied; prior proof of effectiveness is not assumed.'
  },
  {
    role: 'Food coding, calculation, or data-entry infrastructure',
    implication:
      'May support investigator-defined methods after source documentation and computational verification.'
  },
  {
    role: 'Instrument claiming to accurately measure dietary intake',
    implication:
      'Not currently validated for this claim; a suitable validation study would be required.'
  }
]

usePageSeo({
  title: 'Research with Juan Nutrisyon',
  description:
    "Explore how Juan Nutrisyon's Filipino food-data and nutrition-software infrastructure could support academic research, digital interventions, and study-specific tools.",
  path: '/research'
})
</script>

<style scoped>
.research-page {
  width: min(100% - 40px, 1080px);
  margin: 0 auto;
  padding: var(--space-12) 0;
}

.research-hero {
  max-width: 900px;
  padding: var(--space-6) 0 var(--space-8);
}

.research-hero h1 {
  max-width: 860px;
  margin-top: var(--space-3);
}

.hero-copy,
.section-intro,
.reading-copy,
.terms-note {
  max-width: var(--reading-max);
}

.hero-copy {
  margin-top: var(--space-5);
}

.hero-copy p,
.section-intro,
.research-card p,
.pathway-card > p,
.terms-note,
.research-cta p {
  color: var(--text-secondary);
}

.hero-copy p + p,
.reading-copy p + p,
.research-cta p + p,
.status-panel p + p {
  margin-top: var(--space-4);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.hero-note {
  margin-top: var(--space-3);
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.research-section {
  margin-top: var(--space-12);
  padding-top: var(--space-12);
  border-top: 1px solid var(--border-subtle);
}

.research-section > h2 {
  max-width: 760px;
  margin-top: var(--space-2);
}

.section-intro {
  margin-top: var(--space-3);
}

.infrastructure-grid,
.pathway-grid,
.roles-grid {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.infrastructure-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pathway-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.research-card,
.pathway-card,
.role-panel {
  min-width: 0;
  padding: var(--space-5);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
}

.research-card p,
.pathway-card > p {
  margin-top: var(--space-2);
}

.pathway-card h4 {
  margin-top: var(--space-5);
  color: var(--brand-900);
  font-size: 0.9rem;
  font-weight: 800;
}

.pathway-card ul,
.role-panel ul {
  margin-top: var(--space-3);
  padding-left: 1.2rem;
}

.pathway-card li + li,
.role-panel li + li {
  margin-top: var(--space-2);
}

.disclosure,
.terms-note {
  margin-top: var(--space-6);
  padding: var(--space-4);
  border-left: 4px solid var(--brand-500);
  background: var(--brand-soft);
}

.question-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3) var(--space-8);
  margin-top: var(--space-6);
  padding-left: 1.5rem;
}

.question-list li {
  padding-left: var(--space-2);
}

.question-list li::marker {
  color: var(--brand-700);
  font-weight: 800;
}

.closing-copy {
  max-width: var(--reading-max);
  margin-top: var(--space-6);
  font-weight: 700;
}

.roles-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.role-panel:first-child {
  border-top: 4px solid var(--info);
}

.role-panel:last-child {
  border-top: 4px solid var(--brand-500);
}

.adaptation-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2) var(--space-8);
  max-width: 900px;
  margin-top: var(--space-6);
  padding-left: 1.25rem;
}

.status-panel {
  max-width: 920px;
  margin-top: var(--space-6);
  padding: var(--space-6);
  border: 1px solid var(--color-tint-blue-border);
  border-radius: var(--radius-sm);
  background: var(--color-tint-blue-bg);
}

.status-table-wrap {
  margin-top: var(--space-5);
}

.status-table-wrap caption {
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  font-weight: 800;
  text-align: left;
}

.status-table-wrap tbody th {
  width: 34%;
  background: var(--surface-raised);
  color: var(--text-primary);
  font-size: 1rem;
  vertical-align: top;
}

.status-table-wrap td {
  vertical-align: top;
}

.about-section .text-link {
  display: inline-flex;
  margin-top: var(--space-5);
}

.reading-copy {
  margin-top: var(--space-4);
}

.research-cta {
  padding: var(--space-8);
  border: 1px solid color-mix(in srgb, var(--brand-500) 45%, var(--border-default));
  border-radius: var(--radius-sm);
  background: var(--brand-soft);
}

.research-cta h2,
.research-cta p {
  max-width: var(--reading-max);
}

.research-cta .primary-button {
  margin-top: var(--space-5);
}

.research-cta .share-note {
  margin-top: var(--space-5);
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .infrastructure-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pathway-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .research-page {
    width: min(100% - 32px, 1080px);
    padding: var(--space-10) 0;
  }

  .research-hero {
    padding-top: var(--space-3);
  }

  .research-section {
    margin-top: var(--space-10);
    padding-top: var(--space-10);
  }

  .infrastructure-grid,
  .pathway-grid,
  .roles-grid,
  .question-list,
  .adaptation-list {
    grid-template-columns: 1fr;
  }

  .status-panel,
  .research-cta {
    padding: var(--space-5);
  }

  .status-table-wrap {
    overflow: visible;
    border: 0;
    background: transparent;
  }

  .status-table-wrap table,
  .status-table-wrap tbody,
  .status-table-wrap tr,
  .status-table-wrap th,
  .status-table-wrap td {
    display: block;
    width: 100%;
  }

  .status-table-wrap thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .status-table-wrap caption {
    padding: 0 0 var(--space-3);
  }

  .status-table-wrap tr {
    margin-bottom: var(--space-3);
    overflow: hidden;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
  }

  .status-table-wrap tbody th,
  .status-table-wrap td {
    width: 100%;
    border-bottom: 0;
  }

  .status-table-wrap tbody th::before {
    display: block;
    margin-bottom: var(--space-1);
    color: var(--text-muted);
    content: 'Role';
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .status-table-wrap td::before {
    display: block;
    margin-bottom: var(--space-1);
    color: var(--text-muted);
    content: 'Implication';
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
  }
}

@media (max-width: 480px) {
  .hero-actions,
  .hero-actions a,
  .research-cta .primary-button {
    width: 100%;
  }
}
</style>
