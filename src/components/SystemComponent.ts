import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import Gio from 'gi://Gio';

export default class SystemComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'System',
                Template: 'resource:///components/System.ui',
                InternalChildren: ['popover'],
            },
            this
        );
    }

    declare _popover: Gtk.PopoverMenu;

    constructor() {
        super();

        const menu = new Gio.Menu();
        menu.append('Reboot', 'win.reboot');
        menu.append('Suspend', 'win.suspend');
        menu.append('Shutdown', 'win.shutdown');
        this._popover.set_menu_model(menu);

        const reboot = new Gio.SimpleAction({ name: 'reboot' });
        reboot.connect('activate', () => this.on_reboot());

        const suspend = new Gio.SimpleAction({ name: 'suspend' });
        suspend.connect('activate', () => this.on_suspend());

        const shutdown = new Gio.SimpleAction({ name: 'shutdown' });
        shutdown.connect('activate', () => this.on_shutdown());

        const actionGroup = new Gio.SimpleActionGroup();
        actionGroup.add_action(reboot);
        actionGroup.add_action(suspend);
        actionGroup.add_action(shutdown);
        this.insert_action_group('win', actionGroup);
    }

    private showConfirmation(action: string, command: string): void {
        const root = this.get_root();

        if (!(root instanceof Gtk.Window)) {
            return;
        }

        const dialog = new Gtk.MessageDialog({
            text: `Confirm ${action}`,
            secondary_text: `Are you sure you want to ${action.toLowerCase()}?`,
            modal: true,
            buttons: Gtk.ButtonsType.YES_NO,
            transient_for: root,
        });

        dialog.connect('response', (_, response_id: Gtk.ResponseType) => {
            if (response_id === Gtk.ResponseType.YES) {
                const proc = Gio.Subprocess.new(
                    ['sh', '-c', command],
                    Gio.SubprocessFlags.STDOUT_SILENCE |
                    Gio.SubprocessFlags.STDERR_SILENCE
                );
                proc.wait(null);
            }
            dialog.destroy();
        });

        dialog.show();
    }

    on_reboot(): void {
        this.showConfirmation('Reboot', 'systemctl reboot');
    }

    on_suspend(): void {
        this.showConfirmation('Suspend', 'systemctl suspend');
    }

    on_shutdown(): void {
        this.showConfirmation('Shutdown', 'systemctl poweroff');
    }
}
