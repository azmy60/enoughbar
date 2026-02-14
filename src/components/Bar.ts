import Astal from 'gi://Astal?version=4.0';
import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import Workspace from './Workspace';
import Tray from './Tray';
import Network from './Network';
import MediaPlayer from './MediaPlayer';
import Clock from './Clock';
import Volume from './Volume';
import System from './System';
import Notification from './Notification';
import { AppContext } from '../types';
import Bluetooth from './Bluetooth';
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

    constructor(context: AppContext) {
        super({
            visible: true,
            exclusivity: Astal.Exclusivity.EXCLUSIVE,
            anchor: TOP | LEFT | RIGHT,
            cssClasses: ['Bar'],
        });

        this.namespace = "enoughbar";

        this._start_box.append(new System());
        this._start_box.append(new Workspace());
        this._center_box.append(new MediaPlayer());
        this._end_box.append(new Bluetooth());
        this._end_box.append(new Volume());
        this._end_box.append(new Network());
        // this._end_box.append(new BatteryComponent());
        this._end_box.append(new Tray());
        this._end_box.append(new Clock());
        this._end_box.append(new Notification(context));
    }
}
