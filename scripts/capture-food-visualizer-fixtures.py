"""Sanitize already-downloaded Phase 1 responses; performs no network requests.

Usage: python3 scripts/capture-food-visualizer-fixtures.py /private/tmp
Raw inputs are deliberately not checked in. Public calculation data is allowlisted.
"""
import hashlib
import json
import re
import sys
from datetime import timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/food-visualizer/fixtures'
FOOD = '''id description description_slug scientific_name alternate_names brand is_visible
data_source custom_id calories calories_unit serving_size serving_size_unit custom_serving_size
servings_per_container edible_portion edible_basis density_unit food_type food_subtype
food_state food_substate default_role title_image nutrition_label_image created_at updated_at
recipe_structure_status'''.split()
RECIPE = '''id food_id source_url yield_method total_ingredient_weight_grams
retained_ingredient_weight_grams entered_edible_ingredient_weight_grams final_prepared_weight_grams
household_yield_quantity household_yield_unit household_quantity_per_serving prepared_serving_count
prepared_serving_size_text cooking_method cooking_liquid_disposition cooking_liquid_retained_grams
cooking_yield_percent cooking_yield_entry_mode manual_serving_weight_grams
manual_serving_weight_acknowledged household_measure_quantity household_measure_unit
household_measure_custom ingredient_cooking_settings'''.split()
ROW = '''id recipe_id ingredient_id sort_order description serving_size retained_serving_size
serving_size_unit primary_role edible_portion state cooking_method_override is_cooking_liquid
is_cooking_oil oil_disposition oil_retained_grams'''.split()
META = '''source_food_id database_subset source_version source_url source_published_at
source_updated_at retrieved_at declared_serving upstream_nutrients import_normalization'''.split()
HEADERS = '''date content-type cache-control cf-cache-status age vary access-control-allow-origin
access-control-allow-credentials access-control-expose-headers access-control-allow-methods
access-control-allow-headers access-control-max-age retry-after x-ratelimit-limit
x-ratelimit-remaining x-ratelimit-reset'''.split()
SLUGS = {'rice': 'rice-well-milled-boiled', 'coke': 'coca-cola-original-taste',
         'pandesal': 'bread-pan-de-sal', 'mango': 'mango-manila-super-ripe',
         'patis': 'fish-sauce', 'gata': 'coco-mama-fresh-gata-coconut-cream',
         'recipe': 'chicken-adobo', 'rice-repeat': 'rice-well-milled-boiled'}


def pick(value, keys):
    return {k: value[k] for k in keys if k in value}


def nutrient(value):
    result = pick(value, ['name', 'amount', 'unit', 'normalized_amount', 'status', 'qualifier'])
    if 'composition' in value:
        result['composition'] = [nutrient(n) for n in value['composition']]
    return result


