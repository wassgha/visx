// Adapted from canvg
// Original: https://github.com/canvg/canvg/blob/master/src/Property.ts

import { compressSpaces, normalizeColor } from './util/string';

export class Property<T = unknown> {
  private readonly name: string;
  private value: T;

  static empty() {
    return new Property('EMPTY', '');
  }

  static readonly textBaselineMapping: Record<string, string> = {
    baseline: 'alphabetic',
    'before-edge': 'top',
    'text-before-edge': 'top',
    middle: 'middle',
    central: 'middle',
    'after-edge': 'bottom',
    'text-after-edge': 'bottom',
    ideographic: 'ideographic',
    alphabetic: 'alphabetic',
    hanging: 'hanging',
    mathematical: 'alphabetic',
  };

  private isNormalizedColor = false;

  constructor(name: string, value: T) {
    this.name = name;
    this.value = value;
  }

  split(separator = ' ') {
    const { name } = this;

    return compressSpaces(this.getString())
      .trim()
      .split(separator)
      .map((value: string) => new Property<string>(name, value));
  }

  hasValue(zeroIsValue?: boolean) {
    const value = this.value as unknown;

    return (
      value !== null && value !== '' && (zeroIsValue || value !== 0) && typeof value !== 'undefined'
    );
  }

  isString(regexp?: RegExp) {
    const { value } = this as unknown as Property<string>;
    const result = typeof value === 'string';

    if (!result || !regexp) {
      return result;
    }

    return regexp.test(value);
  }

  isUrlDefinition() {
    return this.isString(/^url\(/);
  }

  isPixels() {
    if (!this.hasValue()) {
      return false;
    }

    const asString = this.getString();

    switch (true) {
      case asString.endsWith('px'):
      case /^\d+$/.test(asString):
        return true;

      default:
        return false;
    }
  }

  setValue(value: T) {
    this.value = value;
    return this;
  }

  getValue(def?: T) {
    if (typeof def === 'undefined' || this.hasValue()) {
      return this.value;
    }

    return def;
  }

  getNumber(def?: T) {
    if (!this.hasValue()) {
      if (typeof def === 'undefined') {
        return 0;
      }

      // @ts-expect-error Parse unknown value.
      return parseFloat(def);
    }

    const { value } = this;
    // @ts-expect-error Parse unknown value.
    let n = parseFloat(value);

    if (this.isString(/%$/)) {
      n /= 100;
    }

    return n;
  }

  getString(def?: T): string {
    if (typeof def === 'undefined' || this.hasValue()) {
      return typeof this.value === 'undefined' ? '' : String(this.value);
    }

    return String(def);
  }

  getColor(def?: T) {
    let color = this.getString(def);

    if (this.isNormalizedColor) {
      return color;
    }

    this.isNormalizedColor = true;
    color = normalizeColor(color);
    this.value = color as unknown as T;

    return color;
  }

  getUnits() {
    return this.getString().replace(/[\d.-]/g, '');
  }

  getPixels(): number {
    if (!this.hasValue()) {
      return 0;
    }

    return this.getNumber();
  }

  getMilliseconds() {
    if (!this.hasValue()) {
      return 0;
    }

    if (this.isString(/ms$/)) {
      return this.getNumber();
    }

    return this.getNumber() * 1000;
  }

  getRadians() {
    if (!this.hasValue()) {
      return 0;
    }

    switch (true) {
      case this.isString(/deg$/):
        return this.getNumber() * (Math.PI / 180);

      case this.isString(/grad$/):
        return this.getNumber() * (Math.PI / 200);

      case this.isString(/rad$/):
        return this.getNumber();

      default:
        return this.getNumber() * (Math.PI / 180);
    }
  }

  getTextBaseline() {
    if (!this.hasValue()) {
      return null;
    }

    const key = this.getString();

    return Property.textBaselineMapping[key] || null;
  }
}
