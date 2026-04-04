<template>
  <section class="popular-foods">
    <h2>Popular Foods</h2>
    <p>Explore the nutrition breakdown of commonly eaten Filipino dishes.</p>
    <ul class="foods">
      <li v-for="food in foods" :key="food.name" class="food">
        <a class="food-link" :href="food.href" target="_blank">
          <span class="thumb" :class="{ placeholder: !food.image }" aria-hidden="true">
            <img v-if="food.image" :src="food.image" :alt="food.name" loading="lazy">
            <span v-else class="initials">{{ food.initials }}</span>
          </span>
          <span class="food-name">{{ food.name }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<script setup>
const foods = [
  {
    name: 'Chicken Adobo',
    href: 'https://app.juanutrisyon.info/food/chicken-adobo',
    image:
      'https://api.juanutrisyon.info/storage/2025-11-23-0728-title-yhulbvneckpgd8nvodkkotq5pmv1mxlsoqisrmae.jpg',
    initials: 'CA',
  },
  {
    name: 'Adobong Sitaw',
    href: 'https://app.juanutrisyon.info/food/adobong-sitaw',
    image: 'https://api.juanutrisyon.info/storage/2025-11-25-0752-title-rc0vix36rznpo5f7cmonnetvfpwflvguxbn8q5zk.jpg',
    initials: 'AS',
  },
  {
    name: 'Pinoy Pork Bbq',
    href: 'https://app.juanutrisyon.info/food/pinoy-pork-barbecue',
    image:
      'https://api.juanutrisyon.info/storage/2025-11-24-2237-title-8jvjn3omqrihixibqi5qyg0rhny9ayfu9qhryc7x.jpg',
    initials: 'PB',
  },
  {
    name: 'Paksiw Na Isda',
    href: 'https://app.juanutrisyon.info/food/paksiw-na-isda',
    image:
      'https://api.juanutrisyon.info/storage/2025-11-23-1400-title-d0ycc7iaxaxk2kn4tnmxjgcory9uplvehtanmmnv.jpg',
    initials: 'PI',
  },
  {
    name: 'Tokwat Baboy',
    href: 'https://app.juanutrisyon.info/food/tokwat-baboy',
    image:
      'https://api.juanutrisyon.info/storage/2025-11-23-1346-title-m7lj9aucqvk6yncs4selbi67ekm0dahgv7oeshjk.jpg',
    initials: 'TB',
  },
  {
    name: 'Tortang Talong',
    href: 'https://app.juanutrisyon.info/food/tortang-talong',
    image:
      'https://api.juanutrisyon.info/storage/2025-05-16-0844-title-k8yxjokjncsewumdpvispkrojd5j2x8ddyj7qey2.jpg',
    initials: 'TT',
  },
  {
    name: 'Bistek',
    href: 'https://app.juanutrisyon.info/food/bistek',
    image:
      'https://api.juanutrisyon.info/storage/2025-11-23-1352-title-t79o7b0wzkb7wn63iwxamroals4unwqcxwrwu04t.jpg',
    initials: 'B',
  },
  {
    name: 'Lumpiang Shanghai',
    href: 'https://app.juanutrisyon.info/food/lumpiang-shanghai',
    image:
      'https://api.juanutrisyon.info/storage/2025-11-24-0534-title-bseuy8sevcn5nb7uujuvmbqgtfbynwfn0qlewrde.jpg',
    initials: 'LS',
  },
  {
    name: 'Pinoy Style Fried Chicken',
    href: 'https://app.juanutrisyon.info/food/pinoy-style-fried-chicken',
    image:
      'https://api.juanutrisyon.info/storage/2025-11-24-2227-title-ccg5vccljeoshqkeu2isxxaam7nn8ygu1e8k3o6g.jpg',
    initials: 'PC',
  },
]
</script>

<style scoped>
.popular-foods {
  margin-top: 32px;
}

.foods {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 12px;
}

.food {
  border: 1px solid #E7E7E7;
  border-radius: 12px;
  background-color: #FFFFFF;
}

.food-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: inherit;
  text-decoration: none;
}

.food-link:hover .food-name {
  text-decoration: underline;
}

.thumb {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  overflow: hidden;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #F1F1F1;
  border: 1px solid #E7E7E7;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb.placeholder {
  background: linear-gradient(135deg, #F6F1EA, #EEE7DC);
  color: #6B5B44;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
}

.food-name {
  font-size: 16px;
  font-weight: 600;
}

.initials {
  letter-spacing: 0.08em;
}
</style>
