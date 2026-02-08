import Gtk from 'gi://Gtk?version=4.0';
import AstalMpris from 'gi://AstalMpris';
import GObject from 'gi://GObject?version=2.0';
import { boolean, string } from '../utils';

export default class MediaPlayerComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'MediaPlayer',
                Template: 'resource:///components/MediaPlayer.ui',
                Properties: {
                    ...boolean('mpris-visible'),
                    ...string('mpris-label'),
                    ...string('mpris-art'),
                },
            },
            this
        );
    }

    declare mpris_visible: boolean;
    declare mpris_label: string;
    declare mpris_art: string;

    constructor() {
        super();

        const player = AstalMpris.Player.new('spotify');
        player.bind_property(
            'available',
            this,
            'mpris-visible',
            GObject.BindingFlags.SYNC_CREATE
        );
        player.bind_property(
            'cover-art',
            this,
            'mpris-art',
            GObject.BindingFlags.SYNC_CREATE
        );

        this.mpris_label = `${player.artist} - ${player.title}`;
        const playerId = player.connect('notify::metadata', () => {
            this.mpris_label = `${player.artist} - ${player.title}`;
        });

        this.connect('destroy', () => {
            player.disconnect(playerId);
        });
    }
}
