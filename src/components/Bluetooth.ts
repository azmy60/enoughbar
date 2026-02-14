import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import AstalBluetooth from 'gi://AstalBluetooth';

export default class Bluetooth extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Bluetooth',
                Template: 'resource:///components/Bluetooth.ui',
                InternalChildren: ['list_box'],
            },
            this
        );
    }

    declare _list_box: Gtk.Box;

    private devices: {
        device: AstalBluetooth.Device;
        box: Gtk.Box;
    }[] = [];

    constructor() {
        super();

        const bluetooth = AstalBluetooth.get_default();

        bluetooth.devices.forEach(device => this.addDevices(device));

        bluetooth.connect('device-added', (_, device) =>
            this.addDevices(device)
        );

        bluetooth.connect('device-removed', (_, device) =>
            this.removeDevice(device)
        );
    }

    addDevices(device: AstalBluetooth.Device): void {
        const box = new Gtk.Box();
        box.append(new Gtk.Label({ label: device.name }));
        this.devices.push({ device, box });
        this._list_box.append(box);
    }

    removeDevice(device: AstalBluetooth.Device): void {
        const idx = this.devices.findIndex(d => d.device.name === device.name);
        if (idx === -1) return;
        this._list_box.remove(this.devices[idx].box);
        this.devices.splice(idx, 1);
    }
}
