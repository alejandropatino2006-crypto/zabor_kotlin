/// <reference types='codeceptjs' />

import userSteps from "./userSteps";

function steps() {

  return actor({
    ...userSteps,
  });
}

module.exports = steps;
