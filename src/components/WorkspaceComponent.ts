import Hyprland from 'gi://AstalHyprland';
import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';

export default class WorkspaceComponent extends Gtk.Box {
    static {
        GObject.registerClass({ GTypeName: 'Workspace' }, this);
    }

    private buttons = new Map<number, Gtk.Button>();

    constructor() {
        super({
            cssClasses: ['workspace-btn-group'],
        });

        const hypr = Hyprland.get_default();

        const id1 = hypr.connect('workspace-added', (_, workspace) =>
            this.addWorkspace(workspace)
        );

        const id2 = hypr.connect('workspace-removed', (_, workspaceId) =>
            this.removeWorkspace(workspaceId)
        );

        const id3 = hypr.connect('notify::focused-workspace', () => {
            this.focusWorkspace(hypr.get_focused_workspace().id);
        });

        const workspaces = [...hypr.get_workspaces()].sort(
            (a, b) => a.id - b.id
        );
        for (const workspace of workspaces) {
            this.addWorkspace(workspace);
        }

        const focusedWorkspace = hypr.get_focused_workspace();
        this.focusWorkspace(focusedWorkspace.id);

        this.connect('destroy', () => {
            hypr.disconnect(id1);
            hypr.disconnect(id2);
            hypr.disconnect(id3);
        });
    }

    private addWorkspace(workspace: Hyprland.Workspace): void {
        const button = new Gtk.Button({
            cssClasses: ['workspace-btn'],
            label: workspace.name,
        });
        button.connect('clicked', () => workspace.focus());
        this.append(button);
        this.buttons.set(workspace.id, button);
    }

    private removeWorkspace(workspaceId: number): void {
        const button = this.buttons.get(workspaceId);
        if (button) {
            this.remove(button);
            button.run_dispose();
            this.buttons.delete(workspaceId);
        }
    }

    private focusWorkspace(workspaceId: number): void {
        for (const [id, button] of this.buttons.entries()) {
            if (id === workspaceId) {
                button.add_css_class('active');
            } else {
                button.remove_css_class('active');
            }
        }
    }
}
