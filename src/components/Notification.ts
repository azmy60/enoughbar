import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject?version=2.0';
import Notifd from 'gi://AstalNotifd';
import { AppContext } from '../types';
import NotificationBox from './NotificationBox';
import { boolean, string } from '../utils';
import { IntegerObject } from '../common/IntegerObject';

export default class NotificationComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Notification',
                Template: 'resource:///components/Notification.ui',
                InternalChildren: ['notif_btn', 'popover', 'list-box'],
                Properties: {
                    ...boolean('empty', true),
                    ...string('notif-count', ''),
                },
            },
            this
        );
    }

    declare _notif_btn: Gtk.MenuButton;
    declare _popover: Gtk.Popover;
    declare _list_box: Gtk.ListBox;

    declare empty: boolean;
    declare notif_count: string;

    private notifd = Notifd.get_default();
    private listStore = Gio.ListStore.new(IntegerObject.$gtype);
    private preventDraw = false;

    constructor(context: AppContext) {
        super();

        this._list_box.bind_model(this.listStore, id => {
            return new Gtk.ListBoxRow({
                css_classes: ['notification-row'],
                child: new NotificationBox(
                    this.notifd.get_notification((id as IntegerObject).value)!,
                    true
                ),
            });
        });

        this.listStore.connect('notify::n-items', () => {
            const count = this.listStore.nItems;
            this.notif_count = count > 99 ? '99+' : count.toString();
            this.empty = count === 0;
            if (this.empty) {
                this._notif_btn.remove_css_class('has-notifications');
            } else {
                this._notif_btn.add_css_class('has-notifications');
            }
        });

        const sortedNotifIds = [...this.notifd.get_notifications()]
            .sort((a, b) => b.time - a.time)
            .map(n => new IntegerObject(n.id));

        this.listStore.splice(0, 0, sortedNotifIds);

        this.notifd.connect('notified', (_, id) => {
            const notification = this.notifd.get_notification(id)!;
            context.pushNotification(notification);
            this.listStore.insert(0, new IntegerObject(notification.id));
        });

        this.notifd.connect('resolved', (_, id) => {
            if (this.preventDraw) {
                return;
            }

            for (let i = 0; i < this.listStore.nItems; i++) {
                const item = this.listStore.get_item(i) as IntegerObject;
                if (item.value === id) {
                    this.listStore.remove(i);
                    break;
                }
            }
        });
    }

    on_dismiss_all() {
        this.listStore.remove_all();

        this.preventDraw = true;
        for (const n of this.notifd.get_notifications()) {
            n.dismiss();
        }
        this.preventDraw = false;
    }
}
