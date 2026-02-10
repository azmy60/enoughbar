import Astal from 'gi://Astal?version=4.0';
import Gtk from 'gi://Gtk?version=4.0';
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

    private container: Gtk.Box;

    constructor(private onFinish: () => void) {
        super({
            anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
            exclusivity: Astal.Exclusivity.NORMAL,
            visible: true,
            cssClasses: ['notification-popup'],
        });

        this.namespace = 'enoughbar-notifications';

        this.container = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['notification-popup-container'],
        });

        this.set_child(this.container);
    }

    push(notification: Notifd.Notification) {
        const row = new NotificationRow(notification);

        this.container!.prepend(row);

        this.present();
        this.show();

        setTimeout(() => {
            if (row.get_parent()) {
                this.container.remove(row);
            }

            if (this.container.get_first_child() === null) {
                this.onFinish();
            }
        }, 3000);
    }
}
