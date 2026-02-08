pkgdatadir = get_option('prefix') / get_option('datadir') / meson.project_name()
bindir = get_option('prefix') / get_option('bindir')
blp = find_program('blueprint-compiler', required: true)
esbuild = find_program('esbuild', required: true)
gjs = find_program('gjs', required: true)
layer_shell = dependency('gtk4-layer-shell-0')

blueprint_sources = files(
  'components/Bar.blp',
  'components/Battery.blp',
  'components/Clock.blp',
  'components/MediaPlayer.blp',
  'components/Network.blp',
  'components/Notification.blp',
  'components/System.blp',
  'components/Volume.blp',
)

# transplie blueprints
ui = custom_target(
  'blueprint',
  input: blueprint_sources,
  output: '.',
  command: [
    blp,
    'batch-compile',
    '@OUTPUT@',
    '@CURRENT_SOURCE_DIR@',
    '@INPUT@',
  ],
)

# bundle ts files
js = custom_target(
  'typescript',
  input: files('App.ts'),
  command: [
    esbuild,
    '--bundle', '@INPUT@',
    '--format=esm',
    '--outfile=@OUTPUT@',
    '--sourcemap=inline',
    '--external:gi://*',
    '--external:gettext',
    '--external:system',
  ],
  output: 'index.js',
)

# bundle css files
css = custom_target(
  'css',
  input: files('style.css'),
  command: [
    esbuild,
    '--bundle', '@INPUT@',
    '--outfile=@OUTPUT@',
  ],
  output: 'style.css',
)

# compiling source files into a binary
import('gnome').compile_resources(
  'data',
  files('gresource.xml'),
  dependencies: [ui, js],
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

# gresource can't be run with gjs, we still need an entry script
configure_file(
  input: files('main.in.js'),
  output: 'main.js',
  configuration: {
    'GJS': gjs.full_path(),
    'PKGDATADIR': pkgdatadir,
  },
  install: true,
  install_dir: pkgdatadir,
)

# and we need to wrap the entry script to preload gtk4-layer-shell
configure_file(
  input: 'main.in.sh',
  output: meson.project_name(),
  configuration: {
    'LAYER_SHELL_PREFIX': layer_shell.get_variable('prefix'),
    'INDEX': pkgdatadir / 'main.js',
  },
  install: true,
  install_dir: bindir,
)
