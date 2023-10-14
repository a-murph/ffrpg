export default class FFRPGCombat extends Combat {
  /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * Sorts by Initiative (aka cooldown) from low to high, tiebreaking on highest Agility,
   *  then prioritizing players over NPCs, then arbitrarily based on Token ID
   * @private
   */
  _sortCombatants(a, b) {
    // Sort combatants by initiative (cooldown)
    let initA = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    let initB = Number.isNumeric(b.initiative) ? b.initiative : -9999;
    if (!initA) {
      initA = 0;
    }
    if (!initB) {
      initB = 0;
    }
    let initDiff = initA - initB;
    if (initDiff !== 0) {
      return Number(initDiff);
    }

    // Tie breaker: Highest Agility
    const agiA = a.actor.system.stats.agi.value;
    const agiB = b.actor.system.stats.agi.value;
    if (agiA !== agiB) {
      return agiB - agiA;
    }

    // Tie breaker: Players before non-players
    const typeA = a.actor.type;
    const typeB = b.actor.type;
    if (typeA != typeB) {
      if (typeA === "character") {
        return -1;
      } else if (typeB === 'character') {
        return 1;
      }
    }

    // Tie breaker: Arbitrary sort based on Token ID
    return a.tokenId - b.tokenId;
  }

  /**
   * Advance the combat to the next turn
   * @returns {Promise<Combat>}
   */
  async nextTurn() {
    const currentCombatant = this.combatant;
    const allCombatants = this.combatants;
    
    // 3 is a placeholder here; eventually this will be Delay * total Recovery of the turn
    await currentCombatant.update({ initiative: currentCombatant.actor.system.attributes.delay.value * 3 });

    // Cooldowns will be reduced by an amount equal to the lowest CD value any combatant has
    let cooldownReduction = null;
    allCombatants.forEach((combatant) => {
      if (cooldownReduction === null || combatant.initiative < cooldownReduction) {
        cooldownReduction = combatant.initiative;
      }
    });

    const updates = [];
    allCombatants.forEach((combatant) => {
      updates.push({_id: combatant._id, initiative: combatant.initiative - cooldownReduction});
    });

    // Update cooldown of all combatants
    await this.updateEmbeddedDocuments("Combatant", updates);

    // Sort turn order by new init values, then set the current turn to whoever's at the top of the list
    this.setupTurns();
    await this.update({ turn: 0 })
  }
}