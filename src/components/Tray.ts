import AstalTray from 'gi://AstalTray';
import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import { SYNC } from '../utils';

export default class TrayComponent extends Gtk.Box {
    static {
        GObject.registerClass({ GTypeName: 'Tray' }, this);
    }

    constructor() {
        super();

        const tray = AstalTray.get_default();
        const trayItems = new Map<string, Gtk.MenuButton>();

        const trayId1 = tray.connect('item-added', (_, id) => {
            const item = tray.get_item(id);
            const popover = Gtk.PopoverMenu.new_from_model(item.menu_model);
            const icon = new Gtk.Image();
            const button = new Gtk.MenuButton({ popover, child: icon });

            item.bind_property('gicon', icon, 'gicon', SYNC);
            popover.insert_action_group('dbusmenu', item.action_group);
            popover.hasArrow = false;
            item.connect('notify::action-group', () => {
                popover.insert_action_group('dbusmenu', item.action_group);
            });

            trayItems.set(id, button);
            this.append(button);
        });

        const trayId2 = tray.connect('item-removed', (_, id) => {
            const button = trayItems.get(id);

            if (button) {
                this.remove(button);
                button.run_dispose();
                trayItems.delete(id);
            }
        });

        this.connect('destroy', () => {
            tray.disconnect(trayId1);
            tray.disconnect(trayId2);
        });
    }
}
