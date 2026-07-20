# React Migration Notes

## Current DOM approach

app.js manually finds containers and replaces innerHTML.

Example:
document.querySelector("#overview")
container.innerHTML = metrics.map(...).join("")

## React approach

React components return UI based on data.

Instead of manually finding the page and inserting HTML, we write components like:

MetricGrid(metrics)

## First component to migrate

MetricGrid

Inputs:
- metrics array

Output:
- four metric cards