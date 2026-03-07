function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickBehavior(roll) {
  const forcedBehavior = String(process.env.SIMULATION_BEHAVIOR || '')
    .trim()
    .toLowerCase();

  if (forcedBehavior === 'delay' || forcedBehavior === 'faster' || forcedBehavior === 'normal') {
    return forcedBehavior;
  }

  if (roll < 0.4) {
    return 'delay';
  }
  if (roll < 0.8) {
    return 'faster';
  }
  return 'normal';
}

function createRandomSimulationInput() {
  const initialEtaMin = randomInt(30, 50);
  const behaviorRoll = Math.random();
  const behavior = pickBehavior(behaviorRoll);

  const delayTriggerMin = Math.max(12, Math.floor(initialEtaMin * 0.55));
  const delayTriggerMax = Math.max(delayTriggerMin, Math.floor(initialEtaMin * 0.8));
  const fasterTriggerMin = Math.max(8, Math.floor(initialEtaMin * 0.35));
  const fasterTriggerMax = Math.max(fasterTriggerMin, Math.floor(initialEtaMin * 0.65));

  return {
    initialEtaMin,
    behaviorRoll: Number(behaviorRoll.toFixed(4)),
    behavior,
    tickIntervalMs: 1000,
    delayTriggerEtaMin: randomInt(delayTriggerMin, delayTriggerMax),
    delayHoldTicks: randomInt(6, 12),
    delaySlowProgressChance: Number((0.15 + Math.random() * 0.25).toFixed(2)),
    fasterDropTriggerEtaMin: randomInt(fasterTriggerMin, fasterTriggerMax),
    fasterDropTargetEtaMin: randomInt(0, 3),
    fasterActualBufferMin: randomInt(0, 2),
    fasterBoostTicks: randomInt(4, 8),
    fasterExtraDropChance: Number((0.55 + Math.random() * 0.35).toFixed(2))
  };
}

function clampToZero(value) {
  return Math.max(0, value);
}

function capSingleStepDrop(currentEta, targetEta, maxDropPerTick) {
  const floorValue = clampToZero(currentEta - maxDropPerTick);
  return Math.max(targetEta, floorValue);
}

function resolvePhase(currentEtaMin, initialEtaMin) {
  if (currentEtaMin <= 0) {
    return 'delivered';
  }

  const ratio = currentEtaMin / Math.max(initialEtaMin, 1);

  if (ratio > 0.75) {
    return 'accepted';
  }
  if (ratio > 0.45) {
    return 'preparing';
  }
  if (ratio > 0.2) {
    return 'on_the_way';
  }
  return 'arriving_soon';
}

function getAgencyActor(condition) {
  const agency = condition.agency || 'driver';
  const agencyText = {
    driver: 'your delivery partner',
    system: 'our live routing system',
    restaurant: 'the restaurant team'
  };
  return agencyText[agency] || agencyText.driver;
}

function getEmotionPrefix(condition) {
  const emotion = condition.emotion || 'neutral';
  const prefixMap = {
    neutral: '',
    reassuring: 'Thanks for your patience. ',
    urgency: 'We are prioritizing this order. '
  };
  return prefixMap[emotion] || prefixMap.neutral;
}

function buildMessage({ condition, phase, etaMin, isDelayActive, fasterDropAppliedNow }) {
  const actor = getAgencyActor(condition);
  const prefix = getEmotionPrefix(condition);

  if (phase === 'placed') {
    return `${prefix}Order placed successfully.`;
  }

  if (phase === 'accepted') {
    return `${prefix}Restaurant accepted your order.`;
  }

  if (phase === 'preparing') {
    return `${prefix}Your food is being prepared.`;
  }

  if (phase === 'on_the_way' || phase === 'arriving_soon') {
    if (isDelayActive) {
      return `${prefix}${actor} is delayed by traffic.`;
    }

    if (fasterDropAppliedNow) {
      return `${prefix}${actor} found a faster route.`;
    }

    return `${prefix}${actor} is out for delivery.`;
  }

  return `${prefix}Order arrived. Enjoy your meal.`;
}

function createRuntimeState(simulationInput) {
  return {
    actualEtaMin: simulationInput.initialEtaMin,
    displayedEtaMin: simulationInput.initialEtaMin,
    delayStarted: false,
    delayTicksRemaining: 0,
    fasterDropDone: false,
    jumpUsed: false
  };
}

