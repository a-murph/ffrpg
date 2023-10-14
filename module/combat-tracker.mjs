export default class FFRPGCombatTracker extends CombatTracker {
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "./systems/ffrpg/templates/ui/combat-tracker.html"
    });
  }
}