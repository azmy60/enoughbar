import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';
import AstalWp from 'gi://AstalWp';
import { number, string, SYNC } from '../utils';

export default class VolumeComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Volume',
                Template: 'resource:///components/Volume.ui',
                Properties: {
                    ...string('icon'),
                    ...number('value', 0, 1),
                },
            },
            this
        );
    }

    constructor() {
        super();

        const speaker = AstalWp.get_default()!.defaultSpeaker;
        speaker.bind_property('volume-icon', this, 'icon', SYNC);
        speaker.bind_property('volume', this, 'value', SYNC);
    }

    change_volume(_scale: Gtk.Scale, _type: Gtk.ScrollType, value: number) {
        AstalWp.get_default()?.defaultSpeaker.set_volume(value);
    }
}
