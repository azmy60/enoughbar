import Astal from 'gi://Astal?version=4.0';
import Gtk from 'gi://Gtk?version=4.0';
import LayerShell from 'gi://Gtk4LayerShell';
import NotificationRow from './NotificationRow';
import GObject from 'gi://GObject?version=2.0';
import Notifd from 'gi://AstalNotifd';

export default class NotificationPopupComponent extends Astal.Window {
    static {
        GObject.registerClass(
            {
                GTypeName: 'NotificationPopup',
            },
            this
        );
    }

    private container: Gtk.Box | null = null;
    private static ins: NotificationPopupComponent;

    constructor() {
        super({
            anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
            exclusivity: Astal.Exclusivity.EXCLUSIVE,
            visible: true,
            cssClasses: ['notification-popup'],
        });

        this.namespace = 'enoughbar-notifications';

        NotificationPopupComponent.ins = this;
    }

    showNotification(notification: Notifd.Notification) {
        this.ensureWindow();

        const row = new NotificationRow(notification);

        this.container!.prepend(row);

        setTimeout(() => {
            if (row.get_parent()) {
                this.container!.remove(row);
            }

            if (this.container!.get_first_child() === null) {
                this.close();
                this.container = null;
            }
        }, 3000);
    }

    static showNotification(notification: Notifd.Notification) {
        NotificationPopupComponent.ins.showNotification(notification);
    }

    private ensureWindow() {
        if (this.container) return;

        this.container = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['notification-popup-container'],
        });

        this.set_child(this.container);
        this.present();
        this.show();
    }
}
