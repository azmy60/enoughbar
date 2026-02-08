import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject?version=2.0';
import { string } from '../utils';

export default class ClockComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Clock',
                Template: 'resource:///components/Clock.ui',
                InternalChildren: ['popover', 'calendar'],
                Properties: {
                    ...string('label'),
                },
            },
            this
        );
    }

    declare label: string;
    declare _popover: Gtk.Popover;
    declare _calendar: Gtk.Calendar;

    constructor() {
        super();

        this.label = GLib.DateTime.new_now_local().format('%H:%M')!;
        const interval = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
            this.label = GLib.DateTime.new_now_local().format('%H:%M')!;
            return GLib.SOURCE_CONTINUE;
        });
        this.connect('destroy', () => GLib.Source.remove(interval));

        // everytime popover is opened, select current day
        this._popover.connect('notify::visible', ({ visible }) => {
            if (visible) {
                this._calendar.select_day(GLib.DateTime.new_now_local());
            }
        });
    }
}
