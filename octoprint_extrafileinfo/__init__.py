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
            config=[],
            filterEnabled=False,
            filter=""
        )

    def get_template_configs(self):
        return [
            dict(type="settings", template="extrafileinfo_settings.jinja2", custom_bindings=True)
        ]

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