function advanceEta(runtime, simulationInput) {
  const behavior = simulationInput.behavior;
  const previousDisplayedEtaMin = runtime.displayedEtaMin;
  let isDelayActive = false;
  let fasterDropAppliedNow = false;

  if (behavior === 'delay') {
    if (
      !runtime.delayStarted &&
      runtime.displayedEtaMin <= simulationInput.delayTriggerEtaMin &&
      runtime.displayedEtaMin > 0
    ) {
      runtime.delayStarted = true;
      runtime.delayTicksRemaining = simulationInput.delayHoldTicks;
    }

    if (runtime.delayTicksRemaining > 0) {
      isDelayActive = true;
      runtime.delayTicksRemaining -= 1;

      if (Math.random() < simulationInput.delaySlowProgressChance) {
        runtime.actualEtaMin = clampToZero(runtime.actualEtaMin - 1);
      }
    } else {
      runtime.actualEtaMin = clampToZero(runtime.actualEtaMin - 1);
      runtime.displayedEtaMin = clampToZero(runtime.displayedEtaMin - 1);
    }
  } else if (behavior === 'faster') {
    runtime.actualEtaMin = clampToZero(runtime.actualEtaMin - 1);
    runtime.displayedEtaMin = clampToZero(runtime.displayedEtaMin - 1);

    if (
      !runtime.fasterDropDone &&
      runtime.displayedEtaMin <= simulationInput.fasterDropTriggerEtaMin &&
      runtime.displayedEtaMin > 0
    ) {
      runtime.fasterDropDone = true;
      fasterDropAppliedNow = true;
      runtime.displayedEtaMin = capSingleStepDrop(
        runtime.displayedEtaMin,
        simulationInput.fasterDropTargetEtaMin,
        10
      );
      // After the one jump, keep actual and displayed ETA aligned to avoid a second jump.
      runtime.actualEtaMin = runtime.displayedEtaMin;
    }
  } else {
    runtime.actualEtaMin = clampToZero(runtime.actualEtaMin - 1);
    runtime.displayedEtaMin = clampToZero(runtime.displayedEtaMin - 1);
  }

  if (runtime.actualEtaMin === 0) {
    runtime.displayedEtaMin = 0;
  }

  runtime.displayedEtaMin = Math.min(runtime.displayedEtaMin, runtime.actualEtaMin + 5);

  const maxSingleStepDrop = 10;
  const minimumAllowedDisplayedEta = clampToZero(previousDisplayedEtaMin - maxSingleStepDrop);
  runtime.displayedEtaMin = Math.max(runtime.displayedEtaMin, minimumAllowedDisplayedEta);

  const stepDrop = previousDisplayedEtaMin - runtime.displayedEtaMin;
  if (stepDrop > 1) {
    if (runtime.jumpUsed) {
      runtime.displayedEtaMin = clampToZero(previousDisplayedEtaMin - 1);
    } else {
      runtime.jumpUsed = true;
    }
  }

  if (behavior === 'faster') {
    // Keep actual and displayed aligned so post-jump ticks stay smooth.
    runtime.actualEtaMin = runtime.displayedEtaMin;
  }

  return {
    isDelayActive,
    fasterDropAppliedNow
  };
}

async function emitEvent({
  participantId,
  experimentId,
  roomId,
  io,
  onEvent,
  onDelivered,
  phase,
  message,
  etaMin
}) {
  const emittedAt = new Date().toISOString();

  await onEvent({
    participantId,
    experimentId,
    phase,
    message,
    etaMin
  });

  io.to(roomId).emit('order-update', {
    participantId,
    experimentId,
    phase,
    message,
    etaMin,
    emittedAt
  });

  if (phase === 'delivered') {
    await onDelivered({ participantId, experimentId });
    io.to(roomId).emit('order-delivered', {
      participantId,
      experimentId,
      emittedAt
    });
  }
}

function startDeliverySimulation({
  participantId,
  experimentId,
  roomId,
  condition,
  io,
  onEvent,
  onDelivered,
  simulationInput
}) {
  const input = simulationInput || createRandomSimulationInput();
  const runtime = createRuntimeState(input);

  let canceled = false;
  let timer = null;

  async function tick() {
    if (canceled) {
      return;
    }

    try {
      const { isDelayActive, fasterDropAppliedNow } = advanceEta(runtime, input);
      const phase = resolvePhase(runtime.actualEtaMin, input.initialEtaMin);
      const message = buildMessage({
        condition,
        phase,
        etaMin: runtime.displayedEtaMin,
        isDelayActive,
        fasterDropAppliedNow
      });

      await emitEvent({
        participantId,
        experimentId,
        roomId,
        io,
        onEvent,
        onDelivered,
        phase,
        message,
        etaMin: runtime.displayedEtaMin
      });

      if (phase === 'delivered') {
        canceled = true;
        return;
      }
    } catch (error) {
      console.error(
        `Simulation error for participant ${participantId}, experiment ${experimentId}`,
        error
      );
    }

    timer = setTimeout(tick, input.tickIntervalMs);
  }

  (async () => {
    try {
      const initialMessage = buildMessage({
        condition,
        phase: 'placed',
        etaMin: runtime.displayedEtaMin,
        isDelayActive: false,
        fasterDropAppliedNow: false
      });

      await emitEvent({
        participantId,
        experimentId,
        roomId,
        io,
        onEvent,
        onDelivered,
        phase: 'placed',
        message: initialMessage,
        etaMin: runtime.displayedEtaMin
      });
    } catch (error) {
      console.error(
        `Initial simulation event failed for participant ${participantId}, experiment ${experimentId}`,
        error
      );
    }

    timer = setTimeout(tick, input.tickIntervalMs);
  })();

  return () => {
    canceled = true;
    if (timer) {
      clearTimeout(timer);
    }
  };
}

module.exports = {
  createRandomSimulationInput,
  startDeliverySimulation
};
