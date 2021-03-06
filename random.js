const randomInt = require("random-int");
const randomItem = require("random-item");

const letters = "abcdefghijklmnopqrstuvxyz".split("");

// Source: https://github.com/estools/esfuzz/blob/3805af61eb6a6836dad11f5cd21665f242ae6e1e/src/random.coffee#L6-L29
const whitespace = [
  // ES5 7.2
  "\x09", // Horizontal Tab (\t)
  "\x0b", // Vertical Tab (\v)
  "\x0c", // Form Feed (\f)
  "\ufeff", // Byte Order Mark
  // Unicode category Zs (Separator, space)
  "\x20", // SPACE
  "\xa0", // NO-BREAK SPACE
  // Disabled since they make inspecting the random JS painful:
  // "\u1680", // OGHAM SPACE MARK
  "\u180e", // MONGOLIAN VOWEL SEPARATOR
  "\u2000", // EN QUAD
  "\u2001", // EM QUAD
  "\u2002", // EN SPACE
  "\u2003", // EM SPACE
  "\u2004", // THREE-PER-EM SPACE
  "\u2005", // FOUR-PER-EM SPACE
  "\u2006", // SIX-PER-EM SPACE
  "\u2007", // FIGURE SPACE
  "\u2008", // PUNCTUATION SPACE
  "\u2009", // THIN SPACE
  "\u200a", // HAIR SPACE
  "\u202f", // NARROW NO-BREAK SPACE
  "\u205f", // MEDIUM MATHEMATICAL SPACE
  "\u3000" // IDEOGRAPHIC SPACE
];

const lineTerminators = [
  "\n", // Line Feed
  "\r", // Carriage Return
  "\r\n" // Line Feed + Carriage Return
  // Disabled since they make inspecting the random JS painful:
  // "\u2028", // LINE SEPARATOR
  // "\u2029" // PARAGRAPH SEPARATOR
];

function randomArray(length, randomItem) {
  return [...Array(length)].map(() => randomItem());
}

function randomString(length, randomChar) {
  return randomArray(length, randomChar).join("");
}

function randomLineTerminator() {
  return randomItem(lineTerminators);
}

function randomWhitespace() {
  return randomItem(whitespace);
}

function randomSingleLineComment() {
  const chars = whitespace.concat(letters);
  const contents = randomString(randomInt(20), () => randomItem(chars));
  const newline = randomLineTerminator();
  return `//${contents}${newline}`;
}

function randomMultiLineComment({ allowNewlines = false } = {}) {
  const chars = whitespace.concat(
    allowNewlines ? lineTerminators : [],
    letters
  );
  const contents = randomString(randomInt(20), () => randomItem(chars));
  return `/*${contents}*/`;
}

const randomInsignificantJSChoices = [randomWhitespace, randomMultiLineComment];

const randomInsignificantJSChoicesWithNewlines = [
  () => randomLineTerminator().repeat(randomInt(1, 2)),
  randomWhitespace,
  randomSingleLineComment,
  () => randomMultiLineComment({ allowNewlines: true })
];

function randomInsignificantJS(length, { allowNewlines = false } = {}) {
  const choices = allowNewlines
    ? randomInsignificantJSChoicesWithNewlines
    : randomInsignificantJSChoices;

  return randomString(length, () => randomItem(choices)());
}

module.exports = {
  bool: () => Math.random() < 0.5,
  int: randomInt,
  item: randomItem,
  array: randomArray,
  string: randomString,
  lineTerminator: randomLineTerminator,
  whitespace: randomWhitespace,
  singleLineComment: randomSingleLineComment,
  multiLineComment: randomMultiLineComment,
  insignificantJS: randomInsignificantJS
};
