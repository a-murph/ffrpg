/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class FFRPGActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.ffrpg || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Loop through stat scores, and add their modifiers to our sheet output.
    for (let [key, stat] of Object.entries(systemData.stats)) {
      // Calculate the modifier using d20 rules.
      stat.mod = Math.floor((stat.value - 10) / 2);
    }

    // Set value of Delay based on Agility
    systemData.attributes.delay.value = this._prepareDelayValue(systemData);
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = (systemData.attributes.level.value * systemData.attributes.level.value) * 5;
  }

  _prepareDelayValue(systemData) {
    if (systemData.attributes.delay.override) {
      return systemData.attributes.delay.override;
    }

    const agiValue = systemData.stats.agi.value;
    if (agiValue >= 99) {
      return 3;
    } else if (agiValue >= 78) {
      return 4;
    } else if (agiValue >= 60) {
      return 5;
    } else if (agiValue >= 44) {
      return 6;
    } else if (agiValue >= 35) {
      return 7;
    } else if (agiValue >= 29) {
      return 8;
    } else if (agiValue >= 23) {
      return 9;
    } else if (agiValue >= 20) {
      return 10;
    } else if (agiValue >= 17) {
      return 11;
    } else if (agiValue >= 14) {
      return 12;
    } else if (agiValue >= 11) {
      return 13;
    } else if (agiValue >= 9) {
      return 14;
    } else if (agiValue >= 7) {
      return 15;
    } else if (agiValue >= 5) {
      return 16;
    } else if (agiValue >= 4) {
      return 20;
    } else if (agiValue >= 3) {
      return 22;
    } else if (agiValue >= 2) {
      return 24;
    } else {
      return 26;
    }
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.stats) {
      for (let [k, v] of Object.entries(data.stats)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 1.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 1;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}