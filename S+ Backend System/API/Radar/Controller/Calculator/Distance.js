const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");

const Distance = require("../../Model/Distance/DistanceModel");

const distanceController = new (class DistanceController extends Status {})();

module.exports = {};
