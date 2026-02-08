import Astal from 'gi://Astal?version=4.0';
import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import WorkspaceComponent from './Workspace';
import TrayComponent from './Tray';
import NetworkComponent from './Network';
import MediaPlayerComponent from './MediaPlayer';
import ClockComponent from './Clock';
import VolumeComponent from './Volume';
import SystemComponent from './System';
import NotificationComponent from './Notification';
// import BatteryComponent from './Battery';

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

export default class Bar extends Astal.Window {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Bar',
                Template: 'resource:///components/Bar.ui',
                InternalChildren: ['start-box', 'center-box', 'end-box'],
            },
            this
        );
    }

    declare _start_box: Gtk.Box;
    declare _center_box: Gtk.Box;
    declare _end_box: Gtk.Box;

    constructor() {
        super({
            visible: true,
            exclusivity: Astal.Exclusivity.EXCLUSIVE,
            anchor: TOP | LEFT | RIGHT,
            cssClasses: ['Bar'],
        });

        this.namespace = "enoughbar";

        this._start_box.append(new SystemComponent());
        this._start_box.append(new WorkspaceComponent());
        this._center_box.append(new MediaPlayerComponent());
        this._end_box.append(new VolumeComponent());
        this._end_box.append(new NetworkComponent());
        // this._end_box.append(new BatteryComponent());
        this._end_box.append(new TrayComponent());
        this._end_box.append(new ClockComponent());
        this._end_box.append(new NotificationComponent());
    }

}
