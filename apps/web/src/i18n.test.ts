import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDictionary } from './i18n/index.js';

describe('i18n Dictionary', () => {
  it('returns French dictionary by default', () => {
    const dict = getDictionary('fr');
    assert.equal(dict.common.brand, 'Sao Tech Market');
    assert.equal(dict.nav.home, 'Accueil');
    assert.equal(dict.departments.electronique, 'Gadgets Électroniques');
  });

  it('returns English dictionary when requested', () => {
    const dict = getDictionary('en');
    assert.equal(dict.nav.home, 'Home');
    assert.equal(dict.departments.electronique, 'Electronic Gadgets');
  });

  it('falls back to French when unknown locale is given', () => {
    // @ts-expect-error Testing fallback
    const dict = getDictionary('es');
    assert.equal(dict.nav.home, 'Accueil');
  });
});

