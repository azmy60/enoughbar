import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import Astal from 'gi://Astal?version=4.0';
import Bar from './components/Bar';
import NotificationPopupComponent from './components/NotificationPopup';

const defaultOptions = {
    cssPath: 'build/src/style.css',
};

type AppOptions = typeof defaultOptions;

export default class App extends Astal.Application {
    static {
        GObject.registerClass(this);
    }

    static instance: App;

    readonly options: AppOptions;

    private bar!: Bar;
    private notificationPopup!: NotificationPopupComponent;
    private monitor!: Gio.FileMonitor;

    constructor(options: Partial<AppOptions> = {}) {
        super({
            applicationId: 'enoughbar',
            flags: Gio.ApplicationFlags.HANDLES_COMMAND_LINE,
        });

        this.options = {
            ...defaultOptions,
            ...options,
        };
    }

    private initCss() {
        const provider = new Gtk.CssProvider();
        const file = Gio.File.new_for_path(this.options.cssPath);
        this.monitor = file.monitor(Gio.FileMonitorFlags.WATCH_MOVES, null);

        if (file.query_exists(null)) {
            provider.load_from_path(this.options.cssPath);
        } else {
            console.log(`${this.options.cssPath} does not exist`);
        }

        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default()!,
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_USER
        );

        this.monitor.connect(
            'changed',
            (_fileMonitor, file, otherFile, eventType) => {
                switch (eventType) {
                    case Gio.FileMonitorEvent.CHANGED:
                        provider.load_from_path(this.options.cssPath);
                        break;

                    case Gio.FileMonitorEvent.DELETED:
                        provider.load_from_string('');
                        break;

                    case Gio.FileMonitorEvent.CREATED:
                        provider.load_from_path(this.options.cssPath);
                        break;
                }
            }
        );
    }

    vfunc_command_line(command_line: Gio.ApplicationCommandLine): number {
        const argv = command_line.get_arguments();

        if (command_line.isRemote) {
            // we could toggle the visibility of the bar
            if (argv.length >= 1 && argv[0] == 'toggle') {
                this.bar.visible = !this.bar.visible;
            }

            // exit remote process
            command_line.done();
        } else {
            // main instance, initialize stuff here
            this.initCss();
            this.bar = new Bar();
            this.notificationPopup = new NotificationPopupComponent();
            this.add_window(this.bar);
            this.add_window(this.notificationPopup);
        }

        return 0;
    }

    // entry point of our app
    static async main(argv: string[]): Promise<number> {
        App.instance = new App();
        GLib.set_prgname('enoughbar');
        return App.instance.runAsync(argv);
    }
}
