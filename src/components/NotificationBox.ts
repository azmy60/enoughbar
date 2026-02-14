import Gtk from 'gi://Gtk?version=4.0';
import Notifd from 'gi://AstalNotifd';
import GObject from 'gi://GObject?version=2.0';
import Gio from 'gi://Gio';
import { boolean, string } from '../utils';

export default class NotificationBox extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'NotificationBox',
                Template: 'resource:///components/NotificationBox.ui',
                InternalChildren: ['icon', 'body'],
                Properties: {
                    ...string('title'),
                    ...string('time'),
                    ...boolean('show-dismiss'),
                },
            },
            this
        );
    }

    declare _icon: Gtk.Image;
    declare _body: Gtk.Label;

    declare title: string;
    declare time: string;
    declare show_dismiss: boolean;

    constructor(private notification: Notifd.Notification, showDismiss = false) {
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

        this.title = notification.summary ?? '';

        this.time = this.getTime();

        this.show_dismiss = showDismiss;

        if (notification.body) {
            this._body.label = notification.body;
            this._body.visible = true;
        }
    }

    on_dismiss() {
        this.notification.dismiss();
    }

    private getTime(): string {
        const timestamp = this.notification.time ?? Date.now() / 1000;
        const date = new Date(timestamp * 1000); // if unix seconds
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}
