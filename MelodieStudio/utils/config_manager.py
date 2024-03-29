# -*- coding:utf-8 -*-
# @Time: 2021/11/16 9:25
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: configure_manager.py
import logging
import os
from typing import Optional

from ..services.json_config import JSONManager

logger = logging.getLogger(__name__)

COMPULSORY_CONFIGS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "compulsory_configs"
)
CHART_POLICIES_FILE = os.path.join(
    COMPULSORY_CONFIGS_DIR, "chart_policies.json")

_workdir = ""


def set_workdir(new_wd: str):
    global _workdir
    _workdir = new_wd


def get_workdir() -> str:
    return _workdir


class ConfigureCategory:
    def __init__(self, file_path: str, readonly: bool = True):
        self.__dict__["_initalized"] = False
        self._file = file_path
        self._readonly = readonly
        self.setup()
        self.load()
        self._initalized = True

    def setup(self):
        """
        Setup function, must be inherited.
        :return:
        """
        pass

    def load(self):
        """
        Load configures from json file
        :return:
        """
        if not os.path.exists(self._file):
            d = self.to_dict()
            err = JSONManager.to_file(d, self._file)
            if err is not None:
                raise Exception(err)

        config, err = JSONManager.from_file(self._file, dict)
        if err is not None:
            raise Exception(err)
        
        need_to_write = False

        for k, v in self.__dict__.items():
            if k.startswith("_"):
                continue
            if k in config:
                self.__dict__[k] = config[k]
            else:
                logger.warning(
                    f"Configure file {self._file} does not define '{k}'"
                )
                need_to_write = True

        if need_to_write:
            self.save()

    def to_dict(self):
        """
        Convert to dict
        :return:
        """
        d = {}
        for k, v in self.__dict__.items():
            if not k.startswith("_"):
                d[k] = v
        return d

    def save(self):
        """
        Save configures to json file.
        :return:
        """
        if self._readonly:
            raise PermissionError("This config category is readonly")
        err = JSONManager.to_file(self.to_dict(), self._file)
        if err is not None:
            raise Exception(err)

    def __setattr__(self, key, value):
        if not self._initalized:
            super(ConfigureCategory, self).__setattr__(key, value)
        else:
            assert key in self.__dict__, AttributeError(
                f"Configure category has no property '{key}'"
            )
            self.__dict__[key] = value
            self.save()

    def __repr__(self):
        return f"<{self.__class__.__name__} {self.to_dict()}>"


class BasicConfig(ConfigureCategory):
    def setup(self):
        self.PORT = 8089
        self.WS_SOCKET = 8765
        self.CURRENT_VISUALIZER_HOST = "127.0.0.1:8765"
        self.ALL_VISUALIZER_HOSTS = ["127.0.0.1:8765"]
        # self.CHART_STYLE_CONFIG_FILE = ""
        # self.CHART_POLICIES_FILE = os.path.join(COMPULSORY_CONFIGS_DIR, "chart_policies.json")
        # self.LAYOUT_FILE = ""


class ConfigureManager:
    def __init__(self, conf_folder: str):
        if not os.path.exists(conf_folder):
            os.makedirs(conf_folder)
        elif os.path.isfile(conf_folder):
            raise FileExistsError(
                f"Config folder '{conf_folder}' is a file, not a folder"
            )
        self._conf_folder = conf_folder

        # The folder to store logs
        self._log_folder = os.path.join(self._conf_folder, "logs")

        if not os.path.exists(self._log_folder):
            os.makedirs(self._log_folder)

        self.basic_config: BasicConfig = BasicConfig(
            os.path.join(conf_folder, "basic_config.json"), False
        )

    def get_gateway_log_file(self)->str:
        return os.path.join(self._log_folder, "gateway.log")

    def get_studio_log_file(self)->str:
        return os.path.join(self._log_folder, "studio.log")

    def chart_style_config_file(self):
        return os.path.join(self._conf_folder, "chart_options.json")

    def layout_file(self):
        return os.path.join(self._conf_folder, "chart_layout.json")

    def basic_config_file(self):
        return os.path.join(self._conf_folder, "basic_config_file.json")

    def chart_policies_file(self):
        return os.path.join(COMPULSORY_CONFIGS_DIR, "chart_policies.json")


_config_manager: Optional[ConfigureManager] = None


def init_config_manager(conf_folder: str):
    """
    initialize the config manager
    :param conf_folder:
    :return:
    """
    global _config_manager
    _config_manager = ConfigureManager(conf_folder)


def get_config_manager() -> ConfigureManager:
    """
    Get the config manager instance.
    :return:
    """
    global _config_manager
    assert _config_manager is not None
    return _config_manager
