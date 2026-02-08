import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import Notifd from 'gi://AstalNotifd';
import NotificationPopupComponent from './NotificationPopup';

export default class NotificationComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Notification',
                Template: 'resource:///components/Notification.ui',
                InternalChildren: [
                    'notif_btn',
                    'notif_label',
                    'popover',
                    'list_box',
                    'clear_button',
                ],
            },
            this
        );
    }

    declare _notif_btn: Gtk.MenuButton;
    declare _notif_label: Gtk.Label;
    declare _popover: Gtk.Popover;
    declare _list_box: Gtk.Box;
    declare _clear_button: Gtk.Button;

    private notifd = Notifd.get_default();

    constructor() {
        super();

        this.refresh();

        this.notifd.connect('notified', (_, id) => {
            const notification = this.notifd.get_notification(id)!;
            // TODO implement this
            // this.addItem(notification)
            this.refresh();
            NotificationPopupComponent.showNotification(notification);
        });

        this.notifd.connect('resolved', (_, id) => {
            // TODO implement this
            // this.removeItem(notification)
            this.refresh();
        });

        this._clear_button.connect('clicked', () => {
            for (const n of this.notifd.get_notifications()) {
                n.dismiss();
            }
        });
    }

    private refresh(): void {
        const notifications = this.notifd.get_notifications();

        if (notifications.length === 0) {
            this._notif_btn.remove_css_class('has-notifications');
            this._notif_label.visible = false;
        } else {
            this._notif_btn.add_css_class('has-notifications');
            this._notif_label.visible = true;
            this._notif_label.label =
                notifications.length > 99
                    ? '99+'
                    : notifications.length.toString();
        }

        // Clear list
        let child;
        while ((child = this._list_box.get_first_child())) {
            this._list_box.remove(child);
        }

        if (notifications.length === 0) {
            this._list_box.append(
                new Gtk.Label({
                    label: 'No notifications',
                    xalign: 0.5,
                })
            );
            return;
        }

        for (const n of notifications.slice().reverse()) {
            this._list_box.append(this.createRow(n));
        }
    }

    private createRow(n: any): Gtk.Widget {
        const row = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 8,
            css_classes: ['notification-row'],
        });

        // ---- ICON ----
        const icon = new Gtk.Image({
            icon_name: n.app_icon ?? 'dialog-information-symbolic',
            pixel_size: 32,
        });

        row.append(icon);

        // ---- TEXT AREA ----
        const textBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 3,
            hexpand: true,
        });

        const header = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });

        const title = new Gtk.Label({
            label: n.summary ?? '',
            xalign: 0,
            hexpand: true,
            css_classes: ['heading'],
        });

        const time = new Gtk.Label({
            label: this.formatTime(n.time ?? Date.now() / 1000),
            xalign: 1,
            css_classes: ['dim-label'],
        });

        header.append(title);
        header.append(time);
        textBox.append(header);

        if (n.body) {
            textBox.append(
                new Gtk.Label({
                    label: n.body,
                    xalign: 0,
                    wrap: true,
                })
            );
        }

        row.append(textBox);

        // ---- DISMISS BUTTON ----
        const dismiss = new Gtk.Button({
            icon_name: 'window-close-symbolic',
            valign: Gtk.Align.START,
            css_classes: ['flat'],
        });

        dismiss.connect('clicked', () => {
            n.dismiss(); // notifd API
        });

        row.append(dismiss);

        return row;
    }

    private formatTime(timestamp: number): string {
        const date = new Date(timestamp * 1000); // if unix seconds
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}
