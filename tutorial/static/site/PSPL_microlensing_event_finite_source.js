console.log("Executing PSPL_microlensing_event_finite_source.js");

var PSPL_microlensing_event_finite_source = (function() {
  var eventModule = PSPL_microlensing_event;
  var lensPlaneModule = PSPL_microlensing_event_lens_plane;
  var tableModule = PSPL_microlensing_event_finite_source_table;

  // Old interpolation function no longer used. Replaced with library.
  /*
  function interpolateValues(xValue, xTable, yTable, lowerIndex, upperIndex) {
    var lowerX = xTable[lowerIndex];
    var upperX = xTable[upperIndex];

    var lowerY = yTable[lowerIndex];
    var upperY = yTable[upperIndex];

    if (xValue === lowerX) {
      var yValue = lowerY;
    }

    else if (xValue === upperX) {
      var yValue = upperY;
    }
    else {
      // line between two points (x1, x2) and (y1, y2):
      // y - y1 = slope * (x - x1)
      // slope = (y2 - y1) / (x2 - x1)

      // slope of line from (lowerX, lowerY) to (upperX, upperY)
      var slope = (upperY - lowerY)/(upperX - lowerX);
      // y = slope * (x - x1) + y1
      var yValue = slope*(xValue - lowerX) + lowerY;
    }

    return yValue;
  }
  */

  // Old O(n) linear search, no longer used.
  //  Replaced by library using binary search aglorithm.
  /*
  function interpolateFromTables(xValue, xTable, yTable) {
    for (var i=0; i < xTable.length; i++) {
      currentX = xTable[i];
      if (currentX > xValue) {

        if (i === 0) {
          var yValue = yTable[i];
        }

        else {
          var lowerIndex = i-1;
          var yValue = interpolateValues(xValue, xTable, yTable, lowerIndex, i); // for testing
          // var yValue = yTable[i];
        }

        break;
      }

      else if (i === xTable.length-1) {
        var yValue = yTable[i];
      }
    }

    return yValue;
  }
  */

  function getFiniteSourceFactor(u) {
    var sourceRadius = lensPlaneModule.sourceRadius;
    var thetaE_mas = eventModule.thetaE_mas;
    var table = tableModule.table;

    var rhoNormalized = sourceRadius / thetaE_mas;

    var z = u/rhoNormalized;

    var zColumn = table.z;
    var B0column = table.B0;

    var B0 = everpolate.linear(z, zColumn, B0column);
    // var B0 = interpolateFromTables(z, zColumn, B0column)

    if (typeof this.printedOnce === "undefined" || this.printedOnce === false
  || (z > 1.01 && z < 1.02)) {
      // console.log(`finite source table 1: ${table[1.00010001]}`);
      // console.log(`finite source table index: ${tableIndex}`);
      // console.log(`finite source u/rho: ${u/rhoNormalized}`);
      // console.log(`finite source correction factor: ${correctionFactor}`);
      console.log(`finite source z: ${z}`);
      console.log(`finite source factor: ${B0}`);
      this.printedOnce = true;
    }
    return B0
  }


  return {
    getFiniteSourceFactor: getFiniteSourceFactor,
  };

})();
