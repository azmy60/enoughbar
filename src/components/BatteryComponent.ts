import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery';
import GObject from 'gi://GObject?version=2.0';
import { string, SYNC } from '../utils';

export default class BatteryComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Battery',
                Template: 'resource:///components/Battery.ui',
                Properties: {
                    ...string('label'),
                    ...string('icon'),
                },
            },
            this
        );
    }

    declare label: string;

    constructor() {
        super();

        const bat = AstalBattery.get_default();

        bat.bind_property('icon-name', this, 'icon', SYNC);

        this.label = `${Math.floor(bat.percentage * 100)}%`;
        const batteryId = bat.connect('notify::percentage', () => {
            this.label = `${Math.floor(bat.percentage * 100)}%`;
        });

        this.connect('destroy', () => {
            AstalBattery.get_default().disconnect(batteryId);
        });
    }
}
