"""Offline evidence checks, not calculator parity or production-release tests."""
import hashlib
import json
import unittest
from decimal import Decimal
from pathlib import Path

FIXTURES = Path(__file__).resolve().parents[1] / 'tests/food-visualizer/fixtures'


def read(name):
    return json.loads((FIXTURES / name).read_text())


def nodes(values):
    for value in values:
        yield value
        yield from nodes(value.get('composition', []))


class PublicEvidenceTests(unittest.TestCase):
    def test_capture_integrity_and_origins(self):
        entries = read('manifest.json')['captures']
        self.assertEqual(len(entries), 14)
        self.assertEqual(len({e['key'] for e in entries}), 14)
        for e in entries:
            self.assertTrue(e['url'].startswith(('https://api.juanutrisyon.info/',
                'https://app.juanutrisyon.info/', 'https://i.fnri.dost.gov.ph/')))
            self.assertTrue(e['captured_at_utc'].startswith('2026-10-23'))
            self.assertEqual(hashlib.sha256((FIXTURES / e['file']).read_bytes()).hexdigest(),
                             e['sanitized_sha256'])

    def test_no_identity_secrets_or_debug_details(self):
        forbidden = {'user_id', 'user', 'email', 'firebase_user_id', 'firebase_username',
                     'raw_data', 'raw_data2', 'api_key', 'authorization', 'cookie',
                     'set-cookie', 'exception', 'trace', 'file_path', 'procedure'}
        def visit(value):
            if isinstance(value, dict):
                self.assertFalse(forbidden.intersection(value), forbidden.intersection(value))
                for child in value.values():
                    visit(child)
            elif isinstance(value, list):
                for child in value:
                    visit(child)
        for path in FIXTURES.rglob('*.json'):
            visit(json.loads(path.read_text()))

    def test_rice_identity_and_canonical_legacy_serving_distinction(self):
        rice = read('captured/rice.json')
        self.assertEqual((rice['id'], rice['custom_id']), (78, 'A020'))
        option = rice['serving_profile']['options'][0]
        self.assertEqual((option['id'], option['legacy_serving_unit_id']), (206, 168))
        self.assertTrue(option['is_default'])
        self.assertEqual(option['source'], 'legacy_custom_servings')
        self.assertEqual(Decimal(option['gram_weight']), Decimal(80))
        carbs = next(n for n in nodes(rice['nutrients']) if n['name'] == 'total carbohydrates')
        # Snapshot evidence arithmetic only; shared-core parity belongs to Phase 3.
        self.assertEqual(Decimal(carbs['amount']) * Decimal(option['gram_weight']) /
                         Decimal(rice['serving_size']), Decimal('23.76'))
        self.assertEqual(rice, read('captured/rice-repeat.json'))

    def test_source_units_and_missing_nodes_are_preserved(self):
        coke = read('captured/coke.json')
        self.assertEqual((coke['serving_size'], coke['serving_size_unit']), ('240.000', 'mL'))
        self.assertIsNone(coke['custom_servings'])
        self.assertTrue(coke['nutrition_label_image'].startswith('http://localhost/storage/'))
        patis = read('captured/patis.json')
        self.assertNotIn('sugar', {n['name'] for n in nodes(patis['nutrients'])})
        gata = {n['name']: Decimal(n['amount']) for n in nodes(read('captured/gata.json')['nutrients'])}
        self.assertLessEqual(gata['saturated fat'], gata['total fat'])

    def test_recipe_retains_incomplete_ingredient_evidence(self):
        recipe = read('captured/recipe.json')
        self.assertEqual(recipe['id'], 19346)
        self.assertEqual(len(recipe['recipe_ingredients']), 9)
        salt = next(r['ingredient'] for r in recipe['recipe_ingredients'] if r['ingredient']['id'] == 1884)
        self.assertNotIn('sugar', {n['name'] for n in nodes(salt['nutrients'])})
        self.assertEqual(recipe['recipe']['ingredients'], recipe['recipe_ingredients'])
        self.assertIn('source_metadata', salt)

    def test_search_preserves_envelope_ranking_and_empty_result(self):
        full = read('captured/search-rice.json')
        self.assertEqual((full['current_page'], full['per_page'], full['total']), (1, 20, 528))
        self.assertEqual(len(full['data']), 20)
        self.assertEqual(read('captured/search.json')['data'], [])
        self.assertEqual(read('captured/search.json')['total'], 0)

    def test_source_and_transport_limitations_are_explicit(self):
        entries = {e['key']: e for e in read('manifest.json')['captures']}
        self.assertEqual(entries['source-rice']['status'], 503)
        self.assertEqual(entries['not-found']['status'], 404)
        self.assertEqual(entries['preflight']['status'], 204)
        self.assertEqual(entries['rice']['response_headers']['access-control-allow-origin'], '*')
        self.assertNotIn('access-control-expose-headers', entries['rice']['response_headers'])
        self.assertEqual(set(read('captured/not-found.json')), {'message'})
        self.assertFalse(read('synthetic/rate-limited.json')['observed_production_429'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
