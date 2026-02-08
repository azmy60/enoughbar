import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import Notifd from 'gi://AstalNotifd';

export default class NotificationComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Notification',
                Template: 'resource:///components/Notification.ui',
                InternalChildren: [
                    'button',
                    'popover',
                    'list_box',
                    'clear_button',
                ],
            },
            this
        );
    }

    declare _button: Gtk.MenuButton;
    declare _popover: Gtk.Popover;
    declare _list_box: Gtk.Box;
    declare _clear_button: Gtk.Button;

    private notifd = Notifd.get_default();
    private popupContainer: Gtk.Box | null = null;
    private popupWindow: Gtk.Window | null = null;

    constructor() {
        super();

        this.refresh();

        this.notifd.connect('notified', () => {
            this.refresh();
            this.popupNotification();
        });

        this.notifd.connect('resolved', () => {
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

        // Update icon
        this._button.icon_name =
            notifications.length > 0
                ? 'notifications-unread-symbolic'
                : 'notifications-symbolic';

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

    private popupNotification(): void {
        const notifications = this.notifd.get_notifications();
        if (notifications.length === 0) return;

        const latest = notifications[notifications.length - 1];

        this.ensurePopupContainer();

        const popup = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 8,
            css_classes: ['popup-notification'],
            margin_top: 8,
            margin_bottom: 8,
            margin_start: 12,
            margin_end: 12,
        });

        const icon = new Gtk.Image({
            icon_name: latest.app_icon ?? 'dialog-information-symbolic',
            pixel_size: 28,
        });

        const text = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 4,
            hexpand: true,
        });

        text.append(
            new Gtk.Label({
                label: latest.summary ?? '',
                xalign: 0,
                css_classes: ['heading'],
            })
        );

        if (latest.body) {
            text.append(
                new Gtk.Label({
                    label: latest.body,
                    xalign: 0,
                    wrap: true,
                })
            );
        }

        popup.append(icon);
        popup.append(text);

        this.popupContainer!.prepend(popup);

        // Auto remove after 3s
        setTimeout(() => {
            if (popup.get_parent()) {
                this.popupContainer!.remove(popup);
            }

            if (this.popupContainer!.get_first_child() === null) {
                this.popupWindow?.close();
                this.popupWindow = null;
                this.popupContainer = null;
            }
        }, 3000);
    }

    private ensurePopupContainer(): void {
        if (this.popupWindow) return;

        this.popupWindow = new Gtk.Window({
            decorated: false,
            resizable: false,
        });

        this.popupWindow.set_hide_on_close(true);

        this.popupContainer = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 8,
            margin_top: 12,
            margin_end: 12,
        });

        this.popupWindow.set_child(this.popupContainer);

        // Move to top-right
        this.popupWindow.connect('map', () => {
            const display = this.popupWindow!.get_display();
            const monitor = display.get_primary_monitor();
            if (!monitor) return;

            const geo = monitor.get_geometry();
            const width = 340;

            this.popupWindow!.set_default_size(width, -1);
            this.popupWindow!.move(geo.x + geo.width - width - 16, geo.y + 16);
        });

        this.popupWindow.present();
    }
    private formatTime(timestamp: number): string {
        const date = new Date(timestamp * 1000); // if unix seconds
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}
