import GObject from 'gi://GObject?version=2.0';

export class IntegerObject extends GObject.Object {
    static {
        GObject.registerClass(
            {
                GTypeName: 'IntegerObject',
                Properties: {
                    value: GObject.ParamSpec.double(
                        'value',
                        'Value',
                        'Integer value',
                        GObject.ParamFlags.READWRITE,
                        -Number.MAX_VALUE,
                        Number.MAX_VALUE,
                        0
                    ),
                },
            },
            this
        );
    }
    declare value: number;
    constructor(value: number) {
        super();
        this.value = value;
    }
}