def food(value):
    result = pick(value, FOOD)
    for key in ['type', 'subtype', 'state', 'substate']:
        if key in value:
            result[key] = pick(value[key], ['id', 'name', 'slug']) if value[key] else None
    if 'density' in value:
        d = value['density']
        result['density'] = pick(d, ['id', 'description', 'density', 'unit']) if isinstance(d, dict) else d
    if 'source_metadata' in value:
        result['source_metadata'] = pick(value['source_metadata'] or {}, META)
    if 'nutrients' in value:
        result['nutrients'] = [nutrient(n) for n in value['nutrients']]
    for key in ['custom_servings', 'custom_serving_by_subtype']:
        if key in value:
            c = value[key]
            result[key] = None if c is None else {
                **pick(c, ['id', 'name', 'slug', 'food_subtype']),
                'serving_units': [pick(o, ['id', 'option_id', 'name', 'long_name', 'weight',
                    'weight_unit', 'volume_in_ml', 'is_default', 'source']) for o in c.get('serving_units', [])]}
    if 'serving_profile' in value:
        profile = value['serving_profile']
        result['serving_profile'] = None if profile is None else {
            **pick(profile, ['id', 'code', 'name', 'legacy_slug']),
            'options': [pick(o, ['id', 'serving_profile_id', 'label', 'gram_weight',
                'milliliter_volume', 'sort_order', 'is_default', 'source',
                'legacy_serving_unit_id']) for o in profile.get('options', [])]}
    def row(r):
        return {**pick(r, ROW), 'ingredient': food(r['ingredient']) if r.get('ingredient') else None}
    if 'recipe_ingredients' in value:
        result['recipe_ingredients'] = [row(r) for r in value['recipe_ingredients']]
    if 'recipe' in value:
        r = value['recipe']
        result['recipe'] = None if r is None else pick(r, RECIPE)
        if r and 'ingredients' in r:
            result['recipe']['ingredients'] = [row(x) for x in r['ingredients']]
    return result


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def main():
    src = Path(sys.argv[1])
    manifest = {'request_headers': {'Origin': 'https://juanutrisyon.info'},
                'authentication': 'none; no cookies or API key', 'captures': []}
    for key in [*SLUGS, 'search', 'search-rice', 'not-found', 'preflight', 'source-rice', 'app-config']:
        raw_headers = (src / f'jn-visualizer-{key}-headers.txt').read_text()
        matches = re.findall(r'^HTTP/\S+ (\d+)', raw_headers, re.M)
        status = int(matches[-1])
        headers = {}
        for line in raw_headers.splitlines():
            if ':' in line:
                k, v = line.split(':', 1)
                if k.lower() in HEADERS:
                    headers[k.lower()] = v.strip()
        captured = parsedate_to_datetime(headers['date']).astimezone(timezone.utc).isoformat()
        method = 'OPTIONS' if key == 'preflight' else 'GET'
        base = 'https://api.juanutrisyon.info/api/foods'
        if key in SLUGS:
            url = base + '/' + SLUGS[key]
            payload = food(json.loads((src / f'jn-visualizer-{key}.json').read_text()))
        elif key.startswith('search'):
            query = 'kanin' if key == 'search' else 'rice'
            url = base + f'?description={query}&page=1'
            raw = json.loads((src / f'jn-visualizer-{key}.json').read_text())
            payload = {**pick(raw, ['current_page', 'per_page', 'total', 'last_page']),
                       'data': [food(f) for f in raw['data']]}
        elif key == 'not-found':
            url = base + '/visualizer-phase-1-no-such-public-food'
            raw = json.loads((src / f'jn-visualizer-{key}.json').read_text())
            payload = {'message': raw['message']}
        elif key == 'preflight':
            url = base + '/rice-well-milled-boiled'
            payload = None
        elif key == 'source-rice':
            url = 'https://i.fnri.dost.gov.ph/fct/library/report/2982'
            raw = (src / 'jn-visualizer-source-rice.html').read_text()
            payload = {'title': re.search(r'<title>(.*?)</title>', raw, re.S)[1].strip(),
                       'review_status': 'unavailable; source content not verified'}
        else:
            url = 'https://app.juanutrisyon.info/food/rice-well-milled-boiled'
            raw = (src / 'jn-visualizer-app-config.html').read_text()
            payload = {'apiBaseUri': re.search(r'apiBaseUri:"([^"]+)"', raw)[1]}
        path = OUT / 'captured' / f'{key}.json'
        write(path, payload)
        entry = {'key': key, 'method': method, 'url': url, 'captured_at_utc': captured,
                 'status': status, 'response_headers': headers,
                 'file': f'captured/{key}.json',
                 'sanitized_sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
        if key in SLUGS:
            entry.update(pick(payload, ['id', 'description_slug', 'data_source', 'serving_size', 'serving_size_unit']))
        if key in ['source-rice', 'app-config']:
            entry['origin_header_sent'] = False
        manifest['captures'].append(entry)
    write(OUT / 'manifest.json', manifest)
    write(OUT / 'synthetic/rate-limited.json', {
        'fixture_kind': 'synthetic_transport_case', 'observed_production_429': False,
        'status': 429, 'body': {'message': 'Too many requests.'},
        'scenarios': [
            {'name': 'readable_retry_after', 'headers': {'retry-after': '60',
                'access-control-expose-headers': 'Retry-After'}},
            {'name': 'unexposed_retry_after', 'headers': {'retry-after': '60'},
             'browser_readable_retry_after': None}]})
    print(f'Wrote {len(manifest["captures"])} sanitized captures and one explicitly synthetic 429 fixture.')


if __name__ == '__main__':
    main()
