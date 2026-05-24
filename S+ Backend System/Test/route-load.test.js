const test = require("node:test");
const assert = require("node:assert/strict");

test("distance router loads and exposes POST root route", () => {
  const router = require("../API/Radar/Router/Distance/Post_Distance");

  assert.equal(typeof router, "function");
  assert.ok(Array.isArray(router.stack));

  const hasPostRootRoute = router.stack.some((layer) => {
    return (
      layer?.route?.path === "/" &&
      layer.route.methods &&
      layer.route.methods.post
    );
  });

  assert.equal(hasPostRootRoute, true);
});

test("records router exposes all expected resource routes", () => {
  const router = require("../API/Radar/Router/Radar/Records");
  const paths = router.stack
    .map((layer) => layer?.route?.path)
    .filter((path) => typeof path === "string")
    .sort();

  assert.deepEqual(paths, ["/distance", "/identification", "/radar", "/speed"]);
});

test("records controller exports all list/create handlers", () => {
  const recordsController = require("../API/Radar/Controller/Radar/Records");

  [
    "listDistance",
    "createDistance",
    "listSpeed",
    "createSpeed",
    "listIdentification",
    "createIdentification",
    "listRadar",
    "createRadar",
  ].forEach((handlerName) => {
    assert.equal(typeof recordsController[handlerName], "function");
  });
});
