import Hyprland from 'gi://AstalHyprland';
import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';

type WorkspaceButton = {
    id: number;
    button: Gtk.Button;
};

export default class WorkspaceComponent extends Gtk.Box {
    static {
        GObject.registerClass({ GTypeName: 'Workspace' }, this);
    }

    private workspaces: WorkspaceButton[] = [];

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
        const workspaceButton: WorkspaceButton = {
            id: workspace.id,
            button,
        };
        let insertAfterIdx = -1;
        for (let i = 0; i < this.workspaces.length; i++) {
            if (this.workspaces[i].id < workspace.id) {
                insertAfterIdx = i;
            } else {
                break;
            }
        }
        if (insertAfterIdx !== -1) {
            this.insert_child_after(
                button,
                this.workspaces[insertAfterIdx].button
            );
            this.workspaces.splice(insertAfterIdx + 1, 0, workspaceButton);
        } else {
            this.append(button);
            this.workspaces.push(workspaceButton);
        }
    }

    private removeWorkspace(workspaceId: number): void {
        const workspace = this.workspaces.find(b => b.id === workspaceId);
        if (workspace) {
            this.remove(workspace.button);
            workspace.button.run_dispose();
            this.workspaces = this.workspaces.filter(
                workspace => workspace.id !== workspaceId
            );
        }
    }

    private focusWorkspace(workspaceId: number): void {
        for (const workspace of this.workspaces) {
            if (workspace.id === workspaceId) {
                workspace.button.add_css_class('active');
            } else {
                workspace.button.remove_css_class('active');
            }
        }
    }
}
