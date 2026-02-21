import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import AstalBluetooth from 'gi://AstalBluetooth';
import { boolean, string, SYNC } from '../utils';

export class BluetoothItem extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'BluetoothItem',
                Template: 'resource:///components/BluetoothItem.ui',
                InternalChildren: ['percentage_label'],
                Properties: {
                    ...string('device-name', ''),
                    ...boolean('loading', false),
                    ...boolean('connected', false),
                    ...boolean('battery-visible', false),
                    ...string('battery-percentage', ''),
                    ...string('icon', ''),
                },
            },
            this
        );
    }

    declare device_name: string;
    declare loading: boolean;
    declare connected: boolean;

    private device: AstalBluetooth.Device;

    constructor(device: AstalBluetooth.Device) {
        super();

        this.device = device;

        device.bind_property('name', this, 'device-name', SYNC);
        device.bind_property('connecting', this, 'loading', SYNC);
        device.bind_property('connected', this, 'connected', SYNC);
        device.bind_property_full(
            'icon',
            this,
            'icon',
            SYNC,
            (_binding, value: string) => [true, `${value}-symbolic`],
            null
        );
        device.bind_property_full(
            'battery-percentage',
            this,
            'battery-percentage',
            SYNC,
            (_binding, value: number) => [true, `(${value}%)`],
            null
        );
        device.bind_property_full(
            'battery-percentage',
            this,
            'battery-visible',
            SYNC,
            (_binding, value: number) => [true, value >= 0],
            null
        );
    }

    on_toggle_connect() {
        if (this.connected) {
            try {
                this.loading = true;
                this.device.disconnect_device(() => {
                    this.loading = false;
                });
            } catch (e) {
                console.error('Error disconnecting device', e);
                this.loading = false;
            }
        } else {
            this.device.connect_device(null);
        }
    }
}
