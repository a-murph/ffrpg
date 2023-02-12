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

    // Calculate Delay based on Agility
    const actorAgi = systemData.abilities.agi.value;
    let actorDelay = 26;
    if (actorAgi <= 1) actorDelay = 26       // Agility should never be lower than 1, but lower values are included as a failsafe
    else if (actorAgi === 2) actorDelay = 24
    else if (actorAgi === 3) actorDelay = 22
    else if (actorAgi === 4) actorDelay = 20
    else if (actorAgi <= 6) actorDelay = 16  // Agility is 5-6
    else if (actorAgi <= 8) actorDelay = 15  // Agility is 7-8
    else if (actorAgi <= 10) actorDelay = 14 // Agility is 9-10
    else if (actorAgi <= 13) actorDelay = 13 // Agility is 11-13
    else if (actorAgi <= 16) actorDelay = 12 // Agility is 14-16
    else if (actorAgi <= 19) actorDelay = 11 // Agility is 17-19
    else if (actorAgi <= 22) actorDelay = 10 // Agility is 19-22
    else if (actorAgi <= 28) actorDelay = 9  // Agility is 23-28
    else if (actorAgi <= 34) actorDelay = 8  // Agility is 29-34
    else if (actorAgi <= 43) actorDelay = 7  // Agility is 35-43
    else if (actorAgi <= 59) actorDelay = 6  // Agility is 44-59
    else if (actorAgi <= 77) actorDelay = 5  // Agility is 60-77
    else if (actorAgi <= 98) actorDelay = 4  // Agility is 78-98
    else if (actorAgi >= 99) actorDelay = 3  // Agility should never be higher than 99, but higher calues are invluded as a failsafe

    systemData.delay = { "value": actorDelay };
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = (systemData.cr * systemData.cr) * 100;
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
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.level) {
      data.lvl = data.level.value ?? 0;
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