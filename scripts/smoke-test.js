const elements = {};

function elementFor(selector) {
  if (!elements[selector]) {
    elements[selector] = {
      innerHTML: "",
      addEventListener: function () {},
    };
  }

  return elements[selector];
}

global.document = {
  querySelector: elementFor,
};

require("../app.js");

function countRendered(selector, className) {
  const html = elementFor(selector).innerHTML;
  const pattern = new RegExp(`class="${className}"`, "g");

  return (html.match(pattern) || []).length;
}

const results = {
  metrics: countRendered("#overview", "metric"),
  pullRequests: countRendered("#pull-request-list", "list-row"),
  qualitySignals: countRendered("#quality-list", "signal"),
  suggestions: countRendered("#suggestion-list", "suggestion"),
};

const expected = {
  metrics: 4,
  pullRequests: 3,
  qualitySignals: 4,
  suggestions: 3,
};

const failures = Object.entries(expected).filter(
  ([key, expectedValue]) => results[key] !== expectedValue,
);

if (failures.length > 0) {
  console.error("Smoke test failed:", { expected, results });
  process.exit(1);
}

console.log("Smoke test passed:", results);

