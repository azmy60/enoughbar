import Gtk from 'gi://Gtk?version=4.0';
import AstalMpris from 'gi://AstalMpris';
import GObject from 'gi://GObject?version=2.0';
import { string } from '../utils';

export default class MediaPlayerComponent extends Gtk.Overlay {
    static {
        GObject.registerClass(
            {
                GTypeName: 'MediaPlayer',
                Template: 'resource:///components/MediaPlayer.ui',
                Properties: {
                    ...string('label'),
                    ...string('art'),
                },
            },
            this
        );
    }

    declare label: string;
    declare art: string;

    private mpris = AstalMpris.Mpris.get_default();
    private activePlayer: AstalMpris.Player | null = null;
    private metadataListener = -1;

    constructor() {
        super();

        this.updateMetadata = this.updateMetadata.bind(this);
        this.updatePlayer = this.updatePlayer.bind(this);

        this.mpris.connect('player-added', this.updatePlayer);
        this.mpris.connect('player-closed', this.updatePlayer);

        this.updatePlayer();
    }

    private updatePlayer() {
        if (this.mpris.players.length === 0) {
            this.metadataListener = -1;
            this.activePlayer = null;
            this.visible = false;
            return;
        }

        if (this.activePlayer && this.metadataListener !== -1) {
            this.activePlayer.disconnect(this.metadataListener);
        }

        this.activePlayer = this.mpris.players[this.mpris.players.length - 1];

        this.updateMetadata(this.activePlayer);

        this.metadataListener = this.activePlayer.connect(
            'notify::metadata',
            this.updateMetadata
        );

        this.visible = true;
    }

    private updateMetadata(player: AstalMpris.Player) {
        this.label = player.title;
        this.art = player.coverArt;
    }
}
