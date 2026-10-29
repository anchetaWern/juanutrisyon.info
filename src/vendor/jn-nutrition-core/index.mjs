// Generated jn-nutrition-core-1; do not edit.
function parseAmount(input) {
  if (input == null || typeof input === "string" && input.trim() === "") {
    return { value: null, state: "missing", reason: "missing_amount" };
  }
  if (typeof input !== "number" && (typeof input !== "string" || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(input.trim()))) {
    return { value: null, state: "invalid", reason: "malformed_amount" };
  }
  const value = Number(input);
  if (!Number.isFinite(value)) return { value: null, state: "invalid", reason: "non_finite_amount" };
  if (value < 0) return { value: null, state: "invalid", reason: "negative_amount" };
  return { value: value === 0 ? 0 : value, state: value === 0 ? "explicit_zero" : "known" };
}
const isExact = (result) => ["known", "explicit_zero"].includes(result?.state) && Number.isFinite(result.value) && result.value >= 0 && (result.coverage == null || result.coverage === "complete");
function finiteResult(value) {
  return Number.isFinite(value) ? parseAmount(value) : { value: null, state: "invalid", reason: "numeric_overflow" };
}
const canonicalUnits = Object.freeze(Object.fromEntries([
  ["kcal", "calories"],
  ["g", "protein,total fat,saturated fat,trans fat,monounsaturated fat,polyunsaturated fat,omega-3,omega-6,total carbohydrates,dietary fiber,total fiber,sugar,added sugar"],
  ["mL", "water"],
  ["mg", "cholesterol,sodium,potassium,calcium,fluoride,iron,magnesium,zinc,chloride,choline,copper,manganese,phosphorus,vitamin c,vitamin b1,vitamin b2,vitamin b5,vitamin b6"],
  ["mcg", "selenium,vitamin d,vitamin k,vitamin b12,biotin,chromium,iodine,molybdenum"],
  ["mcg RAE", "vitamin a"],
  ["mg AT", "vitamin e"],
  ["mg NE", "vitamin b3"],
  ["mcg DFE", "vitamin b9"]
].flatMap(([unit, names]) => names.split(",").map((name) => [name, unit]))));
const cleanLabel = (value) => typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";
const unitKey = (value) => cleanLabel(value).replace(/(?:[µμ]|u)g/g, "mcg").replace(/\s+/g, "");
const nutrientAliases = Object.freeze({
  energy: "calories",
  fat: "total fat",
  carbohydrates: "total carbohydrates",
  "total carbohydrate": "total carbohydrates",
  fiber: "dietary fiber",
  sugars: "sugar",
  "added sugars": "added sugar",
  riboflavin: "vitamin b2",
  niacin: "vitamin b3"
});
function nutrientId(name) {
  const id = cleanLabel(name);
  return nutrientAliases[id] ?? id;
}
const mass = { g: 1, mg: 1e-3, mcg: 1e-6 };
const has = (object, key) => Object.hasOwn(object, key);
function nutrientConversion(id, unit, form) {
  const target = canonicalUnits[id];
  const from = unitKey(unit);
  const to = unitKey(target);
  const unsupported = (reason) => ({ state: "unsupported_unit", reason });
  if (!has(canonicalUnits, id)) return { state: "unsupported_nutrient", reason: "unknown_nutrient" };
  if (from === to) return { factor: 1, unit: target };
  if (id === "calories" && from === "kj") return { factor: 1 / 4.184, unit: target };
  if (id === "water") {
    if (from === "l") return { factor: 1e3, unit: target };
    return unsupported(has(mass, from) ? "mass_to_volume_mapping_unapproved" : "unknown_unit");
  }
  if (has(mass, from) && has(mass, to)) return { factor: mass[from] / mass[to], unit: target };
  if (id === "vitamin d" && from === "iu") return { factor: 0.025, unit: target };
  const equivalent = from.match(/^(g|mg|mcg)(rae|at|ne|dfe)$/);
  const canonical = to.match(/^(g|mg|mcg)(rae|at|ne|dfe)$/);
  if (equivalent && canonical && equivalent[2] === canonical[2]) {
    return { factor: mass[equivalent[1]] / mass[canonical[1]], unit: target };
  }
  if (id === "vitamin a") {
    if (/^(mcg|mg|g)re$/.test(from)) return unsupported("RE_to_RAE_mapping_unapproved");
    if (from === "iu" && form === "retinol") return { factor: 0.3, unit: target };
    return unsupported("vitamin_a_form_missing");
  }
  if (id === "vitamin e") {
    if (from === "iu" && form === "natural_alpha_tocopherol") return { factor: 0.67, unit: target };
    if (from === "iu" && form === "synthetic_alpha_tocopherol") return { factor: 0.45, unit: target };
    return unsupported(from.includes("te") ? "alpha_TE_to_AT_mapping_unapproved" : "natural_or_synthetic_form_missing");
  }
  if (id === "vitamin b3" && has(mass, from) && form === "niacin") {
    return { factor: mass[from] / mass.mg, unit: target };
  }
  if (id === "vitamin b9" && has(mass, from) && form === "natural_food_folate") {
    return { factor: mass[from] / mass.mcg, unit: target };
  }
  return unsupported(id === "vitamin b9" ? "folate_form_missing" : id === "vitamin b3" ? "niacin_form_missing" : "unknown_unit");
}
const units = {
  g: ["weight", "g", 1],
  kg: ["weight", "g", 1e3],
  ml: ["volume", "mL", 1],
  l: ["volume", "mL", 1e3],
  serving: ["count", "serving", 1],
  piece: ["count", "piece", 1]
};
function normalizeBasis(input, role = "source") {
  const parsed = parseAmount(input?.amount);
  const base = { amount: null, unit: null, dimension: "unavailable", edible_basis: input?.edible_basis ?? null };
  if (["missing", "invalid", "unsupported_unit"].includes(input?.state)) {
    return { ...base, state: input.state, reason: input.reason ?? `invalid_${role}_basis` };
  }
  if (!isExact(parsed)) return {
    ...base,
    state: parsed.state,
    reason: `${parsed.state === "missing" ? "missing" : parsed.reason === "negative_amount" ? "negative" : "malformed"}_${role}_basis`
  };
  if (role === "source" && parsed.value === 0) return { ...base, state: "invalid", reason: "zero_source_basis" };
  const key = unitKey(input?.unit);
  if (!Object.hasOwn(units, key)) return { ...base, state: "unsupported_unit", reason: `unsupported_${role}_basis_unit` };
  const [dimension, unit, factor] = units[key];
  const converted = finiteResult(parsed.value * factor);
  return { ...base, dimension, unit, amount: converted.value, state: converted.state, ...converted.reason ? { reason: converted.reason } : {} };
}
function convertEdibleWeight(amount, percent, direction = "ap_to_ep") {
  const weight = parseAmount(amount);
  if (!isExact(weight)) return weight;
  const edible = parseAmount(percent);
  if (edible.state === "missing") return { value: null, state: "missing", reason: "missing_edible_portion" };
  if (!isExact(edible) || edible.value <= 0 || edible.value > 100) {
    return { value: null, state: "invalid", reason: "edible_portion_out_of_range" };
  }
  if (!["ap_to_ep", "ep_to_ap"].includes(direction)) return { value: null, state: "invalid", reason: "unknown_edible_direction" };
  return { ...finiteResult(direction === "ap_to_ep" ? weight.value * (edible.value / 100) : weight.value / (edible.value / 100)), unit: "g" };
}
function scalingFactor(sourceInput, selectedInput, { density, edible_portion_percent } = {}) {
  const source = normalizeBasis(sourceInput);
  const selected = normalizeBasis(selectedInput, "selected");
  const basis = { source, selected, conversions: [] };
  for (const item of [source, selected]) {
    if (!["known", "explicit_zero"].includes(item.state)) return { value: null, state: item.state, reason: item.reason, basis };
  }
  let amount = selected.amount;
  if (source.dimension !== selected.dimension) {
    if (![source.dimension, selected.dimension].every((value) => ["weight", "volume"].includes(value))) {
      return { value: null, state: "invalid", reason: "incompatible_basis_dimensions", basis };
    }
    const normalizedDensity = normalizeDensity(density);
    if (!isExact(normalizedDensity)) return { ...normalizedDensity, basis };
    amount = selected.dimension === "volume" ? amount * normalizedDensity.value : amount / normalizedDensity.value;
    basis.conversions.push({ method: "density", density_g_per_ml: normalizedDensity.value });
  } else if (source.unit !== selected.unit) {
    return { value: null, state: "invalid", reason: "incompatible_count_units", basis };
  }
  if (source.edible_basis !== selected.edible_basis) {
    if (source.dimension !== "weight" || selected.dimension !== "weight" || ![source.edible_basis, selected.edible_basis].every((value) => ["edible", "as_purchased"].includes(value))) {
      return { value: null, state: "missing", reason: "unknown_edible_basis", basis };
    }
    const direction = source.edible_basis === "edible" ? "ap_to_ep" : "ep_to_ap";
    const converted = convertEdibleWeight(amount, edible_portion_percent, direction);
    if (!isExact(converted)) return { ...converted, basis };
    amount = converted.value;
    basis.conversions.push({ method: direction, edible_portion_percent: Number(edible_portion_percent) });
  }
  if (source.edible_basis != null && !["edible", "as_purchased"].includes(source.edible_basis)) {
    return { value: null, state: "invalid", reason: "unknown_edible_basis", basis };
  }
  return { ...finiteResult(amount / source.amount), basis };
}
function normalizeDensity(input, scalarUnit) {
  const raw = input && typeof input === "object" ? input.density : input;
  const parsed = parseAmount(raw);
  if (!isExact(parsed)) return { ...parsed, reason: "missing_or_invalid_density" };
  if (parsed.value === 0) return { value: null, state: "invalid", reason: "zero_density" };
  const unit = input && typeof input === "object" ? input.unit : scalarUnit;
  if (unitKey(unit) !== "g/ml") return { value: null, state: "unsupported_unit", reason: "unknown_density_unit" };
  return { ...parsed, unit: "g/mL" };
}
function normalizeHouseholdMeasure(input = {}) {
  const quantity = parseAmount(input.quantity);
  const density = normalizeDensity(input.density, input.density_unit);
  const result = {
    label: input.label ?? input.name ?? null,
    quantity: quantity.value,
    weight_grams: null,
    volume_ml: null,
    density_g_per_ml: density.value,
    source_unit: input.weight_unit ?? input.unit ?? null,
    provenance: null
  };
  if (!isExact(quantity)) return { ...result, state: quantity.state, reason: "invalid_or_missing_quantity" };
  let weight = parseAmount(input.weight_in_grams ?? input.weight_grams);
  if (weight.state === "missing" && input.weight != null) {
    const declared = normalizeBasis({ amount: input.weight, unit: input.weight_unit ?? input.unit });
    if (declared.dimension !== "weight" || declared.state !== "known") {
      return { ...result, state: declared.state === "known" ? "invalid" : declared.state, reason: declared.reason ?? "incompatible_household_weight_unit" };
    }
    weight = parseAmount(declared.amount);
  }
  const volume = parseAmount(input.volume_in_ml ?? input.volume_ml);
  const hasWeight = weight.state !== "missing";
  const measure = hasWeight ? weight : volume;
  if (!isExact(measure) || measure.value <= 0) return { ...result, state: measure.state === "missing" ? "missing" : "invalid", reason: "invalid_or_missing_measure" };
  if (isExact(volume) && volume.value > 0) result.volume_ml = finiteResult(volume.value * quantity.value).value;
  if (!hasWeight && !isExact(density)) return { ...result, state: density.state, reason: density.reason };
  const total = finiteResult((hasWeight ? weight.value : volume.value * density.value) * quantity.value);
  return {
    ...result,
    weight_grams: total.value,
    state: total.state,
    ...total.reason ? { reason: total.reason } : {},
    provenance: hasWeight ? "supplied_gram_weight" : "volume_times_density"
  };
}
function copySource(value) {
  if (Array.isArray(value)) return value.map(copySource);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copySource(item)]));
  }
  return value;
}
function normalizeNutrient(input = {}) {
  input ??= {};
  const id = nutrientId(input.nutrient_id ?? input.name);
  const source = copySource(input.source ?? input);
  const composition = Array.isArray(input.composition) ? input.composition.map(normalizeNutrient) : [];
  const base = { nutrient_id: id, value: null, unit: input.unit ?? null, basis: input.basis ?? null, source, composition, ...input.coverage ? { coverage: input.coverage } : {} };
  if (input.nutrient_id != null && input.state && !["known", "explicit_zero"].includes(input.state)) {
    return { ...base, state: input.state, ...input.reason ? { reason: input.reason } : {} };
  }
  const status = input.qualifier ?? input.status ?? input.state ?? source.qualifier ?? source.status;
  if (["trace", "not_analyzed"].includes(status)) return { ...base, state: status };
  const parsed = parseAmount(Object.hasOwn(input, "amount") ? input.amount : input.value);
  if (!isExact(parsed)) return { ...base, ...parsed };
  const conversion = nutrientConversion(id, input.unit, input.form ?? source.form);
  if (conversion.factor == null) return { ...base, ...conversion };
  return { ...base, ...finiteResult(parsed.value * conversion.factor), unit: conversion.unit };
}
function scaleNutrient(nutrient, sourceBasis, selectedBasis, options) {
  const normalized = normalizeNutrient(nutrient);
  const factor = scalingFactor(sourceBasis, selectedBasis, options);
  function scale(node) {
    const base = { ...node, basis: factor.basis, composition: node.composition.map(scale) };
    if (!isExact(factor)) return { ...base, value: null, state: factor.state, reason: factor.reason };
    if (!isExact(node)) return base;
    return { ...base, ...finiteResult(node.value * factor.value) };
  }
  return scale(normalized);
}
function aggregateNutrients(occurrences, { nutrientIds = [], flat = false, canonicalTree = false } = {}) {
  if (!Array.isArray(occurrences)) return { nutrients: [], state: "invalid", reason: "occurrences_must_be_array" };
  const ids = /* @__PURE__ */ new Set();
  for (const occurrence of occurrences) {
    const id = occurrence?.occurrence_id;
    if (!(typeof id === "string" && id.trim() || typeof id === "number" && Number.isFinite(id))) {
      return { nutrients: [], state: "invalid", reason: "missing_occurrence_id" };
    }
    if (ids.has(String(id))) return { nutrients: [], state: "invalid", reason: "duplicate_occurrence_id" };
    ids.add(String(id));
    if (!Array.isArray(occurrence.nutrients)) return { nutrients: [], state: "invalid", reason: "nutrients_must_be_array" };
  }
  const trees = occurrences.map((occurrence) => occurrence.nutrients.map((node) => scaleNutrient(
    node,
    occurrence.source_basis,
    occurrence.selected_basis,
    occurrence
  )));
  const levels = flat || canonicalTree ? trees.map((tree) => flattenTree(tree)) : trees;
  function aggregateLevel(levels2, path = []) {
    const expected = path.length ? [] : nutrientIds.map(nutrientId).filter((id) => flat || canonicalTree || !levels2.some((nodes) => flattenTree(nodes).some((node) => node.nutrient_id === id)));
    const idsAtLevel = [.../* @__PURE__ */ new Set([...levels2.flatMap((nodes) => nodes.map((node) => node.nutrient_id)), ...expected])];
    return idsAtLevel.map((id) => {
      const matches = levels2.map((nodes) => nodes.filter((node) => node.nutrient_id === id));
      const contributions = occurrences.map((occurrence, index) => {
        const nodes = matches[index];
        const evidence = {
          occurrence_id: occurrence.occurrence_id,
          food_slug: occurrence.food_slug ?? null,
          provenance: occurrence.provenance ?? null,
          lineage: occurrence.lineage ?? [],
          source_basis: occurrence.source_basis ?? null,
          selected_basis: occurrence.selected_basis ?? null
        };
        if (!nodes.length) return { ...evidence, value: null, state: "missing", reason: occurrence.unavailable_reason ?? "omitted_nutrient" };
        if (nodes.length > 1) return { ...evidence, value: null, state: "invalid", reason: "duplicate_nutrient_path", sources: nodes };
        const { composition, ...node } = nodes[0];
        return { ...evidence, ...node };
      });
      const exact = contributions.filter(isExact);
      const subtotal = finiteResult(exact.map((node) => node.value).sort((a, b) => a - b).reduce((sum, value2) => sum + value2, 0));
      const coverage2 = !isExact(subtotal) || exact.length === 0 ? "unavailable" : exact.length === occurrences.length ? "complete" : "partial";
      const value = coverage2 === "complete" ? subtotal.value : null;
      const uniqueStates = [...new Set(contributions.map((node) => node.state))];
      return {
        nutrient_id: id,
        path: [...path, id],
        value,
        unit: exact[0]?.unit ?? canonicalUnits[id] ?? null,
        state: !isExact(subtotal) ? "invalid" : coverage2 === "complete" ? subtotal.state : uniqueStates.length === 1 ? uniqueStates[0] : "missing",
        coverage: coverage2,
        known_subtotal: coverage2 === "partial" ? subtotal.value : null,
        nutrientId: id,
        amount: exact.length && isExact(subtotal) ? subtotal.value : null,
        knownItemCount: exact.length,
        unknownItemCount: occurrences.length - exact.length,
        totalItemCount: occurrences.length,
        countsAreExact: !occurrences.some((row) => row.unresolved_recipe),
        coveragePercent: occurrences.some((row) => row.unresolved_recipe) ? null : occurrences.length ? exact.length / occurrences.length * 100 : 0,
        isComplete: coverage2 === "complete",
        ...coverage2 === "complete" ? {} : { reason: !isExact(subtotal) ? "numeric_overflow" : "incomplete_coverage" },
        basis: { kind: "selected_occurrence_total", occurrences: contributions.map((node) => ({ occurrence_id: node.occurrence_id, basis: node.basis ?? null })) },
        source: contributions,
        // Duplicate parents cannot contribute certain descendants; keep their paths visible.
        composition: aggregateLevel(matches.map((nodes) => nodes.length > 1 ? nodes.flatMap((node) => invalidateTree(node.composition)) : nodes[0]?.composition ?? []), [...path, id])
      };
    });
  }
  const totals = aggregateLevel(levels);
  const nutrients = canonicalTree && !flat ? presentCanonicalTree(totals, trees.flat()) : totals;
  const coverage = !nutrients.length || nutrients.every((node) => node.coverage === "unavailable") ? "unavailable" : nutrients.every((node) => node.coverage === "complete") ? "complete" : "partial";
  return {
    nutrients,
    coverage,
    state: coverage === "complete" ? "known" : "missing",
    ...!occurrences.length ? { reason: "no_occurrences" } : {}
  };
}
function presentCanonicalTree(totals, layout) {
  const byId = new Map(totals.map((node) => [node.nutrient_id, node]));
  const seen = /* @__PURE__ */ new Set();
  function visit(nodes, path = []) {
    return nodes.flatMap((node) => {
      const id = node.nutrient_id;
      if (seen.has(id) || !byId.has(id)) return [];
      seen.add(id);
      const children = nodes.filter((other) => other.nutrient_id === id).flatMap((other) => other.composition);
      return [{ ...byId.get(id), path: [...path, id], composition: visit(children, [...path, id]) }];
    });
  }
  const result = visit(layout);
  return [...result, ...totals.filter((node) => !seen.has(node.nutrient_id))];
}
function flattenTree(nodes, path = [], counts = null) {
  if (!counts) {
    counts = /* @__PURE__ */ new Map();
    const count = (children) => children.forEach((node) => {
      counts.set(node.nutrient_id, (counts.get(node.nutrient_id) ?? 0) + 1);
      count(node.composition);
    });
    count(nodes);
  }
  return nodes.flatMap((node) => {
    const source_path = [...path, node.nutrient_id];
    const duplicate = counts.get(node.nutrient_id) > 1;
    return [
      { ...node, source_path, composition: [] },
      ...flattenTree(duplicate ? invalidateTree(node.composition) : node.composition, source_path, counts)
    ];
  });
}
function invalidateTree(nodes) {
  return nodes.map((node) => ({ ...node, value: null, state: "invalid", reason: "duplicate_ancestor_path", composition: invalidateTree(node.composition) }));
}
const usdaDefaultable = /* @__PURE__ */ new Set([
  "protein",
  "saturated fat",
  "trans fat",
  "cholesterol",
  "sugar",
  "dietary fiber",
  "vitamin a",
  "vitamin c",
  "calcium",
  "iron"
]);
function foodToOccurrence(food, { occurrence_id, selected_basis, household_measure } = {}) {
  const source_basis = { amount: food?.serving_size, unit: food?.serving_size_unit, edible_basis: food?.edible_basis ?? null };
  const nutrients = copySource(food?.nutrients ?? []);
  if (Array.isArray(nutrients) && food && (Object.hasOwn(food, "calories") || Object.hasOwn(food, "calories_unit"))) {
    nutrients.push({ name: "calories", amount: food.calories, unit: food.calories_unit });
  }
  const density = normalizeDensity(food?.density, food?.density_unit);
  const household = household_measure == null ? null : normalizeHouseholdMeasure({
    ...household_measure,
    density: household_measure.density ?? food?.density,
    density_unit: household_measure.density_unit ?? food?.density_unit
  });
  const selected = household ? {
    amount: household.weight_grams,
    unit: "g",
    edible_basis: household_measure.edible_basis ?? null,
    state: household.state,
    reason: household.reason
  } : selected_basis;
  return guardSourceEvidence({
    occurrence_id,
    food_slug: food?.description_slug ?? food?.slug ?? null,
    provenance: {
      food_id: food?.id ?? null,
      food_name: food?.description ?? null,
      source_type: food?.data_source ?? null,
      source_reference: food?.custom_id ?? null,
      label_image: food?.nutrition_label_image ?? null,
      created_at: food?.created_at ?? null,
      updated_at: food?.updated_at ?? null,
      source_metadata: copySource(food?.source_metadata ?? null),
      ...food?.data_source === "custom_food" ? { custom_food: copySource(food.custom_food ?? {}) } : {}
    },
    source_basis,
    selected_basis: selected ?? null,
    nutrients,
    density: { density: density.value, unit: density.unit ?? null },
    edible_portion_percent: food?.edible_portion_percent ?? food?.edible_portion,
    adapter: { source_basis: normalizeBasis(source_basis), selected_basis: normalizeBasis(selected, "selected"), density, household }
  });
}
function guardSourceEvidence(occurrence) {
  if (!occurrence.source_basis || typeof occurrence.source_basis !== "object") occurrence.source_basis = {};
  if (occurrence.provenance?.source_type === "openfoodfacts") {
    Object.assign(occurrence.source_basis, { state: "missing", reason: "unverified_import_basis" });
  }
  if (occurrence.provenance?.source_type === "usda_fdc") {
    const imported = occurrence.provenance?.source_metadata?.import_normalization;
    const verifiedZero = (node) => imported?.version === "usda-v1" && imported.basis?.amount === 100 && imported.basis?.unit === "g" && Array.isArray(imported.nutrients) && imported.nutrients.some((row) => row?.name === (node.nutrient_id ?? node.name) && row.unit === node.unit && parseAmount(row.amount).value === 0);
    const basis = normalizeBasis(occurrence.source_basis);
    if (basis.amount !== 100 || basis.unit !== "g") {
      Object.assign(occurrence.source_basis, { state: "missing", reason: "unverified_import_basis" });
    }
    const visit = (nodes) => {
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const id = nutrientId(node.nutrient_id ?? node.name);
        if (id === "vitamin k") {
          Object.assign(node, { nutrient_id: id, state: "unverified", reason: "unverified_import_aggregation" });
        }
        if (usdaDefaultable.has(id) && parseAmount(node.amount ?? node.value).value === 0 && !verifiedZero(node)) {
          Object.assign(node, { nutrient_id: id, state: "unverified", reason: "unverified_import_zero" });
        }
        if (Array.isArray(node.composition)) visit(node.composition);
      }
    };
    if (Array.isArray(occurrence.nutrients)) visit(occurrence.nutrients);
  }
  return occurrence;
}
const numberOrNull = (value) => parseAmount(value).value;
const getIngredientRetentionFactor = ({
  edibleWeight,
  settings,
  cookingLiquidDisposition,
  cookingLiquidRetainedGrams,
  totalCookingLiquidWeight
}) => {
  const weight = numberOrNull(edibleWeight);
  if (settings?.is_cooking_oil) {
    if (settings.oil_disposition === "discarded") return 0;
    if (settings.oil_disposition === "partially_retained") {
      const retained = numberOrNull(settings.oil_retained_grams);
      return retained !== null && weight !== null && weight > 0 && retained <= weight ? retained / weight : null;
    }
  }
  if (settings?.is_cooking_liquid) {
    if (cookingLiquidDisposition === "discarded") return 0;
    if (cookingLiquidDisposition === "partially_retained") {
      const retained = numberOrNull(cookingLiquidRetainedGrams);
      const total = numberOrNull(totalCookingLiquidWeight);
      if (retained !== null && total !== null && total > 0 && retained <= total) {
        return retained / total;
      }
      return null;
    }
  }
  return 1;
};
const positive = (value) => {
  const parsed = parseAmount(value);
  return parsed.value !== null && parsed.value > 0 ? parsed.value : null;
};
const grams = (amount, unit, food) => {
  const basis = normalizeBasis({ amount, unit }, "selected");
  if (!isExact({ value: basis.amount, state: basis.state })) return null;
  if (basis.dimension === "weight") return basis.amount;
  const density = normalizeDensity(food?.density, food?.density_unit);
  return basis.dimension === "volume" && isExact(density) ? basis.amount * density.value : null;
};
function retainedRecipeRows(food) {
  const recipe = food?.recipe ?? {};
  const rows = food?.recipe_ingredients ?? recipe.ingredients ?? [];
  if (!Array.isArray(rows)) return [];
  const liquidWeights = rows.filter((row) => row.is_cooking_liquid).map((row) => grams(row.serving_size, row.serving_size_unit, row.ingredient));
  const totalLiquid = liquidWeights.every((value) => value !== null) ? liquidWeights.reduce((sum, value) => sum + value, 0) : null;
  return rows.map((row) => {
    const entered = parseAmount(row.serving_size).value;
    const retained = parseAmount(row.retained_serving_size);
    const weight = grams(entered, row.serving_size_unit, row.ingredient);
    const factor = getIngredientRetentionFactor({
      edibleWeight: weight,
      settings: row,
      cookingLiquidDisposition: recipe.cooking_liquid_disposition,
      cookingLiquidRetainedGrams: recipe.cooking_liquid_retained_grams,
      totalCookingLiquidWeight: totalLiquid
    });
    const amount = retained.state !== "missing" ? retained.value : entered !== null && factor !== null ? entered * factor : null;
    const valid = amount !== null && entered !== null && amount <= entered;
    return {
      row,
      amount: valid ? amount : null,
      weight: valid ? grams(amount, row.serving_size_unit, row.ingredient) : null
    };
  });
}
function batchBasis(food, rows, selected) {
  const recipe = food.recipe ?? {};
  const finalInput = parseAmount(recipe.final_prepared_weight_grams);
  if (finalInput.state !== "missing" && positive(finalInput.value) === null) return null;
  const finalWeight = positive(finalInput.value);
  const selection = normalizeBasis(selected, "selected");
  if (selection.dimension === "count" && selection.unit === "serving") {
    const total = positive(recipe.household_yield_quantity);
    const portion = positive(recipe.household_quantity_per_serving);
    const count = total && portion ? total / portion : positive(recipe.prepared_serving_count) ?? positive(food.servings_per_container);
    return count ? { amount: count, unit: "serving", edible_basis: food.edible_basis ?? null } : null;
  }
  if (finalWeight) return { amount: finalWeight, unit: "g", edible_basis: food.edible_basis ?? null };
  if (rows.length && rows.every((row) => row.weight !== null)) {
    const weight = rows.reduce((sum, row) => sum + row.weight, 0);
    return weight > 0 ? {
      amount: weight,
      unit: "g",
      edible_basis: food.edible_basis ?? null,
      quality: "estimated_from_retained_ingredient_weight"
    } : null;
  }
  const volumes = rows.map(({ row, amount }) => normalizeBasis({ amount, unit: row.serving_size_unit }, "selected"));
  if (volumes.length && volumes.every((basis) => basis.dimension === "volume" && basis.amount !== null)) {
    const amount = volumes.reduce((sum, basis) => sum + basis.amount, 0);
    return amount > 0 ? { amount, unit: "mL", edible_basis: food.edible_basis ?? null } : null;
  }
  return null;
}
function foodToOccurrences(food, options = {}, ancestors = [], depth = 0) {
  if (food?.recipe_structure_status) return [{
    ...foodToOccurrence(food, options),
    nutrients: [],
    unresolved_recipe: true,
    unavailable_reason: food.recipe_structure_status
  }];
  const isRecipe = food?.data_source === "community_recipe" || food?.recipe || food?.recipe_ingredients?.length;
  if (!isRecipe) return [foodToOccurrence(food, options)];
  const identity = food.id ?? food.description_slug;
  const rows = retainedRecipeRows(food);
  if (depth >= 8 || identity != null && ancestors.includes(identity) || !rows.length || food.recipe_structure_status) {
    return [{
      ...foodToOccurrence(food, options),
      nutrients: [],
      unresolved_recipe: true,
      unavailable_reason: food.recipe_structure_status ?? "recipe_structure_unavailable"
    }];
  }
  const source = batchBasis(food, rows, options.selected_basis);
  const factor = scalingFactor(source, options.selected_basis, {
    density: food.density,
    edible_portion_percent: food.edible_portion
  });
  return rows.flatMap(({ row, amount }, index) => {
    const nested = {
      occurrence_id: JSON.stringify([options.occurrence_id, index]),
      selected_basis: {
        amount: isExact(factor) && amount !== null ? amount * factor.value : null,
        unit: row.serving_size_unit,
        edible_basis: row.ingredient?.edible_basis ?? null
      }
    };
    if (!row.ingredient) return [{
      ...foodToOccurrence(null, nested),
      unresolved_recipe: true,
      unavailable_reason: "ingredient_unavailable"
    }];
    return foodToOccurrences(row.ingredient, nested, [...ancestors, identity], depth + 1).map((leaf) => ({
      ...leaf,
      lineage: [...leaf.lineage ?? [], {
        food_slug: food.description_slug ?? null,
        food_name: food.description ?? null,
        occurrence_id: options.occurrence_id,
        basis: factor.basis,
        quality: source?.quality ?? null
      }]
    }));
  });
}
function calculateFood(food, amount, unit = food?.serving_size_unit, occurrenceId = "food") {
  if (!food) return { nutrients: [], state: "missing", coverage: "unavailable" };
  return aggregateNutrients(foodToOccurrences(food, {
    occurrence_id: occurrenceId,
    selected_basis: { amount, unit, edible_basis: food.edible_basis ?? null }
  }), { canonicalTree: true });
}
function findNutrient(nodes, id) {
  for (const node of nodes || []) {
    if (node.nutrient_id === id) return node;
    const child = findNutrient(node.composition, id);
    if (child) return child;
  }
  return null;
}
function exactValue(node) {
  return isExact(node) ? node.value : null;
}
export {
  calculateFood,
  convertEdibleWeight,
  exactValue,
  findNutrient,
  isExact,
  normalizeBasis,
  normalizeDensity,
  normalizeHouseholdMeasure,
  parseAmount
};
