# enoughbar

<img width="1920" height="44" alt="image" src="https://github.com/user-attachments/assets/b6038b8d-17b4-4a2a-bdd1-0d2d4fb4f3f9" />

It's a minimal hyprland status bar that makes you feel "this is not enough" because it's not configurable or beautiful enough. If you feel enough, that's enough(bar).

## How to use

```sh
make dev
```

Add this to `hyprland.conf`:

```
layerrule = blur on, match:namespace ^(enoughbar*)
layerrule = blur_popups on, match:namespace ^(enoughbar*)
layerrule = ignore_alpha 0.04, match:namespace ^(enoughbar*)
```
