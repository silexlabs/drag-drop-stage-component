define(["require", "exports", "./utils/Events", "./flux/UiState", "./flux/SelectionState", "./Types"], function (require, exports, Events_1, UiState_1, SelectionState_1, Types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Keyboard = void 0;
    class Keyboard {
        constructor(win, store, hooks) {
            this.win = win;
            this.store = store;
            this.hooks = hooks;
            this.unsubscribeAll = [];
            // events from inside the iframe
            this.unsubscribeAll.push(Events_1.addEvent(window, 'keydown', (e) => this.onKeyDown(e)), Events_1.addEvent(win, 'keydown', (e) => this.onKeyDown(e)));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * handle shortcuts
         */
        onKeyDown(e) {
            const key = e.key;
            const state = this.store.getState();
            const target = e.target;
            if (state.ui.catchingEvents &&
                target.tagName.toLowerCase() !== 'input' &&
                target.tagName.toLowerCase() !== 'textarea' &&
                !target.hasAttribute('contenteditable')) {
                switch (key) {
                    case 'Escape':
                        if (state.ui.mode !== Types_1.UiMode.NONE) {
                            this.store.dispatch(UiState_1.setMode(Types_1.UiMode.NONE));
                            this.store.dispatch(SelectionState_1.reset());
                        }
                        break;
                    case 'Enter':
                        if (this.hooks.onEdit)
                            this.hooks.onEdit();
                        break;
                    default:
                        return;
                }
                // only if we catched a shortcut
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }
    exports.Keyboard = Keyboard;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2V5Ym9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvS2V5Ym9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU1BLE1BQWEsUUFBUTtRQUNuQixZQUFvQixHQUFXLEVBQVUsS0FBaUIsRUFBVSxLQUFZO1lBQTVELFFBQUcsR0FBSCxHQUFHLENBQVE7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBTztZQVF4RSxtQkFBYyxHQUFzQixFQUFFLENBQUM7WUFQN0MsZ0NBQWdDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUN0QixpQkFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3BFLGlCQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDbEUsQ0FBQztRQUNKLENBQUM7UUFHRCxPQUFPO1lBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRDs7V0FFRztRQUNLLFNBQVMsQ0FBQyxDQUFnQjtZQUNoQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQXFCLENBQUM7WUFFdkMsSUFBRyxLQUFLLENBQUMsRUFBRSxDQUFDLGNBQWM7Z0JBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEtBQUssT0FBTztnQkFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxVQUFVO2dCQUMzQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDekMsUUFBTyxHQUFHLEVBQUU7b0JBQ1YsS0FBSyxRQUFRO3dCQUNYLElBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssY0FBTSxDQUFDLElBQUksRUFBRTs0QkFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQU8sQ0FBQyxjQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsc0JBQUssRUFBRSxDQUFDLENBQUM7eUJBQzlCO3dCQUNELE1BQU07b0JBQ1IsS0FBSyxPQUFPO3dCQUNWLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNOzRCQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQzFDLE1BQU07b0JBQ1I7d0JBQ0UsT0FBTztpQkFDVjtnQkFDRCxnQ0FBZ0M7Z0JBQ2hDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ3JCO1FBQ0gsQ0FBQztLQUNGO0lBNUNELDRCQTRDQyJ9