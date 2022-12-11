# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin


class ExtraFileInfoPlugin(
        octoprint.plugin.AssetPlugin,
        octoprint.plugin.TemplatePlugin,
        octoprint.plugin.SettingsPlugin,
        octoprint.plugin.StartupPlugin):

    def get_assets(self):
        return {
            "js": ["js/extrafileinfo.js"],
        }

    def get_settings_defaults(self):
        return dict(
            config=[dict(key="", label="", unit="", showInFilesList=True, showInStatesContainer=True)],
            filterEnabled=False,
            filter=""
        )

    def get_template_configs(self):
        return [
            dict(type="settings", template="extrafileinfo_settings.jinja2", custom_bindings=False)
        ]

    def get_settings_version(self):
        return 3
        
    def on_settings_migrate(self, target, current):
        self._logger.info('Migrating settings: {}=>{}'.format(current, target))
        cfg = self._settings.get(["config"])
        if cfg is None or (isinstance(cfg, list) and len(cfg) == 0):
            return

        if current is None and target > 1:
            while {'key': '', 'label': '', 'unit': ''} in cfg:
                cfg.remove({'key': '', 'label': '', 'unit': ''})

        if (current is None or current <= 2) and target >= 3:
            for i in range(len(cfg)):
                if 'showInStatesContainer' not in cfg[i]:
                    cfg[i]['showInStatesContainer'] = True
                    cfg[i]['showInFilesList'] = True

        self._settings.set(["config"], cfg)
        return

    ##~~ Softwareupdate hook

    def get_update_information(self):
        return {
            "extrafileinfo": {
                "displayName": "ExtraFileInfo Plugin",
                "displayVersion": self._plugin_version,

                # version check: github repository
                "type": "github_release",
                "user": "larsjuhw",
                "repo": "OctoPrint-ExtraFileInfo",
                "current": self._plugin_version,
                "stable_branch": {
                    "name": "Stable",
                    "branch": "master",
                    "comittish": ["master"],
                }, "prerelease_branches": [
                    {
                        "name": "Release Candidate",
                        "branch": "rc",
                        "comittish": ["rc", "master"],
                    }
                ],
                # update method: pip
                "pip": "https://github.com/larsjuhw/OctoPrint-Extrafileinfo/archive/{target_version}.zip",
            }
        }


__plugin_name__ = "ExtraFileInfo"
__plugin_pythoncompat__ = ">=3,<4"


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = ExtraFileInfoPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
