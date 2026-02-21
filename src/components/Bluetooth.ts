import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject?version=2.0';
import AstalBluetooth from 'gi://AstalBluetooth';
import { BluetoothItem } from './BluetoothItem';

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

    declare _list_box: Gtk.ListBox;

    private listStore = Gio.ListStore.new(
        AstalBluetooth.Device.$gtype
    ) as Gio.ListStore<AstalBluetooth.Device>;

    constructor() {
        super();

        const bluetooth = AstalBluetooth.get_default();

        this._list_box.bind_model(this.listStore, device => {
            return new Gtk.ListBoxRow({ child: new BluetoothItem(device) });
        });

        this.listStore.splice(0, 0, bluetooth.devices);

        bluetooth.connect('device-added', (_, device) =>
            this.listStore.append(device)
        );

        bluetooth.connect('device-removed', (_, device) => {
            const [found, idx] = this.listStore.find(device);
            if (found) {
                this.listStore.remove(idx);
            }
        });
    }
}
