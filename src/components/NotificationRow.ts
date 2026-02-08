import Gtk from 'gi://Gtk?version=4.0';
import Notifd from 'gi://AstalNotifd';
import GObject from 'gi://GObject?version=2.0';
import Gio from 'gi://Gio';

export default class NotificationRow extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'NotificationRow',
                Template: 'resource:///components/NotificationRow.ui',
                InternalChildren: ['icon', 'title', 'body'],
            },
            this
        );
    }

    declare _icon: Gtk.Image;
    declare _title: Gtk.Label;
    declare _body: Gtk.Label;

    constructor(notification: Notifd.Notification) {
        super();

        const imagePath = notification.get_image();

        if (imagePath) {
            this._icon.set_from_file(imagePath);
        } else if (notification.app_icon) {
            this._icon.icon_name = notification.app_icon;
        } else if (notification.hints.desktop_entry) {
            const appInfo = Gio.app_info_get_all().find(
                info =>
                    info.get_id() ===
                    notification.hints.desktop_entry + '.desktop'
            );

            const icon = appInfo?.get_icon();

            if (icon) {
                this._icon.gicon = icon;
            } else {
                this._icon.icon_name = 'dialog-information-symbolic';
            }
        } else {
            this._icon.icon_name = 'dialog-information-symbolic';
        }

        this._title.label = notification.summary ?? '';

        if (notification.body) {
            this._body.label = notification.body;
            this._body.visible = true;
        }
    }
}
