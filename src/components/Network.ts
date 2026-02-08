import AstalNetwork from 'gi://AstalNetwork';
import GObject from 'gi://GObject?version=2.0';
import Gtk from 'gi://Gtk?version=4.0';
import { string, SYNC } from '../utils';

export default class NetworkComponent extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                GTypeName: 'Network',
                Template: 'resource:///components/Network.ui',
                Properties: {
                    ...string('network-icon'),
                },
            },
            this
        );
    }

    declare network_icon: string;

    constructor() {
        super();

        const nw = AstalNetwork.get_default();

        let networkBinding: GObject.Binding;

        nw.bind_property_full(
            'primary',
            this,
            'network-icon',
            SYNC,
            (_, primary: AstalNetwork.Primary) => {
                networkBinding?.unbind();

                switch (primary) {
                    case AstalNetwork.Primary.WIRED:
                        networkBinding = nw.wired.bind_property(
                            'icon-name',
                            this,
                            'network-icon',
                            SYNC
                        );
                        return [false, ''];
                    case AstalNetwork.Primary.WIFI:
                        networkBinding = nw.wifi.bind_property(
                            'icon-name',
                            this,
                            'network-icon',
                            SYNC
                        );
                        return [false, ''];
                    default:
                        return [true, 'network-idle-symbolic'];
                }
            },
            null
        );
    }
}
