# `wp-env`

`wp-env` lets you easily set up a local WordPress environment for building and testing plugins and themes. It's simple to install and requires no configuration.

## Quick (tl;dr) instructions

Ensure that Docker is running, then:

```sh
$ cd /path/to/a/wordpress/plugin
$ npx wp-env start
```

The local environment will be available at http://localhost:8888.

## Instructions

### Installation

`wp-env` requires Docker to be installed. There are instructions available for installing Docker on [Windows 10 Pro](https://docs.docker.com/docker-for-windows/install/), [all other versions of Windows](https://docs.docker.com/toolbox/toolbox_install_windows/), [macOS](https://docs.docker.com/docker-for-mac/install/), and [Linux](https://docs.docker.com/v17.12/install/linux/docker-ce/ubuntu/#install-using-the-convenience-script).

After confirming that Docker is installed, you can install `wp-env` globally like so:

```sh
$ npm -g i @wordpress/env
```

You're now ready to use `wp-env`!

### Starting the environment

First, ensure that Docker is running. You can do this by clicking on the Docker icon in the system tray or menu bar.

Then, change to a directory that contains a WordPress plugin or theme:

```sh
$ cd ~/gutenberg
```

Then, start the local environment:

```sh
$ wp-env start
```

Finally, navigate to http://localhost:8888 in your web browser to see WordPress running with the local WordPress plugin or theme running and activated.

### Stopping the environment

To stop the local environment:

```sh
$ wp-env stop
```

## Troubleshooting common problems

Many common problems can be fixed by running through the following troubleshooting steps in order:

### 1. Check that `wp-env` is running

First, check that `wp-env` is running. One way to do this is to have Docker print a table with the currently running containers:

```sh
$ docker ps
```

In this table, by default, you should see three entries: `wordpress` with port 8888, `tests-wordpress` with port 8889 and `mariadb` with port 3306.

### 2. Check the port number

By default `wp-env` uses port 8888, meaning that the local environment will be available at http://localhost:8888.

You can configure the port that `wp-env` uses so that it doesn't clash with another server by specifying the `WP_ENV_PORT` environment variable when starting `wp-env`:

```sh
$ WP_ENV_PORT=3333 wp-env start
```

Running `docker ps` and inspecting the `PORTS` column allows you to determine which port `wp-env` is currently using.

You may also specify the port numbers in your `.wp-env.json` file, but the environment variables take precedent.

### 3. Restart `wp-env`

Restarting `wp-env` will restart the underlying Docker containers which can fix many issues.

To restart `wp-env`:

```sh
$ wp-env stop
$ wp-env start
```

### 4. Restart Docker

Restarting Docker will restart the underlying Docker containers and volumes which can fix many issues.

To restart Docker:

1. Click on the Docker icon in the system tray or menu bar.
2. Select _Restart_.

Once restarted, start `wp-env` again:

```sh
$ wp-env start
```

### 5. Reset the database

Resetting the database which the local environment uses can fix many issues, especially when they are related to the WordPress installation.

To reset the database:

**⚠️ WARNING: This will permanently delete any posts, pages, media, etc. in the local WordPress installation.**

```sh
$ wp-env clean all
$ wp-env start
```

### 6. Nuke everything and start again 🔥

When all else fails, you can try forcibly removing all of the underlying Docker containers and volumes, the underlying WordPress directory, and starting again from scratch.

To nuke everything:

**⚠️ WARNING: This will permanently delete any posts, pages, media, etc. in the local WordPress installation.**

```sh
$ docker rm -f $(docker ps -aq)
$ docker volume rm -f $(docker volume ls -q)
$ rm -rf "../$(basename $(pwd))-wordpress"
$ wp-env start
```

## Command reference

### `wp-env start [ref]`

```sh
wp-env start

Starts WordPress for development on port 8888 (​http://localhost:8888​)
(override with WP_ENV_PORT) and tests on port 8889 (​http://localhost:8889​)
(override with WP_ENV_TESTS_PORT). The current working directory must be a
WordPress installation, a plugin, a theme, or contain a .wp-env.json file.


Positionals:
  ref  A `https://github.com/WordPress/WordPress` git repo branch or commit for
       choosing a specific version.                 [string] [default: "master"]
```

### `wp-env stop`

```sh
wp-env stop

Stops running WordPress for development and tests and frees the ports.
```

### `wp-env clean [environment]`

```sh
wp-env clean [environment]

Cleans the WordPress databases.

Positionals:
  environment  Which environments' databases to clean.
            [string] [choices: "all", "development", "tests"] [default: "tests"]
```

## .wp-env.json

You can customize the WordPress installation, plugins and themes that the development environment will use by specifying a `.wp-env.json` file in the directory that you run `wp-env` from.

`.wp-env.json` supports five fields:

| Field | Type | Default | Description |
| -- | -- | -- | -- |
| `"core"` | `string|null` | `null` | The WordPress installation to use. If `null` is specified, `wp-env` will use the latest production release of WordPress. |
| `"plugins"` | `string[]` | `[]` | A list of plugins to install and activate in the environment. |
| `"themes"` | `string[]` | `[]` | A list of themes to install in the environment. The first theme in the list will be activated. |
| `"port"` | `string` | `"8888"` | The primary port number to use for the insallation. You'll access the instance through the port: 'http://localhost:8888'. |
| `"testsPort"` | `string` | `"8889"` | The port number to use for the tests instance. |

_Note: the port number environment variables (`WP_ENV_PORT` and `WP_ENV_TESTS_PORT`) take precedent over the .wp-env.json values._

Several types of strings can be passed into the `core`, `plugins`, and `themes` fields:

| Type | Format | Example(s) |
| -- | -- | -- |
| Relative path | `.<path>|~<path>` | `"./a/directory"`, `"../a/directory"`, `"~/a/directory"` |
| Absolute path | `/<path>|<letter>:\<path>` | `"/a/directory"`, `"C:\\a\\directory"` |
| GitHub repository | `<owner>/<repo>[#<ref>]` | `"WordPress/WordPress"`, `"WordPress/gutenberg#master"` |

Remote sources will be downloaded into a temporary directory located in `~/.wp-env`.

### Examples

#### Latest production WordPress + current directory as a plugin

This is useful for plugin development.

```json
{
  "core": null,
  "plugins": [
    "."
  ]
}
```

#### Latest development WordPress + current directory as a plugin

This is useful for plugin development when upstream Core changes need to be tested.

```json
{
  "core": "WordPress/WordPress#master",
  "plugins": [
    "."
  ]
}
```

#### Local `wordpress-develop` + current directory as a plugin

This is useful for working on plugins and WordPress Core at the same time.

```json
{
  "core": "../wordpress-develop/build",
  "plugins": [
    "."
  ]
}
```

#### A complete testing environment

This is useful for integration testing: that is, testing how old versions of WordPress and different combinations of plugins and themes impact each other.

```json
{
  "core": "WordPress/WordPress#5.2.0",
  "plugins": [
    "WordPress/wp-lazy-loading",
    "WordPress/classic-editor",
  ],
  "themes": [
    "WordPress/theme-experiments"
  ]
}
```

#### Custom Port Numbers

You can tell `wp-env` to use a custom port number so that your instance does not conflict with other `wp-env` instances.

```json
{
  "plugins": [
    ".",
  ],
  "port": 4013,
  "testsPort": 4012
}
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
