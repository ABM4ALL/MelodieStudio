import json
import os
from typing import ClassVar, Dict, Any, List, NewType, Optional, Tuple, Type, Union

FileName = NewType("FileName", str)


class JSONManager:
    cache: Dict[FileName, Dict] = {}

    @staticmethod
    def lookup_from_cache(file_name: FileName):
        return JSONManager.cache.get(file_name)

    @staticmethod
    def set_cache_item(file_name: FileName, value: Any):
        JSONManager.cache[file_name] = value

    @staticmethod
    def invalidate_cache_item(file_name: FileName):
        if file_name in JSONManager.cache:
            del JSONManager.cache[file_name]

    @staticmethod
    def from_file(
        file_name: str, allowed_types: Type[dict]
    ) -> Tuple[Optional[Union[List[Any], Dict[str, Any]]], Union[str, None]]:
        cache_lookup_result = JSONManager.lookup_from_cache(FileName(file_name))
        if cache_lookup_result is not None:
            return (cache_lookup_result, None)
        if not os.path.exists(file_name):
            return None, f"File '{file_name}' does not exist!"
        try:
            with open(file_name, encoding="utf8") as f:
                content: Union[List[Any], Dict[str, Any]] = json.load(f)
            if isinstance(content, allowed_types):
                JSONManager.set_cache_item(FileName(file_name), content)
                return content, None
            else:
                return None, f"Content is not of allowed types!"

        except json.JSONDecodeError:
            return None, f"Decode error occured for file '{file_name}'"

    @staticmethod
    def to_file(
        obj: Union[Dict[str, Any], List[Any]], file_name: str
    ) -> Union[str, None]:
        JSONManager.invalidate_cache_item(FileName(file_name))
        try:
            with open(file_name, "w", encoding="utf8") as f:
                json.dump(obj, f, indent=4)
            return None
        except OSError as e:
            return f"{e}"


class ChartsConfigManager:
    def __init__(self) -> None:
        pass


if __name__ == "__main__":
    JSONManager()
